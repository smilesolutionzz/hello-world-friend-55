// AIH 창작 패턴인지검사 (Pattern Recognition IQ Test)
// 100% 오리지널 콘텐츠 - 저작권 안전

export interface PatternQuestion {
  id: number;
  type: 'grid' | 'sequence' | 'rotation' | 'analogy';
  category: 'logic' | 'pattern' | 'spatial' | 'speed';
  difficulty: 1 | 2 | 3;
  timeLimit: number; // seconds
  grid?: string[][]; // 3x3 grid patterns
  sequence?: string[]; // sequence patterns
  options: string[];
  correctAnswer: number;
}

// SVG 패턴 정의 (직접 그리기용)
export const patternShapes = {
  // 기본 도형
  circle: 'M50,50m-40,0a40,40 0 1,0 80,0a40,40 0 1,0 -80,0',
  square: 'M10,10L90,10L90,90L10,90Z',
  triangle: 'M50,10L90,90L10,90Z',
  diamond: 'M50,10L90,50L50,90L10,50Z',
  star: 'M50,5L61,40L98,40L68,62L79,97L50,75L21,97L32,62L2,40L39,40Z',
  hexagon: 'M50,5L93,27.5L93,72.5L50,95L7,72.5L7,27.5Z',
  
  // 분할 원
  circleHalf: 'M50,10A40,40 0 0,1 50,90L50,10Z',
  circleQuarter: 'M50,50L50,10A40,40 0 0,1 90,50Z',
  circleCross: 'M50,10V90M10,50H90',
  
  // 화살표
  arrowUp: 'M50,10L80,50L60,50L60,90L40,90L40,50L20,50Z',
  arrowRight: 'M90,50L50,20L50,40L10,40L10,60L50,60L50,80Z',
  arrowDown: 'M50,90L80,50L60,50L60,10L40,10L40,50L20,50Z',
  arrowLeft: 'M10,50L50,20L50,40L90,40L90,60L50,60L50,80Z',
  
  // 선 패턴
  lineH: 'M10,50H90',
  lineV: 'M50,10V90',
  lineD1: 'M10,10L90,90',
  lineD2: 'M90,10L10,90',
  cross: 'M50,10V90M10,50H90',
  
  // 점 패턴
  dot1: 'M50,50m-8,0a8,8 0 1,0 16,0a8,8 0 1,0 -16,0',
  dot2h: 'M30,50m-8,0a8,8 0 1,0 16,0a8,8 0 1,0 -16,0 M70,50m-8,0a8,8 0 1,0 16,0a8,8 0 1,0 -16,0',
  dot3h: 'M20,50m-6,0a6,6 0 1,0 12,0a6,6 0 1,0 -12,0 M50,50m-6,0a6,6 0 1,0 12,0a6,6 0 1,0 -12,0 M80,50m-6,0a6,6 0 1,0 12,0a6,6 0 1,0 -12,0',
  dot4: 'M30,30m-6,0a6,6 0 1,0 12,0a6,6 0 1,0 -12,0 M70,30m-6,0a6,6 0 1,0 12,0a6,6 0 1,0 -12,0 M30,70m-6,0a6,6 0 1,0 12,0a6,6 0 1,0 -12,0 M70,70m-6,0a6,6 0 1,0 12,0a6,6 0 1,0 -12,0',
};

