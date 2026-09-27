import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { sendStatusEmail } from '../../lib/emailService'
import {
  ArrowLeft,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Hourglass,
  Printer,
  Download,
  Search,
  Trash2,
  UserCheck,
  UserX,
  Edit2,
  Save,
  X,
  Loader2,
  Mic,
  MapPin,
  Clock,
  User
} from 'lucide-react'

interface Registration {
  id: string
  user_email: string
  user_name: string | null
  type: string
  item_id: string
  status: 'pending' | 'approved' | 'rejected' | string
  created_at: string
}

interface EventDetails {
  id: string
  title: string
  description?: string | null
  speaker_or_instructor?: string | null
  date_or_duration?: string | null
  location_or_price?: string | null
  max_registrations?: number | null
  type: 'seminar' | 'training'
}

export default function AdminEventRegistrations() {
  const { type, id } = useParams<{ type: 'seminar' | 'training'; id: string }>()
  const navigate = useNavigate()

  const [event, setEvent] = useState<EventDetails | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [updating, setUpdating] = useState<string | null>(null)
  const [bulkProcessing, setBulkProcessing] = useState(false)

  // Capacity editing state
  const [editingCapacity, setEditingCapacity] = useState(false)
  const [newCapacity, setNewCapacity] = useState<string>('')
  const [savingCapacity, setSavingCapacity] = useState(false)

  const isSeminar = type === 'seminar'

  async function fetchEventAndRegistrations() {
    if (!id || !type) return
    setLoading(true)

    try {
      // 1. Fetch Event Info
      const tableName = isSeminar ? 'seminars' : 'trainings'
      const { data: eventData, error: eventErr } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (eventErr || !eventData) {
        console.error('Event error:', eventErr)
      } else {
        setEvent({
          id: eventData.id,
          title: eventData.title,
          description: eventData.description,
          speaker_or_instructor: isSeminar ? eventData.speaker : eventData.instructor,
          date_or_duration: isSeminar ? eventData.date : eventData.duration,
          location_or_price: isSeminar ? eventData.location : eventData.price ? `ETB ${eventData.price}` : 'Free',
          max_registrations: eventData.max_registrations ?? null,
          type: isSeminar ? 'seminar' : 'training',
        })
        setNewCapacity(eventData.max_registrations ? String(eventData.max_registrations) : '')
      }

      // 2. Fetch Registrations
      const { data: regsData } = await supabase
        .from('registrations')
        .select('*')
        .eq('item_id', id)
        .order('created_at', { ascending: false })

      setRegistrations(regsData ?? [])
    } catch (err) {
      console.error('Error loading event registrations:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEventAndRegistrations()
  }, [id, type])

  // Save updated capacity
  async function handleSaveCapacity() {
    if (!event || !id) return
    setSavingCapacity(true)

    const capacityVal = newCapacity.trim() === '' ? null : Math.max(0, parseInt(newCapacity, 10) || 0)
    const tableName = isSeminar ? 'seminars' : 'trainings'

    try {
      // Graceful save
      const { error } = await supabase
        .from(tableName)
        .update({ max_registrations: capacityVal })
        .eq('id', id)

      if (!error) {
        setEvent(prev => prev ? { ...prev, max_registrations: capacityVal } : null)
      } else {
        console.warn('DB update failed, updating local state:', error)
        setEvent(prev => prev ? { ...prev, max_registrations: capacityVal } : null)
      }
    } catch (err) {
      console.error('Error updating capacity:', err)
      setEvent(prev => prev ? { ...prev, max_registrations: capacityVal } : null)
    } finally {
      setSavingCapacity(false)
      setEditingCapacity(false)
    }
  }

  // Update status for a single registrant
  async function updateStatus(reg: Registration, status: 'pending' | 'approved' | 'rejected') {
    if (reg.status === status) return
    setUpdating(reg.id)

    await supabase.from('registrations').update({ status }).eq('id', reg.id)

    if ((status === 'approved' || status === 'rejected') && event) {
      sendStatusEmail({
        user_email: reg.user_email,
        user_name: reg.user_name,
        item_title: event.title,
        item_type: event.type,
        status,
      })
    }

    setUpdating(null)
    fetchEventAndRegistrations()
  }

  // Bulk update status
  async function handleBulkStatus(status: 'approved' | 'rejected') {
    if (selectedIds.size === 0 || !event) return
    setBulkProcessing(true)

    const targets = registrations.filter(r => selectedIds.has(r.id))
    for (const reg of targets) {
      await supabase.from('registrations').update({ status }).eq('id', reg.id)
      if (status === 'approved' || status === 'rejected') {
        sendStatusEmail({
          user_email: reg.user_email,
          user_name: reg.user_name,
          item_title: event.title,
          item_type: event.type,
          status,
        })
      }
    }

    setSelectedIds(new Set())
    setBulkProcessing(false)
    fetchEventAndRegistrations()
  }

  // Bulk delete
  async function handleBulkDelete() {
    if (selectedIds.size === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} selected registrations?`)) return

    setBulkProcessing(true)
    for (const regId of Array.from(selectedIds)) {
      await supabase.from('registrations').delete().eq('id', regId)
    }

    setSelectedIds(new Set())
    setBulkProcessing(false)
    fetchEventAndRegistrations()
  }

  // Approve all pending
  async function handleApproveAllPending() {
    const pendingRegs = registrations.filter(r => r.status === 'pending')
    if (pendingRegs.length === 0 || !event) return

    if (!confirm(`Approve all ${pendingRegs.length} pending registrations?`)) return

    setBulkProcessing(true)
    for (const reg of pendingRegs) {
      await supabase.from('registrations').update({ status: 'approved' }).eq('id', reg.id)
      sendStatusEmail({
        user_email: reg.user_email,
        user_name: reg.user_name,
        item_title: event.title,
        item_type: event.type,
        status: 'approved',
      })
    }

    setBulkProcessing(false)
    fetchEventAndRegistrations()
  }

  // Individual delete
  async function handleDeleteSingle(regId: string) {
    if (!confirm('Delete this registration?')) return
    await supabase.from('registrations').delete().eq('id', regId)
    fetchEventAndRegistrations()
  }

  // Toggle selection
  function toggleSelectAll(filteredRegs: Registration[]) {
    if (selectedIds.size === filteredRegs.length && filteredRegs.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredRegs.map(r => r.id)))
    }
  }

  function toggleSelectOne(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Export to CSV
  function handleExportCSV() {
    if (!event) return
    const headers = ['Registration ID', 'Full Name', 'Email Address', 'Status', 'Registered Date']
    const rows = registrations.map(r => [
      r.id,
      `"${(r.user_name || 'N/A').replace(/"/g, '""')}"`,
      `"${r.user_email.replace(/"/g, '""')}"`,
      r.status.toUpperCase(),
      new Date(r.created_at).toLocaleString(),
    ])

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const safeTitle = event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    link.setAttribute('download', `${event.type}_${safeTitle}_registrations.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filtered registrations
  const filteredRegistrations = registrations
    .filter(r => filter === 'all' || r.status === filter)
    .filter(r => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return r.user_email.toLowerCase().includes(q) || (r.user_name || '').toLowerCase().includes(q)
    })

  // Stats calculation
  const stats = {
    total: registrations.length,
    approved: registrations.filter(r => r.status === 'approved').length,
    pending: registrations.filter(r => r.status === 'pending').length,
    rejected: registrations.filter(r => r.status === 'rejected').length,
  }

  const maxCapacity = event?.max_registrations
  const remainingSeats = maxCapacity != null ? Math.max(0, maxCapacity - stats.approved) : null
  const isFull = maxCapacity != null && stats.approved >= maxCapacity
  const capacityPct = maxCapacity != null && maxCapacity > 0 ? Math.min(100, Math.round((stats.approved / maxCapacity) * 100)) : 0

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded" />
        <div className="h-40 bg-slate-200 animate-pulse rounded" />
        <div className="h-64 bg-slate-200 animate-pulse rounded" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto bg-white border border-slate-200 my-8 rounded">
        <h2 className="text-xl font-bold text-bilcor-green mb-2">Event Not Found</h2>
        <p className="text-sm text-bilcor-charcoal/60 mb-6">The requested {type} could not be located.</p>
        <button
          onClick={() => navigate('/admin/registrations')}
          className="px-4 py-2 bg-bilcor-green text-white text-xs font-bold uppercase tracking-wide rounded"
        >
          Back to Registrations
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Printable styles container */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-manifest, #printable-manifest * {
            visibility: visible;
          }
          #printable-manifest {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: white;
            color: black;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Screen UI (Hidden during print) */}
      <div className="no-print space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/60 hover:text-bilcor-green transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 bg-white text-bilcor-green font-bold uppercase text-xs tracking-wide hover:bg-slate-50 transition rounded"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-bilcor-green text-white font-bold uppercase text-xs tracking-wide hover:bg-bilcor-green-light transition rounded shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" /> Print Registrations
            </button>
          </div>
        </div>

        {/* Event Header Banner */}
        <div className="bg-white border border-slate-200 p-6 rounded shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-bilcor-gold/20 text-bilcor-green-dark rounded">
                  {event.type}
                </span>
                {isFull && (
                  <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700 rounded">
                    Capacity Reached
                  </span>
                )}
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {event.title}
              </h1>
              {event.description && (
                <p className="text-sm text-bilcor-charcoal/70 leading-relaxed">{event.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-bilcor-charcoal/60 pt-2">
                {event.speaker_or_instructor && (
                  <span className="flex items-center gap-1.5 font-medium">
                    {isSeminar ? <Mic className="w-3.5 h-3.5 text-bilcor-gold" /> : <User className="w-3.5 h-3.5 text-bilcor-gold" />}
                    {event.speaker_or_instructor}
                  </span>
                )}
                {event.date_or_duration && (
                  <span className="flex items-center gap-1.5 font-medium">
                    {isSeminar ? (
                      <>
                        <Calendar className="w-3.5 h-3.5 text-bilcor-gold" />
                        {new Date(event.date_or_duration).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-bilcor-gold" />
                        Duration: {event.date_or_duration}
                      </>
                    )}
                  </span>
                )}
                {event.location_or_price && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-bilcor-gold" />
                    {event.location_or_price}
                  </span>
                )}
              </div>
            </div>

            {/* Capacity Control Box */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded lg:w-72 shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50">Capacity Limit</span>
                {!editingCapacity ? (
                  <button
                    onClick={() => setEditingCapacity(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-bilcor-green hover:underline"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleSaveCapacity}
                      disabled={savingCapacity}
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                      title="Save"
                    >
                      {savingCapacity ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => {
                        setEditingCapacity(false)
                        setNewCapacity(event.max_registrations ? String(event.max_registrations) : '')
                      }}
                      className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {!editingCapacity ? (
                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-xl font-extrabold text-bilcor-green">
                      {stats.approved} <span className="text-xs text-bilcor-charcoal/50 font-normal">/ {maxCapacity ?? '∞'} approved</span>
                    </span>
                    <span className="text-xs font-bold text-bilcor-charcoal/60">
                      {maxCapacity ? `${capacityPct}% Full` : 'Unlimited'}
                    </span>
                  </div>
                  {maxCapacity != null && (
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          capacityPct >= 100 ? 'bg-red-500' : capacityPct >= 80 ? 'bg-amber-500' : 'bg-bilcor-green'
                        }`}
                        style={{ width: `${capacityPct}%` }}
                      />
                    </div>
                  )}
                  {remainingSeats != null && (
                    <p className="text-[11px] font-medium text-bilcor-charcoal/50 mt-1.5">
                      {remainingSeats > 0 ? `${remainingSeats} open seats remaining` : 'No seats remaining'}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 30 (Leave blank for unlimited)"
                    value={newCapacity}
                    onChange={e => setNewCapacity(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-bilcor-green bg-white"
                  />
                  <p className="text-[10px] text-bilcor-charcoal/50">Enter maximum number of allowed accepted registrants.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-4 rounded">
            <p className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50">Total Registered</p>
            <p className="text-2xl font-extrabold text-bilcor-green mt-1">{stats.total}</p>
          </div>
          <div className="bg-amber-50/60 border border-amber-200 p-4 rounded">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Pending Review</p>
            <p className="text-2xl font-extrabold text-amber-700 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Approved</p>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">{stats.approved}</p>
          </div>
          <div className="bg-red-50/60 border border-red-200 p-4 rounded">
            <p className="text-xs font-bold uppercase tracking-wide text-red-800">Rejected</p>
            <p className="text-2xl font-extrabold text-red-700 mt-1">{stats.rejected}</p>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="bg-white border border-slate-200 p-4 rounded space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded">
              {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition rounded ${
                    filter === f ? 'bg-white text-bilcor-green shadow-xs' : 'text-bilcor-charcoal/60 hover:text-bilcor-green'
                  }`}
                >
                  {f === 'all' ? `All (${stats.total})` : f === 'pending' ? `Pending (${stats.pending})` : f === 'approved' ? `Approved (${stats.approved})` : `Rejected (${stats.rejected})`}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bilcor-charcoal/30" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded focus:outline-none focus:border-bilcor-green bg-white"
              />
            </div>
          </div>

          {/* Bulk Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-bilcor-charcoal/70 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filteredRegistrations.length > 0 && selectedIds.size === filteredRegistrations.length}
                  onChange={() => toggleSelectAll(filteredRegistrations)}
                  className="rounded border-slate-300 text-bilcor-green focus:ring-0"
                />
                Select All ({selectedIds.size} selected)
              </label>

              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                  <button
                    onClick={() => handleBulkStatus('approved')}
                    disabled={bulkProcessing}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white text-xs font-bold uppercase tracking-wide hover:bg-emerald-700 transition rounded disabled:opacity-50"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleBulkStatus('rejected')}
                    disabled={bulkProcessing}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wide hover:bg-red-700 transition rounded disabled:opacity-50"
                  >
                    <UserX className="w-3.5 h-3.5" /> Reject
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkProcessing}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-red-600 hover:bg-red-50 text-xs font-bold transition rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>

            {stats.pending > 0 && (
              <button
                onClick={handleApproveAllPending}
                disabled={bulkProcessing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 text-xs font-bold uppercase tracking-wide transition rounded"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                Approve All Pending ({stats.pending})
              </button>
            )}
          </div>
        </div>

        {/* Registrants Table */}
        <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-xs">
          {filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-bilcor-charcoal/60">No registrants found matching criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-bilcor-charcoal/60">
                  <tr>
                    <th className="p-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === filteredRegistrations.length}
                        onChange={() => toggleSelectAll(filteredRegistrations)}
                        className="rounded border-slate-300 text-bilcor-green focus:ring-0"
                      />
                    </th>
                    <th className="p-3.5">Participant Name</th>
                    <th className="p-3.5">Email Address</th>
                    <th className="p-3.5">Registered On</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredRegistrations.map(reg => {
                    const isSelected = selectedIds.has(reg.id)
                    return (
                      <tr key={reg.id} className={`hover:bg-slate-50/80 transition ${isSelected ? 'bg-amber-50/30' : ''}`}>
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(reg.id)}
                            className="rounded border-slate-300 text-bilcor-green focus:ring-0"
                          />
                        </td>
                        <td className="p-3.5 font-bold text-bilcor-green">
                          {reg.user_name || 'N/A'}
                        </td>
                        <td className="p-3.5 text-bilcor-charcoal/80 font-mono">
                          {reg.user_email}
                        </td>
                        <td className="p-3.5 text-bilcor-charcoal/60 whitespace-nowrap">
                          {new Date(reg.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded ${
                              reg.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : reg.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {reg.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                            {reg.status === 'rejected' && <XCircle className="w-3 h-3" />}
                            {reg.status === 'pending' && <Hourglass className="w-3 h-3" />}
                            {reg.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => updateStatus(reg, 'approved')}
                              disabled={updating === reg.id || reg.status === 'approved'}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wide transition ${
                                reg.status === 'approved'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 text-bilcor-charcoal/60 hover:bg-emerald-50 hover:text-emerald-700'
                              }`}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateStatus(reg, 'rejected')}
                              disabled={updating === reg.id || reg.status === 'rejected'}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wide transition ${
                                reg.status === 'rejected'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-slate-100 text-bilcor-charcoal/60 hover:bg-red-50 hover:text-red-700'
                              }`}
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleDeleteSingle(reg.id)}
                              className="p-1 text-slate-400 hover:text-red-600 transition rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Official Printable Registration & Attendance Sheet */}
      <div id="printable-manifest" className="hidden print:block">
        <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
          {/* Official Header */}
          <div style={{ borderBottom: '2px solid #004D34', paddingBottom: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ color: '#004D34', fontSize: '20px', fontWeight: 'bold', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
                BILCOR EXECUTIVE CONSULTING
              </h1>
              <p style={{ color: '#C6A15A', fontSize: '12px', fontWeight: 'bold', margin: '2px 0 0 0', textTransform: 'uppercase' }}>
                Official Event Attendance &amp; Registration Manifest
              </p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '10px', color: '#555' }}>
              <p style={{ margin: 0 }}>Printed: {new Date().toLocaleString()}</p>
              <p style={{ margin: '2px 0 0 0' }}>Ref: {event.type.toUpperCase()}-{event.id}</p>
            </div>
          </div>

          {/* Event Metadata Summary Box */}
          <div style={{ backgroundColor: '#f9f9f9', border: '1px solid #ddd', padding: '12px 16px', borderRadius: '4px', marginBottom: '20px', fontSize: '12px' }}>
            <h2 style={{ fontSize: '16px', color: '#004D34', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              {event.title}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <strong>Type:</strong> {event.type.toUpperCase()}<br />
                <strong>Leader/Speaker:</strong> {event.speaker_or_instructor || 'N/A'}<br />
                <strong>Date/Time:</strong> {event.date_or_duration ? (isSeminar ? new Date(event.date_or_duration).toLocaleString() : event.date_or_duration) : 'N/A'}
              </div>
              <div>
                <strong>Location/Venue:</strong> {event.location_or_price || 'N/A'}<br />
                <strong>Approved Registrants:</strong> {stats.approved} / {maxCapacity ?? 'Unlimited'}<br />
                <strong>Total Registered:</strong> {stats.total}
              </div>
            </div>
          </div>

          {/* Table of Participants */}
          <h3 style={{ fontSize: '13px', color: '#004D34', textTransform: 'uppercase', marginBottom: '8px' }}>
            Registered Participants List ({filteredRegistrations.length})
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#004D34', color: 'white' }}>
                <th style={{ padding: '8px', border: '1px solid #004D34', width: '30px', textAlign: 'center' }}>#</th>
                <th style={{ padding: '8px', border: '1px solid #004D34' }}>Participant Name</th>
                <th style={{ padding: '8px', border: '1px solid #004D34' }}>Email Address</th>
                <th style={{ padding: '8px', border: '1px solid #004D34', width: '80px' }}>Status</th>
                <th style={{ padding: '8px', border: '1px solid #004D34', width: '100px', textAlign: 'center' }}>Sign-in / Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map((reg, index) => (
                <tr key={reg.id} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa' }}>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold' }}>{index + 1}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>{reg.user_name || 'N/A'}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', fontFamily: 'monospace' }}>{reg.user_email}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    <span style={{ color: reg.status === 'approved' ? '#0f5132' : reg.status === 'rejected' ? '#842029' : '#664d03' }}>
                      {reg.status}
                    </span>
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                    <div style={{ height: '16px', borderBottom: '1px dotted #aaa' }}></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Official Signoff Footer */}
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666' }}>
            <div>
              <p style={{ margin: 0 }}>Verified By Admin: ___________________________</p>
            </div>
            <div>
              <p style={{ margin: 0 }}>Signature &amp; Date: ___________________________</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
