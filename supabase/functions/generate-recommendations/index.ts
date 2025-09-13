import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecommendationRequest {
  analysisText: string;
  ageGroup: string;
  tags: string[];
  observationText: string;
}

interface RecommendationResponse {
  ok: boolean;
  recommendations?: {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
    actionSteps: string[];
  }[];
  message?: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-RECOMMENDATIONS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, message: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    logStep('Function started');

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const requestBody: RecommendationRequest = await req.json();
    logStep('Request received', { 
      analysisLength: requestBody.analysisText?.length,
      ageGroup: requestBody.ageGroup,
      tags: requestBody.tags
    });

    const prompt = `
다음 관찰 분석 결과를 바탕으로 구체적이고 실행 가능한 권고사항을 생성해주세요:

**분석 결과:**
${requestBody.analysisText}

**기본 정보:**
- 연령대: ${requestBody.ageGroup}
- 관찰 영역: ${requestBody.tags.join(', ')}
- 관찰 내용: ${requestBody.observationText}

다음 형식으로 5개의 구체적인 권고사항을 제시해주세요:

[권고사항 1]
제목: (간단하고 실행 가능한 제목)
설명: (상세한 설명과 배경 - 관찰 내용과 연결된 구체적 근거 포함, 왜 이 방법이 도움이 되는지 전문적 설명 추가)
우선순위: high/medium/low
카테고리: 일상생활/교육활동/놀이치료/환경개선/전문상담
실행단계:
1. (구체적인 첫 번째 단계 - 준비사항 포함)
2. (구체적인 두 번째 단계 - 실행 방법 상세)
3. (구체적인 세 번째 단계 - 평가 및 개선)
4. (추가 단계가 필요한 경우)

이런 형식으로 5개의 권고사항을 작성해주세요. 각 권고사항은 부모나 보호자가 실제로 실행할 수 있는 구체적이고 현실적인 내용이어야 하며, 관찰된 내용과 직접 연결된 맞춤형 솔루션을 제공해야 합니다.
`;

    logStep('Calling OpenAI API for recommendations');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '당신은 아동발달 전문가로서 관찰 분석을 바탕으로 실용적이고 구체적인 권고사항을 제공합니다. 부모와 보호자가 실제로 실행할 수 있는 현실적인 조언을 제시해주세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const recommendationText = aiResponse.choices[0].message.content;
    
    logStep('OpenAI response received', { textLength: recommendationText.length });

    // Parse recommendations from AI response
    const recommendations = [];
    const sections = recommendationText.split(/\[권고사항 \d+\]/).filter(section => section.trim().length > 0);
    
    for (let i = 0; i < Math.min(sections.length, 5); i++) {
      const section = sections[i];
      
      const titleMatch = section.match(/제목:\s*(.+)/);
      const descMatch = section.match(/설명:\s*([\s\S]*?)(?=우선순위:|$)/);
      const priorityMatch = section.match(/우선순위:\s*(high|medium|low)/);
      const categoryMatch = section.match(/카테고리:\s*(.+)/);
      const stepsMatch = section.match(/실행단계:\s*([\s\S]*?)(?=\[|$)/);
      
      if (titleMatch && descMatch) {
        const steps = [];
        if (stepsMatch) {
          const stepText = stepsMatch[1];
          const stepMatches = stepText.match(/\d+\.\s*(.+)/g);
          if (stepMatches) {
            steps.push(...stepMatches.map(step => step.replace(/^\d+\.\s*/, '')));
          }
        }
        
        recommendations.push({
          title: titleMatch[1].trim(),
          description: descMatch[1].trim(),
          priority: (priorityMatch?.[1] || 'medium') as 'high' | 'medium' | 'low',
          category: categoryMatch?.[1]?.trim() || '일반',
          actionSteps: steps
        });
      }
    }

    const result: RecommendationResponse = {
      ok: true,
      recommendations: recommendations
    };

    logStep('Recommendations generated successfully', { 
      count: recommendations.length 
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR', { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      ok: false, 
      message: '권고사항 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});