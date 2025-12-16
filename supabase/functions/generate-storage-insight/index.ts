import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { concerns, assessments } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `당신은 사용자의 심리 건강 데이터를 분석하는 전문 AI입니다.
사용자의 고민 기록과 검사 결과를 분석하여 유용한 인사이트를 제공합니다.

응답은 반드시 다음 JSON 형식으로 반환하세요:
{
  "summary": "전반적인 상태 요약 (2-3문장)",
  "trend": "improving" | "stable" | "declining",
  "keyInsights": ["인사이트1", "인사이트2", "인사이트3"],
  "recommendations": ["권장사항1", "권장사항2"]
}

분석 시 다음 사항을 고려하세요:
- 심각도 변화 추이
- 주요 고민 유형 패턴
- 검사 점수 변화
- 개선이 필요한 영역
- 긍정적인 변화 강조`;

    const userPrompt = `다음 데이터를 분석해주세요:

최근 고민 기록 (${concerns.length}개):
${JSON.stringify(concerns, null, 2)}

최근 검사 결과 (${assessments.length}개):
${JSON.stringify(assessments, null, 2)}

위 데이터를 바탕으로 사용자의 심리 건강 상태에 대한 인사이트를 제공해주세요.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // JSON 파싱 시도
    let parsedInsight;
    try {
      // JSON 블록 추출
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedInsight = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      // 기본 응답 반환
      parsedInsight = {
        summary: "데이터 분석이 완료되었습니다. 정기적인 기록을 통해 변화를 추적하세요.",
        trend: "stable",
        keyInsights: [
          `총 ${concerns.length}개의 고민과 ${assessments.length}개의 검사 기록이 있습니다`,
          "꾸준한 기록이 자기 이해에 도움이 됩니다"
        ],
        recommendations: [
          "정기적으로 고민을 기록해보세요",
          "2주마다 검사를 통해 변화를 확인하세요"
        ]
      };
    }

    return new Response(JSON.stringify(parsedInsight), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
