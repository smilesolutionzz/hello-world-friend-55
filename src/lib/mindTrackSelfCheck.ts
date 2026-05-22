import { supabase } from "@/integrations/supabase/client";

export type SelfCheckLevel = "calm" | "watch" | "support";

export interface SelfCheckSavePayload {
  goalId: string;
  goalTitle: string;
  level: SelfCheckLevel;
  score: number;
  maxScore: number;
  questions: string[];
  answers: number[];
  summary?: string;
}

export interface SavedSelfCheck {
  id: string;
  share_id: string;
  goal_id: string;
  goal_title: string;
  level: SelfCheckLevel;
  score: number;
  max_score: number;
  answers: number[];
  questions: string[];
  summary: string | null;
  created_at: string;
  user_id: string | null;
}

const LOCAL_KEY = "mt_self_check_last_v1";

/** 결제 폼/배너 자동 프리필을 위해 sessionStorage에도 함께 저장. */
export function cacheLastSelfCheck(p: {
  share_id: string;
  goalId: string;
  goalTitle: string;
  level: SelfCheckLevel;
  score: number;
  maxScore: number;
}) {
  try {
    sessionStorage.setItem(LOCAL_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function readLastSelfCheck(): {
  share_id: string;
  goalId: string;
  goalTitle: string;
  level: SelfCheckLevel;
  score: number;
  maxScore: number;
} | null {
  try {
    const raw = sessionStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveSelfCheck(p: SelfCheckSavePayload): Promise<SavedSelfCheck | null> {
  const { data: { user } } = await supabase.auth.getUser();
  const row = {
    user_id: user?.id ?? null,
    goal_id: p.goalId,
    goal_title: p.goalTitle,
    level: p.level,
    score: p.score,
    max_score: p.maxScore,
    questions: p.questions,
    answers: p.answers,
    summary: p.summary ?? null,
    is_public: true,
  };
  const { data, error } = await supabase
    .from("mind_track_self_checks")
    .insert([row])
    .select("*")
    .single();
  if (error) {
    console.warn("[selfCheck] save failed:", error.message);
    return null;
  }
  cacheLastSelfCheck({
    share_id: data.share_id,
    goalId: data.goal_id,
    goalTitle: data.goal_title,
    level: data.level as SelfCheckLevel,
    score: data.score,
    maxScore: data.max_score,
  });
  return data as SavedSelfCheck;
}

export async function fetchSelfCheckByShareId(shareId: string): Promise<SavedSelfCheck | null> {
  const { data, error } = await supabase
    .rpc("get_self_check_by_share_id", { p_share_id: shareId });
  if (error || !data || (Array.isArray(data) && data.length === 0)) return null;
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown>;
  return { ...row, user_id: null } as unknown as SavedSelfCheck;
  return row as SavedSelfCheck;
}

export const LEVEL_META: Record<SelfCheckLevel, { label: string; tone: string; color: string }> = {
  calm:    { label: "안정권",     tone: "안정",     color: "emerald" },
  watch:   { label: "주의권",     tone: "주의",     color: "amber" },
  support: { label: "도움 권장",   tone: "도움 권장", color: "rose" },
};
