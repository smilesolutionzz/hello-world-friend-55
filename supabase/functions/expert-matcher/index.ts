import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const requestBody = await req.json();
    
    // Check if this is an AI analysis request or traditional matching
    if (requestBody.analysis) {
      return await handleAIAnalysisMatching(requestBody);
    }

    const { 
      specializations, 
      consultationType, 
      urgencyLevel = 'normal',
      preferredLanguage = 'Korean'
    } = requestBody;

    console.log('Expert matching request:', {
      specializations,
      consultationType,
      urgencyLevel,
      preferredLanguage
    });

    // 기본 쿼리 - 검증되고 사용 가능한 전문가들
    let query = supabaseClient
      .from('experts')
      .select(`
        *,
        expert_availability (*)
      `)
      .eq('is_verified', true)
      .eq('is_available', true);

    // 전문 분야로 필터링
    if (specializations && specializations.length > 0) {
      query = query.overlaps('specializations', specializations);
    }

    // 상담 방식으로 필터링
    if (consultationType) {
      query = query.contains('consultation_methods', [consultationType]);
    }

    // 언어로 필터링
    if (preferredLanguage) {
      query = query.contains('languages', [preferredLanguage]);
    }

    const { data: experts, error } = await query;

    if (error) {
      console.error('Expert query error:', error);
      throw error;
    }

    if (!experts || experts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: '조건에 맞는 전문가를 찾을 수 없습니다.',
          experts: [] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 현재 시간대 기준으로 사용 가능한 전문가 필터링
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    const availableExperts = experts.filter(expert => {
      // 긴급한 경우 시간 무관하게 모든 전문가 포함
      if (urgencyLevel === 'urgent') {
        return true;
      }

      // 일반적인 경우 현재 시간에 사용 가능한 전문가만
      const todayAvailability = expert.expert_availability?.find(
        (avail: any) => avail.day_of_week === currentDay && avail.is_active
      );

      if (!todayAvailability) {
        return false;
      }

      return currentTime >= todayAvailability.start_time && 
             currentTime <= todayAvailability.end_time;
    });

    // 매칭 점수 계산 및 정렬
    const scoredExperts = availableExperts.map(expert => {
      let score = 0;

      // 기본 점수 (평점)
      score += expert.average_rating * 20;

      // 경력 점수
      score += Math.min(expert.years_experience * 2, 20);

      // 세션 수 점수 (신뢰도)
      score += Math.min(expert.total_sessions * 0.5, 30);

      // 전문 분야 일치도
      if (specializations && specializations.length > 0) {
        const matchingSpecs = expert.specializations.filter(
          (spec: string) => specializations.includes(spec)
        ).length;
        score += (matchingSpecs / specializations.length) * 30;
      }

      // 현재 시간 사용 가능성 보너스
      const todayAvailability = expert.expert_availability?.find(
        (avail: any) => avail.day_of_week === currentDay && avail.is_active
      );
      
      if (todayAvailability) {
        score += 20;
      }

      // 상담 방식 일치 보너스
      if (consultationType && expert.consultation_methods.includes(consultationType)) {
        score += 15;
      }

      return {
        ...expert,
        matching_score: Math.round(score)
      };
    });

    // 점수 순으로 정렬
    const sortedExperts = scoredExperts.sort((a, b) => b.matching_score - a.matching_score);

    // 상위 5명 추천
    const recommendedExperts = sortedExperts.slice(0, 5);

    console.log(`Found ${recommendedExperts.length} matching experts`);

    return new Response(
      JSON.stringify({
        success: true,
        experts: recommendedExperts,
        total_available: availableExperts.length,
        matching_criteria: {
          specializations,
          consultationType,
          urgencyLevel,
          preferredLanguage
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Expert matching error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// AI Analysis based expert matching
async function handleAIAnalysisMatching(requestBody: any) {
  const { analysis, ageGroup, age } = requestBody;
  
  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    console.log('AI Expert matching request:', { analysisLength: analysis.length, ageGroup, age });

    const systemPrompt = `당신은 전문가 매칭 시스템입니다. 주어진 심리/발달 분석을 바탕으로 가장 적합한 전문가를 추천해주세요.

분석 내용을 검토하고 다음 전문 분야 중에서 가장 적합한 전문가들을 매칭해주세요:
- 임상심리사 (Clinical Psychologist)
- 발달심리전문가 (Developmental Psychologist)  
- 아동심리치료사 (Child Psychotherapist)
- 언어치료사 (Speech-Language Pathologist)
- 작업치료사 (Occupational Therapist)
- 행동분석가 (Behavior Analyst)
- 특수교육전문가 (Special Education Specialist)
- 가족상담사 (Family Counselor)

응답은 반드시 다음 JSON 형식으로 해주세요:
{
  "experts": [
    {
      "id": "unique_id",
      "name": "전문가 이름",
      "specialty": "전문분야",
      "experience": 경력년수,
      "rating": 평점(1-5),
      "location": "지역",
      "availability": "예약 가능 시간",
      "matchReason": "매칭 사유 (왜 이 전문가가 적합한지)",
      "confidence": 매칭_신뢰도(0-100)
    }
  ]
}

최대 5명의 전문가를 추천하고, 신뢰도가 높은 순으로 정렬해주세요.`;

    const userPrompt = `
연령대: ${ageGroup} (${age}세)
심리/발달 분석 결과:
${analysis}

위 분석을 바탕으로 가장 적합한 전문가들을 추천해주세요.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received for expert matching');

    let expertRecommendations;
    try {
      expertRecommendations = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      expertRecommendations = createFallbackExperts(ageGroup);
    }

    if (!expertRecommendations.experts || !Array.isArray(expertRecommendations.experts)) {
      expertRecommendations = createFallbackExperts(ageGroup);
    }

    console.log('Expert recommendations generated:', expertRecommendations.experts.length);

    return new Response(JSON.stringify(expertRecommendations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('AI Expert matcher error:', error);
    
    const fallbackExperts = createFallbackExperts(requestBody.ageGroup || 'adult');
    
    return new Response(JSON.stringify(fallbackExperts), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
}

function createFallbackExperts(ageGroup: string) {
  const baseExperts = [
    {
      id: "expert_001",
      name: "김민수 임상심리사",
      specialty: "임상심리학",
      experience: 12,
      rating: 4.8,
      location: "서울 강남구",
      availability: "평일 오전 9시-오후 6시",
      matchReason: "종합적인 심리 평가 및 상담 전문가",
      confidence: 85
    },
    {
      id: "expert_002", 
      name: "박지영 발달심리전문가",
      specialty: "발달심리학",
      experience: 8,
      rating: 4.7,
      location: "서울 서초구",
      availability: "평일 오후 2시-저녁 8시",
      matchReason: "발달 단계별 맞춤 치료 프로그램 제공",
      confidence: 82
    },
    {
      id: "expert_003",
      name: "이현진 아동심리치료사", 
      specialty: "아동심리치료",
      experience: 10,
      rating: 4.9,
      location: "경기 분당",
      availability: "주말 포함 유연한 시간",
      matchReason: "아동 특화 치료 경험과 높은 치료 성과",
      confidence: 88
    }
  ];

  if (ageGroup === 'infant' || ageGroup === 'child') {
    baseExperts.forEach(expert => {
      if (expert.specialty.includes('아동')) {
        expert.confidence += 10;
      }
    });
  }

  return { experts: baseExperts };
}