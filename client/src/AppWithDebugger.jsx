import React from 'react';
import App from './App';
import AuthDebugger from './components/AuthDebugger';

const AppWithDebugger = () => {
  return (
    <>
      <App />
      <AuthDebugger />
    </>
  );
};

export default AppWithDebugger;