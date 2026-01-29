import React, { useState, useEffect } from 'react';
import {
  Card,
  Grid,
  Text,
  Group,
  Badge,
  ActionIcon,
  Menu,
  LoadingOverlay,
  Paper,
  Flex,
  Button,
  Divider,
  Title,
  createStyles,
  Modal,
  Select,
  Stack,
  Notification,
  TextInput,
  Textarea,
  Checkbox
} from '@mantine/core';
import {
  IconFolder,
  IconFile,
  IconDownload,
  IconTrash,
  IconShare,
  IconDotsVertical,
  IconEdit,
  IconArrowLeft,
  IconEye,
  IconInfoCircle,
  IconUser,
  IconFolderPlus
} from '@tabler/icons-react';
import { getFolderContents, deleteDocument, shareDocument, getAllUsers, getDocumentSharedWith, createFolder, fetchChildFolders, deleteFolder, updateFolderName } from '../../../services/api/main';
import DocumentUpload from './document-uploader';
import { useDisclosure } from '@mantine/hooks';

interface Document {
  id: number;
  folder_id: number;
  original_name: string;
  storage_name: string;
  path: string;
  size: number;
  mime_type: string;
  document_type: string;
  description: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  shares: any[];
}
interface Folder {
  id: number;
  parent_id: number | null;
  name: string;
  path: string;
  description: string;
  created_by: number;
  woreda_id: number;
  subcity_id: number;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
  woreda?: {
    id: number;
    subcity_id: number;
    name: string;
    description: string;
  };
  subcity?: {
    id: number;
    name: string;
    description: string;
  };
}
interface FolderContentsProps {
  folderId: number;
  userId: number;
  onBack: () => void;
  folderName: string;
}

const useStyles = createStyles((theme) => ({
  card: {
    transition: 'transform 150ms ease, box-shadow 150ms ease',
    '&:hover': {
      transform: 'scale(1.01)',
      boxShadow: theme.shadows.md,
    },
  },
}));

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const documentTypeColors: Record<string, string> = {
  plan: 'blue',
  report: 'green',
  checklist: 'yellow',
  feedback: 'orange',
  letter: 'red',
  supervision_report: 'violet',
  financial: 'grape',
  other: 'gray'
};

