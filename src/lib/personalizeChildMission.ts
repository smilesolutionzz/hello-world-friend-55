/**
 * personalize-child-mission 호출 래퍼.
 * - 12초 per-attempt 타임아웃 (AbortController)
 * - 최대 5회 자동 재시도, 1s → 2s → 4s → 8s 지수 백오프
 * - 429/402/404/CONFIG_MISSING 등 비복구성 에러는 즉시 중단
 * - requestId 노출 + onAttempt 콜백으로 단계별 상태 전달
 */

import { supabase } from "@/integrations/supabase/client";

export interface PersonalizeArgs {
  childProfileId: string;
  day: number;
  baseMission?: string;
}

export type PersonalizePhase =
  | "preparing"     // 호출 준비
  | "calling"       // 네트워크 요청 중
  | "retrying"      // 재시도 대기/직전
  | "success"
  | "failed";

export interface PersonalizeAttemptInfo {
  phase: PersonalizePhase;
  attempt: number;          // 1-based
  maxAttempts: number;
  nextDelayMs?: number;     // retrying 단계에서 다음 시도까지 대기시간
  errorCode?: string;       // RATE_LIMIT / PAYMENT_REQUIRED / AI_GATEWAY_ERROR / TIMEOUT / NETWORK / EMPTY_RESPONSE / INTERNAL
  errorMessage?: string;
  requestId?: string;
}

export interface PersonalizeResult {
  personalLine: string;
  cached: boolean;
  requestId?: string;
  attempts: number;
}

export interface PersonalizeError extends Error {
  code: string;
  requestId?: string;
  attempts: number;
}

const TIMEOUT_MS = 12_000;
const MAX_ATTEMPTS = 5;
const BACKOFF_MS = [1000, 2000, 4000, 8000];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const TERMINAL_CODES = new Set([
  "RATE_LIMIT",
  "PAYMENT_REQUIRED",
  "PROFILE_NOT_FOUND",
  "BAD_REQUEST",
  "UNAUTHENTICATED",
  "CONFIG_MISSING",
]);

function makeError(code: string, message: string, requestId: string | undefined, attempts: number): PersonalizeError {
  const err = new Error(message) as PersonalizeError;
  err.code = code;
  err.requestId = requestId;
  err.attempts = attempts;
  return err;
}

interface InvokeError {
  code: string;
  message: string;
  requestId?: string;
}

async function callOnce(
  args: PersonalizeArgs,
  signal: AbortSignal,
): Promise<{ personalLine: string; cached: boolean; requestId?: string }> {
  let data: unknown = null;
  let error: { message?: string; context?: { status?: number; body?: unknown } } | null = null;
  try {
    const res = await supabase.functions.invoke("personalize-child-mission", {
      body: args,
      // @ts-expect-error supabase-js v2 forwards AbortSignal
      signal,
    });
    data = res.data;
    error = res.error as typeof error;
  } catch (e) {
    // 네트워크/abort
    const msg = e instanceof Error ? e.message : String(e);
    if (/abort/i.test(msg)) throw { code: "TIMEOUT", message: "요청이 12초를 초과했어요." } as InvokeError;
    throw { code: "NETWORK", message: msg || "네트워크 오류" } as InvokeError;
  }

  // 구조화된 에러 응답 (body에 code/requestId 포함될 수 있음)
  if (error) {
    const ctx = error.context;
    let body: { error?: string; code?: string; requestId?: string } = {};
    try {
      // Supabase invoke가 non-2xx 시 context.body에 raw 본문을 담을 수 있음
      const raw = ctx?.body;
      if (typeof raw === "string") body = JSON.parse(raw);
      else if (raw && typeof raw === "object") body = raw as typeof body;
    } catch { /* ignore */ }
    const status = ctx?.status;
    const code = body.code
      ?? (status === 429 ? "RATE_LIMIT"
        : status === 402 ? "PAYMENT_REQUIRED"
        : status === 404 ? "PROFILE_NOT_FOUND"
        : status === 401 ? "UNAUTHENTICATED"
        : status && status >= 500 ? "AI_GATEWAY_ERROR"
        : "INTERNAL");
    throw {
      code,
      message: body.error || error.message || "Edge Function 호출 실패",
      requestId: body.requestId,
    } as InvokeError;
  }

  const payload = (data ?? {}) as { personalLine?: string; cached?: boolean; requestId?: string };
  if (!payload.personalLine) {
    throw { code: "EMPTY_RESPONSE", message: "AI가 빈 응답을 보냈어요.", requestId: payload.requestId } as InvokeError;
  }
  return { personalLine: payload.personalLine, cached: !!payload.cached, requestId: payload.requestId };
}

