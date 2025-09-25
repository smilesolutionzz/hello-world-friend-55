import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 바우처별 서식 템플릿
const voucherTemplates = {
  "언어발달지원": {
    sections: [
      "기본정보 (이름, 날짜, 시간)",
      "목표설정 및 활동계획",
      "실시한 활동 내용",
      "아동의 반응 및 참여도",
      "언어발달 성과",
      "가정연계 활동 제안",
      "다음 회기 계획"
    ],
    format: "정부바우처 표준양식",
    requiredFields: ["출석확인", "활동시간", "진도체크", "평가의견"]
  },
  
  "발달재활서비스": {
    sections: [
      "서비스 제공 일시 및 장소",
      "개별화계획 목표",
      "제공한 서비스 내용",
      "이용자 반응 및 변화",
      "목표달성도 평가",
      "보호자 상담 내용",
      "향후 계획 및 과제"
    ],
    format: "보건복지부 양식",
    requiredFields: ["서비스시간", "목표달성도", "가족상담", "특이사항"]
  },

  "교육청서비스": {
    sections: [
      "학습자 기본정보",
      "개별화교육계획(IEP) 목표",
      "교육활동 실시 내용", 
      "학습자 참여도 및 성취도",
      "행동특성 관찰 기록",
      "교육환경 및 지원사항",
      "학부모 연계 및 피드백",
      "차시 교육계획"
    ],
    format: "교육청 개별화교육 양식",
    requiredFields: ["수업시수", "IEP목표", "성취수준", "행동관찰", "연계활동"]
  },

  "지역사회서비스": {
    sections: [
      "서비스 이용자 정보",
      "서비스 제공 계획",
      "실시한 프로그램 내용",
      "이용자 만족도 및 반응",
      "사회적응능력 변화",
      "지역사회 연계 활동",
      "서비스 효과성 평가",
      "개선방안 및 제언"
    ],
    format: "지역사회서비스투자사업 양식",
    requiredFields: ["서비스시간", "만족도조사", "사회적응도", "연계기관"]
  },

  "주간활동서비스": {
    sections: [
      "이용자 기본정보 및 출석",
      "일일 활동 계획 및 목표",
      "오전 활동 프로그램",
      "점심시간 및 휴식",
      "오후 활동 프로그램", 
      "개별 지원 및 상담",
      "건강상태 및 안전관리",
      "일일 평가 및 소감",
      "보호자 전달사항"
    ],
    format: "장애인활동지원 표준양식",
    requiredFields: ["출석체크", "활동참여도", "건강상태", "안전점검", "보호자소통"]
  },

  "키즈노트일지": {
    sections: [
      "오늘의 활동 주제",
      "자유선택활동 기록",
      "대소집단 활동 참여",
      "급식 및 간식 시간",
      "낮잠 및 휴식시간",
      "놀이활동 관찰 기록",
      "또래관계 및 사회성",
      "특별활동 및 행사",
      "안전 및 건강상태",
      "가정통신 사항"
    ],
    format: "키즈노트 앱 연동형식",
    requiredFields: ["사진첨부", "활동시간", "건강체크", "알림장", "준비물"]
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('바우처 보고서 생성 요청 받음');
    
    const { 
      voucherType, 
      sessionData, 
      periodStart, 
      periodEnd,
      clientInfo,
      customNotes 
    } = await req.json();

    console.log('요청 데이터:', { voucherType, sessionData });

    if (!openAIApiKey) {
      throw new Error('OpenAI API key가 설정되지 않았습니다.');
    }

    if (!voucherTemplates[voucherType as keyof typeof voucherTemplates]) {
      throw new Error(`지원되지 않는 바우처 유형: ${voucherType}`);
    }

    const template = voucherTemplates[voucherType as keyof typeof voucherTemplates];
    
    // AI 프롬프트 생성
    const systemPrompt = `당신은 ${voucherType} 전문 치료일지 작성 전문가입니다. 

다음 서식과 요구사항에 맞춰 정확하고 전문적인 치료일지를 작성해주세요:

**서식 정보:**
- 양식: ${template.format}
- 필수 항목: ${template.requiredFields.join(', ')}

**작성해야 할 섹션:**
${template.sections.map((section, idx) => `${idx + 1}. ${section}`).join('\n')}

**작성 원칙:**
1. 각 섹션을 빠짐없이 작성
2. 구체적이고 객관적인 관찰 내용 포함
3. 전문용어 적절히 사용
4. 발달 단계에 맞는 평가
5. 실현 가능한 목표 설정
6. 법적 요구사항 준수

**출력 형식:**
마크다운 형식으로 각 섹션을 명확히 구분하여 작성해주세요.`;

    const userPrompt = `
**클라이언트 정보:**
${clientInfo ? JSON.stringify(clientInfo, null, 2) : '정보 없음'}

**기간:** ${periodStart} ~ ${periodEnd}

**세션 데이터:**
${sessionData ? JSON.stringify(sessionData, null, 2) : '세션 데이터 없음'}

**추가 요청사항:**
${customNotes || '없음'}

위 정보를 바탕으로 ${voucherType} 치료일지를 작성해주세요.`;

    console.log('OpenAI API 호출 시작');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07', // 바우처 리포트용 고품질 모델
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API 오류:', errorData);
      throw new Error(`OpenAI API 오류: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('OpenAI 응답 받음');
    
    const generatedReport = data.choices[0].message.content;

    // 메타데이터 추가
    const reportWithMetadata = {
      content: generatedReport,
      metadata: {
        voucherType,
        template: template.format,
        generatedAt: new Date().toISOString(),
        periodStart,
        periodEnd,
        sections: template.sections,
        requiredFields: template.requiredFields
      }
    };

    return new Response(JSON.stringify(reportWithMetadata), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('바우처 보고서 생성 오류:', error);
  return new Response(
    JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: '바우처 보고서 생성 중 오류가 발생했습니다.'
    }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});