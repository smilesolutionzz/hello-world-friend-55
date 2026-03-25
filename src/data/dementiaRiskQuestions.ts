// AIH 치매 위험도 자가진단검사 (창작형)
// Dementia Risk Self-Assessment - AIH Original

// ========== 간편검사 (15문항, 무료) ==========
export const dementiaRiskSimpleQuestions = {
  memory: [
    {
      id: "dem_s_m01",
      text: "최근 약속이나 중요한 일정을 깜빡 잊는 일이 늘었다",
      category: "memory",
      subcategory: "episodic_memory",
    },
    {
      id: "dem_s_m02",
      text: "같은 이야기를 반복해서 하거나 같은 질문을 다시 하는 경우가 있다",
      category: "memory",
      subcategory: "repetition",
    },
    {
      id: "dem_s_m03",
      text: "물건을 어디에 두었는지 기억나지 않아 찾는 시간이 늘었다",
      category: "memory",
      subcategory: "object_placement",
    },
    {
      id: "dem_s_m04",
      text: "어제 먹은 음식이나 한 일이 잘 기억나지 않는다",
      category: "memory",
      subcategory: "recent_recall",
    },
    {
      id: "dem_s_m05",
      text: "오래전 일은 기억나는데 최근 일이 잘 기억나지 않는다",
      category: "memory",
      subcategory: "temporal_gradient",
    },
  ],
  orientation: [
    {
      id: "dem_s_o01",
      text: "날짜나 요일을 자주 혼동한다",
      category: "orientation",
      subcategory: "time_orientation",
    },
    {
      id: "dem_s_o02",
      text: "익숙한 길에서도 방향을 헷갈린 적이 있다",
      category: "orientation",
      subcategory: "spatial_orientation",
    },
    {
      id: "dem_s_o03",
      text: "가전제품(TV 리모컨, 세탁기 등) 사용법이 갑자기 헷갈린다",
      category: "orientation",
      subcategory: "device_operation",
    },
  ],
  language: [
    {
      id: "dem_s_l01",
      text: "하고 싶은 말이 있는데 적절한 단어가 잘 떠오르지 않는다",
      category: "language",
      subcategory: "word_finding",
    },
    {
      id: "dem_s_l02",
      text: "대화 중 방금 들은 내용을 놓치거나 이해하기 어려워진다",
      category: "language",
      subcategory: "comprehension",
    },
  ],
  daily_function: [
    {
      id: "dem_s_d01",
      text: "돈 계산이나 거스름돈 확인이 예전보다 어려워졌다",
      category: "daily_function",
      subcategory: "calculation",
    },
    {
      id: "dem_s_d02",
      text: "요리나 집안일을 할 때 순서를 헷갈리는 경우가 있다",
      category: "daily_function",
      subcategory: "sequencing",
    },
    {
      id: "dem_s_d03",
      text: "은행 업무, 공과금 납부 등을 혼자서 처리하기 어려워졌다",
      category: "daily_function",
      subcategory: "financial_management",
    },
  ],
  mood_behavior: [
    {
      id: "dem_s_b01",
      text: "예전에 좋아하던 활동에 대한 흥미가 줄었다",
      category: "mood_behavior",
      subcategory: "apathy",
    },
    {
      id: "dem_s_b02",
      text: "사소한 일에도 짜증이 나거나 화가 나는 일이 늘었다",
      category: "mood_behavior",
      subcategory: "irritability",
    },
  ],
};

