import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { formatSupabaseErrorMessage } from '../../lib/formatSupabaseError'
import { BookOpen, Plus, Pencil, Trash2, X, Loader2, Globe, EyeOff, Calendar } from 'lucide-react'

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
  published: boolean
  published_at: string | null
  created_at: string
}

const empty = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  seo_title: '',
  seo_description: '',
  author: '',
  cover_image_url: '',
  published: false,
}

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [form, setForm] = useState<typeof empty>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function fetchPosts(options?: { preserveLoadingState?: boolean }) {
    if (!options?.preserveLoadingState) setLoading(true)
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
    setPosts(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })
      if (!isMounted) return
      setPosts(data ?? [])
      setLoading(false)
    }
    void load()
    return () => { isMounted = false }
  }, [])

  function openCreate() {
    setEditing(null)
    setForm(empty)
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
      cover_image_url: p.cover_image_url ?? '',
      published: p.published,
    })
    setShowForm(true)
    setError('')
  }

  function handleTitleChange(title: string) {
    setForm(f => ({
      ...f,
      title,
      slug: f.slug === '' || f.slug === generateSlug(f.title) ? generateSlug(title) : f.slug,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      title: form.title,
      slug: form.slug,
      content: form.content || null,
      excerpt: form.excerpt || null,
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
      author: form.author || null,
      cover_image_url: form.cover_image_url || null,
      published: form.published,
      published_at: form.published ? new Date().toISOString() : null,
    }

    const { error: err } = editing
      ? await supabase.from('blog_posts').update(payload).eq('id', editing.id)
      : await supabase.from('blog_posts').insert(payload)

    if (err) {
      setError(formatSupabaseErrorMessage(err.message))
      setSaving(false)
    } else {
      setShowForm(false)
      fetchPosts()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this blog post? This cannot be undone.')) return
    await supabase.from('blog_posts').delete().eq('id', id)
    fetchPosts()
  }

  async function togglePublish(post: BlogPost) {
    const published = !post.published
    await supabase
      .from('blog_posts')
      .update({ published, published_at: published ? new Date().toISOString() : null })
      .eq('id', post.id)
    fetchPosts({ preserveLoadingState: true })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>Blog</h1>
          <p className="text-sm text-bilcor-charcoal/50 mt-1">Create and manage blog posts.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-bilcor-gold text-bilcor-green-dark font-bold uppercase text-sm tracking-wide hover:brightness-110 transition"
          style={{ borderRadius: '4px' }}
        >
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
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {p.published ? (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wide" style={{ borderRadius: '4px' }}>Published</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-slate-100 text-bilcor-charcoal/50 text-xs font-bold uppercase tracking-wide" style={{ borderRadius: '4px' }}>Draft</span>
                  )}
                  {p.published_at && (
                    <span className="text-xs text-bilcor-charcoal/40 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(p.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-bilcor-green truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>{p.title}</h3>
                <p className="text-xs text-bilcor-charcoal/40 mt-0.5 truncate">/{p.slug}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => togglePublish(p)}
                  className={`p-2 transition ${p.published ? 'text-green-600 hover:text-bilcor-charcoal/40' : 'text-bilcor-charcoal/30 hover:text-green-600'}`}
                  title={p.published ? 'Unpublish' : 'Publish'}
                >
                  {p.published ? <EyeOff className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(p)} className="p-2 text-bilcor-charcoal/40 hover:text-bilcor-green transition">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-2 text-bilcor-charcoal/40 hover:text-red-500 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-white w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto" style={{ borderRadius: '4px' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {editing ? 'Edit Post' : 'New Blog Post'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-bilcor-charcoal/30 hover:text-bilcor-charcoal transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="Title" required>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  required
                  className="form-input"
                  placeholder="My Article Title"
                />
              </FormField>

              <FormField label="Slug (URL path)" required>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                  required
                  className="form-input font-mono text-sm"
                  placeholder="my-article-title"
                />
                <p className="text-xs text-bilcor-charcoal/40 mt-1">Will be accessible at /blog/{form.slug || '...'}</p>
              </FormField>

              <FormField label="Excerpt">
                <textarea
                  value={form.excerpt}
                  onChange={e => setForm({ ...form, excerpt: e.target.value })}
                  rows={2}
                  className="form-input"
                  placeholder="A short summary shown on the blog listing page…"
                />
              </FormField>

              <FormField label="Content (HTML)">
                <textarea
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  rows={10}
                  className="form-input font-mono text-sm"
                  placeholder="<p>Your article content here...</p>"
                />
              </FormField>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/40 mb-3">SEO</p>
                <div className="space-y-4">
                  <FormField label="SEO Title">
                    <input
                      type="text"
                      value={form.seo_title}
                      onChange={e => setForm({ ...form, seo_title: e.target.value })}
                      className="form-input"
                      placeholder="Overrides the page <title> tag"
                    />
                  </FormField>
                  <FormField label="Meta Description">
                    <textarea
                      value={form.seo_description}
                      onChange={e => setForm({ ...form, seo_description: e.target.value })}
                      rows={2}
                      className="form-input"
                      placeholder="Short description for search engines (150–160 chars recommended)"
                    />
                  </FormField>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Author">
                  <input
                    type="text"
                    value={form.author}
                    onChange={e => setForm({ ...form, author: e.target.value })}
                    className="form-input"
                    placeholder="Jane Doe"
                  />
                </FormField>
                <FormField label="Cover Image URL">
                  <input
                    type="url"
                    value={form.cover_image_url}
                    onChange={e => setForm({ ...form, cover_image_url: e.target.value })}
                    className="form-input"
                    placeholder="https://..."
                  />
                </FormField>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200" style={{ borderRadius: '4px' }}>
                <input
                  id="published"
                  type="checkbox"
                  checked={form.published}
                  onChange={e => setForm({ ...form, published: e.target.checked })}
                  className="w-4 h-4 accent-bilcor-green"
                />
                <label htmlFor="published" className="text-sm font-medium text-bilcor-charcoal cursor-pointer">
                  Publish immediately (visible to the public)
                </label>
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5" style={{ borderRadius: '4px' }}>{error}</div>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 border-2 border-slate-300 text-bilcor-charcoal/60 font-bold uppercase text-sm tracking-wide hover:bg-slate-50 transition"
                  style={{ borderRadius: '4px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-bilcor-green text-white font-bold uppercase text-sm tracking-wide hover:bg-bilcor-green-light transition disabled:opacity-60"
                  style={{ borderRadius: '4px' }}
                >
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

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  )
}
