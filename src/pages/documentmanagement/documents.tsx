import React, { useState, useEffect } from 'react';
import { 
  Card,
  Grid,
  TextInput, 
  Textarea, 
  Button, 
  Modal, 
  Group, 
  Title, 
  Text, 
  Badge, 
  Breadcrumbs,
  Anchor,
  Paper,
  Notification,
  Checkbox,
  ActionIcon,
  Menu,
  Avatar,
  Divider,
  Box,
  Flex,
  Input,
  Tooltip,
  Select,
  MultiSelect,
  Stack
} from '@mantine/core';
import { useDisclosure, useHover } from '@mantine/hooks';
import { 
  IconFolder, 
  IconFolderPlus, 
  IconUpload, 
  IconTrash, 
  IconInfoCircle,
  IconDotsVertical,
  IconFile,
  IconSearch,
  IconStar,
  IconShare,
  IconEdit,
  IconDownload,
  IconGridDots,
  IconList,
  IconUser,
} from '@tabler/icons-react';
import DocumentUpload from './components/document-uploader';
import FolderContents from './components/folder-contents';
import Loader from '../../components/common/loader';
import { 
  createFolder, 
  getFolder, 
  shareFolder, 
  getAllUsers, 
  getFolderSharedWith,
  updateFolderName,
  deleteFolder
} from '../../services/api/main';

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
  woreda: {
    id: number;
    subcity_id: number;
    name: string;
    description: string;
  };
  subcity: {
    id: number;
    name: string;
    description: string;
  };
}

interface User {
  id: number;
  name: string;
  email: string;
  roleId: number;
}

interface Subcity {
  id: number;
  name: string;
  description: string;
}

interface Woreda {
  id: number;
  subcity_id: number;
  name: string;
  description: string;
}

interface CurrentUser {
  id: number;
  name: string;
  email: string;
  roleId: number;
  woredaId: number | null;
  subcityId: number | null;
}

interface ShareHistory {
  id: number;
  folder_id: number;
  user_id: number;
  permission_level: string;
  shared_by: number;
  created_at: string;
  updated_at: string;
  user: User;
}

