import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { z } from 'https://esm.sh/zod@3.23.8';

const RequestSchema = z.object({
  sessionType: z.enum(['mood_coaching', 'energy_coaching', 'stress_management', 'goal_setting']).optional(),
  message: z.string().max(4000).optional(),
  conversationHistory: z.array(z.object({
    role: z.string().max(32),
    content: z.string().max(8000),
    timestamp: z.string().optional(),
  })).max(50).optional(),
  moodBefore: z.number().min(0).max(10).optional(),
  action: z.enum(['workout_plan', 'suggest_challenge', 'start_workout']).optional(),
  prompt: z.string().max(4000).optional(),
  userId: z.string().optional(), // ignored, kept for backward-compat
});

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
    // --- AUTH: verify caller's JWT and use their identity ---
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
    const authenticatedUserId = userData.user.id;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const rawBody = await req.json().catch(() => ({}));
    const parsed = RequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const {
      sessionType,
      message,
      conversationHistory = [],
      moodBefore,
      action,
      prompt
    } = parsed.data;
    // NOTE: client-supplied userId is intentionally ignored; we trust the JWT.
    const userId = authenticatedUserId;

    console.log('AI Coach request:', { userId, sessionType, action });

    // Handle different action types
    if (action && prompt) {
      const coachingResponse = await generateActionResponse(action, prompt);
      return new Response(JSON.stringify({
        success: true,
        response: coachingResponse.response,
        actionItems: coachingResponse.actionItems
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const coachingResponse = await generateCoachingResponse(
      sessionType,
      message,
      conversationHistory,
      moodBefore
    );

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
  } catch (error: unknown) {
    console.error('Error in AI coach:', error);
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
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
    const actionItems = extractActionItems(content);

    return { response: content, actionItems };
  } catch (error) {
    console.error('AI gateway error:', error);
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
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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

    return { response: content, actionItems: extractActionItems(content) };
  } catch (error) {
    console.error('AI gateway error for action:', error);
    return {
      response: getDefaultResponseForAction(action),
      actionItems: getDefaultActionItems(action)
    };
  }
}

function getDefaultResponseForAction(action: string): string {
  const defaults = {
    workout_plan: '🏃‍♂️ **30분 홈 트레이닝 계획**\n\n간단한 워밍업 후 스쿼트, 팔굽혀펴기, 플랭크, 런지를 차례로 수행하고 마무리 스트레칭으로 마칩니다.',
    suggest_challenge: '🌟 **30일 건강 습관 만들기 챌린지**',
    start_workout: '💪 가벼운 스트레칭으로 운동을 시작해 보세요!'
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
