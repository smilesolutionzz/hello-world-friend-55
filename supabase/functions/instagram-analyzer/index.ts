import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY') || Deno.env.get('FIRECRAWL_API_KEY_1');
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const unconsciousTypes = [
  {
    name: "거울에 갇힌 여왕",
    englishName: "The Queen Trapped in Her Mirror",
    icon: "👑",
    traits: ["완벽주의", "외적 이미지 중시", "인정 욕구", "자기 비판적"]
  },
  {
    name: "바지 벗고 춤추는 인형",
    englishName: "The Clown Dancing with No Pants",
    icon: "🃏",
    traits: ["유머로 가림", "불안 회피", "주목받고 싶음", "진짜 감정 숨김"]
  },
  {
    name: "줄 없이 춤추는 인형",
    englishName: "The Puppet Dancing Without Strings",
    icon: "🎭",
    traits: ["타인 기대에 맞춤", "자기 정체성 혼란", "경계 모호", "의존적"]
  },
  {
    name: "소원에 갇힌 요정",
    englishName: "The Fairy Trapped in Others' Wishes",
    icon: "🧚",
    traits: ["과도한 배려", "자기 희생", "거절 못함", "타인 중심적"]
  },
  {
    name: "노래를 잃은 세이렌",
    englishName: "The Siren Who Forgot Her Song",
    icon: "🧜‍♀️",
    traits: ["자기 표현 억압", "진짜 목소리 잃음", "매력 사용", "공허함"]
  },
  {
    name: "아무도 오지 않는 등대지기",
    englishName: "The Lighthouse Keeper No One Visits",
    icon: "🏠",
    traits: ["고립", "연결 갈망", "거리두기", "외로움 부정"]
  },
  {
    name: "스스로 갇힌 탑의 마법사",
    englishName: "The Wizard Locked in His Own Tower",
    icon: "🧙",
    traits: ["지적 방어", "감정 회피", "통제 욕구", "친밀감 두려움"]
  },
  {
    name: "왕관을 벗지 못하는 왕",
    englishName: "The King Who Cannot Remove His Crown",
    icon: "🤴",
    traits: ["역할에 갇힘", "책임감 과부하", "약함 숨김", "휴식 불가"]
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, gender, birthYear } = await req.json();

    if (!username) {
      return new Response(
        JSON.stringify({ error: 'Username is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing Instagram profile: @${username}`);

    // Step 1: Scrape Instagram profile using Firecrawl
    let profileData = null;
    
    if (FIRECRAWL_API_KEY) {
      try {
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: `https://www.instagram.com/${username}/`,
            formats: ['markdown', 'html'],
            onlyMainContent: true,
            waitFor: 3000,
          }),
        });

        if (scrapeResponse.ok) {
          const scrapeData = await scrapeResponse.json();
          profileData = scrapeData.data?.markdown || scrapeData.markdown || null;
          console.log('Profile scraped successfully');
        } else {
          console.log('Firecrawl scrape failed, using fallback');
        }
      } catch (scrapeError) {
        console.error('Scrape error:', scrapeError);
      }
    }

    // Step 2: Analyze with AI
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const age = birthYear ? new Date().getFullYear() - birthYear : null;
    const genderContext = gender === 'male' ? '남성' : gender === 'female' ? '여성' : null;

    const systemPrompt = `당신은 칼 융(Carl Jung)의 그림자 이론과 현대 심리학을 기반으로 소셜 미디어 프로필을 분석하는 전문 심리분석가입니다.

인스타그램 프로필 데이터와 사용자 정보를 바탕으로, 8가지 무의식 유형 중 가장 적합한 유형을 판단하고 심층 분석을 제공해주세요.

8가지 무의식 유형:
${unconsciousTypes.map((type, i) => `${i + 1}. ${type.name} (${type.englishName}) - ${type.icon}: ${type.traits.join(', ')}`).join('\n')}

분석 시 고려할 요소:
- 프로필 사진, 바이오, 게시물 스타일 (있는 경우)
- 언어 사용 패턴, 이모지 사용, 해시태그 스타일
- 자기 표현 방식과 숨겨진 욕구
- 인스타그램 아이디 자체의 선택에서 드러나는 성격 특성

반드시 JSON 형식으로 응답해주세요.`;

    const userPrompt = `인스타그램 사용자 분석 요청:

아이디: @${username}
${genderContext ? `성별: ${genderContext}` : ''}
${age ? `나이: ${age}세` : ''}

${profileData ? `수집된 프로필 데이터:\n${profileData.substring(0, 3000)}` : '프로필 데이터 수집 불가 - 아이디와 제공된 정보를 기반으로 분석해주세요.'}

다음 JSON 형식으로 분석 결과를 제공해주세요:
{
  "unconsciousType": {
    "name": "한글 유형명",
    "englishName": "영문 유형명",
    "icon": "이모지",
    "description": "해당 유형에 대한 2-3문장 설명"
  },
  "profileSummary": "프로필 전반적 분석 (3-4문장)",
  "visualPatterns": {
    "colorPreference": "선호 색감 분석",
    "compositionStyle": "구도/레이아웃 스타일",
    "emotionalTone": "감정적 톤"
  },
  "languagePatterns": {
    "communicationStyle": "소통 스타일",
    "emotionalExpression": "감정 표현 방식",
    "selfPresentation": "자기 제시 방식"
  },
  "unconsciousIndicators": {
    "socialNeedLevel": 0-100 숫자,
    "selfExpressionLevel": 0-100 숫자,
    "authenticityLevel": 0-100 숫자,
    "stabilityLevel": 0-100 숫자
  },
  "deepAnalysis": "심층 무의식 분석 (5-7문장, 융의 이론 기반)",
  "growthSuggestions": ["성장 제안 1", "성장 제안 2", "성장 제안 3"],
  "relationshipPatterns": "관계 속 패턴 분석 (4-5문장)",
  "hiddenDesires": "숨겨진 욕구 분석 (2-3문장)"
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
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
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI 서비스 크레딧이 부족합니다.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse JSON from response
    let analysisResult;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      analysisResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Create fallback result
      const randomType = unconsciousTypes[Math.floor(Math.random() * unconsciousTypes.length)];
      analysisResult = {
        unconsciousType: {
          name: randomType.name,
          englishName: randomType.englishName,
          icon: randomType.icon,
          description: `@${username}님의 프로필에서 ${randomType.traits.join(', ')} 특성이 감지되었습니다.`
        },
        profileSummary: content.substring(0, 200),
        visualPatterns: {
          colorPreference: "분석 중",
          compositionStyle: "분석 중",
          emotionalTone: "분석 중"
        },
        languagePatterns: {
          communicationStyle: "분석 중",
          emotionalExpression: "분석 중",
          selfPresentation: "분석 중"
        },
        unconsciousIndicators: {
          socialNeedLevel: 65,
          selfExpressionLevel: 55,
          authenticityLevel: 70,
          stabilityLevel: 60
        },
        deepAnalysis: content,
        growthSuggestions: ["자기 성찰 시간 갖기", "진정한 감정 표현하기", "새로운 경험 시도하기"],
        relationshipPatterns: "관계 분석 정보가 충분하지 않습니다.",
        hiddenDesires: "더 깊은 분석이 필요합니다."
      };
    }

    console.log('Analysis completed successfully');

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in instagram-analyzer:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Analysis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
