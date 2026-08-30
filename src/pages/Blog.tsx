import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { BookOpen, User, Calendar, Search, ArrowRight } from 'lucide-react'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import ErrorMessage from '../components/ui/ErrorMessage'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  author: string | null
  created_at: string
  cover_image?: string | null
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  async function fetchPosts() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      let mediaStore: Record<string, { cover_image?: string | null }> = {}
      try {
        mediaStore = JSON.parse(localStorage.getItem('bilcor_blog_media_store') || '{}')
      } catch {}

      const merged = (data ?? []).map((p: any) => ({
        ...p,
        cover_image: p.cover_image || mediaStore[p.slug]?.cover_image || mediaStore[p.id]?.cover_image || null,
      }))
      setPosts(merged)
    }
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [])

  const displayedPosts = posts.filter(post =>
    searchQuery.trim() === '' ||
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (post.author && post.author.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const featuredPost = displayedPosts.length > 0 ? displayedPosts[0] : null
  const regularPosts = displayedPosts.length > 1 ? displayedPosts.slice(1) : []

  return (
    <div>
      {/* Editorial Header */}
      <section className="bg-[#003826] text-white py-16 lg:py-20 border-b border-[#C6A15A]/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#C6A15A] text-xs font-bold uppercase tracking-wider mb-3 block">Bilcor Publications</span>
          <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Leadership Insights &amp; Research
          </h1>
          <p className="text-lg text-slate-200 max-w-xl mx-auto leading-relaxed">
            Analytical essays, practical frameworks, and executive briefs authored by Bilcor faculty and guest experts.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search articles, keywords, or authors..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#004D34] shadow-xs transition"
          />
        </div>

        {loading ? (
          <LoadingSkeleton type="list" count={4} />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchPosts} />
        ) : displayedPosts.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-[#004D34]/30" />
            <p className="text-lg font-bold text-[#004D34]" style={{ fontFamily: 'Montserrat, sans-serif' }}>No published articles found.</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search query or check back later.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Featured Article Card */}
            {featuredPost && (
              <article className="bg-[#003826] text-white rounded-2xl p-8 lg:p-10 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#C6A15A]/10 rounded-full blur-3xl pointer-events-none" />
                <span className="text-[#C6A15A] text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-[#C6A15A]/20 rounded-full inline-block mb-4">
                  Featured Publication
                </span>

                <Link to={`/blog/${featuredPost.slug}`} className="block">
                  <h2 className="text-2xl md:text-3xl font-bold group-hover:text-[#C6A15A] transition mb-4 leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {featuredPost.title}
                  </h2>
                  {featuredPost.excerpt && (
                    <p className="text-slate-300 text-sm leading-relaxed mb-6 line-clamp-3 max-w-3xl">
                      {featuredPost.excerpt}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/10 text-xs text-slate-300">
                    <div className="flex items-center gap-4">
                      {featuredPost.author && (
                        <span className="flex items-center gap-1.5 font-semibold text-white">
                          <User className="w-4 h-4 text-[#C6A15A]" /> {featuredPost.author}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#C6A15A]" />
                        {new Date(featuredPost.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C6A15A] uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                      Read Full Article <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </article>
            )}

            {/* Regular Article Grid */}
            {regularPosts.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6 pt-4">
                {regularPosts.map(post => (
                  <article key={post.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition group flex flex-col justify-between">
                    <Link to={`/blog/${post.slug}`} className="block h-full flex flex-col justify-between">
                      <div>
                        {post.cover_image && (
                          <div className="w-full h-44 overflow-hidden bg-slate-100 border-b border-slate-100">
                            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                          </div>
                        )}
                        <div className="p-6">
                          <h3 className="text-lg font-bold text-[#004D34] group-hover:text-[#C6A15A] transition mb-3 line-clamp-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-slate-600 text-xs leading-relaxed mb-4 line-clamp-3">
                              {post.excerpt}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="px-6 pb-6 pt-0 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-3">
                          {post.author && (
                            <span className="flex items-center gap-1 font-medium text-slate-700">
                              <User className="w-3.5 h-3.5 text-[#C6A15A]" /> {post.author}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <span className="text-[#004D34] font-bold uppercase tracking-wider text-[11px] group-hover:text-[#C6A15A]">Read →</span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

