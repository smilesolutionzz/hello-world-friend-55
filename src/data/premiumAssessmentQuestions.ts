// 구독자용 심화 심리검사 데이터

// 1. 마음성향 분석검사 (4차원 성격 유형 분석)
export const personalityTypeAssessmentQuestions = {
  extraversion: [
    {
      id: "jtci_e01",
      text: "새로운 사람들과 만나는 자리에서 에너지를 얻는 편입니다",
      category: "extraversion",
      reverse: false,
      weight: 1.2
    },
    {
      id: "jtci_e02", 
      text: "혼자 있는 시간이 많으면 답답함을 느낍니다",
      category: "extraversion",
      reverse: false,
      weight: 1.0
    },
    {
      id: "jtci_e03",
      text: "생각을 말로 표현하면서 정리하는 편입니다",
      category: "extraversion", 
      reverse: false,
      weight: 1.1
    },
    {
      id: "jtci_e04",
      text: "조용한 환경보다는 활기찬 환경을 선호합니다",
      category: "extraversion",
      reverse: false,
      weight: 1.0
    }
  ],
  sensing: [
    {
      id: "jtci_s01",
      text: "구체적이고 실질적인 정보를 중요하게 생각합니다",
      category: "sensing",
      reverse: false,
      weight: 1.3
    },
    {
      id: "jtci_s02",
      text: "현재 상황에 집중하는 것이 미래 계획보다 중요합니다",
      category: "sensing",
      reverse: false,
      weight: 1.1
    },
    {
      id: "jtci_s03",
      text: "세부사항에 주의를 기울이며 꼼꼼히 확인합니다",
      category: "sensing",
      reverse: false,
      weight: 1.2
    },
    {
      id: "jtci_s04", 
      text: "경험과 사실에 근거해서 판단하는 편입니다",
      category: "sensing",
      reverse: false,
      weight: 1.2
    }
  ],
  thinking: [
    {
      id: "jtci_t01",
      text: "논리적 일관성을 중요하게 생각합니다",
      category: "thinking",
      reverse: false,
      weight: 1.4
    },
    {
      id: "jtci_t02",
      text: "결정할 때 객관적 기준을 우선시합니다",
      category: "thinking", 
      reverse: false,
      weight: 1.3
    },
    {
      id: "jtci_t03",
      text: "개인적 감정보다는 원칙을 중시합니다",
      category: "thinking",
      reverse: false,
      weight: 1.2
    },
    {
      id: "jtci_t04",
      text: "문제를 분석적으로 접근하는 것을 선호합니다",
      category: "thinking",
      reverse: false,
      weight: 1.1
    }
  ],
  judging: [
    {
      id: "jtci_j01",
      text: "미리 계획을 세우고 체계적으로 일을 진행합니다",
      category: "judging",
      reverse: false,
      weight: 1.3
    },
    {
      id: "jtci_j02",
      text: "마감시한을 잘 지키며 시간 관리를 중요시합니다",
      category: "judging",
      reverse: false,
      weight: 1.2
    },
    {
      id: "jtci_j03",
      text: "결정을 빨리 내리고 실행에 옮기는 편입니다",
      category: "judging",
      reverse: false,
      weight: 1.1
    },
    {
      id: "jtci_j04",
      text: "정해진 규칙과 절차를 따르는 것이 중요합니다",
      category: "judging",
      reverse: false,
      weight: 1.0
    }
  ]
};

