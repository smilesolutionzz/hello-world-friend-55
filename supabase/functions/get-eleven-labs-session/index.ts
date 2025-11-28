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
    const { stressLevel, focusLevel, currentMood, userGoals, agentId, therapistType, therapistPrompt, userConcern } = await req.json();
    
    const ELEVEN_LABS_API_KEY = Deno.env.get('ELEVEN_LABS_API_KEY');
    if (!ELEVEN_LABS_API_KEY) {
      throw new Error('ELEVEN_LABS_API_KEY is not configured');
    }

    console.log('Requesting ElevenLabs session');
    console.log('Therapist type:', therapistType || 'meditation');
    console.log('User state:', { stressLevel, focusLevel, currentMood, userGoals, userConcern });

    // Create a personalized system prompt
    let systemPrompt = '';
    
    if (therapistType && therapistPrompt) {
      // 전문 치료사 모드
      systemPrompt = therapistPrompt;
      console.log('Using therapist prompt for:', therapistType);
    } else {
      // 기존 명상 가이드 모드
      systemPrompt = `당신은 전문 명상 가이드 AI입니다. 
사용자의 현재 상태:
- 스트레스 레벨: ${stressLevel}%
- 집중력: ${focusLevel}%
- 현재 기분: ${currentMood}
- 명상 목표: ${userGoals}

이 정보를 바탕으로 부드럽고 차분한 목소리로 개인화된 명상 가이드를 제공하세요.
호흡법, 마음챙김, 신체 이완 기법을 적절히 활용하세요.
사용자가 말을 걸면 공감하며 응답하고, 필요시 명상 기법을 조정하세요.`;
    }

    // Request signed URL from ElevenLabs
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: "GET",
        headers: {
          "xi-api-key": ELEVEN_LABS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('ElevenLabs session created successfully');

    return new Response(
      JSON.stringify({
        signed_url: data.signed_url,
        system_prompt: systemPrompt,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
