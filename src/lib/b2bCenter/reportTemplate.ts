/**
 * Per-center editable template for weekly & monthly parent reports.
 * Stored inside center_organizations.branding.template (JSONB) so no schema
 * change is required. Used by:
 *   - WhitelabelReportPreviewPage (editor)
 *   - SampleParentReport (monthly renderer)
 *   - TherapyNotesPage (weekly renderer + PDF)
 */

export type SectionConfig = { enabled: boolean; title: string };
export type ExtraSection = { id: string; title: string; body: string };

export type ReportTemplate = {
  monthly: {
    sections: Record<string, SectionConfig>;
    extras: ExtraSection[];
    intro: string;
    outro: string;
  };
  weekly: {
    sections: Record<string, SectionConfig>;
    extras: ExtraSection[];
    intro: string;
    outro: string;
  };
};

export const MONTHLY_SECTION_KEYS = [
  { key: "cover", defaultTitle: "표지 / 요약 지표", num: "" },
  { key: "summary", defaultTitle: "이번 달 한눈에", num: "01" },
  { key: "domains", defaultTitle: "영역별 발달 흐름", num: "02" },
  { key: "highlights", defaultTitle: "이번 달 빛났던 순간", num: "03" },
  { key: "note", defaultTitle: "담당 치료사 노트", num: "04" },
  { key: "practice", defaultTitle: "이번 달 가정 연습 제안", num: "05" },
  { key: "goals", defaultTitle: "다음 달 목표", num: "06" },
] as const;

export const WEEKLY_SECTION_KEYS = [
  { key: "greeting", defaultTitle: "보호자께 인사" },
  { key: "highlights", defaultTitle: "이번 주 하이라이트" },
  { key: "activities_summary", defaultTitle: "이번 주 활동 요약" },
  { key: "growth", defaultTitle: "관찰된 성장" },
  { key: "home_tips", defaultTitle: "가정에서 해볼 활동" },
  { key: "next_week_focus", defaultTitle: "다음 주 집중 방향" },
] as const;

/** 보호자 리포트에 추가로 넣으면 좋은 추천 섹션 — 편집기에서 한 번에 추가 */
export const SUGGESTED_MONTHLY_EXTRAS: Array<{ title: string; body: string }> = [
  { title: "이번 달 출석·결제 안내", body: "출석 회기 12회 / 잔여 바우처 8회. 다음 달 자동결제 예정일: 매월 1일." },
  { title: "센터 공지·이벤트", body: "이번 달 부모교육 특강(무료) 일정과 신청 방법을 안내드립니다." },
  { title: "보호자 Q&A 코너", body: "지난달 보호자 질문에 담당 선생님이 답변드립니다." },
  { title: "다음 회기 일정 안내", body: "다음 달 회기 일정과 휴원일을 미리 확인해주세요." },
  { title: "칭찬 스티커", body: "이번 달 우리 아이가 스스로 해낸 작은 성취 5가지." },
];

export const SUGGESTED_WEEKLY_EXTRAS: Array<{ title: string; body: string }> = [
  { title: "이번 주 준비물", body: "다음 회기에 가져오면 좋은 준비물·간식·복장 안내." },
  { title: "센터에서의 작은 일화", body: "보호자와 공유하고 싶은 따뜻한 순간 한 컷." },
  { title: "이번 주 결석/대체 회기", body: "결석한 회기와 대체 일정 안내." },
];

function buildDefaults(keys: ReadonlyArray<{ key: string; defaultTitle: string }>) {
  const out: Record<string, SectionConfig> = {};
  for (const s of keys) out[s.key] = { enabled: true, title: s.defaultTitle };
  return out;
}

export const DEFAULT_TEMPLATE: ReportTemplate = {
  monthly: { sections: buildDefaults(MONTHLY_SECTION_KEYS), extras: [], intro: "", outro: "" },
  weekly: { sections: buildDefaults(WEEKLY_SECTION_KEYS), extras: [], intro: "", outro: "" },
};

function resolveExtras(src: any): ExtraSection[] {
  if (!Array.isArray(src?.extras)) return [];
  return src.extras
    .filter((x: any) => x && typeof x === "object")
    .map((x: any, i: number) => ({
      id: typeof x.id === "string" && x.id ? x.id : `extra_${i}`,
      title: typeof x.title === "string" ? x.title : "",
      body: typeof x.body === "string" ? x.body : "",
    }))
    .filter((x: ExtraSection) => x.title.trim() || x.body.trim());
}

/** Merge a partial template (from branding.template) with defaults so every
 *  section key is present even after future template-key additions. */
export function resolveTemplate(branding: any): ReportTemplate {
  const t = branding?.template ?? {};
  const merge = (
    keys: ReadonlyArray<{ key: string; defaultTitle: string }>,
    src: any,
  ) => {
    const out: Record<string, SectionConfig> = {};
    for (const s of keys) {
      const cfg = src?.sections?.[s.key] ?? {};
      out[s.key] = {
        enabled: cfg.enabled !== false,
        title: typeof cfg.title === "string" && cfg.title.trim() ? cfg.title : s.defaultTitle,
      };
    }
    return out;
  };
  return {
    monthly: {
      sections: merge(MONTHLY_SECTION_KEYS, t.monthly),
      extras: resolveExtras(t.monthly),
      intro: typeof t.monthly?.intro === "string" ? t.monthly.intro : "",
      outro: typeof t.monthly?.outro === "string" ? t.monthly.outro : "",
    },
    weekly: {
      sections: merge(WEEKLY_SECTION_KEYS, t.weekly),
      extras: resolveExtras(t.weekly),
      intro: typeof t.weekly?.intro === "string" ? t.weekly.intro : "",
      outro: typeof t.weekly?.outro === "string" ? t.weekly.outro : "",
    },
  };
}

export function makeExtraId(): string {
  return `ex_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}
