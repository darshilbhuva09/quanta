import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { FiUploadCloud, FiFile, FiX } from 'react-icons/fi';
import axios from 'axios';
import './quanta-share-styles.css';

const QuantaFileUploader = ({ onFileUploaded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Increased max file size to 200MB (matches server configuration)
  const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB in bytes
  
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast.error('File is too large. Maximum size is 200MB.');
        return;
      }
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
      // Check file size
      if (droppedFile.size > MAX_FILE_SIZE) {
        toast.error('File is too large. Maximum size is 200MB.');
        return;
      }
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
    console.log("ffffffile : ", file)
    if (!file) {
      return toast.error('Please select a file to upload');
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    console.log("formDataaaaaaaaaaa :", formData.get('file'))

    setUploading(true);
    setProgress(0);

    try {
      // Set up upload with progress tracking
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 150);

      // Real API call to upload the file
      const response = await axios.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
          if (percentCompleted === 100) {
            clearInterval(progressInterval);
          }
        }
      });

      clearInterval(progressInterval);
      setProgress(100);
      console.log("responseeeee :" , response.data.fileData)
      
      toast.success('File uploaded successfully!');
      
      // Pass the uploaded file data back to the parent component
      if (onFileUploaded && response.data) {
        onFileUploaded(response.data.fileData);
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
      const errorMessage = err.response?.data?.message || 'Error uploading file';
      toast.error(errorMessage);
      console.error('Upload error:', err);
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
    <div className="qs-upload-container">
      <div 
        className={`qs-upload-area ${isDragging ? 'dragging' : ''}`}
        onClick={() => !file && fileInputRef.current.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!file ? (
          <>
            <div className="qs-upload-icon">
              <FiUploadCloud />
            </div>
            <h3 className="qs-upload-text">
              Drag & drop a file or <span className="qs-browse-text">browse</span>
            </h3>
            <p className="qs-upload-subtext">Max file size: 200MB</p>
          </>
        ) : (
          <div className="qs-selected-file">
            <div className="qs-file-preview">
              <FiFile className="qs-file-type-icon" />
            </div>
            <div className="qs-file-info">
              <div className="qs-file-name-container">
                <h4 className="qs-file-name">{file.name}</h4>
                <button className="qs-remove-file" onClick={(e) => { e.stopPropagation(); removeFile(); }}>
                  <FiX />
                </button>
              </div>
              <p className="qs-file-size">{formatFileSize(file.size)}</p>
              {!uploading && (
                <button 
                  className="qs-upload-button"
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
          <div className="qs-upload-progress">
            <div className="qs-progress-bar">
              <div 
                className="qs-progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="qs-uploading-text">Uploading: {progress}%</p>
          </div>
        )}

        <input 
          type="file" 
          className="qs-upload-input" 
          onChange={handleFileChange}
          ref={fileInputRef}
        />
      </div>
    </div>
  );
};

export default QuantaFileUploader;