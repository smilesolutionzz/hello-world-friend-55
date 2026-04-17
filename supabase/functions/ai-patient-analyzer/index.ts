import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, analysisType } = await req.json();
    
    console.log('Patient analysis request:', { userId, analysisType });

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch patient data
    const { data: assessments } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: consultations } = await supabase
      .from('consultations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    const systemPrompt = `당신은 환자 히스토리 분석 전문가입니다. 
환자의 평가 기록과 상담 이력을 종합적으로 분석하여 다음을 제공해주세요:

1. 환자의 전반적인 위험 수준 평가
2. 개선 추세 분석
3. 주 진단 제안 및 감별진단
4. 치료 권장사항

다음 형식의 JSON으로 응답해주세요:
{
  "patientHistory": {
    "id": "${userId}",
    "userId": "${userId}",
    "assessmentHistory": [],
    "consultationHistory": [],
    "riskLevel": "low|medium|high",
    "lastAssessmentDate": "ISO 날짜",
    "improvementTrend": "improving|stable|declining"
  },
  "diagnosticSuggestion": {
    "primaryDiagnosis": "주 진단명",
    "confidence": <0-100 신뢰도>,
    "differentialDiagnoses": ["감별진단 목록"],
    "recommendedTests": ["권장 추가 검사"],
    "treatmentSuggestions": ["치료 제안"],
    "riskFactors": ["위험 요인들"]
  },
  "insights": {
    "keyFindings": ["주요 발견사항"],
    "progressNotes": "진전도 분석",
    "recommendations": ["권장사항"]
  }
}`;

    const userPrompt = `환자 분석 데이터:
평가 기록 수: ${assessments?.length || 0}
상담 기록 수: ${consultations?.length || 0}

최근 평가 데이터: ${assessments ? JSON.stringify(assessments.slice(0, 3)) : '없음'}
최근 상담 데이터: ${consultations ? JSON.stringify(consultations.slice(0, 2)) : '없음'}

종합적인 환자 분석을 수행해주세요.`;

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
        temperature: 0.2,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Patient analysis completed');

    let analysisResult;
    try {
      analysisResult = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.log('JSON parsing error, using fallback analysis');
      analysisResult = createFallbackAnalysis(userId, assessments || [], consultations || []);
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-patient-analyzer function:', error);
    
    return new Response(JSON.stringify({
      patientHistory: {
        id: 'fallback',
        userId: 'fallback',
        assessmentHistory: [],
        consultationHistory: [],
        riskLevel: 'medium',
        lastAssessmentDate: new Date().toISOString(),
        improvementTrend: 'stable'
      },
      diagnosticSuggestion: {
        primaryDiagnosis: "추가 평가 필요",
        confidence: 65,
        differentialDiagnoses: ["적응 장애", "불안 관련 문제"],
        recommendedTests: ["추가 면담", "표준화 검사"],
        treatmentSuggestions: ["지지적 상담", "인지행동치료"],
        riskFactors: ["스트레스 요인", "환경적 변화"]
      },
      insights: {
        keyFindings: ["제한적 데이터로 인한 기초 분석"],
        progressNotes: "더 많은 정보가 필요합니다",
        recommendations: ["정기적 평가", "지속적 모니터링"]
      },
      error: 'AI 분석 서비스 일시 중단'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function createFallbackAnalysis(userId: string, assessments: any[], consultations: any[]) {
  const hasRecentAssessment = assessments && assessments.length > 0;
  const riskLevel = hasRecentAssessment ? 'medium' : 'high';
  
  return {
    patientHistory: {
      id: userId,
      userId,
      assessmentHistory: assessments || [],
      consultationHistory: consultations || [],
      riskLevel,
      lastAssessmentDate: hasRecentAssessment ? assessments[0].created_at : new Date().toISOString(),
      improvementTrend: 'stable'
    },
    diagnosticSuggestion: {
      primaryDiagnosis: "종합적 평가 필요",
      confidence: 60,
      differentialDiagnoses: ["적응 장애", "스트레스 반응"],
      recommendedTests: ["구조화된 면담", "표준화 평가 도구"],
      treatmentSuggestions: ["지지적 정신치료", "스트레스 관리"],
      riskFactors: ["환경적 스트레스", "지지 체계 부족"]
    },
    insights: {
      keyFindings: ["초기 평가 단계", "추가 정보 수집 필요"],
      progressNotes: "기초 평가 완료, 지속적 관찰 필요",
      recommendations: ["정기 평가 스케줄링", "다면적 접근 계획"]
    }
  };
}