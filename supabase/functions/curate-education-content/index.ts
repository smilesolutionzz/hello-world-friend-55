import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topics, ageGroup, contentType } = await req.json();

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!FIRECRAWL_API_KEY || !OPENAI_API_KEY) {
      throw new Error('Required API keys not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Curating education content:', { topics, ageGroup, contentType });

    // Educational sources
    const educationSources = [
      'https://www.childcare.go.kr',
      'https://www.koreapediatrics.com',
      'https://www.mohw.go.kr',
      'https://www.unesco.or.kr',
    ];

    const curatedContent = [];

    // Search each source
    for (const source of educationSources) {
      try {
        const searchQuery = topics.join(' ') + (ageGroup ? ` ${ageGroup}` : '');
        
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
          }),
        });

        if (crawlResponse.ok) {
          const data = await crawlResponse.json();
          
          if (data.success && data.data) {
            const content = data.data.markdown || data.data.html || '';
            const title = data.data.metadata?.title || '교육 자료';
            const url = data.data.metadata?.url || source;

            // Analyze relevance with OpenAI
            const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemini-3-flash-preview',
                messages: [
                  {
                    role: 'system',
                    content: '교육 콘텐츠 큐레이터입니다. 콘텐츠의 관련성과 품질을 평가하고 요약하세요. JSON 형식으로 응답: {relevance: 0-100, summary: "200자 요약", tags: ["태그1", "태그2"], contentType: "article|research|guide"}'
                  },
                  {
                    role: 'user',
                    content: `주제: ${searchQuery}\n나이: ${ageGroup || '전체'}\n\n콘텐츠:\n${content.substring(0, 1500)}\n\n이 콘텐츠를 평가하고 요약하세요.`
                  }
                ],
                temperature: 0.5,
              }),
            });

            const analysisData = await analysisResponse.json();
            const analysisText = analysisData.choices[0]?.message?.content || '{}';
            
            let analysis;
            try {
              analysis = JSON.parse(analysisText);
            } catch {
              analysis = {
                relevance: 50,
                summary: content.substring(0, 200),
                tags: topics,
                contentType: contentType || 'article',
              };
            }

            // Only add if relevance is high enough
            if (analysis.relevance >= 60) {
              curatedContent.push({
                title,
                source_url: url,
                source_name: new URL(source).hostname,
                content_type: analysis.contentType || contentType || 'article',
                summary: analysis.summary,
                full_content: content.substring(0, 5000),
                tags: analysis.tags || topics,
                target_age_group: ageGroup,
                relevance_score: analysis.relevance,
                is_published: false,
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error curating from ${source}:`, error);
      }
    }

    // Save to database
    if (curatedContent.length > 0) {
      const { error: insertError } = await supabase
        .from('curated_education_content')
        .insert(curatedContent);

      if (insertError) {
        console.error('Error saving curated content:', insertError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: curatedContent.length,
        content: curatedContent,
        message: `${curatedContent.length}개의 교육 콘텐츠를 큐레이션했습니다.`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Content curation error:', error);
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
