import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import QuantaFileUploader from '../components/QuantaFileUploader';
import QuantaFileList from '../components/QuantaFileList';
import QuantaShareModal from '../components/QuantaShareModal';
import { FiUploadCloud, FiFolder, FiLogOut, FiHardDrive } from 'react-icons/fi';
import axios from 'axios';
import './QuantaDashboard.css';

const QuantaDashboardV2 = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareMethod, setShareMethod] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [storageUsage, setStorageUsage] = useState({
    used: 0,
    total: 10,
    percentage: 0
  });
  
  const { user, logout, isAuthenticated, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated && !token) {
      navigate('/login');
      return;
    }

    // Fetch user's files from API
    const fetchFiles = async () => {
      try {
        setLoading(true);
        console.log('Fetching files...');
        const response = await axios.get('/api/files');
        
        if (response.data) {
          console.log('Files fetched successfully:', response.data);
          
          // Transform file data to ensure proper format
          const formattedFiles = response.data.map(file => ({
            ...file,
            id: file._id, // Ensure id is available for the key prop
            name: file.originalName || file.filename || 'Unnamed File',
            size: formatFileSize(file.size || 0),
            uploaded: new Date(file.createdAt).toLocaleString(),
            downloads: file.downloadCount || 0
          }));
          
          setFiles(formattedFiles);
          
          // Calculate storage usage
          const totalSizeInBytes = response.data.reduce((acc, file) => acc + (file.size || 0), 0);
          const usedSizeInGB = totalSizeInBytes / (1024 * 1024 * 1024);
          const totalSizeInGB = 10; // 10GB limit
          const usagePercentage = Math.min(Math.round((usedSizeInGB / totalSizeInGB) * 100), 100);
          
          setStorageUsage({
            used: usedSizeInGB.toFixed(2),
            total: totalSizeInGB,
            percentage: usagePercentage
          });
        }
      } catch (error) {
        console.error('Error fetching files:', error);
        if (error.response) {
          console.error('Server error response:', error.response.data);
        }
        toast.error('Failed to load your files. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [navigate, isAuthenticated, token, refreshTrigger]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Tab switching logic
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // Format file sizes for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle file actions (download, share, etc.)
  const handleFileAction = async (action, file) => {
    if (!file) {
      console.error('No file provided for action:', action);
      return;
    }
    
    console.log('File action:', action, 'for file:', file);
    
    switch (action) {
      case 'download':
        try {
          // Check if shortId exists, otherwise use the right ID format
          const fileIdentifier = file.shortId || file._id || file.id;
          if (!fileIdentifier) {
            throw new Error('Missing file identifier for download');
          }
          
          console.log(`Downloading file with identifier: ${fileIdentifier}`, file);
          
          // Create the download URL
          const baseUrl = '/api/files/download/';
          const downloadUrl = `${baseUrl}${fileIdentifier}`;
          console.log('Download URL:', downloadUrl);
          
          // Show "starting download" toast
          toast.info(`Starting download for ${file.originalName || file.name}...`);
          
          // Initiate the download
          const response = await axios.get(downloadUrl, {
            responseType: 'blob',
            timeout: 30000 // 30 second timeout
          });
          
          // Check if the response is valid
          if (!response.data || response.data.size === 0) {
            throw new Error('Empty file received from server');
          }
          
          // Create a URL for the blob
          const blobUrl = window.URL.createObjectURL(new Blob([response.data], { 
            type: response.headers['content-type'] 
          }));
          
          // Create link element and trigger download
          const link = document.createElement('a');
          link.href = blobUrl;
          link.setAttribute('download', file.originalName || file.name || 'download');
          document.body.appendChild(link);
          
          console.log('Triggering download via link');
          link.click();
          
          // Clean up
          setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(link);
          }, 100);
          
          toast.success(`Downloaded ${file.originalName || file.name}`);
          
          // Update the file list to reflect the new download count
          setFiles(prevFiles => 
            prevFiles.map(f => {
              if ((f.id === file.id) || (f._id === file._id) || (f.shortId === file.shortId)) {
                const downloads = (f.downloadCount || f.downloads || 0) + 1;
                return { ...f, downloads, downloadCount: downloads };
              }
              return f;
            })
          );
        } catch (error) {
          console.error('Download error:', error);
          if (error.response) {
            console.error('Download response error:', error.response.status, error.response.data);
          }
          toast.error(`Failed to download file: ${error.message || 'Unknown error'}`);
        }
        break;
        
      case 'link':
      case 'qrcode':
      case 'email':
        setSelectedFile(file);
        setShareMethod(action);
        setShowShareModal(true);
        break;
      
      case 'delete':
        handleDeleteFile(file);
        break;
        
      default:
        console.error('Unknown action:', action);
    }
  };

  // Handle closing the share modal
  const handleCloseShareModal = () => {
    setShowShareModal(false);
    setSelectedFile(null);
    setShareMethod(null);
  };

  // Handle sharing the file via the selected method
  const handleShareFile = async (file, method, params = {}) => {
    try {
      if (!file || !file._id) {
        console.error('Invalid file for sharing:', file);
        return;
      }
      
      const response = await axios.post(`/api/files/${file._id}/share`, {
        method: method,
        ...params
      });
      
      if (response.data) {
        toast.success(`File shared via ${method} successfully!`);
        // Return the share data from the server
        return response.data;
      }
    } catch (error) {
      console.error(`Error sharing file via ${method}:`, error);
      toast.error(`Failed to share file via ${method}`);
      return null;
    }
  };

  const handleDeleteFile = async (file) => {
    if (!file || !file._id) {
      console.error('Invalid file for deletion:', file);
      return;
    }
    
    try {
      // Call the API to delete the file
      await axios.delete(`/api/files/${file._id}`);
      
      // Update the UI by removing the file from state
      setFiles(files.filter(f => f._id !== file._id));
      
      toast.success(`${file.originalName || file.name} has been deleted`);
      
      // Refresh file list to get updated storage usage
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  // Handle file uploaded callback
  const handleFileUploaded = (uploadedFile) => {
    if (!uploadedFile) {
      console.error('No file data received from upload');
      return;
    }
    
    console.log('File uploaded successfully:', uploadedFile);
    
    // Format the uploaded file to match the expected format
    const formattedFile = {
      ...uploadedFile,
      id: uploadedFile._id,
      name: uploadedFile.originalName || uploadedFile.filename || 'Unnamed File',
      size: formatFileSize(uploadedFile.size || 0),
      uploaded: new Date(uploadedFile.createdAt).toLocaleString(),
      downloads: uploadedFile.downloadCount || 0
    };
    
    // Add the new file to the files array
    setFiles(prevFiles => [formattedFile, ...prevFiles]);
    
    // Switch to the "My Files" tab to show the uploaded file
    setActiveTab('files');
    
    // Update storage usage
    const usedSizeInGB = parseFloat(storageUsage.used) + (uploadedFile.size / (1024 * 1024 * 1024));
    const usagePercentage = Math.min(Math.round((usedSizeInGB / storageUsage.total) * 100), 100);
    
    setStorageUsage({
      used: usedSizeInGB.toFixed(2),
      total: storageUsage.total,
      percentage: usagePercentage
    });
    
    toast.success(`File "${formattedFile.name}" uploaded successfully!`);
  };

  return (
    <div className="quanta-dashboard">
      <header className="quanta-header">
        <div className="quanta-logo">
          <span className="logo-text">Quanta Share</span>
        </div>
        
        <div className="storage-indicator">
          <div className="storage-icon">
            <FiHardDrive />
          </div>
          <div className="storage-details">
            <div className="storage-bar">
              <div 
                className="storage-used" 
                style={{ width: `${storageUsage.percentage}%` }}
              ></div>
            </div>
            <div className="storage-text">
              {storageUsage.used} GB / {storageUsage.total} GB used
            </div>
          </div>
        </div>
        
        <div className="quanta-user-section">
          {user && (
            <div className="quanta-user">
              <div className="user-avatar">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
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
      
      <div className="quanta-main">
        <div className="quanta-tabs">
          <button 
            className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <FiUploadCloud className="tab-icon" />
            <span className="tab-text">Upload</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => setActiveTab('files')}
          >
            <FiFolder className="tab-icon" />
            <span className="tab-text">My Files</span>
          </button>
        </div>
        
        <div className="quanta-content">
          {activeTab === 'upload' ? (
            <QuantaFileUploader onFileUploaded={handleFileUploaded} />
          ) : (
            <div className="file-list-wrapper" style={{ position: 'relative', zIndex: 1 }}>
              <QuantaFileList 
                files={files || []} // Ensure files is always an array
                loading={loading} 
                onFileAction={handleFileAction} 
              />
            </div>
          )}
        </div>
      </div>
      
      <footer className="quanta-footer">
        <div className="footer-content">
          <p className="copyright-text">© 2025 Quanta Share. All rights reserved.</p>
        </div>
      </footer>
      
      {/* Share Modal */}
      {showShareModal && selectedFile && (
        <QuantaShareModal
          file={selectedFile}
          method={shareMethod}
          onClose={handleCloseShareModal}
          onDownload={() => handleFileAction('download', selectedFile)}
        />
      )}
    </div>
  );
};

export default QuantaDashboardV2;
