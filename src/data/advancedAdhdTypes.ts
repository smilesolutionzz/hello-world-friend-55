// 12가지 ADHD 유형 분류 시스템 (고도화된 검사)

export interface AdhdTypeProfile {
  id: string;
  name: string;
  description: string;
  colorGradient: string;
  characteristics: string[];
  treatmentApproach: string[];
  severityLevels: {
    매우낮음: { range: [number, number]; percentage: number };
    낮음: { range: [number, number]; percentage: number };
    보통: { range: [number, number]; percentage: number };
    높음: { range: [number, number]; percentage: number };
    매우높음: { range: [number, number]; percentage: number };
  };
}

export const adhdTypes: Record<string, AdhdTypeProfile> = {
  classic: {
    id: "classic",
    name: "월시적인 사람 (Classic ADHD)",
    description: "전형적인 ADHD 증상을 보이는 유형",
    colorGradient: "from-red-600 to-red-400",
    characteristics: [
      "주의력 부족과 과잉행동이 함께 나타남",
      "충동적 행동이 빈번함",
      "일관성 있는 집중력 유지 어려움"
    ],
    treatmentApproach: [
      "행동 치료와 약물 치료 병행",
      "구조화된 환경 조성",
      "규칙적인 운동 권장"
    ],
    severityLevels: {
      매우낮음: { range: [0, 10], percentage: 49 },
      낮음: { range: [11, 20], percentage: 15 },
      보통: { range: [21, 30], percentage: 8 },
      높음: { range: [31, 40], percentage: 4 },
      매우높음: { range: [41, 54], percentage: 19 }
    }
  },
  
  inattentive: {
    id: "inattentive",
    name: "자극제 집중력 (Inattentive ADD)",
    description: "과잉행동 없이 주의력 결핍만 있는 유형",
    colorGradient: "from-pink-600 to-pink-400",
    characteristics: [
      "조용하고 멍한 모습",
      "과제 완수의 어려움",
      "세부사항 놓침"
    ],
    treatmentApproach: [
      "인지 행동 치료",
      "시간 관리 훈련",
      "조직화 기술 학습"
    ],
    severityLevels: {
      매우낮음: { range: [0, 10], percentage: 1 },
      낮음: { range: [11, 20], percentage: 10 },
      보통: { range: [21, 30], percentage: 4 },
      높음: { range: [31, 40], percentage: 27 },
      매우높음: { range: [41, 54], percentage: 3 }
    }
  },

  overfocused: {
    id: "overfocused",
    name: "ADHD 없음 (Overfocused ADD)",
    description: "과도한 집중과 유연성 부족이 특징",
    colorGradient: "from-purple-600 to-purple-400",
    characteristics: [
      "한 가지에 과도하게 집중",
      "전환의 어려움",
      "강박적 사고 패턴"
    ],
    treatmentApproach: [
      "인지적 유연성 훈련",
      "마음챙김 명상",
      "세로토닌 조절 접근"
    ],
    severityLevels: {
      매우낮음: { range: [0, 10], percentage: 1 },
      낮음: { range: [11, 20], percentage: 13 },
      보통: { range: [21, 30], percentage: 26 },
      높음: { range: [31, 40], percentage: 16 },
      매우높음: { range: [41, 54], percentage: 24 }
    }
  },

  temporal: {
    id: "temporal",
    name: "불안해하는 (Temporal Lobe ADD)",
    description: "측두엽 기능 이상과 관련된 유형",
    colorGradient: "from-blue-700 to-blue-500",
    characteristics: [
      "기억력 문제",
      "감정 기복",
      "학습 장애 동반 가능"
    ],
    treatmentApproach: [
      "뇌 영양 지원",
      "학습 전략 개발",
      "감정 조절 훈련"
    ],
    severityLevels: {
      매우낮음: { range: [0, 10], percentage: 49 },
      낮음: { range: [11, 20], percentage: 15 },
      보통: { range: [21, 30], percentage: 8 },
      높음: { range: [31, 40], percentage: 4 },
      매우높음: { range: [41, 54], percentage: 19 }
    }
  },

  limbic: {
    id: "limbic",
    name: "복주의 (Limbic ADD)",
    description: "우울증과 함께 나타나는 유형",
    colorGradient: "from-cyan-600 to-cyan-400",
    characteristics: [
      "만성적 낮은 에너지",
      "부정적 사고",
      "낮은 자존감"
    ],
    treatmentApproach: [
      "운동과 활동량 증가",
      "긍정 심리 치료",
      "기분 안정화 접근"
    ],
    severityLevels: {
      매우낮음: { range: [0, 10], percentage: 12 },
      낮음: { range: [11, 20], percentage: 3 },
      보통: { range: [21, 30], percentage: 38 },
      높음: { range: [31, 40], percentage: 32 },
      매우높음: { range: [41, 54], percentage: 1 }
    }
  },

  ringOfFire: {
    id: "ringOfFire",
    name: "불의 괴리 (Ring of Fire ADD)",
    description: "뇌 전체의 과활성화가 특징",
    colorGradient: "from-purple-700 to-purple-500",
    characteristics: [
      "극심한 과민성",
      "기분 변화 심함",
      "다양한 증상 복합"
    ],
    treatmentApproach: [
      "항염증 식이",
      "스트레스 관리",
      "통합적 치료 접근"
    ],
    severityLevels: {
      매우낮음: { range: [0, 10], percentage: 7 },
      낮음: { range: [11, 20], percentage: 9 },
      보통: { range: [21, 30], percentage: 9 },
      높음: { range: [31, 40], percentage: 9 },
      매우높음: { range: [41, 54], percentage: 7 }
    }
  },

  anxious: {
    id: "anxious",
    name: "건워 있는 (Anxious ADD)",
    description: "불안 증상이 두드러진 유형",
    colorGradient: "from-pink-700 to-pink-500",
    characteristics: [
      "신체적 긴장",
      "걱정과 불안",
      "예측에 대한 두려움"
    ],
    treatmentApproach: [
      "이완 훈련",
      "불안 관리 기법",
      "점진적 노출 치료"
    ],
    severityLevels: {
      매우낮음: { range: [0, 10], percentage: 6 },
      낮음: { range: [11, 20], percentage: 11 },
      보통: { range: [21, 30], percentage: 54 },
      높음: { range: [31, 40], percentage: 10 },
      매우높음: { range: [41, 54], percentage: 11 }
    }
  },

  cyclothymic: {
    id: "cyclothymic",
    name: "변연계 (Cyclothymic ADD)",
    description: "기분 순환이 특징인 유형",
    colorGradient: "from-red-600 to-orange-400",
    characteristics: [
      "기분의 주기적 변화",
      "에너지 수준 변동",
      "우울-조증 사이클"
    ],
    treatmentApproach: [
      "기분 추적 및 관리",
      "생활 리듬 안정화",
      "기분 조절 치료"
    ],
    severityLevels: {
      매우낮음: { range: [0, 10], percentage: 12 },
      낮음: { range: [11, 20], percentage: 8 },
      보통: { range: [21, 30], percentage: 37 },
      높음: { range: [31, 40], percentage: 39 },
      매우높음: { range: [41, 54], percentage: 3 }
    }
  },

  prefrontal: {
    id: "prefrontal",
    name: "열등성 (Prefrontal Cortex ADD)",
    description: "전두엽 기능 저하가 주요 특징",
    colorGradient: "from-pink-600 to-pink-400",
    characteristics: [
      "실행 기능 장애",
      "계획 및 조직화 어려움",
      "충동 조절 문제"
    ],
    treatmentApproach: [
      "실행 기능 훈련",
      "외부 구조 제공",
      "보상 시스템 활용"
    ],
    severityLevels: {
      매우낮음: { range: [0, 10], percentage: 23 },
      낮음: { range: [11, 20], percentage: 8 },
      보통: { range: [21, 30], percentage: 49 },
      높음: { range: [31, 40], percentage: 12 },
      매우높음: { range: [41, 54], percentage: 22 }
    }
  },

  hyperfocus: {
    id: "hyperfocus",
    name: "과각성 (Hyperfocus ADD)",
    description: "과도한 집중과 전환 불능",
    colorGradient: "from-purple-600 to-blue-400",
    characteristics: [
      "특정 활동에 과몰입",
      "시간 감각 상실",
      "다른 일로 전환 어려움"
    ],
    treatmentApproach: [
      "타이머 활용",
      "전환 신호 훈련",
      "균형잡힌 활동 계획"
    ],
    severityLevels: {
      매우낮음: { range: [0, 10], percentage: 1 },
      낮음: { range: [11, 20], percentage: 13 },
      보통: { range: [21, 30], percentage: 11 },
      높음: { range: [31, 40], percentage: 10 },
      매우높음: { range: [41, 54], percentage: 65 }
    }
  },

  sensory: {
    id: "sensory",
    name: "감각 처리 (Sensory Processing ADD)",
    description: "감각 처리 문제가 동반된 유형",
    colorGradient: "from-blue-700 to-blue-500",
    characteristics: [
      "감각 과민 또는 둔감",
      "소음이나 촉감에 민감",
      "감각 통합 어려움"
    ],
    treatmentApproach: [
      "감각 통합 치료",
      "환경 조정",
      "감각 다이어트"
    ],
    severityLevels: {
      매우낮음: { range: [0, 10], percentage: 45 },
      낮음: { range: [11, 20], percentage: 10 },
      보통: { range: [21, 30], percentage: 12 },
      높음: { range: [31, 40], percentage: 18 },
      매우높음: { range: [41, 54], percentage: 4 }
    }
  },

  postTraumatic: {
    id: "postTraumatic",
    name: "외상 후 (Post-Traumatic ADD)",
    description: "트라우마로 인해 발생한 유형",
    colorGradient: "from-cyan-600 to-cyan-400",
    characteristics: [
      "과거 트라우마 경험",
      "과각성 상태",
      "집중력 저하"
    ],
    treatmentApproach: [
      "트라우마 치료",
      "안정화 작업",
      "EMDR 또는 CPT"
    ],
    severityLevels: {
      매우낮음: { range: [0, 10], percentage: 7 },
      낮음: { range: [11, 20], percentage: 5 },
      보통: { range: [21, 30], percentage: 8 },
      높음: { range: [31, 40], percentage: 9 },
      매우높음: { range: [41, 54], percentage: 6 }
    }
  }
};

