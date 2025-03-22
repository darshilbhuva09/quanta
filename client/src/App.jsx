import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Auth from './pages/Auth';
import Login from './pages/Login';
import Register from './pages/Register';
import QuantaDashboardV2 from './pages/QuantaDashboardV2';

// Context
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// CSS
import './App.css';
import './Auth.css';

function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <Router>
          <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <QuantaDashboardV2 />
                  </PrivateRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
            <ToastContainer position="bottom-right" />
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
