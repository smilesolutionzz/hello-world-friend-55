// 구독자용 심화 심리검사 데이터
// 본 검사는 원저작과는 무관한 창작형 검사입니다.

// 프리미엄 ADHD 검사 정보 가져오기
import { premiumAdhdAssessmentInfo } from "./premiumAdhdQuestions";

// 0. AIH 신경발달 조기선별검사 (Autism Spectrum Early Screening - AIH)
export const autismSpectrumScreeningInfo = {
  title: "AIH 신경발달 조기선별검사",
  subtitle: "ASES-AIH (Autism Spectrum Early Screening)",
  description: "자폐 스펙트럼의 조기 선별을 위한 과학적 근거 기반의 창작형 검사입니다",
  features: [
    "사회적 소통 패턴 분석",
    "반복행동 및 제한적 관심사 평가", 
    "감각처리 특성 분석",
    "조기 개입 가이드라인 제공",
    "91% 이상 정확도의 AI 분석"
  ],
  duration: "8-12분",
  targetAge: "18개월 - 성인",
  category: "신경발달",
  priority: 1,
  highlight: true,
  questions_count: 35,
  premium_features: [
    "신경발달 5영역 정밀분석",
    "개별 강점과 지원영역 도출",
    "전문기관 연계 정보 제공",
    "맞춤형 개별화 교육 프로그램 추천",
    "가족 지원 가이드라인",
    "박사급 전문가 수준 해석"
  ],
  disclaimer: "본 검사는 AIH에서 독자 개발한 창작형 선별도구입니다. 진단이 아닌 선별 목적으로 사용되며, 정확한 진단은 전문의와 상담하시기 바랍니다."
};

