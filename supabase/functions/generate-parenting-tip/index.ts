import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { childAge } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('Generating parenting tip for age:', childAge);

    const prompt = `${childAge}세 아이를 키우는 부모를 위한 오늘의 육아팁을 작성해주세요.

다음 형식으로 응답해주세요:
1. 제목 (20자 이내, 흥미로운 제목)
2. 본문 (150-200자, 실용적이고 따뜻한 조언)
3. 실천 방법 3가지 (각 30자 이내)

이 나이대의 발달 특성을 고려하여, 부모가 오늘 바로 실천할 수 있는 구체적이고 긍정적인 팁을 제공해주세요.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { 
            role: "system", 
            content: "당신은 아동발달 전문가입니다. 부모들에게 실용적이고 따뜻한 육아 조언을 제공합니다." 
          },
          { role: "user", content: prompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_parenting_tip",
              description: "오늘의 육아팁을 생성합니다",
              parameters: {
                type: "object",
                properties: {
                  title: { 
                    type: "string",
                    description: "흥미로운 육아팁 제목 (20자 이내)"
                  },
                  content: { 
                    type: "string",
                    description: "실용적인 육아 조언 본문 (150-200자)"
                  },
                  tips: {
                    type: "array",
                    items: { type: "string" },
                    description: "실천 방법 3가지 (각 30자 이내)"
                  }
                },
                required: ["title", "content", "tips"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_parenting_tip" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "크레딧이 부족합니다. 워크스페이스에 크레딧을 추가해주세요." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI 생성 요청 실패");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall || !toolCall.function?.arguments) {
      throw new Error("AI 응답을 파싱할 수 없습니다");
    }

    const tipData = JSON.parse(toolCall.function.arguments);

    console.log('Parenting tip generated successfully');

    return new Response(
      JSON.stringify(tipData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-parenting-tip:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "팁 생성 중 오류 발생" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
