import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [signupEmail, setSignupEmail] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  
  const { register, isAuthenticated, error, clearErrors } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    if (error) {
      setMessage(error);
      clearErrors();
    }
  }, [isAuthenticated, error, navigate, clearErrors]);

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    if (!signupEmail || !signupUsername || !signupPassword) {
      setMessage('Please fill in all required fields');
      return;
    }
    
    if (signupPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail)) {
      setMessage('Please enter a valid email address');
      return;
    }
    
    // Password strength validation
    if (signupPassword.length < 6) {
      setMessage('Password must be at least 6 characters long');
      return;
    }
    
    const success = await register({
      username: signupUsername,
      email: signupEmail,
      password: signupPassword
    });
    
    if (success) {
      setMessage('Registration successful!');
      // Navigate after a short delay to show the success message
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  };

  const switchToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="app-title">Quanta Share</h1>
        
        <div className="auth-navigation">
          <button className="nav-btn" onClick={switchToLogin}>Login</button>
          <button className="nav-btn active">Sign Up</button>
        </div>
        
        <h2 className="form-title">Sign Up</h2>
        
        <form onSubmit={handleSignupSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={signupUsername}
              onChange={(e) => setSignupUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="submit-btn">Sign Up</button>
        </form>
        
        {message && (
          <p className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;
