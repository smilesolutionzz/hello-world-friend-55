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
    const { answers, ageGroup, childAge } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('Analyzing parent-child play assessment:', { ageGroup, childAge });

    // AI 분석을 위한 프롬프트 생성
    const prompt = `당신은 아동 발달 및 놀이치료 전문가입니다. 다음 부모-아동 놀이평가 결과를 분석하고 개인화된 피드백을 제공해주세요.

평가 정보:
- 아동 연령대: ${ageGroup}
- 아동 나이: ${childAge}세
- 부모의 답변 패턴: ${JSON.stringify(answers)}

다음 형식으로 분석을 제공해주세요:

1. 놀이 스타일 진단 (50자 이내)
2. 강점 3가지 (각 30자 이내)
3. 개선 제안 3가지 (각 50자 이내)
4. 이 나이대 아이를 위한 맞춤 놀이 활동 3가지 (각 60자 이내)
5. 부모-자녀 관계 개선을 위한 구체적 행동 지침 3가지 (각 60자 이내)

따뜻하고 격려하는 톤으로 작성하되, 구체적이고 실천 가능한 조언을 주세요.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { 
            role: "system", 
            content: "당신은 아동발달 및 놀이치료 전문가입니다. 부모와 아이의 놀이 상호작용을 분석하고 따뜻하면서도 전문적인 조언을 제공합니다." 
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "크레딧이 부족합니다. 워크스페이스에 크레딧을 추가해주세요." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI 분석 요청 실패");
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    if (!analysis) {
      throw new Error("AI 분석 결과를 받을 수 없습니다");
    }

    console.log('AI analysis completed successfully');

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-play-assessment:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "분석 중 오류 발생" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
