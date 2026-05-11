/**
 * 오늘의 맞춤 한 줄 — child_development 트랙용.
 * 입력: childProfileId, day(1-30). 캐시 hit 시 즉시 반환.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function ageBucket(birthDate: string): string {
  const months = (Date.now() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  if (months < 36) return "영아 (0~2세)";
  if (months < 72) return "유아 (3~5세)";
  if (months < 156) return "학령기 (6~12세)";
  return "청소년 (13~18세)";
}

function jres(body: Record<string, unknown>, status: number, requestId: string) {
  return new Response(JSON.stringify({ ...body, requestId }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "x-request-id": requestId },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const requestId = crypto.randomUUID();
  const t0 = Date.now();

  try {
    console.log(JSON.stringify({ tag: "personalize.start", requestId, ts: t0 }));
    const supa = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const auth = req.headers.get("Authorization");
    if (!auth) return jres({ error: "unauth", code: "UNAUTHENTICATED" }, 401, requestId);
    const { data: { user } } = await supa.auth.getUser(auth.replace("Bearer ", ""));
    if (!user) return jres({ error: "unauth", code: "UNAUTHENTICATED" }, 401, requestId);

    const body = await req.json().catch(() => ({}));
    const childProfileId = String(body?.childProfileId ?? "");
    const day = Math.max(1, Math.min(30, Number(body?.day ?? 1)));
    const baseMission = String(body?.baseMission ?? "").slice(0, 200);
    console.log(JSON.stringify({ tag: "personalize.input", requestId, userId: user.id, childProfileId, day, baseMissionLen: baseMission.length }));
    if (!childProfileId) {
      return jres({ error: "childProfileId required", code: "BAD_REQUEST" }, 400, requestId);
    }

    // 캐시 확인
    const { data: cached } = await supa
      .from("mind_track_personal_lines")
      .select("personal_line")
      .eq("child_profile_id", childProfileId)
      .eq("day", day)
      .maybeSingle();
    if (cached?.personal_line) {
      console.log(JSON.stringify({ tag: "personalize.cache_hit", requestId, ms: Date.now() - t0 }));
      return jres({ personalLine: cached.personal_line, cached: true }, 200, requestId);
    }

    // 프로필 로드 (RLS: 본인 것만)
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: auth } }, auth: { persistSession: false } }
    );
    const { data: profile, error: pErr } = await userClient
      .from("user_child_profiles")
      .select("id, user_id, child_nickname, birth_date, pain_points, goal_text")
      .eq("id", childProfileId)
      .maybeSingle();
    if (pErr || !profile || profile.user_id !== user.id) {
      console.error(JSON.stringify({ tag: "personalize.profile_missing", requestId, err: pErr?.message }));
      return jres({ error: "profile not found", code: "PROFILE_NOT_FOUND" }, 404, requestId);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error(JSON.stringify({ tag: "personalize.missing_key", requestId }));
      return jres({ error: "LOVABLE_API_KEY not set", code: "CONFIG_MISSING" }, 500, requestId);
    }

    const bucket = ageBucket(profile.birth_date);
    const pains = (profile.pain_points || []).join(", ") || "(미입력)";
    const goal = profile.goal_text || "(미입력)";

    const sys = "당신은 부모-자녀 발달 코치입니다. 한 문장(60자 이내)으로 부모가 오늘 바로 실천 가능한 구체 행동을 제안하세요. 의료 진단이나 단정적 표현은 피하고, 따뜻한 어조로 작성합니다. 이모지 금지, 마크다운 금지.";
    const usr = `아이 닉네임: ${profile.child_nickname}\n연령: ${bucket}\n주요 고민: ${pains}\n부모 목표: ${goal}\n오늘은 ${day}일차. 오늘의 베이스 미션: "${baseMission || "(없음)"}"\n→ ${profile.child_nickname}에게 오늘 시도할 한 문장 액션을 제안해 주세요.`;

    const aiT0 = Date.now();
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json", "x-request-id": requestId },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: usr },
        ],
      }),
    });
    console.log(JSON.stringify({ tag: "personalize.ai_done", requestId, status: aiRes.status, aiMs: Date.now() - aiT0 }));

    if (aiRes.status === 429) {
      return jres({ error: "Rate limit, try again later.", code: "RATE_LIMIT" }, 429, requestId);
    }
    if (aiRes.status === 402) {
      return jres({ error: "Payment required for AI gateway.", code: "PAYMENT_REQUIRED" }, 402, requestId);
    }
    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error(JSON.stringify({ tag: "personalize.ai_error", requestId, status: aiRes.status, body: t.slice(0, 500) }));
      return jres({ error: "AI gateway error", code: "AI_GATEWAY_ERROR", upstreamStatus: aiRes.status }, 502, requestId);
    }
    const aiJson = await aiRes.json();
    const personalLine = String(aiJson?.choices?.[0]?.message?.content ?? "").trim().slice(0, 200);
    if (!personalLine) {
      return jres({ error: "empty AI output", code: "EMPTY_RESPONSE" }, 502, requestId);
    }

    // 캐시 저장 (service_role)
    await supa.from("mind_track_personal_lines").insert({
      user_id: user.id,
      child_profile_id: childProfileId,
      day,
      personal_line: personalLine,
      base_mission: baseMission || null,
    });

    console.log(JSON.stringify({ tag: "personalize.ok", requestId, totalMs: Date.now() - t0 }));
    return jres({ personalLine, cached: false }, 200, requestId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error(JSON.stringify({ tag: "personalize.fatal", requestId, err: msg, totalMs: Date.now() - t0 }));
    return jres({ error: msg, code: "INTERNAL" }, 500, requestId);
  }
});
