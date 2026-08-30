import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Search, Calendar, BookOpen, Clock, CheckCircle2, XCircle, Hourglass, Mail } from 'lucide-react'

interface Registration {
  id: string
  user_email: string
  type: string
  item_id: string
  status: string
  created_at: string
}

interface ItemLookup {
  [key: string]: { title: string; date?: string; instructor?: string; duration?: string }
}

const statusConfig: Record<string, { icon: typeof CheckCircle2; label: string; cls: string }> = {
  pending: { icon: Hourglass, label: 'Under Review', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  approved: { icon: CheckCircle2, label: 'Registration Confirmed', cls: 'bg-emerald-50 text-emerald-800 border border-emerald-200' },
  rejected: { icon: XCircle, label: 'Not Approved', cls: 'bg-rose-50 text-rose-700 border border-rose-200' },
}

export default function UserPortal() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [itemLookup, setItemLookup] = useState<ItemLookup>({})
  const [error, setError] = useState('')

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    setSearched(true)

    const { data: regs, error: regError } = await supabase
      .from('registrations')
      .select('id, user_email, type, item_id, status, created_at')
      .ilike('user_email', email.trim())

    if (regError) {
      setError(regError.message)
      setRegistrations([])
    } else if (!regs || regs.length === 0) {
      setRegistrations([])
      setItemLookup({})
    } else {
      const seminarIds = regs.filter((r: Registration) => r.type === 'seminar').map((r: Registration) => r.item_id)
      const trainingIds = regs.filter((r: Registration) => r.type === 'training').map((r: Registration) => r.item_id)

      const lookup: ItemLookup = {}

      if (seminarIds.length > 0) {
        const { data: seminars } = await supabase
          .from('seminars')
          .select('id, title, date')
          .in('id', seminarIds)
        seminars?.forEach((s: { id: string; title: string; date?: string }) => { lookup[s.id] = { title: s.title, date: s.date } })
      }

      if (trainingIds.length > 0) {
        const { data: trainings } = await supabase
          .from('trainings')
          .select('id, title, instructor, duration')
          .in('id', trainingIds)
        trainings?.forEach((t: { id: string; title: string; instructor?: string; duration?: string }) => { lookup[t.id] = { title: t.title, instructor: t.instructor, duration: t.duration } })
      }

      setItemLookup(lookup)
      setRegistrations(regs)
    }
    setLoading(false)
  }

  return (
    <div>
      {/* Banner */}
      <section className="bg-[#003826] text-white py-16 lg:py-20 border-b border-[#C6A15A]/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-[#C6A15A] text-xs font-bold uppercase tracking-wider block">Participant Portal</span>
          <h1 className="text-4xl md:text-5xl font-black" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Registration Lookup
          </h1>
          <p className="text-base text-slate-200 max-w-xl mx-auto leading-relaxed">
            Enter your email address below to review your seminar seats and training cohort status.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Search Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-10">
          <form onSubmit={handleSearch} className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-[#004D34] block">
              Registered Email Address
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#004D34] transition"
                  placeholder="e.g. executive@organization.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#004D34] hover:bg-[#003826] text-white font-bold uppercase text-xs tracking-wider rounded-lg transition disabled:opacity-60 shadow-xs"
              >
                <Search className="w-4 h-4 text-[#C6A15A]" /> {loading ? 'Searching...' : 'Search Status'}
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium px-4 py-3.5 rounded-xl mb-6">
            {error}
          </div>
        )}

        {searched && !loading && registrations.length === 0 && !error && (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <Mail className="w-12 h-12 mx-auto mb-3 text-[#004D34]/30" />
            <p className="text-lg font-bold text-[#004D34]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              No Registrations Found
            </p>
            <p className="text-xs text-slate-500 mt-1">We couldn't locate any active registrations for <span className="font-semibold">{email}</span>.</p>
          </div>
        )}

        {registrations.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h2 className="text-lg font-bold text-[#004D34]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Your Registrations ({registrations.length})
              </h2>
              <span className="text-xs text-slate-500 font-medium">Verified Records</span>
            </div>

            <div className="space-y-4">
              {registrations.map(reg => {
                const item = itemLookup[reg.item_id]
                const cfg = statusConfig[reg.status] ?? statusConfig.pending
                const StatusIcon = cfg.icon

                return (
                  <div key={reg.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-[#004D34]/10 text-[#004D34] flex items-center justify-center shrink-0">
                          {reg.type === 'seminar' ? (
                            <Calendar className="w-6 h-6 text-[#C6A15A]" />
                          ) : (
                            <BookOpen className="w-6 h-6 text-[#C6A15A]" />
                          )}
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A15A] block">
                            {reg.type}
                          </span>
                          <h3 className="font-bold text-[#004D34] text-base truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {item?.title ?? 'Item Record'}
                          </h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                            {item?.date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            )}
                            {item?.instructor && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                Instructor: {item.instructor}
                              </span>
                            )}
                            <span className="text-slate-400">
                              Registered: {new Date(reg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg shrink-0 flex items-center gap-2 ${cfg.cls}`}>
                        <StatusIcon className="w-4 h-4 shrink-0" />
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

