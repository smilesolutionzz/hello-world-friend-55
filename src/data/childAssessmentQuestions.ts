// 아동청소년 발달평가 질문 (단순화된 버전)
export const childAssessmentQuestions = {
  // 주의집중력 영역
  attention: [
    {
      id: "att_01",
      text: "아이가 좋아하는 활동(게임, TV 시청 등)에 30분 이상 집중할 수 있나요?",
      category: "attention",
      ageRange: "6-12세",
      scoringCriteria: {
        excellent: { score: 3, description: "1시간 이상 집중 가능" },
        good: { score: 2, description: "30분-1시간 집중" },
        fair: { score: 1, description: "15-30분 집중" },
        poor: { score: 0, description: "15분 미만" }
      }
    },
    {
      id: "att_02", 
      text: "수업 시간에 선생님 말씀을 끝까지 듣고 따라할 수 있나요?",
      category: "attention",
      ageRange: "6-12세",
      scoringCriteria: {
        excellent: { score: 3, description: "항상 잘 따라함" },
        good: { score: 2, description: "대부분 잘 따라함" },
        fair: { score: 1, description: "가끔 놓침" },
        poor: { score: 0, description: "자주 놓치거나 딴짓함" }
      }
    },
    {
      id: "att_03",
      text: "숙제나 과제를 끝까지 마무리할 수 있나요?",
      category: "attention",
      ageRange: "6-12세",
      scoringCriteria: {
        excellent: { score: 3, description: "항상 스스로 완성" },
        good: { score: 2, description: "약간의 도움으로 완성" },
        fair: { score: 1, description: "상당한 도움 필요" },
        poor: { score: 0, description: "완성하기 어려워함" }
      }
    }
  ],

  // 기억력 영역
  memory: [
    {
      id: "mem_01",
      text: "3-4개의 심부름을 순서대로 기억하고 실행할 수 있나요?",
      category: "memory",
      ageRange: "6-12세",
      example: "예: '방에 가서 책을 가져오고, 신발을 정리하고, 물을 마셔라'",
      scoringCriteria: {
        excellent: { score: 3, description: "4개 이상 순서대로 실행" },
        good: { score: 2, description: "3개 정도 실행" },
        fair: { score: 1, description: "2개 정도 실행" },
        poor: { score: 0, description: "1개도 기억하기 어려움" }
      }
    },
    {
      id: "mem_02",
      text: "어제 있었던 일을 구체적으로 설명할 수 있나요?",
      category: "memory",
      ageRange: "6-12세",
      scoringCriteria: {
        excellent: { score: 3, description: "시간 순서대로 자세히 설명" },
        good: { score: 2, description: "주요 내용을 설명" },
        fair: { score: 1, description: "단편적으로 기억" },
        poor: { score: 0, description: "거의 기억하지 못함" }
      }
    },
    {
      id: "mem_03",
      text: "친구들이나 가족의 생일, 전화번호 등을 기억하나요?",
      category: "memory",
      ageRange: "6-12세",
      scoringCriteria: {
        excellent: { score: 3, description: "여러 개 정확히 기억" },
        good: { score: 2, description: "2-3개 기억" },
        fair: { score: 1, description: "1-2개 기억" },
        poor: { score: 0, description: "거의 기억하지 못함" }
      }
    }
  ],

  // 사회성 영역
  social: [
    {
      id: "soc_01",
      text: "친구들과 함께 놀면서 규칙을 지키고 협력할 수 있나요?",
      category: "social",
      ageRange: "6-12세",
      scoringCriteria: {
        excellent: { score: 3, description: "항상 잘 협력하고 규칙 준수" },
        good: { score: 2, description: "대부분 잘 협력함" },
        fair: { score: 1, description: "가끔 갈등하지만 해결" },
        poor: { score: 0, description: "자주 갈등하거나 혼자 놀기 선호" }
      }
    },
    {
      id: "soc_02",
      text: "다른 사람의 감정을 알아차리고 공감할 수 있나요?",
      category: "social",
      ageRange: "6-12세",
      example: "친구가 슬퍼하면 위로해주거나, 화내면 이유를 물어보는 등",
      scoringCriteria: {
        excellent: { score: 3, description: "감정을 잘 읽고 적절히 반응" },
        good: { score: 2, description: "감정을 어느 정도 알아챔" },
        fair: { score: 1, description: "명확한 감정만 알아챔" },
        poor: { score: 0, description: "타인의 감정에 무관심" }
      }
    },
    {
      id: "soc_03",
      text: "새로운 환경이나 사람들과 만날 때 적응을 잘 하나요?",
      category: "social",
      ageRange: "6-12세",
      scoringCriteria: {
        excellent: { score: 3, description: "빠르게 적응하고 어울림" },
        good: { score: 2, description: "시간이 걸리지만 적응" },
        fair: { score: 1, description: "상당한 시간과 도움 필요" },
        poor: { score: 0, description: "적응하기 매우 어려워함" }
      }
    }
  ],

  // 언어발달 영역
  language: [
    {
      id: "lang_01",
      text: "자신의 생각이나 경험을 논리적으로 설명할 수 있나요?",
      category: "language",
      ageRange: "6-12세",
      scoringCriteria: {
        excellent: { score: 3, description: "시간 순서대로 자세히 설명" },
        good: { score: 2, description: "주요 내용을 순서대로 설명" },
        fair: { score: 1, description: "단편적이지만 이해 가능" },
        poor: { score: 0, description: "설명이 어렵거나 불명확" }
      }
    },
    {
      id: "lang_02",
      text: "책을 읽고 내용을 이해하며 질문에 답할 수 있나요?",
      category: "language",
      ageRange: "6-12세",
      scoringCriteria: {
        excellent: { score: 3, description: "연령에 맞는 책을 완전히 이해" },
        good: { score: 2, description: "대부분의 내용 이해" },
        fair: { score: 1, description: "쉬운 내용만 이해" },
        poor: { score: 0, description: "이해하기 어려워함" }
      }
    },
    {
      id: "lang_03",
      text: "복잡한 지시사항을 듣고 이해할 수 있나요?",
      category: "language",
      ageRange: "6-12세",
      example: "예: '숙제를 마친 후에 책을 정리하고, 그 다음에 저녁을 먹으러 오세요'",
      scoringCriteria: {
        excellent: { score: 3, description: "복잡한 지시사항도 완전히 이해" },
        good: { score: 2, description: "대부분의 지시사항 이해" },
        fair: { score: 1, description: "간단한 지시사항만 이해" },
        poor: { score: 0, description: "지시사항 이해에 어려움" }
      }
    }
  ],

  // 학습능력 영역
  learning: [
    {
      id: "learn_01",
      text: "새로운 것을 배울 때 흥미를 보이고 적극적으로 참여하나요?",
      category: "learning",
      ageRange: "6-12세",
      scoringCriteria: {
        excellent: { score: 3, description: "매우 적극적이고 호기심 많음" },
        good: { score: 2, description: "관심 있는 것에 적극적" },
        fair: { score: 1, description: "격려하면 참여함" },
        poor: { score: 0, description: "새로운 것을 회피하는 경향" }
      }
    },
    {
      id: "learn_02",
      text: "실수했을 때 포기하지 않고 다시 시도하나요?",
      category: "learning",
      ageRange: "6-12세",
      scoringCriteria: {
        excellent: { score: 3, description: "실수를 배움의 기회로 여김" },
        good: { score: 2, description: "격려하면 다시 시도" },
        fair: { score: 1, description: "도움이 있으면 재시도" },
        poor: { score: 0, description: "쉽게 포기하는 경향" }
      }
    },
    {
      id: "learn_03",
      text: "학교 과제나 숙제를 계획적으로 수행할 수 있나요?",
      category: "learning",
      ageRange: "6-12세",
      scoringCriteria: {
        excellent: { score: 3, description: "스스로 계획하고 실행" },
        good: { score: 2, description: "약간의 도움으로 계획 실행" },
        fair: { score: 1, description: "상당한 도움 필요" },
        poor: { score: 0, description: "계획적 수행이 어려움" }
      }
    }
  ]
};

export const getCategoryDisplayName = (category: string) => {
  const names = {
    attention: "주의집중력",
    memory: "기억력", 
    social: "사회성",
    language: "언어발달",
    learning: "학습능력"
  };
  return names[category as keyof typeof names] || category;
};

export const getCategoryDescription = (category: string) => {
  const descriptions = {
    attention: "아이의 집중력과 주의 지속 능력을 평가합니다",
    memory: "단기 기억력과 장기 기억력을 평가합니다",
    social: "타인과의 관계 형성과 사회적 상황 적응력을 평가합니다", 
    language: "언어 이해력과 표현력을 평가합니다",
    learning: "새로운 정보 습득과 문제 해결 능력을 평가합니다"
  };
  return descriptions[category as keyof typeof descriptions] || "";
};