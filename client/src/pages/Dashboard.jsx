import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import EnhancedFileUploader from '../components/EnhancedFileUploader';
import FilesList from '../components/FilesList';
import './Dashboard.css'; // Make sure we have styles for the dashboard

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [error, setError] = useState(null);
  
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Debug log to check if component is rendering
  console.log('Dashboard rendering, user:', user);

  useEffect(() => {
    // Fetch user's files
    const fetchFiles = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching files...');
        
        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);
        
        if (!token) {
          console.log('No token found, redirecting to auth');
          logout();
          navigate('/auth');
          return;
        }

        const res = await fetch('/api/files', {
          headers: {
            'x-auth-token': token
          }
        });
        
        console.log('API response status:', res.status);
        
        if (res.status === 401) {
          // Token expired or invalid
          console.log('Unauthorized, redirecting to auth');
          logout();
          navigate('/auth');
          return;
        }
        
        const data = await res.json();
        console.log('Files fetched:', data.length);
        setFiles(data);
      } catch (err) {
        console.error('Error fetching files:', err);
        setError('Failed to load files. Please try again later.');
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
    console.log('Logging out...');
    logout();
    navigate('/auth'); // Changed from '/login' to '/auth'
  };

  // If there's no user, show a message
  if (!user) {
    console.log('No user found in context');
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <a href="/dashboard" className="dashboard-logo">Quanta Share</a>
        <div className="dashboard-nav">
          {user && <span>Welcome, {user.username}</span>}
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>
      
      <div className="dashboard-content">
        <div className="dashboard-tabs">
          <div 
            className={`dashboard-tab ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload
          </div>
          <div 
            className={`dashboard-tab ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => setActiveTab('files')}
          >
            My Files
          </div>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {activeTab === 'upload' ? (
          <EnhancedFileUploader onFileUploaded={refreshFiles} />
        ) : (
          <FilesList files={files} loading={loading} onFileAction={refreshFiles} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
