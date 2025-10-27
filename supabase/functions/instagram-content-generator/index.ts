import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContentPost {
  type: '나의_이야기' | '라이프스타일' | '가진_지식' | '문제_해결';
  title: string;
  caption: string;
  originalImageUrl: string;
  textOverlayImageUrl: string;
  hashtags: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, institutionName, contentTopic } = await req.json();

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

    const contentTypes = [
      { type: '나의_이야기', emoji: '📖', title: '나의 이야기' },
      { type: '라이프스타일', emoji: '✨', title: '나의 라이프스타일' },
      { type: '가진_지식', emoji: '🎓', title: '내가 가진 지식' },
      { type: '문제_해결', emoji: '💡', title: '나의 문제 해결 사례' }
    ];

    const contents: ContentPost[] = [];

    for (const contentType of contentTypes) {
      // Generate original background image using Lovable AI
      const imagePrompt = getImagePrompt(contentType.type);
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
        throw new Error(`Image generation failed: ${imageResponse.statusText}`);
      }

      const imageData = await imageResponse.json();
      const originalImageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!originalImageUrl) {
        throw new Error('Failed to generate image');
      }

      // Generate content text using AI
      const contentText = await generateContentText(
        contentType.type, 
        LOVABLE_API_KEY, 
        institutionName, 
        contentTopic
      );

      // Create text overlay image
      const textOverlayImageUrl = await createTextOverlayImage(
        originalImageUrl, 
        contentText.title
      );

      contents.push({
        type: contentType.type as any,
        title: contentText.title,
        caption: contentText.caption,
        originalImageUrl: originalImageUrl,
        textOverlayImageUrl: textOverlayImageUrl,
        hashtags: contentText.hashtags
      });
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

function getImagePrompt(contentType: string): string {
  const prompts = {
    '나의_이야기': 'Create a warm and emotional Instagram post background with soft gradients, warm colors (pink, orange, peach), and subtle bokeh effects. Minimalist and clean design suitable for personal storytelling. High quality, professional, 1080x1080 aspect ratio.',
    '라이프스타일': 'Create a bright and stylish Instagram post background with modern aesthetics, clean lines, pastel colors (mint, lavender, cream), and minimalist geometric patterns. Perfect for lifestyle content. High quality, professional, 1080x1080 aspect ratio.',
    '가진_지식': 'Create a professional and trustworthy Instagram post background with blue and white tones, subtle grid patterns, and clean modern design. Suitable for educational and knowledge-sharing content. High quality, professional, 1080x1080 aspect ratio.',
    '문제_해결': 'Create an inspiring and energetic Instagram post background with vibrant colors (orange, yellow, green), dynamic shapes, and uplifting gradients. Perfect for problem-solving and motivational content. High quality, professional, 1080x1080 aspect ratio.'
  };
  return prompts[contentType] || prompts['나의_이야기'];
}

async function generateContentText(
  contentType: string, 
  apiKey: string,
  institutionName?: string,
  contentTopic?: string
) {
  const contentTypeExamples = {
    '나의_이야기': '개인적인 경험이나 일상 이야기',
    '라이프스타일': '일상 루틴, 취미, 라이프스타일 팁',
    '가진_지식': '전문 지식이나 노하우 공유',
    '문제_해결': '겪었던 문제와 해결 방법 공유'
  };

  const institutionContext = institutionName 
    ? `\n\n기관 정보: ${institutionName}\n이 기관의 관점에서 작성해주세요.` 
    : '';
  
  const topicContext = contentTopic 
    ? `\n특정 주제: ${contentTopic}\n이 주제와 관련된 내용으로 작성해주세요.` 
    : '';

  const prompt = `당신은 인스타그램 콘텐츠 전문가입니다. "${contentType}" (${contentTypeExamples[contentType]}) 주제로 사람들의 관심을 끄는 매력적인 인스타그램 게시글을 작성해주세요.${institutionContext}${topicContext}

요구사항:
1. 첫 문장부터 강력한 후킹으로 시작 (질문, 공감, 흥미로운 사실 등)
2. 이모지를 적절히 활용하여 시각적으로 매력적이게
3. 단락을 나누어 가독성 좋게 작성
4. 실제 인스타그램 게시글처럼 자연스럽게
5. 마지막에 질문이나 행동 유도로 마무리

다음 JSON 형식으로 응답해주세요:
{
  "title": "이미지에 들어갈 짧은 제목 (10자 이내)",
  "caption": "바로 복사해서 업로드할 수 있는 완성된 게시글 본문 (이모지 포함, 300-500자)",
  "hashtags": ["#해시태그1", "#해시태그2", "#해시태그3", "#해시태그4", "#해시태그5", "#해시태그6", "#해시태그7", "#해시태그8"]
}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
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
    throw new Error(`Content generation failed: ${response.statusText}`);
  }

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);
  return content;
}

async function createTextOverlayImage(baseImageUrl: string, title: string): Promise<string> {
  // Create canvas and draw text overlay
  // Since Deno doesn't have canvas, we'll use a simple SVG overlay approach
  
  // Convert base64 to blob if needed
  let imageData = baseImageUrl;
  
  // For now, return a data URL with SVG overlay
  // In production, you might want to use a proper image processing library
  const svgOverlay = `
    <svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.5"/>
        </filter>
      </defs>
      
      <!-- Semi-transparent gradient overlay -->
      <rect width="1080" height="1080" fill="url(#grad)" opacity="0.3"/>
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(0,0,0);stop-opacity:0" />
          <stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:0.8" />
        </linearGradient>
      </defs>
      
      <!-- Title text -->
      <text x="540" y="950" 
            font-family="Arial, sans-serif" 
            font-size="56" 
            font-weight="bold" 
            fill="white" 
            text-anchor="middle"
            filter="url(#shadow)">
        ${escapeXml(title)}
      </text>
    </svg>
  `;
  
  // Return the SVG as data URL
  const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgOverlay)))}`;
  
  // In a real implementation, you would composite this SVG over the base image
  // For now, we'll return a marker that this needs text overlay
  return baseImageUrl; // This will be enhanced in frontend
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
