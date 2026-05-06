// modals/AdminModal.tsx
import React, { useState } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  min-width: 400px;
  max-width: 600px;
`;

const ModalHeader = styled.h2`
  margin: 0 0 1rem 0;
  color: #333;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const Button = styled.button<{ $variant?: 'primary' | 'danger' | 'secondary' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  
  ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: #007bff;
          color: white;
          &:hover { background: #0056b3; }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover { background: #c82333; }
        `;
      default:
        return `
          background: #6c757d;
          color: white;
          &:hover { background: #545b62; }
        `;
    }
  }}
`;

interface FileData {
  name: string;
  file_type: string;
  url: string;
  special: boolean;
  created: string;
}

interface AdminModalProps {
  file: FileData;
  onClose: () => void;
  onUpdate: (updatedFile: Partial<FileData>) => Promise<void>;
  onDelete: () => Promise<void>;
}

const AdminModal: React.FC<AdminModalProps> = ({ file, onClose, onUpdate, onDelete }) => {
  const [fileName, setFileName] = useState(file.name);
  const [isNSFW, setIsNSFW] = useState(file.special);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      await onUpdate({
        name: fileName,
        special: isNSFW
      });
      onClose();
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${file.name}.${file.file_type}"?`)) {
      return;
    }
    
    setIsLoading(true);
    try {
      await onDelete();
      onClose();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>Edit File: {file.name}.{file.file_type}</ModalHeader>
        
        <FormGroup>
          <Label htmlFor="fileName">File Name:</Label>
          <Input
            id="fileName"
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            disabled={isLoading}
          />
        </FormGroup>

        <FormGroup>
          <CheckboxGroup>
            <input
              id="isNSFW"
              type="checkbox"
              checked={isNSFW}
              onChange={(e) => setIsNSFW(e.target.checked)}
              disabled={isLoading}
            />
            <Label htmlFor="isNSFW">Mark as NSFW</Label>
          </CheckboxGroup>
        </FormGroup>

        <ButtonGroup>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            $variant="danger" 
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
          <Button 
            $variant="primary" 
            onClick={handleUpdate}
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update'}
          </Button>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AdminModal;