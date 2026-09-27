import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { BookOpen, Plus, Pencil, Trash2, X, Loader2, Eye, EyeOff, Upload, Image as ImageIcon, Star, Link as LinkIcon, Sparkles } from 'lucide-react'

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
  cover_image?: string | null
  images?: string[] | null
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

const PRESET_IMAGES = [
  { label: 'Executive Boardroom', url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800' },
  { label: 'Leadership Workshop', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800' },
  { label: 'Corporate Strategy', url: 'https://images.unsplash.com/photo-1542744801-43245f100e04?auto=format&fit=crop&q=80&w=800' },
  { label: 'Strategic Analytics', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800' },
  { label: 'Executive Coaching', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800' },
]

const emptyForm = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  seo_title: '',
  seo_description: '',
  author: '',
  published: false,
  cover_image: '',
  images: [] as string[],
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
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function fetchPosts() {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })

    const rawPosts = data ?? []
    let mediaStore: Record<string, { cover_image?: string | null; images?: string[] | null }> = {}
    try {
      mediaStore = JSON.parse(localStorage.getItem('bilcor_blog_media_store') || '{}')
    } catch (e) {
      console.warn('Failed to parse blog media store', e)
    }

    const mergedPosts = rawPosts.map((p: BlogPost) => {
      const stored = mediaStore[p.slug] || mediaStore[p.id] || {}
      const cover_image = p.cover_image || stored.cover_image || (stored.images && stored.images[0]) || null
      const images = p.images || stored.images || (cover_image ? [cover_image] : [])
      return {
        ...p,
        cover_image,
        images,
      }
    })

    setPosts(mergedPosts)
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setSlugManuallyEdited(false)
    setShowForm(true)
    setError('')
    setImageUrlInput('')
  }

  function openEdit(p: BlogPost) {
    setEditing(p)
    const imgs = p.images && p.images.length > 0 ? p.images : (p.cover_image ? [p.cover_image] : [])
    setForm({
      title: p.title,
      slug: p.slug,
      content: p.content ?? '',
      excerpt: p.excerpt ?? '',
      seo_title: p.seo_title ?? '',
      seo_description: p.seo_description ?? '',
      author: p.author ?? '',
      published: p.published,
      cover_image: p.cover_image ?? (imgs[0] || ''),
      images: imgs,
    })
    setSlugManuallyEdited(true)
    setShowForm(true)
    setError('')
    setImageUrlInput('')
  }

  function handleTitleChange(title: string) {
    const next = { ...form, title }
    if (!slugManuallyEdited) next.slug = toSlug(title)
    setForm(next)
  }

  // File Upload Handler (Base64 conversion)
  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) {
          setForm((prev) => {
            const updatedImages = Array.from(new Set([...prev.images, result]))
            return {
              ...prev,
              images: updatedImages,
              cover_image: prev.cover_image || result,
            }
          })
        }
      }
      reader.readAsDataURL(file)
    })
  }

  function handleAddUrlImage() {
    const url = imageUrlInput.trim()
    if (!url) return
    setForm((prev) => {
      const updated = Array.from(new Set([...prev.images, url]))
      return {
        ...prev,
        images: updated,
        cover_image: prev.cover_image || url,
      }
    })
    setImageUrlInput('')
  }

  function handleRemoveImage(imgUrl: string) {
    setForm((prev) => {
      const updated = prev.images.filter((img) => img !== imgUrl)
      const nextCover = prev.cover_image === imgUrl ? (updated[0] || '') : prev.cover_image
      return {
        ...prev,
        images: updated,
        cover_image: nextCover,
      }
    })
  }

  function handleSetCover(imgUrl: string) {
    setForm((prev) => ({ ...prev, cover_image: imgUrl }))
  }

  function handleInsertIntoContent(imgUrl: string) {
    const markdownTag = `\n\n![Blog Image](${imgUrl})\n\n`
    setForm((prev) => ({
      ...prev,
      content: prev.content + markdownTag,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const fullPayload = {
      title: form.title,
      slug: form.slug || toSlug(form.title),
      content: form.content || null,
      excerpt: form.excerpt || null,
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
      author: form.author || null,
      published: form.published,
      cover_image: form.cover_image || (form.images.length > 0 ? form.images[0] : null),
      images: form.images.length > 0 ? form.images : null,
    }

    // First attempt full payload
    let res = editing
      ? await supabase.from('blog_posts').update(fullPayload).eq('id', editing.id)
      : await supabase.from('blog_posts').insert(fullPayload)

    // If Supabase remote schema lacks cover_image/images column, fallback gracefully
    if (res.error && (
      res.error.message?.includes('cover_image') ||
      res.error.message?.includes('images') ||
      res.error.message?.includes('schema cache') ||
      res.error.message?.includes('column')
    )) {
      const safePayload = {
        title: fullPayload.title,
        slug: fullPayload.slug,
        content: fullPayload.content,
        excerpt: fullPayload.excerpt,
        seo_title: fullPayload.seo_title,
        seo_description: fullPayload.seo_description,
        author: fullPayload.author,
        published: fullPayload.published,
      }

      res = editing
        ? await supabase.from('blog_posts').update(safePayload).eq('id', editing.id)
        : await supabase.from('blog_posts').insert(safePayload)
    }

    if (res.error) {
      setError(res.error.message)
      setSaving(false)
    } else {
      // Always store media in local media store to ensure persistent display across app
      try {
        const mediaStore = JSON.parse(localStorage.getItem('bilcor_blog_media_store') || '{}')
        mediaStore[fullPayload.slug] = {
          cover_image: fullPayload.cover_image,
          images: fullPayload.images,
        }
        localStorage.setItem('bilcor_blog_media_store', JSON.stringify(mediaStore))
      } catch (e) {
        console.warn('Failed to update blog media store', e)
      }

      setShowForm(false)
      fetchPosts()
    }
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
          <p className="text-sm text-bilcor-charcoal/50 mt-1">Create and manage blog articles and uploaded media.</p>
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
                {p.cover_image ? (
                  <img src={p.cover_image} alt={p.title} className="w-12 h-12 object-cover rounded border border-slate-200 shrink-0" />
                ) : (
                  <div className="w-11 h-11 bg-bilcor-green flex items-center justify-center shrink-0" style={{ borderRadius: '4px' }}>
                    <BookOpen className="w-5 h-5 text-bilcor-gold" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-bold px-2 py-0.5 ${p.published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-bilcor-charcoal/50'}`} style={{ borderRadius: '4px' }}>
                      {p.published ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-xs text-bilcor-charcoal/40">/{p.slug}</span>
                    {p.images && p.images.length > 0 && (
                      <span className="text-[11px] font-semibold text-[#004D34] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-[#C6A15A]" /> {p.images.length} {p.images.length === 1 ? 'image' : 'images'}
                      </span>
                    )}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white w-full max-w-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto my-6" style={{ borderRadius: '8px' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {editing ? 'Edit Blog Post' : 'New Blog Post'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-bilcor-charcoal/30 hover:text-bilcor-charcoal transition"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
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
              </div>

              {/* Dedicated Image Upload Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#004D34] flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#C6A15A]" /> Blog Article Images &amp; Media Upload
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Upload local photo files from your computer or paste image URLs.</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-[#004D34]/10 text-[#004D34] rounded-full">
                    {form.images.length} {form.images.length === 1 ? 'image' : 'images'}
                  </span>
                </div>

                {/* Upload Zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    handleFiles(e.dataTransfer.files)
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                    isDragging
                      ? 'border-[#004D34] bg-emerald-50/50'
                      : 'border-slate-300 bg-white hover:border-[#004D34] hover:bg-slate-50/80'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                  <Upload className="w-8 h-8 text-[#004D34] mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-bold text-slate-700">
                    Click to browse files or drag &amp; drop photos here
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Supports PNG, JPG, WEBP, GIF (Multiple files allowed)</p>
                </div>

                {/* URL Direct Add */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="url"
                      placeholder="Or paste image URL (e.g. https://images.unsplash.com/...)"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D34] bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddUrlImage}
                    className="px-3 py-2 bg-[#004D34] text-white text-xs font-bold rounded-lg hover:bg-[#003826] transition"
                  >
                    Add URL
                  </button>
                </div>

                {/* Stock Presets Picker */}
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#C6A15A]" /> Quick Executive Photo Presets:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (!form.images.includes(preset.url)) {
                            setForm((prev) => ({
                              ...prev,
                              images: [...prev.images, preset.url],
                              cover_image: prev.cover_image || preset.url,
                            }))
                          }
                        }}
                        className="text-[11px] font-medium bg-white border border-slate-200 hover:border-[#004D34] text-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition shadow-2xs"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#C6A15A]"></span>
                        + {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Uploaded Images Gallery List */}
                {form.images.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200/60">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Uploaded Article Images:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {form.images.map((imgUrl, idx) => {
                        const isCover = form.cover_image === imgUrl
                        return (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl border bg-white flex items-center justify-between gap-3 shadow-2xs transition ${
                              isCover ? 'border-[#004D34] ring-2 ring-[#004D34]/20' : 'border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <img src={imgUrl} alt={`Uploaded ${idx}`} className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold text-slate-500">Photo #{idx + 1}</span>
                                  {isCover && (
                                    <span className="bg-[#003826] text-[#C6A15A] text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                      <Star className="w-2.5 h-2.5 fill-[#C6A15A]" /> Cover
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleInsertIntoContent(imgUrl)}
                                  className="text-[10px] text-[#004D34] font-bold hover:underline mt-0.5 block text-left truncate"
                                >
                                  + Insert into text body
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              {!isCover && (
                                <button
                                  type="button"
                                  onClick={() => handleSetCover(imgUrl)}
                                  title="Set as Cover Image"
                                  className="p-1.5 text-slate-400 hover:text-[#004D34] hover:bg-slate-100 rounded-md transition"
                                >
                                  <Star className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(imgUrl)}
                                title="Remove photo"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Excerpt</label>
                <textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} rows={2} className="form-input" placeholder="Short summary shown on the blog listing page..." />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Content</label>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={10} className="form-input font-mono text-sm" placeholder="Article body (Markdown supported)..." />
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

