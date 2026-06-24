/**
 * Per-center editable template for weekly & monthly parent reports.
 * Stored inside center_organizations.branding.template (JSONB) so no schema
 * change is required. Used by:
 *   - WhitelabelReportPreviewPage (editor)
 *   - SampleParentReport (monthly renderer)
 *   - TherapyNotesPage (weekly renderer + PDF)
 */

export type SectionConfig = { enabled: boolean; title: string };

export type ReportTemplate = {
  monthly: {
    sections: Record<string, SectionConfig>;
    intro: string;
    outro: string;
  };
  weekly: {
    sections: Record<string, SectionConfig>;
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

function buildDefaults(keys: ReadonlyArray<{ key: string; defaultTitle: string }>) {
  const out: Record<string, SectionConfig> = {};
  for (const s of keys) out[s.key] = { enabled: true, title: s.defaultTitle };
  return out;
}

export const DEFAULT_TEMPLATE: ReportTemplate = {
  monthly: { sections: buildDefaults(MONTHLY_SECTION_KEYS), intro: "", outro: "" },
  weekly: { sections: buildDefaults(WEEKLY_SECTION_KEYS), intro: "", outro: "" },
};

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
      intro: typeof t.monthly?.intro === "string" ? t.monthly.intro : "",
      outro: typeof t.monthly?.outro === "string" ? t.monthly.outro : "",
    },
    weekly: {
      sections: merge(WEEKLY_SECTION_KEYS, t.weekly),
      intro: typeof t.weekly?.intro === "string" ? t.weekly.intro : "",
      outro: typeof t.weekly?.outro === "string" ? t.weekly.outro : "",
    },
  };
}
