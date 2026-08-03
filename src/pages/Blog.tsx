import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { BookOpen, User, Calendar } from 'lucide-react'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import ErrorMessage from '../components/ui/ErrorMessage'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  author: string | null
  created_at: string
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchPosts() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, author, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setPosts(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [])

  return (
    <div>
      <section className="bg-bilcor-green text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-bilcor-gold text-xs font-semibold tracking-label mb-3 block">Blog</span>
          <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Insights & Articles
          </h1>
          <p className="text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
            Thought leadership, practical guides, and perspectives on leadership and professional development.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <LoadingSkeleton type="list" count={4} />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchPosts} />
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-bilcor-charcoal/40">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-bilcor-green/20" />
            <p className="text-lg font-semibold text-bilcor-charcoal/60" style={{ fontFamily: 'Montserrat, sans-serif' }}>No articles yet.</p>
            <p className="text-sm mt-1">Check back soon for new content.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map(post => (
              <article key={post.id} className="bg-white border border-slate-200 p-6 hover:shadow-lg transition group" style={{ borderRadius: '4px' }}>
                <Link to={`/blog/${post.slug}`} className="block">
                  <h2 className="text-xl font-bold text-bilcor-green group-hover:text-bilcor-gold transition mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-bilcor-charcoal/60 text-sm leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                  )}
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-bilcor-charcoal/40">
                    {post.author && (
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />{post.author}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
