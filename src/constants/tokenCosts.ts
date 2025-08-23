// 각 기능별 토큰 소진량 정의
export const TOKEN_COSTS = {
  // 심리검사 관련
  PSYCHOLOGICAL_TEST: 3,     // 마음상태 체크
  ADHD_TEST: 2,             // ADHD 자가체크
  DEPRESSION_TEST: 2,       // 우울감 자가체크  
  PANIC_TEST: 2,            // 불안감 수준 확인
  LANGUAGE_TEST: 2,         // 언어발달 자가체크
  DREAM_INTERPRETATION: 5,  // 꿈 해석
  SAJU_ANALYSIS: 8,         // 사주 분석
  
  // AI 상담 관련  
  AI_COUNSELOR_CHAT: 1,     // AI 상담사 채팅 (메시지당)
  AI_COACH: 3,              // AI 코치 세션
  
  // 관찰 및 분석
  OBSERVATION_ANALYSIS: 5,  // 관찰 분석
  EXPERT_MATCHING: 2,       // 전문가 매칭
  
  // 프리미엄 기능
  PREMIUM_ASSESSMENT: 10,   // 프리미엄 종합검사
  PROFESSIONAL_REPORT: 8,   // 전문가 리포트 생성
  
  // 기타
  CONTENT_RECOMMENDATION: 1, // 컨텐츠 추천
  CRISIS_DETECTION: 0,      // 위기감지 (무료)
} as const;

// 기능별 설명
export const TOKEN_COST_DESCRIPTIONS = {
  3: "연령별 맞춤 심리상태 종합 분석",
  2: "자가체크 및 결과 분석", 
  5: "AI 꿈 해석 서비스",
  8: "AI 사주 운세 분석",
  1: "AI 상담사와의 실시간 대화 또는 맞춤 컨텐츠 추천",
  10: "종합 심리검사 및 상세 분석",
  0: "위기상황 자동 감지 (무료)",
} as const;