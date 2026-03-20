import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('🚀 main.tsx: Starting application...');

const rootElement = document.getElementById("root");

if (rootElement) {
  console.log('✅ main.tsx: Creating React root and rendering App...');
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('❌ main.tsx: Root element not found!');
}