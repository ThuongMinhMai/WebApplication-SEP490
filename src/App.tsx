import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import ContentProviderLayout from './components/layout/ContentProviderLayout'
import BooksPage from './components/pages/Admin/BooksPage'
import ContentProvidersPage from './components/pages/Admin/ContentProvidersPage'
import DashboardPage from './components/pages/Admin/DashboardAdminPage'
import DetailDoctorPage from './components/pages/Admin/DetailDoctorPage'
import DoctorCreateForm from './components/pages/Admin/DoctorCreateForm'
import DoctorsPage from './components/pages/Admin/DoctorsPage'
import ExerciesDetailPage from './components/pages/Admin/ExerciesDetailPage'
import ExercisesPage from './components/pages/Admin/ExercisesPage'
import FamilyMembersPage from './components/pages/Admin/FamilyMembersPage'
import MusicPage from './components/pages/Admin/MusicPage'
import PlayListMusicDetailPage from './components/pages/Admin/PlayListMusicDetailPage'
import SubscriptionPackagesPage from './components/pages/Admin/SubscriptionPackagesPage'
import TransactionHistoryPage from './components/pages/Admin/TransactionHistoryPage'
import UsersPage from './components/pages/Admin/UsersPage'
import AddBookPage from './components/pages/ContentProvider/AddBookPage'
import DashboardProviderPage from './components/pages/ContentProvider/DashboardProviderPage'
import DetailExercisePage from './components/pages/ContentProvider/DetailExercisePage'
import DetailMusicPage from './components/pages/ContentProvider/DetailMusicPage'
import ManageBook from './components/pages/ContentProvider/ManageBook'
import ManageExercise from './components/pages/ContentProvider/ManageExercies'
import ManageMusicPage from './components/pages/ContentProvider/ManageMusicPage'
import LoadingScreen from './components/pages/LoadingScreen'
import LoginPage from './components/pages/LoginPage'
import { useAuth } from './contexts/AuthContext'
import HistoryEmergencyAlert from './components/pages/Admin/HistoryEmergencyAlert'
import ReportPage from './components/pages/Admin/ReportPage'
import SubscriptionPackagesDetailPage from './components/pages/Admin/SubscriptionPackagesDetailPage'

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
          <Route path='history-emergency' element={<HistoryEmergencyAlert />} />
          <Route path='doctors' element={<DoctorsPage />} />
          <Route path='doctors/:id' element={<DetailDoctorPage />} />
          <Route path='doctors/add' element={<DoctorCreateForm />} />
          <Route path='content-providers' element={<ContentProvidersPage />} />
          <Route path='family-members' element={<FamilyMembersPage />} />
          <Route path='users' element={<UsersPage />} />
          <Route path='exercises' element={<ExercisesPage />} />
          <Route path='exercises/:id' element={<ExerciesDetailPage />} />
          <Route path='books' element={<BooksPage />} />
          <Route path='report' element={<ReportPage />} />
          <Route path='musics' element={<MusicPage />} />
          <Route path='musics/:id' element={<PlayListMusicDetailPage />} />
          <Route path='subscription-packages' element={<SubscriptionPackagesPage />} />
          <Route path='subscription-packages/:id' element={<SubscriptionPackagesDetailPage />} />
          <Route path='*' element={<Navigate to='/admin/dashboard' replace />} /> {/* Điều hướng sai URL */}
        </Route>
      ) : (
        <Route path='/admin/*' element={<Navigate to='/login' replace />} />
      )}

      {/* Protected Content Provider Routes */}
      {isAuthenticated && isContentProvider ? (
        <Route path='/content-provider/*' element={<ContentProviderLayout />}>
          <Route index element={<DashboardProviderPage />} />
          <Route path='dashboard' element={<DashboardProviderPage />} />
          <Route path='exercises' element={<ManageExercise />} />
          <Route path='exercises/:id' element={<DetailExercisePage />} />
          <Route path='books' element={<ManageBook />} />
          <Route path='books/add' element={<AddBookPage />} />
          <Route path='musics' element={<ManageMusicPage />} />
          <Route path='musics/:id' element={<DetailMusicPage />} />
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
      <ProtectedRoutes />
    </BrowserRouter>
  )
}

export default App
