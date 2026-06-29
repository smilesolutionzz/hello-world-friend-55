import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { anonymized_text, center_name, center_type, card_count = 4, keywords = [] } = await req.json();
    if (!anonymized_text) {
      return new Response(JSON.stringify({ error: "anonymized_text required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const n = Math.max(1, Math.min(5, Number(card_count) || 4));
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY missing");

    const prompt = `당신은 발달·심리·돌봄 기관의 신뢰형 마케팅 카피라이터입니다.
입력은 이미 익명화·검수된 사례입니다. 자극적·과장 표현·이모지·형광 강조 금지.
센터 정보:
- 이름: ${center_name || "(미입력)"}
- 유형: ${center_type || "발달·심리·돌봄"}
- 관련 키워드: ${(keywords || []).slice(0, 6).join(", ") || "(없음)"}

다음을 작성하세요:

1) cards: ${n}장짜리 카드뉴스 (스토리 흐름: 도입 → 관찰 → 접근 → 변화 → 메시지). 각 카드:
   - headline: 10~16자, 후킹은 잔잔하게
   - body: 60~110자, 따뜻한 서술형
   - tag: 카드 상단 작은 라벨 (예: "사례 01", "접근 방법")

2) instagram: 인스타 게시글 본문 (350자 내외, 줄바꿈 자연스럽게, 끝에 5~8개 한글 해시태그)
3) naver_blog: 네이버 블로그 글 (제목 + 본문 800~1200자, 소제목 2~3개를 \n## 로 구분, SEO 키워드 자연 삽입)
4) short_promo: 30~60자 짧은 홍보 문구 (문자/카톡용)
5) hashtags: 한글 SEO 해시태그 10개 (# 포함, 지역·서비스·정서 키워드 균형)
6) seo_keywords: 검색용 핵심 키워드 6~8개 (해시태그 없는 단어)

반드시 다음 JSON만 응답하세요 (앞뒤 텍스트·코드펜스 금지):
{
  "cards": [{"tag":"...","headline":"...","body":"..."}],
  "instagram": "...",
  "naver_blog": {"title":"...","body":"..."},
  "short_promo": "...",
  "hashtags": ["#..."],
  "seo_keywords": ["..."]
}

익명화된 사례:
"""
${String(anonymized_text).slice(0, 4000)}
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
    console.error("card-news-generate error", e);
    return new Response(JSON.stringify({ error: e?.message ?? "unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
