import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-EXPERT-CONTRACT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    logStep("User authenticated", { userId: user.id, email: user.email });

    const requestBody = await req.json();
    const {
      expertId,
      contractType,
      durationMonths,
      hourlyRate,
      sessionsPerWeek,
      additionalServices = [],
      contractStartDate,
      notes = ""
    } = requestBody;

    logStep("Contract details received", {
      expertId,
      contractType,
      durationMonths,
      hourlyRate,
      sessionsPerWeek
    });

    // 총 비용 계산 (주당 세션 수 * 시간당 요금 * 4주 * 계약 개월)
    const totalAmount = sessionsPerWeek * hourlyRate * 4 * durationMonths;
    const monthlyAmount = sessionsPerWeek * hourlyRate * 4;

    // 계약 종료일 계산
    const startDate = new Date(contractStartDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + durationMonths);

    logStep("Contract amounts calculated", { totalAmount, monthlyAmount });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Stripe 고객 찾기 또는 생성
    let customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing Stripe customer found", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id }
      });
      customerId = customer.id;
      logStep("New Stripe customer created", { customerId });
    }

    // Stripe 제품 및 가격 생성 (전문가별 맞춤)
    const product = await stripe.products.create({
      name: `전문가 고용 서비스 - ${expertId}`,
      description: `월간 전문가 고용 계약 (주 ${sessionsPerWeek}회 상담)`,
      metadata: {
        expertId,
        contractType,
        sessionsPerWeek: sessionsPerWeek.toString()
      }
    });

    logStep("Stripe product created", { productId: product.id });

    const price = await stripe.prices.create({
      currency: "krw",
      unit_amount: monthlyAmount,
      recurring: { interval: "month" },
      product: product.id,
      metadata: {
        expertId,
        contractType,
        sessionsPerWeek: sessionsPerWeek.toString(),
        hourlyRate: hourlyRate.toString()
      }
    });

    logStep("Stripe price created", { priceId: price.id });

    // Stripe 구독 세션 생성
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/expert-contract-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/expert-hiring`,
      metadata: {
        expertId,
        contractType,
        durationMonths: durationMonths.toString(),
        userId: user.id
      }
    });

    logStep("Stripe checkout session created", { sessionId: session.id });

    // 계약 정보를 데이터베이스에 저장
    const { data: contract, error: contractError } = await supabaseClient
      .from("expert_contracts")
      .insert({
        user_id: user.id,
        expert_id: expertId,
        contract_type: contractType,
        duration_months: durationMonths,
        hourly_rate: hourlyRate,
        total_amount: totalAmount,
        sessions_per_week: sessionsPerWeek,
        additional_services: additionalServices,
        contract_start_date: contractStartDate,
        contract_end_date: endDate.toISOString().split('T')[0],
        status: 'pending',
        payment_status: 'pending',
        stripe_subscription_id: session.subscription as string,
        notes,
        contract_terms: {
          stripe_session_id: session.id,
          stripe_price_id: price.id,
          stripe_product_id: product.id
        }
      })
      .select()
      .single();

    if (contractError) {
      logStep("Contract creation error", { error: contractError });
      throw new Error(`계약 생성 오류: ${contractError.message}`);
    }

    logStep("Contract saved to database", { contractId: contract.id });

    return new Response(JSON.stringify({
      sessionUrl: session.url,
      contractId: contract.id,
      totalAmount,
      monthlyAmount
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});