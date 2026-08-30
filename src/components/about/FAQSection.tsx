import { useState, useEffect } from 'react'
import { ChevronDown, HelpCircle, MessageSquare, Search, Edit3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getFAQs } from '../../lib/contentStore'
import type { FAQItem } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'

export default function FAQSection() {
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<string | null>('1')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const { isAdmin } = useAuth() || {}

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getFAQs()
      setFaqs(data)
      if (data.length > 0) {
        setOpenId(data[0].id)
      }
      setLoading(false)
    }
    load()
  }, [])

  const categories = ['All', 'Coaching', 'Training', 'Certification', 'General']

  const toggleFAQ = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id))
  }

  const filteredFAQs = faqs.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <section className="bg-slate-50 py-20 border-b border-slate-200" id="faq-section">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 relative">
          <span className="text-[#C6A15A] text-xs font-bold uppercase tracking-wider block mb-2">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-[#004D34]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Everything You Need to Know
          </h2>
          <p className="text-slate-600 mt-3 text-sm leading-relaxed">
            Find clear answers to common questions about our executive coaching, professional training, and certification programs.
          </p>
          {isAdmin && (
            <div className="mt-4">
              <Link
                to="/admin/faqs"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C6A15A] text-[#003826] text-xs font-bold rounded-lg hover:brightness-110 transition shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit FAQ Section (Admin)
              </Link>
            </div>
          )}
        </div>

        {/* Filter Tabs & Search */}
        <div className="space-y-4 mb-8">
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions about coaching, certificates, or enrollment..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#004D34] shadow-xs transition"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition ${
                  selectedCategory === cat
                    ? 'bg-[#004D34] text-[#C6A15A] shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion List */}
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading FAQs...</div>
        ) : filteredFAQs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-8">
            <HelpCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-[#004D34]">No matching questions found</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting a different category filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFAQs.map((item) => {
              const isOpen = openId === item.id
              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 shadow-xs"
                >
                  <button
                    onClick={() => toggleFAQ(item.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#004D34]/10 text-[#004D34] shrink-0">
                        {item.category}
                      </span>
                      <h3
                        className="font-bold text-[#004D34] text-sm md:text-base leading-snug"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {item.question}
                      </h3>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-[#C6A15A] shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 border-t border-slate-100 text-xs md:text-sm text-slate-600 leading-relaxed animate-fadeIn">
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Still Have Questions CTA */}
        <div className="mt-12 bg-white rounded-2xl p-6 md:p-8 border border-slate-200 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="font-bold text-[#004D34] text-base" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Have additional questions?
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Our executive advisory team is available to assist you with custom training inquiries.
            </p>
          </div>
          <a
            href="mailto:contact@bilcoret.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#004D34] text-white hover:bg-[#003826] text-xs font-bold uppercase tracking-wider rounded-lg transition shrink-0"
          >
            <MessageSquare className="w-4 h-4 text-[#C6A15A]" /> Ask Advisory Team
          </a>
        </div>
      </div>
    </section>
  )
}

