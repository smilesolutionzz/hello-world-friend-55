// 구조화된 상담 질문 시스템

export type AgeGroup = 'child' | 'teen' | 'adult' | 'parent';
export type CharacterType = 'elephant' | 'bear' | 'rabbit' | 'fox' | 'owl';

export interface CounselingQuestion {
  id: string;
  question: string;
  category: 'emotion' | 'family' | 'social' | 'self' | 'daily';
  ageGroups: AgeGroup[];
  followUpPrompts?: string[];
  depressionWeight?: number; // 우울 가중치 (0-1)
}

export interface CharacterConfig {
  type: CharacterType;
  name: string;
  voice: string;
  personality: string;
  greeting: string;
  reassurance: string[];
  ageGroups: AgeGroup[];
  color: string;
}

// 캐릭터 설정
export const CHARACTERS: Record<CharacterType, CharacterConfig> = {
  elephant: {
    type: 'elephant',
    name: '코끼리 선생님',
    voice: 'gentle',
    personality: '따뜻하고 포근한 코끼리 선생님',
    greeting: '안녕! 나는 코끼리 선생님이야. 너의 이야기를 들려줄래? 우리가 나누는 이야기는 모두 비밀이야, 걱정하지 마!',
    reassurance: [
      '우리가 나누는 이야기는 모두 비밀이야',
      '걱정하지 마, 여기서는 네 마음을 편하게 얘기해도 돼',
      '네 이야기를 들려줘서 고마워',
      '아주 솔직하게 얘기해줘도 괜찮아'
    ],
    ageGroups: ['child', 'teen'],
    color: '#A8DADC'
  },
  bear: {
    type: 'bear',
    name: '곰돌이 선생님',
    voice: 'warm',
    personality: '든든하고 믿음직한 곰돌이 선생님',
    greeting: '안녕! 곰돌이 선생님이야. 무슨 고민이든 편하게 얘기해봐. 우리끼리 비밀이야!',
    reassurance: [
      '네 이야기는 안전하게 지켜질 거야',
      '어떤 이야기든 괜찮아',
      '천천히 네 속도로 얘기해도 돼',
      '너의 감정은 모두 소중해'
    ],
    ageGroups: ['child', 'teen', 'adult'],
    color: '#8B4513'
  },
  rabbit: {
    type: 'rabbit',
    name: '토끼 선생님',
    voice: 'bright',
    personality: '밝고 활기찬 토끼 선생님',
    greeting: '안녕! 토끼 선생님이야! 오늘 기분은 어때? 우리 같이 이야기 나눠볼까? 비밀 보장이야!',
    reassurance: [
      '네가 하는 이야기는 모두 비밀이야',
      '편안하게 네 마음을 얘기해줘',
      '아주 잘하고 있어!',
      '너의 생각이 궁금해'
    ],
    ageGroups: ['child'],
    color: '#FFB6C1'
  },
  fox: {
    type: 'fox',
    name: '여우 선생님',
    voice: 'wise',
    personality: '지혜롭고 이해심 많은 여우 선생님',
    greeting: '안녕하세요. 여우 선생님입니다. 오늘 하루는 어떠셨나요? 편하게 이야기 나눠봐요. 모든 대화는 비밀로 지켜집니다.',
    reassurance: [
      '이 공간은 안전합니다',
      '솔직한 마음을 나눠주셔서 감사합니다',
      '천천히 생각하며 답해주세요',
      '모든 감정은 타당합니다'
    ],
    ageGroups: ['teen', 'adult', 'parent'],
    color: '#FF6347'
  },
  owl: {
    type: 'owl',
    name: '올빼미 선생님',
    voice: 'calm',
    personality: '차분하고 통찰력 있는 올빼미 선생님',
    greeting: '안녕하세요. 올빼미 선생님입니다. 오늘 당신의 내면을 함께 들여다보는 시간을 가져볼까요? 이 공간에서는 편안하게 자신을 마주할 수 있습니다.',
    reassurance: [
      '당신의 모든 이야기는 존중받을 가치가 있습니다',
      '깊이 있는 대화를 나눌 수 있어 감사합니다',
      '스스로를 돌아보는 용기가 대단합니다',
      '천천히, 당신의 속도로 진행해도 괜찮습니다'
    ],
    ageGroups: ['adult', 'parent'],
    color: '#6B4423'
  }
};

