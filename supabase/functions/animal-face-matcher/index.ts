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
    const { image, imageType } = await req.json();

    console.log('Analyzing face for animal matching');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `당신은 얼굴을 분석해서 닮은 동물을 찾아주는 재미있고 창의적인 AI입니다. 초등학생과 청소년들이 친구들과 함께 웃으며 즐길 수 있도록 재미있게 분석해주세요!

분석할 요소들:
- 얼굴형 (둥근형, 각진형, 긴형 등)
- 눈의 모양과 크기
- 코의 형태
- 입과 입술
- 전체적인 인상과 분위기

응답 형식 (JSON):
{
  "matchedAnimal": "닮은 동물명 (귀엽고 친근한 동물로)",
  "similarity": 75-95,
  "facialFeatures": {
    "eyes": "눈 특징과 동물과의 유사점 (재미있게 설명)",
    "nose": "코 특징과 동물과의 유사점 (귀엽게 표현)", 
    "face_shape": "얼굴형과 동물과의 유사점 (웃기게 분석)",
    "overall": "전체적인 인상 (긍정적이고 재미있게)"
  },
  "animalCharacteristics": {
    "personality": ["성격특성1", "성격특성2", "성격특성3"],
    "strengths": ["강점1", "강점2", "강점3"],
    "habitat": "서식지와 환경 (재미있게 설명)"
  },
  "funFacts": [
    "이 동물에 대한 재미있는 사실1 (웃긴 포인트 포함)",
    "이 동물에 대한 재미있는 사실2 (놀라운 능력)", 
    "이 동물에 대한 재미있는 사실3 (귀여운 습성)"
  ],
  "compatibility": {
    "friends": ["잘 맞는 동물1", "잘 맞는 동물2"],
    "rivals": ["재미있는 경쟁 관계 동물1", "경쟁 관계 동물2"]
  },
  "advice": "이 동물의 특성을 활용한 재미있고 긍정적인 조언",
  "emoji": "대표 이모지"
}

중요: 항상 긍정적이고 재미있게! 친구들이 부러워할 만한 동물로 매칭해주세요!`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '이 사진 속 얼굴을 분석해서 닮은 동물을 찾아주세요!'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_completion_tokens: 1000
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
        matchedAnimal: "귀여운 강아지",
        similarity: 80,
        facialFeatures: {
          eyes: "똘똘하고 밝은 눈이 강아지와 닮았어요",
          nose: "작고 앙증맞은 코가 강아지와 비슷해요",
          face_shape: "둥글둥글한 얼굴형이 강아지 같아요",
          overall: "전체적으로 친근하고 사랑스러운 인상"
        },
        animalCharacteristics: {
          personality: ["충성스러운", "활발한", "사교적인"],
          strengths: ["친화력", "에너지", "신뢰성"],
          habitat: "사람들과 함께 하는 따뜻한 집"
        },
        funFacts: [
          "강아지는 사람의 감정을 읽는 능력이 뛰어나요",
          "꼬리 흔드는 것은 기쁨의 표현이에요",
          "후각이 사람보다 1만 배 뛰어나답니다"
        ],
        compatibility: {
          friends: ["고양이", "토끼"],
          rivals: ["고양이", "다람쥐"]
        },
        advice: "강아지처럼 순수한 마음과 충성심을 간직하세요!",
        emoji: "🐶"
      };
    }

    console.log('Animal face matching result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in animal-face-matcher:', error);
    return new Response(JSON.stringify({ 
      error: 'Analysis failed',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});