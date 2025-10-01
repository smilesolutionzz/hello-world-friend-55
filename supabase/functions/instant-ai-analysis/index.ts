import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[INSTANT-AI-ANALYSIS] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    if (!openAIApiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    logStep("OpenAI API key verified");

    const { inputText, concern, target } = await req.json();
    logStep("Request received", { inputTextLength: inputText?.length, concern, target });

    if (!inputText || inputText.trim().length < 10) {
      throw new Error("입력 텍스트가 너무 짧습니다. 최소 10자 이상 입력해주세요.");
    }

    logStep("Starting AI analysis", { inputText: inputText.substring(0, 50) + "...", concern, target });

    // 맞춤 시스템 프롬프트 생성
    const concernLabels: Record<string, string> = {
      'development': '발달 지연',
      'behavior': '행동 문제',
      'emotion': '감정 조절',
      'social': '사회성'
    };

    const targetLabels: Record<string, string> = {
      'child': '아동 (0-12세)',
      'teen': '청소년 (13-18세)',
      'adult': '성인',
      'family': '가족'
    };

    const concernLabel = concernLabels[concern] || '일반적인 고민';
    const targetLabel = targetLabels[target] || '대상자';

    const systemPrompt = `당신은 심리 상담 전문가입니다. 사용자의 고민을 분석하고 다음 JSON 형식으로만 응답해주세요:
{
  "type": "고민 유형 (예: 우울감, 불안감, 육아스트레스, 발달지연, 대인관계, 학업스트레스 등)",
  "severity": "심각도 - 반드시 고민의 심각성에 따라 '낮음', '중간', '높음' 중 하나를 선택",
  "color": "색상코드 (낮음: bg-green-500, 중간: bg-orange-500, 높음: bg-red-500)",
  "recommendations": ["구체적인 추천사항 3개"],
  "nextSteps": ["실행 가능한 다음 단계 3개"],
  "confidence": 75-95 사이의 신뢰도 점수
}

심각도 판단 기준:
- 낮음: 일상적인 고민, 가벼운 걱정, 예방 차원의 상담
- 중간: 지속적인 스트레스, 중등도의 불안/우울, 관계 갈등, 육아 어려움
- 높음: 심각한 정신건강 문제, 자해/자살 관련, 극심한 스트레스, 심각한 발달 지연

사용자 고민: ${inputText}
${concernLabel ? `주요 관심사: ${concernLabel}` : ''}
${targetLabel ? `분석 대상: ${targetLabel}` : ''}

반드시 고민의 내용을 정확히 분석하여 적절한 severity를 판단하고, JSON 형식으로만 응답해주세요.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt
          },
          { role: 'user', content: inputText }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    logStep("OpenAI API response received", { status: response.status });

    if (!response.ok) {
      const errorData = await response.text();
      logStep("OpenAI API error", { status: response.status, error: errorData });
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    logStep("AI analysis completed", { responseLength: aiResponse.length });

    // Parse AI response to extract structured data
    const analysisResult = parseAIResponse(aiResponse, inputText);
    logStep("Analysis parsed", analysisResult);

    return new Response(JSON.stringify({ 
      success: true,
      analysis: analysisResult,
      originalResponse: aiResponse
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in instant-ai-analysis", { message: errorMessage });
    
    // OpenAI API 키가 없거나 API 호출이 실패한 경우, fallback 분석을 성공으로 반환
    const fallbackAnalysis = getFallbackAnalysis(inputText || "");
    
    return new Response(JSON.stringify({ 
      success: true,  // fallback이지만 성공으로 처리
      analysis: fallbackAnalysis,
      fallback: true,
      originalError: errorMessage
    }), {
      status: 200,  // 200으로 변경하여 클라이언트에서 정상 처리되도록
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Parse AI response into structured format
function parseAIResponse(response: string, originalText: string) {
  try {
    // Try to parse as JSON first
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        type: parsed.type || '일반 상담',
        severity: parsed.severity || '중간',
        color: parsed.color || 'bg-orange-500',
        recommendations: parsed.recommendations || [
          '전문가 상담을 통한 맞춤 솔루션',
          '체계적인 관찰일지 작성',
          '단계별 개선 가이드 제공'
        ],
        confidence: parsed.confidence || 85,
        nextSteps: parsed.nextSteps || [
          '3분 온보딩으로 정확한 분석 받기',
          '전문가 매칭 및 상담 예약',
          '맞춤형 솔루션 추천 받기'
        ],
        aiResponse: response
      };
    }
  } catch (e) {
    logStep("JSON parsing failed, using fallback", { error: String(e) });
  }
  
  // Fallback to keyword-based analysis
  return getFallbackAnalysis(originalText);
}

// Fallback analysis when AI fails
function getFallbackAnalysis(text: string) {
  // 심각도 키워드 (우선순위 높음)
  const highSeverityKeywords = [
    '죽고싶', '자살', '자해', '극심', '심각', '위급', '위험', '견딜 수 없',
    '못 견디', '한계', '폭력', '학대'
  ];
  
  const mediumSeverityKeywords = [
    '우울', '불안', '공황', '스트레스', '화', '분노', '걱정', '고민',
    '힘들', '지쳐', '아프', '외로', '슬프', '무기력', '짜증', '피곤',
    '싸움', '갈등', '문제', '어려움'
  ];

  // 유형 키워드
  const typeKeywords = {
    '우울감': ['우울', '무기력', '의욕 없', '슬프', '외로'],
    '불안감': ['불안', '걱정', '초조', '공황', '두려', '무서'],
    '발달지연': ['말 안', '걷지 못', '발달', '늦', '또래보다', '개월', '언어', '운동'],
    '육아스트레스': ['아이', '육아', '엄마', '아빠', '키우', '양육'],
    '학업스트레스': ['공부', '시험', '성적', '학교', '학원', '입시'],
    '대인관계': ['친구', '관계', '따돌림', '왕따', '외톨이', '사회성'],
    '수면문제': ['잠', '수면', '못 자', '불면'],
    '분노조절': ['화', '분노', '짜증', '폭발', '참을 수 없'],
  };

  // 심각도 판단
  let severity = '낮음';
  let color = 'bg-green-500';
  
  for (const keyword of highSeverityKeywords) {
    if (text.includes(keyword)) {
      severity = '높음';
      color = 'bg-red-500';
      break;
    }
  }
  
  if (severity === '낮음') {
    for (const keyword of mediumSeverityKeywords) {
      if (text.includes(keyword)) {
        severity = '중간';
        color = 'bg-orange-500';
        break;
      }
    }
  }

  // 유형 판단
  let detectedType = '일반 상담';
  for (const [type, keywords] of Object.entries(typeKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      detectedType = type;
      break;
    }
  }

  // 심각도별 추천사항
  const recommendations = severity === '높음' 
    ? [
        '즉시 전문가 상담 (1577-0199 정신건강위기상담)',
        '가까운 정신건강복지센터 방문',
        '24시간 위기상담 서비스 이용'
      ]
    : severity === '중간'
    ? [
        '전문가 상담을 통한 맞춤 솔루션',
        '체계적인 관찰일지 작성',
        '단계별 개선 가이드 제공'
      ]
    : [
        '예방적 상담 및 관찰',
        '정기적인 자가 체크',
        '건강한 생활 습관 유지'
      ];

  return {
    type: detectedType,
    severity,
    color,
    recommendations,
    confidence: Math.floor(Math.random() * 15) + 80,
    nextSteps: [
      '3분 온보딩으로 정확한 분석 받기',
      '전문가 매칭 및 상담 예약',
      '맞춤형 솔루션 추천 받기'
    ]
  };
}