// 구조화된 질문 리스트
export const COUNSELING_QUESTIONS: CounselingQuestion[] = [
  // 감정 카테고리
  {
    id: 'emotion_1',
    question: '요즘 기분이 어때?',
    category: 'emotion',
    ageGroups: ['child', 'teen'],
    followUpPrompts: ['무엇 때문에 그런 기분이 들었어?', '언제부터 그렇게 느꼈어?'],
    depressionWeight: 0.8
  },
  {
    id: 'emotion_2',
    question: '최근에 슬프거나 화가 난 일이 있었어?',
    category: 'emotion',
    ageGroups: ['child', 'teen', 'adult'],
    followUpPrompts: ['그때 어떤 생각이 들었어?', '어떻게 대처했어?'],
    depressionWeight: 0.9
  },
  {
    id: 'emotion_3',
    question: '요즘 잠은 잘 자고 있어?',
    category: 'emotion',
    ageGroups: ['child', 'teen', 'adult'],
    followUpPrompts: ['잠들기 어려울 때가 있어?', '꿈을 많이 꾸니?'],
    depressionWeight: 0.7
  },
  {
    id: 'emotion_4',
    question: '밥은 잘 먹고 있어?',
    category: 'emotion',
    ageGroups: ['child', 'teen', 'adult'],
    followUpPrompts: ['입맛이 없을 때가 있어?', '좋아하는 음식은 뭐야?'],
    depressionWeight: 0.6
  },
  
  // 가족 카테고리
  {
    id: 'family_1',
    question: '엄마에 대해서 어떻게 생각해?',
    category: 'family',
    ageGroups: ['child', 'teen'],
    followUpPrompts: ['엄마와 함께 있을 때 기분이 어때?', '엄마에게 하고 싶은 말이 있어?'],
    depressionWeight: 0.7
  },
  {
    id: 'family_2',
    question: '아빠와는 어떻게 지내?',
    category: 'family',
    ageGroups: ['child', 'teen'],
    followUpPrompts: ['아빠랑 같이 뭐 하는 걸 좋아해?', '아빠에게 바라는 게 있어?'],
    depressionWeight: 0.7
  },
  {
    id: 'family_3',
    question: '가족들과 함께 있을 때 기분이 어때?',
    category: 'family',
    ageGroups: ['child', 'teen', 'adult'],
    followUpPrompts: ['가족들이 네 마음을 잘 이해해줘?', '가족들에게 하고 싶은 말이 있어?'],
    depressionWeight: 0.8
  },
  {
    id: 'family_4',
    question: '형제자매가 있어? 어떻게 지내?',
    category: 'family',
    ageGroups: ['child', 'teen'],
    followUpPrompts: ['사이가 좋아?', '가끔 싸울 때도 있어?'],
    depressionWeight: 0.5
  },
  
  // 사회 카테고리
  {
    id: 'social_1',
    question: '학교(직장) 생활은 어때?',
    category: 'social',
    ageGroups: ['child', 'teen', 'adult'],
    followUpPrompts: ['힘든 점이 있어?', '좋아하는 시간은 언제야?'],
    depressionWeight: 0.7
  },
  {
    id: 'social_2',
    question: '친구들과 잘 지내고 있어?',
    category: 'social',
    ageGroups: ['child', 'teen'],
    followUpPrompts: ['제일 친한 친구는 누구야?', '친구들이랑 뭐 하고 놀아?'],
    depressionWeight: 0.6
  },
  {
    id: 'social_3',
    question: '요즘 외로움을 느낄 때가 있어?',
    category: 'social',
    ageGroups: ['teen', 'adult'],
    followUpPrompts: ['언제 그렇게 느껴져?', '누구에게 이야기하고 싶어?'],
    depressionWeight: 0.9
  },
  {
    id: 'social_4',
    question: '다른 사람들과 이야기하는 게 편해?',
    category: 'social',
    ageGroups: ['child', 'teen', 'adult'],
    followUpPrompts: ['어려운 점이 있어?', '누구랑 이야기하는 게 제일 편해?'],
    depressionWeight: 0.6
  },
  
  // 자아 카테고리
  {
    id: 'self_1',
    question: '너 자신에 대해 어떻게 생각해?',
    category: 'self',
    ageGroups: ['teen', 'adult'],
    followUpPrompts: ['네 장점은 뭐라고 생각해?', '바꾸고 싶은 점이 있어?'],
    depressionWeight: 0.8
  },
  {
    id: 'self_2',
    question: '요즘 네가 좋아하는 건 뭐야?',
    category: 'self',
    ageGroups: ['child', 'teen', 'adult'],
    followUpPrompts: ['그걸 할 때 기분이 어때?', '자주 하니?'],
    depressionWeight: 0.4
  },
  {
    id: 'self_3',
    question: '꿈이나 하고 싶은 게 있어?',
    category: 'self',
    ageGroups: ['child', 'teen', 'adult'],
    followUpPrompts: ['그걸 위해 준비하고 있는 게 있어?', '누가 응원해줘?'],
    depressionWeight: 0.5
  },
  {
    id: 'self_4',
    question: '스트레스를 받을 때 어떻게 해결해?',
    category: 'self',
    ageGroups: ['teen', 'adult'],
    followUpPrompts: ['그게 도움이 돼?', '다른 방법도 시도해봤어?'],
    depressionWeight: 0.7
  },
  
  // 일상 카테고리
  {
    id: 'daily_1',
    question: '주말에는 주로 뭐 해?',
    category: 'daily',
    ageGroups: ['child', 'teen', 'adult'],
    followUpPrompts: ['그게 재미있어?', '혼자 있는 시간이 많아?'],
    depressionWeight: 0.5
  },
  {
    id: 'daily_2',
    question: '요즘 즐거운 일이 있었어?',
    category: 'daily',
    ageGroups: ['child', 'teen', 'adult'],
    followUpPrompts: ['어떤 게 제일 즐거웠어?', '자주 그런 일이 있어?'],
    depressionWeight: 0.6
  },
  {
    id: 'daily_3',
    question: '매일 하는 일 중에 힘든 게 있어?',
    category: 'daily',
    ageGroups: ['child', 'teen', 'adult'],
    followUpPrompts: ['그걸 안 하면 어떻게 돼?', '누가 도와줄 수 있어?'],
    depressionWeight: 0.6
  },
  {
    id: 'daily_4',
    question: '요즘 가장 신경 쓰이는 게 뭐야?',
    category: 'daily',
    ageGroups: ['teen', 'adult'],
    followUpPrompts: ['그것 때문에 잠을 못 잘 때도 있어?', '해결 방법을 찾았어?'],
    depressionWeight: 0.8
  }
];

