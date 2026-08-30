import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { BookOpen, User, Clock, ArrowRight, UserPlus, Search } from 'lucide-react'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import ErrorMessage from '../components/ui/ErrorMessage'
import RegistrationModal from '../components/portal/RegistrationModal'

interface Training {
  id: string
  title: string
  description: string
  instructor: string
  duration: string
  price: number
  status: 'upcoming' | 'ongoing' | 'self-paced'
}

const statusConfig = {
  upcoming: { label: 'Upcoming Cohort', cls: 'bg-[#C6A15A]/20 text-[#003826]' },
  ongoing: { label: 'Active Cohort', cls: 'bg-emerald-100 text-emerald-800' },
  'self-paced': { label: 'Self-Paced Module', cls: 'bg-slate-100 text-slate-700' },
}

export default function Trainings() {
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'self-paced'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [regModal, setRegModal] = useState<{ id: string; title: string } | null>(null)

  async function fetchTrainings() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('trainings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setTrainings(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchTrainings() }, [])

  const displayed = trainings.filter(t => {
    const matchesCategory = filter === 'all' || t.status === filter
    const matchesSearch = searchQuery.trim() === '' ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div>
      {/* Header Banner */}
      <section className="bg-[#003826] text-white py-16 lg:py-20 border-b border-[#C6A15A]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#C6A15A] text-xs font-bold uppercase tracking-wider mb-3 block">Executive Curricula</span>
          <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Professional Leadership Programs
          </h1>
          <p className="text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Gain practical competencies in strategic management, governance, and organizational effectiveness through cohort-based &amp; self-paced masterclasses.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {(['all', 'upcoming', 'ongoing', 'self-paced'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                  filter === f
                    ? 'bg-[#004D34] text-white shadow-md'
                    : 'bg-white text-slate-700 hover:text-[#004D34] border border-slate-200'
                }`}
              >
                {f === 'all' ? 'All Curricula' : f === 'self-paced' ? 'Self-Paced' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search title, instructor, keyword..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#004D34] transition"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <LoadingSkeleton type="card" count={3} />
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchTrainings} />
        ) : displayed.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-[#004D34]/30" />
            <p className="text-lg font-bold text-[#004D34]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              No training programs found.
            </p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayed.map(training => {
              const cfg = statusConfig[training.status] ?? statusConfig['self-paced']
              return (
                <div key={training.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-xl transition group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                      <span className="text-lg font-black text-[#004D34]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        ETB {training.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-12 h-12 rounded-lg bg-[#004D34] text-[#C6A15A] flex items-center justify-center mb-4">
                      <BookOpen className="w-6 h-6" />
                    </div>

                    <h3 className="text-lg font-bold text-[#004D34] group-hover:text-[#C6A15A] transition mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {training.title}
                    </h3>
                    
                    <p className="text-slate-600 text-xs leading-relaxed mb-6 line-clamp-3">
                      {training.description}
                    </p>

                    <div className="space-y-2 text-xs text-slate-500 font-medium mb-6 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#C6A15A] shrink-0" />
                        <span className="font-bold text-slate-700">{training.instructor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#C6A15A] shrink-0" />
                        <span>Duration: {training.duration}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setRegModal({ id: training.id, title: training.title })}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#C6A15A] hover:bg-[#d4b47a] text-[#003826] font-black uppercase text-xs tracking-wider rounded-lg transition active:scale-95 shadow-xs"
                  >
                    <UserPlus className="w-4 h-4" /> Enroll In Cohort <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <RegistrationModal
        open={!!regModal}
        onClose={() => setRegModal(null)}
        itemId={regModal?.id ?? ''}
        itemType="training"
        itemTitle={regModal?.title ?? ''}
      />
    </div>
  )
}

