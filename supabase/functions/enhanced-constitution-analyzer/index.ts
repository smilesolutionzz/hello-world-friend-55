import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { constitution, scores, answers } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found');
    }

    // 체질별 기본 정보
    const constitutionInfo = {
      soyang: {
        name: '소양인',
        characteristics: '열이 많고 활발한 체질',
        organs: '신장은 작고 비장이 큰 체질',
        personality: '외향적이고 적극적이며 창의적'
      },
      soeum: {
        name: '소음인',
        characteristics: '소화기가 약하고 차가운 체질',
        organs: '위가 작고 신장이 큰 체질',
        personality: '내성적이고 신중하며 섬세함'
      },
      taeyang: {
        name: '태양인',
        characteristics: '기운이 위로 올라가는 체질',
        organs: '간이 작고 폐가 큰 체질',
        personality: '진취적이고 리더십이 강함'
      },
      taeeum: {
        name: '태음인',
        characteristics: '차분하고 안정된 체질',
        organs: '폐가 작고 간이 큰 체질',
        personality: '침착하고 끈기가 있으며 신뢰할 수 있음'
      }
    };

    const userConstitution = constitutionInfo[constitution as keyof typeof constitutionInfo];

    // OpenAI 프롬프트 구성
    const systemPrompt = `당신은 사상의학 전문가로서 체질 분석과 한방 처방을 전문으로 하는 한의사입니다. 
    사용자의 체질 검사 결과를 바탕으로 다음을 제공해주세요:

    1. 체질 분석 결과 (상세한 설명)
    2. 체질별 특성과 장단점
    3. 맞춤 한약 처방 (3-5가지 주요 약재와 효능)
    4. 식이요법 (좋은 음식 5가지, 피해야 할 음식 5가지)
    5. 생활습관 개선안 (운동, 수면, 스트레스 관리)
    6. 건강 관리 포인트 (계절별 주의사항 포함)
    7. 체질별 취약 질환과 예방법

    응답은 JSON 형식으로 다음 구조를 따라주세요:
    {
      "constitution_analysis": "상세한 체질 분석",
      "characteristics": {
        "strengths": ["장점1", "장점2", "장점3"],
        "weaknesses": ["단점1", "단점2", "단점3"]
      },
      "herbal_prescription": {
        "main_herbs": [
          {"name": "약재명", "effect": "효능", "dosage": "복용법"}
        ],
        "formula_name": "처방명",
        "preparation_method": "조제 방법"
      },
      "diet_therapy": {
        "beneficial_foods": ["좋은음식1", "좋은음식2", "좋은음식3", "좋은음식4", "좋은음식5"],
        "foods_to_avoid": ["피할음식1", "피할음식2", "피할음식3", "피할음식4", "피할음식5"],
        "meal_timing": "식사 시간 권장사항",
        "cooking_methods": "권장 조리법"
      },
      "lifestyle_recommendations": {
        "exercise": "적합한 운동법",
        "sleep": "수면 관리법",
        "stress_management": "스트레스 관리법",
        "seasonal_care": "계절별 관리법"
      },
      "health_management": {
        "vulnerable_conditions": ["취약질환1", "취약질환2"],
        "prevention_methods": ["예방법1", "예방법2"],
        "regular_checkups": "정기 검진 권장사항"
      },
      "clinic_recommendation": "제휴 한의원 연계 필요성과 추가 상담 권장사항"
    }

    모든 내용은 한국어로 작성하고, 전문적이면서도 이해하기 쉽게 설명해주세요.`;

    const userPrompt = `
    사용자의 체질 검사 결과:
    - 진단된 체질: ${userConstitution.name}
    - 체질별 점수: 소양인 ${scores.soyang}점, 소음인 ${scores.soeum}점, 태양인 ${scores.taeyang}점, 태음인 ${scores.taeeum}점
    - 검사 응답: ${JSON.stringify(answers)}
    
    이 결과를 바탕으로 상세한 체질 분석과 맞춤 한방 처방을 제공해주세요.
    특히 사용자의 응답 패턴을 분석하여 개인별 특성을 반영한 맞춤형 조언을 포함해주세요.
    `;

    // OpenAI API 호출
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    let analysisResult;

    try {
      analysisResult = JSON.parse(aiResponse.choices[0].message.content);
    } catch (e) {
      // JSON 파싱 실패 시 기본 구조로 응답
      analysisResult = {
        constitution_analysis: aiResponse.choices[0].message.content,
        characteristics: {
          strengths: [userConstitution.characteristics],
          weaknesses: ["개인차에 따른 체질별 특성"]
        },
        herbal_prescription: {
          main_herbs: [
            {name: "체질별 맞춤 한약", effect: "전문 한의사 상담 필요", dosage: "전문가 처방에 따라"}
          ],
          formula_name: "맞춤 처방",
          preparation_method: "한의원에서 조제"
        },
        diet_therapy: {
          beneficial_foods: ["체질에 맞는 음식", "따뜻한 성질의 음식", "소화가 잘되는 음식"],
          foods_to_avoid: ["체질에 맞지 않는 음식", "자극적인 음식"],
          meal_timing: "규칙적인 식사",
          cooking_methods: "체질에 맞는 조리법"
        },
        lifestyle_recommendations: {
          exercise: "체질에 맞는 운동",
          sleep: "충분한 수면",
          stress_management: "스트레스 관리",
          seasonal_care: "계절별 건강관리"
        },
        health_management: {
          vulnerable_conditions: ["체질별 취약 부분"],
          prevention_methods: ["예방 관리법"],
          regular_checkups: "정기 검진"
        },
        clinic_recommendation: "전문 한의사와의 상담을 통해 더 정확한 진단과 처방을 받으시기 바랍니다."
      };
    }

    // 제휴 한의원 정보 추가
    const partnerClinics = [
      {
        name: "서울한의원",
        distance: "800m",
        rating: 4.8,
        specialties: ["체질 개선", "한약 처방", "침구 치료"],
        phone: "02-1234-5678",
        telemedicine: true
      },
      {
        name: "건강한의원", 
        distance: "1.2km",
        rating: 4.6,
        specialties: ["사상체질", "맞춤 한약", "생활습관 상담"],
        phone: "02-2345-6789",
        telemedicine: true
      },
      {
        name: "미래한의원",
        distance: "1.5km", 
        rating: 4.9,
        specialties: ["체질 진단", "한방 다이어트", "면역력 강화"],
        phone: "02-3456-7890",
        telemedicine: false
      }
    ];

    const finalResult = {
      ...analysisResult,
      constitution: constitution,
      constitution_name: userConstitution.name,
      scores: scores,
      partner_clinics: partnerClinics,
      analysis_date: new Date().toISOString(),
      recommendation_level: scores[constitution] >= 15 ? 'high' : scores[constitution] >= 10 ? 'medium' : 'low'
    };

    return new Response(JSON.stringify(finalResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhanced-constitution-analyzer:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      constitution_analysis: "분석 중 오류가 발생했습니다. 전문가와 상담해주세요.",
      clinic_recommendation: "가까운 한의원에서 정확한 체질 진단을 받으시기 바랍니다."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});