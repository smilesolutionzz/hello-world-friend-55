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

    console.log('Analyzing inner animal with answers:', answers);

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
            content: `당신은 깊은 심리 분석을 통해 내면의 동물을 찾아주는 전문 AI입니다. 40대 이상이 공감할 만한 깊이 있으면서도 재미있는 분석을 제공해주세요.

분석할 답변 유형:
- stress_response: 스트레스 반응 (fight, withdraw, seek_help, analyze)
- social_preference: 사회적 역할 (leader, supporter, mediator, advisor)
- decision_style: 의사결정 스타일 (instinct, emotion, relationship, logic)
- energy_source: 에너지 획득 방법 (action, solitude, interaction, learning)
- life_priority: 삶의 우선순위 (freedom, stability, love, achievement)
- communication: 소통 방식 (direct, gentle, warm, thoughtful)
- work_environment: 업무 환경 선호 (competitive, peaceful, collaborative, structured)
- hobby_preference: 취미 선호 (outdoor, indoor, social, cultural)
- conflict_resolution: 갈등 해결 (confront, avoid, compromise, research)
- learning_style: 학습 방식 (practice, observation, discussion, theory)
- change_attitude: 변화 태도 (embrace, cautious, supportive, analytical)
- life_philosophy: 인생 철학 (adventure, peace, connection, growth)

응답 형식 (JSON):
{
  "innerAnimal": "내면 동물명 (품격 있고 의미 있는 동물)",
  "animalType": "동물 분류 (예: 지혜로운 맹금류, 온화한 초식동물)",
  "personalityMatch": 85-98,
  "coreTraits": {
    "primary": "주요 성격 특성 (깊이 있게 분석)",
    "secondary": "부차적 성격 특성",
    "hidden": "숨겨진 특성 (통찰력 있게)"
  },
  "psychologicalAnalysis": {
    "strengths": ["심리적 강점1", "강점2", "강점3"],
    "challenges": ["성장 과제1", "과제2"],
    "motivations": ["내재적 동기1", "동기2", "동기3"]
  },
  "lifestyleAdvice": {
    "workEnvironment": "최적의 업무 환경 (구체적으로)",
    "relationships": "인간관계에서의 지혜로운 조언",
    "selfCare": "자기관리와 성장을 위한 방법"
  },
  "animalWisdom": {
    "instincts": "이 동물의 본능이 주는 삶의 지혜",
    "survival": "생존 전략에서 배우는 인생 교훈",
    "evolution": "더 나은 자신으로 성장하기 위한 조언"
  },
  "compatibility": {
    "romantic": "연애/결혼에서 잘 맞는 동물 유형과 이유",
    "friendship": "우정에서 잘 맞는 동물 유형",
    "work": "업무에서 시너지를 내는 동물 유형"
  },
  "lifePhase": {
    "current": "현재 인생 단계의 특징과 의미",
    "next": "다음 성장 단계를 위한 준비와 조언"
  }
}

중요: 40대 이상이 납득할 만한 깊이와 통찰력을 제공하되, 재미와 희망을 잃지 않도록 해주세요!`
          },
          {
            role: 'user',
            content: `이 답변들을 바탕으로 나의 내면 동물을 분석해주세요: ${JSON.stringify(answers)}`
          }
        ],
        max_completion_tokens: 1200
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
        innerAnimal: "지혜로운 부엉이",
        animalType: "야행성 맹금류",
        personalityMatch: 88,
        coreTraits: {
          primary: "깊은 사고력과 통찰력",
          secondary: "신중함과 관찰력", 
          hidden: "강한 직감과 보호본능"
        },
        psychologicalAnalysis: {
          strengths: ["분석적 사고", "깊은 통찰력", "신중한 판단력"],
          challenges: ["과도한 완벽주의", "결정 지연"],
          motivations: ["지혜 추구", "안정성", "성취감"]
        },
        lifestyleAdvice: {
          workEnvironment: "조용하고 집중할 수 있는 환경",
          relationships: "깊고 의미있는 관계를 추구하세요",
          selfCare: "충분한 휴식과 명상의 시간을 가지세요"
        },
        animalWisdom: {
          instincts: "직감을 믿고 침묵 속에서 지혜를 찾으세요",
          survival: "인내심과 관찰력이 최고의 무기입니다",
          evolution: "경험을 통해 더 깊은 지혜를 얻어가세요"
        },
        compatibility: {
          romantic: "안정적인 늑대나 충실한 코끼리",
          friendship: "신뢰할 수 있는 거북이나 현명한 여우",
          work: "체계적인 비버나 리더십 있는 사자"
        },
        lifePhase: {
          current: "경험을 바탕으로 지혜를 쌓아가는 시기",
          next: "지혜를 나누며 후배들을 이끌어갈 준비를 하세요"
        }
      };
    }

    console.log('Inner animal analysis result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in inner-animal-analyzer:', error);
    return new Response(JSON.stringify({ 
      error: 'Analysis failed',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});