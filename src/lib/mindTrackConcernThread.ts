// Mind Track 고민 트래킹 헬퍼
// /mind-track/workbook 진입 시 enrollment당 1개의 "내 고민" 스레드를 보관하고
// 매일/매 세션 자기점수와 증거를 누적하여 그래프·리포트·졸업 워크북에 활용합니다.
import { supabase } from "@/integrations/supabase/client";

export interface ConcernThread {
  id: string;
  enrollment_id: string;
  user_id: string;
  audience: string;
  track_focus: string | null;
  concern_title: string;
  concern_detail: string | null;
  goal_statement: string | null;
  baseline_score: number;
  current_score: number;
  target_score: number;
  status: "active" | "graduated";
  started_at: string;
  graduated_at: string | null;
}

export interface ProgressSnapshot {
  id: string;
  thread_id: string;
  day_number: number;
  session_index: number | null;
  self_score: number;
  evidence_summary: string | null;
  actions_completed: any;
  observations: any;
  created_at: string;
}

export async function getConcernThread(enrollmentId: string): Promise<ConcernThread | null> {
  const { data } = await supabase
    .from("mind_track_concern_threads" as any)
    .select("*")
    .eq("enrollment_id", enrollmentId)
    .maybeSingle();
  return (data as unknown as ConcernThread) ?? null;
}

export async function createConcernThread(input: {
  enrollmentId: string;
  audience: string;
  trackFocus?: string | null;
  title: string;
  detail?: string;
  goal?: string;
  baselineScore: number;
}): Promise<ConcernThread | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const payload = {
    enrollment_id: input.enrollmentId,
    user_id: user.id,
    audience: input.audience,
    track_focus: input.trackFocus ?? null,
    concern_title: input.title,
    concern_detail: input.detail ?? null,
    goal_statement: input.goal ?? null,
    baseline_score: input.baselineScore,
    current_score: input.baselineScore,
    target_score: 8,
    status: "active",
  };
  const { data, error } = await supabase
    .from("mind_track_concern_threads" as any)
    .insert(payload as any)
    .select()
    .single();
  if (error) {
    console.error("[concern] create failed", error);
    return null;
  }
  return data as unknown as ConcernThread;
}

export async function listSnapshots(threadId: string): Promise<ProgressSnapshot[]> {
  const { data } = await supabase
    .from("mind_track_progress_snapshots" as any)
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });
  return (data as unknown as ProgressSnapshot[]) ?? [];
}

export async function addSnapshot(input: {
  threadId: string;
  dayNumber: number;
  sessionIndex?: number | null;
  selfScore: number;
  evidence?: string;
  actions?: any;
  observations?: any;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("mind_track_progress_snapshots" as any).insert({
    thread_id: input.threadId,
    user_id: user.id,
    day_number: input.dayNumber,
    session_index: input.sessionIndex ?? null,
    self_score: input.selfScore,
    evidence_summary: input.evidence ?? null,
    actions_completed: input.actions ?? [],
    observations: input.observations ?? {},
  } as any);
  // 현재 점수 갱신
  await supabase
    .from("mind_track_concern_threads" as any)
    .update({ current_score: input.selfScore } as any)
    .eq("id", input.threadId);
}
