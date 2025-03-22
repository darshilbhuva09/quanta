import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './styles.css'; // Import the styles

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, token } = useContext(AuthContext);
  const [isChecking, setIsChecking] = useState(true);

  // Debug logs
  console.log('PrivateRoute - isAuthenticated:', isAuthenticated);
  console.log('PrivateRoute - loading:', loading);
  console.log('PrivateRoute - token exists:', !!token);

  useEffect(() => {
    // Quick check for token existence to avoid unnecessary loading
    if (!token) {
      console.log('PrivateRoute - No token, redirecting to login');
      setIsChecking(false);
      return;
    }

    // Only wait for loading if we have a token
    if (!loading) {
      console.log('PrivateRoute - Auth check complete');
      setIsChecking(false);
    }
  }, [loading, token]);

  // Show a minimal loading indicator only if we're actually checking auth
  if (isChecking) {
    console.log('PrivateRoute - Still checking auth...');
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  console.log('PrivateRoute - Auth check result:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
  
  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    console.log('PrivateRoute - Redirecting to login page');
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated, render the protected component
  console.log('PrivateRoute - Rendering protected component');
  return children;
};

export default PrivateRoute;
