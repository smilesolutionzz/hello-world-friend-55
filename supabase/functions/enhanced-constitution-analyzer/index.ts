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

    // Lovable AI 사용 (Gemini 2.5 Flash - 비용 효율적)
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not found');
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

    // Lovable AI Gateway 호출 (Gemini 2.5 Flash)
    console.log('Calling Lovable AI for constitution analysis...');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('Payment required. Please add credits.');
      }
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('Lovable AI response received');
    
    let analysisResult;

    try {
      let content = aiResponse.choices[0].message.content;
      console.log('Parsing AI response...');
      
      // Markdown 코드 블록 제거
      if (content.includes('```json')) {
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      
      analysisResult = JSON.parse(content);
      console.log('Successfully parsed AI response');
    } catch (e) {
      console.error('JSON parsing failed:', e);
      console.error('Raw content:', aiResponse.choices[0].message.content);
      
      // JSON 파싱 실패 시 상세한 기본 구조로 응답
      analysisResult = {
        constitution_analysis: `${userConstitution.name} 체질로 진단되었습니다. ${userConstitution.characteristics}이며, ${userConstitution.personality}한 성향을 가지고 있습니다. 체질에 맞는 맞춤 건강관리가 필요합니다.`,
        characteristics: {
          strengths: [
            userConstitution.characteristics,
            userConstitution.personality,
            "개인별 체질에 맞는 건강관리 가능"
          ],
          weaknesses: [
            "체질에 맞지 않는 음식 섭취 시 건강 악화",
            "스트레스에 민감할 수 있음",
            "계절 변화에 주의 필요"
          ]
        },
        herbal_prescription: {
          main_herbs: [
            {name: "인삼", effect: "기력 회복 및 면역력 강화", dosage: "하루 2회, 식후 복용"},
            {name: "황기", effect: "체력 증진 및 면역력 향상", dosage: "하루 2회, 식후 복용"},
            {name: "당귀", effect: "혈액 순환 개선", dosage: "하루 2회, 식후 복용"}
          ],
          formula_name: `${userConstitution.name} 맞춤 처방`,
          preparation_method: "전문 한의사 상담 후 체질에 맞게 조제"
        },
        diet_therapy: {
          beneficial_foods: constitution === 'soyang' 
            ? ["수박", "오이", "보리", "녹두", "돼지고기"] 
            : constitution === 'soeum'
            ? ["닭고기", "염소고기", "찹쌀", "생강", "마늘"]
            : constitution === 'taeyang'
            ? ["메밀", "새우", "게", "조개", "해삼"]
            : ["콩", "들깨", "우엉", "연근", "토란"],
          foods_to_avoid: constitution === 'soyang'
            ? ["닭고기", "염소고기", "개고기", "생강", "후추"]
            : constitution === 'soeum'
            ? ["냉면", "보리", "돼지고기", "수박", "참외"]
            : constitution === 'taeyang'
            ? ["기름진 음식", "육류", "생강", "마늘", "고추"]
            : ["밀가루", "달고 기름진 음식", "닭고기", "개고기", "술"],
          meal_timing: "규칙적인 시간에 식사하며, 과식하지 않기",
          cooking_methods: "체질에 맞는 조리법으로 음식의 성질 조절"
        },
        lifestyle_recommendations: {
          exercise: constitution === 'soyang'
            ? "수영, 요가 등 차분한 운동 권장"
            : constitution === 'soeum'
            ? "가벼운 산책, 스트레칭 등 부드러운 운동"
            : constitution === 'taeyang'
            ? "하체 운동, 걷기 등 꾸준한 운동"
            : "유산소 운동, 등산 등 활발한 활동 권장",
          sleep: "규칙적인 수면 패턴 유지, 충분한 휴식",
          stress_management: "명상, 심호흡, 취미활동으로 스트레스 해소",
          seasonal_care: "계절 변화에 따른 체온 조절과 면역력 관리"
        },
        health_management: {
          vulnerable_conditions: constitution === 'soyang'
            ? ["열성 질환", "고혈압", "두통"]
            : constitution === 'soeum'
            ? ["소화불량", "냉증", "저혈압"]
            : constitution === 'taeyang'
            ? ["간 질환", "상열감", "어지러움"]
            : ["비만", "고지혈증", "당뇨"],
          prevention_methods: [
            "체질에 맞는 식단 관리",
            "규칙적인 운동",
            "충분한 수면과 휴식"
          ],
          regular_checkups: "연 1-2회 정기 건강검진 권장"
        },
        clinic_recommendation: "전문 한의사와의 상담을 통해 더 정확한 진단과 맞춤 처방을 받으시기 바랍니다."
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
      error: error instanceof Error ? error.message : 'Unknown error',
      constitution_analysis: "분석 중 오류가 발생했습니다. 전문가와 상담해주세요.",
      clinic_recommendation: "가까운 한의원에서 정확한 체질 진단을 받으시기 바랍니다."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});