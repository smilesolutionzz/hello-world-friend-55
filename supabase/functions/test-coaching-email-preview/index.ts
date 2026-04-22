// One-off test endpoint: sends a sample daily coaching email to a target address
// to demonstrate what subscribers receive at 8AM KST.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FROM_ADDRESS = "AIHPRO 데일리 코칭 <onboarding@resend.dev>";
const SITE_URL = "https://aihpro.app";

function buildSampleHtml(nickname: string) {
  const dayNumber = 7;
  const totalDays = 30;
  const progressPct = Math.round((dayNumber / totalDays) * 100);
  const categoryLabel = "스트레스 회복탄력성";
  const mission = "오늘은 마음챙김 호흡을 5분간 시도하고, 호흡 전후의 긴장감을 1~10점으로 기록해보세요.";
  const insight = "Kabat-Zinn MBSR 프로그램 연구에 따르면, 매일 5분의 마음챙김 호흡 훈련은 8주 후 코르티솔 수치를 평균 19% 감소시킵니다.";
  const researchBase = "Kabat-Zinn MBSR 프로그램";

  return `<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,'Pretendard Variable',Inter,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:8px;padding:10px 14px;margin-bottom:20px;font-size:12px;color:#78350f;">
      🧪 <strong>테스트 메일</strong> — 실제 구독자에게는 매일 아침 8시(KST)에 자동 발송됩니다.
    </div>
    <div style="font-size:11px;letter-spacing:0.18em;color:#64748b;text-transform:uppercase;margin-bottom:8px;">AIHPRO Daily Coaching</div>
    <div style="font-size:13px;color:#475569;margin-bottom:24px;">${nickname}님 · ${categoryLabel} 트랙</div>
    <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:6px;">
      <div style="font-family:Georgia,serif;font-size:42px;font-weight:600;color:#0f172a;line-height:1;">Day ${String(dayNumber).padStart(2,'0')}</div>
      <div style="font-size:13px;color:#94a3b8;">/ ${totalDays}일 트랙</div>
    </div>
    <div style="height:4px;background:#f1f5f9;border-radius:99px;margin:18px 0 32px;overflow:hidden;">
      <div style="width:${progressPct}%;height:100%;background:linear-gradient(90deg,#0f172a,#3b82f6);"></div>
    </div>
    <div style="border-left:3px solid #0f172a;padding:4px 0 4px 16px;margin-bottom:28px;">
      <div style="font-size:11px;letter-spacing:0.16em;color:#64748b;text-transform:uppercase;margin-bottom:8px;">01 · 오늘의 미션</div>
      <div style="font-size:16px;line-height:1.65;color:#0f172a;font-weight:500;">${mission}</div>
    </div>
    <div style="background:#f8fafc;border-radius:12px;padding:20px 22px;margin-bottom:28px;">
      <div style="font-size:11px;letter-spacing:0.16em;color:#64748b;text-transform:uppercase;margin-bottom:10px;">02 · 임상적 근거</div>
      <div style="font-size:14px;line-height:1.7;color:#334155;">${insight}</div>
      <div style="margin-top:14px;font-size:11px;color:#94a3b8;font-style:italic;">근거 기반: ${researchBase}</div>
    </div>
    <a href="${SITE_URL}/observation-log" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:600;">오늘의 기록 남기기 →</a>
    <div style="margin-top:40px;padding-top:24px;border-top:1px solid #e2e8f0;font-size:11px;line-height:1.7;color:#94a3b8;">
      본 메일은 의료 진단·치료를 대체하지 않으며, 발달 코칭 및 자기관찰 도구로 제공됩니다.<br/>
      © AIHPRO · 매일 아침 8시(KST) 자동 발송
    </div>
  </div>
</body></html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { to, nickname } = await req.json();
    if (!to) throw new Error("to required");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY missing");
    const resend = new Resend(resendKey);

    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [to],
      subject: `[테스트] [Day 07] 스트레스 회복탄력성 - 오늘의 미션`,
      html: buildSampleHtml(nickname || "테스트"),
    });

    return new Response(JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ success: false, error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
