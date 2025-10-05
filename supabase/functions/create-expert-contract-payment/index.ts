import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-EXPERT-CONTRACT-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const {
      expertId,
      expertName,
      contractType,
      durationMonths,
      totalAmount,
      sessionsPerWeek,
      additionalServices,
      contractStartDate,
      notes
    } = await req.json();

    logStep("Request data received", { 
      expertId, 
      expertName, 
      durationMonths, 
      totalAmount 
    });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    logStep("Stripe initialized");

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      logStep("No existing customer found, will create at checkout");
    }

    // Create line items
    const lineItems = [];
    
    // Main service
    const serviceName = `${expertName} - ${durationMonths}개월 계약 (주 ${sessionsPerWeek}회)`;
    lineItems.push({
      price_data: {
        currency: 'krw',
        product_data: {
          name: serviceName,
          description: `${expertName} 전문가와의 ${durationMonths}개월 계약`,
        },
        unit_amount: totalAmount,
      },
      quantity: 1,
    });

    logStep("Line items prepared", { lineItemsCount: lineItems.length });

    const origin = req.headers.get("origin") || "http://localhost:8080";
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/expert-contract-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/expert-hiring`,
      metadata: {
        user_id: user.id,
        expert_id: expertId,
        expert_name: expertName,
        contract_type: contractType,
        duration_months: durationMonths.toString(),
        sessions_per_week: sessionsPerWeek.toString(),
        contract_start_date: contractStartDate,
        additional_services: JSON.stringify(additionalServices),
        notes: notes || '',
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-expert-contract-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
