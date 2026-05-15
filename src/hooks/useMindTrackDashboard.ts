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
      currentDay: number; // clamped 1..totalDays
      rawDay: number; // unclamped — can be <1 or >totalDays
      hasStartedAt: boolean;
      todayMission: any | null;
      completed: number;
      trackType: string; // mind_7day | mind_30day | ...
      totalDays: number; // 7 또는 30 (track_type 기준)
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
const TTL_MS = 5_000; // 5초 — 결제/체크인 후 거의 즉시 반영

export function useMindTrackDashboard() {
  const [state, setState] = useState<MindTrackDashboardState>(
    cachedState && Date.now() - cachedAt < TTL_MS ? cachedState : { kind: "loading" }
  );
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = () => {
    cachedState = null;
    cachedAt = 0;
    setState({ kind: "loading" });
    setReloadKey((k) => k + 1);
  };

  useEffect(() => {
    let cancelled = false;

    if (cachedState && Date.now() - cachedAt < TTL_MS && reloadKey === 0) {
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
        const hasStartedAt = !!en?.started_at;
        const startedAtIso = en?.started_at || en?.created_at || new Date().toISOString();
        const trackType: string = (en?.track_type || "mind_7day").toLowerCase();
        const totalDays = trackType === "mind_30day" ? 30 : 7;
        const dayDiff = utcDayDiff(startedAtIso, Date.now());
        const rawDay = dayDiff + 1;
        const currentDay = Math.min(Math.max(rawDay, 1), totalDays);

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
          rawDay,
          hasStartedAt,
          todayMission: missions ?? null,
          completed,
          trackType,
          totalDays,
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
  }, [reloadKey]);

  // Realtime 구독 — 마음 트랙 관련 테이블 변경 시 즉시 새로고침
  useEffect(() => {
    let userId: string | null = null;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      userId = user.id;

      channel = supabase
        .channel(`mind-track-dashboard-${user.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "mind_track_enrollments", filter: `user_id=eq.${user.id}` },
          () => refresh()
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "mind_track_workbooks", filter: `user_id=eq.${user.id}` },
          () => refresh()
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "mind_track_daily_missions", filter: `user_id=eq.${user.id}` },
          () => refresh()
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "mind_track_checkins", filter: `user_id=eq.${user.id}` },
          () => refresh()
        )
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { state, refresh };
}

export function clearMindTrackDashboardCache() {
  cachedState = null;
  cachedAt = 0;
}

