import OpenAI from 'openai';
import { AssessmentResult, ExpertProfile, MatchingResult } from '@/types/assessment';

// OpenAI 클라이언트 초기화 (환경변수에서 API 키 로드)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here',
  dangerouslyAllowBrowser: true // 프론트엔드에서 사용할 경우
});

// 전문가급 분석 프롬프트 시스템
export const professionalAnalysisPrompt = (testResults: any, age: number, gender: string) => `
당신은 20년 경력의 임상심리학자이자 발달전문가입니다. 
다음 검사 결과를 전문가 수준으로 분석해주세요:

검사 데이터: ${JSON.stringify(testResults)}
연령: ${age}세
성별: ${gender}

다음 형식으로 전문적 분석을 제공해주세요:

1. 임상적 요약 (Clinical Summary)
- 전반적 발달/심리 상태
- 주요 특징 및 패턴

2. 발달 수준 평가 (Developmental Assessment) 
- 연령 대비 발달 수준
- 강점 영역과 취약 영역

3. 위험 요인 식별 (Risk Factors)
- 조기 개입이 필요한 영역
- 장기적 모니터링 필요 사항

4. 권장 개입 방안 (Intervention Recommendations)
- 단기 목표 (3개월)
- 중기 목표 (6개월)
- 장기 목표 (1년)

5. 예후 및 목표 설정 (Prognosis & Goals)
- 예상 치료 기간
- 성공적 개입을 위한 조건

각 영역마다 구체적 수치와 임상적 근거를 포함하세요.
`;

// 전문가 매칭을 위한 AI 분석
export const expertMatchingPrompt = (caseAnalysis: string, expertList: ExpertProfile[]) => `
다음 사례 분석을 바탕으로 가장 적합한 전문가 유형을 추천해주세요:

사례 정보: ${caseAnalysis}
전문가 목록: ${JSON.stringify(expertList)}

매칭 기준:
1. 전문 영역 적합도 (50%)
2. 치료 접근법 매칭 (30%)  
3. 경력 및 성과 (15%)
4. 가용성 (5%)

TOP 3 전문가를 선정하고 각각에 대해:
- 매칭 점수 (0-100점)
- 선정 이유 (임상적 근거 포함)
- 예상 치료 방향
- 세션 횟수 추정

을 JSON 형식으로 제공해주세요.
`;

// OpenAI API 호출 함수
export async function analyzeAssessmentResults(
  testResults: any, 
  age: number, 
  gender: string
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "당신은 전문적인 임상심리학자이자 발달전문가입니다."
        },
        {
          role: "user", 
          content: professionalAnalysisPrompt(testResults, age, gender)
        }
      ],
      max_tokens: 2000,
      temperature: 0.3
    });

    return completion.choices[0]?.message?.content || "분석 결과를 생성할 수 없습니다.";
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return "현재 AI 분석 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.";
  }
}

// 전문가 매칭 AI 분석
export async function matchExperts(
  caseAnalysis: string, 
  expertList: ExpertProfile[]
): Promise<MatchingResult[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "당신은 심리상담 전문가 매칭 시스템입니다."
        },
        {
          role: "user",
          content: expertMatchingPrompt(caseAnalysis, expertList)
        }
      ],
      max_tokens: 1500,
      temperature: 0.2
    });

    const result = completion.choices[0]?.message?.content;
    if (result) {
      try {
        return JSON.parse(result);
      } catch {
        // JSON 파싱 실패 시 기본 매칭 결과 반환
        return expertList.slice(0, 3).map((expert, index) => ({
          expert,
          matchScore: 85 - (index * 10),
          matchingReasons: ['전문 영역 일치', '경력 우수', '높은 평점'],
          estimatedSessions: 8 + index * 2,
          treatmentDirection: '인지행동치료 기반 단계적 접근'
        }));
      }
    }
    return [];
  } catch (error) {
    console.error('Expert Matching Error:', error);
    return [];
  }
}

// 24시간 AI 상담사 프롬프트
export const aiCounselorPrompt = `
당신은 따뜻하고 공감적인 AI 심리상담사입니다. 
다음 역할을 수행해주세요:

1. **1차 심리지원**
   - 경청과 공감으로 감정 안정화
   - 기본적 심리교육 제공
   - 위기상황 감지 및 대응

2. **위기상황 평가**
   - 자해/자살 위험도 평가 
   - 즉시 전문가 연결 필요성 판단
   - 응급상황 시 119/정신건강위기상담전화 안내

3. **전문가 연결 판단**
   다음 상황에서 즉시 인간 전문가 연결:
   - 자해/자살 언급
   - 환청/환각 증상
   - 심각한 우울/불안 호소
   - 아동학대 의심
   - 가정폭력 상황

항상 따뜻하고 공감적인 톤으로 대화하며, 위기상황을 정확히 감지하세요.
`;

// AI 상담사 채팅
export async function chatWithAICounselor(
  message: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<{ response: string; riskLevel: 'low' | 'medium' | 'high' }> {
  try {
    const messages = [
      { role: "system" as const, content: aiCounselorPrompt },
      ...conversationHistory,
      { role: "user" as const, content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      max_tokens: 800,
      temperature: 0.7
    });

    const response = completion.choices[0]?.message?.content || "죄송합니다. 응답을 생성할 수 없습니다.";
    
    // 위험도 평가 (간단한 키워드 기반)
    const riskKeywords = ['죽고싶다', '자살', '자해', '죽음', '해치고싶다'];
    const hasRiskKeywords = riskKeywords.some(keyword => message.includes(keyword));
    const riskLevel = hasRiskKeywords ? 'high' : 'low';

    return { response, riskLevel };
  } catch (error) {
    console.error('AI Counselor Error:', error);
    return {
      response: "현재 일시적인 문제가 발생했습니다. 긴급한 상황이라면 정신건강위기상담전화 1577-0199로 연락해주세요.",
      riskLevel: 'medium'
    };
  }
}