/**
 * Mind Track Day별 추천 검사 매핑.
 *
 * 자체 플랫폼 검사를 미션의 일부로 진행하게 만들기 위한 단일 진실 공급원.
 * - Day 1: 스트레스 (가장 보편적, 첫 진단으로 적합)
 * - Day 2: 우울감 (스트레스 다음 단계로 자연스러운 흐름)
 *
 * 라우트는 우리 플랫폼 내부 검사 화면(`/assessment?test=...`)으로 직접 진입해
 * 외부 페이지/소개 화면을 거치지 않고 바로 시작되도록 합니다.
 */

import { supabase } from "@/integrations/supabase/client";

export type MindTrackAssessmentTestKey = "stress" | "depression";

export interface AssessmentRecommendation {
  /** localStorage 키 등에 사용되는 식별자 */
  id: string;
  /** 사용자 노출 제목 */
  title: string;
  /** 1줄 설명 */
  desc: string;
  /** 인앱 라우트 — 우리 검사 컴포넌트로 직접 진입 */
  route: string;
  /** 내부 검사 키 (점수 정규화·결과 처리에 사용) */
  testKey: MindTrackAssessmentTestKey;
  /** 예상 소요 분 */
  minutes: number;
  /** 한줄 동기 — "왜 이걸 지금 해야 하는가" */
  why: string;
}

const RECS: Record<number, AssessmentRecommendation> = {
  1: {
    id: "stress-baseline",
    title: "스트레스 베이스라인 진단",
    desc: "오늘의 긴장도와 회복 여력을 객관 점수로 측정합니다",
    // 자체 플랫폼 검사로 직접 진입 (소개 페이지 우회)
    route: "/assessment?test=stress",
    testKey: "stress",
    minutes: 5,
    why: "30일 변화 그래프의 0번째 점이 됩니다. 이걸 찍어두지 않으면 변화량을 잴 수 없어요.",
  },
  2: {
    id: "mood-depression-check",
    title: "마음 무게(우울감) 진단",
    desc: "최근 2주 마음의 무게를 단계별로 짚어봅니다",
    route: "/assessment?test=depression",
    testKey: "depression",
    minutes: 6,
    why: "스트레스만으로는 보이지 않는 마음의 두 번째 층을 확인해, 미션을 더 정확히 맞춤화합니다.",
  },
};

export function getAssessmentForDay(day: number): AssessmentRecommendation | null {
  return RECS[day] ?? null;
}

/** localStorage 키 — enrollment + day 단위로 검사 완료 여부 기록 */
export function assessmentMissionStorageKey(enrollmentId: string, day: number) {
  return `mt-assessment-mission-${enrollmentId}-${day}`;
}

export function isAssessmentMissionCompleted(enrollmentId: string | undefined, day: number): boolean {
  if (!enrollmentId || typeof window === "undefined") return false;
  try {
    return !!window.localStorage.getItem(assessmentMissionStorageKey(enrollmentId, day));
  } catch {
    return false;
  }
}

export function markAssessmentMissionCompleted(enrollmentId: string, day: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      assessmentMissionStorageKey(enrollmentId, day),
      new Date().toISOString(),
    );
  } catch {
    /* noop */
  }
}

/**
 * 미션 컨텍스트로 검사 페이지에 진입할 때 location.state에 실어 보낼 페이로드.
 * 검사 완료 핸들러가 이걸 보고 mind_track_checkin에 자동 기록하고 워크북으로 돌려보냅니다.
 */
export interface MindTrackMissionState {
  from: "mind-track-mission";
  enrollmentId: string;
  day: number;
  testKey: MindTrackAssessmentTestKey;
  /** 완료 후 돌아갈 워크북 라우트 (openMission=1로 자동 회고 다이얼로그 오픈) */
  returnTo: string;
}

export function buildMissionState(
  rec: AssessmentRecommendation,
  enrollmentId: string,
  day: number,
): MindTrackMissionState {
  return {
    from: "mind-track-mission",
    enrollmentId,
    day,
    testKey: rec.testKey,
    returnTo: `/mind-track/workbook?day=${day}&openMission=1`,
  };
}

/**
 * 검사 점수를 0~10 척도(워크북 mood/energy/clarity 컬럼 호환)로 정규화.
 * 우리 검사 max는 검사별로 다르므로 average(0~3 또는 0~4) 기반으로 환산합니다.
 * - stress / depression: 보통 average 0~3 → x10/3
 * - 기본 fallback: average 0~4 → x10/4
 */
export function normalizeAssessmentScoreTo10(
  testKey: MindTrackAssessmentTestKey,
  results: { total?: number; average?: number },
): number {
  const avg = typeof results.average === "number" ? results.average : 0;
  const ratio = testKey === "stress" || testKey === "depression" ? avg / 3 : avg / 4;
  const score10 = Math.round(Math.max(0, Math.min(1, ratio)) * 10);
  return score10;
}

/**
 * 검사 점수 요약 블록 포맷 (v1).
 * - 명확한 BEGIN/END 구분자로 기존 사용자 회고와 충돌하지 않음
 * - 동일 검사가 재진입해도 기존 블록을 교체하고 사용자 회고는 보존
 * - 향후 포맷 변경 시 v1 → v2 로 마이그레이션 가능 (가드: 알 수 없는 버전은 그대로 유지)
 */
