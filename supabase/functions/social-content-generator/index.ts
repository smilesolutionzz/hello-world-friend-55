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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const selectedChannels = channels || ['instagram', 'blog', 'threads'];
    const contents: ContentPost[] = [];

    for (const channel of selectedChannels) {
      const contentTypes = getContentTypesForChannel(channel);
      
      for (const contentType of contentTypes) {
        try {
          // Generate image
          const imagePrompt = getImagePrompt(channel, contentType.type);
          const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-image-preview",
              messages: [
                {
                  role: "user",
                  content: imagePrompt
                }
              ],
              modalities: ["image", "text"]
            })
          });

          if (!imageResponse.ok) {
            console.error(`Image generation failed for ${channel}-${contentType.type}: ${imageResponse.statusText}`);
            continue;
          }

          const imageData = await imageResponse.json();
          const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

          if (!imageUrl) {
            console.error(`No image URL for ${channel}-${contentType.type}`);
            continue;
          }

          // Generate content text
          const contentText = await generateContentText(
            channel,
            contentType.type, 
            LOVABLE_API_KEY, 
            institutionName, 
            contentTopic
          );

          contents.push({
            channel: channel as any,
            type: contentType.type,
            title: contentText.title,
            content: contentText.content,
            imageUrl: imageUrl,
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
      'story': 'Create a warm and emotional Instagram post background with soft gradients, warm colors (pink, orange, peach), and subtle bokeh effects. Minimalist and clean design suitable for personal storytelling. High quality, professional, 1080x1080 aspect ratio.',
      'lifestyle': 'Create a bright and stylish Instagram post background with modern aesthetics, clean lines, pastel colors (mint, lavender, cream), and minimalist geometric patterns. Perfect for lifestyle content. High quality, professional, 1080x1080 aspect ratio.',
      'knowledge': 'Create a professional and trustworthy Instagram post background with blue and white tones, subtle grid patterns, and clean modern design. Suitable for educational and knowledge-sharing content. High quality, professional, 1080x1080 aspect ratio.',
      'solution': 'Create an inspiring and energetic Instagram post background with vibrant colors (orange, yellow, green), dynamic shapes, and uplifting gradients. Perfect for problem-solving and motivational content. High quality, professional, 1080x1080 aspect ratio.'
    },
    'blog': {
      'howto': 'Create a professional blog header image with clean layout, modern typography space, instructional feel, blue and white color scheme. High quality, 1200x630 aspect ratio.',
      'casestudy': 'Create a data-driven blog header with charts, graphs, professional business aesthetic, blue and grey tones. High quality, 1200x630 aspect ratio.',
      'tips': 'Create a friendly and approachable blog header with bright colors, icons, bullet points aesthetic, warm and inviting. High quality, 1200x630 aspect ratio.',
      'insight': 'Create a thought-leadership blog header with abstract patterns, professional colors, deep blue and gold accents. High quality, 1200x630 aspect ratio.'
    },
    'threads': {
      'quick-tip': 'Create a simple and eye-catching Threads post background with bold colors, minimal design, fast-paced feel. Square format, 1080x1080.',
      'opinion': 'Create a discussion-oriented Threads background with speech bubble elements, conversational colors, warm tones. Square format, 1080x1080.',
      'question': 'Create an engaging question-style Threads background with question mark motifs, curious colors, interactive feel. Square format, 1080x1080.',
      'trend': 'Create a trendy and modern Threads background with dynamic shapes, vibrant gradients, energetic feel. Square format, 1080x1080.'
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

  let prompt = '';
  
  if (channel === 'instagram') {
    prompt = `당신은 인스타그램 콘텐츠 전문가입니다. "${contentType}" 주제로 사람들의 관심을 끄는 매력적인 인스타그램 게시글을 작성해주세요.${institutionContext}${topicContext}

요구사항:
1. 첫 문장부터 강력한 후킹으로 시작
2. 이모지를 적절히 활용하여 시각적으로 매력적이게
3. 단락을 나누어 가독성 좋게 작성
4. 실제 인스타그램 게시글처럼 자연스럽게
5. 마지막에 질문이나 행동 유도로 마무리

다음 JSON 형식으로 응답해주세요:
{
  "title": "이미지에 들어갈 짧은 제목 (10자 이내)",
  "content": "바로 복사해서 업로드할 수 있는 완성된 게시글 본문 (이모지 포함, 300-500자)",
  "hashtags": ["#해시태그1", "#해시태그2", "#해시태그3", "#해시태그4", "#해시태그5"]
}`;
  } else if (channel === 'blog') {
    prompt = `당신은 블로그 콘텐츠 전문가입니다. "${contentType}" 주제로 SEO에 최적화된 블로그 포스트를 작성해주세요.${institutionContext}${topicContext}

요구사항:
1. SEO 친화적인 제목 (60자 이내)
2. 구조화된 본문 (소제목 포함)
3. 읽기 쉬운 문단 구성
4. 전문적이면서도 접근하기 쉬운 톤
5. 실용적인 정보와 가치 제공

다음 JSON 형식으로 응답해주세요:
{
  "title": "SEO 최적화된 블로그 제목",
  "content": "마크다운 형식의 블로그 본문 (800-1200자, ## 소제목 포함)",
  "seoKeywords": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5"]
}`;
  } else if (channel === 'threads') {
    prompt = `당신은 Threads 콘텐츠 전문가입니다. "${contentType}" 주제로 대화를 유도하는 짧고 강렬한 포스트를 작성해주세요.${institutionContext}${topicContext}

요구사항:
1. 짧고 임팩트 있는 문장 (150-300자)
2. 대화를 시작하는 질문이나 의견
3. 이모지 1-2개 사용
4. 캐주얼하고 진솔한 톤
5. 리플라이를 유도하는 내용

다음 JSON 형식으로 응답해주세요:
{
  "title": "첫 줄 (20자 이내)",
  "content": "Threads 포스트 본문 (150-300자)",
  "hashtags": ["#해시태그1", "#해시태그2", "#해시태그3"]
}`;
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
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
