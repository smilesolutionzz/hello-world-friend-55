// AIH 독자개발 프리미엄 ADHD 종합평가 도구
// 본 검사는 AIH 플랫폼에서 완전히 새롭게 창작한 독창적 ADHD 평가시스템입니다.

export const premiumAdhdAssessmentInfo = {
  title: "AIH 독창적 ADHD 종합평가",
  subtitle: "맞춤형 다차원 평가 시스템",
  description: "과학적 근거 기반의 창의적 ADHD 증상 분석과 AI 전문가급 해석을 제공합니다",
  features: [
    "과학적 근거 기반 독창적 진단 문항",
    "연령별 맞춤 평가 시스템",
    "부주의/과잉행동/충동성 세분화 분석",
    "실행기능 장애 정밀평가",
    "동반질환 위험도 스크리닝",
    "일상생활 기능 영향 측정",
    "AI 기반 전문가급 심층 분석"
  ],
  duration: "15-20분",
  targetAge: "아동청소년 및 성인",
  category: "프리미엄 ADHD",
  priority: 1,
  highlight: true,
  questions_count: 72,
  premium_features: [
    "과학적 근거 기반 정밀 증상 분석",
    "ADHD 하위유형 세분화 판별",
    "실행기능 장애 정도 정밀측정",
    "동반질환 위험도 다차원 평가",
    "개인맞춤 치료방향 구체 제시",
    "AI 기반 전문가급 심층 해석"
  ],
  disclaimer: "본 검사는 AIH에서 과학적 근거를 바탕으로 완전히 새롭게 창작한 독창적 ADHD 종합평가 도구입니다."
};

