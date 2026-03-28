import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // 하위 호환: 기존 images 배열도 지원
    const files: { data: string; name: string; type: string }[] = body.files || 
      (body.images ? body.images.map((img: string, i: number) => ({ data: img, name: `image_${i+1}`, type: 'image/jpeg' })) : []);

    if (!files || files.length === 0) {
      throw new Error("파일이 제공되지 않았습니다.");
    }

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // 파일을 이미지와 문서로 분류
    const imageFiles = files.filter(f => IMAGE_TYPES.some(t => f.type.startsWith('image/') || f.data.startsWith('data:image/')));
    const documentFiles = files.filter(f => !IMAGE_TYPES.some(t => f.type.startsWith('image/') || f.data.startsWith('data:image/')));

    const contentParts: any[] = [
      {
        type: 'text',
        text: `다음 파일들은 심리검사, 발달검사, 의료검사, 또는 관련 평가 결과지입니다.
파일을 분석하여 다음 정보를 추출해주세요:
1. 검사 종류 (예: ADHD 검사, 우울증 검사, 발달평가, 혈액검사 등)
2. 주요 점수 및 수치
3. 결과 해석
4. 특이사항
5. 권장사항

구체적이고 정확하게 추출해주세요. 이미지가 아닌 문서 파일의 경우 텍스트 내용을 기반으로 분석해주세요.

${documentFiles.length > 0 ? `\n[문서 파일 ${documentFiles.length}개 포함: ${documentFiles.map(f => f.name).join(', ')}]\n아래에 문서 내용이 첨부되어 있습니다.` : ''}`
      }
    ];

    // 이미지 파일은 vision으로 전송
    for (const img of imageFiles) {
      contentParts.push({
        type: 'image_url',
        image_url: { url: img.data }
      });
    }

    // 문서 파일은 base64 데이터를 텍스트로 전달 (PDF 등은 vision 모델이 지원)
    for (const doc of documentFiles) {
      const isPdf = doc.type === 'application/pdf' || doc.name.toLowerCase().endsWith('.pdf');
      
      if (isPdf) {
        // PDF는 이미지로 처리 (Gemini는 PDF base64를 지원)
        contentParts.push({
          type: 'image_url',
          image_url: { url: doc.data }
        });
      } else {
        // 기타 문서는 텍스트로 전달
        contentParts.push({
          type: 'text',
          text: `\n--- 파일: ${doc.name} (${doc.type}) ---\n[이 파일은 ${doc.type} 형식입니다. base64로 인코딩된 파일 내용이 포함되어 있습니다. 파일명과 형식을 참고하여 검사 결과를 추론해주세요.]\n파일 데이터: ${doc.data.substring(0, 5000)}${doc.data.length > 5000 ? '...(truncated)' : ''}`
        });
      }
    }

    console.log(`[analyze-test-images] 분석 시작: 이미지 ${imageFiles.length}개, 문서 ${documentFiles.length}개`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'user',
            content: contentParts
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI 분석 실패: ${errorText}`);
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "분석 결과를 가져올 수 없습니다.";

    console.log(`[analyze-test-images] 분석 완료: ${analysis.length}자`);

    return new Response(JSON.stringify({ 
      success: true,
      analysis: analysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("파일 분석 오류:", errorMessage);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
