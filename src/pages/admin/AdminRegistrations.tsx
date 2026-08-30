import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { sendStatusEmail } from '../../lib/emailService'
import { ClipboardList, Mail, Calendar, BookOpen, CheckCircle2, XCircle, Hourglass, Trash2, Search, ChevronDown, ChevronUp, Users } from 'lucide-react'

interface Registration {
  id: string
  user_email: string
  user_name: string | null
  type: string
  item_id: string
  status: string
  created_at: string
}

interface EventItem {
  id: string
  title: string
  date?: string
  type: 'seminar' | 'training'
}

interface EventGroup {
  item: EventItem
  registrations: Registration[]
}

const statusActions = [
  { value: 'pending', label: 'Pending', icon: Hourglass, cls: 'bg-amber-100 text-amber-700' },
  { value: 'approved', label: 'Approve', icon: CheckCircle2, cls: 'bg-green-100 text-green-700' },
  { value: 'rejected', label: 'Reject', icon: XCircle, cls: 'bg-red-100 text-red-700' },
]

export default function AdminRegistrations() {
  const [groups, setGroups] = useState<EventGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  async function fetchRegistrations() {
    const { data: regs } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false })

    const allRegs: Registration[] = regs ?? []

    // Fetch referenced items
    const seminarIds = [...new Set(allRegs.filter(r => r.type === 'seminar').map(r => r.item_id))]
    const trainingIds = [...new Set(allRegs.filter(r => r.type === 'training').map(r => r.item_id))]

    const itemMap: Record<string, EventItem> = {}

    if (seminarIds.length > 0) {
      const { data: seminars } = await supabase.from('seminars').select('id, title, date').in('id', seminarIds)
      seminars?.forEach((s: { id: string; title: string; date?: string }) => {
        itemMap[s.id] = { id: s.id, title: s.title, date: s.date ?? undefined, type: 'seminar' }
      })
    }
    if (trainingIds.length > 0) {
      const { data: trainings } = await supabase.from('trainings').select('id, title').in('id', trainingIds)
      trainings?.forEach((t: { id: string; title: string }) => {
        itemMap[t.id] = { id: t.id, title: t.title, type: 'training' }
      })
    }

    // Group registrations by item, ordered by latest seminar/training date then by item title
    const groupMap: Record<string, EventGroup> = {}
    for (const reg of allRegs) {
      const item = itemMap[reg.item_id] ?? {
        id: reg.item_id,
        title: 'Unknown / Deleted Item',
        type: reg.type as 'seminar' | 'training',
      }
      if (!groupMap[reg.item_id]) groupMap[reg.item_id] = { item, registrations: [] }
      groupMap[reg.item_id].registrations.push(reg)
    }

    // Sort: seminars with date first (most recent date first), then trainings, then unknowns
    const sorted = Object.values(groupMap).sort((a, b) => {
      const aDate = a.item.date ? new Date(a.item.date).getTime() : null
      const bDate = b.item.date ? new Date(b.item.date).getTime() : null
      if (aDate && bDate) return bDate - aDate
      if (aDate) return -1
      if (bDate) return 1
      return a.item.title.localeCompare(b.item.title)
    })

    setGroups(sorted)

    // Auto-expand all groups on first load
    setExpanded(new Set(sorted.map(g => g.item.id)))
    setLoading(false)
  }

  useEffect(() => { fetchRegistrations() }, [])

  async function updateStatus(reg: Registration, item: EventItem, status: string) {
    if (reg.status === status) return
    setUpdating(reg.id)
    await supabase.from('registrations').update({ status }).eq('id', reg.id)

    if (status === 'approved' || status === 'rejected') {
      sendStatusEmail({
        user_email: reg.user_email,
        user_name: reg.user_name,
        item_title: item.title,
        item_type: item.type,
        status,
      })
    }

    setUpdating(null)
    fetchRegistrations()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this registration?')) return
    await supabase.from('registrations').delete().eq('id', id)
    fetchRegistrations()
  }

  function toggleGroup(itemId: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  const totalCounts = {
    all: groups.reduce((n, g) => n + g.registrations.length, 0),
    pending: groups.reduce((n, g) => n + g.registrations.filter(r => r.status === 'pending').length, 0),
    approved: groups.reduce((n, g) => n + g.registrations.filter(r => r.status === 'approved').length, 0),
    rejected: groups.reduce((n, g) => n + g.registrations.filter(r => r.status === 'rejected').length, 0),
  }

  const visibleGroups = groups
    .map(g => ({
      ...g,
      registrations: g.registrations
        .filter(r => filter === 'all' || r.status === filter)
        .filter(r => !search || r.user_email.toLowerCase().includes(search.toLowerCase()) || (r.user_name ?? '').toLowerCase().includes(search.toLowerCase())),
    }))
    .filter(g => g.registrations.length > 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>Registrations</h1>
        <p className="text-sm text-bilcor-charcoal/50 mt-1">Review registrations grouped by seminar or training.</p>
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
              {f.charAt(0).toUpperCase() + f.slice(1)} ({totalCounts[f]})
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
            placeholder="Search by name or email..."
          />
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-200" style={{ borderRadius: '4px' }}></div>)}
        </div>
      ) : visibleGroups.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 text-center" style={{ borderRadius: '4px' }}>
          <ClipboardList className="w-10 h-10 mx-auto mb-3 text-bilcor-green/20" />
          <p className="text-bilcor-charcoal/50 font-medium">No registrations found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleGroups.map(group => {
            const isOpen = expanded.has(group.item.id)
            const regCounts = {
              pending: group.registrations.filter(r => r.status === 'pending').length,
              approved: group.registrations.filter(r => r.status === 'approved').length,
              rejected: group.registrations.filter(r => r.status === 'rejected').length,
            }
            return (
              <div key={group.item.id} className="bg-white border border-slate-200" style={{ borderRadius: '4px' }}>
                {/* Event header */}
                <button
                  onClick={() => toggleGroup(group.item.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-bilcor-green/10 flex items-center justify-center shrink-0" style={{ borderRadius: '4px' }}>
                      {group.item.type === 'seminar' ? (
                        <Calendar className="w-5 h-5 text-bilcor-green" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-bilcor-green" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold uppercase tracking-wide text-bilcor-gold">{group.item.type}</span>
                        {group.item.date && (
                          <span className="text-xs text-bilcor-charcoal/40">
                            {new Date(group.item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-bilcor-green truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>{group.item.title}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-bilcor-charcoal/50">
                      <Users className="w-3.5 h-3.5" />
                      <span>{group.registrations.length}</span>
                    </div>
                    {regCounts.pending > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-700" style={{ borderRadius: '4px' }}>
                        {regCounts.pending} pending
                      </span>
                    )}
                    {regCounts.approved > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-700" style={{ borderRadius: '4px' }}>
                        {regCounts.approved} approved
                      </span>
                    )}
                    {isOpen ? <ChevronUp className="w-4 h-4 text-bilcor-charcoal/30" /> : <ChevronDown className="w-4 h-4 text-bilcor-charcoal/30" />}
                  </div>
                </button>

                {/* Registrants list */}
                {isOpen && (
                  <div className="border-t border-slate-100 divide-y divide-slate-100">
                    {group.registrations.map(reg => (
                      <div key={reg.id} className="px-4 py-3 hover:bg-slate-50/50 transition">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="min-w-0">
                              {reg.user_name && (
                                <p className="text-sm font-medium text-bilcor-charcoal truncate">{reg.user_name}</p>
                              )}
                              <p className={`text-sm flex items-center gap-1.5 truncate ${reg.user_name ? 'text-bilcor-charcoal/50' : 'font-medium text-bilcor-charcoal'}`}>
                                <Mail className="w-3.5 h-3.5 text-bilcor-charcoal/30 shrink-0" />
                                {reg.user_email}
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
                                onClick={() => updateStatus(reg, group.item, value)}
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
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

