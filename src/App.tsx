import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Seminars from './pages/Seminars'
import Podcasts from './pages/Podcasts'
import Trainings from './pages/Trainings'
import About from './pages/About'
import UserPortal from './pages/portal/UserPortal'
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminSeminars from './pages/admin/AdminSeminars'
import AdminPodcasts from './pages/admin/AdminPodcasts'
import AdminTrainings from './pages/admin/AdminTrainings'
import AdminRegistrations from './pages/admin/AdminRegistrations'
import ProtectedRoute from './pages/admin/ProtectedRoute'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public site */}
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="seminars" element={<Seminars />} />
            <Route path="podcasts" element={<Podcasts />} />
            <Route path="trainings" element={<Trainings />} />
            <Route path="about" element={<About />} />
            <Route path="portal" element={<UserPortal />} />
          </Route>

          {/* Admin login (standalone) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin portal (protected) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="seminars" element={<AdminSeminars />} />
            <Route path="podcasts" element={<AdminPodcasts />} />
            <Route path="trainings" element={<AdminTrainings />} />
            <Route path="registrations" element={<AdminRegistrations />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
