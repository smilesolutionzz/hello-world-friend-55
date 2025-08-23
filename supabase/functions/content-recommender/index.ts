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

    // Step 1: GPT로 관찰 내용 분석 및 키워드 추출
    const analysisPrompt = `
다음 관찰 기록을 분석하여 도움이 될 만한 유튜브 컨텐츠 검색 키워드를 추천해주세요:

**관찰 정보:**
- 연령대: ${ageGroupMap[requestBody.ageGroup]}
- 관찰 영역: ${requestBody.tags.join(', ')}
- 관찰 내용: ${requestBody.observationText}
${requestBody.analysisResult ? `- AI 분석 결과: ${requestBody.analysisResult}` : ''}

다음 JSON 형식으로 5개의 검색 키워드를 제공해주세요:

{
  "searchQueries": [
    {
      "keyword": "구체적인 한국어 검색어",
      "category": "발달놀이|부모교육|치료방법|행동교정|감정조절|사회성향상 중 하나",
      "purpose": "이 검색어로 찾고자 하는 컨텐츠 목적"
    }
  ]
}

검색어 예시:
- "3세 아이 떼쓰기 대처방법"
- "유아 언어발달 놀이"
- "ADHD 아동 집중력 높이는 방법"
- "자폐 아동 사회성 향상 활동"

실제 유튜브에서 검색했을 때 관련 동영상이 많이 나올 수 있는 키워드로 작성해주세요.
`;

    logStep('Analyzing observation for keywords');
    
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: '당신은 아동발달, 육아, 교육 전문가입니다. 관찰 기록을 바탕으로 실제 도움이 되는 유튜브 검색 키워드를 추천합니다.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!analysisResponse.ok) {
      throw new Error(`OpenAI API error: ${analysisResponse.status}`);
    }

    const analysisData = await analysisResponse.json();
    const analysisText = analysisData.choices[0].message.content;
    
    logStep('Analysis completed', { textLength: analysisText.length });

    // Parse search queries
    let searchQueries: Array<{keyword: string, category: string, purpose: string}> = [];
    
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        searchQueries = parsed.searchQueries || [];
      }
    } catch (parseError) {
      logStep('Analysis parsing failed, using fallback');
      searchQueries = [
        { keyword: `${ageGroupMap[requestBody.ageGroup]} 발달 놀이`, category: '발달놀이', purpose: '발달 촉진' },
        { keyword: `${ageGroupMap[requestBody.ageGroup]} 행동 문제 해결`, category: '행동교정', purpose: '행동 개선' }
      ];
    }

    // Step 2: Perplexity API로 실제 유튜브 동영상 검색
    logStep('Searching for YouTube videos with Perplexity', { queryCount: searchQueries.length });
    
    const recommendations: RecommendedContent[] = [];
    
    for (const query of searchQueries.slice(0, 3)) { // 처리 시간을 고려해 3개로 제한
      try {
        logStep('Searching with query', { keyword: query.keyword });
        
        const searchPrompt = `유튜브에서 "${query.keyword}"와 관련된 실제 존재하는 동영상을 찾아주세요. 
        
다음 정보를 포함해서 1-2개의 동영상을 추천해주세요:
- 동영상 제목
- 채널명
- 실제 유튜브 URL (https://www.youtube.com/watch?v=형식)
- 동영상 설명 (1-2문장)
- 대략적인 재생 시간

응답은 다음 형식으로 해주세요:
제목: [동영상 제목]
채널: [채널명]  
URL: [실제 유튜브 URL]
설명: [간단한 설명]
시간: [재생 시간]

---

제목: [두 번째 동영상 제목]
채널: [채널명]
URL: [실제 유튜브 URL]  
설명: [간단한 설명]
시간: [재생 시간]`;

        const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${perplexityApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-sonar-large-128k-online',
            messages: [
              {
                role: 'system',
                content: '당신은 유튜브 검색 전문가입니다. 사용자가 요청한 키워드로 실제 존재하는 유튜브 동영상을 찾아서 추천해주세요. 반드시 실제 존재하는 URL만 제공하세요.'
              },
              {
                role: 'user',
                content: searchPrompt
              }
            ],
            temperature: 0.2,
            top_p: 0.9,
            max_tokens: 1000,
            return_images: false,
            return_related_questions: false,
            search_domain_filter: ['youtube.com'],
            search_recency_filter: 'month',
            frequency_penalty: 1,
            presence_penalty: 0
          }),
        });

        if (!perplexityResponse.ok) {
          logStep('Perplexity API error', { status: perplexityResponse.status });
          continue;
        }

        const perplexityData = await perplexityResponse.json();
        const searchResult = perplexityData.choices[0].message.content;
        
        logStep('Perplexity search result', { textLength: searchResult.length });

        // Parse Perplexity response
        const videos = searchResult.split('---').map(section => {
          const lines = section.trim().split('\n');
          const video: any = {};
          
          lines.forEach(line => {
            if (line.startsWith('제목:')) video.title = line.replace('제목:', '').trim();
            if (line.startsWith('채널:')) video.channel = line.replace('채널:', '').trim();
            if (line.startsWith('URL:')) video.url = line.replace('URL:', '').trim();
            if (line.startsWith('설명:')) video.description = line.replace('설명:', '').trim();
            if (line.startsWith('시간:')) video.duration = line.replace('시간:', '').trim();
          });
          
          return video;
        }).filter(video => video.title && video.url && video.url.includes('youtube.com'));

        // Add to recommendations
        videos.forEach(video => {
          if (recommendations.length < 5) {
            recommendations.push({
              title: video.title,
              description: video.description || `${query.category} 관련 도움이 되는 영상입니다.`,
              youtubeUrl: video.url,
              category: query.category,
              duration: video.duration || '10-15분',
              reason: `${query.purpose}에 도움이 되는 실제 전문가 영상입니다.`
            });
          }
        });

        // 검색 간 짧은 딜레이
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (searchError) {
        logStep('Error searching for videos', { error: searchError, keyword: query.keyword });
        continue;
      }
    }

    // 검색 결과가 부족하면 GPT 기반 추천 추가
    if (recommendations.length < 3) {
      logStep('Adding GPT-based fallback recommendations');
      
      const fallbackRecommendations = [
        {
          title: "아동 발달 전문가와 함께하는 교육법",
          description: "아이의 발달 단계에 맞는 교육 방법을 전문가가 설명합니다.",
          youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQueries[0]?.keyword || '아동 발달')}`,
          category: searchQueries[0]?.category || "부모교육",
          duration: "15-20분",
          reason: "관찰된 발달 상황에 맞는 전문적인 교육 방법을 배울 수 있습니다."
        },
        {
          title: "놀이를 통한 아이 성장 가이드",
          description: "일상 놀이를 통해 아이의 발달을 도울 수 있는 방법을 소개합니다.",
          youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQueries[1]?.keyword || '발달놀이')}`,
          category: "발달놀이",
          duration: "10-15분",
          reason: "놀이를 통해 자연스럽게 발달을 촉진할 수 있는 방법을 제공합니다."
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