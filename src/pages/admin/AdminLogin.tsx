import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Lock, Mail, Loader2, ShieldCheck, ArrowRight } from 'lucide-react'

function LogoIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="8" r="5" fill="url(#gold-grad-login)" />
      <rect x="10" y="16" width="20" height="5" rx="2.5" fill="url(#gold-grad-login)" />
      <rect x="12" y="23" width="16" height="5" rx="2.5" fill="url(#gold-grad-login)" />
      <rect x="14" y="30" width="12" height="5" rx="2.5" fill="url(#gold-grad-login)" />
      <defs>
        <linearGradient id="gold-grad-login" x1="10" y1="3" x2="30" y2="35" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D4B47A" />
          <stop offset="1" stopColor="#B0884A" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function AdminLogin() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fn = mode === 'login' ? signIn : signUp
    const { error } = await fn(email, password)

    if (error) {
      setError(error)
      setLoading(false)
    } else {
      navigate('/admin/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-bilcor-green flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <LogoIcon className="w-14 h-14 mx-auto mb-4" />
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>Bilcor Admin</h1>
          <p className="text-sm text-white/50 mt-1">Institute of Leadership Coaching and Research</p>
        </div>

        <div className="bg-white p-8 shadow-2xl" style={{ borderRadius: '4px' }}>
          <div className="flex border-b border-slate-200 mb-6">
            <button
              onClick={() => { setMode('login'); setError('') }}
              className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wide transition ${
                mode === 'login' ? 'text-bilcor-green border-b-2 border-bilcor-green' : 'text-bilcor-charcoal/40 hover:text-bilcor-charcoal/60'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError('') }}
              className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wide transition ${
                mode === 'signup' ? 'text-bilcor-green border-b-2 border-bilcor-green' : 'text-bilcor-charcoal/40 hover:text-bilcor-charcoal/60'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="flex items-center gap-2 bg-bilcor-offwhite border border-bilcor-gold/20 px-4 py-2.5 mb-6" style={{ borderRadius: '4px' }}>
            <ShieldCheck className="w-4 h-4 text-bilcor-gold shrink-0" />
            <p className="text-xs text-bilcor-charcoal/60">
              Admin access is auto-granted for designated emails only.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bilcor-charcoal/30" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 focus:outline-none focus:border-bilcor-green text-sm transition"
                  style={{ borderRadius: '4px' }}
                  placeholder="admin@bilcoret.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bilcor-charcoal/30" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 focus:outline-none focus:border-bilcor-green text-sm transition"
                  style={{ borderRadius: '4px' }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5" style={{ borderRadius: '4px' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-bilcor-gold text-bilcor-green-dark font-bold uppercase text-sm tracking-wide hover:brightness-110 transition disabled:opacity-60"
              style={{ borderRadius: '4px' }}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Please wait...</>
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <a href="/" className="text-xs text-bilcor-charcoal/40 hover:text-bilcor-green transition">
              &larr; Back to website
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
