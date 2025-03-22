import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiX, FiCopy, FiMail, FiFile, FiDownload } from 'react-icons/fi';
import axios from 'axios';
import './quanta-modal-styles.css'; // Using the separate modal styles

const QuantaShareModal = ({ file, method, onClose, onDownload }) => {
  const [loading, setLoading] = useState(true);
  const [shareData, setShareData] = useState(null);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const generateShareData = async () => {
      if (!file || !file._id || !method) return;
      
      try {
        setLoading(true);
        
        // For email method, we don't need to make an API call yet
        if (method === 'email') {
          setShareData({ method });
          setLoading(false);
          return;
        }
        
        // Make API request to generate share data
        const response = await axios.post(`/api/files/${file._id}/share`, {
          method
        });
        
        if (response.data) {
          // For link sharing
          if (method === 'link') {
            const downloadUrl = `/api/files/download/${response.data.shortId}`;
            const fullUrl = window.location.origin + downloadUrl;
            
            setShareData({
              method,
              shortId: response.data.shortId,
              downloadUrl,
              fullUrl
            });
          } 
          // For QR code sharing
          else if (method === 'qrcode') {
            setShareData({
              method,
              shortId: response.data.shortId,
              qrCode: response.data.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + `/api/files/download/${response.data.shortId}`)}`
            });
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error generating share data:', err);
        toast.error(err.response?.data?.message || 'Error generating share data');
        onClose();
      }
    };
    
    generateShareData();
  }, [file, method, onClose]);

  const handleCopyLink = () => {
    if (!shareData?.fullUrl) return;
    
    navigator.clipboard.writeText(shareData.fullUrl)
      .then(() => {
        setCopied(true);
        toast.success('Link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => toast.error('Failed to copy link'));
  };

  const handleDownloadFromModal = () => {
    if (onDownload && file) {
      onDownload(file);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    
    if (!email) {
      return toast.error('Please enter an email address');
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return toast.error('Please enter a valid email address');
    }
    
    try {
      setSending(true);
      
      // Make API call to share via email
      const response = await axios.post(`/api/files/${file._id}/share`, { 
        method: 'email',
        recipient: email
      });
      
      toast.success('File shared via email successfully');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="qs-modal-overlay">
      <div className="qs-modal-content">
        <div className="qs-modal-header">
          <h3 className="qs-modal-title">
            {method === 'link' && 'Share via Link'}
            {method === 'qrcode' && 'Share via QR Code'}
            {method === 'email' && 'Share via Email'}
          </h3>
          <button className="qs-modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>
        
        <div className="qs-modal-body">
          {loading ? (
            <div className="qs-modal-loading">
              <div className="qs-spinner"></div>
              <p>Generating share options...</p>
            </div>
          ) : (
            <>
              <div className="qs-file-being-shared">
                <div className="qs-file-icon-small">
                  <FiFile className="qs-file-type-icon" />
                </div>
                <p className="qs-file-name-shared">{file?.originalName || file?.name}</p>
              </div>
              
              {method === 'link' && shareData?.fullUrl && (
                <div className="qs-share-link-container">
                  <p className="qs-share-instructions">Share this link with others to download the file:</p>
                  <div className="qs-share-link-box">
                    <input 
                      type="text" 
                      value={shareData.fullUrl} 
                      readOnly 
                      className="qs-share-link-input"
                    />
                    <button 
                      className={`qs-share-link-copy ${copied ? 'copied' : ''}`} 
                      onClick={handleCopyLink}
                    >
                      {copied ? 'Copied!' : <FiCopy />}
                    </button>
                  </div>
                  <button 
                    className="qs-download-button" 
                    onClick={handleDownloadFromModal}
                    style={{
                      marginTop: '15px',
                      backgroundColor: '#4361ee',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 15px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      width: '100%',
                      justifyContent: 'center'
                    }}
                  >
                    <FiDownload />
                    <span>Download File</span>
                  </button>
                </div>
              )}
              
              {method === 'qrcode' && shareData?.qrCode && (
                <div className="qs-qr-container">
                  <p className="qs-share-instructions">Scan this QR code to download the file:</p>
                  <div className="qs-qr-code">
                    <img src={shareData.qrCode} alt="QR Code" />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <button className="qs-copy-link-button" onClick={handleCopyLink} style={{ flex: 1 }}>
                      <FiCopy />
                      <span>Copy Link</span>
                    </button>
                    <button 
                      className="qs-download-button" 
                      onClick={handleDownloadFromModal}
                      style={{
                        flex: 1,
                        backgroundColor: '#4361ee',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        justifyContent: 'center'
                      }}
                    >
                      <FiDownload />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              )}
              
              {method === 'email' && (
                <form className="qs-email-form" onSubmit={handleSendEmail}>
                  <p className="qs-share-instructions">Enter recipient's email address:</p>
                  <div className="qs-email-input-container">
                    <div className="qs-email-input-wrapper">
                      <FiMail className="qs-email-icon" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="qs-email-input"
                        disabled={sending}
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="qs-send-email-button"
                    disabled={sending}
                  >
                    {sending ? (
                      <>
                        <div className="qs-spinner-small"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <FiMail />
                        <span>Send Email</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuantaShareModal;
