import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Send } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/seminars', label: 'Seminars' },
  { to: '/podcasts', label: 'Podcast' },
  { to: '/trainings', label: 'Trainings' },
  { to: '/blog', label: 'Blog' },
  { to: '/about', label: 'About' },
  { to: '/portal', label: 'My Portal' },
]

function LogoIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="8" r="5" fill="url(#gold-grad-header)" />
      <rect x="10" y="16" width="20" height="5" rx="2.5" fill="url(#gold-grad-header)" />
      <rect x="12" y="23" width="16" height="5" rx="2.5" fill="url(#gold-grad-header)" />
      <rect x="14" y="30" width="12" height="5" rx="2.5" fill="url(#gold-grad-header)" />
      <defs>
        <linearGradient id="gold-grad-header" x1="10" y1="3" x2="30" y2="35" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D4B47A" />
          <stop offset="1" stopColor="#B0884A" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('logo_url')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single()
      .then(({ data }: { data: { logo_url?: string } | null }) => { if (data?.logo_url) setLogoUrl(data.logo_url) })

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#003826] shadow-xl border-b border-[#C6A15A]/30 py-0.5' 
        : 'bg-[#004D34] border-b border-[#C6A15A]/20'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3 py-2 group">
            {logoUrl ? (
              <img src={logoUrl} alt="Bilcor Logo" className="h-10 w-auto object-contain" />
            ) : (
              <>
                <div className="p-1.5 rounded-lg bg-[#003826] border border-[#C6A15A]/30 group-hover:border-[#C6A15A] transition-colors">
                  <LogoIcon className="w-8 h-8" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-2xl font-black text-white tracking-tight flex items-center gap-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    BILCOR
                  </span>
                  <span className="text-[9px] text-[#C6A15A] tracking-wider uppercase font-semibold -mt-0.5">
                    Institute of Leadership
                  </span>
                </div>
              </>
            )}
          </Link>

          <nav className="hidden lg:flex items-center space-x-1 bg-black/15 p-1.5 rounded-full border border-white/10 backdrop-blur-md">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-[#C6A15A] text-[#003826] shadow-sm'
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/login"
              className="hidden sm:inline-flex items-center px-3.5 py-2 text-white/70 hover:text-[#C6A15A] text-xs font-bold uppercase tracking-wider transition"
            >
              Admin Portal
            </Link>
            <a
              href="https://t.me/bilcoret"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#C6A15A] to-[#D4B47A] text-[#003826] text-xs font-black uppercase tracking-wider hover:brightness-110 transition shadow-md active:scale-95 rounded-md"
            >
              <Send className="w-3.5 h-3.5" />
              Join Telegram
            </a>
            <button
              className="lg:hidden p-2 text-[#C6A15A] hover:text-white rounded-lg bg-white/5 border border-white/10"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {menuOpen && (
          <div className="lg:hidden pb-6 pt-2 border-t border-white/10 mt-1 animate-fadeIn">
            <div className="flex flex-col space-y-1.5">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-sm font-bold uppercase tracking-wider px-4 py-3 rounded-lg transition ${
                      isActive
                        ? 'text-[#003826] bg-[#C6A15A]'
                        : 'text-white/90 hover:text-[#C6A15A] hover:bg-white/5'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href="https://t.me/bilcoret"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#C6A15A] text-[#003826] font-black uppercase text-xs tracking-wider rounded-lg shadow-md"
                >
                  <Send className="w-4 h-4" /> Join Channel on Telegram
                </a>
                <Link
                  to="/admin/login"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center justify-center px-4 py-2.5 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider text-center"
                >
                  Admin Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