// AIH 신경발달 조기선별검사 문항 (35문항)
export const autismSpectrumScreeningQuestions = {
  social_communication: [
    {
      id: "asd_sc01",
      text: "다른 사람과 눈을 마주치며 대화하는 것이 자연스럽습니다",
      category: "social_communication", 
      subcategory: "eye_contact",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: true,
      weight: 1.3,
      age_relevance: ["toddler", "child", "teen", "adult"]
    },
    {
      id: "asd_sc02",
      text: "사회적 상황에서 다른 사람의 감정을 파악하기 어렵습니다",
      category: "social_communication",
      subcategory: "emotional_understanding", 
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.2,
      age_relevance: ["child", "teen", "adult"]
    },
    {
      id: "asd_sc03",
      text: "같은 또래와 친구 관계를 만들고 유지하는 것이 어렵습니다",
      category: "social_communication",
      subcategory: "peer_relationships",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.4,
      age_relevance: ["child", "teen", "adult"]
    },
    {
      id: "asd_sc04",
      text: "다른 사람과 관심사나 감정을 공유하려고 합니다",
      category: "social_communication",
      subcategory: "shared_interest",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: true,
      weight: 1.1,
      age_relevance: ["toddler", "child", "teen", "adult"]
    },
    {
      id: "asd_sc05",
      text: "상대방의 말을 문자 그대로만 이해하는 경향이 있습니다",
      category: "social_communication",
      subcategory: "literal_understanding",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.2,
      age_relevance: ["child", "teen", "adult"]
    },
    {
      id: "asd_sc06",
      text: "다른 사람의 표정이나 몸짓을 해석하기 어렵습니다",
      category: "social_communication",
      subcategory: "nonverbal_communication",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.3,
      age_relevance: ["child", "teen", "adult"]
    },
    {
      id: "asd_sc07",
      text: "집단 활동에 참여하기보다는 혼자 하는 활동을 선호합니다",
      category: "social_communication",
      subcategory: "group_participation",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.1,
      age_relevance: ["child", "teen", "adult"]
    }
  ],
  restricted_repetitive: [
    {
      id: "asd_rr01",
      text: "특정한 주제나 활동에 강한 관심을 보이며 오랫동안 집중합니다",
      category: "restricted_repetitive",
      subcategory: "intense_interests",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.3,
      age_relevance: ["toddler", "child", "teen", "adult"]
    },
    {
      id: "asd_rr02",
      text: "일상의 루틴이나 패턴이 바뀌면 매우 스트레스를 받습니다",
      category: "restricted_repetitive",
      subcategory: "routine_adherence",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.4,
      age_relevance: ["toddler", "child", "teen", "adult"]
    },
    {
      id: "asd_rr03",
      text: "손가락 흔들기, 몸 흔들기 등의 반복적인 움직임을 보입니다",
      category: "restricted_repetitive",
      subcategory: "motor_stereotypies",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.2,
      age_relevance: ["toddler", "child", "teen"]
    },
    {
      id: "asd_rr04",
      text: "물건을 줄 세우거나 정렬하는 행동을 자주 합니다",
      category: "restricted_repetitive",
      subcategory: "organizing_behavior",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.1,
      age_relevance: ["toddler", "child", "teen", "adult"]
    },
    {
      id: "asd_rr05",
      text: "같은 말이나 소리를 반복적으로 합니다",
      category: "restricted_repetitive",
      subcategory: "vocal_repetition",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.2,
      age_relevance: ["toddler", "child", "teen"]
    },
    {
      id: "asd_rr06",
      text: "특정 물건에 강한 애착을 보이며 항상 가지고 다닙니다",
      category: "restricted_repetitive",
      subcategory: "object_attachment",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.0,
      age_relevance: ["toddler", "child", "teen"]
    }
  ],
  sensory_processing: [
    {
      id: "asd_sp01",
      text: "특정 소리(진공청소기, 드라이어 등)에 과도하게 민감합니다",
      category: "sensory_processing",
      subcategory: "auditory_sensitivity",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.2,
      age_relevance: ["toddler", "child", "teen", "adult"]
    },
    {
      id: "asd_sp02",
      text: "특정 음식의 질감이나 맛을 극도로 싫어합니다",
      category: "sensory_processing",
      subcategory: "tactile_taste_sensitivity",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.1,
      age_relevance: ["toddler", "child", "teen", "adult"]
    },
    {
      id: "asd_sp03",
      text: "특정 옷감이나 라벨의 감촉을 견디기 어려워합니다",
      category: "sensory_processing",
      subcategory: "tactile_sensitivity",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.0,
      age_relevance: ["toddler", "child", "teen", "adult"]
    },
    {
      id: "asd_sp04",
      text: "밝은 빛이나 깜빡이는 불빛에 과도하게 반응합니다",
      category: "sensory_processing",
      subcategory: "visual_sensitivity",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.1,
      age_relevance: ["toddler", "child", "teen", "adult"]
    },
    {
      id: "asd_sp05",
      text: "통증에 대한 반응이 일반적이지 않습니다 (너무 민감하거나 둔감)",
      category: "sensory_processing",
      subcategory: "pain_sensitivity",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.0,
      age_relevance: ["toddler", "child", "teen", "adult"]
    },
    {
      id: "asd_sp06",
      text: "회전하는 것이나 높은 곳을 특별히 좋아하거나 싫어합니다",
      category: "sensory_processing",
      subcategory: "vestibular_sensitivity",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 0.9,
      age_relevance: ["toddler", "child", "teen"]
    }
  ],
  communication_language: [
    {
      id: "asd_cl01",
      text: "언어 발달이 또래에 비해 지연되었거나 독특한 패턴을 보입니다",
      category: "communication_language",
      subcategory: "language_development",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.3,
      age_relevance: ["toddler", "child", "teen"]
    },
    {
      id: "asd_cl02",
      text: "TV나 영화의 대사를 그대로 따라하는 경우가 자주 있습니다",
      category: "communication_language",
      subcategory: "echolalia",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.1,
      age_relevance: ["toddler", "child", "teen"]
    },
    {
      id: "asd_cl03", 
      text: "대화를 시작하거나 지속하는 것이 어렵습니다",
      category: "communication_language",
      subcategory: "conversation_skills",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.2,
      age_relevance: ["child", "teen", "adult"]
    },
    {
      id: "asd_cl04",
      text: "말의 톤이나 억양이 독특하거나 단조롭습니다",
      category: "communication_language",
      subcategory: "prosody",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.0,
      age_relevance: ["child", "teen", "adult"]
    },
    {
      id: "asd_cl05",
      text: "상황에 맞지 않는 말을 하거나 주제를 갑자기 바꿉니다",
      category: "communication_language",
      subcategory: "pragmatic_language",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.1,
      age_relevance: ["child", "teen", "adult"]
    }
  ],
  adaptive_functioning: [
    {
      id: "asd_af01",
      text: "일상생활 기술(옷 입기, 세면 등)을 익히는 데 어려움이 있습니다",
      category: "adaptive_functioning",
      subcategory: "daily_living_skills",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.1,
      age_relevance: ["toddler", "child", "teen"]
    },
    {
      id: "asd_af02",
      text: "새로운 환경이나 상황에 적응하는 데 시간이 오래 걸립니다",
      category: "adaptive_functioning",
      subcategory: "environmental_adaptation",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.2,
      age_relevance: ["toddler", "child", "teen", "adult"]
    },
    {
      id: "asd_af03",
      text: "학습이나 업무 상황에서 집중력이나 수행 능력에 어려움이 있습니다",
      category: "adaptive_functioning",
      subcategory: "academic_occupational",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.0,
      age_relevance: ["child", "teen", "adult"]
    },
    {
      id: "asd_af04",
      text: "타인의 도움 없이 독립적으로 문제를 해결하기 어렵습니다",
      category: "adaptive_functioning",
      subcategory: "problem_solving",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.1,
      age_relevance: ["child", "teen", "adult"]
    },
    {
      id: "asd_af05",
      text: "감정 조절이나 스트레스 관리에 어려움을 보입니다",
      category: "adaptive_functioning",
      subcategory: "emotional_regulation",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.2,
      age_relevance: ["child", "teen", "adult"]
    }
  ]
};

