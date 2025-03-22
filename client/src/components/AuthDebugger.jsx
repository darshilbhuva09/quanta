import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { runDiagnostics, resetAuth } from '../utils/authDebugger';

const AuthDebugger = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const { user, isAuthenticated, loading, token } = useContext(AuthContext);

  useEffect(() => {
    // Add keyboard shortcut to toggle debugger (Ctrl+Shift+D)
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const runTests = async () => {
    setIsRunning(true);
    const results = await runDiagnostics();
    setDiagnosticResults(results);
    setIsRunning(false);
  };

  const handleReset = () => {
    resetAuth();
    window.location.href = '/auth';
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          background: '#4361ee',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}
      >
        🔍
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      background: 'white',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
      width: '350px',
      maxHeight: '80vh',
      overflow: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0 }}>Auth Debugger</h3>
        <button 
          onClick={() => setIsOpen(false)}
          style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ marginBottom: '5px' }}>Auth State:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>User: {user ? `${user.username} (${user.email})` : 'Not logged in'}</li>
          <li>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</li>
          <li>Loading: {loading ? 'Yes' : 'No'}</li>
          <li>Token: {token ? 'Present' : 'Missing'}</li>
        </ul>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button 
          onClick={runTests}
          disabled={isRunning}
          style={{
            background: '#4361ee',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            opacity: isRunning ? 0.7 : 1
          }}
        >
          {isRunning ? 'Running...' : 'Run Diagnostics'}
        </button>
        
        <button 
          onClick={handleReset}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset Auth
        </button>
      </div>
      
      {diagnosticResults && (
        <div>
          <h4 style={{ marginBottom: '5px' }}>Diagnostic Results:</h4>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'monospace'
          }}>
            <div>Token Valid: {diagnosticResults.tokenValid ? '✅' : '❌'}</div>
            <div>API Test: {diagnosticResults.apiTest.success ? '✅' : '❌'}</div>
            {!diagnosticResults.apiTest.success && (
              <div style={{ color: '#dc3545', marginTop: '5px' }}>
                Error: {JSON.stringify(diagnosticResults.apiTest.error)}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '15px', fontSize: '12px', color: '#6c757d' }}>
        Press Ctrl+Shift+D to toggle this debugger
      </div>
    </div>
  );
};

export default AuthDebugger;