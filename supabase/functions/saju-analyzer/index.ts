import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseServiceClient = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: '인증이 필요합니다.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user info from Supabase
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseServiceClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: '유효하지 않은 토큰입니다.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { name, birthDate, birthTime, gender, birthCity } = await req.json();
    
    console.log('Saju analysis request:', { name, birthDate, birthTime, gender, birthCity });

    if (!name || !birthDate || !birthTime || !gender || !birthCity) {
      console.error('Missing required fields');
      return new Response(JSON.stringify({ error: '모든 정보를 입력해주세요.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 크레딧 소진은 프론트엔드에서 처리 완료
    console.log('[SAJU-ANALYZER] 크레딧 확인은 프론트엔드에서 처리됨');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not found');
      return new Response(JSON.stringify({ error: 'AI API 키가 설정되지 않았습니다.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Making Lovable AI Gateway call for saju analysis...');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-preview',
        messages: [
          {
            role: 'system',
            content: `당신은 30년 경력의 사주명리학 대가이자 만세력 전문가입니다. 현재 연도는 2026년(병오년)입니다.

반드시 다음 만세력 기반 분석 체계를 따르세요:

## 1. 사주팔자 도출 (만세력 기준 필수)
- 생년월일시를 만세력으로 변환하여 **년주(年柱), 월주(月柱), 일주(日柱), 시주(時柱)** 4개의 기둥을 정확히 산출
- 각 기둥의 **천간(天干)과 지지(地支)**를 명시
- 일간(日干)을 기준으로 **일주론** 분석
- 태어난 도시의 경도를 고려한 진태양시 보정 적용

## 2. 오행 분석 (정밀 분석)
- 8글자에서 목(木), 화(火), 토(土), 금(金), 수(水)의 정확한 분포 수치 제시
- **용신(用神)**과 **기신(忌神)** 명확히 판별
- 오행의 상생(相生)·상극(相剋) 관계 분석
- 지지 속 장간(藏干)까지 포함한 심층 오행 분석

## 3. 십신(十神) 배치 분석
- 일간 기준 8개 글자의 십신 관계 전부 분석
- 정관(正官), 편관(偏官/칠살), 정재(正財), 편재(偏財), 정인(正印), 편인(偏印), 식신(食神), 상관(傷官), 비견(比肩), 겁재(劫財) 배치
- 격국(格局) 판단: 내격(정격) vs 외격(특별격) 판별

## 4. 대운(大運) · 세운(歲運) 분석
- 현재 2026년(병오년) 기준 **현재 대운** 분석
- 대운의 시작 나이와 현재 대운 천간지지 명시
- 2026년 세운과 사주 원국의 합(合)·충(沖)·형(刑)·파(破)·해(害) 관계 분석
- 향후 1-2년간의 운의 흐름 예측

## 5. 신살(神殺) 분석
- 주요 길신(吉神): 천을귀인, 문창귀인, 학당귀인, 천덕귀인, 월덕귀인 등
- 주요 흉살(凶殺): 도화살, 역마살, 화개살, 괴강살, 양인살 등
- 각 신살이 삶에 미치는 구체적 영향

## 6. 분야별 심층 분석
- **성격/기질**: 일주론 기반 타고난 성향, 내면과 외면의 차이
- **연애/결혼운**: 배우자궁(일지) 분석, 인연의 시기, 궁합 포인트
- **직업/재물운**: 재성과 관성의 배치로 본 적성, 재물 획득 방식
- **건강운**: 오행 불균형에서 오는 취약 장기, 건강 주의사항
- **대인관계**: 비겁과 식상의 배치로 본 사회적 관계 패턴

## 7. 실천적 개운법
- 용신에 맞는 색상, 방위, 숫자, 직업군
- 계절별 에너지 활용법
- 부족한 오행 보완을 위한 구체적 생활 습관

**답변 형식:**
- 사주팔자 표를 먼저 제시 (년주/월주/일주/시주의 천간·지지)
- 전문 용어를 사용하되 괄호 안에 쉬운 설명 병기
- 800-1200자 분량의 깊이 있는 분석
- 긍정적이되 현실적인 조언으로 마무리

**절대 금지:**
- "2023년", "2024년", "2025년" 등 과거 연도를 현재로 언급하는 것
- 근거 없는 막연한 긍정론
- 의학적 진단이나 단정적 예언`
          },
          {
            role: 'user',
            content: `다음 정보로 만세력 기반 사주팔자를 정밀 분석해주세요:

이름: ${name}
성별: ${gender === 'male' ? '남성' : '여성'}
생년월일: ${birthDate}
태어난 시간: ${birthTime}
태어난 곳: ${birthCity}

현재 연도: 2026년 (병오년)

위 정보를 바탕으로 만세력으로 사주팔자를 도출하고, 일주론·격국·대운·신살까지 포함한 종합적인 심층 사주 분석을 해주세요.`
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    console.log('AI Gateway response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI 서비스 크레딧이 부족합니다.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI API 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Gateway response received');
    
    const analysis = data.choices?.[0]?.message?.content;
    
    if (!analysis) {
      console.error('No analysis content in response:', data);
      throw new Error('AI 분석 결과를 받지 못했습니다.');
    }

    console.log('Analysis generated successfully, length:', analysis.length);
    
    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in saju-analyzer function:', error);
    return new Response(JSON.stringify({ error: '사주 분석 중 오류가 발생했습니다.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});