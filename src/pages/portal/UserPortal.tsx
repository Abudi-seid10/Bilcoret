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
  pending: { icon: Hourglass, label: 'Pending', cls: 'bg-amber-100 text-amber-700' },
  approved: { icon: CheckCircle2, label: 'Approved', cls: 'bg-green-100 text-green-700' },
  rejected: { icon: XCircle, label: 'Rejected', cls: 'bg-red-100 text-red-700' },
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
      <section className="bg-bilcor-green text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-bilcor-gold text-xs font-semibold tracking-label mb-3 block">User Portal</span>
          <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            My Registrations
          </h1>
          <p className="text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
            Enter your email to view your seminar and training registration status.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Search */}
        <form onSubmit={handleSearch} className="mb-10">
          <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-2 block">
            Email Address
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bilcor-charcoal/30" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-3 border border-slate-300 focus:outline-none focus:border-bilcor-green text-sm transition"
                style={{ borderRadius: '4px' }}
                placeholder="jane@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-bilcor-green text-white font-bold uppercase text-sm tracking-wide hover:bg-bilcor-green-light transition disabled:opacity-60"
              style={{ borderRadius: '4px' }}
            >
              <Search className="w-4 h-4" /> {loading ? 'Searching...' : 'Look Up'}
            </button>
          </div>
        </form>

        {/* Results */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-6" style={{ borderRadius: '4px' }}>
            {error}
          </div>
        )}

        {searched && !loading && registrations.length === 0 && !error && (
          <div className="text-center py-16 text-bilcor-charcoal/40">
            <Mail className="w-12 h-12 mx-auto mb-4 text-bilcor-green/20" />
            <p className="text-lg font-semibold text-bilcor-charcoal/60" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              No registrations found
            </p>
            <p className="text-sm mt-1">We couldn't find any registrations for {email}.</p>
          </div>
        )}

        {registrations.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-bilcor-green mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {registrations.length} Registration{registrations.length > 1 ? 's' : ''}
            </h2>
            <div className="space-y-4">
              {registrations.map(reg => {
                const item = itemLookup[reg.item_id]
                const cfg = statusConfig[reg.status] ?? statusConfig.pending
                const StatusIcon = cfg.icon
                return (
                  <div key={reg.id} className="bg-white border border-slate-200 p-5 hover:shadow-md transition" style={{ borderRadius: '4px' }}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-11 h-11 bg-bilcor-green/10 flex items-center justify-center shrink-0" style={{ borderRadius: '4px' }}>
                          {reg.type === 'seminar' ? (
                            <Calendar className="w-5 h-5 text-bilcor-green" />
                          ) : (
                            <BookOpen className="w-5 h-5 text-bilcor-green" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold uppercase tracking-wide text-bilcor-gold mb-1 block">
                            {reg.type}
                          </span>
                          <h3 className="font-bold text-bilcor-green truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {item?.title ?? 'Item no longer available'}
                          </h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-bilcor-charcoal/50 mt-1">
                            {item?.date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            )}
                            {item?.instructor && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {item.instructor}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              Registered {new Date(reg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide shrink-0 flex items-center gap-1.5 ${cfg.cls}`} style={{ borderRadius: '4px' }}>
                        <StatusIcon className="w-3.5 h-3.5" />
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
