import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
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
    // --- AUTH: verify caller's JWT ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: userData, error: userErr } = await authClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = userData.user.id; // Trust JWT, ignore client-supplied userId

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('AI Personalized Suggestions request:', { userId });

    const [assessments, observations, checkins, coachingSessions, challenges] = await Promise.all([
      supabase.from('assessments').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
      supabase.from('observation_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      supabase.from('daily_checkins').select('*').eq('user_id', userId).order('checkin_date', { ascending: false }).limit(7),
      supabase.from('ai_coaching_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(3),
      supabase.from('user_challenges').select('*, challenges(*)').eq('user_id', userId).order('started_at', { ascending: false }).limit(5)
    ]);

    const userContext = {
      hasAssessments: (assessments.data?.length || 0) > 0,
      assessmentCount: assessments.data?.length || 0,
      latestAssessment: assessments.data?.[0],
      observationCount: observations.data?.length || 0,
      recentObservations: observations.data?.slice(0, 3),
      checkinStreak: checkins.data?.length || 0,
      avgMoodScore: calculateAverage(checkins.data?.map(c => c.mood_score) || []),
      avgEnergyLevel: calculateAverage(checkins.data?.map(c => c.energy_level) || []),
      avgStressLevel: calculateAverage(checkins.data?.map(c => c.stress_level) || []),
      coachingSessionCount: coachingSessions.data?.length || 0,
      activeChallenges: challenges.data?.filter((c: any) => c.status === 'active').length || 0,
      completedChallenges: challenges.data?.filter((c: any) => c.status === 'completed').length || 0
    };

    const systemPrompt = `당신은 정신건강 플랫폼의 AI 추천 전문가입니다. 
사용자의 활동 데이터를 분석하여 가장 적합한 다음 단계를 추천해주세요.

다음 형식의 JSON으로 응답해주세요:
{
  "suggestion": {
    "type": "assessment|observation|ai_counseling|challenge|checkin|comprehensive_report|expert_consultation",
    "title": "추천 제목 (15자 이내)",
    "description": "추천 이유 설명 (40자 이내)",
    "action": "액션 버튼 텍스트 (10자 이내)",
    "route": "/경로",
    "badge": "배지 텍스트 (5자 이내)",
    "priority": "high|medium|low",
    "reasoning": "AI가 이 추천을 한 이유 (100자 이내)",
    "expectedBenefit": "예상 효과 (30자 이내)"
  }
}`;

    const userPrompt = `사용자 활동 분석:
- 검사 완료: ${userContext.hasAssessments ? '있음' : '없음'} (${userContext.assessmentCount}회)
- 최근 검사 결과: ${userContext.latestAssessment ? JSON.stringify(userContext.latestAssessment.risk_level) : '없음'}
- 관찰일지 기록: ${userContext.observationCount}회
- 체크인 연속일: ${userContext.checkinStreak}일
- 평균 기분: ${userContext.avgMoodScore.toFixed(1)}/10
- 평균 에너지: ${userContext.avgEnergyLevel.toFixed(1)}/10
- 평균 스트레스: ${userContext.avgStressLevel.toFixed(1)}/10
- AI 상담 이용: ${userContext.coachingSessionCount}회
- 진행 중 챌린지: ${userContext.activeChallenges}개
- 완료한 챌린지: ${userContext.completedChallenges}개`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let suggestionResult;
    try {
      suggestionResult = JSON.parse(data.choices[0].message.content);
    } catch {
      suggestionResult = createFallbackSuggestion(userContext);
    }

    return new Response(JSON.stringify(suggestionResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-personalized-suggestions function:', error);
    return new Response(JSON.stringify({
      suggestion: createFallbackSuggestion({ hasAssessments: false, assessmentCount: 0, observationCount: 0 })
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

function createFallbackSuggestion(context: any) {
  if (!context.hasAssessments) {
    return {
      type: 'assessment',
      title: '첫 검사로 시작하기',
      description: '현재 심리상태 파악부터 시작해보세요',
      action: '검사 시작',
      route: '/assessment',
      badge: '3분',
      priority: 'high',
      reasoning: '정확한 추천을 위해 먼저 현재 상태를 파악하는 것이 중요합니다.',
      expectedBenefit: '맞춤형 케어 플랜 제공'
    };
  } else if (context.observationCount < 3) {
    return {
      type: 'observation',
      title: '관찰일지 작성하기',
      description: '일상 패턴을 기록하고 인사이트를 얻으세요',
      action: '일지 작성',
      route: '/observation',
      badge: '매일',
      priority: 'medium',
      reasoning: '패턴 분석을 위해 더 많은 데이터가 필요합니다.',
      expectedBenefit: '패턴 발견 및 개선점 파악'
    };
  } else {
    return {
      type: 'ai_counseling',
      title: 'AI 상담 받기',
      description: '축적된 데이터로 깊이 있는 분석을 받아보세요',
      action: 'AI 상담',
      route: '/ai-counselor',
      badge: '맞춤',
      priority: 'high',
      reasoning: '충분한 데이터가 축적되어 심층 분석이 가능합니다.',
      expectedBenefit: '개인화된 솔루션 제공'
    };
  }
}