const DMSFolderManagement: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{id: number | null, name: string}[]>([{id: null, name: 'Root'}]);
  const [subcities, setSubcities] = useState<Subcity[]>([]);
  const [woredas, setWoredas] = useState<Woreda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [users, setUsers] = useState<User[]>([]);
  const [shareHistory, setShareHistory] = useState<ShareHistory[]>([]);
  
  const [newFolder, setNewFolder] = useState({
    name: '',
    description: '',
    woreda_id: '',
    subcity_id: '',
    is_shared: false,
  });
  
  const [shareData, setShareData] = useState({
    folderId: 0,
    userId: '',
    permissionLevel: 'view' as 'view' | 'edit' | 'manage'
  });

  // Rename folder state
  const [renameModalOpened, { open: openRenameModal, close: closeRenameModal }] = useDisclosure(false);
  const [folderToRename, setFolderToRename] = useState<Folder | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [shareModalOpened, { open: openShareModal, close: closeShareModal }] = useDisclosure(false);
  const [shareHistoryModalOpened, { open: openShareHistoryModal, close: closeShareHistoryModal }] = useDisclosure(false);
  const [folderToDelete, setFolderToDelete] = useState<number | null>(null);
  const [uploadModalOpened, { open: openUploadModal, close: closeUploadModal }] = useDisclosure(false);
  const [viewingContents, setViewingContents] = useState<{
    folderId: number;
    folderName: string;
  } | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const parsedUser = JSON.parse(user) as CurrentUser;
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

  const fetchFolders = async (parentId: number | null = null) => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const parsedUser = JSON.parse(user) as CurrentUser;
      setCurrentUser(parsedUser);
    }
    try {
      setLoading(true);
      const user = localStorage.getItem('currentUser');
      const parsedUser = JSON.parse(user) as CurrentUser;
      
      if (!parsedUser) return;
      
      const data = await getFolder(parsedUser?.id);
      
      if (data.success) {
        const filteredFolders = parentId 
          ? data.data.filter((f: Folder) => f.parent_id === parentId)
          : data.data.filter((f: Folder) => f.parent_id === null);
        
        setFolders(filteredFolders);
      } else {
        setError(data.message || 'Failed to fetch folders');
      }
    } catch (err) {
      setError('Network error occurred while fetching folders');
    } finally {
      setLoading(false);
    }
  };

  const fetchShareHistory = async (folderId: number) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const response = await getFolderSharedWith(currentUser.id, folderId);
      
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

  const fetchLocationData = async () => {
    try {
      const subcitiesResponse = await fetch('/api/subcities');
      const subcitiesData = await subcitiesResponse.json();
      
      const woredasResponse = await fetch('/api/woredas');
      const woredasData = await woredasResponse.json();
      
      if (subcitiesData.success && woredasData.success) {
        setSubcities(subcitiesData.data);
        setWoredas(woredasData.data);
      }
    } catch (err) {
      console.error('Failed to fetch location data', err);
    }
  };

  useEffect(() => {
    fetchFolders();
    fetchLocationData();
  }, []);

  const handleCreateFolder = async () => {
    if (!currentUser) {
      setError('User not authenticated');
      return;
    }
  
    try {
      setLoading(true);
      
      const payload = {
        name: newFolder?.name,
        description: newFolder.description,
        woreda_id: currentUser.woredaId || (newFolder.woreda_id ? parseInt(newFolder.woreda_id) : null),
        subcity_id: currentUser.subcityId || (newFolder.subcity_id ? parseInt(newFolder.subcity_id) : null),
        is_shared: newFolder.is_shared,
        parent_id: currentFolder?.id || null
      };
  
      const data = await createFolder(currentUser.id, payload);
      
      if (data.success) {
        setSuccess('Folder created successfully');
        fetchFolders(currentFolder?.id || null);
        closeCreateModal();
        setNewFolder({
          name: '',
          description: '',
          woreda_id: currentUser.woredaId?.toString() || '',
          subcity_id: currentUser.subcityId?.toString() || '',
          is_shared: false,
        });
      } else {
        setError(data.message || 'Failed to create folder');
      }
    } catch (err) {
      setError('Network error occurred while creating folder');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;
    
    try {
      setLoading(true);
      console.log("folderToDelete,",folderToDelete)
      const response = await deleteFolder(folderToDelete);

      
  
        setSuccess('Folder deleted successfully');
                closeDeleteModal();
        fetchFolders();
        closeDeleteModal();
        setFolderToDelete(null);

    } catch (err) {
      // setError('Network error occurred while deleting folder');
      console.log("error",err)
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
        fetchFolders(currentFolder?.id || null);
        closeRenameModal();
        setFolderToRename(null);
        setNewFolderName('');
      } else {
        setError(response.message || 'Failed to rename folder');
      }
    } catch (err) {
      setError('Network error occurred while renaming folder');
    } finally {
      setLoading(false);
    }
  };

  const handleShareFolder = async () => {
    if (!currentUser || !shareData.userId) {
      setError('Please select a user');
      return;
    }
  
    try {
      setLoading(true);
      
      const folderIdToShare = currentFolder?.id || shareData.folderId;
      if (!folderIdToShare) {
        throw new Error('No folder selected for sharing');
      }
  
      const body = {
        folder_id: folderIdToShare,
        shared_with_user_id: parseInt(shareData.userId),
        permission_level: shareData.permissionLevel
      };
  
      const response = await shareFolder(currentUser.id, body);
      
      if (response.success) {
        setSuccess(`Folder shared successfully!`);
        closeShareModal();
      } else {
        setError(response.message || 'Failed to share folder');
      }
    } catch (err) {
      setError(err.message || 'Error sharing folder');
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = (folder: Folder) => {
    setViewingContents({
      folderId: folder.id,
      folderName: folder.name
    });
    setCurrentFolder(folder);
    setBreadcrumbs([...breadcrumbs, {id: folder.id, name: folder?.name}]);
  };

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

  const navigateToBreadcrumb = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    
    const targetFolderId = newBreadcrumbs[newBreadcrumbs.length - 1].id;
    setCurrentFolder(targetFolderId ? folders.find(f => f.id === targetFolderId) || null : null);
    fetchFolders(targetFolderId);
  };

  const filteredFolders = folders.filter(folder => 
    folder?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    folder.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userOptions = users
    .filter(user => user.id !== currentUser?.id)
    .map(user => ({
      value: user.id.toString(),
      label: `${user?.name} (${user.email})`,
    }));

  return (
    <div className="container mx-auto p-4">
      {loading && <Loader />}
      
      <Flex justify="space-between" align="center" className="mb-6">
        <Title order={2} className="flex items-center gap-2">
          <IconFolder size={32} className="text-blue-600" />
          <span>Document Management</span>
        </Title>
        
        <Group spacing="sm">
          <Input
            placeholder="Search folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            icon={<IconSearch size={16} />}
            className="w-64"
          />
          <ActionIcon 
            variant={viewMode === 'grid' ? 'filled' : 'default'} 
            color="blue"
            onClick={() => setViewMode('grid')}
          >
            <IconGridDots size={18} />
          </ActionIcon>
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
        <Flex p="md" justify="space-between" align="center">
          <Breadcrumbs separator="→">
            {breadcrumbs.map((item, index) => (
              <Anchor 
                key={index} 
                onClick={() => navigateToBreadcrumb(index)}
                className="cursor-pointer hover:text-blue-600"
                size="sm"
              >
                {item?.name}
              </Anchor>
            ))}
          </Breadcrumbs>
          
          <Group spacing="sm">
            <Button 
              leftIcon={<IconFolderPlus size="1rem" />} 
              onClick={openCreateModal}
              variant="light"
              size="sm"
            >
              New Folder
            </Button>
            <Button 
              leftIcon={<IconUpload size="1rem" />} 
              variant="light"
              size="sm"
              onClick={openUploadModal}
              disabled={!currentFolder}
            >
              Upload
            </Button>
          </Group>
        </Flex>
        
        <Divider />
        
        {viewMode === 'grid' ? (
          <Grid p="md" gutter="lg">
            {filteredFolders.length > 0 ? (
              filteredFolders.map((folder) => (
                <Grid.Col key={folder.id} span={12} sm={6} md={4} lg={3}>
                  <FolderCard 
                    folder={folder} 
                    onNavigate={navigateToFolder}
                    onDelete={(id) => {
                      setFolderToDelete(id);
                      openDeleteModal();
                    }}
                    onShare={(id) => {
                      setShareData(prev => ({...prev, folderId: id}));
                      openShareModal();
                    }}
                    onViewShareHistory={fetchShareHistory}
                    onRename={(folder) => {
                      setFolderToRename(folder);
                      setNewFolderName(folder?.name);
                      openRenameModal();
                    }}
                  />
                </Grid.Col>
              ))
            ) : (
              <Grid.Col span={12} className="py-12 text-center">
                <IconFolder size={48} className="mx-auto text-gray-400 mb-4" />
                <Text size="lg" color="dimmed">
                  {searchQuery ? 'No matching folders found' : 'No folders in this location'}
                </Text>
                {!searchQuery && (
                  <Button 
                    variant="subtle" 
                    size="sm" 
                    leftIcon={<IconFolderPlus size={14} />}
                    onClick={openCreateModal}
                    className="mt-2"
                  >
                    Create your first folder
                  </Button>
                )}
              </Grid.Col>
            )}
          </Grid>
        ) : (
          <div className="p-4">
            {filteredFolders.length > 0 ? (
              <div className="space-y-2">
                {filteredFolders.map((folder) => (
                  <FolderListItem 
                    key={folder.id}
                    folder={folder}
                    onNavigate={navigateToFolder}
                    onDelete={(id) => {
                      setFolderToDelete(id);
                      openDeleteModal();
                    }}
                    onShare={(id) => {
                      setShareData(prev => ({...prev, folderId: id}));
                      openShareModal();
                    }}
                    onViewShareHistory={fetchShareHistory}
                    onRename={(folder) => {
                      setFolderToRename(folder);
                      setNewFolderName(folder?.name);
                      openRenameModal();
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <IconFolder size={48} className="mx-auto text-gray-400 mb-4" />
                <Text size="lg" color="dimmed">
                  {searchQuery ? 'No matching folders found' : 'No folders in this location'}
                </Text>
                {!searchQuery && (
                  <Button 
                    variant="subtle" 
                    size="sm" 
                    leftIcon={<IconFolderPlus size={14} />}
                    onClick={openCreateModal}
                    className="mt-2"
                  >
                    Create your first folder
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </Paper>
      
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
            value={newFolder?.name}
            onChange={(e) => setNewFolder({...newFolder, name: e.target.value})}
            required
          />
          
          <Textarea
            label="Description"
            placeholder="Enter folder description"
            value={newFolder.description}
            onChange={(e) => setNewFolder({...newFolder, description: e.target.value})}
            rows={3}
          />
 
          <Checkbox
            label="Shared Folder (visible to others)"
            checked={newFolder.is_shared}
            onChange={(e) => setNewFolder({...newFolder, is_shared: e.currentTarget.checked})}
          />
          
          <Group position="right" mt="md">
            <Button variant="default" onClick={closeCreateModal}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateFolder}
              disabled={!newFolder?.name}
              leftIcon={<IconFolderPlus size={16} />}
            >
              Create Folder
            </Button>
          </Group>
        </div>
      </Modal>
      
      {/* Rename Folder Modal */}
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
      
      <DocumentUpload
        folderId={currentFolder?.id || null}
        opened={uploadModalOpened}
        onClose={closeUploadModal}
        onUploadSuccess={() => {
          fetchFolders(currentFolder?.id || null);
        }}
        userId={currentUser?.id || 0}
      />
      
      <Modal 
        opened={deleteModalOpened} 
        onClose={closeDeleteModal} 
        title="Delete Folder"
        centered
      >
        <div className="space-y-4">
          <Text>Are you sure you want to delete this folder and all its contents?</Text>
          <Text size="sm" color="red">
            Warning: This action cannot be undone.
          </Text>
          
          <Group position="right" mt="md">
            <Button variant="default" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button 
              color="red" 
              onClick={handleDeleteFolder}
              leftIcon={<IconTrash size={16} />}
            >
              Delete Folder
            </Button>
          </Group>
        </div>
      </Modal>
      
      <Modal 
        opened={shareModalOpened} 
        onClose={closeShareModal} 
        title="Share Folder"
        centered
      >
        <Stack spacing="md">
          <Select
            label="Select User"
            placeholder="Choose a user to share with"
            data={userOptions}
            value={shareData.userId}
            onChange={(value) => setShareData({...shareData, userId: value || ''})}
            icon={<IconUser size={16} />}
            searchable
            nothingFound="No users found"
            required
          />
          
          <Select
            label="Permission Level"
            placeholder="Select permission level"
            value={shareData.permissionLevel}
            onChange={(value) => setShareData({...shareData, permissionLevel: value as 'view' | 'edit' | 'manage'})}
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
              onClick={handleShareFolder}
              disabled={!shareData.userId}
              leftIcon={<IconShare size={16} />}
            >
              Share Folder
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
                    <Text weight={600}>{share.user?.name}</Text>
                    <Text size="sm" color="dimmed">{share.user.email}</Text>
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
            No sharing history found for this folder
          </Text>
        )}
      </Modal>
    </div>
  );
};
interface FolderCardProps {
  folder: Folder;
  onNavigate: (folder: Folder) => void;
  onDelete: (id: number) => void;
  onShare: (id: number) => void;
  onViewShareHistory: (id: number) => void;
  onRename: (folder: Folder) => void;
}

const FolderCard: React.FC<FolderCardProps> = ({ 
  folder, 
  onNavigate, 
  onDelete, 
  onShare,
  onViewShareHistory,
  onRename
}) => {
  const { hovered, ref } = useHover();
  
  return (
    <Card 
      ref={ref}
      withBorder 
      shadow={hovered ? 'sm' : undefined}
      radius="md"
      className={`transition-all cursor-pointer h-full flex flex-col ${hovered ? 'border-blue-300' : ''}`}
      onClick={() => onNavigate(folder)}
    >
      <Card.Section className="relative">
        <div className="absolute top-2 right-2 z-10">
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
                icon={<IconInfoCircle size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewShareHistory(folder.id);
                }}
              >
                View share history
              </Menu.Item>
              <Menu.Item 
                icon={<IconShare size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(folder.id);
                }}
              >
                Share
              </Menu.Item>
              <Menu.Item 
                icon={<IconEdit size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onRename(folder);
                }}
              >
                Rename
              </Menu.Item>
              <Menu.Item 
                icon={<IconDownload size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                Download
              </Menu.Item>
              <Menu.Divider />
              {/* folder delete */}
              <Menu.Item 
                icon={<IconTrash size={14} />} 
                color="red"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(folder.id);
                }}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
        
        <div className="bg-blue-50 p-8 flex justify-center">
          <IconFolder size={48} className="text-blue-500" />
        </div>
      </Card.Section>
      
      <div className="mt-4 flex-grow">
        <Text weight={600} size="md" lineClamp={1} className="mb-1">
          {folder?.name}
        </Text>
        <Text size="sm" color="dimmed" lineClamp={2} className="mb-2">
          {folder.description || 'No description'}
        </Text>
      </div>
      
      <div className="mt-auto pt-2">
        <Group spacing="xs">
          <Badge 
            variant="dot" 
            color={folder.is_shared ? 'green' : 'gray'}
            size="sm"
          >
            {folder.is_shared ? 'Shared' : 'Private'}
          </Badge>
          <Text size="xs" color="dimmed">
            {new Date(folder.created_at).toLocaleDateString()}
          </Text>
        </Group>
      </div>
    </Card>
  );
};

interface FolderListItemProps {
  folder: Folder;
  onNavigate: (folder: Folder) => void;
  onDelete: (id: number) => void;
  onShare: (id: number) => void;
  onViewShareHistory: (id: number) => void;
  onRename: (folder: Folder) => void;
}

const FolderListItem: React.FC<FolderListItemProps> = ({ 
  folder, 
  onNavigate, 
  onDelete, 
  onShare,
  onViewShareHistory,
  onRename
}) => {
  return (
    <Paper 
      withBorder 
      p="sm" 
      radius="md" 
      className="hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onNavigate(folder)}
    >
      <Flex align="center" gap="md">
        <div className="bg-blue-100 p-3 rounded-lg">
          <IconFolder size={24} className="text-blue-600" />
        </div>
        
        <div className="flex-grow">
          <Text weight={600} size="md" lineClamp={1}>
            {folder?.name}
          </Text>
          <Text size="sm" color="dimmed" lineClamp={1}>
            {folder.description || 'No description'}
          </Text>
        </div>
        
        <div className="hidden md:block">
          <Text size="sm">
            {JSON.parse(folder.subcity?.name).en} / {JSON.parse(folder.woreda?.name).en}
          </Text>
        </div>
        
        <div className="hidden sm:block">
          <Badge 
            variant="dot" 
            color={folder.is_shared ? 'green' : 'gray'}
            size="sm"
          >
            {folder.is_shared ? 'Shared' : 'Private'}
          </Badge>
        </div>
        
        <div className="hidden md:block">
          <Text size="sm" color="dimmed">
            {new Date(folder.created_at).toLocaleDateString()}
          </Text>
        </div>
        
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
              icon={<IconInfoCircle size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                onViewShareHistory(folder.id);
              }}
            >
              View share history
            </Menu.Item>
            <Menu.Item 
              icon={<IconShare size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                onShare(folder.id);
              }}
            >
              Share
            </Menu.Item>
            <Menu.Item 
              icon={<IconEdit size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                onRename(folder);
              }}
            >
              Rename
            </Menu.Item>
            <Menu.Item icon={<IconDownload size={14} />}>Download</Menu.Item>
            <Menu.Divider />
            <Menu.Item 
              icon={<IconTrash size={14} />} 
              color="red"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(folder.id);
              }}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Flex>
    </Paper>
  );
};

export default DMSFolderManagement;