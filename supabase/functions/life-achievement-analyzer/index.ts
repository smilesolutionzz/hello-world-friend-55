import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { results, totalScore, level } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Analyzing life achievements:', { totalScore, level, categoryCount: results.length });

    // 분석 생성
    const analysisPrompt = `사용자의 인생 업적 달성률을 반드시 2,000자 이상으로 매우 상세하게 분석해주세요.

전체 달성률: ${totalScore}%
레벨: ${level}

카테고리별 달성률:
${results.map(r => `${r.category}: ${r.score}%`).join('\n')}

다음 형식으로 분석해주세요 (각 섹션을 마크다운 형식으로 명확히 구분):

## 1. 종합평가 (300자 이상)
현재 인생 단계에 대한 따뜻하고 격려하는 종합 평가. 전체 달성률의 의미와 동년배 대비 수준 해석.

## 2. 카테고리별 상세 분석 (400자 이상)
각 카테고리 달성률의 의미와 상호 연관성. 균형도 분석.

## 3. 최고 강점 영역 (200자 이상)
가장 잘하고 있는 영역과 진심 어린 칭찬. 이 강점이 다른 영역에 미치는 긍정적 영향.

## 4. 성장 기회 영역 (200자 이상)
부드럽게 개선이 필요한 영역. 구체적 발전 방향과 현실적 기대치.

## 5. 맞춤 실천 목표 (300자 이상)
- 첫 번째 목표: [구체적 실행 가능한 목표와 방법]
- 두 번째 목표: [구체적 실행 가능한 목표와 방법]
- 세 번째 목표: [구체적 실행 가능한 목표와 방법]

## 6. 📋 응원 메시지 (200자 이상)
힘이 되는 마무리 메시지. 현재까지의 성취를 인정하고 앞으로의 여정에 대한 희망적 전망.

친근하고 따뜻한 톤으로 마크다운 형식을 사용하여 작성해주세요.`;

    const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: '당신은 따뜻하고 공감능력이 뛰어난 인생 코치입니다. 사용자를 격려하고 동기부여하는 것이 목표입니다.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 3000
      }),
    });

    if (!analysisResponse.ok) {
      const errorData = await analysisResponse.json();
      console.error('OpenAI analysis error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const analysisData = await analysisResponse.json();
    const analysis = analysisData.choices[0].message.content;

    console.log('Analysis generated successfully');

    // 이미지 생성 프롬프트
    const getLevelImagePrompt = (level: number) => {
      if (level <= 3) {
        return "A young seedling sprouting from soil, surrounded by warm sunlight, gentle watercolor style, hopeful and fresh atmosphere, digital art";
      } else if (level <= 5) {
        return "A person climbing a mountain with determination, reaching halfway, beautiful sunrise in background, inspirational digital art, vibrant colors";
      } else if (level <= 7) {
        return "A shining star person standing on a peak with arms spread wide, achievement glow, golden hour lighting, uplifting digital illustration";
      } else if (level <= 9) {
        return "A crowned figure surrounded by glowing achievements and success symbols, regal but warm atmosphere, golden particles, masterpiece digital art";
      } else {
        return "A legendary hero figure with trophy and achievement auras, surrounded by cosmic success energy, epic fantasy style, ultra detailed digital art";
      }
    };

    // 이미지 생성
    console.log('Generating achievement image...');
    const imagePrompt = getLevelImagePrompt(level);
    
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: imagePrompt,
        n: 1,
        size: '1024x1024',
        quality: 'high',
        output_format: 'png'
      }),
    });

    let imageUrl = null;
    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      imageUrl = imageData.data[0]?.b64_json 
        ? `data:image/png;base64,${imageData.data[0].b64_json}`
        : imageData.data[0]?.url;
      console.log('Image generated successfully');
    } else {
      console.error('Image generation failed:', await imageResponse.text());
    }

    // 목표 추출
    const goalMatches = analysis.match(/(?:첫 번째|두 번째|세 번째) 목표:\s*(.+?)(?=\n|$)/gi);
    const goals = goalMatches 
      ? goalMatches.map(match => match.replace(/(?:첫 번째|두 번째|세 번째) 목표:\s*/, '').trim())
      : [
          '건강을 위한 규칙적인 운동 시작하기',
          '재정 안정성을 위한 저축 계획 세우기',
          '취미 활동으로 삶의 균형 찾기'
        ];

    return new Response(
      JSON.stringify({
        analysis,
        goals: goals.slice(0, 3),
        imageUrl,
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in life-achievement-analyzer:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        analysis: '현재 분석 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.',
        goals: [
          '건강을 위한 규칙적인 운동 시작하기',
          '재정 안정성을 위한 저축 계획 세우기',
          '취미 활동으로 삶의 균형 찾기'
        ],
        imageUrl: null,
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
