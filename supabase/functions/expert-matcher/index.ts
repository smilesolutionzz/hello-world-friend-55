import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { analysis, ageGroup, age } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    console.log('Processing expert matching:', { ageGroup, age });

    // Expert database with comprehensive profiles
    const expertDatabase = [
      {
        id: "expert_001",
        name: "김미영",
        title: "임상심리학자",
        specialization: "아동청소년 상담, ADHD, 학습장애",
        experience: "15년",
        education: "서울대학교 심리학과 박사",
        approach: "인지행동치료, 놀이치료",
        availability: "월-금 오전",
        rating: 4.9,
        reviews: 247,
        ageGroups: ["infant", "child"],
        keywords: ["adhd", "학습", "주의력", "과잉행동", "발달지연", "언어발달"]
      },
      {
        id: "expert_002", 
        name: "박준호",
        title: "정신건강의학과 전문의",
        specialization: "우울증, 불안장애, 스트레스 관리",
        experience: "12년",
        education: "연세대학교 의과대학",
        approach: "약물치료, 인지행동치료",
        availability: "월-토 전체",
        rating: 4.8,
        reviews: 312,
        ageGroups: ["adult"],
        keywords: ["우울", "불안", "스트레스", "공황", "강박", "트라우마"]
      },
      {
        id: "expert_003",
        name: "이수진",
        title: "상담심리학자",
        specialization: "가족상담, 부부상담, 대인관계",
        experience: "10년", 
        education: "고려대학교 상담심리학과 석사",
        approach: "체계적 가족치료, 정서중심치료",
        availability: "화-토 오후",
        rating: 4.7,
        reviews: 189,
        ageGroups: ["adult"],
        keywords: ["가족", "부부", "관계", "소통", "갈등", "이혼"]
      },
      {
        id: "expert_004",
        name: "최영수",
        title: "놀이치료사",
        specialization: "놀이치료, 미술치료, 정서조절",
        experience: "8년",
        education: "이화여대 아동학과 석사",
        approach: "놀이치료, 표현예술치료",
        availability: "월-금 오후",
        rating: 4.9,
        reviews: 156,
        ageGroups: ["infant", "child"], 
        keywords: ["정서", "행동문제", "분리불안", "틱", "야뇨", "놀이"]
      },
      {
        id: "expert_005",
        name: "정민아",
        title: "청소년 상담사",
        specialization: "학교폭력, 진로상담, 정체성 형성",
        experience: "7년",
        education: "서강대학교 교육학과 석사",
        approach: "개인상담, 집단상담",
        availability: "월-금 저녁",
        rating: 4.6,
        reviews: 203,
        ageGroups: ["child"],
        keywords: ["진로", "학교", "폭력", "왕따", "정체성", "진학"]
      },
      {
        id: "expert_006",
        name: "황지훈",
        title: "중독전문상담사",
        specialization: "알코올중독, 게임중독, 행동중독",
        experience: "9년",
        education: "카톨릭대학교 중독재활학과 석사",
        approach: "인지행동치료, 동기강화상담",
        availability: "매일 24시간",
        rating: 4.5,
        reviews: 134,
        ageGroups: ["child", "adult"],
        keywords: ["중독", "게임", "알코올", "도박", "스마트폰", "흡연"]
      }
    ];

    const matchingPrompt = `다음 심리분석 결과를 바탕으로 가장 적합한 전문가 3명을 추천해주세요.

**대상 정보:**
- 연령군: ${ageGroup === 'infant' ? '유아' : ageGroup === 'child' ? '아동/청소년' : '성인'} 
- 나이: ${age}세

**심리분석 결과:**
${analysis}

**전문가 데이터베이스:**
${expertDatabase.map(expert => `
ID: ${expert.id}
이름: ${expert.name} (${expert.title})
전문분야: ${expert.specialization}
경력: ${expert.experience}
치료접근: ${expert.approach}
평점: ${expert.rating}/5.0 (리뷰 ${expert.reviews}개)
가능연령: ${expert.ageGroups.join(', ')}
키워드: ${expert.keywords.join(', ')}
`).join('\n')}

**매칭 기준:**
1. 연령군 적합성 (필수)
2. 전문분야 일치도
3. 치료 접근법 적합성  
4. 경력 및 평점
5. 분석 결과와 키워드 연관성

**응답 형식:**
추천하는 전문가 3명의 ID를 우선순위대로 반환하되, 각각에 대한 추천 이유를 명확히 설명해주세요.

형식: expert_XXX, expert_YYY, expert_ZZZ`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: '당신은 심리상담 전문가 매칭 시스템입니다. 분석 결과에 가장 적합한 전문가를 정확하게 추천합니다.' },
          { role: 'user', content: matchingPrompt }
        ],
        max_completion_tokens: 800,
      }),
    });

    const data = await response.json();
    console.log('OpenAI matching response received');

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const matchingResult = data.choices[0].message.content;

    // Extract expert IDs from AI response
    const expertIdPattern = /expert_\d{3}/g;
    const recommendedIds = matchingResult.match(expertIdPattern) || [];

    // Get matched experts with reasoning
    const matchedExperts = recommendedIds.slice(0, 3).map(id => {
      const expert = expertDatabase.find(e => e.id === id);
      if (!expert) return null;
      
      return {
        ...expert,
        matchScore: Math.random() * 20 + 80, // Simulated match score 80-100
        estimatedWaitTime: `${Math.floor(Math.random() * 14 + 1)}일`,
        consultationFee: Math.floor(Math.random() * 50000 + 100000)
      };
    }).filter(Boolean);

    // Fallback: If no experts matched, use default recommendations by age group
    if (matchedExperts.length === 0) {
      const fallbackExperts = expertDatabase
        .filter(expert => expert.ageGroups.includes(ageGroup))
        .slice(0, 3)
        .map(expert => ({
          ...expert,
          matchScore: Math.random() * 15 + 70,
          estimatedWaitTime: `${Math.floor(Math.random() * 14 + 1)}일`,
          consultationFee: Math.floor(Math.random() * 50000 + 100000)
        }));
      
      return new Response(JSON.stringify({
        experts: fallbackExperts,
        reasoning: "연령대에 적합한 기본 전문가들을 추천드립니다.",
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Expert matching completed:', { matchedCount: matchedExperts.length });

    return new Response(JSON.stringify({
      experts: matchedExperts,
      reasoning: matchingResult,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in expert matcher function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      experts: [],
      reasoning: "전문가 매칭 중 오류가 발생했습니다."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});