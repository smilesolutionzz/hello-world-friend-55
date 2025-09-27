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
    const { userData, analysisType } = await req.json();
    
    if (!userData) {
      throw new Error('User data is required');
    }

    // OpenAI API 키 확인
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Starting personalized AI coaching analysis...');

    // 사용자 데이터 구조화
    const {
      sleepTime,
      wakeTime,
      stressLevel,
      energyLevel,
      currentChallenges,
      patterns
    } = userData;

    // AI 코칭 분석을 위한 상세 프롬프트
    const coachingPrompt = `
당신은 개인 맞춤형 라이프 코칭 전문가입니다. 다음 사용자 데이터를 분석하여 맞춤형 루틴과 인사이트를 제공해주세요:

사용자 정보:
- 취침 시간: ${sleepTime || '미제공'}
- 기상 시간: ${wakeTime || '미제공'}
- 스트레스 레벨: ${stressLevel}/10
- 에너지 레벨: ${energyLevel}/10
- 현재 고민: ${currentChallenges || '미제공'}

현재 생활 패턴:
${patterns.map(p => `- ${p.category}: ${p.activity} (주 ${p.frequency}회, ${p.timeOfDay}, 만족도: ${p.satisfaction}/5)`).join('\n')}

다음 형식의 JSON으로 응답해주세요:
{
  "routines": [
    {
      "id": "1",
      "title": "루틴 제목",
      "description": "상세 설명",
      "category": "아침루틴|점심루틴|저녁루틴|수면|운동|명상",
      "timeSlot": "권장 시간대",
      "difficulty": "easy|medium|hard",
      "estimatedTime": 시간(분),
      "benefits": ["효과1", "효과2", "효과3"]
    }
  ],
  "insights": [
    {
      "type": "pattern|recommendation|warning|achievement",
      "title": "인사이트 제목",
      "description": "상세 설명",
      "actionable": true/false,
      "priority": "low|medium|high"
    }
  ],
  "overallAssessment": {
    "strengthAreas": ["강점 영역"],
    "improvementAreas": ["개선 영역"],
    "recommendedFocus": "주요 개선 포커스",
    "expectedOutcome": "예상 결과"
  }
}

사용자의 현재 상태를 고려하여:
1. 실현 가능한 루틴을 제안하세요
2. 스트레스와 에너지 레벨을 개선할 수 있는 방법을 포함하세요
3. 기존 패턴을 개선하는 방향으로 제안하세요
4. 한국인의 라이프스타일을 고려하세요
5. 단계적으로 실행 가능한 계획을 제시하세요
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
            content: '당신은 라이프 코칭과 행동 변화 전문가입니다. 개인의 생활 패턴을 분석하고 실현 가능한 개선 방안을 제시할 수 있습니다.'
          },
          {
            role: 'user',
            content: coachingPrompt
          }
        ],
        temperature: 0.4,
        max_tokens: 2000
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
        routines: [
          {
            id: '1',
            title: '모닝 스트레칭',
            description: '기상 후 10분간 가벼운 스트레칭으로 하루를 시작하세요',
            category: '아침루틴',
            timeSlot: '07:00-07:10',
            difficulty: 'easy',
            estimatedTime: 10,
            benefits: ['혈액순환 개선', '에너지 증진', '관절 건강']
          },
          {
            id: '2',
            title: '저녁 독서',
            description: '잠자리 전 30분간 독서로 마음을 안정시키세요',
            category: '저녁루틴',
            timeSlot: '22:00-22:30',
            difficulty: 'easy',
            estimatedTime: 30,
            benefits: ['스트레스 완화', '수면 질 개선', '지식 습득']
          }
        ],
        insights: [
          {
            type: 'recommendation',
            title: '수면 시간 개선 필요',
            description: '규칙적인 수면 패턴을 만들어 생체리듬을 안정화하세요',
            actionable: true,
            priority: 'high'
          }
        ],
        overallAssessment: {
          strengthAreas: ['자기개선 의지'],
          improvementAreas: ['수면 패턴', '스트레스 관리'],
          recommendedFocus: '규칙적인 루틴 정착',
          expectedOutcome: '2-3주 내 생활 리듬 개선'
        }
      };
    }

    console.log('Coaching analysis complete');

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      ...analysisResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Personalized AI coaching error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});