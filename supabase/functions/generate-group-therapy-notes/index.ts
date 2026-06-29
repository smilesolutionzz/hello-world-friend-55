// Group-mode therapy note generator (safe 1→N persistence).
// Body: {
//   centerId, groupId, weekKey,
//   common: { title?, greeting?, activities_summary?, highlights?: string[],
//             home_tips?: string[], next_week_focus? },
//   perChild: { [clientId]: { observation?: string, special?: string } }
// }
// Creates one center_parent_reports row per clientId provided in perChild.
// Strict rule: a child's personal text is NEVER mixed into another child's draft.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function weekRange(weekKey: string): { start: string; end: string } {
  const m = weekKey.match(/^(\d{4})-W(\d{2})$/);
  if (!m) {
    const t = new Date().toISOString().slice(0, 10);
    return { start: t, end: t };
  }
  const y = parseInt(m[1]); const w = parseInt(m[2]);
  const jan4 = new Date(Date.UTC(y, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Mon = new Date(jan4);
  week1Mon.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));
  const start = new Date(week1Mon);
  start.setUTCDate(week1Mon.getUTCDate() + (w - 1) * 7);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: { user } } = await admin.auth.getUser(auth.replace("Bearer ", ""));
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });

    const body = await req.json();
    const { centerId, groupId, weekKey, common = {}, perChild = {} } = body || {};
    if (!centerId || !groupId || !weekKey) {
      return new Response(JSON.stringify({ error: "centerId, groupId, weekKey required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { data: mem } = await admin.from("center_members").select("user_id").eq("center_id", centerId).eq("user_id", user.id).maybeSingle();
    if (!mem) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });

    // Validate every clientId in perChild is in this group + this center.
    const requestedIds = Object.keys(perChild || {});
    if (requestedIds.length === 0) {
      return new Response(JSON.stringify({ error: "no_children", detail: "perChild가 비어있어요." }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const { data: members } = await admin
      .from("center_client_group_members")
      .select("client_id")
      .eq("center_id", centerId)
      .eq("group_id", groupId);
    const memberSet = new Set((members || []).map((m: any) => m.client_id));
    const invalid = requestedIds.filter((id) => !memberSet.has(id));
    if (invalid.length) {
      return new Response(JSON.stringify({ error: "invalid_members", detail: invalid }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { start, end } = weekRange(weekKey);

    // Common fields (used verbatim for every child).
    const commonClean = {
      title: typeof common.title === "string" ? common.title.trim() : null,
      greeting: typeof common.greeting === "string" ? common.greeting.trim() : "",
      activities_summary: typeof common.activities_summary === "string" ? common.activities_summary.trim() : "",
      highlights: Array.isArray(common.highlights) ? common.highlights.filter(Boolean) : [],
      home_tips: Array.isArray(common.home_tips) ? common.home_tips.filter(Boolean) : [],
      next_week_focus: typeof common.next_week_focus === "string" ? common.next_week_focus.trim() : "",
    };

    const results: Array<{ clientId: string; reportId: string; status: "created" | "updated" }> = [];
    const failures: Array<{ clientId: string; error: string }> = [];

    // Fetch each client name (for default title) — single batched read
    const { data: clientRows } = await admin
      .from("center_clients")
      .select("id, name")
      .eq("center_id", centerId)
      .in("id", requestedIds);
    const nameOf: Record<string, string> = {};
    (clientRows || []).forEach((c: any) => { nameOf[c.id] = c.name; });

    for (const clientId of requestedIds) {
      // Build draft per-child. Personal text comes ONLY from perChild[clientId].
      const p = perChild[clientId] || {};
      const observation = typeof p.observation === "string" ? p.observation.trim() : "";
      const special = typeof p.special === "string" ? p.special.trim() : "";

      // growth[] holds the personal bullets — empty if the teacher didn't write anything.
      const growth: string[] = [];
      if (observation) growth.push(observation);
      if (special) growth.push(`특이사항: ${special}`);

      const draft = {
        title: commonClean.title || `${nameOf[clientId] || "아동"} · 주간 치료노트`,
        greeting: commonClean.greeting,
        activities_summary: commonClean.activities_summary,
        highlights: commonClean.highlights,
        home_tips: commonClean.home_tips,
        next_week_focus: commonClean.next_week_focus,
        growth, // per-child only
        _group_meta: {
          group_id: groupId,
          authored_at: new Date().toISOString(),
          common_fields: ["title", "greeting", "activities_summary", "highlights", "home_tips", "next_week_focus"],
        },
      };

      try {
        const { data: existing } = await admin
          .from("center_parent_reports")
          .select("id")
          .eq("center_id", centerId)
          .eq("client_id", clientId)
          .eq("week_key", weekKey)
          .eq("period_type", "weekly")
          .maybeSingle();

        if (existing) {
          const { error } = await admin.from("center_parent_reports").update({
            ai_draft_json: draft,
            title: draft.title,
            status: "draft",
            period_start: start,
            period_end: end,
            generated_at: new Date().toISOString(),
          }).eq("id", existing.id);
          if (error) throw error;
          results.push({ clientId, reportId: existing.id, status: "updated" });
        } else {
          const { data: ins, error } = await admin.from("center_parent_reports").insert({
            center_id: centerId,
            client_id: clientId,
            period_type: "weekly",
            week_key: weekKey,
            period_start: start,
            period_end: end,
            ai_draft_json: draft,
            title: draft.title,
            status: "draft",
            generated_at: new Date().toISOString(),
          }).select("id").single();
          if (error) throw error;
          results.push({ clientId, reportId: ins.id, status: "created" });
        }
      } catch (e: any) {
        failures.push({ clientId, error: e?.message ?? String(e) });
      }
    }

    return new Response(JSON.stringify({ results, failures, count: results.length }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("[generate-group-therapy-notes]", e);
    return new Response(JSON.stringify({ error: e?.message ?? String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
