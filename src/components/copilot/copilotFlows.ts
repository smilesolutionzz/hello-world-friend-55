export interface CopilotOption {
  emoji?: string;
  label: string;
  description?: string;
  nextStep?: string;
  action?: 'navigate' | 'kakao' | 'payment';
  route?: string;
}

export interface CopilotStep {
  question: string;
  subtitle?: string;
  emoji?: string;
  options: CopilotOption[];
}

export const copilotFlows: Record<string, CopilotStep> = {
  // ─── ROOT ───
  root: {
    question: '어떤 도움이 필요하세요?',
    subtitle: '선택하면 바로 안내해 드릴게요',
    emoji: '👋',
    options: [
      {
        emoji: '👶',
        label: '우리 아이 발달이 걱정돼요',
        description: '발달 지연, 행동 문제, ADHD 등',
        nextStep: 'child_concern',
      },
      {
        emoji: '🧠',
        label: '내 마음 상태가 궁금해요',
        description: '스트레스, 우울, 불안, 성격 분석',
        nextStep: 'adult_concern',
      },
      {
        emoji: '📋',
        label: 'AI 검사를 해보고 싶어요',
        description: '무료/유료 심리검사 안내',
        nextStep: 'test_guide',
      },
      {
        emoji: '📊',
        label: '종합 리포트를 받고 싶어요',
        description: '검사 데이터 기반 전문 분석 리포트',
        nextStep: 'report_intro',
      },
      {
        emoji: '💬',
        label: '전문가 상담 연결해주세요',
        description: '14년 경력 전문가 직접 상담',
        action: 'kakao',
      },
    ],
  },

  // ─── 아이 발달 ───
  child_concern: {
    question: '어떤 부분이 가장 걱정되시나요?',
    emoji: '👶',
    options: [
      {
        emoji: '🗣️',
        label: '말이 늦거나 의사소통이 어려워요',
        description: '언어 발달 체크',
        nextStep: 'child_language',
      },
      {
        emoji: '😤',
        label: '행동 조절이 안 돼요 / 산만해요',
        description: 'ADHD, 행동 문제 체크',
        nextStep: 'child_behavior',
      },
      {
        emoji: '👫',
        label: '또래 관계가 어려워요',
        description: '사회성, 정서 발달 체크',
        nextStep: 'child_social',
      },
      {
        emoji: '🤷',
        label: '잘 모르겠어요, 전체적으로 봐주세요',
        description: 'AI 종합 발달평가',
        nextStep: 'child_next_step',
      },
    ],
  },

  child_language: {
    question: '아이 나이는 어떻게 되나요?',
    emoji: '🗣️',
    options: [
      {
        label: '0~2세 (영아)',
        description: '영아기 발달 선별검사',
        nextStep: 'child_next_step',
      },
      {
        label: '3~5세 (유아)',
        description: '유아 발달 종합평가',
        nextStep: 'child_next_step',
      },
      {
        label: '6세 이상 (학령기)',
        description: '학령기 언어/학습 체크',
        nextStep: 'child_next_step',
      },
      {
        emoji: '💬',
        label: '전문가랑 먼저 상담할래요',
        action: 'kakao',
      },
    ],
  },

  child_behavior: {
    question: '행동 문제가 어느 정도인가요?',
    emoji: '😤',
    options: [
      {
        label: '가끔 그래요, 체크해보고 싶어요',
        description: 'AI 행동 체크리스트',
        nextStep: 'child_next_step',
      },
      {
        label: '매일 힘들어요, 빨리 도움받고 싶어요',
        description: '전문가 긴급 상담 연결',
        action: 'kakao',
      },
      {
        emoji: '🎮',
        label: '게임으로 아이 행동 분석해보기',
        description: '금쪽상담소 - AI 행동 관찰 게임',
        action: 'navigate',
        route: '/geumjjok-counseling',
      },
    ],
  },

  child_social: {
    question: '구체적으로 어떤 상황인가요?',
    emoji: '👫',
    options: [
      {
        label: '친구를 잘 못 사귀어요',
        nextStep: 'child_next_step',
      },
      {
        label: '유치원/학교에서 문제가 있어요',
        action: 'kakao',
      },
      {
        label: '전체 발달 상태를 알고 싶어요',
        nextStep: 'child_next_step',
      },
    ],
  },

  // ─── 아이 → 다음 단계 분기 ───
  child_next_step: {
    question: '어떻게 진행할까요?',
    subtitle: '검사 → 리포트 → 상담 순서를 추천드려요',
    emoji: '✨',
    options: [
      {
        emoji: '📋',
        label: '먼저 AI 검사부터 해볼게요',
        description: '3~5분 무료 선별검사',
        action: 'navigate',
        route: '/assessment',
      },
      {
        emoji: '📊',
        label: '바로 종합 리포트를 받고 싶어요',
        description: '기존 데이터로 즉시 생성 가능',
        action: 'navigate',
        route: '/report-generator-pro',
      },
      {
        emoji: '🎮',
        label: '금쪽상담소에서 놀이 관찰하기',
        description: 'AI 게임으로 행동 데이터 수집',
        action: 'navigate',
        route: '/geumjjok-counseling',
      },
      {
        emoji: '💬',
        label: '전문가와 먼저 상담할게요',
        action: 'kakao',
      },
    ],
  },

  // ─── 성인 심리 ───
  adult_concern: {
    question: '어떤 부분이 가장 신경 쓰이세요?',
    emoji: '🧠',
    options: [
      {
        emoji: '😰',
        label: '스트레스 / 불안 / 번아웃',
        description: 'AI 스트레스 분석',
        nextStep: 'adult_next_step',
      },
      {
        emoji: '😞',
        label: '우울감 / 무기력',
        description: 'AI 우울 선별검사',
        nextStep: 'adult_next_step',
      },
      {
        emoji: '🪞',
        label: '내 성격/기질을 알고 싶어요',
        description: 'AI 성격 분석, DISC 등',
        nextStep: 'adult_next_step',
      },
      {
        emoji: '💬',
        label: '직접 전문가와 상담하고 싶어요',
        action: 'kakao',
      },
    ],
  },

  // ─── 성인 → 다음 단계 분기 ───
  adult_next_step: {
    question: '어떻게 시작할까요?',
    subtitle: '검사 후 리포트를 받으면 더 정확해요',
    emoji: '🎯',
    options: [
      {
        emoji: '📋',
        label: '무료 검사 먼저 해볼게요',
        description: '3~5분 간단 선별검사',
        action: 'navigate',
        route: '/assessment',
      },
      {
        emoji: '📊',
        label: '종합 리포트 바로 받기',
        description: '내 데이터 기반 전문 분석',
        action: 'navigate',
        route: '/report-generator-pro',
      },
      {
        emoji: '💬',
        label: '전문가 상담 연결',
        action: 'kakao',
      },
    ],
  },

  // ─── 검사 안내 ───
  test_guide: {
    question: '어떤 검사가 궁금하세요?',
    emoji: '📋',
    options: [
      {
        emoji: '🆓',
        label: '무료 검사 먼저 해볼게요',
        description: '간단 선별검사 (3~5분)',
        action: 'navigate',
        route: '/assessment',
      },
      {
        emoji: '📊',
        label: '검사 + 리포트 한번에 받기',
        description: '검사 후 자동으로 전문 리포트 생성',
        nextStep: 'test_to_report',
      },
      {
        emoji: '🎨',
        label: '그림 심리분석 (AI 드로잉)',
        description: 'AI 그림 심리 분석',
        action: 'navigate',
        route: '/observation',
      },
      {
        emoji: '🎮',
        label: '게임형 행동 관찰 (금쪽상담소)',
        description: '놀이로 아이 행동 분석',
        action: 'navigate',
        route: '/geumjjok-counseling',
      },
    ],
  },

  // ─── 검사 → 리포트 연계 ───
  test_to_report: {
    question: '검사 데이터가 많을수록 리포트가 정확해져요',
    subtitle: '검사 → 관찰 → 리포트 순서를 추천드려요',
    emoji: '📈',
    options: [
      {
        emoji: '📋',
        label: '검사부터 시작할게요',
        description: '완료 후 리포트 자동 생성 가능',
        action: 'navigate',
        route: '/assessment',
      },
      {
        emoji: '📊',
        label: '이미 검사했어요, 리포트 바로 받기',
        description: '기존 데이터로 즉시 생성',
        action: 'navigate',
        route: '/report-generator-pro',
      },
      {
        emoji: '💳',
        label: '이용권 먼저 구매할게요',
        description: '구독/단건 결제',
        action: 'payment',
      },
    ],
  },

  // ─── 리포트 안내 ───
  report_intro: {
    question: '어떤 리포트를 원하세요?',
    subtitle: '14년 전문가 설계 빅데이터 엔진 분석',
    emoji: '📊',
    options: [
      {
        emoji: '👶',
        label: '아이 발달 종합 리포트',
        description: '검사+관찰+게임 데이터 통합 분석',
        nextStep: 'report_child',
      },
      {
        emoji: '🧠',
        label: '내 심리 상태 분석 리포트',
        description: '스트레스, 우울, 성격 통합 분석',
        nextStep: 'report_adult',
      },
      {
        emoji: '📄',
        label: '데모 리포트 먼저 볼래요',
        description: '실제 16페이지 샘플 확인',
        action: 'navigate',
        route: '/shared-report/demo',
      },
    ],
  },

  report_child: {
    question: '리포트 데이터를 모아볼까요?',
    subtitle: '데이터가 많을수록 30~50페이지 정밀 분석 가능',
    emoji: '🧩',
    options: [
      {
        emoji: '📊',
        label: '바로 리포트 생성하기',
        description: '기존 데이터로 즉시 시작',
        action: 'navigate',
        route: '/report-generator-pro',
      },
      {
        emoji: '📋',
        label: '검사 더 해서 데이터 추가하기',
        description: '정밀도 UP',
        action: 'navigate',
        route: '/assessment',
      },
      {
        emoji: '🎮',
        label: '금쪽상담소로 행동 데이터 수집',
        description: '게임+음성 분석 데이터 추가',
        action: 'navigate',
        route: '/geumjjok-counseling',
      },
      {
        emoji: '💳',
        label: '이용권 구매하기',
        action: 'payment',
      },
    ],
  },

  report_adult: {
    question: '리포트 정밀도를 높여볼까요?',
    subtitle: '여러 검사를 받을수록 교차분석이 가능해요',
    emoji: '🔍',
    options: [
      {
        emoji: '📊',
        label: '바로 리포트 생성하기',
        description: '기존 데이터로 즉시 시작',
        action: 'navigate',
        route: '/report-generator-pro',
      },
      {
        emoji: '📋',
        label: '검사 더 해서 데이터 추가',
        description: '스트레스+우울+성격 교차분석',
        action: 'navigate',
        route: '/assessment',
      },
      {
        emoji: '💬',
        label: '전문가 상담과 함께 받기',
        description: '리포트 기반 전문 상담',
        action: 'kakao',
      },
      {
        emoji: '💳',
        label: '이용권 구매하기',
        action: 'payment',
      },
    ],
  },
};
