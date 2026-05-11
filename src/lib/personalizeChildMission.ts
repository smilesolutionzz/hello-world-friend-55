/**
 * personalize-child-mission 호출 래퍼 — 타임아웃 + 지수 백오프 재시도.
 * - 12초 타임아웃 (AbortController)
 * - 최대 3회 시도, 1s → 2s → 4s 지수 백오프
 * - 429/402는 즉시 반환 (재시도해도 의미 없음)
 */

import { supabase } from "@/integrations/supabase/client";

export interface PersonalizeArgs {
  childProfileId: string;
  day: number;
  baseMission?: string;
}

export interface PersonalizeResult {
  personalLine: string;
  cached: boolean;
}

const TIMEOUT_MS = 12_000;
const MAX_ATTEMPTS = 3;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callOnce(args: PersonalizeArgs, signal: AbortSignal): Promise<PersonalizeResult> {
  const { data, error } = await supabase.functions.invoke("personalize-child-mission", {
    body: args,
    // @ts-expect-error supabase-js v2 supports AbortSignal at fetch level
    signal,
  });
  if (error) {
    const status = (error as { context?: { status?: number } }).context?.status;
    if (status === 429) throw new Error("RATE_LIMIT");
    if (status === 402) throw new Error("PAYMENT_REQUIRED");
    throw new Error(error.message || "AI gateway error");
  }
  const line = (data as { personalLine?: string; cached?: boolean })?.personalLine;
  if (!line) throw new Error("EMPTY_RESPONSE");
  return { personalLine: line, cached: !!(data as { cached?: boolean })?.cached };
}

export async function personalizeWithRetry(args: PersonalizeArgs): Promise<PersonalizeResult> {
  let lastErr: Error | null = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      return await callOnce(args, ctrl.signal);
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error("unknown");
      // 즉시 중단 케이스
      if (lastErr.message === "RATE_LIMIT" || lastErr.message === "PAYMENT_REQUIRED") {
        throw lastErr;
      }
      if (attempt < MAX_ATTEMPTS) {
        await sleep(1000 * Math.pow(2, attempt - 1));
      }
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr ?? new Error("개인화 호출 실패");
}

export function describePersonalizeError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg === "RATE_LIMIT") return "지금 호출이 많아요. 1분 뒤 다시 시도해 주세요.";
  if (msg === "PAYMENT_REQUIRED") return "이용권이 부족해요. 충전 후 다시 시도해 주세요.";
  if (msg === "EMPTY_RESPONSE") return "AI가 빈 응답을 보냈어요. 다시 시도해 주세요.";
  if (/aborted|abort|timeout/i.test(msg)) return "응답이 12초를 넘었어요. 네트워크 확인 후 다시 시도해 주세요.";
  return "맞춤 한 줄 생성에 실패했어요. 다시 시도해 주세요.";
}
