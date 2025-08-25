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
    const { answers, testType } = await req.json();

    console.log('[PREMIUM-ASSESSMENT-ANALYZER] 프리미엄 분석 시작:', { testType, answersCount: Object.keys(answers).length });

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
            content: `당신은 한의학 전문가입니다. 사용자의 상세한 응답을 바탕으로 종합적인 한의학 분석을 제공해주세요.

분석 항목:
1. 사상체질 진단 (소양인/소음인/태양인/태음인)
2. 오장육부 기능 상태 분석
3. 맞춤 식이요법 (권장음식/피해야할음식)
4. 생활요법 (운동, 일상관리)
5. 한방 처방 추천
6. 혈자리 요법
7. 계절별 관리법
8. 주의사항

결과는 반드시 다음 JSON 형태로 응답해주세요:
{
  "constitution": "체질명",
  "overview": "종합 진단 내용",
  "constitution_details": {
    "characteristics": ["특성1", "특성2"],
    "personality": ["성격특징1", "성격특징2"]
  },
  "organ_analysis": {
    "heart": {"status": "good/weak", "status_text": "상태설명", "symptoms": ["증상1"], "care_method": "관리법"},
    "liver": {"status": "good/weak", "status_text": "상태설명", "symptoms": ["증상1"], "care_method": "관리법"},
    "spleen": {"status": "good/weak", "status_text": "상태설명", "symptoms": ["증상1"], "care_method": "관리법"},
    "lung": {"status": "good/weak", "status_text": "상태설명", "symptoms": ["증상1"], "care_method": "관리법"},
    "kidney": {"status": "good/weak", "status_text": "상태설명", "symptoms": ["증상1"], "care_method": "관리법"}
  },
  "diet_recommendations": {
    "recommended": [{"category": "분류", "foods": ["음식1", "음식2"]}],
    "avoid": [{"category": "분류", "foods": ["음식1", "음식2"]}],
    "guidelines": ["가이드1", "가이드2"]
  },
  "lifestyle_recommendations": {
    "exercise": {"recommended": ["운동1", "운동2"], "precautions": "주의사항"},
    "daily_care": ["관리법1", "관리법2"]
  },
  "prescriptions": [
    {"name": "처방명", "type": "한약/차/보조제", "description": "효능", "herbs": ["약재1", "약재2"], "usage": "복용법"}
  ],
  "acupuncture_points": [
    {"name": "혈자리명", "location": "위치", "effect": "효과", "method": "방법"}
  ],
  "seasonal_care": {
    "spring": ["봄관리법1"],
    "summer": ["여름관리법1"],
    "autumn": ["가을관리법1"],
    "winter": ["겨울관리법1"]
  },
  "warnings": "주의사항 및 전문의 상담 권고사항"
}`
          },
          {
            role: 'user',
            content: `다음 사용자 응답을 바탕으로 종합적인 한의학 분석을 해주세요:

응답 내용: ${JSON.stringify(answers, null, 2)}

위 정보를 바탕으로 사상체질을 진단하고, 오장육부 상태를 분석하여 맞춤형 한의학 처방과 생활지도를 제공해주세요. 
응답은 반드시 위에서 제시한 JSON 형태로만 작성해주세요.`
          }
        ],
        max_completion_tokens: 2000
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('[PREMIUM-ASSESSMENT-ANALYZER] OpenAI API 오류:', data);
      throw new Error(data.error?.message || 'OpenAI API 오류');
    }

    let analysisResult;
    try {
      const analysisText = data.choices[0].message.content;
      console.log('[PREMIUM-ASSESSMENT-ANALYZER] 원본 응답:', analysisText);
      
      // JSON 추출 시도
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON 형태를 찾을 수 없음');
      }
    } catch (parseError) {
      console.error('[PREMIUM-ASSESSMENT-ANALYZER] JSON 파싱 오류:', parseError);
      // 기본 구조 제공
      analysisResult = {
        constitution: "소음인",
        overview: "상세한 분석을 위해 추가 정보가 필요합니다.",
        constitution_details: {
          characteristics: ["체질 분석 중"],
          personality: ["성격 분석 중"]
        },
        organ_analysis: {
          heart: {status: "normal", status_text: "정상", symptoms: [], care_method: "규칙적인 생활"},
          liver: {status: "normal", status_text: "정상", symptoms: [], care_method: "스트레스 관리"},
          spleen: {status: "normal", status_text: "정상", symptoms: [], care_method: "규칙적인 식사"},
          lung: {status: "normal", status_text: "정상", symptoms: [], care_method: "충분한 휴식"},
          kidney: {status: "normal", status_text: "정상", symptoms: [], care_method: "적당한 운동"}
        },
        diet_recommendations: {
          recommended: [{category: "일반", foods: ["따뜻한 음식", "규칙적인 식사"]}],
          avoid: [{category: "일반", foods: ["과도한 냉음", "불규칙한 식사"]}],
          guidelines: ["규칙적인 식사를 하세요"]
        },
        lifestyle_recommendations: {
          exercise: {recommended: ["가벼운 운동"], precautions: "과도한 운동 피하기"},
          daily_care: ["충분한 휴식", "스트레스 관리"]
        },
        prescriptions: [{
          name: "기본 보양차",
          type: "차",
          description: "기력 회복",
          herbs: ["대추", "생강"],
          usage: "하루 2-3회 따뜻하게"
        }],
        acupuncture_points: [{
          name: "백회",
          location: "정수리",
          effect: "기력 회복",
          method: "부드럽게 지압"
        }],
        seasonal_care: {
          spring: ["봄철 건강관리"],
          summer: ["여름철 건강관리"],
          autumn: ["가을철 건강관리"],
          winter: ["겨울철 건강관리"]
        },
        warnings: "정확한 진단을 위해 한의원 방문을 권장합니다."
      };
    }
    
    console.log('[PREMIUM-ASSESSMENT-ANALYZER] 분석 완료');

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[PREMIUM-ASSESSMENT-ANALYZER] 오류:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      constitution: "분석 오류",
      overview: "분석 중 오류가 발생했습니다. 다시 시도해주세요."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});