import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailPayload {
  user_email: string
  user_name: string
  item_type: 'seminar' | 'training'
  item_title: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: EmailPayload = await req.json()
    const { user_email, user_name, item_type, item_title } = payload

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('FROM_EMAIL') ?? 'noreply@bilcoret.com'

    if (!resendApiKey) {
      console.warn('[send-confirmation-email] RESEND_API_KEY not set — skipping email send')
      return new Response(JSON.stringify({ sent: false, reason: 'Email service not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const typeLabel = item_type === 'seminar' ? 'Seminar' : 'Training'
    const siteUrl = Deno.env.get('SITE_URL') ?? 'https://bilcoret.com'
    const year = new Date().getFullYear()
    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:4px;overflow:hidden;">
        <div style="background:#1a3a2a;padding:32px 40px;text-align:center;">
          <h1 style="color:#fff;font-size:24px;font-weight:800;margin:0;font-family:Montserrat,Arial,sans-serif;">Bilcor Institute of Leadership</h1>
          <p style="color:#D4B47A;font-size:12px;letter-spacing:2px;margin:6px 0 0;text-transform:uppercase;">Registration Confirmation</p>
        </div>
        <div style="padding:40px;">
          <p style="color:#2d4a3a;font-size:16px;margin:0 0 16px;">Hi ${user_name},</p>
          <p style="color:#4a5568;font-size:15px;line-height:1.6;margin:0 0 24px;">
            Thank you for registering for the following ${typeLabel.toLowerCase()} at Bilcor Institute of Leadership:
          </p>
          <div style="background:#f7f9f8;border-left:4px solid #1a3a2a;padding:16px 20px;margin:0 0 24px;border-radius:0 4px 4px 0;">
            <p style="color:#2d4a3a;font-weight:700;font-size:16px;margin:0 0 4px;font-family:Montserrat,Arial,sans-serif;">${item_title}</p>
            <p style="color:#6b7280;font-size:13px;margin:0;text-transform:uppercase;letter-spacing:1px;">${typeLabel}</p>
          </div>
          <p style="color:#4a5568;font-size:15px;line-height:1.6;margin:0 0 16px;">
            Your registration is currently <strong style="color:#D4B47A;">pending review</strong>. You will receive another notification once it has been approved.
          </p>
          <p style="color:#4a5568;font-size:15px;line-height:1.6;margin:0 0 32px;">
            You can track your registration status at any time in your
            <a href="${siteUrl}/portal" style="color:#1a3a2a;font-weight:600;">User Portal</a>.
          </p>
          <p style="color:#9ca3af;font-size:13px;margin:0;">
            If you did not make this registration, please ignore this email.
          </p>
        </div>
        <div style="background:#f7f9f8;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">&copy; ${year} Bilcor Institute of Leadership. All rights reserved.</p>
        </div>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + resendApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: user_email,
        subject: `Registration Confirmed: ${item_title}`,
        html,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error('[send-confirmation-email] Resend API error:', res.status, body)
      return new Response(JSON.stringify({ sent: false, reason: 'Email delivery failed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(JSON.stringify({ sent: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('[send-confirmation-email] Unexpected error:', err)
    return new Response(JSON.stringify({ sent: false, reason: 'Internal error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
