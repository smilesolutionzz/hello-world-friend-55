import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[PERSONALIZED-MISSIONS] 개인화된 미션 생성 시작');
    
    const { user_id, regenerate = false } = await req.json();
    
    if (!user_id) {
      throw new Error('user_id is required');
    }

    // Get current week start (Monday)
    const currentWeekStart = new Date();
    const dayOfWeek = currentWeekStart.getDay();
    const daysToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
    currentWeekStart.setDate(currentWeekStart.getDate() + daysToMonday);
    currentWeekStart.setHours(0, 0, 0, 0);
    
    const weekStartString = currentWeekStart.toISOString().split('T')[0];
    const weekEndString = new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Check if missions already exist for this week
    if (!regenerate) {
      const { data: existingMissions } = await supabase
        .from('personalized_missions')
        .select('*')
        .eq('user_id', user_id)
        .eq('week_start', weekStartString);

      if (existingMissions && existingMissions.length >= 7) {
        console.log('[PERSONALIZED-MISSIONS] 이번 주 미션이 이미 존재함');
        return new Response(JSON.stringify({ 
          success: true, 
          missions: existingMissions,
          message: '이번 주 미션이 이미 생성되어 있습니다.' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Collect user data for personalization
    const [userProfile, recentAssessments, currentWeekMissions] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user_id).single(),
      supabase.from('test_results').select('*').eq('user_id', user_id).order('created_at', { ascending: false }).limit(3),
      supabase.from('personalized_missions').select('*').eq('user_id', user_id).eq('week_start', weekStartString)
    ]);

    console.log('[PERSONALIZED-MISSIONS] 사용자 데이터 수집 완료:', 
      Object.keys({ 
        preferences: userProfile.data, 
        recentAssessments: recentAssessments.data, 
        currentWeekMissions: currentWeekMissions.data 
      })
    );

    // Generate AI missions using OpenAI
    console.log('[PERSONALIZED-MISSIONS] AI 미션 생성 중...');
    
    const userContext = `
사용자 프로필: ${userProfile.data?.display_name || '사용자'}
최근 평가 결과: ${recentAssessments.data?.length || 0}개의 검사 완료
현재 주 미션: ${currentWeekMissions.data?.length || 0}개 존재
생년월일: ${userProfile.data?.birth_date || '미입력'}
`;

    const aiPrompt = `
당신은 심리 건강 전문가입니다. 다음 사용자를 위한 7일간의 개인화된 일일 미션을 생성해주세요.

${userContext}

각 미션은 다음 요구사항을 만족해야 합니다:
1. 실행 가능하고 구체적이어야 함
2. 심리적 웰빙 향상에 도움이 되어야 함
3. 사진으로 인증 가능한 활동이어야 함
4. 난이도는 1-5 사이 (1=매우 쉬움, 5=어려움)
5. 각 요일에 맞는 다양한 활동

응답은 다음 JSON 형식으로만 제공해주세요:
{
  "missions": [
    {
      "day": 1,
      "title": "미션 제목",
      "description": "구체적인 미션 설명 (사진 인증 방법 포함)",
      "target_behavior": "목표 행동",
      "difficulty": 2
    }
  ]
}

7일분의 미션을 모두 생성해주세요.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: '당신은 심리 건강 전문가입니다. JSON 형식으로만 응답하세요.' },
          { role: 'user', content: aiPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResult = await response.json();
    const aiContent = aiResult.choices[0].message.content;
    
    console.log('[PERSONALIZED-MISSIONS] AI 미션 생성 완료:', JSON.parse(aiContent).missions.length, '개');

    // Parse AI response
    let aiMissions;
    try {
      aiMissions = JSON.parse(aiContent).missions;
    } catch (error) {
      console.error('[PERSONALIZED-MISSIONS] AI 응답 파싱 오류:', error);
      // Fallback missions if AI parsing fails
      aiMissions = [
        { day: 1, title: "감사 일기 쓰기", description: "오늘 감사한 일 3가지를 적고 사진으로 인증하세요", target_behavior: "긍정적 사고", difficulty: 1 },
        { day: 2, title: "자연 속 산책", description: "15분 이상 자연 속에서 산책하고 풍경을 촬영하세요", target_behavior: "스트레스 해소", difficulty: 2 },
        { day: 3, title: "새로운 요리 시도", description: "새로운 레시피로 요리하고 완성품을 촬영하세요", target_behavior: "창의적 활동", difficulty: 3 },
        { day: 4, title: "독서 시간", description: "30분 이상 책을 읽고 인상 깊은 구절을 촬영하세요", target_behavior: "지적 자극", difficulty: 2 },
        { day: 5, title: "운동하기", description: "20분 이상 운동하고 운동 후 모습을 촬영하세요", target_behavior: "신체 건강", difficulty: 3 },
        { day: 6, title: "가족/친구와 대화", description: "소중한 사람과 의미 있는 대화하고 함께한 순간을 촬영하세요", target_behavior: "사회적 연결", difficulty: 2 },
        { day: 7, title: "취미 활동", description: "좋아하는 취미 활동을 하고 과정이나 결과를 촬영하세요", target_behavior: "자기 만족", difficulty: 2 }
      ];
    }

    // Delete existing missions for this week if regenerating
    if (regenerate) {
      await supabase
        .from('personalized_missions')
        .delete()
        .eq('user_id', user_id)
        .eq('week_start', weekStartString);
    }

    // Insert new missions
    const missionsToInsert = aiMissions.map((mission: any, index: number) => ({
      user_id,
      mission_title: mission.title,
      mission_description: mission.description,
      target_behavior: mission.target_behavior,
      difficulty_level: mission.difficulty || 2,
      week_start: weekStartString,
      week_end: weekEndString,
      day_of_week: mission.day || (index + 1),
      mission_type: 'daily'
    }));

    const { data: insertedMissions, error: insertError } = await supabase
      .from('personalized_missions')
      .insert(missionsToInsert)
      .select();

    if (insertError) {
      console.error('[PERSONALIZED-MISSIONS] 오류:', insertError);
      throw insertError;
    }

    // Initialize weekly completion tracking
    await supabase
      .from('weekly_mission_completions')
      .upsert({
        user_id,
        week_start: weekStartString,
        week_end: weekEndString,
        completed_missions: 0,
        total_missions: 7
      }, {
        onConflict: 'user_id,week_start'
      });

    console.log('[PERSONALIZED-MISSIONS] 미션 생성 완료:', insertedMissions?.length || 0, '개');

    return new Response(JSON.stringify({ 
      success: true, 
      missions: insertedMissions,
      message: `${insertedMissions?.length || 0}개의 개인화된 미션이 생성되었습니다.`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[PERSONALIZED-MISSIONS] 전체 오류:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});