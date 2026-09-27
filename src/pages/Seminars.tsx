import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Calendar, MapPin, Mic, ExternalLink, UserPlus, Search, Users } from 'lucide-react'
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
  max_registrations?: number | null
}

export default function Seminars() {
  const [seminars, setSeminars] = useState<Seminar[]>([])
  const [regCounts, setRegCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming')
  const [searchQuery, setSearchQuery] = useState('')
  const [regModal, setRegModal] = useState<{ id: string; title: string; maxCapacity?: number | null; count?: number } | null>(null)

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
      const list: Seminar[] = data ?? []
      setSeminars(list)

      if (list.length > 0) {
        const ids = list.map(s => s.id)
        const { data: regs } = await supabase.from('registrations').select('item_id, status').in('item_id', ids)
        const counts: Record<string, number> = {}
        ids.forEach(id => counts[id] = 0)
        regs?.forEach((r: { item_id: string; status: string }) => {
          if (r.status === 'approved' || r.status === 'pending') {
            counts[r.item_id] = (counts[r.item_id] || 0) + 1
          }
        })
        setRegCounts(counts)
      }
    }
    setLoading(false)
  }

  useEffect(() => { fetchSeminars() }, [])

  const now = new Date()
  const displayed = seminars.filter(s => {
    const isMatchingDate = filter === 'upcoming' ? new Date(s.date) >= now : new Date(s.date) < now
    const matchesSearch = searchQuery.trim() === '' || 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location.toLowerCase().includes(searchQuery.toLowerCase())
    return isMatchingDate && matchesSearch
  })

  return (
    <div>
      {/* Page Header Banner */}
      <section className="bg-[#003826] text-white py-16 lg:py-20 border-b border-[#C6A15A]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#C6A15A] text-xs font-bold uppercase tracking-wider mb-3 block">Executive Seminars</span>
          <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Leadership Forums &amp; Keynotes
          </h1>
          <p className="text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Participate in evidence-based sessions led by seasoned faculty, industry innovators, and organizational strategists.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex space-x-2 w-full md:w-auto">
            {(['upcoming', 'past'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                  filter === f
                    ? 'bg-[#004D34] text-white shadow-md'
                    : 'bg-white text-slate-700 hover:text-[#004D34] border border-slate-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} Seminars
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search speaker, topic, or location..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#004D34] transition"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <LoadingSkeleton type="card" count={3} />
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchSeminars} />
        ) : displayed.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-[#004D34]/30" />
            <p className="text-lg font-bold text-[#004D34]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              No {filter} seminars matching your criteria.
            </p>
            <p className="text-xs text-slate-500 mt-1">Try resetting your search query or check back soon for updates.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayed.map(seminar => {
              const currentCount = regCounts[seminar.id] || 0
              const maxCap = seminar.max_registrations
              const isFull = maxCap != null && currentCount >= maxCap

              return (
                <div key={seminar.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-xl transition group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#004D34]/10 text-[#004D34] text-xs font-bold uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5 text-[#C6A15A]" />
                        {new Date(seminar.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {maxCap != null && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                          isFull ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          <Users className="w-3 h-3" />
                          {isFull ? 'Fully Booked' : `${currentCount}/${maxCap} Seats`}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-[#004D34] group-hover:text-[#C6A15A] transition mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {seminar.title}
                    </h3>
                    
                    <p className="text-slate-600 text-xs leading-relaxed mb-6 line-clamp-3">
                      {seminar.description}
                    </p>

                    <div className="space-y-2 text-xs text-slate-500 font-medium mb-6 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4 text-[#C6A15A] shrink-0" />
                        <span className="font-bold text-slate-700">{seminar.speaker}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#C6A15A] shrink-0" />
                        <span>{seminar.location}</span>
                      </div>
                    </div>
                  </div>

                  {filter === 'upcoming' ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => setRegModal({ id: seminar.id, title: seminar.title, maxCapacity: maxCap, count: currentCount })}
                        disabled={isFull}
                        className={`flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition active:scale-95 shadow-xs ${
                          isFull ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-[#004D34] hover:bg-[#003826] text-white'
                        }`}
                      >
                        <UserPlus className="w-4 h-4 text-[#C6A15A]" />
                        {isFull ? 'Seats Full' : 'Reserve Seat'}
                      </button>
                      {seminar.registration_link && (
                        <a
                          href={seminar.registration_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-3 border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-lg hover:border-[#004D34] hover:text-[#004D34] transition"
                        >
                          Details <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <a
                      href={seminar.registration_link ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#C6A15A] hover:bg-[#d4b47a] text-[#003826] text-xs font-black uppercase tracking-wider rounded-lg transition"
                    >
                      Watch Replay <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
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
        itemType="seminar"
        itemTitle={regModal?.title ?? ''}
        maxCapacity={regModal?.maxCapacity}
        currentCount={regModal?.count}
      />
    </div>
  )
}
