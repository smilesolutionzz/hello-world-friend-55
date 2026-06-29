// Marketing Studio - Landing template definitions
// 기관 유형별 + 캠페인형 템플릿. 센터장 입력값으로 자동 치환.

export type LandingTemplateKey =
  | "dev_center"
  | "psych_center"
  | "day_activity"
  | "lead_capture"
  | "free_webinar"
  | "digital_file";

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
  highlight?: string; // 강조 한줄 (예: "단 3초 만에")
}

export interface TemplateMeta {
  label: string;
  category: "메인 페이지" | "랜딩 페이지";
  theme: LandingTheme;
  accent: "gold" | "blue" | "green" | "lime" | "pink";
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
    label: "발달센터 메인",
    category: "메인 페이지",
    theme: "light",
    accent: "gold",
    hero_badge: "발달지원 전문기관",
    hero_title: "{name} · 아이의 발달, 곁에서 함께합니다",
    hero_subtitle: "임상 경력 치료사와 부모를 잇는 발달지원 전문기관",
    cta_label: "상담 문의하기",
    defaultSpecialties: ["언어치료", "감각통합", "인지학습", "사회성"],
    defaultStrengths: [
      "주 1회 부모 피드백 리포트 제공",
      "치료사 1:1 매칭 후 회기 진행",
      "월 단위 발달 변화량 추적",
    ],
  },
  psych_center: {
    label: "심리상담센터 메인",
    category: "메인 페이지",
    theme: "light",
    accent: "blue",
    hero_badge: "공인 심리상담",
    hero_title: "{name} · 마음의 균형을 회복하는 공간",
    hero_subtitle: "공인 상담심리사와 함께하는 개인·가족 상담",
    cta_label: "상담 예약 문의",
    defaultSpecialties: ["우울/불안", "관계갈등", "트라우마", "청소년"],
    defaultStrengths: [
      "초기상담 50분 / 비밀보장 1:1",
      "임상심리사·상담심리사 자격 확인",
      "장기 회기 흐름을 보호자와 함께 설계",
    ],
  },
  day_activity: {
    label: "주간활동센터 메인",
    category: "메인 페이지",
    theme: "light",
    accent: "green",
    hero_badge: "성인 발달장애 주간활동",
    hero_title: "{name} · 하루를 안전하게, 의미 있게",
    hero_subtitle: "성인 발달장애인을 위한 주간활동 전문기관",
    cta_label: "이용 문의하기",
    defaultSpecialties: ["일상생활훈련", "직업적응", "지역사회참여", "예술활동"],
    defaultStrengths: [
      "사회복지사·생활지도원 상시 근무",
      "월간 활동 리포트 가정 전달",
      "차량 안전 운영 및 식사 제공",
    ],
  },
  lead_capture: {
    label: "이메일/전화 리드수집",
    category: "랜딩 페이지",
    theme: "dark",
    accent: "pink",
    hero_badge: "고성과 상담 시스템",
    hero_title: "광고만으로 상담이 늘지 않을 때, 진짜 구조를 바꿔드립니다",
    hero_subtitle: "실무자 1명으로도 가능한 상담 예약 구조",
    highlight: "실무자 1명",
    cta_label: "무료 컨설팅 신청",
    defaultSpecialties: ["광고 진단", "상담 자동화", "후속 메시지"],
    defaultStrengths: [
      "광고비는 쓰고 있는데 환자는 오지 않으시나요?",
      "콘텐츠도 만들고 있는데 왜 예약은 없나요?",
      "“마케팅이 어렵다” 느끼셨다면, 이 페이지를 끝까지 보세요.",
    ],
  },
  free_webinar: {
    label: "무료 웨비나 신청",
    category: "랜딩 페이지",
    theme: "pastel",
    accent: "blue",
    hero_badge: "무료 세미나",
    hero_title: "단 90분, AI 기반 상담 마케팅 전 과정 공개",
    hero_subtitle: "온라인 라이브 · 신청자 한정 다시보기 제공",
    highlight: "90분 안에 끝",
    cta_label: "무료로 자리 잡기",
    defaultSpecialties: ["AI 광고", "후속 응대", "전환율 개선"],
    defaultStrengths: [
      "프롬프트 모음집 + 템플릿 카드뉴스 제공",
      "실습 10개 시 활용법",
      "후속 메시지 자동화 4계명 강의",
    ],
  },
  digital_file: {
    label: "디지털 자료 배포",
    category: "랜딩 페이지",
    theme: "dark",
    accent: "lime",
    hero_badge: "즉시 고성과 만드는 체크리스트",
    hero_title: "광고 성과, 단 3초 만에 읽어내는 마케터 되기",
    hero_subtitle: "108가지 체크리스트로 광고비는 줄이고 전환율은 자연스럽게 올리세요",
    highlight: "3초 만에",
    cta_label: "지금 바로 받기",
    defaultSpecialties: ["체크리스트", "PDF", "프롬프트"],
    defaultStrengths: [
      "복잡한 설정 없이 바로 적용 가능",
      "전환을 올리는 카피 36개 모음",
      "보호자/내담자 메시지 템플릿 동봉",
    ],
  },
};

export function emptyLandingConfig(template: LandingTemplateKey = "dev_center"): LandingConfig {
  const meta = TEMPLATE_META[template];
  return {
    template,
    hero_badge: "",
    hero_title: "",
    hero_subtitle: "",
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
