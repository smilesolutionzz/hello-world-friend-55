// Teen risk referral creator
// Receives a detection event from the client, matches nearest public youth-support
// centers (Wee/1388), inserts a referral row + audit event, and returns matched
// centers + a guardian token for parent-only single-record viewing.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

interface Payload {
  age?: number
  region_sido?: string
  region_sigungu?: string
  risk_level: 'moderate' | 'high' | 'critical'
  trigger_source: string // 'assessment_score' | 'free_response_keyword' | 'manual'
  trigger_keywords?: string[]
  detected_score?: number
  assessment_type?: string
  guest_session_id?: string
  guardian_consent?: boolean
  guardian_contact_email?: string
  guardian_contact_phone?: string
  notes?: string
}

const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://aihpro.app'

function ageBand(age?: number): string | null {
  if (!age) return null
  if (age <= 12) return '10-12'
  if (age <= 15) return '13-15'
  if (age <= 18) return '16-18'
  return '19+'
}

function genToken(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = (await req.json()) as Payload

    // Basic validation
    if (!body || !['moderate', 'high', 'critical'].includes(body.risk_level)) {
      return new Response(JSON.stringify({ error: 'invalid_risk_level' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!body.trigger_source || typeof body.trigger_source !== 'string') {
      return new Response(JSON.stringify({ error: 'missing_trigger_source' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!body.user_id_hint && !body.guest_session_id) {
      // either logged-in (resolved below) or guest session id required
    }

    // Resolve user from auth header (optional)
    const authHeader = req.headers.get('Authorization') ?? ''
    let userId: string | null = null

    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      authHeader ? { global: { headers: { Authorization: authHeader } } } : {},
    )

    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      const { data } = await anonClient.auth.getClaims(token)
      userId = data?.claims?.sub ?? null
    }

    if (!userId && !body.guest_session_id) {
      return new Response(JSON.stringify({ error: 'missing_owner' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Service-role client for matching + insert (bypasses RLS for atomic flow)
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Nearest-center matching priority:
    //  1) Same sigungu (closest geographic match) — Wee infrastructure first, then 1388
    //  2) Same sido (province-level fallback) — Wee centers, then Wee classes, then 1388
    //  3) Nationwide 1388 hotline (always-available fallback)
    // Within each tier we prefer center types in this order:
    //   wee_center > wee_class > wee_school > youth_counseling_1388 (for province tiers)
    //   1388 is always appended last via fallback to guarantee an always-available channel.
    const TYPE_PRIORITY: Record<string, number> = {
      wee_center: 0,
      wee_class: 1,
      wee_school: 2,
      youth_counseling_1388: 3,
    }
    const sortByType = (rows: any[]) =>
      [...(rows ?? [])].sort((a, b) => (TYPE_PRIORITY[a.center_type] ?? 9) - (TYPE_PRIORITY[b.center_type] ?? 9))

    const matched: any[] = []
    const pushUnique = (rows: any[]) => {
      for (const r of rows) if (!matched.some((m) => m.id === r.id)) matched.push(r)
    }

    const SELECT = 'id,name,center_type,phone,region_sido,region_sigungu,address,website'
    const MAX = 4

    if (body.region_sido) {
      // Tier 1 — same sigungu
      if (body.region_sigungu) {
        const { data } = await adminClient
          .from('wee_center_directory')
          .select(SELECT)
          .eq('is_active', true)
          .eq('region_sido', body.region_sido)
          .eq('region_sigungu', body.region_sigungu)
          .limit(MAX)
        if (data) pushUnique(sortByType(data))
      }
      // Tier 2 — same sido (any sigungu)
      if (matched.length < MAX) {
        const { data } = await adminClient
          .from('wee_center_directory')
          .select(SELECT)
          .eq('is_active', true)
          .eq('region_sido', body.region_sido)
          .limit(MAX - matched.length + 2)
        if (data) pushUnique(sortByType(data))
      }
    }
    // Tier 3 — nationwide 1388 (always)
    const { data: fallback } = await adminClient
      .from('wee_center_directory')
      .select(SELECT)
      .eq('is_active', true)
      .eq('center_type', 'youth_counseling_1388')
      .limit(2)
    if (fallback) pushUnique(fallback)

    const finalMatched = matched.slice(0, MAX)

    const guardianToken = genToken()
    const expertUrl = `${SITE_URL}/expert-hiring?urgent=true`

    const { data: inserted, error: insertErr } = await adminClient
      .from('teen_risk_referrals')
      .insert({
        user_id: userId,
        guest_session_id: userId ? null : body.guest_session_id,
        age: body.age ?? null,
        age_band: ageBand(body.age),
        region_sido: body.region_sido ?? null,
        region_sigungu: body.region_sigungu ?? null,
        risk_level: body.risk_level,
        trigger_source: body.trigger_source,
        trigger_keywords: body.trigger_keywords ?? [],
        detected_score: body.detected_score ?? null,
        assessment_type: body.assessment_type ?? null,
        matched_centers: matched,
        expert_referral_url: expertUrl,
        guardian_consent: !!body.guardian_consent,
        guardian_contact_email: body.guardian_contact_email ?? null,
        guardian_contact_phone: body.guardian_contact_phone ?? null,
        guardian_token: guardianToken,
        status: 'detected',
        notes: body.notes ?? null,
      })
      .select('id, guardian_token, status, created_at')
      .single()

    if (insertErr || !inserted) {
      console.error('insert error', insertErr)
      return new Response(JSON.stringify({ error: 'insert_failed', detail: insertErr?.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Audit events
    await adminClient.from('teen_risk_referral_events').insert([
      { referral_id: inserted.id, event_type: 'detected', payload: { trigger_source: body.trigger_source, risk_level: body.risk_level, score: body.detected_score ?? null }, actor_user_id: userId },
      { referral_id: inserted.id, event_type: 'centers_matched', payload: { count: matched.length, ids: matched.map(m => m.id) }, actor_user_id: userId },
    ])

    const guardianUrl = `${SITE_URL}/g/${inserted.guardian_token}`

    return new Response(JSON.stringify({
      referral_id: inserted.id,
      guardian_token: inserted.guardian_token,
      guardian_url: guardianUrl,
      expert_referral_url: expertUrl,
      matched_centers: matched,
      status: inserted.status,
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('teen-risk-referral-create error', e)
    return new Response(JSON.stringify({ error: 'internal', detail: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
