// Single source of truth for guardian consent / response updates on teen risk referrals.
// Replaces direct client-side updates so RLS surface stays minimal and audit logs stay consistent.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

type Action = 'consent' | 'accepted' | 'declined'

interface Body {
  // Identify referral by either id (authenticated owner) or guardian_token (parent link).
  referral_id?: string
  guardian_token?: string
  action: Action
  guardian_email?: string
  guardian_phone?: string
  notes?: string
  // When true and action='consent' with an email present, notify guardian email is dispatched.
  notify?: boolean
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405)
  }

  try {
    const body = (await req.json()) as Body
    if (!body || !body.action) return json({ error: 'missing_action' }, 400)
    if (!['consent', 'accepted', 'declined'].includes(body.action)) {
      return json({ error: 'invalid_action' }, 400)
    }
    if (!body.referral_id && !body.guardian_token) {
      return json({ error: 'missing_identifier' }, 400)
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Locate referral
    const lookup = body.referral_id
      ? admin.from('teen_risk_referrals').select('id, guardian_token, guardian_consent, guardian_contact_email, status').eq('id', body.referral_id).maybeSingle()
      : admin.from('teen_risk_referrals').select('id, guardian_token, guardian_consent, guardian_contact_email, status').eq('guardian_token', body.guardian_token!).maybeSingle()

    const { data: ref, error: lookupErr } = await lookup
    if (lookupErr || !ref) return json({ error: 'referral_not_found' }, 404)

    const now = new Date().toISOString()
    const update: Record<string, unknown> = {}
    let nextStatus: string | null = null
    let eventType = `guardian_${body.action}`

    if (body.action === 'consent') {
      update.guardian_consent = true
      if (body.guardian_email) update.guardian_contact_email = body.guardian_email
      if (body.guardian_phone) update.guardian_contact_phone = body.guardian_phone
      if (ref.status === 'detected') nextStatus = 'guardian_consent_pending'
    } else if (body.action === 'accepted') {
      nextStatus = 'center_contacted'
    } else if (body.action === 'declined') {
      nextStatus = 'dismissed'
    }
    if (nextStatus) update.status = nextStatus
    if (body.notes) update.notes = body.notes

    const { error: updErr } = await admin
      .from('teen_risk_referrals')
      .update(update)
      .eq('id', ref.id)
    if (updErr) return json({ error: 'update_failed', detail: updErr.message }, 500)

    await admin.from('teen_risk_referral_events').insert({
      referral_id: ref.id,
      event_type: eventType,
      payload: {
        action: body.action,
        previous_status: ref.status,
        next_status: nextStatus,
      },
    })

    // Optionally trigger guardian email after consent.
    let notified = false
    if (body.action === 'consent' && body.notify && (body.guardian_email || ref.guardian_contact_email)) {
      const recipient = body.guardian_email || ref.guardian_contact_email!
      const sendRes = await admin.functions.invoke('teen-risk-notify-guardian', {
        body: { referral_id: ref.id, guardian_email: recipient },
      })
      if (sendRes.error) {
        console.warn('notify-guardian failed', sendRes.error)
      } else {
        notified = true
      }
    }

    return json({
      ok: true,
      referral_id: ref.id,
      status: nextStatus ?? ref.status,
      notified,
    })
  } catch (e) {
    console.error('teen-risk-guardian-respond error', e)
    return json({ error: 'internal', detail: String(e) }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
