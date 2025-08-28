import { InfantAssessment, ChildAssessment, AdultAssessment, AssessmentGame } from '@/types/assessment';

// AIH 영유아 성장관찰 체크리스트 (완전 창작형)
export const infantAssessmentQuestions: InfantAssessment = {
  grossMotor: [
    {
      id: "gm_01",
      text: "아이가 한 발로 3초 이상 서 있을 수 있나요?",
      category: "gross_motor",
      ageRange: "48-60개월",
      observationGuide: "아이에게 한 발로 서보라고 하고 3초를 세어보세요",
      scoringCriteria: {
        excellent: { score: 2, description: "5초 이상 안정적으로 서 있음" },
        good: { score: 1, description: "3-4초 정도 서 있음" },
        needsSupport: { score: 0, description: "3초 미만 또는 불가능" }
      },
      clinicalSignificance: "대근육 발달과 균형감각 평가"
    },
    {
      id: "gm_02", 
      text: "아이가 뒤로 걸을 수 있나요?",
      category: "gross_motor",
      ageRange: "36-48개월",
      observationGuide: "아이에게 뒤로 5걸음 걸어보라고 해보세요",
      scoringCriteria: {
        excellent: { score: 2, description: "자연스럽게 뒤로 걸음" },
        good: { score: 1, description: "조심스럽게 뒤로 걸음" },
        needsSupport: { score: 0, description: "불가능하거나 매우 어려워함" }
      }
    },
    {
      id: "gm_03",
      text: "아이가 공을 던질 수 있나요?",
      category: "gross_motor", 
      ageRange: "24-36개월",
      materialsNeeded: ["부드러운 공"],
      observationGuide: "아이에게 공을 주고 멀리 던져보라고 해보세요",
      scoringCriteria: {
        excellent: { score: 2, description: "목표 방향으로 정확하게 던짐" },
        good: { score: 1, description: "던지지만 방향이 부정확" },
        needsSupport: { score: 0, description: "던지기 어려워하거나 불가능" }
      }
    }
  ],
  
  fineMotor: [
    {
      id: "fm_01",
      text: "아이가 가위로 직선을 따라 자를 수 있나요?",
      category: "fine_motor",
      ageRange: "48-60개월",
      materialsNeeded: ["종이", "어린이용 가위"],
      observationGuide: "10cm 직선을 그어주고 가위로 자르게 해보세요",
      scoringCriteria: {
        excellent: { score: 2, description: "선에서 벗어나지 않고 자름" },
        good: { score: 1, description: "약간 벗어나지만 직선 의도 보임" },
        needsSupport: { score: 0, description: "직선과 관계없이 자름" }
      }
    },
    {
      id: "fm_02",
      text: "아이가 동그라미를 그릴 수 있나요?",
      category: "fine_motor",
      ageRange: "36-48개월", 
      materialsNeeded: ["종이", "크레용"],
      observationGuide: "아이에게 동그라미를 그려보라고 해보세요",
      scoringCriteria: {
        excellent: { score: 2, description: "닫힌 원형에 가까운 모양" },
        good: { score: 1, description: "원형 의도는 보이지만 불완전" },
        needsSupport: { score: 0, description: "원형과 거리가 먼 모양" }
      }
    }
  ],

  language: [
    {
      id: "lg_01",
      text: "아이가 '왜?', '언제?', '어디?' 등의 질문을 하나요?",
      category: "language",
      ageRange: "36-48개월",
      observationGuide: "평소 아이의 질문 패턴을 생각해보세요",
      scoringCriteria: {
        excellent: { score: 2, description: "하루에 5번 이상 다양한 질문" },
        good: { score: 1, description: "가끔 질문하지만 제한적" },
        needsSupport: { score: 0, description: "질문을 거의 하지 않음" }
      },
      clinicalSignificance: "48개월 언어발달 핵심 지표"
    },
    {
      id: "lg_02",
      text: "아이가 3-4개 단어로 문장을 만들 수 있나요?",
      category: "language",
      ageRange: "24-36개월",
      observationGuide: "예: '엄마 우유 주세요', '아빠 회사 갔어요'",
      scoringCriteria: {
        excellent: { score: 2, description: "4개 이상 단어로 완전한 문장" },
        good: { score: 1, description: "3개 단어로 간단한 문장" },
        needsSupport: { score: 0, description: "2개 단어 조합 수준" }
      }
    }
  ],

  social: [
    {
      id: "sc_01",
      text: "아이가 다른 아이들과 함께 놀이할 수 있나요?",
      category: "social",
      ageRange: "36-48개월",
      observationGuide: "협력놀이, 역할놀이 등 관찰",
      scoringCriteria: {
        excellent: { score: 2, description: "능동적으로 협력놀이 참여" },
        good: { score: 1, description: "옆에서 놀지만 상호작용 제한적" },
        needsSupport: { score: 0, description: "혼자 놀기를 선호" }
      }
    }
  ],

  cognitive: [
    {
      id: "cg_01",
      text: "아이가 색깔 3가지 이상을 구분할 수 있나요?",
      category: "cognitive",
      ageRange: "36-48개월",
      observationGuide: "빨강, 파랑, 노랑 등 기본 색깔 구분",
      scoringCriteria: {
        excellent: { score: 2, description: "5가지 이상 색깔 정확히 구분" },
        good: { score: 1, description: "3-4가지 색깔 구분" },
        needsSupport: { score: 0, description: "2가지 이하 색깔만 구분" }
      }
    }
  ]
};

