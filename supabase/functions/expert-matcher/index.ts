import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExpertMatchRequest {
  analysis: string;
  ageGroup: string;
  age?: number;
  preferences?: {
    consultationType?: string;
    budget?: number;
    language?: string;
  };
}

interface Expert {
  id: string;
  full_name: string;
  professional_title: string;
  specializations: string[];
  years_experience: number;
  hourly_rate: number;
  bio: string;
  consultation_methods: string[];
  average_rating: number;
  total_sessions: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Expert matcher function called');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { analysis, ageGroup, age, preferences }: ExpertMatchRequest = await req.json();

    console.log('Received request:', { ageGroup, age, preferencesProvided: !!preferences });

    // 실제 전문가 데이터 가져오기
    const { data: experts, error: expertsError } = await supabase
      .from('experts')
      .select('*')
      .eq('is_verified', true)
      .eq('is_available', true);

    if (expertsError) {
      console.error('Error fetching experts:', expertsError);
      throw new Error('전문가 데이터를 가져오는 중 오류가 발생했습니다.');
    }

    console.log('Found experts:', experts.length);

    if (!experts || experts.length === 0) {
      return new Response(JSON.stringify({ 
        experts: [],
        message: '현재 이용 가능한 전문가가 없습니다.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // AI를 사용한 매칭 분석
    const matchingPrompt = `
평가 분석 결과:
${analysis}

연령대: ${ageGroup}
나이: ${age || '미제공'}

다음 전문가들 중에서 위 분석 결과에 가장 적합한 상위 3명을 선별하고 매칭 점수(0-100)를 부여해주세요:

${experts.map((expert: Expert, index: number) => `
${index + 1}. ${expert.full_name} (${expert.professional_title})
- 전문 분야: ${expert.specializations.join(', ')}
- 경력: ${expert.years_experience}년
- 시간당 요금: ${expert.hourly_rate.toLocaleString()}원
- 상담 방식: ${expert.consultation_methods.join(', ')}
- 소개: ${expert.bio}
`).join('\n')}

매칭 기준:
1. 전문 분야와 평가 결과의 연관성 (40%)
2. 경력과 전문성 (25%)
3. 연령대 적합성 (20%)
4. 상담 방식 적합성 (15%)

응답은 다음 JSON 형식으로만 제공해주세요:
{
  "matches": [
    {
      "expert_id": "전문가 ID",
      "match_score": 95,
      "reasoning": "매칭 사유"
    }
  ]
}
`;

    // OpenAI API 호출
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
            role: 'system', 
            content: '당신은 심리/발달 전문가 매칭 시스템입니다. 평가 분석 결과를 바탕으로 가장 적합한 전문가를 추천해주세요.'
          },
          { role: 'user', content: matchingPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      throw new Error('AI 매칭 분석 중 오류가 발생했습니다.');
    }

    const aiResult = await response.json();
    console.log('AI matching result received');

    let matchingResult;
    try {
      matchingResult = JSON.parse(aiResult.choices[0].message.content);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback: 기본 매칭 로직
      matchingResult = {
        matches: experts.slice(0, 3).map((expert: Expert, index: number) => ({
          expert_id: expert.id,
          match_score: 90 - (index * 10),
          reasoning: `${expert.professional_title}로서 ${expert.specializations.join(', ')} 분야에 전문성을 가지고 있습니다.`
        }))
      };
    }

    // 매칭된 전문가 정보와 함께 반환
    const matchedExperts = matchingResult.matches.map((match: any) => {
      const expert = experts.find((e: Expert) => e.id === match.expert_id);
      return {
        ...expert,
        match_score: match.match_score,
        reasoning: match.reasoning
      };
    });

    console.log('Returning matched experts:', matchedExperts.length);

    return new Response(JSON.stringify({
      experts: matchedExperts,
      totalMatches: matchedExperts.length,
      analysisBasedMatch: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Expert matcher error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : '매칭 중 오류가 발생했습니다.',
      experts: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});