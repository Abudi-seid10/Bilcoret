import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { LayoutDashboard, Calendar, Headphones, BookOpen, ClipboardList, LogOut, Menu, X, ExternalLink, Newspaper } from 'lucide-react'

function LogoIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="8" r="5" fill="url(#gold-grad-admin-layout)" />
      <rect x="10" y="16" width="20" height="5" rx="2.5" fill="url(#gold-grad-admin-layout)" />
      <rect x="12" y="23" width="16" height="5" rx="2.5" fill="url(#gold-grad-admin-layout)" />
      <rect x="14" y="30" width="12" height="5" rx="2.5" fill="url(#gold-grad-admin-layout)" />
      <defs>
        <linearGradient id="gold-grad-admin-layout" x1="10" y1="3" x2="30" y2="35" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D4B47A" />
          <stop offset="1" stopColor="#B0884A" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/seminars', label: 'Seminars', icon: Calendar },
  { to: '/admin/podcasts', label: 'Podcasts', icon: Headphones },
  { to: '/admin/trainings', label: 'Trainings', icon: BookOpen },
  { to: '/admin/registrations', label: 'Registrations', icon: ClipboardList },
  { to: '/admin/blog', label: 'Blog', icon: Newspaper },
]

export default function AdminLayout() {
  const { adminProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-bilcor-offwhite flex" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-bilcor-green text-white flex flex-col transition-transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <LogoIcon className="w-8 h-8" />
            <div className="flex flex-col leading-none">
              <span className="text-lg font-extrabold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>Bilcor</span>
              <span className="text-[8px] text-bilcor-gold tracking-label font-medium mt-0.5">Admin Portal</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white/10 text-bilcor-gold border-l-[3px] border-bilcor-gold'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border-l-[3px] border-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/60 hover:text-white transition"
          >
            <ExternalLink className="w-4 h-4" /> View Website
          </a>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white/60 hover:text-white transition"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
          {adminProfile && (
            <div className="px-3 pt-2 text-xs text-white/30 truncate">
              {adminProfile.email}
            </div>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden bg-bilcor-green text-white p-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <LogoIcon className="w-7 h-7" />
            <span className="font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Admin</span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
