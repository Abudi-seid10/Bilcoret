import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { User, Calendar, ArrowLeft } from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string | null
  excerpt: string | null
  seo_title: string | null
  seo_description: string | null
  author: string | null
  created_at: string
  updated_at: string
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function fetchPost() {
      setLoading(true)
      setNotFound(false)
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug ?? '')
        .eq('published', true)
        .single()

      if (error || !data) {
        setNotFound(true)
      } else {
        setPost(data)
        // Update document title and meta description for SEO
        document.title = data.seo_title ?? data.title
        const metaDesc = document.querySelector('meta[name="description"]')
        if (metaDesc) {
          metaDesc.setAttribute('content', data.seo_description ?? data.excerpt ?? '')
        } else {
          const meta = document.createElement('meta')
          meta.setAttribute('name', 'description')
          meta.setAttribute('content', data.seo_description ?? data.excerpt ?? '')
          document.head.appendChild(meta)
        }
      }
      setLoading(false)
    }
    fetchPost()

    return () => {
      // Reset title on unmount
      document.title = 'Bilcor Institute of Leadership'
    }
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 w-3/4"></div>
          <div className="h-4 bg-slate-200 w-1/3"></div>
          <div className="space-y-2 mt-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-slate-100"></div>)}
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-2xl font-bold text-bilcor-green mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>Article Not Found</h1>
        <p className="text-bilcor-charcoal/60 mb-6">This article may have been moved or unpublished.</p>
        <Link to="/blog" className="inline-flex items-center gap-2 px-5 py-2.5 bg-bilcor-green text-white font-bold uppercase text-sm tracking-wide hover:bg-bilcor-green-light transition" style={{ borderRadius: '4px' }}>
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </div>
    )
  }

  return (
    <div>
      <section className="bg-bilcor-green text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-white/50 hover:text-bilcor-gold text-sm font-medium transition mb-6">
            <ArrowLeft className="w-4 h-4" /> Blog
          </Link>
          <h1 className="text-3xl md:text-4xl font-black mb-4 leading-snug" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {post.title}
          </h1>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/50">
            {post.author && (
              <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{post.author}</span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {post.excerpt && (
          <p className="text-lg text-bilcor-charcoal/70 leading-relaxed mb-8 font-medium border-l-4 border-bilcor-gold pl-5">
            {post.excerpt}
          </p>
        )}
        {post.content ? (
          <div
            className="prose prose-bilcor max-w-none text-bilcor-charcoal/80 leading-relaxed [&>h2]:font-bold [&>h2]:text-bilcor-green [&>h2]:text-xl [&>h2]:mt-8 [&>h2]:mb-3 [&>h3]:font-bold [&>h3]:text-bilcor-green [&>h3]:mt-6 [&>h3]:mb-2 [&>p]:mb-4 [&>ul]:mb-4 [&>ul]:pl-6 [&>ul]:list-disc [&>ol]:mb-4 [&>ol]:pl-6 [&>ol]:list-decimal [&>li]:mb-1 [&>blockquote]:border-l-4 [&>blockquote]:border-bilcor-gold [&>blockquote]:pl-5 [&>blockquote]:italic [&>blockquote]:text-bilcor-charcoal/60 [&>blockquote]:my-6"
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
          />
        ) : (
          <p className="text-bilcor-charcoal/40 italic">Content coming soon.</p>
        )}

        <div className="mt-12 pt-8 border-t border-slate-200">
          <Link to="/blog" className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-bilcor-green text-bilcor-green font-bold uppercase text-sm tracking-wide hover:bg-bilcor-green hover:text-white transition" style={{ borderRadius: '4px' }}>
            <ArrowLeft className="w-4 h-4" /> Back to All Articles
          </Link>
        </div>
      </div>
    </div>
  )
}
