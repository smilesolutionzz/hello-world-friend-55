import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: any) => {
  console.log(`[WEEKLY-DIGEST] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

interface UserInsight {
  email: string;
  userId: string;
  nickname: string;
  reportCount: number;
  latestScore: number | null;
  trend: 'improving' | 'stable' | 'declining' | 'insufficient_data';
  trendDelta: number;
  latestReportTitle: string | null;
  daysSinceLastActivity: number;
  recommendation: string;
}

/**
 * STEP 7: Weekly Coaching Digest
 * - 매주 화요일 오전 9시 발송
 * - 사용자별 누적 데이터 기반 개인화 인사이트
 * - 종단 분석 + 다음 액션 가이드
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    log("Starting weekly digest");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY missing");
    const resend = new Resend(resendKey);

    const supa = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // 활성 구독자 조회
    const { data: subs } = await supa
      .from('user_subscriptions')
      .select('user_id')
      .eq('status', 'active')
      .in('subscription_type', ['premium', 'paid']);

    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No subscribers" }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    log("Subscribers found", { count: subs.length });

    let sent = 0, failed = 0, skipped = 0;

    for (const sub of subs) {
      try {
        // 사용자 정보
        const { data: userData } = await supa.auth.admin.getUserById(sub.user_id);
        if (!userData?.user?.email) { skipped++; continue; }

        const { data: profile } = await supa
          .from('profiles')
          .select('display_name, name')
          .eq('user_id', sub.user_id)
          .maybeSingle();

        // 최근 리포트 (최대 10개)
        const { data: reports } = await supa
          .from('premium_report_history')
          .select('id, title, overall_score, created_at, report_number')
          .eq('user_id', sub.user_id)
          .order('created_at', { ascending: false })
          .limit(10);

        const insight = buildInsight({
          email: userData.user.email,
          userId: sub.user_id,
          nickname: profile?.display_name || profile?.name || '회원님',
          reports: reports || [],
        });

        // 데이터 부족 시 스킵 (최소 1개 리포트 필요)
        if (insight.reportCount === 0) { skipped++; continue; }

        const html = renderEmail(insight);
        await resend.emails.send({
          from: "AIHPRO 코칭 <onboarding@resend.dev>",
          to: [insight.email],
          subject: getSubject(insight),
          html,
        });
        sent++;
        log("Sent", { email: insight.email, trend: insight.trend });
      } catch (e: any) {
        failed++;
        log("Send failed", { error: e.message });
      }
    }

    log("Digest completed", { sent, failed, skipped });
    return new Response(JSON.stringify({ success: true, sent, failed, skipped }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
  }
});

function buildInsight(args: { email: string; userId: string; nickname: string; reports: any[] }): UserInsight {
  const { reports } = args;
  const reportCount = reports.length;

  if (reportCount === 0) {
    return {
      ...args, reportCount: 0, latestScore: null,
      trend: 'insufficient_data', trendDelta: 0,
      latestReportTitle: null, daysSinceLastActivity: 999,
      recommendation: '첫 프리미엄 리포트를 생성해보세요.',
    };
  }

  const latest = reports[0];
  const latestScore = latest.overall_score ?? null;
  const daysSince = Math.floor((Date.now() - new Date(latest.created_at).getTime()) / 86400000);

  let trend: UserInsight['trend'] = 'insufficient_data';
  let delta = 0;

  if (reportCount >= 2 && latestScore !== null) {
    const prev = reports[1].overall_score;
    if (prev !== null && prev !== undefined) {
      delta = latestScore - prev;
      // RCI 간이 적용: ±5점 이상 변화를 유의미로 간주
      if (delta >= 5) trend = 'improving';
      else if (delta <= -5) trend = 'declining';
      else trend = 'stable';
    }
  }

  let recommendation = '';
  if (trend === 'improving') {
    recommendation = `최근 ${delta.toFixed(1)}점 향상되었습니다. 현재의 코칭 패턴을 유지하며 새로운 도전 과제를 시도해보세요.`;
  } else if (trend === 'declining') {
    recommendation = `최근 ${Math.abs(delta).toFixed(1)}점 감소했습니다. 전문가 1:1 상담을 통해 변화 요인을 점검하는 것을 권장합니다.`;
  } else if (trend === 'stable') {
    recommendation = '안정적으로 유지되고 있습니다. 종단 추적 대시보드에서 차원별 변화를 자세히 확인해보세요.';
  } else {
    recommendation = daysSince > 30 
      ? '한 달 이상 새 리포트가 없습니다. 재검사로 변화를 추적해보세요.'
      : '리포트가 더 누적되면 정밀한 종단 분석이 가능합니다.';
  }

  return {
    ...args, reportCount, latestScore,
    trend, trendDelta: delta,
    latestReportTitle: latest.title || '발달 코칭 리포트',
    daysSinceLastActivity: daysSince,
    recommendation,
  };
}

function getSubject(i: UserInsight): string {
  const emoji = { improving: '📈', stable: '✨', declining: '🔍', insufficient_data: '📊' }[i.trend];
  const week = `${new Date().getMonth() + 1}월 ${Math.ceil(new Date().getDate() / 7)}주차`;
  return `${emoji} [AIHPRO] ${i.nickname}님의 ${week} 코칭 인사이트`;
}

function renderEmail(i: UserInsight): string {
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const trendBadge = {
    improving: { color: '#10b981', bg: '#d1fae5', label: '개선 중', icon: '📈' },
    stable: { color: '#6366f1', bg: '#e0e7ff', label: '안정 유지', icon: '✨' },
    declining: { color: '#f59e0b', bg: '#fef3c7', label: '주의 필요', icon: '🔍' },
    insufficient_data: { color: '#6b7280', bg: '#f3f4f6', label: '데이터 수집 중', icon: '📊' },
  }[i.trend];

  const baseUrl = 'https://aihpro.app';

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f3f4f6;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;padding:6px 14px;background:#6366f1;color:white;border-radius:20px;font-size:12px;font-weight:600;">
        Weekly Coaching Digest
      </div>
      <h1 style="margin:12px 0 4px;color:#111827;font-size:24px;font-weight:700;">
        ${i.nickname}님의 이번 주 인사이트
      </h1>
      <p style="margin:0;color:#6b7280;font-size:13px;">${today}</p>
    </div>

    <!-- Main Card -->
    <div style="background:white;border-radius:16px;padding:32px 24px;box-shadow:0 4px 12px rgba(0,0,0,0.05);margin-bottom:16px;">
      
      <!-- Trend Status -->
      <div style="text-align:center;padding:20px 0;border-bottom:1px solid #f3f4f6;">
        <div style="display:inline-block;padding:6px 16px;background:${trendBadge.bg};color:${trendBadge.color};border-radius:20px;font-weight:600;font-size:13px;margin-bottom:12px;">
          ${trendBadge.icon} ${trendBadge.label}
        </div>
        ${i.latestScore !== null ? `
          <div style="font-size:36px;font-weight:700;color:#111827;line-height:1;">
            ${Math.round(i.latestScore)}<span style="font-size:16px;color:#9ca3af;">/100</span>
          </div>
          ${i.trendDelta !== 0 ? `
            <div style="margin-top:6px;font-size:13px;color:${i.trendDelta > 0 ? '#10b981' : '#f59e0b'};font-weight:600;">
              ${i.trendDelta > 0 ? '▲' : '▼'} ${Math.abs(i.trendDelta).toFixed(1)}점 (직전 대비)
            </div>
          ` : ''}
        ` : `
          <p style="color:#6b7280;font-size:14px;margin:0;">첫 리포트를 시작해보세요.</p>
        `}
      </div>

      <!-- Stats -->
      <div style="display:flex;justify-content:space-around;padding:20px 0;border-bottom:1px solid #f3f4f6;text-align:center;">
        <div style="flex:1;">
          <div style="font-size:22px;font-weight:700;color:#6366f1;">${i.reportCount}</div>
          <div style="font-size:11px;color:#6b7280;margin-top:2px;">누적 리포트</div>
        </div>
        <div style="flex:1;border-left:1px solid #f3f4f6;border-right:1px solid #f3f4f6;">
          <div style="font-size:22px;font-weight:700;color:#6366f1;">${i.daysSinceLastActivity}일</div>
          <div style="font-size:11px;color:#6b7280;margin-top:2px;">최근 활동</div>
        </div>
        <div style="flex:1;">
          <div style="font-size:22px;font-weight:700;color:#6366f1;">${trendBadge.icon}</div>
          <div style="font-size:11px;color:#6b7280;margin-top:2px;">변화 추세</div>
        </div>
      </div>

      <!-- Recommendation -->
      <div style="padding:20px 0 8px;">
        <h3 style="margin:0 0 10px;font-size:15px;color:#111827;font-weight:600;">
          💡 이번 주 코칭 제안
        </h3>
        <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;word-break:keep-all;">
          ${i.recommendation}
        </p>
      </div>

      <!-- CTA -->
      <div style="margin-top:24px;display:flex;flex-direction:column;gap:8px;">
        <a href="${baseUrl}/my-journey" style="display:block;text-align:center;padding:14px;background:#6366f1;color:white;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;">
          📊 종단 추적 대시보드 보기
        </a>
        <a href="${baseUrl}/report-generator-pro" style="display:block;text-align:center;padding:12px;background:#f9fafb;color:#374151;text-decoration:none;border-radius:10px;font-weight:500;font-size:13px;border:1px solid #e5e7eb;">
          새 리포트 생성하기
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;color:#9ca3af;font-size:11px;line-height:1.6;padding:8px;">
      <p style="margin:0 0 4px;">AIHPRO는 발달 코칭 및 의사결정 보조 도구입니다.</p>
      <p style="margin:0 0 4px;">의료 진단을 대체하지 않습니다.</p>
      <p style="margin:8px 0 0;">© ${new Date().getFullYear()} AIHPRO. 매주 화요일 발송됩니다.</p>
    </div>
  </div>
</body></html>`;
}
