// Verifies OTP code, issues self-managed parent session token (no Supabase Auth).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { token, code } = await req.json();
    if (!token || !code) {
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

    // latest unconsumed OTP for this link
    const { data: otp } = await admin
      .from("parent_otp_codes")
      .select("*")
      .eq("share_link_id", link.id)
      .is("consumed_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!otp) {
      return new Response(JSON.stringify({ error: "no_pending_code" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (new Date(otp.expires_at).getTime() < Date.now()) {
      return new Response(JSON.stringify({ error: "code_expired" }), {
        status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if ((otp.attempts ?? 0) >= 5) {
      return new Response(JSON.stringify({ error: "too_many_attempts" }), {
        status: 423, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const codeHash = await sha256(String(code).trim());
    if (codeHash !== otp.code_hash) {
      await admin.from("parent_otp_codes").update({ attempts: (otp.attempts ?? 0) + 1 }).eq("id", otp.id);
      return new Response(JSON.stringify({ error: "code_mismatch", attempts_left: Math.max(0, 4 - (otp.attempts ?? 0)) }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // success — mark consumed, issue session
    await admin.from("parent_otp_codes").update({ consumed_at: new Date().toISOString() }).eq("id", otp.id);

    const sessionToken = randomToken();
    await admin.from("parent_phone_sessions").insert({
      token: sessionToken,
      phone: link.parent_phone_e164,
      child_id: link.child_id,
      share_link_id: link.id,
    });

    // Link parent phone to child (best-effort; rpc may require user_id - skip for self-managed flow)
    // We just rely on parent_phone_sessions for access control.

    await admin.from("center_parent_share_links").update({
      first_verified_at: link.first_verified_at ?? new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
      access_count: (link.access_count ?? 0) + 1,
    }).eq("id", link.id);

    return new Response(
      JSON.stringify({
        ok: true,
        parent_session_token: sessionToken,
        resource_type: link.resource_type,
        resource_id: link.resource_id,
        child_id: link.child_id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