// 아동청소년 게이미피케이션 테스트
export const childAssessmentGames: ChildAssessment = {
  attentionGames: [
    {
      name: "색깔 스트룹 테스트",
      description: "글자 색깔과 의미가 다를 때 빠르게 색깔 선택",
      duration: 12,
      measurement: ["반응시간", "정확도"],
      clinicalValue: "집중력, 억제조절 능력 평가",
      difficultyLevels: ["기본", "중급", "고급"]
    },
    {
      name: "작업기억 숫자게임", 
      description: "화면에 나타나는 숫자 순서를 거꾸로 기억",
      duration: 12,
      measurement: ["최대 기억 용량"],
      clinicalValue: "작업기억 능력 평가",
      ageNorms: {
        "6-7세": "평균 3자리",
        "8-9세": "평균 4자리", 
        "10-12세": "평균 5자리"
      }
    },
    {
      name: "시각 탐색 게임",
      description: "여러 자극 중에서 목표 자극 빠르게 찾기",
      duration: 12,
      measurement: ["탐색 시간", "정확도"],
      clinicalValue: "선택적 주의력 평가"
    }
  ],

  socialEmotional: [
    {
      name: "표정 인식 게임",
      description: "다양한 표정 사진을 보고 감정 맞추기", 
      duration: 12,
      measurement: ["정확도", "반응시간"],
      clinicalValue: "사회적 인지능력, 공감능력",
      difficultyLevels: ["기본표정", "미묘한표정", "복합감정"]
    },
    {
      name: "상황 판단 게임",
      description: "사회적 상황 카드를 보고 적절한 반응 선택",
      duration: 12, 
      measurement: ["사회적 판단력"],
      clinicalValue: "사회성 발달 평가"
    }
  ],

  cognitiveTests: [
    {
      name: "패턴 완성 게임",
      description: "규칙성 있는 패턴의 다음 요소 예측",
      duration: 12,
      measurement: ["논리적 사고력"],
      clinicalValue: "추상적 사고, 패턴 인식 능력"
    },
    {
      name: "도형 회전 게임",
      description: "3차원 도형을 회전시켜 같은 모양 찾기",
      duration: 12,
      measurement: ["공간지각력"],
      clinicalValue: "시공간 처리 능력 평가"
    }
  ]
};

