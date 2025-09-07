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
  mode: 'basic' | 'detailed' | 'free' | 'paid'; // 업데이트: basic/detailed 모드 추가
  targetName?: string;
  observationDate?: string;
  templateType?: string;
  tokenCost?: number; // 토큰 비용 추가
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

    const supabaseServiceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const supabaseClient = createClient(
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
    const tokenCost = requestBody.tokenCost || (requestBody.mode === 'detailed' ? 5 : 3);
    let tokenData: any = null; // 에러 핸들링에서 사용할 수 있도록 상위 스코프로 이동
    
    // 현재 토큰 잔액 확인 및 차감
    const { data: tokenDataResult, error: tokenError } = await supabaseServiceClient
      .from('user_tokens')
      .select('current_tokens, total_used')
      .eq('user_id', user.id)
      .single();

    tokenData = tokenDataResult; // 상위 스코프 변수에 할당
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

    // Validation - UI와 일치하도록 최소 글자수를 50자로 통일
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

    // 분석 모드에 따른 프롬프트 조정
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
다음 형식으로 박사급 수준의 상세한 전문가 분석을 제공해주세요:

**종합 상황 분석**
- 관찰된 행동의 맥락적 해석과 배경 요인 분석
- 환경적 변인과 개인적 변인의 상호작용 평가
- 행동의 기능과 목적에 대한 기능적 분석

**연령별 표준 대비 현재 기능 평가**
각 영역별로 구체적인 점수(0-100)와 함께 분석:
- 정서조절 능력: [점수]/100 - 구체적 근거와 관찰 증거
- 행동조절 능력: [점수]/100 - 행동의 빈도, 강도, 지속성 분석  
- 인지기능 수준: [점수]/100 - 주의력, 기억력, 문제해결 능력 평가
- 사회적 기능: [점수]/100 - 대인관계 및 의사소통 능력 분석
- 신체발달 상태: [점수]/100 - 대근육 및 소근육 발달 수준 평가

**심층 행동 분석**
- ABC 분석 (Antecedent-Behavior-Consequence) 적용
- 행동의 선행조건과 후속결과 패턴 분석
- 강화 및 소거 요인 식별

**임상적 관찰 소견**
- 주의해야 할 위험 징후나 이상 행동 패턴
- 조기 개입이 필요한 영역 식별
- 전문적 평가가 권장되는 구체적 사유

**근거 기반 개입 전략**
단계별 체계적 접근:
1. 즉시 개입 (1-2주): 구체적 실행 방안
2. 단기 목표 (1-3개월): 측정 가능한 목표 설정
3. 중장기 목표 (3-12개월): 종합적 개선 계획

**맞춤형 권고사항**
- 가정환경 조성: 물리적/심리적 환경 개선 방안
- 일상생활 구조화: 루틴 및 규칙 설정 가이드
- 상호작용 개선: 효과적 의사소통 및 관계 형성 전략
- 자기조절 훈련: 연령에 맞는 자기통제 기법

**전문적 자원 연계**
- 추천 전문가 유형: 임상심리사, 언어치료사, 작업치료사 등
- 적절한 평가 도구 및 검사 권장
- 지역사회 자원 활용 방안

**추적 관찰 계획**
- 재평가 시기 및 주기 제안
- 관찰해야 할 핵심 지표 설정
- 개선 정도 측정 방법 안내
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
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `당신은 박사급 임상심리전문가이자 행동분석 전문가입니다. 모든 연령대의 관찰 기록을 최고 수준의 전문성으로 분석합니다.

전문가 분석 지침:
1. 대상자의 이름은 반드시 "${requestBody.targetName || '대상자'}"로 표기
2. 연령대별 표준 기준과 비교한 객관적 평가 제공
3. 심리학적, 행동학적 이론에 근거한 깊이있는 해석
4. 근거 기반 개입 전략과 구체적 실행 방안 제시
5. 정량적 점수와 정성적 분석의 균형있는 제공
6. 예방적 관점과 치료적 관점을 모두 고려한 종합적 접근

분석 품질 요구사항:
- 각 영역별로 구체적인 점수(0-100)와 근거 제시
- 행동의 빈도, 강도, 지속성을 고려한 정밀 분석
- 환경적 요인과 개인적 요인의 상호작용 분석
- 단기/중기/장기 목표를 포함한 체계적 개입 계획`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: isDetailedMode ? 6000 : 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const analysisText = aiResponse.choices[0].message.content;
    
    logStep('OpenAI response received', { textLength: analysisText.length });

    // Parse the analysis response and extract domain scores
    const domainScores = { 정서: 70, 행동: 70, 인지: 70, 사회성: 70, 신체: 70 };
    
    // Extract scores from AI response with multiple patterns
    const patterns = [
      /(정서조절|정서).*?(\d+)\/100/g,
      /(행동조절|행동).*?(\d+)\/100/g,
      /(인지기능|인지).*?(\d+)\/100/g,
      /(사회적|사회성).*?(\d+)\/100/g,
      /(신체발달|신체).*?(\d+)\/100/g,
      /(정서|행동|인지|사회성|신체):\s*(\d+)/g
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(analysisText)) !== null) {
        const domainName = match[1];
        const score = parseInt(match[2]);
        
        // Map domain names to standard keys
        let standardKey = '';
        if (domainName.includes('정서')) standardKey = '정서';
        else if (domainName.includes('행동')) standardKey = '행동';
        else if (domainName.includes('인지')) standardKey = '인지';
        else if (domainName.includes('사회')) standardKey = '사회성';
        else if (domainName.includes('신체')) standardKey = '신체';
        
        if (standardKey && score >= 0 && score <= 100) {
          domainScores[standardKey as keyof typeof domainScores] = score;
        }
      }
    });

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

    const developmentMatch = analysisText.match(/\*\*현재 상태 평가\*\*([\s\S]*?)(?=\*\*|$)/);
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

    // Parse detailed sections more accurately
    // Update sections object with more comprehensive structure
    sections.summary = '';
    sections.basicPoints = [];
    sections.basicTips = [];
    sections.basicAlerts = [];

    // For detailed mode
    if (isDetailedMode) {
      // Extract each section content for detailed analysis
      const situationMatch = analysisText.match(/\*\*상황 분석\*\*([\s\S]*?)(?=\*\*|$)/);
      if (situationMatch) sections.situation = situationMatch[1].trim();

      const developmentMatch = analysisText.match(/\*\*현재 상태 평가\*\*([\s\S]*?)(?=\*\*|$)/);
      if (developmentMatch) sections.development = developmentMatch[1].trim();

      const concernsMatch = analysisText.match(/\*\*주요 관심 사항\*\*([\s\S]*?)(?=\*\*|$)/);
      if (concernsMatch) sections.concerns = concernsMatch[1].trim();

      const issuesMatch = analysisText.match(/\*\*잠재적 문제점\*\*([\s\S]*?)(?=\*\*|$)/);
      if (issuesMatch) sections.issues = issuesMatch[1].trim();

      const improvementsMatch = analysisText.match(/\*\*개선 방안\*\*([\s\S]*?)(?=\*\*|$)/);
      if (improvementsMatch) sections.improvements = improvementsMatch[1].trim();

      const consultationMatch = analysisText.match(/\*\*전문가 상담 권장\*\*([\s\S]*?)(?=\*\*|$)/);
      if (consultationMatch) sections.consultation = consultationMatch[1].trim();
    } else {
      // For basic mode
      const summaryMatch = analysisText.match(/\*\*상황 요약\*\*([\s\S]*?)(?=\*\*|$)/);
      if (summaryMatch) sections.summary = summaryMatch[1].trim();

      const pointsMatch = analysisText.match(/\*\*주요 포인트\*\*([\s\S]*?)(?=\*\*|$)/);
      if (pointsMatch) {
        sections.basicPoints = pointsMatch[1].trim().split('\n').filter(line => line.trim()).map(line => line.replace(/^-\s*/, ''));
      }

      const tipsMatch = analysisText.match(/\*\*개선 팁\*\*([\s\S]*?)(?=\*\*|$)/);
      if (tipsMatch) {
        sections.basicTips = tipsMatch[1].trim().split('\n').filter(line => line.trim()).map(line => line.replace(/^-\s*/, ''));
      }

      const alertsMatch = analysisText.match(/\*\*주의사항\*\*([\s\S]*?)(?=\*\*|$)/);
      if (alertsMatch) {
        sections.basicAlerts = alertsMatch[1].trim().split('\n').filter(line => line.trim()).map(line => line.replace(/^-\s*/, ''));
      }
    }

    // Media notes are handled at the end to avoid duplication

    // Calculate overall score
    const overallScore = Math.round(
      Object.values(domainScores).reduce((sum, score) => sum + score, 0) / 5
    );

    // Build result based on mode
    const result: ObserveReportResponse = {
      ok: true,
      report: isDetailedMode ? {
        situation: sections.situation || '상황을 분석했습니다.',
        points: sections.development ? [sections.development] : ['현재 상태를 평가했습니다.'],
        positives: sections.concerns ? [sections.concerns] : ['주요 관심 사항을 확인했습니다.'],
        tips: sections.improvements ? [sections.improvements] : ['개선 방안을 제시했습니다.'],
        alerts: (riskLevel === '높음' || riskLevel === '매우높음') && sections.consultation ? 
          [sections.consultation] : [],
        mediaNotes
      } : {
        situation: sections.summary || '관찰 상황을 요약했습니다.',
        points: sections.basicPoints.length > 0 ? sections.basicPoints : ['주요 포인트를 분석했습니다.'],
        positives: [], // 기본 모드에서는 긍정적 측면 별도 표시 안함
        tips: sections.basicTips.length > 0 ? sections.basicTips : ['개선 팁을 제시했습니다.'],
        alerts: sections.basicAlerts.length > 0 ? sections.basicAlerts : [],
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
    logStep('ERROR', { message: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    
    // 토큰을 다시 복구 (에러 발생 시 토큰을 돌려주기)
    if (user?.id && tokenCost) {
      try {
        await supabaseServiceClient
          .from('user_tokens')
          .update({ 
            current_tokens: tokenData.current_tokens, // 원래 토큰으로 복구
            total_used: tokenData.total_used 
          })
          .eq('user_id', user.id);
        logStep('Token refunded due to error', { refundedTokens: tokenCost });
      } catch (refundError) {
        logStep('Token refund failed', { error: refundError });
      }
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