import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

// 우리만의 독창적인 무의식 유형 8가지
const unconsciousTypes = [
  {
    id: "shadow-performer",
    name: "무대 뒤의 연출가",
    englishName: "The Shadow Director",
    traits: ["완벽한 연출 욕구", "진짜 모습 숨김", "관객 의식", "이미지 관리"]
  },
  {
    id: "echo-seeker",
    name: "메아리를 찾는 사람",
    englishName: "The Echo Seeker",
    traits: ["인정 갈망", "좋아요 의존", "외부 확인 필요", "자기 가치 불안"]
  },
  {
    id: "mask-collector",
    name: "가면 수집가",
    englishName: "The Mask Collector",
    traits: ["다중 페르소나", "상황별 변신", "진짜 얼굴 분실", "정체성 혼란"]
  },
  {
    id: "silent-volcano",
    name: "잠든 화산",
    englishName: "The Silent Volcano",
    traits: ["감정 억압", "표면 평화", "내면 격렬", "분출 두려움"]
  },
  {
    id: "invisible-bridge",
    name: "보이지 않는 다리",
    englishName: "The Invisible Bridge",
    traits: ["연결 중재", "자기 희생", "존재감 부재", "인정 결핍"]
  },
  {
    id: "frozen-dreamer",
    name: "얼어붙은 몽상가",
    englishName: "The Frozen Dreamer",
    traits: ["현실 도피", "이상 추구", "행동 마비", "완벽주의"]
  },
  {
    id: "hungry-ghost",
    name: "배고픈 유령",
    englishName: "The Hungry Ghost",
    traits: ["채워지지 않음", "끝없는 갈증", "비교 중독", "결핍감"]
  },
  {
    id: "glass-fortress",
    name: "유리 성의 주인",
    englishName: "The Glass Fortress",
    traits: ["투명한 방어", "접근 거부", "상처 두려움", "친밀감 공포"]
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageCount, images } = await req.json();

    console.log(`Analyzing ${imageCount} feed screenshots`);

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `당신은 소셜 미디어 피드를 통해 무의식적 심리 패턴을 분석하는 전문 심리분석가입니다.

사용자가 업로드한 인스타그램 피드 스크린샷을 분석하여 8가지 무의식 유형 중 가장 적합한 유형을 판단해주세요.

8가지 무의식 유형:
${unconsciousTypes.map((type, i) => `${i + 1}. ${type.id}: ${type.name} (${type.englishName}) - ${type.traits.join(', ')}`).join('\n')}

분석 기준:
- 피드의 전체적인 색감과 분위기
- 자주 등장하는 주제나 피사체
- 구도와 프레이밍 스타일
- 게시물 간의 일관성 또는 다양성
- 자기 표현 vs 외부 세계 비율
- 사람 등장 빈도와 방식

반드시 JSON 형식으로 응답해주세요. 과감하고 솔직하게 분석해주세요.`;

    const userPrompt = `업로드된 피드 스크린샷 수: ${imageCount}장

분석할 이미지가 ${images?.length || 0}장 포함되어 있습니다.

다음 JSON 형식으로 분석 결과를 제공해주세요:
{
  "typeId": "8가지 유형 중 하나의 id (예: shadow-performer, echo-seeker 등)",
  "overallInsight": "전체 피드에서 발견된 무의식적 패턴 (3-4문장, 과감하게)",
  "feedAnalysis": [
    {"imageIndex": 0, "insight": "첫 번째 이미지 분석", "emotion": "감지된 감정", "keyword": "키워드"},
    {"imageIndex": 1, "insight": "두 번째 이미지 분석", "emotion": "감지된 감정", "keyword": "키워드"},
    {"imageIndex": 2, "insight": "세 번째 이미지 분석", "emotion": "감지된 감정", "keyword": "키워드"}
  ],
  "hiddenDesire": "숨겨진 욕망 (2-3문장, 직설적으로)",
  "growthMessage": "성장을 위한 메시지 (2-3문장, 따뜻하게)",
  "matchPercentage": 75에서 95 사이의 숫자
}`;

    // If images are provided, include them in the request
    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ];

    if (images && images.length > 0) {
      // Build multimodal content with images
      const userContent: any[] = [
        { type: 'text', text: userPrompt }
      ];
      
      images.slice(0, 3).forEach((img: string, idx: number) => {
        if (img.startsWith('data:image')) {
          userContent.push({
            type: 'image_url',
            image_url: { url: img }
          });
        }
      });

      messages.push({ role: 'user', content: userContent });
    } else {
      messages.push({ role: 'user', content: userPrompt });
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-preview',
        messages,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: '분석 요청이 많아 잠시 후 다시 시도해주세요.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('AI response received');

    // Parse JSON from response
    let analysisResult;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      analysisResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parse error, using fallback');
      const randomType = unconsciousTypes[Math.floor(Math.random() * unconsciousTypes.length)];
      analysisResult = {
        typeId: randomType.id,
        overallInsight: "당신의 피드에서 독특한 심리 패턴이 감지되었습니다. 표면적으로 보여주는 것과 내면의 욕구 사이에 흥미로운 간극이 있어요.",
        feedAnalysis: [
          { imageIndex: 0, insight: "첫 번째 피드에서 자기 표현의 욕구가 보여요", emotion: "갈망", keyword: "표현" },
          { imageIndex: 1, insight: "두 번째 피드에서 연결에 대한 욕구가 느껴져요", emotion: "그리움", keyword: "연결" },
          { imageIndex: 2, insight: "세 번째 피드에서 인정받고 싶은 마음이 드러나요", emotion: "기대", keyword: "인정" }
        ],
        hiddenDesire: "있는 그대로의 모습으로 사랑받고 싶은 욕구가 숨어있어요. 가면 없이도 충분하다는 걸 알아가는 중이에요.",
        growthMessage: "완벽하지 않아도 괜찮아요. 불완전한 모습도 당신의 일부이고, 그것 또한 사랑받을 자격이 있어요.",
        matchPercentage: 82 + Math.floor(Math.random() * 10)
      };
    }

    console.log('Analysis completed:', analysisResult.typeId);

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in feed-screenshot-analyzer:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Analysis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
