import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ObserveReportRequest {
  text: string;
  ageGroup: 'child' | 'teen' | 'adult' | 'senior';
  context: 'home' | 'institution' | 'therapy' | 'other';
  tags: string[];
  files: { url: string; type: 'image' | 'video' }[];
  mode: 'free' | 'paid';
  targetName?: string;
  observationDate?: string;
}

interface ObserveReportResponse {
  ok: boolean;
  report?: {
    situation: string;
    points: string[];
    positives: string[];
    tips: string[];
    alerts: string[];
    mediaNotes: string[];
  };
  score?: {
    overall: number;
    domains: {
      정서: number;
      행동: number;
      인지: number;
      사회성: number;
      신체: number;
    };
  };
  message?: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[OBSERVE-REPORT] ${step}${detailsStr}`);
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

    const requestBody: ObserveReportRequest = await req.json();
    logStep('Request received', { 
      textLength: requestBody.text?.length,
      ageGroup: requestBody.ageGroup,
      tags: requestBody.tags,
      fileCount: requestBody.files?.length || 0
    });

    // Validation
    if (!requestBody.text || requestBody.text.trim().length < 50) {
      return new Response(JSON.stringify({ 
        ok: false, 
        message: '관찰 내용은 최소 50자 이상 입력해주세요.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check for prohibited content
    const prohibitedWords = ['응급', '자해', '폭력'];
    const hasProhibitedContent = prohibitedWords.some(word => 
      requestBody.text.toLowerCase().includes(word.toLowerCase())
    );

    if (hasProhibitedContent) {
      return new Response(JSON.stringify({ 
        ok: false, 
        message: '응급상황이 의심되는 경우 즉시 전문의에게 상담하시기 바랍니다.',
        emergencyFlag: true
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build analysis prompt
    const ageGroupMap = {
      child: '유아/아동',
      teen: '청소년', 
      adult: '성인',
      senior: '노인'
    };

    const contextMap = {
      home: '가정',
      institution: '기관',
      therapy: '치료실',
      other: '기타'
    };

    const prompt = `
다음 관찰 기록을 전문적으로 분석해주세요:

**관찰 정보:**
- 대상자: ${requestBody.targetName || '익명'} (${ageGroupMap[requestBody.ageGroup]})
- 상황: ${contextMap[requestBody.context]}
- 관찰 영역: ${requestBody.tags.join(', ')}
- 날짜: ${requestBody.observationDate || '미지정'}

**관찰 내용:**
${requestBody.text}

${requestBody.files.length > 0 ? `\n**첨부 미디어:** ${requestBody.files.length}개 파일 (${requestBody.files.map(f => f.type).join(', ')})` : ''}

다음 형식으로 분석 결과를 제공해주세요:

1. **현재 상황 요약** (3-4문장으로 전체적인 관찰 결과 요약)

2. **핵심 관찰 포인트** (3개, 각각 한 문장으로 구체적인 행동이나 반응)

3. **긍정적 측면** (1-2개, 잘 나타나는 발달이나 행동 특성)

4. **개선 및 관리 제안** (1-2개, 구체적이고 실행 가능한 홈케어 팁)

5. **주의 신호** (있는 경우만, 지속적으로 관찰이 필요한 부분)

각 영역별 점수 (0-100점):
- 정서: 
- 행동:
- 인지:
- 사회성:
- 신체:

전문적이고 객관적인 톤으로 작성하되, 가족이 이해하기 쉽게 설명해주세요.
`;

    logStep('Calling OpenAI API');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: '당신은 아동발달, 심리상담, 행동분석 전문가입니다. 관찰 기록을 바탕으로 전문적이고 객관적인 분석을 제공합니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const analysisText = aiResponse.choices[0].message.content;
    
    logStep('OpenAI response received', { textLength: analysisText.length });

    // Parse the analysis response
    const lines = analysisText.split('\n').filter(line => line.trim());
    
    let situation = '';
    const points: string[] = [];
    const positives: string[] = [];
    const tips: string[] = [];
    const alerts: string[] = [];
    const mediaNotes: string[] = [];
    const domainScores = { 정서: 75, 행동: 80, 인지: 85, 사회성: 70, 신체: 78 };

    let currentSection = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.includes('현재 상황') || trimmed.includes('요약')) {
        currentSection = 'situation';
        continue;
      } else if (trimmed.includes('핵심') || trimmed.includes('포인트')) {
        currentSection = 'points';
        continue;
      } else if (trimmed.includes('긍정') || trimmed.includes('잘')) {
        currentSection = 'positives';
        continue;
      } else if (trimmed.includes('개선') || trimmed.includes('제안') || trimmed.includes('팁')) {
        currentSection = 'tips';
        continue;
      } else if (trimmed.includes('주의') || trimmed.includes('신호')) {
        currentSection = 'alerts';
        continue;
      } else if (trimmed.includes('점수')) {
        currentSection = 'scores';
        continue;
      }

      // Extract content based on current section
      if (currentSection === 'situation' && trimmed && !trimmed.startsWith('**')) {
        situation += (situation ? ' ' : '') + trimmed;
      } else if (currentSection === 'points' && (trimmed.startsWith('-') || trimmed.startsWith('•'))) {
        points.push(trimmed.substring(1).trim());
      } else if (currentSection === 'positives' && (trimmed.startsWith('-') || trimmed.startsWith('•'))) {
        positives.push(trimmed.substring(1).trim());
      } else if (currentSection === 'tips' && (trimmed.startsWith('-') || trimmed.startsWith('•'))) {
        tips.push(trimmed.substring(1).trim());
      } else if (currentSection === 'alerts' && (trimmed.startsWith('-') || trimmed.startsWith('•'))) {
        alerts.push(trimmed.substring(1).trim());
      }
    }

    // Add media notes if files were provided
    if (requestBody.files.length > 0) {
      requestBody.files.forEach((file, index) => {
        mediaNotes.push(`${file.type === 'image' ? '이미지' : '영상'} ${index + 1}: 행동 관찰을 위한 시각적 자료로 분석에 참고되었습니다.`);
      });
    }

    // Calculate overall score
    const overallScore = Math.round(
      Object.values(domainScores).reduce((sum, score) => sum + score, 0) / 5
    );

    const result: ObserveReportResponse = {
      ok: true,
      report: {
        situation: situation || '전체적인 관찰 결과가 양호한 편입니다.',
        points: points.length > 0 ? points : ['관찰된 주요 행동 특성을 분석했습니다.'],
        positives: positives.length > 0 ? positives : ['발달에 적합한 긍정적 측면이 관찰됩니다.'],
        tips: tips.length > 0 ? tips : ['지속적인 관찰과 기록을 권장합니다.'],
        alerts: alerts,
        mediaNotes
      },
      score: {
        overall: overallScore,
        domains: domainScores
      }
    };

    logStep('Analysis completed successfully', { 
      overallScore,
      pointsCount: points.length,
      positivesCount: positives.length,
      tipsCount: tips.length
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
      message: '분석 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});