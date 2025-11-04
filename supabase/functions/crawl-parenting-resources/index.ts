import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keywords, childAge, behaviorType } = await req.json();

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) {
      throw new Error('Firecrawl API key not configured');
    }

    console.log('Crawling resources for:', { keywords, childAge, behaviorType });

    // 신뢰할 수 있는 육아 정보 사이트 목록
    const trustedSources = [
      'https://www.koreapediatrics.com',
      'https://www.childcare.go.kr',
      'https://www.mohw.go.kr',
    ];

    // 검색 쿼리 생성
    const searchQuery = `${childAge}세 ${behaviorType} ${keywords.join(' ')}`;
    
    // 각 소스에서 관련 정보 크롤링
    const crawlResults = [];
    
    for (const source of trustedSources) {
      try {
        const crawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: source,
            formats: ['markdown'],
            onlyMainContent: true,
            limit: 3,
          }),
        });

        if (crawlResponse.ok) {
          const data = await crawlResponse.json();
          
          if (data.success && data.data) {
            // 관련성 있는 내용만 필터링
            const relevantContent = {
              source: source,
              title: data.data.metadata?.title || '제목 없음',
              content: data.data.markdown || data.data.html || '',
              url: data.data.metadata?.url || source,
              scrapedAt: new Date().toISOString(),
            };

            crawlResults.push(relevantContent);
          }
        }
      } catch (error) {
        console.error(`Error crawling ${source}:`, error);
        // 개별 소스 실패는 무시하고 계속 진행
      }
    }

    // 추가로 일반 웹 검색 크롤링 (제한적으로)
    try {
      const searchUrl = `https://search.naver.com/search.naver?query=${encodeURIComponent(searchQuery)}`;
      const searchResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: searchUrl,
          formats: ['markdown'],
          onlyMainContent: true,
        }),
      });

      if (searchResponse.ok) {
        const data = await searchResponse.json();
        if (data.success && data.data) {
          crawlResults.push({
            source: 'Naver Search',
            title: `${searchQuery} 검색 결과`,
            content: data.data.markdown || data.data.html || '',
            url: searchUrl,
            scrapedAt: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Error crawling search results:', error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        query: searchQuery,
        resultsCount: crawlResults.length,
        resources: crawlResults,
        message: `${crawlResults.length}개의 관련 자료를 찾았습니다.`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Crawl error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
