import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { formatSupabaseErrorMessage } from '../lib/formatSupabaseError'
import { BookOpen, Calendar, User, ArrowRight } from 'lucide-react'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import ErrorMessage from '../components/ui/ErrorMessage'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  author: string | null
  cover_image_url: string | null
  published_at: string | null
  created_at: string
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchPosts(options?: { preserveLoadingState?: boolean }) {
    if (!options?.preserveLoadingState) setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, author, cover_image_url, published_at, created_at')
      .eq('published', true)
      .order('published_at', { ascending: false })

    if (error) {
      setError(formatSupabaseErrorMessage(error.message))
    } else {
      setPosts(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, author, cover_image_url, published_at, created_at')
        .eq('published', true)
        .order('published_at', { ascending: false })

      if (!isMounted) return
      if (error) {
        setError(formatSupabaseErrorMessage(error.message))
      } else {
        setPosts(data ?? [])
      }
      setLoading(false)
    }
    void load()
    return () => { isMounted = false }
  }, [])

  return (
    <div>
      {/* Page header */}
      <section className="bg-bilcor-green text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-bilcor-gold text-xs font-semibold tracking-label mb-3 block">Blog</span>
          <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Insights & Stories
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            Thought leadership, event recaps, and practical wisdom from Bilcor Institute.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <LoadingSkeleton type="card" count={3} />
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchPosts} />
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-bilcor-green/20" />
            <p className="text-lg font-semibold text-bilcor-charcoal/60" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              No posts yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => {
              const displayDate = post.published_at ?? post.created_at
              return (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="bg-white border border-slate-200 hover:shadow-lg transition group flex flex-col"
                  style={{ borderRadius: '4px' }}
                >
                  {post.cover_image_url && (
                    <div className="overflow-hidden h-48">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-xs text-bilcor-charcoal/50 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(displayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {post.author && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {post.author}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-bilcor-green mb-3 group-hover:text-bilcor-gold transition leading-snug" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-bilcor-charcoal/60 text-sm leading-relaxed line-clamp-3 flex-1">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-1 mt-4 text-bilcor-gold text-sm font-bold uppercase tracking-wide">
                      Read More <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
