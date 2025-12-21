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
    const { totalScore, energyType, peakTime, recoveryStyle, burnoutRisk, answers } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const maxScore = 32;
    const percentage = Math.round((totalScore / maxScore) * 100);

    const systemPrompt = `당신은 에너지 관리와 번아웃 예방 전문 심리상담사입니다. 
일상 에너지 흐름 검사 결과를 기반으로 상세하고 공감적인 해석을 제공합니다.
응답은 반드시 한국어로 작성하고, 따뜻하고 전문적인 톤을 유지하세요.
마크다운 형식을 사용하지 말고 일반 텍스트로 작성하세요.`;

    const userPrompt = `다음 에너지 흐름 검사 결과를 분석해주세요:

**검사 결과:**
- 에너지 건강도: ${totalScore}/${maxScore} (${percentage}점)
- 에너지 유형: ${energyType}
- 최적 활동 시간대: ${peakTime}
- 회복 스타일: ${recoveryStyle}
- 번아웃 위험도: ${burnoutRisk}

다음 형식으로 상세한 해석을 제공해주세요:

1. **종합 해석** (3-4문장): 이 사람의 에너지 패턴에 대한 전체적인 분석과 현재 상태에 대한 공감적 설명

2. **에너지 유형 심층 분석** (3-4문장): "${energyType}" 유형의 특성, 강점, 주의할 점 상세 설명

3. **시간대별 에너지 관리 전략** (2-3문장): ${peakTime}에 맞춘 구체적인 하루 스케줄 조언

4. **회복력 강화 방법** (2-3문장): ${recoveryStyle} 스타일에 맞는 구체적인 에너지 충전 방법

5. **번아웃 예방 가이드** (2-3문장): 현재 ${burnoutRisk} 위험도를 고려한 맞춤형 예방 전략

6. **주간 에너지 관리 플랜** (구체적인 3가지 실천 사항): 당장 실행할 수 있는 구체적인 행동 제안

각 섹션을 [종합해석], [에너지유형분석], [시간대관리], [회복력강화], [번아웃예방], [주간플랜] 태그로 구분해서 작성해주세요.`;

    console.log("Calling Lovable AI for energy flow analysis...");

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
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
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
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    // Parse the analysis into sections
    const parseSection = (text: string, tag: string): string => {
      const regex = new RegExp(`\\[${tag}\\]([\\s\\S]*?)(?=\\[|$)`, 'i');
      const match = text.match(regex);
      return match ? match[1].trim() : '';
    };

    const analysis = {
      summary: parseSection(analysisText, '종합해석'),
      energyTypeAnalysis: parseSection(analysisText, '에너지유형분석'),
      timeManagement: parseSection(analysisText, '시간대관리'),
      recoveryEnhancement: parseSection(analysisText, '회복력강화'),
      burnoutPrevention: parseSection(analysisText, '번아웃예방'),
      weeklyPlan: parseSection(analysisText, '주간플랜'),
      fullAnalysis: analysisText
    };

    console.log("Energy flow analysis completed successfully");

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in energy-flow-analyzer:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