export async function personalizeWithRetry(
  args: PersonalizeArgs,
  opts?: { onAttempt?: (info: PersonalizeAttemptInfo) => void; signal?: AbortSignal },
): Promise<PersonalizeResult> {
  const onAttempt = opts?.onAttempt ?? (() => {});
  let lastErr: InvokeError | null = null;

  onAttempt({ phase: "preparing", attempt: 0, maxAttempts: MAX_ATTEMPTS });

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    onAttempt({ phase: "calling", attempt, maxAttempts: MAX_ATTEMPTS });

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    if (opts?.signal) {
      opts.signal.addEventListener("abort", () => ctrl.abort(), { once: true });
    }

    try {
      const out = await callOnce(args, ctrl.signal);
      clearTimeout(timer);
      onAttempt({ phase: "success", attempt, maxAttempts: MAX_ATTEMPTS, requestId: out.requestId });
      return { ...out, attempts: attempt };
    } catch (e) {
      clearTimeout(timer);
      const ie = (e && typeof e === "object" && "code" in (e as object))
        ? (e as InvokeError)
        : { code: "INTERNAL", message: e instanceof Error ? e.message : String(e) };
      lastErr = ie;

      // 사용자가 명시적으로 abort
      if (opts?.signal?.aborted) {
        throw makeError("ABORTED", "요청이 취소됐어요.", ie.requestId, attempt);
      }

      // 비복구 에러는 즉시 중단
      if (TERMINAL_CODES.has(ie.code)) {
        onAttempt({ phase: "failed", attempt, maxAttempts: MAX_ATTEMPTS, errorCode: ie.code, errorMessage: ie.message, requestId: ie.requestId });
        throw makeError(ie.code, ie.message, ie.requestId, attempt);
      }

      if (attempt < MAX_ATTEMPTS) {
        const delay = BACKOFF_MS[attempt - 1] ?? 8000;
        onAttempt({
          phase: "retrying",
          attempt,
          maxAttempts: MAX_ATTEMPTS,
          nextDelayMs: delay,
          errorCode: ie.code,
          errorMessage: ie.message,
          requestId: ie.requestId,
        });
        await sleep(delay);
      }
    }
  }

  const code = lastErr?.code ?? "INTERNAL";
  const message = lastErr?.message ?? "개인화 호출 실패";
  onAttempt({ phase: "failed", attempt: MAX_ATTEMPTS, maxAttempts: MAX_ATTEMPTS, errorCode: code, errorMessage: message, requestId: lastErr?.requestId });
  throw makeError(code, message, lastErr?.requestId, MAX_ATTEMPTS);
}

export function describePersonalizeError(err: unknown): string {
  const code = (err as { code?: string })?.code;
  const rawMsg = err instanceof Error ? err.message : String(err);
  switch (code) {
    case "RATE_LIMIT": return "지금 호출이 많아요. 1분 뒤 다시 시도해 주세요.";
    case "PAYMENT_REQUIRED": return "이용권이 부족해요. 충전 후 다시 시도해 주세요.";
    case "PROFILE_NOT_FOUND": return "프로필을 찾을 수 없어요. 온보딩을 다시 진행해 주세요.";
    case "UNAUTHENTICATED": return "로그인이 필요해요. 다시 로그인 후 시도해 주세요.";
    case "CONFIG_MISSING": return "AI 키 설정이 누락됐어요. 관리자에게 문의해 주세요.";
    case "TIMEOUT": return "응답이 12초를 넘었어요. 네트워크 확인 후 다시 시도해 주세요.";
    case "NETWORK": return "네트워크 연결이 끊겼어요. 잠시 후 다시 시도해 주세요.";
    case "EMPTY_RESPONSE": return "AI가 빈 응답을 보냈어요. 다시 시도해 주세요.";
    case "AI_GATEWAY_ERROR": return "AI 게이트웨이 오류로 생성에 실패했어요. 잠시 후 다시 시도해 주세요.";
    case "BAD_REQUEST": return "요청 정보가 올바르지 않아요. 페이지를 새로고침해 주세요.";
    case "ABORTED": return "요청이 취소됐어요.";
    default: return rawMsg || "맞춤 한 줄 생성에 실패했어요. 다시 시도해 주세요.";
  }
}

export function getRequestId(err: unknown): string | undefined {
  return (err as { requestId?: string })?.requestId;
}
