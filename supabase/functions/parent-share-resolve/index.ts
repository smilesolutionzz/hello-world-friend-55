// Resolves a share token → returns minimal metadata (child name, masked phone, status).
// Public endpoint (no auth required).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      return new Response(JSON.stringify({ error: "token required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: link, error } = await admin
      .from("center_parent_share_links")
      .select("id, resource_type, resource_id, child_id, parent_phone_last4, expires_at, revoked_at, locked_until, first_verified_at")
      .eq("token", token)
      .maybeSingle();

    if (error || !link) {
      return new Response(JSON.stringify({ error: "not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (link.revoked_at) {
      return new Response(JSON.stringify({ error: "revoked" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (new Date(link.expires_at).getTime() < Date.now()) {
      return new Response(JSON.stringify({ error: "expired" }), {
        status: 410,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (link.locked_until && new Date(link.locked_until).getTime() > Date.now()) {
      return new Response(JSON.stringify({ error: "locked", locked_until: link.locked_until }), {
        status: 423,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optional: fetch child name (best-effort, ignore errors)
    let childName: string | null = null;
    if (link.child_id) {
      const { data: child } = await admin
        .from("center_clients")
        .select("display_name, name")
        .eq("id", link.child_id)
        .maybeSingle();
      childName = (child as any)?.display_name || (child as any)?.name || null;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        resource_type: link.resource_type,
        phone_last4: link.parent_phone_last4,
        child_name: childName,
        already_verified: !!link.first_verified_at,
        expires_at: link.expires_at,
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
