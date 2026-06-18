// Verifies last-4 of phone, generates 6-digit OTP, sends via Twilio REST API.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TWILIO_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_FROM = Deno.env.get("TWILIO_FROM_NUMBER");

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) {
      return new Response(JSON.stringify({ error: "twilio_not_configured" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { token, last4 } = await req.json();
    if (!token || !last4) {
      return new Response(JSON.stringify({ error: "missing" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: link } = await admin
      .from("center_parent_share_links")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (!link) {
      return new Response(JSON.stringify({ error: "not_found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (link.revoked_at) {
      return new Response(JSON.stringify({ error: "revoked" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (new Date(link.expires_at).getTime() < Date.now()) {
      return new Response(JSON.stringify({ error: "expired" }), {
        status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (link.locked_until && new Date(link.locked_until).getTime() > Date.now()) {
      return new Response(JSON.stringify({ error: "locked" }), {
        status: 423, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (String(last4).trim() !== link.parent_phone_last4) {
      const next = (link.failed_attempts ?? 0) + 1;
      const updates: Record<string, unknown> = { failed_attempts: next };
      if (next >= 5) updates.locked_until = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      await admin.from("center_parent_share_links").update(updates).eq("id", link.id);
      return new Response(JSON.stringify({ error: "phone_mismatch", attempts_left: Math.max(0, 5 - next) }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await sha256(code);

    await admin.from("parent_otp_codes").insert({
      share_link_id: link.id,
      phone: link.parent_phone_e164,
      code_hash: codeHash,
    });

    // Send SMS via Twilio
    const auth = btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`);
    const body = new URLSearchParams({
      To: link.parent_phone_e164,
      From: TWILIO_FROM,
      Body: `[AIHPRO] 본인 확인 인증번호: ${code} (5분 이내 입력)`,
    });

    const twRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const twData = await twRes.json();
    if (!twRes.ok) {
      console.error("Twilio error:", twData);
      return new Response(JSON.stringify({ error: "twilio_send_failed", detail: twData?.message ?? twData }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin.from("center_parent_share_links").update({ failed_attempts: 0 }).eq("id", link.id);

    return new Response(
      JSON.stringify({ ok: true, phone: link.parent_phone_e164 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
