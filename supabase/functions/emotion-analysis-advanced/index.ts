import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 감정 카테고리 정의
const EMOTION_CATEGORIES = {
  positive: ['기쁨', '행복', '감사', '희망', '사랑', '평온', '자신감', '흥분', '만족'],
  negative: ['슬픔', '분노', '두려움', '불안', '우울', '좌절', '외로움', '수치심', '죄책감'],
  neutral: ['무감정', '지루함', '피곤', '혼란']
};

// 한국어 감정 키워드
const EMOTION_KEYWORDS = {
  joy: ['기뻐', '행복', '좋아', '신나', '즐거', '웃음'],
  sadness: ['슬퍼', '울고', '눈물', '서럽', '우울', '힘들'],
  anger: ['화나', '짜증', '열받', '분노', '빡치', '미워'],
  fear: ['무서', '두려', '겁나', '불안', '걱정'],
  surprise: ['놀라', '충격', '깜짝', '어이없'],
  disgust: ['역겨', '싫어', '혐오', '구역질'],
  loneliness: ['외로', '혼자', '쓸쓸', '고독'],
  hopelessness: ['희망이 없', '절망', '포기', '의미 없']
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, audioFeatures, context, includeRecommendations } = await req.json();
    
    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Emotion Analysis] Analyzing text:', text.substring(0, 100));

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      // 키워드 기반 기본 분석
      const detectedEmotions = detectEmotionsFromKeywords(text);
      return new Response(
        JSON.stringify({
          success: true,
          analysis: detectedEmotions,
          method: 'keyword-based'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // AI 기반 정밀 감정 분석
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: `당신은 고급 감정 분석 전문 AI입니다. 텍스트에서 복합적인 감정 상태를 정밀하게 분석합니다.

반드시 JSON 형식으로만 응답하세요:
{
  "primary_emotion": {
    "name": "주요 감정명",
    "intensity": 0-10,
    "confidence": 0-1
  },
  "secondary_emotions": [
    {"name": "감정명", "intensity": 0-10}
  ],
  "emotion_valence": -1 to 1 (부정적~긍정적),
  "arousal_level": 0-10 (각성 수준),
  "emotional_stability": 0-10 (정서 안정성),
  "sentiment_score": -100 to 100,
  "emotional_needs": ["정서적 욕구들"],
  "underlying_feelings": ["표면 아래 감정들"],
  "coping_suggestions": ["대처 제안들"],
  "risk_indicators": ["위험 신호들, 없으면 빈 배열"],
  "support_message": "공감 메시지"
}`
          },
          {
            role: 'user',
            content: `다음 텍스트의 감정 상태를 정밀하게 분석해주세요:\n\n"${text}"\n\n${context ? `맥락: ${context}` : ''}`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded', success: false }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    let aiAnalysis = null;
    if (content) {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiAnalysis = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.log('[Emotion Analysis] JSON parsing failed');
      }
    }

    // 키워드 기반 분석도 함께 수행
    const keywordAnalysis = detectEmotionsFromKeywords(text);

    const result = {
      success: true,
      analysis: {
        primary: aiAnalysis?.primary_emotion || keywordAnalysis.primary,
        secondary: aiAnalysis?.secondary_emotions || keywordAnalysis.secondary,
        valence: aiAnalysis?.emotion_valence ?? keywordAnalysis.valence,
        arousal: aiAnalysis?.arousal_level ?? 5,
        stability: aiAnalysis?.emotional_stability ?? 5,
        sentimentScore: aiAnalysis?.sentiment_score ?? keywordAnalysis.sentimentScore,
      },
      insights: {
        emotionalNeeds: aiAnalysis?.emotional_needs || [],
        underlyingFeelings: aiAnalysis?.underlying_feelings || [],
        riskIndicators: aiAnalysis?.risk_indicators || [],
      },
      support: {
        copingSuggestions: aiAnalysis?.coping_suggestions || [],
        supportMessage: aiAnalysis?.support_message || getDefaultSupportMessage(keywordAnalysis.primary?.name),
      },
      method: 'ai-enhanced',
      timestamp: new Date().toISOString(),
    };

    console.log('[Emotion Analysis] Complete:', result.analysis.primary);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Emotion Analysis] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function detectEmotionsFromKeywords(text: string) {
  const lowerText = text.toLowerCase();
  const detectedEmotions: { name: string; intensity: number }[] = [];
  
  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    let matchCount = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        matchCount++;
      }
    }
    if (matchCount > 0) {
      detectedEmotions.push({
        name: translateEmotion(emotion),
        intensity: Math.min(matchCount * 3, 10)
      });
    }
  }

  // 정렬
  detectedEmotions.sort((a, b) => b.intensity - a.intensity);

  const primary = detectedEmotions[0] || { name: '중립', intensity: 5 };
  const secondary = detectedEmotions.slice(1, 3);

  // 감정 극성 계산
  const negativeEmotions = ['슬픔', '분노', '두려움', '외로움', '절망'];
  const valence = negativeEmotions.includes(primary.name) ? -0.5 : 0.5;

  return {
    primary: { ...primary, confidence: 0.7 },
    secondary,
    valence,
    sentimentScore: valence * 50,
  };
}

function translateEmotion(emotion: string): string {
  const translations: Record<string, string> = {
    joy: '기쁨',
    sadness: '슬픔',
    anger: '분노',
    fear: '두려움',
    surprise: '놀람',
    disgust: '혐오',
    loneliness: '외로움',
    hopelessness: '절망'
  };
  return translations[emotion] || emotion;
}

function getDefaultSupportMessage(emotion?: string): string {
  const messages: Record<string, string> = {
    '슬픔': '힘든 감정을 느끼고 계시는군요. 당신의 감정은 충분히 이해받을 자격이 있어요.',
    '분노': '화가 나는 것은 자연스러운 감정이에요. 잠시 깊은 호흡을 해보는 건 어떨까요?',
    '두려움': '불안함을 느끼시는군요. 천천히 한 걸음씩 나아가도 괜찮아요.',
    '외로움': '혼자라고 느껴지실 수 있지만, 당신 곁에는 도움을 줄 수 있는 사람들이 있어요.',
    '절망': '지금 매우 힘드시겠지만, 도움을 받을 수 있어요. 전문가와 이야기해보시겠어요?',
  };
  return messages[emotion || ''] || '당신의 감정을 존중해요. 언제든 이야기 나눌 준비가 되어 있어요.';
}
