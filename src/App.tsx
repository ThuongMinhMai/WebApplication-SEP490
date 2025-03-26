import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import ContentProviderLayout from './components/layout/ContentProviderLayout'
import BooksPage from './components/pages/BooksPage'
import ContentPage from './components/pages/ContentPage'
import ContentProvidersPage from './components/pages/ContentProvidersPage'
import DashboardPage from './components/pages/DashboardPage'
import DetailDoctorPage from './components/pages/DetailDoctorPage'
import DoctorCreateForm from './components/pages/DoctorCreateForm'
import DoctorsPage from './components/pages/DoctorsPage'
import ExercisesPage from './components/pages/ExercisesPage'
import FamilyMembersPage from './components/pages/FamilyMembersPage'
import LoadingScreen from './components/pages/LoadingScreen'
import LoginPage from './components/pages/LoginPage'
import MusicPage from './components/pages/MusicPage'
import SubscriptionPackagesPage from './components/pages/SubscriptionPackagesPage'
import TransactionHistoryPage from './components/pages/TransactionHistoryPage'
import UsersPage from './components/pages/UsersPage'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import PlayListMusicDetailPage from './components/pages/PlayListMusicDetailPage'

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
          <Route path='transaction-history' element={<TransactionHistoryPage />} />
          <Route path='doctors' element={<DoctorsPage />} />
          <Route path='doctors/:id' element={<DetailDoctorPage />} />
          <Route path='doctors/add' element={<DoctorCreateForm />} />
          <Route path='content-providers' element={<ContentProvidersPage />} />
          <Route path='family-members' element={<FamilyMembersPage />} />
          <Route path='users' element={<UsersPage />} />
          <Route path='exercises' element={<ExercisesPage />} />
          <Route path='books' element={<BooksPage />} />
          <Route path='musics' element={<MusicPage />} />
          <Route path='musics/:id' element={<PlayListMusicDetailPage />} />
          <Route path='subscription-packages' element={<SubscriptionPackagesPage />} />
          <Route path='*' element={<Navigate to='/admin/dashboard' replace />} /> {/* Điều hướng sai URL */}
        </Route>
      ) : (
        <Route path='/admin/*' element={<Navigate to='/login' replace />} />
      )}

      {/* Protected Content Provider Routes */}
      {isAuthenticated && isContentProvider ? (
        <Route path='/content-provider/*' element={<ContentProviderLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path='dashboard' element={<ContentPage />} />
          <Route path='exercises' element={<ContentPage />} />
          <Route path='books' element={<ContentPage />} />
          <Route path='musics' element={<ContentPage />} />
          <Route path='*' element={<Navigate to='/content-provider/dashboard' replace />} /> {/* Điều hướng sai URL */}
        </Route>
      ) : (
        <Route path='/content-provider/*' element={<Navigate to='/login' replace />} />
      )}

      {/* Điều hướng các đường dẫn không hợp lệ */}
      <Route
        path='*'
        element={
          <Navigate
            to={isAuthenticated ? (isAdmin ? '/admin/dashboard' : '/content-provider/dashboard') : '/login'}
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
