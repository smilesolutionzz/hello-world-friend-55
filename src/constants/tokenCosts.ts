// 각 기능별 토큰 소진량 정의
export const TOKEN_COSTS = {
  // 심리검사 관련
  PSYCHOLOGICAL_TEST: 2,     // 마음상태 체크
  ADHD_TEST: 2,             // ADHD 자가체크
  DEPRESSION_TEST: 2,       // 우울감 자가체크  
  PANIC_TEST: 2,            // 불안감 수준 확인
  LANGUAGE_TEST: 2,         // 언어발달 자가체크
  DREAM_INTERPRETATION: 5,  // 꿈 해석
  SAJU_ANALYSIS: 8,         // 사주 분석
  HAN_MEDICINE_TEST: 2,     // 한의학 체질 분석
  
  // AI 상담 관련
  AI_COUNSELOR_CHAT: 0,     // AI 상담사 채팅 (메시지당) - 무료
  AI_COACH: 3,              // AI 코치 세션
  
  // 관찰 및 분석
  OBSERVATION_ANALYSIS: 5,  // 관찰 분석
  EXPERT_MATCHING: 2,       // 전문가 매칭
  
  // 프리미엄 기능
  PREMIUM_ASSESSMENT: 10,   // 프리미엄 종합검사
  PROFESSIONAL_REPORT: 8,   // 전문가 리포트 생성
  COMPREHENSIVE_REPORT: 200, // AI 전문가 종합 리포팅
  
  // 재미 테스트
  PAST_LIFE_JOB: 1,         // 전생 직업 분석
  ANIMAL_FACE_MATCH: 1,     // 얼굴 닮은 동물 찾기
  INNER_ANIMAL: 1,          // 내면 동물 찾기
  
  // 기타
  CONTENT_RECOMMENDATION: 1, // 컨텐츠 추천
  CRISIS_DETECTION: 0,      // 위기감지 (무료)
  AUTISM_SCREENING: 4,      // 자폐스펙트럼 선별검사
} as const;

// 기능별 설명
export const TOKEN_COST_DESCRIPTIONS = {
  3: "연령별 맞춤 심리상태 종합 분석",
  2: "자가체크 및 결과 분석", 
  5: "AI 꿈 해석 서비스",
  8: "AI 사주 운세 분석",
  1: "AI 상담사와의 실시간 대화 또는 맞춤 컨텐츠 추천",
  10: "종합 심리검사 및 상세 분석",
  200: "프리미엄검사, 관찰일지, AI상담 등 모든 데이터 종합 분석 리포트 (3일내 휴대폰 전송)",
  0: "위기상황 자동 감지 (무료)",
} as const;