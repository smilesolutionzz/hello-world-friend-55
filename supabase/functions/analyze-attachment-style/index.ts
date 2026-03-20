import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { anxietyScore, avoidanceScore, style, answers } = await req.json();
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // JWT에서 사용자 확인
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    
    if (!user) {
      throw new Error("인증되지 않은 사용자입니다");
    }

    console.log("🔍 분석 시작:", { anxietyScore, avoidanceScore, style });

    // Lovable AI로 상세 분석 생성
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY가 설정되지 않았습니다");
    }

    const systemPrompt = `당신은 애착 이론 전문가입니다. 사용자의 애착 유형 검사 결과를 분석하여 상세하고 공감적인 피드백을 제공하세요.

분석 시 반드시 포함해야 할 내용:
1. 애착 유형의 특징 (200자 이상)
2. 일상생활에서 나타나는 패턴 (구체적 예시 3가지 이상)
3. 강점 (긍정적 특성 3가지)
4. 발전 가능성 (개선할 수 있는 영역 3가지)
5. 실천 가능한 조언 (구체적인 행동 제안 5가지)
6. 관계에서의 팁 (연인, 가족, 친구 관계에서 각각)

따뜻하고 공감적인 톤으로 작성하되, 전문적인 통찰력을 담아주세요.`;

    const userPrompt = `애착 유형 검사 결과:
- 유형: ${style}
- 불안 점수: ${anxietyScore.toFixed(2)}/7
- 회피 점수: ${avoidanceScore.toFixed(2)}/7

이 결과를 바탕으로 상세한 분석을 제공해주세요.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI 분석 실패:", aiResponse.status, errorText);
      throw new Error("AI 분석에 실패했습니다");
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices[0].message.content;

    console.log("✅ AI 분석 완료");

    // 결과 저장
    const { error: insertError } = await supabaseAdmin
      .from('test_results')
      .insert({
        user_id: user.id,
        test_type: 'attachment_style',
        results: {
          anxietyScore,
          avoidanceScore,
          style,
          answers,
          analysis
        },
        score: Math.round((14 - anxietyScore - avoidanceScore) * 10),
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error("결과 저장 실패:", insertError);
    }

    return new Response(JSON.stringify({ 
      success: true,
      analysis,
      style,
      anxietyScore,
      avoidanceScore
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("분석 오류:", error);
    const message = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
