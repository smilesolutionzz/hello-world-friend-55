import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { chartType, data, title } = await req.json();
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Generate chart description based on type
    let chartPrompt = '';
    
    if (chartType === 'market_growth') {
      chartPrompt = `Create a professional business chart image showing Korean mental health market growth trends. 
      Title: "${title || '시장 성장 추이 (2024-2028)'}"
      
      Design requirements:
      - Clean, minimal Korean business style
      - Blue color scheme (#1a365d, #3182ce, #63b3ed)
      - Line chart showing upward trend
      - Y-axis: 조 (trillion) won units
      - X-axis: Years 2024, 2025, 2026, 2027, 2028
      - Data points: 2.0, 2.3, 2.6, 3.0, 3.5 trillion won
      - Include growth rate annotations (+15%, +12%, +15%, +17%)
      - White background, professional look suitable for business plan
      - Korean labels
      - Aspect ratio 16:9 landscape`;
    } else if (chartType === 'revenue_projection') {
      chartPrompt = `Create a professional bar chart image showing revenue projection for a Korean startup.
      Title: "${title || '매출 전망 (3개년)'}"
      
      Design requirements:
      - Clean, professional Korean business style
      - Gradient blue bars (#2b6cb0 to #4299e1)
      - Y-axis: 억원 (100 million won) units
      - X-axis: 2026년, 2027년, 2028년
      - Data: 3억원, 15억원, 50억원
      - Show percentage growth labels (+400%, +233%)
      - White background
      - Korean labels
      - Include subtle grid lines
      - Aspect ratio 16:9 landscape`;
    } else if (chartType === 'user_growth') {
      chartPrompt = `Create a professional area chart showing user growth projection.
      Title: "${title || '사용자 성장 전망'}"
      
      Design requirements:
      - Clean Korean business style  
      - Gradient fill area chart (light blue to dark blue)
      - Y-axis: 명/만명 (users)
      - X-axis: Monthly from Jan 2026 to Dec 2026
      - Growth curve from 100 to 10,000 users
      - Key milestones marked: 1,000명 (Q1), 3,000명 (Q2), 10,000명 (Q4)
      - White background
      - Korean labels
      - Aspect ratio 16:9 landscape`;
    } else if (chartType === 'market_share') {
      chartPrompt = `Create a professional pie/donut chart showing market opportunity.
      Title: "${title || '목표 시장 구성'}"
      
      Design requirements:
      - Clean, modern Korean business style
      - Donut chart style
      - Segments with labels:
        - TAM 2.5조원 (outer ring, light gray)
        - SAM 3,000억원 (middle, medium blue)  
        - SOM 500억원 (inner, dark blue #1a365d)
      - Clean white background
      - Korean labels
      - Legend on right side
      - Aspect ratio 1:1 square`;
    } else if (chartType === 'competitor_radar') {
      chartPrompt = `Create a professional radar/spider chart comparing competitive advantages.
      Title: "${title || '경쟁력 비교 분석'}"
      
      Design requirements:
      - Clean Korean business style
      - Radar chart with 6 axes: 기술력, 가격경쟁력, 접근성, 전문성, B2B, 콘텐츠
      - Compare 3 companies with different colors:
        - AI HighlightPRO (blue #2b6cb0, highest on most axes)
        - 마보 (gray, focus on 콘텐츠)
        - 트로스트 (light blue, focus on 접근성)
      - White background
      - Korean labels
      - Legend at bottom
      - Aspect ratio 1:1 square`;
    } else if (chartType === 'funnel') {
      chartPrompt = `Create a professional conversion funnel chart.
      Title: "${title || '고객 전환 퍼널'}"
      
      Design requirements:
      - Clean Korean business style
      - Funnel shape, top to bottom
      - Stages with numbers:
        - 방문 10,000명 (widest, light blue)
        - 체험 3,360명 (33.6%, medium blue)
        - 가입 230명 (2.3%, darker blue)
        - 구독 69명 (30%, darkest blue #1a365d)
      - Conversion rates on arrows between stages
      - White background
      - Korean labels
      - Aspect ratio 3:4 portrait`;
    } else {
      chartPrompt = `Create a professional business chart suitable for a Korean startup business plan.
      Title: "${title || 'Business Chart'}"
      Style: Clean, minimal, blue color scheme (#1a365d, #3182ce), white background, Korean labels if applicable.
      Aspect ratio: 16:9 landscape`;
    }

    console.log('Generating chart with prompt:', chartPrompt.substring(0, 200));

    // Use Lovable AI to generate the chart image
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: chartPrompt
          }
        ],
        modalities: ['image', 'text']
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const result = await response.json();
    
    // Extract the image from the response
    const imageData = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageData) {
      console.error('No image in response:', JSON.stringify(result).substring(0, 500));
      throw new Error('No image generated');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        image: imageData,
        chartType 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating chart:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});
