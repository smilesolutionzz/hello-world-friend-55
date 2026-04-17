import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, organizationId, data } = await req.json();
    
    console.log('Corporate analytics request:', { action, organizationId });

    switch (action) {
      case 'analyze_organizational_wellness':
        return await analyzeOrganizationalWellness(organizationId);
      case 'predict_turnover_risk':
        return await predictTurnoverRisk(organizationId);
      case 'detect_team_conflicts':
        return await detectTeamConflicts(organizationId);
      case 'generate_intervention_strategies':
        return await generateInterventionStrategies(organizationId, data);
      case 'calculate_roi_metrics':
        return await calculateROIMetrics(organizationId, data);
      case 'create_corporate_program':
        return await createCorporateProgram(organizationId, data);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: unknown) {
    console.error('Error in corporate analytics:', error);
    const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown error');
    return new Response(
      JSON.stringify({ error: message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function analyzeOrganizationalWellness(organizationId: string) {
  console.log('Analyzing organizational wellness for:', organizationId);
  
  // Get employee wellness data
  const { data: employeeWellness, error: empError } = await supabase
    .from('employee_wellness_tracking')
    .select(`
      *,
      employee_profiles (
        position,
        level,
        department_id,
        departments (name)
      )
    `)
    .eq('employee_profiles.organization_id', organizationId)
    .gte('tracking_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  if (empError) throw empError;

  // Analyze data using OpenAI
  const analysisPrompt = `
당신은 조직 심리건강 전문가입니다. 다음 직원 데이터를 분석하여 조직의 전반적인 웰빙 상태를 평가해주세요:

직원 웰빙 데이터:
${JSON.stringify(employeeWellness, null, 2)}

다음 형식으로 분석 결과를 제공해주세요:
{
  "overall_wellness_score": 0-100 점수,
  "department_scores": {"부서명": 점수},
  "level_scores": {"직급": 점수},
  "burnout_risk_count": 번아웃 위험 직원 수,
  "high_stress_count": 고스트레스 직원 수,
  "key_insights": ["주요 인사이트 1", "주요 인사이트 2"],
  "recommendations": ["권장사항 1", "권장사항 2"],
  "risk_factors": ["위험요소 1", "위험요소 2"],
  "positive_indicators": ["긍정적 지표 1", "긍정적 지표 2"]
}
`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: analysisPrompt }],
      max_completion_tokens: 2000,
    }),
  });

  const aiResult = await response.json();
  const analysis = JSON.parse(aiResult.choices[0].message.content);

  // Save organizational wellness metrics
  const { error: saveError } = await supabase
    .from('organizational_wellness')
    .upsert({
      organization_id: organizationId,
      metric_date: new Date().toISOString().split('T')[0],
      overall_wellness_score: analysis.overall_wellness_score,
      department_scores: analysis.department_scores,
      level_scores: analysis.level_scores,
      burnout_risk_count: analysis.burnout_risk_count,
      high_stress_count: analysis.high_stress_count,
      employee_satisfaction: calculateAverageScore(employeeWellness, 'job_satisfaction'),
      turnover_risk_score: calculateAverageScore(employeeWellness, 'turnover_intention'),
      team_cohesion_score: calculateAverageScore(employeeWellness, 'team_satisfaction'),
      productivity_index: calculateAverageScore(employeeWellness, 'productivity_self_rating')
    });

  if (saveError) console.error('Error saving wellness metrics:', saveError);

  return new Response(
    JSON.stringify({ analysis, success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function predictTurnoverRisk(organizationId: string) {
  console.log('Predicting turnover risk for:', organizationId);
  
  const { data: employeeData, error } = await supabase
    .from('employee_wellness_tracking')
    .select(`
      *,
      employee_profiles (
        position,
        level,
        years_of_experience,
        hire_date,
        employment_type
      )
    `)
    .eq('employee_profiles.organization_id', organizationId)
    .order('tracking_date', { ascending: false });

  if (error) throw error;

  const predictionPrompt = `
당신은 HR 데이터 사이언티스트입니다. 다음 직원 데이터를 기반으로 이직 위험을 예측해주세요:

${JSON.stringify(employeeData.slice(0, 50), null, 2)}

다음 형식으로 예측 결과를 제공해주세요:
{
  "high_risk_employees": [{"employee_id": "ID", "risk_score": 0-100, "key_factors": ["요인1", "요인2"]}],
  "department_risk_levels": {"부서명": "low/medium/high"},
  "predictive_factors": ["주요 예측 요인들"],
  "intervention_recommendations": ["개입 권장사항들"],
  "retention_strategies": ["유지 전략들"]
}
`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: predictionPrompt }],
      max_completion_tokens: 2000,
    }),
  });

  const aiResult = await response.json();
  const prediction = JSON.parse(aiResult.choices[0].message.content);

  return new Response(
    JSON.stringify({ prediction, success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function detectTeamConflicts(organizationId: string) {
  console.log('Detecting team conflicts for:', organizationId);
  
  const { data: departments, error } = await supabase
    .from('departments')
    .select(`
      *,
      employee_profiles (
        id,
        position,
        level,
        employee_wellness_tracking (
          stress_level,
          team_satisfaction,
          tracking_date
        )
      )
    `)
    .eq('organization_id', organizationId);

  if (error) throw error;

  const conflictPrompt = `
당신은 조직 행동 전문가입니다. 다음 부서별 데이터를 분석하여 팀 갈등 위험을 감지해주세요:

${JSON.stringify(departments, null, 2)}

다음 형식으로 분석 결과를 제공해주세요:
{
  "departments_analysis": [
    {
      "department_id": "ID",
      "department_name": "이름",
      "conflict_risk_level": "low/medium/high/critical",
      "team_harmony_score": 0-100,
      "communication_quality": 0-100,
      "stress_indicators": ["지표1", "지표2"],
      "recommendations": ["권장사항1", "권장사항2"]
    }
  ],
  "overall_team_health": "평가",
  "priority_interventions": ["우선 개입 사항들"]
}
`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: conflictPrompt }],
      max_completion_tokens: 2000,
    }),
  });

  const aiResult = await response.json();
  const analysis = JSON.parse(aiResult.choices[0].message.content);

  // Save team dynamics analysis
  for (const dept of analysis.departments_analysis) {
    const { error: saveError } = await supabase
      .from('team_dynamics')
      .upsert({
        department_id: dept.department_id,
        analysis_date: new Date().toISOString().split('T')[0],
        team_harmony_score: dept.team_harmony_score,
        conflict_risk_level: dept.conflict_risk_level,
        communication_quality: dept.communication_quality,
        collaboration_effectiveness: 70, // Default value
        leadership_satisfaction: 70, // Default value
        stress_propagation_risk: dept.conflict_risk_level === 'high' ? 80 : 40,
        intervention_recommendations: dept.recommendations
      });

    if (saveError) console.error('Error saving team dynamics:', saveError);
  }

  return new Response(
    JSON.stringify({ analysis, success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function generateInterventionStrategies(organizationId: string, targetData: any) {
  console.log('Generating intervention strategies for:', organizationId);
  
  const { data: orgData, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single();

  if (error) throw error;

  const strategyPrompt = `
당신은 기업 EAP 전문가입니다. 다음 조직 정보와 타겟 데이터를 기반으로 맞춤형 개입 전략을 생성해주세요:

조직 정보: ${JSON.stringify(orgData, null, 2)}
타겟 데이터: ${JSON.stringify(targetData, null, 2)}

다음 형식으로 전략을 제공해주세요:
{
  "strategies": [
    {
      "strategy_type": "유형",
      "title": "전략 제목",
      "description": "상세 설명",
      "target_demographic": {"level": ["대상 직급"], "department": ["대상 부서"]},
      "duration_weeks": 주수,
      "expected_outcomes": ["예상 결과1", "예상 결과2"],
      "implementation_steps": ["단계1", "단계2"],
      "success_metrics": ["측정 지표들"]
    }
  ],
  "priority_order": ["전략 우선순위"],
  "resource_requirements": {"budget": "예산", "personnel": "인력", "timeline": "일정"}
}
`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: strategyPrompt }],
      max_completion_tokens: 2000,
    }),
  });

  const aiResult = await response.json();
  const strategies = JSON.parse(aiResult.choices[0].message.content);

  return new Response(
    JSON.stringify({ strategies, success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function calculateROIMetrics(organizationId: string, periodData: any) {
  console.log('Calculating ROI metrics for:', organizationId);
  
  const { data: wellnessData, error } = await supabase
    .from('organizational_wellness')
    .select('*')
    .eq('organization_id', organizationId)
    .order('metric_date', { ascending: false })
    .limit(12); // Last 12 months

  if (error) throw error;

  const roiPrompt = `
당신은 비즈니스 분석가입니다. 다음 조직 웰빙 데이터와 기간 정보를 기반으로 ROI를 계산해주세요:

웰빙 데이터: ${JSON.stringify(wellnessData, null, 2)}
기간 데이터: ${JSON.stringify(periodData, null, 2)}

다음 형식으로 ROI 분석을 제공해주세요:
{
  "roi_percentage": ROI 백분율,
  "productivity_improvement": 생산성 향상율,
  "turnover_reduction": 이직률 감소율,
  "cost_savings": {
    "reduced_turnover": 이직률 감소로 인한 절약,
    "increased_productivity": 생산성 향상으로 인한 이익,
    "reduced_absenteeism": 결근 감소로 인한 절약
  },
  "wellness_investment_roi": "웰빙 투자 대비 수익률",
  "key_performance_indicators": ["핵심 지표들"],
  "recommendations": ["ROI 향상 권장사항들"]
}
`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: roiPrompt }],
      max_completion_tokens: 2000,
    }),
  });

  const aiResult = await response.json();
  const roiAnalysis = JSON.parse(aiResult.choices[0].message.content);

  // Save business impact metrics
  const { error: saveError } = await supabase
    .from('business_impact_metrics')
    .insert({
      organization_id: organizationId,
      metric_period_start: periodData.start_date,
      metric_period_end: periodData.end_date,
      wellness_investment_amount: periodData.investment_amount || 0,
      productivity_improvement_percent: roiAnalysis.productivity_improvement,
      turnover_rate_before: periodData.turnover_before || 0,
      turnover_rate_after: periodData.turnover_after || 0,
      absenteeism_reduction_percent: roiAnalysis.cost_savings.reduced_absenteeism,
      employee_satisfaction_improvement: 0, // To be calculated separately
      estimated_cost_savings: Object.values(roiAnalysis.cost_savings as Record<string, number>).reduce((sum: number, v: number) => Number(sum) + Number(v), 0),
      roi_percentage: roiAnalysis.roi_percentage,
      additional_metrics: roiAnalysis
    });

  if (saveError) console.error('Error saving ROI metrics:', saveError);

  return new Response(
    JSON.stringify({ roiAnalysis, success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function createCorporateProgram(organizationId: string, programData: any) {
  console.log('Creating corporate program for:', organizationId);
  
  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single();

  if (orgError) throw orgError;

  const programPrompt = `
당신은 기업 웰빙 프로그램 설계자입니다. 다음 조직과 요구사항에 맞는 프로그램을 설계해주세요:

조직 정보: ${JSON.stringify(orgData, null, 2)}
프로그램 요구사항: ${JSON.stringify(programData, null, 2)}

다음 형식으로 프로그램을 제공해주세요:
{
  "program_title": "프로그램 제목",
  "program_type": "유형",
  "target_demographic": {"level": ["직급"], "department": ["부서"]},
  "program_content": {
    "modules": [
      {
        "title": "모듈 제목",
        "description": "설명",
        "duration_hours": 시간,
        "activities": ["활동1", "활동2"],
        "materials": ["자료1", "자료2"]
      }
    ],
    "schedule": "일정",
    "delivery_method": "전달 방법"
  },
  "success_metrics": ["성공 지표들"],
  "estimated_cost": "예상 비용",
  "expected_roi": "예상 ROI"
}
`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: programPrompt }],
      max_completion_tokens: 2000,
    }),
  });

  const aiResult = await response.json();
  const program = JSON.parse(aiResult.choices[0].message.content);

  // Save corporate program
  const { data: savedProgram, error: saveError } = await supabase
    .from('corporate_programs')
    .insert({
      organization_id: organizationId,
      program_type: program.program_type,
      target_demographic: program.target_demographic,
      program_content: program.program_content,
      start_date: programData.start_date || new Date().toISOString().split('T')[0],
      status: 'planned'
    })
    .select()
    .single();

  if (saveError) throw saveError;

  return new Response(
    JSON.stringify({ program, programId: savedProgram.id, success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function calculateAverageScore(data: any[], field: string): number {
  const validScores = data.filter(item => item[field] != null).map(item => item[field]);
  return validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;
}