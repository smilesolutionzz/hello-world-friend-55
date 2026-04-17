import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { answers, personalityType } = await req.json();

    console.log('[PERSONALITY-LOVE-ANALYZER] 분석 시작:', { 
      personalityType: personalityType.type,
      answersCount: Object.keys(answers).length 
    });

    // 답변을 읽기 쉬운 형태로 변환
    const formattedAnswers = Object.entries(answers).map(([key, value]) => {
      const questionMapping: Record<string, string> = {
        'relationship_preference': '이상적인 관계 스타일',
        'conflict_style': '갈등 상황 대처법',
        'communication_style': '소통에서 중요한 것',
        'jealousy_level': '질투심 정도',
        'independence_level': '관계에서 독립성',
        'future_planning': '미래 계획 성향',
        'emotional_expression': '감정 표현 방식',
        'social_preference': '사회적 활동 선호도'
      };
      
      const answerMapping: Record<string, string> = {
        // relationship_preference
        'passionate': '열정적이고 로맨틱한 관계',
        'stable': '안정적이고 신뢰할 수 있는 관계',
        'fun': '재미있고 자유로운 관계',
        'deep': '깊이 있고 진솔한 관계',
        // conflict_style
        'direct': '직접적으로 문제를 해결하려 함',
        'avoid': '갈등을 피하고 시간이 해결하길 기다림',
        'compromise': '서로 양보하는 선에서 타협점을 찾음',
        'emotional': '감정을 솔직하게 표현하며 대화함',
        // communication_style
        'words': '언어적 표현과 대화',
        'actions': '행동으로 보여주는 것',
        'time': '함께 보내는 시간',
        'gifts': '선물이나 서프라이즈',
        'touch': '스킨십과 신체적 접촉',
        // jealousy_level
        'none': '거의 질투하지 않음',
        'low': '가끔 가벼운 질투',
        'moderate': '보통 수준의 질투',
        'high': '자주 질투하는 편',
        'extreme': '매우 질투가 심함',
        // independence_level
        'very_independent': '매우 독립적 (개인 시간 중시)',
        'independent': '어느 정도 독립적',
        'balanced': '함께함과 독립 사이 균형',
        'dependent': '상대방과 많은 시간을 보내고 싶음',
        'very_dependent': '항상 함께 있고 싶음'
      };

      return `${questionMapping[String(key)] || String(key)}: ${answerMapping[String(value)] || String(value)}`;
    }).join('\n');

    const prompt = `
당신은 연애 전문 상담사입니다. 다음 연애 성격 검사 결과를 바탕으로 쉽고 실용적인 분석을 제공해주세요.

검사 결과:
기본 성격 유형: ${personalityType.type}
기본 설명: ${personalityType.description}

상세 답변:
${formattedAnswers}

다음 형식으로 분석해주세요:

**🎯 나의 연애 스타일 한 줄 요약**
[한 문장으로 핵심 특징 정리]

**💖 연애할 때 나의 모습**
- [구체적인 행동이나 특징 3-4가지, 일상 언어로 쉽게]

**✨ 나의 연애 강점**
- [실제로 도움되는 강점 3가지, 구체적 예시 포함]

**🔧 이것만 조금 바꿔보세요**
- [실천 가능한 개선점 2-3가지, 구체적인 방법 제시]

**💡 오늘부터 실천할 수 있는 연애 팁**
1. [즉시 실행 가능한 구체적 행동]
2. [일상에서 쉽게 할 수 있는 것]
3. [관계 개선에 바로 도움되는 것]

**👫 나와 잘 맞는 사람 특징**
- [구체적인 성격이나 행동 특징 3가지]

**🚨 이런 상황에서 주의하세요**
- [실제 연애에서 일어날 수 있는 상황과 대처법]

가능한 한 어려운 심리학 용어는 피하고, 20-30대가 이해하기 쉬운 일상 언어로 작성해주세요. 
실제 연애 상황에서 바로 써먹을 수 있는 구체적이고 현실적인 조언을 중심으로 해주세요.
`;

    console.log('[PERSONALITY-LOVE-ANALYZER] OpenAI API 호출 시작');

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
            content: '당신은 친근하고 실용적인 연애 상담사입니다. 어려운 용어 대신 일상 언어를 사용하고, 바로 실천할 수 있는 구체적인 조언을 제공합니다.' 
          },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[PERSONALITY-LOVE-ANALYZER] OpenAI API 오류:', errorData);
      throw new Error(errorData.error?.message || 'OpenAI API 오류');
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;
    
    console.log('[PERSONALITY-LOVE-ANALYZER] 분석 완료:', { 
      analysisLength: analysis.length 
    });

    return new Response(JSON.stringify({ 
      analysis,
      personalityType: personalityType.type,
      completedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('[PERSONALITY-LOVE-ANALYZER] 오류:', error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ 
      error: message,
      fallback: "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});