import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

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

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not set");
    }
    logStep("Lovable API key verified");

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

**우리 플랫폼 보유 검사 목록:**
다음은 우리 플랫폼에서 제공하는 모든 검사 목록입니다. 추천 검사는 반드시 이 중에서만 선택하세요:
- adhd (testId: "adhd"): 주의집중력 자가체크 - ADHD 성향, 집중력 문제, 과잉행동 평가
- depression (testId: "depression"): 우울감 자가체크 - 우울증상, 기분 저하, 무기력 평가
- panic (testId: "panic"): 불안감 수준 확인 - 불안장애, 공황증상, 긴장 평가
- stress (testId: "stress"): 마음압박지수 측정 - 스트레스 수준, 심리적 압박, 번아웃 평가
- language (testId: "language"): 언어발달 자가체크 - 언어 발달 지연, 의사소통 문제 평가
- bigfive (testId: "bigfive"): 5차원 성격 분석 - 개방성, 성실성, 외향성, 친화성, 신경성 평가
- attachment (testId: "attachment"): 관계유형 진단 - 애착 유형, 대인관계 패턴, 친밀감 문제 평가
- career (testId: "career"): 진로흥미 탐색 - 직업 적성, 진로 방향, 흥미 분야 평가
- selfesteem (testId: "selfesteem"): 자아가치 측정 - 자존감, 자아존중감, 자기인식 평가
- developmental-delay (testId: "developmental-delay"): 발달지연 검사 - 전반적 발달 지연 평가
- sensory-integration (testId: "sensory-integration"): 감각통합장애 검사 - 감각처리 문제 평가
- learning-disability (testId: "learning-disability"): 학습장애 검사 - 학습 어려움, 학업 문제 평가
- social-development (testId: "social-development"): 사회성 발달 검사 - 사회성, 또래관계 평가
- challenging-behavior (testId: "challenging-behavior"): 도전행동 평가 - 문제행동, 공격성 평가
- adaptive-behavior (testId: "adaptive-behavior"): 적응행동 평가 - 일상생활 적응, 자립능력 평가

