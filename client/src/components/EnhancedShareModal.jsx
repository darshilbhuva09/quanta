import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiX, FiCopy, FiMail, FiLink, FiHash, FiDownload } from 'react-icons/fi';
import './enhanced-styles.css'; // We'll use the same new CSS file

const EnhancedShareModal = ({ fileId, fileName, method, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [shareData, setShareData] = useState(null);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Increased max file size to 200MB
  const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB in bytes

  useEffect(() => {
    const generateShareData = async () => {
      if (!fileId || !method) return;
      
      try {
        setLoading(true);
        
        // For email method, we don't need to make an API call yet
        if (method === 'email') {
          setShareData({ method });
          setLoading(false);
          return;
        }
        
        // For link and qrcode methods, make API call
        const res = await fetch(`/api/files/${fileId}/share`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          },
          body: JSON.stringify({ method })
        });
        
        if (!res.ok) {
          throw new Error('Failed to generate share data');
        }
        
        const data = await res.json();
        setShareData(data);
      } catch (err) {
        toast.error(err.message || 'Error generating share data');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    
    generateShareData();
  }, [fileId, method, onClose]);

  const handleCopyLink = () => {
    if (!shareData?.downloadUrl) return;
    
    navigator.clipboard.writeText(shareData.downloadUrl)
      .then(() => {
        setCopied(true);
        toast.success('Link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => toast.error('Failed to copy link'));
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
      
      const res = await fetch(`/api/files/${fileId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ 
          method: 'email',
          recipient: email
        })
      });
      
      if (!res.ok) {
        throw new Error('Failed to send email');
      }
      
      toast.success('File shared via email successfully');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Error sending email');
    } finally {
      setSending(false);
    }
  };

  const getModalIcon = () => {
    switch(method) {
      case 'link':
        return <FiLink className="enhanced-modal-method-icon" />;
      case 'qrcode':
        return <FiHash className="enhanced-modal-method-icon" />;
      case 'email':
        return <FiMail className="enhanced-modal-method-icon" />;
      default:
        return null;
    }
  };

  return (
    <div className="enhanced-modal-overlay">
      <div className="enhanced-modal-content">
        <div className="enhanced-modal-header">
          <div className="enhanced-modal-title-container">
            {getModalIcon()}
            <h3 className="enhanced-modal-title">
              {method === 'link' && 'Share via Link'}
              {method === 'qrcode' && 'Share via QR Code'}
              {method === 'email' && 'Share via Email'}
            </h3>
          </div>
          <button className="enhanced-modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>
        
        <div className="enhanced-modal-body">
          {loading ? (
            <div className="enhanced-modal-loading">
              <div className="enhanced-loading-spinner"></div>
              <p>Generating share options...</p>
            </div>
          ) : (
            <>
              <div className="enhanced-file-being-shared">
                <div className="enhanced-file-icon-small">
                  <FiDownload />
                </div>
                <p>{fileName}</p>
              </div>
              
              {method === 'link' && shareData?.downloadUrl && (
                <div className="enhanced-share-link-container">
                  <p className="enhanced-share-instructions">Share this link with others to download the file:</p>
                  <div className="enhanced-share-link-box">
                    <input 
                      type="text" 
                      value={shareData.downloadUrl} 
                      readOnly 
                      className="enhanced-share-link-input"
                    />
                    <button 
                      className={`enhanced-share-link-copy ${copied ? 'copied' : ''}`} 
                      onClick={handleCopyLink}
                    >
                      {copied ? 'Copied!' : <FiCopy />}
                    </button>
                  </div>
                </div>
              )}
              
              {method === 'qrcode' && shareData?.qrCode && (
                <div className="enhanced-qr-container">
                  <p className="enhanced-share-instructions">Scan this QR code to download the file:</p>
                  <div className="enhanced-qr-code">
                    <img src={shareData.qrCode} alt="QR Code" />
                  </div>
                  <button className="enhanced-copy-link-button" onClick={handleCopyLink}>
                    <FiCopy />
                    <span>Copy Download Link</span>
                  </button>
                </div>
              )}
              
              {method === 'email' && (
                <div className="enhanced-email-container">
                  <p className="enhanced-share-instructions">Enter the recipient's email address:</p>
                  <form onSubmit={handleSendEmail} className="enhanced-email-form">
                    <div className="enhanced-form-group">
                      <div className="enhanced-email-input-container">
                        <FiMail className="enhanced-email-icon" />
                        <input
                          type="email"
                          placeholder="recipient@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="enhanced-email-input"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      className="enhanced-send-email-button"
                      disabled={sending}
                    >
                      {sending ? 'Sending...' : 'Send Email'}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="enhanced-modal-footer">
          <button className="enhanced-modal-cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedShareModal;