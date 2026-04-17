import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assessmentType, results, categoryScores } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let prompt = "";
    
    if (assessmentType === 'challenging-behavior') {
      prompt = `당신은 발달장애 및 행동치료 전문가입니다. 다음 도전행동 평가 결과를 분석하여 전문가 관점의 해석을 제공해주세요.

평가 결과:
- 총점: ${results.total}점 (최대 45점)
- 평균: ${results.average.toFixed(2)}점
- 심각도: ${results.severity}

카테고리별 점수:
${Object.entries(categoryScores).map(([category, score]) => `- ${category}: ${score}점`).join('\n')}

다음 내용을 포함하여 300-400자 정도로 전문가 해석을 작성해주세요:
1. 현재 도전행동의 전반적인 수준 평가
2. 가장 관심을 가져야 할 행동 영역
3. 행동의 기능과 원인에 대한 추정
4. 구체적인 조기 개입의 중요성
5. 보호자가 가정에서 시작할 수 있는 즉각적인 전략

친근하고 희망적인 톤으로 작성하되, 전문적인 용어도 적절히 사용해주세요.`;
    } else if (assessmentType === 'adaptive-behavior') {
      prompt = `당신은 발달장애 및 적응행동 전문가입니다. 다음 적응행동 평가 결과를 분석하여 전문가 관점의 해석을 제공해주세요.

평가 결과:
- 총점: ${results.total}점 (최대 54점)
- 평균: ${results.average.toFixed(2)}점
- 수준: ${results.level}

카테고리별 점수:
${Object.entries(categoryScores).map(([category, score]) => `- ${category}: ${score}점`).join('\n')}

다음 내용을 포함하여 300-400자 정도로 전문가 해석을 작성해주세요:
1. 현재 적응행동 수준에 대한 전반적인 평가
2. 강점 영역과 이를 활용하는 방법
3. 우선적으로 향상이 필요한 영역
4. 독립성 증진을 위한 구체적 전략
5. 일상생활에서 적용 가능한 실천 방안

희망적이고 격려하는 톤으로 작성하되, 현실적이고 실용적인 조언을 포함해주세요.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-preview",
        messages: [
          {
            role: "system",
            content: "당신은 발달장애와 행동치료 분야의 전문가입니다. 검사 결과를 분석하고 보호자에게 이해하기 쉽고 실천 가능한 전문적인 조언을 제공합니다."
          },
          {
            role: "user",
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API 오류:", response.status, errorText);
      throw new Error(`AI API 오류: ${response.status}`);
    }

    const data = await response.json();
    const interpretation = data.choices?.[0]?.message?.content;

    if (!interpretation) {
      throw new Error("AI 응답에서 해석을 찾을 수 없습니다");
    }

    return new Response(
      JSON.stringify({ interpretation }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );

  } catch (error) {
    console.error("오류:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다" 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
