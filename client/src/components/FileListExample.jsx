import React, { useState } from 'react';
import AttractiveFileList from './AttractiveFileList';
import { toast } from 'react-toastify';
import ShareModal from './ShareModal'; // Assuming you have this component

const FileListExample = ({ files: initialFiles }) => {
  const [files, setFiles] = useState(initialFiles || []);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [shareMethod, setShareMethod] = useState(null);
  
  // Handle file download
  const handleDownload = async (file) => {
    try {
      toast.info(`Downloading ${file.originalName || file.name}...`);
      
      // Implement your download logic here
      // Example:
      // const response = await fetch(`/api/files/download/${file.id}`);
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = file.originalName || file.name;
      // document.body.appendChild(a);
      // a.click();
      // window.URL.revokeObjectURL(url);
      // document.body.removeChild(a);
      
      toast.success(`${file.originalName || file.name} downloaded successfully!`);
    } catch (error) {
      toast.error(`Failed to download: ${error.message}`);
    }
  };
  
  // Handle file sharing
  const handleShare = (file, method) => {
    setSelectedFile(file);
    setShareMethod(method);
    setShowShareModal(true);
  };
  
  // Handle file deletion
  const handleDelete = async (file) => {
    if (window.confirm(`Are you sure you want to delete ${file.originalName || file.name}?`)) {
      try {
        // Implement your delete logic here
        // Example:
        // await fetch(`/api/files/${file.id}`, { method: 'DELETE' });
        
        // Update local state
        setFiles(files.filter(f => f.id !== file.id));
        toast.success(`${file.originalName || file.name} deleted successfully!`);
      } catch (error) {
        toast.error(`Failed to delete: ${error.message}`);
      }
    }
  };
  
  // Handle file view
  const handleView = (file) => {
    toast.info(`Viewing ${file.originalName || file.name}`);
    // Implement your view logic here
    // Example: open a modal with file preview
  };
  
  // Close share modal
  const handleCloseModal = () => {
    setShowShareModal(false);
    setSelectedFile(null);
    setShareMethod(null);
  };
  
  return (
    <div className="file-list-container">
      <h2 className="section-title">My Files</h2>
      
      {files.length === 0 ? (
        <div className="empty-files">
          <h3>No files yet</h3>
          <p>Upload files to see them here</p>
        </div>
      ) : (
        <AttractiveFileList 
          files={files}
          onDownload={handleDownload}
          onShare={handleShare}
          onDelete={handleDelete}
          onView={handleView}
        />
      )}
      
      {showShareModal && selectedFile && (
        <ShareModal 
          fileId={selectedFile.id}
          fileName={selectedFile.originalName || selectedFile.name}
          method={shareMethod}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default FileListExample;