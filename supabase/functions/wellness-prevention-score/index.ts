import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 사용자 데이터 수집
    const [observationsRes, testsRes, behaviorRes] = await Promise.all([
      supabase.from('observation_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      supabase.from('test_results').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
      supabase.from('user_behavior_tracking').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20)
    ]);

    const observations = observationsRes.data || [];
    const tests = testsRes.data || [];
    const behaviors = behaviorRes.data || [];

    // AI 분석 요청
    const prompt = `당신은 예방의학 전문가입니다. 다음 데이터를 바탕으로 사용자의 "예방 건강 점수"와 "3개월 후 예상 건강상태"를 분석해주세요.

**데이터:**
- 관찰일지 ${observations.length}개
- 검사결과 ${tests.length}개  
- 생활패턴 ${behaviors.length}개 기록

**관찰일지 요약:**
${observations.slice(0, 3).map(o => `- ${o.session_name}: ${o.analysis_data?.summary || '기록됨'}`).join('\n')}

**검사결과 요약:**
${tests.slice(0, 2).map(t => `- ${t.test_type}: 점수 ${t.total_score || 'N/A'}`).join('\n')}

**생활패턴 요약:**
${behaviors.slice(0, 5).map(b => `- ${b.event_type}: ${new Date(b.created_at).toLocaleDateString()}`).join('\n')}

**다음 JSON 형식으로만 응답해주세요:**
{
  "preventionScore": 0-100 사이 정수,
  "scoreLevel": "우수|양호|주의|위험" 중 하나,
  "currentStatus": "현재 건강상태 1-2문장 요약",
  "riskFactors": ["위험요인1", "위험요인2"],
  "predictions": {
    "1month": { "score": 0-100, "status": "예상상태" },
    "2months": { "score": 0-100, "status": "예상상태" },
    "3months": { "score": 0-100, "status": "예상상태" }
  },
  "preventionTips": ["예방팁1", "예방팁2", "예방팁3"],
  "keyMessage": "핵심 메시지 1문장"
}`;

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
            content: '당신은 예방의학과 웰니스 전문가입니다. 데이터를 분석하여 질병이 발생하기 전 위험 신호를 감지하고 예방 방법을 제시합니다.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    // JSON 추출
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      preventionScore: 75,
      scoreLevel: "양호",
      currentStatus: "전반적으로 양호한 상태입니다.",
      riskFactors: ["데이터 분석 필요"],
      predictions: {
        "1month": { score: 75, status: "유지" },
        "2months": { score: 76, status: "소폭 개선" },
        "3months": { score: 78, status: "개선" }
      },
      preventionTips: ["규칙적인 관찰 기록", "전문가 상담", "건강한 생활습관"],
      keyMessage: "꾸준한 관리로 건강을 예방하세요."
    };

    // 결과 저장
    await supabase.from('wellness_prevention_scores').insert({
      user_id: userId,
      score: analysis.preventionScore,
      score_level: analysis.scoreLevel,
      current_status: analysis.currentStatus,
      risk_factors: analysis.riskFactors,
      predictions: analysis.predictions,
      prevention_tips: analysis.preventionTips,
      key_message: analysis.keyMessage,
      analysis_data: {
        observations_count: observations.length,
        tests_count: tests.length,
        behaviors_count: behaviors.length
      }
    });

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in wellness-prevention-score:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        preventionScore: 70,
        scoreLevel: "양호",
        currentStatus: "분석 중 오류가 발생했습니다.",
        riskFactors: [],
        predictions: {
          "1month": { score: 70, status: "유지" },
          "2months": { score: 70, status: "유지" },
          "3months": { score: 70, status: "유지" }
        },
        preventionTips: ["정기적인 건강 체크"],
        keyMessage: "건강 관리를 계속하세요."
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});
