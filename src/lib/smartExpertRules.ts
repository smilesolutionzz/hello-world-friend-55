/**
 * SmartExpertSuggestion 노출 규칙(룰 엔진)
 * - 목표(goalId)별 hesitation 시간 / 발화 가능 여부
 * - 일자별 최대 노출 횟수(MAX_PER_DAY)
 * - 쿨다운(분 단위)
 * - 시간대(quietHours) 동안 발화 금지 (urgent 제외)
 * - 영구/세션 dismiss 기억
 *
 * 모든 상태는 localStorage에 저장 (사용자/디바이스별).
 */

export type Trigger = "support" | "watch" | "report_high" | "hesitation";

export interface ShouldShowInput {
  goalId?: string | null;
  trigger: Trigger;
  now?: Date;
}

export interface ShouldShowResult {
  allow: boolean;
  reason?: string;
}

const STORE_KEY = "mt_smart_expert_state_v2";
const SESSION_DISMISS_KEY = "mt_smart_expert_dismissed_v1"; // 호환

interface StoreShape {
  /** 영구 dismiss (다시 보지 않기) */
  hardDismissedAt?: number;
  /** 노출 이력 timestamp[] (최근 14일치만 유지) */
  shownAt: number[];
  /** 마지막 노출 trigger 별 timestamp */
  lastByTrigger: Partial<Record<Trigger, number>>;
}

// ----- 룰 (목표별 / 글로벌) -----
const GLOBAL_RULES = {
  /** 24h 내 최대 노출 */
  MAX_PER_DAY: 2,
  /** 동일 trigger 쿨다운 (분) */
  COOLDOWN_MIN: {
    support: 0,        // 즉시
    report_high: 60,
    watch: 240,
    hesitation: 360,
  } as Record<Trigger, number>,
  /** 야간 quiet hours (urgent 제외) — KST 기준 */
  QUIET_HOURS: { start: 23, end: 7 },
  /** hesitation 발화 시간(초). 목표별 override 가능 */
  HESITATION_DEFAULT_SEC: 60,
};

const GOAL_OVERRIDES: Record<string, { hesitationSec?: number; disable?: Trigger[] }> = {
  // 수면 — 너무 빨리 띄우지 않음
  sleep:    { hesitationSec: 90 },
  // 스트레스 — 빨리 안내
  stress:   { hesitationSec: 45 },
  // 자기이해 — 천천히
  self:     { hesitationSec: 120, disable: ["watch"] },
  // 육아 번아웃 — hesitation 빠르게
  parenting: { hesitationSec: 50 },
};

// ----- helpers -----
function readStore(): StoreShape {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { shownAt: [], lastByTrigger: {} };
    const parsed = JSON.parse(raw) as StoreShape;
    return {
      hardDismissedAt: parsed.hardDismissedAt,
      shownAt: Array.isArray(parsed.shownAt) ? parsed.shownAt : [],
      lastByTrigger: parsed.lastByTrigger ?? {},
    };
  } catch {
    return { shownAt: [], lastByTrigger: {} };
  }
}

function writeStore(s: StoreShape) {
  try {
    // 14일 이전 기록은 가지치기
    const cutoff = Date.now() - 14 * 24 * 3600 * 1000;
    s.shownAt = s.shownAt.filter((t) => t > cutoff);
    localStorage.setItem(STORE_KEY, JSON.stringify(s));
  } catch { /* ignore */ }
}

function isQuietHour(d: Date) {
  // KST 기준 시간대 (devices 대부분 KST)
  const h = d.getHours();
  const { start, end } = GLOBAL_RULES.QUIET_HOURS;
  if (start > end) return h >= start || h < end;
  return h >= start && h < end;
}

export function isHardDismissed(): boolean {
  return !!readStore().hardDismissedAt;
}

export function isSessionDismissed(): boolean {
  try { return sessionStorage.getItem(SESSION_DISMISS_KEY) === "1"; } catch { return false; }
}

export function getHesitationMs(goalId?: string | null): number {
  const sec = (goalId && GOAL_OVERRIDES[goalId]?.hesitationSec) || GLOBAL_RULES.HESITATION_DEFAULT_SEC;
  return sec * 1000;
}

export function shouldShow({ goalId, trigger, now = new Date() }: ShouldShowInput): ShouldShowResult {
  if (isHardDismissed()) return { allow: false, reason: "hard_dismissed" };
  if (isSessionDismissed()) return { allow: false, reason: "session_dismissed" };

  // urgent(=support)는 quiet hour / cooldown / max-per-day 우회
  const isUrgent = trigger === "support";

  if (!isUrgent && isQuietHour(now)) return { allow: false, reason: "quiet_hours" };

  // 목표별 disable
  if (goalId && GOAL_OVERRIDES[goalId]?.disable?.includes(trigger)) {
    return { allow: false, reason: "goal_disabled" };
  }

  const store = readStore();

  // 일일 최대 노출
  const dayCutoff = now.getTime() - 24 * 3600 * 1000;
  const last24 = store.shownAt.filter((t) => t > dayCutoff).length;
  if (!isUrgent && last24 >= GLOBAL_RULES.MAX_PER_DAY) {
    return { allow: false, reason: "max_per_day" };
  }

  // 쿨다운
  const cooldownMin = GLOBAL_RULES.COOLDOWN_MIN[trigger] ?? 0;
  const last = store.lastByTrigger[trigger];
  if (last && now.getTime() - last < cooldownMin * 60_000) {
    return { allow: false, reason: "cooldown" };
  }

  return { allow: true };
}

export function recordShown(trigger: Trigger, now = new Date()) {
  const s = readStore();
  s.shownAt.push(now.getTime());
  s.lastByTrigger[trigger] = now.getTime();
  writeStore(s);
}

export function softDismiss() {
  try { sessionStorage.setItem(SESSION_DISMISS_KEY, "1"); } catch { /* ignore */ }
}

export function hardDismiss() {
  const s = readStore();
  s.hardDismissedAt = Date.now();
  writeStore(s);
  softDismiss();
}

export function resetSmartExpertState() {
  try {
    localStorage.removeItem(STORE_KEY);
    sessionStorage.removeItem(SESSION_DISMISS_KEY);
  } catch { /* ignore */ }
}
