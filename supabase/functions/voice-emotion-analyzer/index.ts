import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 음성 파일 크기를 청크 단위로 처리하는 함수
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

// 음성 특성 분석 함수
function analyzeVoiceCharacteristics(audioBuffer: Uint8Array) {
  // 실제 구현에서는 더 정교한 오디오 분석이 필요하지만
  // 여기서는 기본적인 특성을 시뮬레이션합니다
  const duration = audioBuffer.length / 24000; // 24kHz 샘플레이트 가정
  
  return {
    pitch: duration > 10 ? "높음" : duration > 5 ? "보통" : "낮음",
    speed: duration > 15 ? "느림" : duration > 8 ? "보통" : "빠름", 
    clarity: audioBuffer.length > 100000 ? "명확함" : "보통",
    volume: "보통",
    tonality: "안정적"
  };
}

// 고급 감정 분석 프롬프트
function createEmotionAnalysisPrompt(transcription: string, voiceCharacteristics: any) {
  return `당신은 전문적인 심리학자이자 음성 감정 분석 전문가입니다. 다음 음성 녹음의 텍스트와 음성 특성을 분석하여 종합적인 감정 및 심리 상태를 분석해주세요.

**음성 인식 결과:**
"${transcription}"

**음성 특성:**
- 음성 높이: ${voiceCharacteristics.pitch}
- 말하기 속도: ${voiceCharacteristics.speed}
- 발음 명확도: ${voiceCharacteristics.clarity}
- 음량: ${voiceCharacteristics.volume}
- 음조: ${voiceCharacteristics.tonality}

다음 JSON 형식으로 정확하게 응답해주세요:

{
  "emotion": "행복|차분함|스트레스|피로|활기찬|불안|우울|화남|놀람|중립 중 하나",
  "confidence": 85,
  "stressLevel": 25,
  "energyLevel": 75,
  "moodValence": 7,
  "arousalLevel": 6,
  "detailedAnalysis": {
    "primaryEmotion": "주 감정",
    "secondaryEmotions": ["보조 감정1", "보조 감정2"],
    "emotionalIntensity": 8,
    "emotionalStability": 7,
    "cognitiveState": "인지 상태 평가",
    "physicalIndicators": ["신체적 징후1", "신체적 징후2"],
    "speechPatterns": {
      "coherence": 8,
      "complexity": 7,
      "emotionalExpression": 6
    }
  },
  "psychologicalProfile": {
    "overallMentalState": "전반적인 정신 상태 평가",
    "stressFactors": ["스트레스 요인1", "스트레스 요인2"],
    "copingMechanisms": ["대처 방식1", "대처 방식2"],
    "resilience": 7,
    "socialConnectedness": 6,
    "selfAwareness": 8
  },
  "voiceCharacteristics": {
    "pitch": "${voiceCharacteristics.pitch}",
    "speed": "${voiceCharacteristics.speed}", 
    "clarity": "${voiceCharacteristics.clarity}",
    "emotionalTone": "감정적 톤 분석",
    "confidence": "목소리 자신감 수준"
  },
  "analysis": "이 음성에서는 [감정]이 주로 나타납니다. 말하는 속도와 음성의 톤을 통해 [상세한 감정 상태]를 확인할 수 있습니다. 텍스트 내용을 보면 [내용 분석]. 전반적으로 [종합적인 심리 상태 평가]로 판단됩니다.",
  "recommendations": [
    "현재 상태에 맞는 구체적인 추천사항 1",
    "감정 조절을 위한 실용적 방법 2", 
    "스트레스 관리를 위한 조언 3",
    "정신건강 증진을 위한 제안 4"
  ],
  "followUpSuggestions": [
    "추가 관찰이 필요한 사항",
    "지속적인 모니터링 방법",
    "전문가 상담 권유 여부"
  ]
}

분석 시 고려사항:
1. 음성의 언어적 내용과 비언어적 특성을 모두 고려
2. 문화적 맥락과 개인차를 반영
3. 단순한 감정 분류를 넘어선 심층적 심리 분석
4. 실용적이고 구체적인 조언 제공
5. 숫자는 1-10 척도로 정확한 정수값으로 응답

반드시 유효한 JSON 형식으로만 응답하세요.`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Voice Emotion Analyzer Started ===');
    
    const { audioData, title } = await req.json()
    console.log('Received audio data length:', audioData?.length);
    
    if (!audioData) {
      throw new Error('No audio data provided')
    }

    const openaiApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Supabase 클라이언트 초기화
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1단계: 음성을 텍스트로 변환 (Whisper API)
    console.log('Converting audio to text with Whisper...');
    const binaryAudio = processBase64Chunks(audioData);
    console.log('Processed audio buffer size:', binaryAudio.length);
    
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'ko');

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      const error = await transcriptionResponse.text();
      console.error('Whisper API error:', error);
      throw new Error(`OpenAI Whisper API error: ${error}`);
    }

    const transcriptionResult = await transcriptionResponse.json();
    const transcription = transcriptionResult.text;
    console.log('Transcription completed:', transcription);

    if (!transcription || transcription.trim().length < 3) {
      throw new Error('음성 인식 결과가 너무 짧거나 비어있습니다. 더 명확하게 말씀해 주세요.');
    }

    // 2단계: 음성 특성 분석
    console.log('Analyzing voice characteristics...');
    const voiceCharacteristics = analyzeVoiceCharacteristics(binaryAudio);
    console.log('Voice characteristics:', voiceCharacteristics);

    // 3단계: GPT-4를 사용한 고급 감정 분석
    console.log('Starting comprehensive emotion analysis...');
    const analysisPrompt = createEmotionAnalysisPrompt(transcription, voiceCharacteristics);
    
    const emotionResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-preview',
        messages: [
          {
            role: 'system',
            content: '당신은 전문적인 심리학자이자 음성 감정 분석 전문가입니다. 음성의 텍스트 내용과 음성 특성을 종합하여 정확하고 심층적인 감정 및 심리 상태 분석을 제공합니다.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!emotionResponse.ok) {
      const error = await emotionResponse.text();
      console.error('GPT-4 analysis error:', error);
      throw new Error(`감정 분석 중 오류가 발생했습니다: ${error}`);
    }

    const emotionResult = await emotionResponse.json();
    let analysisResult;
    
    try {
      const responseContent = emotionResult.choices[0].message.content;
      console.log('GPT-4 raw response:', responseContent);
      
      // JSON 추출 (```json 태그가 있는 경우 처리)
      const jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                       responseContent.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        analysisResult = JSON.parse(responseContent);
      }
      
      console.log('Parsed analysis result:', analysisResult);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw content:', emotionResult.choices[0].message.content);
      
      // 파싱 실패 시 기본 구조 제공
      analysisResult = {
        emotion: "중립",
        confidence: 70,
        stressLevel: 30,
        energyLevel: 50,
        analysis: "음성 분석이 완료되었습니다. " + transcription,
        recommendations: ["정기적인 스트레스 관리가 필요합니다.", "충분한 휴식을 취하세요."],
        voiceCharacteristics: voiceCharacteristics
      };
    }

    // 4단계: Supabase Storage에 음성 파일 업로드
    console.log('Uploading audio to Supabase Storage...');
    const fileName = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.webm`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('voice-recordings')
      .upload(fileName, blob, {
        contentType: 'audio/webm',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
    }

    const audioUrl = uploadData ? 
      supabase.storage.from('voice-recordings').getPublicUrl(fileName).data.publicUrl : 
      null;

    // 5단계: 데이터베이스에 결과 저장
    console.log('Saving results to database...');
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: userData } = await supabase.auth.getUser(token);
      
      if (userData.user) {
        const diaryEntry = {
          user_id: userData.user.id,
          title: title || `음성 분석 ${new Date().toLocaleDateString('ko-KR')}`,
          audio_url: audioUrl,
          audio_duration: Math.floor(binaryAudio.length / 24000), // 대략적인 초 단위 계산
          transcription: transcription,
          emotion_analysis: analysisResult,
          diary_date: new Date().toISOString().split('T')[0]
        };

        const { data: insertData, error: insertError } = await supabase
          .from('voice_diary_entries')
          .insert(diaryEntry)
          .select()
          .single();

        if (insertError) {
          console.error('Database insert error:', insertError);
        } else {
          console.log('Successfully saved to database:', insertData);
        }
      }
    }

    console.log('=== Voice Emotion Analysis Completed ===');

    return new Response(
      JSON.stringify({
        success: true,
        transcription: transcription,
        emotion_analysis: analysisResult,
        audio_url: audioUrl,
        message: '음성 감정 분석이 완료되었습니다.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Voice emotion analysis error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : '음성 분석 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.toString() : String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});