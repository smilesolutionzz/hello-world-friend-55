// Notify guardian: when a referral has guardian_consent=true and a guardian email,
// send a transactional email with a single-record viewing link.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://aihpro.app'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const { referral_id, guardian_email } = await req.json() as {
      referral_id?: string
      guardian_email?: string
    }
    if (!referral_id) {
      return new Response(JSON.stringify({ error: 'missing_referral_id' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: ref, error } = await admin
      .from('teen_risk_referrals')
      .select('id, guardian_consent, guardian_contact_email, guardian_token, risk_level, age_band, region_sido, region_sigungu, matched_centers, expert_referral_url, status')
      .eq('id', referral_id)
      .maybeSingle()

    if (error || !ref) {
      return new Response(JSON.stringify({ error: 'referral_not_found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!ref.guardian_consent) {
      return new Response(JSON.stringify({ error: 'consent_required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const recipient = guardian_email || ref.guardian_contact_email
    if (!recipient) {
      return new Response(JSON.stringify({ error: 'missing_recipient' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const guardianUrl = `${SITE_URL}/g/${ref.guardian_token}`

    // Persist contact if provided
    if (guardian_email && guardian_email !== ref.guardian_contact_email) {
      await admin.from('teen_risk_referrals').update({ guardian_contact_email: guardian_email }).eq('id', ref.id)
    }

    // Invoke send-transactional-email
    const sendRes = await admin.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'teen-risk-guardian-notice',
        recipientEmail: recipient,
        idempotencyKey: `teen-risk-${ref.id}`,
        templateData: {
          guardianUrl,
          riskLevel: ref.risk_level,
          ageBand: ref.age_band,
          region: [ref.region_sido, ref.region_sigungu].filter(Boolean).join(' '),
          expertUrl: ref.expert_referral_url,
          centerCount: Array.isArray(ref.matched_centers) ? ref.matched_centers.length : 0,
        },
      },
    })

    if (sendRes.error) {
      console.error('send-transactional-email error', sendRes.error)
      return new Response(JSON.stringify({ error: 'send_failed', detail: sendRes.error.message }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    await admin.from('teen_risk_referrals')
      .update({ guardian_notified_at: new Date().toISOString(), status: 'guardian_notified' })
      .eq('id', ref.id)

    await admin.from('teen_risk_referral_events').insert({
      referral_id: ref.id,
      event_type: 'guardian_notified',
      payload: { recipient_masked: maskEmail(recipient) },
    })

    return new Response(JSON.stringify({ ok: true, guardian_url: guardianUrl }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('teen-risk-notify-guardian error', e)
    return new Response(JSON.stringify({ error: 'internal', detail: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function maskEmail(email: string): string {
  const [u, d] = email.split('@')
  if (!d) return '***'
  return `${u.slice(0, 2)}***@${d}`
}
