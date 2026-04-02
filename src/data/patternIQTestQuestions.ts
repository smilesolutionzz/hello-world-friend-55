// AIH 패턴인지 검사 v2 - 텍스트/숫자 기반 명확한 문항
// 4개 영역 × 3문항 = 12문항

export interface PatternQuestion {
  id: number;
  type: 'number_sequence' | 'letter_pattern' | 'matrix' | 'speed_match' | 'spatial' | 'analogy';
  category: 'logic' | 'pattern' | 'spatial' | 'speed';
  difficulty: 1 | 2 | 3;
  timeLimit: number;
  prompt: string;
  promptEn: string;
  visual?: string[][]; // optional grid display
  options: string[];
  correctAnswer: number;
  explanation: string;
  explanationEn: string;
}

// 12문항: 논리추론 3, 패턴인식 3, 공간지각 3, 처리속도 3
export const patternIQQuestions: PatternQuestion[] = [
  // ===== 논리적 추론 (Logic) =====
  {
    id: 1,
    type: 'number_sequence',
    category: 'logic',
    difficulty: 1,
    timeLimit: 30,
    prompt: '다음 수열에서 ?에 들어갈 숫자는?\n2, 4, 8, 16, ?',
    promptEn: 'What number comes next?\n2, 4, 8, 16, ?',
    options: ['24', '32', '30', '20'],
    correctAnswer: 1,
    explanation: '각 숫자가 ×2 규칙: 2→4→8→16→32',
    explanationEn: 'Each number is ×2: 2→4→8→16→32',
  },
  {
    id: 2,
    type: 'number_sequence',
    category: 'logic',
    difficulty: 2,
    timeLimit: 45,
    prompt: '다음 수열에서 ?에 들어갈 숫자는?\n1, 1, 2, 3, 5, 8, ?',
    promptEn: 'What number comes next?\n1, 1, 2, 3, 5, 8, ?',
    options: ['11', '12', '13', '10'],
    correctAnswer: 2,
    explanation: '피보나치 수열: 앞 두 수의 합 (5+8=13)',
    explanationEn: 'Fibonacci sequence: sum of previous two (5+8=13)',
  },
  {
    id: 3,
    type: 'analogy',
    category: 'logic',
    difficulty: 3,
    timeLimit: 60,
    prompt: '사과 : 과일 = 장미 : ?',
    promptEn: 'Apple : Fruit = Rose : ?',
    options: ['나무', '꽃', '정원', '빨강'],
    correctAnswer: 1,
    explanation: '사과는 과일의 한 종류, 장미는 꽃의 한 종류 (상위 범주 관계)',
    explanationEn: 'Apple is a type of Fruit, Rose is a type of Flower (category relationship)',
  },

  // ===== 패턴 인식 (Pattern) =====
  {
    id: 4,
    type: 'letter_pattern',
    category: 'pattern',
    difficulty: 1,
    timeLimit: 30,
    prompt: '다음 패턴에서 ?에 들어갈 것은?\nA, C, E, G, ?',
    promptEn: 'What comes next?\nA, C, E, G, ?',
    options: ['H', 'I', 'J', 'K'],
    correctAnswer: 1,
    explanation: '알파벳을 하나씩 건너뛰는 패턴: A(B)C(D)E(F)G(H)I',
    explanationEn: 'Skip one letter pattern: A(B)C(D)E(F)G(H)I',
  },
  {
    id: 5,
    type: 'matrix',
    category: 'pattern',
    difficulty: 2,
    timeLimit: 45,
    prompt: '3×3 표에서 ?에 들어갈 숫자는?',
    promptEn: 'What number goes in the ? position?',
    visual: [
      ['2', '4', '6'],
      ['3', '6', '9'],
      ['5', '10', '?'],
    ],
    options: ['12', '15', '20', '14'],
    correctAnswer: 1,
    explanation: '각 행의 첫 숫자에 ×1, ×2, ×3 규칙: 5×3=15',
    explanationEn: 'Each row: first number ×1, ×2, ×3 → 5×3=15',
  },
  {
    id: 6,
    type: 'letter_pattern',
    category: 'pattern',
    difficulty: 3,
    timeLimit: 60,
    prompt: '다음 패턴에서 ?에 들어갈 것은?\nZ, X, V, T, ?',
    promptEn: 'What comes next?\nZ, X, V, T, ?',
    options: ['S', 'R', 'Q', 'P'],
    correctAnswer: 1,
    explanation: '알파벳 역순에서 하나씩 건너뛰기: Z(Y)X(W)V(U)T(S)R',
    explanationEn: 'Reverse alphabet, skip one: Z(Y)X(W)V(U)T(S)R',
  },

  // ===== 공간 지각 (Spatial) =====
  {
    id: 7,
    type: 'spatial',
    category: 'spatial',
    difficulty: 1,
    timeLimit: 30,
    prompt: '화살표가 시계 방향으로 90° 회전합니다.\n↑ → ↓ → ?',
    promptEn: 'Arrow rotates 90° clockwise.\n↑ → ↓ → ?',
    options: ['↑', '←', '→', '↓'],
    correctAnswer: 1,
    explanation: '90° 시계방향 회전: ↑→→↓→← (위→오른→아래→왼)',
    explanationEn: '90° clockwise: ↑→→↓→← (up→right→down→left)',
  },
  {
    id: 8,
    type: 'spatial',
    category: 'spatial',
    difficulty: 2,
    timeLimit: 45,
    prompt: '거울에 비추면 어떻게 보일까요?\n원본: ◢',
    promptEn: 'How does this look in a mirror?\nOriginal: ◢',
    options: ['◣', '◤', '◥', '◢'],
    correctAnswer: 0,
    explanation: '좌우 대칭(거울 반사): ◢의 좌우반전은 ◣',
    explanationEn: 'Horizontal mirror: ◢ flipped is ◣',
  },
  {
    id: 9,
    type: 'spatial',
    category: 'spatial',
    difficulty: 3,
    timeLimit: 60,
    prompt: '정육면체 전개도를 접었을 때, ★과 마주보는 면은?',
    promptEn: 'When folding this cube net, which face is opposite to ★?',
    visual: [
      ['', '①', '', ''],
      ['②', '★', '③', '④'],
      ['', '⑤', '', ''],
    ],
    options: ['①', '③', '④', '⑤'],
    correctAnswer: 2,
    explanation: '십자형 전개도에서 ★의 맞은편은 ④ (2칸 떨어진 면)',
    explanationEn: 'In cross-shaped net, ★ is opposite to ④ (2 faces apart)',
  },

  // ===== 처리 속도 (Speed) =====
  {
    id: 10,
    type: 'speed_match',
    category: 'speed',
    difficulty: 1,
    timeLimit: 15,
    prompt: '다음 중 다른 하나를 고르세요:\n🔵 🔵 🔵 🔴 🔵',
    promptEn: 'Find the odd one out:\n🔵 🔵 🔵 🔴 🔵',
    options: ['1번째', '2번째', '4번째', '5번째'],
    correctAnswer: 2,
    explanation: '4번째만 🔴 (빨간색)으로 다릅니다',
    explanationEn: 'The 4th one is 🔴 (red), different from others',
  },
  {
    id: 11,
    type: 'speed_match',
    category: 'speed',
    difficulty: 2,
    timeLimit: 15,
    prompt: '아래 숫자들의 합은?\n3 + 7 + 5 = ?',
    promptEn: 'What is the sum?\n3 + 7 + 5 = ?',
    options: ['14', '15', '16', '13'],
    correctAnswer: 1,
    explanation: '3+7+5=15 (빠른 암산 능력 측정)',
    explanationEn: '3+7+5=15 (measures quick mental arithmetic)',
  },
  {
    id: 12,
    type: 'speed_match',
    category: 'speed',
    difficulty: 3,
    timeLimit: 20,
    prompt: '다음 중 좌우가 같은 글자는?\n① 곰 ② 품 ③ 홈 ④ 몸',
    promptEn: 'Which word is a palindrome?\n① MOM ② MAP ③ TOP ④ POT',
    options: ['①', '②', '③', '④'],
    correctAnswer: 1,
    explanation: '품(品)은 좌우 대칭 구조 / MOM은 거울 대칭',
    explanationEn: '"품" has symmetric structure / MOM is a palindrome',
  },
];

