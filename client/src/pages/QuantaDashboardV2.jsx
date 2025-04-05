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
import { Clipboard } from "lucide-react"; 
import {QRCodeCanvas} from "qrcode.react";
import EmailService  from "../emailService/emailServices"


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
        // console.log('Fetching files...');
        const response = await axios.get('/api/files');
        
        if (response.data) {
          console.log('Files fetched successfully:', response.data);
          // response.data.map(file => {console.log(file.name,":", file.size)})

          // Transform file data to ensure proper format
          const formattedFiles = response.data.map(file => ({
            ...file,
            id: file.id, // Ensure id is available for the key prop
            name:  file.name || undefined ,
            size: formatFileSize(file.size || 0),
            uploaded: file.createdTime || new Date(file.createdAt).toLocaleString(),
            downloads: file.downloadCount || 0
          }));
          
          setFiles(formattedFiles);
          // console.log("formatedFiles :" ,formattedFiles)
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
        // console.error('Error fetching files:', error);
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
      // console.error('No file provided for action:', action);
      return;
    }
    
    // console.log('File action -> ', action, 'for file:', file);
    
    switch (action) {
      case 'download':
        try {
          // Check if shortId exists, otherwise use the right ID format
          const fileId = file.id;
          // console.log("id : ", fileId)
          if (!fileId) {
            throw new Error('Missing file identifier for download');
          }
          
          // console.log(`Downloading file with identifier: ${fileId}`, file);

          const response = await axios.get(`/api/files/download/${fileId}`);
          // console.log("response : ", response);
          const downloadLink = response.data.downloadLink;
          // console.log("downlodLink : ", downloadLink);
        
          if (downloadLink) {
            const link = document.createElement('a');
            link.href = downloadLink;
            link.setAttribute('download', 'download'); // Or use file.originalName from the database if you send it.
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            // console.error("Download link not found in response");
            alert("Download link not found");
          }
          
          // Show "starting download" toast
          toast.info(`Starting download for ${file.originalName || file.name}...`);
          
          
         // Update the file list to reflect the new download count
        //  console.log("files ->  ",files)
          setFiles(prevFiles => 
            prevFiles.map(f => {
              if ((f.id === file.id) || (f._id === file._id) || (f.shortId === file.shortId)) {
              // console.log("prevFiles : ",f.downloadCount)
                const downloads = (f.downloadCount || f.downloads || 0) + 1;
                return { ...f, downloads, downloadCount: downloads };
              }
              return f;
            })
          );
        } catch (error) {
          // console.error('Download error:', error);
          if (error.response) {
            console.error('Download response error:', error.response.status, error.response.data);
          }
          toast.error(`Failed to download file: ${error.message || 'Unknown error'}`);
        }
        break;
        
      case 'link':{
        // console.log(action)
             handleShareFile(file, action);
          }
        break;
      case 'qrcode': {
        // console.log(action)
        handleQrCode(file)
      }
      break;
      case 'email':
        // console.log(action);
        handleEmail(file);
        break;
      
      case 'delete':
        handleDeleteFile(file);
        // console.log("fff,", file.id)
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

 const handleEmail = async(file) =>{
    
      const userEmail = user.email;
      // console.log("Fileeee : ", file);
      // console.log("Fileeee : ", file.mimeType);
      // console.log("User Email: ", userEmail);
      // console.log("Is Instance of File?", file instanceof File);
    
      let emailToSend = "";
      let messageToSend = "";
    
      const sendEmail = async (event) => {
        event.preventDefault();
    
        if (!emailToSend || !messageToSend) {
          toast.error("Please fill in both fields.");
          return;
        }
    
        
          // console.log("UemailToSend ", emailToSend);
          // console.log("messageToSend ", messageToSend);
          // console.log("file ", file.name);

        const formData = new FormData();

        formData.append("from", userEmail);
        formData.append("to", emailToSend);
        formData.append("text", messageToSend);
        formData.append("fileLink",  file.webContentLink);
        formData.append("fileType",  file.mimeType);
        formData.append("fileName",  file.name);
        
        try {
          toast.info(`Email sending to ${emailToSend}`)
            const response = await axios.post('/api/files/email', formData, {
              headers : {
                "Content-Type" : "multipart/form-data",
              }
            })
          
            
              // console.log("ress : ", response)
            if (response.data.success) {
                toast.success("Email sent successfully!");
            } else {
                toast.error("Failed to send Email!");
            }
            
        } catch (error) {
          console.error("Email ErroR:", error);
          toast.error("Failed to send email.");
        }
      };
      toast.info(
        <form>
          <div style={{color:"black"}}>
            <h2><b>Send Email</b></h2>
            <br/>
            <div className="email">
          <input 
            type="text" 
            placeholder="Emailaddress to send.." 
            onChange={(e) => (emailToSend = e.target.value)} 
          />
        </div>
        <div className="text">
          <input 
            type="text" 
            placeholder="Write message" 
            onChange={(e) => (messageToSend = e.target.value)} 
          />
        </div>
        <button 
          className="sendEmail" 
          type="submit" 
          onClick={sendEmail} 
          style={{ 
            size: "10px", 
            marginLeft: "5px", 
            padding: "3px", 
            color: "white", 
            backgroundColor: "#4362EE", 
            border: "none" 
          }}
        >
          Send
        </button>

          </div>
          </form>,
        { icon: false,
          position: "top-center",
          autoClose: false, 
          closeOnClick: false, 
        }
      )
      
 }

  const handleQrCode = async(file) => {
    const link = file.webViewLink;
    toast.info(
        <div style={{ textAlign: "center", padding: "20px" }}>
          <h2>QR Code for file</h2>
          <br />
          <div  style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              width: "100%",
              marginBottom: "10px",
            }}
          >
            {link && (
            <QRCodeCanvas value={link} size={150} bgColor="#ffffff" fgColor="#000000" />
            )}
          </div>  
        </div>,
        { icon: false,
          position: "top-center",
          autoClose: true,
          closeOnClick: false,
        }
    )
  }



  // Handle sharing the file via the selected method
  const handleShareFile = async (file, method, params = {}) => {
    try {
      // console.log("share link : ",file.webViewLink)
      if (!file) {
        // console.error('Invalid file for sharing:', file);
        return;
      }
      const link = file.webViewLink;
      navigator.clipboard.writeText(link); 

      toast.info(
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div>
            <p>Share Link!</p>
            <input
              type="text"
              value={link}
              readOnly
          
              style={{  
                flex: 1, 
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                backgroundColor: "#f8f8f8",
                fontSize: "14px",
              }}
              onClick={(e) => e.target.select()}
            />
          </div>
          <div style={{paddingTop : "5px"}}>
            <button style={{
            border: "1px solid #ccc",
            padding: "6px",
            borderRadius:"6px"
            }}
              onClick={() => {
                navigator.clipboard.writeText(link);
                toast.success("Copied!");
              }}
              className="p-1 bg-blue-500 text-white rounded"
            >
              <Clipboard size={18} />
            </button>
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: true, 
          closeOnClick: false, 
        }
      );
    
      toast.success(`Link generated for share file!`);

    } catch (error) {
      console.error(`Error sharing file via ${method}:`, error);
      toast.error(`Failed to share file via ${method}`);
      return null;
    }
  };

  const handleDeleteFile = async (file) => {
    
    try {
      // Call the API to delete the file
      // console.log("file-id :", file.id)

      const res = await axios.delete(`/api/files/${file.id}`);
      // console.log("res of delete file int frontend :", res)

      // Update the UI by removing the file from state
      setFiles(files.filter(f => f._id !== file._id));
      
      toast.success(`${file.originalName || file.name} has been deleted`);
      
      // Refresh file list to get updated storage usage
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      // console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  // Handle file uploaded callback
  const handleFileUploaded = (uploadedFile) => {
    if (!uploadedFile) {
      console.error('No file data received from upload');
      return;
    }
    // console.log("starting uploadd in frontend");
    // console.log(uploadedFile)
    // console.log('originalName:', uploadedFile.originalName);
    // console.log('name:', uploadedFile.name);
    // console.log('name:', typeof(uploadedFile));
    // console.log('File uploaded successfullyyyyy:', uploadedFile.name);
    
    // Format the uploaded file to match the expected format
    const formattedFile = {
      ...uploadedFile,
      id: uploadedFile._id,
      name: uploadedFile.originalName || uploadedFile.name || 'Unnamed File',
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
