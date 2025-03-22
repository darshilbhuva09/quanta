import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import EnhancedFileUploader from '../components/EnhancedFileUploader';
import ModernFileList from '../components/ModernFileList';
import './EnhancedDashboard.css';

const DashboardWithModernFiles = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user's files
    const fetchFiles = async () => {
      try {
        setLoading(true);
        
        // This is where you would normally fetch from your API
        // For demo purposes, we'll use a timeout to simulate loading
        setTimeout(() => {
          // Sample data - replace with actual API call
          const sampleFiles = [
            {
              id: 1,
              name: "Project_Report.pdf",
              size: "1.2 MB",
              uploaded: "Mar 20, 2025",
              downloads: 5,
            },
            {
              id: 2,
              name: "Profile_Picture.png",
              size: "2.4 MB",
              uploaded: "Mar 18, 2025",
              downloads: 3,
            },
            {
              id: 3,
              name: "Presentation_Demo.mp4",
              size: "15.7 MB",
              uploaded: "Mar 15, 2025",
              downloads: 1,
            },
            {
              id: 4,
              name: "Source_Code.zip",
              size: "8.5 MB",
              uploaded: "Mar 10, 2025",
              downloads: 7,
            },
            {
              id: 5,
              name: "Meeting_Notes.docx",
              size: "450 KB",
              uploaded: "Mar 8, 2025",
              downloads: 2,
            },
            {
              id: 6,
              name: "Budget_2025.xlsx",
              size: "1.8 MB",
              uploaded: "Mar 5, 2025",
              downloads: 4,
            },
          ];
          
          setFiles(sampleFiles);
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        console.error('Error fetching files:', err);
        toast.error('Failed to load your files. Please try again.');
        setLoading(false);
      }
    };

    fetchFiles();
  }, [refreshTrigger]);

  const refreshFiles = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
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
                <div className="user-avatar">{user?.username?.charAt(0).toUpperCase() || 'U'}</div>
                <span className="user-name">{user?.username || 'User'}</span>
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
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading your files...</p>
                </div>
              ) : (
                <ModernFileList files={files} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardWithModernFiles;