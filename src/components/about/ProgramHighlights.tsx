import { useState, useEffect } from 'react'
import { CheckCircle2, Sparkles, ArrowUpRight, Edit3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getHighlights } from '../../lib/contentStore'
import type { HighlightItem } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'

export default function ProgramHighlights() {
  const [items, setItems] = useState<HighlightItem[]>([])
  const [loading, setLoading] = useState(true)
  const { isAdmin } = useAuth() || {}

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getHighlights()
      setItems(data)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <section className="bg-white py-20 border-b border-slate-200" id="program-highlights">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-16 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#004D34]/10 text-[#004D34] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#C6A15A]" /> Core Program Offerings
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-[#004D34]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Coaching &amp; Training Highlights
          </h2>
          <p className="text-slate-600 mt-3 text-sm leading-relaxed">
            Discover our tailored developmental pathways crafted to elevate individual executive capability and organizational performance.
          </p>
          {isAdmin && (
            <div className="mt-4">
              <Link
                to="/admin/highlights"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C6A15A] text-[#003826] text-xs font-bold rounded-lg hover:brightness-110 transition shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Program Highlights (Admin)
              </Link>
            </div>
          )}
        </div>

        {/* Highlights Cards Stack */}
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading highlights...</div>
        ) : (
          <div className="space-y-16">
            {items.map((item, index) => {
              const isEven = index % 2 === 0
              return (
                <div
                  key={item.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 grid lg:grid-cols-12 items-stretch"
                >
                  {/* Image Container */}
                  <div
                    className={`lg:col-span-6 relative bg-slate-900 min-h-[300px] lg:min-h-[420px] overflow-hidden ${
                      isEven ? 'lg:order-1' : 'lg:order-2'
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    
                    {/* Floating Badge */}
                    <div className="absolute top-4 left-4 bg-[#003826] text-[#C6A15A] text-xs font-bold px-3 py-1.5 rounded-lg border border-[#C6A15A]/30 shadow-md">
                      {item.badge}
                    </div>

                    {/* Stats overlay */}
                    {item.stats && item.stats.length > 0 && (
                      <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-3 p-4 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-white">
                        {item.stats.map((s, idx) => (
                          <div key={idx}>
                            <p className="text-xl font-black text-[#C6A15A]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              {s.value}
                            </p>
                            <p className="text-[11px] text-slate-300 font-medium">{s.label}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Text Content */}
                  <div
                    className={`lg:col-span-6 p-8 lg:p-12 flex flex-col justify-between ${
                      isEven ? 'lg:order-2' : 'lg:order-1'
                    }`}
                  >
                    <div>
                      <span className="text-[#C6A15A] text-xs font-bold uppercase tracking-wider block mb-2">
                        {item.category}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-black text-[#004D34] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {item.title}
                      </h3>
                      <p className="text-slate-600 font-medium text-xs md:text-sm mb-4 leading-relaxed">
                        {item.subtitle}
                      </p>
                      <p className="text-slate-600 text-xs leading-relaxed mb-6">
                        {item.description}
                      </p>

                      {/* Features List */}
                      {item.features && item.features.length > 0 && (
                        <div className="space-y-2.5 mb-8">
                          {item.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                              <CheckCircle2 className="w-4 h-4 text-[#004D34] shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* CTA Link */}
                    <div className="pt-6 border-t border-slate-200/80">
                      <Link
                        to={item.ctaLink || '#'}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#004D34] hover:bg-[#003826] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-sm group"
                      >
                        {item.ctaText || 'Learn More'}
                        <ArrowUpRight className="w-4 h-4 text-[#C6A15A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

