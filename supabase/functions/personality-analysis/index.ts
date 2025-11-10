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

    // 데이터 요약 생성
    const testSummary = testData.map((test: any) => 
      `${test.test_types?.name || '검사'}: ${test.scores?.total_score || 0}점`
    ).join(', ');

    const obsSummary = observations.map((obs: any) => {
      const categories = Object.entries(obs.categoryScores || {})
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      return `전체 점수: ${obs.score_overall?.toFixed(1) || 0}점 (${categories})`;
    }).join(' | ');

    const prompt = `당신은 아동 발달 전문가입니다. 다음 검사 데이터를 분석하여 성격 및 발달 특성을 객관적으로 분석해주세요.

검사 결과: ${testSummary || '데이터 없음'}
관찰 데이터: ${obsSummary || '데이터 없음'}

다음 형식으로 분석해주세요:
1. 주요 강점 (2-3가지)
2. 개선 필요 영역 (2-3가지)
3. 발달 단계 평가
4. 맞춤형 추천사항

간결하고 전문적으로 작성하되, 부모가 이해하기 쉽게 설명해주세요.`;

    console.log("Calling Lovable AI with prompt:", prompt);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "당신은 아동 발달 전문가로서, 검사 데이터를 기반으로 객관적이고 전문적인 성격 분석을 제공합니다." },
          { role: "user", content: prompt }
        ],
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

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    console.log("AI analysis generated successfully");

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
