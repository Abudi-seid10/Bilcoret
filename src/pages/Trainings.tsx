import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { BookOpen, User, Clock, DollarSign, ArrowRight, UserPlus } from 'lucide-react'
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
  upcoming: { label: 'Upcoming', cls: 'bg-bilcor-gold/15 text-bilcor-gold-dark' },
  ongoing: { label: 'Ongoing', cls: 'bg-bilcor-green/10 text-bilcor-green' },
  'self-paced': { label: 'Self-Paced', cls: 'bg-slate-100 text-bilcor-charcoal/50' },
}

export default function Trainings() {
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'self-paced'>('all')
  const [regModal, setRegModal] = useState<{ id: string; title: string } | null>(null)

  async function fetchTrainings(options?: { preserveLoadingState?: boolean; preserveErrorState?: boolean }) {
    if (!options?.preserveLoadingState) {
      setLoading(true)
    }
    if (!options?.preserveErrorState) {
      setError(null)
    }
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

  useEffect(() => {
    void fetchTrainings({ preserveLoadingState: true, preserveErrorState: true })
  }, [])

  const displayed = filter === 'all' ? trainings : trainings.filter(t => t.status === filter)

  return (
    <div>
      {/* Page header — Deep Green band */}
      <section className="bg-bilcor-green text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-bilcor-gold text-xs font-semibold tracking-label mb-3 block">Trainings</span>
          <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Professional Programs
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            Structured training programs built to accelerate your professional development and career growth.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {(['all', 'upcoming', 'ongoing', 'self-paced'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 font-bold uppercase text-xs tracking-wide transition ${
                filter === f
                  ? 'bg-bilcor-green text-white'
                  : 'bg-transparent text-bilcor-green border-2 border-bilcor-green/20 hover:border-bilcor-green'
              }`}
              style={{ borderRadius: '4px' }}
            >
              {f === 'all' ? 'All' : f === 'self-paced' ? 'Self-Paced' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <LoadingSkeleton type="card" count={3} />
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchTrainings} />
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 text-bilcor-charcoal/40">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-bilcor-green/20" />
            <p className="text-lg font-semibold text-bilcor-charcoal/60" style={{ fontFamily: 'Montserrat, sans-serif' }}>No trainings in this category.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayed.map(training => {
              const cfg = statusConfig[training.status]
              return (
                <div key={training.id} className="bg-white border border-slate-200 p-6 hover:shadow-lg transition group flex flex-col" style={{ borderRadius: '4px' }}>
                  <div className="flex items-center justify-between mb-5">
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wide ${cfg.cls}`} style={{ borderRadius: '4px' }}>
                      {cfg.label}
                    </span>
                    <span className="text-xl font-black text-bilcor-green flex items-center gap-0.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      <DollarSign className="w-4 h-4 text-bilcor-charcoal/40" />
                      {training.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-bilcor-green/10 flex items-center justify-center mb-4" style={{ borderRadius: '4px' }}>
                    <BookOpen className="w-5 h-5 text-bilcor-green" />
                  </div>
                  <h3 className="text-lg font-bold text-bilcor-green mb-2 group-hover:text-bilcor-gold transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>{training.title}</h3>
                  <p className="text-bilcor-charcoal/60 text-sm mb-5 flex-grow leading-relaxed line-clamp-3">{training.description}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-bilcor-charcoal/50 mb-5">
                    <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{training.instructor}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{training.duration}</span>
                  </div>
                  <button
                    onClick={() => setRegModal({ id: training.id, title: training.title })}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-bilcor-gold text-bilcor-green-dark text-sm font-bold uppercase tracking-wide hover:brightness-110 transition active:scale-95 mt-auto"
                    style={{ borderRadius: '4px' }}
                  >
                    <UserPlus className="w-4 h-4" /> Enroll Now <ArrowRight className="w-4 h-4" />
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
