import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AlertType = "missed_3days" | "score_drop_30pct" | "low_engagement";

interface RiskAlert {
  id: string;
  alert_type: AlertType;
  severity: string;
  detected_at: string;
}

/**
 * 30일 트랙 위험 패턴 자동 감지 훅
 * - 3일 연속 미체크인
 * - 베이스라인 대비 30% 이상 점수 악화
 */
export function useMindTrackRiskDetection(
  enrollmentId: string | null,
  checkins: any[],
  baselines: any[],
  currentDay: number,
) {
  const [activeAlert, setActiveAlert] = useState<RiskAlert | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  // 시뮬레이터/외부 트리거에서 강제 재조회
  const refetch = () => setRefreshTick((n) => n + 1);

  useEffect(() => {
    if (!enrollmentId) return;
    // currentDay < 3이어도 외부에서 시뮬레이션으로 삽입된 알림은 표시되어야 하므로
    // "기존 미해결 알림 조회"는 항상 수행하고, 자동 패턴 감지는 day >= 3일 때만 수행

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 이미 미해결 알림이 있으면 그대로 표시
      const { data: existing } = await supabase
        .from("mind_track_risk_alerts")
        .select("*")
        .eq("user_id", user.id)
        .eq("enrollment_id", enrollmentId)
        .is("resolved_at", null)
        .order("detected_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        setActiveAlert(existing as RiskAlert);
        return;
      }

      // 자동 패턴 감지는 day >= 3부터
      if (currentDay < 3) return;

      // 패턴 1: 최근 3일 연속 미체크인
      const last3 = [currentDay - 1, currentDay - 2, currentDay - 3];
      const missed3 = last3.every((d) => {
        const c = checkins.find((x) => x.day_number === d);
        return !c?.completed;
      });

      let alertType: AlertType | null = null;
      let triggerData: any = {};

      if (missed3) {
        alertType = "missed_3days";
        triggerData = { missed_days: last3 };
      } else {
        const baseline = baselines.find((b) => b.measurement_point === "baseline");
        const recentCheckin = checkins
          .filter((c) => c.completed && c.mood_score != null)
          .sort((a, b) => b.day_number - a.day_number)[0];
        if (baseline && recentCheckin) {
          const baselineEnergy = baseline.energy_score ?? 50;
          const currentEnergy = (recentCheckin.energy_score ?? 5) * 10;
          const drop = baselineEnergy - currentEnergy;
          if (baselineEnergy > 0 && drop / baselineEnergy >= 0.3) {
            alertType = "score_drop_30pct";
            triggerData = { baseline_energy: baselineEnergy, current_energy: currentEnergy, drop_pct: Math.round((drop / baselineEnergy) * 100) };
          }
        }
      }

      if (alertType) {
        const { data: created } = await supabase
          .from("mind_track_risk_alerts")
          .insert({
            user_id: user.id,
            enrollment_id: enrollmentId,
            alert_type: alertType,
            severity: alertType === "score_drop_30pct" ? "high" : "medium",
            trigger_data: triggerData,
            notification_channel: "in_app",
            notification_sent: true,
          })
          .select()
          .single();
        if (created) setActiveAlert(created as RiskAlert);
      }
    })();
  }, [enrollmentId, currentDay, checkins.length, baselines.length, refreshTick]);

  // Realtime: 동일 enrollment의 risk_alerts INSERT 즉시 반영 (시뮬레이터 검증용)
  useEffect(() => {
    if (!enrollmentId) return;
    const channel = supabase
      .channel(`risk-alerts-${enrollmentId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mind_track_risk_alerts", filter: `enrollment_id=eq.${enrollmentId}` },
        (payload: any) => {
          const row = payload.new as RiskAlert & { resolved_at: string | null };
          if (!row?.resolved_at) setActiveAlert(row);
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [enrollmentId]);

  const resolveAlert = async (response: "acknowledged" | "requested_help" | "ignored") => {
    if (!activeAlert) return;
    await supabase
      .from("mind_track_risk_alerts")
      .update({
        user_response: response,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", activeAlert.id);
    setActiveAlert(null);
  };

  return { activeAlert, resolveAlert, refetch };
}
