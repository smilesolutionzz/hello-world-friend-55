// B2B 도입/광고 문의 알림 — 관리자 + 사용자 양쪽에 메일 발송
// 호출: supabase.functions.invoke('notify-b2b-inquiry', { body: { ...inquiry } })
// 인증: 누구나 호출 가능 (verify_jwt=false). RLS는 호출 측 insert에서 처리.
// 발신 도메인: aihpro.app (검증 완료)

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FROM = "AIHPRO Business <noreply@aihpro.app>";
const REPLY_TO = "kijung_kku@naver.com";
const GOLD = "#C8B88A";

interface InquiryPayload {
  source: "b2b_proposal" | "b2b_jobcoach" | "b2b_demo_report" | string;
  institution_name?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  institution_type?: string;
  message?: string;
  inquiry_id?: string;
  attachment_filename?: string | null;
  preferred_contact_at?: string | null;
}

function formatPreferredAt(iso?: string | null): string {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(d) + " (KST)";
  } catch { return iso ?? "-"; }
}

function escape(s?: string | null): string {
  if (!s) return "-";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function adminHtml(p: InquiryPayload): string {
  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Pretendard','Segoe UI',sans-serif;color:#111;max-width:560px;margin:0 auto;padding:32px 24px;background:#ffffff;">
    <div style="border-bottom:2px solid ${GOLD};padding-bottom:14px;margin-bottom:24px;">
      <p style="font-size:11px;letter-spacing:.24em;color:#888;margin:0;">AIHPRO BUSINESS</p>
      <h1 style="font-size:22px;margin:6px 0 0;font-weight:600;letter-spacing:-0.01em;">신규 도입·제휴 문의</h1>
    </div>
    <table style="width:100%;font-size:14px;line-height:1.7;border-collapse:collapse;">
      <tr><td style="color:#888;width:110px;padding:6px 0;">유입 경로</td><td style="padding:6px 0;"><strong>${escape(p.source)}</strong></td></tr>
      <tr><td style="color:#888;padding:6px 0;">기관명</td><td style="padding:6px 0;">${escape(p.institution_name)}</td></tr>
      <tr><td style="color:#888;padding:6px 0;">기관 유형</td><td style="padding:6px 0;">${escape(p.institution_type)}</td></tr>
      <tr><td style="color:#888;padding:6px 0;">담당자</td><td style="padding:6px 0;">${escape(p.contact_name)}</td></tr>
      <tr><td style="color:#888;padding:6px 0;">연락처</td><td style="padding:6px 0;">${escape(p.contact_phone)}</td></tr>
      <tr><td style="color:#888;padding:6px 0;">이메일</td><td style="padding:6px 0;">${escape(p.contact_email)}</td></tr>
      <tr><td style="color:#888;padding:6px 0;">희망 미팅</td><td style="padding:6px 0;">${escape(formatPreferredAt(p.preferred_contact_at))}</td></tr>
      <tr><td style="color:#888;padding:6px 0;">첨부파일</td><td style="padding:6px 0;">${p.attachment_filename ? `📎 ${escape(p.attachment_filename)}` : "-"}</td></tr>
    </table>
    ${p.message ? `
      <div style="margin-top:22px;padding:16px 18px;background:#FAF8F2;border-radius:14px;font-size:14px;line-height:1.7;white-space:pre-wrap;color:#333;">
        ${escape(p.message)}
      </div>` : ""}
    <p style="margin-top:28px;font-size:12px;color:#999;">관리자 페이지에서 후속 처리하세요. · inquiry_id: ${escape(p.inquiry_id)}</p>
  </div>`;
}

function userHtml(p: InquiryPayload): string {
  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Pretendard','Segoe UI',sans-serif;color:#111;max-width:560px;margin:0 auto;padding:36px 24px;background:#ffffff;">
    <div style="border-bottom:2px solid ${GOLD};padding-bottom:14px;margin-bottom:26px;">
      <p style="font-size:11px;letter-spacing:.24em;color:#888;margin:0;">AIHPRO BUSINESS</p>
      <h1 style="font-size:22px;margin:6px 0 0;font-weight:600;letter-spacing:-0.01em;">문의가 정상 접수되었습니다</h1>
    </div>
    <p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 16px;">
      ${escape(p.contact_name)}님, <strong>${escape(p.institution_name)}</strong>의 도입 문의를 접수했습니다.
    </p>
    <p style="font-size:14px;line-height:1.7;color:#555;margin:0 0 22px;">
      영업일 기준 1일 이내 담당자가 직접 회신드립니다. 추가 자료가 필요하시면 본 메일에 회신해 주세요.
    </p>
    <div style="padding:16px 18px;background:#FAF8F2;border-radius:14px;font-size:13px;line-height:1.7;color:#444;">
      <p style="margin:0 0 6px;"><strong>접수 내역</strong></p>
      <p style="margin:0;">기관: ${escape(p.institution_name)} · 담당자: ${escape(p.contact_name)}</p>
      <p style="margin:0;">연락처: ${escape(p.contact_phone)}</p>
    </div>
    <p style="margin-top:28px;font-size:12px;color:#999;line-height:1.6;">
      본 메일은 자동 발송되었습니다. 회신 시 담당자에게 직접 전달됩니다.<br />
      AIHPRO는 발달적 코칭·의사결정 지원 도구이며, 의료적 진단·치료를 제공하지 않습니다.
    </p>
  </div>`;
}

async function sendMail(
  resendKey: string,
  to: string,
  subject: string,
  html: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      reply_to: REPLY_TO,
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("[notify-b2b-inquiry] Resend error to", to, ":", text);
    return { ok: false, error: text };
  }
  return { ok: true };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as InquiryPayload;
    const RESEND_KEY = Deno.env.get("RESEND_API_KEY");
    const ADMIN_EMAIL = Deno.env.get("B2B_ADMIN_EMAIL") || REPLY_TO;

    if (!RESEND_KEY) {
      console.warn("[notify-b2b-inquiry] RESEND_API_KEY missing — logging only");
      console.log("Inquiry payload:", payload);
      return new Response(
        JSON.stringify({ ok: true, delivered: false, reason: "no_email_provider" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const adminSubject = `[AIHPRO Business] 신규 문의 — ${payload.institution_name ?? "이름 미상"}`;
    const userSubject = `[AIHPRO] 도입 문의가 정상 접수되었습니다`;

    const adminRes = await sendMail(RESEND_KEY, ADMIN_EMAIL, adminSubject, adminHtml(payload));

    let userRes: { ok: boolean; error?: string } = { ok: false, error: "no_user_email" };
    const hasValidEmail = payload.contact_email && payload.contact_email !== "N/A" && payload.contact_email.includes("@");
    if (hasValidEmail) {
      userRes = await sendMail(RESEND_KEY, payload.contact_email!, userSubject, userHtml(payload));
    }

    // 후속 메일 큐 등록 (D+1 자료 / D+3 케이스)
    if (hasValidEmail) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );
        const now = Date.now();
        const items = [
          { followup_type: "resources_d1", scheduled_at: new Date(now + 24 * 3600 * 1000).toISOString() },
          { followup_type: "case_studies_d3", scheduled_at: new Date(now + 72 * 3600 * 1000).toISOString() },
        ].map((it) => ({
          ...it,
          inquiry_id: payload.inquiry_id ?? null,
          recipient_email: payload.contact_email!,
          contact_name: payload.contact_name ?? null,
          institution_name: payload.institution_name ?? null,
        }));
        const { error: qErr } = await supabase
          .from("b2b_followup_queue")
          .upsert(items, { onConflict: "inquiry_id,followup_type", ignoreDuplicates: true });
        if (qErr) console.warn("[notify-b2b-inquiry] enqueue followup failed:", qErr);
      } catch (e) {
        console.warn("[notify-b2b-inquiry] followup enqueue error:", e);
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        delivered: { admin: adminRes.ok, user: userRes.ok },
        ...(adminRes.error || userRes.error ? { errors: { admin: adminRes.error, user: userRes.error } } : {}),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[notify-b2b-inquiry] Error:", e);
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
