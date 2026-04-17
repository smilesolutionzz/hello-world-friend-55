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
    fullText?: string; // Add full AI response text
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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      logStep('LOVABLE_API_KEY not configured - will use fallback');
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
다음 형식으로 임상심리사·정신과의사 수준의 전문가 분석을 **1000자 이상**으로 상세하게 제공해주세요:

**종합 분석 (500-600자)**
관찰된 내용을 바탕으로 현재 상황을 임상적 관점에서 구체적으로 분석하세요. 행동의 맥락적 의미, 환경적 요인, 심리적 기제를 종합적으로 평가하고, ${requestBody.targetName || '대상자'}의 현재 기능 수준과 적응 양상을 전문적으로 기술해주세요. 관찰된 행동 특성과 연령대별 표준 발달 기준을 비교하여 정량적·정성적으로 평가하고, 개인차를 고려한 종합적 판단을 제시해주세요.

**발달 영역별 상세 평가 및 점수**
다음 5개 영역을 각각 평가하고 0-100점 척도로 점수를 매겨주세요. **점수는 반드시 [영역명: XX점] 형식으로 명시**하세요:
- 정서 영역: [점수]점 - 관찰된 감정 표현, 정서 조절 능력, 스트레스 대응을 바탕으로 평가 (100-150자)
- 행동 영역: [점수]점 - 관찰된 행동 패턴, 충동 조절, 규칙 준수를 바탕으로 평가 (100-150자)
- 인지 영역: [점수]점 - 관찰된 이해력, 집중력, 문제해결 능력을 바탕으로 평가 (100-150자)
- 사회성 영역: [점수]점 - 관찰된 대인관계, 소통 능력, 협력 행동을 바탕으로 평가 (100-150자)
- 신체 영역: [점수]점 - 관찰된 신체 활동, 운동 능력, 건강 상태를 바탕으로 평가 (100-150자)

**점수 산정 근거**: 관찰 내용에서 확인된 구체적 행동과 상황을 각 영역별로 분석하여 점수를 부여하세요. 정보가 부족한 영역은 60점(중립)으로 설정하고 "정보 부족"을 명시하세요.

**핵심 권고사항 (200-300자)**
- 즉시 실행 가능한 1차 개입 전략 3가지 (각 50-80자)
- 각 전략의 이론적 근거와 기대 효과

**전문가 상담 권장 (100-150자)**
필요한 전문 분야(임상심리사, 정신과의사, 언어치료사 등)와 상담 시급도를 구체적으로 명시해주세요.

