import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { observations } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // 데이터 통계 분석
    const categoryStats = new Map<string, number[]>();
    observations.forEach((obs: any) => {
      if (obs.categoryScores) {
        Object.entries(obs.categoryScores).forEach(([category, score]) => {
          if (!categoryStats.has(category)) {
            categoryStats.set(category, []);
          }
          categoryStats.get(category)!.push(score as number);
        });
      }
    });

    // 각 카테고리별 평균, 최대, 최소, 표준편차 계산
    const statsAnalysis = Array.from(categoryStats.entries()).map(([category, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const max = Math.max(...scores);
      const min = Math.min(...scores);
      const variance = scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length;
      const stdDev = Math.sqrt(variance);
      const trend = scores.length > 1 ? (scores[scores.length - 1] - scores[0]) : 0;
      
      return {
        category,
        average: avg.toFixed(1),
        max,
        min,
        stdDev: stdDev.toFixed(1),
        trend: trend > 0 ? '상승' : trend < 0 ? '하락' : '안정',
        consistency: stdDev < 10 ? '일관적' : stdDev < 20 ? '보통' : '변동적'
      };
    });

    // 분석 데이터를 구조화된 형태로 정리
    const dataAnalysis = {
      총검사수: observations.length,
      영역별통계: statsAnalysis,
      최고영역: statsAnalysis.reduce((max, curr) => 
        parseFloat(curr.average) > parseFloat(max.average) ? curr : max
      ),
      최저영역: statsAnalysis.reduce((min, curr) => 
        parseFloat(curr.average) < parseFloat(min.average) ? curr : min
      ),
      가장일관된영역: statsAnalysis.reduce((min, curr) => 
        parseFloat(curr.stdDev) < parseFloat(min.stdDev) ? curr : min
      )
    };

    const systemPrompt = `당신은 데이터 기반 심리 분석 전문가입니다. 통계 데이터를 바탕으로 객관적이고 정확한 성격 특성을 도출합니다.

분석 원칙:
1. 제공된 통계 수치(평균, 표준편차, 추세)를 근거로 분석
2. 점수 패턴의 일관성과 변동성을 고려
3. 영역 간 점수 차이로 강점과 약점 파악
4. 시간에 따른 변화 추세 반영
5. 데이터 기반의 객관적 표현 사용 (예: "정서 영역 평균 85점으로 상위권", "인지 영역 표준편차 5점으로 매우 일관적")`;

    const userPrompt = `다음은 ${dataAnalysis.총검사수}회의 검사 데이터 분석 결과입니다:

영역별 통계:
${dataAnalysis.영역별통계.map(stat => 
  `- ${stat.category}: 평균 ${stat.average}점, 최고 ${stat.max}점, 최저 ${stat.min}점, 표준편차 ${stat.stdDev}, 추세 ${stat.trend}, 일관성 ${stat.consistency}`
).join('\n')}

주요 특징:
- 가장 높은 영역: ${dataAnalysis.최고영역.category} (평균 ${dataAnalysis.최고영역.average}점)
- 가장 낮은 영역: ${dataAnalysis.최저영역.category} (평균 ${dataAnalysis.최저영역.average}점)
- 가장 일관된 영역: ${dataAnalysis.가장일관된영역.category} (표준편차 ${dataAnalysis.가장일관된영역.stdDev})

이 데이터를 바탕으로 사용자의 핵심 성격 특성 3-4가지를 통계적 근거와 함께 분석해주세요.`;

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
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_personality",
              description: "사용자의 성격 특성을 분석하여 반환합니다.",
              parameters: {
                type: "object",
                properties: {
                  traits: {
                    type: "array",
                    description: "핵심 성격 특성 3-4개",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "특성 이름 (예: 감정 표현이 풍부함)" },
                        description: { type: "string", description: "특성 설명 (20-30자)" },
                        score: { type: "number", description: "특성 강도 (0-100)" }
                      },
                      required: ["title", "description", "score"],
                      additionalProperties: false
                    }
                  },
                  summary: {
                    type: "string",
                    description: "전반적인 성격 요약 (50-80자)"
                  }
                },
                required: ["traits", "summary"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_personality" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No personality analysis returned");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-personality error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
