import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Headphones, User, Clock, Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react'

interface Podcast {
  id: string
  title: string
  episode_number: number | null
  guest: string | null
  description: string | null
  audio_url: string | null
  duration: number | null
  publish_date: string | null
}

const empty = { title: '', episode_number: '' as string, guest: '', description: '', audio_url: '', duration: '' as string, publish_date: '' }

export default function AdminPodcasts() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Podcast | null>(null)
  const [form, setForm] = useState<typeof empty>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function fetchPodcasts(options?: { preserveLoadingState?: boolean }) {
    if (!options?.preserveLoadingState) {
      setLoading(true)
    }
    const { data } = await supabase.from('podcasts').select('*').order('episode_number', { ascending: false })
    setPodcasts(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    void fetchPodcasts({ preserveLoadingState: true })
  }, [])

  function openCreate() { setEditing(null); setForm(empty); setShowForm(true); setError('') }
  function openEdit(p: Podcast) {
    setEditing(p)
    setForm({
      title: p.title,
      episode_number: p.episode_number?.toString() ?? '',
      guest: p.guest ?? '',
      description: p.description ?? '',
      audio_url: p.audio_url ?? '',
      duration: p.duration?.toString() ?? '',
      publish_date: p.publish_date ? p.publish_date.slice(0, 10) : '',
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
      episode_number: form.episode_number ? Number(form.episode_number) : null,
      guest: form.guest || null,
      description: form.description || null,
      audio_url: form.audio_url || null,
      duration: form.duration ? Number(form.duration) : null,
      publish_date: form.publish_date ? new Date(form.publish_date).toISOString() : null,
    }

    const { error } = editing
      ? await supabase.from('podcasts').update(payload).eq('id', editing.id)
      : await supabase.from('podcasts').insert(payload)

    if (error) { setError(error.message); setSaving(false) }
    else { setShowForm(false); fetchPodcasts() }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this podcast episode?')) return
    await supabase.from('podcasts').delete().eq('id', id)
    fetchPodcasts()
  }

  function formatDuration(seconds: number | null) {
    if (!seconds) return null
    const m = Math.floor(seconds / 60)
    return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>Podcasts</h1>
          <p className="text-sm text-bilcor-charcoal/50 mt-1">Upload and manage podcast episodes.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 bg-bilcor-gold text-bilcor-green-dark font-bold uppercase text-sm tracking-wide hover:brightness-110 transition" style={{ borderRadius: '4px' }}>
          <Plus className="w-4 h-4" /> New Episode
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-slate-200" style={{ borderRadius: '4px' }}></div>)}
        </div>
      ) : podcasts.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 text-center" style={{ borderRadius: '4px' }}>
          <Headphones className="w-10 h-10 mx-auto mb-3 text-bilcor-green/20" />
          <p className="text-bilcor-charcoal/50 font-medium">No episodes yet. Upload your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {podcasts.map(p => (
            <div key={p.id} className="bg-white border border-slate-200 p-4 flex items-center justify-between gap-4 hover:shadow-sm transition" style={{ borderRadius: '4px' }}>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-11 h-11 bg-bilcor-green flex items-center justify-center shrink-0" style={{ borderRadius: '4px' }}>
                  <Headphones className="w-5 h-5 text-bilcor-gold" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    {p.episode_number && <span className="text-xs font-bold text-bilcor-gold tracking-label">EP {p.episode_number}</span>}
                    {p.publish_date && <span className="text-xs text-bilcor-charcoal/40">{new Date(p.publish_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                  </div>
                  <h3 className="font-bold text-bilcor-green truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>{p.title}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-bilcor-charcoal/50 mt-0.5">
                    {p.guest && <span className="flex items-center gap-1"><User className="w-3 h-3" />{p.guest}</span>}
                    {p.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(p.duration)}</span>}
                    {p.audio_url && <span className="text-bilcor-green">Audio linked</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openEdit(p)} className="p-2 text-bilcor-charcoal/40 hover:text-bilcor-green transition"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(p.id)} className="p-2 text-bilcor-charcoal/40 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
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
                {editing ? 'Edit Episode' : 'New Episode'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-bilcor-charcoal/30 hover:text-bilcor-charcoal transition"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Title <span className="text-red-500">*</span></label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className="form-input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Episode Number</label>
                  <input type="number" value={form.episode_number} onChange={e => setForm({ ...form, episode_number: e.target.value })} className="form-input" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Duration (seconds)</label>
                  <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="form-input" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Guest</label>
                <input type="text" value={form.guest} onChange={e => setForm({ ...form, guest: e.target.value })} className="form-input" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="form-input" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Audio URL</label>
                <input type="url" value={form.audio_url} onChange={e => setForm({ ...form, audio_url: e.target.value })} className="form-input" placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Publish Date</label>
                <input type="date" value={form.publish_date} onChange={e => setForm({ ...form, publish_date: e.target.value })} className="form-input" />
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
