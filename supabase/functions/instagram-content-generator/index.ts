import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContentPost {
  type: '나의_이야기' | '라이프스타일' | '가진_지식' | '문제_해결';
  title: string;
  mainText: string;
  subPoints: string[];
  goal: string;
  result: string[];
  originalImageUrl: string;
  textOverlayImageUrl: string;
  hashtags: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();

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
      const contentText = await generateContentText(contentType.type, LOVABLE_API_KEY);

      // Create text overlay image
      const textOverlayImageUrl = await createTextOverlayImage(
        originalImageUrl, 
        contentText.title,
        contentText.mainText
      );

      contents.push({
        type: contentType.type as any,
        title: contentText.title,
        mainText: contentText.mainText,
        subPoints: contentText.subPoints,
        goal: contentText.goal,
        result: contentText.result,
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

async function generateContentText(contentType: string, apiKey: string) {
  const prompt = `당신은 인스타그램 콘텐츠 전문가입니다. "${contentType}" 주제로 매력적인 게시물 내용을 한국어로 작성해주세요.

다음 JSON 형식으로 응답해주세요:
{
  "title": "매력적인 제목 (15자 이내)",
  "mainText": "메인 텍스트 (40자 이내, 흥미롭고 공감되는 내용)",
  "subPoints": ["포인트1", "포인트2", "포인트3"] (각 15자 이내),
  "goal": "이 콘텐츠의 목적 (30자 이내)",
  "result": ["기대결과1", "기대결과2"],
  "hashtags": ["#해시태그1", "#해시태그2", "#해시태그3", "#해시태그4", "#해시태그5"]
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

async function createTextOverlayImage(baseImageUrl: string, title: string, mainText: string): Promise<string> {
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
      <text x="540" y="880" 
            font-family="Arial, sans-serif" 
            font-size="48" 
            font-weight="bold" 
            fill="white" 
            text-anchor="middle"
            filter="url(#shadow)">
        ${escapeXml(title)}
      </text>
      
      <!-- Main text -->
      <text x="540" y="950" 
            font-family="Arial, sans-serif" 
            font-size="32" 
            fill="white" 
            text-anchor="middle"
            filter="url(#shadow)">
        ${escapeXml(mainText)}
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
