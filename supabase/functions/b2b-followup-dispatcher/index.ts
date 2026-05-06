// B2B 후속 메일 + SLA 알림 디스패처
// pg_cron 1시간마다 호출
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TEMPLATE_MAP: Record<string, string> = {
  resources_d1: "b2b-followup-resources",
  case_studies_d3: "b2b-followup-cases",
  sla_new_24h: "b2b-internal-sla-alert",
  sla_contacted_3d: "b2b-quote-followup",
  sla_quote_7d: "b2b-quote-followup",
};

const ADMIN_NOTIFY_EMAIL = Deno.env.get("ADMIN_NOTIFY_EMAIL") || "contact@aihpro.app";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // ===== 1. SLA 위반 감지 → 큐 자동 등록 =====
  const now = Date.now();
  const dayMs = 86400 * 1000;

  const { data: stale } = await supabase
    .from("b2b_jobcoach_inquiries")
    .select("id, contact_email, contact_name, company_name, kanban_status, last_activity_at")
    .in("kanban_status", ["new", "contacted", "quote_sent"])
    .limit(200);

  const queueRows: any[] = [];
  for (const inq of stale ?? []) {
    const ageMs = now - new Date(inq.last_activity_at ?? 0).getTime();
    let type: string | null = null;
    if (inq.kanban_status === "new" && ageMs > dayMs) type = "sla_new_24h";
    else if (inq.kanban_status === "contacted" && ageMs > 3 * dayMs) type = "sla_contacted_3d";
    else if (inq.kanban_status === "quote_sent" && ageMs > 7 * dayMs) type = "sla_quote_7d";
    if (!type) continue;

    // 중복 큐 방지: 최근 24h 안에 같은 inquiry+type 있으면 skip
    const { data: dup } = await supabase
      .from("b2b_followup_queue")
      .select("id")
      .eq("inquiry_id", inq.id)
      .eq("followup_type", type)
      .gte("created_at", new Date(now - dayMs).toISOString())
      .maybeSingle();
    if (dup) continue;

    const recipient = type === "sla_new_24h" ? ADMIN_NOTIFY_EMAIL : inq.contact_email;
    queueRows.push({
      inquiry_id: inq.id,
      recipient_email: recipient,
      contact_name: inq.contact_name,
      institution_name: inq.company_name,
      followup_type: type,
      scheduled_at: new Date().toISOString(),
      status: "pending",
    });
  }
  if (queueRows.length) {
    await supabase.from("b2b_followup_queue").insert(queueRows);
  }

  // ===== 2. due 큐 처리 =====
  const { data: due, error } = await supabase
    .from("b2b_followup_queue")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_at", new Date().toISOString())
    .limit(50);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const items = due ?? [];
  const results = { sent: 0, failed: 0, sla_enqueued: queueRows.length };

  for (const item of items) {
    const templateName = TEMPLATE_MAP[item.followup_type];
    if (!templateName) {
      await supabase.from("b2b_followup_queue")
        .update({ status: "skipped", error: `unknown type: ${item.followup_type}` })
        .eq("id", item.id);
      continue;
    }
    try {
      const { error: sendErr } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName,
          recipientEmail: item.recipient_email,
          idempotencyKey: `b2b-followup-${item.id}`,
          templateData: {
            contactName: item.contact_name ?? undefined,
            institutionName: item.institution_name ?? undefined,
          },
        },
      });
      if (sendErr) throw sendErr;
      await supabase.from("b2b_followup_queue")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", item.id);
      results.sent++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await supabase.from("b2b_followup_queue")
        .update({ status: "failed", error: msg })
        .eq("id", item.id);
      results.failed++;
    }
  }

  return new Response(JSON.stringify({ ok: true, processed: items.length, ...results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
