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
        action: 'navigate',
        route: '/assessment',
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
        action: 'navigate',
        route: '/assessment',
      },
      {
        label: '3~5세 (유아)',
        description: '유아 발달 종합평가',
        action: 'navigate',
        route: '/assessment',
      },
      {
        label: '6세 이상 (학령기)',
        description: '학령기 언어/학습 체크',
        action: 'navigate',
        route: '/assessment',
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
        action: 'navigate',
        route: '/assessment',
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
        action: 'navigate',
        route: '/assessment',
      },
      {
        label: '유치원/학교에서 문제가 있어요',
        action: 'kakao',
      },
      {
        label: '전체 발달 상태를 알고 싶어요',
        action: 'navigate',
        route: '/assessment',
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
        action: 'navigate',
        route: '/assessment',
      },
      {
        emoji: '😞',
        label: '우울감 / 무기력',
        description: 'AI 우울 선별검사',
        action: 'navigate',
        route: '/assessment',
      },
      {
        emoji: '🪞',
        label: '내 성격/기질을 알고 싶어요',
        description: 'AI 성격 분석, DISC 등',
        action: 'navigate',
        route: '/assessment',
      },
      {
        emoji: '💬',
        label: '직접 전문가와 상담하고 싶어요',
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
        label: 'AI 정밀 리포트를 받고 싶어요',
        description: '빅데이터 기반 전문 리포트',
        nextStep: 'test_premium',
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

  test_premium: {
    question: '리포트 이용권이 필요해요',
    subtitle: '₩990 단건 ~ ₩3,900 구독까지 다양한 옵션',
    emoji: '📊',
    options: [
      {
        emoji: '💳',
        label: '이용권 구매하러 가기',
        description: '구독/단건 결제 옵션',
        action: 'payment',
      },
      {
        emoji: '🆓',
        label: '무료 검사 먼저 해볼게요',
        action: 'navigate',
        route: '/assessment',
      },
      {
        emoji: '💬',
        label: '상담 먼저 받고 결정할래요',
        action: 'kakao',
      },
    ],
  },
};
