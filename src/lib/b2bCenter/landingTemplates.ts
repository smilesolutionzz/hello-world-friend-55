// Marketing Studio - Landing template definitions
// 발달·심리·돌봄 기관용 7종 템플릿. 센터명만 바꿔도 바로 공개 가능하도록 완성된 예시 문구로 시작.

export type LandingTemplateKey =
  | "dev_center"
  | "psych_center"
  | "day_activity"
  | "daycare"
  | "kindergarten"
  | "nursing_home"
  | "nursing_hospital";

export type LandingTheme = "light" | "pastel";

export interface SolutionItem {
  icon: "heart" | "users" | "clipboard" | "shield" | "sparkles" | "leaf" | "stethoscope" | "school" | "smile";
  title: string;
  desc: string;
}

export interface TrustItem {
  label: string;
  value: string;
}

export interface LandingConfig {
  template: LandingTemplateKey;
  hero_badge?: string;
  hero_title?: string;
  hero_subtitle?: string;
  strengths: string[]; // 3개 체크리스트
  specialties: string[]; // 태그
  cta_label?: string;
  region?: string;
  highlight?: string;
  // 새 섹션 (선택 — 비우면 템플릿 기본값 사용)
  concerns_title?: string;
  concerns?: string[]; // 3개 부모/보호자 고민
  solutions_title?: string;
  solutions?: SolutionItem[]; // 3개 솔루션
  trust_title?: string;
  trust?: TrustItem[]; // 3~4개 신뢰 요소
}

export interface TemplateMeta {
  label: string;
  category: "발달·심리" | "돌봄·요양";
  theme: LandingTheme;
  accent: "gold" | "blue" | "green" | "pink" | "amber";
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  cta_label: string;
  defaultSpecialties: string[];
  defaultStrengths: string[];
  highlight?: string;
  defaultConcernsTitle: string;
  defaultConcerns: string[];
  defaultSolutionsTitle: string;
  defaultSolutions: SolutionItem[];
  defaultTrustTitle: string;
  defaultTrust: TrustItem[];
}

