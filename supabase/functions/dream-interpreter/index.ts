import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseServiceClient = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: '인증이 필요합니다.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user info from Supabase
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseServiceClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: '유효하지 않은 토큰입니다.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { dreamText } = await req.json();

    if (!dreamText) {
      return new Response(JSON.stringify({ error: '꿈 내용을 입력해주세요.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 토큰 차감 처리 (꿈해몽은 5토큰)
    const tokenCost = 5;
    
    // 현재 토큰 잔액 확인
    const { data: tokenData, error: tokenError } = await supabaseServiceClient
      .from('user_tokens')
      .select('current_tokens, total_used')
      .eq('user_id', user.id)
      .single();

    if (tokenError || !tokenData) {
      return new Response(JSON.stringify({ 
        error: '토큰 정보를 확인할 수 없습니다.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (tokenData.current_tokens < tokenCost) {
      return new Response(JSON.stringify({ 
        error: `꿈해몽을 위해 ${tokenCost}개의 토큰이 필요합니다. 현재 토큰: ${tokenData.current_tokens}개` 
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

    console.log(`Dream interpretation token deducted: ${tokenCost}, Remaining: ${tokenData.current_tokens - tokenCost}`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `당신은 전문적인 꿈 해몽 상담사입니다. 

다음 지침을 따라 꿈을 해석해주세요:

1. **꿈의 주요 상징들을 분석**
   - 등장인물, 장소, 물건, 상황의 의미
   - 색깔, 숫자, 동물 등의 상징적 의미

2. **감정과 심리상태 해석**
   - 꿈에서 느낀 감정의 의미
   - 현재 심리상태와의 연관성

3. **일상생활과의 연관성**
   - 현실의 고민이나 상황과의 관계
   - 무의식적 욕구나 두려움의 표출

4. **긍정적 메시지와 조언**
   - 성장과 발전을 위한 통찰
   - 실생활에 적용할 수 있는 조언

**답변 형식:**
- 따뜻하고 공감적인 톤으로 작성
- 구체적이고 개인적인 해석 제공
- 3-4개 문단으로 구성 (약 300-400자)
- 꿈의 긍정적 의미에 초점을 맞춰 마무리

**주의사항:**
- 부정적이거나 불안을 조장하는 해석은 피하기
- 의학적 진단이나 예언은 하지 않기
- 개인의 성장과 자아 성찰에 도움이 되도록 해석`
          },
          {
            role: 'user',
            content: `다음 꿈을 해석해주세요:\n\n${dreamText}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API 요청 실패');
    }

    const data = await response.json();
    console.log('OpenAI response:', JSON.stringify(data, null, 2));
    
    const interpretation = data.choices?.[0]?.message?.content;
    
    if (!interpretation || interpretation.trim() === '') {
      console.error('Empty interpretation received from OpenAI');
      throw new Error('OpenAI에서 빈 응답을 받았습니다.');
    }

    return new Response(JSON.stringify({ interpretation: interpretation.trim() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in dream-interpreter function:', error);
    return new Response(JSON.stringify({ error: '꿈 해몽 분석 중 오류가 발생했습니다.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});