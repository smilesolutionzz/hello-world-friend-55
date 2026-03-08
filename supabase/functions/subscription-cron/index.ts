import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    console.log(`⏰ [subscription-cron] Running at ${now}`);

    // 1. 만료된 구독 비활성화
    const { data: expired, error: expireError } = await supabaseAdmin
      .from('user_subscriptions')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .lt('current_period_end', now)
      .select('user_id, subscription_type, current_period_end');

    if (expireError) {
      console.error('❌ Error expiring subscriptions:', expireError);
    } else if (expired && expired.length > 0) {
      console.log(`✅ Expired ${expired.length} subscriptions:`, expired.map(s => s.user_id));
      
      // 만료 알림 생성
      for (const sub of expired) {
        await supabaseAdmin.from('admin_notifications').insert({
          notification_type: 'subscription_expired',
          title: '구독 만료',
          message: `사용자의 ${sub.subscription_type} 구독이 만료되었습니다. (만료일: ${sub.current_period_end})`,
          related_id: sub.user_id,
          priority: 'low',
        });
      }
    } else {
      console.log('ℹ️ No subscriptions to expire');
    }

    // 2. 만료 임박 구독 알림 (3일 전)
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    const threeDaysStr = threeDaysLater.toISOString().split('T')[0];

    const { data: expiring, error: expiringError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('user_id, subscription_type, current_period_end')
      .eq('status', 'active')
      .lte('current_period_end', threeDaysStr)
      .gte('current_period_end', now);

    if (!expiringError && expiring && expiring.length > 0) {
      console.log(`⚠️ ${expiring.length} subscriptions expiring within 3 days`);
    }

    // 3. pending 상태 30분 이상된 결제 타임아웃 처리
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    
    const { data: timedOut, error: timeoutError } = await supabaseAdmin
      .from('payment_history')
      .update({ status: 'timeout' })
      .eq('status', 'pending')
      .lt('created_at', thirtyMinutesAgo)
      .select('id, toss_order_id');

    if (!timeoutError && timedOut && timedOut.length > 0) {
      console.log(`⏱️ Timed out ${timedOut.length} pending payments`);
    }

    return new Response(JSON.stringify({
      ok: true,
      expired: expired?.length || 0,
      expiring_soon: expiring?.length || 0,
      timed_out_payments: timedOut?.length || 0,
      ran_at: now,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('❌ Subscription cron error:', error);
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
