// 인트로 애니메이션 사용자 환경설정 + A/B 변형 할당
// - disabled: 사용자가 명시적으로 인트로를 끔
// - mode: 'locked'(고정 변형) | 'random'(매 방문마다 무작위)
// - variant: A(스케치/디오라마) / B(아크 라인업) — locked 모드일 때만 고정 사용
// - 변형/노출/전환 이벤트는 window CustomEvent로 발행해 외부 트래커가 수신

export const INTRO_KEYS = {
  shown: "aihpro:diorama-intro-shown", // 세션 1회 노출 가드
  disabled: "aihpro:intro-disabled",   // 영구 비활성화
  variant: "aihpro:intro-variant",     // 'A' | 'B' (locked 모드일 때 고정값)
  mode: "aihpro:intro-mode",           // 'locked' | 'random'
} as const;

export type IntroVariant = "A" | "B";
export type IntroMode = "locked" | "random";

const isBrowser = () => typeof window !== "undefined";

export function isIntroDisabled(): boolean {
  if (!isBrowser()) return false;
  return localStorage.getItem(INTRO_KEYS.disabled) === "1";
}

export function setIntroDisabled(disabled: boolean) {
  if (!isBrowser()) return;
  if (disabled) localStorage.setItem(INTRO_KEYS.disabled, "1");
  else localStorage.removeItem(INTRO_KEYS.disabled);
}

export function getIntroMode(): IntroMode {
  if (!isBrowser()) return "locked";
  return localStorage.getItem(INTRO_KEYS.mode) === "random" ? "random" : "locked";
}

export function setIntroMode(mode: IntroMode) {
  if (!isBrowser()) return;
  localStorage.setItem(INTRO_KEYS.mode, mode);
}

export function getIntroVariant(): IntroVariant {
  if (!isBrowser()) return "A";
  // 랜덤 모드: 매 호출마다 무작위 (저장하지 않음)
  if (getIntroMode() === "random") {
    const v: IntroVariant = Math.random() < 0.5 ? "A" : "B";
    trackIntroEvent("variant_assigned", v);
    return v;
  }
  const existing = localStorage.getItem(INTRO_KEYS.variant);
  if (existing === "A" || existing === "B") return existing;
  const assigned: IntroVariant = Math.random() < 0.5 ? "A" : "B";
  localStorage.setItem(INTRO_KEYS.variant, assigned);
  trackIntroEvent("variant_assigned", assigned);
  return assigned;
}

export function setIntroVariant(variant: IntroVariant) {
  if (!isBrowser()) return;
  localStorage.setItem(INTRO_KEYS.variant, variant);
}

export function resetIntroShown() {
  if (!isBrowser()) return;
  sessionStorage.removeItem(INTRO_KEYS.shown);
}

export function trackIntroEvent(
  event: "view" | "skip" | "complete" | "variant_assigned" | "reset",
  variant: IntroVariant,
) {
  if (!isBrowser()) return;
  window.dispatchEvent(
    new CustomEvent("aihpro:intro", { detail: { event, variant, ts: Date.now() } }),
  );
}
