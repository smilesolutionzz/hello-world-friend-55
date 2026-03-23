import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AnalysisRequest {
  sessionId: string;
  therapistType: string;
  conversationHistory: ConversationMessage[];
  userConcern: string;
  moodBefore?: number;
  moodAfter?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: '인증이 필요합니다.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: '유효하지 않은 토큰입니다.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestData: AnalysisRequest = await req.json();
    
    console.log(`[THERAPY-ANALYSIS] Analyzing session ${requestData.sessionId} for ${requestData.therapistType}`);

    // 대화 내용을 텍스트로 변환
    const conversationText = requestData.conversationHistory
      .map(msg => `${msg.role === 'user' ? '내담자' : '치료사'}: ${msg.content}`)
      .join('\n\n');

    // GPT-5를 사용한 심층 분석
    const analysisPrompt = `당신은 경험 많은 ${requestData.therapistType} 전문가입니다. 다음 치료 세션을 심층 분석해주세요.

**세션 정보**
- 치료사 유형: ${requestData.therapistType}
- 주 호소: ${requestData.userConcern}
- 세션 전 기분: ${requestData.moodBefore || 'N/A'}/10
- 세션 후 기분: ${requestData.moodAfter || 'N/A'}/10

**대화 내용**
${conversationText}

**분석 요청**
다음 항목들을 JSON 형식으로 분석해주세요:
1. key_insights: 핵심 통찰 (배열, 3-5개)
2. patterns_identified: 발견된 패턴 (배열, 2-3개)
3. therapeutic_techniques_used: 사용된 치료 기법 (배열, 각 기법과 효과성 평가)
4. client_strengths: 내담자의 강점 (배열, 2-3개)
5. areas_for_improvement: 개선이 필요한 영역 (배열, 2-3개)
6. homework_suggestions: 과제 제안 (배열, 3-4개)
7. next_session_goals: 다음 세션 목표 (배열, 2-3개)
8. progress_assessment: 진척도 평가 (1-5점, 이유 포함)
9. therapist_observations: 치료사 관찰 사항 (문자열)
10. breakthrough_moments: 돌파구 순간들 (배열, 있다면)
11. emotional_regulation: 감정 조절 능력 평가 (1-5점)
12. treatment_adherence: 치료 계획 준수도 (1-5점)

전문적이고 구체적으로 분석해주세요. 실제 임상 기록처럼 작성해주세요.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: '당신은 전문적인 심리치료 분석가입니다. 세션을 깊이 있게 분석하고 구체적인 피드백을 제공합니다.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_completion_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[THERAPY-ANALYSIS] OpenAI API 오류:', errorData);
      throw new Error('분석 생성 실패');
    }

    const data = await response.json();
    const analysisResult = JSON.parse(data.choices[0].message.content);

    console.log('[THERAPY-ANALYSIS] 분석 완료:', analysisResult);

    // 세션 정보 업데이트
    const { error: updateError } = await supabase
      .from('therapy_sessions')
      .update({
        session_notes: conversationText.substring(0, 10000), // 요약본
        therapist_observations: analysisResult.therapist_observations,
        key_insights: analysisResult.key_insights,
        homework_assigned: analysisResult.homework_suggestions,
        progress_rating: analysisResult.progress_assessment,
        next_session_goals: analysisResult.next_session_goals,
        mood_after: requestData.moodAfter
      })
      .eq('id', requestData.sessionId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('[THERAPY-ANALYSIS] 세션 업데이트 오류:', updateError);
    }

    // 인사이트 저장
    if (analysisResult.key_insights && analysisResult.key_insights.length > 0) {
      const insights = analysisResult.key_insights.map((insight: string) => ({
        session_id: requestData.sessionId,
        user_id: user.id,
        insight_type: 'pattern',
        insight_content: insight,
        confidence_score: 0.8,
        ai_generated: true
      }));

      await supabase.from('therapy_insights').insert(insights);
    }

    // 돌파구 순간 저장
    if (analysisResult.breakthrough_moments && analysisResult.breakthrough_moments.length > 0) {
      const breakthroughs = analysisResult.breakthrough_moments.map((moment: string) => ({
        session_id: requestData.sessionId,
        user_id: user.id,
        insight_type: 'breakthrough',
        insight_content: moment,
        confidence_score: 0.9,
        ai_generated: true
      }));

      await supabase.from('therapy_insights').insert(breakthroughs);
    }

    // 치료 기법 로그 저장
    if (analysisResult.therapeutic_techniques_used && analysisResult.therapeutic_techniques_used.length > 0) {
      const techniques = analysisResult.therapeutic_techniques_used.map((technique: any) => ({
        session_id: requestData.sessionId,
        technique_name: technique.name || technique,
        technique_category: requestData.therapistType,
        effectiveness_rating: technique.effectiveness || 4,
        therapist_notes: technique.notes || ''
      }));

      await supabase.from('therapy_techniques_log').insert(techniques);
    }

    return new Response(JSON.stringify({
      success: true,
      analysis: analysisResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[THERAPY-ANALYSIS] 오류:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
