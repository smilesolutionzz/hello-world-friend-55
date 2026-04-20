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
    const { totalScore, purposeType, clarityLevel, categoryScores, recommendations } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `당신은 20년 경력의 임상심리전문가이자 실존주의 심리치료 전문가입니다.
삶의 의미 및 목적 탐색 검사(40문항, 4개 영역) 결과를 기반으로 상세하고 전문적인 심리학적 해석을 제공합니다.

당신의 분석 스타일:
- 실존주의 심리학(빅터 프랭클의 의미치료, 어빈 얄롬의 실존치료) 관점에서 깊이 있는 해석
- 긍정심리학적 관점(마틴 셀리그만의 PERMA 모델 등) 통합
- 동양 철학과 한국 문화적 맥락을 고려한 해석
- 공감적이면서도 통찰력 있는 전문적 톤 유지
- 구체적이고 실천 가능한 성찰 과제 제시

응답은 반드시 한국어로 작성하고, 마크다운 형식을 사용하지 말고 일반 텍스트로 작성하세요.`;

    const categoryNames = {
      fulfillment: '실존적 충만감',
      values: '가치 명확성',
      goals: '목표 일관성',
      awareness: '자기 인식'
    };

    const categoryDescriptions = Object.entries(categoryScores)
      .map(([key, score]) => `- ${categoryNames[key] || key}: ${score}점`)
      .join('\n');

    const userPrompt = `다음 삶의 의미 및 목적 탐색 검사 결과에 대해 임상심리전문가 수준의 상세 해석을 제공해주세요:

**검사 결과 개요:**
- 삶의 의미 명확성 종합 점수: ${totalScore}점 (100점 만점)
- 목적 유형: ${purposeType}
- 방향 명확성 수준: ${clarityLevel}

**4개 영역별 점수:**
${categoryDescriptions}

**맞춤 성찰 가이드:** ${recommendations.join(' / ')}

다음 형식으로 임상심리전문가 수준의 상세한 해석을 제공해주세요:

[실존적의미분석]
빅터 프랭클의 의미치료와 실존주의 심리학 관점에서 내담자의 삶의 의미 추구 패턴에 대한 깊이 있는 분석 (6-7문장). 의미 발견의 세 가지 경로(창조적 가치, 경험적 가치, 태도적 가치) 측면에서 분석해주세요.

[영역별심층해석]
4개 영역 각각에 대한 상세 분석 (각 영역 3-4문장):
- 실존적 충만감: 일상에서 느끼는 의미와 만족감 수준 및 그 원천
- 가치 명확성: 핵심 가치관의 명료함과 삶에서의 일관된 적용
- 목표 일관성: 단기/장기 목표 설정 능력과 지속적 추진력
- 자기 인식: 자신에 대한 이해 깊이와 성찰 능력

[심리역동분석]
내담자의 의미 추구 패턴 뒤에 숨겨진 심리역동에 대한 분석 (5-6문장). 무의식적 동기, 핵심 욕구, 실존적 두려움과 그에 대한 대처 방식 등을 탐색해주세요.

[강점및잠재력분석]
내담자가 가진 고유한 강점과 성장 잠재력에 대한 분석 (4-5문장). 이미 발휘되고 있는 강점과 아직 개발되지 않은 잠재력을 구분하여 설명해주세요.

[성장방향제안]
더 충만한 삶을 위한 성장 방향 제안 (5-6문장). 단계별 접근 방법과 구체적인 성찰 과제를 제시해주세요.

[일상실천가이드]
일상에서 삶의 의미를 강화할 수 있는 구체적인 실천 가이드 (6가지 이상). 각 항목은 구체적이고 실행 가능해야 합니다.

[깊은성찰질문]
내담자의 성장을 돕기 위한 깊은 성찰 질문 5가지. 실존적 통찰을 이끌어낼 수 있는 질문으로 구성해주세요.

[전문가종합소견]
임상심리전문가로서의 종합적인 소견 (4-5문장). 내담자의 현재 상태에 대한 전문적 평가와 앞으로의 방향에 대한 권고를 포함해주세요.`;

    console.log("Calling Lovable AI for life purpose analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
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
      existentialAnalysis: parseSection(analysisText, '실존적의미분석'),
      categoryAnalysis: parseSection(analysisText, '영역별심층해석'),
      psychodynamicAnalysis: parseSection(analysisText, '심리역동분석'),
      strengthsAnalysis: parseSection(analysisText, '강점및잠재력분석'),
      growthDirection: parseSection(analysisText, '성장방향제안'),
      practiceGuide: parseSection(analysisText, '일상실천가이드'),
      reflectionQuestions: parseSection(analysisText, '깊은성찰질문'),
      expertOpinion: parseSection(analysisText, '전문가종합소견'),
      fullAnalysis: analysisText
    };

    console.log("Life purpose analysis completed successfully");

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in life-purpose-analyzer:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
