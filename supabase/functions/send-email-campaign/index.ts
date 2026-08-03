import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface Recipient {
  email: string
  name: string
}

interface CampaignPayload {
  subject: string
  body_text: string
  recipients: Recipient[]
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
    const { subject, body_text, recipients }: CampaignPayload = await req.json()

    if (!subject || !body_text || !recipients || recipients.length === 0) {
      return new Response(
        JSON.stringify({ sent: false, error: 'subject, body_text, and recipients are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('FROM_EMAIL') ?? 'noreply@bilcor.et'

    if (!resendApiKey) {
      console.log(`[send-email-campaign] RESEND_API_KEY not set. Would send to ${recipients.length} recipients.`)
      return new Response(
        JSON.stringify({ sent: false, reason: 'email_provider_not_configured', sent_count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let sentCount = 0
    const errors: string[] = []

    // Send in batches to avoid rate limits
    for (const recipient of recipients) {
      const html = buildHtml(subject, body_text, recipient.name || recipient.email)

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + resendApiKey,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [recipient.email],
          subject,
          html,
          text: body_text,
        }),
      })

      if (res.ok) {
        sentCount++
      } else {
        const errText = await res.text()
        console.error(`[send-email-campaign] Failed for ${recipient.email}:`, errText)
        errors.push(`${recipient.email}: ${errText}`)
      }

      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    return new Response(
      JSON.stringify({ sent: true, sent_count: sentCount, errors: errors.length > 0 ? errors : undefined }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[send-email-campaign] Unexpected error:', err)
    return new Response(
      JSON.stringify({ sent: false, error: 'internal_error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function buildHtml(subject: string, bodyText: string, recipientName: string): string {
  const bodyHtml = bodyText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br />')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${subject}</title>
</head>
<body style="font-family: Inter, Arial, sans-serif; background: #f8f7f4; margin: 0; padding: 32px 16px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.07);">
    <div style="background: #1a4731; padding: 28px 40px;">
      <h1 style="color: #D4B47A; font-family: Montserrat, Arial, sans-serif; font-size: 20px; margin: 0;">Bilcor Institute</h1>
      <p style="color: rgba(255,255,255,0.6); font-size: 11px; margin: 4px 0 0;">Institute of Leadership Coaching and Research</p>
    </div>
    <div style="padding: 36px 40px;">
      <p style="color: #3d3d3d; margin: 0 0 20px;">Dear <strong>${recipientName}</strong>,</p>
      <div style="color: #3d3d3d; line-height: 1.7; font-size: 15px;">${bodyHtml}</div>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
        © ${new Date().getFullYear()} Bilcor Institute of Leadership · All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`
}
