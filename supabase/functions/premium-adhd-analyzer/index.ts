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
  total?: number | null;
  average?: number | null;
  userId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseKey!);
    console.log('[PREMIUM-ADHD-ANALYZER] 요청 시작');

    const { answers, ageGroup, severity, total, average, userId }: ADHDAnalysisRequest = await req.json();

    // 입력 정규화 및 안전 가드
    const safeAnswers = (answers || []).map((n) => Number.isFinite(n) ? n : 0);
    const safeTotal = Number.isFinite(total as number) ? (total as number) : safeAnswers.reduce((s, v) => s + v, 0);
    const safeAverage = Number.isFinite(average as number) ? (average as number) : (safeAnswers.length ? safeTotal / safeAnswers.length : 0);

    console.log('[PREMIUM-ADHD-ANALYZER] 분석 시작:', {
      answersCount: safeAnswers.length,
      ageGroup,
      severity,
      total: safeTotal,
      average: safeAverage
    });

    // 토큰 확인 및 차감
    if (userId) {
      const { data: userTokens } = await supabase
        .from('user_tokens')
        .select('current_tokens, total_used')
        .eq('user_id', userId)
        .maybeSingle();

      if (!userTokens || (userTokens.current_tokens ?? 0) < 8) {
        console.log('[PREMIUM-ADHD-ANALYZER] 토큰 부족:', userTokens?.current_tokens || 0);
        return new Response(JSON.stringify({ 
          error: 'insufficient_tokens',
          required: 8,
          available: userTokens?.current_tokens || 0,
          message: '토큰이 부족합니다. ADHD 전문 분석에는 8토큰이 필요합니다.'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 토큰 차감
      const { error: tokenError } = await supabase
        .from('user_tokens')
        .update({ 
          current_tokens: (userTokens.current_tokens ?? 0) - 8,
          total_used: (userTokens.total_used ?? 0) + 8
        })
        .eq('user_id', userId);

      if (tokenError) {
        console.error('[PREMIUM-ADHD-ANALYZER] 토큰 차감 실패:', tokenError);
        throw new Error('토큰 차감에 실패했습니다.');
      }

      console.log(`ADHD 전문 분석 - 토큰 차감: 8, 잔액: ${(userTokens.current_tokens ?? 0) - 8}`);
    }

    // 기본 ADHD 검사는 18문항 (주의력 결핍 9문항 + 과잉행동/충동성 9문항)
    const adhdDomains = [
      { name: '주의력 결핍', items: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
      { name: '과잉행동/충동성', items: [10, 11, 12, 13, 14, 15, 16, 17, 18] }
    ];

    // 도메인별 점수 계산 (각 문항 최대 3점 기준)
    const domainScores = adhdDomains.map(domain => {
      const domainAnswers = domain.items.map(item => safeAnswers[item - 1] || 0);
      const domainTotal = domainAnswers.reduce((sum, score) => sum + score, 0);
      const domainAverage = domainTotal / domainAnswers.length;
      const domainPercentage = (domainAverage / 3) * 100; // 3점 만점 기준

      return {
        name: domain.name,
        score: domainTotal,
        average: domainAverage,
        percentage: domainPercentage,
        severity: domainPercentage >= 75 ? '높음' : 
                 domainPercentage >= 50 ? '중간' : 
                 domainPercentage >= 25 ? '낮음' : '매우낮음',
        items: domain.items,
        answers: domainAnswers
      };
    });

    // AI 프롬프트 구성 (간결 + 섹션화)
    const analysisPrompt = `
당신은 ADHD 전문 정신과 의사입니다. 아래 데이터를 기반으로 정확하고 간결하지만 깊이 있는 분석을 한국어로 제공합니다.

[기본 정보]
- 연령군: ${ageGroup}
- 전체 심각도: ${severity}
- 총점: ${safeTotal}점 (문항수 ${safeAnswers.length})
- 평균: ${safeAverage.toFixed(2)}점/3점

[도메인 점수]
${domainScores.map(d => `- ${d.name}: ${d.score}점 (평균 ${d.average.toFixed(2)}/3, ${d.percentage.toFixed(1)}%)`).join('\n')}

[작성 지침]
- 각 섹션 제목을 명확히 표기하세요.
- 불필요한 서론 없이 핵심부터 설명하세요.
- 총 900~1400자 내로 작성.

1) 임상적 해석(DSM-5 관점)
2) 영역별 상세 분석(주의력/과잉행동·충동성)
3) 연령 특성 고려한 생활 영향
4) 현실적인 개입/훈련/환경 조정 제안(가정·학교/직장)
5) 요약 및 즉시 실행 체크리스트(3개)
`;

    // Lovable AI Gateway 호출 (Gemini 2.5 Flash)
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('AI 설정이 완료되지 않았습니다.');
    }

    const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        stream: false,
        messages: [
          { role: 'system', content: '당신은 신뢰할 수 있는 임상 심리/정신과 전문가입니다. 정확하고 간결한 한국어로 답변합니다.' },
          { role: 'user', content: analysisPrompt }
        ],
        max_completion_tokens: 1500,
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error('[PREMIUM-ADHD-ANALYZER] AI gateway error:', aiResp.status, t);
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: 'rate_limited', message: 'AI 요청이 많아 잠시 후 다시 시도해주세요.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: 'payment_required', message: 'AI 크레딧이 부족합니다.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      throw new Error('AI gateway error');
    }

    const aiJson = await aiResp.json();
    const analysis = aiJson.choices?.[0]?.message?.content ?? '';

    console.log(`[PREMIUM-ADHD-ANALYZER] 분석 완료, 텍스트 길이: ${analysis.length}`);

    const result = {
      analysis,
      domainScores,
      metadata: {
        analysisDate: new Date().toISOString(),
        tokensUsed: 8,
        analysisLength: analysis.length,
        ageGroup,
        severity,
        totalScore: safeTotal,
        averageScore: safeAverage
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