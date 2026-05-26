import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization") ?? "";
    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );

    const { data: userRes } = await userClient.auth.getUser();
    const user = userRes?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const token = typeof body.token === "string" ? body.token : null;
    const code = typeof body.code === "string"
      ? body.code.trim().toUpperCase()
      : null;

    if (!token && !code) {
      return new Response(JSON.stringify({ error: "missing_token_or_code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const query = supa.from("center_client_invites").select("*").eq("status", "pending").gt(
      "expires_at",
      new Date().toISOString(),
    );
    const { data: invite, error: invErr } = token
      ? await query.eq("invite_token", token).maybeSingle()
      : await query.eq("center_code", code!).maybeSingle();

    if (invErr || !invite) {
      return new Response(JSON.stringify({ error: "invite_not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark invite claimed
    await supa.from("center_client_invites").update({
      status: "claimed",
      claimed_by_user_id: user.id,
      claimed_at: new Date().toISOString(),
    }).eq("id", invite.id);

    // Link client → user
    await supa.from("center_clients").update({ linked_user_id: user.id }).eq(
      "id",
      invite.client_id,
    );

    // Upsert grant
    await supa.from("center_b2c_grants").upsert({
      center_id: invite.center_id,
      client_id: invite.client_id,
      user_id: user.id,
      source: token ? "invite" : "code",
      grants: {
        mind_track_7: true,
        assessments_unlimited: true,
        report_basic: true,
      },
    }, { onConflict: "center_id,user_id" });

    // Onboarding ping
    await supa.from("center_onboarding_progress").upsert({
      center_id: invite.center_id,
      step_key: "first_parent_signup",
    }, { onConflict: "center_id,step_key" });

    const { data: center } = await supa.from("center_organizations").select(
      "id, name",
    ).eq("id", invite.center_id).maybeSingle();
    const { data: client } = await supa.from("center_clients").select(
      "id, name",
    ).eq("id", invite.client_id).maybeSingle();

    return new Response(
      JSON.stringify({ ok: true, center, client }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
