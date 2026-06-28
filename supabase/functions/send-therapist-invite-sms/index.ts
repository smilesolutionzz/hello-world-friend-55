// Sends a 6-digit therapist invite code via Twilio SMS.
// Caller must be owner/admin of the therapist's center.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_FROM_NUMBER = Deno.env.get("TWILIO_FROM_NUMBER");

function normalizePhone(input: string): string | null {
  const digits = (input || "").replace(/[^\d+]/g, "");
  if (!digits) return null;
  if (digits.startsWith("+")) return digits;
  if (/^010\d{7,8}$/.test(digits)) return "+82" + digits.slice(1);
  if (/^82\d{9,10}$/.test(digits)) return "+" + digits;
  return null;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing Authorization" }, 401);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { therapist_id, origin_url } = await req.json();
    if (!therapist_id || typeof therapist_id !== "string") {
      return json({ error: "therapist_id required" }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: therapist, error: tErr } = await admin
      .from("center_therapists")
      .select("id, center_id, name, phone, invite_code, invite_code_expires_at, linked_user_id")
      .eq("id", therapist_id)
      .single();
    if (tErr || !therapist) return json({ error: "therapist not found" }, 404);
    if (therapist.linked_user_id) return json({ error: "이미 연결된 치료사입니다" }, 400);

    // Permission check: caller must be owner/admin of the center
    const { data: member } = await admin
      .from("center_members")
      .select("role")
      .eq("center_id", therapist.center_id)
      .eq("user_id", user.id)
      .maybeSingle();
    const isOrgOwner = await admin
      .from("center_organizations")
      .select("owner_user_id")
      .eq("id", therapist.center_id)
      .single()
      .then(({ data }) => data?.owner_user_id === user.id);
    const allowed = isOrgOwner || (member && ["owner", "admin"].includes(member.role));
    if (!allowed) return json({ error: "FORBIDDEN" }, 403);

    const phoneE164 = normalizePhone(therapist.phone || "");
    if (!phoneE164) return json({ error: "치료사 전화번호가 없거나 형식이 올바르지 않습니다" }, 400);

    // Issue or reuse invite code
    let code = therapist.invite_code as string | null;
    const expired = therapist.invite_code_expires_at &&
      new Date(therapist.invite_code_expires_at) < new Date();
    if (!code || expired) {
      const { data: newCode, error: cErr } = await admin.rpc("issue_therapist_invite_code", {
        _therapist_id: therapist_id,
      });
      if (cErr) return json({ error: "코드 발급 실패: " + cErr.message }, 500);
      code = newCode as unknown as string;
    }

    // Center name
    const { data: org } = await admin
      .from("center_organizations")
      .select("name")
      .eq("id", therapist.center_id)
      .single();
    const centerName = org?.name ?? "기관";

    // Always use production domain for SMS links — preview URLs (lovable.app /
    // lovableproject.com) require Lovable login and break the therapist flow.
    // Always force production domain — preview/sandbox hosts (lovable.app,
    // lovableproject.com, lovable.dev, *.lovable.*) all require a Lovable
    // login that therapists don't have.
    const origin = "https://aihpro.app";
    const claimUrl = `${origin}/therapist/my-schedule?code=${encodeURIComponent(code!)}`;


    const body =
      `[AIHPRO] ${centerName} 합류 초대\n` +
      `${therapist.name}님, 본인 휴대폰 번호로 회원가입(또는 로그인) 후\n` +
      `아래 코드를 입력해 계정을 연결하세요.\n` +
      `코드: ${code}\n` +
      `(코드 30일간 유효 · 가입 후 자동 입력됩니다)\n\n` +
      claimUrl;


    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
      return json({ ok: true, code, sms_sent: false, reason: "twilio not configured" });
    }

    const twRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: phoneE164,
          From: TWILIO_FROM_NUMBER,
          Body: body,
        }),
      },
    );
    if (!twRes.ok) {
      const txt = await twRes.text();
      return json({ ok: false, code, sms_sent: false, error: `Twilio ${twRes.status}: ${txt}` }, 502);
    }

    return json({ ok: true, code, sms_sent: true, to_last4: phoneE164.slice(-4) });
  } catch (e: any) {
    return json({ error: e?.message ?? String(e) }, 500);
  }
});
