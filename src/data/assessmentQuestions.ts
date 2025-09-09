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
