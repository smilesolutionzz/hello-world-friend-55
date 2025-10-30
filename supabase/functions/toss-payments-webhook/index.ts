import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // 토스페이먼츠 웹훅 데이터 파싱
    const webhookData = await req.json();
    
    console.log('토스 웹훅 수신:', webhookData);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 웹훅 이벤트 타입별 처리
    switch (webhookData.eventType) {
      case 'PAYMENT_STATUS_CHANGED':
        await handlePaymentStatusChanged(supabase, webhookData.data);
        break;
      
      case 'PAYMENT_CANCELED':
        await handlePaymentCanceled(supabase, webhookData.data);
        break;
      
      case 'PAYMENT_FAILED':
        await handlePaymentFailed(supabase, webhookData.data);
        break;
      
      default:
        console.log('처리하지 않는 웹훅 이벤트:', webhookData.eventType);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('웹훅 처리 오류:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || '웹훅 처리 실패' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function handlePaymentStatusChanged(supabase: any, paymentData: any) {
  console.log('결제 상태 변경:', paymentData);
  
  // payment_history 테이블 업데이트
  const { error } = await supabase
    .from('payment_history')
    .update({
      payment_status: paymentData.status,
      payment_data: paymentData,
      updated_at: new Date().toISOString(),
    })
    .eq('payment_key', paymentData.paymentKey);

  if (error) {
    console.error('결제 상태 업데이트 실패:', error);
  }
}

async function handlePaymentCanceled(supabase: any, paymentData: any) {
  console.log('결제 취소:', paymentData);
  
  // payment_history에서 해당 결제 찾기
  const { data: payment, error: fetchError } = await supabase
    .from('payment_history')
    .select('*')
    .eq('payment_key', paymentData.paymentKey)
    .single();

  if (fetchError || !payment) {
    console.error('결제 기록을 찾을 수 없음:', fetchError);
    return;
  }

  // 토큰 차감
  const { error: tokenError } = await supabase
    .from('user_tokens')
    .update({
      current_tokens: supabase.raw(`GREATEST(0, current_tokens - ${payment.token_amount})`),
    })
    .eq('user_id', payment.user_id);

  if (tokenError) {
    console.error('토큰 차감 실패:', tokenError);
  }

  // 결제 상태 업데이트
  await supabase
    .from('payment_history')
    .update({
      payment_status: 'CANCELED',
      payment_data: paymentData,
      updated_at: new Date().toISOString(),
    })
    .eq('payment_key', paymentData.paymentKey);
}

async function handlePaymentFailed(supabase: any, paymentData: any) {
  console.log('결제 실패:', paymentData);
  
  // 결제 상태 업데이트
  await supabase
    .from('payment_history')
    .update({
      payment_status: 'FAILED',
      payment_data: paymentData,
      updated_at: new Date().toISOString(),
    })
    .eq('payment_key', paymentData.paymentKey);
}
