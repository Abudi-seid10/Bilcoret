import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { ClipboardList, Mail, Calendar, BookOpen, CheckCircle2, XCircle, Hourglass, Trash2, Search } from 'lucide-react'

interface Registration {
  id: string
  user_email: string
  type: string
  item_id: string
  status: string
  created_at: string
}

interface ItemLookup {
  [key: string]: { title: string; date?: string }
}

const statusActions = [
  { value: 'pending', label: 'Pending', icon: Hourglass, cls: 'bg-amber-100 text-amber-700' },
  { value: 'approved', label: 'Approve', icon: CheckCircle2, cls: 'bg-green-100 text-green-700' },
  { value: 'rejected', label: 'Reject', icon: XCircle, cls: 'bg-red-100 text-red-700' },
]

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [itemLookup, setItemLookup] = useState<ItemLookup>({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  async function fetchRegistrations(options?: { preserveLoadingState?: boolean }) {
    if (!options?.preserveLoadingState) {
      setLoading(true)
    }
    const { data } = await supabase.from('registrations').select('*').order('created_at', { ascending: false })
    const regs = data ?? []
    setRegistrations(regs)

    const lookup: ItemLookup = {}
    const seminarIds = regs.filter(r => r.type === 'seminar').map(r => r.item_id)
    const trainingIds = regs.filter(r => r.type === 'training').map(r => r.item_id)

    if (seminarIds.length > 0) {
      const { data: seminars } = await supabase.from('seminars').select('id, title, date').in('id', seminarIds)
      seminars?.forEach(s => { lookup[s.id] = { title: s.title, date: s.date ?? undefined } })
    }
    if (trainingIds.length > 0) {
      const { data: trainings } = await supabase.from('trainings').select('id, title').in('id', trainingIds)
      trainings?.forEach(t => { lookup[t.id] = { title: t.title } })
    }

    setItemLookup(lookup)
    setLoading(false)
  }

  useEffect(() => {
    void fetchRegistrations({ preserveLoadingState: true })
  }, [])

  async function updateStatus(id: string, status: string) {
    setUpdating(id)
    await supabase.from('registrations').update({ status }).eq('id', id)
    setUpdating(null)
    fetchRegistrations()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this registration?')) return
    await supabase.from('registrations').delete().eq('id', id)
    fetchRegistrations()
  }

  const filtered = registrations
    .filter(r => filter === 'all' || r.status === filter)
    .filter(r => !search || r.user_email.toLowerCase().includes(search.toLowerCase()))

  const counts = {
    all: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    rejected: registrations.filter(r => r.status === 'rejected').length,
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>Registrations</h1>
        <p className="text-sm text-bilcor-charcoal/50 mt-1">Review and manage user registrations.</p>
      </div>

      {/* Filter tabs + search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 font-bold uppercase text-xs tracking-wide transition ${
                filter === f ? 'bg-bilcor-green text-white' : 'bg-white border border-slate-200 text-bilcor-charcoal/50 hover:border-bilcor-green'
              }`}
              style={{ borderRadius: '4px' }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bilcor-charcoal/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-slate-200 bg-white focus:outline-none focus:border-bilcor-green text-sm transition"
            style={{ borderRadius: '4px' }}
            placeholder="Search by email..."
          />
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-slate-200" style={{ borderRadius: '4px' }}></div>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 text-center" style={{ borderRadius: '4px' }}>
          <ClipboardList className="w-10 h-10 mx-auto mb-3 text-bilcor-green/20" />
          <p className="text-bilcor-charcoal/50 font-medium">No registrations found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(reg => {
            const item = itemLookup[reg.item_id]
            return (
              <div key={reg.id} className="bg-white border border-slate-200 p-4 hover:shadow-sm transition" style={{ borderRadius: '4px' }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-bilcor-green/10 flex items-center justify-center shrink-0" style={{ borderRadius: '4px' }}>
                      {reg.type === 'seminar' ? <Calendar className="w-5 h-5 text-bilcor-green" /> : <BookOpen className="w-5 h-5 text-bilcor-green" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-bilcor-charcoal truncate flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-bilcor-charcoal/30 shrink-0" />
                        {reg.user_email}
                      </p>
                      <p className="text-xs text-bilcor-charcoal/50 mt-0.5 truncate">
                        <span className="font-bold uppercase tracking-wide text-bilcor-gold">{reg.type}</span>
                        {' · '}
                        {item?.title ?? 'Item removed'}
                        {item?.date && ` · ${new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                      </p>
                      <p className="text-xs text-bilcor-charcoal/30 mt-0.5">
                        Registered {new Date(reg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {statusActions.map(({ value, label, icon: Icon, cls }) => (
                      <button
                        key={value}
                        onClick={() => updateStatus(reg.id, value)}
                        disabled={updating === reg.id}
                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition disabled:opacity-50 ${
                          reg.status === value ? cls : 'bg-slate-50 text-bilcor-charcoal/30 hover:bg-slate-100'
                        }`}
                        style={{ borderRadius: '4px' }}
                      >
                        <Icon className="w-3.5 h-3.5 inline mr-1" />
                        {label}
                      </button>
                    ))}
                    <button onClick={() => handleDelete(reg.id)} className="p-1.5 text-bilcor-charcoal/30 hover:text-red-500 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
