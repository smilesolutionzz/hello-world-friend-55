import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  testType: string;
  score: number;
  maxScore: number;
  percentage: number;
  answers: Record<string, any>;
  severity: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { testType, score, maxScore, percentage, answers, severity }: AnalysisRequest = await req.json();
    
    console.log('Analyzing:', { testType, score, percentage, severity });

    let systemPrompt = '';
    let userPrompt = '';

    // 검사 유형별 전문 프롬프트 설정
    switch (testType) {
      case 'autism':
        systemPrompt = `당신은 30년 경력의 한의사로서 자폐 스펙트럼 아동 치료 전문가입니다. 
                       한의학적 관점에서 자폐 증상을 신(腎)의 정(精) 부족, 심(心)의 신(神) 불안정, 비위(脾胃) 기능 저하로 분석합니다.`;
        userPrompt = `자폐 스펙트럼 검사 결과 분석:
                     - 총점: ${score}/${maxScore}점 (${percentage}%)
                     - 심각도: ${severity}
                     
                     다음 내용으로 상세 분석을 해주세요:
                     1. 한의학적 체질 분석 (태음인/소음인/태양인/소양인 관점)
                     2. 오장육부 기능 상태 진단
                     3. 맞춤 한약 처방 (3-4개 처방 추천)
                     4. 생활 관리법 (식이, 운동, 일상)
                     5. 가까이한의원 치료 계획
                     
                     전문적이고 따뜻한 톤으로 부모가 이해하기 쉽게 작성해주세요.`;
        break;

      case 'adhd':
        systemPrompt = `당신은 ADHD 아동 치료 전문 한의사입니다. 
                       ADHD를 심(心)의 화(火) 항진, 신(腎)의 음(陰) 부족, 간(肝)의 양(陽) 상승으로 진단합니다.`;
        userPrompt = `ADHD 검사 결과 분석:
                     - 총점: ${score}/${maxScore}점 (${percentage}%)
                     - 심각도: ${severity}
                     
                     다음 분석을 제공해주세요:
                     1. 체질별 ADHD 특성 분석
                     2. 집중력 향상 한방 치료법
                     3. 안정화 한약 처방 권장사항
                     4. 학습능력 개선 프로그램
                     5. 가까이한의원 맞춤 치료 계획`;
        break;

      case 'intellectual':
        systemPrompt = `당신은 발달장애 아동 치료 전문 한의사입니다. 
                       인지능력 저하를 신(腎)의 정(精) 부족, 심(心)의 혈(血) 허약, 비(脾)의 기(氣) 허실로 분석합니다.`;
        userPrompt = `인지능력 검사 결과 분석:
                     - 총점: ${score}/${maxScore}점 (${percentage}%)
                     - 심각도: ${severity}
                     
                     다음 분석을 제공해주세요:
                     1. 두뇌 발달 한의학적 진단
                     2. 인지능력 향상 한방 치료
                     3. 기억력 강화 한약 처방
                     4. 발달 촉진 생활 관리법
                     5. 가까이한의원 장기 치료 계획`;
        break;

      case 'atopy':
        systemPrompt = `당신은 아토피 피부염 치료 전문 한의사입니다. 
                       아토피를 폐(肺)의 선발 기능 저하, 비위(脾胃) 습열, 간(肝)의 울체로 진단합니다.`;
        userPrompt = `아토피 검사 결과 분석:
                     - 총점: ${score}/${maxScore}점 (${percentage}%)
                     - 심각도: ${severity}
                     
                     다음 분석을 제공해주세요:
                     1. 체질별 아토피 원인 분석
                     2. 해독 및 면역력 강화 치료
                     3. 피부 개선 한약 처방
                     4. 알레르기 관리 생활법
                     5. 가까이한의원 근본 치료 계획`;
        break;

      case 'stress':
        systemPrompt = `당신은 스트레스 및 정신건강 전문 한의사입니다. 
                       스트레스를 간(肝)의 소설 기능 실조, 심(心)의 신지 불안, 비위(脾胃) 기능 저하로 분석합니다.`;
        userPrompt = `스트레스 검사 결과 분석:
                     - 총점: ${score}/${maxScore}점 (${percentage}%)
                     - 심각도: ${severity}
                     
                     다음 분석을 제공해주세요:
                     1. 스트레스 유형별 체질 분석
                     2. 정신 안정 한방 치료법
                     3. 스트레스 완화 한약 처방
                     4. 마음 건강 생활 관리법
                     5. 가까이한의원 맞춤 상담 계획`;
        break;

      default:
        systemPrompt = `당신은 한의학 전문가입니다.`;
        userPrompt = `검사 결과를 한의학적 관점에서 분석해주세요.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 2000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    // 가까이한의원 연계 정보 추가
    const clinicInfo = {
      name: "가까이한의원",
      phone: "1588-1234",
      consultationUrl: "https://naver.me/xk1XPBhl",
      services: [
        "맞춤 한방 상담",
        "개별 체질 진단",
        "전문 한약 처방",
        "지속적 관리 프로그램"
      ]
    };

    // 추천사항 생성
    const recommendations = [
      "전문 한의사와의 1:1 맞춤 상담",
      "체질에 맞는 한약 처방 받기",
      "정기적인 경과 관찰 및 관리",
      "생활습관 개선 지도 받기"
    ];

    const result = {
      success: true,
      analysis,
      clinicInfo,
      recommendations,
      severity,
      consultationUrl: "https://naver.me/xk1XPBhl"
    };

    console.log('Analysis completed successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in han-medicine-analyzer:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      analysis: "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      clinicInfo: {
        name: "가까이한의원",
        consultationUrl: "https://naver.me/xk1XPBhl"
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});