**중요 지침:**
1. 모든 점수는 고민 내용을 바탕으로 추정하되, 구체적인 근거와 함께 제시하세요
2. 각 항목마다 실용적이고 즉시 실천 가능한 조언을 포함하세요
3. 전문 용어는 쉬운 말로 풀어서 설명하세요
4. 긍정적 측면과 개선 필요 영역을 균형있게 제시하세요
5. **추천 검사는 반드시 위의 플랫폼 보유 검사 목록에서만 정확히 3개를 선택하세요**

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
      "testId": "검사 ID (위 플랫폼 보유 검사 목록의 testId 중 하나)",
      "name": "검사명",
      "reason": "이 검사를 추천하는 구체적인 이유 - 사용자의 고민 내용과 어떻게 연결되는지 설명 (100자 이내)",
      "expectedFindings": "이 검사를 통해 알 수 있는 예상 결과 및 도움이 되는 이유 (100자 이내)"
    },
    {
      "testId": "검사 ID",
      "name": "검사명",
      "reason": "추천 이유",
      "expectedFindings": "예상 결과"
    },
    {
      "testId": "검사 ID",
      "name": "검사명",
      "reason": "추천 이유",
      "expectedFindings": "예상 결과"
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
- recommendedTests는 반드시 정확히 3개만 추천하세요
- 각 추천 검사의 testId는 위의 플랫폼 보유 검사 목록에서 정확히 일치하는 것만 사용하세요 (예: "adhd", "depression", "stress" 등)
- 추천 검사는 사용자의 고민 내용과 가장 밀접하게 연관된 것을 선택하세요
- 모든 9가지 리포트를 빠짐없이 작성
- 각 항목의 글자 수 요구사항을 정확히 준수
- 점수는 고민 내용을 근거로 합리적으로 추정
- 순수 JSON만 반환 (마크다운이나 다른 텍스트 없이)`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt
          },
          { role: 'user', content: inputText }
        ],
      }),
    });

    logStep("Lovable AI response received", { status: response.status });

    if (!response.ok) {
      const errorData = await response.text();
      logStep("Lovable AI error", { status: response.status, error: errorData });
      
      if (response.status === 429) {
        throw new Error("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
      }
      if (response.status === 402) {
        throw new Error("AI 사용 한도를 초과했습니다. 잠시 후 다시 시도해주세요.");
      }
      throw new Error(`AI 분석 중 오류가 발생했습니다: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    logStep("AI analysis completed", { responseLength: aiResponse.length });

    // Parse AI response to extract structured data
    const analysisResult = parseAIResponse(aiResponse, inputText);
    logStep("Analysis parsed", analysisResult);

    // Generate multiple report images with Gemini AI
    const reportImages: string[] = [];
    
    if (lovableApiKey) {
      try {
        logStep("Starting multiple report images generation");
        
        // 3가지 다른 테마의 고품질 이미지 생성
        const imagePrompts = [
          {
            name: 'cover',
            prompt: `Create a premium, ultra-detailed professional psychological analysis report cover image in modern Korean healthcare design style.

PRIMARY THEME: ${analysisResult.type} - ${concernLabel}
EMOTIONAL TONE: ${analysisResult.severity === '높음' ? 'Warm, deeply caring, supportive and comforting' : analysisResult.severity === '중간' ? 'Balanced, hopeful, gentle and reassuring' : 'Positive, encouraging, bright and uplifting'}

VISUAL STYLE:
- Ultra-modern Korean healthcare aesthetic
- Sophisticated minimalist design with depth
- Premium professional quality with warmth
- Clean, elegant, approachable
- Maximum detail and clarity

COLOR PALETTE:
- Primary: Sophisticated ${analysisResult.severity === '높음' ? 'coral (#FF6B6B), warm peach (#FFD93D), soft rose gold' : analysisResult.severity === '중간' ? 'teal (#06BCC1), mint (#00D9FF), seafoam green' : 'sky blue (#5E8FFF), lavender (#B794F6), light periwinkle'}
- Accents: Subtle metallic highlights, smooth gradients
- Background: Clean white with subtle textured overlay

DESIGN ELEMENTS:
- Elegant Korean-inspired geometric patterns
- Sophisticated gradient overlays with depth
- Abstract symbolic representation of ${concernLabel}
- Visual metaphor for healing journey and growth
- Premium typography space (text-free)
- Professional report aesthetic

QUALITY REQUIREMENTS:
- 4K ultra high resolution
- Perfect composition and balance
- Sharp, crisp details throughout
- Professional print-ready quality
- Evokes immediate trust, hope, and competence`
          },
          {
            name: 'emotion',
            prompt: `Design a premium emotional wellness illustration representing ${concernLabel} in sophisticated therapeutic art style.

CONTEXT: ${inputText.substring(0, 150)}

ARTISTIC STYLE:
- Premium digital watercolor with crisp details
- Korean emotional design aesthetic elevated
- Therapeutic art meets contemporary illustration
- Ultra-detailed, museum-quality finish

EMOTIONAL MOOD:
- Deeply empathetic and understanding
- Healing-focused with professional warmth
- Gentle strength and resilience
- Hope and transformation

VISUAL COMPOSITION:
- Abstract yet meaningful representation of emotions
- Journey from struggle to healing depicted visually
- Supportive, nurturing atmosphere
- Layered symbolic elements with depth
- Sophisticated use of negative space

COLOR SCHEME:
- Rich ${analysisResult.severity === '높음' ? 'warm sunset palette: coral, gold, warm amber, soft pink' : analysisResult.severity === '중간' ? 'ocean breeze palette: teal, turquoise, seafoam, soft blue' : 'spring garden palette: lavender, mint, soft yellow, light pink'}
- Harmonious gradients with depth
- Subtle texture overlays
- Professional color harmony

QUALITY & DETAIL:
- Ultra high resolution 4K
- Every element sharply defined
- Professional psychological report standard
- Print-ready premium quality
- Captures subtle emotional nuances`
          },
          {
            name: 'growth',
            prompt: `Create a premium personal growth and development visualization for ${targetLabel} with sophisticated infographic-inspired design.

THEME: ${concernLabel} - Clear path to improvement and wellness

DESIGN APPROACH:
- Modern Korean infographic aesthetic
- Inspirational yet deeply professional
- Data visualization meets emotional design
- Ultra-detailed, premium finish

VISUAL CONCEPT:
- Clear growth trajectory with symbolic elements
- Upward movement and positive transformation
- Progress milestones elegantly visualized
- Before/after journey subtly implied
- Empowering visual narrative

COLOR DYNAMICS:
- Premium gradient: ${analysisResult.severity === '높음' ? 'Deep coral (#FF5E5E) flowing to bright gold (#FFD700)' : analysisResult.severity === '중간' ? 'Rich teal (#00B8B8) transitioning to emerald (#00D084)' : 'Soft lavender (#B794F6) evolving to bright yellow (#FFE66D)'}
- Smooth, sophisticated color transitions
- Metallic accent highlights
- Clean, modern palette

DESIGN ELEMENTS:
- Abstract geometric shapes suggesting progress
- Korean minimalist aesthetic with precision
- Hopeful, forward-moving composition
- Symbolic imagery of growth and change
- Professional chart/graph inspired elements
- Clean, text-free design

PREMIUM QUALITY:
- Ultra high resolution 4K
- Crisp, sharp vector-quality details
- Professional report cover standard
- Print-ready premium finish
- Inspirational yet scientifically credible`
          }
        ];
        
        // 병렬로 고품질 이미지 생성 (최신 Gemini 3 Pro Image 모델 사용)
        const imagePromises = imagePrompts.map(async ({ prompt }) => {
          try {
            logStep("Generating high-quality image with Gemini 3 Pro Image", { promptLength: prompt.length });
            const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${lovableApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
            model: 'google/gemini-3-pro-image-preview',
                messages: [{ 
                  role: 'user', 
                  content: prompt
                }],
                modalities: ['image', 'text']
              })
            });

            if (imageResponse.ok) {
              const imageData = await imageResponse.json();
              const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
              return imageUrl || null;
            }
            return null;
          } catch (err) {
            logStep("Individual image generation error", { error: String(err) });
            return null;
          }
        });
        
        const generatedImages = await Promise.all(imagePromises);
        reportImages.push(...generatedImages.filter(img => img !== null));
        logStep("Report images generated", { count: reportImages.length });
        
      } catch (imageError) {
        logStep("Error in batch image generation", { error: String(imageError) });
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      analysis: analysisResult,
      reportImages: reportImages.length > 0 ? reportImages : null,
      reportImage: reportImages.length > 0 ? reportImages[0] : null, // 호환성을 위해 첫 이미지
      tableOfContents: generateTableOfContents(analysisResult),
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
      tableOfContents: null,
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
      { 
        testId: 'stress',
        name: '스트레스 측정', 
        reason: '고민의 원인과 스트레스 관계 분석', 
        expectedFindings: '현재 스트레스 수준과 주요 원인을 파악할 수 있습니다'
      },
      { 
        testId: 'depression',
        name: '우울감 자가체크', 
        reason: '정서적 어려움의 정도를 객관적으로 평가', 
        expectedFindings: '우울 증상의 심각도와 개선이 필요한 영역을 확인할 수 있습니다'
      },
      { 
        testId: 'panic',
        name: '불안감 수준 확인', 
        reason: '불안 및 긴장 수준 파악', 
        expectedFindings: '불안장애 위험도와 대처 방법을 알 수 있습니다'
      }
    ],
    comprehensiveReports: {
      developmentAssessment: {
        cognitive: severity === '높음' ? 45 : severity === '중간' ? 65 : 75,
        language: severity === '높음' ? 50 : severity === '중간' ? 70 : 80,
        motor: severity === '높음' ? 55 : severity === '중간' ? 72 : 82,
        social: severity === '높음' ? 40 : severity === '중간' ? 60 : 78,
        overall: severity === '높음' ? 48 : severity === '중간' ? 67 : 79,
        summary: `현재 ${detectedType} 관련하여 ${severity === '높음' ? '전문가 개입이 필요한 수준' : severity === '중간' ? '관찰과 관리가 필요한 수준' : '안정적인 수준'}으로 평가됩니다. 지속적인 관심과 적절한 지원을 통해 긍정적인 변화를 기대할 수 있습니다. 특히 강점을 활용하여 약점을 보완하는 전략이 효과적일 것으로 예상됩니다.`
      },
      psychologicalAnalysis: {
        emotionalStability: severity === '높음' ? 35 : severity === '중간' ? 55 : 75,
        stressLevel: severity === '높음' ? 85 : severity === '중간' ? 65 : 40,
        mentalHealth: severity === '높음' ? 40 : severity === '중간' ? 60 : 78,
        summary: `현재 경험하고 계신 ${detectedType}는 ${severity === '높음' ? '즉각적인 관심이 필요합니다' : severity === '중간' ? '체계적인 관리가 도움이 됩니다' : '예방적 관리가 권장됩니다'}. 스트레스 관리와 정서적 안정을 위한 구체적인 실천 방안이 필요합니다. 전문가의 도움을 받으면 더욱 효과적인 대처가 가능합니다.`
      },
      strengthsWeaknesses: {
        strengths: [
          '문제를 인식하고 해결하려는 의지가 있습니다',
          '도움을 구하는 용기가 있습니다',
          '변화와 성장에 대한 열린 태도를 가지고 있습니다'
        ],
        weaknesses: [
          '현재 겪고 있는 어려움에 대한 체계적 대응이 필요합니다',
          '스트레스 관리 방법을 구체적으로 익힐 필요가 있습니다',
          '지속적인 자기 관찰과 모니터링이 필요합니다'
        ],
        growthDirection: '강점인 문제 인식 능력과 변화 의지를 활용하여, 체계적인 관리 방법을 익히고 전문가의 도움을 받으면 빠른 개선이 가능합니다'
      },
      customActivities: [
        '매일 아침 5분 마음챙김 호흡 연습하기 - 스트레스 관리에 즉각적 도움',
        '하루 10분 감정 일기 작성하기 - 패턴 파악과 자기 이해 증진',
        '주 3회 30분 산책하기 - 신체 활동을 통한 정서 안정',
        '주말마다 좋아하는 취미 활동 30분 - 긍정적 감정 경험',
        '매주 신뢰하는 사람과 대화 시간 갖기 - 사회적 지지 강화'
      ],
      developmentRoadmap: {
        shortTerm: [
          '매일 감정 상태를 기록하며 패턴 파악하기',
          '스트레스 관리 기법(호흡, 명상) 익히고 실천하기',
          '규칙적인 수면과 식사 패턴 만들기'
        ],
        mediumTerm: [
          '전문가 상담을 통해 구체적인 대처 방안 배우기',
          '취미나 관심사 활동을 통해 긍정적 경험 늘리기',
          '사회적 관계망 강화하고 지지 체계 구축하기'
        ],
        longTerm: [
          '건강한 생활 습관과 스트레스 관리가 자연스럽게 유지되기',
          '어려움을 스스로 잘 대처할 수 있는 회복탄력성 갖추기',
          '삶의 질이 전반적으로 향상되고 안정감 느끼기'
        ]
      },
      peerComparison: {
        ageGroup: '성인',
        percentile: severity === '높음' ? 25 : severity === '중간' ? 50 : 70,
        comparison: `같은 연령대와 비교했을 때 ${severity === '높음' ? '하위 25% 수준으로 전문적 지원이 필요' : severity === '중간' ? '중간 수준으로 적절한 관리가 필요' : '상위 30% 수준으로 양호한 편'}합니다. 적절한 개입과 노력을 통해 충분히 개선 가능한 상태입니다.`
      },
      expertOpinion: {
        interventionNeeded: severity === '높음' ? '높음' : severity === '중간' ? '중간' : '낮음',
        recommendations: [
          severity === '높음' ? '즉각적인 정신건강 전문가 상담이 권장됩니다' : severity === '중간' ? '전문가 상담을 통한 체계적 관리가 도움됩니다' : '예방 차원의 상담이 도움될 수 있습니다',
          '임상심리사 또는 정신건강의학과 전문의 상담 권장',
          detectedType + ' 관련 전문적 평가와 맞춤형 치료 계획 수립'
        ],
        urgency: severity === '높음' ? '높음 - 가능한 빠른 시일 내 전문가 상담 필요' : severity === '중간' ? '중간 - 2주 내 전문가 상담 권장' : '낮음 - 필요시 전문가 상담 고려'
      },
      familySupport: {
        parentingTips: [
          '충분한 경청과 공감으로 심리적 안정감 제공하기',
          '작은 성취와 노력을 인정하고 격려하기',
          '규칙적인 생활 패턴 유지를 도와주기',
          '전문가 상담에 동행하여 지지 표현하기'
        ],
        communicationGuide: '비난이나 평가보다는 "힘들었겠다", "이해한다"와 같은 공감 표현을 사용하세요. "왜 그랬어?"보다는 "어떻게 도와줄까?"라고 물어보세요. 상대방의 감정과 경험을 인정하고 존중하는 태도가 중요합니다.'
      },
      longTermPrediction: {
        developmentTrend: severity === '높음' ? '주의필요' : severity === '중간' ? '보통' : '긍정적',
        potential: severity === '높음' ? 55 : severity === '중간' ? 70 : 85,
        forecast: `현재 상태를 방치할 경우 ${severity === '높음' ? '더 심각한 문제로 발전할 위험이 있습니다' : severity === '중간' ? '개선이 더디거나 유지될 수 있습니다' : '안정적으로 유지될 것으로 예상됩니다'}. 하지만 적절한 전문가 개입과 체계적인 관리를 받으면 ${severity === '높음' ? '6-12개월 내 상당한 호전이 가능' : severity === '중간' ? '3-6개월 내 눈에 띄는 개선이 기대' : '1-3개월 내 더욱 안정적인 상태 도달'}됩니다. 꾸준한 노력과 적절한 지원이 핵심입니다.`
      }
    }
  };
}