// 부모 전용 질문
export const PARENT_QUESTIONS: CounselingQuestion[] = [
  {
    id: 'parent_1',
    question: '아이와의 관계는 어떠신가요?',
    category: 'family',
    ageGroups: ['parent'],
    followUpPrompts: ['아이가 마음을 잘 표현하나요?', '어려운 점이 있으신가요?'],
    depressionWeight: 0.7
  },
  {
    id: 'parent_2',
    question: '육아 스트레스는 어떠신가요?',
    category: 'emotion',
    ageGroups: ['parent'],
    followUpPrompts: ['가장 힘든 순간은 언제인가요?', '도움을 받을 수 있나요?'],
    depressionWeight: 0.8
  },
  {
    id: 'parent_3',
    question: '배우자와의 육아 분담은 어떠신가요?',
    category: 'family',
    ageGroups: ['parent'],
    followUpPrompts: ['의견이 다를 때가 있나요?', '어떻게 조율하시나요?'],
    depressionWeight: 0.6
  },
  {
    id: 'parent_4',
    question: '자신만의 시간을 가지고 계신가요?',
    category: 'self',
    ageGroups: ['parent'],
    followUpPrompts: ['그 시간에 무엇을 하시나요?', '충분하다고 느끼시나요?'],
    depressionWeight: 0.7
  }
];

