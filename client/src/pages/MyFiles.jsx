import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import FilesList from '../components/Dashboard/FilesList';
import AuthContext from '../context/AuthContext';
import './MyFiles.css';

const MyFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/files', {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });
      
      setFiles(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to load files. Please try again.');
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    // Additional logic for file selection (preview, download options, etc.)
  };

  return (
    <DashboardLayout>
      <div className="my-files-page">
        <div className="page-header">
          <h1>My Files</h1>
          <button className="upload-btn" onClick={() => window.location.href = '/dashboard/upload'}>
            <i className="fa fa-upload"></i> Upload New File
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Loading your files...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchFiles}>Try Again</button>
          </div>
        ) : (
          <FilesList 
            files={files} 
            onFileSelect={handleFileSelect} 
          />
        )}

        {selectedFile && (
          <div className="file-preview-modal">
            {/* File preview and actions would go here */}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyFiles;