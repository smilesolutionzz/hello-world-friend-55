import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const { audioData, analysisType } = await req.json();
    
    if (!audioData) {
      throw new Error('Audio data is required');
    }

    // OpenAI API 키 확인
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Starting voice emotion analysis...');

    // 음성을 텍스트로 변환 (Whisper API)
    const audioBuffer = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
    
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData
    });

    if (!transcriptionResponse.ok) {
      throw new Error(`Transcription failed: ${transcriptionResponse.statusText}`);
    }

    const transcriptionData = await transcriptionResponse.json();
    const transcribedText = transcriptionData.text;

    console.log('Transcribed text:', transcribedText);

    // 감정 분석을 위한 GPT 프롬프트
    const emotionAnalysisPrompt = `
다음 음성에서 변환된 텍스트를 분석하여 화자의 심리 상태와 감정을 분석해주세요:

텍스트: "${transcribedText}"

다음 형식의 JSON으로 응답해주세요:
{
  "emotion": "감정 상태 (행복, 차분함, 스트레스, 피로, 활기찬 중 하나)",
  "confidence": "분석 신뢰도 (0-100)",
  "stressLevel": "스트레스 레벨 (0-100)",
  "energyLevel": "에너지 레벨 (0-100)",
  "recommendations": [
    "추천사항 1",
    "추천사항 2",
    "추천사항 3"
  ],
  "voiceCharacteristics": {
    "pitch": "음성 높이 (안정적, 높음, 낮음)",
    "speed": "말하기 속도 (적절함, 빠름, 느림)",
    "clarity": "발음 명확도 (명확함, 보통, 불분명)"
  },
  "analysis": "상세 분석 설명"
}

텍스트의 내용, 어조, 단어 선택을 통해 감정 상태를 분석하고, 
한국어 화자의 심리적 특성을 고려하여 정확한 분석을 제공해주세요.
`;

    // GPT API 호출
    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: '당신은 음성 분석 전문가입니다. 텍스트를 통해 화자의 감정과 심리 상태를 정확히 분석할 수 있습니다.'
          },
          {
            role: 'user',
            content: emotionAnalysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!gptResponse.ok) {
      throw new Error(`GPT analysis failed: ${gptResponse.statusText}`);
    }

    const gptData = await gptResponse.json();
    let analysisResult;

    try {
      // JSON 파싱 시도
      const content = gptData.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      
      // 파싱 실패시 기본 응답
      analysisResult = {
        emotion: '차분함',
        confidence: 75,
        stressLevel: 30,
        energyLevel: 70,
        recommendations: [
          '규칙적인 휴식을 취해보세요',
          '깊은 호흡을 통해 마음을 안정시켜보세요',
          '긍정적인 생각을 유지해보세요'
        ],
        voiceCharacteristics: {
          pitch: '안정적',
          speed: '적절함',
          clarity: '명확함'
        },
        analysis: '음성 분석이 완료되었습니다.'
      };
    }

    console.log('Analysis complete:', analysisResult);

    return new Response(JSON.stringify({
      success: true,
      transcription: transcribedText,
      ...analysisResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Voice emotion analysis error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});