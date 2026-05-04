// B2B 도입/광고 문의 알림 — 관리자 이메일 발송
// 호출: supabase.functions.invoke('notify-b2b-inquiry', { body: { ...inquiry } })
// 인증: 누구나 호출 가능 (verify_jwt=false). RLS는 호출 측 insert에서 처리.

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InquiryPayload {
  source: "b2b_proposal" | "b2b_jobcoach" | "b2b_demo_report" | string;
  institution_name?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  institution_type?: string;
  message?: string;
  inquiry_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as InquiryPayload;
    const RESEND_KEY = Deno.env.get("RESEND_API_KEY");
    const ADMIN_EMAIL =
      Deno.env.get("B2B_ADMIN_EMAIL") || "kijung_kku@naver.com";

    const subject = `[AIHPRO Business] 신규 문의 — ${payload.institution_name ?? "이름 미상"}`;
    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;max-width:560px;margin:0 auto;padding:24px;">
        <div style="border-bottom:2px solid #C8B88A;padding-bottom:12px;margin-bottom:20px;">
          <p style="font-size:11px;letter-spacing:.2em;color:#888;margin:0;">AIHPRO BUSINESS</p>
          <h1 style="font-size:20px;margin:6px 0 0;">신규 도입/광고 문의</h1>
        </div>
        <table style="width:100%;font-size:14px;line-height:1.6;">
          <tr><td style="color:#888;width:120px;">유입</td><td><strong>${payload.source ?? "-"}</strong></td></tr>
          <tr><td style="color:#888;">기관명</td><td>${payload.institution_name ?? "-"}</td></tr>
          <tr><td style="color:#888;">기관 유형</td><td>${payload.institution_type ?? "-"}</td></tr>
          <tr><td style="color:#888;">담당자</td><td>${payload.contact_name ?? "-"}</td></tr>
          <tr><td style="color:#888;">연락처</td><td>${payload.contact_phone ?? "-"}</td></tr>
          <tr><td style="color:#888;">이메일</td><td>${payload.contact_email ?? "-"}</td></tr>
        </table>
        ${payload.message ? `
          <div style="margin-top:20px;padding:14px;background:#FAF8F2;border-radius:12px;font-size:14px;line-height:1.6;white-space:pre-wrap;">
            ${payload.message.replace(/</g, "&lt;")}
          </div>` : ""}
        <p style="margin-top:24px;font-size:12px;color:#999;">
          관리자 페이지에서 후속 처리하세요.
        </p>
      </div>
    `;

    if (!RESEND_KEY) {
      console.warn("[notify-b2b-inquiry] RESEND_API_KEY missing — logging only");
      console.log("Inquiry payload:", payload);
      return new Response(
        JSON.stringify({ ok: true, delivered: false, reason: "no_email_provider" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "AIHPRO Business <noreply@aihpro.app>",
        to: [ADMIN_EMAIL],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[notify-b2b-inquiry] Resend error:", text);
      return new Response(
        JSON.stringify({ ok: false, error: text }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ ok: true, delivered: true }),
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
