import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answers } = await req.json();

    console.log('Analyzing past life job with answers:', answers);

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
            content: `당신은 재미있는 전생 직업을 분석하는 AI입니다. 사용자의 답변을 바탕으로 흥미롭고 창의적인 전생 직업을 제시해주세요.

분석할 답변 유형:
- personality: 성격 특성 (leader, creative, caring, analytical)
- preference: 선호 활동 (adventure, art, helping, learning)  
- environment: 선호 환경 (castle, nature, temple, library)
- decision: 의사결정 기준 (power, beauty, morality, truth)
- legacy: 후세 기억 (conqueror, artist, saint, scholar)

응답 형식 (JSON):
{
  "pastLifeJob": "구체적인 전생 직업명",
  "era": "시대와 지역",
  "description": "직업에 대한 흥미로운 설명 (2-3문장)",
  "personality": "그 직업을 가졌던 이유와 성격 분석",
  "abilities": ["특별한 능력1", "특별한 능력2", "특별한 능력3"],
  "lifestory": "전생에서의 삶의 이야기 (드라마틱하고 재미있게)",
  "modernConnection": "현재 삶과의 연결점",
  "advice": "전생에서 얻을 수 있는 지혜나 조언",
  "compatibility": {
    "bestMatch": "가장 잘 맞는 현재 직업",
    "worstMatch": "피해야 할 직업"
  }
}

MZ세대가 좋아할 만한 재미있고 신비로운 직업들을 제시해주세요. 너무 흔한 직업보다는 특별하고 흥미로운 직업으로!`
          },
          {
            role: 'user',
            content: `이 답변들을 바탕으로 나의 전생 직업을 분석해주세요: ${JSON.stringify(answers)}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.8
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    let result;
    try {
      result = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      
      // Fallback result
      result = {
        pastLifeJob: "신비로운 궁중 점성술사",
        era: "조선시대 후기",
        description: "별의 움직임을 읽어 왕의 운명을 예언했던 비밀스러운 점성술사였습니다.",
        personality: "신중하고 지혜로우며, 미래를 내다보는 직감이 뛰어났습니다.",
        abilities: ["별자리 해석", "미래 예견", "왕실 조언"],
        lifestory: "어린 시절부터 별에 대한 특별한 감각을 보여 궁중에 발탁되어 왕의 신뢰를 받는 점성술사가 되었습니다.",
        modernConnection: "현재도 직감이 뛰어나고 미래를 계획하는 능력이 탁월합니다.",
        advice: "별처럼 높은 곳에서 전체를 내려다보는 시각을 가지세요.",
        compatibility: {
          bestMatch: "데이터 분석가, 컨설턴트",
          worstMatch: "단순 반복 업무"
        }
      };
    }

    console.log('Past life job analysis result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in past-life-job-analyzer:', error);
    return new Response(JSON.stringify({ 
      error: 'Analysis failed',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});