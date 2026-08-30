import { useState, useEffect } from 'react'
import { HelpCircle, Plus, Edit, Trash2, Check, X, ArrowLeft, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getFAQs, saveFAQ, deleteFAQ } from '../../lib/contentStore'
import type { FAQItem } from '../../lib/supabaseClient'

export default function AdminFAQs() {
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  // Form states
  const [category, setCategory] = useState('General')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  async function loadFAQs() {
    setLoading(true)
    const data = await getFAQs()
    setFaqs(data)
    setLoading(false)
  }

  useEffect(() => {
    loadFAQs()
  }, [])

  function handleOpenModal(item?: FAQItem) {
    if (item) {
      setEditingItem(item)
      setCategory(item.category || 'General')
      setQuestion(item.question || '')
      setAnswer(item.answer || '')
    } else {
      setEditingItem(null)
      setCategory('General')
      setQuestion('')
      setAnswer('')
    }
    setIsModalOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const newItem: FAQItem = {
      id: editingItem ? editingItem.id : `faq-${Date.now()}`,
      category,
      question: question.trim(),
      answer: answer.trim(),
    }

    const updated = await saveFAQ(newItem)
    setFaqs(updated)
    setSaving(false)
    setIsModalOpen(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this FAQ question?')) return
    const updated = await deleteFAQ(id)
    setFaqs(updated)
  }

  const categories = ['All', 'Coaching', 'Training', 'Certification', 'General']

  const filteredFAQs = faqs.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

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
              FAQ Accordion Manager
            </h1>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Add, update, and re-order questions displayed in the site-wide FAQ section.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#004D34] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#003826] transition shadow-xs"
        >
          <Plus className="w-4 h-4 text-[#C6A15A]" /> Add New FAQ
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004D34]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-[#004D34] text-[#C6A15A]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQs List */}
      {loading ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-sm">
          Loading FAQs...
        </div>
      ) : filteredFAQs.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-[#004D34] text-base">No Matching FAQs Found</h3>
          <p className="text-slate-500 text-xs mt-1">Click "Add New FAQ" to create your first question.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFAQs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start justify-between gap-4 hover:border-slate-300 transition"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#004D34]/10 text-[#004D34]">
                    {faq.category}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#004D34]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {faq.question}
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {faq.answer}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-start shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end">
                <button
                  onClick={() => handleOpenModal(faq)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(faq.id)}
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-extrabold text-[#004D34]">
                {editingItem ? 'Edit FAQ Question' : 'Add FAQ Question'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D34] bg-white"
                >
                  <option value="Coaching">Coaching</option>
                  <option value="Training">Training</option>
                  <option value="Certification">Certification</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Question</label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. How do I enroll in corporate cohorts?"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D34]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Answer</label>
                <textarea
                  rows={4}
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Clear and detailed answer to the question..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D34]"
                />
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
                  <Check className="w-4 h-4 text-[#C6A15A]" /> {saving ? 'Saving...' : 'Save FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
