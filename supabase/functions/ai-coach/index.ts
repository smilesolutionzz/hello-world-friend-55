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
    const requestData = await req.json();
    const { 
      userId, 
      sessionType, 
      message, 
      conversationHistory = [],
      moodBefore,
      action,
      prompt 
    } = requestData;

    console.log('AI Coach request:', { userId, sessionType, message, action, prompt });

    // Handle different action types
    if (action && prompt) {
      // New action-based request
      const coachingResponse = await generateActionResponse(action, prompt);
      return new Response(JSON.stringify({ 
        success: true, 
        response: coachingResponse.response,
        actionItems: coachingResponse.actionItems
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Original coaching session logic
    const coachingResponse = await generateCoachingResponse(
      sessionType, 
      message, 
      conversationHistory,
      moodBefore
    );

    // Create or update coaching session
    const sessionData = {
      user_id: userId,
      session_type: sessionType,
      conversation_history: [...conversationHistory, 
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: coachingResponse.response, timestamp: new Date().toISOString() }
      ],
      mood_before: moodBefore,
      action_items: coachingResponse.actionItems,
      session_duration_minutes: Math.floor(conversationHistory.length / 2) + 1
    };

    const { data: session, error } = await supabase
      .from('ai_coaching_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      console.error('Error creating coaching session:', error);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      response: coachingResponse.response,
      actionItems: coachingResponse.actionItems,
      sessionId: session?.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in AI coach:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateCoachingResponse(
  sessionType: string, 
  message: string, 
  conversationHistory: any[],
  moodBefore?: number
) {
  const systemPrompts = {
    mood_coaching: '당신은 감정 코칭 전문가입니다. 사용자의 기분을 이해하고 긍정적인 방향으로 변화시킬 수 있는 따뜻하고 공감적인 조언을 제공합니다.',
    energy_coaching: '당신은 에너지 관리 코치입니다. 사용자의 에너지 레벨을 높이고 지속가능한 활력을 유지할 수 있는 실용적인 방법을 제안합니다.',
    stress_management: '당신은 스트레스 관리 전문가입니다. 사용자의 스트레스를 완화하고 건강한 대처 방법을 가르쳐주는 평온하고 안정적인 가이드입니다.',
    goal_setting: '당신은 목표 설정 및 동기부여 코치입니다. 사용자가 명확한 목표를 세우고 달성할 수 있도록 체계적이고 격려적인 지원을 제공합니다.'
  };

  const prompt = `이전 대화 내용: ${JSON.stringify(conversationHistory)}
현재 메시지: ${message}
${moodBefore ? `시작 기분 점수: ${moodBefore}/5` : ''}

사용자에게 도움이 되는 코칭 응답과 구체적인 실행 계획을 제공해주세요.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: systemPrompts[sessionType as keyof typeof systemPrompts] || systemPrompts.mood_coaching
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Extract action items (simple parsing)
    const actionItems = extractActionItems(content);

    return {
      response: content,
      actionItems
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      response: `${sessionType} 세션을 위한 맞춤 조언을 제공하고 있습니다. 현재 상황에 대해 더 자세히 말씀해 주시면 더 구체적인 도움을 드릴 수 있습니다.`,
      actionItems: ['규칙적인 생활 리듬 유지하기', '충분한 수면 취하기', '적절한 운동하기']
    };
  }
}

function extractActionItems(content: string): string[] {
  const lines = content.split('\n');
  const actionItems: string[] = [];
  
  for (const line of lines) {
    // Look for numbered lists, bullet points, or action-oriented sentences
    if (line.match(/^\d+\./) || line.match(/^[-*]/) || line.includes('해보세요') || line.includes('추천')) {
      const cleaned = line.replace(/^\d+\./, '').replace(/^[-*]/, '').trim();
      if (cleaned.length > 5) {
        actionItems.push(cleaned);
      }
    }
  }
  
  return actionItems.length > 0 ? actionItems.slice(0, 3) : [
    '오늘의 목표를 하나 설정해보세요',
    '긍정적인 마음가짐 유지하기',
    '자신에게 친절하게 대하기'
  ];
}

async function generateActionResponse(action: string, prompt: string) {
  const actionPrompts = {
    workout_plan: '당신은 전문 피트니스 트레이너입니다. 사용자에게 안전하고 효과적인 운동 계획을 제공합니다.',
    suggest_challenge: '당신은 웰니스 챌린지 전문가입니다. 사용자의 라이프스타일에 맞는 건강 챌린지를 추천합니다.',
    start_workout: '당신은 운동 코치입니다. 사용자가 운동을 시작할 수 있도록 동기부여와 구체적인 가이드를 제공합니다.'
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: actionPrompts[action as keyof typeof actionPrompts] || actionPrompts.workout_plan
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    return {
      response: content,
      actionItems: extractActionItems(content)
    };
  } catch (error) {
    console.error('OpenAI API error for action:', error);
    return {
      response: getDefaultResponseForAction(action),
      actionItems: getDefaultActionItems(action)
    };
  }
}

function getDefaultResponseForAction(action: string): string {
  const defaults = {
    workout_plan: '🏃‍♂️ **30분 홈 트레이닝 계획**\n\n**워밍업 (5분)**\n- 제자리 걷기: 2분\n- 팔 돌리기: 1분\n- 목과 어깨 스트레칭: 2분\n\n**메인 운동 (20분)**\n- 스쿼트: 3세트 x 10회\n- 팔굽혀펴기: 3세트 x 8회\n- 플랭크: 3세트 x 30초\n- 런지: 3세트 x 각 다리 8회\n\n**쿨다운 (5분)**\n- 전신 스트레칭\n- 심호흡\n\n💡 **초보자 팁**: 무리하지 말고 자신의 페이스에 맞춰 진행하세요!',
    suggest_challenge: '🌟 **추천 웰니스 챌린지**\n\n**30일 건강 습관 만들기**\n- 매일 물 8잔 마시기\n- 10분 명상하기\n- 1만보 걷기\n- 22시 전 잠자리에 들기\n\n친구들과 함께 도전하면 더 재미있어요!',
    start_workout: '💪 **운동 시작 준비!**\n\n지금 바로 시작할 수 있는 간단한 운동을 추천드려요!\n\n1. 편안한 옷으로 갈아입기\n2. 물 한 잔 준비하기\n3. 5분 가벼운 스트레칭\n4. 좋아하는 음악 틀기\n\n작은 시작이 큰 변화를 만듭니다! 🌟'
  };
  
  return defaults[action as keyof typeof defaults] || defaults.workout_plan;
}

function getDefaultActionItems(action: string): string[] {
  const defaults = {
    workout_plan: ['스쿼트 3세트 완료하기', '플랭크 30초 유지하기', '운동 후 충분한 수분 섭취'],
    suggest_challenge: ['오늘부터 물 8잔 마시기', '10분 산책하기', '일찍 잠자리에 들기'],
    start_workout: ['편안한 운동복 입기', '5분 스트레칭으로 시작', '운동 후 성취감 느끼기']
  };
  
  return defaults[action as keyof typeof defaults] || defaults.workout_plan;
}