// SVG patternShapes는 더이상 사용하지 않지만 호환성 유지
export const patternShapes: Record<string, string> = {};

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
  answerDetails: {
    questionId: number;
    isCorrect: boolean;
    userAnswer: number;
    correctAnswer: number;
    explanation: string;
    explanationEn: string;
    category: string;
    timeSpent: number;
  }[];
}

// 결과 유형 분류
export const cognitiveTypes = [
  {
    id: 'genius',
    name: '천재형',
    nameEn: 'Genius',
    minPercentile: 95,
    description: '탁월한 패턴 인식 능력을 보유하고 있습니다. 복잡한 규칙을 빠르게 파악하고 논리적 추론에 뛰어납니다.',
    descriptionEn: 'Exceptional pattern recognition. Quickly identifies complex rules with outstanding logical reasoning.',
    emoji: '🧠✨',
  },
  {
    id: 'gifted',
    name: '영재형',
    nameEn: 'Gifted',
    minPercentile: 85,
    description: '평균 이상의 우수한 인지 능력을 가지고 있습니다. 패턴과 규칙을 효율적으로 파악합니다.',
    descriptionEn: 'Superior cognitive abilities above average. Efficiently identifies patterns and rules.',
    emoji: '🌟',
  },
  {
    id: 'logical',
    name: '논리형',
    nameEn: 'Logical',
    minPercentile: 70,
    description: '논리적 사고가 뛰어납니다. 체계적인 접근으로 문제를 해결하는 경향이 있습니다.',
    descriptionEn: 'Excellent logical thinking. Tends to solve problems with a systematic approach.',
    emoji: '🔍',
  },
  {
    id: 'creative',
    name: '창의형',
    nameEn: 'Creative',
    minPercentile: 55,
    description: '창의적이고 유연한 사고를 합니다. 다양한 관점에서 문제를 바라봅니다.',
    descriptionEn: 'Creative and flexible thinking. Views problems from various perspectives.',
    emoji: '🎨',
  },
  {
    id: 'balanced',
    name: '균형형',
    nameEn: 'Balanced',
    minPercentile: 40,
    description: '균형 잡힌 인지 능력을 가지고 있습니다. 다양한 유형의 문제에 안정적으로 대처합니다.',
    descriptionEn: 'Balanced cognitive abilities. Handles various problem types steadily.',
    emoji: '⚖️',
  },
  {
    id: 'developing',
    name: '성장형',
    nameEn: 'Developing',
    minPercentile: 0,
    description: '꾸준한 연습으로 인지 능력을 더욱 발전시킬 수 있습니다. 가능성이 무한합니다.',
    descriptionEn: 'Cognitive abilities can further develop with consistent practice. Unlimited potential.',
    emoji: '🌱',
  },
];

