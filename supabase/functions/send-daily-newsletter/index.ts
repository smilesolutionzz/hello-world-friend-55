import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DAILY-NEWSLETTER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting daily newsletter");

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const resend = new Resend(resendApiKey);
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // 활성 구독자 목록 조회 (premium 또는 paid)
    const { data: subscribers, error: subError } = await supabaseClient
      .from('user_subscriptions')
      .select('user_id')
      .eq('status', 'active')
      .in('subscription_type', ['premium', 'paid']);

    if (subError) {
      logStep("Error fetching subscribers", { error: subError.message });
      throw subError;
    }

    if (!subscribers || subscribers.length === 0) {
      logStep("No active subscribers found");
      return new Response(
        JSON.stringify({ success: true, message: "No subscribers to send" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Found subscribers", { count: subscribers.length });

    // 구독자들의 이메일 조회
    const userIds = subscribers.map(s => s.user_id);
    const subscriberEmails: string[] = [];

    for (const userId of userIds) {
      const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(userId);
      if (!userError && userData?.user?.email) {
        subscriberEmails.push(userData.user.email);
      }
    }

    logStep("Collected emails", { count: subscriberEmails.length });

    if (subscriberEmails.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No emails to send" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 오늘 발행된 콘텐츠 조회 (최근 24시간)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: contents, error: contentError } = await supabaseClient
      .from('curated_education_content')
      .select('*')
      .eq('is_published', true)
      .gte('published_at', yesterday.toISOString())
      .order('published_at', { ascending: false })
      .limit(5);

    if (contentError) {
      logStep("Error fetching content", { error: contentError.message });
      throw contentError;
    }

    if (!contents || contents.length === 0) {
      logStep("No new content to send");
      return new Response(
        JSON.stringify({ success: true, message: "No new content published" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Found content", { count: contents.length });

    // 이메일 HTML 생성
    const today = new Date().toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });

    const contentHtml = contents.map(content => `
      <div style="margin-bottom: 24px; padding: 20px; background: #f8f9fa; border-radius: 12px;">
        <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 18px;">
          ${content.title}
        </h3>
        ${content.summary ? `<p style="margin: 0 0 12px 0; color: #666; font-size: 14px; line-height: 1.6;">${content.summary}</p>` : ''}
        ${content.tags && content.tags.length > 0 ? `
          <div style="margin-bottom: 12px;">
            ${content.tags.slice(0, 3).map((tag: string) => `
              <span style="display: inline-block; padding: 4px 8px; background: #e9ecef; border-radius: 4px; font-size: 12px; color: #495057; margin-right: 6px;">${tag}</span>
            `).join('')}
          </div>
        ` : ''}
        ${content.source_url ? `
          <a href="${content.source_url}" style="display: inline-block; padding: 8px 16px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-size: 14px;">
            자세히 보기 →
          </a>
        ` : ''}
      </div>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="margin: 0 0 8px 0; color: #6366f1; font-size: 28px;">🌅 오늘의 육아 소식</h1>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">${today}</p>
            </div>
            
            <!-- Content -->
            <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <h2 style="margin: 0 0 24px 0; color: #1f2937; font-size: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
                📚 새로 발행된 콘텐츠
              </h2>
              
              ${contentHtml}
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 32px; color: #9ca3af; font-size: 12px;">
              <p style="margin: 0 0 8px 0;">
                이 이메일은 마음코치 프리미엄 구독자에게 발송됩니다.
              </p>
              <p style="margin: 0;">
                © ${new Date().getFullYear()} 마음코치. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // 이메일 발송 (배치로 발송)
    const batchSize = 50;
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < subscriberEmails.length; i += batchSize) {
      const batch = subscriberEmails.slice(i, i + batchSize);
      
      for (const email of batch) {
        try {
          await resend.emails.send({
            from: "마음코치 <onboarding@resend.dev>",
            to: [email],
            subject: `🌅 [마음코치] ${today} - 오늘의 육아 소식`,
            html: emailHtml,
          });
          sentCount++;
          logStep("Email sent", { email });
        } catch (emailError) {
          failedCount++;
          logStep("Failed to send email", { email, error: emailError });
        }
      }
    }

    logStep("Newsletter completed", { sent: sentCount, failed: failedCount });

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: sentCount, 
        failed: failedCount,
        contentCount: contents.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
