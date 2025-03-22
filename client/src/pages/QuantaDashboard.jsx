import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import QuantaFileUploader from '../components/QuantaFileUploader';
import QuantaFileList from '../components/QuantaFileList';
import { FiUploadCloud, FiFolder, FiLogOut, FiDatabase } from 'react-icons/fi';
import './QuantaDashboard.css';

const QuantaDashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageLimit, setStorageLimit] = useState(1073741824); // 1GB default
  
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user's files
    const fetchFiles = async () => {
      try {
        setLoading(true);
        
        // Simulate API call with sample data
        setTimeout(() => {
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
            }
          ];
          
          setFiles(sampleFiles);
          
          // Calculate storage used from sample files
          const totalSize = sampleFiles.reduce((acc, file) => {
            // Convert size strings like "1.2 MB" to bytes
            const sizeValue = parseFloat(file.size);
            const unit = file.size.split(' ')[1];
            let bytes = sizeValue;
            
            if (unit === 'KB') bytes *= 1024;
            if (unit === 'MB') bytes *= 1024 * 1024;
            if (unit === 'GB') bytes *= 1024 * 1024 * 1024;
            
            return acc + bytes;
          }, 0);
          
          setStorageUsed(totalSize);
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        console.error('Error fetching files:', err);
        toast.error('Failed to load your files');
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const handleFileAction = (action, file) => {
    switch (action) {
      case 'download':
        toast.info(`Downloading ${file.name}...`);
        break;
      case 'link':
        toast.success(`Share link generated for ${file.name}`);
        break;
      case 'qrcode':
        toast.success(`QR code generated for ${file.name}`);
        break;
      case 'email':
        toast.info(`Preparing to email ${file.name}...`);
        break;
      default:
        break;
    }
  };

  const handleFileUploaded = () => {
    // Refresh the file list
    setActiveTab('files');
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  // Format storage display
  const formatStorage = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate storage percentage
  const storagePercentage = Math.min(Math.round((storageUsed / storageLimit) * 100), 100);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.username) return 'U';
    return user.username.charAt(0).toUpperCase();
  };

  return (
    <div className="quanta-dashboard">
      {/* Fixed Header */}
      <header className="quanta-header">
        <div className="quanta-logo">
          <span className="logo-text">Quanta Share</span>
        </div>
        
        <div className="quanta-user-section">
          <div className="storage-indicator">
            <div className="storage-icon">
              <FiDatabase />
            </div>
            <div className="storage-details">
              <div className="storage-bar">
                <div 
                  className="storage-used" 
                  style={{ width: `${storagePercentage}%` }}
                ></div>
              </div>
              <div className="storage-text">
                {formatStorage(storageUsed)} / {formatStorage(storageLimit)}
              </div>
            </div>
          </div>
          
          {user && (
            <div className="quanta-user">
              <div className="user-avatar">
                {getUserInitials()}
              </div>
              <span className="user-name">{user?.username}</span>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut />
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="quanta-main">
        {/* Tabs - Fixed position with high z-index */}
        <div className="quanta-tabs">
          <button 
            className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => setActiveTab('files')}
          >
            <FiFolder className="tab-icon" />
            <span className="tab-text">My Files</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <FiUploadCloud className="tab-icon" />
            <span className="tab-text">Upload</span>
          </button>
        </div>
        
        {/* Content Area - Lower z-index */}
        <div className="quanta-content">
          {activeTab === 'upload' ? (
            <QuantaFileUploader onFileUploaded={handleFileUploaded} />
          ) : (
            <QuantaFileList 
              files={files} 
              loading={loading} 
              onFileAction={handleFileAction} 
            />
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="quanta-footer">
        <div className="footer-content">
          <p className="copyright-text">© 2023 Quanta Share. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default QuantaDashboard;
