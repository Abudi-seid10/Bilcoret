import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Calendar, User, ArrowLeft, BookOpen } from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string | null
  excerpt: string | null
  seo_title: string | null
  seo_description: string | null
  author: string | null
  cover_image_url: string | null
  published_at: string | null
  created_at: string
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      if (!slug) { navigate('/blog', { replace: true }); return }

      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single()

      if (!isMounted) return

      if (error || !data) {
        setNotFound(true)
      } else {
        setPost(data as BlogPost)
      }
      setLoading(false)
    }

    void load()
    return () => { isMounted = false }
  }, [slug, navigate])

  // Update document <title> and meta tags for SEO
  useEffect(() => {
    if (!post) return
    const prevTitle = document.title
    document.title = post.seo_title ?? post.title ?? 'Blog — Bilcor Institute of Leadership'

    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    let createdMeta = false
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
      createdMeta = true
    }
    const prevDesc = metaDesc.content
    metaDesc.content = post.seo_description ?? post.excerpt ?? ''

    return () => {
      document.title = prevTitle
      if (createdMeta && metaDesc) {
        document.head.removeChild(metaDesc)
      } else if (metaDesc) {
        metaDesc.content = prevDesc
      }
    }
  }, [post])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-32 mb-8" style={{ borderRadius: '4px' }}></div>
        <div className="h-10 bg-slate-200 rounded w-3/4 mb-4" style={{ borderRadius: '4px' }}></div>
        <div className="h-4 bg-slate-200 rounded w-1/2 mb-8" style={{ borderRadius: '4px' }}></div>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-slate-200 rounded" style={{ borderRadius: '4px' }}></div>)}
        </div>
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <BookOpen className="w-12 h-12 mx-auto mb-4 text-bilcor-green/20" />
        <h1 className="text-2xl font-bold text-bilcor-green mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>Post not found</h1>
        <p className="text-bilcor-charcoal/50 mb-8">This article may have been removed or the link is incorrect.</p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-bilcor-green text-white font-bold uppercase text-sm tracking-wide hover:bg-bilcor-green-light transition"
          style={{ borderRadius: '4px' }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </div>
    )
  }

  const displayDate = post.published_at ?? post.created_at

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-sm text-bilcor-charcoal/50 hover:text-bilcor-green transition mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Blog
      </Link>

      {post.cover_image_url && (
        <div className="rounded overflow-hidden mb-8 h-64 md:h-80" style={{ borderRadius: '4px' }}>
          <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-bilcor-green leading-tight mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-bilcor-charcoal/50">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {new Date(displayDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          {post.author && (
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {post.author}
            </span>
          )}
        </div>
        {post.excerpt && (
          <p className="mt-4 text-lg text-bilcor-charcoal/60 leading-relaxed border-l-4 border-bilcor-gold pl-4">
            {post.excerpt}
          </p>
        )}
      </header>

      {post.content && (
        <div
          className="prose prose-slate max-w-none text-bilcor-charcoal/80 leading-relaxed"
          style={{ lineHeight: '1.8' }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      )}
    </article>
  )
}
