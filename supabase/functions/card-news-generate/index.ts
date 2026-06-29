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

    const prompt = `당신은 발달·심리·돌봄 기관의 보호자 공감형 SNS 카피라이터입니다.
SNS에서 스크롤하던 보호자가 멈춰서 끝까지 읽게 만드는 "공감 스토리형" 카드뉴스를 씁니다.
입력은 이미 익명화·검수된 사례입니다.

[톤 규칙 — 반드시 지킬 것]
- 따뜻하고 차분한 한국어. 보호자 옆에 앉아 이야기하듯.
- 이모지 금지. 형광/대문자 강조 금지. 느낌표 남발 금지.
- 단정·보장 금지: "좋아집니다", "완치", "반드시", "확실히", "100%" 금지. 대신 "~한 모습을 보였습니다", "~하는 변화가 있었습니다", "~을 함께 시도했습니다" 등 관찰 서술.
- 불안·공포 조장 금지: "지금 안 하면 늦는다", "골든타임", "이미 늦었을지도", "방치하면" 류 절대 금지.
- 의료 진단·치료 효과 주장 금지. 기관 활동·관찰·관계 형성 중심으로.
- 한 카드 = 한 메시지 원칙. 한 카드 안에 여러 주제를 욱여넣지 말 것.

[센터]
- 이름: ${center_name || "(미입력)"}
- 유형: ${center_type || "발달·심리·돌봄"}
- 관련 키워드: ${(keywords || []).slice(0, 6).join(", ") || "(없음)"}

다음을 작성하세요:

1) cards: 정확히 ${n}장. 구조는 아래 흐름을 그대로 따른다.
   - 1장 (훅): 보호자 마음에 공감하는 짧은 질문 또는 한 줄. 예) "우리 아이만 늦는 것 같아 마음 졸이셨나요?". 두려움 자극 금지.
   - 중간 카드 (관찰·접근·변화): 짧은 호흡, 사실 기반의 관찰 서술. 단정 표현 금지.
   - 마지막 장 (CTA): 부담 없는 상담 권유. 예) "작은 변화도 함께 지켜봐 드릴게요. 편하게 문의 주세요." 압박·긴급함 금지.
   각 카드:
   - headline: 8~18자. 한 줄에 들어가는 큰 타이포 기준. 핵심 한 문장.
   - body: 35~80자. 한 문단을 통째로 넣지 말고, 한 호흡으로 읽히는 짧은 문장 1~2개.
   - tag: 카드 상단 작은 라벨 (예: "공감", "관찰", "변화", "함께").

2) instagram: 인스타 게시글 본문 (300~400자). 첫 줄은 후킹 한 문장(공감형), 줄바꿈 자연스럽게. 마지막은 부담 없는 상담 안내 1줄. 끝에 5~8개 한글 해시태그.

3) naver_blog: 네이버 블로그 글.
   - title: 자연스러운 한 줄 제목 (보호자가 검색할 만한 표현, 과장 금지)
   - body: 900~1300자, 자연스러운 한국어 산문. 사람이 직접 쓴 듯한 흐름.
     ⚠️ 절대 "##", "**", "—" 같은 마크다운/구분선 기호를 쓰지 말 것 (AI 티가 남).
     문단은 빈 줄로만 구분. 소제목이 필요하면 "■ 소제목" 또는 한 줄 강조 문장으로 대체.
     키워드는 자연스럽게 본문 안에 녹일 것.

4) short_promo: 30~60자 짧은 홍보 문구 (문자/카톡용). 공감 한 줄 + 가벼운 상담 안내.

5) hashtags: 한글 SEO 해시태그 10개 (# 포함). 자극적 키워드 금지.

6) seo_keywords: 검색용 핵심 키워드 6~8개 (해시태그 없는 단어).

반드시 다음 JSON만 응답하세요 (앞뒤 텍스트·코드펜스·설명 금지):
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
