import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface ScreeningResults {
  answers: number[];
  ageGroup: 'child' | 'adult';
  age?: number;
  totalScore: number;
  domainScores: Record<string, number>;
}

interface DevelopmentalAnalysis {
  overallRiskLevel: 'minimal' | 'mild' | 'moderate' | 'significant' | 'high';
  clinicalInterpretation: string;
  domainAnalysis: {
    domain: string;
    score: number;
    interpretation: string;
    recommendations: string[];
  }[];
  developmentalProfile: {
    strengths: string[];
    concernAreas: string[];
    riskFactors: string[];
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    referrals: string[];
  };
  diagnosticConsiderations: string[];
  confidenceLevel: number;
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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestBody = await req.json();
    const { results, ageGroup, age } = requestBody;
    
    // Input validation
    if (!results || !Array.isArray(results.answers) || !ageGroup) {
      return new Response(JSON.stringify({ error: '유효하지 않은 검사 데이터입니다.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 토큰 차감 처리 (발달특성 선별체크는 4토큰)
    const tokenCost = 1;
    
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_tokens')
      .select('current_tokens')
      .eq('user_id', user.id)
      .single();

    if (tokenError || !tokenData || tokenData.current_tokens < tokenCost) {
      return new Response(JSON.stringify({ error: '토큰이 부족합니다.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 토큰 차감
    const { error: updateError } = await supabase
      .from('user_tokens')
      .update({ 
        current_tokens: tokenData.current_tokens - tokenCost,
        last_used_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Token deduction error:', updateError);
    }

    console.log('Processing developmental screening analysis:', {
      userId: user.id,
      ageGroup,
      age,
      totalScore: results.total,
      answersLength: results.answers.length
    });

    // AI 기반 박사급 발달특성 분석
    const analysis = await analyzeDevelopmentalScreening(results, ageGroup, age);
    
    // 분석 결과 저장
    const savedResult = await saveScreeningAnalysis(supabase, user.id, results, analysis, ageGroup);

    return new Response(JSON.stringify({
      success: true,
      analysis: analysis,
      resultId: savedResult.id,
      timestamp: new Date().toISOString(),
      tokensUsed: tokenCost
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in developmental-screening-analyzer:', error);
    return new Response(JSON.stringify({ 
      error: '분석 중 오류가 발생했습니다.',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeDevelopmentalScreening(results: ScreeningResults, ageGroup: string, age?: number): Promise<DevelopmentalAnalysis> {
  const totalScore = results.answers.reduce((sum, answer) => sum + answer, 0);
  const averageScore = totalScore / results.answers.length;
  
  // 도메인별 점수 계산 (20문항을 주요 도메인으로 분류)
  const domainScores = calculateDomainScores(results.answers);
  
  const prompt = `
당신은 임상심리학 박사이자 발달장애 전문가입니다. AIH 발달특성 선별체크 결과를 심층 분석해주세요.

검사 정보:
- 연령군: ${ageGroup} ${age ? `(${age}세)` : ''}
- 총점: ${totalScore}/20점
- 평균점수: ${averageScore.toFixed(2)}점
- 개별 응답: ${results.answers.join(', ')}

도메인별 점수:
${Object.entries(domainScores).map(([domain, score]) => `- ${domain}: ${score}점`).join('\n')}

각 문항은 발달 특성의 핵심 영역을 평가합니다:
1. 사회적 의사소통 (공동주의, 비언어적 소통)
2. 인지적 유연성 (변화 수용, 문제해결)
3. 정서 조절 (감정 표현, 좌절 내성)
4. 사회적 상호작용 (또래관계, 사회적 인지)
5. 감각처리 (과민성/과소반응)
6. 반복행동 및 제한된 관심
7. 실행기능 (주의집중, 복합지시 수행)

다음 형식의 JSON으로 응답해주세요:
{
  "overallRiskLevel": "minimal|mild|moderate|significant|high",
  "clinicalInterpretation": "전반적인 발달특성 및 임상적 해석",
  "domainAnalysis": [
    {
      "domain": "도메인명",
      "score": 점수,
      "interpretation": "도메인별 세부 해석",
      "recommendations": ["구체적 지원 방법들"]
    }
  ],
  "developmentalProfile": {
    "strengths": ["강점 영역들"],
    "concernAreas": ["관심 영역들"],
    "riskFactors": ["위험 요인들"]
  },
  "recommendations": {
    "immediate": ["즉시 실행할 사항들"],
    "shortTerm": ["단기 목표 및 계획"],
    "longTerm": ["장기 발달 지원 계획"],
    "referrals": ["추천 전문가/기관"]
  },
  "diagnosticConsiderations": ["고려해야 할 진단적 가능성들"],
  "confidenceLevel": 0.0-1.0
}

분석 시 고려사항:
- 자폐스펙트럼장애의 조기 지표
- ADHD 관련 주의력/실행기능
- 사회적 의사소통 장애
- 감각처리장애
- 정서조절 어려움
- 발달지연 가능성

응답은 반드시 유효한 JSON이어야 하며, 임상적으로 정확하고 구체적인 정보를 포함해야 합니다.
`;

  try {
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
            content: '당신은 임상심리학 박사이자 아동발달 전문가입니다. 20년 이상의 발달장애 진단 및 평가 경험을 바탕으로 정확하고 전문적인 분석을 제공합니다. 모든 분석은 DSM-5 및 최신 임상 가이드라인을 따릅니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 3000
      }),
    });

    const data = await response.json();
    console.log('OpenAI API response:', { 
      choices: data.choices?.length,
      usage: data.usage,
      model: data.model
    });

    if (!data.choices || !data.choices[0]) {
      throw new Error('OpenAI API returned no choices');
    }

    const analysisText = data.choices[0].message.content;
    
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const analysis = JSON.parse(jsonMatch[0]);
      return analysis;
    } catch (parseError) {
      console.error('Failed to parse AI analysis:', parseError);
      return createFallbackAnalysis(totalScore, averageScore, ageGroup);
    }

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return createFallbackAnalysis(totalScore, averageScore, ageGroup);
  }
}

function calculateDomainScores(answers: number[]): Record<string, number> {
  return {
    '사회적의사소통': answers[0] + answers[6] + answers[13], // 문항 1,7,14
    '인지적유연성': answers[1] + answers[4] + answers[18], // 문항 2,5,19
    '정서조절': answers[3] + answers[8] + answers[14], // 문항 4,9,15
    '사회적상호작용': answers[5] + answers[15] + answers[19], // 문항 6,16,20
    '감각처리': answers[10] + answers[11], // 문항 11,12
    '반복행동': answers[11] + answers[12], // 문항 12,13
    '실행기능': answers[7] + answers[18] // 문항 8,19
  };
}

function createFallbackAnalysis(totalScore: number, averageScore: number, ageGroup: string): DevelopmentalAnalysis {
  let riskLevel: 'minimal' | 'mild' | 'moderate' | 'significant' | 'high' = 'minimal';
  
  if (totalScore >= 15) riskLevel = 'high';
  else if (totalScore >= 12) riskLevel = 'significant';
  else if (totalScore >= 8) riskLevel = 'moderate';
  else if (totalScore >= 5) riskLevel = 'mild';
  
  return {
    overallRiskLevel: riskLevel,
    clinicalInterpretation: `총 ${totalScore}점으로 ${riskLevel === 'minimal' ? '일반적인 발달 범위' : '추가 관찰이 필요한 범위'}에 해당합니다. 전문적인 평가를 통해 보다 정확한 진단이 가능합니다.`,
    domainAnalysis: [
      {
        domain: '전반적 발달특성',
        score: totalScore,
        interpretation: '현재 발달 상태에 대한 종합적 검토가 필요합니다.',
        recommendations: ['전문가 상담', '추가 평가 고려']
      }
    ],
    developmentalProfile: {
      strengths: totalScore < 5 ? ['일반적 발달 수준 유지'] : [],
      concernAreas: totalScore >= 5 ? ['발달 특성 관찰 필요'] : [],
      riskFactors: totalScore >= 10 ? ['발달 지연 위험'] : []
    },
    recommendations: {
      immediate: ['전문가 상담 예약'],
      shortTerm: ['발달 관찰 일지 작성'],
      longTerm: ['정기적 발달 평가'],
      referrals: ['소아정신과', '발달센터']
    },
    diagnosticConsiderations: totalScore >= 8 ? ['자폐스펙트럼장애', 'ADHD', '발달지연'] : [],
    confidenceLevel: 0.7
  };
}

async function saveScreeningAnalysis(supabase: any, userId: string, results: any, analysis: DevelopmentalAnalysis, ageGroup: string) {
  const { data, error } = await supabase
    .from('developmental_screening_results')
    .insert({
      user_id: userId,
      test_type: 'aih_developmental_screening',
      age_group: ageGroup,
      raw_scores: results.answers,
      total_score: results.answers.reduce((sum: number, answer: number) => sum + answer, 0),
      ai_analysis: analysis,
      risk_level: analysis.overallRiskLevel,
      confidence_score: analysis.confidenceLevel,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving screening analysis:', error);
    throw error;
  }

  return data;
}