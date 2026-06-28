// Creates a share link for a parent (therapy_note or parent_report).
// Optionally sends the link via Twilio SMS.
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
const TWILIO_FROM_NUMBER = Deno.env.get("TWILIO_FROM_NUMBER"); // optional, for outbound link SMS

function normalizePhone(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  // assume KR if starts with 010
  if (/^010\d{7,8}$/.test(digits)) return "+82" + digits.slice(1);
  return null;
}

function generateToken(byteLen = 10): string {
  // Hex only (0-9a-f), 20 chars (80 bits entropy) — short enough that the full
  // URL fits in a single Korean SMS segment (UCS-2 = 70 chars/segment).
  // Avoid '-'/'_' because Korean SMS clients break auto-linkify at underscores.
  const bytes = new Uint8Array(byteLen);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      resource_type,
      resource_id,
      child_id,
      center_id,
      parent_phone,
      origin_url,
      send_sms = false,
    } = body || {};

    if (!resource_type || !["therapy_note", "parent_report"].includes(resource_type)) {
      return new Response(JSON.stringify({ error: "invalid resource_type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!resource_id || typeof resource_id !== "string") {
      return new Response(JSON.stringify({ error: "resource_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!parent_phone || typeof parent_phone !== "string") {
      return new Response(JSON.stringify({ error: "parent_phone required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const phoneE164 = normalizePhone(parent_phone);
    if (!phoneE164) {
      return new Response(JSON.stringify({ error: "invalid phone format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const last4 = phoneE164.slice(-4);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const token = generateToken();

    // Auto-publish underlying resource so the parent viewer can render it.
    // Both therapy notes (weekly) and parent reports (monthly) live in center_parent_reports.
    // Only flip drafts → published; already-published rows keep their original published_at.
    {
      const { data: existing, error: selErr } = await admin
        .from("center_parent_reports")
        .select("id, status, published_at")
        .eq("id", resource_id)
        .maybeSingle();
      if (selErr || !existing) {
        return new Response(JSON.stringify({ error: selErr?.message ?? "resource_not_found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (existing.status !== "published") {
        const { error: updErr } = await admin
          .from("center_parent_reports")
          .update({
            status: "published",
            published_at: existing.published_at ?? new Date().toISOString(),
          })
          .eq("id", resource_id);
        if (updErr) {
          console.error("[publish] update failed", updErr);
          return new Response(JSON.stringify({ error: `publish_failed: ${updErr.message}` }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    const { data: inserted, error: insErr } = await admin
      .from("center_parent_share_links")
      .insert({
        token,
        resource_type,
        resource_id,
        child_id: child_id ?? null,
        center_id: center_id ?? null,
        parent_phone_e164: phoneE164,
        parent_phone_last4: last4,
        created_by: user.id,
      })
      .select()
      .single();

    if (insErr) {
      return new Response(JSON.stringify({ error: insErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Always use the production domain for parent share links so guardians never hit
    // the Lovable preview login wall. Route directly to the self-managed Twilio OTP
    // flow; Supabase Phone Auth is intentionally disabled for this project.
    const PUBLIC_BASE_URL = "https://aihpro.app";
    const shareUrl = `${PUBLIC_BASE_URL}/parent-share/${token}`;

    let smsResult: any = null;
    const missingSecrets: string[] = [];
    if (send_sms) {
      if (!TWILIO_ACCOUNT_SID) missingSecrets.push("TWILIO_ACCOUNT_SID");
      if (!TWILIO_AUTH_TOKEN) missingSecrets.push("TWILIO_AUTH_TOKEN");
      if (!TWILIO_FROM_NUMBER) missingSecrets.push("TWILIO_FROM_NUMBER");
      if (missingSecrets.length > 0) {
        console.warn("[twilio] missing secrets", missingSecrets);
        smsResult = { missing: missingSecrets };
      }
    }
    if (send_sms && missingSecrets.length === 0) {
      // Place the URL on its OWN line at the END of the message, surrounded by
      // blank lines. Korean SMS/LMS clients (KT/SKT/LGU+) auto-linkify by
      // scanning forward to the next whitespace — when the URL is mid-message
      // or immediately followed by Korean text, some clients include trailing
      // bytes or strip query chars, producing a broken link on tap (but the
      // raw text copies fine, which matches the reported symptom).
      // Keep the entire message under ONE Korean SMS segment (UCS-2 = 70 chars).
      // Twilio + KR carriers split longer messages into separate SMS, which
      // routinely breaks the URL across segments (reported symptom: link cut
      // off mid-token). With a 20-char hex token the URL is 52 chars; the
      // short header below keeps total length around 64 chars → 1 segment.
      const message = `[AIHPRO] 리포트 도착\n${shareUrl}`;
      const twResp = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: phoneE164,
            From: TWILIO_FROM_NUMBER!,
            Body: message,
          }),
        },
      );
      smsResult = await twResp.json();
      if (twResp.ok) {
        await admin
          .from("center_parent_share_links")
          .update({ sms_sent_at: new Date().toISOString() })
          .eq("id", inserted.id);
      } else {
        console.error("[twilio] send failed", {
          status: twResp.status,
          to: phoneE164,
          from: TWILIO_FROM_NUMBER,
          code: smsResult?.code,
          message: smsResult?.message,
          more_info: smsResult?.more_info,
        });
      }
    }

    return new Response(
      JSON.stringify({
        id: inserted.id,
        token,
        share_url: shareUrl,
        expires_at: inserted.expires_at,
        sms_sent: !!(send_sms && smsResult && (smsResult as any).sid),
        sms_result: smsResult,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
