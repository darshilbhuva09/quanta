import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Set the base URL for all axios requests
axios.defaults.baseURL = 'http://localhost:5000';

// Enable withCredentials for all requests to properly handle CORS with cookies
axios.defaults.withCredentials = true;

// Add request interceptor for debugging
axios.interceptors.request.use(request => {
  // console.log('Starting Request', {
  //   url: request.url,
  //   method: request.method,
  //   headers: request.headers,
  //   data: request.data
  // });
  return request;
}, error => {
  console.error('Request Error:', error);
  return Promise.reject(error);
});

// Add response interceptor for debugging
axios.interceptors.response.use(response => {
  // console.log('Response:', {
  //   status: response.status,
  //   headers: response.headers,
  //   data: response.data
  // });
  return response;
}, error => {
  console.error('Response Error:', error.response ? {
    status: error.response.status,
    data: error.response.data,
    headers: error.response.headers
  } : error.message);
  return Promise.reject(error);
});

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set auth token in axios headers
  const setAuthToken = (token) => {
    if (token) {
      // console.log('Setting auth token in headers:', token.substring(0, 10) + '...');
      axios.defaults.headers.common['x-auth-token'] = token;
      localStorage.setItem('token', token);
    } else {
      console.log('Removing auth token from headers');
      delete axios.defaults.headers.common['x-auth-token'];
      localStorage.removeItem('token');
    }
  };

  // Load user data if token exists
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        // console.log('Token found in localStorage, setting auth token', storedToken.substring(0, 10) + '...');
        setAuthToken(storedToken);
        try {
          // Test server connection first
          await axios.get('/api/auth/ping');
          
          // Now try to get user data
          const res = await axios.get('/api/auth/user');
          // console.log('User data loaded:', res.data);
          setUser(res.data);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Error loading user:', err.response?.data || err.message);
          toast.error('Session expired. Please login again.');
          clearAuthState();
        }
      } else {
        console.log('No token found in localStorage');
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Clear all auth state
  const clearAuthState = () => {
    console.log('Clearing auth state');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setAuthToken(null);
  };

  // Register user
  const register = async (formData) => {
    try {
      console.log('Registering user:', formData.username);
      setError(null);
      
      // Make sure there's no token in headers before registration
      delete axios.defaults.headers.common['x-auth-token'];
      
      const res = await axios.post('/api/auth/register', formData);
      // console.log('Registration successful:', res.data);
      
      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setAuthToken(res.data.token);
        toast.success('Registration successful!');
        return true;
      } else {
        console.error('No token received in registration response');
        setError('Registration failed: No authentication token received');
        toast.error('Registration failed. Please try again.');
        return false;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                           err.response?.data?.errors?.[0]?.msg || 
                           'Registration failed';
      console.error('Registration error:', errorMessage);
      setError(errorMessage);
      toast.error(`Registration failed: ${errorMessage}`);
      return false;
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      console.log('Logging in user:', formData.username);
      setError(null);
      
      // Make sure there's no token in headers before login
      delete axios.defaults.headers.common['x-auth-token'];
      
      const res = await axios.post('/api/auth/login', formData);
      // console.log('Login successful:', res.data);
      
      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setAuthToken(res.data.token);
        toast.success('Login successful!');
        return true;
      } else {
        console.error('No token received in login response');
        setError('Login failed: No authentication token received');
        toast.error('Login failed. Please try again.');
        return false;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                           err.response?.data?.errors?.[0]?.msg || 
                           'Login failed';
      console.error('Login error:', errorMessage);
      setError(errorMessage);
      toast.error(`Login failed: ${errorMessage}`);
      return false;
    }
  };

  // Test authentication 
  const testAuth = async () => {
    try {
      console.log('Testing authentication...');
      const res = await axios.get('/api/auth/test');
      // console.log('Auth test successful:', res.data);
      toast.success('Authentication working properly!');
      return true;
    } catch (err) {
      console.error('Auth test failed:', err.response?.data || err.message);
      toast.error('Authentication test failed');
      return false;
    }
  };

  // Logout user
  const logout = () => {
    console.log('Logging out user');
    toast.info('You have been logged out');
    clearAuthState();
  };

  // Clear errors
  const clearErrors = () => {
    console.log('Clearing errors');
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated,
        loading,
        user,
        error,
        register,
        login,
        logout,
        clearErrors,
        testAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