// 2. 타고난 기질 분석검사 (선천적 성향 측정)
export const temperamentAssessmentQuestions = {
  novelty_seeking: [
    {
      id: "tci_ns01",
      text: "새로운 장소나 활동을 시도하는 것을 좋아합니다",
      category: "novelty_seeking",
      subcategory: "exploratory_excitability"
    },
    {
      id: "tci_ns02",
      text: "단조로운 일상에 금방 지루함을 느낍니다",
      category: "novelty_seeking", 
      subcategory: "exploratory_excitability"
    },
    {
      id: "tci_ns03",
      text: "즉흥적으로 결정을 내리는 경우가 많습니다",
      category: "novelty_seeking",
      subcategory: "impulsiveness"
    },
    {
      id: "tci_ns04",
      text: "모험적이고 스릴 있는 활동을 선호합니다",
      category: "novelty_seeking",
      subcategory: "impulsiveness"
    }
  ],
  harm_avoidance: [
    {
      id: "tci_ha01",
      text: "위험한 상황을 미리 예상하고 조심합니다",
      category: "harm_avoidance",
      subcategory: "anticipatory_worry"
    },
    {
      id: "tci_ha02",
      text: "낯선 사람들과 있을 때 긴장됩니다",
      category: "harm_avoidance",
      subcategory: "fear_of_uncertainty"
    },
    {
      id: "tci_ha03",
      text: "실패에 대한 두려움이 큽니다",
      category: "harm_avoidance",
      subcategory: "anticipatory_worry"
    },
    {
      id: "tci_ha04",
      text: "피로하면 쉽게 지치고 회복이 느립니다",
      category: "harm_avoidance",
      subcategory: "fatigability"
    }
  ],
  reward_dependence: [
    {
      id: "tci_rd01",
      text: "다른 사람들의 인정과 칭찬이 중요합니다",
      category: "reward_dependence",
      subcategory: "social_attachment"
    },
    {
      id: "tci_rd02",
      text: "타인의 감정에 민감하게 반응합니다",
      category: "reward_dependence",
      subcategory: "sentimentality"
    },
    {
      id: "tci_rd03",
      text: "친밀한 관계를 유지하는 것이 매우 중요합니다",
      category: "reward_dependence",
      subcategory: "social_attachment"
    },
    {
      id: "tci_rd04",
      text: "다른 사람을 도와주는 일에서 만족감을 느낍니다",
      category: "reward_dependence",
      subcategory: "dependence"
    }
  ],
  persistence: [
    {
      id: "tci_p01",
      text: "어려운 과제도 끝까지 해내려고 합니다",
      category: "persistence",
      subcategory: "eagerness_of_effort"
    },
    {
      id: "tci_p02",
      text: "목표를 위해 피로나 좌절을 견딜 수 있습니다",
      category: "persistence",
      subcategory: "work_hardened"
    },
    {
      id: "tci_p03",
      text: "완벽하게 하기 위해 계속 노력합니다",
      category: "persistence",
      subcategory: "perfectionist"
    },
    {
      id: "tci_p04",
      text: "한번 시작한 일은 반드시 마무리합니다",
      category: "persistence",
      subcategory: "eagerness_of_effort"
    }
  ]
};

// 3. 브레인케어 인지능력 검사 (종합 인지기능 평가)
export const cognitiveAssessmentQuestions = {
  memory: [
    {
      id: "elderly_mem01",
      text: "어제 먹은 식사 메뉴를 기억하는 데 어려움이 있습니다",
      category: "memory",
      subcategory: "recent_memory",
      severity_indicator: "mild"
    },
    {
      id: "elderly_mem02",
      text: "가족이나 친구들의 이름을 기억하기 어려울 때가 있습니다",
      category: "memory",
      subcategory: "semantic_memory", 
      severity_indicator: "moderate"
    },
    {
      id: "elderly_mem03",
      text: "약속 시간이나 중요한 일정을 자주 잊습니다",
      category: "memory",
      subcategory: "prospective_memory",
      severity_indicator: "mild"
    },
    {
      id: "elderly_mem04",
      text: "물건을 어디에 두었는지 자주 기억하지 못합니다",
      category: "memory",
      subcategory: "spatial_memory",
      severity_indicator: "mild"
    }
  ],
  attention: [
    {
      id: "elderly_att01",
      text: "TV 프로그램이나 책을 끝까지 집중해서 보기 어렵습니다",
      category: "attention",
      subcategory: "sustained_attention",
      severity_indicator: "mild"
    },
    {
      id: "elderly_att02", 
      text: "여러 가지 일을 동시에 하는 것이 예전보다 어려워졌습니다",
      category: "attention",
      subcategory: "divided_attention",
      severity_indicator: "moderate"
    },
    {
      id: "elderly_att03",
      text: "대화 중에 다른 곳으로 주의가 쉽게 분산됩니다",
      category: "attention",
      subcategory: "selective_attention",
      severity_indicator: "mild"
    }
  ],
  executive: [
    {
      id: "elderly_exec01",
      text: "복잡한 문제를 해결하는 것이 예전보다 어려워졌습니다",
      category: "executive",
      subcategory: "problem_solving",
      severity_indicator: "moderate"
    },
    {
      id: "elderly_exec02",
      text: "계획을 세우고 순서대로 실행하는 것이 어렵습니다",
      category: "executive",
      subcategory: "planning",
      severity_indicator: "moderate"
    },
    {
      id: "elderly_exec03",
      text: "돈 계산이나 가계부 관리가 어려워졌습니다",
      category: "executive",
      subcategory: "calculation",
      severity_indicator: "mild"
    }
  ],
  language: [
    {
      id: "elderly_lang01",
      text: "단어가 생각나지 않아 말끝을 흐리는 경우가 있습니다",
      category: "language",
      subcategory: "word_finding",
      severity_indicator: "mild"
    },
    {
      id: "elderly_lang02",
      text: "복잡한 설명을 이해하는 것이 어려워졌습니다",
      category: "language", 
      subcategory: "comprehension",
      severity_indicator: "moderate"
    }
  ]
};

