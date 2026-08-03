import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Seminars from './pages/Seminars'
import Podcasts from './pages/Podcasts'
import Trainings from './pages/Trainings'
import About from './pages/About'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import UserPortal from './pages/portal/UserPortal'
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminSeminars from './pages/admin/AdminSeminars'
import AdminPodcasts from './pages/admin/AdminPodcasts'
import AdminTrainings from './pages/admin/AdminTrainings'
import AdminRegistrations from './pages/admin/AdminRegistrations'
import AdminBlogs from './pages/admin/AdminBlogs'
import AdminSettings from './pages/admin/AdminSettings'
import AdminEmailCampaign from './pages/admin/AdminEmailCampaign'
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
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogPost />} />
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
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="seminars" element={<AdminSeminars />} />
            <Route path="podcasts" element={<AdminPodcasts />} />
            <Route path="trainings" element={<AdminTrainings />} />
            <Route path="registrations" element={<AdminRegistrations />} />
            <Route path="blogs" element={<AdminBlogs />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="email-campaign" element={<AdminEmailCampaign />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
