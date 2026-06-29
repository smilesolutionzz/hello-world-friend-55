import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReqBody {
  template: string;
  center_name: string;
  region?: string;
  keywords?: string[];
}

const TEMPLATE_HINTS: Record<string, string> = {
  dev_center: "발달지원센터 (언어·감각통합·인지·놀이치료). 부모의 발달 걱정·치료 효과 의문이 주요 정서.",
  psych_center: "심리상담센터 (개인·부부·가족 상담, 공인 상담심리사). 비밀보장·전문성·접근 부담이 핵심.",
  day_activity: "성인 발달장애 주간활동센터. 보호자의 안전·소통·의미있는 일과 관심.",
  daycare: "어린이집 (0~5세). 첫 사회생활·적응·식단·교사 관심.",
  kindergarten: "유치원 (만 3~5세). 초등 준비·놀이중심·특성화·소통.",
  nursing_home: "장기요양 요양원. 보호자의 적응·야간응급·비용·보험 관심. 따뜻함과 안심톤.",
  nursing_hospital: "의료중심 요양병원. 의료진 상주·재활·치매·만성질환 관리.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { template, center_name, region, keywords }: ReqBody = await req.json();
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY missing");

    const hint = TEMPLATE_HINTS[template] ?? "발달·심리·돌봄 기관";
    const kw = (keywords ?? []).filter(Boolean).slice(0, 8).join(", ");

    const prompt = `당신은 발달·심리·돌봄 분야 마케팅 카피라이터입니다. 보호자가 불안한 마음으로 방문하는 페이지이므로 차분하고 신뢰감 있는 톤으로 작성하세요.
자극적인 공포 마케팅 표현, "환자가 없으신가요?" 류, 형광 강조, 이모지는 절대 사용하지 마세요.

기관 정보:
- 이름: ${center_name}
- 유형 컨텍스트: ${hint}
- 지역: ${region || "(미입력)"}
- 키워드: ${kw || "(없음)"}

아래 JSON 스키마에 맞춰 한국어 카피를 작성해 주세요. 모든 문장은 자연스럽고 구체적이어야 하며, "{name}"은 실제 기관명으로 치환해 주세요.

요구사항:
- concerns: 보호자가 실제로 겪는 고민 4개 (각각 한 문장, 따옴표 없이)
- solutions: 3~4개 (icon 은 heart/users/clipboard/shield/sparkles/leaf/stethoscope/school/smile 중 하나, title 8자 내외, desc 1~2문장)
- trust: 4개 (label 10자 이내, value 12자 이내)
- process: 4단계 (title 12자 이내 — 예: "01. 온라인 문의", desc 1문장)
- faqs: 4개 (q 1문장, a 1~2문장)

반드시 다음 JSON만 응답하세요 (앞뒤 텍스트·코드펜스 금지):
{
  "hero_subtitle": "...",
  "concerns": ["...","...","...","..."],
  "solutions": [{"icon":"heart","title":"...","desc":"..."}],
  "trust": [{"label":"...","value":"..."}],
  "process": [{"title":"01. ...","desc":"..."}],
  "faqs": [{"q":"...","a":"..."}]
}`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });
    if (!r.ok) {
      const txt = await r.text();
      if (r.status === 429) return new Response(JSON.stringify({ error: "요청 한도를 초과했습니다." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (r.status === 402) return new Response(JSON.stringify({ error: "AI 크레딧이 부족합니다." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway ${r.status}: ${txt}`);
    }
    const data = await r.json();
    const raw: string = data.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(raw); } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : {};
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("landing-ai-generate error", e);
    return new Response(JSON.stringify({ error: e?.message ?? "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
