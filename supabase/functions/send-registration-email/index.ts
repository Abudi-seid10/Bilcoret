import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface RegistrationPayload {
  user_email: string
  user_name: string
  item_title: string
  item_type: 'seminar' | 'training'
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_email, user_name, item_title, item_type }: RegistrationPayload = await req.json()

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('FROM_EMAIL') ?? 'noreply@bilcor.et'

    if (!resendApiKey) {
      // Log and return success without sending — email provider not configured
      console.log(`[send-registration-email] RESEND_API_KEY not set. Would send to ${user_email}.`)
      return new Response(JSON.stringify({ sent: false, reason: 'email_provider_not_configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const typeLabel = item_type === 'seminar' ? 'Seminar' : 'Training Program'
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Registration Confirmation — Bilcor Institute</title>
</head>
<body style="font-family: Inter, Arial, sans-serif; background: #f8f7f4; margin: 0; padding: 32px 16px;">
  <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.07);">
    <div style="background: #1a4731; padding: 32px 40px;">
      <h1 style="color: #D4B47A; font-family: Montserrat, Arial, sans-serif; font-size: 22px; margin: 0;">Bilcor Institute</h1>
      <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 4px 0 0;">Institute of Leadership</p>
    </div>
    <div style="padding: 40px;">
      <h2 style="color: #1a4731; font-family: Montserrat, Arial, sans-serif; margin-top: 0;">Registration Confirmed ✓</h2>
      <p style="color: #3d3d3d;">Dear <strong>${user_name || user_email}</strong>,</p>
      <p style="color: #3d3d3d;">Thank you for registering. Your application has been received and is currently <strong>pending review</strong>.</p>
      <div style="background: #f0f7f4; border-left: 4px solid #1a4731; padding: 16px 20px; margin: 24px 0; border-radius: 0 4px 4px 0;">
        <p style="margin: 0 0 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #D4B47A; font-weight: 700;">${typeLabel}</p>
        <p style="margin: 0; font-size: 17px; font-weight: 700; color: #1a4731;">${item_title}</p>
      </div>
      <p style="color: #3d3d3d;">You will receive a follow-up notification once your registration has been reviewed. You can also check your status anytime at:</p>
      <p style="text-align: center; margin: 28px 0;">
        <a href="https://bilcor.et/portal" style="display: inline-block; background: #D4B47A; color: #1a4731; font-weight: 700; text-decoration: none; padding: 12px 32px; border-radius: 4px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.06em;">View My Portal</a>
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} Bilcor Institute of Leadership · All rights reserved.</p>
    </div>
  </div>
</body>
</html>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + resendApiKey,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [user_email],
        subject: `Registration Confirmed — ${item_title}`,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[send-registration-email] Resend error:', err)
      return new Response(JSON.stringify({ sent: false, error: err }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ sent: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[send-registration-email] Unexpected error:', err)
    return new Response(JSON.stringify({ sent: false, error: 'internal_error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
