import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user ID from JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { reportType = 'basic', assessments, observations, chatRooms, profile, externalTestImages, userInput } = await req.json();

    console.log('종합 리포트 생성 요청:', {
      userId: user.id,
      reportType,
      assessmentsCount: assessments?.length || 0,
      observationsCount: observations?.length || 0,
      chatRoomsCount: chatRooms?.length || 0,
      userName: userInput?.name,
      userBirthDate: userInput?.birthDate,
      userGender: userInput?.gender
    });

    // 데이터 정리 및 요약
    const assessmentSummary = assessments?.map((a: any) => ({
      type: a.assessment_type,
      date: a.created_at,
      results: a.results,
      analysis: a.analysis
    })) || [];

    const observationSummary = observations?.map((o: any) => ({
      title: o.title,
      description: o.description,
      date: o.created_at,
      behaviorType: o.behavior_type,
      severity: o.severity
    })) || [];

    const chatSummary = chatRooms?.flatMap((room: any) => 
      room.chat_messages?.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        date: msg.created_at
      })) || []
    ) || [];

    // HTML 템플릿 생성 함수
    const generateReportHTML = (reportData: any, userInput: any, stats: any) => {
      // 나이 계산
      const calculateAge = (birthDate: string) => {
        if (!birthDate) return '';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        return age;
      };

      const age = calculateAge(userInput?.birthDate);
      
      return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>종합 발달 리포트</title>
  <style>
    @page {
      margin: 20mm;
    }
    body {
      font-family: 'Noto Sans KR', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 0;
    }
    .cover {
      min-height: 100vh;
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 60px 40px;
      color: white;
      page-break-after: always;
      position: relative;
      overflow: hidden;
    }
    .cover::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
      pointer-events: none;
    }
    .cover-content {
      position: relative;
      z-index: 1;
    }
    .cover h1 {
      font-size: 56px;
      margin: 0 0 15px 0;
      font-weight: 800;
      text-shadow: 0 4px 12px rgba(0,0,0,0.3);
      letter-spacing: -1px;
    }
    .cover .subtitle {
      font-size: 22px;
      margin-bottom: 50px;
      opacity: 0.95;
      font-weight: 300;
      letter-spacing: 2px;
    }
    .cover .profile-info {
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(20px);
      padding: 40px 50px;
      border-radius: 20px;
      margin: 50px 0;
      font-size: 18px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      border: 1px solid rgba(255,255,255,0.3);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 25px;
      margin-top: 40px;
      max-width: 700px;
    }
    .stat-card {
      background: rgba(255,255,255,0.25);
      backdrop-filter: blur(15px);
      padding: 25px 20px;
      border-radius: 15px;
      border: 1px solid rgba(255,255,255,0.4);
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }
    .stat-icon {
      font-size: 32px;
      margin-bottom: 10px;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
    }
    .stat-number {
      font-size: 32px;
      font-weight: 700;
      margin: 8px 0;
    }
    .stat-label {
      font-size: 14px;
      opacity: 0.9;
      font-weight: 500;
    }
    .cover .date {
      font-size: 16px;
      margin-top: 50px;
      opacity: 0.9;
      font-weight: 300;
    }
    .cover .branding {
      margin-top: 60px;
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 1px;
      text-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .toc {
      padding: 60px 40px;
      page-break-after: always;
    }
    .toc h2 {
      color: #1e40af;
      font-size: 36px;
      margin-bottom: 30px;
      border-bottom: 4px solid #3b82f6;
      padding-bottom: 15px;
      font-weight: 700;
    }
    .toc ol {
      list-style: none;
      counter-reset: toc-counter;
      padding: 0;
    }
    .toc li {
      counter-increment: toc-counter;
      padding: 15px 0;
      font-size: 18px;
      border-bottom: 1px solid #e5e7eb;
    }
    .toc li:before {
      content: counter(toc-counter) ". ";
      color: #3b82f6;
      font-weight: 700;
      margin-right: 10px;
      font-size: 20px;
    }
    .disclaimer {
      background: #fff3cd;
      border-left: 5px solid #ffc107;
      padding: 30px;
      margin: 40px;
      border-radius: 8px;
      page-break-inside: avoid;
    }
    .disclaimer h3 {
      color: #856404;
      margin-top: 0;
      font-size: 20px;
    }
    .disclaimer p {
      color: #856404;
      margin: 10px 0;
      line-height: 1.8;
    }
    .content {
      padding: 40px;
    }
    .header {
      border-bottom: 3px solid #667eea;
      padding-bottom: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h1 {
      color: #667eea;
      margin: 0;
      font-size: 24px;
    }
    .header .date {
      color: #666;
      font-size: 14px;
      margin-top: 5px;
    }
    .header .logo {
      text-align: right;
    }
    .header .logo .site {
      color: #667eea;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .header .logo .tagline {
      color: #999;
      font-size: 12px;
    }
    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    .section h2 {
      color: #1e40af;
      border-left: 5px solid #3b82f6;
      padding-left: 15px;
      margin-bottom: 20px;
      font-size: 26px;
      font-weight: 700;
      background: linear-gradient(90deg, rgba(59, 130, 246, 0.1), transparent);
      padding: 15px;
      border-radius: 0 8px 8px 0;
    }
    .summary {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      padding: 35px;
      border-radius: 12px;
      margin-bottom: 40px;
      border: 2px solid #bfdbfe;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
    }
    .summary h2 {
      color: #1e40af;
      margin-top: 0;
      font-weight: 700;
    }
    .footer {
      margin-top: 60px;
      padding: 40px;
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      text-align: center;
      color: white;
    }
    .footer .site-info {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 12px;
      letter-spacing: 1px;
    }
    .footer .copyright {
      margin-top: 10px;
      color: rgba(255,255,255,0.9);
      font-size: 13px;
      font-weight: 300;
    }
  </style>
</head>
<body>
  <!-- 커버 페이지 -->
  <div class="cover">
    <div class="cover-content">
      <h1>AI 종합 분석 리포트</h1>
      <div class="subtitle">COMPREHENSIVE ANALYSIS REPORT</div>
      
      <div class="profile-info">
        <div style="font-size: 24px; margin-bottom: 15px; font-weight: 600;">
          이름: ${userInput?.name || '사용자'}
        </div>
        ${userInput?.birthDate ? `
        <div style="font-size: 16px; margin-bottom: 10px; opacity: 0.95;">
          생년월일: ${new Date(userInput.birthDate).toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })} (만 ${age}세)
        </div>
        ` : ''}
        ${userInput?.gender ? `
        <div style="font-size: 16px; margin-bottom: 10px; opacity: 0.95;">
          성별: ${userInput.gender}
        </div>
        ` : ''}
        <div style="font-size: 16px; opacity: 0.95;">
          보고서 생성일: ${new Date().toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-number">${stats.assessmentsCount}</div>
            <div class="stat-label">검사</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🖼️</div>
            <div class="stat-number">${stats.imagesCount || 0}</div>
            <div class="stat-label">이미지</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">💬</div>
            <div class="stat-number">${stats.chatCount}</div>
            <div class="stat-label">상담</div>
          </div>
        </div>
      </div>
      
      <div class="branding">
        aihpro.com
      </div>
    </div>
  </div>

  <!-- 목차 -->
  <div class="toc">
    <h2>목차</h2>
    <ol>
      ${reportData.sections.map((section: any) => `
        <li>${section.title}</li>
      `).join('')}
    </ol>
  </div>

  <!-- 중요 안내사항 -->
  <div class="disclaimer">
    <h3>⚠️ 중요 안내사항</h3>
    <p>
      본 리포트는 <strong>AI 기반 자동 분석 결과</strong>이며, 의학적 진단이나 전문가의 정확한 평가를 대체할 수 없습니다.
    </p>
    <p>
      정확한 평가와 개입을 위해서는 <strong>반드시 전문가와의 상담을 권장</strong>드립니다.
    </p>
    <p>
      본 리포트는 참고 자료로만 활용하시기 바라며, 실제 진단이나 치료 결정은 자격을 갖춘 전문가의 판단을 따라주시기 바랍니다.
    </p>
  </div>

  <!-- 본문 내용 -->
  <div class="content">
    <div class="summary">
      <h2 style="color: #667eea; margin-top: 0;">전체 요약</h2>
      ${reportData.summary}
    </div>

    ${reportData.sections.map((section: any, index: number) => `
      <div class="section">
        <h2>${index + 1}. ${section.title}</h2>
        ${section.content}
      </div>
    `).join('')}
  </div>

  <!-- 푸터 -->
  <div class="footer">
    <div class="site-info">Generated by aihpro.com</div>
    <div class="copyright">© 2025 All Rights Reserved</div>
    <div style="margin-top: 15px; color: #999; font-size: 12px;">
      본 리포트는 전문가 지식 기반으로 작성되었으며, 전문가 상담을 대체하지 않습니다.
    </div>
  </div>
</body>
</html>
      `;
    };

    // 리포트 타입별 설정
    const reportTypeConfig = {
      basic: {
        model: 'google/gemini-3-flash-preview-lite',
        sectionCount: 5,
        minLength: 200,
        sections: ['발달 종합 평가', '심리 상태 분석', '강점/약점 분석', '맞춤 활동 제안', '종합 요약 및 제언']
      },
      detailed: {
        model: 'google/gemini-3-flash-preview',
        sectionCount: 9,
        minLength: 400,
        sections: ['발달 종합 평가', '심리 상태 분석', '강점/약점 분석', '맞춤 활동 제안', '발달 로드맵', '또래 비교 분석', '전문가 소견서', '가족 지원 가이드', '종합 요약 및 제언']
      },
      expert: {
        model: 'google/gemini-3-flash-preview',
        sectionCount: 9,
        minLength: 400,
        sections: ['발달 종합 평가', '심리 상태 분석', '강점/약점 분석', '맞춤 활동 제안', '발달 로드맵', '또래 비교 분석', '전문가 소견서', '가족 지원 가이드', '종합 요약 및 제언']
      }
    };

    const config = reportTypeConfig[reportType as keyof typeof reportTypeConfig] || reportTypeConfig.basic;

    // AI에게 전달할 시스템 프롬프트 (타입별로 조정)
    const systemPrompt = reportType === 'basic' 
      ? `당신은 발달심리학 및 임상심리 전문가입니다. 
제공된 검사 기록, 관찰 일지, AI 상담 기록을 분석하여 ${config.sectionCount}가지 핵심 섹션으로 구성된 기본 리포트를 생성해야 합니다.

각 섹션별 작성 지침 (최소 ${config.minLength}자):

1. **발달 종합 평가** - 검사 결과의 주요 점수와 핵심 발달 특성 요약
2. **심리 상태 분석** - 정서적 특성과 심리 상태의 전반적 평가
3. **강점/약점 분석** - 주요 강점 2-3가지와 개선 필요 영역 2-3가지
4. **맞춤 활동 제안** - 즉시 실천 가능한 구체적 활동 3-5가지
5. **종합 요약 및 제언** - 핵심 내용 요약과 중요한 실천 사항 3가지

**작성 원칙:**
- 간결하고 명확한 표현
- 실용적이고 즉시 활용 가능한 내용 중심
- 각 섹션은 HTML로 구조화 (<div>, <p>, <ul>, <li>, <strong> 활용)`
      : `당신은 발달심리학 및 임상심리 전문가입니다. 
제공된 모든 검사 기록, 관찰 일지, 외부 기관 검사 결과, AI 상담 기록을 매우 꼼꼼하게 분석하여 ${config.sectionCount}가지 섹션으로 구성된 상세한 전문 리포트를 생성해야 합니다.

**중요: 각 섹션은 반드시 제공된 실제 데이터(검사 결과, 관찰 기록, 외부 검사 자료)를 구체적으로 인용하고 분석해야 합니다.**

각 섹션별 상세 작성 지침:

1. **발달 종합 평가** (최소 ${config.minLength}자 이상)
   - 제공된 모든 검사 결과의 구체적 점수와 해석 포함
   - 인지, 언어, 운동, 사회성 발달을 각각 상세 분석
   - 외부 기관 검사 결과가 있다면 반드시 구체적으로 언급
   - 관찰 일지에서 발견된 발달 특성 구체적 인용

2. **심리 상태 분석** (최소 ${Math.floor(config.minLength * 0.9)}자 이상)
   - 검사에서 나타난 정서적 특성을 점수와 함께 분석
   - 관찰된 행동 패턴과 심리 상태의 연관성 설명
   - 스트레스 요인, 불안 수준 등 구체적 데이터 기반 분석
   - 보호자가 기록한 고민사항과 연결하여 해석

3. **강점/약점 분석** (최소 ${config.minLength}자 이상)
   - 검사와 관찰에서 드러난 구체적 강점 3-5가지 (예시 포함)
   - 개선이 필요한 영역 3-5가지 (구체적 상황 예시 포함)
   - 각 항목마다 실제 데이터 근거 명시
   - 강점을 활용한 약점 개선 방안 제시

4. **맞춤 활동 제안** (최소 ${Math.floor(config.minLength * 1.1)}자 이상)
   - 현재 발달 수준과 필요에 맞는 구체적 활동 5-7가지
   - 각 활동의 목적, 방법, 예상 효과 상세 설명
   - 일상에서 즉시 실천 가능한 활동 중심
   - 난이도 조절 방법 포함

5. **발달 로드맵** (최소 ${config.minLength}자 이상)
   - 단기(1-3개월), 중기(3-6개월), 장기(6-12개월) 목표 구체화
   - 각 목표의 달성 기준과 평가 방법 명시
   - 단계별 구체적 실천 계획
   - 예상되는 어려움과 대응 방안

6. **또래 비교 분석** (최소 ${Math.floor(config.minLength * 0.9)}자 이상)
   - 동일 연령대 발달 기준과 비교한 구체적 수치
   - 검사 결과의 백분위 또는 표준점수 해석
   - 평균 대비 빠르거나 느린 영역 명확히 제시
   - 개인차의 정상 범위 설명으로 불안 완화

7. **전문가 소견서** (최소 ${config.minLength}자 이상)
   - 검사와 관찰 결과에 대한 전문가 종합 의견
   - 전문적 개입(치료, 상담 등) 필요성과 시급성 평가
   - 구체적인 전문가 유형과 개입 방법 권장
   - 의료기관 방문이 필요한 경우 명확히 명시

8. **가족 지원 가이드** (최소 ${Math.floor(config.minLength * 1.1)}자 이상)
   - 가정에서 실천할 구체적 양육 팁 7-10가지
   - 각 팁의 실행 방법을 단계별로 상세 설명
   - 부모의 정서적 지원 방법
   - 형제자매가 있는 경우 가족 역학 고려
   - 피해야 할 행동과 권장 행동 비교 제시

9. **종합 요약 및 제언** (최소 ${config.minLength}자 이상)
   - 전체 분석의 핵심 내용 요약
   - 가장 중요한 3가지 실천 사항 강조
   - 긍정적 예후와 함께 격려 메시지
   - 추가 검사나 전문가 상담이 필요한 경우 안내
   - 장기적 발전 가능성과 잠재력 평가

**작성 원칙:**
- 모든 내용은 제공된 실제 데이터에 근거해야 함
- 일반론이 아닌 이 아동/성인만을 위한 맞춤 분석
- 구체적 예시, 수치, 인용을 풍부하게 사용
- 전문적이면서도 이해하기 쉬운 언어 사용
- 부정적 표현보다는 발전 가능성에 초점
- 각 섹션은 HTML 형식으로 <div>, <p>, <ul>, <li>, <strong> 태그를 활용하여 가독성 높게 구조화

**중요: 각 섹션은 반드시 제공된 실제 데이터(검사 결과, 관찰 기록, 외부 검사 자료)를 구체적으로 인용하고 분석해야 합니다.**

각 섹션별 상세 작성 지침:

1. **발달 종합 평가** (최소 400자 이상)
   - 제공된 모든 검사 결과의 구체적 점수와 해석 포함
   - 인지, 언어, 운동, 사회성 발달을 각각 상세 분석
   - 외부 기관 검사 결과가 있다면 반드시 구체적으로 언급
   - 관찰 일지에서 발견된 발달 특성 구체적 인용

2. **심리 상태 분석** (최소 350자 이상)
   - 검사에서 나타난 정서적 특성을 점수와 함께 분석
   - 관찰된 행동 패턴과 심리 상태의 연관성 설명
   - 스트레스 요인, 불안 수준 등 구체적 데이터 기반 분석
   - 보호자가 기록한 고민사항과 연결하여 해석

3. **강점/약점 분석** (최소 400자 이상)
   - 검사와 관찰에서 드러난 구체적 강점 3-5가지 (예시 포함)
   - 개선이 필요한 영역 3-5가지 (구체적 상황 예시 포함)
   - 각 항목마다 실제 데이터 근거 명시
   - 강점을 활용한 약점 개선 방안 제시

4. **맞춤 활동 제안** (최소 450자 이상)
   - 현재 발달 수준과 필요에 맞는 구체적 활동 5-7가지
   - 각 활동의 목적, 방법, 예상 효과 상세 설명
   - 일상에서 즉시 실천 가능한 활동 중심
   - 난이도 조절 방법 포함

5. **발달 로드맵** (최소 400자 이상)
   - 단기(1-3개월), 중기(3-6개월), 장기(6-12개월) 목표 구체화
   - 각 목표의 달성 기준과 평가 방법 명시
   - 단계별 구체적 실천 계획
   - 예상되는 어려움과 대응 방안

6. **또래 비교 분석** (최소 350자 이상)
   - 동일 연령대 발달 기준과 비교한 구체적 수치
   - 검사 결과의 백분위 또는 표준점수 해석
   - 평균 대비 빠르거나 느린 영역 명확히 제시
   - 개인차의 정상 범위 설명으로 불안 완화

7. **전문가 소견서** (최소 400자 이상)
   - 검사와 관찰 결과에 대한 전문가 종합 의견
   - 전문적 개입(치료, 상담 등) 필요성과 시급성 평가
   - 구체적인 전문가 유형과 개입 방법 권장
   - 의료기관 방문이 필요한 경우 명확히 명시

8. **가족 지원 가이드** (최소 450자 이상)
   - 가정에서 실천할 구체적 양육 팁 7-10가지
   - 각 팁의 실행 방법을 단계별로 상세 설명
   - 부모의 정서적 지원 방법
   - 형제자매가 있는 경우 가족 역학 고려
   - 피해야 할 행동과 권장 행동 비교 제시

9. **종합 요약 및 제언** (최소 400자 이상)
   - 전체 분석의 핵심 내용 요약
   - 가장 중요한 3가지 실천 사항 강조
   - 긍정적 예후와 함께 격려 메시지
   - 추가 검사나 전문가 상담이 필요한 경우 안내
   - 장기적 발전 가능성과 잠재력 평가

**작성 원칙:**
- 모든 내용은 제공된 실제 데이터에 근거해야 함
- 일반론이 아닌 이 아동/성인만을 위한 맞춤 분석
- 구체적 예시, 수치, 인용을 풍부하게 사용
- 전문적이면서도 이해하기 쉬운 언어 사용
- 부정적 표현보다는 발전 가능성에 초점
- 각 섹션은 HTML 형식으로 <div>, <p>, <ul>, <li>, <strong> 태그를 활용하여 가독성 높게 구조화`;

    const userPrompt = `다음 데이터를 기반으로 종합 리포트를 생성해주세요:

=== 대상자 정보 ===
이름: ${userInput?.name || '미제공'}
생년월일: ${userInput?.birthDate || '미제공'}
성별: ${userInput?.gender || '미제공'}

**중요: 이 정보를 기반으로 나이에 맞는 발달 기준과 성별 특성을 고려하여 리포트를 작성해주세요.**

=== 검사 기록 (${assessmentSummary.length}건) ===
${JSON.stringify(assessmentSummary, null, 2)}

=== 관찰 일지 (${observationSummary.length}건) ===
${JSON.stringify(observationSummary, null, 2)}

=== AI 상담 기록 (${chatSummary.length}건 메시지) ===
${JSON.stringify(chatSummary.slice(0, 20), null, 2)}

=== 사용자 프로필 ===
${JSON.stringify(profile, null, 2)}

${externalTestImages ? `
=== 외부 기관 검사 결과 분석 ===
${externalTestImages}
` : ''}

${userInput?.recentConcerns ? `
=== 보호자가 작성한 최근 주요 고민 ===
${userInput.recentConcerns}
` : ''}

${userInput?.developmentalNotes ? `
=== 보호자가 관찰한 발달/심리적 특징 ===
${userInput.developmentalNotes}
` : ''}

위 데이터를 종합 분석하여 ${config.sectionCount}가지 섹션의 전문 리포트를 작성해주세요.

**중요: 응답은 반드시 아래 JSON 형식으로만 작성하세요. 다른 텍스트나 설명 없이 순수 JSON만 반환하세요.**

{
  "sections": [
    {
      "title": "섹션 제목",
      "content": "<div>HTML 형식의 상세 내용...</div>"
    }
  ],
  "summary": "<div>전체 종합 요약 HTML</div>"
}

필수 섹션: ${config.sections.join(', ')}`;

    // Lovable AI 호출
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt + '\n\n중요: 응답은 반드시 유효한 JSON 형식으로만 작성하세요. 코드블록이나 다른 텍스트 없이 순수 JSON만 반환하세요. 모든 섹션(특히 "종합 요약 및 제언")을 반드시 포함하세요.' },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 16000,
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI 응답 오류:', aiResponse.status, errorText);
      
      // 크레딧 부족 에러 처리
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'LOVABLE_AI_CREDITS_INSUFFICIENT',
            message: 'Lovable AI 크레딧이 부족합니다. 워크스페이스 설정에서 크레딧을 충전해주세요.'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 402
          }
        );
      }

      // 레이트 리미트 에러 처리
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({
            error: 'LOVABLE_AI_RATE_LIMITED',
            message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 429
          }
        );
      }
      
      throw new Error(`AI 분석 실패: ${aiResponse.status}`);
    }

    // 응답 파싱
    const rawText = await aiResponse.text();
    console.log('AI 응답(원문 길이):', rawText?.length);
    console.log('AI 응답(처음 500자):', rawText?.slice(0, 500));

    let reportData;
    try {
      if (!rawText || !rawText.trim()) {
        throw new Error('AI 응답이 비어있습니다.');
      }

      const aiData = JSON.parse(rawText);
      
      // response_format: json_object를 사용하므로 직접 content에서 파싱
      const messageContent = aiData.choices?.[0]?.message?.content;
      
      if (!messageContent) {
        throw new Error('AI 응답에 content가 없습니다.');
      }

      console.log('AI content 길이:', messageContent.length);
      
      reportData = JSON.parse(messageContent);
      
      // 검증: sections와 summary 존재 확인
      if (!reportData.sections || !Array.isArray(reportData.sections) || reportData.sections.length === 0) {
        throw new Error('섹션 데이터가 올바르지 않습니다.');
      }
      
      if (!reportData.summary) {
        throw new Error('요약 데이터가 없습니다.');
      }

      console.log('리포트 데이터 파싱 성공, 섹션 수:', reportData.sections.length);

    } catch (parseError) {
      console.error('AI 응답 파싱 오류:', parseError);
      console.error('파싱 실패한 원문(전체):', rawText);
      // 폴백: 기본 구조 생성 (타입별로 다르게)
      const fallbackSections = reportType === 'basic' 
        ? [
            { title: '발달 종합 평가', content: '<div class="space-y-4"><p>검사 데이터를 기반으로 종합 분석 중입니다...</p></div>' },
            { title: '심리 상태 분석', content: '<div class="space-y-4"><p>심리 상태를 분석하고 있습니다...</p></div>' },
            { title: '강점/약점 분석', content: '<div class="space-y-4"><p>강점과 약점을 파악하고 있습니다...</p></div>' },
            { title: '맞춤 활동 제안', content: '<div class="space-y-4"><p>맞춤형 활동을 제안하고 있습니다...</p></div>' },
            { title: '종합 요약 및 제언', content: '<div class="space-y-4"><p>종합 요약을 작성하고 있습니다...</p></div>' }
          ]
        : [
            { title: '발달 종합 평가', content: '<div class="space-y-4"><p>검사 데이터를 기반으로 종합 분석 중입니다...</p></div>' },
            { title: '심리 상태 분석', content: '<div class="space-y-4"><p>심리 상태를 분석하고 있습니다...</p></div>' },
            { title: '강점/약점 분석', content: '<div class="space-y-4"><p>강점과 약점을 파악하고 있습니다...</p></div>' },
            { title: '맞춤 활동 제안', content: '<div class="space-y-4"><p>맞춤형 활동을 제안하고 있습니다...</p></div>' },
            { title: '발달 로드맵', content: '<div class="space-y-4"><p>발달 로드맵을 작성하고 있습니다...</p></div>' },
            { title: '또래 비교 분석', content: '<div class="space-y-4"><p>또래 비교 분석을 진행하고 있습니다...</p></div>' },
            { title: '전문가 소견서', content: '<div class="space-y-4"><p>전문가 소견을 작성하고 있습니다...</p></div>' },
            { title: '가족 지원 가이드', content: '<div class="space-y-4"><p>가족 지원 가이드를 준비하고 있습니다...</p></div>' },
            { title: '종합 요약 및 ��언', content: '<div class="space-y-4"><p>종합 요약을 작성하고 있습니다...</p></div>' }
          ];
      
      reportData = {
        sections: fallbackSections,
        summary: '<div><p>종합 리포트가 생성되었습니다. 각 섹션을 확인해주세요.</p></div>'
      };
    }

    // 리포트 메타데이터 저장 (간소화)
    try {
      await supabaseClient
        .from('expert_feedback_requests')
        .insert({
          user_id: user.id,
          request_type: 'comprehensive_report',
          status: 'completed'
        });
    } catch (saveError) {
      console.error('리포트 메타데이터 저장 오류:', saveError);
      // 저장 실패해도 리포트는 계속 반환
    }

    // HTML 리포트 생성
    const stats = {
      assessmentsCount: assessmentSummary.length,
      imagesCount: externalTestImages ? 1 : 0, // 외부 이미지가 있으면 1로 카운트
      chatCount: Math.floor(chatSummary.length / 2) // 메시지를 대화 세션으로 변환 (왕복)
    };
    const htmlReport = generateReportHTML(reportData, userInput, stats);

    return new Response(
      JSON.stringify({
        success: true,
        report: reportData,
        html: htmlReport
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('종합 리포트 생성 오류:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : '리포트 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
