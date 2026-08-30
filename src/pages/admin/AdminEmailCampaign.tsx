import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Send, Mail, Users, Calendar, BookOpen, CheckCircle2, Loader2, Clock } from 'lucide-react'

interface Campaign {
  id: string
  subject: string
  audience: string
  sent_at: string | null
  sent_count: number
  created_at: string
}

const audienceOptions = [
  { value: 'all', label: 'All Registered Users', icon: Users, description: 'Everyone who has registered for any seminar or training' },
  { value: 'seminar', label: 'Seminar Registrants', icon: Calendar, description: 'Users registered for any seminar' },
  { value: 'training', label: 'Training Registrants', icon: BookOpen, description: 'Users enrolled in any training program' },
]

const emptyForm = { subject: '', body_text: '', audience: 'all' }

export default function AdminEmailCampaign() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [sending, setSending] = useState(false)
  const [previewCount, setPreviewCount] = useState<number | null>(null)
  const [loadingCount, setLoadingCount] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function fetchCampaigns() {
    const { data } = await supabase
      .from('email_campaigns')
      .select('id, subject, audience, sent_at, sent_count, created_at')
      .order('created_at', { ascending: false })
    setCampaigns(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchCampaigns() }, [])

  async function fetchPreviewCount(audience: string) {
    setLoadingCount(true)
    setPreviewCount(null)
    let query = supabase.from('registrations').select('user_email', { count: 'exact', head: false })
    if (audience !== 'all') {
      query = query.eq('type', audience)
    }
    const { data } = await query
    // Deduplicate emails
    const unique = new Set((data ?? []).map((r: { user_email: string }) => r.user_email))
    setPreviewCount(unique.size)
    setLoadingCount(false)
  }

  function handleAudienceChange(audience: string) {
    setForm(f => ({ ...f, audience }))
    fetchPreviewCount(audience)
  }

  useEffect(() => { fetchPreviewCount('all') }, [])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!confirm(`Send this campaign to ${previewCount ?? 'all'} recipients? This cannot be undone.`)) return

    setSending(true)
    setError('')
    setSent(false)

    // Fetch target emails
    let query = supabase.from('registrations').select('user_email, user_name')
    if (form.audience !== 'all') {
      query = query.eq('type', form.audience)
    }
    const { data: regs } = await query

    // Deduplicate by email
    const recipientMap: Record<string, string> = {}
    for (const r of (regs ?? [])) {
      if (!recipientMap[r.user_email]) recipientMap[r.user_email] = r.user_name ?? ''
    }
    const recipients = Object.entries(recipientMap).map(([email, name]) => ({ email, name }))

    // Call edge function
    const { data: fnData, error: fnError } = await supabase.functions.invoke('send-email-campaign', {
      body: {
        subject: form.subject,
        body_text: form.body_text,
        recipients,
      },
    })

    if (fnError) {
      setError(fnError.message)
      setSending(false)
      return
    }

    // Save campaign record
    await supabase.from('email_campaigns').insert({
      subject: form.subject,
      body_text: form.body_text,
      audience: form.audience,
      sent_at: new Date().toISOString(),
      sent_count: fnData?.sent_count ?? recipients.length,
    })

    setSent(true)
    setForm(emptyForm)
    fetchCampaigns()
    fetchPreviewCount('all')
    setSending(false)
    setTimeout(() => setSent(false), 5000)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>Email Campaign</h1>
        <p className="text-sm text-bilcor-charcoal/50 mt-1">Send bulk emails to registered users.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Compose form */}
        <div className="lg:col-span-3 bg-white border border-slate-200 p-6" style={{ borderRadius: '4px' }}>
          <div className="flex items-center gap-2 mb-5">
            <Mail className="w-5 h-5 text-bilcor-green" />
            <h2 className="font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>Compose</h2>
          </div>

          <form onSubmit={handleSend} className="space-y-5">
            {/* Audience */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-2 block">Audience</label>
              <div className="space-y-2">
                {audienceOptions.map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 p-3 border cursor-pointer transition ${
                      form.audience === opt.value
                        ? 'border-bilcor-green bg-bilcor-green/5'
                        : 'border-slate-200 hover:border-bilcor-green/40'
                    }`}
                    style={{ borderRadius: '4px' }}
                  >
                    <input
                      type="radio"
                      name="audience"
                      value={opt.value}
                      checked={form.audience === opt.value}
                      onChange={() => handleAudienceChange(opt.value)}
                      className="mt-0.5 accent-bilcor-green"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <opt.icon className="w-3.5 h-3.5 text-bilcor-green" />
                        <span className="text-sm font-semibold text-bilcor-charcoal">{opt.label}</span>
                      </div>
                      <p className="text-xs text-bilcor-charcoal/50 mt-0.5">{opt.description}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-2 text-xs text-bilcor-charcoal/50">
                {loadingCount ? (
                  <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Counting recipients…</span>
                ) : previewCount !== null ? (
                  <span className="font-medium text-bilcor-green">{previewCount} unique recipient{previewCount !== 1 ? 's' : ''}</span>
                ) : null}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Subject <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                required
                className="w-full px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-bilcor-green text-sm transition"
                style={{ borderRadius: '4px' }}
                placeholder="e.g. Upcoming Leadership Seminar — Don't Miss It!"
              />
            </div>

            {/* Body */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Message <span className="text-red-500">*</span></label>
              <textarea
                value={form.body_text}
                onChange={e => setForm(f => ({ ...f, body_text: e.target.value }))}
                required
                rows={10}
                className="w-full px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-bilcor-green text-sm transition resize-y"
                style={{ borderRadius: '4px' }}
                placeholder="Write your email message here. You can use plain text."
              />
              <p className="text-xs text-bilcor-charcoal/40 mt-1">Plain text. Line breaks are preserved.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5" style={{ borderRadius: '4px' }}>
                {error}
              </div>
            )}

            {sent && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5" style={{ borderRadius: '4px' }}>
                <CheckCircle2 className="w-4 h-4" /> Campaign sent successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={sending || loadingCount || previewCount === 0}
              className="inline-flex items-center gap-2 px-6 py-3 bg-bilcor-green text-white font-bold uppercase text-sm tracking-wide hover:bg-bilcor-green-light transition disabled:opacity-60"
              style={{ borderRadius: '4px' }}
            >
              {sending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
              ) : (
                <><Send className="w-4 h-4" /> Send Campaign</>
              )}
            </button>
          </form>
        </div>

        {/* Campaign history */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200" style={{ borderRadius: '4px' }}>
            <div className="p-4 border-b border-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-bilcor-green" />
              <h2 className="font-bold text-bilcor-green text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Campaign History</h2>
            </div>
            {loading ? (
              <div className="animate-pulse p-4 space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-slate-100" style={{ borderRadius: '4px' }}></div>)}
              </div>
            ) : campaigns.length === 0 ? (
              <div className="p-8 text-center text-sm text-bilcor-charcoal/40">No campaigns sent yet.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {campaigns.map(c => (
                  <div key={c.id} className="p-4">
                    <p className="text-sm font-semibold text-bilcor-charcoal truncate">{c.subject}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-bilcor-charcoal/50 mt-1">
                      <span className="capitalize">{c.audience === 'all' ? 'All users' : `${c.audience} registrants`}</span>
                      <span>{c.sent_count} sent</span>
                      {c.sent_at && (
                        <span>{new Date(c.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
