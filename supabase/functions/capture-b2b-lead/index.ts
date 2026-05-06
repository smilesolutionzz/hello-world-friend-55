import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { lead_id, asset_key, asset_title, email, contact_name, company, role, phone } = body;

    if (!email || !company) {
      return new Response(JSON.stringify({ error: "email, company required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1) 같은 이메일 기존 inquiry 있는지
    const { data: existing } = await supabase
      .from("b2b_jobcoach_inquiries")
      .select("id")
      .eq("contact_email", email)
      .maybeSingle();

    let inquiry_id = existing?.id ?? null;

    if (!inquiry_id) {
      const { data: created } = await supabase
        .from("b2b_jobcoach_inquiries")
        .insert({
          company_name: company,
          contact_name: contact_name || email.split("@")[0],
          contact_email: email,
          contact_phone: phone ?? null,
          position: role ?? null,
          source: `lead_magnet:${asset_key}`,
          status: "new",
          kanban_status: "new",
          message: `[리드 자료] ${asset_title} 다운로드`,
          last_activity_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      inquiry_id = created?.id ?? null;
    } else {
      await supabase
        .from("b2b_jobcoach_inquiries")
        .update({ last_activity_at: new Date().toISOString() })
        .eq("id", inquiry_id);
    }

    // 2) lead row 업데이트
    if (lead_id && inquiry_id) {
      await supabase.from("b2b_lead_downloads").update({ inquiry_id }).eq("id", lead_id);
    }

    // 3) follow-up 큐
    const now = Date.now();
    await supabase.from("b2b_followup_queue").insert([
      {
        recipient_email: email,
        contact_name,
        institution_name: company,
        followup_type: "resources_d1",
        scheduled_at: new Date(now + 24 * 3600 * 1000).toISOString(),
        status: "pending",
      },
      {
        recipient_email: email,
        contact_name,
        institution_name: company,
        followup_type: "case_studies_d3",
        scheduled_at: new Date(now + 3 * 24 * 3600 * 1000).toISOString(),
        status: "pending",
      },
    ]);

    // 4) 즉시 확인 메일
    try {
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "b2b-lead-confirmation",
          recipientEmail: email,
          idempotencyKey: `lead-${lead_id}`,
          templateData: { contactName: contact_name, assetTitle: asset_title, company },
        },
      });
    } catch (e) {
      console.warn("[capture-b2b-lead] email send failed", e);
    }

    return new Response(JSON.stringify({ ok: true, inquiry_id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[capture-b2b-lead]", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