// AIH 성인 마음건강 자가점검 (완전 창작형)
export const adultAssessmentQuestions: AdultAssessment = {
  emotionalWellnessCheck: [
    {
      id: "emo_01",
      text: "최근 일상의 작은 즐거움을 찾기가 어려웠습니까?",
      category: "emotional",
      ageRange: "성인",
      scoringCriteria: {
        excellent: { score: 0, description: "즐거움을 잘 찾음" },
        good: { score: 1, description: "가끔 어려움" },
        needsSupport: { score: 3, description: "자주 어려움" }
      },
      clinicalSignificance: "일상 만족도 평가"
    },
    {
      id: "emo_02", 
      text: "평소 관심 있던 활동이나 취미에 대한 열정이 줄어들었습니까?",
      category: "emotional",
      ageRange: "성인",
      scoringCriteria: {
        excellent: { score: 0, description: "열정 유지" },
        good: { score: 1, description: "약간 감소" },
        needsSupport: { score: 3, description: "많이 감소" }
      },
      clinicalSignificance: "활동 참여도 평가"
    },
    {
      id: "emo_03",
      text: "밤에 편안하게 잠들거나 깊은 잠을 자는 데 어려움이 있었습니까?",
      category: "emotional",
      ageRange: "성인",
      scoringCriteria: {
        excellent: { score: 0, description: "편안한 수면" },
        good: { score: 1, description: "가끔 수면 문제" },
        needsSupport: { score: 3, description: "자주 수면 문제" }
      },
      clinicalSignificance: "수면 패턴 평가"
    },
    {
      id: "emo_04",
      text: "하루를 시작할 때 충분한 활력과 에너지를 느끼고 계십니까?",
      category: "emotional",
      ageRange: "성인",
      scoringCriteria: {
        excellent: { score: 0, description: "활력 충만" },
        good: { score: 1, description: "보통 수준" },
        needsSupport: { score: 3, description: "활력 부족" }
      },
      clinicalSignificance: "일상 에너지 평가"
    }
  ],

  mindPeaceCheck: [
    {
      id: "peace_01",
      text: "마음의 평안함을 유지하면서 일상을 보내고 계신가요?",
      category: "emotional", 
      ageRange: "성인",
      scoringCriteria: {
        excellent: { score: 0, description: "평안함 유지" },
        good: { score: 1, description: "가끔 불안함" },
        needsSupport: { score: 3, description: "자주 불안함" }
      },
      clinicalSignificance: "마음 안정도 평가"
    },
    {
      id: "peace_02",
      text: "긴장되거나 스트레스를 받을 때 몸의 변화를 느끼시나요?",
      category: "emotional",
      ageRange: "성인", 
      scoringCriteria: {
        excellent: { score: 0, description: "변화 없음" },
        good: { score: 1, description: "가끔 느낌" },
        needsSupport: { score: 3, description: "자주 느낌" }
      },
      clinicalSignificance: "신체 반응 민감도 평가"
    },
    {
      id: "peace_03",
      text: "어떤 상황이든 자신감을 가지고 참여하고 계신가요?",
      category: "emotional",
      ageRange: "성인",
      scoringCriteria: {
        excellent: { score: 0, description: "자신감 있음" },
        good: { score: 1, description: "대부분 자신감" },
        needsSupport: { score: 3, description: "자신감 부족" }
      },
      clinicalSignificance: "상황 대처 능력 평가"
    },
    {
      id: "peace_04",
      text: "예상치 못한 상황에서도 마음의 균형을 유지할 수 있나요?",
      category: "emotional",
      ageRange: "성인",
      scoringCriteria: {
        excellent: { score: 0, description: "균형 유지" },
        good: { score: 1, description: "대부분 유지" },
        needsSupport: { score: 3, description: "균형 잃기 쉬움" }
      },
      clinicalSignificance: "정서 안정성 평가"
    }
  ],

  personalCharacteristics: [
    {
      id: "char_01",
      text: "다양한 경험과 새로운 도전을 통해 성장하고 싶어합니까?",
      category: "cognitive",
      ageRange: "성인",
      scoringCriteria: {
        excellent: { score: 2, description: "매우 그렇다" },
        good: { score: 1, description: "보통이다" },
        needsSupport: { score: 0, description: "그렇지 않다" }
      },
      clinicalSignificance: "성장 지향성 평가"
    },
    {
      id: "char_02",
      text: "목표를 향해 꾸준히 노력하며 단계적으로 접근하는 편입니까?",
      category: "cognitive",
      ageRange: "성인",
      scoringCriteria: {
        excellent: { score: 2, description: "매우 그렇다" },
        good: { score: 1, description: "보통이다" },
        needsSupport: { score: 0, description: "그렇지 않다" }
      },
      clinicalSignificance: "지속성 요인 평가"
    },
    {
      id: "char_03",
      text: "사람들과의 만남에서 에너지를 얻고 활력을 느끼는 편입니까?",
      category: "social",
      ageRange: "성인",
      scoringCriteria: {
        excellent: { score: 2, description: "매우 그렇다" },
        good: { score: 1, description: "보통이다" },
        needsSupport: { score: 0, description: "그렇지 않다" }
      },
      clinicalSignificance: "사회적 에너지 평가"
    }
  ],

  workplaceAdaptation: [
    {
      id: "work_01", 
      text: "직장에서의 대인관계가 만족스럽습니까?",
      category: "social",
      ageRange: "성인",
      scoringCriteria: {
        excellent: { score: 2, description: "매우 만족" },
        good: { score: 1, description: "보통" },
        needsSupport: { score: 0, description: "불만족" }
      },
      clinicalSignificance: "직장 적응도 평가"
    },
    {
      id: "work_02",
      text: "업무 스트레스를 적절히 관리할 수 있습니까?",
      category: "social",
      ageRange: "성인",
      scoringCriteria: {
        excellent: { score: 2, description: "잘 관리함" },
        good: { score: 1, description: "보통" },
        needsSupport: { score: 0, description: "관리 어려움" }
      },
      clinicalSignificance: "스트레스 대처능력 평가"
    },
    {
      id: "work_03",
      text: "현재 일에 대해 성취감을 느끼고 있습니까?",
      category: "social",
      ageRange: "성인",
      scoringCriteria: {
        excellent: { score: 2, description: "높은 성취감" },
        good: { score: 1, description: "보통" },
        needsSupport: { score: 0, description: "성취감 부족" }
      },
      clinicalSignificance: "직업 만족도 평가"
    },
    {
      id: "work_04",
      text: "직장 내에서 자신의 의견을 적절히 표현할 수 있습니까?",
      category: "social",
      ageRange: "성인",
      scoringCriteria: {
        excellent: { score: 2, description: "잘 표현함" },
        good: { score: 1, description: "보통" },
        needsSupport: { score: 0, description: "표현 어려움" }
      },
      clinicalSignificance: "자기표현능력 평가"
    }
  ]
};

