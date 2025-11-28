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
      HTP: `당신은 전문 심리 상담사입니다. House-Tree-Person(HTP) 그림 검사를 분석해주세요.

분석 항목:
1. **집(House) 분석**: 가정환경, 안정감, 가족관계
2. **나무(Tree) 분석**: 성장과정, 자아상, 생명력
3. **사람(Person) 분석**: 자기상, 대인관계, 정서상태

다음 형식으로 응답해주세요:
{
  "overall_impression": "전반적인 인상 (2-3문장)",
  "house_analysis": "집 분석 내용",
  "tree_analysis": "나무 분석 내용",
  "person_analysis": "사람 분석 내용",
  "psychological_state": "추정되는 심리 상태",
  "recommendations": ["권장사항1", "권장사항2", "권장사항3"],
  "risk_level": "low|medium|high",
  "confidence": 0.85
}`,
      KFD: `당신은 전문 심리 상담사입니다. Kinetic Family Drawing(KFD) 동적 가족화를 분석해주세요.

분석 항목:
1. **가족 구성**: 그려진 가족 구성원과 배치
2. **상호작용**: 가족 간 거리와 활동
3. **감정 표현**: 표정, 자세, 크기

다음 형식으로 응답해주세요:
{
  "overall_impression": "전반적인 인상",
  "family_structure": "가족 구조 분석",
  "interaction_patterns": "상호작용 패턴",
  "emotional_tone": "정서적 분위기",
  "psychological_state": "추정되는 심리 상태",
  "recommendations": ["권장사항1", "권장사항2"],
  "risk_level": "low|medium|high",
  "confidence": 0.85
}`,
      FREE: `당신은 전문 심리 상담사입니다. 자유 그림을 심리학적 관점에서 분석해주세요.

분석 항목:
1. **색상 사용**: 색상 선택과 의미
2. **구도와 공간**: 그림의 배치와 공간 활용
3. **선의 특징**: 필압, 선의 굵기와 형태
4. **내용 분석**: 그려진 대상과 상징

다음 형식으로 응답해주세요:
{
  "overall_impression": "전반적인 인상",
  "color_analysis": "색상 분석",
  "composition_analysis": "구도 분석",
  "line_analysis": "선 분석",
  "content_analysis": "내용 분석",
  "psychological_state": "추정되는 심리 상태",
  "recommendations": ["권장사항1", "권장사항2"],
  "risk_level": "low|medium|high",
  "confidence": 0.80
}`,
    };

    const systemPrompt = prompts[testType || 'FREE'] || prompts.FREE;

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
