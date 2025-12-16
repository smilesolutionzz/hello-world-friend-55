import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 신뢰할 수 있는 정신건강/위기 예방 자료 출처
const TRUSTED_CRISIS_SOURCES = [
  {
    url: 'https://www.mohw.go.kr',
    name: '보건복지부',
    category: 'government'
  },
  {
    url: 'https://www.129.go.kr',
    name: '정신건강위기상담전화',
    category: 'crisis_hotline'
  },
  {
    url: 'https://www.mentalhealth.go.kr',
    name: '국가정신건강정보포털',
    category: 'mental_health'
  },
  {
    url: 'https://www.cyber1388.kr',
    name: '청소년사이버상담센터',
    category: 'youth_counseling'
  },
  {
    url: 'https://www.kyci.or.kr',
    name: '한국청소년상담복지개발원',
    category: 'youth_welfare'
  },
  {
    url: 'https://www.childabuse.or.kr',
    name: '중앙아동보호전문기관',
    category: 'child_protection'
  }
];

// 위기 관련 키워드
const CRISIS_KEYWORDS = [
  '자살예방', '우울증', '정신건강', '위기상담', '청소년상담',
  '자해', '트라우마', 'PTSD', '불안장애', '공황장애',
  '학교폭력', '가정폭력', '아동학대', '성폭력', '온라인성착취'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, category, searchQuery, url } = await req.json();

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) {
      throw new Error('Firecrawl API key not configured');
    }

    console.log('Crisis resources crawl action:', action);

    let result;

    switch (action) {
      case 'scrape':
        // 단일 URL 스크래핑
        result = await scrapeSingleUrl(FIRECRAWL_API_KEY, url);
        break;

      case 'search':
        // 위기 관련 검색
        result = await searchCrisisContent(FIRECRAWL_API_KEY, searchQuery);
        break;

      case 'crawl_trusted':
        // 신뢰할 수 있는 출처 크롤링
        result = await crawlTrustedSources(FIRECRAWL_API_KEY, category);
        break;

      case 'map_resources':
        // 특정 사이트의 모든 리소스 URL 매핑
        result = await mapResourceUrls(FIRECRAWL_API_KEY, url);
        break;

      case 'build_knowledge_base':
        // 위기 개입 지식 베이스 구축
        result = await buildCrisisKnowledgeBase(FIRECRAWL_API_KEY);
        break;

      default:
        throw new Error('Invalid action');
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...result,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Crisis crawl error:', error);
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

async function scrapeSingleUrl(apiKey: string, url: string) {
  console.log('Scraping URL:', url);

  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      formats: ['markdown', 'html'],
      onlyMainContent: true,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Scrape failed');
  }

  return {
    action: 'scrape',
    data: {
      url,
      title: data.data?.metadata?.title || '제목 없음',
      description: data.data?.metadata?.description || '',
      content: data.data?.markdown || '',
      sourceUrl: data.data?.metadata?.sourceURL || url,
    }
  };
}

async function searchCrisisContent(apiKey: string, query: string) {
  console.log('Searching crisis content:', query);

  // 검색어에 위기 관련 키워드 추가
  const enhancedQuery = `${query} (자살예방 OR 정신건강 OR 위기상담 OR 청소년상담)`;

  const response = await fetch('https://api.firecrawl.dev/v1/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: enhancedQuery,
      limit: 10,
      lang: 'ko',
      country: 'kr',
      scrapeOptions: {
        formats: ['markdown'],
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Search failed');
  }

  // 결과 필터링 - 신뢰할 수 있는 출처 우선
  const results = (data.data || []).map((item: any) => ({
    url: item.url,
    title: item.title,
    description: item.description,
    content: item.markdown?.substring(0, 1000) || '',
    isTrusted: TRUSTED_CRISIS_SOURCES.some(source => 
      item.url?.includes(new URL(source.url).hostname)
    ),
  }));

  // 신뢰할 수 있는 출처를 상위로 정렬
  results.sort((a: any, b: any) => (b.isTrusted ? 1 : 0) - (a.isTrusted ? 1 : 0));

  return {
    action: 'search',
    query,
    resultsCount: results.length,
    results,
  };
}

async function crawlTrustedSources(apiKey: string, category?: string) {
  console.log('Crawling trusted sources, category:', category);

  const sourcesToCrawl = category 
    ? TRUSTED_CRISIS_SOURCES.filter(s => s.category === category)
    : TRUSTED_CRISIS_SOURCES;

  const crawlResults = [];

  for (const source of sourcesToCrawl) {
    try {
      const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: source.url,
          formats: ['markdown'],
          onlyMainContent: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          crawlResults.push({
            source: source.name,
            category: source.category,
            url: source.url,
            title: data.data.metadata?.title || source.name,
            content: data.data.markdown?.substring(0, 2000) || '',
            scrapedAt: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error(`Error crawling ${source.name}:`, error);
    }
  }

  return {
    action: 'crawl_trusted',
    category: category || 'all',
    sourcesCount: crawlResults.length,
    sources: crawlResults,
  };
}

async function mapResourceUrls(apiKey: string, url: string) {
  console.log('Mapping resource URLs:', url);

  const response = await fetch('https://api.firecrawl.dev/v1/map', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      limit: 100,
      includeSubdomains: false,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Map failed');
  }

  // 위기 관련 URL만 필터링
  const crisisRelatedUrls = (data.links || []).filter((link: string) =>
    CRISIS_KEYWORDS.some(keyword => 
      link.toLowerCase().includes(keyword) || 
      decodeURIComponent(link).includes(keyword)
    )
  );

  return {
    action: 'map_resources',
    url,
    totalUrls: data.links?.length || 0,
    crisisRelatedUrls: crisisRelatedUrls.slice(0, 50),
    crisisUrlsCount: crisisRelatedUrls.length,
  };
}

async function buildCrisisKnowledgeBase(apiKey: string) {
  console.log('Building crisis knowledge base...');

  const knowledgeBase = {
    hotlines: [],
    interventionGuides: [],
    youthResources: [],
    mentalHealthInfo: [],
  };

  // 각 카테고리별 크롤링
  const categories = ['crisis_hotline', 'youth_counseling', 'mental_health', 'child_protection'];
  
  for (const category of categories) {
    const sources = TRUSTED_CRISIS_SOURCES.filter(s => s.category === category);
    
    for (const source of sources) {
      try {
        const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: source.url,
            formats: ['markdown'],
            onlyMainContent: true,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.data) {
            const entry = {
              name: source.name,
              url: source.url,
              content: data.data.markdown?.substring(0, 3000) || '',
              lastUpdated: new Date().toISOString(),
            };

            switch (category) {
              case 'crisis_hotline':
                knowledgeBase.hotlines.push(entry);
                break;
              case 'youth_counseling':
              case 'youth_welfare':
                knowledgeBase.youthResources.push(entry);
                break;
              case 'mental_health':
                knowledgeBase.mentalHealthInfo.push(entry);
                break;
              case 'child_protection':
                knowledgeBase.interventionGuides.push(entry);
                break;
            }
          }
        }
      } catch (error) {
        console.error(`Error building KB from ${source.name}:`, error);
      }
    }
  }

  return {
    action: 'build_knowledge_base',
    knowledgeBase,
    totalEntries: 
      knowledgeBase.hotlines.length +
      knowledgeBase.interventionGuides.length +
      knowledgeBase.youthResources.length +
      knowledgeBase.mentalHealthInfo.length,
    buildTime: new Date().toISOString(),
  };
}
