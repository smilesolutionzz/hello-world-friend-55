import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type MindTrackDashboardState =
  | { kind: "loading" }
  | { kind: "none" }
  | { kind: "error"; message: string }
  | { kind: "needs_baseline"; enrollmentId: string }
  | {
      kind: "active";
      enrollmentId: string;
      workbook: any;
      currentDay: number;
      todayMission: any | null;
      completed: number;
    };

// UTC 기준 일수 차이 — 사용자의 로컬 타임존 영향을 받지 않음
function utcDayDiff(startIso: string, nowMs: number): number {
  const start = new Date(startIso);
  const startUtcMidnight = Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate()
  );
  const now = new Date(nowMs);
  const nowUtcMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  return Math.floor((nowUtcMidnight - startUtcMidnight) / 86400000);
}

// 모듈 레벨 단순 캐시 — 동일 세션 내 중복 fetch 방지
let cachedState: MindTrackDashboardState | null = null;
let cachedAt = 0;
const TTL_MS = 60_000;

export function useMindTrackDashboard() {
  const [state, setState] = useState<MindTrackDashboardState>(
    cachedState && Date.now() - cachedAt < TTL_MS ? cachedState : { kind: "loading" }
  );

  useEffect(() => {
    let cancelled = false;

    if (cachedState && Date.now() - cachedAt < TTL_MS) {
      setState(cachedState);
      return;
    }

    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return finish({ kind: "none" });

        const { data: enrollments, error: enErr } = await supabase
          .from("mind_track_enrollments")
          .select("*")
          .eq("user_id", user.id)
          .eq("payment_status", "completed")
          .order("created_at", { ascending: false })
          .limit(1);
        if (enErr) throw enErr;
        if (!enrollments || enrollments.length === 0) return finish({ kind: "none" });

        const en = enrollments[0] as any;

        const { data: wbs, error: wbErr } = await supabase
          .from("mind_track_workbooks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);
        if (wbErr) throw wbErr;

        if (!wbs || wbs.length === 0) {
          return finish({ kind: "needs_baseline", enrollmentId: en.id });
        }

        const wb = wbs[0] as any;
        const startedAtIso = en?.started_at || en?.created_at || new Date().toISOString();
        const dayDiff = utcDayDiff(startedAtIso, Date.now());
        const currentDay = Math.min(Math.max(dayDiff + 1, 1), 30);

        const [{ data: missions }, { data: checkins }] = await Promise.all([
          supabase
            .from("mind_track_daily_missions")
            .select("*")
            .eq("enrollment_id", en.id)
            .eq("day_number", currentDay)
            .maybeSingle(),
          supabase
            .from("mind_track_checkins")
            .select("completed")
            .eq("enrollment_id", en.id),
        ]);

        const completed = (checkins ?? []).filter((c: any) => c.completed).length;
        finish({
          kind: "active",
          enrollmentId: en.id,
          workbook: wb,
          currentDay,
          todayMission: missions ?? null,
          completed,
        });
      } catch (e: any) {
        finish({ kind: "error", message: e?.message ?? "데이터를 불러오지 못했어요" });
      }
    })();

    function finish(s: MindTrackDashboardState) {
      cachedState = s;
      cachedAt = Date.now();
      if (!cancelled) setState(s);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

export function clearMindTrackDashboardCache() {
  cachedState = null;
  cachedAt = 0;
}