// AIH 아동 집중력 관찰 체크리스트 (완전 창작형)
export const childFocusQuestions = [
  "아이가 좋아하는 활동에 충분히 몰입하여 참여합니다",
  "새로운 과제를 시작할 때 차근차근 접근하는 모습을 보입니다",
  "대화할 때 상대방의 말을 끝까지 들어줍니다",
  "시작한 일을 마무리까지 해내려고 노력합니다",
  "자신만의 방식으로 체계적으로 일을 정리합니다",
  "도전적인 과제에도 포기하지 않고 시도합니다",
  "필요한 도구나 준비물을 스스로 챙깁니다",
  "주변 상황을 파악하며 적절히 반응합니다",
  "일상의 약속이나 규칙을 기억하고 지킵니다",
  "앉아서 하는 활동에서 편안함을 느낍니다",
  "정해진 자리에서 활동을 지속할 수 있습니다",
  "실내에서 적절한 활동량을 조절합니다",
  "조용한 활동에도 즐겁게 참여합니다",
  "자신의 에너지를 상황에 맞게 조절합니다",
  "대화할 때 적절한 양으로 표현합니다",
  "상대방의 질문을 충분히 듣고 답변합니다",
  "차례와 순서를 지키며 기다릴 수 있습니다",
  "다른 사람과 조화롭게 어울려 활동합니다"
];

// AIH 성인 집중력 자가점검 (완전 창작형)
export const adultFocusQuestions = [
  "업무나 활동에서 꼼꼼함과 정확성을 추구합니다",
  "중요한 일에 충분한 시간과 에너지를 투자할 수 있습니다",
  "대화할 때 상대방에게 온전히 집중합니다",
  "계획한 일을 단계적으로 완수해 나갑니다",
  "업무나 활동을 나만의 시스템으로 정리합니다",
  "어려운 과제에도 끝까지 도전하는 편입니다",
  "필요한 자료나 도구를 미리 준비하고 관리합니다",
  "주변 환경의 변화를 인식하고 적절히 대응합니다",
  "중요한 약속이나 할 일을 기억하고 실행합니다",
  "책상에 앉아서 하는 일에 편안함을 느낍니다",
  "회의나 강의에서 자리를 지키며 참여합니다",
  "긴장되는 상황에서도 침착함을 유지합니다",
  "조용한 환경에서 집중하며 일할 수 있습니다",
  "자신의 활동량을 상황에 맞게 조절합니다",
  "말할 때 적절한 양과 속도를 유지합니다",
  "상대방의 이야기를 끝까지 들어줍니다",
  "회의나 토론에서 순서를 지키며 참여합니다",
  "동료들과 협력하여 조화롭게 일합니다"
];

