import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { source_text, source_type } = await req.json();
    if (!source_text || typeof source_text !== "string") {
      return new Response(JSON.stringify({ error: "source_text required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY missing");

    const prompt = `당신은 발달·심리·돌봄 기관의 마케팅 콘텐츠 익명화 전문가입니다.
입력은 ${source_type === "monthly" ? "월간 부모 리포트" : "주간 치료노트"} 원문입니다.

다음 개인정보·식별정보를 모두 제거하거나 추상화하세요:
- 아동/이용자 실명 → "김○○ 아동" "여아 A" 등으로 변경
- 생년월일·정확한 나이 → "취학 전 아동" "초등 저학년" 등 연령대로
- 정확한 진단명(자폐스펙트럼장애 F84.0 등) → "사회적 의사소통에 어려움이 있는 아동" 등 기능 중심 표현으로
- 기관명·치료사 실명·주소·전화번호 → 모두 제거
- 가족 구성·부모 직업·형제 정보 → 모두 제거
- 회기 횟수는 유지하되 일자는 "○월 ○주차" 수준으로
- 의료적 진단·치료 효과 과장 표현 금지 (개선/변화 정도로 순화)

출력은 마케팅 사례로 쓸 수 있는 자연스러운 한국어 산문 1~3문단입니다.
자극적이지 않고 따뜻하고 신뢰감 있는 톤. 이모지 금지.

반드시 다음 JSON만 응답하세요 (앞뒤 텍스트·코드펜스 금지):
{
  "anonymized_text": "...",
  "removed_items": ["제거한 항목 카테고리들"],
  "warnings": ["검수자에게 추가 확인이 필요한 부분"]
}

원문:
"""
${source_text.slice(0, 6000)}
"""`;

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
    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("card-news-anonymize error", e);
    return new Response(JSON.stringify({ error: e?.message ?? "unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
