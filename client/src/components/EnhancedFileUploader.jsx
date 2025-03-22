import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { FiUploadCloud, FiFile, FiX } from 'react-icons/fi';
import './enhanced-styles.css';

const EnhancedFileUploader = ({ onFileUploaded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (!file) {
      return toast.error('Please select a file to upload');
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);

      // Upload file
      const res = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          'x-auth-token': localStorage.getItem('token')
        },
        body: formData
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error uploading file');
      }

      setProgress(100);
      toast.success('File uploaded successfully!');
      
      if (onFileUploaded) {
        onFileUploaded();
      }
      
      // Reset after successful upload
      setTimeout(() => {
        setFile(null);
        setProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 1500);
    } catch (err) {
      toast.error(err.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="enhanced-upload-container">
      <div 
        className={`enhanced-upload-area ${isDragging ? 'dragging' : ''}`}
        onClick={() => !file && fileInputRef.current.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!file ? (
          <>
            <div className="enhanced-upload-icon">
              <FiUploadCloud />
            </div>
            <h3 className="enhanced-upload-text">
              Drag & drop a file or <span className="browse-text">browse</span>
            </h3>
            <p className="enhanced-upload-subtext">Max file size: 10MB</p>
          </>
        ) : (
          <div className="enhanced-selected-file">
            <div className="enhanced-file-preview">
              <FiFile className="enhanced-file-type-icon" />
            </div>
            <div className="enhanced-file-info">
              <div className="enhanced-file-name-container">
                <h4 className="enhanced-file-name">{file.name}</h4>
                <button className="enhanced-remove-file" onClick={(e) => { e.stopPropagation(); removeFile(); }}>
                  <FiX />
                </button>
              </div>
              <p className="enhanced-file-size">{formatFileSize(file.size)}</p>
              {!uploading && (
                <button 
                  className="enhanced-upload-button"
                  onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                >
                  <span>Upload</span>
                  <FiUploadCloud />
                </button>
              )}
            </div>
          </div>
        )}

        {uploading && (
          <div className="enhanced-upload-progress">
            <div className="enhanced-progress-bar">
              <div 
                className="enhanced-progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="enhanced-uploading-text">Uploading: {progress}%</p>
          </div>
        )}

        <input 
          type="file" 
          className="enhanced-upload-input" 
          onChange={handleFileChange}
          ref={fileInputRef}
        />
      </div>
    </div>
  );
};

export default EnhancedFileUploader;
