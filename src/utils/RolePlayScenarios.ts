// AI 롤플레이 연습 시나리오 시스템

export type RolePlayCategory = 
  | 'friendship'      // 친구 사귀기
  | 'conflict'        // 갈등 해결
  | 'gratitude'       // 감사 표현
  | 'refusal'         // 거절하기
  | 'apology'         // 사과하기
  | 'request'         // 부탁하기
  | 'emotion'         // 감정 표현
  | 'interview'       // 면접 연습
  | 'presentation';   // 발표 연습

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface RolePlayScenario {
  id: string;
  category: RolePlayCategory;
  title: string;
  description: string;
  ageGroups: ('child' | 'teen' | 'adult')[];
  difficulty: DifficultyLevel;
  aiRole: string;           // AI가 맡을 역할
  userRole: string;         // 사용자가 맡을 역할
  situation: string;        // 상황 설명
  goals: string[];          // 연습 목표
  tips: string[];           // 팁
  aiPersona: string;        // AI 페르소나
  successCriteria: {
    turnCount: number;      // 최소 대화 턴 수
    keywords: string[];     // 포함되어야 할 키워드
    emotional: string[];    // 표현해야 할 감정
  };
  voice: string;            // OpenAI 음성
  exampleDialogue?: {       // 예시 대화
    user: string;
    ai: string;
  }[];
}

