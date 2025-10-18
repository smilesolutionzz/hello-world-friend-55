// 각 기능별 토큰 소진량 정의 (BM 최적화 버전)
export const TOKEN_COSTS = {
  // 기본 심리검사 (저가격대)
  PSYCHOLOGICAL_TEST: 2,     // 마음상태 체크
  FOCUS_CHECK: 2,           // AIH 집중력 자가점검
  DEPRESSION_TEST: 2,       // 우울감 자가체크  
  PANIC_TEST: 2,            // 불안감 수준 확인
  LANGUAGE_TEST: 2,         // 언어발달 자가체크
  HAN_MEDICINE_TEST: 2,     // 한의학 체질 분석
  
  
  // 재미있는 검사 (무료 전환)
  DREAM_INTERPRETATION: 0,  // 꿈 해석 (무료)
  SAJU_ANALYSIS: 0,         // 사주 분석 (무료)
  
  // 고급 분석 (중가격대)
  OBSERVATION_ANALYSIS: 4,  // 관찰 분석 (5→4)
  AI_COACH: 3,              // AI 코치 세션
  EXPERT_MATCHING: 2,       // 전문가 매칭
  
  // 프리미엄 기능 (중고가격대)
  PREMIUM_ASSESSMENT: 8,    // 프리미엄 종합검사 (10→8)
  PROFESSIONAL_REPORT: 6,   // 전문가 리포트 생성 (8→6)
  
  // 최고급 서비스 (고가격대)
  COMPREHENSIVE_REPORT: 200, // 박사급 종합 리포팅 (200토큰)
  IEP_GENERATION: 50,       // IEP 생성 (15→50)
  
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
  50: "AI 기반 개별교육계획(IEP) 전문 생성 (3개 관찰일지 기반)",
  200: "모든 데이터 종합 박사급 분석 리포트 (3일내 휴대폰 전송)",
  0: "위기상황 자동 감지 (무료)",
} as const;

// 토큰 패키지 추천
export const TOKEN_PACKAGES = {
  STARTER: {
    name: "토큰팩 50",
    tokens: 50,
    price: 9900,
    recommended_for: "기본 검사 및 분석",
    best_for: ["기본 심리검사 25회", "엔터테인먼트 테스트 50회", "AI 상담 50메시지", "꿈해석 12회", "관찰일지 분석 12회"],
    value_highlight: "기본 심리검사 최대 25회 이용 가능",
    features: [
      "✓ 필요한 만큼 결제",
      "✓ 토큰 영구 보관", 
      "✓ 서비스 체험용",
      "✓ 부담 없는 시작"
    ]
  },
  PRO: {
    name: "토큰팩 150 (추천)", 
    tokens: 150,
    price: 19900,
    recommended_for: "정기적 상담 및 분석",
    best_for: ["기본 심리검사 75회", "AI 상담 150메시지", "관찰일지 분석 37회", "사주분석 25회", "꿈해석 37회"],
    value_highlight: "1토큰당 132원으로 가장 합리적",
    features: [
      "✓ 가장 인기있는 선택",
      "✓ 정기적 이용에 최적",
      "✓ 다양한 기능 체험",
      "✓ 높은 가성비"
    ],
    is_popular: true
  },
  PREMIUM: {
    name: "토큰팩 400",
    tokens: 400,
    price: 39900,
    recommended_for: "전문적 분석 및 집중 케어",
    best_for: ["기본 심리검사 200회", "프리미엄 검사 50회", "IEP 생성 8회", "종합리포트 2회", "모든 기능 자유 이용"],
    value_highlight: "토큰당 99원으로 최고 할인율",
    features: [
      "✓ 최고 할인율 적용",
      "✓ 장기간 안심 이용",
      "✓ 전문가급 서비스",
      "✓ 모든 기능 체험"
    ]
  }
} as const;