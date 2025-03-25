import { ConfigProvider } from 'antd'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#ec4899'
        }
      }}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </ConfigProvider>
  </React.StrictMode>
)
