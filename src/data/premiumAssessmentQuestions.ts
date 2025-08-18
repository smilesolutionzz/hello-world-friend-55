// 구독자용 심화 심리검사 데이터
// 본 검사는 원저작과는 무관한 창작형 검사입니다.

// 1. 마음성향 분석검사 (독창적 4차원 성격 유형 분석)
export const personalityTypeAssessmentQuestions = {
  social_energy: [
    {
      id: "mind_se01",
      text: "파티나 모임에서 새로운 사람들과 대화하는 것이 즐겁습니다",
      category: "social_energy",
      reverse: false,
      weight: 1.2
    },
    {
      id: "mind_se02", 
      text: "하루 종일 혼자만 있으면 무언가 빠진 느낌이 듭니다",
      category: "social_energy",
      reverse: false,
      weight: 1.0
    },
    {
      id: "mind_se03",
      text: "머릿속 아이디어를 다른 사람과 나누며 발전시키는 것을 좋아합니다",
      category: "social_energy", 
      reverse: false,
      weight: 1.1
    },
    {
      id: "mind_se04",
      text: "조용한 카페보다는 사람들이 많은 장소에서 더 집중이 잘 됩니다",
      category: "social_energy",
      reverse: false,
      weight: 1.0
    }
  ],
  detail_focus: [
    {
      id: "mind_df01",
      text: "설명서를 자세히 읽고 단계별로 따라하는 것을 선호합니다",
      category: "detail_focus",
      reverse: false,
      weight: 1.3
    },
    {
      id: "mind_df02",
      text: "지금 당장 해야 할 일에 집중하는 것이 장기 계획보다 우선입니다",
      category: "detail_focus",
      reverse: false,
      weight: 1.1
    },
    {
      id: "mind_df03",
      text: "작은 실수라도 놓치지 않으려고 여러 번 확인하는 편입니다",
      category: "detail_focus",
      reverse: false,
      weight: 1.2
    },
    {
      id: "mind_df04", 
      text: "직접 경험해본 것을 바탕으로 결정을 내리는 것이 안전합니다",
      category: "detail_focus",
      reverse: false,
      weight: 1.2
    }
  ],
  logical_approach: [
    {
      id: "mind_la01",
      text: "모든 상황에서 앞뒤가 맞는 일관된 기준을 적용하려고 합니다",
      category: "logical_approach",
      reverse: false,
      weight: 1.4
    },
    {
      id: "mind_la02",
      text: "중요한 선택을 할 때 개인적 감정보다는 합리적 근거를 찾습니다",
      category: "logical_approach", 
      reverse: false,
      weight: 1.3
    },
    {
      id: "mind_la03",
      text: "규칙이나 원칙이 있다면 예외를 두지 않고 지키는 것이 중요합니다",
      category: "logical_approach",
      reverse: false,
      weight: 1.2
    },
    {
      id: "mind_la04",
      text: "복잡한 문제를 작은 부분으로 나누어 체계적으로 해결합니다",
      category: "logical_approach",
      reverse: false,
      weight: 1.1
    }
  ],
  structured_living: [
    {
      id: "mind_sl01",
      text: "하루 일과를 미리 정해두고 순서대로 진행하는 것이 편안합니다",
      category: "structured_living",
      reverse: false,
      weight: 1.3
    },
    {
      id: "mind_sl02",
      text: "약속 시간보다 일찍 도착해서 여유있게 준비하는 편입니다",
      category: "structured_living",
      reverse: false,
      weight: 1.2
    },
    {
      id: "mind_sl03",
      text: "망설이기보다는 빠르게 결정하고 바로 행동으로 옮깁니다",
      category: "structured_living",
      reverse: false,
      weight: 1.1
    },
    {
      id: "mind_sl04",
      text: "정해진 방식과 순서가 있으면 그것을 따르는 것이 효율적입니다",
      category: "structured_living",
      reverse: false,
      weight: 1.0
    }
  ]
};

// 2. 타고난 기질 분석검사 (독창적 선천적 성향 측정)
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

