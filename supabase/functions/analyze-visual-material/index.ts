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
    const { imageData, context, question } = await req.json();

    if (!imageData) {
      throw new Error('이미지 데이터가 필요합니다.');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY가 설정되지 않았습니다.');
    }

    console.log('시각 자료 분석 시작');

    const systemPrompt = `당신은 전문 심리 상담사입니다. 내담자가 제공한 시각 자료를 분석하여 상담에 활용할 수 있는 인사이트를 제공해주세요.

${context ? `상담 맥락: ${context}` : ''}
${question ? `분석 요청사항: ${question}` : ''}

다음 형식으로 분석해주세요:
{
  "image_description": "이미지에 보이는 내용 상세 설명",
  "emotional_indicators": "이미지에서 발견되는 감정적 지표들",
  "psychological_insights": "심리학적 관점에서의 해석",
  "counseling_points": ["상담에서 다룰만한 포인트1", "포인트2", "포인트3"],
  "follow_up_questions": ["추가로 물어볼 질문1", "질문2"],
  "recommendations": "상담사에게 제공하는 권장사항",
  "relevance_score": 0.85
}`;

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
      
      if (response.status === 429) {
        throw new Error('요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
      }
      if (response.status === 402) {
        throw new Error('크레딧이 부족합니다. Lovable 워크스페이스에 크레딧을 추가해주세요.');
      }
      
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
        image_description: analysisText.substring(0, 300),
        emotional_indicators: "분석 결과 처리 중 오류 발생",
        psychological_insights: analysisText,
        counseling_points: ["전문가와 상담을 권장합니다"],
        follow_up_questions: [],
        recommendations: "추가 분석이 필요합니다",
        relevance_score: 0.5
      };
    }

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('시각 자료 분석 오류:', error);
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
