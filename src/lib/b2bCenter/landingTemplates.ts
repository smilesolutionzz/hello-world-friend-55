// Marketing Studio - Landing template definitions
// 기관 유형별 기본 톤·문구. 센터장이 입력한 값으로 자동 치환.

export type LandingTemplateKey = "dev_center" | "psych_center" | "day_activity";

export interface LandingConfig {
  template: LandingTemplateKey;
  hero_title?: string;
  hero_subtitle?: string;
  strengths: string[]; // 3개
  specialties: string[]; // 태그
  cta_label?: string;
  region?: string;
  // 향후 확장: 사진, 영업시간 등
}

export const TEMPLATE_META: Record<LandingTemplateKey, {
  label: string;
  hero_title: string;
  hero_subtitle: string;
  cta_label: string;
  defaultSpecialties: string[];
  defaultStrengths: string[];
  accent: string; // gold/blue/green
}> = {
  dev_center: {
    label: "발달센터",
    hero_title: "{name} · 아이의 발달, 곁에서 함께합니다",
    hero_subtitle: "임상 경력 치료사와 부모를 잇는 발달지원 전문기관",
    cta_label: "상담 문의하기",
    defaultSpecialties: ["언어치료", "감각통합", "인지학습", "사회성"],
    defaultStrengths: [
      "주 1회 부모 피드백 리포트 제공",
      "치료사 1:1 매칭 후 회기 진행",
      "월 단위 발달 변화량 추적",
    ],
    accent: "gold",
  },
  psych_center: {
    label: "심리상담센터",
    hero_title: "{name} · 마음의 균형을 회복하는 공간",
    hero_subtitle: "공인 상담심리사와 함께하는 개인·가족 상담",
    cta_label: "상담 예약 문의",
    defaultSpecialties: ["우울/불안", "관계갈등", "트라우마", "청소년"],
    defaultStrengths: [
      "초기상담 50분 / 비밀보장 1:1",
      "임상심리사·상담심리사 자격 확인",
      "장기 회기 흐름을 보호자와 함께 설계",
    ],
    accent: "blue",
  },
  day_activity: {
    label: "주간활동센터",
    hero_title: "{name} · 하루를 안전하게, 의미 있게",
    hero_subtitle: "성인 발달장애인을 위한 주간활동 전문기관",
    cta_label: "이용 문의하기",
    defaultSpecialties: ["일상생활훈련", "직업적응", "지역사회참여", "예술활동"],
    defaultStrengths: [
      "사회복지사·생활지도원 상시 근무",
      "월간 활동 리포트 가정 전달",
      "차량 안전 운영 및 식사 제공",
    ],
    accent: "green",
  },
};

export function emptyLandingConfig(template: LandingTemplateKey = "dev_center"): LandingConfig {
  const meta = TEMPLATE_META[template];
  return {
    template,
    hero_title: "",
    hero_subtitle: "",
    strengths: meta.defaultStrengths.slice(),
    specialties: meta.defaultSpecialties.slice(),
    cta_label: meta.cta_label,
    region: "",
  };
}

export function resolveLandingCopy(name: string, config: LandingConfig) {
  const meta = TEMPLATE_META[config.template] ?? TEMPLATE_META.dev_center;
  const heroTitle = (config.hero_title?.trim() || meta.hero_title).replaceAll("{name}", name);
  const heroSub = config.hero_subtitle?.trim() || meta.hero_subtitle;
  const cta = config.cta_label?.trim() || meta.cta_label;
  return { meta, heroTitle, heroSub, cta };
}