// 롤플레이 시나리오 데이터
export const ROLEPLAY_SCENARIOS: RolePlayScenario[] = [
  // ========== 친구 사귀기 ==========
  {
    id: 'friendship_playground',
    category: 'friendship',
    title: '놀이터에서 친구 만들기',
    description: '놀이터에서 처음 보는 친구에게 다가가 함께 놀자고 말해봐요',
    ageGroups: ['child'],
    difficulty: 'easy',
    aiRole: '놀이터에서 그네를 타고 있는 친구',
    userRole: '놀고 싶은 아이',
    situation: '놀이터에 왔는데 혼자 그네를 타고 있는 친구가 보여요. 함께 놀고 싶어요.',
    goals: [
      '먼저 인사하기',
      '이름 소개하기',
      '함께 놀자고 제안하기'
    ],
    tips: [
      '밝게 웃으며 인사해보세요',
      '"같이 놀까?" 하고 물어보세요',
      '상대방이 좋아하는 놀이를 물어보세요'
    ],
    aiPersona: '너는 놀이터에서 그네를 타고 있는 7살 어린이야. 처음 보는 친구가 다가오면 조금 낯을 가리지만, 친절하게 대하면 금방 친해져. 친구가 되고 싶어하고 함께 놀고 싶어해. 밝고 천진난만하게 대답해줘. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 5,
      keywords: ['이름', '놀다', '함께'],
      emotional: ['호기심', '친근함']
    },
    voice: 'shimmer',
    exampleDialogue: [
      { user: '안녕! 나는 민수야', ai: '안녕? 나는 지우야!' },
      { user: '같이 놀까?', ai: '좋아! 뭐 하고 놀까?' }
    ]
  },
  {
    id: 'friendship_school',
    category: 'friendship',
    title: '전학 온 친구에게 말 걸기',
    description: '우리 반에 전학 온 친구에게 먼저 다가가 친해져보세요',
    ageGroups: ['child', 'teen'],
    difficulty: 'medium',
    aiRole: '오늘 전학 온 새 친구',
    userRole: '반 친구',
    situation: '오늘 우리 반에 새로운 친구가 전학 왔어요. 혼자 있는 것 같아 보여서 말을 걸고 싶어요.',
    goals: [
      '환영하는 마음 전하기',
      '학교 소개하기',
      '점심 같이 먹자고 제안하기'
    ],
    tips: [
      '긴장하고 있을 수 있으니 천천히 말해보세요',
      '학교에 대해 궁금한 게 있는지 물어보세요',
      '같이 점심 먹자고 제안해보세요'
    ],
    aiPersona: '너는 오늘 새 학교에 전학 온 학생이야. 조금 긴장되고 낯선 환경이 어색하지만, 친구를 사귀고 싶어해. 누군가 친절하게 다가오면 고마워하고 조심스럽게 마음을 열어. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 7,
      keywords: ['환영', '학교', '점심'],
      emotional: ['친절', '배려']
    },
    voice: 'alloy'
  },

  // ========== 갈등 해결 ==========
  {
    id: 'conflict_toy',
    category: 'conflict',
    title: '장난감을 두고 다툰 친구와 화해하기',
    description: '친구와 장난감 때문에 싸웠어요. 먼저 화해를 청해보세요',
    ageGroups: ['child'],
    difficulty: 'medium',
    aiRole: '장난감 때문에 화가 난 친구',
    userRole: '화해하고 싶은 친구',
    situation: '아까 장난감을 두고 친구와 다퉜어요. 미안하고 다시 친하게 지내고 싶어요.',
    goals: [
      '미안한 마음 전하기',
      '친구 감정 이해하기',
      '앞으로 어떻게 할지 약속하기'
    ],
    tips: [
      '"미안해"라고 먼저 말해보세요',
      '친구가 왜 화났는지 물어보세요',
      '다음부터는 어떻게 할지 말해보세요'
    ],
    aiPersona: '너는 장난감을 빼앗겨서 화가 난 어린이야. 하지만 친구가 진심으로 사과하고 이해해주면 마음이 풀려. 처음에는 화가 나 있지만, 대화를 통해 점차 마음을 열어. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 6,
      keywords: ['미안', '이해', '약속'],
      emotional: ['미안함', '이해']
    },
    voice: 'echo'
  },
  {
    id: 'conflict_misunderstanding',
    category: 'conflict',
    title: '오해를 풀고 사과하기',
    description: '친구와 오해가 생겼어요. 진심을 전하고 오해를 풀어보세요',
    ageGroups: ['teen', 'adult'],
    difficulty: 'hard',
    aiRole: '오해로 상처받은 친구',
    userRole: '오해를 풀고 싶은 사람',
    situation: '친구가 내 말을 오해해서 상처를 받았어요. 진짜 의도를 설명하고 화해하고 싶어요.',
    goals: [
      '상황 정확히 설명하기',
      '진심 전달하기',
      '관계 회복하기'
    ],
    tips: [
      '상대방의 감정을 먼저 인정해주세요',
      '내 의도를 차근차근 설명하세요',
      '앞으로 더 조심하겠다고 말하세요'
    ],
    aiPersona: '너는 친구의 말에 오해가 생겨 상처받은 사람이야. 처음에는 방어적이지만, 친구가 진심으로 설명하고 사과하면 이해하려고 노력해. 감정적으로 대응하되, 대화가 진행되면서 점차 이성적으로 상황을 파악해. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 8,
      keywords: ['오해', '진심', '이해'],
      emotional: ['진심', '배려']
    },
    voice: 'fable'
  },

  // ========== 감사 표현 ==========
  {
    id: 'gratitude_help',
    category: 'gratitude',
    title: '도움 받은 친구에게 감사 표현하기',
    description: '친구가 도와줘서 고마워요. 마음을 표현해보세요',
    ageGroups: ['child', 'teen'],
    difficulty: 'easy',
    aiRole: '도움을 준 친구',
    userRole: '감사를 표현하고 싶은 사람',
    situation: '숙제가 어려웠는데 친구가 설명해줘서 이해할 수 있었어요. 고마움을 전하고 싶어요.',
    goals: [
      '구체적으로 무엇이 도움됐는지 말하기',
      '진심으로 감사 표현하기',
      '나도 도와주고 싶다는 마음 전하기'
    ],
    tips: [
      '구체적으로 무엇이 좋았는지 말해보세요',
      '"정말 고마워" 하고 진심을 담아 말하세요',
      '"나도 네가 필요하면 도와줄게" 하고 말해보세요'
    ],
    aiPersona: '너는 친구를 도와준 사람이야. 친구가 고마워하면 기쁘고 뿌듯해하며, 자연스럽게 "별거 아니야" 하며 겸손하게 대답해. 친구의 감사 표현을 기쁘게 받아들여. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 4,
      keywords: ['고마워', '도움', '덕분에'],
      emotional: ['감사', '기쁨']
    },
    voice: 'alloy'
  },

  // ========== 거절하기 ==========
  {
    id: 'refusal_invitation',
    category: 'refusal',
    title: '친구의 제안을 정중하게 거절하기',
    description: '친구가 놀자고 했지만 오늘은 못 가요. 상처주지 않고 거절해보세요',
    ageGroups: ['child', 'teen'],
    difficulty: 'medium',
    aiRole: '놀자고 제안하는 친구',
    userRole: '거절해야 하는 사람',
    situation: '친구가 오늘 같이 놀자고 했는데, 학원 가야 해서 못 가요. 친구 기분 상하지 않게 거절하고 싶어요.',
    goals: [
      '정중하게 거절하기',
      '이유 설명하기',
      '다음 기회 약속하기'
    ],
    tips: [
      '"미안한데"로 시작하세요',
      '못 가는 이유를 설명하세요',
      '"다음에 꼭 놀자"고 말하세요'
    ],
    aiPersona: '너는 친구에게 같이 놀자고 제안하는 사람이야. 친구가 거절하면 조금 아쉽지만, 이유를 이해하고 다음 기회를 기대해. 친구가 정중하게 거절하고 다음을 약속하면 기분 좋게 받아들여. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 5,
      keywords: ['미안', '이유', '다음에'],
      emotional: ['정중함', '배려']
    },
    voice: 'shimmer'
  },
  {
    id: 'refusal_pressure',
    category: 'refusal',
    title: '또래 압력에 단호하게 거절하기',
    description: '친구들이 하기 싫은 일을 하자고 해요. 단호하게 거절해보세요',
    ageGroups: ['teen'],
    difficulty: 'hard',
    aiRole: '같이 하자고 설득하는 친구',
    userRole: '거절하고 싶은 사람',
    situation: '친구들이 PC방에 가자고 하는데, 시험 공부를 해야 해요. 단호하게 거절하고 싶어요.',
    goals: [
      '명확하게 의사 전달하기',
      '이유 설명하기',
      '자신의 선택 지키기'
    ],
    tips: [
      '"안 돼" 하고 명확하게 말하세요',
      '왜 안 되는지 설명하세요',
      '계속 설득하면 "정말 안 돼" 하고 반복하세요'
    ],
    aiPersona: '너는 친구를 계속 설득하려는 또래야. 처음에는 "괜찮아, 잠깐만"이라며 설득하지만, 친구가 단호하게 거절하면 결국 이해하고 물러나. 약간의 또래 압력을 주되, 친구의 단호한 태도에는 결국 존중해줘. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 6,
      keywords: ['안 돼', '공부', '나중에'],
      emotional: ['단호함', '자신감']
    },
    voice: 'echo'
  },

  // ========== 사과하기 ==========
  {
    id: 'apology_mistake',
    category: 'apology',
    title: '실수한 일에 대해 사과하기',
    description: '친구의 물건을 망가뜨렸어요. 진심으로 사과해보세요',
    ageGroups: ['child', 'teen'],
    difficulty: 'medium',
    aiRole: '물건이 망가진 친구',
    userRole: '사과해야 하는 사람',
    situation: '친구의 연필을 빌렸다가 실수로 부러뜨렸어요. 정말 미안하고 사과하고 싶어요.',
    goals: [
      '솔직하게 인정하기',
      '진심으로 사과하기',
      '해결 방법 제시하기'
    ],
    tips: [
      '변명하지 말고 솔직하게 인정하세요',
      '"정말 미안해" 하고 진심을 담아 말하세요',
      '새 것으로 사주겠다고 제안하세요'
    ],
    aiPersona: '너는 소중한 물건이 망가져서 속상한 친구야. 처음에는 화가 나지만, 친구가 진심으로 사과하고 책임지려는 모습을 보이면 이해하고 용서해줘. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 6,
      keywords: ['미안', '실수', '보상'],
      emotional: ['미안함', '책임감']
    },
    voice: 'alloy'
  },

  // ========== 부탁하기 ==========
  {
    id: 'request_favor',
    category: 'request',
    title: '선생님께 질문 여쭤보기',
    description: '수업 시간에 이해가 안 되는 부분이 있어요. 선생님께 물어보세요',
    ageGroups: ['child', 'teen'],
    difficulty: 'easy',
    aiRole: '선생님',
    userRole: '질문하고 싶은 학생',
    situation: '수업 시간에 배운 내용 중 이해가 안 되는 부분이 있어요. 선생님께 여쭤보고 싶어요.',
    goals: [
      '정중하게 말 걸기',
      '구체적으로 질문하기',
      '감사 인사하기'
    ],
    tips: [
      '"선생님, 질문 있어요" 하고 손을 들어보세요',
      '어떤 부분이 어려운지 구체적으로 말하세요',
      '설명을 들은 후 "감사합니다" 하고 인사하세요'
    ],
    aiPersona: '너는 친절한 선생님이야. 학생이 질문하면 기쁘게 받아들이고, 이해하기 쉽게 설명해줘. 학생이 이해했는지 확인하고, 격려의 말을 해줘. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 5,
      keywords: ['선생님', '질문', '감사합니다'],
      emotional: ['정중함', '호기심']
    },
    voice: 'fable'
  },

  // ========== 감정 표현 ==========
  {
    id: 'emotion_sad',
    category: 'emotion',
    title: '속상한 마음 표현하기',
    description: '속상한 일이 있었어요. 친구에게 마음을 털어놓아보세요',
    ageGroups: ['child', 'teen'],
    difficulty: 'medium',
    aiRole: '걱정하는 친구',
    userRole: '속상한 사람',
    situation: '오늘 속상한 일이 있었는데 아무에게도 말하지 못했어요. 친한 친구에게 말하고 싶어요.',
    goals: [
      '감정을 솔직하게 표현하기',
      '무슨 일이 있었는지 설명하기',
      '위로 받기'
    ],
    tips: [
      '"오늘 속상한 일이 있어"라고 시작하세요',
      '무슨 일이 있었는지 천천히 말해보세요',
      '친구의 위로를 받아들이세요'
    ],
    aiPersona: '너는 친구가 속상해하는 걸 보고 걱정하는 친한 친구야. 친구의 이야기를 경청하고, 공감하며 위로해줘. "괜찮아, 네 곁에 있을게" 같은 따뜻한 말을 해줘. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 6,
      keywords: ['속상', '힘들어', '위로'],
      emotional: ['슬픔', '안도']
    },
    voice: 'alloy'
  },

  // ========== 면접 연습 ==========
  {
    id: 'interview_job',
    category: 'interview',
    title: '직무 면접 연습하기',
    description: '취업 면접을 앞두고 있어요. 면접 연습을 해보세요',
    ageGroups: ['adult'],
    difficulty: 'hard',
    aiRole: '면접관',
    userRole: '면접자',
    situation: '지원한 회사의 면접이 다음 주에 있어요. 자기소개와 지원 동기를 연습하고 싶어요.',
    goals: [
      '자신감 있게 자기소개하기',
      '지원 동기 명확히 전달하기',
      '질문에 논리적으로 답변하기'
    ],
    tips: [
      '밝은 목소리로 인사하세요',
      '핵심만 간결하게 말하세요',
      '구체적인 예시를 들어 설명하세요'
    ],
    aiPersona: '너는 전문적이고 꼼꼼한 면접관이야. 지원자의 답변을 경청하고, 적절한 후속 질문을 해. 지원자가 긴장하면 부드럽게 분위기를 풀어주되, 전문성은 유지해. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 8,
      keywords: ['자기소개', '지원 동기', '경험'],
      emotional: ['자신감', '진심']
    },
    voice: 'onyx'
  },

  // ========== 발표 연습 ==========
  {
    id: 'presentation_class',
    category: 'presentation',
    title: '수업 발표 연습하기',
    description: '반 친구들 앞에서 발표를 해야 해요. 연습해보세요',
    ageGroups: ['child', 'teen'],
    difficulty: 'medium',
    aiRole: '발표를 듣는 친구',
    userRole: '발표하는 사람',
    situation: '다음 시간에 독후감 발표를 해야 해요. 친구 앞에서 연습하고 싶어요.',
    goals: [
      '명확하게 말하기',
      '자신감 있게 발표하기',
      '질문에 답변하기'
    ],
    tips: [
      '크고 또박또박하게 말하세요',
      '친구들을 보며 말하세요',
      '중요한 부분은 천천히 강조하세요'
    ],
    aiPersona: '너는 친구의 발표를 듣는 학생이야. 집중해서 듣고, 발표가 끝나면 궁금한 점을 질문해. 친구를 격려하고 칭찬해줘. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 5,
      keywords: ['발표', '설명', '질문'],
      emotional: ['자신감', '명확함']
    },
    voice: 'shimmer'
  }
];

