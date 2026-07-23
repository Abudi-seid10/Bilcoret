import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Calendar, MapPin, Mic, ExternalLink, UserPlus } from 'lucide-react'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import ErrorMessage from '../components/ui/ErrorMessage'
import RegistrationModal from '../components/portal/RegistrationModal'

interface Seminar {
  id: string
  title: string
  description: string
  speaker: string
  date: string
  location: string
  registration_link: string | null
}

export default function Seminars() {
  const [seminars, setSeminars] = useState<Seminar[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming')
  const [regModal, setRegModal] = useState<{ id: string; title: string } | null>(null)

  async function fetchSeminars() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('seminars')
      .select('*')
      .order('date', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setSeminars(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchSeminars() }, [])

  const now = new Date()
  const displayed = seminars.filter(s =>
    filter === 'upcoming' ? new Date(s.date) >= now : new Date(s.date) < now
  )

  return (
    <div>
      {/* Page header — Deep Green band */}
      <section className="bg-bilcor-green text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-bilcor-gold text-xs font-semibold tracking-label mb-3 block">Seminars</span>
          <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Transformative Sessions
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            Join seminars designed to unlock your potential and deliver real-world value through evidence-based leadership practices.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-center mb-10 space-x-3">
          {(['upcoming', 'past'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 font-bold uppercase text-xs tracking-wide transition ${
                filter === f
                  ? 'bg-bilcor-green text-white'
                  : 'bg-transparent text-bilcor-green border-2 border-bilcor-green/20 hover:border-bilcor-green'
              }`}
              style={{ borderRadius: '4px' }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <LoadingSkeleton type="card" count={3} />
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchSeminars} />
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 text-bilcor-charcoal/40">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-bilcor-green/20" />
            <p className="text-lg font-semibold text-bilcor-charcoal/60" style={{ fontFamily: 'Montserrat, sans-serif' }}>No {filter} seminars at the moment.</p>
            <p className="text-sm mt-1">Check back soon for updates.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayed.map(seminar => (
              <div key={seminar.id} className="bg-white border border-slate-200 p-6 hover:shadow-lg transition group flex flex-col" style={{ borderRadius: '4px' }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2 text-bilcor-gold">
                    <Calendar className="w-4 h-4" />
                    <span className="font-bold text-xs tracking-label">
                      {new Date(seminar.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  {filter === 'past' && (
                    <span className="px-2.5 py-1 bg-slate-100 text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50" style={{ borderRadius: '4px' }}>Past</span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-bilcor-green mb-3 group-hover:text-bilcor-gold transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>{seminar.title}</h3>
                <p className="text-bilcor-charcoal/60 text-sm mb-5 leading-relaxed line-clamp-3 flex-grow">{seminar.description}</p>
                <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-bilcor-charcoal/50 mb-5">
                  <div className="flex items-center space-x-1">
                    <Mic className="w-4 h-4 shrink-0" />
                    <span>{seminar.speaker}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>{seminar.location}</span>
                  </div>
                </div>
                {filter === 'upcoming' ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => setRegModal({ id: seminar.id, title: seminar.title })}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-bilcor-gold text-bilcor-green-dark text-sm font-bold uppercase tracking-wide hover:brightness-110 transition active:scale-95"
                      style={{ borderRadius: '4px' }}
                    >
                      <UserPlus className="w-4 h-4" /> Register
                    </button>
                    {seminar.registration_link && (
                      <a
                        href={seminar.registration_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-bilcor-green text-bilcor-green text-sm font-bold uppercase tracking-wide hover:bg-bilcor-green hover:text-white transition"
                        style={{ borderRadius: '4px' }}
                      >
                        External <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ) : (
                  <a
                    href={seminar.registration_link ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-bilcor-gold text-bilcor-green-dark text-sm font-bold uppercase tracking-wide hover:brightness-110 transition active:scale-95"
                    style={{ borderRadius: '4px' }}
                  >
                    Watch Replay
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <RegistrationModal
        open={!!regModal}
        onClose={() => setRegModal(null)}
        itemId={regModal?.id ?? ''}
        itemType="seminar"
        itemTitle={regModal?.title ?? ''}
      />
    </div>
  )
}
