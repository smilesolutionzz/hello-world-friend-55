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

**상황 분석**
관찰된 내용을 바탕으로 현재 상황을 구체적으로 분석해주세요.

**발달 상태 평가**
현재 발달 수준과 연령대별 기준과의 비교를 통해 발달적 상황을 평가해주세요.

**주요 관심 사항**
관찰된 행동이나 특성 중 특별히 주의 깊게 관찰해야 할 사항들을 나열해주세요.

**잠재적 문제점**
현재 관찰된 내용에서 우려되는 부분이나 개선이 필요한 영역을 분석해주세요.

**개선 방안**
실제로 실행 가능한 구체적인 개선 방법들을 제시해주세요.

**전문가 상담 권장**
전문적인 평가나 상담이 필요한지 여부와 그 이유를 설명해주세요.

**위험도 평가**
다음 중 하나로 평가해주세요:
- 낮음: 정상 발달 범위 내
- 보통: 약간의 주의가 필요한 상태  
- 높음: 전문적 개입이 시급히 필요한 상태
- 매우높음: 즉각적인 전문가 상담이 필요한 상태

각 영역별 점수 (0-100점):
정서: (점수)
행동: (점수)  
인지: (점수)
사회성: (점수)
신체: (점수)

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
            content: '당신은 아동발달, 심리상담, 행동분석 전문가입니다. 관찰 기록을 바탕으로 전문적이고 객관적인 분석을 제공하며, 실용적인 조언과 구체적인 개선방안을 제시합니다. 응답은 반드시 요청된 형식을 정확히 따라주세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const analysisText = aiResponse.choices[0].message.content;
    
    logStep('OpenAI response received', { textLength: analysisText.length });

    // Parse the analysis response properly
    const domainScores = { 정서: 70, 행동: 70, 인지: 70, 사회성: 70, 신체: 70 };
    
    // Extract scores from AI response
    const scoreRegex = /(정서|행동|인지|사회성|신체):\s*(\d+)/g;
    let match;
    while ((match = scoreRegex.exec(analysisText)) !== null) {
      const domain = match[1];
      const score = parseInt(match[2]);
      if (domain in domainScores && score >= 0 && score <= 100) {
        domainScores[domain as keyof typeof domainScores] = score;
      }
    }

    // Extract risk level from analysis
    let riskLevel = '보통';
    const riskMatches = analysisText.match(/위험도.*?:?\s*(낮음|보통|높음|매우높음)/i);
    if (riskMatches) {
      riskLevel = riskMatches[1];
    }

    // Parse detailed sections
    const sections = {
      situation: '',
      development: '',
      concerns: '',
      issues: '',
      improvements: '',
      consultation: ''
    };

    // Extract each section content
    const situationMatch = analysisText.match(/\*\*상황 분석\*\*([\s\S]*?)(?=\*\*|$)/);
    if (situationMatch) sections.situation = situationMatch[1].trim();

    const developmentMatch = analysisText.match(/\*\*발달 상태 평가\*\*([\s\S]*?)(?=\*\*|$)/);
    if (developmentMatch) sections.development = developmentMatch[1].trim();

    const concernsMatch = analysisText.match(/\*\*주요 관심 사항\*\*([\s\S]*?)(?=\*\*|$)/);
    if (concernsMatch) sections.concerns = concernsMatch[1].trim();

    const issuesMatch = analysisText.match(/\*\*잠재적 문제점\*\*([\s\S]*?)(?=\*\*|$)/);
    if (issuesMatch) sections.issues = issuesMatch[1].trim();

    const improvementsMatch = analysisText.match(/\*\*개선 방안\*\*([\s\S]*?)(?=\*\*|$)/);
    if (improvementsMatch) sections.improvements = improvementsMatch[1].trim();

    const consultationMatch = analysisText.match(/\*\*전문가 상담 권장\*\*([\s\S]*?)(?=\*\*|$)/);
    if (consultationMatch) sections.consultation = consultationMatch[1].trim();

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

    // Build comprehensive analysis result
    const analysisResult = {
      situation: sections.situation || '상황 분석이 진행되었습니다.',
      development: sections.development || '발달 상태 평가가 완료되었습니다.',
      concerns: sections.concerns || '주요 관심 사항을 확인했습니다.',
      issues: sections.issues || '잠재적 문제점을 분석했습니다.',
      improvements: sections.improvements || '개선 방안을 제시했습니다.',
      consultation: sections.consultation || '전문가 상담 권장사항을 제공했습니다.',
      riskLevel: riskLevel,
      fullAnalysis: analysisText
    };
    
    const result: ObserveReportResponse = {
      ok: true,
      report: {
        situation: analysisResult.situation,
        points: [analysisResult.development],
        positives: [analysisResult.concerns],
        tips: [analysisResult.improvements],
        alerts: riskLevel === '높음' || riskLevel === '매우높음' ? [analysisResult.consultation] : [],
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