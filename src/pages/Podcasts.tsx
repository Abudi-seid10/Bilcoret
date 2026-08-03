import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { formatSupabaseErrorMessage } from '../lib/formatSupabaseError'
import { Headphones, User, Clock, ExternalLink } from 'lucide-react'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import ErrorMessage from '../components/ui/ErrorMessage'

interface Podcast {
  id: string
  title: string
  episode_number: number
  guest: string
  description: string
  youtube_url: string | null
  duration: number
  publish_date: string
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`
  return `${m}m`
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    const hostname = u.hostname.toLowerCase()
    let videoId: string | null = null
    if (hostname === 'youtu.be') {
      videoId = u.pathname.slice(1).split('/')[0] || null
    } else if (hostname === 'youtube.com' || hostname === 'www.youtube.com') {
      videoId = u.searchParams.get('v')
      if (!videoId) {
        const match = u.pathname.match(/^\/embed\/([a-zA-Z0-9_-]+)/)
        if (match) videoId = match[1]
      }
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  } catch {
    return null
  }
}

export default function Podcasts() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchPodcasts(options?: { preserveLoadingState?: boolean; preserveErrorState?: boolean }) {
    if (!options?.preserveLoadingState) {
      setLoading(true)
    }
    if (!options?.preserveErrorState) {
      setError(null)
    }
    const { data, error } = await supabase
      .from('podcasts')
      .select('*')
      .order('episode_number', { ascending: false })

    if (error) {
      setError(formatSupabaseErrorMessage(error.message))
    } else {
      setPodcasts(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    let isMounted = true

    const loadPodcasts = async () => {
      const { data, error } = await supabase
        .from('podcasts')
        .select('*')
        .order('episode_number', { ascending: false })

      if (!isMounted) return

      if (error) {
        setError(formatSupabaseErrorMessage(error.message))
      } else {
        setPodcasts(data ?? [])
      }
      setLoading(false)
    }

    void loadPodcasts()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div>
      {/* Page header — Deep Green band */}
      <section className="bg-bilcor-green text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-bilcor-gold text-xs font-semibold tracking-label mb-3 block">Podcast</span>
          <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Bilcor Podcast
          </h1>
          <p className="text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
            Conversations with leaders, thinkers, and doers creating real value in the world.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <LoadingSkeleton type="list" count={4} />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchPodcasts} />
        ) : podcasts.length === 0 ? (
          <div className="text-center py-16 text-bilcor-charcoal/40">
            <Headphones className="w-12 h-12 mx-auto mb-4 text-bilcor-green/20" />
            <p className="text-lg font-semibold text-bilcor-charcoal/60" style={{ fontFamily: 'Montserrat, sans-serif' }}>No episodes yet.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {podcasts.map(ep => {
              const embedUrl = ep.youtube_url ? getYouTubeEmbedUrl(ep.youtube_url) : null
              return (
              <div key={ep.id} className="bg-white border border-slate-200 hover:shadow-lg transition group" style={{ borderRadius: '4px' }}>
                {embedUrl && (
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={embedUrl}
                      title={ep.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                      style={{ borderRadius: '4px 4px 0 0' }}
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex gap-5">
                    {!embedUrl && (
                      <div className="w-16 h-16 bg-bilcor-green flex items-center justify-center shrink-0" style={{ borderRadius: '4px' }}>
                        <Headphones className="w-7 h-7 text-bilcor-gold" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-bilcor-gold tracking-label bg-bilcor-gold/10 px-2.5 py-0.5" style={{ borderRadius: '4px' }}>
                          EP {ep.episode_number}
                        </span>
                        <span className="text-xs text-bilcor-charcoal/40 font-medium">
                          {new Date(ep.publish_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="font-bold text-bilcor-green text-lg group-hover:text-bilcor-gold transition mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>{ep.title}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-bilcor-charcoal/50 mb-3">
                        {ep.guest && <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{ep.guest}</span>}
                        {ep.duration > 0 && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDuration(ep.duration)}</span>}
                      </div>
                      <p className="text-sm text-bilcor-charcoal/60 leading-relaxed line-clamp-2">{ep.description}</p>
                      {ep.youtube_url && !embedUrl && (
                        <a
                          href={ep.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-2 px-5 py-2 bg-red-600 text-white text-sm font-bold uppercase tracking-wide hover:brightness-110 transition active:scale-95"
                          style={{ borderRadius: '4px' }}
                        >
                        <ExternalLink className="w-4 h-4" /> Watch on YouTube
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
