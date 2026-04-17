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
    const { testData, observations } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // 검사 데이터 요약
    const testSummary = testData.map((test: any) => ({
      name: test.test_types?.name || '검사',
      date: test.completed_at,
      score: test.scores?.total_score || 0,
      categories: test.scores
    })).slice(0, 5);

    const obsSummary = observations.map((obs: any) => ({
      date: obs.created_at,
      score: obs.score_overall || 0,
      categories: obs.categoryScores || {}
    })).slice(0, 5);

    const systemPrompt = `당신은 아동 발달 및 심리 분석 전문가입니다. 제공된 검사 데이터를 바탕으로 객관적이고 구체적인 성격 분석을 제공합니다.`;

    const userPrompt = `다음은 수집된 검사 데이터입니다:

검사 결과: ${JSON.stringify(testSummary, null, 2)}
관찰 기록: ${JSON.stringify(obsSummary, null, 2)}

이 데이터를 종합하여 성격 분석을 제공해주세요.`;

    console.log("Calling Lovable AI with structured data");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_personality",
              description: "성격 분석 결과를 구조화된 형태로 반환",
              parameters: {
                type: "object",
                properties: {
                  personalityType: { 
                    type: "string",
                    description: "주요 성격 유형 (예: 외향적-분석형, 내향적-창의형 등)" 
                  },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "주요 강점 3가지"
                  },
                  weaknesses: {
                    type: "array",
                    items: { type: "string" },
                    description: "개선이 필요한 영역 3가지"
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" },
                    description: "발전 방향 및 추천사항 3가지"
                  },
                  categories: {
                    type: "object",
                    properties: {
                      "정서": { type: "number", description: "0-100 사이의 점수" },
                      "인지": { type: "number", description: "0-100 사이의 점수" },
                      "사회성": { type: "number", description: "0-100 사이의 점수" },
                      "신체": { type: "number", description: "0-100 사이의 점수" },
                      "행동": { type: "number", description: "0-100 사이의 점수" }
                    },
                    description: "각 카테고리별 종합 평가 점수"
                  },
                  summary: { 
                    type: "string",
                    description: "전체 분석을 요약한 2-3문장" 
                  }
                },
                required: ["personalityType", "strengths", "weaknesses", "recommendations", "categories", "summary"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_personality" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI 크레딧이 부족합니다. 워크스페이스에 크레딧을 추가해주세요." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const result = await response.json();
    console.log("AI Response:", JSON.stringify(result, null, 2));

    // Tool call 결과 추출
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("AI 응답 형식이 올바르지 않습니다.");
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    console.log("AI analysis generated successfully:", analysis);

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in personality-analysis:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "분석 중 오류가 발생했습니다." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
