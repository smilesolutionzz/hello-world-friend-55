// Expand a therapist's short keywords into session record text.
// Single field body: { field: "consult" | "record" | "special", text: string, context?: { program?, childName?, date?, time? } }
// Bulk body: { keywords: string, context?: { program?, therapist?, childName?, date?, time? } }
// Returns single: { expanded: string } / bulk: { activity: string, evaluation: string, special: string }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FIELD_LABEL: Record<string, string> = {
  consult: "활동내용",
  record: "회기 관찰",
  special: "특이사항",
};

const FIELD_GUIDE: Record<string, string> = {
  consult: "이번 회기에 진행한 활동/과제를 시간 흐름대로 1~3문장으로 간단히 정리. 객관 사실 위주.",
  record: "치료사 시각에서 아동의 수행·반응·진전도·정서를 1~3문장으로 서술. 과장·진단 표현 금지.",
  special: "컨디션·거부/협조 양상·다음 회기 이어갈 점 등 메모 포인트 1~2문장. 없으면 빈 문자열.",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
    const body = await req.json();
    const ctx = body?.context ?? {};
    const keywords: string = String(body?.keywords ?? "").trim();

    if (keywords) {
      const bulkPrompt = `당신은 발달·치료 센터 치료사의 회기 기록을 다듬는 보조 AI입니다.
치료사가 적은 짧은 키워드/메모를 보호자 공유 전 내부 회기기록 3개 항목으로 나누어 자연스러운 한국어 문장으로 확장하세요.

[회기 정보]
- 프로그램(과목): ${ctx.program ?? "—"}
- 치료사: ${ctx.therapist ?? "—"}
- 아동: ${ctx.childName ?? "—"}
- 일시: ${ctx.date ?? "—"} ${ctx.time ?? ""}

[작성 항목]
1. activity: 활동내용 — 진행한 활동/과제를 시간 흐름대로 1~3문장, 객관 사실 위주
2. evaluation: 회기 관찰 — 수행·반응·진전도·정서를 1~3문장, 과장·진단 표현 금지
3. special: 특이사항 — 컨디션·거부/협조 양상·다음 회기 이어갈 점 0~2문장, 없으면 빈 문자열

[엄격한 안전 규칙]
- 진단명·의학용어 금지(자폐/ADHD 등)
- 개인정보 추정/추가 금지
- 입력에 없는 사실을 지어내지 말 것
- 결과는 JSON 객체만 반환

[치료사 키워드/메모]
${keywords}`;

      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "치료사 회기 기록 키워드를 activity/evaluation/special JSON 객체로만 확장합니다. 입력에 없는 사실은 만들지 않습니다." },
            { role: "user", content: bulkPrompt },
          ],
          response_format: { type: "json_object" },
          max_tokens: 1200,
        }),
      });

      if (!aiRes.ok) {
        const t = await aiRes.text();
        console.error("[expand-session-record] ai bulk failed", aiRes.status, t);
        return jsonResponse({ error: "ai_failed", detail: t }, 502);
      }

      const aiJson = await aiRes.json();
      const raw = String(aiJson.choices?.[0]?.message?.content ?? "{}").trim();
      let parsed: any = {};
      try {
        parsed = JSON.parse(raw.replace(/^```json\s*|```$/g, "").trim());
      } catch {
        parsed = { activity: raw, evaluation: "", special: "" };
      }

      return jsonResponse({
        activity: String(parsed.activity ?? parsed.consult ?? "").trim(),
        evaluation: String(parsed.evaluation ?? parsed.record ?? "").trim(),
        special: String(parsed.special ?? "").trim(),
      });
    }

    const field: string = String(body?.field ?? "").trim();
    const text: string = String(body?.text ?? "").trim();
    if (!field || !FIELD_LABEL[field]) {
      return jsonResponse({ error: "invalid field" }, 400);
    }
    if (!text) {
      return jsonResponse({ error: "text required" }, 400);
    }
    const label = FIELD_LABEL[field];
    const guide = FIELD_GUIDE[field];

    const prompt = `당신은 발달·치료 센터 치료사의 회기 기록을 다듬는 보조 AI입니다.
치료사가 적은 짧은 키워드/메모를 자연스러운 한국어 문장으로 확장하세요.

[회기 정보]
- 프로그램(과목): ${ctx.program ?? "—"}
- 아동: ${ctx.childName ?? "—"}
- 일시: ${ctx.date ?? "—"} ${ctx.time ?? ""}

[대상 필드] ${label}
[작성 지침]
${guide}
- 진단명·의학용어 금지(자폐/ADHD 등)
- 과장·평가어 자제, 사실·관찰 중심
- 치료사 1인칭/3인칭 자연스럽게
- 줄바꿈 없이 1개의 문단으로 반환
- 결과 텍스트만 반환 (따옴표·접두어·JSON 금지)

[치료사 키워드/메모]
${text}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "치료사 회기 기록 키워드를 자연스러운 한국어 한 문단으로 확장합니다. 설명/따옴표/JSON 없이 본문만 반환." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("[expand-session-record] ai failed", aiRes.status, t);
      return jsonResponse({ error: "ai_failed", detail: t }, 502);
    }
    const aiJson = await aiRes.json();
    const raw = String(aiJson.choices?.[0]?.message?.content ?? "").trim();
    // 안전망: JSON 형태로 잘못 응답하더라도 텍스트로 정리
    let expanded = raw.replace(/^["'`]+|["'`]+$/g, "").trim();
    if (expanded.startsWith("{")) {
      try {
        const j = JSON.parse(expanded);
        expanded = String(j[field] ?? j.expanded ?? j.text ?? expanded);
      } catch { /* keep raw */ }
    }
    return jsonResponse({ expanded });
  } catch (e: any) {
    console.error("[expand-session-record]", e);
    return jsonResponse({ error: e?.message ?? String(e) }, 500);
  }
});
