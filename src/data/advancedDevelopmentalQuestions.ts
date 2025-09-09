// 고도화된 AIH 발달특성 종합평가 문항 (35문항)
export interface AdvancedDevelopmentalQuestion {
  id: number;
  category: 'social_communication' | 'cognitive_flexibility' | 'sensory_processing' | 'emotional_regulation' | 'social_interaction' | 'repetitive_behaviors' | 'executive_function' | 'adaptive_skills';
  text: string;
  description?: string;
  ageSpecific: {
    child: string;
    adult: string;
  };
  clinicalSignificance: string;
  domain: string;
}

export const advancedDevelopmentalQuestions: AdvancedDevelopmentalQuestion[] = [
  // 사회적 의사소통 (Social Communication) - 8문항
  {
    id: 1,
    category: 'social_communication',
    domain: '사회적 의사소통',
    text: '다른 사람과 시선을 맞추거나 공유하는 것이 자연스럽습니다',
    ageSpecific: {
      child: '다른 사람과 눈을 마주치며 대화하는 것을 좋아합니다',
      adult: '회화 중 상대방과 적절한 시선 접촉을 유지합니다'
    },
    description: '사회적 의사소통의 기본인 시선 접촉과 공동 주의 능력을 평가합니다',
    clinicalSignificance: '자폐 스펙트럼 장애의 핵심 특성 중 하나인 사회적 의사소통 능력'
  },
  {
    id: 2,
    category: 'social_communication',
    domain: '사회적 의사소통',
    text: '비언어적 의사소통(몸짓, 표정, 손짓)을 자연스럽게 사용하고 이해합니다',
    ageSpecific: {
      child: '손짓이나 표정으로 자신의 의사를 표현할 수 있습니다',
      adult: '상대방의 표정이나 몸짓의 의미를 잘 파악합니다'
    },
    description: '언어 외적인 의사소통 수단의 활용 및 이해 능력',
    clinicalSignificance: '사회적 의사소통 능력의 중요한 구성 요소'
  },
  {
    id: 3,
    category: 'social_communication',
    domain: '사회적 의사소통',
    text: '대화를 주고받으며 상호작용하는 것이 편안합니다',
    ageSpecific: {
      child: '친구들과 대화할 때 서로 번갈아가며 이야기합니다',
      adult: '대화에서 적절히 주도권을 나누며 상호작용합니다'
    },
    description: '대화의 상호성과 사회적 리듬 이해 능력',
    clinicalSignificance: '사회적 의사소통의 상호성 평가'
  },
  {
    id: 4,
    category: 'social_communication',
    domain: '사회적 의사소통',
    text: '상황에 맞는 적절한 언어와 표현을 사용합니다',
    ageSpecific: {
      child: '집에서와 학교에서 다르게 말하는 방식을 조절할 수 있습니다',
      adult: '공식적/비공식적 상황에 맞게 언어 사용을 조절합니다'
    },
    description: '사회적 맥락에 따른 언어 사용의 적절성',
    clinicalSignificance: '실용언어학적 능력 평가'
  },
  {
    id: 5,
    category: 'social_communication',
    domain: '사회적 의사소통',
    text: '다른 사람의 감정이나 의도를 표정이나 말투로 파악할 수 있습니다',
    ageSpecific: {
      child: '친구가 화났는지 기쁜지 표정을 보고 알 수 있습니다',
      adult: '상대방의 감정 상태를 비언어적 단서로 파악합니다'
    },
    description: '타인의 정신상태 이해 능력 (마음 이론)',
    clinicalSignificance: '사회인지 능력의 핵심 지표'
  },
  {
    id: 6,
    category: 'social_communication',
    domain: '사회적 의사소통',
    text: '농담이나 비유적 표현을 이해하고 적절히 반응합니다',
    ageSpecific: {
      child: '친구들의 농담을 이해하고 함께 웃을 수 있습니다',
      adult: '은유나 관용 표현의 의미를 이해하고 사용합니다'
    },
    description: '언어의 함축적 의미 이해 능력',
    clinicalSignificance: '고차원적 언어 이해 능력 평가'
  },
  {
    id: 7,
    category: 'social_communication',
    domain: '사회적 의사소통',
    text: '자신의 관심사를 다른 사람과 자연스럽게 공유합니다',
    ageSpecific: {
      child: '좋아하는 것에 대해 친구들과 이야기하는 것을 즐깁니다',
      adult: '개인적 관심사를 타인과 나누며 관계를 형성합니다'
    },
    description: '사회적 참조와 관심 공유 능력',
    clinicalSignificance: '사회적 연결성과 공동 관심 능력'
  },
  {
    id: 8,
    category: 'social_communication',
    domain: '사회적 의사소통',
    text: '타인의 관점에서 상황을 이해하려고 노력합니다',
    ageSpecific: {
      child: '다른 사람의 입장에서 생각해볼 수 있습니다',
      adult: '타인의 관점과 견해를 이해하고 존중합니다'
    },
    description: '관점 수용 능력과 인지적 공감',
    clinicalSignificance: '사회인지 발달의 고차원적 지표'
  },

  // 인지적 유연성 (Cognitive Flexibility) - 6문항
  {
    id: 9,
    category: 'cognitive_flexibility',
    domain: '인지적 유연성',
    text: '예상과 다른 상황이 벌어져도 쉽게 적응합니다',
    ageSpecific: {
      child: '계획이 바뀌어도 크게 속상해하지 않고 새로운 계획을 받아들입니다',
      adult: '업무나 일정 변경에 유연하게 대응할 수 있습니다'
    },
    description: '변화에 대한 적응력과 인지적 유연성',
    clinicalSignificance: '실행기능과 적응능력의 핵심 지표'
  },
  {
    id: 10,
    category: 'cognitive_flexibility',
    domain: '인지적 유연성',
    text: '문제를 해결할 때 다양한 방법을 시도해봅니다',
    ageSpecific: {
      child: '한 가지 방법이 안 되면 다른 방법을 찾아봅니다',
      adult: '문제 해결 시 창의적이고 다양한 접근을 시도합니다'
    },
    description: '문제해결의 다양성과 창의적 사고',
    clinicalSignificance: '인지적 경직성 vs 유연성 평가'
  },
  {
    id: 11,
    category: 'cognitive_flexibility',
    domain: '인지적 유연성',
    text: '새로운 환경이나 사람들과도 잘 어울립니다',
    ageSpecific: {
      child: '새로운 장소나 새로운 친구들과도 금방 친해집니다',
      adult: '낯선 환경에서도 적절히 행동하고 적응합니다'
    },
    description: '환경 변화에 대한 적응력',
    clinicalSignificance: '사회적 적응 능력과 환경 적응성'
  },
  {
    id: 12,
    category: 'cognitive_flexibility',
    domain: '인지적 유연성',
    text: '여러 가지 일을 동시에 처리할 수 있습니다',
    ageSpecific: {
      child: '놀이를 하다가도 다른 일로 주의를 옮길 수 있습니다',
      adult: '멀티태스킹이 필요한 상황을 잘 처리합니다'
    },
    description: '주의 전환과 멀티태스킹 능력',
    clinicalSignificance: '실행기능의 핵심 요소'
  },
  {
    id: 13,
    category: 'cognitive_flexibility',
    domain: '인지적 유연성',
    text: '실수했을 때 다른 방식으로 다시 시도합니다',
    ageSpecific: {
      child: '잘못했을 때 포기하지 않고 다시 도전합니다',
      adult: '실패 후 전략을 수정하여 재시도할 수 있습니다'
    },
    description: '오류 수정과 전략 변경 능력',
    clinicalSignificance: '인지적 억제와 전략적 사고'
  },
  {
    id: 14,
    category: 'cognitive_flexibility',
    domain: '인지적 유연성',
    text: '규칙이나 패턴이 바뀌어도 빠르게 이해하고 따릅니다',
    ageSpecific: {
      child: '게임 규칙이 바뀌어도 금방 이해하고 적응합니다',
      adult: '새로운 절차나 규정을 빠르게 학습하고 적용합니다'
    },
    description: '규칙 학습과 패턴 인식의 유연성',
    clinicalSignificance: '인지적 경직성과 학습능력 평가'
  },

  // 감각 처리 (Sensory Processing) - 5문항
  {
    id: 15,
    category: 'sensory_processing',
    domain: '감각 처리',
    text: '큰 소리나 갑작스러운 소음에 과도하게 민감하지 않습니다',
    ageSpecific: {
      child: '시끄러운 곳에서도 편안하게 있을 수 있습니다',
      adult: '일상적인 소음 환경에서 불편함을 느끼지 않습니다'
    },
    description: '청각 자극에 대한 감각 처리 능력',
    clinicalSignificance: '감각 과민성 및 감각 통합 능력'
  },
  {
    id: 16,
    category: 'sensory_processing',
    domain: '감각 처리',
    text: '다양한 질감의 음식이나 옷감을 거부감 없이 받아들입니다',
    ageSpecific: {
      child: '새로운 음식이나 다른 옷감을 싫어하지 않습니다',
      adult: '촉각적 자극에 대해 과도한 민감성을 보이지 않습니다'
    },
    description: '촉각 자극에 대한 감각 처리',
    clinicalSignificance: '감각 방어와 촉각 민감성 평가'
  },
  {
    id: 17,
    category: 'sensory_processing',
    domain: '감각 처리',
    text: '밝은 빛이나 특정 조명에 과도하게 예민하지 않습니다',
    ageSpecific: {
      child: '밝은 곳에서도 눈을 찡그리거나 피하지 않습니다',
      adult: '다양한 조명 환경에서 편안함을 유지합니다'
    },
    description: '시각 자극에 대한 감각 처리',
    clinicalSignificance: '시각적 감각 과민성 평가'
  },
  {
    id: 18,
    category: 'sensory_processing',
    domain: '감각 처리',
    text: '냄새나 맛에 대해 극단적인 반응을 보이지 않습니다',
    ageSpecific: {
      child: '새로운 냄새나 맛을 접할 때 과도하게 거부하지 않습니다',
      adult: '후각이나 미각 자극에 적절히 반응합니다'
    },
    description: '후각/미각 자극에 대한 감각 처리',
    clinicalSignificance: '화학적 감각의 민감성 평가'
  },
  {
    id: 19,
    category: 'sensory_processing',
    domain: '감각 처리',
    text: '몸의 움직임이나 균형감각이 적절합니다',
    ageSpecific: {
      child: '그네나 미끄럼틀 같은 움직임을 즐기거나 적절히 조절합니다',
      adult: '균형을 유지하고 공간 인식이 정확합니다'
    },
    description: '전정감각과 고유수용감각 처리',
    clinicalSignificance: '감각 통합과 운동 협응 능력'
  },

  // 정서 조절 (Emotional Regulation) - 5문항
  {
    id: 20,
    category: 'emotional_regulation',
    domain: '정서 조절',
    text: '화가 났을 때 스스로 진정할 수 있는 방법을 알고 있습니다',
    ageSpecific: {
      child: '화가 나도 금방 마음을 가라앉힐 수 있습니다',
      adult: '스트레스나 분노 상황에서 감정을 조절할 수 있습니다'
    },
    description: '부정적 정서의 자기조절 능력',
    clinicalSignificance: '정서조절 능력과 충동 통제'
  },
  {
    id: 21,
    category: 'emotional_regulation',
    domain: '정서 조절',
    text: '좌절 상황에서도 포기하지 않고 계속 노력합니다',
    ageSpecific: {
      child: '어려운 일이 있어도 쉽게 포기하지 않습니다',
      adult: '실패나 좌절 후에도 회복력을 보입니다'
    },
    description: '좌절 내성과 회복력',
    clinicalSignificance: '정서적 회복력과 인내심 평가'
  },
  {
    id: 22,
    category: 'emotional_regulation',
    domain: '정서 조절',
    text: '기쁘거나 슬픈 감정을 적절하게 표현할 수 있습니다',
    ageSpecific: {
      child: '자신의 기분을 말이나 표정으로 잘 나타냅니다',
      adult: '상황에 맞게 감정을 적절히 표현합니다'
    },
    description: '정서 표현의 적절성',
    clinicalSignificance: '정서적 의사소통 능력'
  },
  {
    id: 23,
    category: 'emotional_regulation',
    domain: '정서 조절',
    text: '감정의 변화가 예측 가능하고 안정적입니다',
    ageSpecific: {
      child: '기분 변화가 심하지 않고 안정적입니다',
      adult: '감정 기복이 크지 않고 예측 가능합니다'
    },
    description: '정서적 안정성과 예측가능성',
    clinicalSignificance: '기분 장애와 정서 조절 능력'
  },
  {
    id: 24,
    category: 'emotional_regulation',
    domain: '정서 조절',
    text: '다른 사람의 감정에 적절히 공감하고 반응합니다',
    ageSpecific: {
      child: '친구가 슬퍼하면 위로해주거나 함께 슬퍼합니다',
      adult: '타인의 감정 상태에 공감하고 적절히 반응합니다'
    },
    description: '정서적 공감과 사회적 반응',
    clinicalSignificance: '사회정서적 발달과 공감 능력'
  },

  // 사회적 상호작용 (Social Interaction) - 4문항
  {
    id: 25,
    category: 'social_interaction',
    domain: '사회적 상호작용',
    text: '새로운 사람들과 관계를 형성하는 것이 어렵지 않습니다',
    ageSpecific: {
      child: '새로운 친구들과 금방 친해질 수 있습니다',
      adult: '초면의 사람들과도 적절한 관계를 맺을 수 있습니다'
    },
    description: '사회적 관계 형성 능력',
    clinicalSignificance: '사회적 기술과 대인관계 능력'
  },
  {
    id: 26,
    category: 'social_interaction',
    domain: '사회적 상호작용',
    text: '집단 활동이나 팀 활동에 적극적으로 참여합니다',
    ageSpecific: {
      child: '친구들과 함께 하는 활동을 좋아하고 잘 참여합니다',
      adult: '팀워크가 필요한 상황에서 협력적으로 행동합니다'
    },
    description: '집단 참여와 협력 능력',
    clinicalSignificance: '사회적 참여와 협동 능력'
  },
  {
    id: 27,
    category: 'social_interaction',
    domain: '사회적 상호작용',
    text: '사회적 규칙이나 예의를 자연스럽게 따릅니다',
    ageSpecific: {
      child: '어른께 인사하고 차례를 지키는 등의 예의를 잘 지킵니다',
      adult: '사회적 매너와 에티켓을 자연스럽게 실천합니다'
    },
    description: '사회적 규범과 예의 준수',
    clinicalSignificance: '사회적 인지와 규범 이해'
  },
  {
    id: 28,
    category: 'social_interaction',
    domain: '사회적 상호작용',
    text: '갈등 상황에서 평화적으로 해결하려고 노력합니다',
    ageSpecific: {
      child: '친구와 싸웠을 때 서로 이야기해서 해결하려고 합니다',
      adult: '대인갈등을 건설적으로 해결하려고 시도합니다'
    },
    description: '갈등 해결과 사회적 문제해결',
    clinicalSignificance: '사회적 문제해결 능력과 갈등 관리'
  },

  // 반복 행동 및 제한된 관심 (Repetitive Behaviors) - 4문항
  {
    id: 29,
    category: 'repetitive_behaviors',
    domain: '반복행동 및 제한된 관심',
    text: '특정 물건을 계속 만지거나 반복적인 움직임을 하지 않습니다',
    ageSpecific: {
      child: '손을 흔들거나 몸을 흔드는 등의 반복 행동을 하지 않습니다',
      adult: '무의식적으로 반복하는 특정 행동이 거의 없습니다'
    },
    description: '상동행동과 반복적 운동 패턴',
    clinicalSignificance: '자폐 스펙트럼의 핵심 특성 중 하나'
  },
  {
    id: 30,
    category: 'repetitive_behaviors',
    domain: '반복행동 및 제한된 관심',
    text: '관심사가 다양하고 균형 잡혀 있습니다',
    ageSpecific: {
      child: '여러 가지 놀이나 활동에 관심을 보입니다',
      adult: '다양한 분야에 골고루 관심을 가지고 있습니다'
    },
    description: '관심사의 다양성과 균형',
    clinicalSignificance: '제한된 관심과 집착적 패턴 평가'
  },
  {
    id: 31,
    category: 'repetitive_behaviors',
    domain: '반복행동 및 제한된 관심',
    text: '일상의 변화를 받아들이고 융통성을 발휘합니다',
    ageSpecific: {
      child: '매일 같은 순서로 해야 한다고 고집하지 않습니다',
      adult: '루틴의 변화를 크게 어려워하지 않습니다'
    },
    description: '루틴에 대한 고집과 융통성',
    clinicalSignificance: '의식적 행동과 경직성 평가'
  },
  {
    id: 32,
    category: 'repetitive_behaviors',
    domain: '반복행동 및 제한된 관심',
    text: '특정 주제에만 과도하게 집중하지 않습니다',
    ageSpecific: {
      child: '한 가지에만 빠져서 다른 것은 전혀 하지 않는 경우가 없습니다',
      adult: '특정 주제나 활동에 과도하게 몰입하지 않습니다'
    },
    description: '특수한 관심사와 강박적 집중',
    clinicalSignificance: '제한적 관심과 집착 행동 평가'
  },

  // 실행 기능 (Executive Function) - 3문항
  {
    id: 33,
    category: 'executive_function',
    domain: '실행 기능',
    text: '계획을 세우고 순서대로 실행할 수 있습니다',
    ageSpecific: {
      child: '해야 할 일의 순서를 정하고 차례대로 할 수 있습니다',
      adult: '업무나 일상의 계획을 세우고 체계적으로 수행합니다'
    },
    description: '계획 수립과 순서화 능력',
    clinicalSignificance: '실행기능과 조직화 능력'
  },
  {
    id: 34,
    category: 'executive_function',
    domain: '실행 기능',
    text: '집중력을 유지하고 방해 요소를 무시할 수 있습니다',
    ageSpecific: {
      child: '해야 할 일에 집중하고 다른 것에 쉽게 방해받지 않습니다',
      adult: '주의를 집중해야 할 때 산만함을 조절할 수 있습니다'
    },
    description: '주의 집중과 억제 통제',
    clinicalSignificance: 'ADHD와 주의력 결핍 평가'
  },
  {
    id: 35,
    category: 'executive_function',
    domain: '실행 기능',
    text: '충동적으로 행동하지 않고 생각한 후 행동합니다',
    ageSpecific: {
      child: '하고 싶은 것이 있어도 잠깐 생각하고 행동합니다',
      adult: '즉흥적 결정보다는 신중하게 판단 후 행동합니다'
    },
    description: '충동 억제와 자기 통제',
    clinicalSignificance: '충동성과 자기조절 능력'
  }
];

// 도메인별 문항 수
export const domainQuestionCounts = {
  social_communication: 8,
  cognitive_flexibility: 6,
  sensory_processing: 5,
  emotional_regulation: 5,
  social_interaction: 4,
  repetitive_behaviors: 4,
  executive_function: 3
};

// 임상적 해석을 위한 도메인별 가중치
export const domainWeights = {
  social_communication: 2.0,  // 가장 중요한 핵심 영역
  cognitive_flexibility: 1.5,
  emotional_regulation: 1.5,
  social_interaction: 1.5,
  sensory_processing: 1.2,
  repetitive_behaviors: 1.8,
  executive_function: 1.3
};

export default advancedDevelopmentalQuestions;