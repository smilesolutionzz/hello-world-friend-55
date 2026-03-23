import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!openAIApiKey) {
  throw new Error('OPENAI_API_KEY is required');
}

const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    // Deduct tokens (5 tokens for instant report)
    const { data: userTokens, error: tokenError } = await supabase
      .from('user_tokens')
      .select('current_tokens')
      .eq('user_id', user.id)
      .single();

    if (tokenError || !userTokens) {
      throw new Error('Failed to check user tokens');
    }

    if (userTokens.current_tokens < 5) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient tokens. You need 5 tokens for instant report.',
          requiredTokens: 5,
          currentTokens: userTokens.current_tokens
        }),
        { 
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Deduct tokens
    const { error: deductError } = await supabase
      .from('user_tokens')
      .update({ current_tokens: userTokens.current_tokens - 5 })
      .eq('user_id', user.id);

    if (deductError) {
      throw new Error('Failed to deduct tokens');
    }

    const { message } = await req.json();

    if (!message || message.length < 30) {
      throw new Error('Message must be at least 30 characters long');
    }

    console.log('Processing instant report for user:', user.id);
    console.log('Message length:', message.length);

    // Enhanced AI analysis prompt
    const systemPrompt = `당신은 정신건강 전문가이자 심리상담사입니다. 사용자의 상황을 깊이 있게 분석하고 따뜻하고 전문적인 조언을 제공해야 합니다.

분석 지침:
1. 공감과 이해: 사용자의 감정을 충분히 이해하고 공감 표현
2. 전문적 관점: 심리학적, 의학적 관점에서의 정확한 정보 제공
3. 실질적 조언: 구체적이고 실행 가능한 해결방안 제시
4. 희망과 격려: 긍정적 전망과 격려 메시지 포함
5. 전문가 연결: 필요시 전문가 상담 권유

응답 구조 (1000자 이상):
1. 상황 인정 및 공감 (200자)
2. 전문적 분석 및 설명 (400자)  
3. 실질적 조언 및 대처방안 (300자)
4. 희망적 전망 및 격려 (200자)
5. 추가 지원 안내 (100자)

위험도 평가:
- low: 일반적인 스트레스, 가벼운 고민
- medium: 중간 정도의 심리적 어려움, 지속적 관리 필요
- high: 즉각적인 전문가 개입이 필요한 상황

전문가 상담 필요성:
- true: 전문가 상담이 권장되는 경우
- false: 셀프케어로 충분한 경우`;

    const userPrompt = `다음 상황에 대해 전문적이고 따뜻한 분석과 조언을 1000자 이상으로 제공해주세요:

상황: ${message}

응답 시 JSON 형식은 사용하지 말고, 자연스러운 텍스트로만 작성해주세요. 
분석 내용만 깔끔하게 1000자 이상으로 제공해주세요.`;

    // Call OpenAI API for main analysis
    const mainResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!mainResponse.ok) {
      const errorData = await mainResponse.text();
      console.error('OpenAI API error:', mainResponse.status, errorData);
      throw new Error(`OpenAI API error: ${mainResponse.status}`);
    }

    const mainData = await mainResponse.json();
    const reportContent = mainData.choices[0].message.content;

    // Call OpenAI API for risk assessment and recommendations
    const riskAssessmentPrompt = `다음 상황을 분석하여 위험도, 전문가 상담 필요성, 추천 치료, 추천 컨텐츠를 평가해주세요:

상황: ${message}

JSON 형식으로만 응답:
{
  "riskLevel": "low|medium|high",
  "needsExpertConsultation": true|false,
  "recommendedTreatments": ["치료1", "치료2", "치료3"],
  "recommendedContent": ["컨텐츠1", "컨텐츠2", "컨텐츠3"]
}

추천 치료 예시: "인지행동치료(CBT)", "가족상담", "놀이치료", "약물치료", "미술치료", "음악치료" 등
추천 컨텐츠 예시: "육아 스트레스 관리법", "ADHD 이해하기", "아동발달 체크리스트", "청소년 정서 관리" 등`;

    const riskResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: '위험도 평가 전문가입니다.' },
          { role: 'user', content: riskAssessmentPrompt }
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    let riskAssessment = {
      riskLevel: "medium",
      needsExpertConsultation: true,
      recommendedTreatments: ["전문가 상담", "심리평가"],
      recommendedContent: ["정신건강 관리 가이드", "스트레스 대처법"]
    };

    if (riskResponse.ok) {
      const riskData = await riskResponse.json();
      try {
        riskAssessment = JSON.parse(riskData.choices[0].message.content);
      } catch (parseError) {
        console.error('Failed to parse risk assessment:', parseError);
      }
    }

    console.log('OpenAI response received:', reportContent.length, 'characters');

    // Create final result
    const analysisResult = {
      report: reportContent.trim(),
      riskLevel: riskAssessment.riskLevel,
      needsExpertConsultation: riskAssessment.needsExpertConsultation,
      recommendedTreatments: riskAssessment.recommendedTreatments || [],
      recommendedContent: riskAssessment.recommendedContent || [],
      timestamp: new Date().toISOString()
    };

    // Track usage
    await supabase
      .from('usage_tracking')
      .insert({
        user_id: user.id,
        feature_type: 'instant_report',
        usage_date: new Date().toISOString().split('T')[0],
        count: 1
      });

    console.log('Analysis completed successfully');

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in instant-report function:', error);
    
    // Provide detailed fallback analysis for common situations
    const fallbackReport = `죄송합니다. 일시적인 기술적 문제가 발생했습니다. 

**현재 상황에 대해:**
어려운 상황에 직면하신 것 같아 마음이 무겁습니다. 혼자서 모든 것을 감당하려 하지 마시고, 주변의 도움을 받으시기 바랍니다.

**전문가 상담 권장:**
- 정신건강위기상담전화: 1577-0199 (24시간)
- 청소년전화: 1388
- 생명의전화: 1588-9191

**당장 할 수 있는 것들:**
1. 깊고 천천히 숨쉬기
2. 신뢰할 수 있는 사람과 대화하기
3. 충분한 휴식 취하기
4. 규칙적인 생활 패턴 유지하기

**기억해주세요:**
지금의 어려움은 영원하지 않습니다. 적절한 도움과 시간이 지나면 상황은 분명히 나아질 것입니다. 혼자가 아니라는 것을 기억해주세요.

더 정확한 분석을 위해서는 전문가와의 직접 상담을 권장드립니다.`;

    return new Response(JSON.stringify({
      report: fallbackReport,
      riskLevel: 'medium',
      needsExpertConsultation: true,
      recommendedTreatments: ["전문가 상담", "심리평가"],
      recommendedContent: ["정신건강 관리 가이드", "스트레스 대처법"],
      timestamp: new Date().toISOString(),
      error: '일시적 분석 오류'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});