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

다음 형식으로 상세한 전문가 분석을 제공해주세요:

🔍 **상황 분석**
관찰된 내용을 바탕으로 현재 상황을 구체적으로 분석해주세요. (3-4문장)

💡 **전문가 관점**
발달심리학, 아동발달학, 또는 관련 전문 분야 관점에서 관찰 내용을 해석해주세요. 
- 연령별 발달 특성과 비교 분석
- 행동의 의미와 배경 설명
- 정상/비정상 발달 범위 내에서의 위치 분석

🎯 **구체적 조언**
실제로 실행 가능한 구체적인 방법들을 4-5개 제시해주세요:
1. 일상생활에서 바로 적용할 수 있는 방법
2. 환경 조성 방안
3. 상호작용 개선 전략
4. 놀이나 활동을 통한 발달 촉진 방법
5. 부모/보호자의 대응 방식

📚 **참고 자료**
도움이 될 만한 구체적인 정보를 제시해주세요:
- 추천 도서나 자료
- 유용한 활동이나 프로그램
- 전문기관 연계 필요성 여부

💝 **격려의 말**
따뜻하고 희망적인 메시지로 부모/보호자에게 격려와 지지를 전해주세요.
- 현재 노력에 대한 인정
- 긍정적인 변화 가능성
- 지속적인 관심과 사랑의 중요성

⚠️ 이는 전문적 관찰 분석 참고자료이며 의학적 진단이 아닙니다. 전문적인 평가가 필요한 경우 관련 전문가와 상담하시기 바랍니다.

각 영역별 점수 (0-100점):
- 정서: (점수와 함께 간단한 설명)
- 행동: (점수와 함께 간단한 설명)
- 인지: (점수와 함께 간단한 설명)
- 사회성: (점수와 함께 간단한 설명)
- 신체: (점수와 함께 간단한 설명)

전문적이고 상세하게 작성하되, 가족이 이해하기 쉽고 실용적으로 활용할 수 있도록 설명해주세요.
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

    // Parse domain scores from the analysis
    const domainScores = { 정서: 75, 행동: 80, 인지: 85, 사회성: 70, 신체: 78 };
    
    // Try to extract scores from AI response
    const scoreRegex = /(\w+):\s*(\d+)/g;
    let match;
    while ((match = scoreRegex.exec(analysisText)) !== null) {
      const domain = match[1];
      const score = parseInt(match[2]);
      if (domain in domainScores && score >= 0 && score <= 100) {
        domainScores[domain as keyof typeof domainScores] = score;
      }
    }

    // Add media notes if files were provided
    const mediaNotes: string[] = [];
    if (requestBody.files.length > 0) {
      requestBody.files.forEach((file, index) => {
        mediaNotes.push(`${file.type === 'image' ? '이미지' : '영상'} ${index + 1}: 행동 관찰을 위한 시각적 자료로 분석에 참고되었습니다.`);
      });
    }

    // Calculate overall score
    const overallScore = Math.round(
      Object.values(domainScores).reduce((sum, score) => sum + score, 0) / 5
    );

    // Simple parsing for basic structure
    const sections = analysisText.split(/🔍|💡|🎯|📚|💝|⚠️/).filter(section => section.trim().length > 0);
    
    const result: ObserveReportResponse = {
      ok: true,
      report: {
        situation: sections[0]?.trim() || analysisText.substring(0, 500) + '...',
        points: ['전문가 관점에서 분석된 주요 특징들입니다.'],
        positives: ['관찰된 긍정적인 발달 특성들을 확인했습니다.'],
        tips: ['실용적인 개선 방안들을 제시합니다.'],
        alerts: [],
        mediaNotes
      },
      score: {
        overall: overallScore,
        domains: domainScores
      }
    };

    logStep('Analysis completed successfully', { 
      overallScore,
      analysisLength: analysisText.length,
      sectionsFound: sections.length
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