import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 카드뉴스 배경용 AI 이미지 생성.
// 입력: headline, body, style_key, center_type, mode ('sharp'|'soft'|'readable'), variations (1-3)
// 출력: { images: ["data:image/png;base64,..."], mode }
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const {
      headline = "",
      body = "",
      style_key = "ivory-serif",
      center_type = "",
      mode = "readable",
      variations = 3,
    } = await req.json();
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY missing");

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

    const modeHint: Record<string, string> = {
      sharp:
        "Crisp focused composition with clear shapes, higher contrast and saturation, vivid yet still tasteful. Keep ample empty negative space in the center.",
      soft:
        "Very soft, blurred, dreamy and quiet — low contrast, milky pastel washes, large empty negative space, almost out-of-focus.",
      readable:
        "Extremely low-contrast, washed-out, near-monochrome background with very large empty negative space across the entire image so large Korean text placed on top remains highly readable. Avoid busy patterns.",
    };
    const modeText = modeHint[mode] ?? modeHint["readable"];

    const safeContext = `${headline}\n${body}`.slice(0, 300);

    const prompt = `A calm, warm, abstract editorial background image for a social media card about a Korean ${center_type || "developmental / psychological care"} center.
Style mood: ${tone}.
Rendering mode: ${modeText}
Strict rules: no text, no letters, no logos, no people, no faces, no children, no medical equipment, no clinical or hospital imagery, no fear, no darkness, no blood, no needles.
Square 1:1. Suitable as a background under large Korean typography.
Reference context (mood only, do not depict literally): "${safeContext.replace(/"/g, "'")}".`;

    const n = Math.max(1, Math.min(3, Number(variations) || 3));

    // n>1을 한 번에 요청. 일부 모델/시점에서 n 미지원이면 실패할 수 있으므로 fallback.
    async function callN(count: number) {
      const r = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
        method: "POST",
        headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-image-2",
          prompt,
          size: "1024x1024",
          quality: "low",
          n: count,
        }),
      });
      if (!r.ok) {
        const txt = await r.text();
        const err: any = new Error(`image gen ${r.status}: ${txt}`);
        err.status = r.status;
        throw err;
      }
      const data = await r.json();
      const arr: string[] = (data?.data ?? [])
        .map((d: any) => d?.b64_json)
        .filter(Boolean)
        .map((b: string) => `data:image/png;base64,${b}`);
      return arr;
    }

    let images: string[] = [];
    try {
      images = await callN(n);
    } catch (e: any) {
      if (e?.status === 429)
        return new Response(JSON.stringify({ error: "요청이 많아요. 잠시 후 다시 시도해주세요." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (e?.status === 402)
        return new Response(JSON.stringify({ error: "AI 크레딧이 부족합니다." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw e;
    }

    // n 미지원/부분 실패 시 부족분을 1장씩 병렬 호출로 보충
    if (images.length < n) {
      const need = n - images.length;
      const more = await Promise.allSettled(Array.from({ length: need }, () => callN(1)));
      for (const m of more) {
        if (m.status === "fulfilled") images.push(...m.value);
      }
    }

    if (images.length === 0) throw new Error("이미지 데이터를 받지 못했어요");

    return new Response(JSON.stringify({ images, mode }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("card-news-bg-image error", e);
    return new Response(JSON.stringify({ error: e?.message ?? "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
