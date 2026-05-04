// B2B 리드 후속 메일 디스패처
// pg_cron이 1시간마다 호출 → scheduled_at <= now() 인 pending 큐를 처리
// 각 큐 항목당 send-transactional-email 호출

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TEMPLATE_MAP: Record<string, string> = {
  resources_d1: "b2b-followup-resources",
  case_studies_d3: "b2b-followup-cases",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: due, error } = await supabase
    .from("b2b_followup_queue")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_at", new Date().toISOString())
    .limit(50);

  if (error) {
    console.error("[b2b-followup-dispatcher] fetch error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const items = due ?? [];
  console.log(`[b2b-followup-dispatcher] processing ${items.length} due items`);

  const results = { sent: 0, failed: 0 };

  for (const item of items) {
    const templateName = TEMPLATE_MAP[item.followup_type];
    if (!templateName) {
      await supabase
        .from("b2b_followup_queue")
        .update({ status: "skipped", error: `unknown type: ${item.followup_type}` })
        .eq("id", item.id);
      continue;
    }

    try {
      const { error: sendErr } = await supabase.functions.invoke(
        "send-transactional-email",
        {
          body: {
            templateName,
            recipientEmail: item.recipient_email,
            idempotencyKey: `b2b-followup-${item.id}`,
            templateData: {
              contactName: item.contact_name ?? undefined,
              institutionName: item.institution_name ?? undefined,
            },
          },
        },
      );

      if (sendErr) throw sendErr;

      await supabase
        .from("b2b_followup_queue")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", item.id);
      results.sent++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[b2b-followup-dispatcher] send failed for ${item.id}:`, msg);
      await supabase
        .from("b2b_followup_queue")
        .update({ status: "failed", error: msg })
        .eq("id", item.id);
      results.failed++;
    }
  }

  return new Response(
    JSON.stringify({ ok: true, processed: items.length, ...results }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
