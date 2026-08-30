import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { Calendar, Headphones, BookOpen, ClipboardList, ArrowRight, TrendingUp, Hourglass, CheckCircle2, Sparkles, HelpCircle } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ seminars: 0, podcasts: 0, trainings: 0, registrations: 0, pending: 0, approved: 0 })
  const [recentRegs, setRecentRegs] = useState<{ id: string; user_email: string; type: string; status: string; created_at: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const [s, p, t, r] = await Promise.all([
        supabase.from('seminars').select('id', { count: 'exact', head: true }),
        supabase.from('podcasts').select('id', { count: 'exact', head: true }),
        supabase.from('trainings').select('id', { count: 'exact', head: true }),
        supabase.from('registrations').select('id, user_email, type, status, created_at'),
      ])

      const regs = r.data ?? []
      setStats({
        seminars: s.count ?? 0,
        podcasts: p.count ?? 0,
        trainings: t.count ?? 0,
        registrations: regs.length,
        pending: regs.filter((x: { status: string }) => x.status === 'pending').length,
        approved: regs.filter((x: { status: string }) => x.status === 'approved').length,
      })
      setRecentRegs(regs.slice(0, 5).map((x: { id: string; user_email: string; type: string; status: string; created_at: string }) => ({ id: x.id, user_email: x.user_email, type: x.type, status: x.status, created_at: x.created_at })))
      setLoading(false)
    }
    fetchStats()
  }, [])

  const cards = [
    { label: 'Highlights', value: 'Manage', icon: Sparkles, to: '/admin/highlights', color: 'text-bilcor-green' },
    { label: 'FAQs', value: 'Manage', icon: HelpCircle, to: '/admin/faqs', color: 'text-bilcor-green' },
    { label: 'Seminars', value: stats.seminars, icon: Calendar, to: '/admin/seminars', color: 'text-bilcor-green' },
    { label: 'Podcasts', value: stats.podcasts, icon: Headphones, to: '/admin/podcasts', color: 'text-bilcor-green' },
    { label: 'Trainings', value: stats.trainings, icon: BookOpen, to: '/admin/trainings', color: 'text-bilcor-green' },
    { label: 'Registrations', value: stats.registrations, icon: ClipboardList, to: '/admin/registrations', color: 'text-bilcor-green' },
  ]


  if (loading) {
    return <div className="animate-pulse space-y-6">
      <div className="h-8 bg-slate-200 rounded w-48" style={{ borderRadius: '4px' }}></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-200" style={{ borderRadius: '4px' }}></div>)}
      </div>
    </div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>Dashboard</h1>
        <p className="text-sm text-bilcor-charcoal/50 mt-1">Overview of your platform activity.</p>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            className="bg-white border border-slate-200 p-5 hover:shadow-md transition group"
            style={{ borderRadius: '4px' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-bilcor-green/10 flex items-center justify-center" style={{ borderRadius: '4px' }}>
                <Icon className="w-5 h-5 text-bilcor-green" />
              </div>
              <ArrowRight className="w-4 h-4 text-bilcor-charcoal/20 group-hover:text-bilcor-green transition" />
            </div>
            <p className="text-3xl font-black text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>{value}</p>
            <p className="text-sm text-bilcor-charcoal/50 font-medium">{label}</p>
          </Link>
        ))}
      </div>

      {/* Registration summary */}
      <div className="grid lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 p-5" style={{ borderRadius: '4px' }}>
          <div className="flex items-center gap-2 mb-2">
            <Hourglass className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-bold text-bilcor-charcoal/70">Pending</span>
          </div>
          <p className="text-2xl font-black text-bilcor-charcoal" style={{ fontFamily: 'Montserrat, sans-serif' }}>{stats.pending}</p>
        </div>
        <div className="bg-white border border-slate-200 p-5" style={{ borderRadius: '4px' }}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-bold text-bilcor-charcoal/70">Approved</span>
          </div>
          <p className="text-2xl font-black text-bilcor-charcoal" style={{ fontFamily: 'Montserrat, sans-serif' }}>{stats.approved}</p>
        </div>
        <div className="bg-white border border-slate-200 p-5" style={{ borderRadius: '4px' }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-bilcor-green" />
            <span className="text-sm font-bold text-bilcor-charcoal/70">Total</span>
          </div>
          <p className="text-2xl font-black text-bilcor-charcoal" style={{ fontFamily: 'Montserrat, sans-serif' }}>{stats.registrations}</p>
        </div>
      </div>

      {/* Recent registrations */}
      <div className="bg-white border border-slate-200" style={{ borderRadius: '4px' }}>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>Recent Registrations</h2>
          <Link to="/admin/registrations" className="text-xs font-bold uppercase tracking-wide text-bilcor-green hover:text-bilcor-gold transition">
            View all
          </Link>
        </div>
        {recentRegs.length === 0 ? (
          <div className="p-8 text-center text-sm text-bilcor-charcoal/40">No registrations yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentRegs.map(reg => (
              <div key={reg.id} className="p-4 flex items-center justify-between hover:bg-bilcor-offwhite/50 transition">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-bilcor-green/10 flex items-center justify-center shrink-0" style={{ borderRadius: '4px' }}>
                    {reg.type === 'seminar' ? <Calendar className="w-4 h-4 text-bilcor-green" /> : <BookOpen className="w-4 h-4 text-bilcor-green" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-bilcor-charcoal truncate">{reg.user_email}</p>
                    <p className="text-xs text-bilcor-charcoal/40 capitalize">{reg.type} · {new Date(reg.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wide shrink-0 ${
                  reg.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  reg.status === 'approved' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`} style={{ borderRadius: '4px' }}>
                  {reg.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