export const TEMPLATE_META: Record<LandingTemplateKey, TemplateMeta> = {
  dev_center: {
    label: "발달지원센터",
    category: "발달·심리",
    theme: "light",
    accent: "gold",
    hero_badge: "발달지원 전문기관",
    hero_title: "{name} · 아이의 발달, 곁에서 함께합니다",
    hero_subtitle: "임상 경력 치료사와 부모를 잇는 1:1 발달지원 전문기관입니다.",
    cta_label: "초기 상담 문의하기",
    highlight: "곁에서 함께",
    defaultSpecialties: ["언어치료", "감각통합", "인지학습", "사회성훈련", "놀이치료"],
    defaultStrengths: [
      "주 1회 부모님께 회기 리포트를 전달드립니다",
      "치료사 1:1 매칭 후 정기 회기로 진행됩니다",
      "월 단위로 발달 변화량을 수치로 추적합니다",
    ],
    defaultConcernsTitle: "이런 고민, 있으셨나요?",
    defaultConcerns: [
      "또래보다 말이 느리거나 표현이 짧아 걱정이에요.",
      "여러 기관을 다녀봤지만, 우리 아이에게 맞는 곳을 찾기 어려워요.",
      "수업 후 어떤 활동을 했는지, 변화가 있는지 잘 알기 어려워요.",
    ],
    defaultSolutionsTitle: "저희는 이렇게 돕습니다",
    defaultSolutions: [
      { icon: "clipboard", title: "초기 발달 평가", desc: "표준화 도구와 임상 관찰을 통해 강점·과제를 함께 정리해 드립니다." },
      { icon: "users", title: "1:1 맞춤 회기", desc: "치료 영역별 전담 치료사가 아이의 속도에 맞춘 회기를 설계합니다." },
      { icon: "heart", title: "주간·월간 리포트", desc: "회기 내용과 변화 추이를 보호자께 정기적으로 공유합니다." },
    ],
    defaultTrustTitle: "안심하고 맡기실 수 있는 이유",
    defaultTrust: [
      { label: "치료사 평균 임상 경력", value: "5년 이상" },
      { label: "회기당 전담 1:1", value: "100%" },
      { label: "보호자 리포트 주기", value: "주 1회" },
    ],
  },
  psych_center: {
    label: "심리상담센터",
    category: "발달·심리",
    theme: "light",
    accent: "blue",
    hero_badge: "공인 상담심리사",
    hero_title: "{name} · 마음의 균형을 회복하는 공간",
    hero_subtitle: "공인 상담심리사와 함께하는 개인·부부·가족 상담 센터입니다.",
    cta_label: "상담 예약 문의",
    highlight: "균형을 회복",
    defaultSpecialties: ["우울/불안", "관계갈등", "트라우마", "청소년", "직장스트레스"],
    defaultStrengths: [
      "초기상담 50분, 비밀보장 1:1 진행",
      "임상심리사·상담심리사 자격을 사전 안내드립니다",
      "장기 회기 흐름을 보호자와 함께 설계합니다",
    ],
    defaultConcernsTitle: "혹시 이런 마음이신가요?",
    defaultConcerns: [
      "요즘 마음이 자주 가라앉고, 일상에 집중이 어려워요.",
      "상담을 받고 싶지만 어디서부터 시작해야 할지 모르겠어요.",
      "관계나 가족 안에서 반복되는 갈등이 힘들어요.",
    ],
    defaultSolutionsTitle: "이렇게 함께 합니다",
    defaultSolutions: [
      { icon: "shield", title: "안전한 초기상담", desc: "비밀보장 원칙 아래, 부담 없는 50분 초기 상담으로 시작합니다." },
      { icon: "users", title: "전문 자격 매칭", desc: "주제와 성향에 맞는 상담심리사를 안내해 드립니다." },
      { icon: "sparkles", title: "회기 흐름 설계", desc: "단기·장기 목표를 함께 정하고 진행 상황을 정기적으로 점검합니다." },
    ],
    defaultTrustTitle: "신뢰할 수 있는 운영",
    defaultTrust: [
      { label: "보유 자격", value: "상담심리사 1·2급" },
      { label: "비밀 보장", value: "전 회기 적용" },
      { label: "초기 상담 시간", value: "50분 / 1:1" },
    ],
  },
  day_activity: {
    label: "주간활동센터 (성인 발달장애)",
    category: "돌봄·요양",
    theme: "light",
    accent: "green",
    hero_badge: "성인 발달장애 주간활동",
    hero_title: "{name} · 하루를 안전하게, 의미 있게",
    hero_subtitle: "성인 발달장애인의 자립과 사회참여를 지원하는 주간활동 전문기관입니다.",
    cta_label: "이용 문의하기",
    highlight: "안전하게, 의미 있게",
    defaultSpecialties: ["일상생활훈련", "직업적응", "지역사회참여", "예술활동", "건강증진"],
    defaultStrengths: [
      "사회복지사·생활지도원이 상시 근무합니다",
      "월간 활동 리포트를 가정에 정기 전달드립니다",
      "차량 안전 운영 및 점심·간식이 제공됩니다",
    ],
    defaultConcernsTitle: "보호자께서 자주 하시는 고민",
    defaultConcerns: [
      "성인이 된 자녀가 낮 시간을 의미 있게 보낼 곳이 필요해요.",
      "기관 내 안전 관리와 활동 내용이 잘 운영되는지 궁금해요.",
      "가정과 기관 사이의 소통이 자주 이뤄졌으면 합니다.",
    ],
    defaultSolutionsTitle: "이렇게 함께 합니다",
    defaultSolutions: [
      { icon: "leaf", title: "주간 활동 프로그램", desc: "일상생활·사회참여·여가 영역을 균형 있게 배치한 주간표를 운영합니다." },
      { icon: "shield", title: "안전 중심 운영", desc: "차량 동승 인솔, 응급 대응 매뉴얼, 출결 알림으로 안심을 더합니다." },
      { icon: "clipboard", title: "월간 활동 리포트", desc: "참여 활동과 변화를 정리해 가정에 정기적으로 공유합니다." },
    ],
    defaultTrustTitle: "운영 기준",
    defaultTrust: [
      { label: "상시 인력", value: "사회복지사·생활지도원" },
      { label: "차량 운영", value: "동승 인솔자 배치" },
      { label: "보호자 소통", value: "월간 리포트" },
    ],
  },
  daycare: {
    label: "어린이집",
    category: "돌봄·요양",
    theme: "pastel",
    accent: "amber",
    hero_badge: "안심하고 맡기는 어린이집",
    hero_title: "{name} · 아이의 첫 사회생활을 따뜻하게",
    hero_subtitle: "0~5세 영유아의 건강한 성장을 위한 보육·교육 통합 프로그램을 운영합니다.",
    cta_label: "원아 모집 / 견학 문의",
    highlight: "따뜻하게",
    defaultSpecialties: ["누리과정", "오감놀이", "유기농식단", "발달검사", "부모상담"],
    defaultStrengths: [
      "보육교사 1인당 아동 수를 법정기준 이하로 운영합니다",
      "급식·간식 식단은 매주 가정에 사전 공유됩니다",
      "월 1회 발달 관찰 노트를 부모님께 전달드립니다",
    ],
    defaultConcernsTitle: "부모님께서 가장 궁금해하시는 점",
    defaultConcerns: [
      "처음 보내는 어린이집, 우리 아이가 잘 적응할 수 있을까요?",
      "선생님 한 분이 너무 많은 아이를 보시는 건 아닌가 걱정돼요.",
      "하루 일과와 식단을 자세히 알 수 있으면 좋겠어요.",
    ],
    defaultSolutionsTitle: "이렇게 돌봐 드립니다",
    defaultSolutions: [
      { icon: "smile", title: "단계적 적응 프로그램", desc: "첫 등원부터 안정기까지, 부모님과 함께 적응 일정을 설계합니다." },
      { icon: "users", title: "법정 기준 이하 학급", desc: "교사 1인당 아동 수를 줄여 한 명 한 명을 더 살펴봅니다." },
      { icon: "clipboard", title: "매일·매주 가정 알림", desc: "일과 사진, 주간 식단, 월 1회 발달 관찰 노트를 공유합니다." },
    ],
    defaultTrustTitle: "운영 기준",
    defaultTrust: [
      { label: "학급 정원", value: "법정기준 이하" },
      { label: "식단 공유", value: "매주 사전 안내" },
      { label: "발달 관찰", value: "월 1회 노트" },
    ],
  },
  kindergarten: {
    label: "유치원",
    category: "돌봄·요양",
    theme: "light",
    accent: "blue",
    hero_badge: "누리과정 인가 유치원",
    hero_title: "{name} · 호기심이 자라는 매일의 배움터",
    hero_subtitle: "놀이 중심 누리과정과 특성화 활동으로 아이의 자기주도성을 키웁니다.",
    cta_label: "입학 설명회 신청",
    highlight: "자기주도성",
    defaultSpecialties: ["누리과정", "숲놀이", "영어/음악", "체육", "현장학습"],
    defaultStrengths: [
      "정교사 2인 담임제로 안전하게 운영됩니다",
      "주간 활동 사진과 알림장을 매일 전달합니다",
      "연 2회 학부모 상담과 발달 리포트를 제공합니다",
    ],
    defaultConcernsTitle: "학부모님께서 자주 하시는 질문",
    defaultConcerns: [
      "초등학교 입학 전, 학습과 정서가 균형 있게 자라길 바랍니다.",
      "특성화 활동이 실제로 아이에게 어떤 도움이 되는지 궁금해요.",
      "담임 선생님과 충분히 소통할 수 있는 환경인가요?",
    ],
    defaultSolutionsTitle: "이렇게 함께 키웁니다",
    defaultSolutions: [
      { icon: "school", title: "놀이 중심 누리과정", desc: "표준 누리과정 위에 자기주도성·표현력을 강화하는 주제 활동을 더합니다." },
      { icon: "leaf", title: "숲·체육·예술 특성화", desc: "신체·정서·인지를 고르게 자극하는 특성화 활동을 정규로 운영합니다." },
      { icon: "users", title: "정교사 2인 담임제", desc: "안전과 개별 관찰을 위해 학급마다 정교사 2인이 함께합니다." },
    ],
    defaultTrustTitle: "운영 기준",
    defaultTrust: [
      { label: "학급 운영", value: "정교사 2인 담임" },
      { label: "학부모 상담", value: "연 2회 정기" },
      { label: "발달 리포트", value: "학기별 제공" },
    ],
  },
  nursing_home: {
    label: "요양원 (장기요양)",
    category: "돌봄·요양",
    theme: "light",
    accent: "gold",
    hero_badge: "장기요양 입소시설",
    hero_title: "{name} · 어르신의 하루를 가족처럼 지킵니다",
    hero_subtitle: "요양보호사와 간호인력이 함께하는 24시간 안심 돌봄 시설입니다.",
    cta_label: "입소 상담 / 시설 견학",
    highlight: "가족처럼",
    defaultSpecialties: ["치매전담실", "재활프로그램", "1인실/다인실", "물리치료", "영양관리"],
    defaultStrengths: [
      "요양보호사 상시 근무, 야간 간호 인력 배치",
      "주간 활동 사진과 건강 상태를 보호자에게 공유합니다",
      "장기요양보험 적용 후 본인부담금만 안내드립니다",
    ],
    defaultConcernsTitle: "보호자께서 가장 걱정하시는 점",
    defaultConcerns: [
      "어르신이 낯선 환경에 잘 적응하실 수 있을지 걱정됩니다.",
      "야간이나 응급 상황에서 어떻게 대응하시는지 궁금합니다.",
      "비용과 장기요양보험 적용을 미리 알기 어렵습니다.",
    ],
    defaultSolutionsTitle: "이렇게 모십니다",
    defaultSolutions: [
      { icon: "heart", title: "24시간 안심 돌봄", desc: "요양보호사 상시 근무와 야간 간호 인력으로 응급 상황에 대비합니다." },
      { icon: "sparkles", title: "맞춤 케어 플랜", desc: "어르신 상태에 맞춘 식이·활동·재활 계획을 정기적으로 점검합니다." },
      { icon: "clipboard", title: "보호자 정기 소통", desc: "주간 활동 사진과 건강 상태를 보호자께 정기적으로 공유합니다." },
    ],
    defaultTrustTitle: "운영 기준",
    defaultTrust: [
      { label: "주·야간 인력", value: "요양보호사·간호인력" },
      { label: "보험 적용", value: "장기요양보험" },
      { label: "보호자 소통", value: "주간 정기 보고" },
    ],
  },
  nursing_hospital: {
    label: "요양병원",
    category: "돌봄·요양",
    theme: "light",
    accent: "pink",
    hero_badge: "의료진 상주 요양병원",
    hero_title: "{name} · 치료와 돌봄을 한 번에",
    hero_subtitle: "의사·간호사·재활치료사가 함께하는 의료중심 요양병원입니다.",
    cta_label: "입원 상담 문의",
    highlight: "치료와 돌봄",
    defaultSpecialties: ["내과전문의", "재활의학", "치매관리", "호스피스", "물리치료"],
    defaultStrengths: [
      "전문의·간호사 24시간 상주로 응급 대응 가능",
      "재활치료실·물리치료실 자체 운영",
      "보호자 면회 및 진료 결과 주 단위 공유",
    ],
    defaultConcernsTitle: "보호자께서 자주 하시는 질문",
    defaultConcerns: [
      "지속적인 치료와 돌봄이 동시에 필요한 상황입니다.",
      "야간이나 응급 시 의료진 대응이 가능한지 알고 싶어요.",
      "재활 일정과 진료 결과를 정기적으로 확인하고 싶습니다.",
    ],
    defaultSolutionsTitle: "이렇게 진료·돌봄을 제공합니다",
    defaultSolutions: [
      { icon: "stethoscope", title: "의료진 24시간 상주", desc: "전문의와 간호사가 상시 근무하여 야간 응급 상황에도 대응합니다." },
      { icon: "sparkles", title: "재활·물리치료실 운영", desc: "원내 재활·물리치료실에서 정기 회기를 통해 회복을 돕습니다." },
      { icon: "clipboard", title: "주간 진료 결과 공유", desc: "보호자께 진료 경과와 재활 일정을 정기적으로 안내드립니다." },
    ],
    defaultTrustTitle: "운영 기준",
    defaultTrust: [
      { label: "의료진 운영", value: "24시간 상주" },
      { label: "재활 인프라", value: "원내 자체 운영" },
      { label: "보호자 보고", value: "주 단위 진료 결과" },
    ],
  },
};

