import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SessionRecord {
  id: string;
  client_name: string;
  therapist_name: string;
  session_date: string;
  duration: number;
  voucher_type: string;
  session_notes: string;
  progress_notes: string;
  attendance_status: string;
  session_goals?: string;
  interventions?: string;
  observations?: string;
}

interface DiaryRequest {
  voucherType: string;
  sessionData: SessionRecord[];
  periodStart: string;
  periodEnd: string;
  reportStyle?: 'detailed' | 'concise' | 'professional';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      voucherType, 
      sessionData, 
      periodStart, 
      periodEnd,
      reportStyle = 'detailed' 
    }: DiaryRequest = await req.json();

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    // 바우처 유형별 특화 프롬프트
    const voucherPrompts = {
      '언어발달지원': {
        focus: '언어 이해도, 표현력, 발음, 어휘력',
        requiredSections: ['출석 현황', '언어 발달 평가', '활동 내용', '진전 상황', '가정 연계 활동', '다음 목표']
      },
      '발달재활서비스': {
        focus: '전반적 발달 수준, 사회성, 인지 능력, 운동 능력',
        requiredSections: ['출석 및 참여도', '발달 영역별 평가', '치료 활동 상세', '목표 달성도', '가족 상담 내용', '향후 계획']
      },
      '교육청서비스': {
        focus: 'IEP 목표 달성, 학습 성취도, 행동 관찰, 학교 적응',
        requiredSections: ['수업 시수 및 출석', 'IEP 목표 진척도', '학습 성취 수준', '행동 및 사회성', '연계 활동', '다음 학기 계획']
      },
      '지역사회서비스': {
        focus: '사회 적응도, 서비스 만족도, 지역사회 연계',
        requiredSections: ['서비스 제공 현황', '만족도 조사 결과', '사회 적응 평가', '연계 기관 활동', '종합 의견']
      }
    };

    const voucherConfig = voucherPrompts[voucherType as keyof typeof voucherPrompts] || {
      focus: '전반적 발달 및 치료 효과',
      requiredSections: ['출석 현황', '치료 활동', '진전 상황', '종합 의견']
    };

    // 세션 데이터 요약
    const sessionSummary = sessionData.map(session => `
날짜: ${session.session_date}
대상자: ${session.client_name}
담당자: ${session.therapist_name}
시간: ${session.duration}분
출석: ${session.attendance_status}
목표: ${session.session_goals || '미기록'}
활동: ${session.session_notes}
관찰: ${session.observations || '미기록'}
진전: ${session.progress_notes}
중재: ${session.interventions || '미기록'}
---
`).join('\n');

    const systemPrompt = reportStyle === 'professional' 
      ? `당신은 20년 경력의 발달심리 및 언어치료 전문가입니다. 정부 바우처 및 교육청 보고서 작성 경험이 풍부합니다.`
      : `당신은 발달치료 및 특수교육 전문가입니다. 실용적이고 읽기 쉬운 보고서 작성에 능숙합니다.`;

    const styleGuide = {
      'detailed': '매우 상세하고 전문적인 분석과 해석을 포함하여 작성',
      'concise': '핵심 내용만 간결하고 명확하게 작성',
      'professional': '공식 문서 형식으로 전문 용어를 사용하여 작성'
    };

    const userPrompt = `
# 일지 생성 요청

**바우처 유형**: ${voucherType}
**보고 기간**: ${periodStart} ~ ${periodEnd}
**세션 수**: ${sessionData.length}회
**작성 스타일**: ${styleGuide[reportStyle]}

## 중점 평가 항목
${voucherConfig.focus}

## 세션 기록 데이터
${sessionSummary}

## 요청사항
다음 섹션으로 구성된 ${voucherType} 치료 일지를 작성해주세요:

${voucherConfig.requiredSections.map((section, idx) => `${idx + 1}. **${section}**`).join('\n')}

## 작성 지침
1. 제공된 실제 세션 데이터를 기반으로 작성
2. 구체적인 날짜, 활동 내용, 관찰 사항 인용
3. 객관적 사실과 전문가 의견을 명확히 구분
4. 각 섹션은 HTML 형식으로 구조화 (<h3>, <p>, <ul>, <li>, <strong> 사용)
5. 긍정적 변화와 개선이 필요한 부분 균형있게 서술
6. 다음 기간의 구체적 목표와 계획 제시
7. ${reportStyle === 'professional' ? '공식 보고서 형식의 전문적 어투 사용' : '읽기 쉽고 실용적인 표현 사용'}

각 섹션은 최소 150자 이상, 전체 보고서는 ${reportStyle === 'detailed' ? '1500자 이상' : reportStyle === 'professional' ? '2000자 이상' : '1000자 이상'}으로 작성해주세요.

**중요**: 일반적이거나 형식적인 내용이 아닌, 제공된 실제 데이터를 구체적으로 분석하고 인용하여 작성해주세요.
`;

    console.log('Claude API 호출 시작');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ],
        system: systemPrompt
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API 오류:', response.status, errorText);
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.content[0].text;

    console.log('일지 생성 완료');

    // 메타데이터 생성
    const metadata = {
      voucherType,
      periodStart,
      periodEnd,
      totalSessions: sessionData.length,
      generatedAt: new Date().toISOString(),
      reportStyle,
      sections: voucherConfig.requiredSections,
      model: 'claude-sonnet-4-5',
      wordCount: generatedContent.length
    };

    return new Response(
      JSON.stringify({
        success: true,
        content: generatedContent,
        metadata,
        summary: {
          totalSessions: sessionData.length,
          period: `${periodStart} ~ ${periodEnd}`,
          attendanceRate: calculateAttendanceRate(sessionData),
          uniqueClients: getUniqueClients(sessionData).length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || '일지 생성 중 오류가 발생했습니다.' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function calculateAttendanceRate(sessions: SessionRecord[]): string {
  const attended = sessions.filter(s => s.attendance_status === '출석' || s.attendance_status === 'attended').length;
  const rate = (attended / sessions.length * 100).toFixed(1);
  return `${rate}%`;
}

function getUniqueClients(sessions: SessionRecord[]): string[] {
  return [...new Set(sessions.map(s => s.client_name))];
}
