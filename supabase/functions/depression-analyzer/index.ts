import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { results, answers } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const analysisPrompt = `
당신은 임상심리학 전문가입니다. Beck 우울척도(BDI-II) 기반 검사 결과를 분석해주세요.

검사 결과:
- 총점: ${results.total}점 (0-63점 범위)
- 평균: ${results.average}점
- 심각도: ${results.severity}
- 개별 응답: ${answers.join(', ')}

다음 영역을 포함하여 전문적이고 상세한 분석을 제공해주세요:

1. **점수 해석**: 현재 점수가 의미하는 바와 우울증 심각도 수준

2. **증상 패턴 분석**: 
   - 주요 우울 증상 영역별 분석 (인지적, 정서적, 신체적, 행동적 증상)
   - 특히 높은 점수를 보인 문항들의 임상적 의미

3. **위험 요소**: 
   - 자살 사고나 자해 위험성 평가
   - 일상생활 기능 저하 정도

4. **권장사항**:
   - 즉시 필요한 조치
   - 장기적인 관리 방안
   - 전문가 도움이 필요한 시점

5. **생활 관리 팁**:
   - 구체적이고 실천 가능한 자가관리 방법
   - 우울 증상 완화를 위한 일상 습관

분석은 따뜻하고 공감적인 톤으로 작성하되, 의학적으로 정확하고 전문적이어야 합니다. 
약 800-1000자 분량으로 상세히 작성해주세요.
`;

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
            content: '당신은 임상심리학 박사이자 우울증 전문가입니다. 환자에게 도움이 되는 전문적이고 공감적인 분석을 제공합니다.'
          },
          { role: 'user', content: analysisPrompt }
        ],
        max_completion_tokens: 1500
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      analysis,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in depression-analyzer function:', error);
    
    // Fallback analysis
    const fallbackAnalysis = `검사 결과 분석:

현재 검사 결과에 따르면 ${results?.severity || '분석 중'} 수준으로 평가되었습니다.

**주요 소견:**
- 총점 ${results?.total || 0}점으로 측정되었습니다.
- 이는 Beck 우울척도 기준으로 ${results?.severity || '해당 수준'}에 해당합니다.

**권장사항:**
1. 현재 상태에 대한 정확한 평가를 위해 전문가와의 상담을 권장합니다.
2. 규칙적인 생활 패턴과 충분한 수면을 유지하세요.
3. 가벼운 운동과 사회적 활동 참여를 늘려보세요.
4. 스트레스 관리법을 익히고 실천하세요.

**주의사항:**
이 검사는 자가진단 도구로, 의학적 진단을 대체할 수 없습니다. 증상이 지속되거나 악화될 경우 반드시 전문의와 상담하시기 바랍니다.

지속적인 관심과 적절한 도움을 통해 충분히 개선될 수 있습니다.`;

    return new Response(JSON.stringify({ 
      analysis: fallbackAnalysis,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});