import { InfantAssessment, ChildAssessment, AdultAssessment, AssessmentGame } from '@/types/assessment';

// 영유아 발달검사 문항 (K-ASQ 기반)
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

// 성인 임상급 심리평가 (15개 문항)
export const adultAssessmentQuestions: AdultAssessment = {
  depressionScreening: [
    {
      id: "dep_01",
      text: "지난 2주간, 거의 매일 우울하거나 절망적이라고 느꼈습니까?",
      category: "emotional",
      ageRange: "성인",
      scoringCriteria: {
        excellent: { score: 0, description: "전혀 그렇지 않다" },
        good: { score: 1, description: "며칠 동안" },
        needsSupport: { score: 3, description: "거의 매일" }
      },
      clinicalSignificance: "주요우울장애 핵심증상 A1"
    },
    {
      id: "dep_02", 
      text: "지난 2주간, 평소 좋아하던 활동에 대한 흥미나 즐거움이 현저히 떨어졌습니까?",
      category: "emotional",
      ageRange: "성인",
      scoringCriteria: {
        excellent: { score: 0, description: "변화 없음" },
        good: { score: 1, description: "약간 감소" },
        needsSupport: { score: 3, description: "현저히 감소" }
      },
      clinicalSignificance: "무쾌감증 평가"
    },
    {
      id: "dep_03",
      text: "지난 2주간, 잠들기 어렵거나 자주 깨는 등 수면 문제가 있었습니까?",
      category: "emotional",
      ageRange: "성인",
      scoringCriteria: {
        excellent: { score: 0, description: "수면 문제 없음" },
        good: { score: 1, description: "가끔 수면 문제" },
        needsSupport: { score: 3, description: "심각한 수면 문제" }
      },
      clinicalSignificance: "우울증 부수 증상"
    },
    {
      id: "dep_04",
      text: "지난 2주간, 평소보다 피로감을 많이 느끼거나 에너지가 부족했습니까?",
      category: "emotional",
      ageRange: "성인",
      scoringCriteria: {
        excellent: { score: 0, description: "에너지 충분" },
        good: { score: 1, description: "약간 피로감" },
        needsSupport: { score: 3, description: "심한 피로감" }
      },
      clinicalSignificance: "우울증 신체증상"
    }
  ],

  anxietyAssessment: [
    {
      id: "anx_01",
      text: "불안이나 걱정 때문에 일상생활에 지장이 있었습니까?",
      category: "emotional", 
      ageRange: "성인",
      scoringCriteria: {
        excellent: { score: 0, description: "지장 없음" },
        good: { score: 1, description: "약간의 지장" },
        needsSupport: { score: 3, description: "심각한 지장" }
      },
      clinicalSignificance: "기능 손상 정도 평가"
    },
    {
      id: "anx_02",
      text: "심장이 두근거리거나 식은땀이 나는 등의 신체 증상이 있었습니까?",
      category: "emotional",
      ageRange: "성인", 
      scoringCriteria: {
        excellent: { score: 0, description: "증상 없음" },
        good: { score: 1, description: "가끔 있음" },
        needsSupport: { score: 3, description: "자주 있음" }
      },
      clinicalSignificance: "불안의 신체적 증상 평가"
    },
    {
      id: "anx_03",
      text: "특정 상황이나 장소를 피하게 되는 경우가 있었습니까?",
      category: "emotional",
      ageRange: "성인",
      scoringCriteria: {
        excellent: { score: 0, description: "회피 없음" },
        good: { score: 1, description: "가끔 회피" },
        needsSupport: { score: 3, description: "자주 회피" }
      },
      clinicalSignificance: "회피 행동 패턴 평가"
    },
    {
      id: "anx_04",
      text: "갑작스럽게 극심한 불안이나 공포감을 느낀 적이 있었습니까?",
      category: "emotional",
      ageRange: "성인",
      scoringCriteria: {
        excellent: { score: 0, description: "전혀 없음" },
        good: { score: 1, description: "가끔 있음" },
        needsSupport: { score: 3, description: "자주 있음" }
      },
      clinicalSignificance: "공황발작 선별"
    }
  ],

  personalityFactors: [
    {
      id: "per_01",
      text: "새로운 경험이나 활동을 즐기는 편입니까?",
      category: "cognitive",
      ageRange: "성인",
      scoringCriteria: {
        excellent: { score: 2, description: "매우 그렇다" },
        good: { score: 1, description: "보통이다" },
        needsSupport: { score: 0, description: "그렇지 않다" }
      },
      clinicalSignificance: "개방성 요인 평가"
    },
    {
      id: "per_02",
      text: "계획을 세우고 체계적으로 일을 처리하는 편입니까?",
      category: "cognitive",
      ageRange: "성인",
      scoringCriteria: {
        excellent: { score: 2, description: "매우 그렇다" },
        good: { score: 1, description: "보통이다" },
        needsSupport: { score: 0, description: "그렇지 않다" }
      },
      clinicalSignificance: "성실성 요인 평가"
    },
    {
      id: "per_03",
      text: "다른 사람들과 어울리기를 좋아하고 사교적인 편입니까?",
      category: "social",
      ageRange: "성인",
      scoringCriteria: {
        excellent: { score: 2, description: "매우 그렇다" },
        good: { score: 1, description: "보통이다" },
        needsSupport: { score: 0, description: "그렇지 않다" }
      },
      clinicalSignificance: "외향성 요인 평가"
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

// 주의집중력 자가체크 질문 (아동청소년용)
export const childAdhdQuestions = [
  "아이가 세심한 주의를 기울이지 못하거나 학습, 과제, 기타 활동에서 부주의한 실수를 자주 한다",
  "과제나 놀이 활동에서 지속적으로 주의를 집중하는데 어려움이 있다",
  "직접 말을 걸어도 듣지 않는 것처럼 보인다",
  "지시를 완수하지 못하고 학업, 잡일 또는 직장에서의 의무를 수행하지 못한다",
  "과제와 활동을 체계화하는데 어려움이 있다",
  "지속적인 정신적 노력을 요구하는 과제에 참여하기를 피하거나 싫어하거나 꺼린다",
  "과제나 활동에 필요한 물건들을 잃어버린다",
  "외부 자극에 의해 쉽게 산만해진다",
  "일상적인 활동을 잊어버린다",
  "손발을 가만히 두지 못하거나 의자에 앉아서도 몸을 꼼지락거린다",
  "자리에 앉아 있어야 하는 상황에서 자리를 떠난다",
  "부적절한 상황에서 뛰어다니거나 기어오른다",
  "여가 활동이나 놀이에 조용히 참여하는데 어려움이 있다",
  "'끊임없이 활동하거나' '마치 모터가 달린 것처럼' 행동한다",
  "지나치게 수다스럽다",
  "질문이 끝나기 전에 성급하게 대답한다",
  "자신의 차례를 기다리는데 어려움이 있다",
  "다른 사람을 방해하고 간섭한다"
];

// 주의집중력 자가체크 질문 (성인용)
export const adultAdhdQuestions = [
  "과제나 활동 중 세부사항에 주의를 기울이지 못하거나 부주의한 실수를 자주 한다",
  "과제나 활동에서 지속적으로 주의를 집중하는데 어려움이 있다",
  "직접 말을 걸어도 듣지 않는 것처럼 보인다",
  "지시를 완수하지 못하고 일, 집안일 또는 직장에서의 의무를 수행하지 못한다",
  "과제와 활동을 체계화하는데 어려움이 있다",
  "지속적인 정신적 노력을 요구하는 과제에 참여하기를 피하거나 싫어하거나 꺼린다",
  "과제나 활동에 필요한 물건들을 잃어버린다",
  "외부 자극에 의해 쉽게 산만해진다",
  "일상적인 활동에서 건망증을 보인다",
  "손발을 가만히 두지 못하거나 의자에 앉아서도 몸을 꼼지락거린다",
  "자리에 앉아 있어야 하는 상황에서 자리를 떠난다",
  "부적절한 상황에서 안절부절못하거나 초조함을 느낀다",
  "여가 활동에 조용히 참여하는데 어려움이 있다",
  "'끊임없이 활동하거나' '마치 모터가 달린 것처럼' 행동한다",
  "지나치게 수다스럽다",
  "질문이 끝나기 전에 성급하게 대답한다",
  "자신의 차례를 기다리는데 어려움이 있다",
  "다른 사람을 방해하고 간섭한다"
];

// 자폐스펙트럼 선별검사 질문
export const autismScreeningQuestions = {
  child: [
    {
      text: "아이가 다른 사람의 손가락이 가리키는 곳을 쳐다보나요?",
      description: "예: 부모가 멀리 있는 장난감이나 동물을 가리킬 때"
    },
    {
      text: "아이가 혼자 상상놀이를 하나요?",
      description: "예: 인형에게 밥 먹이기, 전화 걸기 흉내 등"
    },
    {
      text: "아이가 관심을 끌기 위해 물건을 가져와서 보여주나요?",
      description: "예: '엄마 이것 봐' 하면서 장난감을 가져오기"
    },
    {
      text: "아이가 다른 아이들에게 관심을 보이나요?",
      description: "예: 다른 아이들이 놀고 있으면 가까이 가려고 하기"
    },
    {
      text: "아이가 이름을 부르면 반응하나요?",
      description: "다른 일에 집중하고 있어도 이름을 부르면 돌아보기"
    },
    {
      text: "아이가 웃거나 울 때 이유가 있나요?",
      description: "상황에 맞게 감정을 표현하는지"
    },
    {
      text: "아이가 눈맞춤을 잘 하나요?",
      description: "대화할 때나 놀 때 자연스럽게 눈을 마주치기"
    },
    {
      text: "아이가 소리에 과민하거나 둔감한 반응을 보이나요?",
      description: "큰 소리에 과도하게 놀라거나 반대로 무반응"
    },
    {
      text: "아이가 반복적인 행동을 자주 하나요?",
      description: "예: 손 흔들기, 뱅뱅 돌기, 줄 세우기 등"
    },
    {
      text: "아이가 변화에 대해 극도로 저항하나요?",
      description: "일상 루틴이 바뀔 때 심하게 화내거나 울기"
    },
    {
      text: "아이가 특정 질감이나 촉감을 매우 싫어하나요?",
      description: "예: 모래, 점토, 특정 옷감 등을 극도로 피하기"
    },
    {
      text: "아이가 특정 관심사에 지나치게 몰두하나요?",
      description: "예: 기차, 숫자, 글자 등에만 과도한 관심"
    }
  ],
  adult: [
    {
      text: "사회적 상황에서 대화를 이어가는 것이 어렵다고 느끼시나요?",
      description: "상대방의 반응을 파악하고 적절히 대응하는 것"
    },
    {
      text: "다른 사람의 표정이나 몸짓을 이해하기 어려우신가요?",
      description: "비언어적 의사소통의 의미 파악"
    },
    {
      text: "일상의 작은 변화에도 스트레스를 많이 받으시나요?",
      description: "계획이 바뀌거나 예상과 다른 상황"
    },
    {
      text: "특정 소리나 촉감, 냄새에 매우 민감하신가요?",
      description: "일상생활에 지장을 줄 정도의 감각 민감성"
    },
    {
      text: "반복적인 행동이나 습관에 의존하는 경향이 있으신가요?",
      description: "특정 순서나 방식을 고집하는 행동"
    },
    {
      text: "눈맞춤을 유지하는 것이 불편하거나 어렵다고 느끼시나요?",
      description: "대화 중 자연스러운 시선 교류의 어려움"
    },
    {
      text: "농담이나 비유적 표현을 이해하기 어려우신가요?",
      description: "말의 숨은 의미나 사회적 암시 파악"
    },
    {
      text: "특정 주제나 활동에 지나치게 집중하는 편이신가요?",
      description: "한 가지에 몰두하면 다른 것은 신경 쓰지 못함"
    },
    {
      text: "새로운 환경이나 사람들과의 만남에서 불안을 느끼시나요?",
      description: "예측 가능한 환경을 선호하는 성향"
    },
    {
      text: "다른 사람의 감정이나 의도를 파악하기 어려우신가요?",
      description: "상대방의 기분이나 생각을 읽는 것"
    }
  ]
};