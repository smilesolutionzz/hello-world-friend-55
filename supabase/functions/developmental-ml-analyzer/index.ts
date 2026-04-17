import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface DevelopmentalDataPoint {
  domain: string;
  skill_area: string;
  current_level: number;
  target_level?: number;
  tracking_date: string;
  notes?: string;
  student_id?: string;
  user_id: string;
}

interface MLAnalysisResult {
  predicted_next_level: number;
  development_trajectory: 'improving' | 'stable' | 'concerning';
  risk_factors: string[];
  intervention_recommendations: string[];
  confidence_score: number;
  milestone_predictions: {
    domain: string;
    predicted_achievement_date: string;
    probability: number;
  }[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { developmental_data, student_id } = await req.json();

    console.log('Processing developmental data for ML analysis:', {
      dataPoints: developmental_data?.length || 0,
      student_id
    });

    // 1. 데이터 전처리 및 패턴 분석
    const processedData = preprocessDevelopmentalData(developmental_data);
    
    // 2. OpenAI를 활용한 발달 패턴 분석
    const mlAnalysis = await analyzeDevelopmentalPatterns(processedData);
    
    // 3. 분석 결과를 데이터베이스에 저장
    const savedAnalysis = await saveMlAnalysis(supabase, user.id, student_id, mlAnalysis, developmental_data);
    
    // 4. 개인맞춤 개입 추천 생성
    const interventionPlan = await generateInterventionPlan(mlAnalysis, processedData);

    return new Response(JSON.stringify({
      analysis: mlAnalysis,
      intervention_plan: interventionPlan,
      analysis_id: savedAnalysis.id,
      processed_data_summary: {
        total_data_points: processedData.totalDataPoints,
        domains_covered: processedData.domainsCovered,
        time_span_days: processedData.timeSpanDays
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in developmental-ml-analyzer:', error);
    const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown error');
    return new Response(JSON.stringify({ 
      error: message,
      details: 'Failed to analyze developmental data with ML'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function preprocessDevelopmentalData(data: DevelopmentalDataPoint[]) {
  // 시간순 정렬
  const sortedData = data.sort((a, b) => 
    new Date(a.tracking_date).getTime() - new Date(b.tracking_date).getTime()
  );

  // 도메인별 데이터 그룹화
  const domainGroups = sortedData.reduce((acc, item) => {
    if (!acc[item.domain]) {
      acc[item.domain] = [];
    }
    acc[item.domain].push(item);
    return acc;
  }, {} as Record<string, DevelopmentalDataPoint[]>);

  // 발달 트렌드 계산
  const developmentTrends = Object.entries(domainGroups).map(([domain, items]) => {
    const trend = calculateTrend(items);
    return { domain, trend, dataPoints: items.length };
  });

  // 최근 성과 패턴 분석
  const recentData = sortedData.slice(-10);
  const improvementRate = calculateImprovementRate(recentData);

  return {
    totalDataPoints: data.length,
    domainsCovered: Object.keys(domainGroups),
    timeSpanDays: getTimeSpan(sortedData),
    developmentTrends,
    improvementRate,
    domainGroups,
    recentPerformance: recentData
  };
}

function calculateTrend(dataPoints: DevelopmentalDataPoint[]) {
  if (dataPoints.length < 2) return 0;
  
  const first = dataPoints[0].current_level;
  const last = dataPoints[dataPoints.length - 1].current_level;
  const timeSpan = dataPoints.length;
  
  return (last - first) / timeSpan;
}

function calculateImprovementRate(dataPoints: DevelopmentalDataPoint[]) {
  if (dataPoints.length === 0) return 0;
  
  const improvingItems = dataPoints.filter(item => 
    item.target_level ? item.current_level >= item.target_level : item.current_level >= 4
  );
  
  return improvingItems.length / dataPoints.length;
}

function getTimeSpan(sortedData: DevelopmentalDataPoint[]) {
  if (sortedData.length < 2) return 0;
  
  const first = new Date(sortedData[0].tracking_date);
  const last = new Date(sortedData[sortedData.length - 1].tracking_date);
  
  return Math.ceil((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));
}

async function analyzeDevelopmentalPatterns(processedData: any): Promise<MLAnalysisResult> {
  const prompt = `
발달 추적 데이터를 분석하여 머신러닝 기반 예측을 수행해주세요:

데이터 요약:
- 총 데이터 포인트: ${processedData.totalDataPoints}
- 커버된 발달 영역: ${processedData.domainsCovered.join(', ')}
- 추적 기간: ${processedData.timeSpanDays}일
- 전체 개선율: ${(processedData.improvementRate * 100).toFixed(1)}%

발달 트렌드:
${processedData.developmentTrends.map((t: any) => 
  `- ${t.domain}: 트렌드 ${t.trend.toFixed(2)} (${t.dataPoints}개 데이터)`
).join('\n')}

다음 분석을 JSON 형태로 제공해주세요:
1. predicted_next_level: 다음 평가에서 예상되는 평균 수준 (1-5)
2. development_trajectory: 발달 궤도 ("improving", "stable", "concerning" 중 하나)
3. risk_factors: 위험 요소들 (배열)
4. intervention_recommendations: 개입 추천사항들 (배열)
5. confidence_score: 예측 신뢰도 (0-1)
6. milestone_predictions: 영역별 이정표 달성 예측 (배열)

응답은 반드시 유효한 JSON 형태여야 합니다.
`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: '당신은 아동발달 전문가이며 데이터 과학자입니다. 발달 데이터를 분석하여 예측과 추천을 제공합니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    });

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    // JSON 파싱 시도
    try {
      return JSON.parse(analysisText);
    } catch (parseError) {
      // JSON 파싱 실패 시 기본값 반환
      console.error('Failed to parse AI response as JSON:', parseError);
      return createFallbackAnalysis(processedData);
    }

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return createFallbackAnalysis(processedData);
  }
}

function createFallbackAnalysis(processedData: any): MLAnalysisResult {
  const avgTrend = processedData.developmentTrends.reduce((sum: number, t: any) => sum + t.trend, 0) / processedData.developmentTrends.length;
  
  return {
    predicted_next_level: Math.min(5, Math.max(1, 3 + avgTrend)),
    development_trajectory: avgTrend > 0.1 ? 'improving' : avgTrend < -0.1 ? 'concerning' : 'stable',
    risk_factors: avgTrend < 0 ? ['발달 속도 저하 관찰됨'] : [],
    intervention_recommendations: ['지속적인 모니터링 권장', '개별화된 학습 계획 수립'],
    confidence_score: 0.7,
    milestone_predictions: processedData.domainsCovered.map((domain: string) => ({
      domain,
      predicted_achievement_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      probability: 0.75
    }))
  };
}

async function saveMlAnalysis(supabase: any, userId: string, studentId: string, analysis: MLAnalysisResult, rawData: DevelopmentalDataPoint[]) {
  const { data, error } = await supabase
    .from('developmental_ml_analysis')
    .insert({
      user_id: userId,
      student_id: studentId,
      analysis_results: analysis,
      raw_data_summary: {
        total_points: rawData.length,
        domains: [...new Set(rawData.map(d => d.domain))],
        date_range: {
          start: rawData[0]?.tracking_date,
          end: rawData[rawData.length - 1]?.tracking_date
        }
      },
      confidence_score: analysis.confidence_score,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving ML analysis:', error);
    throw error;
  }

  return data;
}

async function generateInterventionPlan(analysis: MLAnalysisResult, processedData: any) {
  const prompt = `
발달 분석 결과를 바탕으로 구체적인 개입 계획을 수립해주세요:

분석 결과:
- 예측 수준: ${analysis.predicted_next_level}
- 발달 궤도: ${analysis.development_trajectory}
- 위험 요소: ${analysis.risk_factors.join(', ')}
- 신뢰도: ${analysis.confidence_score}

각 발달 영역별로 다음을 포함한 개입 계획을 JSON 형태로 제공해주세요:
{
  "immediate_actions": ["즉시 실행할 활동들"],
  "weekly_goals": ["주간 목표들"],
  "monthly_objectives": ["월간 목표들"],
  "resource_recommendations": ["추천 리소스들"],
  "progress_monitoring": ["진전 모니터링 방법들"]
}
`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: '당신은 특수교육 전문가입니다. 개별화된 교육 계획을 수립합니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1500
      }),
    });

    const data = await response.json();
    const planText = data.choices[0].message.content;
    
    try {
      return JSON.parse(planText);
    } catch (parseError) {
      return {
        immediate_actions: ["발달 추적 데이터 보완", "전문가 상담 예약"],
        weekly_goals: ["일주일간 집중 관찰", "활동 참여도 기록"],
        monthly_objectives: ["발달 수준 재평가", "목표 수정"],
        resource_recommendations: ["발달 지원 도구", "전문 서적"],
        progress_monitoring: ["주간 체크리스트", "월간 평가"]
      };
    }

  } catch (error) {
    console.error('Error generating intervention plan:', error);
    return {
      immediate_actions: ["추가 평가 필요"],
      weekly_goals: ["기본 발달 활동 지속"],
      monthly_objectives: ["전문가 검토"],
      resource_recommendations: ["기본 발달 도구"],
      progress_monitoring: ["정기 관찰"]
    };
  }
}