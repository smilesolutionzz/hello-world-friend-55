// 각 기능별 토큰 소진량 정의 (BM 최적화 버전)
export const TOKEN_COSTS = {
  // 기본 심리검사 (저가격대)
  PSYCHOLOGICAL_TEST: 2,     // 마음상태 체크
  FOCUS_CHECK: 2,           // AIH 집중력 자가점검
  DEPRESSION_TEST: 2,       // 우울감 자가체크  
  PANIC_TEST: 2,            // 불안감 수준 확인
  LANGUAGE_TEST: 2,         // 언어발달 자가체크
  HAN_MEDICINE_TEST: 2,     // 한의학 체질 분석
  DEVELOPMENTAL_SCREENING: 3, // AIH 발달특성 선별체크 (4→3)
  
  // 고급 분석 (중가격대)
  DREAM_INTERPRETATION: 4,  // 꿈 해석 (5→4)
  OBSERVATION_ANALYSIS: 4,  // 관찰 분석 (5→4)
  SAJU_ANALYSIS: 6,         // 사주 분석 (8→6)
  AI_COACH: 3,              // AI 코치 세션
  EXPERT_MATCHING: 2,       // 전문가 매칭
  
  // 프리미엄 기능 (중고가격대)
  PREMIUM_ASSESSMENT: 8,    // 프리미엄 종합검사 (10→8)
  PROFESSIONAL_REPORT: 6,   // 전문가 리포트 생성 (8→6)
  
  // 최고급 서비스 (고가격대)
  COMPREHENSIVE_REPORT: 50, // AI 전문가 종합 리포팅 (200→50)
  IEP_GENERATION: 15,       // IEP 생성 (0→15)
  
  // 엔터테인먼트 (최저가격대)
  PAST_LIFE_JOB: 1,         // 전생 직업 분석
  ANIMAL_FACE_MATCH: 1,     // 얼굴 닮은 동물 찾기
  INNER_ANIMAL: 1,          // 내면 동물 찾기
  CONTENT_RECOMMENDATION: 1, // 컨텐츠 추천
  
  // AI 상담 (사용량 기반)
  AI_COUNSELOR_CHAT: 1,     // AI 상담사 10메시지당 1토큰 (0→1)
  
  // 무료 유지 서비스
  CRISIS_DETECTION: 0,      // 위기감지 (긴급상황이므로 무료 유지)
} as const;

// 기능별 설명 (BM 최적화 버전)
export const TOKEN_COST_DESCRIPTIONS = {
  1: "엔터테인먼트 테스트 또는 AI 상담 10메시지",
  2: "기본 심리상태 자가체크 및 결과 분석", 
  3: "연령별 맞춤 심리상태 종합 분석",
  4: "AI 고급 분석 서비스 (꿈해석, 관찰일지)",
  6: "전문가급 분석 및 리포트 생성",
  8: "프리미엄 종합검사 및 상세 분석",
  15: "AI 기반 개별교육계획(IEP) 전문 생성",
  50: "모든 데이터 종합 분석 리포트 (3일내 휴대폰 전송)",
  0: "위기상황 자동 감지 (무료)",
} as const;

// 토큰 패키지 추천
export const TOKEN_PACKAGES = {
  BASIC: {
    name: "기본팩",
    tokens: 20,
    price: 9900,
    recommended_for: "월 2-3회 기본검사 이용자",
    best_for: ["기본 심리검사", "엔터테인먼트 테스트"]
  },
  STANDARD: {
    name: "스탠다드팩", 
    tokens: 50,
    price: 19900,
    recommended_for: "정기적 상담 및 분석 이용자",
    best_for: ["AI상담", "관찰일지", "고급분석"]
  },
  PREMIUM: {
    name: "프리미엄팩",
    tokens: 150,
    price: 49900,
    recommended_for: "전문적 분석이 필요한 이용자",
    best_for: ["종합검사", "전문가리포트", "IEP생성"]
  },
  PROFESSIONAL: {
    name: "전문가팩",
    tokens: 300,
    price: 99900,
    recommended_for: "기관 또는 집중관리 대상자",
    best_for: ["종합리포트", "모든 기능 무제한"]
  }
} as const;