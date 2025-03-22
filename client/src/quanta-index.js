import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import QuantaApp from './QuantaApp';
import reportWebVitals from './reportWebVitals';

/**
 * This is an alternative index file for the Quanta Share application
 * that uses the QuantaApp entry point instead of the original App.
 * 
 * To use this file:
 * 1. Rename your current index.js to index.original.js
 * 2. Rename this file to index.js
 * 3. Run your application normally
 */
ReactDOM.render(
  <React.StrictMode>
    <QuantaApp />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();