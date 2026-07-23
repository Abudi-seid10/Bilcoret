import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Calendar, Mic, Headphones, BookOpen, ArrowRight, Users, Star, TrendingUp, Target } from 'lucide-react'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'

interface Seminar {
  id: string
  title: string
  speaker: string
  date: string
  location: string
}

interface Podcast {
  id: string
  title: string
  episode_number: number
  guest: string
  duration: number
}

interface Training {
  id: string
  title: string
  instructor: string
  duration: string
  price: number
  status: string
}

function LogoIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="8" r="5" fill="url(#gold-grad-home)" />
      <rect x="10" y="16" width="20" height="5" rx="2.5" fill="url(#gold-grad-home)" />
      <rect x="12" y="23" width="16" height="5" rx="2.5" fill="url(#gold-grad-home)" />
      <rect x="14" y="30" width="12" height="5" rx="2.5" fill="url(#gold-grad-home)" />
      <defs>
        <linearGradient id="gold-grad-home" x1="10" y1="3" x2="30" y2="35" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D4B47A" />
          <stop offset="1" stopColor="#B0884A" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function Home() {
  const [seminars, setSeminars] = useState<Seminar[]>([])
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPreview() {
      const [{ data: s }, { data: p }, { data: t }] = await Promise.all([
        supabase.from('seminars').select('id,title,speaker,date,location').order('date', { ascending: true }).limit(2),
        supabase.from('podcasts').select('id,title,episode_number,guest,duration').order('episode_number', { ascending: false }).limit(2),
        supabase.from('trainings').select('id,title,instructor,duration,price,status').limit(3),
      ])
      setSeminars(s ?? [])
      setPodcasts(p ?? [])
      setTrainings(t ?? [])
      setLoading(false)
    }
    fetchPreview()
  }, [])

  function formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60)
    return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`
  }

  const stats = [
    { icon: Users, label: 'Community Members', value: '2,400+' },
    { icon: Star, label: 'Seminars Hosted', value: '18+' },
    { icon: Headphones, label: 'Podcast Episodes', value: '30+' },
    { icon: TrendingUp, label: 'Trainees Graduated', value: '850+' },
  ]

  const pillars = [
    { icon: Target, title: 'Leadership', desc: 'Cultivating leaders who drive real organizational change.' },
    { icon: BookOpen, title: 'Strategic Thinking', desc: 'Frameworks for complex decisions in uncertain times.' },
    { icon: Users, title: 'Coaching', desc: 'Personalized guidance to unlock individual potential.' },
    { icon: TrendingUp, title: 'Scientific Research', desc: 'Evidence-based insights grounded in rigorous methodology.' },
  ]

  return (
    <div>
      {/* Hero — Deep Green full-bleed */}
      <section className="relative bg-bilcor-green text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(198,161,90,0.12),_transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 border border-bilcor-gold/40 text-bilcor-gold text-xs font-semibold tracking-label mb-6">
              Institute of Leadership Coaching &amp; Research
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Unlocking Potential,
              <span className="block text-bilcor-gold">Creating Value!</span>
            </h1>
            <p className="text-lg text-white/70 mb-10 leading-relaxed max-w-xl">
              Bilcor is your hub for transformative seminars, insightful podcasts, and practical trainings designed to create real-world value through leadership development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/seminars"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-bilcor-gold text-bilcor-green-dark font-bold uppercase text-sm tracking-wide hover:brightness-110 transition active:scale-95"
                style={{ borderRadius: '4px' }}
              >
                Explore Seminars <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/trainings"
                className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white/40 text-white font-bold uppercase text-sm tracking-wide hover:border-white transition"
                style={{ borderRadius: '4px' }}
              >
                Browse Trainings
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats — Off-white */}
      <section className="bg-bilcor-offwhite border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-bilcor-green/10 mb-3" style={{ borderRadius: '4px' }}>
                  <Icon className="w-6 h-6 text-bilcor-green" />
                </div>
                <p className="text-3xl font-black text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>{value}</p>
                <p className="text-sm text-bilcor-charcoal/60 mt-1 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Pillars — White */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <span className="text-bilcor-gold text-xs font-semibold tracking-label mb-3 block">Our Core Pillars</span>
            <h2 className="text-3xl md:text-4xl font-bold text-bilcor-green mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              What Drives Everything We Do
            </h2>
            <p className="text-bilcor-charcoal/60 max-w-2xl mx-auto leading-relaxed">
              Four foundational principles guide our programs, research, and community engagement.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-bilcor-offwhite p-7 border-l-[3px] border-bilcor-gold hover:shadow-lg transition" style={{ borderRadius: '0 4px 4px 0' }}>
                <div className="w-11 h-11 bg-bilcor-green flex items-center justify-center mb-4" style={{ borderRadius: '4px' }}>
                  <Icon className="w-5 h-5 text-bilcor-gold" />
                </div>
                <h3 className="font-bold text-bilcor-green mb-2 text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>{title}</h3>
                <p className="text-sm text-bilcor-charcoal/60 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Seminars — Off-white alternating */}
      <section className="bg-bilcor-offwhite border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="text-bilcor-gold text-xs font-semibold tracking-label mb-2 block">Seminars</span>
              <h2 className="text-3xl font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>Upcoming Sessions</h2>
            </div>
            <Link to="/seminars" className="hidden sm:inline-flex items-center gap-1 text-bilcor-green font-bold hover:text-bilcor-gold transition text-sm">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              <LoadingSkeleton type="card" count={2} />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {seminars.map(s => (
                <div key={s.id} className="bg-white border border-slate-200 p-6 hover:shadow-lg transition group" style={{ borderRadius: '4px' }}>
                  <div className="flex items-center gap-2 text-bilcor-gold text-xs font-semibold tracking-label mb-3">
                    <Calendar className="w-4 h-4" />
                    {new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <h3 className="text-lg font-bold text-bilcor-green mb-3 group-hover:text-bilcor-gold transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>{s.title}</h3>
                  <div className="flex items-center gap-1 text-sm text-bilcor-charcoal/50">
                    <Mic className="w-4 h-4" />
                    <span>{s.speaker}</span>
                    <span className="mx-2 text-bilcor-charcoal/20">|</span>
                    <span>{s.location}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest Podcast — White */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="text-bilcor-gold text-xs font-semibold tracking-label mb-2 block">Podcast</span>
              <h2 className="text-3xl font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>Latest Episodes</h2>
            </div>
            <Link to="/podcasts" className="hidden sm:inline-flex items-center gap-1 text-bilcor-green font-bold hover:text-bilcor-gold transition text-sm">
              All episodes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <LoadingSkeleton type="list" count={2} />
          ) : (
            <div className="space-y-4">
              {podcasts.map(p => (
                <div key={p.id} className="flex items-center gap-5 bg-bilcor-offwhite border border-slate-200 p-5 hover:shadow-md transition" style={{ borderRadius: '4px' }}>
                  <div className="w-14 h-14 bg-bilcor-green flex items-center justify-center shrink-0" style={{ borderRadius: '4px' }}>
                    <Headphones className="w-6 h-6 text-bilcor-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-bilcor-gold font-bold tracking-label mb-0.5">EP {p.episode_number}</p>
                    <p className="font-bold text-bilcor-green truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>{p.title}</p>
                    <p className="text-sm text-bilcor-charcoal/50">{p.guest} · {formatDuration(p.duration)}</p>
                  </div>
                  <Link to="/podcasts" className="shrink-0 px-4 py-2 border-2 border-bilcor-green text-bilcor-green text-sm font-bold uppercase tracking-wide hover:bg-bilcor-green hover:text-white transition" style={{ borderRadius: '4px' }}>
                    Listen
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trainings — Off-white */}
      <section className="bg-bilcor-offwhite border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="text-bilcor-gold text-xs font-semibold tracking-label mb-2 block">Trainings</span>
              <h2 className="text-3xl font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>Featured Programs</h2>
            </div>
            <Link to="/trainings" className="hidden sm:inline-flex items-center gap-1 text-bilcor-green font-bold hover:text-bilcor-gold transition text-sm">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              <LoadingSkeleton type="card" count={3} />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {trainings.map(t => (
                <div key={t.id} className="bg-white border border-slate-200 p-6 hover:shadow-lg transition group flex flex-col" style={{ borderRadius: '4px' }}>
                  <div className="flex items-center justify-between mb-5">
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                      t.status === 'ongoing' ? 'bg-bilcor-green/10 text-bilcor-green' :
                      t.status === 'upcoming' ? 'bg-bilcor-gold/15 text-bilcor-gold-dark' :
                      'bg-slate-100 text-bilcor-charcoal/50'
                    }`} style={{ borderRadius: '4px' }}>
                      {t.status === 'self-paced' ? 'Self-Paced' : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </span>
                    <span className="text-xl font-black text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      ${t.price}
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-bilcor-green/10 flex items-center justify-center mb-4" style={{ borderRadius: '4px' }}>
                    <BookOpen className="w-5 h-5 text-bilcor-green" />
                  </div>
                  <h3 className="font-bold text-bilcor-green mb-2 group-hover:text-bilcor-gold transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t.title}</h3>
                  <p className="text-sm text-bilcor-charcoal/50 mt-auto">{t.instructor} · {t.duration}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner — Deep Green solid */}
      <section className="bg-bilcor-green text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <LogoIcon className="w-12 h-12 mx-auto mb-5 opacity-80" />
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Ready to grow with Bilcor?</h2>
          <p className="text-white/60 mb-8 text-lg leading-relaxed">Join our community and get early access to seminars, fresh podcast episodes, and new training programs.</p>
          <a
            href="https://t.me/bilcoret"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-bilcor-gold text-bilcor-green-dark font-bold uppercase text-sm tracking-wide hover:brightness-110 transition active:scale-95"
            style={{ borderRadius: '4px' }}
          >
            Join on Telegram <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  )
}
