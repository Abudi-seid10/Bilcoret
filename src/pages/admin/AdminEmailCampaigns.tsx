import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Mail, Send, Users, Clock, Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '../../context/useAuth'

interface Campaign {
  id: string
  subject: string
  body: string
  sent_at: string
  recipient_count: number
}

const empty = { subject: '', body: '' }

export default function AdminEmailCampaigns() {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(empty)
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [recipientEmails, setRecipientEmails] = useState<string[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)

  async function fetchData() {
    setLoading(true)
    const [campaignsRes, regsRes] = await Promise.all([
      supabase.from('email_campaigns').select('id, subject, body, sent_at, recipient_count').order('sent_at', { ascending: false }),
      supabase.from('registrations').select('user_email'),
    ])
    setCampaigns(campaignsRes.data ?? [])

    // Collect unique emails from registrations
    const emails = [...new Set((regsRes.data ?? []).map((r: { user_email: string }) => r.user_email))]
    setRecipientEmails(emails)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  function showSuccess(msg: string) {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 5000)
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (recipientEmails.length === 0) {
      setError('No registered users to send to.')
      return
    }
    if (!confirm(`Send this campaign to ${recipientEmails.length} registered user(s)?`)) return

    setSending(true)
    setError(null)

    // Build mailto link for batch email — opens user's email client pre-filled
    // This is a client-side approach; for production use a backend/Edge Function
    const bcc = recipientEmails.join(',')
    const mailtoUrl = `mailto:?bcc=${encodeURIComponent(bcc)}&subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(form.body)}`
    window.open(mailtoUrl, '_blank')

    // Log the campaign
    const { error: insertError } = await supabase.from('email_campaigns').insert({
      subject: form.subject,
      body: form.body,
      sent_by: user?.id ?? null,
      recipient_count: recipientEmails.length,
    })

    if (insertError) {
      setError(`Campaign log failed: ${insertError.message}`)
    } else {
      setForm(empty)
      showSuccess(`Campaign opened in your email client for ${recipientEmails.length} recipient(s).`)
      fetchData()
    }
    setSending(false)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>Email Campaigns</h1>
        <p className="text-sm text-bilcor-charcoal/50 mt-1">Send email newsletters to registered users.</p>
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Compose form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200" style={{ borderRadius: '4px' }}>
            <div className="p-5 border-b border-slate-100 flex items-center gap-2">
              <Mail className="w-5 h-5 text-bilcor-green" />
              <h2 className="font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>Compose Campaign</h2>
            </div>
            <form onSubmit={handleSend} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Subject <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  required
                  className="form-input"
                  placeholder="e.g. Upcoming Seminar: Leadership Essentials"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Message <span className="text-red-500">*</span></label>
                <textarea
                  value={form.body}
                  onChange={e => setForm({ ...form, body: e.target.value })}
                  required
                  rows={10}
                  className="form-input"
                  placeholder="Write your email message here..."
                />
              </div>

              <div className="p-3 bg-bilcor-offwhite border border-slate-200 text-sm text-bilcor-charcoal/60" style={{ borderRadius: '4px' }}>
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-bilcor-green" />
                  <span className="font-bold text-bilcor-charcoal/70">
                    {loading ? 'Loading recipients...' : `${recipientEmails.length} registered user${recipientEmails.length !== 1 ? 's' : ''}`}
                  </span>
                </div>
                {recipientEmails.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(!previewOpen)}
                    className="flex items-center gap-1 text-xs text-bilcor-green hover:underline mt-1"
                  >
                    {previewOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {previewOpen ? 'Hide' : 'Preview'} recipients
                  </button>
                )}
                {previewOpen && (
                  <div className="mt-2 max-h-32 overflow-y-auto text-xs text-bilcor-charcoal/50 space-y-0.5">
                    {recipientEmails.map(email => <div key={email}>{email}</div>)}
                  </div>
                )}
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-amber-700" style={{ borderRadius: '4px' }}>
                <strong>How it works:</strong> Clicking "Send Campaign" will open your email client pre-filled with all recipients in BCC, the subject, and message body. Review and send from there. The campaign will be logged automatically.
              </div>

              <button
                type="submit"
                disabled={sending || loading || recipientEmails.length === 0}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-bilcor-gold text-bilcor-green-dark font-bold uppercase text-sm tracking-wide hover:brightness-110 transition disabled:opacity-60"
                style={{ borderRadius: '4px' }}
              >
                {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Preparing...</> : <><Send className="w-4 h-4" /> Send Campaign</>}
              </button>
            </form>
          </div>
        </div>

        {/* Campaign history */}
        <div>
          <div className="bg-white border border-slate-200" style={{ borderRadius: '4px' }}>
            <div className="p-5 border-b border-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-bilcor-green" />
              <h2 className="font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>History</h2>
            </div>
            {loading ? (
              <div className="p-4 animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-100" style={{ borderRadius: '4px' }} />)}
              </div>
            ) : campaigns.length === 0 ? (
              <div className="p-8 text-center text-sm text-bilcor-charcoal/40">
                No campaigns sent yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {campaigns.map(c => (
                  <div key={c.id} className="p-4">
                    <p className="text-sm font-bold text-bilcor-charcoal truncate">{c.subject}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-bilcor-charcoal/40">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c.recipient_count}</span>
                      <span>{new Date(c.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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
