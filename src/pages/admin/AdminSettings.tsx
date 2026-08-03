import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Settings, Upload, Image, Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'

interface SiteSetting {
  key: string
  value: string | null
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string | null>>({ logo_url: null, favicon_url: null })
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<'logo' | 'favicon' | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)

  async function fetchSettings() {
    setLoading(true)
    const { data } = await supabase.from('site_settings').select('key, value').in('key', ['logo_url', 'favicon_url'])
    if (data) {
      const map: Record<string, string | null> = { logo_url: null, favicon_url: null }
      data.forEach((s: SiteSetting) => { map[s.key] = s.value })
      setSettings(map)
    }
    setLoading(false)
  }

  useEffect(() => { fetchSettings() }, [])

  function showSuccess(msg: string) {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 3000)
  }

  async function handleUpload(type: 'logo' | 'favicon', file: File) {
    setUploading(type)
    setError(null)

    const ext = file.name.split('.').pop()
    const path = `${type}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('site-assets')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`)
      setUploading(null)
      return
    }

    const { data: urlData } = supabase.storage.from('site-assets').getPublicUrl(path)
    const publicUrl = urlData.publicUrl + `?t=${Date.now()}`

    const { error: settingError } = await supabase
      .from('site_settings')
      .upsert({ key: `${type}_url`, value: publicUrl, updated_at: new Date().toISOString() })

    if (settingError) {
      setError(`Failed to save setting: ${settingError.message}`)
    } else {
      setSettings(prev => ({ ...prev, [`${type}_url`]: publicUrl }))
      showSuccess(`${type === 'logo' ? 'Logo' : 'Favicon'} updated successfully!`)
    }
    setUploading(null)
  }

  function onFileChange(type: 'logo' | 'favicon') {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleUpload(type, file)
      e.target.value = ''
    }
  }

  async function handleRemove(type: 'logo' | 'favicon') {
    if (!confirm(`Remove the custom ${type}? The default will be used.`)) return
    const { error: settingError } = await supabase
      .from('site_settings')
      .upsert({ key: `${type}_url`, value: null, updated_at: new Date().toISOString() })
    if (settingError) {
      setError(`Failed to remove: ${settingError.message}`)
    } else {
      setSettings(prev => ({ ...prev, [`${type}_url`]: null }))
      showSuccess(`${type === 'logo' ? 'Logo' : 'Favicon'} removed.`)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>Site Settings</h1>
        <p className="text-sm text-bilcor-charcoal/50 mt-1">Manage logo and favicon for the public site.</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 mb-6" style={{ borderRadius: '4px' }}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-6" style={{ borderRadius: '4px' }}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(2)].map((_, i) => <div key={i} className="h-36 bg-slate-200" style={{ borderRadius: '4px' }} />)}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Logo */}
          <div className="bg-white border border-slate-200 p-6" style={{ borderRadius: '4px' }}>
            <div className="flex items-center gap-2 mb-4">
              <Image className="w-5 h-5 text-bilcor-green" />
              <h2 className="font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>Logo</h2>
            </div>
            <p className="text-sm text-bilcor-charcoal/50 mb-4">Upload a custom logo image (PNG, SVG, or WebP recommended). Displayed in the site header.</p>
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="w-32 h-20 bg-bilcor-offwhite border border-slate-200 flex items-center justify-center shrink-0" style={{ borderRadius: '4px' }}>
                {settings.logo_url ? (
                  <img src={settings.logo_url} alt="Logo" className="max-w-full max-h-full object-contain p-2" />
                ) : (
                  <Settings className="w-8 h-8 text-slate-300" />
                )}
              </div>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploading === 'logo'}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-bilcor-gold text-bilcor-green-dark font-bold uppercase text-sm tracking-wide hover:brightness-110 transition disabled:opacity-60"
                  style={{ borderRadius: '4px' }}
                >
                  {uploading === 'logo' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading === 'logo' ? 'Uploading...' : 'Upload Logo'}
                </button>
                {settings.logo_url && (
                  <button
                    onClick={() => handleRemove('logo')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-slate-300 text-bilcor-charcoal/60 font-bold uppercase text-sm tracking-wide hover:bg-slate-50 transition"
                    style={{ borderRadius: '4px' }}
                  >
                    <RefreshCw className="w-4 h-4" /> Reset to Default
                  </button>
                )}
              </div>
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange('logo')} />
          </div>

          {/* Favicon */}
          <div className="bg-white border border-slate-200 p-6" style={{ borderRadius: '4px' }}>
            <div className="flex items-center gap-2 mb-4">
              <Image className="w-5 h-5 text-bilcor-green" />
              <h2 className="font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>Favicon</h2>
            </div>
            <p className="text-sm text-bilcor-charcoal/50 mb-4">Upload a custom favicon (ICO, PNG, or SVG, ideally 32×32 or 64×64 pixels). Shown in browser tabs.</p>
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="w-20 h-20 bg-bilcor-offwhite border border-slate-200 flex items-center justify-center shrink-0" style={{ borderRadius: '4px' }}>
                {settings.favicon_url ? (
                  <img src={settings.favicon_url} alt="Favicon" className="w-10 h-10 object-contain" />
                ) : (
                  <Settings className="w-6 h-6 text-slate-300" />
                )}
              </div>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => faviconInputRef.current?.click()}
                  disabled={uploading === 'favicon'}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-bilcor-gold text-bilcor-green-dark font-bold uppercase text-sm tracking-wide hover:brightness-110 transition disabled:opacity-60"
                  style={{ borderRadius: '4px' }}
                >
                  {uploading === 'favicon' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading === 'favicon' ? 'Uploading...' : 'Upload Favicon'}
                </button>
                {settings.favicon_url && (
                  <button
                    onClick={() => handleRemove('favicon')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-slate-300 text-bilcor-charcoal/60 font-bold uppercase text-sm tracking-wide hover:bg-slate-50 transition"
                    style={{ borderRadius: '4px' }}
                  >
                    <RefreshCw className="w-4 h-4" /> Reset to Default
                  </button>
                )}
              </div>
            </div>
            <input ref={faviconInputRef} type="file" accept="image/*,.ico" className="hidden" onChange={onFileChange('favicon')} />

            {settings.favicon_url && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 text-xs" style={{ borderRadius: '4px' }}>
                <strong>Note:</strong> To apply the favicon to the live site, update the <code>/index.html</code> file's <code>&lt;link rel="icon"&gt;</code> tag to point to the new URL, or configure your deployment to serve it dynamically.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
