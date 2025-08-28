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

    // Step 1: GPT로 관찰 내용 분석 및 키워드 추출
    const isAdult = requestBody.ageGroup === 'adult';
    
    const analysisPrompt = `
다음 관찰 기록을 분석하여 도움이 될 만한 컨텐츠 검색 키워드를 추천해주세요:

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
      "category": "${isAdult ? '심리상담|스트레스관리|감정조절|인지치료|마음챙김|업무스트레스' : '발달놀이|부모교육|치료방법|행동교정|감정조절|사회성향상'} 중 하나",
      "purpose": "이 검색어로 찾고자 하는 컨텐츠 목적"
    }
  ]
}

검색어 예시:
${isAdult ? `- "성인 불안 완화 방법"
- "업무 스트레스 관리 기술"
- "감정조절 훈련법"
- "마음챙김 명상 실습"` : `- "3세 아이 떼쓰기 대처방법"
- "유아 언어발달 놀이"
- "ADHD 아동 집중력 높이는 방법"
- "자폐 아동 사회성 향상 활동"`}

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
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `당신은 ${isAdult ? '심리상담, 스트레스 관리, 정신건강' : '아동발달, 육아, 교육'} 전문가입니다. 관찰 기록을 바탕으로 실제 도움이 되는 검색 키워드를 추천합니다.`
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_completion_tokens: 1000,
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
    
    for (const query of searchQueries.slice(0, 5)) { // 5개로 확대
      try {
        // 1차: 유튜브 동영상 검색
        const youtubeSearchPrompt = `"${query.keyword}"에 대한 실제 유튜브 동영상을 검색해서 구체적인 영상 정보를 제공해주세요.

