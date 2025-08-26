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
당신은 한국의 특수교육 전문가입니다. 다음 정보를 바탕으로 개별교육계획(IEP)을 작성해주세요.

학생 정보:
- 이름: ${studentName}
- 나이: ${studentAge}세

평가 결과:
${JSON.stringify(assessmentResults, null, 2)}

부모 우려사항:
${parentConcerns.join('\n')}

교사 관찰:
${teacherObservations.join('\n')}

현재 수행 수준:
${JSON.stringify(currentPerformance, null, 2)}

다음 JSON 형식으로 IEP를 작성해주세요:

{
  "currentPerformance": {
    "academicAchievement": "현재 학업 성취 수준 설명",
    "functionalPerformance": "기능적 수행 능력 설명",
    "strengthsAndNeeds": ["강점1", "강점2", "필요영역1", "필요영역2"]
  },
  "annualGoals": [
    {
      "domain": "영역 (예: 학업, 사회성, 의사소통 등)",
      "goal": "연간 목표 설명",
      "measurableCriteria": "측정 가능한 기준",
      "timeframe": "시간 틀"
    }
  ],
  "shortTermObjectives": [
    {
      "relatedGoal": "관련 연간 목표",
      "objective": "단기 목표 설명",
      "criteria": "성취 기준",
      "evaluationProcedure": "평가 방법",
      "schedule": "평가 일정"
    }
  ],
  "specialEducationServices": [
    {
      "service": "서비스명",
      "location": "제공 장소",
      "frequency": "빈도",
      "duration": "기간",
      "provider": "제공자"
    }
  ],
  "relatedServices": [
    {
      "service": "관련 서비스명",
      "frequency": "빈도",
      "duration": "기간",
      "provider": "제공자"
    }
  ],
  "supplementaryAids": [
    {
      "aid": "보조 도구명",
      "purpose": "목적",
      "usage": "사용 방법"
    }
  ],
  "assessmentModifications": [
    {
      "modification": "평가 수정사항",
      "reason": "수정 이유",
      "application": "적용 방법"
    }
  ],
  "transitionServices": {
    "postSecondaryGoals": "중등교육 후 목표",
    "transitionActivities": ["전환 활동1", "전환 활동2"],
    "agencyInvolvement": "관련 기관 참여"
  }
}

모든 내용은 한국어로 작성하고, 학생의 나이와 발달 수준에 적합하게 구체적이고 실현 가능한 목표를 설정해주세요.
특히 평가 결과에서 나타난 강점과 지원이 필요한 영역을 반영해주세요.
`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: '당신은 한국의 특수교육 전문가입니다. 개별교육계획(IEP) 작성에 전문성을 가지고 있습니다.'
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
      throw new Error(`OpenAI API 오류: ${response.status}`)
    }

    const aiResponse = await response.json()
    const generatedContent = aiResponse.choices[0].message.content

    // JSON 파싱 시도
    let iepData
    try {
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        iepData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('JSON 형식을 찾을 수 없습니다')
      }
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError)
      // 파싱 실패 시 기본 구조 제공
      iepData = {
        currentPerformance: {
          academicAchievement: generatedContent,
          functionalPerformance: "평가 결과를 기반으로 한 분석",
          strengthsAndNeeds: ["추가 평가 필요"]
        },
        annualGoals: [
          {
            domain: "종합 발달",
            goal: "개별 특성에 맞는 발달 지원",
            measurableCriteria: "관찰 및 평가를 통한 측정",
            timeframe: "1년"
          }
        ],
        shortTermObjectives: [],
        specialEducationServices: [],
        relatedServices: [],
        supplementaryAids: [],
        assessmentModifications: []
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