// ========== 심층검사 (30문항, 프리미엄) ==========
export const dementiaRiskPremiumQuestions = {
  memory_deep: [
    {
      id: "dem_p_m01",
      text: "최근 약속이나 중요한 일정을 깜빡 잊는 일이 늘었다",
      category: "memory_deep",
      subcategory: "episodic_memory",
    },
    {
      id: "dem_p_m02",
      text: "같은 이야기를 반복하거나 같은 질문을 다시 하는 경우가 있다",
      category: "memory_deep",
      subcategory: "repetition",
    },
    {
      id: "dem_p_m03",
      text: "물건을 어디에 두었는지 기억나지 않아 찾는 시간이 늘었다",
      category: "memory_deep",
      subcategory: "object_placement",
    },
    {
      id: "dem_p_m04",
      text: "어제 먹은 음식이나 한 일이 잘 기억나지 않는다",
      category: "memory_deep",
      subcategory: "recent_recall",
    },
    {
      id: "dem_p_m05",
      text: "오래전 일은 기억나는데 최근 일이 잘 기억나지 않는다",
      category: "memory_deep",
      subcategory: "temporal_gradient",
    },
    {
      id: "dem_p_m06",
      text: "전화번호나 비밀번호 등 자주 쓰던 숫자가 떠오르지 않는다",
      category: "memory_deep",
      subcategory: "procedural_memory",
    },
    {
      id: "dem_p_m07",
      text: "가족이나 지인의 이름이 갑자기 떠오르지 않는 경우가 있다",
      category: "memory_deep",
      subcategory: "name_recall",
    },
  ],
  executive_function: [
    {
      id: "dem_p_e01",
      text: "두 가지 일을 동시에 처리하는 것이 예전보다 어려워졌다",
      category: "executive_function",
      subcategory: "multitasking",
    },
    {
      id: "dem_p_e02",
      text: "복잡한 결정을 내리는 데 시간이 많이 걸리거나 어렵다",
      category: "executive_function",
      subcategory: "decision_making",
    },
    {
      id: "dem_p_e03",
      text: "새로운 기기나 앱 사용법을 배우는 것이 크게 어려워졌다",
      category: "executive_function",
      subcategory: "new_learning",
    },
    {
      id: "dem_p_e04",
      text: "일을 계획하고 순서대로 진행하는 것이 힘들어졌다",
      category: "executive_function",
      subcategory: "planning",
    },
    {
      id: "dem_p_e05",
      text: "실수를 알아차리고 스스로 수정하는 것이 어려워졌다",
      category: "executive_function",
      subcategory: "error_correction",
    },
  ],
  orientation_spatial: [
    {
      id: "dem_p_o01",
      text: "날짜나 요일을 자주 혼동한다",
      category: "orientation_spatial",
      subcategory: "time_orientation",
    },
    {
      id: "dem_p_o02",
      text: "익숙한 길에서도 방향을 헷갈린 적이 있다",
      category: "orientation_spatial",
      subcategory: "spatial_orientation",
    },
    {
      id: "dem_p_o03",
      text: "자동차 주차 위치를 잊거나 대중교통 노선을 혼동한다",
      category: "orientation_spatial",
      subcategory: "navigation",
    },
    {
      id: "dem_p_o04",
      text: "거리감이나 공간 판단이 예전보다 어려워졌다",
      category: "orientation_spatial",
      subcategory: "spatial_judgment",
    },
  ],
  language_communication: [
    {
      id: "dem_p_l01",
      text: "하고 싶은 말이 있는데 적절한 단어가 잘 떠오르지 않는다",
      category: "language_communication",
      subcategory: "word_finding",
    },
    {
      id: "dem_p_l02",
      text: "대화 중 방금 들은 내용을 놓치거나 이해하기 어려워진다",
      category: "language_communication",
      subcategory: "comprehension",
    },
    {
      id: "dem_p_l03",
      text: "글을 읽을 때 내용 파악이 예전보다 느려졌다",
      category: "language_communication",
      subcategory: "reading_comprehension",
    },
    {
      id: "dem_p_l04",
      text: "편지나 메시지를 쓸 때 문장 구성이 어려워졌다",
      category: "language_communication",
      subcategory: "writing",
    },
  ],
  daily_living: [
    {
      id: "dem_p_d01",
      text: "돈 계산이나 거스름돈 확인이 예전보다 어려워졌다",
      category: "daily_living",
      subcategory: "calculation",
    },
    {
      id: "dem_p_d02",
      text: "요리나 집안일을 할 때 순서를 헷갈리는 경우가 있다",
      category: "daily_living",
      subcategory: "sequencing",
    },
    {
      id: "dem_p_d03",
      text: "약 복용 시간이나 복용 여부를 자주 잊는다",
      category: "daily_living",
      subcategory: "medication_management",
    },
  ],
  mood_personality: [
    {
      id: "dem_p_b01",
      text: "예전에 좋아하던 활동에 대한 흥미가 줄었다",
      category: "mood_personality",
      subcategory: "apathy",
    },
    {
      id: "dem_p_b02",
      text: "사소한 일에도 짜증이 나거나 화가 나는 일이 늘었다",
      category: "mood_personality",
      subcategory: "irritability",
    },
    {
      id: "dem_p_b03",
      text: "혼자 있는 시간이 늘었고 사람들을 만나는 것이 귀찮아졌다",
      category: "mood_personality",
      subcategory: "social_withdrawal",
    },
    {
      id: "dem_p_b04",
      text: "밤에 잠들기 어렵거나 새벽에 자주 깬다",
      category: "mood_personality",
      subcategory: "sleep_disturbance",
    },
    {
      id: "dem_p_b05",
      text: "의심이 많아지거나 주변 사람을 쉽게 믿지 못하게 되었다",
      category: "mood_personality",
      subcategory: "suspicion",
    },
  ],
};

