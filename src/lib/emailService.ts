import { supabase } from './supabaseClient'

export interface RegistrationEmailPayload {
  user_email: string
  user_name?: string | null
  item_title: string
  item_type: 'seminar' | 'training' | string
}

export interface StatusEmailPayload extends RegistrationEmailPayload {
  status: 'approved' | 'rejected' | string
}

/**
 * Sends a confirmation email to a student upon registration.
 */
export async function sendRegistrationEmail(payload: RegistrationEmailPayload) {
  try {
    const { data, error } = await supabase.functions.invoke('send-registration-email', {
      body: {
        user_email: payload.user_email,
        user_name: payload.user_name || payload.user_email,
        item_title: payload.item_title,
        item_type: payload.item_type,
      },
    })

    if (error) {
      console.warn('[EmailService] Registration email edge function notice:', error.message)
    } else {
      console.log('[EmailService] Registration confirmation email sent successfully:', data)
    }
  } catch (err) {
    console.warn('[EmailService] Could not send registration email:', err)
  }
}

/**
 * Sends an email notification when a student's registration status changes (Accepted or Rejected).
 */
export async function sendStatusEmail(payload: StatusEmailPayload) {
  try {
    const { data, error } = await supabase.functions.invoke('send-status-email', {
      body: {
        user_email: payload.user_email,
        user_name: payload.user_name || payload.user_email,
        item_title: payload.item_title,
        item_type: payload.item_type,
        status: payload.status,
      },
    })

    if (error) {
      console.warn('[EmailService] Status email edge function notice:', error.message)
    } else {
      console.log('[EmailService] Status update email sent successfully:', data)
    }
  } catch (err) {
    console.warn('[EmailService] Could not send status email:', err)
  }
}
