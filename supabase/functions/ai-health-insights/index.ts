import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { userId, checkinData, challengeHistory } = await req.json();

    console.log('AI Health Insights request:', { userId, checkinData });

    // Generate personalized insights based on user data
    const insights = await generateHealthInsights(userId, checkinData, challengeHistory);

    // Store insights in database
    const { error: insertError } = await supabase
      .from('ai_health_insights')
      .insert(insights.map(insight => ({
        user_id: userId,
        ...insight
      })));

    if (insertError) {
      console.error('Error storing insights:', insertError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      insights: insights 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in AI health insights:', error);
    const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown error');
    return new Response(JSON.stringify({ 
      error: message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateHealthInsights(userId: string, checkinData: any, challengeHistory: any[]) {
  const prompt = `다음 사용자의 건강 데이터를 분석하고 개인맞춤 인사이트를 생성해주세요:

체크인 데이터: ${JSON.stringify(checkinData)}
챌린지 이력: ${JSON.stringify(challengeHistory)}

각 인사이트는 다음 형식으로 반환해주세요:
1. 기분 분석 (mood_analysis)
2. 에너지 관리 (energy_boost) 
3. 스트레스 완화 (stress_relief)
4. 일일 추천사항 (daily_recommendation)

각 인사이트는 구체적이고 실행 가능한 조언을 포함해야 합니다.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: '당신은 개인맞춤 건강 인사이트를 제공하는 AI 전문가입니다. 사용자의 데이터를 분석하여 실용적이고 개인화된 건강 조언을 제공합니다.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse and structure the insights
    return [
      {
        insight_type: 'mood_analysis',
        content: `기분 분석: ${extractInsightSection(content, '기분')}`,
        confidence_score: 0.85
      },
      {
        insight_type: 'energy_boost',
        content: `에너지 관리: ${extractInsightSection(content, '에너지')}`,
        confidence_score: 0.80
      },
      {
        insight_type: 'stress_relief',
        content: `스트레스 완화: ${extractInsightSection(content, '스트레스')}`,
        confidence_score: 0.90
      },
      {
        insight_type: 'daily_recommendation',
        content: `오늘의 추천: ${extractInsightSection(content, '추천')}`,
        confidence_score: 0.88
      }
    ];
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Return fallback insights
    return [
      {
        insight_type: 'daily_recommendation',
        content: '오늘도 건강한 하루를 위해 충분한 수분 섭취와 가벼운 운동을 추천합니다.',
        confidence_score: 0.5
      }
    ];
  }
}

function extractInsightSection(content: string, keyword: string): string {
  const lines = content.split('\n');
  const relevantLines = lines.filter(line => 
    line.toLowerCase().includes(keyword.toLowerCase())
  );
  return relevantLines.length > 0 ? relevantLines[0] : `${keyword} 관련 개인맞춤 조언을 제공합니다.`;
}