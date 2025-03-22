import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Auth from './pages/Auth';
import QuantaDashboardV2 from './pages/QuantaDashboardV2';

// Context
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// CSS
import './App.css';

/**
 * This is an alternative entry point for the Quanta Share application
 * that uses the QuantaDashboardV2 component.
 * 
 * To use this file:
 * 1. In your index.js, import this component instead of App.js
 * 2. Example: import App from './QuantaApp';
 */
function QuantaApp() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <QuantaDashboardV2 />
                </PrivateRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/auth" />} />
          </Routes>
          <ToastContainer position="bottom-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default QuantaApp;