// 4. 워킹 라이프 밸런스 검사 (직장인 정신건강 측정)
export const workLifeAssessmentQuestions = {
  emotional_exhaustion: [
    {
      id: "work_ee01",
      text: "출근할 때마다 피로감을 느낍니다",
      category: "emotional_exhaustion",
      intensity: "high"
    },
    {
      id: "work_ee02",
      text: "업무로 인해 감정적으로 고갈된 느낌이 듭니다",
      category: "emotional_exhaustion",
      intensity: "very_high"
    },
    {
      id: "work_ee03",
      text: "퇴근 후에도 업무 스트레스가 지속됩니다",
      category: "emotional_exhaustion", 
      intensity: "high"
    },
    {
      id: "work_ee04",
      text: "주말에도 업무 생각에서 벗어나기 어렵습니다",
      category: "emotional_exhaustion",
      intensity: "moderate"
    }
  ],
  depersonalization: [
    {
      id: "work_dp01",
      text: "동료나 고객을 기계적으로 대하게 됩니다",
      category: "depersonalization",
      intensity: "moderate"
    },
    {
      id: "work_dp02",
      text: "업무에 대한 관심과 열정이 현저히 줄어들었습니다",
      category: "depersonalization",
      intensity: "high"
    },
    {
      id: "work_dp03",
      text: "업무 결과에 대해 무감각해졌습니다",
      category: "depersonalization",
      intensity: "moderate"
    }
  ],
  personal_accomplishment: [
    {
      id: "work_pa01",
      text: "업무를 통해 성취감을 느낍니다",
      category: "personal_accomplishment",
      reverse: true,
      intensity: "positive"
    },
    {
      id: "work_pa02",
      text: "내 업무가 의미있고 가치있다고 생각합니다",
      category: "personal_accomplishment",
      reverse: true,
      intensity: "positive"
    },
    {
      id: "work_pa03",
      text: "동료들과 협력하여 좋은 결과를 만들어냅니다",
      category: "personal_accomplishment",
      reverse: true,
      intensity: "positive"
    }
  ],
  work_life_balance: [
    {
      id: "work_wlb01",
      text: "업무와 개인 생활의 균형을 잘 유지하고 있습니다",
      category: "work_life_balance",
      reverse: true,
      intensity: "positive"
    },
    {
      id: "work_wlb02",
      text: "가족이나 친구와 보내는 시간이 충분합니다",
      category: "work_life_balance",
      reverse: true,
      intensity: "positive"
    },
    {
      id: "work_wlb03",
      text: "취미나 여가 활동을 위한 시간이 있습니다",
      category: "work_life_balance",
      reverse: true,
      intensity: "positive"
    }
  ]
};

