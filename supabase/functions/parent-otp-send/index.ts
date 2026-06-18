// Verifies that the supplied last-4-digits matches the token, then triggers Supabase OTP.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { token, last4 } = await req.json();
    if (!token || !last4) {
      return new Response(JSON.stringify({ error: "missing" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
      const updates: any = { failed_attempts: next };
      if (next >= 5) {
        updates.locked_until = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      }
      await admin.from("center_parent_share_links").update(updates).eq("id", link.id);
      return new Response(JSON.stringify({ error: "phone_mismatch", attempts_left: Math.max(0, 5 - next) }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // last4 verified — trigger OTP via Supabase Auth
    const anonClient = createClient(SUPABASE_URL, ANON_KEY);
    const { error: otpErr } = await anonClient.auth.signInWithOtp({
      phone: link.parent_phone_e164,
      options: { shouldCreateUser: true },
    });

    if (otpErr) {
      return new Response(JSON.stringify({ error: otpErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // reset failed attempts
    await admin.from("center_parent_share_links")
      .update({ failed_attempts: 0 })
      .eq("id", link.id);

    return new Response(
      JSON.stringify({ ok: true, phone: link.parent_phone_e164 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
