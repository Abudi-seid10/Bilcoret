import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { BookOpen, User, Clock, DollarSign, Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react'

interface Training {
  id: string
  title: string
  description: string | null
  instructor: string | null
  duration: string | null
  price: number | null
  status: 'upcoming' | 'ongoing' | 'self-paced'
  image_url: string | null
}

const empty = { title: '', description: '', instructor: '', duration: '', price: '' as string, status: 'upcoming' as 'upcoming' | 'ongoing' | 'self-paced', image_url: '' }

export default function AdminTrainings() {
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Training | null>(null)
  const [form, setForm] = useState<typeof empty>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function fetchTrainings() {
    setLoading(true)
    const { data } = await supabase.from('trainings').select('*').order('created_at', { ascending: false })
    setTrainings(data ?? [])
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
    })
    setShowForm(true)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      title: form.title,
      description: form.description || null,
      instructor: form.instructor || null,
      duration: form.duration || null,
      price: form.price ? Number(form.price) : null,
      status: form.status,
      image_url: form.image_url || null,
    }

    const { error } = editing
      ? await supabase.from('trainings').update(payload).eq('id', editing.id)
      : await supabase.from('trainings').insert(payload)

    if (error) { setError(error.message); setSaving(false) }
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
          <p className="text-sm text-bilcor-charcoal/50 mt-1">Create and manage training programs.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 bg-bilcor-gold text-bilcor-green-dark font-bold uppercase text-sm tracking-wide hover:brightness-110 transition" style={{ borderRadius: '4px' }}>
          <Plus className="w-4 h-4" /> New Training
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-slate-200" style={{ borderRadius: '4px' }}></div>)}
        </div>
      ) : trainings.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 text-center" style={{ borderRadius: '4px' }}>
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-bilcor-green/20" />
          <p className="text-bilcor-charcoal/50 font-medium">No trainings yet. Create your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trainings.map(t => (
            <div key={t.id} className="bg-white border border-slate-200 p-4 flex items-center justify-between gap-4 hover:shadow-sm transition" style={{ borderRadius: '4px' }}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${statusCls[t.status]}`} style={{ borderRadius: '4px' }}>{t.status === 'self-paced' ? 'Self-Paced' : t.status.charAt(0).toUpperCase() + t.status.slice(1)}</span>
                  {t.price != null && <span className="text-sm font-bold text-bilcor-green flex items-center gap-0.5"><DollarSign className="w-3.5 h-3.5" />{t.price.toFixed(2)}</span>}
                </div>
                <h3 className="font-bold text-bilcor-green truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t.title}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-bilcor-charcoal/50 mt-0.5">
                  {t.instructor && <span className="flex items-center gap-1"><User className="w-3 h-3" />{t.instructor}</span>}
                  {t.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{t.duration}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openEdit(t)} className="p-2 text-bilcor-charcoal/40 hover:text-bilcor-green transition"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(t.id)} className="p-2 text-bilcor-charcoal/40 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-white w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto" style={{ borderRadius: '4px' }} onClick={e => e.stopPropagation()}>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Price (USD)</label>
                  <input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="form-input" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Training['status'] })} className="form-input">
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="self-paced">Self-Paced</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Image URL</label>
                <input type="url" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="form-input" placeholder="https://..." />
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5" style={{ borderRadius: '4px' }}>{error}</div>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border-2 border-slate-300 text-bilcor-charcoal/60 font-bold uppercase text-sm tracking-wide hover:bg-slate-50 transition" style={{ borderRadius: '4px' }}>Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-bilcor-green text-white font-bold uppercase text-sm tracking-wide hover:bg-bilcor-green-light transition disabled:opacity-60" style={{ borderRadius: '4px' }}>
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
