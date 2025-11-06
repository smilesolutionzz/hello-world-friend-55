// 각 기능별 토큰 소진량 정의 (균일화 버전)
export const TOKEN_COSTS = {
  // 전문 심리검사 및 발달검사 (5토큰 통일)
  PSYCHOLOGICAL_TEST: 5,     // 마음상태 체크
  FOCUS_CHECK: 5,           // AIH 집중력 자가점검
  DEPRESSION_TEST: 5,       // 우울감 자가체크  
  PANIC_TEST: 5,            // 불안감 수준 확인
  LANGUAGE_TEST: 5,         // 언어발달 자가체크
  HAN_MEDICINE_TEST: 5,     // 한의학 체질 분석
  
  // 아동·청소년 발달검사 (5토큰 통일)
  DEVELOPMENTAL_DELAY_TEST: 5,  // 발달지연 검사
  SENSORY_INTEGRATION_TEST: 5,  // 감각통합장애 검사
  LEARNING_DISABILITY_TEST: 5,  // 학습장애 검사
  SOCIAL_DEVELOPMENT_TEST: 5,   // 사회성 발달 검사
  
  // AIH 전문가 창작 검사 - 발달 심리전문가 직접 개발 (5토큰으로 통일)
  FIVE_D_PERSONALITY: 5,        // 5D 성격 분석
  RELATIONSHIP_TYPE: 5,         // 관계유형 진단
  STRESS_INDEX: 5,              // 스트레스 지수 측정
  CAREER_INTEREST: 5,           // 진로흥미 탐색
  SELF_WORTH: 5,                // 자존감 측정
  DEFENSE_MECHANISM: 5,         // 방어기제 분석
  
  
  // 재미있는 AI 검사 (무료)
  DREAM_INTERPRETATION: 0,  // 꿈 해석 (무료)
  SAJU_ANALYSIS: 0,         // 사주 분석 (무료)
  
  // 고급 분석 (5토큰)
  AI_COACH: 5,              // AI 코치 세션
  EXPERT_MATCHING: 5,       // 전문가 매칭
  
  // 프리미엄 기능 (20토큰 통일)
  OBSERVATION_ANALYSIS: 20,  // 관찰 분석
  PREMIUM_ASSESSMENT: 20,    // 프리미엄 종합테스트
  PROFESSIONAL_REPORT: 20,   // 전문가 리포트 생성
  
  // 최고급 서비스 (고가격대)
  COMPREHENSIVE_REPORT: 200, // 박사급 종합 리포팅 (200토큰)
  IEP_GENERATION: 0,       // IEP 생성 (무료)
  
  // 엔터테인먼트 (최저가격대)
  PAST_LIFE_JOB: 1,         // 전생 직업 분석
  ANIMAL_FACE_MATCH: 1,     // 얼굴 닮은 동물 찾기
  INNER_ANIMAL: 1,          // 내면 동물 찾기
  CONTENT_RECOMMENDATION: 1, // 컨텐츠 추천
  
  // AI 상담 (사용량 기반)
  AI_COUNSELOR_CHAT: 1,     // AI 상담사 10메시지당 1토큰
  
  // 무료 유지 서비스
  CRISIS_DETECTION: 0,      // 위기감지 (긴급상황이므로 무료 유지)
} as const;

// 기능별 설명 (균일화 버전)
export const TOKEN_COST_DESCRIPTIONS = {
  0: "무료 서비스",
  1: "엔터테인먼트 테스트 또는 AI 상담 10메시지",
  5: "전문 심리검사 및 AIH 전문가 창작 검사", 
  20: "프리미엄 분석 및 전문가급 리포트",
  200: "모든 데이터 종합 박사급 분석 리포트 (3일내 휴대폰 전송)",
} as const;

// 토큰 패키지 추천
export const TOKEN_PACKAGES = {
  STARTER: {
    name: "토큰팩 50",
    tokens: 50,
    price: 9900,
    recommended_for: "기본 검사 및 분석",
    best_for: ["3분 심리검사 10회", "엔터테인먼트 테스트 50회", "AI 상담 50메시지", "무료 검사 무제한"],
    value_highlight: "3분 심리검사 최대 10회 이용 가능",
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
    best_for: ["3분 심리검사 30회", "프리미엄 분석 7회", "AI 상담 150메시지", "무료 검사 무제한"],
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
    best_for: ["3분 심리검사 80회", "프리미엄 분석 20회", "종합리포트 2회", "모든 기능 자유 이용"],
    value_highlight: "토큰당 99원으로 최고 할인율",
    features: [
      "✓ 최고 할인율 적용",
      "✓ 장기간 안심 이용",
      "✓ 전문가급 서비스",
      "✓ 모든 기능 체험"
    ]
  }
} as const;