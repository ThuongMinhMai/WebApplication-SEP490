import { AuthProvider, useAuth } from './contexts/AuthContext'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import ContentProviderLayout from './components/layout/ContentProviderLayout'
import LoginPage from './components/pages/LoginPage'
import DashboardPage from './components/pages/DashboardPage'
import ContentPage from './components/pages/ContentPage'
import LoadingScreen from './components/pages/LoadingScreen'

function ProtectedRoutes() {
  const { isAuthenticated, isAdmin, isContentProvider, initialized } = useAuth()

  if (!initialized) {
    return <LoadingScreen />
  }

  return (
    <Routes>
      {/* Chặn truy cập lại trang login sau khi đã đăng nhập */}
      <Route
        path='/login'
        element={
          isAuthenticated ? (
            <Navigate to={isAdmin ? '/admin/dashboard' : '/content-provider/contents'} replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Protected Admin Routes */}
      {isAuthenticated && isAdmin ? (
        <Route path='/admin/*' element={<AdminLayout />}>
          <Route index element={<Navigate to='dashboard' replace />} />
          <Route path='dashboard' element={<DashboardPage />} />
          <Route path='*' element={<Navigate to='/admin/dashboard' replace />} /> {/* Điều hướng sai URL */}
        </Route>
      ) : (
        <Route path='/admin/*' element={<Navigate to='/login' replace />} />
      )}

      {/* Protected Content Provider Routes */}
      {isAuthenticated && isContentProvider ? (
        <Route path='/content-provider/*' element={<ContentProviderLayout />}>
          <Route index element={<ContentPage />} />
          <Route path='contents' element={<ContentPage />} />
          <Route path='*' element={<Navigate to='/content-provider/contents' replace />} /> {/* Điều hướng sai URL */}
        </Route>
      ) : (
        <Route path='/content-provider/*' element={<Navigate to='/login' replace />} />
      )}

      {/* Điều hướng các đường dẫn không hợp lệ */}
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
