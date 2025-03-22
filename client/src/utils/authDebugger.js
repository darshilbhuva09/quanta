/**
 * Authentication Debugger Utility
 * 
 * This file provides functions to debug authentication issues
 * without modifying your existing components.
 */

// Check if token exists and is valid format
export const checkToken = () => {
  const token = localStorage.getItem('token');
  console.log('Token exists:', !!token);
  
  if (token) {
    try {
      // Check if token is in JWT format (header.payload.signature)
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Token is not in valid JWT format');
        return false;
      }
      
      // Try to decode the payload (middle part)
      const payload = JSON.parse(atob(parts[1]));
      console.log('Token payload:', payload);
      
      // Check if token is expired
      if (payload.exp) {
        const expirationDate = new Date(payload.exp * 1000);
        const isExpired = expirationDate < new Date();
        console.log('Token expiration:', expirationDate.toLocaleString());
        console.log('Token is expired:', isExpired);
        return !isExpired;
      }
      
      return true;
    } catch (error) {
      console.error('Error parsing token:', error);
      return false;
    }
  }
  
  return false;
};

// Test API connection
export const testApiConnection = async () => {
  try {
    const response = await fetch('/api/auth/user', {
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    });
    
    console.log('API response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('User data:', data);
      return { success: true, data };
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('API error:', errorData);
      return { success: false, error: errorData };
    }
  } catch (error) {
    console.error('Network error:', error);
    return { success: false, error };
  }
};

// Clear authentication data and return to login
export const resetAuth = () => {
  console.log('Resetting authentication data...');
  localStorage.removeItem('token');
  console.log('Token removed from localStorage');
  
  // Remove any other auth-related data
  sessionStorage.clear();
  console.log('Session storage cleared');
  
  // Clear any auth headers
  if (window.axios) {
    delete window.axios.defaults.headers.common['x-auth-token'];
    console.log('Axios auth headers cleared');
  }
  
  console.log('Auth reset complete. Please refresh the page and try logging in again.');
};

// Run all checks
export const runDiagnostics = async () => {
  console.group('🔍 Authentication Diagnostics');
  
  console.log('Running token check...');
  const tokenValid = checkToken();
  console.log('Token valid:', tokenValid);
  
  console.log('Testing API connection...');
  const apiTest = await testApiConnection();
  console.log('API test result:', apiTest.success ? 'Success' : 'Failed');
  
  console.groupEnd();
  
  return {
    tokenValid,
    apiTest
  };
};

// Export a function to be called from the browser console
window.debugAuth = {
  checkToken,
  testApiConnection,
  resetAuth,
  runDiagnostics
};