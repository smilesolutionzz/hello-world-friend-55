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
    const { postId, content, title } = await req.json();

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!FIRECRAWL_API_KEY || !OPENAI_API_KEY) {
      throw new Error('Required API keys not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fact-checking post:', { postId, title });

    // Extract key claims from the post using OpenAI
    const claimsResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: '당신은 팩트체크 전문가입니다. 게시글에서 검증이 필요한 주요 주장이나 사실들을 추출하세요.'
          },
          {
            role: 'user',
            content: `다음 게시글에서 팩트체크가 필요한 주요 주장 3가지를 추출하세요:\n\n제목: ${title}\n내용: ${content}`
          }
        ],
        temperature: 0.3,
      }),
    });

    const claimsData = await claimsResponse.json();
    const claims = claimsData.choices[0]?.message?.content || '';

    console.log('Extracted claims:', claims);

    // Search for reliable sources using Firecrawl
    const trustedSources = [
      'https://www.koreapediatrics.com',
      'https://www.childcare.go.kr',
      'https://www.mohw.go.kr',
      'https://www.who.int/ko',
    ];

    const sourceResults = [];
    
    for (const source of trustedSources.slice(0, 2)) {
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
          }),
        });

        if (crawlResponse.ok) {
          const data = await crawlResponse.json();
          if (data.success && data.data) {
            sourceResults.push({
              url: source,
              title: data.data.metadata?.title || '신뢰할 수 있는 출처',
              content: data.data.markdown?.substring(0, 500) || '',
            });
          }
        }
      } catch (error) {
        console.error(`Error crawling ${source}:`, error);
      }
    }

    // Analyze with OpenAI
    const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: '당신은 팩트체크 전문가입니다. 주장의 신뢰도를 평가하고 검증된 출처와 비교하세요. 응답은 JSON 형식으로: {status: "verified"|"questionable"|"misleading", confidence: 0-100, summary: "설명"}'
          },
          {
            role: 'user',
            content: `주장: ${claims}\n\n참고 출처:\n${sourceResults.map(s => `- ${s.title}: ${s.content}`).join('\n')}\n\n이 주장의 신뢰도를 평가하세요.`
          }
        ],
        temperature: 0.3,
      }),
    });

    const analysisData = await analysisResponse.json();
    const analysisText = analysisData.choices[0]?.message?.content || '{}';
    
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch {
      analysis = {
        status: 'pending',
        confidence: 50,
        summary: '팩트체크를 완료하지 못했습니다.',
      };
    }

    // Save results to database
    const { error: insertError } = await supabase
      .from('fact_check_results')
      .insert({
        post_id: postId,
        check_status: analysis.status || 'pending',
        confidence_score: analysis.confidence || 50,
        sources: sourceResults,
        summary: analysis.summary || '',
        checked_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error saving fact check:', insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        result: {
          status: analysis.status,
          confidence: analysis.confidence,
          summary: analysis.summary,
          sources: sourceResults,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Fact check error:', error);
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
