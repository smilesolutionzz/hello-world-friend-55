// AI rewrite/expand helper for therapy note text.
// Body: { text, instruction: 'expand'|'soften'|'professional'|'parent_friendly'|'shorten'|string }
// Returns: { text }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const INSTRUCTION_MAP: Record<string, string> = {
  expand: "주어진 텍스트를 더 풍부하고 구체적으로 확장하세요. 의미를 유지하면서 1.5~2배 분량으로.",
  soften: "더 따뜻하고 부드러운 어조로 다시 쓰세요. 보호자가 안심할 수 있게.",
  professional: "전문가다운 절제된 어조로 다시 쓰세요. 단, 의학적 진단 단어는 피하세요.",
  parent_friendly: "전문용어를 일상 언어로 풀어 보호자가 이해하기 쉽게 다시 쓰세요.",
  shorten: "핵심만 남기고 절반 분량으로 줄이세요.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });

    const { text, instruction } = await req.json();
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "text required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const inst = INSTRUCTION_MAP[instruction] ?? instruction ?? INSTRUCTION_MAP.parent_friendly;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "당신은 한국어 치료 노트 편집기입니다. 사용자가 준 텍스트를 지시에 맞게 다시 쓰고, 결과 텍스트만 출력하세요 (설명/머리말 금지)." },
          { role: "user", content: `[지시]\n${inst}\n\n[원문]\n${text}` },
        ],
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      return new Response(JSON.stringify({ error: "ai_failed", detail: t }), { status: 502, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const aiJson = await aiRes.json();
    const out = aiJson.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ text: out }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("[expand-therapy-note]", e);
    return new Response(JSON.stringify({ error: e?.message ?? String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
