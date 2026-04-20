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
    const { totalScore, relationshipType, categoryScores, strengths, growthAreas } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `당신은 20년 경력의 임상심리전문가이자 관계 심리치료 전문가입니다.
관계 역동성 심층 분석 검사(35문항, 6개 영역) 결과를 기반으로 상세하고 전문적인 심리학적 해석을 제공합니다.

당신의 분석 스타일:
- 임상심리학적 관점에서 깊이 있는 해석 제공
- Bowlby 애착이론, Winnicott 대상관계이론, Bowen 가족체계이론, Gottman 관계 이론 등 다양한 심리학 이론 통합 분석
- 각 이론적 근거를 명시하여 분석의 학술적 깊이 확보
- Sternberg의 사랑의 삼각형 이론, Hendrix의 이마고 관계치료 관점 포함
- 공감적이면서도 전문적인 톤 유지
- 구체적이고 실천 가능한 조언 제시 (EFT, DBT, ACT 등 근거기반 치료 기법 활용)
- 한국 문화적 맥락을 고려한 해석 (유교적 관계 역동, 체면 문화, 정(情) 개념 등)
- **각 섹션 최소 5-7문장 이상**, 전체 3000자 이상의 깊이 있는 분석

응답은 반드시 한국어로 작성하고, 마크다운 형식을 사용하지 말고 일반 텍스트로 작성하세요.`;

    const categoryNames = {
      trust: '신뢰 형성',
      boundary: '경계 설정',
      expression: '감정 표현',
      conflict: '갈등 대처',
      support: '지지 제공',
      balance: '독립-의존 균형'
    };

    const categoryDescriptions = Object.entries(categoryScores)
      .map(([key, score]) => `- ${categoryNames[key] || key}: ${score}점`)
      .join('\n');

    const userPrompt = `다음 관계 역동성 심층 분석 검사 결과에 대해 임상심리전문가 수준의 상세 해석을 제공해주세요:

**검사 결과 개요:**
- 관계 건강도 종합 점수: ${totalScore}점 (100점 만점)
- 관계 유형: ${relationshipType}

**6개 영역별 점수:**
${categoryDescriptions}

**식별된 강점 영역:** ${strengths.join(', ')}
**성장 필요 영역:** ${growthAreas.join(', ')}

다음 형식으로 임상심리전문가 수준의 **깊이 있고 상세한** 해석을 제공해주세요 (전체 3000자 이상):

[종합심리분석]
전체적인 관계 패턴에 대한 깊이 있는 심리학적 분석 (8-10문장 이상). Bowlby의 애착이론에 기반한 애착 스타일 추론, 대인관계 역동의 무의식적 패턴, 핵심 감정 욕구(core emotional needs), 관계에서의 내적 작동 모델(Internal Working Model)을 분석해주세요. Gottman의 4가지 기수(비판, 경멸, 방어, 담쌓기)와의 관련성도 탐색해주세요.

[영역별심층해석]
6개 영역 각각에 대한 상세 분석 (각 영역 4-5문장 이상):
- 신뢰 형성: 초기 신뢰 구축 능력과 관계 발전 패턴. Erikson의 기본 신뢰 vs 불신 발달 과업과의 연관성. 신뢰 형성의 인지적·정서적 기제.
- 경계 설정: 자기 보호와 친밀감 사이의 균형. Winnicott의 참자기/거짓자기 개념과의 관련성. 건강한 경계의 유연성 평가.
- 감정 표현: 감정 인식 및 소통 능력. 정서 도식(emotion schema)과 알렉시타이미아(감정표현불능증) 경향성 평가.
- 갈등 대처: 갈등 상황에서의 대처 양식. Gottman의 관계 수리 시도(repair attempts) 능력 평가. Thomas-Kilmann 갈등 유형 분석.
- 지지 제공: 상호 돌봄 능력. 안전기지(secure base)와 안전피난처(safe haven) 기능 평가.
- 독립-의존 균형: 자율성과 친밀감의 조화. Mahler의 분리-개별화 이론 관점에서의 평가.

[심리역동분석]
내담자의 관계 패턴 뒤에 숨겨진 심리역동에 대한 깊이 있는 분석 (7-8문장 이상). 무의식적 관계 패턴(반복강박), 핵심 감정 욕구, 방어기제, 전이 패턴, 내적 대상관계를 탐색해주세요. Hendrix의 이마고(Imago) 이론 관점에서 관계 선택 패턴도 분석해주세요.

[강점기반성장전략]
강점 영역을 활용한 성장 전략 (5-6문장 이상). 이미 잘하고 있는 부분을 더욱 발전시키는 방법, 강점 전이(strength transfer) 전략, 긍정심리학적 관점의 관계 자산 활용법을 제안해주세요.

[성장영역개선방안]
성장 필요 영역에 대한 구체적 개선 방안 (6-7문장 이상). EFT(정서중심치료), DBT(변증법적행동치료), ACT(수용전념치료)의 구체적 기법을 활용한 단계별 접근 방법과 일상 실천 과제를 제시해주세요. 각 단계의 예상 소요 기간도 제안해주세요.

[관계향상실천가이드]
일상에서 바로 실천할 수 있는 구체적인 행동 가이드 (7가지 이상). 각 항목은 구체적이고 실행 가능해야 하며, 근거기반 치료 기법에서 도출된 것이어야 합니다. Gottman의 관계 강화 기법(사랑의 지도, 감사 표현, 꿈 속의 갈등 대화법 등)을 포함해주세요.

[전문가권고사항]
임상심리전문가로서의 종합적인 권고사항 (5-6문장 이상). 관계 패턴의 장기 예후(prognosis), 필요시 전문 상담/치료 추천(커플상담, 개인상담, EFT, 이마고 치료 등), 자기 돌봄과 관계 돌봄의 균형에 대한 조언을 포함해주세요.`;

    console.log("Calling Lovable AI for relationship dynamics analysis...");

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
      overallAnalysis: parseSection(analysisText, '종합심리분석'),
      categoryAnalysis: parseSection(analysisText, '영역별심층해석'),
      psychodynamicAnalysis: parseSection(analysisText, '심리역동분석'),
      strengthStrategy: parseSection(analysisText, '강점기반성장전략'),
      growthPlan: parseSection(analysisText, '성장영역개선방안'),
      practiceGuide: parseSection(analysisText, '관계향상실천가이드'),
      expertRecommendation: parseSection(analysisText, '전문가권고사항'),
      fullAnalysis: analysisText
    };

    console.log("Relationship dynamics analysis completed successfully");

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in relationship-dynamics-analyzer:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