// AIH 발달특성 선별체크 질문 (확장형 20문항 - 박사급 분석용)
export const developmentalScreeningQuestions = {
  child: [
    {
      text: "아이가 재미있는 것을 발견했을 때 다른 사람과 함께 보려고 하나요?",
      description: "공동 주의집중 능력 - 타인과 관심사를 공유하는 사회적 참조 행동",
      domain: "social_communication",
      clinicalSignificance: "자폐스펙트럼 조기 선별의 핵심 지표"
    },
    {
      text: "아이가 일상적인 놀이에서 창의적인 변화를 시도하나요?",
      description: "인지적 유연성과 상상력 - 고정된 패턴에서 벗어나 새로운 시도를 하는 능력",
      domain: "cognitive_flexibility",
      clinicalSignificance: "실행기능과 창의적 사고능력 평가"
    },
    {
      text: "아이가 새로운 환경에서도 비교적 편안하게 적응하나요?",
      description: "환경 적응성 - 익숙하지 않은 상황에서의 정서적 안정성과 탐색 행동",
      domain: "environmental_adaptation",
      clinicalSignificance: "불안장애 및 적응능력 평가"
    },
    {
      text: "아이가 다른 사람의 표정이나 감정을 알아차리고 반응하나요?",
      description: "정서 인식능력 - 타인의 비언어적 신호를 해석하고 적절히 반응하는 능력",
      domain: "emotional_intelligence",
      clinicalSignificance: "사회적 인지능력과 공감능력 평가"
    },
    {
      text: "아이가 친숙한 일상 루틴이 바뀔 때 유연하게 받아들이나요?",
      description: "변화 수용성 - 예측 가능한 패턴의 변화에 대한 적응 반응",
      domain: "change_tolerance",
      clinicalSignificance: "자폐스펙트럼의 경직성 및 강박적 특성 평가"
    },
    {
      text: "아이가 또래와 함께 있을 때 자연스럽게 상호작용하나요?",
      description: "사회적 상호작용 - 동년배와의 자발적이고 상호적인 교류 능력",
      domain: "peer_interaction",
      clinicalSignificance: "사회성 발달과 또래관계 형성능력 평가"
    },
    {
      text: "아이가 언어 이외의 방법(몸짓, 표정 등)으로도 의사소통하나요?",
      description: "비언어적 의사소통 - 제스처, 표정, 몸짓 등을 통한 소통 능력",
      domain: "nonverbal_communication",
      clinicalSignificance: "의사소통 장애 및 언어발달 평가"
    },
    {
      text: "아이가 하나의 활동에 적절한 시간 동안 집중할 수 있나요?",
      description: "주의지속 능력 - 연령에 적합한 시간 동안 과제나 활동에 몰입하는 능력",
      domain: "attention_span",
      clinicalSignificance: "ADHD 및 주의력결핍 평가"
    },
    {
      text: "아이가 자신의 감정을 적절한 방식으로 표현하나요?",
      description: "정서 표현능력 - 내적 감정 상태를 사회적으로 수용 가능한 방식으로 드러내는 능력",
      domain: "emotional_regulation",
      clinicalSignificance: "정서조절장애 및 행동문제 평가"
    },
    {
      text: "아이가 놀이 상황에서 순서를 지키거나 규칙을 따르나요?",
      description: "사회적 규칙 준수 - 집단 상황에서의 규범 이해와 준수 능력",
      domain: "rule_following",
      clinicalSignificance: "사회성 발달과 자기조절능력 평가"
    },
    {
      text: "아이가 특정 소리나 촉감에 과도하게 민감하거나 둔감하게 반응하나요?",
      description: "감각처리 이상 - 청각, 촉각 등 감각 자극에 대한 비정상적 반응 패턴",
      domain: "sensory_processing",
      clinicalSignificance: "감각처리장애 및 자폐스펙트럼 평가"
    },
    {
      text: "아이가 반복적인 행동이나 움직임을 자주 보이나요?",
      description: "상동행동 - 기능적 목적이 없는 반복적이고 고정화된 행동 패턴",
      domain: "repetitive_behavior",
      clinicalSignificance: "자폐스펙트럼 핵심 증상 평가"
    },
    {
      text: "아이가 자신만의 특별한 관심사에 과도하게 몰두하나요?",
      description: "제한된 관심 - 특정 주제나 활동에 대한 강박적이고 배타적인 집착",
      domain: "restricted_interests",
      clinicalSignificance: "자폐스펙트럼의 제한적 관심사 패턴 평가"
    },
    {
      text: "아이가 일상생활에서 도움이 필요한 일을 적절히 요청하나요?",
      description: "도움 요청 행동 - 필요시 타인에게 지원을 구하는 사회적 의사소통 능력",
      domain: "help_seeking",
      clinicalSignificance: "의사소통 장애 및 사회적 인지능력 평가"
    },
    {
      text: "아이가 예상과 다른 상황이 발생했을 때 심하게 당황하거나 화를 내나요?",
      description: "좌절 내성 - 기대와 현실의 불일치 상황에서의 정서조절 능력",
      domain: "frustration_tolerance",
      clinicalSignificance: "정서조절장애 및 적응능력 평가"
    },
    {
      text: "아이가 다른 사람의 관점이나 입장을 이해하려고 노력하나요?",
      description: "마음 이론 - 타인의 생각과 감정을 추론하고 이해하는 인지능력",
      domain: "theory_of_mind",
      clinicalSignificance: "사회적 인지능력과 공감능력 평가"
    },
    {
      text: "아이가 가상의 상황을 만들어 상상놀이를 즐기나요?",
      description: "상징놀이 능력 - 실제가 아닌 가상의 시나리오를 구성하고 즐기는 능력",
      domain: "symbolic_play",
      clinicalSignificance: "언어발달 및 추상적 사고능력 평가"
    },
    {
      text: "아이가 위험한 상황에서 적절한 주의나 경계심을 보이나요?",
      description: "위험 인식능력 - 잠재적 위험 상황을 감지하고 적절히 대응하는 능력",
      domain: "safety_awareness",
      clinicalSignificance: "판단력과 현실 인식능력 평가"
    },
    {
      text: "아이가 복잡한 지시사항을 단계별로 따라할 수 있나요?",
      description: "다단계 지시 수행 - 여러 단계로 구성된 과제를 순서대로 완수하는 능력",
      domain: "complex_instruction_following",
      clinicalSignificance: "실행기능과 작업기억 평가"
    },
    {
      text: "아이가 자신의 행동이 다른 사람에게 미치는 영향을 고려하나요?",
      description: "사회적 결과 예측 - 자신의 행동이 타인에게 미칠 영향을 사전에 추론하는 능력",
      domain: "social_consequence_awareness",
      clinicalSignificance: "사회적 인지능력과 도덕성 발달 평가"
    }
  ],
  child_extended: [
    {
      text: "아이가 자신만의 방식으로 감정을 표현하나요?",
      description: "기쁨, 화남, 슬픔 등을 말이나 행동으로 다양하게 나타내기",
      domain: "emotional_expression",
      clinicalSignificance: "정서 표현 및 조절 능력 평가"
    },
    {
      text: "아이가 또래 친구들과의 상호작용을 즐거워하나요?",
      description: "함께 놀기, 순서 지키기, 간단한 협력놀이 등",
      domain: "peer_interaction",
      clinicalSignificance: "사회적 발달 및 또래관계 형성 평가"
    },
    {
      text: "아이가 예상과 다른 상황에서도 적응하려고 노력하나요?",
      description: "계획이 바뀌거나 새로운 환경에서 시간을 두고 적응하려는 모습",
      domain: "adaptability",
      clinicalSignificance: "환경 적응성 및 유연성 평가"
    },
    {
      text: "아이가 다양한 소리와 촉감에 대해 자연스럽게 반응하나요?",
      description: "새로운 소리나 재질에 대해 과도하게 민감하거나 둔감하지 않음",
      domain: "sensory_processing",
      clinicalSignificance: "감각처리 및 조절 능력 평가"
    },
    {
      text: "아이가 대화할 때 자연스럽게 눈을 마주치나요?",
      description: "이야기하거나 들을 때 적절한 시선 교환",
      domain: "eye_contact",
      clinicalSignificance: "사회적 의사소통 능력 평가"
    },
    {
      text: "아이가 일상 활동에서 유연성을 보이나요?",
      description: "한 가지 방법이 안 되면 다른 방법을 시도해보려는 모습",
      domain: "cognitive_flexibility",
      clinicalSignificance: "문제해결 능력 및 인지적 유연성 평가"
    },
    {
      text: "아이가 자신의 관심사를 다른 사람과 나누려고 하나요?",
      description: "좋아하는 것에 대해 설명하거나 보여주려는 시도",
      domain: "interest_sharing",
      clinicalSignificance: "사회적 참조 및 공유주의 평가"
    },
    {
      text: "아이가 주변 환경의 작은 변화도 잘 알아차리나요?",
      description: "새로운 물건이나 배치 변화 등을 민감하게 감지",
      domain: "detail_attention",
      clinicalSignificance: "주의력 및 세부사항 처리 능력 평가"
    },
    {
      text: "아이가 자신만의 특별한 관심 분야가 있나요?",
      description: "특정 주제나 활동에 깊은 관심과 지식을 보임",
      domain: "special_interests",
      clinicalSignificance: "제한적 관심사 패턴 평가"
    },
    {
      text: "아이가 일정한 패턴이나 순서를 선호하나요?",
      description: "정해진 루틴이나 방식을 따르는 것을 편안해함",
      domain: "routine_preference",
      clinicalSignificance: "반복행동 및 의식행동 평가"
    }
  ],
  adult: [
    {
      text: "대화에서 상대방의 미묘한 감정 변화를 파악하기 어려우신가요?",
      description: "표정이나 말투의 변화로 상대방 기분을 읽는 것",
      domain: "emotion_recognition",
      clinicalSignificance: "사회적 인지능력 및 정서 인식 평가"
    },
    {
      text: "사회적 모임에서 적절한 대화 시점을 찾기 어려우신가요?",
      description: "언제 말을 시작하고 끝낼지, 주제를 바꿀지 판단하는 것",
      domain: "conversation_timing",
      clinicalSignificance: "사회적 의사소통 기술 평가"
    },
    {
      text: "일상의 예상치 못한 변화에 대해 강한 스트레스를 느끼시나요?",
      description: "갑작스러운 일정 변경이나 환경 변화에 대한 반응",
      domain: "change_adaptation",
      clinicalSignificance: "변화 적응성 및 스트레스 반응 평가"
    },
    {
      text: "특정 감각(소리, 빛, 촉감)에 대해 다른 사람보다 민감하신가요?",
      description: "일상에서 특정 자극을 피하거나 불편해하는 정도",
      domain: "sensory_sensitivity",
      clinicalSignificance: "감각처리 민감성 및 과민반응 평가"
    },
    {
      text: "자신만의 체계적인 방법이나 순서를 매우 중요하게 여기시나요?",
      description: "일하거나 생활할 때 정해진 방식을 고수하는 성향",
      domain: "systematic_approach",
      clinicalSignificance: "강박적 특성 및 의식행동 평가"
    },
    {
      text: "처음 만나는 사람과의 자연스러운 대화가 어려우신가요?",
      description: "아이스브레이킹이나 가벼운 일상 대화의 어려움",
      domain: "social_initiation",
      clinicalSignificance: "사회적 개시능력 및 대인관계 형성 평가"
    },
    {
      text: "농담이나 은유적 표현의 의도를 파악하기 어려우신가요?",
      description: "문자 그대로 해석하거나 숨은 의미를 놓치는 경우",
      domain: "figurative_language",
      clinicalSignificance: "언어 이해력 및 사회적 맥락 파악 평가"
    },
    {
      text: "특정 분야나 주제에 대해 매우 깊이 있는 지식을 갖고 계신가요?",
      description: "한 분야에 대한 전문가 수준의 관심과 지식",
      domain: "specialized_knowledge",
      clinicalSignificance: "특수한 관심사 및 인지적 강점 평가"
    },
    {
      text: "새로운 환경이나 사람들과의 만남에서 불안감을 느끼시나요?",
      description: "익숙하지 않은 상황에 대한 선호도와 적응",
      domain: "social_anxiety",
      clinicalSignificance: "사회불안 및 새로운 상황 적응 평가"
    },
    {
      text: "다른 사람들의 사회적 신호나 분위기를 읽기 어려우신가요?",
      description: "그룹 내 분위기나 비언어적 메시지 파악",
      domain: "social_cues",
      clinicalSignificance: "사회적 상황 인식 및 비언어적 소통 평가"
    }
  ]
};