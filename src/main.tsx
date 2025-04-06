import { ConfigProvider } from 'antd'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#FF1356'
      }
    }}
  >
    <AuthProvider>
      <App />
    </AuthProvider>
  </ConfigProvider>
)
