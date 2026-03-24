import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ADHDAnalysisRequest {
  answers: number[];
  ageGroup: string;
  severity: string;
  total: number;
  average: number;
  userId?: string;
  scores?: {
    inattention: number;
    hyperactivity: number;
    impulsivity: number;
    executiveDysfunction: number;
    comorbidity: number;
    functionalImpairment: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseKey!);
    console.log('[PREMIUM-ADHD-ANALYZER] 요청 시작');

    const { answers, ageGroup, severity, total, average, userId, scores }: ADHDAnalysisRequest = await req.json();
    
    console.log('[PREMIUM-ADHD-ANALYZER] 분석 시작:', {
      answersCount: answers.length,
      ageGroup,
      severity,
      total,
      average,
      scores
    });

    // 크레딧 소진은 프론트엔드에서 처리 완료
    console.log('[PREMIUM-ADHD-ANALYZER] 크레딧 확인은 프론트엔드에서 처리됨');

    // 프리미엄 ADHD 검사 영역별 점수 (실제 점수 사용)
    const domainScores = scores ? [
      {
        name: '부주의',
        score: scores.inattention,
        maxScore: 200,
        percentage: (scores.inattention / 200) * 100,
        severity: scores.inattention >= 150 ? '매우 높음' : 
                 scores.inattention >= 100 ? '높음' : 
                 scores.inattention >= 50 ? '보통' : '낮음'
      },
      {
        name: '과잉행동',
        score: scores.hyperactivity,
        maxScore: 200,
        percentage: (scores.hyperactivity / 200) * 100,
        severity: scores.hyperactivity >= 150 ? '매우 높음' : 
                 scores.hyperactivity >= 100 ? '높음' : 
                 scores.hyperactivity >= 50 ? '보통' : '낮음'
      },
      {
        name: '충동성',
        score: scores.impulsivity,
        maxScore: 200,
        percentage: (scores.impulsivity / 200) * 100,
        severity: scores.impulsivity >= 150 ? '매우 높음' : 
                 scores.impulsivity >= 100 ? '높음' : 
                 scores.impulsivity >= 50 ? '보통' : '낮음'
      },
      {
        name: '실행기능',
        score: scores.executiveDysfunction,
        maxScore: 200,
        percentage: (scores.executiveDysfunction / 200) * 100,
        severity: scores.executiveDysfunction >= 150 ? '매우 높음' : 
                 scores.executiveDysfunction >= 100 ? '높음' : 
                 scores.executiveDysfunction >= 50 ? '보통' : '낮음'
      },
      {
        name: '동반증상',
        score: scores.comorbidity,
        maxScore: 100,
        percentage: (scores.comorbidity / 100) * 100,
        severity: scores.comorbidity >= 75 ? '매우 높음' : 
                 scores.comorbidity >= 50 ? '높음' : 
                 scores.comorbidity >= 25 ? '보통' : '낮음'
      },
      {
        name: '기능수준',
        score: scores.functionalImpairment,
        maxScore: 100,
        percentage: (scores.functionalImpairment / 100) * 100,
        severity: scores.functionalImpairment >= 75 ? '매우 높음' : 
                 scores.functionalImpairment >= 50 ? '높음' : 
                 scores.functionalImpairment >= 25 ? '보통' : '낮음'
      }
    ] : [];

    // AI 프롬프트 구성
    const domainSummary = domainScores.map(d => `${d.name}: ${d.score}/${d.maxScore}점(${d.severity})`).join(', ');
    
    const analysisPrompt = `ADHD 평가 결과를 분석해주세요.

연령군: ${ageGroup}, 심각도: ${severity}, 총점: ${total}점, 평균: ${average}점
영역별: ${domainSummary || '데이터 없음'}

다음 형식으로 2000자 이상 작성:

### 🧠 종합해석
DSM-5 기준 ADHD 진단 관점의 종합 해석

### 📊 영역별 분석
부주의, 과잉행동, 충동성, 실행기능 각 영역 분석

### 👤 연령별 맞춤 분석
${ageGroup} 발달 단계에서의 특성

### 🏠 일상생활 영향
학습/업무, 대인관계, 가정생활 영향

### 💊 개입 방안
행동치료, 환경조정, 전문가 상담 권고

### 📈 장기 관리방안
강점 기반 발달 전략, 장기 목표

### ✨ 요약 및 제언
핵심 발견, 권장사항 5가지, 격려 메시지

전문적이면서 이해하기 쉽게 작성하세요.`;

    // Gemini API 호출
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: '당신은 ADHD 전문 정신과 의사로서, 과학적 근거에 바탕한 정확하고 상세한 임상 분석을 제공합니다. DSM-5 기준과 최신 ADHD 연구를 바탕으로 전문적인 평가를 수행합니다. 반드시 3000자 이상의 상세한 분석을 제공하세요. 각 섹션별로 구체적인 근거와 함께 깊이 있는 해석을 제공하세요.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[PREMIUM-ADHD-ANALYZER] AI API 오류:', errorData);
      throw new Error(`AI API 오류: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log(`[PREMIUM-ADHD-ANALYZER] 분석 완료, 텍스트 길이: ${analysis.length}`);

    // 분석 결과와 도메인 점수 반환
    const result = {
      analysis,
      domainScores,
      metadata: {
        analysisDate: new Date().toISOString(),
        tokensUsed: 8,
        analysisLength: analysis.length,
        ageGroup,
        severity,
        totalScore: total,
        averageScore: average
      }
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[PREMIUM-ADHD-ANALYZER] 오류:', error);
    return new Response(JSON.stringify({ 
      error: 'analysis_failed',
      message: error instanceof Error ? error.message : 'ADHD 분석 중 오류가 발생했습니다.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});