// 1. AIH 마음성향 분석검사 (완전 창작형 4차원 성격 유형 분석)
export const personalityTypeAssessmentQuestions = {
  social_energy: [
    {
      id: "mind_se01",
      text: "파티나 모임에서 새로운 사람들과 대화하는 것이 즐겁습니다",
      category: "social_energy",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.2
    },
    {
      id: "mind_se02", 
      text: "하루 종일 혼자만 있으면 무언가 빠진 느낌이 듭니다",
      category: "social_energy",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.0
    },
    {
      id: "mind_se03",
      text: "머릿속 아이디어를 다른 사람과 나누며 발전시키는 것을 좋아합니다",
      category: "social_energy",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.1
    },
    {
      id: "mind_se04",
      text: "조용한 카페보다는 사람들이 많은 장소에서 더 집중이 잘 됩니다",
      category: "social_energy",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
      reverse: false,
      weight: 1.0
    }
  ],
  detail_focus: [
    {
      id: "mind_df01",
      text: "설명서를 자세히 읽고 단계별로 따라하는 것을 선호합니다",
      category: "detail_focus",
      options: [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ],
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

// 2. AIH 타고난 기질 분석검사 (완전 창작형 선천적 성향 측정) - 30문항
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
    },
    {
      id: "tci_ns05",
      text: "익숙한 방법보다 새로운 방법을 시도하는 것이 즐겁습니다",
      category: "novelty_seeking",
      subcategory: "exploratory_excitability"
    },
    {
      id: "tci_ns06",
      text: "규칙이나 제한이 답답하게 느껴집니다",
      category: "novelty_seeking",
      subcategory: "impulsiveness"
    },
    {
      id: "tci_ns07",
      text: "새로운 사람을 만나는 것이 두렵지 않습니다",
      category: "novelty_seeking",
      subcategory: "exploratory_excitability"
    },
    {
      id: "tci_ns08",
      text: "계획 없이 여행을 떠나는 것도 괜찮습니다",
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
    },
    {
      id: "tci_ha05",
      text: "작은 일에도 걱정이 많은 편입니다",
      category: "harm_avoidance",
      subcategory: "anticipatory_worry"
    },
    {
      id: "tci_ha06",
      text: "비판이나 거절에 민감하게 반응합니다",
      category: "harm_avoidance",
      subcategory: "fear_of_uncertainty"
    },
    {
      id: "tci_ha07",
      text: "불확실한 상황에서 불안감을 느낍니다",
      category: "harm_avoidance",
      subcategory: "fear_of_uncertainty"
    },
    {
      id: "tci_ha08",
      text: "스트레스 상황에서 쉽게 지칩니다",
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
    },
    {
      id: "tci_rd05",
      text: "사람들과 함께 있을 때 에너지를 얻습니다",
      category: "reward_dependence",
      subcategory: "social_attachment"
    },
    {
      id: "tci_rd06",
      text: "감동적인 이야기나 영화에 쉽게 눈물을 흘립니다",
      category: "reward_dependence",
      subcategory: "sentimentality"
    },
    {
      id: "tci_rd07",
      text: "다른 사람의 기분에 따라 내 기분도 변합니다",
      category: "reward_dependence",
      subcategory: "sentimentality"
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
    },
    {
      id: "tci_p05",
      text: "목표 달성을 위해 다른 활동을 포기할 수 있습니다",
      category: "persistence",
      subcategory: "work_hardened"
    },
    {
      id: "tci_p06",
      text: "일이 잘 풀리지 않아도 포기하지 않습니다",
      category: "persistence",
      subcategory: "eagerness_of_effort"
    },
    {
      id: "tci_p07",
      text: "작은 실수도 용납하기 어렵습니다",
      category: "persistence",
      subcategory: "perfectionist"
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


// 6. 프리미엄 부모양육태도 검사 (과학적 양육태도 분석)
export const parentingStyleAssessmentQuestions = {
  warmth_acceptance: [
    {
      id: "parent_wa01",
      text: "아이가 실수하거나 잘못했을 때도 따뜻하게 대합니다",
      category: "warmth_acceptance",
      subcategory: "emotional_warmth",
      weight: 1.3
    },
    {
      id: "parent_wa02",
      text: "아이의 감정을 이해하고 공감해주려고 노력합니다",
      category: "warmth_acceptance",
      subcategory: "emotional_support",
      weight: 1.4
    },
    {
      id: "parent_wa03",
      text: "아이와 함께 보내는 시간을 즐겁고 의미있게 만들려고 합니다",
      category: "warmth_acceptance",
      subcategory: "quality_time",
      weight: 1.2
    },
    {
      id: "parent_wa04",
      text: "아이의 장점과 노력을 자주 칭찬해줍니다",
      category: "warmth_acceptance",
      subcategory: "positive_reinforcement",
      weight: 1.1
    },
    {
      id: "parent_wa05",
      text: "아이가 힘들어할 때 먼저 다가가서 도움을 줍니다",
      category: "warmth_acceptance",
      subcategory: "responsive_care",
      weight: 1.3
    }
  ],
  behavioral_control: [
    {
      id: "parent_bc01",
      text: "아이에게 일관된 규칙과 기준을 제시합니다",
      category: "behavioral_control",
      subcategory: "consistent_rules",
      weight: 1.2
    },
    {
      id: "parent_bc02",
      text: "아이의 행동에 대해 명확한 기대치를 갖고 있습니다",
      category: "behavioral_control",
      subcategory: "clear_expectations",
      weight: 1.1
    },
    {
      id: "parent_bc03",
      text: "아이가 약속을 지키지 않으면 적절한 결과를 경험하게 합니다",
      category: "behavioral_control",
      subcategory: "natural_consequences",
      weight: 1.0
    },
    {
      id: "parent_bc04",
      text: "아이의 하루 일과와 활동을 적절히 관리합니다",
      category: "behavioral_control",
      subcategory: "structure_routine",
      weight: 1.2
    },
    {
      id: "parent_bc05",
      text: "아이가 올바른 선택을 할 수 있도록 안내합니다",
      category: "behavioral_control",
      subcategory: "guidance",
      weight: 1.3
    }
  ],
  psychological_control: [
    {
      id: "parent_pc01",
      text: "아이가 내 기분을 맞춰주기를 기대합니다",
      category: "psychological_control",
      subcategory: "guilt_induction",
      reverse: true,
      weight: 1.4
    },
    {
      id: "parent_pc02",
      text: "아이가 내 의견에 반대하면 화가 납니다",
      category: "psychological_control",
      subcategory: "invalidation",
      reverse: true,
      weight: 1.3
    },
    {
      id: "parent_pc03",
      text: "아이의 감정보다 행동 결과가 더 중요합니다",
      category: "psychological_control",
      subcategory: "emotional_dismissal",
      reverse: true,
      weight: 1.2
    },
    {
      id: "parent_pc04",
      text: "아이가 독립적으로 결정하는 것을 불안해합니다",
      category: "psychological_control",
      subcategory: "overprotection",
      reverse: true,
      weight: 1.1
    },
    {
      id: "parent_pc05",
      text: "아이가 내 기대에 못 미치면 실망감을 드러냅니다",
      category: "psychological_control",
      subcategory: "conditional_approval",
      reverse: true,
      weight: 1.3
    }
  ],
  autonomy_support: [
    {
      id: "parent_as01",
      text: "아이가 스스로 문제를 해결할 기회를 줍니다",
      category: "autonomy_support",
      subcategory: "independence_fostering",
      weight: 1.4
    },
    {
      id: "parent_as02",
      text: "아이의 의견을 존중하고 함께 논의합니다",
      category: "autonomy_support",
      subcategory: "collaborative_decision",
      weight: 1.3
    },
    {
      id: "parent_as03",
      text: "아이가 자신만의 관심사를 개발하도록 격려합니다",
      category: "autonomy_support",
      subcategory: "individual_interests",
      weight: 1.2
    },
    {
      id: "parent_as04",
      text: "아이의 실수를 학습의 기회로 받아들입니다",
      category: "autonomy_support",
      subcategory: "learning_opportunity",
      weight: 1.1
    },
    {
      id: "parent_as05",
      text: "아이가 선택한 것에 대해 책임감을 기를 수 있도록 돕습니다",
      category: "autonomy_support",
      subcategory: "responsibility_development",
      weight: 1.3
    }
  ],
  communication_support: [
    {
      id: "parent_cs01",
      text: "아이가 자신의 의견을 표현할 때까지 충분히 기다려줍니다",
      category: "communication_support",
      subcategory: "patient_listening",
      weight: 1.2
    },
    {
      id: "parent_cs02",
      text: "아이의 말을 끝까지 들어주고 진지하게 받아들입니다",
      category: "communication_support",
      subcategory: "active_listening",
      weight: 1.4
    },
    {
      id: "parent_cs03",
      text: "아이와의 대화에서 비난보다는 이해하려고 노력합니다",
      category: "communication_support",
      subcategory: "empathetic_communication",
      weight: 1.3
    },
    {
      id: "parent_cs04",
      text: "아이가 어려움을 털어놓을 수 있는 분위기를 만들어줍니다",
      category: "communication_support",
      subcategory: "safe_communication",
      weight: 1.2
    },
    {
      id: "parent_cs05",
      text: "아이의 발달 수준에 맞는 언어로 대화합니다",
      category: "communication_support",
      subcategory: "developmentally_appropriate",
      weight: 1.1
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

// 7. 청소년 마음바로미터 검사 (Teen Mental Health Compass)
export const teenMentalCompassAssessmentQuestions = {
  emotional_problems: [
    {
      id: "teen_compass_ep01",
      text: "요즘 들어 마음이 무겁고 즐거운 일이 별로 없습니다",
      category: "emotional_problems",
      subcategory: "depression"
    },
    {
      id: "teen_compass_ep02", 
      text: "앞으로 일어날 일들이 걱정되어 잠들기 어려울 때가 있습니다",
      category: "emotional_problems",
      subcategory: "anxiety"
    },
    {
      id: "teen_compass_ep03",
      text: "작은 일에도 폭발할 것 같은 화가 치밀어 오릅니다",
      category: "emotional_problems",
      subcategory: "anger_control"
    },
    {
      id: "teen_compass_ep04",
      text: "스트레스를 받으면 머리가 아프거나 배가 아픕니다",
      category: "emotional_problems",
      subcategory: "somatic_symptoms"
    }
  ],
  behavioral_problems: [
    {
      id: "teen_compass_bp01",
      text: "어른들이 정한 규칙을 따르는 것이 답답합니다",
      category: "behavioral_problems", 
      subcategory: "rule_breaking"
    },
    {
      id: "teen_compass_bp02",
      text: "친구들과 의견이 다르면 크게 다투는 편입니다",
      category: "behavioral_problems",
      subcategory: "aggression"
    },
    {
      id: "teen_compass_bp03",
      text: "생각 없이 행동했다가 나중에 후회하는 일이 많습니다",
      category: "behavioral_problems",
      subcategory: "impulsivity"
    },
    {
      id: "teen_compass_bp04",
      text: "진실을 말하기 어려워서 거짓말을 하게 됩니다",
      category: "behavioral_problems",
      subcategory: "deception"
    }
  ],
  social_adaptation: [
    {
      id: "teen_compass_sa01",
      text: "새로운 학교나 반에 적응하는 것이 힘듭니다",
      category: "social_adaptation",
      subcategory: "environmental_adaptation"
    },
    {
      id: "teen_compass_sa02",
      text: "친구들 사이에서 어떻게 행동해야 할지 모르겠습니다",
      category: "social_adaptation",
      subcategory: "peer_relationships"
    },
    {
      id: "teen_compass_sa03", 
      text: "단체 활동이나 모둠 과제를 하는 것이 부담스럽습니다",
      category: "social_adaptation",
      subcategory: "group_participation"
    },
    {
      id: "teen_compass_sa04",
      text: "다른 사람이 왜 그런 기분인지 이해하기 어렵습니다",
      category: "social_adaptation",
      subcategory: "empathy"
    }
  ],
  identity_development: [
    {
      id: "teen_compass_id01",
      text: "나는 어떤 사람인지, 무엇을 원하는지 확실하지 않습니다",
      category: "identity_development",
      subcategory: "self_identity"
    },
    {
      id: "teen_compass_id02",
      text: "내 미래에 대한 꿈이나 목표가 명확하지 않습니다",
      category: "identity_development",
      subcategory: "future_planning"
    },
    {
      id: "teen_compass_id03",
      text: "부모님과 생각이 달라서 자주 갈등이 생깁니다",
      category: "identity_development",
      subcategory: "authority_conflict"
    },
    {
      id: "teen_compass_id04",
      text: "내가 정말 소중하게 생각하는 가치가 무엇인지 모르겠습니다",
      category: "identity_development",
      subcategory: "value_formation"
    }
  ]
};

// 8. 청소년 성장역량 진단검사 (Teen Growth Capacity Assessment)  
export const teenGrowthCapacityAssessmentQuestions = {
  internalizing_problems: [
    {
      id: "teen_growth_ip01",
      text: "혼자만의 시간을 보내며 깊은 생각에 잠기는 경우가 많습니다",
      category: "internalizing_problems",
      subcategory: "withdrawal"
    },
    {
      id: "teen_growth_ip02",
      text: "앞으로 벌어질 일들에 대해 과도하게 걱정하는 편입니다",
      category: "internalizing_problems", 
      subcategory: "anxiety"
    },
    {
      id: "teen_growth_ip03",
      text: "특별한 이유 없이 기분이 가라앉고 무기력해집니다",
      category: "internalizing_problems",
      subcategory: "depression"
    },
    {
      id: "teen_growth_ip04",
      text: "몸에 아픈 곳이 있다고 느끼지만 병원에서는 이상 없다고 합니다",
      category: "internalizing_problems",
      subcategory: "somatic_complaints"
    }
  ],
  externalizing_problems: [
    {
      id: "teen_growth_ep01",
      text: "화가 나면 물건을 집어던지거나 문을 세게 닫습니다",
      category: "externalizing_problems",
      subcategory: "aggressive_behavior"
    },
    {
      id: "teen_growth_ep02",
      text: "어른들의 지시에 반발하고 싶은 마음이 큽니다",
      category: "externalizing_problems",
      subcategory: "oppositional_behavior"
    },
    {
      id: "teen_growth_ep03",
      text: "다른 사람의 물건에 손을 대거나 가져가고 싶은 충동이 있습니다",
      category: "externalizing_problems",
      subcategory: "conduct_problems"
    },
    {
      id: "teen_growth_ep04",
      text: "정해진 규칙이나 약속을 지키는 것이 어렵습니다",
      category: "externalizing_problems",
      subcategory: "rule_breaking"
    }
  ],
  attention_problems: [
    {
      id: "teen_growth_ap01",
      text: "하나의 일에 오랫동안 집중하는 것이 힘듭니다",
      category: "attention_problems",
      subcategory: "concentration"
    },
    {
      id: "teen_growth_ap02",
      text: "수업 중에 자꾸 다른 생각이 떠올라 집중하기 어렵습니다",
      category: "attention_problems",
      subcategory: "classroom_attention"
    },
    {
      id: "teen_growth_ap03",
      text: "가만히 앉아있기보다는 계속 움직이고 싶습니다",
      category: "attention_problems",
      subcategory: "hyperactivity"
    },
    {
      id: "teen_growth_ap04",
      text: "숙제나 준비물을 자주 깜빡하고 잃어버립니다",
      category: "attention_problems", 
      subcategory: "forgetfulness"
    }
  ],
  social_competence: [
    {
      id: "teen_growth_sc01",
      text: "친구들과 함께하는 활동에서 적극적으로 참여하려고 합니다",
      category: "social_competence",
      subcategory: "peer_interaction",
      reverse: true
    },
    {
      id: "teen_growth_sc02",
      text: "갈등이 생겼을 때 서로 이해할 수 있도록 대화하려고 노력합니다",
      category: "social_competence",
      subcategory: "conflict_resolution",
      reverse: true
    },
    {
      id: "teen_growth_sc03",
      text: "다른 사람의 마음을 이해하고 도와주려고 합니다",
      category: "social_competence",
      subcategory: "empathy",
      reverse: true
    },
    {
      id: "teen_growth_sc04",
      text: "모둠이나 팀에서 다른 사람들을 이끌어주는 역할을 맡습니다",
      category: "social_competence",
      subcategory: "leadership",
      reverse: true
    }
  ]
};

// 연애성격분석테스트 질문 (체질분석페이지에서 이동)
export const lovePersonalityAssessmentQuestions = {
  passionate_romantic: [
    {
      id: "love_pr01",
      text: "연애에서 감정적인 교감이 가장 중요합니다",
      category: "passionate_romantic"
    },
    {
      id: "love_pr02", 
      text: "로맨틱한 분위기와 이벤트를 중요하게 생각합니다",
      category: "passionate_romantic"
    },
    {
      id: "love_pr03",
      text: "사랑할 때 모든 것을 쏟아부치는 편입니다",
      category: "passionate_romantic"
    },
    {
      id: "love_pr04",
      text: "첫눈에 반하는 운명적인 만남을 믿습니다",
      category: "passionate_romantic"
    },
    {
      id: "love_pr05",
      text: "연인과 함께 있을 때 세상이 다르게 보입니다",
      category: "passionate_romantic"
    }
  ],
  stable_companion: [
    {
      id: "love_sc01",
      text: "연애보다는 결혼을 고려한 안정적인 관계를 선호합니다",
      category: "stable_companion"
    },
    {
      id: "love_sc02",
      text: "상대방의 성격과 가치관을 중요하게 생각합니다",
      category: "stable_companion"
    },
    {
      id: "love_sc03",
      text: "갑작스런 변화보다는 예측 가능한 관계를 좋아합니다",
      category: "stable_companion"
    },
    {
      id: "love_sc04",
      text: "연애할 때도 개인 시간과 일상을 중요하게 여깁니다",
      category: "stable_companion"
    },
    {
      id: "love_sc05",
      text: "서로 의지하며 함께 성장해나가는 관계를 원합니다",
      category: "stable_companion"
    }
  ],
  independent_individualist: [
    {
      id: "love_ii01",
      text: "연애를 하더라도 독립적인 자아를 유지하려고 합니다",
      category: "independent_individualist"
    },
    {
      id: "love_ii02",
      text: "상대방에게 간섭받지 않는 자유로운 관계를 선호합니다",
      category: "independent_individualist"
    },
    {
      id: "love_ii03",
      text: "연인보다는 친구 같은 편안한 관계가 좋습니다",
      category: "independent_individualist"
    },
    {
      id: "love_ii04",
      text: "각자의 꿈과 목표를 응원하는 관계를 중요하게 생각합니다",
      category: "independent_individualist"
    },
    {
      id: "love_ii05",
      text: "질투나 소유욕보다는 신뢰를 바탕으로 한 관계를 원합니다",
      category: "independent_individualist"
    }
  ],
  realistic_planner: [
    {
      id: "love_rp01",
      text: "연애할 때도 현실적인 조건들을 고려합니다",
      category: "realistic_planner"
    },
    {
      id: "love_rp02",
      text: "감정만으로는 오래갈 수 없다고 생각합니다",
      category: "realistic_planner"
    },
    {
      id: "love_rp03",
      text: "결혼과 미래에 대한 구체적인 계획을 세우는 것이 중요합니다",
      category: "realistic_planner"
    },
    {
      id: "love_rp04",
      text: "상대방의 경제력이나 직업 등을 고려합니다",
      category: "realistic_planner"
    },
    {
      id: "love_rp05",
      text: "충동적인 연애보다는 신중하게 접근하는 편입니다",
      category: "realistic_planner"
    }
  ]
};

// 평가 정보 객체 (인기도 순으로 재배치)
export const premiumAssessmentInfo = {
  // 🧠 신경발달 조기선별검사 (최상단 배치)
  autismSpectrumScreening: {
    title: "AIH 신경발달 조기선별검사",
    subtitle: "ASES-AIH (Autism Spectrum Early Screening)",
    description: "자폐 스펙트럼의 조기 선별을 위한 과학적 근거 기반의 창작형 검사입니다",
    duration: "약 8-12분",
    questions_count: 35,
    premium_features: [
      "5개 영역 정밀분석 (사회적 소통, 제한적 반복행동, 감각처리, 의사소통언어, 적응기능)",
      "91% 이상 정확도의 AI 분석",
      "조기개입 가이드라인 제공",
      "박사급 전문가 수준 해석",
      "가족 지원 전략 제시",
      "전문기관 연계 정보"
    ],
    disclaimer: "본 검사는 AIH에서 독자 개발한 창작형 선별도구입니다. 진단이 아닌 선별 목적으로 사용되며, 정확한 진단은 전문의와 상담하시기 바랍니다.",
    rank: 0,
    badge: "🧠 AI 91%",
    priority: 1,
    highlight: true,
    category: "신경발달",
    targetAge: "18개월-성인"
  },
  // ✨ NEW 프리미엄 ADHD 검사
  premiumAdhd: {
    ...premiumAdhdAssessmentInfo,
    rank: 1,
    badge: "✨ NEW",
    priority: 2,
    highlight: true
  },
  // 🔥 TOP 인기 테스트들 (상단 배치)
  languageDevelopment: {
    title: "AIH 영유아 언어발달 자가체크",
    subtitle: "심화 언어발달 진단 - 77문항",
    description: "수용언어(39문항)와 표현언어(38문항)를 종합적으로 평가하는 전문 검사",
    duration: "15-20분",
    questions_count: 77,
    premium_features: ["연령별 맞춤 문항", "수용/표현언어 분석", "발달 수준 평가", "상세 AI 해석"],
    disclaimer: "본 검사는 원저작과는 무관한 창작형 검사입니다.",
    rank: 1,
    badge: "🔥 1위"
  },
  temperament: {
    title: "타고난 기질 분석검사", 
    subtitle: "창작형 선천적 성향 과학적 측정",
    description: "기질 4차원(자극추구, 위험회피, 사회적 민감성, 지속성)으로 타고난 성향을 독창적으로 분석합니다",
    duration: "약 8-10분",
    questions_count: 30,
    premium_features: ["타고난 기질 4차원 분석", "스트레스 대처 방식", "심리적 취약점 평가", "성격 발달 가능성"],
    disclaimer: "본 검사는 원저작과는 무관한 창작형 검사입니다.",
    rank: 2,
    badge: "🔥 2위"
  },
  personality_type: {
    title: "마음성향 분석검사",
    subtitle: "창작형 4차원 성격유형 정밀분석",
    description: "사회에너지, 세부집중, 논리접근, 구조생활의 4개 차원으로 16가지 성격유형을 독창적으로 분석합니다",
    duration: "약 5-7분",
    questions_count: 16,
    premium_features: ["16가지 성격유형 상세 분석", "직업 적합성 추천", "인간관계 스타일 분석", "개인 맞춤 발전 방향 제시"],
    disclaimer: "본 검사는 원저작과는 무관한 창작형 검사입니다.",
    rank: 3,
    badge: "🔥 3위"
  },
  love_personality: {
    title: "연애성격분석테스트",
    subtitle: "나의 연애 스타일과 성격 유형 분석",
    description: "열정적인 로맨티스트, 안정적인 동반자, 독립적인 개인주의자, 계획적인 현실주의자의 4가지 연애 유형으로 분석합니다",
    duration: "약 5-7분", 
    questions_count: 20,
    premium_features: ["4가지 연애 유형 분석", "이상적인 파트너 매칭", "관계 개선 조언", "연애 스타일 가이드"],
    disclaimer: "본 검사는 원저작과는 무관한 창작형 검사입니다.",
    rank: 5,
    badge: "💕 인기"
  },
  work_stress: {
    title: "직장 스트레스 번아웃 검사",
    subtitle: "직장인 정신건강 종합진단",
    description: "감정소진, 비인격화, 성취감, 일-삶 균형의 4개 영역으로 번아웃을 정밀 측정합니다", 
    duration: "약 5-7분",
    questions_count: 13,
    premium_features: ["번아웃 위험도 측정", "스트레스 원인 분석", "회복력 평가", "직장적응 개선방안"],
    disclaimer: "본 검사는 원저작과는 무관한 창작형 검사입니다.",
    rank: 5,
    badge: "📈 5위"
  },
  // 📊 중간 인기 테스트들
  cognitive: {
    title: "브레인케어 인지능력 검사",
    subtitle: "창작형 종합 인지기능 정밀평가", 
    description: "기억력, 주의력, 실행기능, 언어능력의 4개 영역으로 인지기능을 독창적으로 평가합니다",
    duration: "약 4-6분",
    questions_count: 12,
    premium_features: ["인지능력 위험도 평가", "인지기능 영역별 분석", "일상생활 영향도 평가", "인지강화 운동 추천"],
    disclaimer: "본 검사는 원저작과는 무관한 창작형 검사입니다.",
    rank: 7,
    badge: "⭐ 추천"
  },
  financialPsychology: {
    title: "금전 심리 & 소비 패턴 검사",
    subtitle: "창작형 금융 행동 심리 분석",
    description: "돈에 대한 태도, 소비 패턴, 재정 불안, 목표 관리의 4개 영역으로 금전 심리를 독창적으로 분석합니다",
    duration: "약 5-7분", 
    questions_count: 16,
    premium_features: ["금전 태도 심층 분석", "소비 패턴 진단", "재정 불안 평가", "개인 맞춤 재정 관리 방향"],
    disclaimer: "본 검사는 원저작과는 무관한 창작형 검사입니다.",
    rank: 8,
    badge: "⭐ 추천"
  },
  teenMentalCompass: {
    title: "청소년 마음바로미터 검사",
    subtitle: "창작형 청소년 정서상태 종합진단",
    description: "정서상태, 행동특성, 관계적응, 성장발달의 4개 영역으로 청소년의 마음 건강을 종합 분석합니다",
    duration: "약 6-8분",
    questions_count: 16,
    premium_features: ["4영역 마음건강 진단", "정서행동 균형 분석", "또래관계 적응력 평가", "개별 성장 가이드"],
    disclaimer: "본 검사는 원저작과는 무관한 창작형 검사입니다.",
    rank: 9,
    badge: "✨ NEW"
  },
  // 🎯 전문 분야 테스트들
  socialDevelopmentScreening: {
    title: "사회적 발달 선별검사",
    subtitle: "창작형 사회성 발달 종합평가",
    description: "사회상호작용, 의사소통, 행동패턴, 감각반응의 4개 영역으로 사회적 발달 특성을 정밀 선별합니다",
    duration: "약 7-10분",
    questions_count: 20,
    premium_features: ["사회성 발달 4영역 정밀분석", "의사소통 능력 평가", "감각 민감성 진단", "개별 발달 지원 방안"],
    disclaimer: "본 검사는 원저작과는 무관한 창작형 검사입니다.",
    rank: 10,
    badge: "전문"
  },
  teenGrowthCapacity: {
    title: "청소년 성장역량 진단검사", 
    subtitle: "창작형 청소년 발달잠재력 평가척도",
    description: "내면성장, 외적표현, 집중능력, 사회역량의 4개 영역으로 청소년의 성장 잠재력을 정밀 진단합니다",
    duration: "약 6-8분",
    questions_count: 16, 
    premium_features: ["성장잠재력 4영역 분석", "집중력 발달 상태 평가", "사회적 역량 강화 방안", "개인별 성장 로드맵"],
    disclaimer: "본 검사는 원저작과는 무관한 창작형 검사입니다.",
    rank: 11,
    badge: "전문"
  },
  // 💎 NEW 부모양육태도 검사
  parentingStyle: {
    title: "프리미엄 부모양육태도 검사",
    subtitle: "과학적 양육태도 심층분석",
    description: "온정수용, 행동통제, 심리통제, 자율성지지, 의사소통지지 5개 영역으로 양육태도를 정밀 분석합니다",
    duration: "약 8-10분",
    questions_count: 25,
    premium_features: ["5영역 양육태도 정밀분석", "자녀발달 영향도 평가", "양육 강점과 개선점 도출", "개별 양육 가이드 제공"],
    disclaimer: "본 검사는 원저작과는 무관한 창작형 검사입니다.",
    rank: 12,
    badge: "✨ NEW",
    priority: 2,
    highlight: true
  }
};

// 9. 사회적 발달 선별검사 (Social Development Screening Assessment)
export const socialDevelopmentScreeningQuestions = {
  social_interaction: [
    {
      id: "social_dev_si01",
      text: "다른 사람과 눈을 마주치는 것을 자연스럽게 합니다",
      category: "social_interaction",
      subcategory: "eye_contact",
      reverse: true
    },
    {
      id: "social_dev_si02",
      text: "다른 사람의 표정을 보고 기분을 이해하려고 합니다",
      category: "social_interaction",
      subcategory: "emotional_understanding",
      reverse: true
    },
    {
      id: "social_dev_si03",
      text: "친구들과 함께 놀거나 활동하는 것을 즐깁니다",
      category: "social_interaction",
      subcategory: "peer_play",
      reverse: true
    },
    {
      id: "social_dev_si04",
      text: "다른 사람이 부르면 쉽게 반응하고 돌아봅니다",
      category: "social_interaction",
      subcategory: "social_response",
      reverse: true
    },
    {
      id: "social_dev_si05",
      text: "혼자만의 활동보다는 다른 사람과 함께하는 것을 선호합니다",
      category: "social_interaction",
      subcategory: "social_preference",
      reverse: true
    }
  ],
  communication: [
    {
      id: "social_dev_comm01",
      text: "말로 자신의 생각이나 기분을 표현하는 것이 자연스럽습니다",
      category: "communication",
      subcategory: "verbal_expression",
      reverse: true
    },
    {
      id: "social_dev_comm02",
      text: "손짓이나 몸짓으로 의사를 전달하려고 합니다",
      category: "communication",
      subcategory: "nonverbal_communication",
      reverse: true
    },
    {
      id: "social_dev_comm03",
      text: "다른 사람의 말을 듣고 적절하게 대답할 수 있습니다",
      category: "communication",
      subcategory: "conversational_skills",
      reverse: true
    },
    {
      id: "social_dev_comm04",
      text: "상황에 맞는 적절한 단어나 표현을 사용합니다",
      category: "communication",
      subcategory: "contextual_language",
      reverse: true
    },
    {
      id: "social_dev_comm05",
      text: "질문을 받으면 상황에 맞게 대답하려고 노력합니다",
      category: "communication",
      subcategory: "response_appropriateness",
      reverse: true
    }
  ],
  behavioral_patterns: [
    {
      id: "social_dev_bp01",
      text: "같은 행동을 반복적으로 하는 경향이 있습니다",
      category: "behavioral_patterns",
      subcategory: "repetitive_behaviors"
    },
    {
      id: "social_dev_bp02",
      text: "정해진 순서나 규칙이 바뀌면 매우 불편해합니다",
      category: "behavioral_patterns",
      subcategory: "routine_adherence"
    },
    {
      id: "social_dev_bp03",
      text: "특정한 물건이나 주제에만 과도하게 관심을 보입니다",
      category: "behavioral_patterns",
      subcategory: "restricted_interests"
    },
    {
      id: "social_dev_bp04",
      text: "손을 흔들거나 몸을 흔드는 등의 반복적인 움직임을 합니다",
      category: "behavioral_patterns",
      subcategory: "motor_behaviors"
    },
    {
      id: "social_dev_bp05",
      text: "예상하지 못한 변화가 생기면 강하게 저항하거나 화를 냅니다",
      category: "behavioral_patterns",
      subcategory: "change_resistance"
    }
  ],
  sensory_responses: [
    {
      id: "social_dev_sr01",
      text: "큰 소리나 특정 소리에 과민하게 반응합니다",
      category: "sensory_responses",
      subcategory: "auditory_sensitivity"
    },
    {
      id: "social_dev_sr02",
      text: "특정한 촉감이나 질감을 매우 싫어하거나 피하려고 합니다",
      category: "sensory_responses",
      subcategory: "tactile_sensitivity"
    },
    {
      id: "social_dev_sr03",
      text: "밝은 빛이나 깜빡이는 빛에 민감하게 반응합니다",
      category: "sensory_responses",
      subcategory: "visual_sensitivity"
    },
    {
      id: "social_dev_sr04",
      text: "특정 냄새나 맛에 대해 극도로 민감하거나 둔감합니다",
      category: "sensory_responses",
      subcategory: "olfactory_sensitivity"
    },
    {
      id: "social_dev_sr05",
      text: "통증이나 온도 변화를 잘 느끼지 못하거나 과도하게 반응합니다",
      category: "sensory_responses",
      subcategory: "pain_temperature_sensitivity"
    }
  ]
};

// 4지선다형 공통 선택지 (프리미엄 검사용)
export const fourChoiceOptions = [
  { value: 1, label: "전혀 그렇지 않다" },
  { value: 2, label: "그렇지 않다" },
  { value: 3, label: "그렇다" },
  { value: 4, label: "매우 그렇다" }
];

// 공통 평점 척도 (1-7점) - 이전 버전 유지
export const likertScale = [
  { value: 1, label: "전혀 그렇지 않다" },
  { value: 2, label: "그렇지 않다" },
  { value: 3, label: "약간 그렇지 않다" },
  { value: 4, label: "보통이다" },
  { value: 5, label: "약간 그렇다" },
  { value: 6, label: "그렇다" },
  { value: 7, label: "매우 그렇다" }
];

// AIH 영유아 언어발달 자가체크 정보
export const languageDevelopmentAssessmentInfo = {
  title: "AIH 영유아 언어발달 자가체크",
  subtitle: "심화 언어발달 진단",
  description: "수용언어와 표현언어를 종합적으로 평가하는 77문항 전문 검사",
  duration: "15-20분",
  totalQuestions: 77,
  categories: {
    receptive: "수용언어 (39문항)",
    expressive: "표현언어 (38문항)"
  },
  ageRanges: ["6-12개월", "13-18개월", "19-24개월", "25-30개월", "31-36개월"],
  features: [
    "연령별 맞춤 문항",
    "수용/표현언어 분석",
    "발달 수준 평가",
    "상세 AI 해석"
  ]
};