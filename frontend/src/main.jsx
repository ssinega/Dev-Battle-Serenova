import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster 
      position="top-center"
      toastOptions={{
        style: {
          background: 'var(--bg-elevated)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
        },
        success: {
          iconTheme: {
            primary: 'var(--accent-green)',
            secondary: 'var(--bg-elevated)',
          },
        },
        error: {
          iconTheme: {
            primary: 'var(--accent-red)',
            secondary: 'var(--bg-elevated)',
          },
        },
      }}
    />
  </React.StrictMode>,
)
