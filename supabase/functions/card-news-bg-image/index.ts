import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 카드뉴스 배경용 AI 이미지 생성.
// 입력: headline, body, style_key, center_type
// 출력: { image: "data:image/png;base64,..." }
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { headline = "", body = "", style_key = "ivory-serif", center_type = "" } = await req.json();
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY missing");

    // 스타일별 분위기 힌트
    const styleHint: Record<string, string> = {
      "gold-dark": "deep navy and warm gold tones, soft cinematic lighting, premium minimal",
      "ivory-serif": "warm ivory beige paper texture, gentle natural light, editorial calm",
      "soft-pastel": "soft pastel gradient, dreamy bokeh, very gentle and warm",
      "magazine-bw": "high-contrast black and white documentary photography, grainy film",
      "photo-overlay": "atmospheric documentary photograph with shallow depth of field",
      "rounded-poster": "warm amber and cream poster background, abstract organic shapes",
      "minimal-border": "very minimal off-white background with subtle paper grain",
    };
    const tone = styleHint[style_key] ?? styleHint["ivory-serif"];

    const safeContext = `${headline}\n${body}`.slice(0, 300);

    const prompt = `A calm, warm, abstract editorial background image for a social media card about a Korean ${center_type || "developmental/psychological care"} center. 
Tone: ${tone}. 
The image must be subtle enough to place large Korean text on top — no text, no letters, no logos, no people's faces, no children's faces, no medical equipment, no clinical or hospital imagery, no fear, no darkness. 
Soft composition with empty negative space in the center. Square 1:1.
Reference context (do not depict literally, only mood): "${safeContext.replace(/"/g, "'")}".`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        prompt,
        size: "1024x1024",
        n: 1,
      }),
    });

    if (!r.ok) {
      const txt = await r.text();
      if (r.status === 429) return new Response(JSON.stringify({ error: "요청이 많아요. 잠시 후 다시 시도해주세요." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (r.status === 402) return new Response(JSON.stringify({ error: "AI 크레딧이 부족합니다." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`image gen ${r.status}: ${txt}`);
    }
    const data = await r.json();
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) throw new Error("이미지 데이터를 받지 못했어요");
    return new Response(JSON.stringify({ image: `data:image/png;base64,${b64}` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("card-news-bg-image error", e);
    return new Response(JSON.stringify({ error: e?.message ?? "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
