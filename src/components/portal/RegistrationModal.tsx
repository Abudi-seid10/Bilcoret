import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { sendRegistrationEmail } from '../../lib/emailService'
import { X, Mail, User, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'

interface RegistrationModalProps {
  open: boolean
  onClose: () => void
  itemId: string
  itemType: 'seminar' | 'training'
  itemTitle: string
  maxCapacity?: number | null
  currentCount?: number
}

export default function RegistrationModal({
  open,
  onClose,
  itemId,
  itemType,
  itemTitle,
  maxCapacity,
  currentCount
}: RegistrationModalProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  if (!open) return null

  const isFull = maxCapacity != null && currentCount != null && currentCount >= maxCapacity

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isFull) {
      setErrorMsg('Sorry, this event has reached maximum capacity.')
      return
    }

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
      // Send confirmation email
      sendRegistrationEmail({
        user_email: email,
        user_name: name,
        item_title: itemTitle,
        item_type: itemType,
      })
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
        className="bg-white w-full max-w-md p-8 shadow-2xl relative rounded"
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
              className="px-6 py-2.5 bg-bilcor-green text-white font-bold uppercase text-sm tracking-wide hover:bg-bilcor-green-light transition rounded"
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

            {isFull ? (
              <div className="bg-amber-50 border border-amber-200 p-4 text-center rounded space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                <div>
                  <h4 className="font-bold text-amber-800 text-sm">Event Capacity Reached</h4>
                  <p className="text-xs text-amber-700 mt-1">This {itemType} has reached its maximum seat limit. Registration is currently closed.</p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 bg-amber-600 text-white font-bold text-xs uppercase tracking-wide rounded"
                >
                  Close
                </button>
              </div>
            ) : (
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
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 focus:outline-none focus:border-bilcor-green text-sm transition rounded"
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
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 focus:outline-none focus:border-bilcor-green text-sm transition rounded"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>

                {status === 'error' && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-bilcor-gold text-bilcor-green-dark font-bold uppercase text-sm tracking-wide hover:brightness-110 transition disabled:opacity-60 rounded"
                >
                  {status === 'loading' ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                  ) : (
                    'Submit Registration'
                  )}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}
