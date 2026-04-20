import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[INSTANT-AI-ANALYSIS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not set");
    }

    const { inputText, concern, target, language } = await req.json();
    const isEnglish = language === 'en';
    logStep("Request received", { inputTextLength: inputText?.length, concern, target, language });

    if (!inputText || inputText.trim().length < 10) {
      throw new Error(isEnglish 
        ? "Input text is too short. Please enter at least 10 characters."
        : "입력 텍스트가 너무 짧습니다. 최소 10자 이상 입력해주세요.");
    }

    logStep("Starting AI analysis", { inputText: inputText.substring(0, 50) + "..." });

    const concernLabels: Record<string, string> = isEnglish
      ? { 'development': 'Developmental Delay', 'behavior': 'Behavioral Issues', 'emotion': 'Emotional Regulation', 'social': 'Social Skills' }
      : { 'development': '발달 지연', 'behavior': '행동 문제', 'emotion': '감정 조절', 'social': '사회성' };

    const targetLabels: Record<string, string> = isEnglish
      ? { 'child': 'Child (0-12)', 'teen': 'Adolescent (13-18)', 'adult': 'Adult', 'family': 'Family' }
      : { 'child': '아동 (0-12세)', 'teen': '청소년 (13-18세)', 'adult': '성인', 'family': '가족' };

    const concernLabel = concernLabels[concern] || (isEnglish ? 'General concern' : '일반적인 고민');
    const targetLabel = targetLabels[target] || (isEnglish ? 'Subject' : '대상자');

    const systemPrompt = isEnglish
      ? `You are a top-tier developmental and psychological expert. Analyze the user's concern quickly and professionally, and respond in a structured JSON format that includes 6 core reports and personalized test recommendations.

**ABSOLUTE RULE: ALL output text values in the JSON MUST be written ENTIRELY in English. The user's input may be in Korean — you MUST translate and respond ONLY in English. If any Korean characters (한글) appear in your output, the response will be rejected. This is non-negotiable.**

**Available assessments on our platform:**
- adhd (testId: "adhd"): Attention & Focus Self-Check
- depression (testId: "depression"): Depression Self-Check
- panic (testId: "panic"): Anxiety Level Assessment
- stress (testId: "stress"): Stress Index Measurement
- language (testId: "language"): Language Development Check
- bigfive (testId: "bigfive"): Big Five Personality Analysis
- attachment (testId: "attachment"): Attachment Style Assessment
- career (testId: "career"): Career Interest Exploration
- selfesteem (testId: "selfesteem"): Self-Esteem Measurement
- developmental-delay (testId: "developmental-delay"): Developmental Delay Screening
- sensory-integration (testId: "sensory-integration"): Sensory Integration Assessment
- learning-disability (testId: "learning-disability"): Learning Disability Screening
- social-development (testId: "social-development"): Social Development Assessment

Response format:
{
  "type": "Concern type in English",
  "severity": "Low/Medium/High",
  "color": "bg-green-500 or bg-orange-500 or bg-red-500",
  "detailedAdvice": "Detailed advice in English (approx. 500 characters)",
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "nextSteps": ["Next step 1", "Next step 2", "Next step 3"],
  "confidence": 85-95,
  
  "deepAnalysis": {
    "rootCauseAnalysis": "Root cause analysis (200 chars)",
    "symptomPattern": "Symptom pattern (150 chars)",
    "protectiveFactors": ["Protective factor 1", "Protective factor 2"],
    "riskFactors": ["Risk factor 1", "Risk factor 2"]
  },
  
  "recommendedTests": [
    {
      "testId": "test ID from list above",
      "name": "Test name in English",
      "reason": "Recommendation reason (100 chars)",
      "expectedFindings": "Expected findings (100 chars)"
    }
  ],
  
  "comprehensiveReports": {
    "developmentAssessment": {
      "cognitive": score, "language": score, "motor": score, "social": score, "emotional": score, "overall": score,
      "summary": "Development status summary in English (300 chars)"
    },
    "psychologicalAnalysis": {
      "emotionalStability": score, "stressLevel": score, "anxietyLevel": score, "selfRegulation": score, "mentalHealth": score,
      "summary": "Psychological analysis in English (300 chars)"
    },
    "strengthsWeaknesses": {
      "strengths": ["Strength 1", "Strength 2", "Strength 3"],
      "weaknesses": ["Area for improvement 1", "Area for improvement 2"],
      "growthDirection": "Growth direction in English (200 chars)"
    },
    "customActivities": ["Activity 1", "Activity 2", "Activity 3"],
    "developmentRoadmap": {
      "immediate": ["Immediate action 1", "Immediate action 2"],
      "shortTerm": ["1-3 month goal 1", "1-3 month goal 2"],
      "longTerm": ["Long-term goal 1", "Long-term goal 2"]
    },
    "expertOpinion": {
      "clinicalImpression": "Clinical impression in English (200 chars)",
      "interventionNeeded": "Low/Medium/High",
      "recommendations": ["Expert recommendation 1", "Expert recommendation 2"],
      "urgency": "Low/Medium/High"
    }
  }
}

**User concern:** ${inputText}
${concernLabel ? `**Primary concern area:** ${concernLabel}` : ''}
${targetLabel ? `**Analysis target:** ${targetLabel}` : ''}

**Requirements:**
- recommendedTests: exactly 3 recommendations
- All 6 reports must be written IN ENGLISH — zero Korean characters allowed
- Return pure JSON only
- ALL text content MUST be in English. Translate any Korean concepts to English.
- FINAL CHECK: Ensure absolutely NO Korean characters (가-힣, ㄱ-ㅎ, ㅏ-ㅣ) exist in your output.`
      : `당신은 대한민국 최고의 발달/심리 전문가입니다. 사용자의 고민을 신속하고 전문적으로 분석하여 6가지 핵심 리포트와 맞춤형 테스트 추천을 포함한 JSON 형식으로 응답해주세요.

**우리 플랫폼 보유 검사 목록:**
- adhd (testId: "adhd"): 주의집중력 자가체크
- depression (testId: "depression"): 우울감 자가체크
- panic (testId: "panic"): 불안감 수준 확인
- stress (testId: "stress"): 마음압박지수 측정
- language (testId: "language"): 언어발달 자가체크
- bigfive (testId: "bigfive"): 5차원 성격 분석
- attachment (testId: "attachment"): 관계유형 진단
- career (testId: "career"): 진로흥미 탐색
- selfesteem (testId: "selfesteem"): 자아가치 측정
- developmental-delay (testId: "developmental-delay"): 발달지연 검사
- sensory-integration (testId: "sensory-integration"): 감각통합장애 검사
- learning-disability (testId: "learning-disability"): 학습장애 검사
- social-development (testId: "social-development"): 사회성 발달 검사

응답 형식:
{
  "type": "고민 유형",
  "severity": "낮음/중간/높음",
  "color": "bg-green-500 또는 bg-orange-500 또는 bg-red-500",
  "detailedAdvice": "500자 분량의 구체적 조언",
  "recommendations": ["추천사항 1", "추천사항 2", "추천사항 3"],
  "nextSteps": ["다음 단계 1", "다음 단계 2", "다음 단계 3"],
  "confidence": 85-95,
  
  "deepAnalysis": {
    "rootCauseAnalysis": "근본 원인 분석 (200자)",
    "symptomPattern": "증상 패턴 (150자)",
    "protectiveFactors": ["보호요인 1", "보호요인 2"],
    "riskFactors": ["위험요인 1", "위험요인 2"]
  },
  
  "recommendedTests": [
    {
      "testId": "검사 ID",
      "name": "검사명",
      "reason": "추천 이유 (100자)",
      "expectedFindings": "기대 결과 (100자)"
    }
  ],
  
  "comprehensiveReports": {
    "developmentAssessment": {
      "cognitive": 점수, "language": 점수, "motor": 점수, "social": 점수, "emotional": 점수, "overall": 점수,
      "summary": "발달 상태 요약 (300자)"
    },
    "psychologicalAnalysis": {
      "emotionalStability": 점수, "stressLevel": 점수, "anxietyLevel": 점수, "selfRegulation": 점수, "mentalHealth": 점수,
      "summary": "심리 상태 분석 (300자)"
    },
    "strengthsWeaknesses": {
      "strengths": ["강점 1", "강점 2", "강점 3"],
      "weaknesses": ["개선점 1", "개선점 2"],
      "growthDirection": "성장 방향 (200자)"
    },
    "customActivities": ["활동 1", "활동 2", "활동 3"],
    "developmentRoadmap": {
      "immediate": ["즉시 행동 1", "즉시 행동 2"],
      "shortTerm": ["1-3개월 목표 1", "1-3개월 목표 2"],
      "longTerm": ["장기 목표 1", "장기 목표 2"]
    },
    "expertOpinion": {
      "clinicalImpression": "임상 소견 (200자)",
      "interventionNeeded": "낮음/중간/높음",
      "recommendations": ["전문가 추천 1", "전문가 추천 2"],
      "urgency": "낮음/중간/높음"
    }
  }
}

**사용자 고민:** ${inputText}
${concernLabel ? `**주요 관심사:** ${concernLabel}` : ''}
${targetLabel ? `**분석 대상:** ${targetLabel}` : ''}

**필수사항:**
- recommendedTests는 정확히 3개 추천
- 모든 6가지 리포트 작성
- 순수 JSON만 반환`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: inputText }
        ],
        response_format: { type: 'json_object' },
      }),
    });

    logStep("Lovable AI response received", { status: response.status });

    if (!response.ok) {
      const errorData = await response.text();
      logStep("Lovable AI error", { status: response.status, error: errorData });
      
      if (response.status === 429) {
        throw new Error(isEnglish ? "Too many requests. Please try again later." : "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
      }
      if (response.status === 402) {
        throw new Error(isEnglish ? "AI usage limit exceeded. Please try again later." : "AI 사용 한도를 초과했습니다. 잠시 후 다시 시도해주세요.");
      }
      throw new Error(isEnglish ? `Error during AI analysis: ${response.status}` : `AI 분석 중 오류가 발생했습니다: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    logStep("AI analysis completed", { responseLength: aiResponse.length });

    const analysisResult = parseAIResponse(aiResponse, inputText, isEnglish);
    logStep("Analysis parsed", analysisResult);

    // Generate photorealistic report images
    const reportImages: string[] = [];
    
    if (lovableApiKey) {
      try {
        logStep("Starting photorealistic report images generation (2 images)");
        
        const realisticImagePrompts = [
          {
            name: 'realistic_scene_1',
            prompt: `Create a photorealistic, emotionally touching image depicting the following real-life concern:

CONTEXT: "${inputText.substring(0, 200)}"
THEME: ${analysisResult.type} related to ${targetLabels[target] || 'subject'}

REQUIREMENTS:
- Ultra-realistic photography style, like a professional family/lifestyle photograph
- Natural lighting, authentic emotions
- Korean family setting if applicable
- Show the emotional weight of the situation realistically
- Capture genuine human connection and vulnerability
- Professional DSLR quality, shallow depth of field
- Warm, empathetic atmosphere despite the difficulty
- ${analysisResult.severity === (isEnglish ? 'High' : '높음') ? 'Show visible signs of struggle but also resilience' : analysisResult.severity === (isEnglish ? 'Medium' : '중간') ? 'Balanced emotional portrayal' : 'Hopeful, tender moment'}

STYLE: Documentary photography, lifestyle photography, editorial quality
DO NOT include any text, watermarks, or logos.
Ultra high resolution, 4K quality.`
          },
          {
            name: 'realistic_scene_2',
            prompt: `Create a photorealistic image showing a positive, hopeful moment related to overcoming this concern:

CONTEXT: "${inputText.substring(0, 200)}"
THEME: Healing and progress for ${analysisResult.type}

REQUIREMENTS:
- Ultra-realistic photography style, professional quality
- Show a moment of connection, understanding, or breakthrough
- ${target === 'child' || target === 'teen' ? 'Parent-child bonding or supportive moment' : 'Personal growth or supportive relationship'}
- Natural, authentic emotional expression
- Soft, warm lighting suggesting hope
- Korean setting/people if contextually appropriate
- Professional lifestyle photography aesthetic
- Captures the essence of healing and moving forward

STYLE: Portrait photography, family photography, therapeutic imagery
DO NOT include any text, watermarks, or logos.
Ultra high resolution, 4K quality, emotionally impactful.`
          }
        ];
        
        const realisticImagePromises = realisticImagePrompts.map(async ({ name, prompt }) => {
          try {
            logStep(`Generating realistic image: ${name}`);
            const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${lovableApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemini-3.1-flash-image-preview',
                messages: [{ role: 'user', content: prompt }],
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
            logStep(`Realistic image error: ${name}`, { error: String(err) });
            return null;
          }
        });
        
        const realisticImages = await Promise.all(realisticImagePromises);
        reportImages.push(...realisticImages.filter(img => img !== null));
        
      } catch (imageError) {
        logStep("Error in batch image generation", { error: String(imageError) });
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      analysis: analysisResult,
      reportImages: reportImages.length > 0 ? reportImages : null,
      reportImage: reportImages.length > 0 ? reportImages[0] : null,
      tableOfContents: generateTableOfContents(analysisResult, isEnglish),
      originalResponse: aiResponse
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in instant-ai-analysis", { message: errorMessage });
    
    // Check if language was set before error
    let isEn = false;
    try {
      // Try to determine language from the error context
      isEn = errorMessage.includes('Input text') || errorMessage.includes('Too many') || errorMessage.includes('AI usage');
    } catch {}

    const fallbackAnalysis = getFallbackAnalysis(inputText || "", isEn);
    
    return new Response(JSON.stringify({ 
      success: true,
      analysis: fallbackAnalysis,
      tableOfContents: null,
      fallback: true,
      originalError: errorMessage
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function containsKorean(text: string): boolean {
  return /[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(text);
}

function sanitizeForEnglish(obj: any): any {
  if (typeof obj === 'string') {
    // If a string contains Korean, return a generic English fallback
    if (containsKorean(obj)) {
      return '[Analysis content - please re-run in English mode]';
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForEnglish(item));
  }
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeForEnglish(value);
    }
    return sanitized;
  }
  return obj;
}

function parseAIResponse(response: string, originalText: string, isEnglish: boolean) {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const result = {
        type: parsed.type || (isEnglish ? 'General Counseling' : '일반 상담'),
        severity: parsed.severity || (isEnglish ? 'Medium' : '중간'),
        color: parsed.color || 'bg-orange-500',
        detailedAdvice: parsed.detailedAdvice || (isEnglish
          ? 'We recommend seeking personalized guidance through professional consultation. Start by keeping an observation journal to identify patterns, and take small steps toward improvement.'
          : '전문가의 도움을 받아 구체적인 상담을 진행하시는 것을 권장드립니다. 관찰일지를 작성하며 패턴을 파악하고, 작은 변화부터 시작해보세요.'),
        recommendations: parsed.recommendations || (isEnglish
          ? ['Personalized solutions through expert consultation', 'Systematic observation journal', 'Step-by-step improvement guide']
          : ['전문가 상담을 통한 맞춤 솔루션', '체계적인 관찰일지 작성', '단계별 개선 가이드 제공']),
        confidence: parsed.confidence || 85,
        nextSteps: parsed.nextSteps || (isEnglish
          ? ['Get precise analysis with 3-min onboarding', 'Expert matching & consultation', 'Personalized solution recommendations']
          : ['3분 온보딩으로 정확한 분석 받기', '전문가 매칭 및 상담 예약', '맞춤형 솔루션 추천 받기']),
        recommendedTests: parsed.recommendedTests || [],
        comprehensiveReports: parsed.comprehensiveReports || null,
        aiResponse: response
      };
      
      // If English mode, sanitize any Korean that leaked through
      if (isEnglish) {
        const sanitized = sanitizeForEnglish(result);
        // If the AI returned Korean content extensively, use fallback instead
        if (containsKorean(JSON.stringify(result))) {
          logStep("Korean detected in English mode response, using fallback");
          return getFallbackAnalysis(originalText, isEnglish);
        }
        return sanitized;
      }
      
      return result;
    }
  } catch (e) {
    logStep("JSON parsing failed, using fallback", { error: String(e) });
  }
  
  return getFallbackAnalysis(originalText, isEnglish);
}

function getFallbackAnalysis(text: string, isEnglish: boolean) {
  const highSeverityKeywords = [
    '죽고싶', '자살', '자해', '극심', '심각', '위급', '위험', '견딜 수 없', '못 견디', '한계', '폭력', '학대',
    'suicide', 'self-harm', 'kill myself', "can't take it", 'abuse', 'violence', 'unbearable'
  ];
  
  const mediumSeverityKeywords = [
    '우울', '불안', '공황', '스트레스', '화', '분노', '걱정', '고민', '힘들', '지쳐', '아프', '외로', '슬프', '무기력', '짜증', '피곤', '싸움', '갈등', '문제', '어려움',
    'depressed', 'anxious', 'panic', 'stress', 'angry', 'worried', 'lonely', 'tired', 'conflict', 'struggle', 'overwhelm'
  ];

  const typeKeywordsKo: Record<string, string[]> = {
    '우울감': ['우울', '무기력', '의욕 없', '슬프', '외로'],
    '불안감': ['불안', '걱정', '초조', '공황', '두려', '무서'],
    '발달지연': ['말 안', '걷지 못', '발달', '늦', '또래보다', '개월', '언어', '운동'],
    '육아스트레스': ['아이', '육아', '엄마', '아빠', '키우', '양육'],
    '학업스트레스': ['공부', '시험', '성적', '학교', '학원', '입시'],
    '대인관계': ['친구', '관계', '따돌림', '왕따', '외톨이', '사회성'],
    '수면문제': ['잠', '수면', '못 자', '불면'],
    '분노조절': ['화', '분노', '짜증', '폭발', '참을 수 없'],
  };

  const typeKeywordsEn: Record<string, string[]> = {
    'Depression': ['depressed', 'hopeless', 'sad', 'lonely', 'worthless'],
    'Anxiety': ['anxious', 'panic', 'fear', 'worried', 'nervous'],
    'Developmental Delay': ['speech', 'delay', 'milestone', 'not walking', 'not talking'],
    'Parenting Stress': ['parenting', 'child', 'burnout', 'exhausted', 'mom', 'dad'],
    'Academic Stress': ['school', 'exam', 'grades', 'study', 'homework'],
    'Relationships': ['friend', 'bully', 'social', 'lonely', 'isolated'],
    'Sleep Issues': ['sleep', 'insomnia', 'can\'t sleep', 'nightmares'],
    'Anger Management': ['anger', 'rage', 'temper', 'irritable', 'explosive'],
  };

  const typeKeywords = isEnglish ? typeKeywordsEn : typeKeywordsKo;
  const lowText = text.toLowerCase();

  let severity = isEnglish ? 'Low' : '낮음';
  let color = 'bg-green-500';
  
  for (const keyword of highSeverityKeywords) {
    if (lowText.includes(keyword.toLowerCase())) {
      severity = isEnglish ? 'High' : '높음';
      color = 'bg-red-500';
      break;
    }
  }
  
  if (severity === (isEnglish ? 'Low' : '낮음')) {
    for (const keyword of mediumSeverityKeywords) {
      if (lowText.includes(keyword.toLowerCase())) {
        severity = isEnglish ? 'Medium' : '중간';
        color = 'bg-orange-500';
        break;
      }
    }
  }

  const isHigh = severity === (isEnglish ? 'High' : '높음');
  const isMedium = severity === (isEnglish ? 'Medium' : '중간');

  const detailedAdvice = isEnglish
    ? (isHigh
      ? 'The difficulties you are experiencing seem quite overwhelming. In situations like this, it is important to seek professional help rather than trying to resolve things alone. Start by confiding in someone you trust, and consider consulting a mental health professional. Take small steps, and remember that the pain you feel now is not permanent.'
      : isMedium
      ? 'I understand the difficulties you are feeling. These situations can happen to anyone, and seeking help is a courageous act. Try building small routines — regular sleep, light exercise, and hobbies can help. Consider keeping an observation journal to identify patterns and consult a professional if needed.'
      : 'Based on what you have shared, your concern appears to be at a manageable level. The effort to recognize and address it is a great step forward. Try keeping an observation journal, set small goals, and practice stress management activities like meditation or walking.')
    : (isHigh
      ? '현재 겪고 계신 어려움이 상당히 힘드실 것 같습니다. 이런 상황에서는 혼자 해결하려 하기보다 전문가의 도움을 받는 것이 중요합니다. 우선 신뢰할 수 있는 가족이나 친구에게 마음을 터놓고 이야기해보세요. 그리고 정신건강 전문의나 상담사와의 상담을 고려해보시길 권합니다. 작은 변화부터 시작하되, 자신을 너무 몰아붙이지 마세요. 하루하루 버티는 것만으로도 충분히 대단한 일입니다. 지금의 고통은 영원하지 않습니다.'
      : isMedium
      ? '지금 느끼시는 어려움에 대해 충분히 공감합니다. 이러한 상황은 누구에게나 찾아올 수 있으며, 도움을 구하는 것은 용기 있는 행동입니다. 일상에서 작은 루틴을 만들어보세요 - 규칙적인 수면, 가벼운 운동, 취미 활동 등이 도움이 될 수 있습니다. 또한 관찰일지를 작성하며 패턴을 파악하고, 필요하다면 전문가 상담도 고려해보세요. 변화는 천천히 일어나지만, 꾸준히 노력한다면 분명 좋아질 것입니다.'
      : '공유해주신 내용을 보니 현재 관리 가능한 수준의 고민으로 보입니다. 이런 고민을 인식하고 해결하려는 노력 자체가 큰 발전입니다. 관찰일지를 통해 패턴을 파악하고, 작은 목표를 세워 실천해보세요. 스트레스 관리를 위해 명상이나 산책 같은 활동도 도움이 됩니다. 예방적 차원에서 꾸준히 관심을 가지고 관리한다면 더 큰 문제로 발전하지 않을 것입니다. 자신을 돌보는 시간을 꼭 가지세요.');

  let detectedType = isEnglish ? 'General Counseling' : '일반 상담';
  for (const [type, keywords] of Object.entries(typeKeywords)) {
    if (keywords.some(keyword => lowText.includes(keyword.toLowerCase()))) {
      detectedType = type;
      break;
    }
  }

  const recommendations = isEnglish
    ? (isHigh
      ? ['Immediate professional consultation (Call 988 Suicide & Crisis Lifeline)', 'Visit nearest mental health center', 'Use 24/7 crisis hotline']
      : isMedium
      ? ['Personalized solutions through expert consultation', 'Systematic observation journal', 'Step-by-step improvement guide']
      : ['Preventive consultation and observation', 'Regular self-checks', 'Maintain healthy lifestyle habits'])
    : (isHigh
      ? ['즉시 전문가 상담 (1577-0199 정신건강위기상담)', '가까운 정신건강복지센터 방문', '24시간 위기상담 서비스 이용']
      : isMedium
      ? ['전문가 상담을 통한 맞춤 솔루션', '체계적인 관찰일지 작성', '단계별 개선 가이드 제공']
      : ['예방적 상담 및 관찰', '정기적인 자가 체크', '건강한 생활 습관 유지']);

  return {
    type: detectedType,
    severity,
    color,
    detailedAdvice,
    recommendations,
    confidence: Math.floor(Math.random() * 15) + 80,
    nextSteps: isEnglish
      ? ['Get precise analysis with 3-min onboarding', 'Expert matching & consultation', 'Personalized solution recommendations']
      : ['3분 온보딩으로 정확한 분석 받기', '전문가 매칭 및 상담 예약', '맞춤형 솔루션 추천 받기'],
    recommendedTests: isEnglish
      ? [
          { testId: 'stress', name: 'Stress Measurement', reason: 'Analyze the relationship between your concern and stress levels', expectedFindings: 'Identify current stress levels and primary stressors' },
          { testId: 'depression', name: 'Depression Self-Check', reason: 'Objectively evaluate the degree of emotional difficulty', expectedFindings: 'Assess severity of depressive symptoms and areas needing improvement' },
          { testId: 'panic', name: 'Anxiety Level Assessment', reason: 'Evaluate anxiety and tension levels', expectedFindings: 'Determine anxiety disorder risk and coping strategies' }
        ]
      : [
          { testId: 'stress', name: '스트레스 측정', reason: '고민의 원인과 스트레스 관계 분석', expectedFindings: '현재 스트레스 수준과 주요 원인을 파악할 수 있습니다' },
          { testId: 'depression', name: '우울감 자가체크', reason: '정서적 어려움의 정도를 객관적으로 평가', expectedFindings: '우울 증상의 심각도와 개선이 필요한 영역을 확인할 수 있습니다' },
          { testId: 'panic', name: '불안감 수준 확인', reason: '불안 및 긴장 수준 파악', expectedFindings: '불안장애 위험도와 대처 방법을 알 수 있습니다' }
        ],
    comprehensiveReports: {
      developmentAssessment: {
        cognitive: isHigh ? 45 : isMedium ? 65 : 75,
        language: isHigh ? 50 : isMedium ? 70 : 80,
        motor: isHigh ? 55 : isMedium ? 72 : 82,
        social: isHigh ? 40 : isMedium ? 60 : 78,
        overall: isHigh ? 48 : isMedium ? 67 : 79,
        summary: isEnglish
          ? `Currently assessed at a ${isHigh ? 'level requiring professional intervention' : isMedium ? 'level needing observation and management' : 'stable level'} regarding ${detectedType}. Positive changes can be expected with ongoing attention and appropriate support. A strategy that leverages strengths to compensate for weaknesses is expected to be effective.`
          : `현재 ${detectedType} 관련하여 ${isHigh ? '전문가 개입이 필요한 수준' : isMedium ? '관찰과 관리가 필요한 수준' : '안정적인 수준'}으로 평가됩니다. 지속적인 관심과 적절한 지원을 통해 긍정적인 변화를 기대할 수 있습니다.`
      },
      psychologicalAnalysis: {
        emotionalStability: isHigh ? 35 : isMedium ? 55 : 75,
        stressLevel: isHigh ? 85 : isMedium ? 65 : 40,
        mentalHealth: isHigh ? 40 : isMedium ? 60 : 78,
        summary: isEnglish
          ? `The ${detectedType} you are currently experiencing ${isHigh ? 'requires immediate attention' : isMedium ? 'can benefit from systematic management' : 'is recommended for preventive care'}. Specific action plans for stress management and emotional stability are needed.`
          : `현재 경험하고 계신 ${detectedType}는 ${isHigh ? '즉각적인 관심이 필요합니다' : isMedium ? '체계적인 관리가 도움이 됩니다' : '예방적 관리가 권장됩니다'}. 스트레스 관리와 정서적 안정을 위한 구체적인 실천 방안이 필요합니다.`
      },
      strengthsWeaknesses: {
        strengths: isEnglish
          ? ['You have the willingness to recognize and resolve problems', 'You have the courage to seek help', 'You have an open attitude toward change and growth']
          : ['문제를 인식하고 해결하려는 의지가 있습니다', '도움을 구하는 용기가 있습니다', '변화와 성장에 대한 열린 태도를 가지고 있습니다'],
        weaknesses: isEnglish
          ? ['A systematic response to current difficulties is needed', 'Specific stress management methods need to be learned', 'Continuous self-observation and monitoring is required']
          : ['현재 겪고 있는 어려움에 대한 체계적 대응이 필요합니다', '스트레스 관리 방법을 구체적으로 익힐 필요가 있습니다', '지속적인 자기 관찰과 모니터링이 필요합니다'],
        growthDirection: isEnglish
          ? 'By leveraging your strengths in problem recognition and willingness to change, combined with learning systematic management methods and receiving professional help, rapid improvement is possible.'
          : '강점인 문제 인식 능력과 변화 의지를 활용하여, 체계적인 관리 방법을 익히고 전문가의 도움을 받으면 빠른 개선이 가능합니다'
      },
      customActivities: isEnglish
        ? [
            '5-minute morning mindfulness breathing exercise — immediate help for stress management',
            '10-minute daily emotion journaling — pattern recognition and self-understanding',
            '30-minute walk 3 times a week — emotional stability through physical activity',
            '30 minutes of favorite hobby on weekends — positive emotional experiences',
            'Weekly conversation with a trusted person — strengthening social support'
          ]
        : [
            '매일 아침 5분 마음챙김 호흡 연습하기 - 스트레스 관리에 즉각적 도움',
            '하루 10분 감정 일기 작성하기 - 패턴 파악과 자기 이해 증진',
            '주 3회 30분 산책하기 - 신체 활동을 통한 정서 안정',
            '주말마다 좋아하는 취미 활동 30분 - 긍정적 감정 경험',
            '매주 신뢰하는 사람과 대화 시간 갖기 - 사회적 지지 강화'
          ],
      developmentRoadmap: {
        shortTerm: isEnglish
          ? ['Record emotional state daily to identify patterns', 'Learn and practice stress management techniques (breathing, meditation)', 'Establish regular sleep and eating patterns']
          : ['매일 감정 상태를 기록하며 패턴 파악하기', '스트레스 관리 기법(호흡, 명상) 익히고 실천하기', '규칙적인 수면과 식사 패턴 만들기'],
        mediumTerm: isEnglish
          ? ['Learn specific coping strategies through professional counseling', 'Increase positive experiences through hobbies and interests', 'Strengthen social network and build support systems']
          : ['전문가 상담을 통해 구체적인 대처 방안 배우기', '취미나 관심사 활동을 통해 긍정적 경험 늘리기', '사회적 관계망 강화하고 지지 체계 구축하기'],
        longTerm: isEnglish
          ? ['Maintain healthy lifestyle habits and stress management naturally', 'Build resilience to handle difficulties independently', 'Achieve overall improvement in quality of life and sense of stability']
          : ['건강한 생활 습관과 스트레스 관리가 자연스럽게 유지되기', '어려움을 스스로 잘 대처할 수 있는 회복탄력성 갖추기', '삶의 질이 전반적으로 향상되고 안정감 느끼기']
      },
      peerComparison: {
        ageGroup: isEnglish ? 'Adult' : '성인',
        percentile: isHigh ? 25 : isMedium ? 50 : 70,
        comparison: isEnglish
          ? `Compared to the same age group, ${isHigh ? 'at the 25th percentile — professional support is recommended' : isMedium ? 'at a moderate level — appropriate management is needed' : 'in the top 30% — in good condition'}. With proper intervention and effort, significant improvement is achievable.`
          : `같은 연령대와 비교했을 때 ${isHigh ? '하위 25% 수준으로 전문적 지원이 필요' : isMedium ? '중간 수준으로 적절한 관리가 필요' : '상위 30% 수준으로 양호한 편'}합니다. 적절한 개입과 노력을 통해 충분히 개선 가능한 상태입니다.`
      },
      expertOpinion: {
        interventionNeeded: isEnglish
          ? (isHigh ? 'High' : isMedium ? 'Medium' : 'Low')
          : (isHigh ? '높음' : isMedium ? '중간' : '낮음'),
        recommendations: isEnglish
          ? [
              isHigh ? 'Immediate mental health professional consultation is recommended' : isMedium ? 'Systematic management through professional counseling is helpful' : 'Preventive counseling may be beneficial',
              'Clinical psychologist or psychiatrist consultation recommended',
              `Professional evaluation and personalized treatment plan for ${detectedType}`
            ]
          : [
              isHigh ? '즉각적인 정신건강 전문가 상담이 권장됩니다' : isMedium ? '전문가 상담을 통한 체계적 관리가 도움됩니다' : '예방 차원의 상담이 도움될 수 있습니다',
              '임상심리사 또는 정신건강의학과 전문의 상담 권장',
              detectedType + ' 관련 전문적 평가와 맞춤형 치료 계획 수립'
            ],
        urgency: isEnglish
          ? (isHigh ? 'High — Professional consultation needed as soon as possible' : isMedium ? 'Medium — Professional consultation recommended within 2 weeks' : 'Low — Consider professional consultation if needed')
          : (isHigh ? '높음 - 가능한 빠른 시일 내 전문가 상담 필요' : isMedium ? '중간 - 2주 내 전문가 상담 권장' : '낮음 - 필요시 전문가 상담 고려')
      },
      familySupport: {
        parentingTips: isEnglish
          ? [
              'Provide psychological security through active listening and empathy',
              'Acknowledge and encourage small achievements and efforts',
              'Help maintain regular daily routines',
              'Accompany to professional consultations to show support'
            ]
          : [
              '충분한 경청과 공감으로 심리적 안정감 제공하기',
              '작은 성취와 노력을 인정하고 격려하기',
              '규칙적인 생활 패턴 유지를 도와주기',
              '전문가 상담에 동행하여 지지 표현하기'
            ],
        communicationGuide: isEnglish
          ? 'Use empathetic expressions like "That must have been hard" or "I understand" rather than criticism. Ask "How can I help?" instead of "Why did you do that?" Acknowledging and respecting the other person\'s feelings and experiences is crucial.'
          : '비난이나 평가보다는 "힘들었겠다", "이해한다"와 같은 공감 표현을 사용하세요. "왜 그랬어?"보다는 "어떻게 도와줄까?"라고 물어보세요. 상대방의 감정과 경험을 인정하고 존중하는 태도가 중요합니다.'
      },
      longTermPrediction: {
        developmentTrend: isEnglish
          ? (isHigh ? 'Needs Attention' : isMedium ? 'Moderate' : 'Positive')
          : (isHigh ? '주의필요' : isMedium ? '보통' : '긍정적'),
        potential: isHigh ? 55 : isMedium ? 70 : 85,
        forecast: isEnglish
          ? `If left unaddressed, ${isHigh ? 'there is a risk of developing into more serious issues' : isMedium ? 'improvement may be slow or stagnant' : 'it is expected to remain stable'}. However, with appropriate professional intervention and systematic management, ${isHigh ? 'significant improvement is possible within 6-12 months' : isMedium ? 'noticeable improvement is expected within 3-6 months' : 'an even more stable state can be reached within 1-3 months'}. Consistent effort and appropriate support are key.`
          : `현재 상태를 방치할 경우 ${isHigh ? '더 심각한 문제로 발전할 위험이 있습니다' : isMedium ? '개선이 더디거나 유지될 수 있습니다' : '안정적으로 유지될 것으로 예상됩니다'}. 하지만 적절한 전문가 개입과 체계적인 관리를 받으면 ${isHigh ? '6-12개월 내 상당한 호전이 가능' : isMedium ? '3-6개월 내 눈에 띄는 개선이 기대' : '1-3개월 내 더욱 안정적인 상태 도달'}됩니다. 꾸준한 노력과 적절한 지원이 핵심입니다.`
      }
    }
  };
}

function generateTableOfContents(analysisResult: any, isEnglish: boolean): Array<{index: number, title: string}> {
  const reports = analysisResult.comprehensiveReports;
  
  if (!reports) {
    return isEnglish
      ? [
          { index: 1, title: 'Comprehensive Development Assessment' },
          { index: 2, title: 'Psychological Analysis' },
          { index: 3, title: 'Strengths & Weaknesses Analysis' },
          { index: 4, title: 'Personalized Activity Recommendations' },
          { index: 5, title: 'Development Roadmap' },
          { index: 6, title: 'Peer Comparison Analysis' },
          { index: 7, title: 'Expert Opinion Report' },
          { index: 8, title: 'Family Support Guide' },
          { index: 9, title: 'Long-Term Development Forecast' }
        ]
      : [
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

  const type = analysisResult.type || '';
  const contents: Array<{index: number, title: string}> = [];
  
  if (reports.developmentAssessment) {
    contents.push({ index: contents.length + 1, title: isEnglish ? `${type} Comprehensive Development Assessment` : `${type} 발달 종합 평가` });
  }
  if (reports.psychologicalAnalysis) {
    contents.push({ index: contents.length + 1, title: isEnglish ? 'Psychological & Emotional Analysis' : '심리·정서 상태 분석' });
  }
  if (reports.strengthsWeaknesses) {
    contents.push({ index: contents.length + 1, title: isEnglish ? 'Personal Strengths & Areas for Improvement' : '개인 강점 및 개선 영역' });
  }
  if (reports.customActivities) {
    contents.push({ index: contents.length + 1, title: isEnglish ? 'Personalized Activities & Action Plans' : '맞춤 활동 및 실천 방안' });
  }
  if (reports.developmentRoadmap) {
    contents.push({ index: contents.length + 1, title: isEnglish ? 'Step-by-Step Growth Roadmap' : '단계별 성장 로드맵' });
  }
  if (reports.peerComparison) {
    contents.push({ index: contents.length + 1, title: isEnglish ? `${reports.peerComparison.ageGroup} Peer Comparison Analysis` : `${reports.peerComparison.ageGroup} 비교 분석` });
  }
  if (reports.expertOpinion) {
    contents.push({ index: contents.length + 1, title: isEnglish ? 'Expert Opinion & Recommendations' : '전문가 소견 및 권고사항' });
  }
  if (reports.familySupport) {
    contents.push({ index: contents.length + 1, title: isEnglish ? 'Family & Caregiver Support Guide' : '가족 및 양육자 지원 가이드' });
  }
  if (reports.longTermPrediction) {
    contents.push({ index: contents.length + 1, title: isEnglish ? 'AI-Based Long-Term Development Forecast' : 'AI 기반 장기 발달 예측' });
  }
  
  return contents;
}
