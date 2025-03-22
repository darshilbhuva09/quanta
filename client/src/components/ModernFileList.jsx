import React, { useState } from "react";
import { FaDownload, FaLink, FaHashtag, FaEnvelope, FaTrash, FaEye } from "react-icons/fa";
import "./ModernFileList.css";

// Sample data - replace with your actual data
const sampleFiles = [
  {
    id: 1,
    name: "Document.pdf",
    size: "120 KB",
    uploaded: "Mar 20, 2025",
    downloads: 5,
  },
  {
    id: 2,
    name: "Image.png",
    size: "2.4 MB",
    uploaded: "Mar 18, 2025",
    downloads: 3,
  },
  {
    id: 3,
    name: "Video.mp4",
    size: "15.7 MB",
    uploaded: "Mar 15, 2025",
    downloads: 1,
  },
  {
    id: 4,
    name: "Archive.zip",
    size: "8.5 MB",
    uploaded: "Mar 10, 2025",
    downloads: 7,
  },
];

const ModernFileList = ({ files = sampleFiles }) => {
  const [search, setSearch] = useState("");

  // Filter files based on search query
  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(search.toLowerCase())
  );

  // Format file size dynamically
  const formatSize = (size) => {
    if (typeof size === 'string') return size;
    
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    if (size < 1024 * 1024 * 1024)
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  // Get file type icon and color
  const getFileTypeInfo = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    const fileTypes = {
      // Documents
      'pdf': { icon: '📄', color: '#e74c3c', category: 'Document' },
      'doc': { icon: '📝', color: '#3498db', category: 'Document' },
      'docx': { icon: '📝', color: '#3498db', category: 'Document' },
      'txt': { icon: '📄', color: '#7f8c8d', category: 'Document' },
      
      // Images
      'jpg': { icon: '🖼️', color: '#9b59b6', category: 'Image' },
      'jpeg': { icon: '🖼️', color: '#9b59b6', category: 'Image' },
      'png': { icon: '🖼️', color: '#9b59b6', category: 'Image' },
      'gif': { icon: '🖼️', color: '#9b59b6', category: 'Image' },
      
      // Videos
      'mp4': { icon: '🎬', color: '#e67e22', category: 'Video' },
      'mov': { icon: '🎬', color: '#e67e22', category: 'Video' },
      'avi': { icon: '🎬', color: '#e67e22', category: 'Video' },
      
      // Archives
      'zip': { icon: '📦', color: '#f1c40f', category: 'Archive' },
      'rar': { icon: '📦', color: '#f1c40f', category: 'Archive' },
      '7z': { icon: '📦', color: '#f1c40f', category: 'Archive' },
      
      // Default
      'default': { icon: '📄', color: '#7f8c8d', category: 'File' }
    };
    
    return fileTypes[extension] || fileTypes['default'];
  };

  // Handle download
  const handleDownload = (file) => {
    alert(`Downloading ${file.name}...`);
  };

  // Handle sharing
  const handleShare = (file) => {
    alert(`Sharing ${file.name}...`);
  };

  // Handle tagging
  const handleTag = (file) => {
    alert(`Generating QR code for ${file.name}...`);
  };

  // Handle emailing
  const handleEmail = (file) => {
    alert(`Emailing ${file.name}...`);
  };

  // Handle view
  const handleView = (file) => {
    alert(`Viewing ${file.name}...`);
  };

  // Handle delete
  const handleDelete = (file) => {
    alert(`Deleting ${file.name}...`);
  };

  return (
    <div className="modern-file-list-container">
      <div className="modern-file-list-header">
        <h2 className="section-title">My Files</h2>
        
        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* File List */}
      <div className="modern-file-list">
        {filteredFiles.map((file) => {
          const fileTypeInfo = getFileTypeInfo(file.name);
          
          return (
            <div key={file.id} className="file-card">
              <div className="file-card-header" style={{ backgroundColor: fileTypeInfo.color }}>
                <span className="file-icon">{fileTypeInfo.icon}</span>
                <div className="file-type-label">{fileTypeInfo.category}</div>
              </div>
              
              <div className="file-card-body">
                <h3 className="file-name" title={file.name}>
                  {file.name}
                </h3>
                
                <div className="file-meta">
                  <div className="file-size">
                    <span className="meta-label">Size:</span> 
                    <span className="meta-value">{formatSize(file.size)}</span>
                  </div>
                  
                  <div className="file-date">
                    <span className="meta-label">Uploaded:</span> 
                    <span className="meta-value">{file.uploaded}</span>
                  </div>
                  
                  <div className="file-downloads">
                    <span className="meta-label">Downloads:</span> 
                    <span className="meta-value">{file.downloads}</span>
                  </div>
                </div>
              </div>
              
              <div className="file-card-actions">
                <button 
                  className="action-button download-btn" 
                  onClick={() => handleDownload(file)}
                  title="Download"
                >
                  <FaDownload />
                </button>
                
                <button 
                  className="action-button share-link-btn" 
                  onClick={() => handleShare(file)}
                  title="Share Link"
                >
                  <FaLink />
                </button>
                
                <button 
                  className="action-button share-qr-btn" 
                  onClick={() => handleTag(file)}
                  title="QR Code"
                >
                  <FaHashtag />
                </button>
                
                <button 
                  className="action-button share-email-btn" 
                  onClick={() => handleEmail(file)}
                  title="Email"
                >
                  <FaEnvelope />
                </button>
                
                <button 
                  className="action-button view-btn" 
                  onClick={() => handleView(file)}
                  title="View"
                >
                  <FaEye />
                </button>
                
                <button 
                  className="action-button delete-btn" 
                  onClick={() => handleDelete(file)}
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Files Found */}
      {filteredFiles.length === 0 && (
        <div className="empty-files">
          <h3>No files found</h3>
          <p>Try a different search term or upload new files</p>
        </div>
      )}
    </div>
  );
};

export default ModernFileList;