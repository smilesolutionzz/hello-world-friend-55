// Expand a therapist's short keywords into a structured session record.
// Body: { keywords: string, context?: { childName?, program?, therapist?, date?, time? } }
// Returns: { activity: string, evaluation: string, special: string }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
    const body = await req.json();
    const keywords: string = String(body?.keywords ?? "").trim();
    if (!keywords) {
      return new Response(JSON.stringify({ error: "keywords required" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const ctx = body?.context ?? {};

    const prompt = `당신은 발달·치료 센터의 치료사를 돕는 회기 기록 보조 AI입니다.
치료사가 회기 직후 짧게 적은 키워드/메모를 바탕으로 표준 치료 회기 기록 3개 필드를 자연스럽게 확장해 작성하세요.

[회기 정보]
- 아동: ${ctx.childName ?? "—"}
- 프로그램: ${ctx.program ?? "—"}
- 치료사: ${ctx.therapist ?? "—"}
- 일시: ${ctx.date ?? "—"} ${ctx.time ?? ""}

[치료사 키워드/메모]
${keywords}

[작성 규칙]
- 진단명·의학용어 금지 (예: 자폐, ADHD 등)
- 치료사 시점의 1~3문장 서술. 객관 사실 위주, 과장·평가어 자제
- 비어있는 정보는 추측하지 말고 자연스럽게 생략
- JSON 외 다른 텍스트 출력 금지

[필드 정의]
- activity(활동내용): 이번 회기에 진행한 활동/과제를 시간 흐름대로 간단히 정리
- evaluation(주관평가): 치료사 시각의 아동 수행·반응·진전도에 대한 짧은 코멘트
- special(특이사항): 컨디션, 거부/협조 양상, 다음 회기에 이어갈 점 등 메모할만한 포인트. 없으면 ""

JSON 형식:
{"activity":"...","evaluation":"...","special":"..."}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "치료사 회기 기록을 한국어 JSON으로 확장합니다. JSON 외 출력 금지." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      return new Response(JSON.stringify({ error: "ai_failed", detail: t }), {
        status: 502,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const aiJson = await aiRes.json();
    let out: any = {};
    try {
      out = JSON.parse(aiJson.choices?.[0]?.message?.content ?? "{}");
    } catch {
      out = {};
    }
    return new Response(
      JSON.stringify({
        activity: String(out.activity ?? "").trim(),
        evaluation: String(out.evaluation ?? "").trim(),
        special: String(out.special ?? "").trim(),
      }),
      { headers: { ...cors, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error("[expand-session-record]", e);
    return new Response(JSON.stringify({ error: e?.message ?? String(e) }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
