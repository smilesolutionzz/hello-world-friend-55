/**
 * 개발/테스트용: 결제 없이 본인 계정에 mind_track_30 권한을 임시 부여한다.
 * - 프로덕션 도메인(aihpro.app/aihpro.life)에서는 admin만 호출 가능.
 * - 다른 사용자 ID로는 절대 권한을 부여하지 않는다(JWT 본인만).
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROD_HOSTS = ["aihpro.app", "www.aihpro.app", "aihpro.life", "www.aihpro.life"];

function jres(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return jres({ error: "unauth", code: "UNAUTHENTICATED" }, 401);

    const supa = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );
    const { data: { user } } = await supa.auth.getUser(auth.replace("Bearer ", ""));
    if (!user) return jres({ error: "unauth", code: "UNAUTHENTICATED" }, 401);

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "grant"); // grant | reset

    // 프로덕션 호스트면 admin만
    const origin = req.headers.get("origin") || req.headers.get("referer") || "";
    let isProd = false;
    try { isProd = PROD_HOSTS.includes(new URL(origin).hostname); } catch { /* ignore */ }
    if (isProd) {
      const { data: isAdmin } = await supa.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (!isAdmin) return jres({ error: "admin only on production", code: "FORBIDDEN" }, 403);
    }

    if (action === "reset") {
      // 본인 데이터만 정리
      await supa.from("mind_track_personal_lines").delete().eq("user_id", user.id);
      await supa.from("mind_track_onboarding_events").delete().eq("user_id", user.id);
      await supa.from("user_child_profiles").delete().eq("user_id", user.id);
      await supa.from("mind_track_enrollments").delete().eq("user_id", user.id);
      return jres({ ok: true, action: "reset" }, 200);
    }

    // grant — 기존 enrollment를 completed로 승격하거나 새로 만든다
    const { data: existing } = await supa
      .from("mind_track_enrollments")
      .select("id")
      .eq("user_id", user.id)
      .neq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let enrollmentId = existing?.id as string | undefined;
    if (enrollmentId) {
      await supa.from("mind_track_enrollments").update({
        track_type: "mind_30day",
        payment_status: "completed",
        status: "active",
        started_at: new Date().toISOString(),
      }).eq("id", enrollmentId);
    } else {
      const { data: created, error } = await supa.from("mind_track_enrollments").insert({
        user_id: user.id,
        track_type: "mind_30day",
        goal_focus: "stress",
        payment_status: "completed",
        payment_amount: 19900,
        status: "active",
        started_at: new Date().toISOString(),
        baseline_data: { source: "dev_grant", granted_at: new Date().toISOString() },
      }).select("id").single();
      if (error) return jres({ error: error.message, code: "INSERT_FAILED" }, 500);
      enrollmentId = created!.id;
    }

    return jres({ ok: true, action: "grant", enrollmentId, isProd }, 200);
  } catch (e) {
    return jres({ error: e instanceof Error ? e.message : "unknown", code: "INTERNAL" }, 500);
  }
});