// 패턴 질문 세트 (12문제)
export const patternIQQuestions: PatternQuestion[] = [
  // 쉬운 문제 (1-4)
  {
    id: 1,
    type: 'grid',
    category: 'pattern',
    difficulty: 1,
    timeLimit: 30,
    grid: [
      ['circle', 'circle', 'circle'],
      ['circle', 'circle', 'circle'],
      ['circle', 'circle', '?']
    ],
    options: ['circle', 'square', 'triangle', 'diamond'],
    correctAnswer: 0
  },
  {
    id: 2,
    type: 'sequence',
    category: 'logic',
    difficulty: 1,
    timeLimit: 30,
    sequence: ['square', 'circle', 'square', 'circle', 'square', '?'],
    options: ['square', 'circle', 'triangle', 'diamond'],
    correctAnswer: 1
  },
  {
    id: 3,
    type: 'grid',
    category: 'pattern',
    difficulty: 1,
    timeLimit: 30,
    grid: [
      ['dot1', 'dot2h', 'dot3h'],
      ['dot1', 'dot2h', 'dot3h'],
      ['dot1', 'dot2h', '?']
    ],
    options: ['dot1', 'dot2h', 'dot3h', 'dot4'],
    correctAnswer: 2
  },
  {
    id: 4,
    type: 'rotation',
    category: 'spatial',
    difficulty: 1,
    timeLimit: 30,
    sequence: ['arrowUp', 'arrowRight', 'arrowDown', '?'],
    options: ['arrowUp', 'arrowRight', 'arrowLeft', 'arrowDown'],
    correctAnswer: 2
  },
  
  // 중간 문제 (5-8)
  {
    id: 5,
    type: 'grid',
    category: 'logic',
    difficulty: 2,
    timeLimit: 45,
    grid: [
      ['circle', 'square', 'triangle'],
      ['square', 'triangle', 'circle'],
      ['triangle', 'circle', '?']
    ],
    options: ['circle', 'square', 'triangle', 'diamond'],
    correctAnswer: 1
  },
  {
    id: 6,
    type: 'analogy',
    category: 'logic',
    difficulty: 2,
    timeLimit: 45,
    sequence: ['circle', 'circleHalf', ':', 'square', '?'],
    options: ['square', 'circleQuarter', 'triangle', 'diamond'],
    correctAnswer: 0 // square filled half - use square as placeholder
  },
  {
    id: 7,
    type: 'grid',
    category: 'pattern',
    difficulty: 2,
    timeLimit: 45,
    grid: [
      ['lineH', 'cross', 'lineV'],
      ['lineV', 'lineH', 'cross'],
      ['cross', 'lineV', '?']
    ],
    options: ['lineH', 'lineV', 'cross', 'lineD1'],
    correctAnswer: 0
  },
  {
    id: 8,
    type: 'sequence',
    category: 'pattern',
    difficulty: 2,
    timeLimit: 45,
    sequence: ['dot1', 'dot2h', 'dot3h', 'dot4', '?'],
    options: ['dot1', 'dot2h', 'dot3h', 'dot4'],
    correctAnswer: 0 // pattern repeats
  },
  
  // 어려운 문제 (9-12)
  {
    id: 9,
    type: 'grid',
    category: 'spatial',
    difficulty: 3,
    timeLimit: 60,
    grid: [
      ['arrowUp', 'arrowRight', 'arrowDown'],
      ['arrowRight', 'arrowDown', 'arrowLeft'],
      ['arrowDown', 'arrowLeft', '?']
    ],
    options: ['arrowUp', 'arrowRight', 'arrowDown', 'arrowLeft'],
    correctAnswer: 0
  },
  {
    id: 10,
    type: 'grid',
    category: 'logic',
    difficulty: 3,
    timeLimit: 60,
    grid: [
      ['circle', 'triangle', 'square'],
      ['triangle', 'square', 'circle'],
      ['square', '?', 'triangle']
    ],
    options: ['circle', 'square', 'triangle', 'diamond'],
    correctAnswer: 0
  },
  {
    id: 11,
    type: 'analogy',
    category: 'logic',
    difficulty: 3,
    timeLimit: 60,
    sequence: ['lineH', 'lineV', ':', 'lineD1', '?'],
    options: ['lineH', 'lineD2', 'cross', 'lineV'],
    correctAnswer: 1
  },
  {
    id: 12,
    type: 'grid',
    category: 'pattern',
    difficulty: 3,
    timeLimit: 60,
    grid: [
      ['star', 'hexagon', 'diamond'],
      ['hexagon', 'diamond', 'star'],
      ['diamond', 'star', '?']
    ],
    options: ['star', 'diamond', 'hexagon', 'circle'],
    correctAnswer: 2
  }
];

// 결과 유형 정의
export interface PatternIQResult {
  totalScore: number;
  maxScore: number;
  percentile: number;
  cognitiveType: string;
  typeDescription: string;
  categoryScores: {
    logic: number;
    pattern: number;
    spatial: number;
    speed: number;
  };
  strengths: string[];
  improvements: string[];
}

