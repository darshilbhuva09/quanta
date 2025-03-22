import React, { useState, useEffect } from 'react';
import { FiDownload, FiLink, FiHash, FiMail, FiSearch, FiFile, FiImage, FiVideo, FiArchive, FiFileText, FiTrash2 } from 'react-icons/fi';
import './quanta-share-styles.css';

const QuantaFileList = ({ files = [], loading = false, onFileAction }) => {
  const [search, setSearch] = useState('');
  
  // Silently log files for troubleshooting
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Files in QuantaFileList:', files);
    }
  }, [files]);

  const filteredFiles = files.filter((file) => {
    // Check if file exists before filtering
    if (!file) return false;
    
    // Get the display name from originalName or name
    const displayName = (file.originalName || file.name || '').toLowerCase();
    const searchTerm = (search || '').toLowerCase();
    
    return displayName.includes(searchTerm);
  });

  // Get file icon based on file type
  const getFileIcon = (file) => {
    // Default icon if file is undefined
    if (!file) return <FiFile />;
    
    // Use the most likely file name property
    const fileName = file.originalName || file.name || '';
    
    if (!fileName) return <FiFile />;
    
    const extension = fileName.split('.').pop().toLowerCase();
    
    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
      return <FiImage />;
    }
    
    // Videos
    if (['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(extension)) {
      return <FiVideo />;
    }
    
    // Archives
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
      return <FiArchive />;
    }
    
    // Documents
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension)) {
      return <FiFileText />;
    }
    
    // Default
    return <FiFile />;
  };

  // Handle download
  const handleDownload = (file) => {
    if (onFileAction) {
      onFileAction('download', file);
    } else {
      alert(`Downloading ${file.name}...`);
    }
  };

  // Handle share link
  const handleShareLink = (file) => {
    if (onFileAction) {
      onFileAction('link', file);
    } else {
      alert(`Generating share link for ${file.name}...`);
    }
  };

  // Handle QR code
  const handleQrCode = (file) => {
    if (onFileAction) {
      onFileAction('qrcode', file);
    } else {
      alert(`Generating QR code for ${file.name}...`);
    }
  };

  // Handle email
  const handleEmail = (file) => {
    if (onFileAction) {
      onFileAction('email', file);
    } else {
      alert(`Sharing ${file.name} via email...`);
    }
  };

  // Handle delete
  const handleDelete = (file) => {
    if (onFileAction) {
      onFileAction('delete', file);
    } else {
      alert(`Deleting ${file.name}...`);
    }
  };

  if (loading) {
    return (
      <div className="qs-file-list-container">
        <div className="qs-loading">
          <div className="qs-spinner"></div>
          <p>Loading your files...</p>
        </div>
      </div>
    );
  }

  // Check if files array is valid
  if (!Array.isArray(files)) {
    console.error('Files prop is not an array:', files);
    return (
      <div className="qs-file-list-container">
        <div className="qs-empty-files">
          <div className="qs-empty-icon">⚠️</div>
          <h3 className="qs-empty-title">Error loading files</h3>
          <p className="qs-empty-text">
            There was a problem loading your files. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="qs-file-list-container">
      <div className="qs-file-list-header">
        <h2 className="qs-file-list-title">My Files</h2>
        <div className="qs-search-container">
          <FiSearch className="qs-search-icon" />
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="qs-search-input"
          />
        </div>
      </div>

      {filteredFiles.length > 0 ? (
        <div className="qs-file-grid">
          {filteredFiles.map((file) => (
            <div key={file.id || file._id || file.shortId || Math.random()} className="qs-file-card">
              <div className="qs-file-card-header">
                <div className="qs-file-icon-container">
                  {getFileIcon(file)}
                </div>
                <div className="qs-file-info">
                  <h3 className="qs-file-name">{file.originalName || file.name || 'Unnamed File'}</h3>
                  <div className="qs-file-meta">
                    <span className="qs-file-size">
                      {typeof file.size === 'string' ? file.size : formatFileSize(file.size) || 'Unknown size'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="qs-file-card-body">
                <div className="qs-file-details">
                  <div className="qs-file-detail-item">
                    <span className="qs-detail-label">Uploaded</span>
                    <span className="qs-detail-value">
                      {file.uploaded || (file.createdAt ? new Date(file.createdAt).toLocaleString() : 'Unknown')}
                    </span>
                  </div>
                  <div className="qs-file-detail-item">
                    <span className="qs-detail-label">Downloads</span>
                    <span className="qs-detail-value">
                      {file.downloads !== undefined ? file.downloads : (file.downloadCount || 0)}
                    </span>
                  </div>
                </div>
                
                <div className="qs-file-actions">
                  <button 
                    className="qs-action-button qs-download-btn" 
                    onClick={() => handleDownload(file)}
                    title="Download"
                  >
                    <FiDownload />
                  </button>
                  
                  <button 
                    className="qs-action-button qs-link-btn" 
                    onClick={() => handleShareLink(file)}
                    title="Share Link"
                  >
                    <FiLink />
                  </button>
                  
                  <button 
                    className="qs-action-button qs-qr-btn" 
                    onClick={() => handleQrCode(file)}
                    title="QR Code"
                  >
                    <FiHash />
                  </button>
                  
                  <button 
                    className="qs-action-button qs-email-btn" 
                    onClick={() => handleEmail(file)}
                    title="Email"
                  >
                    <FiMail />
                  </button>
                  
                  <button 
                    className="qs-action-button qs-delete-btn" 
                    onClick={() => handleDelete(file)}
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="qs-empty-files">
          <div className="qs-empty-icon">📁</div>
          <h3 className="qs-empty-title">No files found</h3>
          <p className="qs-empty-text">
            {search ? 'Try a different search term' : 'Upload files to see them here'}
          </p>
        </div>
      )}
    </div>
  );
};

// Add a helper function for file size formatting
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default QuantaFileList;