const FolderContents: React.FC<FolderContentsProps> = ({ folderId, userId, onBack, folderName }) => {
  const { classes } = useStyles();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadModalOpened, { open: openUploadModal, close: closeUploadModal }] = useDisclosure(false);
  const [shareModalOpened, { open: openShareModal, close: closeShareModal }] = useDisclosure(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const [folderToRename, setFolderToRename] = useState<Folder | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [newFolder, setNewFolder] = useState({
    name: '',
    description: '',
    is_shared: false,
  });
  const [folders, setFolders] = useState<Folder[]>([]);
  const [confirmDeleteModalOpened, { open: openConfirmDeleteModal, close: closeConfirmDeleteModal }] = useDisclosure(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

  const [shareData, setShareData] = useState({
    documentId: 0,
    sharedWithUserId: '',
    permissionLevel: 'view' as 'view' | 'edit' | 'manage'
  });
  const [shareHistory, setShareHistory] = useState<any[]>([]);
  const [shareHistoryModalOpened, { open: openShareHistoryModal, close: closeShareHistoryModal }] = useDisclosure(false);
  const handleCreateFolder = async () => {
    try {
      setLoading(true);

      const payload = {
        name: newFolder.name,
        description: newFolder.description,
        is_shared: newFolder.is_shared,
        parent_id: currentFolder?.id || folderId
      };

      const response = await createFolder(userId, payload);

      if (response.success) {
        setSuccess('Folder created successfully');
        fetchContents();
        fetchChildFoldersCreated();
        closeCreateModal();
        setNewFolder({
          name: '',
          description: '',
          is_shared: false,
        });
      } else {
        setError(response.message || 'Failed to create folder');
      }
    } catch (err) {
      setError('Network error occurred while creating folder');
    } finally {
      setLoading(false);
    }
  };
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const parsedUser = JSON.parse(user);
      setCurrentUser(parsedUser);

      if (parsedUser.subcityId || parsedUser.woredaId) {
        setNewFolder(prev => ({
          ...prev,
          subcity_id: parsedUser.subcityId?.toString() || '',
          woreda_id: parsedUser.woredaId?.toString() || '',
        }));
      }
    }

    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(response);
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    fetchContents();
    fetchChildFoldersCreated();

    fetchUsers();
  }, [folderId, userId]);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: number | null, name: string }[]>([{ id: null, name: 'Root' }]);
  const [renameModalOpened, { open: openRenameModal, close: closeRenameModal }] = useDisclosure(false);

  const [viewingContents, setViewingContents] = useState<{
    folderId: number;
    folderName: string;
  } | null>(null);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);

  if (viewingContents) {
    return (
      <FolderContents
        folderId={viewingContents.folderId}
        userId={currentUser?.id || 0}
        onBack={() => setViewingContents(null)}
        folderName={viewingContents.folderName}
      />
    );
  }
  const navigateToFolder = (folder: Folder) => {
    setViewingContents({
      folderId: folder.id,
      folderName: folder.name
    });
    setCurrentFolder(folder);
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }]);
  };
  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await getFolderContents(userId, folderId);

      if (response.success) {
        setDocuments(response.data.documents || []);
        if (response.data.folder) {
          setCurrentFolder(response.data.folder);
        }
      } else {
        setError(response.message || 'Failed to load folder contents');
      }
    } catch (err) {
      setError('Network error occurred while loading folder contents');
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteFolder = async () => {
    if (!folderToDelete || !currentUser) return;

    try {
      setLoading(true);
      const response = await deleteFolder(folderToDelete.id);

      if (response.success) {
        setSuccess('Folder deleted successfully');
        fetchContents();
        fetchChildFoldersCreated();
        closeConfirmDeleteModal();
      } else {
        setError(response.message || 'Failed to delete folder');
      }
    } catch (err) {
      setError('Error deleting folder');
    } finally {
      setLoading(false);
    }
  };

  const handleRenameFolder = async () => {
    if (!folderToRename || !newFolderName.trim() || !currentUser) return;

    try {
      setLoading(true);
      const response = await updateFolderName(folderToRename.id, { new_name: newFolderName });

      if (response.success) {
        setSuccess('Folder renamed successfully');
        fetchContents();
        fetchChildFoldersCreated();
        closeRenameModal();
        setFolderToRename(null);
        setNewFolderName('');
      } else {
        setError(response.message || 'Failed to rename folder');
      }
    } catch (err) {
      setError('Error renaming folder');
    } finally {
      setLoading(false);
    }
  };
  const fetchChildFoldersCreated = async () => {
    console.log("its here");
    try {
      setLoading(true);
      const response = await fetchChildFolders(userId, folderId);
      console.log("response", response);

      if (response.success) {
        setFolders(response.data || []);
      } else {
        setError(response.message || 'Failed to load child folders');
      }
    } catch (err) {
      console.log(err);
      setError('Failed to fetch child folders');
    } finally {
      setLoading(false);
    }
  };
  const fetchShareHistory = async (documentId: number) => {
    try {
      setLoading(true);
      const response = await getDocumentSharedWith(userId, documentId);

      if (response.success) {
        setShareHistory(response.data);
        openShareHistoryModal();
      } else {
        setError(response.message || 'Failed to fetch share history');
      }
    } catch (err) {
      setError('Error fetching share history');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };


  const handleRefresh = () => {
    setError(null);
    fetchContents();
    fetchChildFoldersCreated();

  };


  const handleDeleteDocument = async (documentId: number) => {
    try {
      setLoading(true);
      const response = await deleteDocument(userId, documentId);

      if (response.success) {
        setSuccess('Document deleted successfully');
        fetchContents();
      } else {
        setError(response.message || 'Failed to delete the document');
      }
    } catch (err) {
      setError('Error deleting the document');
    } finally {
      setLoading(false);
    }
  };


  const handleOpen = async (document: Document) => {
    try {

      const fullUrl = `${import.meta.env.VITE_FILE_API}${document.path}`;
      const fileExtension = document.original_name?.split('.').pop()?.toLowerCase();
      const mimeType = document.mime_type?.toLowerCase();

      if (
        fileExtension === 'doc' || fileExtension === 'docx' ||
        fileExtension === 'xls' || fileExtension === 'xlsx' ||
        fileExtension === 'ppt' || fileExtension === 'pptx' ||
        fileExtension === 'csv' ||
        mimeType?.includes('word') ||
        mimeType?.includes('excel') ||
        mimeType?.includes('powerpoint') ||
        mimeType?.includes('presentation')
      ) {
        const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullUrl)}`;
        window.open(officeViewerUrl, '_blank');
      }
      else if (fileExtension === 'pdf' || mimeType?.includes('pdf')) {
        window.open(fullUrl, '_blank');
      }
      else if (
        fileExtension === 'jpg' || fileExtension === 'jpeg' ||
        fileExtension === 'png' || fileExtension === 'gif' ||
        fileExtension === 'webp' || fileExtension === 'bmp' ||
        mimeType?.includes('image/')
      ) {
        window.open(fullUrl, '_blank');
      }
      else if (
        fileExtension === 'txt' || fileExtension === 'csv' ||
        fileExtension === 'log' || mimeType?.includes('text/')
      ) {
        window.open(fullUrl, '_blank');
      }
      else {
        window.open(fullUrl, '_blank');
      }
    } catch (err) {
      console.error('Open error:', err);
      setError('Failed to open file');
    }
  };

  const handleShareDocument = (document: Document) => {
    setSelectedDocument(document);
    setShareData({
      documentId: document.id,
      sharedWithUserId: '',
      permissionLevel: 'view'
    });
    openShareModal();
  };

  const handleShare = async () => {
    if (!shareData.sharedWithUserId) {
      setError('Please select a user to share with');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        document_id: shareData.documentId,
        shared_with_user_id: parseInt(shareData.sharedWithUserId),
        permission_level: shareData.permissionLevel
      };

      const response = await shareDocument(userId, payload);

      if (response.success) {
        setSuccess('Document shared successfully!');
        closeShareModal();
        fetchContents();
        fetchChildFoldersCreated();

      } else {
        setError(response.message || 'Failed to share document');
      }
    } catch (err) {
      setError('Network error occurred while sharing document');
    } finally {
      setLoading(false);
    }
  };

  const userOptions = users
    .filter(user => user.id !== userId)
    .map(user => ({
      value: user.id.toString(),
      label: `${user.name} (${user.email})`
    }));

  return (
    <div className="container mx-auto p-4">
      <Flex justify="space-between" align="center" className="mb-6">
        <Button
          variant="subtle"
          leftIcon={<IconArrowLeft size={18} />}
          onClick={onBack}
        >
          Back to folders
        </Button>

        <Title order={2} className="flex items-center gap-2">
          <IconFolder size={28} className="text-blue-600" />
          <span>{folderName}</span>
        </Title>

        <Group>
          <Button
            leftIcon={<IconFolderPlus size={18} />}
            onClick={openCreateModal}
            variant="outline"
            className="mr-2"
          >
            New Folder
          </Button>
          <Button
            leftIcon={<IconFile size={18} />}
            onClick={openUploadModal}
          >
            Upload Document
          </Button>
        </Group>
      </Flex>

      {error && (
        <Notification
          icon={<IconInfoCircle size="1.1rem" />}
          color="red"
          title="Error"
          onClose={() => setError(null)}
          className="mb-4"
        >
          {error}
        </Notification>
      )}

      {success && (
        <Notification
          icon={<IconInfoCircle size="1.1rem" />}
          color="green"
          title="Success"
          onClose={() => setSuccess(null)}
          className="mb-4"
        >
          {success}
        </Notification>
      )}

      <Paper withBorder shadow="sm" radius="md" className="relative">
        <LoadingOverlay visible={loading} overlayBlur={2} />

        <div className="p-4">
          {error ? (
            <div className="text-center py-8">
              <Text color="red" size="lg" className="mb-4">{error}</Text>
              <Button onClick={handleRefresh}>Retry</Button>
            </div>
          ) : documents.length === 0 && folders.length === 0 ? (
            <div className="text-center py-12">
              <IconFile size={48} className="mx-auto text-gray-400 mb-4" />
              <Text size="lg" color="dimmed">This folder is empty</Text>
              <Button
                variant="subtle"
                size="sm"
                leftIcon={<IconFile size={14} />}
                onClick={openUploadModal}
                className="mt-4"
              >
                Upload your first document
              </Button>
            </div>
          ) : (
            <Grid gutter="md">
              {folders.map((folder) => (
                <Grid.Col key={folder.id} span={12} sm={6} md={4} lg={3}>
                  <Card withBorder shadow="sm" radius="md" className={`h-full ${classes.card}`} onClick={() => navigateToFolder(folder)}>
                    <Card.Section className="bg-blue-50 p-4 flex justify-center">
                      <IconFolder size={48} className="text-blue-500" />
                    </Card.Section>

                    <div className="mt-4">
                      <Text weight={600} size="sm" lineClamp={1} className="mb-1">
                        {folder.name}
                      </Text>
                      <Text size="xs" color="dimmed" lineClamp={2} className="mb-2">
                        {folder.description || 'No description'}
                      </Text>
                    </div>

                    <div className="mt-auto pt-2">
                      <Group position="apart" spacing="xs">
                        <Badge
                          color={folder.is_shared ? 'green' : 'gray'}
                          variant="filled"
                          size="xs"
                        >
                          {folder.is_shared ? 'Shared' : 'Private'}
                        </Badge>
                        <Text size="xs" color="dimmed">
                          {new Date(folder.created_at).toLocaleDateString()}
                        </Text>
                      </Group>

                      <Group position="right" spacing="xs" mt="sm">
                        <Menu withinPortal position="bottom-end" shadow="sm">
                          <Menu.Target>
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <IconDotsVertical size={16} />
                            </ActionIcon>
                          </Menu.Target>

                          <Menu.Dropdown>
                            <Menu.Item
                              icon={<IconEdit size={14} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                setFolderToRename(folder);
                                setNewFolderName(folder.name);
                                openRenameModal();
                              }}
                            >
                              Rename
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                              icon={<IconTrash size={14} />}
                              color="red"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFolderToDelete(folder);
                                openConfirmDeleteModal();
                              }}
                            >
                              Delete
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </div>
                  </Card>
                </Grid.Col>
              ))}

              {documents.map((document) => (
                <Grid.Col key={document.id} span={12} sm={6} md={4} lg={3}>
                  <Card withBorder shadow="sm" radius="md" className={`h-full ${classes.card}`}>
                    <Card.Section className="bg-gray-50 p-4 flex justify-center">
                      <IconFile size={48} className="text-gray-500" />
                    </Card.Section>

                    <div className="mt-4">
                      <Text weight={600} size="sm" lineClamp={1} className="mb-1">
                        {document.original_name}
                      </Text>
                      <Text size="xs" color="dimmed" lineClamp={2} className="mb-2">
                        {document.description || 'No description'}
                      </Text>
                    </div>

                    <div className="mt-auto pt-2">
                      <Group position="apart" spacing="xs">
                        <Badge
                          color={documentTypeColors[document.document_type] || 'gray'}
                          variant="filled"
                          size="xs"
                        >
                          {document.document_type}
                        </Badge>
                        <Text size="xs" color="dimmed">
                          {formatFileSize(document.size)}
                        </Text>
                      </Group>

                      <Group position="right" spacing="xs" mt="sm">
                        <Menu withinPortal position="bottom-end" shadow="sm">
                          <Menu.Target>
                            <ActionIcon variant="subtle" color="gray">
                              <IconDotsVertical size={16} />
                            </ActionIcon>
                          </Menu.Target>

                          <Menu.Dropdown>
                            <Menu.Item
                              icon={<IconEye size={14} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpen(document, document.mime_type);
                              }}
                            >
                              Open
                            </Menu.Item>
                            <Menu.Item
                              icon={<IconShare size={14} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShareDocument(document);
                              }}
                            >
                              Share
                            </Menu.Item>
                            <Menu.Item
                              icon={<IconInfoCircle size={14} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                fetchShareHistory(document.id);
                              }}
                            >
                              View Share History
                            </Menu.Item>
                            <Menu.Item icon={<IconEdit size={14} />}>Rename</Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                              icon={<IconTrash size={14} />}
                              color="red"
                              onClick={() => {
                                setDocumentToDelete(document);
                                openConfirmDeleteModal();
                              }}                            >
                              Delete
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </div>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          )}
        </div>
      </Paper>
      <DocumentUpload
        folderId={currentFolder?.id || folderId}
        opened={uploadModalOpened}
        onClose={closeUploadModal}
        onUploadSuccess={() => {
          fetchContents();
          fetchChildFoldersCreated();
        }}
        userId={userId}
      />

      <Modal
        opened={shareModalOpened}
        onClose={closeShareModal}
        title={`Share Document: ${selectedDocument?.original_name || ''}`}
        centered
      >
        <Stack spacing="md">
          <Select
            label="Share with user"
            placeholder="Select a user"
            data={userOptions}
            value={shareData.sharedWithUserId}
            onChange={(value) => setShareData({ ...shareData, sharedWithUserId: value || '' })}
            icon={<IconUser size={16} />}
            searchable
            nothingFound="No users found"
            required
          />

          <Select
            label="Permission Level"
            placeholder="Select permission level"
            value={shareData.permissionLevel}
            onChange={(value) => setShareData({
              ...shareData,
              permissionLevel: value as 'view' | 'edit' | 'manage'
            })}
            data={[
              { value: 'view', label: 'View Only' },
              { value: 'edit', label: 'Can Edit' },
              { value: 'manage', label: 'Full Control' },
            ]}
            required
          />

          <Group position="right" mt="md">
            <Button variant="default" onClick={closeShareModal}>
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={!shareData.sharedWithUserId}
              leftIcon={<IconShare size={16} />}
            >
              Share Document
            </Button>
          </Group>
        </Stack>
      </Modal>
      <Modal
        opened={shareHistoryModalOpened}
        onClose={closeShareHistoryModal}
        title="Share History"
        size="lg"
        centered
      >
        {shareHistory.length > 0 ? (
          <div className="space-y-4">
            {shareHistory.map((share) => (
              <Paper key={share.id} p="md" withBorder>
                <Group position="apart">
                  <div>
                    <Text weight={600}>{share.user?.name || 'Unknown User'}</Text>
                    <Text size="sm" color="dimmed">{share.user?.email || ''}</Text>
                  </div>
                  <Badge color="blue" variant="outline">
                    {share.permission_level}
                  </Badge>
                </Group>
                <Text size="sm" mt="sm">
                  Shared on: {new Date(share.created_at).toLocaleString()}
                </Text>
              </Paper>
            ))}
          </div>
        ) : (
          <Text align="center" color="dimmed" py="md">
            No sharing history found for this document
          </Text>
        )}
      </Modal>
      <Modal
        opened={createModalOpened}
        onClose={closeCreateModal}
        title="Create New Folder"
        size="md"
        centered
      >
        <div className="space-y-4">
          <TextInput
            label="Folder Name"
            placeholder="Enter folder name"
            value={newFolder.name}
            onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
            required
          />

          <Textarea
            label="Description"
            placeholder="Enter folder description"
            value={newFolder.description}
            onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
            rows={3}
          />

          <Checkbox
            label="Shared Folder (visible to others)"
            checked={newFolder.is_shared}
            onChange={(e) => setNewFolder({ ...newFolder, is_shared: e.currentTarget.checked })}
          />

          <Group position="right" mt="md">
            <Button variant="default" onClick={closeCreateModal}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateFolder}
              disabled={!newFolder.name}
              leftIcon={<IconFolderPlus size={16} />}
            >
              Create Folder
            </Button>
          </Group>
        </div>
      </Modal>
      <Modal
        opened={confirmDeleteModalOpened}
        onClose={closeConfirmDeleteModal}
        title="Confirm Deletion"
        centered
      >
        <Text size="sm">
          Are you sure you want to delete{' '}
          <strong>{documentToDelete?.original_name || folderToDelete?.name}</strong>?
          This action cannot be undone.
        </Text>
        <Group position="right" mt="md">
          <Button variant="default" onClick={closeConfirmDeleteModal}>
            Cancel
          </Button>
          <Button color="red" onClick={async () => {
            if (documentToDelete) {
              await handleDeleteDocument(documentToDelete.id);
            } else if (folderToDelete) {
              await handleDeleteFolder();
            }
            closeConfirmDeleteModal();
          }}>
            Delete
          </Button>
        </Group>
      </Modal>
      <Modal
        opened={renameModalOpened}
        onClose={closeRenameModal}
        title="Rename Folder"
        size="md"
        centered
      >
        <div className="space-y-4">
          <TextInput
            label="New Folder Name"
            placeholder="Enter new folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            required
          />

          <Group position="right" mt="md">
            <Button variant="default" onClick={closeRenameModal}>
              Cancel
            </Button>
            <Button
              onClick={handleRenameFolder}
              disabled={!newFolderName.trim()}
              leftIcon={<IconEdit size={16} />}
            >
              Rename Folder
            </Button>
          </Group>
        </div>
      </Modal>
    </div>
  );
};

export default FolderContents;