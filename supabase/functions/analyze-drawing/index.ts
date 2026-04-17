import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, testType } = await req.json();

    if (!imageData) {
      throw new Error('이미지 데이터가 필요합니다.');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY가 설정되지 않았습니다.');
    }

    console.log('그림 분석 시작:', { testType });

    // 검사 유형별 프롬프트 설정
    const prompts: Record<string, string> = {
      EMOTION: `당신은 따뜻한 심리 상담사입니다. 감정 표현 그림을 분석해주세요.

분석 항목:
1. **색상 감정**: 사용된 색상이 전달하는 감정
2. **형태와 구도**: 그림의 형태가 나타내는 심리 상태
3. **전체적인 분위기**: 그림에서 느껴지는 감정의 흐름
4. **긍정적 요소**: 희망이나 긍정적 에너지

다음 형식으로 응답해주세요:
{
  "overall_impression": "그림에서 느껴지는 전반적인 감정",
  "color_emotion": "색상이 전달하는 감정 분석",
  "shape_analysis": "형태와 구도 분석",
  "emotional_flow": "감정의 흐름과 변화",
  "positive_aspects": "긍정적이고 희망적인 요소",
  "psychological_state": "현재 심리 상태",
  "recommendations": ["감정 조절 조언1", "감정 표현 조언2"],
  "risk_level": "low|medium|high",
  "confidence": 0.85
}`,
      DREAM: `당신은 따뜻한 심리 상담사입니다. 꿈과 희망 그림을 분석해주세요.

분석 항목:
1. **희망의 상징**: 그림 속 꿈과 희망의 표현
2. **목표 방향성**: 나타난 목표와 방향
3. **긍정 에너지**: 미래에 대한 긍정적 태도
4. **실현 가능성**: 꿈의 구체성과 실현 방향

다음 형식으로 응답해주세요:
{
  "overall_impression": "그림에서 느껴지는 꿈과 희망",
  "dream_symbols": "꿈과 희망의 상징 분석",
  "goal_direction": "나타난 목표와 방향성",
  "positive_energy": "긍정적 에너지와 태도",
  "feasibility": "실현 가능성과 구체성",
  "psychological_state": "현재 동기 부여 상태",
  "recommendations": ["목표 달성 조언1", "동기 부여 조언2"],
  "risk_level": "low",
  "confidence": 0.80
}`,
      ABSTRACT: `당신은 따뜻한 심리 상담사입니다. 추상 표현 그림을 분석해주세요.

분석 항목:
1. **선의 흐름**: 선이 나타내는 내면의 흐름
2. **색상의 조화**: 색상 조합이 전달하는 심리 상태
3. **공간 활용**: 여백과 밀도가 나타내는 의미
4. **내면의 표현**: 추상적 형태가 담은 무의식

다음 형식으로 응답해주세요:
{
  "overall_impression": "추상 표현의 전반적 인상",
  "line_flow": "선의 흐름과 내면 분석",
  "color_harmony": "색상 조화와 심리 상태",
  "space_usage": "공간 활용과 의미",
  "inner_expression": "내면의 무의식적 표현",
  "psychological_state": "현재 심리적 균형 상태",
  "recommendations": ["내면 이해 조언1", "표현 발전 조언2"],
  "risk_level": "low|medium|high",
  "confidence": 0.75
}`,
      WEATHER: `당신은 따뜻한 심리 상담사입니다. 날씨 감정 그림을 분석해주세요.

분석 항목:
1. **날씨 상징**: 선택한 날씨가 나타내는 감정
2. **자연 요소**: 그려진 자연 요소의 심리적 의미
3. **분위기 변화**: 날씨의 변화나 움직임
4. **계절과 시간**: 암시된 계절이나 시간대의 의미

다음 형식으로 응답해주세요:
{
  "overall_impression": "날씨로 표현된 전반적 감정",
  "weather_symbol": "날씨 상징 분석",
  "nature_elements": "자연 요소의 심리적 의미",
  "mood_change": "분위기 변화와 움직임",
  "season_time": "계절과 시간의 의미",
  "psychological_state": "현재 정서 상태",
  "recommendations": ["정서 조절 조언1", "감정 표현 조언2"],
  "risk_level": "low|medium|high",
  "confidence": 0.85
}`,
    };

    const systemPrompt = prompts[testType || 'EMOTION'] || prompts.EMOTION;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: systemPrompt },
              {
                type: 'image_url',
                image_url: { url: imageData }
              }
            ]
          }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API 오류:', response.status, errorText);
      throw new Error(`AI 분석 실패: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    console.log('분석 완료');

    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (e) {
      console.error('JSON 파싱 실패:', e);
      analysis = {
        overall_impression: analysisText.substring(0, 200),
        psychological_state: "분석 중 오류 발생",
        recommendations: ["전문가 상담을 권장합니다"],
        risk_level: "medium",
        confidence: 0.5
      };
    }

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('그림 분석 오류:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
