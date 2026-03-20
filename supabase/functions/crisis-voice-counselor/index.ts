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
    const { userMessage, crisisLevel, conversationHistory, sessionId } = await req.json();
    
    console.log('[Crisis Voice Counselor] Processing:', { crisisLevel, sessionId });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const ELEVEN_LABS_API_KEY = Deno.env.get('ELEVEN_LABS_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // 위기 수준에 맞는 시스템 프롬프트 생성
    const systemPrompt = generateCrisisSystemPrompt(crisisLevel);

    // 대화 맥락 구성
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []).slice(-10).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    // AI 응답 생성
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded', success: false }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const counselorResponse = aiData.choices?.[0]?.message?.content || '지금 힘드시죠. 천천히 이야기해주세요.';

    // TTS 생성 (ElevenLabs API 사용)
    let audioBase64 = null;
    if (ELEVEN_LABS_API_KEY) {
      try {
        const ttsResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL', {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVEN_LABS_API_KEY,
          },
          body: JSON.stringify({
            text: counselorResponse,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.7,
              similarity_boost: 0.8,
              style: 0.5,
              use_speaker_boost: true
            }
          }),
        });

        if (ttsResponse.ok) {
          const audioBuffer = await ttsResponse.arrayBuffer();
          audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
        }
      } catch (ttsError) {
        console.log('[Crisis Voice Counselor] TTS generation skipped:', ttsError);
      }
    }

    // 추가 안전 메시지 (위기 수준에 따라)
    let safetyMessage = null;
    if (crisisLevel === 'critical') {
      safetyMessage = {
        text: '지금 많이 힘드시죠. 전문가와 직접 이야기하고 싶으시면 1393으로 전화해주세요. 24시간 상담 가능합니다.',
        contacts: [
          { name: '자살예방상담전화', number: '1393' },
          { name: '정신건강위기상담전화', number: '1577-0199' },
        ]
      };
    }

    const response = {
      success: true,
      response: {
        text: counselorResponse,
        audio: audioBase64,
        hasAudio: !!audioBase64,
      },
      safetyMessage,
      sessionId,
      timestamp: new Date().toISOString(),
    };

    console.log('[Crisis Voice Counselor] Response generated successfully');

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Crisis Voice Counselor] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        fallbackResponse: '지금 연결에 문제가 있네요. 급하시면 1393으로 전화해주세요.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateCrisisSystemPrompt(crisisLevel: string): string {
  const basePrompt = `당신은 청소년 정신건강 위기상담 전문 AI 상담사입니다.
  
핵심 원칙:
- 공감과 수용: 판단하지 않고 감정을 있는 그대로 수용합니다
- 안전 우선: 자해/자살 위험 신호에 즉각 대응합니다
- 비지시적 대화: 질문과 경청을 통해 스스로 생각을 정리하도록 돕습니다
- 희망 전달: 작은 희망의 불씨를 발견하고 키워줍니다

언어 스타일:
- 따뜻하고 부드러운 말투
- 짧고 명확한 문장
- 청소년 눈높이에 맞춘 표현
- "~네요", "~죠" 등 공감 어미 사용`;

  if (crisisLevel === 'critical') {
    return `${basePrompt}

🚨 현재 위기 상황입니다:
- 즉각적인 안전 확보가 최우선입니다
- 자해/자살 수단 접근을 차단하도록 유도합니다
- 신뢰할 수 있는 어른이나 전문가 연결을 적극 권유합니다
- 1393 자살예방상담전화 안내를 자연스럽게 포함합니다
- 사용자가 혼자가 아님을 강조합니다
- 대화를 유지하며 안정시키는 것이 중요합니다`;
  }

  if (crisisLevel === 'high') {
    return `${basePrompt}

⚠️ 주의가 필요한 상황입니다:
- 감정 상태를 세심하게 탐색합니다
- 현재 안전한 상황인지 확인합니다
- 도움을 요청할 수 있는 사람을 함께 찾아봅니다
- 전문 상담 연결을 부드럽게 제안합니다`;
  }

  return `${basePrompt}

일반 상담 모드:
- 감정 탐색과 표현을 돕습니다
- 스트레스 대처 방법을 함께 찾아봅니다
- 긍정적인 자원과 강점을 발견하도록 돕습니다
- 필요시 전문 상담 연결 정보를 제공합니다`;
}