// ADHD 핵심 증상 영역별 문항
export const premiumAdhdQuestions = {
  // 1. 부주의 증상 (18문항)
  inattention: [
    {
      id: "adhd_inatt_01",
      text: "세세한 부분에 주의를 기울이지 못하거나 학업, 업무에서 부주의한 실수를 자주 합니다",
      category: "inattention",
      subcategory: "attention_to_detail",
      clinical_reference: "주의집중 영역 1",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_inatt_02", 
      text: "과업이나 놀이 활동에서 지속적으로 주의를 집중하는 데 어려움이 있습니다",
      category: "inattention",
      subcategory: "sustained_attention",
      dsm5_criteria: "A2",
      severity_weight: 4,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_inatt_03",
      text: "직접적으로 말을 걸어도 듣지 않는 것처럼 보입니다",
      category: "inattention", 
      subcategory: "listening",
      dsm5_criteria: "A3",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_inatt_04",
      text: "지시를 따라하지 못하고 학업이나 업무를 끝내지 못합니다",
      category: "inattention",
      subcategory: "task_completion",
      dsm5_criteria: "A4",
      severity_weight: 4,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_inatt_05",
      text: "과업과 활동을 체계적으로 정리하는 데 어려움이 있습니다",
      category: "inattention",
      subcategory: "organization",
      dsm5_criteria: "A5",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_inatt_06",
      text: "지속적인 정신적 노력을 요구하는 과업을 피하거나 싫어하거나 reluctantly 참여합니다",
      category: "inattention",
      subcategory: "mental_effort_avoidance",
      dsm5_criteria: "A6", 
      severity_weight: 4,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_inatt_07",
      text: "과업이나 활동에 필요한 물건들을 자주 잃어버립니다",
      category: "inattention",
      subcategory: "losing_things",
      dsm5_criteria: "A7",
      severity_weight: 2,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_inatt_08",
      text: "외부 자극에 의해 쉽게 주의가 산만해집니다",
      category: "inattention",
      subcategory: "distractibility",
      dsm5_criteria: "A8",
      severity_weight: 4,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_inatt_09",
      text: "일상 활동에서 자주 건망증을 보입니다",
      category: "inattention",
      subcategory: "forgetfulness",
      dsm5_criteria: "A9",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    // 추가 부주의 세부 평가 문항
    {
      id: "adhd_inatt_10",
      text: "긴 글이나 복잡한 지시사항을 끝까지 읽기 어려워합니다",
      category: "inattention",
      subcategory: "reading_comprehension_persistence",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_inatt_11",
      text: "회의나 수업 중에 마음이 다른 곳으로 자주 떠납니다",
      category: "inattention",
      subcategory: "mind_wandering",
      severity_weight: 3,
      age_relevance: ["adolescent", "adult"]
    },
    {
      id: "adhd_inatt_12",
      text: "중요한 약속이나 마감일을 자주 잊어버립니다",
      category: "inattention",
      subcategory: "time_management",
      severity_weight: 4,
      age_relevance: ["adolescent", "adult"]
    },
    {
      id: "adhd_inatt_13",
      text: "한 번에 여러 가지 일을 처리하는 것이 매우 어렵습니다",
      category: "inattention",
      subcategory: "multitasking",
      severity_weight: 3,
      age_relevance: ["adolescent", "adult"]
    },
    {
      id: "adhd_inatt_14",
      text: "책상이나 방이 항상 어수선하고 정리되지 않습니다",
      category: "inattention",
      subcategory: "environmental_organization",
      severity_weight: 2,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_inatt_15",
      text: "시작한 프로젝트나 과제를 끝까지 완성하지 못하는 경우가 많습니다",
      category: "inattention",
      subcategory: "project_completion",
      severity_weight: 4,
      age_relevance: ["adolescent", "adult"]
    },
    {
      id: "adhd_inatt_16",
      text: "세부사항보다는 전체적인 그림에만 관심을 가집니다",
      category: "inattention",
      subcategory: "detail_vs_big_picture",
      severity_weight: 2,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_inatt_17",
      text: "반복적인 작업을 할 때 실수가 증가합니다",
      category: "inattention",
      subcategory: "repetitive_task_accuracy",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_inatt_18",
      text: "관심 없는 주제의 대화에서는 집중하기 어려워합니다",
      category: "inattention",
      subcategory: "selective_attention_interest",
      severity_weight: 2,
      age_relevance: ["child", "adolescent", "adult"]
    }
  ],

  // 2. 과잉행동 증상 (18문항)
  hyperactivity: [
    {
      id: "adhd_hyper_01",
      text: "손발을 가만히 두지 못하거나 의자에 앉아서도 몸을 꼼지락거립니다",
      category: "hyperactivity",
      subcategory: "fidgeting",
      dsm5_criteria: "B1",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_hyper_02",
      text: "앉아 있어야 하는 상황에서 자리를 떠납니다",
      category: "hyperactivity",
      subcategory: "leaving_seat",
      dsm5_criteria: "B2",
      severity_weight: 4,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_hyper_03",
      text: "부적절한 상황에서 지나치게 뛰어다니거나 기어오릅니다",
      category: "hyperactivity",
      subcategory: "inappropriate_running_climbing",
      dsm5_criteria: "B3",
      severity_weight: 4,
      age_relevance: ["child", "adolescent"]
    },
    {
      id: "adhd_hyper_04",
      text: "조용한 여가 활동이나 놀이에 참여하는 것이 어렵습니다",
      category: "hyperactivity",
      subcategory: "quiet_activities_difficulty",
      dsm5_criteria: "B4",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_hyper_05",
      text: "항상 '엔진이 돌아가는' 것처럼 행동하거나 무언가에 쫓기는 것처럼 행동합니다",
      category: "hyperactivity",
      subcategory: "driven_by_motor",
      dsm5_criteria: "B5",
      severity_weight: 4,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_hyper_06",
      text: "말을 지나치게 많이 합니다",
      category: "hyperactivity",
      subcategory: "excessive_talking",
      dsm5_criteria: "B6",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    // 추가 과잉행동 세부 평가 문항
    {
      id: "adhd_hyper_07",
      text: "영화관이나 극장에서 오랫동안 가만히 앉아있기 힘들어합니다",
      category: "hyperactivity",
      subcategory: "sustained_sitting",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_hyper_08",
      text: "긴 줄을 서서 기다리는 것을 매우 힘들어합니다",
      category: "hyperactivity",
      subcategory: "waiting_difficulty",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_hyper_09",
      text: "집에서도 계속 움직이고 있어야 편안함을 느낍니다",
      category: "hyperactivity",
      subcategory: "home_restlessness",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_hyper_10",
      text: "손으로 무언가를 만지작거리거나 펜을 돌리는 등의 행동을 자주 합니다",
      category: "hyperactivity",
      subcategory: "object_fidgeting",
      severity_weight: 2,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_hyper_11",
      text: "다리를 떨거나 발을 까딱거리는 행동을 자주 합니다",
      category: "hyperactivity",
      subcategory: "leg_foot_movement",
      severity_weight: 2,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_hyper_12",
      text: "내부적으로 안절부절못하는 느낌이 자주 듭니다",
      category: "hyperactivity",
      subcategory: "internal_restlessness",
      severity_weight: 3,
      age_relevance: ["adolescent", "adult"]
    },
    {
      id: "adhd_hyper_13",
      text: "에너지 수준이 다른 사람들보다 현저히 높습니다",
      category: "hyperactivity",
      subcategory: "high_energy_level",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_hyper_14",
      text: "하루 종일 활동적이며 쉽게 피로해하지 않습니다",
      category: "hyperactivity",
      subcategory: "sustained_energy",
      severity_weight: 2,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_hyper_15",
      text: "조용히 휴식을 취하는 것이 어렵고 불편합니다",
      category: "hyperactivity",
      subcategory: "rest_difficulty",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_hyper_16",
      text: "잠들기 전에도 몸이 계속 움직이고 싶어합니다",
      category: "hyperactivity",
      subcategory: "bedtime_restlessness",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_hyper_17",
      text: "정적인 환경보다는 역동적인 환경을 선호합니다",
      category: "hyperactivity",
      subcategory: "environment_preference",
      severity_weight: 2,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_hyper_18",
      text: "몸을 사용하는 활동에서 더 높은 집중력을 보입니다",
      category: "hyperactivity",
      subcategory: "kinesthetic_focus",
      severity_weight: 1,
      age_relevance: ["child", "adolescent", "adult"]
    }
  ],

  // 3. 충동성 증상 (18문항)
  impulsivity: [
    {
      id: "adhd_imp_01",
      text: "질문이 끝나기 전에 성급하게 대답합니다",
      category: "impulsivity",
      subcategory: "blurting_answers",
      dsm5_criteria: "B7",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_imp_02",
      text: "자신의 차례를 기다리는 데 어려움이 있습니다",
      category: "impulsivity",
      subcategory: "waiting_turn",
      dsm5_criteria: "B8",
      severity_weight: 4,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_imp_03",
      text: "다른 사람을 방해하거나 간섭합니다",
      category: "impulsivity",
      subcategory: "interrupting_intruding",
      dsm5_criteria: "B9",
      severity_weight: 4,
      age_relevance: ["child", "adolescent", "adult"]
    },
    // 추가 충동성 세부 평가 문항
    {
      id: "adhd_imp_04",
      text: "중요한 결정을 성급하게 내리는 경우가 많습니다",
      category: "impulsivity",
      subcategory: "hasty_decisions",
      severity_weight: 4,
      age_relevance: ["adolescent", "adult"]
    },
    {
      id: "adhd_imp_05",
      text: "결과를 생각하지 않고 행동하는 경우가 많습니다",
      category: "impulsivity",
      subcategory: "consequence_ignoring",
      severity_weight: 4,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_imp_06",
      text: "감정이 격해지면 통제하기 어려워집니다",
      category: "impulsivity",
      subcategory: "emotional_regulation",
      severity_weight: 4,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_imp_07",
      text: "위험한 행동을 하면서도 그 위험성을 인식하지 못합니다",
      category: "impulsivity",
      subcategory: "risk_awareness",
      severity_weight: 4,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_imp_08",
      text: "물건을 사거나 계획을 세울 때 충동적으로 결정합니다",
      category: "impulsivity",
      subcategory: "purchasing_planning_impulsivity",
      severity_weight: 3,
      age_relevance: ["adolescent", "adult"]
    },
    {
      id: "adhd_imp_09",
      text: "대화 중에 상대방이 말하는 동안 끼어들기를 자주 합니다",
      category: "impulsivity",
      subcategory: "conversation_interruption",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_imp_10",
      text: "즉석에서 계획을 바꾸는 것을 선호합니다",
      category: "impulsivity",
      subcategory: "plan_changing",
      severity_weight: 2,
      age_relevance: ["adolescent", "adult"]
    },
    {
      id: "adhd_imp_11",
      text: "하고 싶은 말이 있으면 참지 못하고 바로 표현합니다",
      category: "impulsivity",
      subcategory: "verbal_impulsivity",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_imp_12",
      text: "게임이나 활동에서 규칙을 무시하고 행동하는 경우가 있습니다",
      category: "impulsivity",
      subcategory: "rule_breaking",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_imp_13",
      text: "욕구를 참거나 지연시키는 것이 매우 어렵습니다",
      category: "impulsivity",
      subcategory: "delay_gratification",
      severity_weight: 4,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_imp_14",
      text: "화가 나면 물건을 던지거나 문을 세게 닫는 등의 행동을 합니다",
      category: "impulsivity",
      subcategory: "aggressive_impulses",
      severity_weight: 4,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_imp_15",
      text: "신중하게 생각할 시간이 주어져도 첫 번째 떠오른 답을 선택합니다",
      category: "impulsivity",
      subcategory: "first_response_preference",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_imp_16",
      text: "다른 사람의 물건을 허락 없이 사용하는 경우가 있습니다",
      category: "impulsivity",
      subcategory: "boundary_violation",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_imp_17",
      text: "스트레스 상황에서 더욱 충동적으로 행동합니다",
      category: "impulsivity",
      subcategory: "stress_related_impulsivity",
      severity_weight: 4,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_imp_18",
      text: "재미있어 보이는 활동에는 즉시 참여하고 싶어합니다",
      category: "impulsivity",
      subcategory: "immediate_gratification_seeking",
      severity_weight: 2,
      age_relevance: ["child", "adolescent", "adult"]
    }
  ],

  // 4. 실행기능 장애 (18문항)
  executive_dysfunction: [
    {
      id: "adhd_exec_01",
      text: "복잡한 과제를 작은 단위로 나누어 계획하는 것이 어렵습니다",
      category: "executive_dysfunction",
      subcategory: "task_planning",
      severity_weight: 4,
      age_relevance: ["adolescent", "adult"]
    },
    {
      id: "adhd_exec_02",
      text: "시간 관리가 매우 어려워 자주 지각하거나 마감일을 놓칩니다",
      category: "executive_dysfunction",
      subcategory: "time_management",
      severity_weight: 4,
      age_relevance: ["adolescent", "adult"]
    },
    {
      id: "adhd_exec_03",
      text: "우선순위를 정하는 것이 어려워 중요하지 않은 일에 시간을 많이 씁니다",
      category: "executive_dysfunction",
      subcategory: "prioritization",
      severity_weight: 4,
      age_relevance: ["adolescent", "adult"]
    },
    {
      id: "adhd_exec_04",
      text: "작업 기억이 부족하여 여러 단계의 지시를 기억하기 어렵습니다",
      category: "executive_dysfunction",
      subcategory: "working_memory",
      severity_weight: 4,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_exec_05",
      text: "인지적 유연성이 부족하여 계획 변경에 어려움을 겪습니다",
      category: "executive_dysfunction",
      subcategory: "cognitive_flexibility",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_exec_06",
      text: "자기 모니터링이 어려워 실수를 알아차리지 못합니다",
      category: "executive_dysfunction",
      subcategory: "self_monitoring",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_exec_07",
      text: "목표 지향적 행동을 유지하는 것이 어렵습니다",
      category: "executive_dysfunction",
      subcategory: "goal_directed_behavior",
      severity_weight: 4,
      age_relevance: ["adolescent", "adult"]
    },
    {
      id: "adhd_exec_08",
      text: "정신적 피로가 빠르게 오며 인지적 과제 수행이 어려워집니다",
      category: "executive_dysfunction",
      subcategory: "mental_fatigue",
      severity_weight: 3,
      age_relevance: ["adolescent", "adult"]
    },
    {
      id: "adhd_exec_09",
      text: "멀티태스킹이 극도로 어려워 한 번에 하나씩만 처리할 수 있습니다",
      category: "executive_dysfunction",
      subcategory: "multitasking_difficulty",
      severity_weight: 4,
      age_relevance: ["adolescent", "adult"]
    },
    {
      id: "adhd_exec_10",
      text: "정보를 체계적으로 조직화하고 분류하는 데 어려움이 있습니다",
      category: "executive_dysfunction",
      subcategory: "information_organization",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_exec_11",
      text: "문제 해결 시 다양한 접근법을 고려하지 못하고 한 가지 방법에만 집착합니다",
      category: "executive_dysfunction",
      subcategory: "problem_solving_flexibility",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_exec_12",
      text: "과제 전환이 어려워 이전 활동에서 벗어나는 데 시간이 많이 걸립니다",
      category: "executive_dysfunction",
      subcategory: "task_switching",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_exec_13",
      text: "추상적 사고보다는 구체적이고 단순한 사고를 선호합니다",
      category: "executive_dysfunction",
      subcategory: "abstract_thinking_difficulty",
      severity_weight: 2,
      age_relevance: ["adolescent", "adult"]
    },
    {
      id: "adhd_exec_14",
      text: "스트레스 상황에서 인지적 기능이 현저히 저하됩니다",
      category: "executive_dysfunction",
      subcategory: "stress_cognitive_impact",
      severity_weight: 3,
      age_relevance: ["adolescent", "adult"]
    },
    {
      id: "adhd_exec_15",
      text: "장기적 목표보다는 즉각적인 보상을 추구하는 경향이 강합니다",
      category: "executive_dysfunction",
      subcategory: "immediate_vs_delayed_rewards",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_exec_16",
      text: "일의 순서를 기억하고 따라가는 것이 어렵습니다",
      category: "executive_dysfunction",
      subcategory: "sequence_memory",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    },
    {
      id: "adhd_exec_17",
      text: "자신의 수행 능력을 정확히 평가하지 못합니다",
      category: "executive_dysfunction",
      subcategory: "metacognitive_awareness",
      severity_weight: 3,
      age_relevance: ["adolescent", "adult"]
    },
    {
      id: "adhd_exec_18",
      text: "효율적인 학습 전략을 스스로 개발하거나 적용하지 못합니다",
      category: "executive_dysfunction",
      subcategory: "learning_strategy_deficits",
      severity_weight: 3,
      age_relevance: ["child", "adolescent", "adult"]
    }
  ]
};

// 연령별 추가 질문 세트
export const ageSpecificAdhdQuestions = {
  child: [
    {
      id: "adhd_child_01",
      text: "놀이 시간에 규칙을 지키기 어려워합니다",
      category: "child_specific",
      subcategory: "play_rule_following",
      severity_weight: 3
    },
    {
      id: "adhd_child_02", 
      text: "또래 친구들과 협력하여 과제를 수행하는 것이 어렵습니다",
      category: "child_specific",
      subcategory: "peer_cooperation",
      severity_weight: 3
    },
    {
      id: "adhd_child_03",
      text: "교실에서 자리에서 일어나거나 돌아다닙니다",
      category: "child_specific",
      subcategory: "classroom_behavior",
      severity_weight: 4
    }
  ],
  adolescent: [
    {
      id: "adhd_adol_01",
      text: "숙제나 과제를 체계적으로 관리하는 데 어려움이 있습니다",
      category: "adolescent_specific",
      subcategory: "homework_management",
      severity_weight: 4
    },
    {
      id: "adhd_adol_02",
      text: "운전 시 주의집중에 어려움을 보입니다",
      category: "adolescent_specific",
      subcategory: "driving_attention",
      severity_weight: 4
    },
    {
      id: "adhd_adol_03",
      text: "미래 계획을 세우고 실행하는 데 어려움이 있습니다",
      category: "adolescent_specific",
      subcategory: "future_planning",
      severity_weight: 3
    }
  ],
  adult: [
    {
      id: "adhd_adult_01",
      text: "직장에서의 업무 성과가 주의집중 문제로 인해 저하됩니다",
      category: "adult_specific",
      subcategory: "work_performance",
      severity_weight: 4
    },
    {
      id: "adhd_adult_02",
      text: "재정 관리나 청구서 관리에 어려움을 겪습니다",
      category: "adult_specific",
      subcategory: "financial_management",
      severity_weight: 3
    },
    {
      id: "adhd_adult_03",
      text: "인간관계에서 약속을 지키지 못해 갈등이 생깁니다",
      category: "adult_specific",
      subcategory: "relationship_commitment",
      severity_weight: 4
    }
  ]
};

// 동반질환 선별 문항
export const comorbidityScreening = {
  anxiety: [
    {
      id: "comor_anx_01",
      text: "ADHD 증상으로 인해 불안감이 증가합니다",
      category: "comorbid_anxiety",
      severity_weight: 3
    },
    {
      id: "comor_anx_02",
      text: "사회적 상황에서 실수할까봐 과도하게 걱정합니다",
      category: "comorbid_anxiety", 
      severity_weight: 3
    }
  ],
  depression: [
    {
      id: "comor_dep_01",
      text: "ADHD로 인한 반복적인 실패로 우울감을 느낍니다",
      category: "comorbid_depression",
      severity_weight: 4
    },
    {
      id: "comor_dep_02",
      text: "자존감이 낮아지고 자신감이 부족합니다",
      category: "comorbid_depression",
      severity_weight: 3
    }
  ],
  learning_difficulties: [
    {
      id: "comor_ld_01",
      text: "읽기, 쓰기, 수학 등 특정 학습 영역에서 지속적인 어려움이 있습니다",
      category: "comorbid_learning_difficulties",
      severity_weight: 4
    }
  ]
};

// 일상생활 기능 평가
export const functionalImpairment = {
  academic: [
    {
      id: "func_acad_01",
      text: "학업 성취도가 능력에 비해 현저히 낮습니다",
      category: "academic_functioning",
      severity_weight: 4
    },
    {
      id: "func_acad_02",
      text: "시험 성적이 평소 실력보다 낮게 나옵니다",
      category: "academic_functioning",
      severity_weight: 3
    }
  ],
  social: [
    {
      id: "func_soc_01",
      text: "친구 관계 유지에 어려움이 있습니다",
      category: "social_functioning",
      severity_weight: 4
    },
    {
      id: "func_soc_02",
      text: "사회적 규칙을 이해하고 따르는 데 어려움이 있습니다",
      category: "social_functioning",
      severity_weight: 3
    }
  ],
  occupational: [
    {
      id: "func_occ_01",
      text: "직장에서의 업무 효율성이 떨어집니다",
      category: "occupational_functioning",
      severity_weight: 4
    },
    {
      id: "func_occ_02",
      text: "상사나 동료와의 관계에서 어려움을 겪습니다",
      category: "occupational_functioning",
      severity_weight: 3
    }
  ]
};