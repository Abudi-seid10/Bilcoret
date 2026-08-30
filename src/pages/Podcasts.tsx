import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Headphones, Clock, User, ExternalLink, Play, Search, X, Send } from 'lucide-react'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import ErrorMessage from '../components/ui/ErrorMessage'

function YoutubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

interface Podcast {
  id: string
  title: string
  episode_number: number
  guest: string
  description: string
  audio_url: string | null
  duration: number
  publish_date: string
  youtube_url: string | null
}

function getYouTubeVideoId(url: string | null): string | null {
  if (!url) return null
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/)
  return match ? match[1] : null
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`
  return `${m}m`
}

export default function Podcasts() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeVideo, setActiveVideo] = useState<{ id: string; title: string; youtubeId: string } | null>(null)

  async function fetchPodcasts() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('podcasts')
      .select('*')
      .order('episode_number', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setPodcasts(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchPodcasts() }, [])

  const displayedPodcasts = podcasts.filter(podcast =>
    searchQuery.trim() === '' ||
    podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    podcast.guest.toLowerCase().includes(searchQuery.toLowerCase()) ||
    podcast.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const featuredPodcast = displayedPodcasts.length > 0 ? displayedPodcasts[0] : null
  const featuredYtId = featuredPodcast ? getYouTubeVideoId(featuredPodcast.youtube_url) : null

  return (
    <div>
      {/* Editorial Header Banner */}
      <section className="bg-[#003826] text-white py-16 lg:py-20 border-b border-[#C6A15A]/20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Leadership Conversations
          </h1>
          <p className="text-lg text-slate-200 max-w-xl mx-auto leading-relaxed">
            High-impact video interviews, executive case studies, and actionable insights hosted by Bilcor faculty.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a
              href="https://www.youtube.com/@bilcoret1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C6A15A] text-[#003826] text-xs font-black uppercase tracking-wider rounded-lg hover:brightness-110 transition shadow-md"
            >
              <Send className="w-3.5 h-3.5" /> Join Broadcast on Youtube
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search podcast episodes, guests, or topics..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#004D34] shadow-xs transition"
          />
        </div>

        {loading ? (
          <LoadingSkeleton type="card" count={3} />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchPodcasts} />
        ) : displayedPodcasts.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <YoutubeIcon className="w-12 h-12 mx-auto mb-3 text-red-500/30" />
            <p className="text-lg font-bold text-[#004D34]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              No podcast episodes found
            </p>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search query or check back later for new releases.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Video Spotlight Banner with Large YouTube Cover Picture */}
            {featuredPodcast && featuredYtId && (
              <div className="bg-[#003826] text-white rounded-2xl overflow-hidden shadow-2xl border border-[#C6A15A]/30 grid lg:grid-cols-12">
                <div className="lg:col-span-7 relative bg-black aspect-video lg:aspect-auto overflow-hidden group">
                  <img
                    src={`https://img.youtube.com/vi/${featuredYtId}/maxresdefault.jpg`}
                    alt={featuredPodcast.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = `https://img.youtube.com/vi/${featuredYtId}/hqdefault.jpg`
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity">
                    <button
                      onClick={() => setActiveVideo({ id: featuredPodcast.id, title: featuredPodcast.title, youtubeId: featuredYtId })}
                      aria-label="Play video"
                      className="w-16 h-16 rounded-full bg-[#C6A15A] text-[#003826] flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Play className="w-7 h-7 ml-1 fill-current" />
                    </button>
                  </div>
                  <span className="absolute bottom-3 left-3 bg-red-600 text-white text-[10px] px-2.5 py-1 rounded font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <YoutubeIcon className="w-3.5 h-3.5 fill-current" /> 
                  </span>
                </div>

                <div className="lg:col-span-5 p-8 flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-[#C6A15A]/20 text-[#C6A15A] text-[10px] font-black uppercase tracking-wider mb-4">
                      Featured Episode #{featuredPodcast.episode_number}
                    </span>
                    <h2 className="text-2xl font-bold mb-3 text-white leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {featuredPodcast.title}
                    </h2>
                    <p className="text-slate-300 text-xs leading-relaxed mb-6 line-clamp-3">
                      {featuredPodcast.description}
                    </p>

                    <div className="space-y-2 text-xs text-slate-300 font-medium mb-6">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#C6A15A]" /> Guest: <span className="font-bold text-white">{featuredPodcast.guest}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#C6A15A]" /> Duration: {formatDuration(featuredPodcast.duration)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
                    <button
                      onClick={() => setActiveVideo({ id: featuredPodcast.id, title: featuredPodcast.title, youtubeId: featuredYtId })}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#C6A15A] hover:bg-[#d4b47a] text-[#003826] font-black uppercase text-xs tracking-wider rounded-lg transition"
                    >
                      <Play className="w-4 h-4 fill-current" /> Watch Video
                    </button>
                    {featuredPodcast.youtube_url && (
                      <a
                        href={featuredPodcast.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition border border-white/10"
                      >
                        YouTube <ExternalLink className="w-3.5 h-3.5 text-[#C6A15A]" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Episode Video Cards Grid featuring High-Res Cover Pictures */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedPodcasts.map(podcast => {
                const ytId = getYouTubeVideoId(podcast.youtube_url)
                const thumbnail = ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : null

                return (
                  <div key={podcast.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition group flex flex-col justify-between">
                    <div>
                      {/* High-Res YouTube Cover Picture Header */}
                      <div className="relative aspect-video bg-slate-900 overflow-hidden cursor-pointer" onClick={() => ytId && setActiveVideo({ id: podcast.id, title: podcast.title, youtubeId: ytId })}>
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={podcast.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              if (ytId) {
                                e.currentTarget.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-[#003826] flex items-center justify-center">
                            <Headphones className="w-12 h-12 text-[#C6A15A]/40" />
                          </div>
                        )}

                        {/* YouTube Play Overlay */}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                          {ytId && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveVideo({ id: podcast.id, title: podcast.title, youtubeId: ytId })
                              }}
                              aria-label={`Play ${podcast.title}`}
                              className="w-12 h-12 rounded-full bg-[#004D34] text-[#C6A15A] flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer border border-[#C6A15A]/30"
                            >
                              <Play className="w-5 h-5 ml-0.5 fill-current" />
                            </button>
                          )}
                        </div>

                        {/* Cover Picture Badges */}
                        <span className="absolute top-3 left-3 bg-[#003826] text-[#C6A15A] text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider shadow-sm">
                          EP {podcast.episode_number}
                        </span>
                        <span className="absolute bottom-3 right-3 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                          {formatDuration(podcast.duration)}
                        </span>
                      </div>

                      {/* Content Section */}
                      <div className="p-6">
                        <h3 className="text-base font-bold text-[#004D34] group-hover:text-[#C6A15A] transition mb-2 line-clamp-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {podcast.title}
                        </h3>
                        <p className="text-slate-600 text-xs leading-relaxed mb-4 line-clamp-2">
                          {podcast.description}
                        </p>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#C6A15A]" /> Guest: {podcast.guest}
                        </p>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="p-6 pt-0 flex items-center justify-between gap-2">
                      {ytId ? (
                        <button
                          onClick={() => setActiveVideo({ id: podcast.id, title: podcast.title, youtubeId: ytId })}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#004D34] hover:bg-[#003826] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition"
                        >
                          <Play className="w-3.5 h-3.5 fill-current text-[#C6A15A]" /> Watch Video
                        </button>
                      ) : null}
                      {podcast.youtube_url && (
                        <a
                          href={podcast.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-2 border border-slate-200 hover:border-red-500 hover:text-red-600 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-lg transition"
                        >
                          <YoutubeIcon className="w-3.5 h-3.5 text-red-600 fill-current" />
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* In-App Interactive YouTube Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between px-6 py-4 bg-[#003826] text-white border-b border-[#C6A15A]/20">
              <div className="flex items-center gap-2">
                <YoutubeIcon className="w-5 h-5 text-red-500 fill-current" />
                <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {activeVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                aria-label="Close modal"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
