import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * 아동 연령(개월수) + 상담 포커스 + 라운드(T0/T30/T60)에 따라
 * 부모가 응답할 검사 문항을 자동 큐레이션
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { childAgeMonths, consultationFocus, roundLabel, childNickname } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const ageGroup = childAgeMonths < 36 ? '영아기(12-35개월)' : childAgeMonths < 60 ? '유아기(36-59개월)' : '학령전기(60-96개월)';
    const focusText = (consultationFocus || []).join(', ') || '전반적 발달';

    const prompt = `당신은 영유아 발달 전문가입니다. 어린이집/유치원 부모상담을 위해 부모가 가정에서 응답할 검사 문항을 자동 큐레이션해주세요.

## 아동 정보
- 닉네임: ${childNickname || '아이'}
- 월령: ${childAgeMonths}개월 (${ageGroup})
- 상담 포커스: ${focusText}
- 측정 라운드: ${roundLabel} ${roundLabel === 'T0' ? '(상담 전 베이스라인)' : roundLabel === 'T30' ? '(30일 후 개선도)' : '(60일 후 개선도)'}

## 요청 사항
다음 5개 영역에서 각 4문항씩 총 20문항을 생성하세요. ASQ-3와 K-CBCL 스타일을 참고하되, 부모가 일상에서 관찰 가능한 구체적 행동으로 작성:
1. 인지·언어 발달
2. 사회성·정서
3. 행동 패턴
4. 자조 능력
5. 가정 환경/부모 관찰

각 문항은 0~3점 척도(0=전혀 그렇지 않다 / 3=매우 그렇다)로 응답합니다.

## JSON 응답 형식
{
  "title": "${childNickname || '아이'}의 발달 체크 (${roundLabel})",
  "domains": [
    {
      "key": "cognitive_language",
      "label": "인지·언어 발달",
      "questions": [
        { "id": "q1", "text": "문항 내용", "reverse": false }
      ]
    }
  ],
  "estimated_minutes": 5
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: '영유아 발달 검사 문항을 JSON으로만 출력. 코드블록 없이 순수 JSON.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`AI gateway error: ${response.status} ${txt}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    const curated = JSON.parse(content);

    return new Response(JSON.stringify({ success: true, curated }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('curate error:', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
