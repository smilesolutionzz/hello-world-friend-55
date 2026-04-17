import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 자살/자해 위험 키워드 (한국어 + 영어)
const CRISIS_KEYWORDS = {
  critical: [
    '죽고 싶', '자살', '죽을거', '더 이상 살기 싫', '삶을 끝내고 싶',
    '사라지고 싶', '없어지고 싶', '자해', '손목을 긋', '약을 먹',
    '목을 매', '뛰어내리', '유서', '마지막 인사', '죽음',
    'kill myself', 'suicide', 'end my life', 'want to die', 'self harm'
  ],
  high: [
    '우울', '절망', '희망이 없', '포기하고 싶', '견딜 수 없',
    '아무도 나를', '혼자', '외로', '고통', '힘들어서 못 견디겠',
    '살아있는 게', '존재 가치', '쓸모없', '짐이 되',
    'hopeless', 'worthless', 'burden', 'alone', 'give up'
  ],
  medium: [
    '불안', '걱정', '스트레스', '잠을 못 자', '식욕이 없',
    '의욕이 없', '무기력', '집중이 안 돼', '눈물이 나',
    'anxious', 'stressed', 'can\'t sleep', 'no appetite'
  ]
};

// 위기 수준 판단
function detectCrisisLevel(text: string): {
  level: 'critical' | 'high' | 'medium' | 'low';
  matchedKeywords: string[];
  confidence: number;
} {
  const lowerText = text.toLowerCase();
  const matchedKeywords: string[] = [];
  
  // Critical 키워드 체크
  for (const keyword of CRISIS_KEYWORDS.critical) {
    if (lowerText.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword);
    }
  }
  if (matchedKeywords.length > 0) {
    return { level: 'critical', matchedKeywords, confidence: 0.95 };
  }
  
  // High 키워드 체크
  for (const keyword of CRISIS_KEYWORDS.high) {
    if (lowerText.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword);
    }
  }
  if (matchedKeywords.length >= 2) {
    return { level: 'high', matchedKeywords, confidence: 0.85 };
  }
  if (matchedKeywords.length === 1) {
    return { level: 'medium', matchedKeywords, confidence: 0.7 };
  }
  
  // Medium 키워드 체크
  for (const keyword of CRISIS_KEYWORDS.medium) {
    if (lowerText.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword);
    }
  }
  if (matchedKeywords.length >= 2) {
    return { level: 'medium', matchedKeywords, confidence: 0.6 };
  }
  
  return { level: 'low', matchedKeywords, confidence: 0.3 };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, userId, context, sessionId } = await req.json();
    
    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Crisis Detection] Analyzing text for user:', userId);
    
    // 1. 키워드 기반 초기 분석
    const keywordAnalysis = detectCrisisLevel(text);
    
    // 2. AI 기반 정밀 분석 (Lovable AI Gateway)
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    let aiAnalysis = null;
    
    if (LOVABLE_API_KEY && keywordAnalysis.level !== 'low') {
      try {
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: `당신은 청소년 정신건강 위기 감지 전문 AI입니다. 
텍스트를 분석하여 자살/자해 위험 수준을 평가합니다.

반드시 JSON 형식으로만 응답하세요:
{
  "risk_level": "critical|high|medium|low",
  "risk_score": 0-100,
  "primary_concerns": ["우려사항1", "우려사항2"],
  "protective_factors": ["보호요인1"],
  "immediate_action_needed": true/false,
  "recommended_response": "권장 대응 방법",
  "emotion_state": {
    "primary": "주요 감정",
    "secondary": ["부가 감정들"],
    "intensity": 0-10
  }
}`
              },
              {
                role: 'user',
                content: `다음 텍스트의 위기 수준을 분석하세요:\n\n"${text}"\n\n추가 맥락: ${context || '없음'}`
              }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content;
          if (content) {
            try {
              // JSON 파싱 시도
              const jsonMatch = content.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                aiAnalysis = JSON.parse(jsonMatch[0]);
              }
            } catch (e) {
              console.log('[Crisis Detection] AI response parsing failed:', e);
            }
          }
        }
      } catch (aiError) {
        console.error('[Crisis Detection] AI analysis error:', aiError);
      }
    }

    // 3. 최종 위기 수준 결정
    let finalLevel = keywordAnalysis.level;
    let riskScore = keywordAnalysis.confidence * 100;
    
    if (aiAnalysis) {
      // AI 분석 결과 반영
      if (aiAnalysis.risk_level === 'critical' || keywordAnalysis.level === 'critical') {
        finalLevel = 'critical';
        riskScore = Math.max(riskScore, aiAnalysis.risk_score || 90);
      } else if (aiAnalysis.risk_level === 'high' || keywordAnalysis.level === 'high') {
        finalLevel = 'high';
        riskScore = Math.max(riskScore, aiAnalysis.risk_score || 75);
      }
    }

    // 4. 즉시 개입 필요 여부
    const immediateActionNeeded = finalLevel === 'critical' || 
      (aiAnalysis?.immediate_action_needed === true);

    // 5. 응답 구성
    const response = {
      success: true,
      analysis: {
        crisisLevel: finalLevel,
        riskScore: Math.round(riskScore),
        confidence: keywordAnalysis.confidence,
        matchedKeywords: keywordAnalysis.matchedKeywords,
        immediateActionNeeded,
        timestamp: new Date().toISOString(),
      },
      aiAnalysis: aiAnalysis ? {
        primaryConcerns: aiAnalysis.primary_concerns || [],
        protectiveFactors: aiAnalysis.protective_factors || [],
        recommendedResponse: aiAnalysis.recommended_response || '',
        emotionState: aiAnalysis.emotion_state || null,
      } : null,
      emergencyContacts: immediateActionNeeded ? [
        { name: '자살예방상담전화', number: '1393', priority: 1, description: '24시간 자살예방 전문상담' },
        { name: '정신건강위기상담전화', number: '1577-0199', priority: 2, description: '24시간 정신건강 위기상담' },
        { name: '청소년전화', number: '1388', priority: 3, description: '청소년 전용 상담' },
        { name: '생명의전화', number: '1588-9191', priority: 4, description: '자살예방 상담' },
      ] : [],
      sessionId,
      userId,
    };

    console.log('[Crisis Detection] Analysis complete:', {
      level: finalLevel,
      riskScore: Math.round(riskScore),
      immediate: immediateActionNeeded
    });

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Crisis Detection] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
