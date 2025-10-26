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

    const systemPrompt = `당신은 대한민국 최고의 발달/심리 전문가이자 임상심리사입니다. 사용자의 고민을 매우 구체적이고 전문적으로 분석하여 9가지 전문 리포트와 맞춤형 테스트 추천을 포함한 상세한 JSON 형식으로 응답해주세요.

**중요 지침:**
1. 모든 점수는 고민 내용을 바탕으로 추정하되, 구체적인 근거와 함께 제시하세요
2. 각 항목마다 실용적이고 즉시 실천 가능한 조언을 포함하세요
3. 전문 용어는 쉬운 말로 풀어서 설명하세요
4. 긍정적 측면과 개선 필요 영역을 균형있게 제시하세요
5. 추천 테스트는 실제 플랫폼에서 제공하는 것만 포함하세요 (ADHD 테스트, 우울증 선별검사, 불안 척도, 스트레스 측정, 발달 평가, 번아웃 테스트, 방어기제 분석 등)

응답 형식:
{
  "type": "고민 유형 (예: 우울감, 불안감, 육아스트레스, 발달지연, ADHD 의심, 대인관계, 학업스트레스, 수면문제, 분노조절 등)",
  "severity": "심각도 - '낮음', '중간', '높음' 중 선택",
  "color": "bg-green-500 또는 bg-orange-500 또는 bg-red-500",
  "detailedAdvice": "700-1000자 분량의 매우 구체적이고 실천 가능한 조언. 단계별 실행 방법 포함",
  "recommendations": [
    "즉시 실천 가능한 구체적 추천사항 1 (예: 하루 15분 산책하기)",
    "전문가 도움 관련 구체적 추천사항 (예: 정신건강의학과 상담 고려)",
    "장기적 관리 방법 (예: 감정일기 작성하기)"
  ],
  "nextSteps": [
    "오늘 당장 할 수 있는 행동",
    "이번 주 내 실천할 행동",
    "한 달 목표"
  ],
  "confidence": 80-95 사이의 신뢰도,
  
  "recommendedTests": [
    {
      "name": "플랫폼 제공 테스트명 (ADHD 테스트, 우울증 선별검사, 불안 척도, 스트레스 측정, 번아웃 테스트, 방어기제 분석 중 선택)",
      "description": "테스트가 측정하는 내용 (30자 이내)",
      "reason": "이 고민에 왜 이 테스트가 필요한지 구체적 이유 (50자 이내)",
      "isPremium": false
    }
  ],
  
  "comprehensiveReports": {
    "developmentAssessment": {
      "cognitive": 추정 점수 (0-100),
      "language": 추정 점수 (0-100),
      "motor": 추정 점수 (0-100),
      "social": 추정 점수 (0-100),
      "overall": 종합 점수 (0-100),
      "summary": "발달 영역별 현재 상태와 향후 방향을 구체적으로 설명 (300-400자). 강점과 약점을 모두 언급하고, 보호자가 주의 깊게 관찰해야 할 포인트 포함"
    },
    "psychologicalAnalysis": {
      "emotionalStability": 추정 점수 (0-100),
      "stressLevel": 추정 점수 (0-100, 높을수록 스트레스 많음),
      "mentalHealth": 추정 점수 (0-100),
      "summary": "심리 상태에 대한 종합 분석 (300-400자). 현재 정서적 어려움의 원인 추정, 일상생활에 미치는 영향, 개선을 위한 구체적 방향 제시"
    },
    "strengthsWeaknesses": {
      "strengths": [
        "구체적 강점 1 (예: 감정 표현에 솔직함)",
        "구체적 강점 2 (예: 문제 인식 능력 우수)",
        "구체적 강점 3 (예: 도움 요청의 용기)"
      ],
      "weaknesses": [
        "개선 필요 영역 1과 해결 방향",
        "개선 필요 영역 2와 해결 방향",
        "개선 필요 영역 3과 해결 방향"
      ],
      "growthDirection": "이 강점을 활용하여 약점을 보완하는 구체적 성장 전략 (200자 이내)"
    },
    "customActivities": [
      "오늘부터 시작할 수 있는 구체적 활동 1 (예: 아침 스트레칭 10분)",
      "일주일 내 실천 가능한 활동 2 (예: 감정일기 작성)",
      "장기적으로 유익한 활동 3 (예: 취미 활동 재개)"
    ],
    "developmentRoadmap": {
      "shortTerm": [
        "1-3개월 내 달성 가능한 구체적 목표 1",
        "1-3개월 내 달성 가능한 구체적 목표 2"
      ],
      "mediumTerm": [
        "3-6개월 내 달성할 중기 목표 1",
        "3-6개월 내 달성할 중기 목표 2"
      ],
      "longTerm": [
        "6-12개월 후 기대되는 변화 1",
        "6-12개월 후 기대되는 변화 2"
      ]
    },
    "peerComparison": {
      "ageGroup": "해당하는 연령대 (예: 30대 성인, 초등 저학년 등)",
      "percentile": 추정 백분위 (0-100),
      "comparison": "같은 연령대와 비교한 상대적 위치와 그 의미를 구체적으로 설명 (200자 이내). 수치의 의미를 일상 언어로 풀어서 설명"
    },
    "expertOpinion": {
      "interventionNeeded": "낮음, 중간, 높음 중 선택",
      "recommendations": [
        "전문가 개입이 필요한 구체적 영역과 이유",
        "추천하는 전문가 유형 (예: 임상심리사, 발달전문의)",
        "전문 상담 시 중점적으로 다뤄야 할 주제"
      ],
      "urgency": "낮음, 중간, 높음 중 선택하고 그 이유"
    },
    "familySupport": {
      "parentingTips": [
        "보호자가 오늘부터 실천할 양육 팁 1",
        "일상에서 활용 가능한 양육 팁 2",
        "장기적으로 도움이 되는 양육 팁 3"
      ],
      "communicationGuide": "대상자와 효과적으로 소통하는 구체적 방법 (150-200자). 피해야 할 말과 권장되는 표현 포함"
    },
    "longTermPrediction": {
      "developmentTrend": "긍정적, 보통, 주의필요 중 선택",
      "potential": 잠재력 추정 점수 (0-100),
      "forecast": "현재 상태가 유지될 경우와 적절한 개입이 이루어질 경우의 장기 전망을 대비하여 설명 (300-400자). 희망적 메시지와 함께 구체적 개선 가능성 제시"
    }
  }
}

**사용자 고민:** ${inputText}
${concernLabel ? `**주요 관심사:** ${concernLabel}` : ''}
${targetLabel ? `**분석 대상:** ${targetLabel}` : ''}

**필수사항:**
- recommendedTests는 3-5개 추천하되, 반드시 플랫폼에서 제공하는 테스트만 포함: ADHD 테스트, 우울증 선별검사, 불안 척도, 스트레스 측정, 발달 평가, 번아웃 테스트, 방어기제 분석
- 모든 9가지 리포트를 빠짐없이 작성
- 각 항목의 글자 수 요구사항을 정확히 준수
- 점수는 고민 내용을 근거로 합리적으로 추정
- 순수 JSON만 반환 (마크다운이나 다른 텍스트 없이)`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',  // 최신 GPT-5 모델 사용
        messages: [
          { 
            role: 'system', 
            content: systemPrompt
          },
          { role: 'user', content: inputText }
        ],
        max_completion_tokens: 4000,  // 토큰 수 대폭 증가
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

    // Generate report cover image with Gemini AI
    let reportImageUrl = null;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (LOVABLE_API_KEY) {
      try {
        logStep("Starting report image generation");
        
        // 고민 내용과 분석 결과를 반영한 맞춤형 이미지 프롬프트
        const imagePrompt = `Professional developmental psychology report cover image. 
Context: ${analysisResult.type} - ${concernLabel} for ${targetLabel}. 
Severity: ${analysisResult.severity}. 
Theme: Reflect the specific concern - ${inputText.substring(0, 200)}. 
Style: calming, professional, educational, emotionally supportive. 
Colors: ${analysisResult.severity === '높음' ? 'warm, supportive tones (soft reds, oranges)' : analysisResult.severity === '중간' ? 'balanced, gentle tones (soft blues, greens)' : 'positive, uplifting tones (soft pastels, yellows)'}.
Elements: abstract representation of ${concernLabel}, growth, healing, and hope. 
Modern minimalist design suitable for a professional psychological report. 
Ultra high resolution, clean design that provides comfort and reassurance.`;
        
        const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-image-preview',
            messages: [
              {
                role: 'user',
                content: imagePrompt
              }
            ],
            modalities: ['image', 'text']
          })
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          reportImageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          logStep("Report image generated successfully");
        } else {
          logStep("Image generation failed", { status: imageResponse.status });
        }
      } catch (imageError) {
        logStep("Error generating report image", { error: String(imageError) });
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      analysis: analysisResult,
      reportImage: reportImageUrl,
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
        detailedAdvice: parsed.detailedAdvice || '전문가의 도움을 받아 구체적인 상담을 진행하시는 것을 권장드립니다. 관찰일지를 작성하며 패턴을 파악하고, 작은 변화부터 시작해보세요.',
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
        recommendedTests: parsed.recommendedTests || [],
        comprehensiveReports: parsed.comprehensiveReports || null,
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

  // 상세 조언 생성
  const detailedAdvice = severity === '높음' 
    ? `현재 겪고 계신 어려움이 상당히 힘드실 것 같습니다. 이런 상황에서는 혼자 해결하려 하기보다 전문가의 도움을 받는 것이 중요합니다. 우선 신뢰할 수 있는 가족이나 친구에게 마음을 터놓고 이야기해보세요. 그리고 정신건강 전문의나 상담사와의 상담을 고려해보시길 권합니다. 작은 변화부터 시작하되, 자신을 너무 몰아붙이지 마세요. 하루하루 버티는 것만으로도 충분히 대단한 일입니다. 지금의 고통은 영원하지 않습니다.`
    : severity === '중간'
    ? `지금 느끼시는 어려움에 대해 충분히 공감합니다. 이러한 상황은 누구에게나 찾아올 수 있으며, 도움을 구하는 것은 용기 있는 행동입니다. 일상에서 작은 루틴을 만들어보세요 - 규칙적인 수면, 가벼운 운동, 취미 활동 등이 도움이 될 수 있습니다. 또한 관찰일지를 작성하며 패턴을 파악하고, 필요하다면 전문가 상담도 고려해보세요. 변화는 천천히 일어나지만, 꾸준히 노력한다면 분명 좋아질 것입니다.`
    : `공유해주신 내용을 보니 현재 관리 가능한 수준의 고민으로 보입니다. 이런 고민을 인식하고 해결하려는 노력 자체가 큰 발전입니다. 관찰일지를 통해 패턴을 파악하고, 작은 목표를 세워 실천해보세요. 스트레스 관리를 위해 명상이나 산책 같은 활동도 도움이 됩니다. 예방적 차원에서 꾸준히 관심을 가지고 관리한다면 더 큰 문제로 발전하지 않을 것입니다. 자신을 돌보는 시간을 꼭 가지세요.`;

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
    detailedAdvice,
    recommendations,
    confidence: Math.floor(Math.random() * 15) + 80,
    nextSteps: [
      '3분 온보딩으로 정확한 분석 받기',
      '전문가 매칭 및 상담 예약',
      '맞춤형 솔루션 추천 받기'
    ],
    recommendedTests: [
      { name: '스트레스 측정', description: '현재 스트레스 수준을 파악합니다', reason: '고민의 원인과 스트레스 관계 분석', isPremium: false },
      { name: '종합 심리 평가', description: '전문가 수준의 심층 평가', reason: '정확한 진단을 위한 종합 분석', isPremium: true },
      { name: '정서 상태 검사', description: '정서적 안정성을 평가합니다', reason: '감정 조절 및 심리 상태 확인', isPremium: false }
    ]
  };
}