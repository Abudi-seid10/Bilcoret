import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { BookOpen, Plus, Pencil, Trash2, X, Loader2, Eye, EyeOff } from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string | null
  excerpt: string | null
  seo_title: string | null
  seo_description: string | null
  author: string | null
  published: boolean
  created_at: string
  updated_at: string
}

function toSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

const emptyForm = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  seo_title: '',
  seo_description: '',
  author: '',
  published: false,
}

export default function AdminBlogs() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [form, setForm] = useState<typeof emptyForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  async function fetchPosts() {
    setLoading(true)
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
    setPosts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setSlugManuallyEdited(false)
    setShowForm(true)
    setError('')
  }

  function openEdit(p: BlogPost) {
    setEditing(p)
    setForm({
      title: p.title,
      slug: p.slug,
      content: p.content ?? '',
      excerpt: p.excerpt ?? '',
      seo_title: p.seo_title ?? '',
      seo_description: p.seo_description ?? '',
      author: p.author ?? '',
      published: p.published,
    })
    setSlugManuallyEdited(true)
    setShowForm(true)
    setError('')
  }

  function handleTitleChange(title: string) {
    const next = { ...form, title }
    if (!slugManuallyEdited) next.slug = toSlug(title)
    setForm(next)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      title: form.title,
      slug: form.slug || toSlug(form.title),
      content: form.content || null,
      excerpt: form.excerpt || null,
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
      author: form.author || null,
      published: form.published,
    }

    const { error } = editing
      ? await supabase.from('blog_posts').update(payload).eq('id', editing.id)
      : await supabase.from('blog_posts').insert(payload)

    if (error) { setError(error.message); setSaving(false) }
    else { setShowForm(false); fetchPosts() }
  }

  async function togglePublished(post: BlogPost) {
    await supabase.from('blog_posts').update({ published: !post.published }).eq('id', post.id)
    fetchPosts()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this blog post?')) return
    await supabase.from('blog_posts').delete().eq('id', id)
    fetchPosts()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>Blog Posts</h1>
          <p className="text-sm text-bilcor-charcoal/50 mt-1">Create and manage blog articles.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 bg-bilcor-gold text-bilcor-green-dark font-bold uppercase text-sm tracking-wide hover:brightness-110 transition" style={{ borderRadius: '4px' }}>
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-slate-200" style={{ borderRadius: '4px' }}></div>)}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 text-center" style={{ borderRadius: '4px' }}>
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-bilcor-green/20" />
          <p className="text-bilcor-charcoal/50 font-medium">No blog posts yet. Create your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(p => (
            <div key={p.id} className="bg-white border border-slate-200 p-4 flex items-center justify-between gap-4 hover:shadow-sm transition" style={{ borderRadius: '4px' }}>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-11 h-11 bg-bilcor-green flex items-center justify-center shrink-0" style={{ borderRadius: '4px' }}>
                  <BookOpen className="w-5 h-5 text-bilcor-gold" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-bold px-2 py-0.5 ${p.published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-bilcor-charcoal/50'}`} style={{ borderRadius: '4px' }}>
                      {p.published ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-xs text-bilcor-charcoal/40">/{p.slug}</span>
                  </div>
                  <h3 className="font-bold text-bilcor-green truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>{p.title}</h3>
                  <div className="flex flex-wrap gap-x-3 text-xs text-bilcor-charcoal/50 mt-0.5">
                    {p.author && <span>{p.author}</span>}
                    <span>{new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => togglePublished(p)}
                  title={p.published ? 'Unpublish' : 'Publish'}
                  className={`p-2 transition ${p.published ? 'text-green-600 hover:text-bilcor-charcoal/40' : 'text-bilcor-charcoal/40 hover:text-green-600'}`}
                >
                  {p.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(p)} className="p-2 text-bilcor-charcoal/40 hover:text-bilcor-green transition"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(p.id)} className="p-2 text-bilcor-charcoal/40 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-white w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto" style={{ borderRadius: '4px' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {editing ? 'Edit Post' : 'New Blog Post'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-bilcor-charcoal/30 hover:text-bilcor-charcoal transition"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Slug <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => { setSlugManuallyEdited(true); setForm({ ...form, slug: e.target.value }) }}
                  required
                  className="form-input font-mono text-sm"
                  placeholder="my-article-slug"
                />
                <p className="text-xs text-bilcor-charcoal/40 mt-1">URL: /blog/{form.slug || 'slug'}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Author</label>
                <input type="text" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} className="form-input" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Excerpt</label>
                <textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} rows={2} className="form-input" placeholder="Short summary shown on the blog listing page..." />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Content</label>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={10} className="form-input font-mono text-sm" placeholder="Article body..." />
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-3">SEO</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-bilcor-charcoal/50 mb-1 block">SEO Title</label>
                    <input type="text" value={form.seo_title} onChange={e => setForm({ ...form, seo_title: e.target.value })} className="form-input" placeholder="Overrides page <title> tag" />
                  </div>
                  <div>
                    <label className="text-xs text-bilcor-charcoal/50 mb-1 block">SEO Description</label>
                    <textarea value={form.seo_description} onChange={e => setForm({ ...form, seo_description: e.target.value })} rows={2} className="form-input" placeholder="Meta description for search engines" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="published"
                  checked={form.published}
                  onChange={e => setForm({ ...form, published: e.target.checked })}
                  className="w-4 h-4 accent-bilcor-green"
                />
                <label htmlFor="published" className="text-sm font-medium text-bilcor-charcoal/70">Published (visible on public blog)</label>
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5" style={{ borderRadius: '4px' }}>{error}</div>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border-2 border-slate-300 text-bilcor-charcoal/60 font-bold uppercase text-sm tracking-wide hover:bg-slate-50 transition" style={{ borderRadius: '4px' }}>Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-bilcor-green text-white font-bold uppercase text-sm tracking-wide hover:bg-bilcor-green-light transition disabled:opacity-60" style={{ borderRadius: '4px' }}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? 'Save Changes' : 'Create Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
