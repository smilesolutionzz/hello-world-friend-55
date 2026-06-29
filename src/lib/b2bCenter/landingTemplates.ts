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

export type LandingTheme = "light" | "dark" | "pastel";

export interface LandingConfig {
  template: LandingTemplateKey;
  hero_badge?: string;
  hero_title?: string;
  hero_subtitle?: string;
  strengths: string[]; // 3개 체크리스트
  specialties: string[]; // 태그
  cta_label?: string;
  region?: string;
  highlight?: string; // 강조 한줄
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
  };
}

export function resolveLandingCopy(name: string, config: LandingConfig) {
  const meta = TEMPLATE_META[config.template] ?? TEMPLATE_META.dev_center;
  const heroTitle = (config.hero_title?.trim() || meta.hero_title).split("{name}").join(name);
  const heroSub = config.hero_subtitle?.trim() || meta.hero_subtitle;
  const heroBadge = config.hero_badge?.trim() || meta.hero_badge;
  const cta = config.cta_label?.trim() || meta.cta_label;
  const highlight = config.highlight?.trim() || meta.highlight || "";
  return { meta, heroTitle, heroSub, heroBadge, cta, highlight };
}
