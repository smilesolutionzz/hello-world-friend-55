import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// 상품 정의 (프론트엔드와 동기화) - SaaS 모델 v2
const PRODUCTS: Record<string, any> = {
  // mind_track 라인업: 7일(메인) / 30일(보조) / 23일 연장권(업셀)
  mind_track_7: { type: 'mind_track', name: '7일 마음 변화 트랙', price: 7900 },
  mind_track_30: { type: 'mind_track', name: '30일 마음 변화 트랙', price: 19900 },
  mind_track_extend_23: { type: 'mind_track', name: '마음 트랙 23일 연장권', price: 12900 },
};

// 🔒 인증된 사용자 확인 헬퍼
async function authenticateUser(req: Request, supabaseAdmin: any) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return { user: null, error: "인증이 필요합니다." };

  const token = authHeader.replace("Bearer ", "");
  // 🔒 보안: service_role 클라이언트로 토큰 검증 (anon key 대신)
  const { data: userData, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !userData.user) {
    return { user: null, error: "사용자 인증 실패" };
  }
  return { user: userData.user, error: null };
}

// JSON 에러 응답 헬퍼
function errorResponse(message: string, status = 400) {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.json();
    const { action } = body;

    const tossClientKey = Deno.env.get("TOSS_CLIENT_KEY");
    const tossSecretKey = Deno.env.get("TOSS_SECRET_KEY");

    if (!tossClientKey || !tossSecretKey) {
      throw new Error("토스페이먼츠 API 키가 설정되지 않았습니다.");
    }

    // Action: Client Key 반환 (🔒 인증 필요)
    if (action === 'get-client-key') {
      const { user, error: authErr } = await authenticateUser(req, supabaseAdmin);
      if (!user) {
        return errorResponse(authErr || "인증 필요", 401);
      }
      return new Response(JSON.stringify({ 
        success: true, 
        clientKey: tossClientKey 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 🔒 모든 나머지 액션은 인증 필수
    const { user, error: authErr } = await authenticateUser(req, supabaseAdmin);
    if (!user) {
      return errorResponse(authErr || "인증 필요", 401);
    }

    // Action: 결제 생성
    if (action === 'create-payment') {
      const { productId, productType, productName, amount, tokens } = body;
      
      const product = PRODUCTS[productId];
      const finalAmount = amount || product?.price;
      const finalName = productName || product?.name || '결제';
      const finalTokens = tokens || product?.tokens || 0;
      // 서버측 상품 타입 우선 사용 (프론트엔드 변조 방지)
      const finalType = product?.type || productType || 'custom';

      if (!finalAmount || finalAmount <= 0) {
        return errorResponse("유효하지 않은 결제 금액입니다.");
      }

      // 🔒 서버사이드 금액 검증: 알려진 상품이면 가격 일치 확인
      if (product && amount && amount !== product.price) {
        console.error('❌ Price tampering detected:', { expected: product.price, received: amount });
        return errorResponse("결제 금액이 상품 가격과 일치하지 않습니다.");
      }

      const orderId = `${finalType}_${productId}_${user.id.slice(0, 8)}_${Date.now()}`;

      // 결제 내역 저장
      const { error: insertError } = await supabaseAdmin
        .from('payment_history')
        .insert({
          user_id: user.id,
          toss_order_id: orderId,
          amount: finalAmount,
          subscription_type: finalType,
          status: 'pending',
          token_amount: finalTokens > 0 ? finalTokens : null,
        });

      if (insertError) {
        console.error('Payment insert error:', insertError);
        throw new Error('결제 준비 중 오류가 발생했습니다.');
      }

      const paymentData = {
        amount: finalAmount,
        orderId,
        orderName: finalName,
        customerEmail: user.email || '',
        customerName: user.user_metadata?.full_name || user.email?.split('@')[0] || '고객',
      };

      console.log('✅ Payment created for user:', user.id, { orderId, amount: finalAmount, type: finalType });

      return new Response(JSON.stringify({ 
        success: true, 
        paymentData,
        clientKey: tossClientKey,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: 결제 확인
    if (action === 'confirm-payment') {
      const { paymentKey, orderId, amount } = body;

      if (!paymentKey || !orderId || !amount) {
        return errorResponse("필수 결제 정보가 누락되었습니다.");
      }

      console.log('Confirming payment for user:', user.id, { paymentKey, orderId, amount });

      // 🔒 결제 내역 조회 및 소유자/금액 검증
      const { data: payment, error: fetchError } = await supabaseAdmin
        .from('payment_history')
        .select('*')
        .eq('toss_order_id', orderId)
        .maybeSingle();

      if (fetchError || !payment) {
        console.error('Payment not found:', orderId);
        return errorResponse("결제 내역을 찾을 수 없습니다.", 404);
      }

      // 🔒 주문 소유자 검증
      if (payment.user_id !== user.id) {
        console.error('❌ Unauthorized: Payment does not belong to user', { paymentUserId: payment.user_id, requestUserId: user.id });
        return errorResponse("이 결제에 대한 권한이 없습니다.", 403);
      }

      // 🔒 서버사이드 금액 검증
      if (payment.amount !== amount) {
        console.error('❌ Amount mismatch:', { expected: payment.amount, received: amount });
        return errorResponse("결제 금액이 일치하지 않습니다.");
      }

      // 🔒 중복 결제 방지
      if (payment.status === 'completed') {
        console.warn('⚠️ Payment already processed:', orderId);
        return errorResponse("이미 처리된 결제입니다.");
      }

      // 토스페이먼츠 결제 승인
      const encryptedSecretKey = btoa(tossSecretKey + ':');
      const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${encryptedSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      });

      const tossResult = await tossResponse.json();

      if (!tossResponse.ok) {
        console.error('Toss API error:', tossResult);
        
        // 결제 실패 상태 업데이트
        await supabaseAdmin
          .from('payment_history')
          .update({ status: 'failed' })
          .eq('id', payment.id);

        throw new Error(tossResult.message || '결제 승인에 실패했습니다.');
      }

      // 결제 완료 처리
      await supabaseAdmin
        .from('payment_history')
        .update({
          payment_key: paymentKey,
          status: 'completed',
          payment_method: tossResult.method,
        })
        .eq('id', payment.id);

      // 상품 유형별 처리
      const productType = payment.subscription_type;

      if (productType === 'single_test') {
        // 단건 검사 구매 - 검사 크레딧 기록
        await supabaseAdmin
          .from('user_test_credits')
          .insert({
            user_id: payment.user_id,
            credits: 1,
            source: 'single_purchase',
            payment_id: payment.id,
          });

        console.log(`✅ Added 1 test credit for user ${payment.user_id}`);

      } else if (productType === 'single_report' || productType === 'single') {
        // 단건 리포트 구매 - 리포트 크레딧 기록
        await supabaseAdmin
          .from('user_report_credits')
          .insert({
            user_id: payment.user_id,
            credits: 1,
            source: 'single_purchase',
            payment_id: payment.id,
          });

        console.log(`✅ Added 1 report credit for user ${payment.user_id}`);

      } else if (productType === 'subscription' || productType === 'pass' || productType === 'mind_track') {
        // 구독 처리 - 월간(30일), 연간(365일), 또는 마음 트랙(30일 일시불)
        const startDate = new Date();
        const endDate = new Date(startDate);
        const isYearly = payment.toss_order_id?.includes('subscription_yearly');
        endDate.setDate(endDate.getDate() + (isYearly ? 365 : 30));

        // 기존 구독 취소
        await supabaseAdmin
          .from('user_subscriptions')
          .update({ status: 'cancelled' })
          .eq('user_id', payment.user_id)
          .eq('status', 'active');

        // 새 구독 생성
        await supabaseAdmin
          .from('user_subscriptions')
          .insert({
            user_id: payment.user_id,
            subscription_type: 'premium',
            payment_method: 'toss',
            current_period_start: startDate.toISOString().split('T')[0],
            current_period_end: endDate.toISOString().split('T')[0],
            status: 'active',
          });

        console.log(`✅ Created premium subscription for user ${payment.user_id}`);

        // 🎯 Mind Track: also activate the enrollment row so MindTrackStart finds it.
        if (productType === 'mind_track') {
          // Find latest pending enrollment for this user (created before pay())
          const { data: pendingEnroll } = await supabaseAdmin
            .from('mind_track_enrollments')
            .select('id, baseline_data')
            .eq('user_id', payment.user_id)
            .neq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (pendingEnroll?.id) {
            await supabaseAdmin
              .from('mind_track_enrollments')
              .update({
                payment_status: 'completed',
                payment_amount: payment.amount,

              })
              .eq('id', pendingEnroll.id);
            console.log(`✅ Activated existing mind_track enrollment ${pendingEnroll.id}`);
          } else {
            // No pending row (user paid via a path that skipped ensureMindTrackEnrollment).
            // Create one now so the user is never blocked.
            const { data: onboarding } = await supabaseAdmin
              .from('user_onboarding_data')
              .select('primary_goal, free_text_concern, current_mood_score')
              .eq('user_id', payment.user_id)
              .maybeSingle();

            const mood = Number((onboarding as any)?.current_mood_score);
            const moodPct = Number.isFinite(mood) ? Math.max(0, Math.min(100, Math.round((mood / 10) * 100))) : null;
            const baselineData: Record<string, unknown> = {
              source: 'auto_post_payment',
              primary_concern: (onboarding as any)?.free_text_concern ?? null,
            };
            if (moodPct != null) {
              baselineData.stress_score = 100 - moodPct;
              baselineData.energy_score = moodPct;
              baselineData.clarity_score = moodPct;
            }

            const { data: createdEnroll } = await supabaseAdmin
              .from('mind_track_enrollments')
              .insert({
                user_id: payment.user_id,
                track_type: 'mind_30day',
                goal_focus: (onboarding as any)?.primary_goal || 'stress',
                payment_status: 'completed',
                payment_amount: payment.amount,

                baseline_data: baselineData,
              })
              .select('id')
              .single();
            console.log(`✅ Auto-created mind_track enrollment ${createdEnroll?.id}`);
          }
        }

      } else if (productType === 'cash' && payment.token_amount) {
        // 캐시(토큰) 충전 (레거시 호환)
        const { data: tokenBalance } = await supabaseAdmin
          .from('user_tokens')
          .select('*')
          .eq('user_id', payment.user_id)
          .maybeSingle();

        const currentTokens = tokenBalance?.current_tokens || 0;
        const newTokens = currentTokens + payment.token_amount;

        if (tokenBalance) {
          await supabaseAdmin
            .from('user_tokens')
            .update({ 
              current_tokens: newTokens,
              total_purchased: (tokenBalance.total_purchased || 0) + payment.token_amount,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', payment.user_id);
        } else {
          await supabaseAdmin
            .from('user_tokens')
            .insert({
              user_id: payment.user_id,
              current_tokens: newTokens,
              total_purchased: payment.token_amount,
            });
        }

        console.log(`✅ Added ${payment.token_amount} tokens to user ${payment.user_id}`);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: '결제가 완료되었습니다.',
        paymentResult: tossResult,
        productType,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return errorResponse('알 수 없는 액션입니다.');

  } catch (error: unknown) {
    console.error('Unified payment error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
