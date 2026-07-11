import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Mail, MapPin, Phone, Send } from 'lucide-react'

function LogoIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="8" r="5" fill="url(#gold-grad-footer)" />
      <rect x="10" y="16" width="20" height="5" rx="2.5" fill="url(#gold-grad-footer)" />
      <rect x="12" y="23" width="16" height="5" rx="2.5" fill="url(#gold-grad-footer)" />
      <rect x="14" y="30" width="12" height="5" rx="2.5" fill="url(#gold-grad-footer)" />
      <defs>
        <linearGradient id="gold-grad-footer" x1="10" y1="3" x2="30" y2="35" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D4B47A" />
          <stop offset="1" stopColor="#B0884A" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function Footer() {
  const [email, setEmail] = useState('')

  function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault()
    alert(`Subscribed: ${email}`)
    setEmail('')
  }

  return (
    <footer className="bg-bilcor-green-dark text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2.5 mb-4">
              <LogoIcon className="w-8 h-8" />
              <div className="flex flex-col leading-none">
                <span className="text-xl font-extrabold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Bilcor
                </span>
                <span className="text-[8px] text-bilcor-gold tracking-label font-medium mt-0.5">
                  Institute of Leadership
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/60 italic">
              "Unlocking Potential, Creating Value!"
            </p>
            <div className="mt-5 flex space-x-3">
              <a href="https://t.me/bilcoret" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center border border-white/15 hover:border-bilcor-gold hover:text-bilcor-gold transition" style={{ borderRadius: '4px' }}>
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="https://facebook.com/bilcoret" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center border border-white/15 hover:border-bilcor-gold hover:text-bilcor-gold transition text-xs font-bold" style={{ borderRadius: '4px' }}>
                f
              </a>
              <a href="https://twitter.com/bilcoret" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center border border-white/15 hover:border-bilcor-gold hover:text-bilcor-gold transition text-xs font-bold" style={{ borderRadius: '4px' }}>
                X
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm tracking-wide uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/seminars" className="hover:text-bilcor-gold transition">Seminars</Link></li>
              <li><Link to="/podcasts" className="hover:text-bilcor-gold transition">Podcast</Link></li>
              <li><Link to="/trainings" className="hover:text-bilcor-gold transition">Trainings</Link></li>
              <li><Link to="/about" className="hover:text-bilcor-gold transition">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm tracking-wide uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Contact
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-bilcor-gold shrink-0 mt-0.5" />
                <span>Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-bilcor-gold shrink-0" />
                <span>+251 000 000 000</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-bilcor-gold shrink-0" />
                <span>contact@bilcoret.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm tracking-wide uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Stay Tuned
            </h4>
            <p className="text-sm text-white/50 mb-4">Get notified about new seminars and episodes.</p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="px-3 py-2.5 bg-white/5 border border-white/15 text-white placeholder-white/35 focus:outline-none focus:border-bilcor-gold text-sm transition"
                style={{ borderRadius: '4px' }}
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-bilcor-gold text-bilcor-green-dark font-bold uppercase text-sm tracking-wide hover:brightness-110 transition"
                style={{ borderRadius: '4px' }}
              >
                Subscribe <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/10 text-sm text-center text-white/40">
          &copy; {new Date().getFullYear()} Bilcor — Institute of Leadership Coaching and Research. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