// 점수 계산 함수
export const calculatePatternIQResult = (
  answers: { questionId: number; answer: number; timeSpent: number; isCorrect: boolean }[]
): PatternIQResult => {
  let totalScore = 0;
  const categoryScores = { logic: 0, pattern: 0, spatial: 0, speed: 0 };
  const categoryMax = { logic: 0, pattern: 0, spatial: 0, speed: 0 };
  const answerDetails: PatternIQResult['answerDetails'] = [];

  answers.forEach((ans) => {
    const question = patternIQQuestions.find((q) => q.id === ans.questionId);
    if (!question) return;

    const basePoints = question.difficulty * 10;
    categoryMax[question.category] += basePoints;

    if (ans.isCorrect) {
      const timeBonus = Math.max(0, ((question.timeLimit - ans.timeSpent) / question.timeLimit) * 5);
      const questionScore = basePoints + timeBonus;
      totalScore += questionScore;
      categoryScores[question.category] += questionScore;
    }

    // 속도 가산
    if (ans.timeSpent < question.timeLimit * 0.5) {
      categoryScores.speed += 2;
    }

    answerDetails.push({
      questionId: ans.questionId,
      isCorrect: ans.isCorrect,
      userAnswer: ans.answer,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      explanationEn: question.explanationEn,
      category: question.category,
      timeSpent: ans.timeSpent,
    });
  });

  const maxScore = patternIQQuestions.reduce((sum, q) => sum + q.difficulty * 10 + 5, 0);
  const percentile = Math.min(99, Math.round((totalScore / maxScore) * 100));

  const cognitiveType = cognitiveTypes.find((t) => percentile >= t.minPercentile) || cognitiveTypes[cognitiveTypes.length - 1];

  const strengths: string[] = [];
  const improvements: string[] = [];
  const categoryNames: Record<string, string> = {
    logic: '논리적 추론',
    pattern: '패턴 인식',
    spatial: '공간 지각',
    speed: '처리 속도',
  };

  Object.entries(categoryScores).forEach(([key, score]) => {
    const max = categoryMax[key as keyof typeof categoryMax] || 30;
    const ratio = score / max;
    if (ratio >= 0.7) strengths.push(categoryNames[key]);
    else if (ratio < 0.4) improvements.push(categoryNames[key]);
  });

  return {
    totalScore: Math.round(totalScore),
    maxScore,
    percentile,
    cognitiveType: cognitiveType.name,
    typeDescription: cognitiveType.description,
    categoryScores,
    strengths: strengths.length > 0 ? strengths : ['균형 잡힌 능력'],
    improvements: improvements.length > 0 ? improvements : ['전반적으로 양호'],
    answerDetails,
  };
};
