import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import EnhancedFileUploader from '../components/EnhancedFileUploader';
import AttractiveFileList from '../components/AttractiveFileList';
import ShareModal from '../components/ShareModal';
import './EnhancedDashboard.css';

const EnhancedDashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [shareMethod, setShareMethod] = useState(null);
  
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user's files
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/files', {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        
        if (res.status === 401) {
          // Token expired or invalid
          logout();
          navigate('/auth');
          return;
        }
        
        const data = await res.json();
        setFiles(data);
      } catch (err) {
        console.error('Error fetching files:', err);
        toast.error('Failed to load your files. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [logout, navigate, refreshTrigger]);

  const refreshFiles = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };
  
  // Handle file download
  const handleDownload = async (file) => {
    try {
      const response = await fetch(`/api/files/download/${file.shortId}`, {
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
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('File downloaded successfully');
      refreshFiles();
    } catch (err) {
      toast.error(err.message || 'Error downloading file');
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
    if (window.confirm(`Are you sure you want to delete ${file.originalName}?`)) {
      try {
        const res = await fetch(`/api/files/${file._id}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        
        if (!res.ok) {
          throw new Error('Failed to delete file');
        }
        
        toast.success('File deleted successfully');
        refreshFiles();
      } catch (err) {
        toast.error(err.message || 'Error deleting file');
      }
    }
  };
  
  // Handle file view
  const handleView = (file) => {
    // For now, just download the file
    handleDownload(file);
  };
  
  // Close share modal
  const handleCloseModal = () => {
    setShowShareModal(false);
    setSelectedFile(null);
    setShareMethod(null);
  };

  return (
    <div className="enhanced-dashboard">
      <header className="enhanced-dashboard-header">
        <div className="header-content">
          <a href="/dashboard" className="enhanced-dashboard-logo">
            <span className="logo-icon">📤</span>
            <span className="logo-text">Quanta Share</span>
          </a>
          
          <div className="enhanced-dashboard-nav">
            {user && (
              <div className="user-info">
                <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
                <span className="user-name">{user.username}</span>
              </div>
            )}
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <div className="enhanced-dashboard-content">
        <div className="enhanced-dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <span className="tab-icon">📤</span>
            <span className="tab-text">Upload</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => setActiveTab('files')}
          >
            <span className="tab-icon">📁</span>
            <span className="tab-text">My Files</span>
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'upload' ? (
            <div className="upload-section">
              <h2 className="section-title">Upload Files</h2>
              <EnhancedFileUploader onFileUploaded={refreshFiles} />
            </div>
          ) : (
            <div className="files-section">
              <h2 className="section-title">My Files</h2>
              
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading your files...</p>
                </div>
              ) : files.length === 0 ? (
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
            </div>
          )}
        </div>
      </div>
      
      {showShareModal && selectedFile && (
        <ShareModal 
          fileId={selectedFile._id}
          fileName={selectedFile.originalName}
          method={shareMethod}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default EnhancedDashboard;