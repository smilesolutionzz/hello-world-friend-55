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
    const { 
      userId, 
      sessionType, 
      message, 
      conversationHistory = [],
      moodBefore 
    } = await req.json();

    console.log('AI Coach request:', { userId, sessionType, message });

    // Generate coaching response
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
        model: 'gpt-4o-mini',
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