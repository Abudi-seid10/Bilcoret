import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/seminars', label: 'Seminars' },
  { to: '/podcasts', label: 'Podcast' },
  { to: '/trainings', label: 'Trainings' },
  { to: '/about', label: 'About' },
  { to: '/portal', label: 'My Portal' },
]

function LogoIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="8" r="5" fill="url(#gold-grad)" />
      <rect x="10" y="16" width="20" height="5" rx="2.5" fill="url(#gold-grad)" />
      <rect x="12" y="23" width="16" height="5" rx="2.5" fill="url(#gold-grad)" />
      <rect x="14" y="30" width="12" height="5" rx="2.5" fill="url(#gold-grad)" />
      <defs>
        <linearGradient id="gold-grad" x1="10" y1="3" x2="30" y2="35" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D4B47A" />
          <stop offset="1" stopColor="#B0884A" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-bilcor-green border-b border-bilcor-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2.5 py-2">
            <LogoIcon className="w-8 h-8" />
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Bilcor
              </span>
              <span className="text-[8px] text-bilcor-gold tracking-label font-medium mt-0.5">
                Institute of Leadership
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-7">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-bilcor-gold'
                      : 'text-white/80 hover:text-bilcor-gold'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/admin/login"
              className="hidden lg:inline-flex items-center px-3 py-2 text-white/60 hover:text-bilcor-gold text-sm font-semibold transition"
            >
              Admin
            </a>
            <a
              href="https://t.me/bilcoret"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center px-5 py-2 bg-bilcor-gold text-bilcor-green-dark text-sm font-bold uppercase tracking-wide hover:brightness-110 transition"
              style={{ borderRadius: '4px', fontFamily: 'Inter, sans-serif' }}
            >
              Join Channel
            </a>
            <button
              className="md:hidden p-2 text-white"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2 pt-2">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-base font-semibold px-3 py-2.5 transition ${
                      isActive
                        ? 'text-bilcor-gold bg-white/5'
                        : 'text-white/85 hover:text-bilcor-gold hover:bg-white/5'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <a
                href="https://t.me/bilcoret"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-5 py-2.5 bg-bilcor-gold text-bilcor-green-dark font-bold uppercase text-sm mt-3"
                style={{ borderRadius: '4px' }}
              >
                Join Channel
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
