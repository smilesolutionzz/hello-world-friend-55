/**
 * 7일 트랙 — 가벼운 Day(2·3·5·6) 공통 미션 화면
 *
 * 단일 미션 카드 + 완료 버튼 + 2줄 자유 기록.
 * 완료 시 mind_track_checkins upsert.
 */
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, PenLine, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { SevenDayMission } from "@/lib/mindTrack7DayMissions";

interface Props {
  enrollmentId: string;
  userId: string;
  day: number;
  mission: SevenDayMission;
  phaseLabel: string;
  initialNote?: string | null;
  alreadyCompleted: boolean;
  onCompleted: () => void;
}

export default function LightMissionScreen({
  enrollmentId,
  userId,
  day,
  mission,
  phaseLabel,
  initialNote,
  alreadyCompleted,
  onCompleted,
}: Props) {
  const [note, setNote] = useState(initialNote ?? "");
  const [saving, setSaving] = useState(false);

  const handleComplete = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("mind_track_checkins").upsert(
        {
          enrollment_id: enrollmentId,
          user_id: userId,
          day_number: day,
          completed: true,
          reflection_note: note.trim() || null,
        },
        { onConflict: "enrollment_id,day_number" },
      );
      if (error) throw error;
      toast.success("오늘 미션을 완료했어요");
      onCompleted();
    } catch (e: any) {
      toast.error(e?.message ?? "저장 중 문제가 발생했어요");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Badge variant="outline" className="border-slate-200 text-slate-600 bg-white">
          {phaseLabel}
        </Badge>
        <h1 className="text-2xl font-bold text-slate-900 break-keep leading-snug">
          {mission.title}
        </h1>
      </div>

      <Card className="bg-white rounded-3xl border-slate-200 p-6 space-y-5 shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            <span>약 {mission.minutes}분</span>
          </div>
          <p className="text-base text-slate-700 leading-relaxed break-keep">
            {mission.how}
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <PenLine className="w-4 h-4" />
            {mission.reflectionPrompt}
            <span className="text-xs text-slate-400 font-normal">(선택)</span>
          </label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="한 줄이면 충분해요"
            rows={2}
            className="resize-none rounded-2xl border-slate-200"
          />
        </div>

        <Button
          onClick={handleComplete}
          disabled={saving}
          className="w-full h-12 rounded-2xl text-base font-semibold"
          variant={alreadyCompleted ? "secondary" : "default"}
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : alreadyCompleted ? (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              기록 업데이트
            </>
          ) : (
            "오늘 미션 완료"
          )}
        </Button>
      </Card>
    </div>
  );
}
