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
    voice: 'sage'
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
    voice: 'sage'
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
    voice: 'echo'
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
  },
  {
    id: 'presentation_business',
    category: 'presentation',
    title: '사업 제안 프레젠테이션',
    description: '중요한 비즈니스 프레젠테이션을 준비하고 있어요',
    ageGroups: ['adult'],
    difficulty: 'hard',
    aiRole: '경영진',
    userRole: '제안자',
    situation: '새로운 사업 아이디어를 경영진에게 프레젠테이션해야 합니다.',
    goals: [
      '핵심 가치 명확히 전달하기',
      '설득력 있게 설명하기',
      '예상 질문에 대비하기'
    ],
    tips: [
      '데이터와 근거를 활용하세요',
      '청중의 반응을 살피며 조절하세요',
      '자신감 있는 태도를 유지하세요'
    ],
    aiPersona: '너는 경험 많은 경영진이야. 제안을 비판적으로 검토하고, 구체적인 질문을 던져. 답변이 설득력 있으면 관심을 보이고, 부족하면 날카로운 질문을 해. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 8,
      keywords: ['제안', '가치', '수익'],
      emotional: ['설득력', '전문성']
    },
    voice: 'onyx'
  },

  // ========== 성인 직장 상황 ==========
  {
    id: 'workplace_salary',
    category: 'request',
    title: '상사에게 연봉 협상하기',
    description: '1년간의 성과를 바탕으로 연봉 인상을 요청해보세요',
    ageGroups: ['adult'],
    difficulty: 'hard',
    aiRole: '상사/팀장',
    userRole: '직원',
    situation: '1년 동안 좋은 성과를 냈고, 연봉 인상을 협상하고 싶습니다.',
    goals: [
      '성과를 구체적으로 설명하기',
      '시장 가치 제시하기',
      '협상 마무리하기'
    ],
    tips: [
      '구체적인 성과 수치를 준비하세요',
      '업계 평균 연봉을 조사하세요',
      '회사 상황도 고려하며 말하세요'
    ],
    aiPersona: '너는 팀을 이끄는 상사야. 직원의 요청을 경청하되, 회사 예산과 형평성을 고려해. 성과가 명확하면 긍정적으로 검토하지만, 근거가 부족하면 구체적인 자료를 요청해. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 10,
      keywords: ['성과', '기여', '협상'],
      emotional: ['자신감', '전문성']
    },
    voice: 'onyx'
  },
  {
    id: 'workplace_conflict_colleague',
    category: 'conflict',
    title: '업무 갈등 해결하기',
    description: '동료와 업무 방식 차이로 갈등이 생겼어요',
    ageGroups: ['adult'],
    difficulty: 'hard',
    aiRole: '갈등 중인 동료',
    userRole: '문제를 해결하고 싶은 직원',
    situation: '프로젝트 진행 방식을 두고 동료와 의견이 달라 갈등이 생겼습니다.',
    goals: [
      '서로의 입장 이해하기',
      '절충안 찾기',
      '협력 관계 회복하기'
    ],
    tips: [
      '먼저 상대방의 의견을 들어보세요',
      '업무 목표를 우선순위에 두세요',
      '감정이 아닌 사실에 집중하세요'
    ],
    aiPersona: '너는 자신의 방식을 고집하는 동료야. 처음에는 방어적이지만, 상대방이 진지하게 대화하고 절충안을 제시하면 협력적으로 변해. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 9,
      keywords: ['이해', '협력', '절충'],
      emotional: ['이성적', '협력적']
    },
    voice: 'echo'
  },
  {
    id: 'workplace_feedback',
    category: 'request',
    title: '상사에게 건설적 피드백 전달하기',
    description: '팀의 문제점을 상사에게 조심스럽게 말씀드려야 해요',
    ageGroups: ['adult'],
    difficulty: 'hard',
    aiRole: '팀장/상사',
    userRole: '직원',
    situation: '팀 운영에 개선이 필요한 부분을 발견했고, 상사에게 건설적으로 제안하고 싶습니다.',
    goals: [
      '문제를 객관적으로 제시하기',
      '해결책 제안하기',
      '상사의 입장 이해하기'
    ],
    tips: [
      '비난이 아닌 제안의 형태로 말하세요',
      '구체적인 개선 방안을 준비하세요',
      '"팀을 위해"라는 프레임을 사용하세요'
    ],
    aiPersona: '너는 팀을 이끄는 상사야. 처음에는 비판에 방어적일 수 있지만, 직원이 건설적이고 팀을 위한 제안을 하면 경청하고 긍정적으로 받아들여. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 8,
      keywords: ['개선', '제안', '팀'],
      emotional: ['존중', '건설적']
    },
    voice: 'sage'
  },
  {
    id: 'workplace_delegation',
    category: 'request',
    title: '팀원에게 업무 위임하기',
    description: '새로운 프로젝트를 팀원에게 효과적으로 배분하세요',
    ageGroups: ['adult'],
    difficulty: 'medium',
    aiRole: '팀원',
    userRole: '팀장/매니저',
    situation: '중요한 프로젝트를 팀원에게 맡겨야 하는 상황입니다.',
    goals: [
      '명확한 목표 전달하기',
      '동기부여하기',
      '지원 약속하기'
    ],
    tips: [
      '업무의 중요성을 강조하세요',
      '팀원의 강점을 언급하세요',
      '필요한 지원을 약속하세요'
    ],
    aiPersona: '너는 팀원이야. 새로운 업무에 약간 부담스러워하지만, 상사가 명확히 설명하고 지원을 약속하면 의욕적으로 받아들여. 필요한 자원이나 도움을 요청해. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 7,
      keywords: ['프로젝트', '지원', '목표'],
      emotional: ['리더십', '신뢰']
    },
    voice: 'alloy'
  },

  // ========== 성인 대인관계 ==========
  {
    id: 'relationship_boundary',
    category: 'refusal',
    title: '과도한 요구에 경계 설정하기',
    description: '지인이 계속 무리한 부탁을 해요. 단호하게 경계를 정하세요',
    ageGroups: ['adult'],
    difficulty: 'hard',
    aiRole: '부탁하는 지인',
    userRole: '경계를 정하려는 사람',
    situation: '지인이 자주 금전적 도움이나 시간을 요구합니다. 관계를 해치지 않으면서 경계를 정하고 싶어요.',
    goals: [
      '명확한 경계 표현하기',
      '이유 설명하기',
      '관계는 유지하기'
    ],
    tips: [
      '"이번엔 어려워" 하고 명확히 말하세요',
      '감정보다는 상황을 설명하세요',
      '대안을 제시할 수 있으면 제시하세요'
    ],
    aiPersona: '너는 자주 부탁을 하는 지인이야. 처음에는 계속 설득하려 하지만, 상대방이 단호하고 명확하게 경계를 설정하면 결국 이해하고 물러나. 약간 서운해할 수 있지만 존중해줘. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 8,
      keywords: ['어려움', '이해', '경계'],
      emotional: ['단호함', '배려']
    },
    voice: 'echo'
  },
  {
    id: 'relationship_reconciliation',
    category: 'apology',
    title: '오랜 친구와 화해하기',
    description: '오래 연락 못했던 친구와 관계를 회복하고 싶어요',
    ageGroups: ['adult'],
    difficulty: 'medium',
    aiRole: '오랜 친구',
    userRole: '화해하고 싶은 사람',
    situation: '바빠서 연락을 못했더니 친구가 섭섭해했어요. 다시 연락해서 관계를 회복하고 싶습니다.',
    goals: [
      '진심으로 사과하기',
      '소원해진 이유 솔직히 말하기',
      '관계 회복 의지 보이기'
    ],
    tips: [
      '먼저 연락한 용기를 내세요',
      '바빴던 상황을 솔직히 설명하세요',
      '앞으로의 약속을 구체적으로 하세요'
    ],
    aiPersona: '너는 오랜 친구야. 연락이 뜸해져서 조금 서운했지만, 친구가 진심으로 대화를 시도하면 마음을 열고 이해해줘. 과거의 좋은 추억을 언급하며 관계 회복에 긍정적으로 반응해. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 7,
      keywords: ['미안', '그리웠어', '다시'],
      emotional: ['진심', '그리움']
    },
    voice: 'alloy'
  },
  {
    id: 'relationship_difficult_topic',
    category: 'emotion',
    title: '민감한 주제 조심스럽게 꺼내기',
    description: '가까운 사람에게 어려운 이야기를 해야 해요',
    ageGroups: ['adult'],
    difficulty: 'hard',
    aiRole: '가까운 사람',
    userRole: '이야기를 꺼내려는 사람',
    situation: '친한 친구의 건강이나 생활 습관이 걱정돼서 조심스럽게 이야기하고 싶습니다.',
    goals: [
      '걱정을 부드럽게 표현하기',
      '비난 아닌 관심임을 전달하기',
      '도움 제안하기'
    ],
    tips: [
      '"걱정돼서 그러는데"로 시작하세요',
      '구체적인 행동보다 감정을 먼저 말하세요',
      '함께 해결하자는 자세를 보이세요'
    ],
    aiPersona: '너는 민감한 주제에 대해 처음엔 방어적일 수 있어. 하지만 상대방이 진심 어린 걱정과 배려를 보이면 점차 마음을 열고 이야기를 나눠. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 9,
      keywords: ['걱정', '도움', '함께'],
      emotional: ['배려', '진심']
    },
    voice: 'sage'
  },

  // ========== 성인 사회생활 ==========
  {
    id: 'social_networking',
    category: 'friendship',
    title: '네트워킹 행사에서 자기소개하기',
    description: '업계 모임에서 처음 만나는 사람들과 인맥을 쌓으세요',
    ageGroups: ['adult'],
    difficulty: 'medium',
    aiRole: '업계 종사자',
    userRole: '네트워킹 참가자',
    situation: '업계 네트워킹 행사에 참석했습니다. 유용한 인맥을 만들고 싶어요.',
    goals: [
      '자연스럽게 대화 시작하기',
      '전문적으로 자기소개하기',
      '연락처 교환하기'
    ],
    tips: [
      '상대방의 일에 관심을 보이세요',
      '자신의 전문성을 자연스럽게 언급하세요',
      '향후 연락하자는 제안을 하세요'
    ],
    aiPersona: '너는 업계 경험이 있는 전문가야. 네트워킹에 개방적이고, 상대방이 진지하고 전문적으로 대화하면 좋은 인상을 받아. 자연스럽게 명함을 교환하자고 제안해. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 7,
      keywords: ['소개', '업계', '연락'],
      emotional: ['전문성', '친근함']
    },
    voice: 'onyx'
  },
  {
    id: 'social_complaint',
    category: 'request',
    title: '서비스 불만사항 정중하게 제기하기',
    description: '식당이나 매장에서 문제가 있었어요. 정중하게 해결하세요',
    ageGroups: ['adult'],
    difficulty: 'medium',
    aiRole: '매장 직원/매니저',
    userRole: '고객',
    situation: '식당에서 주문과 다른 음식이 나왔어요. 정중하게 문제를 제기하고 해결하고 싶습니다.',
    goals: [
      '문제를 명확히 설명하기',
      '해결책 요청하기',
      '정중한 태도 유지하기'
    ],
    tips: [
      '화내지 말고 차분하게 설명하세요',
      '구체적으로 무엇이 잘못됐는지 말하세요',
      '원하는 해결책을 명확히 하세요'
    ],
    aiPersona: '너는 서비스업 종사자야. 고객의 불만을 진지하게 받아들이고 해결하려 노력해. 고객이 정중하게 대하면 더 적극적으로 도와줘. 사과하고 해결책을 제시해. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 6,
      keywords: ['문제', '해결', '감사'],
      emotional: ['정중함', '단호함']
    },
    voice: 'alloy'
  },
  {
    id: 'social_negotiation',
    category: 'request',
    title: '중고 거래 가격 협상하기',
    description: '중고 물품 구매 시 합리적인 가격을 협상하세요',
    ageGroups: ['adult'],
    difficulty: 'easy',
    aiRole: '판매자',
    userRole: '구매자',
    situation: '마음에 드는 중고 제품을 발견했는데 가격이 조금 높아요. 협상하고 싶습니다.',
    goals: [
      '정중하게 제안하기',
      '근거 제시하기',
      '합의점 찾기'
    ],
    tips: [
      '비슷한 제품의 시세를 조사하세요',
      '제품 상태를 근거로 제시하세요',
      '판매자 입장도 이해하세요'
    ],
    aiPersona: '너는 중고 물품 판매자야. 가격 협상에 어느 정도 열려 있지만, 터무니없는 제안은 거절해. 구매자가 합리적인 근거를 제시하면 협상에 응해. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 6,
      keywords: ['가격', '협상', '구매'],
      emotional: ['정중함', '협상력']
    },
    voice: 'echo'
  },

  // ========== 성인 가족관계 ==========
  {
    id: 'family_parent_concern',
    category: 'emotion',
    title: '부모님께 걱정스러운 마음 전하기',
    description: '부모님의 건강이나 생활이 걱정돼요. 조심스럽게 말씀드려야 해요',
    ageGroups: ['adult'],
    difficulty: 'hard',
    aiRole: '부모님',
    userRole: '자녀',
    situation: '부모님의 건강 관리가 걱정됩니다. 상처 드리지 않고 말씀드리고 싶어요.',
    goals: [
      '존중하며 걱정 표현하기',
      '구체적인 도움 제안하기',
      '부모님의 자율성 존중하기'
    ],
    tips: [
      '"제가 도와드릴 게 있을까요"로 시작하세요',
      '명령보다는 제안의 형태로 말하세요',
      '부모님의 의견을 먼저 들으세요'
    ],
    aiPersona: '너는 자식 걱정에 고마워하면서도 간섭으로 느낄 수 있는 부모야. 자녀가 존중하며 진심으로 걱정한다는 걸 알면 마음을 열어. 나이 들어도 자율적이고 싶어하는 마음을 표현해. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 8,
      keywords: ['걱정', '건강', '도움'],
      emotional: ['존중', '효심']
    },
    voice: 'sage'
  },
  {
    id: 'family_spouse_issue',
    category: 'conflict',
    title: '배우자와 의견 차이 조율하기',
    description: '배우자와 중요한 결정을 두고 의견이 달라요',
    ageGroups: ['adult'],
    difficulty: 'hard',
    aiRole: '배우자',
    userRole: '대화하려는 사람',
    situation: '이사나 자녀 교육 등 중요한 결정을 두고 의견이 다릅니다. 합의점을 찾고 싶어요.',
    goals: [
      '서로의 우선순위 이해하기',
      '감정 조절하며 대화하기',
      '타협점 찾기'
    ],
    tips: [
      '"당신 의견을 듣고 싶어"로 시작하세요',
      '비난보다 자신의 감정을 표현하세요',
      '함께 해결하자는 태도를 보이세요'
    ],
    aiPersona: '너는 배우자야. 자신의 의견도 중요하지만 상대방의 입장도 이해하려 해. 대화가 감정적이 되면 방어적이 되지만, 서로 존중하며 논의하면 타협점을 찾으려 노력해. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 10,
      keywords: ['의견', '이해', '함께'],
      emotional: ['존중', '협력']
    },
    voice: 'alloy'
  },

  // ========== 성인 면접 추가 ==========
  {
    id: 'interview_university',
    category: 'interview',
    title: '대학원 입학 면접',
    description: '대학원 진학을 위한 면접을 준비하세요',
    ageGroups: ['adult'],
    difficulty: 'hard',
    aiRole: '교수/면접관',
    userRole: '지원자',
    situation: '대학원 입학 면접을 앞두고 있습니다. 연구 계획과 학업 동기를 설명해야 해요.',
    goals: [
      '연구 관심사 명확히 전달하기',
      '학문적 열정 보이기',
      '질문에 논리적으로 답변하기'
    ],
    tips: [
      '관심 분야를 구체적으로 설명하세요',
      '왜 이 대학원인지 명확히 하세요',
      '향후 계획을 논리적으로 말하세요'
    ],
    aiPersona: '너는 학문적으로 엄격한 교수야. 지원자의 연구 역량과 열정을 평가하기 위해 날카로운 질문을 해. 답변이 논리적이고 진심이 느껴지면 긍정적으로 반응해. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 9,
      keywords: ['연구', '관심', '계획'],
      emotional: ['열정', '전문성']
    },
    voice: 'onyx'
  },
  {
    id: 'interview_career_change',
    category: 'interview',
    title: '경력 전환 면접',
    description: '새로운 분야로 경력을 전환하려고 해요',
    ageGroups: ['adult'],
    difficulty: 'hard',
    aiRole: '면접관',
    userRole: '경력전환 지원자',
    situation: '다른 업종에서의 경험을 살려 새로운 분야로 전환하고자 합니다.',
    goals: [
      '전환 이유 설득력 있게 설명하기',
      '기존 경험의 연관성 보이기',
      '배움에 대한 의지 보이기'
    ],
    tips: [
      '왜 전환하는지 긍정적으로 설명하세요',
      '기존 경험이 어떻게 도움이 될지 말하세요',
      '새로운 분야에 대한 준비를 보여주세요'
    ],
    aiPersona: '너는 경력전환 지원자를 신중하게 평가하는 면접관이야. 전환 이유가 명확하고 준비가 되어 있으면 긍정적으로 보지만, 막연하면 회의적으로 질문해. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 9,
      keywords: ['전환', '경험', '열정'],
      emotional: ['확신', '적극성']
    },
    voice: 'echo'
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
