import React, { useState } from 'react';
import { 
  Modal,
  Button,
  Group,
  TextInput,
  Textarea,
  Select,
  FileInput,
  LoadingOverlay,
  Notification
} from '@mantine/core';
import { IconUpload, IconX, IconCheck } from '@tabler/icons-react';
import { uploadFilesToFolders } from '../../../services/api/main';
interface DocumentUploadProps {
  folderId: number | null;
  opened: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  userId: number;
}

const documentTypes = [
  { value: 'plan', label: 'Plan' },
  { value: 'report', label: 'Report' },
  { value: 'checklist', label: 'Checklist' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'letter', label: 'Letter' },
  { value: 'supervision_report', label: 'Supervision Report' },
  { value: 'financial', label: 'Financial' },
  { value: 'other', label: 'Other' },
];

const DocumentUpload: React.FC<DocumentUploadProps> = ({ 
  folderId, 
  opened, 
  onClose, 
  onUploadSuccess,
  userId 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }
    if (!documentType) {
      setError('Please select a document type');
      return;
    }
    if (!folderId) {
      setError('No folder selected');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder_id', folderId.toString());
      formData.append('document_type', documentType);
      formData.append('description', description);

      const response = await uploadFilesToFolders(userId, formData);

      if (response.success) {
        setSuccess('Document uploaded successfully');
        setTimeout(() => {
          onUploadSuccess();
          handleClose();
        }, 1500);
      } else {
        setError(response.message || 'Failed to upload document');
      }
    } catch (err) {
      setError('An error occurred while uploading the document');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setDocumentType(null);
    setDescription('');
    setError(null);
    setSuccess(null);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Upload Document"
      size="lg"
      centered
    >
      <div className="relative">
        <LoadingOverlay visible={loading} overlayBlur={2} />
        
        {error && (
          <Notification 
            icon={<IconX size="1.1rem" />} 
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
            icon={<IconCheck size="1.1rem" />} 
            color="green" 
            title="Success"
            onClose={() => setSuccess(null)}
            className="mb-4"
          >
            {success}
          </Notification>
        )}

        <div className="space-y-4">
          <FileInput
            label="Select File"
            placeholder="Choose a file to upload"
            value={file}
            onChange={setFile}
            required
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
          />

          <Select
            label="Document Type"
            placeholder="Select document type"
            data={documentTypes}
            value={documentType}
            onChange={setDocumentType}
            required
          />

          <Textarea
            label="Description"
            placeholder="Enter document description"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            rows={3}
          />

          <Group position="right" mt="md">
            <Button variant="default" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={!file || !documentType}
              leftIcon={<IconUpload size={16} />}
            >
              Upload Document
            </Button>
          </Group>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentUpload;