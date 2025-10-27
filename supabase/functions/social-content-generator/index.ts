import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContentPost {
  channel: 'instagram' | 'blog' | 'threads';
  type: string;
  title: string;
  content: string;
  imageUrl: string;
  hashtags?: string[];
  seoKeywords?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, institutionName, contentTopic, channels } = await req.json();

    if (action !== 'generate') {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const selectedChannels = channels || ['instagram', 'blog', 'threads'];
    const contents: ContentPost[] = [];

    for (const channel of selectedChannels) {
      const contentTypes = getContentTypesForChannel(channel);
      
      for (const contentType of contentTypes) {
        try {
          // Generate image using OpenAI
          const imagePrompt = getImagePrompt(channel, contentType.type);
          const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-image-1",
              prompt: imagePrompt,
              n: 1,
              size: "1024x1024",
              quality: "high",
              output_format: "png"
            })
          });

          if (!imageResponse.ok) {
            const errorText = await imageResponse.text();
            console.error(`Image generation failed for ${channel}-${contentType.type}: ${imageResponse.statusText}`, errorText);
            continue;
          }

          const imageData = await imageResponse.json();
          const imageUrl = imageData.data?.[0]?.b64_json;

          if (!imageUrl) {
            console.error(`No image data for ${channel}-${contentType.type}`);
            continue;
          }

          const base64ImageUrl = `data:image/png;base64,${imageUrl}`;

          // Generate content text using OpenAI
          const contentText = await generateContentText(
            channel,
            contentType.type, 
            OPENAI_API_KEY, 
            institutionName, 
            contentTopic
          );

          contents.push({
            channel: channel as any,
            type: contentType.type,
            title: contentText.title,
            content: contentText.content,
            imageUrl: base64ImageUrl,
            hashtags: contentText.hashtags,
            seoKeywords: contentText.seoKeywords
          });
        } catch (error) {
          console.error(`Error generating content for ${channel}-${contentType.type}:`, error);
        }
      }
    }

    return new Response(
      JSON.stringify({ contents }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function getContentTypesForChannel(channel: string) {
  const contentTypes = {
    'instagram': [
      { type: 'story', emoji: '📖', title: '나의 이야기' },
      { type: 'lifestyle', emoji: '✨', title: '라이프스타일' },
      { type: 'knowledge', emoji: '🎓', title: '전문 지식' },
      { type: 'solution', emoji: '💡', title: '문제 해결' }
    ],
    'blog': [
      { type: 'howto', emoji: '📝', title: '가이드' },
      { type: 'casestudy', emoji: '📊', title: '사례 연구' },
      { type: 'tips', emoji: '💡', title: '팁과 노하우' },
      { type: 'insight', emoji: '🔍', title: '인사이트' }
    ],
    'threads': [
      { type: 'quick-tip', emoji: '⚡', title: '빠른 팁' },
      { type: 'opinion', emoji: '💭', title: '의견 공유' },
      { type: 'question', emoji: '❓', title: '질문 던지기' },
      { type: 'trend', emoji: '🔥', title: '트렌드' }
    ]
  };
  return contentTypes[channel] || contentTypes['instagram'];
}

function getImagePrompt(channel: string, contentType: string): string {
  const prompts = {
    'instagram': {
      'story': 'A warm and emotional Instagram post background with soft gradients, warm colors like pink, orange, and peach, subtle bokeh effects. Minimalist and clean design suitable for personal storytelling. High quality, professional, square 1:1 aspect ratio.',
      'lifestyle': 'A bright and stylish Instagram post background with modern aesthetics, clean lines, pastel colors like mint, lavender, and cream, minimalist geometric patterns. Perfect for lifestyle content. High quality, professional, square 1:1 aspect ratio.',
      'knowledge': 'A professional and trustworthy Instagram post background with blue and white tones, subtle grid patterns, and clean modern design. Suitable for educational and knowledge-sharing content. High quality, professional, square 1:1 aspect ratio.',
      'solution': 'An inspiring and energetic Instagram post background with vibrant colors like orange, yellow, and green, dynamic shapes, and uplifting gradients. Perfect for problem-solving and motivational content. High quality, professional, square 1:1 aspect ratio.'
    },
    'blog': {
      'howto': 'A professional blog header image with clean layout, modern typography space, instructional feel, blue and white color scheme. High quality, 16:9 aspect ratio.',
      'casestudy': 'A data-driven blog header with abstract charts and graphs elements, professional business aesthetic, blue and grey tones. High quality, 16:9 aspect ratio.',
      'tips': 'A friendly and approachable blog header with bright colors, icon-style elements, bullet points aesthetic, warm and inviting. High quality, 16:9 aspect ratio.',
      'insight': 'A thought-leadership blog header with abstract patterns, professional colors, deep blue and gold accents. High quality, 16:9 aspect ratio.'
    },
    'threads': {
      'quick-tip': 'A simple and eye-catching Threads post background with bold colors, minimal design, fast-paced feel. Square format, 1:1 aspect ratio.',
      'opinion': 'A discussion-oriented Threads background with speech bubble elements, conversational colors, warm tones. Square format, 1:1 aspect ratio.',
      'question': 'An engaging question-style Threads background with question mark motifs, curious colors, interactive feel. Square format, 1:1 aspect ratio.',
      'trend': 'A trendy and modern Threads background with dynamic shapes, vibrant gradients, energetic feel. Square format, 1:1 aspect ratio.'
    }
  };
  return prompts[channel]?.[contentType] || prompts['instagram']['story'];
}

async function generateContentText(
  channel: string,
  contentType: string, 
  apiKey: string,
  institutionName?: string,
  contentTopic?: string
) {
  const institutionContext = institutionName 
    ? `\n\n기관 정보: ${institutionName}\n이 기관의 관점에서 작성해주세요.` 
    : '';
  
  const topicContext = contentTopic 
    ? `\n특정 주제: ${contentTopic}\n이 주제와 관련된 내용으로 작성해주세요.` 
    : '';

  let systemPrompt = '';
  let userPrompt = '';
  
  if (channel === 'instagram') {
    systemPrompt = `당신은 자연스럽고 인간적인 인스타그램 콘텐츠를 작성하는 소셜 미디어 전문가입니다. 
AI가 쓴 것처럼 느껴지지 않도록, 실제 사람이 쓴 것처럼 자연스럽고 따뜻하게 작성하세요.
볼드체나 불필요한 강조 없이 담백하게 작성하세요.`;

    userPrompt = `"${contentType}" 주제로 인스타그램 게시글을 작성해주세요.${institutionContext}${topicContext}

작성 가이드:
- 진솔하고 따뜻한 대화체로 작성 (실제 사람이 쓴 느낌)
- 자연스러운 문장과 친근한 어투
- 이모지는 딱 필요한 곳에만 1-2개 사용
- 볼드체나 특수문자 강조 없이 깔끔하게
- 마지막은 가볍게 질문이나 공감을 유도

다음 JSON 형식으로만 응답:
{
  "title": "이미지에 들어갈 짧은 제목 (10자 이내)",
  "content": "자연스러운 게시글 본문 (300-500자)",
  "hashtags": ["#해시태그1", "#해시태그2", "#해시태그3", "#해시태그4", "#해시태그5"]
}`;
  } else if (channel === 'blog') {
    systemPrompt = `당신은 전문적이면서도 읽기 쉬운 블로그 글을 작성하는 콘텐츠 전문가입니다.
AI가 쓴 것처럼 느껴지지 않도록 자연스럽고 실용적으로 작성하세요.
불필요한 볼드체나 강조 없이 깔끔하게 작성하세요.`;

    userPrompt = `"${contentType}" 주제로 블로그 포스트를 작성해주세요.${institutionContext}${topicContext}

작성 가이드:
- 자연스럽고 읽기 쉬운 문체
- 소제목은 ## 로만 구분 (볼드 없이)
- 실용적이고 구체적인 정보 제공
- 전문적이지만 어렵지 않게

다음 JSON 형식으로만 응답:
{
  "title": "SEO 최적화된 블로그 제목 (60자 이내)",
  "content": "마크다운 형식의 본문 (800-1200자, ## 소제목만 사용, 볼드 없음)",
  "seoKeywords": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5"]
}`;
  } else if (channel === 'threads') {
    systemPrompt = `당신은 캐주얼하고 대화를 잘 이끄는 Threads 콘텐츠 작성자입니다.
AI가 쓴 것처럼 느껴지지 않도록 자연스럽고 진솔하게 작성하세요.`;

    userPrompt = `"${contentType}" 주제로 Threads 포스트를 작성해주세요.${institutionContext}${topicContext}

작성 가이드:
- 짧고 자연스러운 대화체
- 이모지 1개만 사용
- 볼드나 강조 없이 깔끔하게
- 대화를 유도하는 가벼운 질문이나 의견

다음 JSON 형식으로만 응답:
{
  "title": "첫 줄 (20자 이내)",
  "content": "Threads 포스트 본문 (150-300자)",
  "hashtags": ["#해시태그1", "#해시태그2", "#해시태그3"]
}`;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5-2025-08-07",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Content generation failed: ${response.statusText}`, errorText);
    throw new Error(`Content generation failed: ${response.statusText}`);
  }

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);
  return content;
}
