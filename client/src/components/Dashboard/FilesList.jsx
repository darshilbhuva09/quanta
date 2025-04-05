import React from 'react';
import './FilesList.css';

const FilesList = ({ files, onFileSelect }) => {
  return (
    <div className="files-container">
      <h2 className="section-title">My Files</h2>
      {files.map((file) => (console.log(file.name,":->", file.size)))}
      {files && files.length > 0 ? (
        <div className="files-grid">
          {files.map((file) => (
            <div 
              key={file.id || file._id} 
              className="file-box"
              onClick={() => onFileSelect(file)}
            >
              <div className="file-icon">
                {getFileIcon(file.type || file.fileType || 'unknown')}
              </div>
              <div className="file-details">
                <h3 className="file-name">{file.name || file.fileName || 'Unnamed File'}</h3>
                <p className="file-meta">
                  {formatFileSize(file.size || file.fileSize || 0)} • {formatDate(file.uploadedAt || file.createdAt || new Date())}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No files found. Upload your first file to get started.</p>
        </div>
      )}
    </div>
  );
};

// Helper functions
const getFileIcon = (fileType) => {
  // Return appropriate icon based on file type
  if (!fileType || fileType === 'unknown') {
    return <i className="fas fa-file"></i>;
  } else if (fileType.startsWith('image/')) {
    return <i className="fas fa-file-image"></i>;
  } else if (fileType.startsWith('video/')) {
    return <i className="fas fa-file-video"></i>;
  } else if (fileType.startsWith('audio/')) {
    return <i className="fas fa-file-audio"></i>;
  } else if (fileType === 'application/pdf') {
    return <i className="fas fa-file-pdf"></i>;
  } else if (fileType.includes('word') || fileType.includes('document')) {
    return <i className="fas fa-file-word"></i>;
  } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
    return <i className="fas fa-file-excel"></i>;
  } else {
    return <i className="fas fa-file"></i>;
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

export default FilesList;
