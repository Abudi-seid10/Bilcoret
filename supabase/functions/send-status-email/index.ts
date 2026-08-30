import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface StatusPayload {
  user_email: string
  user_name: string
  item_title: string
  item_type: 'seminar' | 'training'
  status: 'approved' | 'rejected'
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
    const { user_email, user_name, item_title, item_type, status }: StatusPayload = await req.json()

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('FROM_EMAIL') ?? 'noreply@bilcor.et'

    if (!resendApiKey) {
      console.log(`[send-status-email] RESEND_API_KEY not set. Would send status (${status}) email to ${user_email}.`)
      return new Response(JSON.stringify({ sent: false, reason: 'email_provider_not_configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const typeLabel = item_type === 'seminar' ? 'Seminar' : 'Training Program'
    const isApproved = status === 'approved'

    const subject = isApproved
      ? `Registration Accepted — ${item_title}`
      : `Registration Status Update — ${item_title}`

    const statusBadge = isApproved
      ? `<div style="background: #e6f4ea; border-left: 4px solid #137333; padding: 16px 20px; margin: 24px 0; border-radius: 0 4px 4px 0;">
          <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #137333; font-weight: 700;">Status: Approved / Confirmed</p>
          <p style="margin: 0; font-size: 16px; font-weight: 700; color: #003826;">${item_title}</p>
         </div>`
      : `<div style="background: #fce8e6; border-left: 4px solid #c5221f; padding: 16px 20px; margin: 24px 0; border-radius: 0 4px 4px 0;">
          <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #c5221f; font-weight: 700;">Status: Application Not Approved</p>
          <p style="margin: 0; font-size: 16px; font-weight: 700; color: #3c4043;">${item_title}</p>
         </div>`

    const messageContent = isApproved
      ? `<p style="color: #3d3d3d; line-height: 1.6;">Congratulations! Your application for <strong>${item_title}</strong> (${typeLabel}) has been <strong>ACCEPTED</strong>.</p>
         <p style="color: #3d3d3d; line-height: 1.6;">Our admissions team will follow up with schedule details and cohort onboarding materials shortly.</p>`
      : `<p style="color: #3d3d3d; line-height: 1.6;">Thank you for your interest in <strong>${item_title}</strong> (${typeLabel}).</p>
         <p style="color: #3d3d3d; line-height: 1.6;">Unfortunately, your registration could not be approved for this cohort due to limited seat availability or prerequisite alignment. We encourage you to apply for future cohorts or explore our other executive offerings.</p>`

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${subject}</title>
</head>
<body style="font-family: Inter, Arial, sans-serif; background: #f8f7f4; margin: 0; padding: 32px 16px;">
  <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.07);">
    <div style="background: #003826; padding: 32px 40px;">
      <h1 style="color: #C6A15A; font-family: Montserrat, Arial, sans-serif; font-size: 22px; margin: 0;">Bilcor Institute</h1>
      <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 4px 0 0;">Institute of Leadership Coaching & Research</p>
    </div>
    <div style="padding: 40px;">
      <h2 style="color: #003826; font-family: Montserrat, Arial, sans-serif; margin-top: 0;">
        ${isApproved ? 'Application Approved 🎉' : 'Registration Status Update'}
      </h2>
      <p style="color: #3d3d3d;">Dear <strong>${user_name || user_email}</strong>,</p>
      ${messageContent}
      ${statusBadge}
      <p style="color: #3d3d3d;">You can review your complete application history and seat status anytime in the participant portal:</p>
      <p style="text-align: center; margin: 28px 0;">
        <a href="https://bilcor.et/portal" style="display: inline-block; background: #C6A15A; color: #003826; font-weight: 700; text-decoration: none; padding: 12px 32px; border-radius: 4px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.06em;">Access Participant Portal</a>
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} Bilcor Institute of Leadership · Addis Ababa, Ethiopia</p>
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
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[send-status-email] Resend error:', err)
      return new Response(JSON.stringify({ sent: false, error: err }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ sent: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[send-status-email] Unexpected error:', err)
    return new Response(JSON.stringify({ sent: false, error: 'internal_error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
