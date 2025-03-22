import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import './Auth.css';

const Auth = () => {
  const [activeForm, setActiveForm] = useState('login');
  const [message, setMessage] = useState('');

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authStatus, setAuthStatus] = useState(null);

  const { login, register, isAuthenticated, error, clearErrors } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if authenticated
  useEffect(() => {
    console.log('[Auth] Authentication state:', {
      isAuthenticated,
      error,
      authStatus
    });

    if (isAuthenticated) {
      console.log('[Auth] User is authenticated, redirecting to dashboard');
      toast.success('Authentication successful! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1000);
    }
    
    if (error) {
      console.error('[Auth] Auth error received:', error);
      setMessage(error);
      setAuthStatus('error');
      clearErrors();
    }
  }, [isAuthenticated, error, navigate, clearErrors, authStatus]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setAuthStatus('attempting');

    console.log('[Auth] Login attempt with username:', loginUsername);

    if (!loginUsername || !loginPassword) {
      console.log('[Auth] Missing login credentials');
      setMessage('Please enter both username and password');
      setAuthStatus('error');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('[Auth] Submitting login request');
      const success = await login({
        username: loginUsername,
        password: loginPassword
      });

      console.log('[Auth] Login request completed, success:', success);
      
      if (success) {
        setMessage('Login successful! Welcome to Quanta Share.');
        setAuthStatus('success');
        toast.success('Login successful!');
      } else {
        setAuthStatus('error');
      }
    } catch (err) {
      console.error('[Auth] Login error:', err);
      setMessage(err.message || 'An unexpected error occurred. Please try again.');
      setAuthStatus('error');
      toast.error('Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setAuthStatus('attempting');

    console.log('[Auth] Signup attempt with username:', signupUsername, 'and email:', signupEmail);

    if (!signupEmail || !signupUsername || !signupPassword || !signupConfirmPassword) {
      console.log('[Auth] Missing signup fields');
      setMessage('Please fill in all required fields');
      setAuthStatus('error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail)) {
      console.log('[Auth] Invalid email format');
      setMessage('Please enter a valid email address');
      setAuthStatus('error');
      return;
    }

    if (signupPassword.length < 6) {
      console.log('[Auth] Password too short');
      setMessage('Password must be at least 6 characters long');
      setAuthStatus('error');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      console.log('[Auth] Passwords do not match');
      setMessage('Passwords do not match');
      setAuthStatus('error');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('[Auth] Submitting registration request');
      const success = await register({
        email: signupEmail,
        username: signupUsername,
        password: signupPassword
      });

      console.log('[Auth] Registration request completed, success:', success);
      
      if (success) {
        setMessage('Registration successful! You can now use Quanta Share.');
        setAuthStatus('success');
        toast.success('Registration successful!');
      } else {
        setAuthStatus('error');
      }
    } catch (err) {
      console.error('[Auth] Registration error:', err);
      setMessage(err.message || 'An unexpected error occurred. Please try again.');
      setAuthStatus('error');
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Development helper to see the current state
  React.useEffect(() => {
    console.log('[Auth] Component state:', {
      activeForm,
      isSubmitting,
      authStatus,
      isAuthenticated,
      error,
      message
    });
  }, [activeForm, isSubmitting, authStatus, isAuthenticated, error, message]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="app-title">Quanta Share</h1>

        {/* Navigation buttons */}
        <div className="auth-navigation">
          <button
            className={`nav-btn ${activeForm === 'login' ? 'active' : ''}`}
            onClick={() => {
              setActiveForm('login');
              setMessage('');
              setAuthStatus(null);
            }}
          >
            Login
          </button>
          <button
            className={`nav-btn ${activeForm === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setActiveForm('signup');
              setMessage('');
              setAuthStatus(null);
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Login Form */}
        {activeForm === 'login' && (
          <>
            <h2 className="form-title">Login</h2>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <button
                type="submit"
                className={`submit-btn ${isSubmitting ? 'submitting' : ''} ${authStatus === 'success' ? 'success' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : authStatus === 'success' ? 'Success!' : 'Login'}
              </button>
            </form>
          </>
        )}

        {/* Signup Form */}
        {activeForm === 'signup' && (
          <>
            <h2 className="form-title">Sign Up</h2>
            <form onSubmit={handleSignupSubmit}>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Username"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <button
                type="submit"
                className={`submit-btn ${isSubmitting ? 'submitting' : ''} ${authStatus === 'success' ? 'success' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing up...' : authStatus === 'success' ? 'Success!' : 'Sign Up'}
              </button>
            </form>
          </>
        )}

        {/* Status Message */}
        {message && (
          <p className={`message ${authStatus === 'success' ? 'success' : 'error'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Auth;
