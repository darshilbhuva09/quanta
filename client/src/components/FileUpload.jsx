import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { FiUploadCloud, FiLink, FiMail, FiHash, FiFile, FiX } from 'react-icons/fi';
import ShareModal from './ShareModal';
import './styles.css'; // Import the new styles

const FileUpload = ({ onFileUploaded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareMethod, setShareMethod] = useState(null);
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
      // Simulate progress (in a real app, you'd use XMLHttpRequest with progress event)
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
      const data = await res.json();
      // console.log("dataaaaa :" , data);
      setUploadedFile(data);
      toast.success('File uploaded successfully!');
      
      if (onFileUploaded) {
        onFileUploaded();
      }
    } catch (err) {
      toast.error(err.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleShareOption = (method) => {
    setShareMethod(method);
    setShowShareModal(true);
  };

  const handleCloseModal = () => {
    setShowShareModal(false);
  };

  const resetUpload = () => {
    setFile(null);
    setUploadedFile(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="upload-container">
      {!uploadedFile ? (
        <>
          <div 
            className={`upload-area ${isDragging ? 'dragging' : ''}`}
            onClick={() => !file && fileInputRef.current.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!file ? (
              <>
                <div className="upload-icon">
                  <FiUploadCloud />
                </div>
                <h3 className="upload-text">
                  Drag & drop a file or click to browse
                </h3>
                <p>Max file size: 200MB</p>
              </>
            ) : (
              <div className="selected-file">
                <div className="file-icon">
                  <FiFile />
                </div>
                <div className="file-details">
                  <div className="file-name">{file.name}</div>
                  <div className="file-size">{formatFileSize(file.size)}</div>
                </div>
                <button className="remove-file-btn" onClick={(e) => { e.stopPropagation(); removeFile(); }}>
                  <FiX />
                </button>
              </div>
            )}

            <input 
              type="file" 
              className="upload-input" 
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </div>

          {file && !uploading && (
            <button 
              className="btn btn-primary upload-btn" 
              onClick={handleUpload}
            >
              Upload File
            </button>
          )}

          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p>Uploading: {progress}%</p>
            </div>
          )}
        </>
      ) : (
        <div className="upload-success">
          <h3>File Uploaded Successfully!</h3>
          <div className="file-info-card">
            <FiFile className="file-icon" />
            <div>
              <p className="file-name">{uploadedFile.originalName}</p>
              <p className="file-size">{formatFileSize(uploadedFile.size)}</p>
            </div>
          </div>
          
          <div className="share-options-container">
            <h4>Share your file:</h4>
            <div className="share-options">
              <div className="share-option" onClick={() => handleShareOption('link')}>
                <FiLink className="share-icon" />
                <span>Link</span>
              </div>
              
              <div className="share-option" onClick={() => handleShareOption('qrcode')}>
                <FiHash className="share-icon" />
                <span>QR Code</span>
              </div>
              
              <div className="share-option" onClick={() => handleShareOption('email')}>
                <FiMail className="share-icon" />
                <span>Email</span>
              </div>
            </div>
          </div>
          
          <button 
            className="btn btn-primary" 
            onClick={resetUpload}
          >
            Upload Another File
          </button>
        </div>
      )}
      
      {/* Add null check for uploadedFile before accessing its properties */}
      {showShareModal && uploadedFile && (
        <ShareModal 
          fileId={uploadedFile._id}
          fileName={uploadedFile.originalName}
          method={shareMethod}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default FileUpload;
