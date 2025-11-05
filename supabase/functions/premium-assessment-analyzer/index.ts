import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// 베타 테스트 기간 체크 (2025년 10월 30일까지 모든 기능 무료)
const BETA_END_DATE = new Date('2025-10-30T23:59:59Z');
const isBetaPeriod = () => {
  const now = new Date();
  const isInBeta = now < BETA_END_DATE;
  console.log('[BETA-CHECK]', { now: now.toISOString(), betaEnd: BETA_END_DATE.toISOString(), isInBeta });
  return isInBeta;
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseServiceClient = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

    const requestBody = await req.json();
    const { assessmentType, results, answers, assessmentInfo, testType } = requestBody;
    
    // results 또는 answers 중 하나를 사용 (유연성 제공)
    const actualResults = results || answers;
    const actualAssessmentType = assessmentType || testType || 'han_medicine_premium';
    
    // 데이터 구조 검증 로깅
    console.log('[PREMIUM-ASSESSMENT-ANALYZER] 요청 데이터 구조:', {
      assessmentType: actualAssessmentType,
      resultsType: typeof actualResults,
      resultsKeys: actualResults ? Object.keys(actualResults) : [],
      resultsValues: actualResults ? Object.values(actualResults) : [],
      resultsSample: actualResults ? Object.entries(actualResults).slice(0, 3) : [],
      requestBodyKeys: Object.keys(requestBody)
    });
    
    // Input validation
    if (!actualResults || typeof actualResults !== 'object') {
      console.error('[PREMIUM-ASSESSMENT-ANALYZER] 유효하지 않은 데이터:', { requestBody });
      return new Response(JSON.stringify({ error: '유효하지 않은 결과 데이터입니다.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // 빈 객체 검증
    if (Object.keys(actualResults).length === 0) {
      console.error('[PREMIUM-ASSESSMENT-ANALYZER] 빈 결과 데이터:', { requestBody });
      return new Response(JSON.stringify({ error: '결과 데이터가 비어있습니다.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 베타 기간 중에는 토큰 차감 생략
    if (!isBetaPeriod()) {
      // 토큰 차감 처리 (프리미엄 검사는 8토큰)
      const tokenCost = 8;
      
      // 현재 토큰 잔액 확인
      const { data: tokenData, error: tokenError } = await supabaseServiceClient
        .from('user_tokens')
        .select('current_tokens, total_used')
        .eq('user_id', user.id)
        .single();

      if (tokenError || !tokenData) {
        return new Response(JSON.stringify({ 
          error: '토큰 정보를 확인할 수 없습니다.' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (tokenData.current_tokens < tokenCost) {
        return new Response(JSON.stringify({ 
          error: `분석을 위해 ${tokenCost}개의 토큰이 필요합니다. 현재 토큰: ${tokenData.current_tokens}개` 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 토큰 차감
      const { error: updateError } = await supabaseServiceClient
        .from('user_tokens')
        .update({ 
          current_tokens: tokenData.current_tokens - tokenCost,
          total_used: tokenData.total_used + tokenCost 
        })
        .eq('user_id', user.id);

      if (updateError) {
        throw new Error('토큰 차감 중 오류가 발생했습니다.');
      }

      console.log(`프리미엄 검사 분석 - 토큰 차감: ${tokenCost}, 잔액: ${tokenData.current_tokens - tokenCost}`);
    } else {
      console.log('[PREMIUM-ASSESSMENT-ANALYZER] 베타 기간 - 토큰 차감 생략');
    }

    console.log('[PREMIUM-ASSESSMENT-ANALYZER] 프리미엄 분석 시작:', { 
      actualAssessmentType, 
      resultsCount: Object.keys(actualResults).length,
      assessmentInfo: assessmentInfo?.title 
    });

    // 검사 타입별 전문가 프롬프트 생성
    const getExpertPrompt = (type: string) => {
      const prompts = {
        'tci': {
          system: `당신은 심리 상담 전문가로, TCI 성격검사 결과를 일반인이 쉽게 이해할 수 있도록 설명하는 역할입니다. 

**작성 원칙:**
1. **쉬운 언어 사용**: 전문 용어는 반드시 쉬운 말로 풀어서 설명 (예: "자극추구" → "새로운 것을 좋아하는 성향")
2. **구체적인 일상 예시**: 실제 생활에서 나타나는 모습을 생생하게 설명
3. **공감하는 어조**: 독자의 상황을 이해하고 공감하는 따뜻한 톤
4. **실천 가능한 조언**: 바로 실천할 수 있는 구체적이고 현실적인 팁
5. **긍정적 관점**: 단점도 성장 가능성의 관점에서 설명

**분석 깊이:** 2500-3500자 (읽기 편한 분량)
**어조:** 친근하고 따뜻한 상담가의 말투`,
          
          user: `안녕하세요! ${assessmentInfo?.title || 'TCI 성격검사'}를 받아주셔서 감사합니다.

**검사 결과:**
${Object.entries(actualResults).map(([dimension, score]) => `- ${dimension}: ${score}점`).join('\n')}

위 결과를 바탕으로, 구독자분이 쉽게 이해할 수 있도록 다음 구조로 따뜻하고 구체적으로 설명해주세요:

**📌 작성 가이드:**
1. **나의 성격 한눈에 보기** (3-4줄)
   - 전문 용어 없이 일상 언어로 핵심 특징 요약
   - "당신은 ~한 사람입니다" 형식으로 직접 말하기

2. **성격의 주요 특징들** (각 차원별로 쉽게 풀어서)
   - 각 점수가 일상생활에서 어떻게 나타나는지 구체적 예시
   - "예를 들어, 회사에서는~", "친구들과 있을 때는~" 같은 실제 상황
   - 높거나 낮은 점수가 갖는 장단점을 균형있게

3. **이런 점이 당신의 강점이에요** ✨
   - 3-4가지 구체적인 강점과 그 활용법
   - 실제 생활에서 어떻게 활용할 수 있는지

4. **이런 부분을 조금만 신경쓰면 더 좋아요** 💡
   - 개선하면 좋을 점들을 부드럽게 제안
   - "~해야 합니다"가 아닌 "~해보시면 어떨까요?" 톤

5. **오늘부터 바로 실천해볼 3가지** 🎯
   - 구체적이고 실천 가능한 행동 제안
   - 작은 것부터 시작할 수 있는 팁

6. **마무리 응원 메시지** 💝
   - 격려와 희망의 메시지
   - 필요시 전문가 상담 권유 (강요가 아닌 제안)`
        },

        'big5': {
          system: `당신은 심리 상담 전문가로, Big Five 성격검사 결과를 일반인이 쉽게 이해하고 활용할 수 있도록 설명하는 역할입니다.

**작성 원칙:**
1. **쉬운 언어**: 학술 용어 대신 일상적인 표현 사용
2. **구체적 예시**: "사교적이다" 대신 "새로운 사람 만나는 것을 즐긴다" 처럼 구체적으로
3. **균형잡힌 시각**: 모든 성격 특성은 장단점이 있음을 강조
4. **실용적 조언**: 직장, 연애, 친구관계 등 실제 삶에 적용할 수 있는 팁
5. **따뜻한 격려**: 판단하지 않고 있는 그대로를 긍정

**분석 깊이:** 2500-3500자 (부담없이 읽을 수 있는 분량)
**어조:** 친구에게 조언하듯 친근하고 따뜻하게`,
          
          user: `안녕하세요! ${assessmentInfo?.title || 'Big Five 성격검사'}를 완료하셨네요.

**나의 성격 점수:**
${Object.entries(actualResults).map(([factor, score]) => `- ${factor}: ${score}점`).join('\n')}

이 결과를 일상 언어로 쉽게 풀어서 설명해주세요:

**📝 작성 구조:**
1. **나는 이런 사람이에요** (3-4줄 요약)
   - Big Five를 모르는 사람도 이해할 수 있게
   - "당신은 ~한 성향의 사람입니다" 형식

2. **성격 특성 하나하나 살펴보기**
   각 요인별로:
   - 이 특성이 일상에서 어떻게 나타나는지 (직장, 친구관계, 연애 등)
   - 점수가 높거나 낮을 때의 실제 모습
   - 장점과 주의할 점을 균형있게

3. **당신만의 특별한 강점** ⭐
   - 4-5가지 강점과 그 활용 방법
   - "이런 상황에서 이렇게 활용하세요" 식의 구체적 가이드

4. **더 성장하려면** 🌱
   - 부드럽게 제안하는 개선점
   - 강요가 아닌 "~해보면 좋을 것 같아요" 톤

5. **실천 가이드** 💪
   - 오늘부터 시도할 수 있는 3가지 구체적 행동
   - 작고 쉬운 것부터 제안

6. **응원의 한마디** 🎈
   - 따뜻한 격려와 지지
   - 필요하면 전문가 도움 받기를 권유 (부담없이)`
        },

        'han_medicine': {
          system: `당신은 한의학 상담 전문가로, 체질 검사 결과를 일반인이 쉽게 이해하고 일상에서 활용할 수 있도록 설명하는 역할입니다.

**작성 원칙:**
1. **쉬운 한의학**: 어려운 한의학 용어는 쉬운 말로 풀어서 설명
2. **실생활 중심**: 바로 실천할 수 있는 음식, 생활습관 조언
3. **과학과 전통의 균형**: 근거는 있되 너무 학술적이지 않게
4. **개인 맞춤형**: "일반적으로"가 아닌 "당신에게는" 관점
5. **긍정적 접근**: 체질의 약점보다는 강점과 활용법 강조

**분석 깊이:** 2500-3500자
**어조:** 동네 한의원 원장님의 친절한 상담 느낌`,
          
          user: `안녕하세요! ${assessmentInfo?.title || '한의학 체질검사'} 결과가 나왔어요.

**체질 점수:**
${Object.entries(actualResults).map(([aspect, score]) => `- ${aspect}: ${score}점`).join('\n')}

이 결과를 바탕으로 일상생활에서 바로 활용할 수 있도록 쉽게 설명해주세요:

**📋 작성 가이드:**
1. **내 체질은?** (3-4줄)
   - 어떤 체질인지, 그게 뭘 의미하는지 쉽게
   - "당신은 ~한 체질이에요" 형식

2. **내 몸의 특징 이해하기** 
   - 이 체질이 몸에서 어떻게 나타나는지
   - 왜 특정 음식이나 계절에 민감한지
   - 일상에서 느끼는 증상들과 연결

3. **나에게 좋은 음식** 🍽️
   - 구체적인 음식 이름 (예: "삼계탕" 대신 "닭고기, 인삼, 대추")
   - 왜 좋은지 간단히 설명
   - 피해야 할 음식도 이유와 함께

4. **건강한 생활 습관** 🏃
   - 운동, 수면, 일상 루틴에 대한 조언
   - 계절별로 주의할 점
   - 체질에 맞는 스트레스 관리법

5. **간단한 자가 관리법** 💆
   - 집에서 할 수 있는 쉬운 지압이나 마사지
   - 체질에 맞는 차 추천
   - 건강 유지 팁

6. **주의사항과 응원** ⚠️💝
   - 조심해야 할 신호들
   - 한의원 방문이 필요한 경우
   - 격려의 메시지`
        },

        'default': {
          system: `당신은 심리 상담 전문가로, 다양한 심리검사 결과를 일반인이 이해하고 삶에 적용할 수 있도록 설명하는 역할입니다.

**작성 원칙:**
1. **공감과 이해**: 검사 받은 용기를 격려하고 결과를 있는 그대로 수용
2. **실용적 해석**: 점수의 의미를 일상 언어로 설명
3. **균형잡힌 시각**: 강점과 개선점을 모두 다루되 긍정적 관점 유지
4. **실천 가능성**: 구체적이고 현실적인 조언
5. **따뜻한 격려**: 변화와 성장의 가능성을 믿음

**분석 깊이:** 2500-3500자
**어조:** 신뢰할 수 있는 상담가의 따뜻하고 전문적인 톤`,
          
          user: `안녕하세요! ${assessmentInfo?.title || '심리검사'}를 완료하셨네요.

**검사 결과:**
${Object.entries(actualResults).map(([domain, score]) => `- ${domain}: ${score}점`).join('\n')}

검사 받으신 용기에 박수를 보냅니다. 이제 이 결과를 함께 이해하고 활용해봐요:

**📝 작성 가이드:**
1. **나에 대해 알게 된 것** (3-4줄)
   - 검사 결과가 보여주는 핵심 특징
   - 쉬운 언어로, 공감하며

2. **심리적 특성 자세히 보기**
   - 각 영역별 점수의 의미를 일상 언어로
   - 실제 생활에서 어떻게 나타나는지 예시
   - "이런 적 있으시죠?" 같은 공감 포인트

3. **당신의 강점과 자원** ✨
   - 가지고 있는 심리적 강점들
   - 어떻게 활용하면 좋을지
   - 이미 잘하고 있는 것들 인정

4. **성장 가능성** 🌱
   - 발전시키면 좋을 영역
   - 부담없이 시작할 수 있는 방법
   - 완벽할 필요 없다는 메시지

5. **일상에서 실천하기** 💡
   - 3-5가지 구체적인 실천 방법
   - 작은 것부터 시작
   - 나에게 맞는 방법 찾기

6. **필요할 때 도움 받기** 🤝
   - 언제 전문가 도움이 필요한지
   - 상담, 치료 등의 옵션
   - 도움 받는 것은 자연스럽고 건강한 선택

7. **응원 메시지** 💝
   - 진심어린 격려
   - 변화와 성장의 가능성
   - 혼자가 아님을 상기`
        }
      };

      // 검사 타입에 따른 프롬프트 선택
      if (type.toLowerCase().includes('tci') || type.toLowerCase().includes('temperament')) {
        return prompts.tci;
      } else if (type.toLowerCase().includes('big') || type.toLowerCase().includes('five') || type.toLowerCase().includes('neo')) {
        return prompts.big5;
      } else if (type.toLowerCase().includes('han') || type.toLowerCase().includes('medicine') || type.toLowerCase().includes('체질') || type.toLowerCase().includes('한의')) {
        return prompts.han_medicine;
      } else if (type.toLowerCase().includes('work') || type.toLowerCase().includes('stress') || type.toLowerCase().includes('burnout') || type.toLowerCase().includes('번아웃')) {
        return {
          system: `당신은 직장인 멘탈 케어 전문 상담가로, 번아웃과 스트레스 검사 결과를 일하는 사람들이 공감하고 실천할 수 있도록 설명하는 역할입니다.

**작성 원칙:**
1. **공감 우선**: "힘드셨죠", "당연한 반응이에요" 같은 공감의 언어
2. **실전 조언**: 바쁜 직장인이 실제로 할 수 있는 현실적인 방법
3. **희망 메시지**: 번아웃도 회복 가능하다는 희망
4. **단계별 접근**: 급하지 않게, 작은 것부터 시작
5. **맥락 이해**: 한국 직장 문화를 이해하는 조언

**분석 깊이:** 2500-3500자
**어조:** 이해심 많은 선배 동료의 진심어린 조언`,
          
          user: `안녕하세요. 직장 생활, 많이 힘드셨죠? ${assessmentInfo?.title || '직장 스트레스 검사'} 결과를 함께 봐요.

**번아웃 상태:**
${Object.entries(actualResults).map(([domain, score]) => `- ${domain}: ${score}점`).join('\n')}

이 결과를 바탕으로 위로와 실질적인 도움이 되도록 설명해주세요:

**✍️ 작성 가이드:**
1. **지금 내 상태는?** (3-4줄)
   - 번아웃 정도를 솔직하고 공감있게
   - "당신만 그런 게 아니에요" 같은 위로

2. **왜 이렇게 힘든지 이해하기**
   - 각 영역(감정소진, 성취감 등)이 일상에서 어떻게 느껴지는지
   - "회의 때마다 짜증나고", "퇴근 후에도 일 생각" 같은 구체적 예시
   - 이게 정상적인 반응임을 강조

3. **회복을 위한 첫걸음** 🌱
   - 바쁜 직장인도 할 수 있는 실천법
   - "점심시간 10분 산책", "출근길 좋아하는 음악 듣기" 같은 작은 것부터
   - 단계별로 제안 (당장/이번 주/이번 달)

4. **일과 나 사이의 경계 만들기** ⚖️
   - 워라밸을 위한 구체적 방법
   - 거절하는 법, 쉬는 법
   - 완벽주의 내려놓기

5. **에너지 회복 전략** ⚡
   - 재충전하는 나만의 방법 찾기
   - 주말 활용법, 휴가 계획
   - 작은 보상 시스템

6. **도움 요청하기** 🆘
   - 언제 전문가 도움이 필요한지
   - EAP, 심리상담 활용법
   - "도움 받는 것은 약함이 아니라 용기"라는 메시지

7. **힘내세요** 💪
   - 진심어린 응원과 격려
   - 작은 변화가 쌓이면 큰 회복이 됨을 강조`
        };
      } else {
        return prompts.default;
      }
    };

    const promptConfig = getExpertPrompt(actualAssessmentType);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // 프리미엄 분석용 고품질 모델
        messages: [
          {
            role: 'system',
            content: promptConfig.system
          },
          {
            role: 'user',  
            content: promptConfig.user
          }
        ],
        max_completion_tokens: 8000, // 긴 응답을 위해 증가
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('[PREMIUM-ASSESSMENT-ANALYZER] OpenAI API 오류:', data);
      throw new Error(data.error?.message || 'OpenAI API 오류');
    }

    // 응답 처리 - 텍스트 형태로 직접 반환
    const analysisText = data.choices[0].message.content;
    console.log('[PREMIUM-ASSESSMENT-ANALYZER] 분석 완료, 텍스트 길이:', analysisText.length);

return new Response(JSON.stringify({ 
      analysis: analysisText,
      assessment_type: actualAssessmentType,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[PREMIUM-ASSESSMENT-ANALYZER] 오류:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      constitution: "분석 오류",
      overview: "분석 중 오류가 발생했습니다. 다시 시도해주세요."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});