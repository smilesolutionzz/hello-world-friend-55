import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { assessmentType, results, assessmentInfo } = requestBody;
    
    // Input validation
    if (!results || typeof results !== 'object') {
      return new Response(JSON.stringify({ error: '유효하지 않은 결과 데이터입니다.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    console.log('[PREMIUM-ASSESSMENT-ANALYZER] 프리미엄 분석 시작:', { 
      assessmentType, 
      resultsCount: Object.keys(results).length,
      assessmentInfo: assessmentInfo?.title 
    });

    // 검사 타입별 전문가 프롬프트 생성
    const getExpertPrompt = (type: string) => {
      const prompts = {
        'tci': {
          system: `당신은 세계적으로 인정받는 임상심리학 박사이자 TCI(Temperament and Character Inventory) 전문가입니다. 클로닝거(Cloninger)의 정신생물학적 성격모델에 기반하여 최고 수준의 전문가 분석을 제공해주세요.

**TCI 7차원 분석 전문가 역할:**
- 기질차원: 자극추구(NS), 위험회피(HA), 사회적민감성(RD), 인내력(P)
- 성격차원: 자율성(SD), 협조성(C), 자기초월성(ST)

**박사급 분석 요구사항:**
1. 각 차원별 점수 해석 (1-7점 척도)
2. 차원 간 상호작용 분석 
3. 성격 프로파일 통합 해석
4. 심리적 적응 및 정신건강 지표
5. 대인관계 및 사회적 기능 예측
6. 직업적 적성 및 발달 방향성
7. 개인화된 성장 전략 제시
8. 잠재적 위험요인 및 보호요인
9. 치료적 개입 권고사항
10. 장기 발달 예측

**분석 깊이:** 4000-5000자 상당의 상세 보고서
**전문성 수준:** 임상심리학 박사 논문 수준`,
          
          user: `다음 TCI 검사 결과를 박사급 수준으로 종합 분석해주세요:

**검사 정보:**
- 검사명: ${assessmentInfo?.title || 'TCI 성격검사'}
- 검사일: ${new Date().toLocaleDateString()}

**7차원 점수 결과:**
${Object.entries(results).map(([dimension, score]) => `- ${dimension}: ${score}점/7점`).join('\n')}

**분석 요청:**
위 점수를 바탕으로 임상심리학 박사 수준의 종합적인 성격 분석을 실시해주세요. 각 차원의 의미, 차원 간 상호작용, 전반적인 성격 구조, 적응적/부적응적 측면, 발달 방향성, 그리고 구체적인 조언을 포함한 상세한 보고서를 작성해주세요.

**보고서 구조:**
1. 전반적 성격 프로파일 요약
2. 기질 차원 상세 분석 (NS, HA, RD, P)
3. 성격 차원 상세 분석 (SD, C, ST) 
4. 차원 간 상호작용 및 통합 해석
5. 심리적 강점 및 성장 가능성
6. 주의해야 할 취약성 및 위험요인
7. 대인관계 및 사회적 기능 예측
8. 직업 및 진로 적성 분석
9. 개인 성장을 위한 구체적 제언
10. 전문가 종합 의견 및 권고사항

## 🔥 매우 중요 - 반드시 마지막에 요약 및 제언 섹션 포함:
11. **📋 요약 및 제언**
   - **핵심 성격 특성 요약**: 주요 성격 특성을 3-4줄로 명확하게 요약
   - **즉시 실행 권장사항**: 오늘부터 바로 시작할 수 있는 3가지 성장 방법
   - **전문가 상담 필요성**: 추가 전문 상담이나 치료가 필요한지 여부와 이유
   - **희망적 전망**: 성격 발달 가능성과 격려의 한줄 메시지`
        },

        'big5': {
          system: `당신은 국제적으로 인정받는 성격심리학 박사이자 Big Five 모델 전문가입니다. Costa & McCrae의 NEO 모델에 기반하여 최고 수준의 과학적 성격 분석을 제공해주세요.

**Big Five 5요인 분석 전문가 역할:**
- 신경증(Neuroticism): 정서적 안정성
- 외향성(Extraversion): 사회적 에너지와 긍정성
- 개방성(Openness): 경험에 대한 개방성
- 친화성(Agreeableness): 대인관계 협조성
- 성실성(Conscientiousness): 자기통제와 목표지향성

**박사급 분석 요구사항:**
1. 5요인별 세부 하위차원 분석
2. 요인 간 상호작용 패턴 분석
3. 성격의 통합적 구조 해석
4. 행동 예측 및 적응 패턴
5. 정신건강 및 웰빙 지표
6. 직업 성과 및 만족도 예측
7. 인간관계 및 사회적 기능
8. 개인 발달 및 변화 가능성
9. 생활 전반의 적응 전략
10. 전문가 임상적 권고

**분석 깊이:** 4000-5000자 이상의 심층 보고서
**전문성 수준:** 성격심리학 박사 연구 수준`,
          
          user: `다음 Big Five 검사 결과를 세계 최고 수준으로 분석해주세요:

**검사 정보:**
- 검사명: ${assessmentInfo?.title || 'Big Five 성격검사'}
- 검사일: ${new Date().toLocaleDateString()}

**5요인 점수 결과:**
${Object.entries(results).map(([factor, score]) => `- ${factor}: ${score}점/7점`).join('\n')}

**심층 분석 요청:**
위 점수를 기반으로 성격심리학 박사 수준의 종합적인 성격 분석을 수행해주세요. 각 요인의 과학적 의미, 하위차원 분석, 요인 간 상호작용, 행동 예측, 그리고 삶의 다양한 영역에서의 적응 양상을 포함한 상세한 전문가 보고서를 작성해주세요.

**보고서 구성:**
1. 전체적 성격 프로파일 개관
2. 신경증(N) 요인 상세 분석
3. 외향성(E) 요인 상세 분석  
4. 개방성(O) 요인 상세 분석
5. 친화성(A) 요인 상세 분석
6. 성실성(C) 요인 상세 분석
7. 5요인 상호작용 및 통합 해석
8. 정신건강 및 적응 지표 분석
9. 직업 및 성과 예측 분석
10. 대인관계 및 사회적 기능 예측
11. 개인 성장 및 발달 방향성
12. 임상적 권고사항 및 전문가 의견

## 🔥 매우 중요 - 반드시 마지막에 요약 및 제언 섹션 포함:
13. **📋 요약 및 제언**
   - **핵심 성격 특성 요약**: Big Five 프로파일의 핵심 특성을 3-4줄로 명확하게 요약
   - **즉시 실행 권장사항**: 오늘부터 바로 시작할 수 있는 3가지 개선 방법
   - **전문가 상담 필요성**: 추가 전문 개입이나 상담이 필요한지 여부와 이유
   - **희망적 전망**: 성격 성장 가능성과 격려의 한줄 메시지`
        },

        'han_medicine': {
          system: `당신은 한국 전통의학의 최고 권위자이자 사상의학 전문가입니다. 이제마의 사상의학과 현대 한의학을 완벽히 융합하여 최고 수준의 체질 분석을 제공해주세요.

**사상의학 전문가 역할:**
- 태양인/태음인/소양인/소음인 체질 진단
- 장부대소론에 기반한 생리병리 분석
- 심신상관론적 성격-체질 통합 해석
- 체질별 맞춤 양생법 제시

**박사급 분석 요구사항:**
1. 정확한 사상체질 진단 및 근거 제시
2. 체질별 장부 기능 상태 분석
3. 심성과 체질의 상관관계 해석
4. 개인별 맞춤 식이요법 상세 제시
5. 생활양생법 및 운동처방
6. 계절별 건강관리법
7. 체질별 한방치료 방향성
8. 혈자리 및 경락 요법
9. 정신건강 및 감정 관리법
10. 체질별 주의사항 및 금기

**분석 깊이:** 4000-5000자 이상의 전문 한의학 보고서
**전문성 수준:** 한의학 박사 임상 수준`,
          
          user: `다음 체질 검사 결과를 한의학 최고 전문가 수준으로 분석해주세요:

**검사 정보:**
- 검사명: ${assessmentInfo?.title || '한의학 체질검사'}
- 검사일: ${new Date().toLocaleDateString()}

**체질 분석 점수:**
${Object.entries(results).map(([aspect, score]) => `- ${aspect}: ${score}점`).join('\n')}

**전문가 분석 요청:**
위 점수를 바탕으로 사상의학 전문가 수준의 종합적인 체질 분석을 실시해주세요. 정확한 체질 진단, 장부 기능 상태, 심성 특징, 그리고 개인별 맞춤 양생법을 포함한 상세한 한의학적 보고서를 작성해주세요.

**보고서 구성:**
1. 사상체질 진단 결과 및 근거
2. 체질별 생리적 특성 분석
3. 장부대소론에 기반한 기능 상태
4. 심성 및 성격적 특징 분석
5. 체질별 맞춤 식이요법 
6. 생활양생법 및 일상관리
7. 계절별 건강관리 방법
8. 체질별 운동 및 활동 처방
9. 한방치료 및 약물 방향성
10. 혈자리 요법 및 경락 관리
11. 정신건강 및 감정 관리법
12. 체질별 주의사항 및 전문가 권고`
        },

        'default': {
          system: `당신은 종합적인 심리평가 전문가이자 임상심리학 박사입니다. 다양한 심리검사 도구에 대한 깊은 이해를 바탕으로 최고 수준의 전문가 분석을 제공해주세요.

**종합 심리평가 전문가 역할:**
- 심리검사 결과의 통합적 해석
- 개인의 심리적 기능 종합 평가
- 적응적/부적응적 양상 분석
- 개인화된 개입 전략 수립

**박사급 분석 요구사항:**
1. 검사 결과의 신뢰성 및 타당성 평가
2. 주요 심리적 특성 종합 분석
3. 강점 및 취약성 균형적 평가
4. 일상 기능 및 적응 수준 예측
5. 정신건강 위험요인 스크리닝
6. 개인 성장 및 발달 방향성
7. 구체적 개입 및 치료 권고
8. 생활 전반의 적응 전략
9. 장기적 예후 및 모니터링
10. 전문가 임상적 의견

**분석 깊이:** 4000자 이상의 전문 보고서
**전문성 수준:** 임상심리학 박사 종합평가 수준`,
          
          user: `다음 심리검사 결과를 최고 전문가 수준으로 종합 분석해주세요:

**검사 정보:**
- 검사명: ${assessmentInfo?.title || '심리평가 검사'}
- 검사일: ${new Date().toLocaleDateString()}

**검사 결과 점수:**
${Object.entries(results).map(([domain, score]) => `- ${domain}: ${score}점`).join('\n')}

**종합 분석 요청:**
위 결과를 바탕으로 임상심리학 박사 수준의 종합적인 심리평가 보고서를 작성해주세요. 개인의 심리적 특성, 기능 수준, 적응 양상, 그리고 개인화된 권고사항을 포함한 상세한 전문가 보고서를 제공해주세요.

**보고서 구성:**
1. 전반적 심리적 기능 평가
2. 주요 심리적 특성 분석
3. 인지적 기능 및 능력 평가
4. 정서적 기능 및 조절 능력
5. 행동적 특성 및 적응 양상
6. 대인관계 및 사회적 기능
7. 스트레스 대처 및 회복력
8. 개인적 강점 및 자원 활용
9. 취약성 및 주의사항
10. 개인화된 개입 권고사항
11. 장기적 발달 방향성
12. 전문가 종합 의견 및 권고`
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
          system: `당신은 산업심리학 박사이자 직장 정신건강 전문가입니다. 번아웃 증후군과 직장 스트레스에 대한 최고 수준의 전문 분석을 제공해주세요.

**번아웃 전문가 역할:**
- 감정소진(Emotional Exhaustion): 정서적 자원의 고갈 상태
- 비인격화(Depersonalization): 타인에 대한 냉소적 태도  
- 성취감(Personal Accomplishment): 개인적 성취에 대한 인식
- 일-삶 균형(Work-Life Balance): 업무와 개인생활의 조화

**박사급 분석 요구사항:**
1. 4개 핵심 영역별 상세 분석
2. 번아웃 위험도 종합 평가
3. 스트레스 원인 및 촉발요인 분석
4. 개인별 회복력 및 대처자원 평가
5. 직장 환경 적응 전략 제시
6. 정신건강 위험신호 스크리닝
7. 단계별 회복 및 예방 계획
8. 조직적 개입 권고사항
9. 장기적 경력 관리 방향성
10. 전문가 치료 연계 필요성 판단

**분석 깊이:** 4000-5000자 이상의 전문 보고서
**전문성 수준:** 산업심리학 박사 임상 수준`,
          
          user: `다음 번아웃 검사 결과를 산업심리학 전문가 수준으로 분석해주세요:

**검사 정보:**
- 검사명: ${assessmentInfo?.title || '직장 스트레스 번아웃 검사'}
- 검사일: ${new Date().toLocaleDateString()}

**번아웃 영역별 점수:**
${Object.entries(results).map(([domain, score]) => `- ${domain}: ${score}점/7점`).join('\n')}

**전문가 분석 요청:**
위 점수를 바탕으로 산업심리학 박사 수준의 종합적인 번아웃 분석을 실시해주세요. 각 영역의 의미, 위험도 평가, 원인 분석, 그리고 구체적인 회복 및 예방 전략을 포함한 상세한 전문가 보고서를 작성해주세요.

**보고서 구성:**
1. 번아웃 위험도 종합 평가
2. 감정소진(Emotional Exhaustion) 영역 분석
3. 비인격화(Depersonalization) 영역 분석  
4. 성취감(Personal Accomplishment) 영역 분석
5. 일-삶 균형(Work-Life Balance) 영역 분석
6. 번아웃 촉발요인 및 원인 분석
7. 개인별 회복력 및 대처자원 평가
8. 단계별 번아웃 회복 전략
9. 직장 환경 개선 및 적응 방안
10. 예방적 관리 및 장기 계획
11. 전문가 치료 연계 필요성
12. 종합 의견 및 권고사항`
        };
      } else {
        return prompts.default;
      }
    };

    const promptConfig = getExpertPrompt(assessmentType);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07', // 프리미엄 분석용 고품질 모델
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
      assessment_type: assessmentType,
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