import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiX, FiCopy, FiMail } from 'react-icons/fi';
import './styles.css'; // Import the new styles

const ShareModal = ({ fileId, fileName, method, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [shareData, setShareData] = useState(null);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

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
      .then(() => toast.success('Link copied to clipboard'))
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

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">
            {method === 'link' && 'Share via Link'}
            {method === 'qrcode' && 'Share via QR Code'}
            {method === 'email' && 'Share via Email'}
          </h3>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>
        
        <div className="modal-body">
          {loading ? (
            <div className="loading-container" style={{ height: '100px' }}>
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <>
              <div className="file-info-modal">
                <p>File: <strong>{fileName}</strong></p>
              </div>
              
              {method === 'link' && shareData?.downloadUrl && (
                <div className="share-link-container">
                  <p>Share this link with others:</p>
                  <div className="share-link-box">
                    <input 
                      type="text" 
                      value={shareData.downloadUrl} 
                      readOnly 
                      className="share-link-input"
                    />
                    <button className="share-link-copy" onClick={handleCopyLink}>
                      <FiCopy />
                    </button>
                  </div>
                </div>
              )}
              
              {method === 'qrcode' && shareData?.qrCode && (
                <div className="qr-container">
                  <p>Scan this QR code to download:</p>
                  <div className="qr-code">
                    <img src={shareData.qrCode} alt="QR Code" />
                  </div>
                  <button className="btn btn-primary" onClick={handleCopyLink}>
                    Copy Link
                  </button>
                </div>
              )}
              
              {method === 'email' && (
                <div className="email-container">
                  <p>Send via email:</p>
                  <form onSubmit={handleSendEmail}>
                    <div className="form-group">
                      <label htmlFor="email">Recipient Email</label>
                      <div className="email-input-container">
                        <FiMail className="email-icon" />
                        <input
                          type="email"
                          id="email"
                          placeholder="Enter recipient's email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
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
        
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
