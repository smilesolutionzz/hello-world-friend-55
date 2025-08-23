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

    // 먼저 Perplexity API로 실제 유튜브 컨텐츠 검색
    const searchQuery = `${ageGroupMap[requestBody.ageGroup]} ${requestBody.tags.join(' ')} 유튜브 동영상 추천`;
    
    logStep('Searching YouTube content with Perplexity', { searchQuery });

    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
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
            content: '당신은 유튜브 컨텐츠 검색 전문가입니다. 실제 존재하는 유튜브 동영상의 정확한 링크만 제공하세요.'
          },
          {
            role: 'user',
            content: `다음 조건에 맞는 실제 존재하는 유튜브 동영상 5개를 찾아주세요:
            
연령대: ${ageGroupMap[requestBody.ageGroup]}
관심 영역: ${requestBody.tags.join(', ')}
관찰 내용: ${requestBody.observationText}

각 동영상에 대해 다음 정보를 JSON 형식으로 제공해주세요:
- title: 동영상 제목
- youtubeUrl: 실제 유튜브 URL (https://www.youtube.com/watch?v= 형식)
- channel: 채널명
- description: 간단한 설명
- duration: 영상 길이

실제 존재하는 링크만 제공하고 가상의 링크는 절대 만들지 마세요.`
          }
        ],
        temperature: 0.2,
        max_tokens: 1500,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'month'
      }),
    });

    if (!perplexityResponse.ok) {
      throw new Error(`Perplexity API error: ${perplexityResponse.status}`);
    }

    const perplexityData = await perplexityResponse.json();
    const searchResults = perplexityData.choices[0].message.content;
    
    logStep('Perplexity search completed', { resultsLength: searchResults.length });

    const prompt = `
다음은 실제 유튜브 검색 결과입니다:
${searchResults}

위 검색 결과를 바탕으로 관찰 기록에 도움이 될 만한 유튜브 컨텐츠를 추천해주세요:

**관찰 정보:**
- 연령대: ${ageGroupMap[requestBody.ageGroup]}
- 관찰 영역: ${requestBody.tags.join(', ')}
- 관찰 내용: ${requestBody.observationText}
${requestBody.analysisResult ? `- AI 분석 결과: ${requestBody.analysisResult}` : ''}

다음 형식의 JSON으로 5개의 추천 컨텐츠를 제공해주세요:

{
  "recommendations": [
    {
      "title": "검색 결과에서 가져온 실제 제목",
      "description": "컨텐츠에 대한 간단한 설명 (2-3문장)",
      "youtubeUrl": "검색 결과에서 가져온 실제 유튜브 URL",
      "category": "발달놀이|부모교육|치료방법|행동교정|감정조절|사회성향상 중 하나",
      "duration": "검색 결과의 실제 영상 길이",
      "reason": "이 컨텐츠가 관찰 내용에 도움이 되는 구체적인 이유"
    }
  ]
}

중요사항:
1. 반드시 위 검색 결과에서 제공된 실제 유튜브 링크만 사용하세요
2. 가상의 링크나 추측한 링크는 절대 만들지 마세요
3. 검색 결과가 부족하면 그만큼만 추천하세요
4. JSON 형식을 정확히 지켜주세요
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
      logStep('JSON parsing failed, trying fallback search', { error: parseError });
      
      // 파싱 실패 시 간단한 검색으로 대체
      try {
        const fallbackQuery = `${ageGroupMap[requestBody.ageGroup]} 발달 도움 유튜브`;
        const fallbackResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${perplexityApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-sonar-small-128k-online',
            messages: [
              {
                role: 'user',
                content: `${fallbackQuery} 관련된 실제 존재하는 유튜브 동영상 2개의 제목과 링크를 알려주세요.`
              }
            ],
            temperature: 0.2,
            max_tokens: 500
          }),
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          logStep('Fallback search completed');
        }
      } catch (fallbackError) {
        logStep('Fallback search also failed', { error: fallbackError });
      }
      
      // 최종 fallback recommendations
      recommendations = [
        {
          title: "아동 발달을 위한 부모 가이드",
          description: "전문가가 알려주는 아동 발달 지원 방법과 실용적인 팁을 제공합니다.",
          youtubeUrl: "https://www.youtube.com/results?search_query=아동+발달+부모+가이드",
          category: "부모교육",
          duration: "10-15분",
          reason: "관찰된 발달 영역에 대한 전문적인 지도법을 배울 수 있습니다."
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