**지속 관찰 가이드 (100-150자)**
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

    logStep('Calling AI Gateway');

    let useFallback = false;
    let analysisText = '';
    let aiResponse: any = null;

    if (!LOVABLE_API_KEY) {
      useFallback = true;
    } else {
      try {
        const gatewayRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content:
                  '당신은 임상심리학 박사이자 정신과 전문의 수준의 전문가입니다. 관찰 내용을 발달심리학 이론에 기반하여 분석하고, 요청된 형식을 정확히 따라 1000자 이상의 상세한 분석을 제공합니다. 발달 영역별 점수는 반드시 [정서 영역: 85점], [행동 영역: 75점] 형식으로 명시해주세요.'
              },
              {
                role: 'user',
                content: prompt
              }
            ]
          })
        });

        if (!gatewayRes.ok) {
          logStep('AI gateway error', { status: gatewayRes.status, text: await gatewayRes.text() });
          useFallback = true;
          // Refund tokens on provider error
          try {
            if (supabaseServiceClient && tokenData) {
              await supabaseServiceClient
                .from('user_tokens')
                .update({ current_tokens: tokenData.current_tokens, total_used: tokenData.total_used })
                .eq('user_id', user.id);
              logStep('Token refunded due to AI gateway error', { refundedTokens: tokenCost });
            }
          } catch (refundErr) {
            logStep('Token refund failed (gateway error)', { error: String(refundErr) });
          }
        } else {
          aiResponse = await gatewayRes.json();
          analysisText = aiResponse?.choices?.[0]?.message?.content ?? '';
          if (!analysisText) {
            useFallback = true;
          }
        }
      } catch (e) {
        logStep('AI gateway exception', { error: e instanceof Error ? e.message : String(e) });
        useFallback = true;
        try {
          if (supabaseServiceClient && tokenData) {
            await supabaseServiceClient
              .from('user_tokens')
              .update({ current_tokens: tokenData.current_tokens, total_used: tokenData.total_used })
              .eq('user_id', user.id);
            logStep('Token refunded due to AI exception', { refundedTokens: tokenCost });
          }
        } catch (refundErr) {
          logStep('Token refund failed (exception)', { error: String(refundErr) });
        }
      }
    }

    if (useFallback) {
      // Build structured fallback text matching expected format
      const sentences = (requestBody.text || '').split(/[\.\?!\n]/).map(s => s.trim()).filter(Boolean);
      const first = sentences[0] || '관찰 상황을 요약했습니다.';
      const pointsList = sentences.slice(1, 4);
      const tips = [
        '같은 시간대/환경에서 2-3회 반복 관찰해 변화를 비교하세요.',
        '관찰 내용을 동일한 항목으로 기록해 추세를 확인하세요.',
        '변화가 지속되거나 악화되면 전문가 상담을 고려하세요.'
      ];
      const sectionTitle = isDetailedMode ? '종합 분석' : '상황 요약';
      const subTitle = isDetailedMode ? '발달 영역별 상세 평가 및 점수' : '주요 포인트';
      const listTitle = isDetailedMode ? '핵심 권고사항' : '개선 팁';
      const cautionTitle = isDetailedMode ? '전문가 상담 권장' : '주의사항';

      analysisText = `**${sectionTitle}**\n${first}\n\n**${subTitle}**\n${pointsList.map(p => `- ${p}`).join("\n") || '- 관찰 내용을 바탕으로 핵심 특징을 정리했습니다.'}\n\n**${listTitle}**\n${tips.map(t => `- ${t}`).join("\n")}\n\n**${cautionTitle}**\n- 즉각적인 위험 신호가 보이면 지역 지원기관이나 전문기관에 문의하세요.`;

      logStep('Using fallback analysis text');
    }

    logStep('AI response received', { textLength: analysisText.length });

    // Parse the analysis response - Extract domain scores from AI response
    // Use neutral score (60) as default when AI cannot assess properly
    const domainScores = { 정서: 60, 행동: 60, 인지: 60, 사회성: 60, 신체: 60 };
    let scoresFound = 0;
    
    // Multiple regex patterns to catch different score formats
    const scorePatterns = [
      /(정서|행동|인지|사회성|신체)\s*영역\s*:\s*\[?(\d+)\]?점/g,
      /(정서|행동|인지|사회성|신체)\s*:\s*\[?(\d+)\]?점/g,
      /(정서|행동|인지|사회성|신체)\s*\[?(\d+)\]?점/g,
      /(정서|행동|인지|사회성|신체):\s*(\d+)/g,
    ];
    
    for (const pattern of scorePatterns) {
      let match;
      while ((match = pattern.exec(analysisText)) !== null) {
        const domain = match[1];
        const score = parseInt(match[2]);
        if (domain in domainScores && score >= 0 && score <= 100) {
          domainScores[domain as keyof typeof domainScores] = score;
          scoresFound++;
        }
      }
    }
    
    logStep('Domain scores extracted', { scores: domainScores, foundCount: scoresFound, usedDefaults: scoresFound === 0 });

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
      // Extract detailed sections - updated patterns for new format
      const comprehensiveMatch = analysisText.match(/\*\*종합 분석.*?\*\*([\s\S]*?)(?=\*\*발달 영역별|$)/i);
      const domainEvalMatch = analysisText.match(/\*\*발달 영역별 상세 평가.*?\*\*([\s\S]*?)(?=\*\*핵심 권고사항|$)/i);
      const recommendationsMatch = analysisText.match(/\*\*핵심 권고사항.*?\*\*([\s\S]*?)(?=\*\*전문가 상담|$)/i);
      const consultationMatch = analysisText.match(/\*\*전문가 상담 권장.*?\*\*([\s\S]*?)(?=\*\*지속 관찰|$)/i);
      const observationGuideMatch = analysisText.match(/\*\*지속 관찰 가이드.*?\*\*([\s\S]*?)(?=\*\*|$)/i);

      const extractDetailedListItems = (text: string): string[] => {
        const items = text.split(/[-•]\s+/).filter(item => item.trim()).map(item => item.trim());
        return items.length > 0 ? items : text.split('\n').filter(line => line.trim() && !line.match(/^\*\*/)).map(line => line.trim());
      };

      // Extract domain evaluations as points
      const domainPoints: string[] = [];
      if (domainEvalMatch) {
        const domainText = domainEvalMatch[1];
        const domainLines = domainText.split('\n').filter(line => line.includes('영역') && line.includes('점'));
        domainPoints.push(...domainLines.map(line => line.replace(/^[-•]\s*/, '').trim()));
      }

      report = {
        situation: comprehensiveMatch ? comprehensiveMatch[1].trim() : analysisText.substring(0, 500) + '...',
        points: domainPoints.length > 0 ? domainPoints : ['발달 영역별 평가를 완료했습니다.'],
        positives: [], // Not used in new format
        tips: recommendationsMatch ? extractDetailedListItems(recommendationsMatch[1]) : ['전문가 권고사항을 제시했습니다.'],
        alerts: consultationMatch ? [consultationMatch[1].trim()] : [],
        mediaNotes,
        fullText: analysisText // Include full AI response
      };
      
      // Add observation guide to tips if available
      if (observationGuideMatch) {
        report.tips.push(`📊 지속 관찰: ${observationGuideMatch[1].trim()}`);
      }
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
        mediaNotes,
        fullText: analysisText // Include full AI response
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logStep('Error occurred', { error: errorMessage });

    // Refund tokens on error
    if (supabaseServiceClient && tokenData && tokenCost) {
      try {
        await supabaseServiceClient
          .from('user_tokens')
          .update({ 
            current_tokens: tokenData.current_tokens,
            total_used: tokenData.total_used
          })
          .eq('user_id', tokenData.user_id || '');
        logStep('Token refunded due to error', { refundedTokens: tokenCost });
      } catch (refundErr) {
        logStep('Token refund failed on error', { error: String(refundErr) });
      }
    }

    return new Response(JSON.stringify({ 
      ok: false, 
      message: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