export function emptyLandingConfig(template: LandingTemplateKey = "dev_center"): LandingConfig {
  const meta = TEMPLATE_META[template];
  // 빈칸 대신 완성된 예시 문구로 채워서 즉시 공개 가능하게 함
  return {
    template,
    hero_badge: meta.hero_badge,
    hero_title: meta.hero_title,
    hero_subtitle: meta.hero_subtitle,
    strengths: meta.defaultStrengths.slice(),
    specialties: meta.defaultSpecialties.slice(),
    cta_label: meta.cta_label,
    region: "",
    highlight: meta.highlight ?? "",
    concerns_title: meta.defaultConcernsTitle,
    concerns: meta.defaultConcerns.slice(),
    solutions_title: meta.defaultSolutionsTitle,
    solutions: meta.defaultSolutions.map((s) => ({ ...s })),
    trust_title: meta.defaultTrustTitle,
    trust: meta.defaultTrust.map((t) => ({ ...t })),
  };
}

export function resolveLandingCopy(name: string, config: LandingConfig) {
  const meta = TEMPLATE_META[config.template] ?? TEMPLATE_META.dev_center;
  const heroTitle = (config.hero_title?.trim() || meta.hero_title).split("{name}").join(name);
  const heroSub = config.hero_subtitle?.trim() || meta.hero_subtitle;
  const heroBadge = config.hero_badge?.trim() || meta.hero_badge;
  const cta = config.cta_label?.trim() || meta.cta_label;
  const highlight = config.highlight?.trim() || meta.highlight || "";
  const concernsTitle = config.concerns_title?.trim() || meta.defaultConcernsTitle;
  const concerns = (config.concerns && config.concerns.filter((c) => c?.trim()).length > 0
    ? config.concerns
    : meta.defaultConcerns).filter((c) => c?.trim());
  const solutionsTitle = config.solutions_title?.trim() || meta.defaultSolutionsTitle;
  const solutions = (config.solutions && config.solutions.length > 0 ? config.solutions : meta.defaultSolutions);
  const trustTitle = config.trust_title?.trim() || meta.defaultTrustTitle;
  const trust = (config.trust && config.trust.length > 0 ? config.trust : meta.defaultTrust);
  return { meta, heroTitle, heroSub, heroBadge, cta, highlight, concernsTitle, concerns, solutionsTitle, solutions, trustTitle, trust };
}
