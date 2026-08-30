import { useState, useEffect } from 'react'
import { Sparkles, Plus, Edit, Trash2, Check, X, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getHighlights, saveHighlight, deleteHighlight } from '../../lib/contentStore'
import type { HighlightItem } from '../../lib/supabaseClient'

export default function AdminHighlights() {
  const [highlights, setHighlights] = useState<HighlightItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<HighlightItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form states
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [badge, setBadge] = useState('')
  const [ctaText, setCtaText] = useState('')
  const [ctaLink, setCtaLink] = useState('')
  const [featuresText, setFeaturesText] = useState('')
  const [stats, setStats] = useState<{ label: string; value: string }[]>([
    { label: '', value: '' },
    { label: '', value: '' },
  ])

  async function loadHighlights() {
    setLoading(true)
    const data = await getHighlights()
    setHighlights(data)
    setLoading(false)
  }

  useEffect(() => {
    loadHighlights()
  }, [])

  function handleOpenModal(item?: HighlightItem) {
    if (item) {
      setEditingItem(item)
      setCategory(item.category || '')
      setTitle(item.title || '')
      setSubtitle(item.subtitle || '')
      setDescription(item.description || '')
      setImage(item.image || '')
      setBadge(item.badge || '')
      setCtaText(item.ctaText || '')
      setCtaLink(item.ctaLink || '')
      setFeaturesText(item.features ? item.features.join('\n') : '')
      setStats(item.stats && item.stats.length > 0 ? item.stats : [{ label: '', value: '' }, { label: '', value: '' }])
    } else {
      setEditingItem(null)
      setCategory('Executive Coaching')
      setTitle('')
      setSubtitle('')
      setDescription('')
      setImage('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800')
      setBadge('Featured')
      setCtaText('Explore Program')
      setCtaLink('/seminars')
      setFeaturesText('')
      setStats([{ label: 'Participants', value: '100+' }, { label: 'Satisfaction', value: '99%' }])
    }
    setIsModalOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const formattedFeatures = featuresText
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0)

    const formattedStats = stats.filter(s => s.label.trim().length > 0 || s.value.trim().length > 0)

    const newItem: HighlightItem = {
      id: editingItem ? editingItem.id : `highlight-${Date.now()}`,
      category,
      title,
      subtitle,
      description,
      image,
      badge,
      ctaText,
      ctaLink,
      features: formattedFeatures,
      stats: formattedStats,
    }

    const updated = await saveHighlight(newItem)
    setHighlights(updated)
    setSaving(false)
    setIsModalOpen(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this highlight?')) return
    const updated = await deleteHighlight(id)
    setHighlights(updated)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/admin/dashboard" className="text-slate-400 hover:text-slate-600 transition">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-black text-[#004D34]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Program &amp; Coaching Highlights
            </h1>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Manage the executive coaching &amp; training highlight cards displayed on the Home and About pages.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#004D34] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#003826] transition shadow-xs"
        >
          <Plus className="w-4 h-4 text-[#C6A15A]" /> Add Highlight Item
        </button>
      </div>

      {/* Highlights List */}
      {loading ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-sm">
          Loading highlights...
        </div>
      ) : highlights.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-[#004D34] text-base">No Program Highlights Found</h3>
          <p className="text-slate-500 text-xs mt-1">Click "Add Highlight Item" above to create your first card.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {highlights.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row gap-6 items-start justify-between"
            >
              <div className="flex flex-col md:flex-row gap-6 items-start flex-1">
                <div className="w-full md:w-48 h-32 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 relative">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 bg-[#003826] text-[#C6A15A] text-[10px] font-bold px-2 py-0.5 rounded">
                    {item.badge}
                  </span>
                </div>
                <div className="space-y-1.5 flex-1">
                  <span className="text-xs font-bold text-[#C6A15A] uppercase tracking-wider">{item.category}</span>
                  <h3 className="text-lg font-bold text-[#004D34]">{item.title}</h3>
                  <p className="text-slate-600 text-xs font-medium">{item.subtitle}</p>
                  <p className="text-slate-500 text-xs line-clamp-2">{item.description}</p>
                  {item.features && item.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {item.features.map((feat, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded-md font-medium">
                          ✓ {feat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-start shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto justify-end">
                <button
                  onClick={() => handleOpenModal(item)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-extrabold text-[#004D34]">
                {editingItem ? 'Edit Program Highlight' : 'Add Program Highlight'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="e.g. 1-on-1 Strategic Advisory"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D34]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Badge Text</label>
                  <input
                    type="text"
                    required
                    value={badge}
                    onChange={e => setBadge(e.target.value)}
                    placeholder="e.g. Executive Level"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D34]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Executive Coaching & Mentorship"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D34]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Subtitle</label>
                <input
                  type="text"
                  required
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value)}
                  placeholder="e.g. Confidential performance acceleration for executives..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D34]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Detailed paragraph explaining the highlight offering..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D34]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D34]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={e => setCtaText(e.target.value)}
                    placeholder="Explore Seminars & Coaching"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D34]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">CTA Link Path</label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={e => setCtaLink(e.target.value)}
                    placeholder="/seminars"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D34]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Key Features (One per line)</label>
                <textarea
                  rows={3}
                  value={featuresText}
                  onChange={e => setFeaturesText(e.target.value)}
                  placeholder="Tailored 1-on-1 strategic roadmap&#10;360-degree executive presence evaluation&#10;Flexible hybrid schedule"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D34]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Key Stats / Metrics</label>
                <div className="grid grid-cols-2 gap-3">
                  {stats.map((s, idx) => (
                    <div key={idx} className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <input
                        type="text"
                        placeholder="Value (e.g. 150+)"
                        value={s.value}
                        onChange={e => {
                          const copy = [...stats]
                          copy[idx].value = e.target.value
                          setStats(copy)
                        }}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white font-bold text-[#C6A15A]"
                      />
                      <input
                        type="text"
                        placeholder="Label (e.g. Leaders Coached)"
                        value={s.label}
                        onChange={e => {
                          const copy = [...stats]
                          copy[idx].label = e.target.value
                          setStats(copy)
                        }}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#004D34] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#003826] transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#C6A15A]" /> {saving ? 'Saving...' : 'Save Highlight'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
