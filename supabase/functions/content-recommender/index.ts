import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContentRecommendationRequest {
  observationText: string;
  ageGroup: 'child' | 'teen' | 'adult' | 'senior';
  tags: string[];
  analysisResult?: string;
}

interface RecommendedContent {
  title: string;
  description: string;
  youtubeUrl: string;
  category: string;
  duration: string;
  reason: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CONTENT-RECOMMENDER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    logStep('Function started');

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const requestBody: ContentRecommendationRequest = await req.json();
    logStep('Request received', { 
      textLength: requestBody.observationText?.length,
      ageGroup: requestBody.ageGroup,
      tags: requestBody.tags
    });

    const ageGroupMap = {
      child: '유아/아동',
      teen: '청소년', 
      adult: '성인',
      senior: '노인'
    };

    const prompt = `
다음 관찰 기록을 바탕으로 도움이 될 만한 유튜브 컨텐츠를 추천해주세요:

**관찰 정보:**
- 연령대: ${ageGroupMap[requestBody.ageGroup]}
- 관찰 영역: ${requestBody.tags.join(', ')}
- 관찰 내용: ${requestBody.observationText}
${requestBody.analysisResult ? `- AI 분석 결과: ${requestBody.analysisResult}` : ''}

다음 형식의 JSON으로 5개의 추천 컨텐츠를 제공해주세요:

{
  "recommendations": [
    {
      "title": "구체적인 제목",
      "description": "컨텐츠에 대한 간단한 설명 (2-3문장)",
      "youtubeUrl": "https://youtube.com/watch?v=실제존재하는영상ID",
      "category": "발달놀이|부모교육|치료방법|행동교정|감정조절|사회성향상 중 하나",
      "duration": "예상 시청 시간",
      "reason": "이 컨텐츠가 도움이 되는 구체적인 이유"
    }
  ]
}

추천 기준:
1. 관찰된 문제나 발달 영역과 직접적으로 관련된 실용적인 컨텐츠
2. 해당 연령대에 적합한 접근법을 다루는 컨텐츠
3. 부모나 보호자가 실제로 적용할 수 있는 구체적인 방법을 제시하는 컨텐츠
4. 전문가가 진행하거나 신뢰할 수 있는 교육기관의 컨텐츠 우선
5. 실제 존재하는 유튜브 링크만 제공 (가상의 링크 금지)

실제 존재하는 유튜브 채널 예시:
- 우리아이 발달연구소
- 육아정보채널 베이비뉴스
- 키즈노트 공식채널
- 아동발달센터
- 아이코리아TV
- 맘카페TV

반드시 실제 존재하는 유튜브 링크만 제공하고, JSON 형식을 정확히 지켜주세요.
`;

    logStep('Calling OpenAI API');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14', // 안정적인 GPT-4.1 모델 사용
        messages: [
          {
            role: 'system',
            content: '당신은 아동발달, 육아, 교육 전문가입니다. 관찰 기록을 바탕으로 실제로 도움이 되는 유튜브 컨텐츠를 추천합니다. 반드시 실제 존재하는 유튜브 링크만 제공하고 JSON 형식을 정확히 지켜주세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500, // GPT-4.1에서는 max_tokens 사용
        temperature: 0.7, // 창의적이지만 일관된 응답을 위해
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const contentText = aiResponse.choices[0].message.content;
    
    logStep('OpenAI response received', { textLength: contentText.length });

    // Parse JSON response
    let recommendations: RecommendedContent[] = [];
    
    try {
      const jsonMatch = contentText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        recommendations = parsed.recommendations || [];
      }
    } catch (parseError) {
      logStep('JSON parsing failed, using fallback', { error: parseError });
      
      // Fallback recommendations if parsing fails
      recommendations = [
        {
          title: "아동 행동 이해하기",
          description: "아이의 문제행동 원인과 해결방법을 전문가가 설명합니다.",
          youtubeUrl: "https://www.youtube.com/results?search_query=아동+행동+문제+해결방법",
          category: "행동교정",
          duration: "15-20분",
          reason: "관찰된 행동 패턴을 이해하고 개선방안을 찾는데 도움이 됩니다."
        },
        {
          title: "발달놀이 가이드",
          description: "연령별 발달 단계에 맞는 놀이 활동을 소개합니다.",
          youtubeUrl: "https://www.youtube.com/results?search_query=유아+발달놀이+가이드",
          category: "발달놀이",
          duration: "10-15분",
          reason: "일상에서 쉽게 할 수 있는 발달 촉진 활동을 배울 수 있습니다."
        }
      ];
    }

    logStep('Content recommendations generated', { count: recommendations.length });

    return new Response(JSON.stringify({ 
      success: true,
      recommendations: recommendations.slice(0, 5) // Limit to 5 recommendations
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR', { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: '컨텐츠 추천 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});