// 카테고리별 분류
export const getCategorizedScenarios = () => {
  const categories: Record<RolePlayCategory, RolePlayScenario[]> = {
    friendship: [],
    conflict: [],
    gratitude: [],
    refusal: [],
    apology: [],
    request: [],
    emotion: [],
    interview: [],
    presentation: []
  };

  ROLEPLAY_SCENARIOS.forEach(scenario => {
    categories[scenario.category].push(scenario);
  });

  return categories;
};

// 연령대별 필터링
export const getScenariosByAge = (ageGroup: 'child' | 'teen' | 'adult') => {
  return ROLEPLAY_SCENARIOS.filter(scenario => 
    scenario.ageGroups.includes(ageGroup)
  );
};

// 난이도별 필터링
export const getScenariosByDifficulty = (difficulty: DifficultyLevel) => {
  return ROLEPLAY_SCENARIOS.filter(scenario => 
    scenario.difficulty === difficulty
  );
};

// 카테고리 메타데이터
export const CATEGORY_META: Record<RolePlayCategory, {
  name: string;
  icon: string;
  description: string;
  color: string;
}> = {
  friendship: {
    name: '친구 사귀기',
    icon: '👋',
    description: '새로운 친구를 만나고 관계를 시작하는 연습',
    color: 'bg-blue-500/10 text-blue-600 border-blue-200'
  },
  conflict: {
    name: '갈등 해결',
    icon: '🤝',
    description: '친구와의 오해나 갈등을 슬기롭게 해결하는 연습',
    color: 'bg-purple-500/10 text-purple-600 border-purple-200'
  },
  gratitude: {
    name: '감사 표현',
    icon: '💝',
    description: '고마운 마음을 진심으로 표현하는 연습',
    color: 'bg-pink-500/10 text-pink-600 border-pink-200'
  },
  refusal: {
    name: '거절하기',
    icon: '🙅',
    description: '싫은 것을 정중하게 거절하는 연습',
    color: 'bg-red-500/10 text-red-600 border-red-200'
  },
  apology: {
    name: '사과하기',
    icon: '🙇',
    description: '실수를 인정하고 진심으로 사과하는 연습',
    color: 'bg-orange-500/10 text-orange-600 border-orange-200'
  },
  request: {
    name: '부탁하기',
    icon: '🙏',
    description: '도움이 필요할 때 정중하게 부탁하는 연습',
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200'
  },
  emotion: {
    name: '감정 표현',
    icon: '😊',
    description: '내 감정을 솔직하게 표현하는 연습',
    color: 'bg-green-500/10 text-green-600 border-green-200'
  },
  interview: {
    name: '면접 연습',
    icon: '💼',
    description: '취업 면접이나 입학 면접을 준비하는 연습',
    color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200'
  },
  presentation: {
    name: '발표 연습',
    icon: '🎤',
    description: '사람들 앞에서 자신감 있게 발표하는 연습',
    color: 'bg-teal-500/10 text-teal-600 border-teal-200'
  }
};