// ========== 간편검사 정보 ==========
export const dementiaRiskSimpleInfo = {
  title: "치매 위험도 간편검사",
  subtitle: "DRSA-AIH Quick (Dementia Risk Self-Assessment)",
  description: "기억력, 판단력, 일상생활 변화를 빠르게 체크하여 치매 위험 신호를 간편하게 선별합니다",
  features: [
    "기억력 변화 체크",
    "일상생활 기능 확인",
    "언어능력 간편 평가",
    "즉시 결과 확인",
  ],
  duration: "약 3분",
  targetAge: "50세 이상",
  category: "시니어 인지",
  questions_count: 15,
  premium_features: [
    "5영역 간편 선별 (기억, 지남력, 언어, 일상기능, 정서)",
    "위험도 수준 즉시 확인",
    "추가 정밀검사 필요 여부 안내",
    "생활 속 인지 관리 팁 제공",
  ],
  disclaimer: "본 검사는 AIH에서 독자 개발한 창작형 선별도구입니다. 의학적 진단이 아닌 자가선별 목적으로만 사용되며, 정확한 진단은 반드시 전문의와 상담하시기 바랍니다.",
};

// ========== 심층검사 정보 ==========
export const dementiaRiskPremiumInfo = {
  title: "치매 위험도 정밀진단검사",
  subtitle: "DRSA-AIH Pro (Dementia Risk Self-Assessment Professional)",
  description: "기억력, 실행기능, 시공간능력, 언어, 일상생활, 정서변화의 6개 영역으로 치매 위험도를 정밀 분석합니다",
  features: [
    "6영역 정밀 인지기능 분석",
    "실행기능 및 판단력 평가",
    "시공간 인지능력 체크",
    "정서·행동 변화 심층 분석",
    "개인 맞춤 인지 관리 전략",
    "전문가급 AI 종합 리포트",
  ],
  duration: "약 8-10분",
  targetAge: "50세 이상",
  category: "시니어 인지",
  questions_count: 30,
  premium_features: [
    "6영역 정밀분석 (기억, 실행기능, 시공간, 언어, 일상생활, 정서변화)",
    "치매 유형별 위험도 추정 (알츠하이머, 혈관성 등)",
    "인지 예비능력(Cognitive Reserve) 평가",
    "맞춤형 인지 훈련 프로그램 추천",
    "가족 돌봄 가이드라인 제공",
    "전문 진료 연계 안내",
  ],
  disclaimer: "본 검사는 AIH에서 독자 개발한 창작형 선별도구입니다. 의학적 진단이 아닌 자가선별 목적으로만 사용되며, 정확한 진단은 반드시 전문의와 상담하시기 바랍니다.",
  rank: 6,
  badge: "🧓 NEW",
  priority: 1,
  highlight: true,
};
