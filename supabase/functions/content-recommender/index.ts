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

    // Perplexity API로 실제 유튜브 컨텐츠 추천
    logStep('Generating recommendations with Perplexity');

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: '당신은 유튜브 컨텐츠 추천 전문가입니다. 실제 존재하는 유튜브 동영상만을 추천하고, 정확한 링크를 제공합니다. 반드시 JSON 형식으로 답변하세요.'
          },
          {
            role: 'user',
            content: `다음 관찰 기록을 바탕으로 실제 존재하는 유튜브 컨텐츠 5개를 추천해주세요:

**관찰 정보:**
- 연령대: ${ageGroupMap[requestBody.ageGroup]}
- 관찰 영역: ${requestBody.tags.join(', ')}
- 관찰 내용: ${requestBody.observationText}
${requestBody.analysisResult ? `- AI 분석 결과: ${requestBody.analysisResult}` : ''}

다음 형식의 JSON으로 응답해주세요:

{
  "recommendations": [
    {
      "title": "실제 동영상 제목",
      "description": "컨텐츠에 대한 간단한 설명 (2-3문장)",
      "youtubeUrl": "https://www.youtube.com/watch?v=실제영상ID",
      "category": "발달놀이|부모교육|치료방법|행동교정|감정조절|사회성향상 중 하나",
      "duration": "실제 영상 길이",
      "reason": "이 컨텐츠가 관찰 내용에 도움이 되는 구체적인 이유"
    }
  ]
}

중요 조건:
1. 반드시 실제 존재하는 유튜브 동영상만 추천하세요
2. 실제 작동하는 유튜브 URL (https://www.youtube.com/watch?v= 형식)을 제공하세요
3. 관찰 내용과 직접적으로 관련된 컨텐츠만 추천하세요
4. 전문가가 진행하는 신뢰할 수 있는 컨텐츠를 우선으로 하세요
5. JSON 형식을 정확히 지켜주세요`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'month'
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const contentText = aiResponse.choices[0].message.content;
    
    logStep('Perplexity response received', { textLength: contentText.length });

    // Parse JSON response
    let recommendations: RecommendedContent[] = [];
    
    try {
      const jsonMatch = contentText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        recommendations = parsed.recommendations || [];
      }
    } catch (parseError) {
      logStep('JSON parsing failed, using fallback recommendations', { error: parseError });
      
      // 최종 fallback - 일반적인 육아/발달 관련 검색 결과로 연결
      recommendations = [
        {
          title: "아동 발달을 위한 부모 가이드",
          description: "전문가가 알려주는 아동 발달 지원 방법과 실용적인 팁을 제공합니다.",
          youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(ageGroupMap[requestBody.ageGroup] + ' ' + requestBody.tags.join(' ') + ' 발달')}`,
          category: "부모교육",
          duration: "10-15분",
          reason: "관찰된 발달 영역에 대한 전문적인 지도법을 배울 수 있습니다."
        },
        {
          title: "실용적인 육아 솔루션",
          description: "일상에서 쉽게 적용할 수 있는 육아 방법과 문제 해결 팁을 제공합니다.",
          youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(requestBody.observationText + ' 해결방법')}`,
          category: "행동교정", 
          duration: "8-12분",
          reason: "관찰된 상황에 맞는 구체적인 해결방안을 찾을 수 있습니다."
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