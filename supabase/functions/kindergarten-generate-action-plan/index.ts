import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * 라운드(T0/T30/T60) 응답 기반으로 교사용·부모용 액션 플랜을 생성하고
 * RCI(신뢰변화지수)로 개선도 산출
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { caseId, roundLabel } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 케이스 + 모든 라운드 응답 가져오기
    const { data: caseData, error: caseErr } = await supabase
      .from('kindergarten_consultation_cases')
      .select('*')
      .eq('id', caseId)
      .single();
    if (caseErr) throw caseErr;

    const { data: invites } = await supabase
      .from('kindergarten_assessment_invites')
      .select('round_label, computed_scores, completed_at')
      .eq('case_id', caseId)
      .eq('status', 'completed');

    const currentRound = invites?.find(i => i.round_label === roundLabel);
    const baselineRound = invites?.find(i => i.round_label === 'T0');
    if (!currentRound) throw new Error('Current round not completed');

    // 개선도 계산 (T0 대비)
    const currentScores = (currentRound.computed_scores as Record<string, number>) || {};
    const baseScores = (baselineRound?.computed_scores as Record<string, number>) || {};
    const rciChanges: Record<string, { baseline: number; current: number; delta: number; status: string }> = {};

    let totalDelta = 0; let domainCount = 0;
    for (const [k, v] of Object.entries(currentScores)) {
      const base = baseScores[k] || 0;
      const delta = (v as number) - base;
      totalDelta += delta;
      domainCount++;
      rciChanges[k] = {
        baseline: base,
        current: v as number,
        delta,
        status: delta >= 5 ? 'improved' : delta <= -5 ? 'declined' : 'stable',
      };
    }
    const avgDelta = domainCount > 0 ? totalDelta / domainCount : 0;
    const improvementStatus = roundLabel === 'T0' ? 'baseline' :
      avgDelta >= 5 ? 'improved' : avgDelta <= -5 ? 'declined' : 'stable';

    const prompt = `당신은 영유아 발달 전문가입니다. ${caseData.child_age_months}개월 아동의 부모상담용 액션 플랜을 작성하세요.

## 아동 정보
- 닉네임: ${caseData.child_nickname}
- 월령: ${caseData.child_age_months}개월
- 상담 포커스: ${(caseData.consultation_focus || []).join(', ')}
- 측정 라운드: ${roundLabel}

## 영역별 점수 (0-100)
${Object.entries(currentScores).map(([k, v]) => `- ${k}: ${v}점`).join('\n')}

## 개선도 (T0 대비)
${Object.entries(rciChanges).map(([k, c]) => `- ${k}: ${c.baseline} → ${c.current} (${c.delta > 0 ? '+' : ''}${c.delta}, ${c.status})`).join('\n')}

다음 JSON으로만 응답:
{
  "ai_summary": "2-3문장 종합 소견 (전문적이면서 따뜻한 톤)",
  "teacher_actions": [
    { "title": "교사 액션 제목", "detail": "구체적 실행 방법 (교실에서)", "priority": "high|medium|low" }
  ],
  "parent_actions": [
    { "title": "부모 액션 제목", "detail": "가정에서 실천 방법", "priority": "high|medium|low" }
  ]
}

각각 3-5개 액션. 교사 액션은 임상 용어 OK, 부모 액션은 쉬운말로.`;

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: '영유아 발달 액션 플랜 JSON만 출력.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });
    const aiData = await aiRes.json();
    const plan = JSON.parse(aiData.choices?.[0]?.message?.content || '{}');

    // upsert
    const { data: saved, error: saveErr } = await supabase
      .from('kindergarten_action_plans')
      .upsert({
        case_id: caseId,
        round_label: roundLabel,
        domain_scores: currentScores,
        rci_changes: rciChanges,
        teacher_actions: plan.teacher_actions || [],
        parent_actions: plan.parent_actions || [],
        ai_summary: plan.ai_summary || '',
        improvement_status: improvementStatus,
      }, { onConflict: 'case_id,round_label' })
      .select()
      .single();
    if (saveErr) throw saveErr;

    return new Response(JSON.stringify({ success: true, plan: saved }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('action plan error:', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
