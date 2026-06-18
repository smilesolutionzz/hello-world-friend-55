// Marks share link as verified and links the parent's phone → user id → child id.
// Called from the client AFTER supabase.auth.verifyOtp() succeeds (the user is then authenticated).
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user || !user.phone) {
      return new Response(JSON.stringify({ error: "no_phone_user" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { token } = await req.json();
    if (!token) {
      return new Response(JSON.stringify({ error: "token required" }), {
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

    // Supabase stores phone WITHOUT + prefix
    const userPhone = user.phone.startsWith("+") ? user.phone : "+" + user.phone;
    if (userPhone !== link.parent_phone_e164) {
      return new Response(JSON.stringify({ error: "phone_mismatch" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // upsert phone link
    await admin.rpc("upsert_parent_phone_link", {
      _phone: link.parent_phone_e164,
      _user_id: user.id,
      _child_id: link.child_id,
    });

    // mark verified
    await admin.from("center_parent_share_links").update({
      first_verified_at: link.first_verified_at ?? new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
      access_count: (link.access_count ?? 0) + 1,
    }).eq("id", link.id);

    return new Response(
      JSON.stringify({
        ok: true,
        resource_type: link.resource_type,
        resource_id: link.resource_id,
        child_id: link.child_id,
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
