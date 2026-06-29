// Batch share parent reports / therapy notes for a whole group.
// CRITICAL: never broadcasts one resource to many parents — each item carries
// its own (client_id, resource_id, parent_phone), and the server verifies that
// the resource actually belongs to that client before generating a link/SMS.
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
const TWILIO_FROM_NUMBER = Deno.env.get("TWILIO_FROM_NUMBER");

const PUBLIC_BASE_URL = "https://aihpro.app";

function normalizePhone(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (/^010\d{7,8}$/.test(digits)) return "+82" + digits.slice(1);
  return null;
}

function generateToken(byteLen = 10): string {
  const bytes = new Uint8Array(byteLen);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

type Item = {
  client_id: string;
  client_name?: string;
  resource_id: string;
  parent_phone: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      center_id,
      group_id,
      resource_type,
      period_label,
      items,
      send_sms = false,
    }: {
      center_id: string;
      group_id?: string | null;
      resource_type: "therapy_note" | "parent_report";
      period_label?: string;
      items: Item[];
      send_sms?: boolean;
    } = body || {};

    if (!center_id || !resource_type || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "center_id, resource_type, items required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!["therapy_note", "parent_report"].includes(resource_type)) {
      return new Response(JSON.stringify({ error: "invalid resource_type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (items.length > 200) {
      return new Response(JSON.stringify({ error: "too many items (max 200)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Verify caller is a center member.
    const { data: member } = await admin
      .from("center_members")
      .select("user_id")
      .eq("center_id", center_id)
      .eq("user_id", user.id)
      .maybeSingle();
    const { data: org } = await admin
      .from("center_organizations")
      .select("owner_id")
      .eq("id", center_id)
      .maybeSingle();
    if (!member && org?.owner_id !== user.id) {
      return new Response(JSON.stringify({ error: "forbidden: not a center member" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pre-load resources and clients for verification (defense in depth).
    const resourceIds = [...new Set(items.map((i) => i.resource_id))];
    const clientIds = [...new Set(items.map((i) => i.client_id))];
    const [{ data: resources }, { data: clients }] = await Promise.all([
      admin.from("center_parent_reports")
        .select("id, client_id, center_id, status, published_at")
        .in("id", resourceIds),
      admin.from("center_clients")
        .select("id, center_id, name, guardian_phone")
        .in("id", clientIds),
    ]);

    const resourceMap = new Map((resources ?? []).map((r: any) => [r.id, r]));
    const clientMap = new Map((clients ?? []).map((c: any) => [c.id, c]));

    const results: any[] = [];
    let success = 0, failure = 0, skipped = 0;

    for (const it of items) {
      const baseLog = {
        client_id: it.client_id,
        client_name: it.client_name ?? clientMap.get(it.client_id)?.name ?? null,
        resource_id: it.resource_id,
        parent_phone_last4: (normalizePhone(it.parent_phone || "") ?? "").slice(-4) || null,
      };

      const resource = resourceMap.get(it.resource_id);
      const client = clientMap.get(it.client_id);

      // ── Anti-misdelivery checks ─────────────────────────────────────
      if (!client || client.center_id !== center_id) {
        results.push({ ...baseLog, status: "skipped", reason: "client_not_in_center" });
        skipped++; continue;
      }
      if (!resource) {
        results.push({ ...baseLog, status: "skipped", reason: "resource_not_found" });
        skipped++; continue;
      }
      if (resource.center_id !== center_id) {
        results.push({ ...baseLog, status: "skipped", reason: "resource_wrong_center" });
        skipped++; continue;
      }
      if (resource.client_id !== it.client_id) {
        // MOST CRITICAL: refuse to send another child's note to this parent.
        results.push({ ...baseLog, status: "skipped", reason: "resource_client_mismatch" });
        skipped++; continue;
      }
      const phoneE164 = normalizePhone(it.parent_phone || "");
      if (!phoneE164) {
        results.push({ ...baseLog, status: "skipped", reason: "invalid_phone" });
        skipped++; continue;
      }

      // Publish if not yet published
      if (resource.status !== "published") {
        await admin.from("center_parent_reports").update({
          status: "published",
          published_at: resource.published_at ?? new Date().toISOString(),
        }).eq("id", resource.id);
      }

      const token = generateToken();
      const { data: inserted, error: insErr } = await admin
        .from("center_parent_share_links")
        .insert({
          token,
          resource_type,
          resource_id: it.resource_id,
          child_id: it.client_id,
          center_id,
          parent_phone_e164: phoneE164,
          parent_phone_last4: phoneE164.slice(-4),
          created_by: user.id,
        }).select().single();

      if (insErr || !inserted) {
        results.push({ ...baseLog, status: "failed", reason: `link_insert: ${insErr?.message}` });
        failure++; continue;
      }

      const shareUrl = `${PUBLIC_BASE_URL}/parent-share/${token}`;
      let smsOk = false;
      let smsErr: string | null = null;

      if (send_sms) {
        if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
          smsErr = "twilio_secrets_missing";
        } else {
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
                To: phoneE164, From: TWILIO_FROM_NUMBER!, Body: message,
              }),
            },
          );
          const tw = await twResp.json();
          if (twResp.ok && tw?.sid) {
            smsOk = true;
            await admin.from("center_parent_share_links")
              .update({ sms_sent_at: new Date().toISOString() })
              .eq("id", inserted.id);
          } else {
            smsErr = `twilio_${tw?.code ?? twResp.status}: ${tw?.message ?? ""}`;
          }
        }
      }

      results.push({
        ...baseLog,
        status: send_sms ? (smsOk ? "sent" : "link_only") : "link_created",
        share_url: shareUrl,
        sms_error: smsErr,
      });
      if (send_sms) {
        if (smsOk) success++; else failure++;
      } else {
        success++;
      }
    }

    // Persist audit log
    const { data: job } = await admin.from("center_batch_send_jobs").insert({
      center_id,
      group_id: group_id ?? null,
      resource_type,
      period_label: period_label ?? null,
      total_count: items.length,
      success_count: success,
      failure_count: failure,
      skipped_count: skipped,
      send_sms,
      items: results,
      created_by: user.id,
    }).select("id").single();

    return new Response(JSON.stringify({
      job_id: job?.id,
      total: items.length, success, failure, skipped, results,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("[batch-share] error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
