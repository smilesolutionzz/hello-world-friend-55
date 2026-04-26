import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, reportType = 'weekly' } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 기간 계산
    const now = new Date();
    const periodStart = new Date(now);
    const periodEnd = new Date(now);
    
    if (reportType === 'weekly') {
      periodStart.setDate(now.getDate() - 7);
    } else {
      periodStart.setMonth(now.getMonth() - 1);
    }

    console.log('Generating report for period:', { periodStart, periodEnd });

    // 데이터 수집
    const { data: results } = await supabase
      .from('life_achievement_results')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', periodStart.toISOString())
      .lte('created_at', periodEnd.toISOString());

    const { data: goals } = await supabase
      .from('life_achievement_goals')
      .select('*')
      .eq('user_id', userId);

    const totalTests = results?.length || 0;
    const averageScore = results?.reduce((sum, r) => sum + r.total_score, 0) / (totalTests || 1);
    const goalsCompleted = goals?.filter(g => g.is_completed).length || 0;
    const goalsTotal = goals?.length || 0;

    // 개선률 계산
    let improvementRate = 0;
    if (results && results.length >= 2) {
      const latestScore = results[results.length - 1].total_score;
      const firstScore = results[0].total_score;
      improvementRate = ((latestScore - firstScore) / firstScore) * 100;
    }

    // AI 인사이트 생성
    const prompt = `사용자의 ${reportType === 'weekly' ? '주간' : '월간'} 인생 달성률 리포트를 생성해주세요.

데이터:
- 기간: ${periodStart.toLocaleDateString('ko-KR')} ~ ${periodEnd.toLocaleDateString('ko-KR')}
- 총 테스트 횟수: ${totalTests}회
- 평균 점수: ${averageScore.toFixed(1)}%
- 개선률: ${improvementRate.toFixed(1)}%
- 완료한 목표: ${goalsCompleted}/${goalsTotal}개

다음 형식으로 작성해주세요:

1. 주요 성과 (100자): 이번 기간 동안의 주요 달성 내용
2. 개선 영역 (80자): 가장 많이 개선된 부분
3. 다음 주 목표 (80자): 집중해야 할 영역
4. 격려 메시지 (60자): 따뜻한 응원

친근하고 긍정적인 톤으로 작성해주세요.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: '당신은 따뜻하고 격려하는 인생 코치입니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 600
      }),
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json();
      console.error('OpenAI error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const aiData = await aiResponse.json();
    const aiInsights = aiData.choices[0].message.content;

    console.log('AI insights generated successfully');

    // 리포트 저장
    const { data: report, error: saveError } = await supabase
      .from('life_achievement_reports')
      .insert({
        user_id: userId,
        report_type: reportType,
        period_start: periodStart.toISOString().split('T')[0],
        period_end: periodEnd.toISOString().split('T')[0],
        total_tests: totalTests,
        average_score: averageScore,
        improvement_rate: improvementRate,
        goals_completed: goalsCompleted,
        goals_total: goalsTotal,
        ai_insights: aiInsights
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving report:', saveError);
      throw saveError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        report
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-weekly-report:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});