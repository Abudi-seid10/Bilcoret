import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Settings, Upload, Loader2, CheckCircle2 } from 'lucide-react'

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001'

function safeImgSrc(url: string): string {
  try {
    const parsed = new URL(url)
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') return url
  } catch {
    // fall through
  }
  return ''
}

export default function AdminSettings() {
  const [loading, setLoading] = useState(true)
  const [logoUrl, setLogoUrl] = useState('')
  const [faviconUrl, setFaviconUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function fetchSettings() {
    setLoading(true)
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', SETTINGS_ID)
      .single()

    if (data) {
      setLogoUrl(data.logo_url ?? '')
      setFaviconUrl(data.favicon_url ?? '')
    }
    setLoading(false)
  }

  useEffect(() => { fetchSettings() }, [])

  async function uploadFile(file: File, bucket: string, path: string): Promise<string | null> {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) { setError(error.message); return null }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    setError('')
    const url = await uploadFile(file, 'site-assets', `logo/${file.name}`)
    if (url) setLogoUrl(url)
    setUploadingLogo(false)
  }

  async function handleFaviconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingFavicon(true)
    setError('')
    const url = await uploadFile(file, 'site-assets', `favicon/${file.name}`)
    if (url) setFaviconUrl(url)
    setUploadingFavicon(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)

    const { error } = await supabase
      .from('site_settings')
      .update({
        logo_url: logoUrl || null,
        favicon_url: faviconUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', SETTINGS_ID)

    if (error) {
      setError(error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      fetchSettings()
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48"></div>
        <div className="h-40 bg-slate-200 rounded"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>Site Settings</h1>
        <p className="text-sm text-bilcor-charcoal/50 mt-1">Customize your site logo and favicon.</p>
      </div>

      <div className="bg-white border border-slate-200 p-6 max-w-2xl" style={{ borderRadius: '4px' }}>
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-bilcor-green" />
          <h2 className="font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>Branding</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Logo */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-3 block">Logo</label>
            {logoUrl && (
              <div className="mb-3 p-3 bg-bilcor-offwhite border border-slate-200 inline-block" style={{ borderRadius: '4px' }}>
                <img src={safeImgSrc(logoUrl)} alt="Current logo" className="h-12 object-contain" />
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-bilcor-green text-sm transition"
                  style={{ borderRadius: '4px' }}
                  placeholder="https://... or upload below"
                />
              </div>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-bilcor-offwhite border border-slate-300 text-bilcor-charcoal/60 font-bold text-sm uppercase tracking-wide cursor-pointer hover:border-bilcor-green transition shrink-0" style={{ borderRadius: '4px' }}>
                {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            </div>
            <p className="text-xs text-bilcor-charcoal/40 mt-1">Recommended: SVG or PNG with transparent background, at least 200px wide.</p>
          </div>

          {/* Favicon */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-3 block">Favicon</label>
            {faviconUrl && (
              <div className="mb-3 p-3 bg-bilcor-offwhite border border-slate-200 inline-block" style={{ borderRadius: '4px' }}>
                <img src={safeImgSrc(faviconUrl)} alt="Current favicon" className="h-8 w-8 object-contain" />
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={faviconUrl}
                  onChange={e => setFaviconUrl(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-bilcor-green text-sm transition"
                  style={{ borderRadius: '4px' }}
                  placeholder="https://... or upload below"
                />
              </div>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-bilcor-offwhite border border-slate-300 text-bilcor-charcoal/60 font-bold text-sm uppercase tracking-wide cursor-pointer hover:border-bilcor-green transition shrink-0" style={{ borderRadius: '4px' }}>
                {uploadingFavicon ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload
                <input type="file" accept="image/*,.ico" className="hidden" onChange={handleFaviconUpload} />
              </label>
            </div>
            <p className="text-xs text-bilcor-charcoal/40 mt-1">Recommended: ICO, PNG, or SVG, 32×32 or 64×64 pixels.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5" style={{ borderRadius: '4px' }}>
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || uploadingLogo || uploadingFavicon}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-bilcor-green text-white font-bold uppercase text-sm tracking-wide hover:bg-bilcor-green-light transition disabled:opacity-60"
              style={{ borderRadius: '4px' }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save Settings
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Saved
              </span>
            )}
          </div>
        </form>
      </div>

      {/* How to apply note */}
      <div className="mt-6 bg-bilcor-offwhite border border-slate-200 p-4 max-w-2xl" style={{ borderRadius: '4px' }}>
        <p className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-2">How Logo & Favicon Are Applied</p>
        <p className="text-sm text-bilcor-charcoal/60 leading-relaxed">
          The logo URL is used by the site header and admin panel. The favicon URL is applied dynamically to the browser tab via the site's layout component. Changes take effect immediately after saving — a page refresh may be needed to see the favicon update.
        </p>
      </div>
    </div>
  )
}