// 5. 러브 케미 분석검사 (관계 애착 패턴 분석)
export const relationshipAssessmentQuestions = {
  secure: [
    {
      id: "attach_sec01",
      text: "파트너와 친밀한 관계를 유지하는 것이 편안합니다",
      category: "secure",
      attachment_style: "secure"
    },
    {
      id: "attach_sec02",
      text: "파트너에게 의존하는 것을 자연스럽게 받아들입니다",
      category: "secure",
      attachment_style: "secure"
    },
    {
      id: "attach_sec03",
      text: "갈등이 생겨도 대화를 통해 해결할 수 있다고 믿습니다",
      category: "secure",
      attachment_style: "secure"
    },
    {
      id: "attach_sec04",
      text: "파트너가 다른 사람들과 시간을 보내는 것을 편안하게 받아들입니다",
      category: "secure",
      attachment_style: "secure"
    }
  ],
  anxious: [
    {
      id: "attach_anx01",
      text: "파트너가 나를 떠날까봐 자주 걱정됩니다",
      category: "anxious",
      attachment_style: "anxious_preoccupied"
    },
    {
      id: "attach_anx02",
      text: "파트너의 관심과 사랑을 확인받고 싶어합니다",
      category: "anxious",
      attachment_style: "anxious_preoccupied"
    },
    {
      id: "attach_anx03",
      text: "파트너와 떨어져 있을 때 불안감을 느낍니다",
      category: "anxious",
      attachment_style: "anxious_preoccupied"
    },
    {
      id: "attach_anx04",
      text: "파트너의 작은 행동 변화에도 민감하게 반응합니다",
      category: "anxious",
      attachment_style: "anxious_preoccupied"
    }
  ],
  avoidant: [
    {
      id: "attach_avo01",
      text: "너무 가까운 관계는 부담스럽게 느껴집니다",
      category: "avoidant",
      attachment_style: "dismissive_avoidant"
    },
    {
      id: "attach_avo02",
      text: "파트너에게 의존하는 것이 불편합니다",
      category: "avoidant",
      attachment_style: "dismissive_avoidant"
    },
    {
      id: "attach_avo03",
      text: "개인적인 공간과 자유를 중요하게 생각합니다",
      category: "avoidant",
      attachment_style: "dismissive_avoidant"
    },
    {
      id: "attach_avo04",
      text: "감정적인 대화보다는 실용적인 대화를 선호합니다",
      category: "avoidant",
      attachment_style: "dismissive_avoidant"
    }
  ],
  fearful_avoidant: [
    {
      id: "attach_fa01",
      text: "가까워지고 싶지만 동시에 거부당할까 두렵습니다",
      category: "fearful_avoidant",
      attachment_style: "fearful_avoidant"
    },
    {
      id: "attach_fa02",
      text: "파트너와의 관계에서 일관되지 못한 행동을 보입니다",
      category: "fearful_avoidant",
      attachment_style: "fearful_avoidant"
    },
    {
      id: "attach_fa03",
      text: "친밀함을 원하지만 상처받을까 봐 조심스럽습니다",
      category: "fearful_avoidant",
      attachment_style: "fearful_avoidant"
    }
  ]
};

// 각 검사별 표시명과 설명
export const premiumAssessmentInfo = {
  personality_type: {
    title: "마음성향 분석검사",
    subtitle: "4차원 성격유형 정밀분석",
    description: "외향성, 감각형, 사고형, 판단형의 4개 차원으로 16가지 성격유형을 정밀 분석합니다",
    duration: "약 5-7분",
    questions_count: 16,
    premium_features: ["16가지 성격유형 상세 분석", "직업 적합성 추천", "인간관계 스타일 분석", "개인 맞춤 발전 방향 제시"]
  },
  temperament: {
    title: "타고난 기질 분석검사", 
    subtitle: "선천적 성향 과학적 측정",
    description: "기질 4차원(자극추구, 위험회피, 사회적 민감성, 지속성)으로 타고난 성향을 분석합니다",
    duration: "약 6-8분",
    questions_count: 16,
    premium_features: ["타고난 기질 4차원 분석", "스트레스 대처 방식", "심리적 취약점 평가", "성격 발달 가능성"]
  },
  cognitive: {
    title: "브레인케어 인지능력 검사",
    subtitle: "종합 인지기능 정밀평가", 
    description: "기억력, 주의력, 실행기능, 언어능력의 4개 영역으로 인지기능을 정밀 평가합니다",
    duration: "약 4-6분",
    questions_count: 12,
    premium_features: ["인지능력 위험도 평가", "인지기능 영역별 분석", "일상생활 영향도 평가", "인지강화 운동 추천"]
  },
  work_life: {
    title: "워킹 라이프 밸런스 검사",
    subtitle: "직장인 정신건강 종합진단",
    description: "감정소진, 비인격화, 성취감, 일-삶 균형의 4개 영역으로 번아웃을 정밀 측정합니다", 
    duration: "약 5-7분",
    questions_count: 13,
    premium_features: ["번아웃 위험도 측정", "스트레스 원인 분석", "회복력 평가", "직장적응 개선방안"]
  },
  relationship: {
    title: "러브 케미 분석검사",
    subtitle: "관계 애착패턴 심층분석",
    description: "안정형, 불안형, 회피형, 혼란형의 4가지 애착유형으로 관계 패턴을 분석합니다",
    duration: "약 4-6분", 
    questions_count: 15,
    premium_features: ["4가지 애착유형 분석", "관계 패턴 해석", "갈등 해결 방식", "건강한 관계 가이드"]
  }
};

// 공통 평점 척도 (1-7점)
export const likertScale = [
  { value: 1, label: "전혀 그렇지 않다" },
  { value: 2, label: "그렇지 않다" },
  { value: 3, label: "약간 그렇지 않다" },
  { value: 4, label: "보통이다" },
  { value: 5, label: "약간 그렇다" },
  { value: 6, label: "그렇다" },
  { value: 7, label: "매우 그렇다" }
];