import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { Calendar, MapPin, Mic, Plus, Pencil, Trash2, X, Loader2, ExternalLink, Users, Printer } from 'lucide-react'

interface Seminar {
  id: string
  title: string
  description: string | null
  speaker: string | null
  date: string | null
  location: string | null
  registration_link: string | null
  max_registrations?: number | null
}

const empty = {
  title: '',
  description: '',
  speaker: '',
  date: '',
  location: '',
  registration_link: '',
  max_registrations: ''
}

export default function AdminSeminars() {
  const navigate = useNavigate()
  const [seminars, setSeminars] = useState<Seminar[]>([])
  const [regCounts, setRegCounts] = useState<Record<string, { total: number; approved: number }>>({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Seminar | null>(null)
  const [form, setForm] = useState<typeof empty>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function fetchSeminars() {
    setLoading(true)
    const { data } = await supabase.from('seminars').select('*').order('date', { ascending: false })
    const list: Seminar[] = data ?? []
    setSeminars(list)

    // Fetch registration counts
    if (list.length > 0) {
      const ids = list.map(s => s.id)
      const { data: regs } = await supabase.from('registrations').select('id, item_id, status').in('item_id', ids)
      const counts: Record<string, { total: number; approved: number }> = {}
      ids.forEach(id => { counts[id] = { total: 0, approved: 0 } })
      regs?.forEach((r: { item_id: string; status: string }) => {
        if (!counts[r.item_id]) counts[r.item_id] = { total: 0, approved: 0 }
        counts[r.item_id].total += 1
        if (r.status === 'approved') counts[r.item_id].approved += 1
      })
      setRegCounts(counts)
    }

    setLoading(false)
  }

  useEffect(() => { fetchSeminars() }, [])

  function openCreate() { setEditing(null); setForm(empty); setShowForm(true); setError('') }
  function openEdit(s: Seminar) {
    setEditing(s)
    setForm({
      title: s.title,
      description: s.description ?? '',
      speaker: s.speaker ?? '',
      date: s.date ? new Date(s.date).toISOString().slice(0, 16) : '',
      location: s.location ?? '',
      registration_link: s.registration_link ?? '',
      max_registrations: s.max_registrations != null ? String(s.max_registrations) : '',
    })
    setShowForm(true)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const capacityVal = form.max_registrations.trim() === '' ? null : Math.max(0, parseInt(form.max_registrations, 10) || 0)

    const payload = {
      title: form.title,
      description: form.description || null,
      speaker: form.speaker || null,
      location: form.location || null,
      registration_link: form.registration_link || null,
      date: form.date ? new Date(form.date).toISOString() : null,
      max_registrations: capacityVal,
    }

    let saveErr = null
    if (editing) {
      const { error } = await supabase.from('seminars').update(payload).eq('id', editing.id)
      if (error && error.message.includes('max_registrations')) {
        // Fallback if column missing
        const { max_registrations, ...stripped } = payload
        const { error: fallbackErr } = await supabase.from('seminars').update(stripped).eq('id', editing.id)
        saveErr = fallbackErr
      } else {
        saveErr = error
      }
    } else {
      const { error } = await supabase.from('seminars').insert(payload)
      if (error && error.message.includes('max_registrations')) {
        const { max_registrations, ...stripped } = payload
        const { error: fallbackErr } = await supabase.from('seminars').insert(stripped)
        saveErr = fallbackErr
      } else {
        saveErr = error
      }
    }

    if (saveErr) {
      setError(saveErr.message)
      setSaving(false)
    } else {
      setShowForm(false)
      fetchSeminars()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this seminar? This cannot be undone.')) return
    await supabase.from('seminars').delete().eq('id', id)
    fetchSeminars()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>Seminars</h1>
          <p className="text-sm text-bilcor-charcoal/50 mt-1">Create, manage, and view registrant manifests for seminars.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-bilcor-gold text-bilcor-green-dark font-bold uppercase text-sm tracking-wide hover:brightness-110 transition rounded shadow-xs"
        >
          <Plus className="w-4 h-4" /> New Seminar
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-200 rounded"></div>)}
        </div>
      ) : seminars.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 text-center rounded">
          <Calendar className="w-10 h-10 mx-auto mb-3 text-bilcor-green/20" />
          <p className="text-bilcor-charcoal/50 font-medium">No seminars yet. Create your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {seminars.map(s => {
            const counts = regCounts[s.id] || { total: 0, approved: 0 }
            const limit = s.max_registrations
            return (
              <div key={s.id} className="bg-white border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-sm transition rounded">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {s.date && (
                      <span className="text-xs font-bold text-bilcor-gold tracking-label flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                    <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-bilcor-charcoal/70 rounded flex items-center gap-1">
                      <Users className="w-3 h-3 text-bilcor-green" />
                      <strong>{counts.total}</strong> registered ({counts.approved} approved)
                    </span>
                    {limit != null && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${counts.approved >= limit ? 'bg-red-100 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        Cap: {limit}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-bilcor-green truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>{s.title}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-bilcor-charcoal/50 mt-0.5">
                    {s.speaker && <span className="flex items-center gap-1"><Mic className="w-3 h-3" />{s.speaker}</span>}
                    {s.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.location}</span>}
                    {s.registration_link && <span className="flex items-center gap-1"><ExternalLink className="w-3 h-3" />Link set</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/admin/events/seminar/${s.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bilcor-green/10 text-bilcor-green font-bold text-xs uppercase tracking-wide hover:bg-bilcor-green hover:text-white transition rounded"
                  >
                    <Printer className="w-3.5 h-3.5" /> Manage &amp; Print
                  </button>
                  <button onClick={() => openEdit(s)} className="p-2 text-bilcor-charcoal/40 hover:text-bilcor-green transition" title="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="p-2 text-bilcor-charcoal/40 hover:text-red-500 transition" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-white w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto rounded" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {editing ? 'Edit Seminar' : 'New Seminar'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-bilcor-charcoal/30 hover:text-bilcor-charcoal transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="Title" required>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className="form-input" />
              </FormField>
              <FormField label="Description">
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="form-input" />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Speaker">
                  <input type="text" value={form.speaker} onChange={e => setForm({ ...form, speaker: e.target.value })} className="form-input" />
                </FormField>
                <FormField label="Location">
                  <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="form-input" />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Date & Time">
                  <input type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="form-input" />
                </FormField>
                <FormField label="Max Capacity (Seats)">
                  <input type="number" min="0" value={form.max_registrations} onChange={e => setForm({ ...form, max_registrations: e.target.value })} className="form-input" placeholder="e.g. 25 (Blank = Unlimited)" />
                </FormField>
              </div>
              <FormField label="Registration Link">
                <input type="url" value={form.registration_link} onChange={e => setForm({ ...form, registration_link: e.target.value })} className="form-input" placeholder="https://..." />
              </FormField>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded">{error}</div>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border-2 border-slate-300 text-bilcor-charcoal/60 font-bold uppercase text-sm tracking-wide hover:bg-slate-50 transition rounded">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-bilcor-green text-white font-bold uppercase text-sm tracking-wide hover:bg-bilcor-green-light transition disabled:opacity-60 rounded">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  )
}
