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
  imageUrl: string;
  hashtags: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { brandInfo, targetAudience, action } = await req.json();
    console.log('요청:', { action, brandInfo, targetAudience });

    // 프롬프트 확장 기능
    if (action === 'expand-prompt') {
      const expandResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { 
              role: 'system', 
              content: '당신은 비즈니스 마케팅 전문가입니다. 사용자가 입력한 간단한 브랜드 정보를 구체적이고 전략적인 내용으로 확장해주세요. 브랜드의 핵심 가치, 차별점, 타겟 고객의 페인 포인트, 제공하는 솔루션 등을 명확하게 표현해주세요. 200-300자 정도로 확장하세요.'
            },
            { 
              role: 'user', 
              content: `다음 브랜드 정보를 구체적으로 확장해주세요:\n\n${brandInfo}` 
            }
          ]
        })
      });

      if (!expandResponse.ok) {
        throw new Error('프롬프트 확장 실패');
      }

      const expandData = await expandResponse.json();
      const expandedPrompt = expandData.choices?.[0]?.message?.content;

      return new Response(
        JSON.stringify({ 
          success: true,
          expandedPrompt
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // 4가지 콘텐츠 유형 정의
    const contentTypes = [
      {
        type: '나의_이야기',
        prompt: `브랜드: ${brandInfo}
타겟: ${targetAudience || '일반 고객'}

"1. 나의 이야기" 콘텐츠를 생성해주세요.
- 사람들이 브랜드의 '서사'에 연결되는 개인적이고 진정성 있는 스토리
- 브랜드를 시작하게 된 계기, 겪었던 어려움, 극복 과정
- 감정적 연결을 만드는 스토리텔링

다음 형식의 JSON으로 응답:
{
  "title": "제목 (20자 이내)",
  "mainText": "메인 스토리 (100자 이내)",
  "subPoints": ["포인트1", "포인트2", "포인트3"],
  "goal": "이 콘텐츠의 목적",
  "result": ["기대효과1", "기대효과2"],
  "hashtags": ["#해시태그1", "#해시태그2", "#해시태그3", "#해시태그4", "#해시태그5"],
  "imagePrompt": "이미지 생성을 위한 상세한 영문 프롬프트"
}`
      },
      {
        type: '라이프스타일',
        prompt: `브랜드: ${brandInfo}
타겟: ${targetAudience || '일반 고객'}

"2. 나의 라이프스타일" 콘텐츠를 생성해주세요.
- 브랜드 가치관과 일상이 어우러진 라이프스타일 콘텐츠
- 일상 루틴, 취미, 공간 등 브랜드 무드를 자연스럽게 전달
- 팔로워가 공감하고 동경할 만한 모습

다음 형식의 JSON으로 응답:
{
  "title": "제목 (20자 이내)",
  "mainText": "메인 텍스트 (100자 이내)",
  "subPoints": ["포인트1", "포인트2"],
  "goal": "이 콘텐츠의 목적",
  "result": ["기대효과1", "기대효과2"],
  "hashtags": ["#해시태그1", "#해시태그2", "#해시태그3", "#해시태그4", "#해시태그5"],
  "imagePrompt": "이미지 생성을 위한 상세한 영문 프롬프트"
}`
      },
      {
        type: '가진_지식',
        prompt: `브랜드: ${brandInfo}
타겟: ${targetAudience || '일반 고객'}

"3. 내가 가진 지식" 콘텐츠를 생성해주세요.
- 팔로워에게 실질적인 가치를 제공하는 전문 지식
- 구체적인 팁, 노하우, 인사이트
- 저장하고 싶은 유용한 정보

다음 형식의 JSON으로 응답:
{
  "title": "제목 (20자 이내)",
  "mainText": "메인 메시지 (100자 이내)",
  "subPoints": ["팁1", "팁2", "팁3"],
  "goal": "이 콘텐츠의 목적",
  "result": ["기대효과1", "기대효과2", "기대효과3"],
  "hashtags": ["#해시태그1", "#해시태그2", "#해시태그3", "#해시태그4", "#해시태그5"],
  "imagePrompt": "이미지 생성을 위한 상세한 영문 프롬프트"
}`
      },
      {
        type: '문제_해결',
        prompt: `브랜드: ${brandInfo}
타겟: ${targetAudience || '일반 고객'}

"4. 나의 문제 해결 사례" 콘텐츠를 생성해주세요.
- 직접 해결한 구체적인 사례와 결과
- 신뢰와 전문성을 보여주는 실제 케이스
- Before/After, 데이터, 구체적 결과 포함

다음 형식의 JSON으로 응답:
{
  "title": "제목 (20자 이내)",
  "mainText": "문제 상황과 해결 과정 (100자 이내)",
  "subPoints": ["해결방법1", "해결방법2"],
  "goal": "이 콘텐츠의 목적",
  "result": ["결과1", "결과2"],
  "hashtags": ["#해시태그1", "#해시태그2", "#해시태그3", "#해시태그4", "#해시태그5"],
  "imagePrompt": "이미지 생성을 위한 상세한 영문 프롬프트"
}`
      }
    ];

    const contents: ContentPost[] = [];

    // 각 콘텐츠 타입별로 생성
    for (const contentType of contentTypes) {
      try {
        console.log(`${contentType.type} 콘텐츠 생성 중...`);

        // 텍스트 콘텐츠 생성
        const textResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { 
                role: 'system', 
                content: '당신은 SNS 마케팅 전문가입니다. 인스타그램에 올릴 매력적이고 전략적인 콘텐츠를 생성합니다. 반드시 유효한 JSON 형식으로만 응답하세요.'
              },
              { role: 'user', content: contentType.prompt }
            ]
          })
        });

        if (!textResponse.ok) {
          console.error(`텍스트 생성 실패 (${contentType.type}):`, textResponse.status);
          continue;
        }

        const textData = await textResponse.json();
        const textContent = textData.choices?.[0]?.message?.content;
        
        // JSON 파싱
        let contentData;
        try {
          // JSON 블록 추출
          const jsonMatch = textContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            contentData = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('JSON 형식을 찾을 수 없습니다');
          }
        } catch (parseError) {
          console.error(`JSON 파싱 실패 (${contentType.type}):`, parseError);
          continue;
        }

        // 이미지 생성
        console.log(`${contentType.type} 이미지 생성 중...`);
        const imagePrompt = contentData.imagePrompt || `Modern Instagram post design for "${contentData.title}". Professional, clean, visually appealing, high quality.`;
        
        const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-image-preview',
            messages: [
              {
                role: 'user',
                content: imagePrompt
              }
            ],
            modalities: ['image', 'text']
          })
        });

        let imageUrl = '';
        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url || '';
        }

        contents.push({
          type: contentType.type as any,
          title: contentData.title || '제목 없음',
          mainText: contentData.mainText || '',
          subPoints: contentData.subPoints || [],
          goal: contentData.goal || '',
          result: contentData.result || [],
          hashtags: contentData.hashtags || [],
          imageUrl: imageUrl
        });

        console.log(`${contentType.type} 생성 완료`);

      } catch (error) {
        console.error(`${contentType.type} 생성 오류:`, error);
      }
    }

    if (contents.length === 0) {
      throw new Error('콘텐츠 생성에 실패했습니다');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        contents,
        message: `${contents.length}개의 콘텐츠가 생성되었습니다`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('콘텐츠 생성 오류:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
