import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { X, Mail, User, CheckCircle2, Loader2 } from 'lucide-react'

interface RegistrationModalProps {
  open: boolean
  onClose: () => void
  itemId: string
  itemType: 'seminar' | 'training'
  itemTitle: string
}

export default function RegistrationModal({ open, onClose, itemId, itemType, itemTitle }: RegistrationModalProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const { error } = await supabase
      .from('registrations')
      .insert({
        user_email: email,
        user_name: name,
        type: itemType,
        item_id: itemId,
        status: 'pending',
      })

    if (error) {
      setStatus('error')
      if (error.code === '23505') {
        setErrorMsg('You are already registered for this item.')
      } else {
        setErrorMsg(error.message)
      }
    } else {
      // Send confirmation email (best-effort — does not block success state)
      supabase.functions.invoke('send-registration-email', {
        body: { user_email: email, user_name: name, item_title: itemTitle, item_type: itemType },
      }).catch(() => { /* ignore if function not deployed */ })
      setStatus('success')
    }
  }

  function handleClose() {
    setStatus('idle')
    setEmail('')
    setName('')
    setErrorMsg('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={handleClose}>
      <div
        className="bg-white w-full max-w-md p-8 shadow-2xl relative"
        style={{ borderRadius: '4px' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-bilcor-charcoal/40 hover:text-bilcor-charcoal transition"
        >
          <X className="w-5 h-5" />
        </button>

        {status === 'success' ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-14 h-14 text-bilcor-green mx-auto mb-4" />
            <h3 className="text-xl font-bold text-bilcor-green mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Registration Submitted!
            </h3>
            <p className="text-sm text-bilcor-charcoal/60 mb-6 leading-relaxed">
              You've been registered for <strong className="text-bilcor-charcoal">{itemTitle}</strong>. Check your email for confirmation details.
            </p>
            <p className="text-xs text-bilcor-charcoal/40 mb-6">
              You can track your registration status in the <a href="/portal" className="text-bilcor-green font-semibold underline">User Portal</a>.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2.5 bg-bilcor-green text-white font-bold uppercase text-sm tracking-wide hover:bg-bilcor-green-light transition"
              style={{ borderRadius: '4px' }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <span className="text-bilcor-gold text-xs font-semibold tracking-label mb-2 block">
              {itemType === 'seminar' ? 'Seminar Registration' : 'Training Enrollment'}
            </span>
            <h3 className="text-xl font-bold text-bilcor-green mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Register for
            </h3>
            <p className="text-sm text-bilcor-charcoal/60 mb-6">{itemTitle}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bilcor-charcoal/30" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-300 focus:outline-none focus:border-bilcor-green text-sm transition"
                    style={{ borderRadius: '4px' }}
                    placeholder="Jane Doe"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-bilcor-charcoal/50 mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bilcor-charcoal/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-300 focus:outline-none focus:border-bilcor-green text-sm transition"
                    style={{ borderRadius: '4px' }}
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              {status === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5" style={{ borderRadius: '4px' }}>
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-bilcor-gold text-bilcor-green-dark font-bold uppercase text-sm tracking-wide hover:brightness-110 transition disabled:opacity-60"
                style={{ borderRadius: '4px' }}
              >
                {status === 'loading' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                ) : (
                  'Submit Registration'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
