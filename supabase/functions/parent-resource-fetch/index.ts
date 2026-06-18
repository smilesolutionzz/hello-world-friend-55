// Fetches a published center_parent_reports row for an authenticated parent session.
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
    const { parent_session_token, resource_id } = await req.json();
    if (!parent_session_token || !resource_id) {
      return new Response(JSON.stringify({ error: "missing" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: session } = await admin
      .from("parent_phone_sessions")
      .select("id, share_link_id, phone, child_id")
      .eq("token", parent_session_token)
      .maybeSingle();

    if (!session) {
      return new Response(JSON.stringify({ error: "invalid_session" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: link } = await admin
      .from("center_parent_share_links")
      .select("resource_id, resource_type, child_id, revoked_at, expires_at")
      .eq("id", session.share_link_id)
      .maybeSingle();

    if (!link || link.resource_id !== resource_id) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (link.revoked_at || new Date(link.expires_at).getTime() < Date.now()) {
      return new Response(JSON.stringify({ error: "expired" }), {
        status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: report } = await admin
      .from("center_parent_reports")
      .select("id, title, week_key, period_type, period_start, period_end, status, published_at, ai_draft_json, client_id, center_id")
      .eq("id", resource_id)
      .maybeSingle();

    if (!report || report.status !== "published") {
      return new Response(JSON.stringify({ error: "not_published" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let childName: string | null = null;
    if (report.client_id) {
      const { data: child } = await admin
        .from("center_clients")
        .select("display_name, name")
        .eq("id", report.client_id)
        .maybeSingle();
      childName = (child as any)?.display_name || (child as any)?.name || null;
    }

    let centerName: string | null = null;
    if (report.center_id) {
      const { data: center } = await admin
        .from("center_organizations")
        .select("name")
        .eq("id", report.center_id)
        .maybeSingle();
      centerName = (center as any)?.name || null;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        report: {
          id: report.id,
          title: report.title,
          week_key: report.week_key,
          period_type: report.period_type,
          period_start: report.period_start,
          period_end: report.period_end,
          published_at: report.published_at,
          ai_draft_json: report.ai_draft_json,
        },
        resource_type: link.resource_type,
        child_name: childName,
        center_name: centerName,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("parent-resource-fetch error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
