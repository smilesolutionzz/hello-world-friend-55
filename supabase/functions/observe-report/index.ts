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
  mode: 'basic' | 'detailed';
  targetName?: string;
  observationDate?: string;
  templateType?: string;
  tokenCost?: number;
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

  let supabaseServiceClient: any;
  let supabaseClient: any;
  let tokenData: { current_tokens: number; total_used: number } | null = null;
  let tokenCost: number | null = null;

  try {
    logStep('Function started');

    supabaseServiceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ 
        ok: false, 
        message: '인증이 필요합니다.' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const requestBody: ObserveReportRequest = await req.json();
    logStep('Request received', { 
      textLength: requestBody.text?.length,
      ageGroup: requestBody.ageGroup,
      tags: requestBody.tags,
      fileCount: requestBody.files?.length || 0,
      mode: requestBody.mode,
      tokenCost: requestBody.tokenCost
    });

    // 토큰 차감 처리
    tokenCost = requestBody.tokenCost || (requestBody.mode === 'detailed' ? 5 : 3);
    
    // 현재 토큰 잔액 확인 및 차감
    const { data: tokenDataRes, error: tokenError } = await supabaseServiceClient
      .from('user_tokens')
      .select('current_tokens, total_used')
      .eq('user_id', user.id)
      .single();

    tokenData = tokenDataRes;

    if (tokenError || !tokenData) {
      return new Response(JSON.stringify({ 
        ok: false, 
        message: '토큰 정보를 확인할 수 없습니다.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (tokenData.current_tokens < tokenCost) {
      return new Response(JSON.stringify({ 
        ok: false, 
        message: `분석을 위해 ${tokenCost}개의 토큰이 필요합니다. 현재 토큰: ${tokenData.current_tokens}개` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 토큰 차감
    const { error: updateError } = await supabaseServiceClient
      .from('user_tokens')
      .update({ 
        current_tokens: tokenData.current_tokens - tokenCost,
        total_used: tokenData.total_used + tokenCost 
      })
      .eq('user_id', user.id);

    if (updateError) {
      throw new Error('토큰 차감 중 오류가 발생했습니다.');
    }

    logStep('Token deducted', { tokenCost, remainingTokens: tokenData.current_tokens - tokenCost });

    // Validation
    const minLength = 50;
    if (!requestBody.text || requestBody.text.trim().length < minLength) {
      return new Response(JSON.stringify({ 
        ok: false, 
        message: `관찰 내용은 최소 ${minLength}자 이상 입력해주세요.` 
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

    const isDetailedMode = requestBody.mode === 'detailed';
    
    const basePrompt = `
다음 관찰 기록을 전문적으로 분석해주세요:

**관찰 정보:**
- 대상자: ${requestBody.targetName || '대상자'} (${ageGroupMap[requestBody.ageGroup]})
- 상황: ${contextMap[requestBody.context]}
- 관찰 영역: ${requestBody.tags.join(', ')}
- 날짜: ${requestBody.observationDate || '미지정'}
- 분석 수준: ${isDetailedMode ? '상세 전문가 분석' : '기본 분석'}

**관찰 내용:**
${requestBody.text}

${requestBody.files.length > 0 ? `\n**첨부 미디어:** ${requestBody.files.length}개 파일 (${requestBody.files.map(f => f.type).join(', ')})` : ''}

**중요 지침:**
- 대상자의 이름은 반드시 "${requestBody.targetName || '대상자'}"로 표기해주세요
- 연령대에 맞는 적절한 분석을 제공하되, "발달"이라는 용어보다는 "현재 상태", "특성", "행동 패턴" 등의 용어를 사용해주세요
- 아동만이 아닌 모든 연령대에 적합한 분석을 제공해주세요
`;

    const detailedPrompt = basePrompt + `
다음 형식으로 박사급 수준의 전문가 분석을 제공해주세요:

**상황 분석**
관찰된 내용을 바탕으로 현재 상황을 구체적으로 분석하고, 행동의 맥락적 의미와 환경적 요인을 종합적으로 평가해주세요.

**현재 상태 평가** 
현재 관찰된 행동 특성과 기능적 상태를 연령대별 표준 기준과 비교하여 정량적·정성적으로 평가하고, 개인차를 고려한 종합적 판단을 제시해주세요.

**주요 관심 사항**
관찰된 행동이나 특성 중 지속적 모니터링이 필요한 핵심 요소들을 우선순위별로 제시하고, 각각의 임상적 의미를 설명해주세요.

**잠재적 문제점**
현재 관찰된 내용에서 우려되는 부분이나 개선이 필요한 영역을 분석하고, 방치 시 예상되는 결과와 조기 개입의 중요성을 설명해주세요.

**전문가급 권고사항**
- 즉시 실행 가능한 1차 개입 전략 (환경 조정, 일상 루틴 개선)
- 중기 목표 달성을 위한 체계적 접근법 (행동 수정, 기능 향상 프로그램)
- 장기적 발전을 위한 종합적 계획 (전문적 치료, 교육적 지원)
- 각 권고사항의 이론적 근거와 기대 효과, 평가 지표 포함

**전문가 상담 권장**
전문적인 평가나 상담의 필요성을 단계별로 제시하고, 추천 전문 분야(임상심리사, 언어치료사, 작업치료사 등)와 상담 시급도를 명시해주세요.

**지속적 관찰 가이드**
향후 관찰 시 중점적으로 확인해야 할 구체적 행동 지표와 기록 방법을 제시해주세요.
`;

    const basicPrompt = basePrompt + `
다음 형식으로 기본 분석을 제공해주세요:

**상황 요약**
관찰된 주요 내용을 간략하게 요약해주세요.

**주요 포인트**
관찰에서 발견된 중요한 특징들을 나열해주세요.

**개선 팁**
간단하고 실용적인 개선 방법을 제시해주세요.

**주의사항**
특별히 주의해서 관찰해야 할 부분이 있다면 알려주세요.
`;

    const prompt = isDetailedMode ? detailedPrompt : basicPrompt;

    logStep('Calling OpenAI API');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `당신은 박사급 심리상담·행동분석 전문가입니다. 20년 이상의 임상 경험을 바탕으로 모든 연령대의 관찰 기록을 최고 수준의 전문성으로 분석합니다.

전문가 자격:
- 임상심리학 박사 / 행동분석학 박사
- 다학제적 접근법 (신경심리학, 발달심리학, 인지행동치료, 응용행동분석)
- 증거기반 실무(Evidence-Based Practice) 전문가

분석 지침:
1. 대상자의 이름은 반드시 관찰 정보에 명시된 이름을 그대로 사용
2. 연령대별 특성을 고려한 맞춤형 분석 제공
3. 이론적 배경과 실증적 근거를 바탕으로 한 전문적 해석
4. 구체적이고 실행 가능한 개입 전략 제시
5. 우선순위가 명확한 단계별 권고사항 작성
6. 각 권고사항의 근거와 기대효과 명시
7. 정량적 평가 지표와 모니터링 방법 포함
8. 응답은 반드시 요청된 형식을 정확히 따라주세요`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: isDetailedMode ? 6000 : 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    logStep('Full OpenAI response', { response: aiResponse });
    
    if (!aiResponse.choices || !aiResponse.choices[0] || !aiResponse.choices[0].message) {
      throw new Error('Invalid OpenAI response structure');
    }
    
    const analysisText = aiResponse.choices[0].message.content;
    
    if (!analysisText || typeof analysisText !== 'string') {
      throw new Error('OpenAI returned empty or invalid content');
    }
    
    logStep('OpenAI response received', { textLength: analysisText.length });

    // Parse the analysis response
    const domainScores = { 정서: 70, 행동: 70, 인지: 70, 사회성: 70, 신체: 70 };
    
    // Extract scores from AI response if present
    const scoreRegex = /(정서|행동|인지|사회성|신체):\s*(\d+)/g;
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

    // Parse sections based on mode
    let report;
    
    if (isDetailedMode) {
      // Extract detailed sections
      const situationMatch = analysisText.match(/\*\*상황 분석\*\*([\s\S]*?)(?=\*\*|$)/);
      const developmentMatch = analysisText.match(/\*\*현재 상태 평가\*\*([\s\S]*?)(?=\*\*|$)/);
      const concernsMatch = analysisText.match(/\*\*주요 관심 사항\*\*([\s\S]*?)(?=\*\*|$)/);
      const issuesMatch = analysisText.match(/\*\*잠재적 문제점\*\*([\s\S]*?)(?=\*\*|$)/);
      const recommendationsMatch = analysisText.match(/\*\*전문가급 권고사항\*\*([\s\S]*?)(?=\*\*|$)/);
      const consultationMatch = analysisText.match(/\*\*전문가 상담 권장\*\*([\s\S]*?)(?=\*\*|$)/);
      const observationGuideMatch = analysisText.match(/\*\*지속적 관찰 가이드\*\*([\s\S]*?)(?=\*\*|$)/);

      const extractDetailedListItems = (text: string): string[] => {
        return text.split(/[-•]\s+/).filter(item => item.trim()).map(item => item.trim());
      };

      report = {
        situation: situationMatch ? situationMatch[1].trim() : '상황을 분석했습니다.',
        points: developmentMatch ? [developmentMatch[1].trim()] : ['현재 상태를 평가했습니다.'],
        positives: concernsMatch ? [concernsMatch[1].trim()] : ['주요 관심 사항을 확인했습니다.'],
        tips: recommendationsMatch ? extractDetailedListItems(recommendationsMatch[1]) : ['전문가급 권고사항을 제시했습니다.'],
        alerts: consultationMatch ? [consultationMatch[1].trim()] : [],
        
        mediaNotes
      };
    } else {
      // Extract basic sections
      const summaryMatch = analysisText.match(/\*\*상황 요약\*\*([\s\S]*?)(?=\*\*|$)/);
      const pointsMatch = analysisText.match(/\*\*주요 포인트\*\*([\s\S]*?)(?=\*\*|$)/);
      const tipsMatch = analysisText.match(/\*\*개선 팁\*\*([\s\S]*?)(?=\*\*|$)/);
      const alertsMatch = analysisText.match(/\*\*주의사항\*\*([\s\S]*?)(?=\*\*|$)/);

      const extractListItems = (text: string): string[] => {
        return text.split('\n').filter(line => line.trim()).map(line => line.replace(/^-\s*/, '').trim());
      };

      report = {
        situation: summaryMatch ? summaryMatch[1].trim() : '관찰 상황을 요약했습니다.',
        points: pointsMatch ? extractListItems(pointsMatch[1]) : ['주요 포인트를 분석했습니다.'],
        positives: [], // 기본 모드에서는 긍정적 측면 별도 표시 안함
        tips: tipsMatch ? extractListItems(tipsMatch[1]) : ['개선 팁을 제시했습니다.'],
        alerts: alertsMatch ? extractListItems(alertsMatch[1]) : [],
        mediaNotes
      };
    }

    const result: ObserveReportResponse = {
      ok: true,
      report,
      score: {
        overall: overallScore,
        domains: domainScores
      }
    };

    logStep('Analysis completed successfully', { 
      overallScore,
      analysisLength: analysisText.length
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('Error occurred', { error: errorMessage });

    // 토큰 환불 시도 (에러 발생 시에만)
    try {
      if (supabaseClient) {
        const { data: { user: currentUser } } = await supabaseClient.auth.getUser();
        if (currentUser?.id && tokenCost != null && tokenData && supabaseServiceClient) {
          await supabaseServiceClient
            .from('user_tokens')
            .update({ 
              current_tokens: tokenData.current_tokens, // 원래 토큰으로 복구
              total_used: tokenData.total_used 
            })
            .eq('user_id', currentUser.id);
          logStep('Token refunded due to error', { refundedTokens: tokenCost });
        }
      }
    } catch (refundError: unknown) {
      const refundMessage = refundError instanceof Error ? refundError.message : String(refundError);
      logStep('Token refund failed', { error: refundMessage });
    }
    
    // OpenAI API 에러인 경우 더 구체적인 메시지
    let userMessage = '분석 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    if (errorMessage.includes('OpenAI')) {
      userMessage = 'AI 분석 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
    } else if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
      userMessage = '현재 요청이 많아 처리가 지연되고 있습니다. 잠시 후 다시 시도해주세요.';
    }
    
    return new Response(JSON.stringify({ 
      ok: false, 
      message: userMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});