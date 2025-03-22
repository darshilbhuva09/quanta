import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [message, setMessage] = useState('');
  
  const { login, isAuthenticated, error, clearErrors } = useContext(AuthContext);
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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    if (!loginUsername || !loginPassword) {
      setMessage('Please enter both username and password');
      return;
    }
    
    const success = await login({
      username: loginUsername,
      password: loginPassword
    });
    
    if (success) {
      setMessage('Login successful! Welcome to Quanta Share.');
      navigate('/dashboard');
    }
  };

  const switchToSignup = () => {
    navigate('/register');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="app-title">Quanta Share</h1>
        
        <div className="auth-navigation">
          <button className="nav-btn active">Login</button>
          <button className="nav-btn" onClick={switchToSignup}>Sign Up</button>
        </div>
        
        <h2 className="form-title">Login</h2>
        
        <form onSubmit={handleLoginSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="submit-btn">Login</button>
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

export default Login;
