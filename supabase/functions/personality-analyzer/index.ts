import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user data
    const [assessmentsRes, consultationsRes, observationsRes] = await Promise.all([
      supabase.from('assessments').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      supabase.from('consultations').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      supabase.from('observation_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20)
    ]);

    const assessments = assessmentsRes.data || [];
    const consultations = consultationsRes.data || [];
    const observations = observationsRes.data || [];

    const assessmentsCount = assessments.length;
    const consultationsCount = consultations.length;
    const observationsCount = observations.length;
    const totalDataPoints = assessmentsCount + consultationsCount + observationsCount;

    console.log('Fetched data:', { 
      assessments: assessmentsCount, 
      consultations: consultationsCount,
      observations: observationsCount,
      total: totalDataPoints
    });

    // 최소 데이터 요구사항 체크 (최소 2개 이상)
    if (totalDataPoints < 2) {
      const suggestions = [];
      
      if (assessmentsCount === 0) {
        suggestions.push("📝 AI 성격유형검사 - 기본 성향 파악");
        suggestions.push("🎨 다중지능검사 - 강점 영역 발견");
      }
      
      if (consultationsCount === 0 && observationsCount === 0) {
        suggestions.push("💬 전문가 상담 - 심층 분석");
        suggestions.push("👀 행동 관찰 기록 - 일상 패턴 파악");
      }

      return new Response(
        JSON.stringify({
          error: 'insufficient_data',
          message: '분석하기에 데이터가 부족해!',
          dataCounts: {
            assessments: assessmentsCount,
            consultations: consultationsCount,
            observations: observationsCount,
            total: totalDataPoints,
            required: 2
          },
          suggestions: suggestions,
          analysis: `지금은 데이터가 ${totalDataPoints}개밖에 없어서 정확한 분석이 어려워 😅\n\n최소 2개 이상의 데이터(검사, 상담, 관찰)가 있어야 너에 대해 제대로 분석할 수 있어!\n\n추천하는 것들:\n${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n이것들 중에서 하나라도 해보고 다시 분석 버튼을 눌러줘! 그럼 훨씬 더 정확하게 분석해줄 수 있을 거야 ✨`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // Construct prompt for AI
    const systemPrompt = `너는 심리 분석 전문가야. 사용자의 검사 결과, 상담 내역, 관찰 데이터를 종합해서 ChatGPT처럼 친근하고 반말로 성향을 분석해줘.

분석 형식:
1. 시작: "내가 봤을 때 [이름]이는 이런 사람이다." 같은 친근한 문장으로 시작
2. 10가지 성향 분석 (각각 2-3줄):
   - 핵심 성향: 가장 두드러진 특징
   - 사고 타입: 생각하는 방식
   - 혼자서도 큰 타입: 독립성과 자기주도성
   - 인간관계 타입: 사람들과의 관계 방식
   - 리더십 타입: 리더로서의 성향
   - 스트레스 반응: 어려움 대처 방식
   - 창업가 성향: 도전과 혁신 성향
   - 학습 스타일: 배움과 성장 방식
   - 리스크 성향: 위험 감수 성향
   - 감성과 전략: 감정과 계획의 균형

3. 마무리: "한 줄로 요약하면" + 핵심 정리

중요:
- 완전 반말 사용 (예: "~야", "~거든", "~더라", "~잖아")
- 친구처럼 편하게, 하지만 전문적인 인사이트
- 구체적이고 개인화된 표현
- 긍정적이면서도 솔직하게
- 데이터 기반으로 분석하되, 따뜻한 톤 유지`;

    const userPrompt = `사용자 데이터:

검사 결과 (${assessmentsCount}건):
${assessments.slice(0, 5).map(a => `- ${a.assessment_type}: 점수 ${a.total_score || 'N/A'}, 심각도 ${a.severity || 'N/A'}`).join('\n')}

상담 내역 (${consultationsCount}건):
${consultations.slice(0, 5).map(c => `- ${c.consultation_type || '일반'}: ${c.notes?.substring(0, 100) || '상담 진행'}`).join('\n')}

관찰 기록 (${observationsCount}건):
${observations.slice(0, 5).map(o => `- 인지: ${o.cognitive_score}, 언어: ${o.language_score}, 사회성: ${o.social_score}, 운동: ${o.motor_score}`).join('\n')}

위 데이터를 바탕으로 사용자의 성향을 친근하게 반말로 분석해줘.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "너무 많은 요청이 있어서 잠시 기다려야 해. 30초 후에 다시 시도해줘!" 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "AI 분석 크레딧이 부족해. 관리자에게 문의해줘." 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    if (!analysis) {
      throw new Error("No analysis generated");
    }

    // Save analysis to database
    await supabase.from('personality_analysis').insert({
      user_id: userId,
      analysis_text: analysis,
      data_sources: {
        assessments_count: assessmentsCount,
        consultations_count: consultationsCount,
        observations_count: observationsCount
      }
    });

    return new Response(JSON.stringify({ 
      analysis,
      dataCount: {
        assessments: assessmentsCount,
        consultations: consultationsCount,
        observations: observationsCount
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in personality-analyzer:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "분석 중 오류가 발생했어. 다시 시도해줘!",
      analysis: "아직 데이터가 충분하지 않아서 제대로 분석하기 어려워. 검사나 상담을 좀 더 진행하고 다시 와줘!"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
