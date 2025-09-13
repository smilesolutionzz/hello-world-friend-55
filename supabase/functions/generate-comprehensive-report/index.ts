import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ComprehensiveReportRequest {
  totalAssessments: number;
  totalObservations: number;
  totalConsultations: number;
  requestDate: string;
  phoneDelivery: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user ID from JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const {
      totalAssessments,
      totalObservations,
      totalConsultations,
      requestDate,
      phoneDelivery
    }: ComprehensiveReportRequest = await req.json();

    console.log('Comprehensive report request:', {
      userId: user.id,
      totalAssessments,
      totalObservations,
      totalConsultations,
      requestDate,
      phoneDelivery
    });

    // Collect user's assessment data
    const { data: assessments, error: assessmentsError } = await supabaseClient
      .from('assessments')
      .select(`
        *,
        profile:profiles(display_name, birth_date)
      `)
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (assessmentsError) {
      console.error('Error fetching assessments:', assessmentsError);
    }

    // Collect observation logs
    const { data: observations, error: observationsError } = await supabaseClient
      .from('observation_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (observationsError) {
      console.error('Error fetching observations:', observationsError);
    }

    // Collect chat messages from AI counselor sessions
    const { data: chatRooms, error: chatError } = await supabaseClient
      .from('chat_rooms')
      .select(`
        *,
        chat_messages(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (chatError) {
      console.error('Error fetching chat data:', chatError);
    }

    // Get user profile for personalization
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    // Use OpenAI to generate comprehensive analysis
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const reportPrompt = `
당신은 한국의 최고 심리 전문가입니다. 다음 데이터를 기반으로 종합적인 심리 분석 리포트를 작성해주세요.

사용자 정보:
- 이름: ${profile?.display_name || '사용자'}
- 생년월일: ${profile?.birth_date || '미제공'}

데이터 현황:
- 심리검사 실시 횟수: ${totalAssessments}회
- 관찰일지 기록 횟수: ${totalObservations}회  
- AI 상담 이용 횟수: ${totalConsultations}회

심리검사 결과 데이터:
${JSON.stringify(assessments?.slice(0, 5), null, 2)}

관찰일지 데이터:
${JSON.stringify(observations?.slice(0, 5), null, 2)}

AI 상담 내용 요약:
${JSON.stringify(chatRooms?.slice(0, 3), null, 2)}

다음 형식으로 종합 리포트를 작성해주세요:

# 🧠 AI 전문가 종합 심리 분석 리포트

## 📊 데이터 수집 현황
[검사, 관찰, 상담 데이터 요약]

## 🎯 핵심 발견사항
[주요 패턴 및 특징 3-5가지]

## 📈 심리상태 종합 분석
[정서, 행동, 인지, 사회성, 신체 영역별 상세 분석]

## ⚠️ 주의 관찰 영역
[우려되는 부분이나 집중 관찰이 필요한 영역]

## 💡 맞춤 개선방안
[구체적이고 실행 가능한 솔루션 5-7개]

## 🔮 향후 관리 방향
[장기적 관리 계획 및 권장사항]

## 📞 전문가 추천
[필요시 전문의 상담 권유 및 추가 검사 제안]

리포트는 따뜻하고 희망적인 톤으로 작성하되, 전문적이고 신뢰할 수 있는 내용으로 구성해주세요.
한국어로 작성하며, 이모지를 적절히 사용하여 가독성을 높여주세요.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07', // 종합 리포트용 고품질 모델
        messages: [
          {
            role: 'system',
            content: '당신은 한국의 최고 심리 전문가로서, 데이터 기반의 정확하고 따뜻한 심리 분석 리포트를 제공합니다.'
          },
          {
            role: 'user',
            content: reportPrompt
          }
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const openAIData = await response.json();
    const comprehensiveReport = openAIData.choices[0].message.content;

    // Save report request to database for tracking
    const { data: reportRecord, error: saveError } = await supabaseClient
      .from('expert_feedback_requests')
      .insert([
        {
          user_id: user.id,
          request_status: 'completed',
          priority_level: 'normal',
          request_note: `AI 전문가 종합 리포팅 - 검사:${totalAssessments}, 관찰:${totalObservations}, 상담:${totalConsultations}`,
          expert_report: comprehensiveReport,
          requested_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (saveError) {
      console.error('Error saving report:', saveError);
    }

    // Log usage for tracking
    await supabaseClient
      .from('usage_tracking')
      .insert([
        {
          user_id: user.id,
          feature_type: 'comprehensive_report',
          usage_date: new Date().toISOString().split('T')[0],
          count: 1
        }
      ]);

    console.log('Comprehensive report generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        reportId: reportRecord?.id,
        message: '종합 리포팅이 성공적으로 생성되었습니다. 3일 내에 휴대폰으로 전송됩니다.',
        summary: {
          totalDataPoints: totalAssessments + totalObservations + totalConsultations,
          reportGeneratedAt: new Date().toISOString(),
          deliveryMethod: phoneDelivery ? '휴대폰 SMS' : '이메일'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error generating comprehensive report:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});