// 결과 유형 분류
export const cognitiveTypes = [
  {
    id: 'genius',
    name: '천재형',
    minPercentile: 95,
    description: '탁월한 패턴 인식 능력을 보유하고 있습니다. 복잡한 규칙을 빠르게 파악하고 논리적 추론에 뛰어납니다.',
    emoji: '🧠✨'
  },
  {
    id: 'gifted',
    name: '영재형',
    minPercentile: 85,
    description: '평균 이상의 우수한 인지 능력을 가지고 있습니다. 패턴과 규칙을 효율적으로 파악합니다.',
    emoji: '🌟'
  },
  {
    id: 'logical',
    name: '논리형',
    minPercentile: 70,
    description: '논리적 사고가 뛰어납니다. 체계적인 접근으로 문제를 해결하는 경향이 있습니다.',
    emoji: '🔍'
  },
  {
    id: 'creative',
    name: '창의형',
    minPercentile: 55,
    description: '창의적이고 유연한 사고를 합니다. 다양한 관점에서 문제를 바라봅니다.',
    emoji: '🎨'
  },
  {
    id: 'balanced',
    name: '균형형',
    minPercentile: 40,
    description: '균형 잡힌 인지 능력을 가지고 있습니다. 다양한 유형의 문제에 안정적으로 대처합니다.',
    emoji: '⚖️'
  },
  {
    id: 'developing',
    name: '성장형',
    minPercentile: 0,
    description: '꾸준한 연습으로 인지 능력을 더욱 발전시킬 수 있습니다. 가능성이 무한합니다.',
    emoji: '🌱'
  }
];

// 점수 계산 함수
export const calculatePatternIQResult = (
  answers: { questionId: number; answer: number; timeSpent: number; isCorrect: boolean }[]
): PatternIQResult => {
  let totalScore = 0;
  const categoryScores = { logic: 0, pattern: 0, spatial: 0, speed: 0 };
  const categoryMax = { logic: 0, pattern: 0, spatial: 0, speed: 0 };
  
  answers.forEach((ans) => {
    const question = patternIQQuestions.find(q => q.id === ans.questionId);
    if (!question) return;
    
    const basePoints = question.difficulty * 10;
    categoryMax[question.category] += basePoints;
    
    if (ans.isCorrect) {
      // 시간 보너스 (빨리 풀수록 높은 점수)
      const timeBonus = Math.max(0, (question.timeLimit - ans.timeSpent) / question.timeLimit * 5);
      const questionScore = basePoints + timeBonus;
      totalScore += questionScore;
      categoryScores[question.category] += questionScore;
    }
    
    // 속도 점수 (정답 여부와 무관하게 빠른 응답에 가산)
    if (ans.timeSpent < question.timeLimit * 0.5) {
      categoryScores.speed += 2;
    }
  });
  
  const maxScore = 12 * 10 + 12 * 5; // 기본 점수 + 시간 보너스 최대
  const percentile = Math.min(99, Math.round((totalScore / maxScore) * 100));
  
  // 유형 결정
  const cognitiveType = cognitiveTypes.find(t => percentile >= t.minPercentile) || cognitiveTypes[cognitiveTypes.length - 1];
  
  // 강점과 개선점 분석
  const strengths: string[] = [];
  const improvements: string[] = [];
  
  const categoryNames = {
    logic: '논리적 추론',
    pattern: '패턴 인식',
    spatial: '공간 지각',
    speed: '처리 속도'
  };
  
  Object.entries(categoryScores).forEach(([key, score]) => {
    const max = categoryMax[key as keyof typeof categoryMax] || 30;
    const ratio = score / max;
    if (ratio >= 0.7) {
      strengths.push(categoryNames[key as keyof typeof categoryNames]);
    } else if (ratio < 0.4) {
      improvements.push(categoryNames[key as keyof typeof categoryNames]);
    }
  });
  
  return {
    totalScore: Math.round(totalScore),
    maxScore,
    percentile,
    cognitiveType: cognitiveType.name,
    typeDescription: cognitiveType.description,
    categoryScores,
    strengths: strengths.length > 0 ? strengths : ['균형 잡힌 능력'],
    improvements: improvements.length > 0 ? improvements : ['전반적으로 양호']
  };
};
