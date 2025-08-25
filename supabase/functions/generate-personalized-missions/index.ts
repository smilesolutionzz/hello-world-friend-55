import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

interface MissionRequest {
  userId: string;
  forceGenerate?: boolean;
}

interface UserData {
  preferences?: any;
  recentAssessments?: any[];
  currentWeekMissions?: any[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    console.log('[PERSONALIZED-MISSIONS] 개인화된 미션 생성 시작');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    const { userId, forceGenerate = false }: MissionRequest = await req.json();
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });

    // 1. 사용자 데이터 수집
    const userData = await collectUserData(supabase, userId);
    console.log('[PERSONALIZED-MISSIONS] 사용자 데이터 수집 완료:', Object.keys(userData));

    // 2. 이미 생성된 미션이 있는지 확인 (강제 생성이 아닌 경우)
    if (!forceGenerate) {
      const { data: existingMissions } = await supabase
        .from('personalized_missions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gte('generated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (existingMissions && existingMissions.length > 0) {
        return new Response(JSON.stringify({
          success: true,
          missions: existingMissions,
          message: '이미 생성된 개인화 미션이 있습니다.'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 3. AI로 개인화된 미션 생성
    const personalizedMissions = await generateAIMissions(userData, userId);
    console.log('[PERSONALIZED-MISSIONS] AI 미션 생성 완료:', personalizedMissions.length, '개');

    // 4. 데이터베이스에 저장
    const { data: savedMissions, error: saveError } = await supabase
      .from('personalized_missions')
      .insert(personalizedMissions)
      .select();

    if (saveError) {
      throw saveError;
    }

    // 5. weekly_missions 테이블에도 추가 (기존 시스템과 호환성)
    const weeklyMissions = personalizedMissions.map(mission => ({
      title: mission.mission_content.title,
      description: mission.mission_content.description,
      category: mission.mission_content.category,
      difficulty: mission.mission_content.difficulty,
      points: mission.mission_content.points,
      week_start_date: getThisWeekStart(),
      is_active: true
    }));

    const { error: weeklyError } = await supabase
      .from('weekly_missions')
      .upsert(weeklyMissions, {
        onConflict: 'title,week_start_date'
      });

    if (weeklyError) {
      console.warn('[PERSONALIZED-MISSIONS] 주간 미션 저장 경고:', weeklyError);
    }

    return new Response(JSON.stringify({
      success: true,
      missions: savedMissions,
      message: `${personalizedMissions.length}개의 개인화된 미션이 생성되었습니다.`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[PERSONALIZED-MISSIONS] 오류:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function collectUserData(supabase: any, userId: string): Promise<UserData> {
  const userData: UserData = {};

  try {
    // 사용자 선호도 정보
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    userData.preferences = preferences;

    // 최근 검사 결과 (지난 30일)
    const { data: recentAssessments } = await supabase
      .from('test_results')
      .select(`
        *,
        test_types(name)
      `)
      .eq('user_id', userId)
      .gte('completed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('completed_at', { ascending: false })
      .limit(5);

    userData.recentAssessments = recentAssessments || [];

    // 현재 주 미션 완료 상태
    const { data: currentMissions } = await supabase
      .from('user_mission_progress')
      .select(`
        *,
        weekly_missions(*)
      `)
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    userData.currentWeekMissions = currentMissions || [];

  } catch (error) {
    console.warn('[PERSONALIZED-MISSIONS] 사용자 데이터 수집 중 오류:', error);
  }

  return userData;
}

async function generateAIMissions(userData: UserData, userId: string) {
  console.log('[PERSONALIZED-MISSIONS] AI 미션 생성 중...');

  const prompt = createMissionPrompt(userData);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: `당신은 개인화된 건강 미션을 생성하는 전문가입니다. 사용자의 데이터를 분석하여 실행 가능하고 동기를 부여하는 주간 미션을 제안해주세요.

다음 JSON 형식으로 응답하세요:
{
  "missions": [
    {
      "title": "미션 제목",
      "description": "구체적인 설명",
      "category": "health|mental_health|diet|exercise|lifestyle 중 하나",
      "difficulty": "easy|medium|hard 중 하나", 
      "points": 숫자,
      "reasoning": "이 미션을 추천하는 이유",
      "tips": ["실행 팁1", "실행 팁2"]
    }
  ]
}`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_completion_tokens: 2000,
      temperature: 0.7
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API 오류: ${response.status}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0].message.content;
  
  try {
    const parsed = JSON.parse(aiResponse);
    
    return parsed.missions.map((mission: any) => ({
      user_id: userId,
      mission_content: mission,
      mission_type: 'ai_generated',
      priority_level: mission.difficulty === 'easy' ? 1 : mission.difficulty === 'medium' ? 2 : 3,
      based_on_data: {
        preferences: userData.preferences ? Object.keys(userData.preferences).length : 0,
        recentAssessments: userData.recentAssessments?.length || 0,
        generatedAt: new Date().toISOString()
      }
    }));
  } catch (parseError) {
    console.error('[PERSONALIZED-MISSIONS] JSON 파싱 오류:', parseError);
    throw new Error('AI 응답을 파싱할 수 없습니다.');
  }
}

function createMissionPrompt(userData: UserData): string {
  let prompt = "다음 사용자 데이터를 기반으로 개인화된 주간 미션 3-5개를 생성해주세요:\n\n";

  // 사용자 선호도
  if (userData.preferences) {
    prompt += "🎯 사용자 관심사:\n";
    if (userData.preferences.primary_concerns?.length > 0) {
      prompt += `- 주요 고민: ${userData.preferences.primary_concerns.join(', ')}\n`;
    }
    if (userData.preferences.health_goals?.length > 0) {
      prompt += `- 건강 목표: ${userData.preferences.health_goals.join(', ')}\n`;
    }
    prompt += "\n";
  }

  // 최근 검사 결과
  if (userData.recentAssessments && userData.recentAssessments.length > 0) {
    prompt += "📊 최근 검사 결과:\n";
    userData.recentAssessments.forEach((assessment, index) => {
      prompt += `${index + 1}. ${assessment.test_types?.name || '검사'} - 완료일: ${new Date(assessment.completed_at).toLocaleDateString('ko-KR')}\n`;
      if (assessment.scores) {
        const scores = Object.entries(assessment.scores);
        prompt += `   점수: ${scores.map(([key, value]) => `${key}: ${value}`).join(', ')}\n`;
      }
    });
    prompt += "\n";
  }

  // 현재 미션 수행 패턴
  if (userData.currentWeekMissions && userData.currentWeekMissions.length > 0) {
    const completedCount = userData.currentWeekMissions.filter(m => m.is_completed).length;
    prompt += `📈 이번 주 미션 수행률: ${completedCount}/${userData.currentWeekMissions.length}\n`;
    
    const categories = userData.currentWeekMissions.map(m => m.weekly_missions?.category).filter(Boolean);
    if (categories.length > 0) {
      prompt += `- 선호 카테고리: ${[...new Set(categories)].join(', ')}\n`;
    }
    prompt += "\n";
  }

  prompt += `💡 미션 생성 가이드라인:
- 사용자의 관심사와 검사 결과를 반영
- 실행 가능하고 구체적인 목표
- 난이도는 점진적으로 증가
- 다양한 카테고리로 균형있게 구성
- 포인트는 난이도에 따라 5-20점 범위

현재 날짜: ${new Date().toLocaleDateString('ko-KR')}
현재 계절: ${getCurrentSeason()}`;

  return prompt;
}

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return '봄';
  if (month >= 6 && month <= 8) return '여름';
  if (month >= 9 && month <= 11) return '가을';
  return '겨울';
}

function getThisWeekStart(): string {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);
  return monday.toISOString().split('T')[0];
}