import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bug, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * 워크북에서 위험 감지 알림 발생 조건을 강제로 시뮬레이션하는 디버그 패널.
 * - 3일 미체크인 시뮬: 직접 risk_alert 행을 missed_3days로 insert
 * - 점수 30% 하락 시뮬: score_drop_30pct 행을 insert
 * 기본은 숨김. 우측 하단의 작은 버튼을 누르면 펼쳐집니다.
 */
export default function MindTrackRiskSimulator({
  enrollmentId,
  onSimulated,
}: {
  enrollmentId: string | null;
  onSimulated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!enrollmentId) return null;

  const simulate = async (alertType: "missed_3days" | "score_drop_30pct") => {
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("로그인 필요"); return; }

      // 같은 enrollment의 미해결 알림이 있으면 먼저 닫고 새로 생성
      await supabase
        .from("mind_track_risk_alerts")
        .update({ resolved_at: new Date().toISOString(), user_response: "ignored" })
        .eq("user_id", user.id)
        .eq("enrollment_id", enrollmentId)
        .is("resolved_at", null);

      const triggerData = alertType === "missed_3days"
        ? { simulated: true, missed_days: [-1, -2, -3] }
        : { simulated: true, baseline_energy: 80, current_energy: 40, drop_pct: 50 };

      const { error } = await supabase
        .from("mind_track_risk_alerts")
        .insert({
          user_id: user.id,
          enrollment_id: enrollmentId,
          alert_type: alertType,
          severity: alertType === "score_drop_30pct" ? "high" : "medium",
          trigger_data: triggerData,
          notification_channel: "in_app",
          notification_sent: true,
        });
      if (error) throw error;

      toast.success(`${alertType === "missed_3days" ? "3일 미체크인" : "점수 30% 하락"} 알림이 시뮬레이션되었어요. 페이지가 새로고침됩니다.`);
      onSimulated();
    } catch (e: any) {
      toast.error(e.message || "시뮬레이션 실패");
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-900 text-white flex items-center justify-center shadow-lg"
        title="위험 감지 시뮬레이터"
      >
        <Bug className="w-4 h-4" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-72 p-3 shadow-2xl border-2 border-slate-300">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Bug className="w-3.5 h-3.5" /> 위험 감지 시뮬레이터
        </div>
        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-[10px] text-slate-500 mb-2 break-keep">
        조건을 만족하지 않아도 강제로 알림을 발생시켜 카드 노출을 검증합니다.
      </p>
      <div className="space-y-1.5">
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => simulate("missed_3days")}
          className="w-full text-xs h-8 justify-start"
        >
          {busy ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : "🌙"} 3일 미체크인 시뮬
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => simulate("score_drop_30pct")}
          className="w-full text-xs h-8 justify-start"
        >
          {busy ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : "📉"} 점수 30% 하락 시뮬
        </Button>
      </div>
      <p className="text-[10px] text-slate-400 mt-2">
        * 시뮬 행은 trigger_data.simulated=true로 표시됩니다.
      </p>
    </Card>
  );
}
