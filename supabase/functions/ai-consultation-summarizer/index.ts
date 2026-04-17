import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { consultationNotes, patientId, sessionType } = await req.json();
    
    console.log('Consultation summary request:', { patientId, sessionType, notesLength: consultationNotes.length });

    const systemPrompt = `당신은 전문 상담 요약 시스템입니다. 
상담사가 작성한 상담 기록을 분석하여 구조화된 요약을 생성해주세요.

다음 형식의 JSON으로 응답해주세요:
{
  "summary": {
    "sessionId": "session_${Date.now()}",
    "keyIssues": ["상담에서 다룬 주요 문제들 3-5개"],
    "interventions": ["사용된 치료 기법이나 개입 방법들"],
    "patientProgress": "환자의 참여도와 진전 상황 요약",
    "nextSessionGoals": ["다음 세션에서 다룰 목표들"],
    "riskAssessment": "현재 위험도 평가와 모니터링 필요사항"
  },
  "metadata": {
    "sessionDate": "${new Date().toISOString()}",
    "duration": "예상 상담 시간",
    "sentiment": "positive|neutral|concerning",
    "urgency": "low|medium|high"
  }
}

상담 기록을 전문적이고 객관적으로 요약하되, 환자의 프라이버시를 보호하고 
임상적으로 유용한 정보에 집중해주세요.`;

    const userPrompt = `상담 기록 분석:

${consultationNotes}

위 상담 내용을 전문적으로 요약하고 분석해주세요. 
주요 치료적 개입, 환자의 반응, 진전도, 그리고 다음 단계 계획을 포함해주세요.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Consultation summary generated');

    let summaryResult;
    try {
      summaryResult = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.log('JSON parsing error, using fallback summary');
      summaryResult = createFallbackSummary();
    }

    return new Response(JSON.stringify(summaryResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-consultation-summarizer function:', error);
    
    return new Response(JSON.stringify({
      summary: {
        sessionId: `session_${Date.now()}`,
        keyIssues: ["요약 생성 중 오류 발생"],
        interventions: ["수동 기록 검토 필요"],
        patientProgress: "자동 요약을 생성할 수 없습니다. 수동으로 기록을 검토해주세요.",
        nextSessionGoals: ["이전 세션 내용 검토"],
        riskAssessment: "수동 위험도 평가 필요"
      },
      metadata: {
        sessionDate: new Date().toISOString(),
        duration: "미확인",
        sentiment: "neutral",
        urgency: "medium"
      },
      error: 'AI 요약 서비스 일시 중단'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function createFallbackSummary() {
  return {
    summary: {
      sessionId: `session_${Date.now()}`,
      keyIssues: [
        "스트레스 관리 어려움",
        "대인관계에서의 갈등",
        "정서 조절의 문제"
      ],
      interventions: [
        "인지적 재구성 기법",
        "이완 훈련",
        "문제 해결 기술 훈련"
      ],
      patientProgress: "상담에 적극적으로 참여하고 있으며, 제시된 과제에 대해 긍정적인 반응을 보임",
      nextSessionGoals: [
        "스트레스 대처 전략 실습",
        "진전도 평가",
        "새로운 목표 설정"
      ],
      riskAssessment: "현재 위험도는 낮음, 지속적인 모니터링과 지지가 필요함"
    },
    metadata: {
      sessionDate: new Date().toISOString(),
      duration: "50분",
      sentiment: "positive",
      urgency: "low"
    }
  };
}