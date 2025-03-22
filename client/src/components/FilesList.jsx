import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { FaFile, FaFileImage, FaFileVideo, FaFileAudio, FaFilePdf, FaFileWord, FaFileExcel } from 'react-icons/fa';
import { FiLink, FiDownload, FiMail, FiHash } from 'react-icons/fi';
import ShareModal from './ShareModal';
import './styles.css'; // Import the new styles

const FilesList = ({ files, loading, onFileAction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [shareMethod, setShareMethod] = useState(null);
  const [displayedFiles, setDisplayedFiles] = useState([]);
  const [page, setPage] = useState(1);
  const filesPerPage = 10;

  // Memoize filtered files to avoid unnecessary recalculations
  const filteredFiles = useMemo(() => {
    if (!files || files.length === 0) return [];
    
    return files.filter(file => 
      file.originalName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [files, searchTerm]);

  // Update displayed files when filtered files or page changes
  useEffect(() => {
    const startIndex = (page - 1) * filesPerPage;
    const endIndex = startIndex + filesPerPage;
    setDisplayedFiles(filteredFiles.slice(startIndex, endIndex));
  }, [filteredFiles, page]);

  // Reset to first page when search term changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleShareClick = useCallback((file, method) => {
    setSelectedFile(file);
    setShareMethod(method);
    setShowShareModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowShareModal(false);
    setSelectedFile(null);
    setShareMethod(null);
  }, []);

  const handleDownload = useCallback(async (fileId, fileName) => {
    try {
      const response = await fetch(`/api/files/download/${fileId}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      // Create a blob from the response
      const blob = await response.blob();
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('File downloaded successfully');
      
      if (onFileAction) {
        onFileAction();
      }
    } catch (err) {
      toast.error(err.message || 'Error downloading file');
    }
  }, [onFileAction]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Function to get appropriate icon based on file type
  const getFileIcon = (fileType) => {
    if (!fileType) return <FaFile />;
    
    if (fileType.startsWith('image/')) {
      return <FaFileImage />;
    } else if (fileType.startsWith('video/')) {
      return <FaFileVideo />;
    } else if (fileType.startsWith('audio/')) {
      return <FaFileAudio />;
    } else if (fileType === 'application/pdf') {
      return <FaFilePdf />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FaFileWord />;
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return <FaFileExcel />;
    } else {
      return <FaFile />;
    }
  };

  // Handle pagination
  const totalPages = Math.ceil(filteredFiles.length / filesPerPage);
  
  const handlePrevPage = () => {
    setPage(prev => Math.max(prev - 1, 1));
  };
  
  const handleNextPage = () => {
    setPage(prev => Math.min(prev + 1, totalPages));
  };

  if (loading) {
    return (
      <div className="files-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="files-container">
      <div className="files-header">
        <h2 className="files-title">My Files</h2>
        <input
          type="text"
          className="files-search"
          placeholder="Search files..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {filteredFiles.length === 0 ? (
        <div className="no-files">
          <div className="empty-icon">
            <FaFile size={48} />
          </div>
          <h3>No files found</h3>
          <p>{searchTerm ? 'No files match your search' : 'You have not uploaded any files yet'}</p>
        </div>
      ) : (
        <>
          <div className="files-grid">
            {displayedFiles.map(file => (
              <div key={file._id} className="file-card">
                <div className="file-icon">
                  {getFileIcon(file.fileType)}
                </div>
                <div className="file-details">
                  <div className="file-name" title={file.originalName}>{file.originalName}</div>
                  <div className="file-meta">
                    <span>{formatFileSize(file.size)}</span>
                    <span>Uploaded: {formatDate(file.createdAt)}</span>
                    <span>Downloads: {file.downloadCount || 0}</span>
                  </div>
                </div>
                <div className="file-actions">
                  <button 
                    className="file-action-btn download" 
                    title="Download"
                    onClick={() => handleDownload(file.shortId, file.originalName)}
                  >
                    <FiDownload />
                  </button>
                  <button 
                    className="file-action-btn share" 
                    title="Share Link"
                    onClick={() => handleShareClick(file, 'link')}
                  >
                    <FiLink />
                  </button>
                  <button 
                    className="file-action-btn qr" 
                    title="Share QR Code"
                    onClick={() => handleShareClick(file, 'qrcode')}
                  >
                    <FiHash />
                  </button>
                  <button 
                    className="file-action-btn email" 
                    title="Share via Email"
                    onClick={() => handleShareClick(file, 'email')}
                  >
                    <FiMail />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={handlePrevPage} 
                disabled={page === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              <button 
                onClick={handleNextPage} 
                disabled={page === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showShareModal && selectedFile && (
        <ShareModal 
          fileId={selectedFile._id}
          fileName={selectedFile.originalName}
          method={shareMethod}
          onClose={handleCloseModal}
          className="share-modal"
        />
      )}
    </div>
  );
};

export default FilesList;