// 4. 직장 스트레스 번아웃 검사 (직장인 정신건강 측정)
export const workStressAssessmentQuestions = {
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

// 6. 금전 심리 & 소비 패턴 검사 (Financial Psychology Assessment)
export const financialPsychologyAssessmentQuestions = {
  money_mindset: [
    {
      id: "fin_mm01",
      text: "돈을 쓸 때마다 죄책감을 느끼는 편입니다",
      category: "money_mindset",
      subcategory: "guilt_spending"
    },
    {
      id: "fin_mm02",
      text: "돈이 많으면 행복할 것이라고 생각합니다",
      category: "money_mindset",
      subcategory: "money_happiness"
    },
    {
      id: "fin_mm03",
      text: "돈에 대해 이야기하는 것이 불편합니다",
      category: "money_mindset",
      subcategory: "money_taboo"
    },
    {
      id: "fin_mm04",
      text: "돈을 절약하는 것보다 경험에 투자하는 것이 중요합니다",
      category: "money_mindset",
      subcategory: "experience_value"
    }
  ],
  spending_patterns: [
    {
      id: "fin_sp01",
      text: "스트레스를 받으면 쇼핑으로 기분을 풀려고 합니다",
      category: "spending_patterns",
      subcategory: "emotional_spending"
    },
    {
      id: "fin_sp02",
      text: "계획에 없던 물건을 충동적으로 구매하는 경우가 많습니다",
      category: "spending_patterns",
      subcategory: "impulse_buying"
    },
    {
      id: "fin_sp03",
      text: "할인이나 세일 정보를 보면 필요 없어도 사게 됩니다",
      category: "spending_patterns",
      subcategory: "sale_attraction"
    },
    {
      id: "fin_sp04",
      text: "비싼 브랜드 제품을 선호하는 편입니다",
      category: "spending_patterns",
      subcategory: "brand_preference"
    }
  ],
  financial_anxiety: [
    {
      id: "fin_fa01",
      text: "미래의 경제적 불안정에 대해 자주 걱정합니다",
      category: "financial_anxiety",
      subcategory: "future_worry"
    },
    {
      id: "fin_fa02",
      text: "통장 잔고를 확인하는 것이 두렵습니다",
      category: "financial_anxiety",
      subcategory: "balance_avoidance"
    },
    {
      id: "fin_fa03",
      text: "다른 사람과 소득을 비교하며 스트레스받습니다",
      category: "financial_anxiety",
      subcategory: "income_comparison"
    },
    {
      id: "fin_fa04",
      text: "돈 관련 결정을 내리는 것이 어렵고 스트레스받습니다",
      category: "financial_anxiety",
      subcategory: "decision_stress"
    }
  ],
  financial_goals: [
    {
      id: "fin_fg01",
      text: "명확한 재정 목표를 세우고 계획적으로 관리합니다",
      category: "financial_goals",
      subcategory: "goal_setting",
      reverse: true
    },
    {
      id: "fin_fg02",
      text: "투자와 저축에 대해 충분히 공부하고 실행합니다",
      category: "financial_goals",
      subcategory: "financial_education",
      reverse: true
    },
    {
      id: "fin_fg03",
      text: "가계부나 가계관리 앱을 꾸준히 사용합니다",
      category: "financial_goals",
      subcategory: "budget_management",
      reverse: true
    },
    {
      id: "fin_fg04",
      text: "긴급 상황을 대비한 비상금을 준비해두고 있습니다",
      category: "financial_goals",
      subcategory: "emergency_fund",
      reverse: true
    }
  ]
};

// 각 검사별 표시명과 설명
// 본 검사는 원저작과는 무관한 창작형 검사입니다.
export const premiumAssessmentInfo = {
  personality_type: {
    title: "마음성향 분석검사",
    subtitle: "창작형 4차원 성격유형 정밀분석",
    description: "사회에너지, 세부집중, 논리접근, 구조생활의 4개 차원으로 16가지 성격유형을 독창적으로 분석합니다",
    duration: "약 5-7분",
    questions_count: 16,
    premium_features: ["16가지 성격유형 상세 분석", "직업 적합성 추천", "인간관계 스타일 분석", "개인 맞춤 발전 방향 제시"],
    disclaimer: "본 검사는 원저작과는 무관한 창작형 검사입니다."
  },
  temperament: {
    title: "타고난 기질 분석검사", 
    subtitle: "창작형 선천적 성향 과학적 측정",
    description: "기질 4차원(자극추구, 위험회피, 사회적 민감성, 지속성)으로 타고난 성향을 독창적으로 분석합니다",
    duration: "약 6-8분",
    questions_count: 16,
    premium_features: ["타고난 기질 4차원 분석", "스트레스 대처 방식", "심리적 취약점 평가", "성격 발달 가능성"],
    disclaimer: "본 검사는 원저작과는 무관한 창작형 검사입니다."
  },
  cognitive: {
    title: "브레인케어 인지능력 검사",
    subtitle: "창작형 종합 인지기능 정밀평가", 
    description: "기억력, 주의력, 실행기능, 언어능력의 4개 영역으로 인지기능을 독창적으로 평가합니다",
    duration: "약 4-6분",
    questions_count: 12,
    premium_features: ["인지능력 위험도 평가", "인지기능 영역별 분석", "일상생활 영향도 평가", "인지강화 운동 추천"],
    disclaimer: "본 검사는 원저작과는 무관한 창작형 검사입니다."
  },
  work_stress: {
    title: "직장 스트레스 번아웃 검사",
    subtitle: "직장인 정신건강 종합진단",
    description: "감정소진, 비인격화, 성취감, 일-삶 균형의 4개 영역으로 번아웃을 정밀 측정합니다", 
    duration: "약 5-7분",
    questions_count: 13,
    premium_features: ["번아웃 위험도 측정", "스트레스 원인 분석", "회복력 평가", "직장적응 개선방안"],
    disclaimer: "본 검사는 원저작과는 무관한 창작형 검사입니다."
  },
  relationship: {
    title: "러브 케미 분석검사",
    subtitle: "창작형 관계 애착패턴 심층분석",
    description: "안정형, 불안형, 회피형, 혼란형의 4가지 애착유형으로 관계 패턴을 독창적으로 분석합니다",
    duration: "약 4-6분", 
    questions_count: 15,
    premium_features: ["4가지 애착유형 분석", "관계 패턴 해석", "갈등 해결 방식", "건강한 관계 가이드"],
    disclaimer: "본 검사는 원저작과는 무관한 창작형 검사입니다."
  },
  financialPsychology: {
    title: "금전 심리 & 소비 패턴 검사",
    subtitle: "창작형 금융 행동 심리 분석",
    description: "돈에 대한 태도, 소비 패턴, 재정 불안, 목표 관리의 4개 영역으로 금전 심리를 독창적으로 분석합니다",
    duration: "약 5-7분", 
    questions_count: 16,
    premium_features: ["금전 태도 심층 분석", "소비 패턴 진단", "재정 불안 평가", "개인 맞춤 재정 관리 방향"],
    disclaimer: "본 검사는 원저작과는 무관한 창작형 검사입니다."
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