// Generate dynamic table of contents based on analysis
function generateTableOfContents(analysisResult: any): Array<{index: number, title: string}> {
  const contents = [];
  const reports = analysisResult.comprehensiveReports;
  
  if (!reports) {
    // 기본 목차
    return [
      { index: 1, title: '발달 종합 평가' },
      { index: 2, title: '심리 상태 분석' },
      { index: 3, title: '강점/약점 분석' },
      { index: 4, title: '맞춤형 활동 제안' },
      { index: 5, title: '발달 로드맵' },
      { index: 6, title: '또래 비교 분석' },
      { index: 7, title: '전문가 소견서' },
      { index: 8, title: '가족 지원 가이드' },
      { index: 9, title: '장기 발달 예측' }
    ];
  }

  // 분석 타입에 따른 동적 목차 생성
  const type = analysisResult.type || '';
  
  if (reports.developmentAssessment) {
    contents.push({ index: contents.length + 1, title: `${type} 발달 종합 평가` });
  }
  
  if (reports.psychologicalAnalysis) {
    contents.push({ index: contents.length + 1, title: `심리·정서 상태 분석` });
  }
  
  if (reports.strengthsWeaknesses) {
    contents.push({ index: contents.length + 1, title: '개인 강점 및 개선 영역' });
  }
  
  if (reports.customActivities) {
    contents.push({ index: contents.length + 1, title: '맞춤 활동 및 실천 방안' });
  }
  
  if (reports.developmentRoadmap) {
    contents.push({ index: contents.length + 1, title: '단계별 성장 로드맵' });
  }
  
  if (reports.peerComparison) {
    contents.push({ index: contents.length + 1, title: `${reports.peerComparison.ageGroup} 비교 분석` });
  }
  
  if (reports.expertOpinion) {
    contents.push({ index: contents.length + 1, title: '전문가 소견 및 권고사항' });
  }
  
  if (reports.familySupport) {
    contents.push({ index: contents.length + 1, title: '가족 및 양육자 지원 가이드' });
  }
  
  if (reports.longTermPrediction) {
    contents.push({ index: contents.length + 1, title: 'AI 기반 장기 발달 예측' });
  }
  
  return contents;
}