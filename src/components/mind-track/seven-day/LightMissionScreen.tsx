/**
 * 7일 트랙 — 가벼운 Day(2·3·5·6) 공통 미션 화면
 *
 * 단일 미션 카드 + 완료 버튼 + 2줄 자유 기록.
 * 완료 시 mind_track_checkins upsert.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, PenLine, Loader2, ArrowUpRight, Gamepad2, Mic, NotebookPen } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { SevenDayMission } from "@/lib/mindTrack7DayMissions";
import MissionStepsForm, { type MissionStepsPayload } from "./MissionStepsForm";
import { syncCheckinToObservation } from "@/lib/mindTrackObservationBridge";

// Day별 보조 도구 — 미션이 무거우면 5분만 다녀와도 되는 옵션
const HELPER_TOOL: Record<number, { label: string; href: string; icon: typeof Gamepad2; hint: string } | undefined> = {
  2: { label: "감정이 무거우면 게임상담 5분", href: "/metaverse-voice?from=mind_track_7d_d2", icon: Gamepad2, hint: "정서 환기" },
  3: { label: "머릿속 정리는 고민함에 메모", href: "/concern-storage?from=mind_track_7d_d3", icon: NotebookPen, hint: "기록 보조" },
  5: { label: "말로 풀고 싶으면 음성일기 5분", href: "/voice-counseling?from=mind_track_7d_d5", icon: Mic, hint: "음성 기록" },
  6: { label: "기록할 게 많으면 고민함에 추가", href: "/concern-storage?from=mind_track_7d_d6", icon: NotebookPen, hint: "기록 보조" },
};

interface Props {
  enrollmentId: string;
  userId: string;
  day: number;
  mission: SevenDayMission;
  phaseLabel: string;
  initialNote?: string | null;
  initialPayload?: MissionStepsPayload | null;
  actionSteps?: string[];
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
  initialPayload,
  actionSteps = [],
  alreadyCompleted,
  onCompleted,
}: Props) {
  const [note, setNote] = useState(initialNote ?? "");
  const [payload, setPayload] = useState<MissionStepsPayload | null>(initialPayload ?? null);
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
          reflection_payload: payload as any,
        } as any,
        { onConflict: "enrollment_id,day_number" },
      );
      if (error) throw error;
      try {
        await syncCheckinToObservation({
          userId,
          enrollmentId,
          day,
          missionTitle: mission.title,
          note,
          payload,
        });
      } catch (err) {
        console.warn("observation sync failed", err);
      }
      toast.success("오늘 미션 완료 · 관찰일지에 저장됐어요");
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

        {actionSteps.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <p className="text-sm font-semibold text-slate-900">미션 칸 채우기</p>
            <MissionStepsForm
              day={day}
              steps={actionSteps}
              initial={payload}
              onChange={setPayload}
            />
          </div>
        )}

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

      {/* 보조 도구 — 미션 외 옵션 */}
      {HELPER_TOOL[day] && (() => {
        const tool = HELPER_TOOL[day]!;
        const Icon = tool.icon;
        return (
          <Link
            to={tool.href}
            className="flex items-center justify-between gap-3 rounded-2xl bg-white border border-slate-200 px-4 py-3 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-slate-700" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{tool.label}</p>
                <p className="text-xs text-slate-400">{tool.hint}</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </Link>
        );
      })()}
    </div>
  );
}