// 질문 선택 알고리즘
export const selectQuestions = (
  ageGroup: AgeGroup,
  previousAnswers: Array<{ questionId: string; answer: string; score: number }>
): CounselingQuestion[] => {
  const baseQuestions = ageGroup === 'parent' 
    ? PARENT_QUESTIONS 
    : COUNSELING_QUESTIONS.filter(q => q.ageGroups.includes(ageGroup));
  
  // 각 카테고리에서 균형있게 선택
  const categories: Array<'emotion' | 'family' | 'social' | 'self' | 'daily'> = 
    ['emotion', 'family', 'social', 'self', 'daily'];
  
  const selected: CounselingQuestion[] = [];
  
  categories.forEach(category => {
    const categoryQuestions = baseQuestions.filter(q => q.category === category);
    if (categoryQuestions.length > 0) {
      // 아직 물어보지 않은 질문 우선
      const unasked = categoryQuestions.filter(
        q => !previousAnswers.some(a => a.questionId === q.id)
      );
      
      if (unasked.length > 0) {
        // 각 카테고리에서 2개씩
        selected.push(...unasked.slice(0, 2));
      }
    }
  });
  
  // 이전 답변 점수가 높으면 (우울 징후) 관련 질문 추가
  const highScoreAnswers = previousAnswers.filter(a => a.score >= 7);
  if (highScoreAnswers.length > 0) {
    const concernQuestions = baseQuestions.filter(
      q => q.depressionWeight && q.depressionWeight >= 0.7 && 
      !selected.some(s => s.id === q.id)
    );
    selected.push(...concernQuestions.slice(0, 2));
  }
  
  return selected.slice(0, 10); // 최대 10개 질문
};

// 답변 분석 및 점수화
export const analyzeAnswer = (
  answer: string,
  question: CounselingQuestion
): { score: number; concern: boolean; keywords: string[] } => {
  const lowerAnswer = answer.toLowerCase();
  
  // 부정적 키워드
  const negativeKeywords = [
    '슬프', '외로', '힘들', '우울', '싫', '화', '답답',
    '스트레스', '불안', '무섭', '걱정', '아프', '피곤',
    '못', '안', '없', '싫어', '괴로', '짜증'
  ];
  
  // 긍정적 키워드
  const positiveKeywords = [
    '좋', '행복', '재미', '즐거', '편안', '괜찮', '웃', '사랑',
    '친구', '좋아해', '재밌', '신나', '기쁘'
  ];
  
  let score = 5; // 중립 점수
  const foundKeywords: string[] = [];
  
  // 부정적 키워드 체크
  negativeKeywords.forEach(keyword => {
    if (lowerAnswer.includes(keyword)) {
      score += 1;
      foundKeywords.push(keyword);
    }
  });
  
  // 긍정적 키워드 체크
  positiveKeywords.forEach(keyword => {
    if (lowerAnswer.includes(keyword)) {
      score -= 0.5;
    }
  });
  
  // 짧은 답변은 회피 가능성
  if (answer.length < 10) {
    score += 0.5;
  }
  
  // 질문의 우울 가중치 적용
  const weightedScore = score * (question.depressionWeight || 1);
  
  return {
    score: Math.min(10, Math.max(0, weightedScore)),
    concern: weightedScore >= 7,
    keywords: foundKeywords
  };
};

// 전체 결과 분석
export const analyzeCounselingResults = (
  answers: Array<{ questionId: string; answer: string; score: number; keywords: string[] }>
) => {
  const totalScore = answers.reduce((sum, a) => sum + a.score, 0);
  const averageScore = totalScore / answers.length;
  
  const concernAnswers = answers.filter(a => a.score >= 7);
  const allKeywords = answers.flatMap(a => a.keywords);
  const keywordFrequency = allKeywords.reduce((acc, k) => {
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  let severity: 'low' | 'medium' | 'high' = 'low';
  if (averageScore >= 7) severity = 'high';
  else if (averageScore >= 5) severity = 'medium';
  
  let recommendation = '';
  if (severity === 'high') {
    recommendation = '전문가 상담을 권장합니다. 현재 심리적 어려움이 있을 수 있습니다.';
  } else if (severity === 'medium') {
    recommendation = '정기적인 대화와 관심이 필요합니다. 상황을 주의 깊게 지켜봐주세요.';
  } else {
    recommendation = '전반적으로 안정적입니다. 계속해서 긍정적인 환경을 유지해주세요.';
  }
  
  return {
    totalScore,
    averageScore,
    severity,
    concernCount: concernAnswers.length,
    topKeywords: Object.entries(keywordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k]) => k),
    recommendation,
    needsProfessionalHelp: severity === 'high' || concernAnswers.length >= 5
  };
};