export interface AdhdTypeQuestion {
  id: string;
  text: string;
  targetTypes: string[]; // 이 질문이 높은 점수를 받으면 관련된 ADHD 유형들
  weight: number; // 질문의 가중치
}

export const advancedAdhdQuestions: AdhdTypeQuestion[] = [
  // Classic ADHD
  {
    id: "q1",
    text: "일상생활에서 계획을 세우거나 조직화하는 것이 어렵습니까?",
    targetTypes: ["classic", "prefrontal"],
    weight: 1.0
  },
  {
    id: "q2",
    text: "가만히 앉아 있어야 할 때 손발을 만지작거리거나 몸을 움직이게 됩니까?",
    targetTypes: ["classic"],
    weight: 1.2
  },
  {
    id: "q3",
    text: "충동적으로 행동하여 나중에 후회하는 경우가 자주 있습니까?",
    targetTypes: ["classic", "anxious"],
    weight: 1.1
  },
  
  // Inattentive
  {
    id: "q4",
    text: "대화 중에 자주 딴생각을 하거나 멍하니 있는 경우가 많습니까?",
    targetTypes: ["inattentive", "limbic"],
    weight: 1.0
  },
  {
    id: "q5",
    text: "세부사항을 놓치거나 부주의한 실수를 자주 합니까?",
    targetTypes: ["inattentive", "temporal"],
    weight: 1.0
  },
  {
    id: "q6",
    text: "긴 시간 집중이 필요한 작업을 시작하는 것이 어렵습니까?",
    targetTypes: ["inattentive", "limbic"],
    weight: 1.1
  },

  // Overfocused
  {
    id: "q7",
    text: "한 가지 생각이나 활동에서 벗어나기 어렵습니까?",
    targetTypes: ["overfocused", "hyperfocus"],
    weight: 1.0
  },
  {
    id: "q8",
    text: "자신의 의견이나 방식을 고집하는 경향이 있습니까?",
    targetTypes: ["overfocused"],
    weight: 1.0
  },
  {
    id: "q9",
    text: "과거의 실수나 문제를 반복적으로 생각합니까?",
    targetTypes: ["overfocused", "anxious"],
    weight: 1.1
  },

  // Temporal Lobe
  {
    id: "q10",
    text: "최근 일들을 기억하는 데 어려움이 있습니까?",
    targetTypes: ["temporal"],
    weight: 1.2
  },
  {
    id: "q11",
    text: "감정이 갑자기 변하거나 예측하기 어렵습니까?",
    targetTypes: ["temporal", "cyclothymic"],
    weight: 1.0
  },
  {
    id: "q12",
    text: "글을 읽거나 쓰는 데 어려움을 경험합니까?",
    targetTypes: ["temporal"],
    weight: 1.1
  },

  // Limbic
  {
    id: "q13",
    text: "만성적으로 에너지가 부족하고 피곤함을 느낍니까?",
    targetTypes: ["limbic"],
    weight: 1.3
  },
  {
    id: "q14",
    text: "부정적인 생각이나 비관적인 전망을 자주 합니까?",
    targetTypes: ["limbic", "anxious"],
    weight: 1.2
  },
  {
    id: "q15",
    text: "활동이나 관심사에 대한 동기가 낮습니까?",
    targetTypes: ["limbic"],
    weight: 1.2
  },

  // Ring of Fire
  {
    id: "q16",
    text: "작은 일에도 쉽게 짜증이 나거나 화가 납니까?",
    targetTypes: ["ringOfFire", "anxious"],
    weight: 1.1
  },
  {
    id: "q17",
    text: "기분이 급격하게 변하고 예측할 수 없습니까?",
    targetTypes: ["ringOfFire", "cyclothymic"],
    weight: 1.2
  },
  {
    id: "q18",
    text: "여러 증상이 동시에 나타나 혼란스럽습니까?",
    targetTypes: ["ringOfFire"],
    weight: 1.3
  },

  // Anxious
  {
    id: "q19",
    text: "지속적으로 긴장되어 있거나 불안함을 느낍니까?",
    targetTypes: ["anxious"],
    weight: 1.3
  },
  {
    id: "q20",
    text: "미래에 대한 걱정이 일상생활을 방해합니까?",
    targetTypes: ["anxious"],
    weight: 1.2
  },
  {
    id: "q21",
    text: "신체적 증상(두근거림, 땀, 떨림)을 자주 경험합니까?",
    targetTypes: ["anxious", "postTraumatic"],
    weight: 1.1
  },

  // Cyclothymic
  {
    id: "q22",
    text: "기분이 주기적으로 좋았다가 나빴다가 합니까?",
    targetTypes: ["cyclothymic"],
    weight: 1.4
  },
  {
    id: "q23",
    text: "에너지 수준이 극과 극으로 변합니까?",
    targetTypes: ["cyclothymic"],
    weight: 1.3
  },
  {
    id: "q24",
    text: "우울한 시기와 활기찬 시기가 번갈아 나타납니까?",
    targetTypes: ["cyclothymic"],
    weight: 1.4
  },

  // Prefrontal
  {
    id: "q25",
    text: "장기적인 계획을 세우고 실행하는 것이 어렵습니까?",
    targetTypes: ["prefrontal"],
    weight: 1.2
  },
  {
    id: "q26",
    text: "우선순위를 정하는 데 어려움이 있습니까?",
    targetTypes: ["prefrontal"],
    weight: 1.1
  },
  {
    id: "q27",
    text: "일을 시작하기 전에 미루는 경향이 있습니까?",
    targetTypes: ["prefrontal", "limbic"],
    weight: 1.0
  },

  // Hyperfocus
  {
    id: "q28",
    text: "관심 있는 일에 몰입하면 시간 가는 줄 모릅니까?",
    targetTypes: ["hyperfocus"],
    weight: 1.2
  },
  {
    id: "q29",
    text: "집중하고 있을 때 다른 사람의 말을 듣지 못합니까?",
    targetTypes: ["hyperfocus", "overfocused"],
    weight: 1.1
  },
  {
    id: "q30",
    text: "한 가지 활동에서 다른 활동으로 전환하기 어렵습니까?",
    targetTypes: ["hyperfocus", "overfocused"],
    weight: 1.0
  },

  // Sensory Processing
  {
    id: "q31",
    text: "소음, 빛, 냄새에 민감하게 반응합니까?",
    targetTypes: ["sensory"],
    weight: 1.3
  },
  {
    id: "q32",
    text: "특정 촉감이나 옷의 질감이 불편합니까?",
    targetTypes: ["sensory"],
    weight: 1.2
  },
  {
    id: "q33",
    text: "감각 자극이 많은 환경에서 압도됩니까?",
    targetTypes: ["sensory", "anxious"],
    weight: 1.1
  },

  // Post-Traumatic
  {
    id: "q34",
    text: "과거의 힘든 경험이 현재 집중력에 영향을 줍니까?",
    targetTypes: ["postTraumatic"],
    weight: 1.4
  },
  {
    id: "q35",
    text: "갑작스러운 자극에 과도하게 놀라거나 반응합니까?",
    targetTypes: ["postTraumatic"],
    weight: 1.3
  },
  {
    id: "q36",
    text: "특정 상황이나 장소를 피하려는 경향이 있습니까?",
    targetTypes: ["postTraumatic", "anxious"],
    weight: 1.2
  }
];
