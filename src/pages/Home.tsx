import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Calendar, Mic, Headphones, BookOpen, ArrowRight, Users, Star, TrendingUp, Target, Play, Send, CheckCircle2, Award } from 'lucide-react'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import RegistrationModal from '../components/portal/RegistrationModal'
import ProgramHighlights from '../components/about/ProgramHighlights'
import FAQSection from '../components/about/FAQSection'


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
  youtube_url: string | null
}

interface Training {
  id: string
  title: string
  instructor: string
  duration: string
  price: number
  status: string
}

function getYouTubeVideoId(url: string | null): string | null {
  if (!url) return null
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/)
  return match ? match[1] : null
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
  const [regModal, setRegModal] = useState<{ id: string; title: string; type: 'seminar' | 'training' } | null>(null)

  useEffect(() => {
    async function fetchPreview() {
      const [{ data: s }, { data: p }, { data: t }] = await Promise.all([
        supabase.from('seminars').select('id,title,speaker,date,location').order('date', { ascending: true }).limit(2),
        supabase.from('podcasts').select('id,title,episode_number,guest,duration,youtube_url').order('episode_number', { ascending: false }).limit(2),
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
    { icon: Users, label: 'Community Leaders', value: '2,400+' },
    { icon: Star, label: 'Seminars Hosted', value: '18+' },
    { icon: Headphones, label: 'Podcast Episodes', value: '30+' },
    { icon: TrendingUp, label: 'Graduated Trainees', value: '850+' },
  ]

  const pillars = [
    { icon: Target, title: 'Leadership', desc: 'Cultivating strategic leaders who drive measurable, sustainable organizational change.' },
    { icon: BookOpen, title: 'Strategic Decision-Making', desc: 'Practical frameworks for navigating complex choices under market uncertainty.' },
    { icon: Users, title: 'Executive Coaching', desc: 'Personalized mentorship and coaching to unlock high-level performance.' },
    { icon: Award, title: 'Evidence-Based Research', desc: 'Rigorous insights grounded in empirical methodology and leadership science.' },
  ]

  return (
    <div>
      {/* Hero Section — Executive Full-Bleed Banner */}
      <section className="relative bg-[#003826] text-white overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(198,161,90,0.18),_transparent_60%)]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#C6A15A]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C6A15A]/15 border border-[#C6A15A]/40 text-[#C6A15A] text-xs font-bold uppercase tracking-wider">
                <LogoIcon className="w-4 h-4" />
                Institute of Leadership Coaching &amp; Research
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Unlocking Potential, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4B47A] via-[#C6A15A] to-[#E6C98A]">
                  Creating Value!
                </span>
              </h1>

              <p className="text-lg text-slate-200 leading-relaxed max-w-xl font-normal">
                Bilcor is your premier hub for executive seminars, insightful leadership podcasts, and practical skills training built to empower leaders across East Africa and beyond.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/seminars"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#C6A15A] to-[#D4B47A] text-[#003826] font-black uppercase text-xs tracking-wider rounded-md hover:brightness-110 transition shadow-lg active:scale-95"
                >
                  Explore Seminars <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/trainings"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold uppercase text-xs tracking-wider rounded-md border border-white/20 transition backdrop-blur-sm"
                >
                  Browse Trainings
                </Link>
                <a
                  href="https://t.me/bilcoret"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#004D34] hover:bg-[#003826] text-[#C6A15A] font-bold uppercase text-xs tracking-wider rounded-md border border-[#C6A15A]/30 transition"
                >
                  <Send className="w-4 h-4" /> Telegram
                </a>
              </div>

              <div className="pt-6 flex items-center gap-6 text-xs text-slate-300 border-t border-white/10">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#C6A15A]" /> Certified Trainers</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#C6A15A]" /> Research-Backed</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#C6A15A]" /> Active Community</span>
              </div>
            </div>

            {/* Quick Overview Hero Feature Card */}
            <div className="lg:col-span-5">
              <div className="bg-white/5 border border-white/15 rounded-2xl p-6 backdrop-blur-md shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="text-xs font-black uppercase tracking-wider text-[#C6A15A]">Bilcor Snapshot</span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#C6A15A]/20 text-[#C6A15A]">Live Hub</span>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/10 p-4 rounded-xl border border-white/10 flex items-center gap-4 hover:border-[#C6A15A]/50 transition">
                    <div className="w-12 h-12 rounded-lg bg-[#C6A15A]/20 text-[#C6A15A] flex items-center justify-center shrink-0">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-[#C6A15A] font-bold uppercase tracking-wider">Next Seminar</p>
                      <p className="font-bold text-white text-sm">Transformational Leadership 2026</p>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-xl border border-white/10 flex items-center gap-4 hover:border-[#C6A15A]/50 transition">
                    <div className="w-12 h-12 rounded-lg bg-[#C6A15A]/20 text-[#C6A15A] flex items-center justify-center shrink-0">
                      <Headphones className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-[#C6A15A] font-bold uppercase tracking-wider">Podcast Channel</p>
                      <p className="font-bold text-white text-sm">Weekly Leadership Conversations</p>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-xl border border-white/10 flex items-center gap-4 hover:border-[#C6A15A]/50 transition">
                    <div className="w-12 h-12 rounded-lg bg-[#C6A15A]/20 text-[#C6A15A] flex items-center justify-center shrink-0">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-[#C6A15A] font-bold uppercase tracking-wider">Executive Coaching</p>
                      <p className="font-bold text-white text-sm">Custom Growth Cohorts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Ribbon */}
      <section className="bg-white border-b border-slate-200 py-10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
            {stats.map(({ icon: Icon, label, value }, idx) => (
              <div key={label} className={`text-center ${idx !== 0 ? 'pl-4' : ''}`}>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#004D34]/10 text-[#004D34] mb-3">
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-3xl lg:text-4xl font-black text-[#004D34]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{value}</p>
                <p className="text-xs uppercase tracking-wider text-slate-500 mt-1 font-bold">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[#C6A15A] text-xs font-bold uppercase tracking-wider block mb-2">Our Core Pillars</span>
            <h2 className="text-3xl md:text-4xl font-black text-[#004D34]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Built on Academic Excellence &amp; Practical Value
            </h2>
            <p className="text-slate-600 mt-3 text-sm leading-relaxed">
              Four foundational commitments shape our training curricula, research publications, and coaching sessions.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white p-7 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#004D34]/30 transition group flex flex-col">
                <div className="w-12 h-12 rounded-lg bg-[#004D34] text-[#C6A15A] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[#004D34] text-lg mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Seminars */}
      <section className="bg-white py-20 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-[#C6A15A] text-xs font-bold uppercase tracking-wider block mb-1">Seminars &amp; Events</span>
              <h2 className="text-3xl font-black text-[#004D34]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Upcoming Seminars</h2>
            </div>
            <Link to="/seminars" className="inline-flex items-center gap-1.5 text-[#004D34] font-bold hover:text-[#C6A15A] text-xs uppercase tracking-wider transition">
              View all seminars <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              <LoadingSkeleton type="card" count={2} />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {seminars.map(s => (
                <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-7 hover:shadow-lg transition group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#004D34]/10 text-[#004D34] text-xs font-bold uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5 text-[#C6A15A]" />
                        {new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold uppercase">{s.location}</span>
                    </div>

                    <h3 className="text-xl font-bold text-[#004D34] group-hover:text-[#C6A15A] transition mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {s.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold mb-6 flex items-center gap-2">
                      <Mic className="w-4 h-4 text-[#C6A15A]" /> Keynote: {s.speaker}
                    </p>
                  </div>

                  <button
                    onClick={() => setRegModal({ id: s.id, title: s.title, type: 'seminar' })}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#004D34] hover:bg-[#003826] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition"
                  >
                    Reserve Seat
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest Podcasts with YouTube Thumbnails */}
      <section className="bg-slate-50 py-20 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-[#C6A15A] text-xs font-bold uppercase tracking-wider block mb-1">Podcast Channel</span>
              <h2 className="text-3xl font-black text-[#004D34]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Featured Episodes</h2>
            </div>
            <Link to="/podcasts" className="inline-flex items-center gap-1.5 text-[#004D34] font-bold hover:text-[#C6A15A] text-xs uppercase tracking-wider transition">
              All episodes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              <LoadingSkeleton type="card" count={2} />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {podcasts.map(p => {
                const ytId = getYouTubeVideoId(p.youtube_url)
                const thumbnail = ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : null

                return (
                  <div key={p.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition flex flex-col md:flex-row">
                    {thumbnail && (
                      <div className="relative md:w-52 h-44 md:h-auto bg-slate-900 shrink-0">
                        <img
                          src={thumbnail}
                          alt={p.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            if (ytId) {
                              e.currentTarget.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Link
                            to="/podcasts"
                            className="w-12 h-12 rounded-full bg-[#004D34] text-[#C6A15A] flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                          >
                            <Play className="w-5 h-5 ml-0.5 fill-current" />
                          </Link>
                        </div>
                        <span className="absolute bottom-2 left-2 bg-[#004D34] text-[#C6A15A] text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider">
                          Ep {p.episode_number}
                        </span>
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A15A] bg-[#C6A15A]/10 px-2 py-0.5 rounded">
                            Episode {p.episode_number}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">{formatDuration(p.duration)}</span>
                        </div>
                        <h3 className="font-bold text-[#004D34] text-base mb-2 line-clamp-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {p.title}
                        </h3>
                        <p className="text-xs text-slate-500">Guest: {p.guest}</p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <Link
                          to="/podcasts"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004D34] hover:text-[#C6A15A] uppercase tracking-wider"
                        >
                          Listen / Watch <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Featured Trainings */}
      <section className="bg-white py-20 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-[#C6A15A] text-xs font-bold uppercase tracking-wider block mb-1">Executive Education</span>
              <h2 className="text-3xl font-black text-[#004D34]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Featured Training Programs</h2>
            </div>
            <Link to="/trainings" className="inline-flex items-center gap-1.5 text-[#004D34] font-bold hover:text-[#C6A15A] text-xs uppercase tracking-wider transition">
              Explore all programs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              <LoadingSkeleton type="card" count={3} />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {trainings.map(t => (
                <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${
                        t.status === 'ongoing' ? 'bg-emerald-100 text-emerald-800' :
                        t.status === 'upcoming' ? 'bg-[#C6A15A]/20 text-[#003826]' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {t.status}
                      </span>
                      <span className="text-lg font-black text-[#004D34]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        ETB {t.price.toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#004D34] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {t.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-6">{t.instructor} · {t.duration}</p>
                  </div>

                  <button
                    onClick={() => setRegModal({ id: t.id, title: t.title, type: 'training' })}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C6A15A] hover:bg-[#d4b47a] text-[#003826] font-black uppercase text-xs tracking-wider rounded-lg transition"
                  >
                    Enroll Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Program & Coaching Highlights */}
      <ProgramHighlights />
      
      {/* FAQ Accordion Section */}
      <FAQSection />



      {/* CTA Section */}
      <section className="bg-[#003826] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <LogoIcon className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-black mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Ready to Accelerate Your Leadership Journey?
          </h2>
          <p className="text-slate-300 text-base mb-8 max-w-xl mx-auto">
            Join the official Bilcor Telegram community to receive updates on upcoming seminars, research insights, and training releases.
          </p>
          <a
            href="https://t.me/bilcoret"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#C6A15A] to-[#D4B47A] text-[#003826] font-black uppercase text-xs tracking-wider rounded-md hover:brightness-110 transition shadow-lg active:scale-95"
          >
            <Send className="w-4 h-4" /> Join Bilcor Telegram Channel
          </a>
        </div>
      </section>

      {regModal && (
        <RegistrationModal
          open={!!regModal}
          onClose={() => setRegModal(null)}
          itemId={regModal.id}
          itemType={regModal.type}
          itemTitle={regModal.title}
        />
      )}
    </div>
  )
}