const ASSESSMENT_BLOCK_BEGIN = "<!--mt:assessment v1-->";
const ASSESSMENT_BLOCK_END = "<!--/mt:assessment-->";
const ASSESSMENT_BLOCK_RE = /<!--mt:assessment v\d+-->[\s\S]*?<!--\/mt:assessment-->\n?/g;

function buildAssessmentBlock(testTitle: string, results: { total?: number; average?: number; severity?: string }) {
  const summary = `[${testTitle}] 점수 ${results.total ?? "-"}점 · 평균 ${
    typeof results.average === "number" ? results.average.toFixed(2) : "-"
  } · 단계 ${results.severity ?? "-"}`;
  return `${ASSESSMENT_BLOCK_BEGIN}\n${summary}\n${ASSESSMENT_BLOCK_END}`;
}

/** 기존 reflection_note에서 자동 생성된 검사 요약 블록만 안전하게 제거 */
export function stripAssessmentBlocks(note: string | null | undefined): string {
  if (!note) return "";
  return note.replace(ASSESSMENT_BLOCK_RE, "").replace(/^\n+/, "").trimEnd();
}

/** 사용자가 실제로 적은 회고만 추출 (UI 표시/검증용) */
export function extractUserReflection(note: string | null | undefined): string {
  return stripAssessmentBlocks(note);
}

/**
 * 검사 결과를 mind_track_checkin 한 줄로 자동 기록하고, 미션 완료 마킹까지 처리.
 * - reflection_note: 버전드 BEGIN/END 블록으로 점수 요약을 머리에 부착 (기존 사용자 회고는 보존)
 * - mood_score: 검사 결과를 0~10으로 정규화한 값 (베이스라인 곡선용)
 * - completed: 검사 저장만으로는 절대 true 로 올리지 않음 (사용자 회고가 별도 축)
 *   → 워크북으로 복귀해서 회고 다이얼로그가 자동으로 열리도록 returnTo에 openMission=1 포함
 */
export async function recordAssessmentResultToCheckin(args: {
  state: MindTrackMissionState;
  results: { total?: number; average?: number; severity?: string };
  testTitle: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { state, results, testTitle } = args;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "not_authenticated" };

    const score10 = normalizeAssessmentScoreTo10(state.testKey, results);
    const block = buildAssessmentBlock(testTitle, results);

    // 같은 day에 이미 체크인이 있으면 update, 없으면 insert
    const { data: existing, error: selErr } = await (supabase as any)
      .from("mind_track_checkins")
      .select("id, reflection_note, completed")
      .eq("user_id", user.id)
      .eq("enrollment_id", state.enrollmentId)
      .eq("day_number", state.day)
      .maybeSingle();
    if (selErr) return { ok: false, error: selErr.message };

    // 미션 id를 알아내서 같이 묶기 (있으면)
    const { data: missionRow } = await (supabase as any)
      .from("mind_track_daily_missions")
      .select("id")
      .eq("enrollment_id", state.enrollmentId)
      .eq("day_number", state.day)
      .maybeSingle();

    // ── 가드 ───────────────────────────────────────────
    // 1) completed는 검사 저장만으로 절대 true 가 되지 않음 (기존 값 유지)
    // 2) reflection_note는 기존 자동 블록만 제거 후 새 블록 prepend → 사용자 회고는 보존
    const userReflection = stripAssessmentBlocks(existing?.reflection_note);
    const mergedNote = userReflection ? `${block}\n${userReflection}` : block;

    const basePayload: Record<string, any> = {
      user_id: user.id,
      enrollment_id: state.enrollmentId,
      day_number: state.day,
      mission_id: missionRow?.id ?? null,
      mood_score: score10,
      completed: existing?.completed ?? false, // ← 절대 true로 승격 금지
      checked_at: new Date().toISOString(),
      reflection_note: mergedNote,
    };

    if (existing) {
      const { error: upErr } = await (supabase as any)
        .from("mind_track_checkins")
        .update(basePayload)
        .eq("id", existing.id);
      if (upErr) return { ok: false, error: upErr.message };
    } else {
      const { error: insErr } = await (supabase as any)
        .from("mind_track_checkins")
        .insert(basePayload);
      if (insErr) return { ok: false, error: insErr.message };
    }

    markAssessmentMissionCompleted(state.enrollmentId, state.day);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? String(e) };
  }
}

/**
 * 재시도 헬퍼 — 일시적 네트워크 장애에 한해 최대 N회 백오프 재시도.
 * 영구 오류(인증 등)는 즉시 반환.
 */
export async function recordAssessmentResultToCheckinWithRetry(
  args: Parameters<typeof recordAssessmentResultToCheckin>[0],
  opts: { retries?: number } = {},
): Promise<{ ok: boolean; error?: string; attempts: number }> {
  const retries = opts.retries ?? 2;
  let lastErr: string | undefined;
  for (let i = 0; i <= retries; i++) {
    const res = await recordAssessmentResultToCheckin(args);
    if (res.ok) return { ok: true, attempts: i + 1 };
    lastErr = res.error;
    if (res.error === "not_authenticated") break;
    await new Promise((r) => setTimeout(r, 400 * (i + 1)));
  }
  return { ok: false, error: lastErr, attempts: retries + 1 };
}
