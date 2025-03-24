import React from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import ContentProviderLayout from './components/layout/ContentProviderLayout'
import LoginPage from './components/pages/LoginPage'
import DashboardPage from './components/pages/DashboardPage'
import ContentPage from './components/pages/ContentPage'
// Tạo component ProtectedRoutes để xử lý routing
function ProtectedRoutes() {
  const { isAuthenticated, isAdmin, isContentProvider } = useAuth()

  return (
    <Routes>
      <Route path='/login' element={<LoginPage />} />

      {/* Protected Routes */}
      <Route path='/admin/*' element={isAuthenticated && isAdmin ? <AdminLayout /> : <Navigate to='/login' replace />}>
        <Route path='dashboard' element={<DashboardPage />} />
      </Route>

      <Route
        path='/content-provider/*'
        element={isAuthenticated && isContentProvider ? <ContentProviderLayout /> : <Navigate to='/login' replace />}
      >
        <Route path='contents' element={<ContentPage />} />
      </Route>

      <Route
        path='*'
        element={
          <Navigate
            to={isAuthenticated ? (isAdmin ? '/admin/dashboard' : '/content-provider/contents') : '/login'}
            replace
          />
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProtectedRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
