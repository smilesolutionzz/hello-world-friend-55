import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { testType, results, analysis, testInfo, ageGroup } = await req.json();

    console.log('Saving test result:', { testType, userId: user.id, ageGroup });

    // 사용자 프로필 조회 먼저
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile not found:', profileError);
      return new Response(
        JSON.stringify({ error: '사용자 프로필을 찾을 수 없습니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 검사 결과를 assessments 테이블에 저장
    const { data: savedResult, error: saveError } = await supabaseClient
      .from('assessments')
      .insert({
        profile_id: profile.id,
        user_id: user.id,
        age_group: ageGroup || 'adult',
        results: {
          testType,
          scores: results,
          analysis,
          testInfo,
          savedAt: new Date().toISOString()
        },
        analysis: analysis?.substring(0, 1000) || '', // 분석 내용 요약
        risk_level: calculateRiskLevel(results),
        age_at_assessment: testInfo?.age || null
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving assessment:', saveError);
      throw new Error('검사 결과 저장에 실패했습니다.');
    }

    // 향후 enhanced_analysis 테이블에도 저장 가능
    const { error: enhancedSaveError } = await supabaseClient
      .from('assessment_enhanced_analysis')
      .insert({
        user_id: user.id,
        assessment_type: testType,
        enhanced_analysis: analysis || '',
        raw_results: results,
        score_interpretation: {
          summary: generateScoreSummary(results),
          recommendations: generateRecommendations(testType, results)
        },
        risk_level: calculateRiskLevel(results)
      });

    if (enhancedSaveError) {
      console.warn('Warning: Enhanced analysis save failed:', enhancedSaveError);
      // 기본 저장이 성공했으므로 경고만 로그
    }

    return new Response(JSON.stringify({
      success: true,
      message: '검사 결과가 성공적으로 저장되었습니다.',
      resultId: savedResult.id,
      savedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error saving test result:', error);
    return new Response(
      JSON.stringify({ error: error.message || '결과 저장 중 오류가 발생했습니다.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateRiskLevel(results: any): string {
  // 결과에 따른 위험도 계산
  if (!results) return 'low';
  
  const scores = Object.values(results).filter(v => typeof v === 'number') as number[];
  if (scores.length === 0) return 'low';
  
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const maxScore = Math.max(...scores);
  
  if (average > 7 || maxScore > 8) {
    return 'high';
  } else if (average > 5 || maxScore > 6) {
    return 'medium';
  }
  
  return 'low';
}

function generateScoreSummary(results: any): string {
  const scores = Object.entries(results)
    .filter(([key, value]) => typeof value === 'number')
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
  
  return `검사 점수 요약: ${scores}`;
}

function generateRecommendations(testType: string, results: any): string[] {
  const recommendations = ['정기적인 자기 관찰과 모니터링'];
  
  switch (testType) {
    case 'ADHD 검사':
      recommendations.push('주의집중력 향상을 위한 환경 조성');
      recommendations.push('규칙적인 일과와 루틴 개발');
      break;
    case '우울증 검사':
      recommendations.push('규칙적인 운동과 수면 패턴 유지');
      recommendations.push('사회적 활동 참여 증가');
      break;
    case '언어발달 검사':
      recommendations.push('연령에 맞는 언어 자극 활동');
      recommendations.push('부모-아동 상호작용 증진');
      break;
    default:
      recommendations.push('전문가와의 정기적 상담');
  }
  
  recommendations.push('필요시 전문가 상담 고려');
  
  return recommendations;
}