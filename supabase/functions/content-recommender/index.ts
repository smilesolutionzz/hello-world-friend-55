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
  blogUrl?: string;
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
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }
    if (!perplexityApiKey) {
      throw new Error('Perplexity API key not configured');
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

    // 직접 GPT를 사용해서 5개의 다양한 추천 생성
    const isAdult = requestBody.ageGroup === 'adult';
    logStep('Generating GPT-based comprehensive recommendations');
    
    const recommendations: RecommendedContent[] = [];
    
    const gptRecommendationPrompt = `
관찰 기록을 바탕으로 반드시 5개의 서로 다른 다양한 컨텐츠를 추천해주세요:

**관찰 정보:**
- 연령대: ${ageGroupMap[requestBody.ageGroup]}
- 관찰 영역: ${requestBody.tags.join(', ')}
- 관찰 내용: ${requestBody.observationText}
${requestBody.analysisResult ? `- AI 분석 결과: ${requestBody.analysisResult}` : ''}

반드시 다음 JSON 형식으로 정확히 5개의 서로 다른 추천을 제공해주세요:

{
  "recommendations": [
    {
      "title": "구체적이고 실용적인 컨텐츠 제목",
      "description": "컨텐츠 내용 설명 (2-3문장)",
      "category": "${isAdult ? '심리상담|스트레스관리|감정조절|인지치료|마음챙김|업무스트레스' : '발달놀이|부모교육|치료방법|행동교정|감정조절|사회성향상'} 중 하나",
      "searchKeyword": "실제 유튜브에서 검색했을 때 관련 동영상이 많이 나올 수 있는 한국어 키워드",
      "duration": "예상 시간 (예: 10-15분)",
      "reason": "이 컨텐츠가 관찰된 상황에 구체적으로 어떻게 도움이 되는지 상세한 설명"
    }
  ]
}

요구사항:
1. 반드시 5개의 서로 다른 추천을 제공하세요
2. 각각 다른 카테고리나 접근 방식을 사용하세요
3. 실제 유튜브에서 검색 가능한 키워드를 사용하세요
4. 관찰 내용과 직접 연관된 실용적인 추천을 하세요
`;

      const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: `당신은 ${isAdult ? '심리상담, 스트레스 관리' : '아동발달, 육아교육'} 전문가입니다. 관찰 기록을 바탕으로 실제 도움이 되는 다양한 컨텐츠를 추천합니다.`
            },
            {
              role: 'user',
              content: gptRecommendationPrompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.7
        }),
      });

      if (gptResponse.ok) {
        const gptData = await gptResponse.json();
        const gptText = gptData.choices[0].message.content;
        
        try {
          const jsonMatch = gptText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const gptRecommendations = parsed.recommendations || [];
            
            gptRecommendations.forEach((rec: any, index: number) => {
              if (recommendations.length < 5) {
                recommendations.push({
                  title: rec.title,
                  description: rec.description,
                  youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(rec.searchKeyword)}`,
                  category: rec.category,
                  duration: rec.duration,
                  reason: rec.reason
                });
              }
            });
            
            logStep('GPT recommendations added', { count: gptRecommendations.length });
          }
        } catch (parseError) {
          logStep('GPT recommendation parsing failed');
        }
      }

    // 기존 fallback을 더 다양하게 개선
    if (recommendations.length < 5) {
      const fallbackRecommendations = [
        {
          title: `${ageGroupMap[requestBody.ageGroup]} 발달 전문가 상담법`,
          description: "발달 전문가가 제안하는 체계적인 접근 방법을 배웁니다.",
          youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(ageGroupMap[requestBody.ageGroup] + ' 발달 상담')}`,
          category: "전문상담",
          duration: "20-25분",
          reason: "전문가의 체계적인 관점에서 발달 상황을 이해하고 대응할 수 있습니다."
        },
        {
          title: "실전 육아 케이스 스터디",
          description: "비슷한 상황의 실제 사례와 해결 과정을 소개합니다.",
          youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('육아 사례 해결책')}`,
          category: "부모교육",
          duration: "15-20분", 
          reason: "실제 사례를 통해 구체적이고 실용적인 해결책을 학습할 수 있습니다."
        },
        {
          title: "감정 코칭 기법",
          description: "아이의 감정을 이해하고 올바르게 지도하는 방법을 학습합니다.",
          youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('아동 감정 코칭')}`,
          category: "감정조절",
          duration: "12-18분",
          reason: "감정적 어려움을 겪는 상황에서 아이를 이해하고 도울 수 있는 기법을 배웁니다."
        },
        {
          title: "놀이 치료 홈 활동",
          description: "집에서 쉽게 할 수 있는 놀이 치료 활동들을 소개합니다.",
          youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('놀이치료 가정활동')}`,
          category: "치료방법",
          duration: "10-15분",
          reason: "일상에서 자연스럽게 적용할 수 있는 치료적 놀이로 발달을 도울 수 있습니다."
        },
        {
          title: "발달 단계별 체크리스트",
          description: "현재 발달 수준을 정확히 파악하고 다음 단계를 준비하는 가이드입니다.",
          youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(ageGroupMap[requestBody.ageGroup] + ' 발달 체크리스트')}`,
          category: "발달평가",
          duration: "8-12분",
          reason: "체계적인 발달 평가를 통해 현재 상태를 정확히 파악하고 적절한 다음 단계를 계획할 수 있습니다."
        }
      ];

      recommendations.push(...fallbackRecommendations.slice(0, 5 - recommendations.length));
    }

    logStep('Final recommendations prepared', { count: recommendations.length });

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