import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { BookOpen, User, Clock, Plus, Pencil, Trash2, X, Loader2, Users, Printer } from 'lucide-react'

interface Training {
  id: string
  title: string
  description: string | null
  instructor: string | null
  duration: string | null
  price: number | null
  status: 'upcoming' | 'ongoing' | 'self-paced'
  image_url: string | null
  max_registrations?: number | null
}

const empty = {
  title: '',
  description: '',
  instructor: '',
  duration: '',
  price: '' as string,
  status: 'upcoming' as 'upcoming' | 'ongoing' | 'self-paced',
  image_url: '',
  max_registrations: ''
}

export default function AdminTrainings() {
  const navigate = useNavigate()
  const [trainings, setTrainings] = useState<Training[]>([])
  const [regCounts, setRegCounts] = useState<Record<string, { total: number; approved: number }>>({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Training | null>(null)
  const [form, setForm] = useState<typeof empty>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function fetchTrainings() {
    setLoading(true)
    const { data } = await supabase.from('trainings').select('*').order('created_at', { ascending: false })
    const list: Training[] = data ?? []
    setTrainings(list)

    if (list.length > 0) {
      const ids = list.map(t => t.id)
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

  useEffect(() => { fetchTrainings() }, [])

  function openCreate() { setEditing(null); setForm(empty); setShowForm(true); setError('') }
  function openEdit(t: Training) {
    setEditing(t)
    setForm({
      title: t.title,
      description: t.description ?? '',
      instructor: t.instructor ?? '',
      duration: t.duration ?? '',
      price: t.price?.toString() ?? '',
      status: t.status,
      image_url: t.image_url ?? '',
      max_registrations: t.max_registrations != null ? String(t.max_registrations) : '',
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
      instructor: form.instructor || null,
      duration: form.duration || null,
      price: form.price ? Number(form.price) : null,
      status: form.status,
      image_url: form.image_url || null,
      max_registrations: capacityVal,
    }

    let saveErr = null
    if (editing) {
      const { error } = await supabase.from('trainings').update(payload).eq('id', editing.id)
      if (error && error.message.includes('max_registrations')) {
        const { max_registrations, ...stripped } = payload
        const { error: fallbackErr } = await supabase.from('trainings').update(stripped).eq('id', editing.id)
        saveErr = fallbackErr
      } else {
        saveErr = error
      }
    } else {
      const { error } = await supabase.from('trainings').insert(payload)
      if (error && error.message.includes('max_registrations')) {
        const { max_registrations, ...stripped } = payload
        const { error: fallbackErr } = await supabase.from('trainings').insert(stripped)
        saveErr = fallbackErr
      } else {
        saveErr = error
      }
    }

    if (saveErr) { setError(saveErr.message); setSaving(false) }
    else { setShowForm(false); fetchTrainings() }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this training?')) return
    await supabase.from('trainings').delete().eq('id', id)
    fetchTrainings()
  }

  const statusCls: Record<string, string> = {
    upcoming: 'bg-bilcor-gold/15 text-bilcor-gold-dark',
    ongoing: 'bg-bilcor-green/10 text-bilcor-green',
    'self-paced': 'bg-slate-100 text-bilcor-charcoal/50',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>Trainings</h1>
          <p className="text-sm text-bilcor-charcoal/50 mt-1">Create, manage, and view registrant manifests for training programs.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 bg-bilcor-gold text-bilcor-green-dark font-bold uppercase text-sm tracking-wide hover:brightness-110 transition rounded shadow-xs">
          <Plus className="w-4 h-4" /> New Training
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-200 rounded"></div>)}
        </div>
      ) : trainings.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 text-center rounded">
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-bilcor-green/20" />
          <p className="text-bilcor-charcoal/50 font-medium">No trainings yet. Create your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trainings.map(t => {
            const counts = regCounts[t.id] || { total: 0, approved: 0 }
            const limit = t.max_registrations
            return (
              <div key={t.id} className="bg-white border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-sm transition rounded">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide rounded ${statusCls[t.status]}`}>
                      {t.status === 'self-paced' ? 'Self-Paced' : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </span>
                    {t.price != null && <span className="text-xs font-bold text-bilcor-green">ETB {t.price.toLocaleString()}</span>}
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
                  <h3 className="font-bold text-bilcor-green truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t.title}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-bilcor-charcoal/50 mt-0.5">
                    {t.instructor && <span className="flex items-center gap-1"><User className="w-3 h-3" />{t.instructor}</span>}
                    {t.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{t.duration}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/admin/events/training/${t.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bilcor-green/10 text-bilcor-green font-bold text-xs uppercase tracking-wide hover:bg-bilcor-green hover:text-white transition rounded"
                  >
                    <Printer className="w-3.5 h-3.5" /> Manage &amp; Print
                  </button>
                  <button onClick={() => openEdit(t)} className="p-2 text-bilcor-charcoal/40 hover:text-bilcor-green transition" title="Edit"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(t.id)} className="p-2 text-bilcor-charcoal/40 hover:text-red-500 transition" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-white w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto rounded" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {editing ? 'Edit Training' : 'New Training'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-bilcor-charcoal/30 hover:text-bilcor-charcoal transition"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Title <span className="text-red-500">*</span></label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className="form-input" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="form-input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Instructor</label>
                  <input type="text" value={form.instructor} onChange={e => setForm({ ...form, instructor: e.target.value })} className="form-input" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Duration</label>
                  <input type="text" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="form-input" placeholder="e.g. 4 weeks" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Price (ETB)</label>
                  <input type="number" step="any" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="form-input" placeholder="4500" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Training['status'] })} className="form-input">
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="self-paced">Self-Paced</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Max Capacity</label>
                  <input type="number" min="0" value={form.max_registrations} onChange={e => setForm({ ...form, max_registrations: e.target.value })} className="form-input" placeholder="e.g. 20" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Image URL</label>
                <input type="url" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="form-input" placeholder="https://..." />
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded">{error}</div>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border-2 border-slate-300 text-bilcor-charcoal/60 font-bold uppercase text-sm tracking-wide hover:bg-slate-50 transition rounded">Cancel</button>
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
