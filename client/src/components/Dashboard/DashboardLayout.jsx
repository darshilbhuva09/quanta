import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine which navigation item is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="logo">
          <h1>Quanta Share</h1>
        </div>
        
        <nav className="main-nav">
          <ul>
            <li>
              <button 
                className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={() => navigate('/dashboard')}
              >
                <i className="fa fa-home"></i>
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${isActive('/dashboard/files') ? 'active' : ''}`}
                onClick={() => navigate('/dashboard/files')}
              >
                <i className="fa fa-file"></i>
                <span>My Files</span>
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${isActive('/dashboard/upload') ? 'active' : ''}`}
                onClick={() => navigate('/dashboard/upload')}
              >
                <i className="fa fa-upload"></i>
                <span>Upload</span>
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${isActive('/dashboard/shared') ? 'active' : ''}`}
                onClick={() => navigate('/dashboard/shared')}
              >
                <i className="fa fa-share-alt"></i>
                <span>Shared</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      
      <main className="content-area">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;