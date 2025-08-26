import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseKey)

interface IEPGenerationRequest {
  studentName: string
  studentAge: number
  assessmentResults: Record<string, any>
  parentConcerns?: string[]
  teacherObservations?: string[]
  currentPerformance?: Record<string, any>
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { 
      studentName, 
      studentAge, 
      assessmentResults, 
      parentConcerns = [],
      teacherObservations = [],
      currentPerformance = {}
    }: IEPGenerationRequest = await req.json()

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      throw new Error('Unauthorized')
    }

    console.log('IEP 생성 요청:', { studentName, studentAge, user: user.id })

    // OpenAI를 사용하여 IEP 생성
    const prompt = `
당신은 20년 이상의 경험을 가진 한국의 특수교육 전문가이며, 개별교육계획(IEP) 작성에 있어 최고의 전문성을 보유하고 있습니다.

아래 학생 정보를 세심하게 분석하여 한국 특수교육법에 부합하는 전문적이고 구체적인 개별교육계획을 작성해주세요.

## 학생 정보
- **이름**: ${studentName}
- **나이**: ${studentAge}세

## 평가 결과 분석
${assessmentResults ? JSON.stringify(assessmentResults, null, 2) : '평가 결과 없음'}

## 학부모 우려사항
${parentConcerns.length > 0 ? '- ' + parentConcerns.join('\n- ') : '특별한 우려사항 없음'}

## 교사 관찰사항
${teacherObservations.length > 0 ? '- ' + teacherObservations.join('\n- ') : '관찰사항 없음'}

## 현재 수행 수준
${Object.keys(currentPerformance).length > 0 ? JSON.stringify(currentPerformance, null, 2) : '추가 평가 필요'}

---

**요구사항**: 반드시 다음 JSON 형식으로만 응답하고, 다른 텍스트는 포함하지 마세요.

{
  "currentPerformance": {
    "academicAchievement": "학생의 현재 학업 성취도를 구체적으로 기술 (읽기, 쓰기, 수학 등 세부 영역별로)",
    "functionalPerformance": "일상생활 기능, 자립생활 기술, 사회적 상호작용 능력을 구체적으로 기술",
    "strengthsAndNeeds": "학생의 강점과 지원이 필요한 영역을 명확히 구분하여 기술",
    "communicationSkills": "의사소통 능력 현황 (언어 이해, 표현, 비언어적 소통 등)",
    "behavioralCharacteristics": "행동 특성 및 정서적 상태 분석"
  },
  "annualGoals": [
    {
      "domain": "학업 성취",
      "goal": "구체적이고 측정 가능한 1년간의 학업 목표",
      "measurableCriteria": "목표 달성을 측정할 수 있는 구체적 기준 (예: 80% 정확도로 수행)",
      "timeframe": "12개월",
      "evaluationMethod": "평가 방법 (관찰, 포트폴리오, 표준화 검사 등)"
    },
    {
      "domain": "사회적 기능",
      "goal": "사회적 상호작용 및 의사소통 능력 향상 목표",
      "measurableCriteria": "사회적 기술 향상을 측정할 구체적 기준",
      "timeframe": "12개월",
      "evaluationMethod": "평가 방법"
    },
    {
      "domain": "자립생활 기술",
      "goal": "일상생활 및 자립 기능 향상 목표",
      "measurableCriteria": "자립 기술 향상을 측정할 구체적 기준",
      "timeframe": "12개월",
      "evaluationMethod": "평가 방법"
    }
  ],
  "shortTermObjectives": [
    {
      "relatedGoal": "학업 성취",
      "objective": "3개월 단위의 구체적이고 달성 가능한 목표",
      "criteria": "성취 기준 (예: 주 3회, 70% 정확도)",
      "evaluationProcedure": "평가 절차 및 담당자",
      "schedule": "월별 평가 일정"
    },
    {
      "relatedGoal": "사회적 기능",
      "objective": "사회적 기술 향상을 위한 단기 목표",
      "criteria": "측정 가능한 성취 기준",
      "evaluationProcedure": "평가 방법 및 담당자",
      "schedule": "평가 주기"
    }
  ],
  "specialEducationServices": [
    {
      "service": "특수교육",
      "location": "특수학급/일반학급/자원교실",
      "frequency": "주 5회",
      "duration": "1일 6시간",
      "provider": "특수교육교사",
      "specificContent": "제공될 구체적 교육 내용"
    }
  ],
  "relatedServices": [
    {
      "service": "언어치료",
      "frequency": "주 2회",
      "duration": "회당 40분",
      "provider": "언어재활사",
      "goals": "언어치료를 통해 달성하고자 하는 목표"
    }
  ],
  "supplementaryAids": [
    {
      "aid": "보조공학기기/학습도구명",
      "purpose": "사용 목적 및 기대 효과",
      "usage": "구체적 사용 방법 및 지원 계획",
      "provider": "제공 기관/담당자"
    }
  ],
  "assessmentModifications": [
    {
      "modification": "평가 방법 수정사항",
      "reason": "수정이 필요한 이유",
      "application": "구체적 적용 방법",
      "subjects": "적용 과목"
    }
  ],
  "transitionServices": {
    "postSecondaryGoals": "${studentAge >= 14 ? '중등교육 후 진로 및 직업 목표' : '해당 없음 (14세 이상 시 작성)'}",
    "transitionActivities": ["진로 탐색", "직업 훈련", "자립생활 기술 훈련"],
    "agencyInvolvement": "관련 기관 연계 계획"
  }
}

**중요 지침**:
1. 모든 목표는 SMART 기준(구체적, 측정가능, 달성가능, 관련성, 시간제한)을 충족해야 합니다
2. 학생의 나이와 발달수준을 고려하여 적절한 목표를 설정하세요
3. 한국 특수교육법과 교육과정에 부합하는 내용으로 작성하세요
4. 평가 결과에서 드러난 강점을 활용하고 지원 필요 영역을 구체적으로 다루세요
5. JSON 형식만 응답하고 추가 설명은 포함하지 마세요`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: '당신은 20년 이상의 경력을 가진 한국의 특수교육 전문가입니다. 개별교육계획(IEP) 작성에 있어 최고의 전문성을 보유하고 있으며, 한국 특수교육법과 교육과정에 정통합니다. 학생 개개인의 특성을 고려한 맞춤형 교육계획 수립이 특기입니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API 오류:', response.status, errorText)
      throw new Error(`OpenAI API 오류: ${response.status}`)
    }

    const aiResponse = await response.json()
    const generatedContent = aiResponse.choices[0].message.content
    console.log('OpenAI 응답 길이:', generatedContent.length)

    // JSON 파싱 시도
    let iepData
    try {
      // JSON만 추출 (```json 태그 제거)
      let cleanContent = generatedContent.trim()
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      // JSON 객체 찾기
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        iepData = JSON.parse(jsonMatch[0])
        console.log('IEP 데이터 파싱 성공:', Object.keys(iepData))
      } else {
        throw new Error('JSON 형식을 찾을 수 없습니다')
      }
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError)
      console.log('원본 응답:', generatedContent.substring(0, 500) + '...')
      
      // 파싱 실패 시 전문적인 기본 구조 제공
      iepData = {
        currentPerformance: {
          academicAchievement: `${studentName} 학생의 현재 학업 성취도는 추가 평가가 필요한 상태입니다. 기초 학습 능력 및 개별적 특성에 맞는 세부 평가를 통해 정확한 수준을 파악해야 합니다.`,
          functionalPerformance: "일상생활 기능과 자립생활 기술에 대한 종합적인 평가가 필요합니다. 연령에 적합한 기능적 수행 능력을 체계적으로 분석하여 지원 계획을 수립해야 합니다.",
          strengthsAndNeeds: `강점: 개별적 특성 파악 필요, 잠재력 탐색 필요 | 지원 필요 영역: 체계적 평가를 통한 영역별 분석 필요`,
          communicationSkills: "의사소통 능력에 대한 세부 평가가 필요합니다. 언어 이해, 표현, 비언어적 소통 능력을 종합적으로 분석해야 합니다.",
          behavioralCharacteristics: "행동 특성 및 정서적 상태에 대한 지속적인 관찰이 필요합니다. 학습 환경에서의 적응력과 사회적 상호작용 패턴을 분석해야 합니다."
        },
        annualGoals: [
          {
            domain: "학업 성취",
            goal: `${studentAge}세 수준에 맞는 기초 학업 능력 향상 및 개별 교육과정에 따른 학습 목표 달성`,
            measurableCriteria: "월별 평가를 통해 70% 이상의 성취도 달성, 개별 학습 과제 80% 이상 완수",
            timeframe: "12개월",
            evaluationMethod: "포트폴리오 평가, 관찰 기록, 월별 성취도 평가"
          },
          {
            domain: "사회적 기능",
            goal: "또래와의 긍정적 상호작용 능력 향상 및 집단 활동 참여 능력 개발",
            measurableCriteria: "주 3회 이상 적절한 사회적 상호작용 시연, 집단 활동 80% 이상 능동적 참여",
            timeframe: "12개월",
            evaluationMethod: "행동 관찰 체크리스트, 사회성 기술 평가, 또래 상호작용 기록"
          },
          {
            domain: "자립생활 기술",
            goal: "연령에 적합한 일상생활 기능 습득 및 자립 능력 향상",
            measurableCriteria: "80% 이상의 독립성으로 일상 과제 수행, 자조 기술 90% 이상 습득",
            timeframe: "12개월",
            evaluationMethod: "실제 상황에서의 수행 평가, 자립생활 기술 체크리스트"
          }
        ],
        shortTermObjectives: [
          {
            relatedGoal: "학업 성취",
            objective: "기초 문해력 향상을 위한 단계별 학습 과제 수행",
            criteria: "월 3회 평가에서 지속적 향상도 확인, 주별 목표 70% 이상 달성",
            evaluationProcedure: "특수교육교사 주도 개별 평가, 학습 포트폴리오 검토",
            schedule: "주별 진도 확인, 월말 종합 평가"
          },
          {
            relatedGoal: "사회적 기능",
            objective: "기본적 사회적 예의 및 의사소통 기술 습득",
            criteria: "일주일에 5회 이상 적절한 인사 및 감사 표현, 요청 시 80% 이상 적절한 반응",
            evaluationProcedure: "담임교사 및 특수교육교사 협력 관찰",
            schedule: "주 2회 관찰 기록, 월별 종합 평가"
          }
        ],
        specialEducationServices: [
          {
            service: "개별화 특수교육",
            location: "특수학급 및 통합학급",
            frequency: "주 5일",
            duration: "일일 4-6시간",
            provider: "특수교육교사",
            specificContent: "개별 교육과정에 따른 맞춤형 교육, 기초 학습 능력 향상, 사회적 기술 훈련"
          }
        ],
        relatedServices: [
          {
            service: "상담 및 치료 서비스",
            frequency: "필요시 주 1-2회",
            duration: "회당 40분",
            provider: "학교 상담교사 또는 관련 전문가",
            goals: "정서적 안정 및 전반적 발달 지원, 학습 동기 향상"
          }
        ],
        supplementaryAids: [
          {
            aid: "개별 학습 보조 도구 및 교재",
            purpose: "효과적 학습 지원 및 개별적 특성에 맞는 교육 환경 조성",
            usage: "개별 특성에 맞는 맞춤형 활용, 단계별 학습 지원",
            provider: "학교 (특수교육 지원센터 협력)"
          }
        ],
        assessmentModifications: [
          {
            modification: "평가 방법 및 시간 조정",
            reason: "개별적 특성 및 학습 속도 고려",
            application: "다양한 평가 도구 활용, 평가 시간 연장, 구두 평가 병행",
            subjects: "전 교과 영역"
          }
        ],
        transitionServices: studentAge >= 14 ? {
          postSecondaryGoals: "성인기 자립생활 준비 및 적성에 맞는 직업 탐색",
          transitionActivities: ["진로 탐색 활동", "직업 체험 프로그램", "자립생활 기술 훈련", "사회적응 훈련"],
          agencyInvolvement: "지역사회 직업재활시설, 복지관, 평생교육원 등 관련 기관 연계"
        } : {
          postSecondaryGoals: "해당 없음 (14세 이상 시 작성)",
          transitionActivities: ["기초 자립생활 기술 학습"],
          agencyInvolvement: "필요시 지역사회 아동발달센터 연계"
        }
      }
    }

    // IEP 데이터베이스에 저장
    const { data: iepRecord, error: insertError } = await supabase
      .from('individual_education_plans')
      .insert({
        user_id: user.id,
        student_name: studentName,
        student_age: studentAge,
        assessment_results: assessmentResults,
        current_performance: iepData.currentPerformance,
        annual_goals: iepData.annualGoals,
        short_term_objectives: iepData.shortTermObjectives,
        special_education_services: iepData.specialEducationServices,
        related_services: iepData.relatedServices,
        supplementary_aids: iepData.supplementaryAids,
        assessment_modifications: iepData.assessmentModifications,
        transition_services: iepData.transitionServices,
        plan_status: 'draft',
        valid_from: new Date().toISOString().split('T')[0],
        valid_to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1년 후
      })
      .select()
      .single()

    if (insertError) {
      console.error('IEP 저장 오류:', insertError)
      throw new Error('IEP 저장에 실패했습니다')
    }

    console.log('IEP 생성 완료:', iepRecord.id)

    return new Response(
      JSON.stringify({
        success: true,
        iep: iepRecord,
        message: 'IEP가 성공적으로 생성되었습니다'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('IEP 생성 오류:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'IEP 생성 중 오류가 발생했습니다'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})