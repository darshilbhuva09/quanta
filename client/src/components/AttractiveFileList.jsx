import React from 'react';
import { FiDownload, FiLink, FiMail, FiHash, FiTrash, FiEye } from 'react-icons/fi';
import './AttractiveFileList.css';

// Helper function to determine file type and return appropriate icon and color
const getFileTypeInfo = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  
  const fileTypes = {
    // Documents
    'pdf': { icon: '📄', color: '#e74c3c', category: 'document' },
    'doc': { icon: '📝', color: '#3498db', category: 'document' },
    'docx': { icon: '📝', color: '#3498db', category: 'document' },
    'txt': { icon: '📄', color: '#7f8c8d', category: 'document' },
    'rtf': { icon: '📄', color: '#7f8c8d', category: 'document' },
    
    // Images
    'jpg': { icon: '🖼️', color: '#9b59b6', category: 'image' },
    'jpeg': { icon: '🖼️', color: '#9b59b6', category: 'image' },
    'png': { icon: '🖼️', color: '#9b59b6', category: 'image' },
    'gif': { icon: '🖼️', color: '#9b59b6', category: 'image' },
    'svg': { icon: '🖼️', color: '#9b59b6', category: 'image' },
    
    // Spreadsheets
    'xls': { icon: '📊', color: '#27ae60', category: 'spreadsheet' },
    'xlsx': { icon: '📊', color: '#27ae60', category: 'spreadsheet' },
    'csv': { icon: '📊', color: '#27ae60', category: 'spreadsheet' },
    
    // Presentations
    'ppt': { icon: '📽️', color: '#f39c12', category: 'presentation' },
    'pptx': { icon: '📽️', color: '#f39c12', category: 'presentation' },
    
    // Archives
    'zip': { icon: '📦', color: '#f1c40f', category: 'archive' },
    'rar': { icon: '📦', color: '#f1c40f', category: 'archive' },
    '7z': { icon: '📦', color: '#f1c40f', category: 'archive' },
    'tar': { icon: '📦', color: '#f1c40f', category: 'archive' },
    'gz': { icon: '📦', color: '#f1c40f', category: 'archive' },
    
    // Code
    'html': { icon: '💻', color: '#e67e22', category: 'code' },
    'css': { icon: '💻', color: '#e67e22', category: 'code' },
    'js': { icon: '💻', color: '#e67e22', category: 'code' },
    'jsx': { icon: '💻', color: '#e67e22', category: 'code' },
    'json': { icon: '💻', color: '#e67e22', category: 'code' },
    'php': { icon: '💻', color: '#e67e22', category: 'code' },
    'py': { icon: '💻', color: '#e67e22', category: 'code' },
    
    // Default
    'default': { icon: '📄', color: '#7f8c8d', category: 'other' }
  };
  
  return fileTypes[extension] || fileTypes['default'];
};

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};

const AttractiveFileList = ({ files, onDownload, onShare, onDelete, onView }) => {
  return (
    <div className="attractive-file-list">
      {files.map((file) => {
        const fileTypeInfo = getFileTypeInfo(file.originalName || file.name);
        
        return (
          <div className="file-card" key={file.id || file._id}>
            <div className="file-card-header" style={{ backgroundColor: fileTypeInfo.color }}>
              <span className="file-icon">{fileTypeInfo.icon}</span>
              <div className="file-type-label">{fileTypeInfo.category}</div>
            </div>
            
            <div className="file-card-body">
              <h3 className="file-name" title={file.originalName || file.name}>
                {file.originalName || file.name}
              </h3>
              
              <div className="file-meta">
                <div className="file-size">
                  <span className="meta-label">Size:</span> 
                  <span className="meta-value">{formatFileSize(file.size)}</span>
                </div>
                
                <div className="file-date">
                  <span className="meta-label">Uploaded:</span> 
                  <span className="meta-value">{formatDate(file.uploadedAt || file.createdAt)}</span>
                </div>
                
                {file.downloads !== undefined && (
                  <div className="file-downloads">
                    <span className="meta-label">Downloads:</span> 
                    <span className="meta-value">{file.downloads}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="file-card-actions">
              <button 
                className="action-button download-btn" 
                onClick={() => onDownload && onDownload(file)}
                title="Download"
              >
                <FiDownload />
              </button>
              
              <button 
                className="action-button share-link-btn" 
                onClick={() => onShare && onShare(file, 'link')}
                title="Share Link"
              >
                <FiLink />
              </button>
              
              <button 
                className="action-button share-qr-btn" 
                onClick={() => onShare && onShare(file, 'qrcode')}
                title="Share QR Code"
              >
                <FiHash />
              </button>
              
              <button 
                className="action-button share-email-btn" 
                onClick={() => onShare && onShare(file, 'email')}
                title="Share via Email"
              >
                <FiMail />
              </button>
              
              <button 
                className="action-button view-btn" 
                onClick={() => onView && onView(file)}
                title="View File"
              >
                <FiEye />
              </button>
              
              <button 
                className="action-button delete-btn" 
                onClick={() => onDelete && onDelete(file)}
                title="Delete"
              >
                <FiTrash />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AttractiveFileList;