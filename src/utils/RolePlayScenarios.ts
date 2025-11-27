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
  firstMessage?: string;    // AI가 먼저 하는 인사말 (선택적)
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
  // ========== 회사 생활 - 갈등 해결 ==========
  {
    id: 'workplace_salary_negotiation',
    category: 'conflict',
    title: '연봉 협상하기',
    description: '연봉 협상 시즌이 다가왔습니다. 상사와 연봉 인상을 논의해보세요',
    ageGroups: ['adult'],
    difficulty: 'hard',
    aiRole: '팀장',
    userRole: '직원',
    situation: '1년간 성과를 냈지만 연봉이 기대에 못 미칩니다. 팀장님과 연봉 인상을 논의하고 싶습니다.',
    goals: [
      '자신의 성과 구체적으로 어필하기',
      '희망 연봉 근거 있게 제시하기',
      '협상 타결하기'
    ],
    tips: [
      '감정적이지 않고 논리적으로 접근하세요',
      '구체적인 성과와 수치를 제시하세요',
      '시장 평균 연봉을 조사해가세요'
    ],
    aiPersona: '너는 회사 팀장이야. 예산 제약이 있지만 좋은 직원은 붙잡고 싶어해. 직원이 구체적인 성과와 근거를 제시하면 경청하고, 합리적인 범위에서 협상해. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 8,
      keywords: ['성과', '연봉', '기여'],
      emotional: ['자신감', '논리성']
    },
    voice: 'echo'
  },
  {
    id: 'workplace_colleague_conflict',
    category: 'conflict',
    title: '동료와 업무 갈등 해결하기',
    description: '업무 스타일이 다른 동료와 갈등이 생겼습니다. 대화로 풀어보세요',
    ageGroups: ['adult'],
    difficulty: 'medium',
    aiRole: '업무 방식이 다른 동료',
    userRole: '갈등을 겪는 직장인',
    situation: '같은 프로젝트를 하는 동료가 마감을 자주 어기고 커뮤니케이션이 부족합니다. 이야기를 나누고 싶습니다.',
    goals: [
      '비난하지 않고 상황 전달하기',
      '서로의 업무 스타일 이해하기',
      '협업 방법 합의하기'
    ],
    tips: [
      '감정을 배제하고 사실만 이야기하세요',
      '상대방의 입장도 들어보세요',
      '구체적인 협업 규칙을 정하세요'
    ],
    aiPersona: '너는 업무 스타일이 느긋한 동료야. 급한 것을 싫어하지만 일은 잘해. 처음에는 방어적이지만, 동료가 존중하며 이야기하면 협력적으로 변해. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 7,
      keywords: ['협업', '스타일', '마감'],
      emotional: ['존중', '이해']
    },
    voice: 'alloy'
  },
  {
    id: 'workplace_resignation',
    category: 'emotion',
    title: '퇴사 의사 전달하기',
    description: '다른 회사로 이직하기로 결정했습니다. 상사에게 말씀드려야 합니다',
    ageGroups: ['adult'],
    difficulty: 'hard',
    aiRole: '직속 상사',
    userRole: '퇴사하려는 직원',
    situation: '더 나은 기회를 위해 이직하기로 결정했습니다. 감사했지만 퇴사 의사를 전달해야 합니다.',
    goals: [
      '감사한 마음 전달하기',
      '퇴사 이유 솔직하게 말하기',
      '원만하게 마무리하기'
    ],
    tips: [
      '먼저 감사 인사부터 하세요',
      '부정적인 이야기는 최소화하세요',
      '인수인계 계획을 제시하세요'
    ],
    aiPersona: '너는 직원을 아끼는 상사야. 퇴사 소식에 아쉽지만, 직원의 성장을 응원해주고 싶어해. 처음엔 만류하지만 결국 축하해줘. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 7,
      keywords: ['감사', '기회', '인수인계'],
      emotional: ['감사', '당당함']
    },
    voice: 'sage'
  },
  {
    id: 'workplace_overtime_refusal',
    category: 'refusal',
    title: '야근 요청 거절하기',
    description: '오늘 중요한 약속이 있는데 야근 요청이 들어왔습니다',
    ageGroups: ['adult'],
    difficulty: 'medium',
    aiRole: '업무를 요청하는 상사',
    userRole: '야근을 거절해야 하는 직원',
    situation: '오늘 가족 행사가 있어 야근이 어려운 상황입니다. 상사가 급한 업무를 부탁합니다.',
    goals: [
      '개인 사정 설명하기',
      '대안 제시하기',
      '단호하게 거절하기'
    ],
    tips: [
      '죄송하다는 말만 반복하지 마세요',
      '내일 아침 일찍 출근 등 대안을 제시하세요',
      '개인 시간도 중요하다는 것을 명확히 하세요'
    ],
    aiPersona: '너는 급한 업무가 생긴 상사야. 처음엔 이해하기 어렵지만, 직원이 합리적으로 설명하고 대안을 제시하면 받아들여. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 6,
      keywords: ['개인 일정', '대안', '내일'],
      emotional: ['단호함', '합리성']
    },
    voice: 'echo'
  },

  // ========== 대학 생활 ==========
  {
    id: 'university_grade_appeal',
    category: 'request',
    title: '교수님께 학점 이의 제기하기',
    description: '학점에 의문이 있어 교수님께 여쭤보고 싶습니다',
    ageGroups: ['adult'],
    difficulty: 'hard',
    aiRole: '교수님',
    userRole: '학생',
    situation: '과제와 시험을 열심히 했는데 예상보다 낮은 학점을 받았습니다. 교수님께 문의하고 싶습니다.',
    goals: [
      '정중하게 문의하기',
      '구체적으로 질문하기',
      '결과 수용하기'
    ],
    tips: [
      '감정적이지 않게 사실만 이야기하세요',
      '구체적인 과제/시험 내용을 언급하세요',
      '학점 재검토를 정중히 요청하세요'
    ],
    aiPersona: '너는 바쁘지만 공정한 교수야. 학생이 정중하고 구체적으로 질문하면 채점 기준을 설명해주고, 오류가 있으면 인정해. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 6,
      keywords: ['학점', '채점', '확인'],
      emotional: ['정중함', '논리성']
    },
    voice: 'sage'
  },
  {
    id: 'university_group_freeloader',
    category: 'conflict',
    title: '조별과제 무임승차 문제 해결하기',
    description: '조별과제에서 한 팀원이 일을 안 합니다. 이야기를 해야겠습니다',
    ageGroups: ['adult'],
    difficulty: 'medium',
    aiRole: '조별과제를 안 하는 팀원',
    userRole: '조장',
    situation: '조별과제 마감이 다가오는데 한 팀원이 연락도 안 되고 역할을 안 합니다.',
    goals: [
      '문제 상황 전달하기',
      '참여 촉구하기',
      '역할 분담 재조정하기'
    ],
    tips: [
      '비난보다는 사실을 이야기하세요',
      '팀 전체를 위해 참여가 필요하다고 설득하세요',
      '구체적인 역할을 다시 배정하세요'
    ],
    aiPersona: '너는 조별과제에 소극적인 학생이야. 사실 다른 과목이 바빠서 신경을 못 썼어. 팀원이 직접적으로 이야기하면 미안해하고 할 수 있는 부분을 찾아봐. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 6,
      keywords: ['역할', '마감', '참여'],
      emotional: ['단호함', '협력']
    },
    voice: 'alloy'
  },

  // ========== 연애 ==========
  {
    id: 'dating_confession',
    category: 'emotion',
    title: '호감 있는 사람에게 데이트 신청하기',
    description: '좋아하는 사람에게 용기내어 데이트를 신청해보세요',
    ageGroups: ['adult'],
    difficulty: 'medium',
    aiRole: '관심 있는 상대',
    userRole: '고백하려는 사람',
    situation: '몇 번 같이 밥도 먹고 친해진 사람이 있습니다. 정식으로 데이트를 신청하고 싶습니다.',
    goals: [
      '자연스럽게 말 꺼내기',
      '솔직하게 마음 전하기',
      '부담 없이 제안하기'
    ],
    tips: [
      '너무 무겁지 않게 시작하세요',
      '구체적인 데이트 계획을 제시하세요',
      '거절해도 괜찮다는 여유를 보이세요'
    ],
    aiPersona: '너는 상대방에게 호감이 있지만 확신은 없는 사람이야. 데이트 신청을 받으면 조금 놀라지만 긍정적으로 반응해. 자연스럽고 밝게 대답해줘. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 5,
      keywords: ['데이트', '만남', '시간'],
      emotional: ['설렘', '용기']
    },
    voice: 'shimmer'
  },
  {
    id: 'dating_define_relationship',
    category: 'emotion',
    title: '관계 정의하기 - 썸에서 연인으로',
    description: '썸 타는 관계가 애매합니다. 공식적인 연인 관계를 정의하고 싶습니다',
    ageGroups: ['adult'],
    difficulty: 'hard',
    aiRole: '썸 타는 상대',
    userRole: '관계를 정의하고 싶은 사람',
    situation: '한 달 넘게 데이트하고 있지만 공식적으로 사귀자는 말은 안 했습니다. 이제 관계를 정의하고 싶습니다.',
    goals: [
      '현재 감정 솔직하게 전달하기',
      '상대방 마음 확인하기',
      '공식적인 관계 제안하기'
    ],
    tips: [
      '지금까지의 시간이 좋았다고 말하세요',
      '상대방 마음을 먼저 물어보세요',
      '공식적으로 사귀자고 제안하세요'
    ],
    aiPersona: '너는 상대방과 좋은 시간을 보내고 있지만 조심스러운 사람이야. 상대방이 먼저 마음을 표현하면 기쁘게 받아들이고 자신의 감정도 솔직하게 이야기해. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 7,
      keywords: ['좋아해', '사귀다', '연인'],
      emotional: ['진심', '설렘']
    },
    voice: 'alloy'
  },
  {
    id: 'dating_breakup',
    category: 'conflict',
    title: '헤어짐 이야기하기',
    description: '더 이상 관계를 지속하기 어렵습니다. 헤어지자는 이야기를 해야 합니다',
    ageGroups: ['adult'],
    difficulty: 'hard',
    aiRole: '연인',
    userRole: '헤어지고 싶은 사람',
    situation: '가치관 차이와 미래 계획 차이로 더 이상 관계를 이어가기 어렵습니다.',
    goals: [
      '솔직하게 이유 설명하기',
      '상대방 마음 배려하기',
      '좋은 기억은 감사하며 마무리하기'
    ],
    tips: [
      '감정적이지 않게 차분히 이야기하세요',
      '상대방 탓만 하지 마세요',
      '함께한 시간에 감사 표현하세요'
    ],
    aiPersona: '너는 헤어지고 싶지 않은 연인이야. 처음엔 감정적으로 반응하고 만류하지만, 상대방이 확고하면 결국 받아들여. 아픔을 표현하되 존중하는 태도를 보여줘. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 8,
      keywords: ['헤어지다', '이유', '감사'],
      emotional: ['단호함', '배려']
    },
    voice: 'echo'
  },
  {
    id: 'dating_parents_introduction',
    category: 'emotion',
    title: '부모님께 연인 소개하기',
    description: '연인과의 관계가 진지해졌습니다. 부모님께 소개하고 싶습니다',
    ageGroups: ['adult'],
    difficulty: 'medium',
    aiRole: '부모님',
    userRole: '자녀',
    situation: '연인과 결혼을 고려하는 단계입니다. 부모님께 처음 소개하려 합니다.',
    goals: [
      '연인에 대해 긍정적으로 소개하기',
      '관계의 진지함 전달하기',
      '부모님 의견 경청하기'
    ],
    tips: [
      '연인의 좋은 점을 구체적으로 말하세요',
      '앞으로의 계획을 언급하세요',
      '부모님 걱정을 이해한다고 표현하세요'
    ],
    aiPersona: '너는 자녀를 걱정하는 부모야. 연인에 대해 궁금한 것도 많고 걱정도 되지만, 자녀가 행복하길 바라. 직업, 가족, 미래 계획 등을 물어보며 신중하게 대화해. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 7,
      keywords: ['연인', '소개', '미래'],
      emotional: ['진심', '존중']
    },
    voice: 'sage'
  },

  // ========== 가족 생활 ==========
  {
    id: 'family_independence',
    category: 'emotion',
    title: '부모님께 독립 의사 전달하기',
    description: '독립해서 나가 살고 싶습니다. 부모님께 말씀드려야 합니다',
    ageGroups: ['adult'],
    difficulty: 'medium',
    aiRole: '부모님',
    userRole: '독립하려는 자녀',
    situation: '직장도 안정되고 독립할 준비가 되었습니다. 부모님께 이사 계획을 말씀드리고 싶습니다.',
    goals: [
      '독립 이유 설명하기',
      '부모님 걱정 덜어드리기',
      '자주 찾아뵙겠다고 약속하기'
    ],
    tips: [
      '독립이 성장의 과정임을 설명하세요',
      '구체적인 계획을 보여드리세요',
      '자주 연락하고 찾아뵙겠다고 하세요'
    ],
    aiPersona: '너는 자녀가 집을 떠나는 게 걱정되는 부모야. 아직 어리다고 생각하고 혼자 잘 살 수 있을지 걱정돼. 하지만 자녀가 준비가 되어 있다면 응원해주고 싶어해. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 7,
      keywords: ['독립', '준비', '자주'],
      emotional: ['자신감', '효심']
    },
    voice: 'alloy'
  },
  {
    id: 'family_holiday_pressure',
    category: 'refusal',
    title: '명절 부담 표현하기',
    description: '명절마다 과도한 집안일이 부담됩니다. 가족들과 이야기하고 싶습니다',
    ageGroups: ['adult'],
    difficulty: 'hard',
    aiRole: '시부모님 또는 배우자',
    userRole: '명절 준비에 지친 사람',
    situation: '매번 명절에 혼자 모든 준비를 하게 됩니다. 역할 분담을 제안하고 싶습니다.',
    goals: [
      '솔직하게 힘든 점 말하기',
      '역할 분담 제안하기',
      '서로 존중하는 문화 만들기'
    ],
    tips: [
      '비난하지 않고 본인 감정을 이야기하세요',
      '구체적인 역할 분담을 제시하세요',
      '함께하는 명절이 되자고 제안하세요'
    ],
    aiPersona: '너는 전통적인 명절 문화에 익숙한 가족이야. 처음엔 당황하고 방어적이지만, 상대방의 진심을 이해하면 변화할 의지를 보여. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 8,
      keywords: ['힘들다', '분담', '함께'],
      emotional: ['진솔함', '단호함']
    },
    voice: 'sage'
  },
  {
    id: 'family_conflict_sibling',
    category: 'conflict',
    title: '형제자매와 갈등 해결하기',
    description: '오래된 형제자매 갈등을 풀고 싶습니다',
    ageGroups: ['adult'],
    difficulty: 'medium',
    aiRole: '형제/자매',
    userRole: '화해하고 싶은 사람',
    situation: '어릴 때부터 쌓인 오해와 갈등이 있습니다. 이제는 풀고 가까워지고 싶습니다.',
    goals: [
      '과거 오해 풀기',
      '미안한 마음 전하기',
      '새로운 관계 시작하기'
    ],
    tips: [
      '과거 일을 솔직하게 이야기하세요',
      '서로의 입장을 이해하려 노력하세요',
      '앞으로 더 자주 만나자고 제안하세요'
    ],
    aiPersona: '너는 오랫동안 거리를 둔 형제자매야. 상처가 있지만 사실 화해하고 싶어해. 상대방이 진심으로 다가오면 마음을 열고 과거를 이야기해. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 8,
      keywords: ['미안', '이해', '자주'],
      emotional: ['진심', '화해']
    },
    voice: 'echo'
  },

  // ========== 갈등 해결 (기타) ==========
  {
    id: 'conflict_friend_money',
    category: 'conflict',
    title: '친구와 금전 문제 해결하기',
    description: '친구에게 빌려준 돈을 받지 못하고 있습니다. 이야기해야 할 것 같습니다',
    ageGroups: ['adult'],
    difficulty: 'hard',
    aiRole: '돈을 빌린 친구',
    userRole: '돈을 빌려준 사람',
    situation: '몇 달 전 친구에게 급하다고 해서 큰 돈을 빌려줬는데 연락이 뜸해졌습니다.',
    goals: [
      '부담 없이 상황 확인하기',
      '상환 계획 논의하기',
      '관계 유지하며 해결하기'
    ],
    tips: [
      '감정적이지 않게 사실만 이야기하세요',
      '상대방 사정도 물어보세요',
      '분할 상환 등 유연한 방법을 제시하세요'
    ],
    aiPersona: '너는 돈을 빌렸지만 갚기 어려운 상황인 친구야. 미안하고 부끄러워서 연락을 피했어. 친구가 이해심 있게 대하면 솔직하게 상황을 이야기하고 해결 방법을 찾으려 해. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 7,
      keywords: ['돈', '상환', '계획'],
      emotional: ['이해', '단호함']
    },
    voice: 'alloy'
  },

  // ========== 감사 표현 ==========
  {
    id: 'gratitude_mentor',
    category: 'gratitude',
    title: '멘토에게 감사 표현하기',
    description: '커리어 성장에 큰 도움을 준 멘토님께 감사를 전하고 싶습니다',
    ageGroups: ['adult'],
    difficulty: 'medium',
    aiRole: '멘토',
    userRole: '멘티',
    situation: '승진에 성공했습니다. 그동안 조언과 격려를 아끼지 않으셨던 멘토님께 감사를 전하고 싶습니다.',
    goals: [
      '구체적으로 어떤 도움이 됐는지 말하기',
      '진심 어린 감사 표현하기',
      '앞으로도 관계 이어가기'
    ],
    tips: [
      '구체적인 조언이나 순간을 언급하세요',
      '그 조언이 어떤 변화를 가져왔는지 말하세요',
      '식사나 커피를 대접하고 싶다고 제안하세요'
    ],
    aiPersona: '너는 후배의 성장을 지켜본 멘토야. 후배가 성장한 모습에 뿌듯하고, 감사 인사를 받으면 겸손하게 받아들이며 앞으로도 응원한다고 말해줘. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 5,
      keywords: ['감사', '덕분에', '승진'],
      emotional: ['감사', '존경']
    },
    voice: 'sage'
  },

  // ========== 거절하기 ==========
  {
    id: 'refusal_mlm',
    category: 'refusal',
    title: '지인의 다단계/보험 권유 거절하기',
    description: '오랜만에 연락한 지인이 사업이나 보험을 권유합니다. 거절해야 합니다',
    ageGroups: ['adult'],
    difficulty: 'hard',
    aiRole: '사업을 권유하는 지인',
    userRole: '거절하려는 사람',
    situation: '오랜만에 연락한 선후배가 커피 한잔 하자더니 사업 제안을 합니다.',
    goals: [
      '단호하게 거절하기',
      '관계는 유지하기',
      '추가 연락 차단하기'
    ],
    tips: [
      '"관심 없어"라고 명확히 말하세요',
      '이유를 길게 설명하지 마세요',
      '계속 설득하면 대화를 종료하세요'
    ],
    aiPersona: '너는 사업을 시작한 지인이야. 처음엔 계속 설득하려 하지만, 상대방이 단호하게 거절하면 "알겠어, 혹시 생각 바뀌면 연락해"라며 물러나. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 5,
      keywords: ['관심 없다', '거절', '미안'],
      emotional: ['단호함', '명확함']
    },
    voice: 'alloy'
  },
  {
    id: 'refusal_drinking',
    category: 'refusal',
    title: '회식에서 술 권유 거절하기',
    description: '회식 자리에서 상사가 술을 계속 권유합니다. 거절하고 싶습니다',
    ageGroups: ['adult'],
    difficulty: 'medium',
    aiRole: '술을 권하는 상사',
    userRole: '거절하려는 직원',
    situation: '건강상 이유로 술을 마실 수 없는데, 상사가 분위기를 이유로 술을 권합니다.',
    goals: [
      '정중하지만 확고하게 거절하기',
      '이유 간단히 설명하기',
      '대안 제시하기'
    ],
    tips: [
      '"죄송하지만 정말 못 마셔요"라고 명확히 하세요',
      '건강 문제를 언급하세요',
      '다른 음료로 건배하겠다고 하세요'
    ],
    aiPersona: '너는 회식 문화가 익숙한 상사야. 처음엔 "한 잔만"이라며 권하지만, 직원이 건강 이유를 들면 이해하고 물러나. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 4,
      keywords: ['건강', '못 마신다', '다른 음료'],
      emotional: ['정중함', '단호함']
    },
    voice: 'echo'
  },

  // ========== 사과하기 ==========
  {
    id: 'apology_work_mistake',
    category: 'apology',
    title: '업무 실수에 대해 사과하기',
    description: '중요한 업무에서 실수를 했습니다. 팀과 상사에게 사과해야 합니다',
    ageGroups: ['adult'],
    difficulty: 'hard',
    aiRole: '상사',
    userRole: '실수한 직원',
    situation: '중요한 프로젝트에서 큰 실수를 했고, 팀에 피해가 갔습니다. 책임지고 사과해야 합니다.',
    goals: [
      '실수 인정하고 사과하기',
      '원인 분석하고 설명하기',
      '재발 방지 대책 제시하기'
    ],
    tips: [
      '변명하지 말고 책임을 인정하세요',
      '어떻게 복구할 것인지 제시하세요',
      '다시는 반복하지 않겠다는 다짐을 하세요'
    ],
    aiPersona: '너는 실수로 피해를 본 상사야. 화가 나 있지만, 직원이 진심으로 사과하고 해결책을 제시하면 기회를 줘. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 7,
      keywords: ['죄송', '책임', '재발 방지'],
      emotional: ['진심', '책임감']
    },
    voice: 'echo'
  },

  // ========== 부탁하기 ==========
  {
    id: 'request_leave',
    category: 'request',
    title: '상사에게 휴가 요청하기',
    description: '바쁜 시기지만 개인 사정으로 휴가가 필요합니다',
    ageGroups: ['adult'],
    difficulty: 'medium',
    aiRole: '팀장',
    userRole: '직원',
    situation: '가족 행사로 며칠 휴가가 필요한데, 팀이 바쁜 상황입니다.',
    goals: [
      '정중하게 요청하기',
      '업무 공백 최소화 방안 제시하기',
      '승인 받기'
    ],
    tips: [
      '미리 여유있게 요청하세요',
      '인수인계 계획을 함께 제시하세요',
      '팀 상황을 이해한다는 것을 표현하세요'
    ],
    aiPersona: '너는 바쁜 시기의 팀장이야. 휴가 요청이 부담스럽지만, 직원이 준비를 잘 해오고 개인 사정을 설명하면 이해하고 허락해줘. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 6,
      keywords: ['휴가', '인수인계', '준비'],
      emotional: ['정중함', '책임감']
    },
    voice: 'sage'
  },
  {
    id: 'request_recommendation',
    category: 'request',
    title: '교수님께 추천서 부탁드리기',
    description: '대학원/취업을 위해 교수님께 추천서를 부탁드리고 싶습니다',
    ageGroups: ['adult'],
    difficulty: 'medium',
    aiRole: '교수님',
    userRole: '학생',
    situation: '대학원 지원을 위해 존경하는 교수님께 추천서를 부탁드리고 싶습니다.',
    goals: [
      '정중하게 부탁드리기',
      '왜 교수님께 부탁드리는지 설명하기',
      '필요한 정보 제공하기'
    ],
    tips: [
      '미리 충분한 시간을 두고 부탁하세요',
      '본인의 계획과 목표를 설명하세요',
      '필요한 자료를 준비해가세요'
    ],
    aiPersona: '너는 학생을 지도해온 교수야. 추천서 부탁을 받으면 학생의 진로를 물어보고, 충분히 준비되었다고 판단되면 기꺼이 써주겠다고 해. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 6,
      keywords: ['추천서', '대학원', '감사'],
      emotional: ['정중함', '열정']
    },
    voice: 'sage'
  },

  // ========== 감정 표현 ==========
  {
    id: 'emotion_burnout',
    category: 'emotion',
    title: '번아웃 증상 털어놓기',
    description: '일에 지쳐서 번아웃이 왔습니다. 친구에게 털어놓고 싶습니다',
    ageGroups: ['adult'],
    difficulty: 'medium',
    aiRole: '친한 친구',
    userRole: '번아웃을 겪는 사람',
    situation: '과도한 업무로 몸도 마음도 지쳐있습니다. 친구에게 이야기하고 위로받고 싶습니다.',
    goals: [
      '솔직하게 상태 표현하기',
      '힘든 감정 나누기',
      '위로와 조언 받기'
    ],
    tips: [
      '감정을 솔직하게 표현하세요',
      '구체적으로 무엇이 힘든지 말하세요',
      '친구의 공감을 받아들이세요'
    ],
    aiPersona: '너는 친구를 걱정하는 사람이야. 친구가 힘들어하면 진심으로 공감하고, 위로해주며, 필요하다면 휴식이나 도움을 받으라고 조언해줘. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 6,
      keywords: ['지치다', '힘들다', '번아웃'],
      emotional: ['솔직함', '안도']
    },
    voice: 'alloy'
  },
  {
    id: 'emotion_achievement',
    category: 'emotion',
    title: '성취감과 기쁨 나누기',
    description: '큰 목표를 달성했습니다. 기쁨을 함께 나누고 싶습니다',
    ageGroups: ['adult'],
    difficulty: 'easy',
    aiRole: '친한 동료',
    userRole: '성취한 사람',
    situation: '오랜 노력 끝에 프로젝트가 성공했습니다. 동료들과 기쁨을 나누고 싶습니다.',
    goals: [
      '기쁜 소식 전하기',
      '함께 한 사람들께 감사하기',
      '축하 받기'
    ],
    tips: [
      '흥분된 마음을 표현하세요',
      '함께 한 동료들의 도움을 언급하세요',
      '축하를 기쁘게 받으세요'
    ],
    aiPersona: '너는 동료의 성공을 진심으로 축하하는 사람이야. 같이 기뻐하고 축하해주며, 그동안의 노력을 인정해줘. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 4,
      keywords: ['성공', '감사', '축하'],
      emotional: ['기쁨', '감사']
    },
    voice: 'shimmer'
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
  {
    id: 'presentation_business',
    category: 'presentation',
    title: '사업 제안 프레젠테이션',
    description: '중요한 비즈니스 프레젠테이션을 준비하고 있습니다',
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
  {
    id: 'presentation_team_meeting',
    category: 'presentation',
    title: '팀 회의에서 아이디어 발표하기',
    description: '팀 회의에서 새로운 아이디어를 설득력 있게 발표하세요',
    ageGroups: ['adult'],
    difficulty: 'medium',
    aiRole: '팀원',
    userRole: '발표자',
    situation: '업무 개선을 위한 새로운 아이디어를 팀 회의에서 제안하고 싶습니다.',
    goals: [
      '명확하게 아이디어 설명하기',
      '팀원들의 질문에 답변하기',
      '공감과 동의 얻기'
    ],
    tips: [
      '구체적인 문제점을 먼저 제시하세요',
      '해결책의 실행 가능성을 보여주세요',
      '팀원들의 의견을 물어보세요'
    ],
    aiPersona: '너는 팀 회의에 참석한 동료야. 새로운 아이디어에 관심은 있지만 실행 가능성을 따져봐. 설명이 명확하고 실용적이면 긍정적으로 반응해. 모든 답변은 한국어로만 해줘.',
    successCriteria: {
      turnCount: 7,
      keywords: ['아이디어', '개선', '실행'],
      emotional: ['설득력', '자신감']
    },
    voice: 'alloy'
  },

  // ========== 성인 사회생활 ==========
  {
    id: 'social_networking',
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
  },

  // ========== 아동 (5-12세) 시나리오 ==========
  {
    id: 'child_make_friend',
    category: 'friendship',
    title: '새 친구 사귀기',
    description: '놀이터에서 처음 보는 친구에게 같이 놀자고 말해보세요',
    ageGroups: ['child'],
    difficulty: 'easy',
    aiRole: '놀이터에 있는 친구',
    userRole: '친구를 사귀고 싶은 어린이',
    situation: '놀이터에서 혼자 그네를 타고 있는 친구가 있어요. 말을 걸어서 같이 놀고 싶어요.',
    goals: [
      '밝게 인사하기',
      '이름과 나이 물어보기',
      '같이 놀자고 제안하기'
    ],
    tips: [
      '웃으면서 다가가세요',
      '내 이름을 먼저 소개하세요',
      '무엇을 같이 하고 싶은지 말해보세요'
    ],
    aiPersona: '너는 놀이터에서 노는 친근한 어린이야. 누군가 말을 걸면 반갑게 대답하고 같이 놀고 싶어해. 밝고 친절하게 대화해줘. 모든 답변은 한국어로만 해줘.',
    firstMessage: '(그네를 타고 있다가 너를 본다) 안녕! 나도 여기 왔어. 너는 뭐하고 놀고 싶어?',
    successCriteria: {
      turnCount: 4,
      keywords: ['이름', '같이', '놀다'],
      emotional: ['밝음', '친근함']
    },
    voice: 'shimmer'
  },
  {
    id: 'child_refuse_bullying',
    category: 'refusal',
    title: '괴롭힘 당할 때 대처하기',
    description: '친구가 내 물건을 빼앗으려고 해요. 싫다고 말해보세요',
    ageGroups: ['child'],
    difficulty: 'medium',
    aiRole: '물건을 빼앗으려는 친구',
    userRole: '괴롭힘을 당하는 어린이',
    situation: '쉬는 시간에 친구가 내 장난감을 빼앗으려고 해요. 싫다고 말하고 선생님께 도움을 청해야 해요.',
    goals: [
      '싫다고 분명히 말하기',
      '왜 싫은지 설명하기',
      '선생님께 말씀드리겠다고 하기'
    ],
    tips: [
      '크고 분명하게 "싫어!"라고 말하세요',
      '내 물건이라고 말하세요',
      '선생님께 말씀드리겠다고 하세요'
    ],
    aiPersona: '너는 장난감을 빼앗으려는 아이야. 처음엔 계속 빼앗으려 하지만, 상대방이 단호하게 거절하고 선생님께 말씀드리겠다고 하면 그만둬. 모든 답변은 한국어로만 해줘.',
    firstMessage: '야, 그거 재밌어 보이는데? 나도 가지고 놀고 싶은데, 좀 줘봐.',
    successCriteria: {
      turnCount: 4,
      keywords: ['싫어', '내 것', '선생님'],
      emotional: ['단호함', '용기']
    },
    voice: 'alloy'
  },
  {
    id: 'child_apologize_parent',
    category: 'apology',
    title: '부모님께 잘못 사과하기',
    description: '거짓말을 해서 부모님이 속상해하세요. 진심으로 사과해보세요',
    ageGroups: ['child'],
    difficulty: 'easy',
    aiRole: '속상해하시는 부모님',
    userRole: '잘못한 어린이',
    situation: '숙제를 안 하고 했다고 거짓말했어요. 부모님이 알게 되셨어요.',
    goals: [
      '진심으로 미안하다고 말하기',
      '왜 거짓말했는지 설명하기',
      '다시는 안 하겠다고 약속하기'
    ],
    tips: [
      '눈을 보고 "미안해요"라고 말하세요',
      '솔직하게 이유를 말하세요',
      '앞으로 어떻게 할지 약속하세요'
    ],
    aiPersona: '너는 자녀가 거짓말해서 속상한 부모야. 아이가 진심으로 사과하면 용서해주고 다독여줘. 따뜻하지만 교훈을 주는 대화를 해줘. 모든 답변은 한국어로만 해줘.',
    firstMessage: '(조용히 앉아있다가) 우리 이야기 좀 해야 할 것 같은데... 숙제 안 하고 했다고 한 거, 엄마가 알게 됐어.',
    successCriteria: {
      turnCount: 5,
      keywords: ['미안', '잘못', '약속'],
      emotional: ['후회', '진심']
    },
    voice: 'sage'
  },
  {
    id: 'child_share_toy',
    category: 'conflict',
    title: '친구와 장난감 나눠 쓰기',
    description: '친구가 내 장난감도 가지고 놀고 싶대요. 함께 나눠 쓰는 법을 배워보세요',
    ageGroups: ['child'],
    difficulty: 'easy',
    aiRole: '장난감을 함께 쓰고 싶은 친구',
    userRole: '장난감을 가진 어린이',
    situation: '내가 좋아하는 장난감으로 놀고 있는데, 친구도 가지고 놀고 싶대요.',
    goals: [
      '친구 마음 이해하기',
      '차례대로 하자고 제안하기',
      '같이 노는 방법 찾기'
    ],
    tips: [
      '친구도 놀고 싶을 수 있어요',
      '"조금 있다가 너도 해"라고 말하세요',
      '함께 놀 수 있는 방법을 생각해보세요'
    ],
    aiPersona: '너는 장난감을 가지고 놀고 싶은 친구야. 처음엔 기다리기 싫지만, 상대방이 차례대로 하자거나 같이 놀자고 하면 기쁘게 받아들여. 모든 답변은 한국어로만 해줘.',
    firstMessage: '(다가온다) 야, 그거 엄청 재밌어 보이는데! 나도 좀 가지고 놀면 안 돼?',
    successCriteria: {
      turnCount: 4,
      keywords: ['같이', '차례', '나눠'],
      emotional: ['배려', '협력']
    },
    voice: 'shimmer'
  },
  {
    id: 'child_thank_teacher',
    category: 'gratitude',
    title: '선생님께 감사 인사하기',
    description: '선생님이 많이 도와주셨어요. 고마운 마음을 전해보세요',
    ageGroups: ['child'],
    difficulty: 'easy',
    aiRole: '선생님',
    userRole: '감사한 학생',
    situation: '숙제를 못 해서 속상했는데, 선생님이 친절하게 도와주셨어요.',
    goals: [
      '감사하다고 말하기',
      '무엇이 도움이 됐는지 말하기',
      '앞으로 열심히 하겠다고 하기'
    ],
    tips: [
      '"감사합니다"라고 분명하게 말하세요',
      '선생님이 어떻게 도와주셨는지 이야기하세요',
      '다음엔 혼자서도 할 수 있다고 말하세요'
    ],
    aiPersona: '너는 학생을 도와준 선생님이야. 학생이 감사 인사를 하면 기쁘게 받아들이고, 앞으로도 열심히 하라고 격려해줘. 모든 답변은 한국어로만 해줘.',
    firstMessage: '(웃으면서) 오늘 숙제 잘 해왔구나! 어제 내가 설명해준 거 이해됐어?',
    successCriteria: {
      turnCount: 4,
      keywords: ['감사', '도움', '열심히'],
      emotional: ['감사', '기쁨']
    },
    voice: 'sage'
  },
  {
    id: 'child_ask_play',
    category: 'request',
    title: '친구에게 놀자고 제안하기',
    description: '수업 끝나고 친구랑 같이 놀고 싶어요. 용기내서 물어보세요',
    ageGroups: ['child'],
    difficulty: 'easy',
    aiRole: '같은 반 친구',
    userRole: '같이 놀고 싶은 어린이',
    situation: '쉬는 시간마다 재미있게 노는 친구가 있어요. 같이 놀고 싶은데 어떻게 말할지 모르겠어요.',
    goals: [
      '용기내서 말 걸기',
      '같이 놀자고 제안하기',
      '무엇을 하고 싶은지 말하기'
    ],
    tips: [
      '먼저 다가가서 인사하세요',
      '"같이 놀래?"라고 물어보세요',
      '무엇을 하고 싶은지 이야기하세요'
    ],
    aiPersona: '너는 친구가 말을 걸어주길 기다리던 어린이야. 누군가 같이 놀자고 하면 반갑게 받아들여. 모든 답변은 한국어로만 해줘.',
    firstMessage: '(그림을 그리고 있다가 널 본다) 어? 안녕!',
    successCriteria: {
      turnCount: 4,
      keywords: ['같이', '놀다', '친구'],
      emotional: ['용기', '기쁨']
    },
    voice: 'shimmer'
  },
  {
    id: 'child_express_sad',
    category: 'emotion',
    title: '슬픈 마음 표현하기',
    description: '친구가 놀아주지 않아서 속상해요. 부모님께 이야기해보세요',
    ageGroups: ['child'],
    difficulty: 'easy',
    aiRole: '부모님',
    userRole: '슬픈 어린이',
    situation: '오늘 학교에서 친구들이 나랑 안 놀아줘서 속상했어요.',
    goals: [
      '솔직하게 기분 말하기',
      '무슨 일이 있었는지 설명하기',
      '위로 받기'
    ],
    tips: [
      '"속상해요"라고 솔직하게 말하세요',
      '무슨 일이 있었는지 이야기하세요',
      '부모님의 조언을 들어보세요'
    ],
    aiPersona: '너는 자녀를 걱정하는 부모야. 아이가 속상한 일을 이야기하면 위로해주고, 어떻게 하면 좋을지 함께 생각해줘. 모든 답변은 한국어로만 해줘.',
    firstMessage: '어머, 우리 아기가 왜 이렇게 풀이 죽어있어? 오늘 학교에서 무슨 일 있었어?',
    successCriteria: {
      turnCount: 5,
      keywords: ['속상', '친구', '슬프다'],
      emotional: ['슬픔', '위로']
    },
    voice: 'sage'
  },

  // ========== 청소년 (13-18세) 시나리오 ==========
  {
    id: 'teen_new_school_friend',
    category: 'friendship',
    title: '전학 온 학교에서 친구 사귀기',
    description: '새로 전학 온 학교에서 친구를 사귀고 싶어요',
    ageGroups: ['teen'],
    difficulty: 'medium',
    aiRole: '같은 반 학생',
    userRole: '전학생',
    situation: '새 학교에 전학 왔어요. 점심시간인데 혼자 밥을 먹고 있어요. 옆 자리 친구에게 말을 걸어보고 싶어요.',
    goals: [
      '자연스럽게 대화 시작하기',
      '공통 관심사 찾기',
      '연락처 교환하기'
    ],
    tips: [
      '학교나 수업에 대해 물어보세요',
      '취미나 관심사를 이야기하세요',
      '같이 점심 먹자고 제안하세요'
    ],
    aiPersona: '너는 친절한 학생이야. 전학생이 말을 걸면 반갑게 대답하고 학교 생활에 도움을 주려고 해. 또래답게 친근하게 대화해줘. 모든 답변은 한국어로만 해줘.',
    firstMessage: '(옆에 앉으면서) 어, 너 새로 전학 온 애지? 오늘 첫 날이야?',
    successCriteria: {
      turnCount: 6,
      keywords: ['학교', '친구', '연락처'],
      emotional: ['친근함', '관심']
    },
    voice: 'alloy'
  },
  {
    id: 'teen_refuse_peer_pressure',
    category: 'refusal',
    title: '친구들 따라 하기 싫은 일 거절하기',
    description: '친구들이 편의점에서 물건을 훔치자고 해요. 거절해야 해요',
    ageGroups: ['teen'],
    difficulty: 'hard',
    aiRole: '잘못된 일을 제안하는 친구',
    userRole: '거절하고 싶은 학생',
    situation: '친구들이 재미로 편의점에서 물건을 가져가자고 합니다. 이건 잘못된 일이에요.',
    goals: [
      '확실하게 거절하기',
      '왜 안 되는지 설명하기',
      '다른 재미있는 일 제안하기'
    ],
    tips: [
      '"나는 못 해"라고 분명히 말하세요',
      '잘못된 일이라고 설명하세요',
      '다른 재미있는 일을 제안하세요'
    ],
    aiPersona: '너는 좀 무모한 친구야. 처음엔 겁쟁이라고 놀리지만, 상대방이 단호하고 대안을 제시하면 그만둬. 모든 답변은 한국어로만 해줘.',
    firstMessage: '야, 우리 저기 편의점 가서 과자 좀 가져오자. 주인 아저씨 안 볼 때 슬쩍 하면 돼. 재밌을 거 같은데?',
    successCriteria: {
      turnCount: 5,
      keywords: ['안돼', '잘못', '다른'],
      emotional: ['단호함', '정의감']
    },
    voice: 'echo'
  },
  {
    id: 'teen_ask_teacher',
    category: 'request',
    title: '선생님께 질문하기',
    description: '수업 내용이 이해가 안 돼요. 선생님께 여쭤보고 싶어요',
    ageGroups: ['teen'],
    difficulty: 'easy',
    aiRole: '선생님',
    userRole: '질문이 있는 학생',
    situation: '수학 수업에서 배운 내용이 이해가 안 돼요. 선생님께 다시 설명해달라고 여쭤보고 싶어요.',
    goals: [
      '예의 바르게 질문하기',
      '무엇을 모르는지 구체적으로 말하기',
      '이해할 때까지 물어보기'
    ],
    tips: [
      '"선생님, 질문 있어요"라고 정중하게 말하세요',
      '어느 부분이 어려운지 구체적으로 말하세요',
      '이해가 안 되면 다시 물어보세요'
    ],
    aiPersona: '너는 친절한 선생님이야. 학생이 질문하면 기쁘게 받아들이고 이해할 수 있게 설명해줘. 격려하는 말도 해줘. 모든 답변은 한국어로만 해줘.',
    firstMessage: '(칠판을 닦다가) 네, 무슨 질문이 있나요? 오늘 수업 내용 중에 어려운 부분 있었나요?',
    successCriteria: {
      turnCount: 5,
      keywords: ['질문', '이해', '설명'],
      emotional: ['정중함', '적극성']
    },
    voice: 'sage'
  },
  {
    id: 'teen_career_counseling',
    category: 'emotion',
    title: '진로 상담 선생님과 고민 나누기',
    description: '진로를 정하지 못했어요. 상담 선생님께 도움을 구하고 싶어요',
    ageGroups: ['teen'],
    difficulty: 'medium',
    aiRole: '진로 상담 선생님',
    userRole: '진로 고민 중인 학생',
    situation: '고등학교 2학년인데 진로를 아직 정하지 못했어요. 부모님은 의사가 되라고 하는데 저는 그림 그리는 게 좋아요.',
    goals: [
      '솔직하게 고민 털어놓기',
      '관심 분야 이야기하기',
      '조언 구하기'
    ],
    tips: [
      '어떤 점이 고민인지 솔직하게 말하세요',
      '무엇을 좋아하고 잘하는지 이야기하세요',
      '어떻게 해야 할지 물어보세요'
    ],
    aiPersona: '너는 경험 많은 진로 상담 선생님이야. 학생의 고민을 경청하고, 부모님 기대와 본인 관심사 사이에서 균형을 찾을 수 있게 도와줘. 모든 답변은 한국어로만 해줘.',
    firstMessage: '어서 오세요. 편하게 앉아요. 오늘은 어떤 이야기를 하러 왔나요?',
    successCriteria: {
      turnCount: 7,
      keywords: ['진로', '관심', '고민'],
      emotional: ['진솔함', '고민']
    },
    voice: 'alloy'
  },
  {
    id: 'teen_dating_confession',
    category: 'emotion',
    title: '좋아하는 친구에게 마음 고백하기',
    description: '좋아하는 친구에게 데이트 신청을 하고 싶어요',
    ageGroups: ['teen'],
    difficulty: 'medium',
    aiRole: '좋아하는 친구',
    userRole: '고백하는 학생',
    situation: '같은 반 친구를 좋아해요. 방과 후에 같이 카페 가자고 말하고 싶어요.',
    goals: [
      '자연스럽게 말 꺼내기',
      '좋아한다고 말하기',
      '같이 시간 보내자고 제안하기'
    ],
    tips: [
      '너무 긴장하지 마세요',
      '"너랑 시간 보내는 게 좋아"라고 말하세요',
      '거절해도 괜찮다는 마음을 가지세요'
    ],
    aiPersona: '너는 상대방을 친구로 생각하던 학생이야. 고백을 받으면 조금 놀라지만 나쁘지 않게 생각해. 긍정적이되 조금 수줍게 반응해줘. 모든 답변은 한국어로만 해줘.',
    firstMessage: '(교실에서 책을 정리하다가) 어? 무슨 일이야? 뭔가 할 말 있는 것 같은데?',
    successCriteria: {
      turnCount: 5,
      keywords: ['좋아해', '같이', '시간'],
      emotional: ['용기', '설렘']
    },
    voice: 'shimmer'
  },
  {
    id: 'teen_conflict_group',
    category: 'conflict',
    title: '친구들 사이에서 중재하기',
    description: '친한 친구 둘이 싸웠어요. 중재하고 싶어요',
    ageGroups: ['teen'],
    difficulty: 'hard',
    aiRole: '화가 난 친구',
    userRole: '중재하려는 친구',
    situation: '제 두 친구가 오해로 싸웠어요. 둘 다 제 소중한 친구라 중재하고 싶어요.',
    goals: [
      '양쪽 입장 들어보기',
      '오해 풀어주기',
      '화해시키기'
    ],
    tips: [
      '한 쪽 편만 들지 마세요',
      '각자의 입장을 이해하려 하세요',
      '먼저 사과하라고 강요하지 마세요'
    ],
    aiPersona: '너는 친구와 싸워서 화가 난 학생이야. 처음엔 화가 나 있지만, 중재자가 이해해주고 상대 입장도 설명해주면 마음이 풀려. 모든 답변은 한국어로만 해줘.',
    firstMessage: '(화가 나서) 야, 너도 들었지? 걔가 나한테 그렇게 말한 거. 진짜 너무한 거 아니야?',
    successCriteria: {
      turnCount: 7,
      keywords: ['이해', '오해', '화해'],
      emotional: ['공정함', '배려']
    },
    voice: 'echo'
  },
  {
    id: 'teen_study_group',
    category: 'request',
    title: '스터디 그룹 만들자고 제안하기',
    description: '시험 기간이 다가와요. 친구들에게 같이 공부하자고 제안하고 싶어요',
    ageGroups: ['teen'],
    difficulty: 'medium',
    aiRole: '같은 반 친구',
    userRole: '스터디 제안하는 학생',
    situation: '다음 주가 시험인데, 혼자 공부하기 어려워요. 친구들과 스터디 그룹을 만들고 싶어요.',
    goals: [
      '스터디 그룹 아이디어 제안하기',
      '언제, 어디서 할지 계획 세우기',
      '친구들 참여 유도하기'
    ],
    tips: [
      '같이 공부하면 좋은 점을 말하세요',
      '구체적인 계획을 제시하세요',
      '부담 없이 참여하라고 하세요'
    ],
    aiPersona: '너는 시험을 앞둔 학생이야. 스터디 제안을 받으면 관심을 보이고, 구체적인 계획이 있으면 참여하고 싶어해. 모든 답변은 한국어로만 해줘.',
    firstMessage: '(한숨을 쉬며) 아, 다음 주 시험인데 진짜 걱정이다. 너는 공부 어떻게 하고 있어?',
    successCriteria: {
      turnCount: 6,
      keywords: ['스터디', '같이', '시험'],
      emotional: ['적극성', '협력']
    },
    voice: 'alloy'
  },
  {
    id: 'teen_apologize_friend',
    category: 'apology',
    title: '친구에게 사과하기',
    description: '실수로 친구 기분을 상하게 했어요. 사과하고 싶어요',
    ageGroups: ['teen'],
    difficulty: 'medium',
    aiRole: '상처받은 친구',
    userRole: '사과하려는 학생',
    situation: '어제 농담한 것이 친구 마음을 상하게 했어요. 진심으로 사과하고 싶어요.',
    goals: [
      '진심으로 사과하기',
      '어떤 점이 잘못됐는지 인정하기',
      '관계 회복하기'
    ],
    tips: [
      '"미안해"라고 분명히 말하세요',
      '왜 잘못인지 설명하세요',
      '다시는 그러지 않겠다고 약속하세요'
    ],
    aiPersona: '너는 상처를 받은 친구야. 처음엔 쌀쌀하지만, 상대방이 진심으로 사과하면 마음이 풀려. 모든 답변은 한국어로만 해줘.',
    firstMessage: '(고개를 돌리고) ...뭐.',
    successCriteria: {
      turnCount: 5,
      keywords: ['미안', '잘못', '친구'],
      emotional: ['진심', '후회']
    },
    voice: 'alloy'
  },
  {
    id: 'teen_part_time_interview',
    category: 'interview',
    title: '아르바이트 면접 보기',
    description: '처음으로 아르바이트 면접을 봐요. 잘 대답하고 싶어요',
    ageGroups: ['teen'],
    difficulty: 'medium',
    aiRole: '가게 사장님',
    userRole: '면접 보는 학생',
    situation: '동네 카페에서 아르바이트생을 뽑는다고 해요. 처음 해보는 면접이라 긴장돼요.',
    goals: [
      '자기소개 하기',
      '일할 수 있는 시간 말하기',
      '열심히 하겠다는 의지 보여주기'
    ],
    tips: [
      '밝게 인사하고 자기소개하세요',
      '언제 일할 수 있는지 정확히 말하세요',
      '배우고 싶다는 의지를 보여주세요'
    ],
    aiPersona: '너는 카페 사장님이야. 첫 아르바이트를 하려는 학생에게 친절하게 질문하고, 성실해 보이면 채용하고 싶어해. 모든 답변은 한국어로만 해줘.',
    firstMessage: '(웃으며) 어서 오세요. 앉으세요. 오늘 면접 보러 온 학생이죠? 먼저 자기소개 좀 해볼래요?',
    successCriteria: {
      turnCount: 6,
      keywords: ['일', '시간', '배우다'],
      emotional: ['적극성', '성실함']
    },
    voice: 'sage'
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
    name: '인간관계',
    icon: '👥',
    description: '네트워킹과 새로운 인맥 만들기',
    color: 'bg-blue-500/10 text-blue-600 border-blue-200'
  },
  conflict: {
    name: '갈등 해결',
    icon: '🤝',
    description: '직장, 가족, 친구와의 갈등을 해결하는 대화법',
    color: 'bg-purple-500/10 text-purple-600 border-purple-200'
  },
  gratitude: {
    name: '감사 표현',
    icon: '💝',
    description: '멘토나 동료에게 진심을 전하는 법',
    color: 'bg-pink-500/10 text-pink-600 border-pink-200'
  },
  refusal: {
    name: '거절하기',
    icon: '🙅',
    description: '과도한 요구나 부탁을 정중하게 거절하는 법',
    color: 'bg-red-500/10 text-red-600 border-red-200'
  },
  apology: {
    name: '사과하기',
    icon: '🙇',
    description: '업무 실수나 관계 회복을 위한 진심 어린 사과',
    color: 'bg-orange-500/10 text-orange-600 border-orange-200'
  },
  request: {
    name: '요청하기',
    icon: '🙏',
    description: '연봉 협상, 휴가 요청 등 필요한 것을 요청하는 법',
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200'
  },
  emotion: {
    name: '감정 표현',
    icon: '😊',
    description: '번아웃, 기쁨, 걱정 등 솔직한 감정 나누기',
    color: 'bg-green-500/10 text-green-600 border-green-200'
  },
  interview: {
    name: '면접 연습',
    icon: '💼',
    description: '취업, 경력 전환, 대학원 면접 준비',
    color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200'
  },
  presentation: {
    name: '발표 연습',
    icon: '🎤',
    description: '비즈니스 프레젠테이션과 회의 발표 연습',
    color: 'bg-teal-500/10 text-teal-600 border-teal-200'
  }
};
