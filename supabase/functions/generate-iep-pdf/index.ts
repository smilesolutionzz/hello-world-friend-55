import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseKey)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { iepId } = await req.json()
    console.log('PDF 생성 요청:', { iepId })

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      throw new Error('Unauthorized')
    }

    // IEP 데이터 조회
    const { data: iepData, error } = await supabase
      .from('individual_education_plans')
      .select('*')
      .eq('id', iepId)
      .eq('user_id', user.id)
      .single()

    if (error || !iepData) {
      console.error('IEP 조회 오류:', error)
      throw new Error('IEP를 찾을 수 없습니다')
    }
    
    console.log('IEP 데이터 조회 성공:', { studentName: iepData.student_name })

    // HTML PDF 템플릿 생성
    const htmlContent = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>개별교육계획서 (IEP) - ${iepData.student_name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap');
    
    body {
      font-family: 'Noto Sans KR', sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      color: #333;
      background: white;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 10px;
    }
    
    .brand {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
      letter-spacing: 2px;
    }
    
    .title {
      font-size: 28px;
      font-weight: bold;
      margin: 10px 0;
    }
    
    .subtitle {
      font-size: 16px;
      opacity: 0.9;
    }
    
    .student-info {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 25px;
      border-left: 4px solid #667eea;
    }
    
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #667eea;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e9ecef;
    }
    
    .content-box {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 15px;
      border-left: 3px solid #667eea;
    }
    
    .goal-item {
      background: white;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border: 1px solid #e9ecef;
    }
    
    .goal-header {
      font-weight: 600;
      color: #495057;
      margin-bottom: 10px;
      font-size: 16px;
    }
    
    .goal-domain {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      margin-bottom: 10px;
    }
    
    .detail-row {
      margin-bottom: 8px;
    }
    
    .detail-label {
      font-weight: 500;
      color: #667eea;
      display: inline-block;
      min-width: 100px;
    }
    
    .detail-value {
      color: #495057;
    }
    
    .service-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      margin-top: 10px;
    }
    
    .footer {
      margin-top: 40px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      text-align: center;
      font-size: 12px;
      color: #6c757d;
    }
    
    .footer-brand {
      font-weight: bold;
      color: #667eea;
      font-size: 14px;
      margin-bottom: 10px;
    }
    
    @media print {
      body { margin: 0; padding: 15px; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">AIHPRO.COM</div>
    <div class="title">개별교육계획서 (IEP)</div>
    <div class="subtitle">AI 전문가 시스템으로 생성된 맞춤형 교육계획</div>
  </div>

  <div class="student-info">
    <h3 style="margin-top: 0; color: #667eea;">학생 정보</h3>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
      <div><strong>이름:</strong> ${iepData.student_name}</div>
      <div><strong>나이:</strong> ${iepData.student_age}세</div>
      <div><strong>계획 상태:</strong> ${iepData.plan_status}</div>
      <div><strong>유효 기간:</strong> ${iepData.valid_from} ~ ${iepData.valid_to}</div>
    </div>
  </div>

  ${iepData.current_performance ? `
  <div class="section">
    <h2 class="section-title">현재 수행 수준</h2>
    ${typeof iepData.current_performance === 'object' ? `
      ${iepData.current_performance.academicAchievement ? `
        <div class="content-box">
          <div class="detail-label">학업 성취도:</div>
          <div class="detail-value">${iepData.current_performance.academicAchievement}</div>
        </div>
      ` : ''}
      ${iepData.current_performance.functionalPerformance ? `
        <div class="content-box">
          <div class="detail-label">기능적 수행 능력:</div>
          <div class="detail-value">${iepData.current_performance.functionalPerformance}</div>
        </div>
      ` : ''}
      ${iepData.current_performance.strengthsAndNeeds ? `
        <div class="content-box">
          <div class="detail-label">강점 및 지원 필요 영역:</div>
          <div class="detail-value">${Array.isArray(iepData.current_performance.strengthsAndNeeds) ? iepData.current_performance.strengthsAndNeeds.join(', ') : iepData.current_performance.strengthsAndNeeds}</div>
        </div>
      ` : ''}
      ${iepData.current_performance.communicationSkills ? `
        <div class="content-box">
          <div class="detail-label">의사소통 능력:</div>
          <div class="detail-value">${iepData.current_performance.communicationSkills}</div>
        </div>
      ` : ''}
      ${iepData.current_performance.behavioralCharacteristics ? `
        <div class="content-box">
          <div class="detail-label">행동 특성:</div>
          <div class="detail-value">${iepData.current_performance.behavioralCharacteristics}</div>
        </div>
      ` : ''}
    ` : `<div class="content-box">${JSON.stringify(iepData.current_performance)}</div>`}
  </div>
  ` : ''}

  ${iepData.annual_goals ? `
  <div class="section">
    <h2 class="section-title">연간 목표</h2>
    ${Array.isArray(iepData.annual_goals) ? 
      iepData.annual_goals.map((goal: any, index: any) => `
        <div class="goal-item">
          <div class="goal-header">목표 ${index + 1}</div>
          ${goal.domain ? `<div class="goal-domain">${goal.domain}</div>` : ''}
           ${goal.goal ? `
             <div class="detail-row">
               <span class="detail-label">목표:</span>
               <span class="detail-value">${goal.goal.replace(/'/g, '&#39;').replace(/"/g, '&#34;')}</span>
             </div>
           ` : ''}
           ${goal.measurableCriteria ? `
             <div class="detail-row">
               <span class="detail-label">측정 기준:</span>
               <span class="detail-value">${goal.measurableCriteria.replace(/'/g, '&#39;').replace(/"/g, '&#34;')}</span>
             </div>
           ` : ''}
          ${goal.timeframe ? `
            <div class="detail-row">
              <span class="detail-label">기간:</span>
              <span class="detail-value">${goal.timeframe}</span>
            </div>
          ` : ''}
          ${goal.evaluationMethod ? `
            <div class="detail-row">
              <span class="detail-label">평가 방법:</span>
              <span class="detail-value">${goal.evaluationMethod}</span>
            </div>
          ` : ''}
        </div>
      `).join('') : 
      `<div class="content-box">${JSON.stringify(iepData.annual_goals)}</div>`
    }
  </div>
  ` : ''}

  ${iepData.special_education_services ? `
  <div class="section">
    <h2 class="section-title">특수교육 서비스</h2>
    ${Array.isArray(iepData.special_education_services) ? 
      iepData.special_education_services.map((service: any) => `
        <div class="goal-item">
          <div class="goal-header">${service.service || '특수교육 서비스'}</div>
          <div class="service-grid">
            ${service.location ? `<div><span class="detail-label">장소:</span> ${service.location}</div>` : ''}
            ${service.frequency ? `<div><span class="detail-label">빈도:</span> ${service.frequency}</div>` : ''}
            ${service.duration ? `<div><span class="detail-label">기간:</span> ${service.duration}</div>` : ''}
            ${service.provider ? `<div><span class="detail-label">제공자:</span> ${service.provider}</div>` : ''}
          </div>
          ${service.specificContent ? `
            <div class="detail-row" style="margin-top: 10px;">
              <span class="detail-label">구체적 내용:</span>
              <span class="detail-value">${service.specificContent}</span>
            </div>
          ` : ''}
        </div>
      `).join('') : 
      `<div class="content-box">${JSON.stringify(iepData.special_education_services)}</div>`
    }
  </div>
  ` : ''}

  <div class="footer">
    <div class="footer-brand">AIHPRO.COM - AI 전문가 교육 솔루션</div>
    <div>본 개별교육계획서는 AI 전문가 시스템으로 생성되었습니다.</div>
    <div>생성일: ${new Date(iepData.created_at).toLocaleDateString('ko-KR')} | GPT-5 전문가 모델 사용</div>
    <div style="margin-top: 10px; font-size: 11px;">
      ※ 본 계획서는 전문가 검토 후 사용하시기 바랍니다.
    </div>
  </div>
</body>
</html>`

    console.log('HTML 생성 완료, 응답 전송')
    return new Response(htmlContent, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="IEP_${iepData.student_name}_${new Date().toISOString().split('T')[0]}.html"`
      },
    })

  } catch (error) {
    console.error('IEP PDF 생성 오류:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'PDF 생성 중 오류가 발생했습니다'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})