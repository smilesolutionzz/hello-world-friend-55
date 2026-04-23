// Send a report summary email to user's own address or another recipient
import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'
import { Resend } from 'npm:resend@2.0.0'
import { template as reportSummary } from '../_shared/transactional-email-templates/report-summary-email.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FROM_ADDRESS = 'AIHPRO 리포트 <reports@aihpro.app>'
const REPLY_TO = 'support@aihpro.app'
const SITE_URL = 'https://aihpro.app'

interface Body {
  recipientEmail: string
  reportHistoryId?: string
  reportTitle?: string
  summary?: string
  highlights?: string[]
  reportUrl?: string
  nickname?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supa = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const token = authHeader.replace(/^Bearer\s+/i, '')
    const { data: userData } = await supa.auth.getUser(token)
    const user = userData?.user
    if (!user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = (await req.json()) as Body
    const recipientEmail = (body.recipientEmail || user.email || '').trim()
    if (!recipientEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(recipientEmail)) {
      return new Response(JSON.stringify({ error: 'invalid email' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let reportTitle = body.reportTitle || '종합 발달 코칭 리포트'
    let summary = body.summary || ''
    let highlights = body.highlights || []
    let reportUrl = body.reportUrl || `${SITE_URL}/my-journey`

    // If reportHistoryId provided, fetch from DB
    if (body.reportHistoryId) {
      const { data: report } = await supa
        .from('premium_report_history')
        .select('id,user_id,report_data,created_at')
        .eq('id', body.reportHistoryId)
        .maybeSingle()
      if (report && report.user_id === user.id) {
        const rd = (report.report_data as any) || {}
        reportTitle = rd.title || reportTitle
        if (!summary) {
          summary = rd.executiveSummary || rd.summary || rd.overview || ''
          if (typeof summary === 'object') summary = JSON.stringify(summary).slice(0, 500)
          if (summary.length > 600) summary = summary.slice(0, 600) + '…'
        }
        if (!highlights.length && Array.isArray(rd.keyInsights)) {
          highlights = rd.keyInsights.slice(0, 3).map((x: any) =>
            typeof x === 'string' ? x : (x.text || x.title || JSON.stringify(x))
          )
        }
        reportUrl = `${SITE_URL}/report-generator-pro?id=${report.id}`
      }
    }

    // Sender name from profile
    let senderName: string | undefined
    const { data: profile } = await supa
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .maybeSingle()
    senderName = (profile as any)?.display_name || undefined
    const nickname = body.nickname || senderName

    const generatedAt = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    })

    const props = { nickname, reportTitle, reportUrl, generatedAt, summary, highlights, senderName }
    const html = await renderAsync(React.createElement(reportSummary.component, props))
    const subject = typeof reportSummary.subject === 'function'
      ? reportSummary.subject(props)
      : reportSummary.subject

    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) throw new Error('RESEND_API_KEY missing')
    const resend = new Resend(resendKey)

    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      reply_to: REPLY_TO,
      to: [recipientEmail],
      subject,
      html,
    })

    if ((result as any)?.error) {
      console.error('resend error', result)
      return new Response(JSON.stringify({ success: false, error: (result as any).error }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, messageId: (result as any)?.data?.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ success: false, error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