요청사항:
1. 실제 존재하는 유튜브 동영상만 찾아주세요
2. 각 동영상의 정확한 URL (https://www.youtube.com/watch?v=VIDEO_ID 형식)을 제공해주세요
3. 현재 활성화된 동영상만 추천해주세요
4. 1-2개의 가장 관련성 높은 동영상만 선별해주세요

다음 정보를 정확히 포함해서 응답해주세요:

제목: [정확한 동영상 제목]
채널: [채널명]
URL: [https://www.youtube.com/watch?v=정확한비디오ID]
설명: [동영상 내용 설명 1-2문장]
시간: [재생 시간 예: 10분 30초]

---

제목: [두 번째 동영상 제목]
채널: [채널명]  
URL: [https://www.youtube.com/watch?v=정확한비디오ID]
설명: [동영상 내용 설명 1-2문장]
시간: [재생 시간 예: 15분]

반드시 실제 존재하는 동영상의 정확한 watch?v= URL을 제공해주세요.`;

        // 2차: 블로그 포스트 검색 (유튜브가 부족할 경우 대안)
        const blogSearchPrompt = `"${query.keyword}"에 대한 도움이 되는 블로그 포스트나 전문가 글을 검색해서 정보를 제공해주세요.

요청사항:
1. 신뢰할 수 있는 블로그나 전문기관의 글만 찾아주세요
2. 실제 존재하는 URL을 제공해주세요
3. 1-2개의 가장 유용한 글만 선별해주세요

다음 정보를 정확히 포함해서 응답해주세요:

제목: [블로그 포스트 제목]
사이트: [블로그명 또는 기관명]
URL: [실제 블로그 URL]
설명: [글 내용 요약 1-2문장]
읽는시간: [예: 5분 읽기]

---

제목: [두 번째 블로그 포스트 제목]
사이트: [블로그명 또는 기관명]
URL: [실제 블로그 URL]
설명: [글 내용 요약 1-2문장]
읽는시간: [예: 7분 읽기]`;

        // 유튜브 검색 먼저 시도
        logStep('Searching YouTube videos', { keyword: query.keyword });
        
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
                content: youtubeSearchPrompt
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

        let foundVideos = [];
        
        if (perplexityResponse.ok) {
          const perplexityData = await perplexityResponse.json();
          const searchResult = perplexityData.choices[0].message.content;
          
          // Parse YouTube response
          foundVideos = searchResult.split('---').map(section => {
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
          }).filter(video => video.title && video.url && video.url.includes('youtube.com/watch'));
          
          logStep('YouTube videos found', { count: foundVideos.length });
        }

        // 유튜브 결과가 부족하면 블로그 검색 추가
        if (foundVideos.length === 0) {
          logStep('No YouTube videos found, searching for blog posts', { keyword: query.keyword });
          
          const blogResponse = await fetch('https://api.perplexity.ai/chat/completions', {
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
                  content: '당신은 웹 검색 전문가입니다. 사용자가 요청한 키워드로 도움이 되는 신뢰할 수 있는 블로그나 전문가 글을 찾아서 추천해주세요.'
                },
                {
                  role: 'user',
                  content: blogSearchPrompt
                }
              ],
              temperature: 0.2,
              top_p: 0.9,
              max_tokens: 1000,
              return_images: false,
              return_related_questions: false,
              search_recency_filter: 'month',
              frequency_penalty: 1,
              presence_penalty: 0
            }),
          });

          if (blogResponse.ok) {
            const blogData = await blogResponse.json();
            const blogResult = blogData.choices[0].message.content;
            
            // Parse blog response
            const blogs = blogResult.split('---').map(section => {
              const lines = section.trim().split('\n');
              const blog: any = {};
              
              lines.forEach(line => {
                if (line.startsWith('제목:')) blog.title = line.replace('제목:', '').trim();
                if (line.startsWith('사이트:')) blog.site = line.replace('사이트:', '').trim();
                if (line.startsWith('URL:')) blog.url = line.replace('URL:', '').trim();
                if (line.startsWith('설명:')) blog.description = line.replace('설명:', '').trim();
                if (line.startsWith('읽는시간:')) blog.readTime = line.replace('읽는시간:', '').trim();
              });
              
              return blog;
            }).filter(blog => blog.title && blog.url);

            logStep('Blog posts found', { count: blogs.length });

            // 블로그 추천을 컨텐츠로 추가
            blogs.forEach(blog => {
              if (recommendations.length < 5) {
                recommendations.push({
                  title: blog.title,
                  description: blog.description || `${query.category} 관련 전문가 글입니다.`,
                  youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(query.keyword)}`,
                  blogUrl: blog.url,
                  category: query.category,
                  duration: blog.readTime || '5분 읽기',
                  reason: `${query.purpose}: ${blog.description || '관련 전문 지식을 제공합니다'}. 신뢰할 수 있는 전문기관에서 검증된 정보로 구체적인 실행 방법과 효과적인 접근법을 배울 수 있습니다.`
                });
              }
            });
          }
        } else {
          // 유튜브 비디오가 있으면 추가
          foundVideos.forEach(video => {
            if (recommendations.length < 5) {
              recommendations.push({
                title: video.title,
                description: video.description || `${query.category} 관련 도움이 되는 영상입니다.`,
                youtubeUrl: video.url,
                category: query.category,
                duration: video.duration || '10-15분',
                reason: `${query.purpose}: ${video.description || '전문가 검증된 방법을 제공합니다'}. 실제 사례와 단계별 가이드를 통해 구체적이고 실용적인 해결책을 배울 수 있어, 일상에서 바로 적용 가능한 효과적인 접근법을 익힐 수 있습니다.`
              });
            }
          });
        }

        // 검색 간 짧은 딜레이
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (searchError) {
        logStep('Error searching for content', { error: searchError, keyword: query.keyword });
        continue;
      }
    }

    // GPT를 활용한 다양한 추천 생성
    if (recommendations.length < 5) {
      logStep('Adding GPT-based comprehensive recommendations');
      
      const gptRecommendationPrompt = `
관찰 기록을 바탕으로 5개의 다양한 컨텐츠를 추천해주세요:

**관찰 정보:**
- 연령대: ${ageGroupMap[requestBody.ageGroup]}
- 관찰 영역: ${requestBody.tags.join(', ')}
- 관찰 내용: ${requestBody.observationText}

다음 JSON 형식으로 5개의 추천을 제공해주세요:

{
  "recommendations": [
    {
      "title": "구체적이고 도움되는 컨텐츠 제목",
      "description": "컨텐츠 내용 설명 (1-2문장)",
      "category": "발달놀이|부모교육|치료방법|행동교정|감정조절|사회성향상|인지치료|스트레스관리 중 하나",
      "searchKeyword": "유튜브 검색용 키워드",
      "duration": "예상 시간 (예: 10-15분)",
      "reason": "이 컨텐츠가 관찰된 상황에 도움이 되는 구체적인 이유"
    }
  ]
}

각 추천은 서로 다른 카테고리와 접근 방식으로 구성해주세요.
`;

      const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
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
          max_completion_tokens: 1500,
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