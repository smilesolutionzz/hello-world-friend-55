/**
 * 7일 트랙 — Day 4 전문가 매칭 제안 화면
 *
 * audience 태그 기반으로 /expert-hiring 라우팅 + 스킵 시 셀프 미션으로 대체.
 * 매칭은 외부 페이지에서 처리 (이미 인프라 존재).
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, ShieldCheck, ArrowRight, SkipForward } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { MindTrackAudience } from "@/lib/mindTrackEnrollment";
import { getDay4SelfMission } from "@/lib/mindTrack7DayMissions";
import MissionStepsForm, { type MissionStepsPayload } from "./MissionStepsForm";

interface Props {
  enrollmentId: string;
  userId: string;
  audience: MindTrackAudience;
  phaseLabel: string;
  initialNote?: string | null;
  initialPayload?: MissionStepsPayload | null;
  actionSteps?: string[];
  alreadyCompleted: boolean;
  onCompleted: () => void;
}

const AUDIENCE_COPY: Record<MindTrackAudience, { title: string; desc: string; expertLabel: string }> = {
  child: {
    title: "지난 3일 데이터를 본 발달 코치가 한 가지를 짚어줍니다",
    desc: "Day 1~3에서 입력한 강점·트리거를 본 발달·아동 코칭 전문가가 '오늘부터 바꿀 한 가지'를 짚어드려요.",
    expertLabel: "발달·아동 코칭 전문가",
  },
  adult: {
    title: "내 번아웃·불안 데이터를 본 코치가 직접 처방해줍니다",
    desc: "Day 1~3 에너지 누수 패턴을 본 번아웃·불안 코칭 전문가가 행동·환경 처방 한 가지를 줘요.",
    expertLabel: "번아웃·불안 코칭 전문가",
  },
  parent: {
    title: "지난 3일 부모로서의 패턴을 본 코치가 짚어줍니다",
    desc: "Day 1~3 트리거·회복 시도를 본 부모 코칭 전문가가 '오늘부터 바꿀 한 가지'를 짚어드려요.",
    expertLabel: "부모 코칭 전문가",
  },
  teen: {
    title: "내 데이터를 본 청소년 코치가 한 가지를 짚어줍니다",
    desc: "Day 1~3 데이터를 본 청소년 코칭 전문가가 오늘부터 바꿀 한 가지를 짚어드려요.",
    expertLabel: "청소년 코칭 전문가",
  },
};

export default function Day4ExpertMatchScreen({
  enrollmentId,
  userId,
  audience,
  phaseLabel,
  initialNote,
  initialPayload,
  actionSteps = [],
  alreadyCompleted,
  onCompleted,
}: Props) {
  const navigate = useNavigate();
  const copy = AUDIENCE_COPY[audience];
  const fallback = getDay4SelfMission(audience);
  const [showSkip, setShowSkip] = useState(false);
  const [note, setNote] = useState(initialNote ?? "");
  const [payload, setPayload] = useState<MissionStepsPayload | null>(initialPayload ?? null);
  const [saving, setSaving] = useState(false);

  const handleBookExpert = async () => {
    // Day4를 '매칭 시작'으로 마크 (스킵 아님)
    await supabase.from("mind_track_checkins").upsert(
      {
        enrollment_id: enrollmentId,
        user_id: userId,
        day_number: 4,
        completed: true,
        reflection_note: "전문가 매칭 신청",
      },
      { onConflict: "enrollment_id,day_number" },
    );
    navigate(`/expert-hiring?audience=${audience}&from=mind_track_d4`);
  };

  const handleSelfMission = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("mind_track_checkins").upsert(
        {
          enrollment_id: enrollmentId,
          user_id: userId,
          day_number: 4,
          completed: true,
          reflection_note: note.trim() || "self_resolved",
          reflection_payload: payload as any,
        } as any,
        { onConflict: "enrollment_id,day_number" },
      );
      if (error) throw error;
      toast.success("Day 4를 셀프 정리로 마쳤어요");
      onCompleted();
    } catch (e: any) {
      toast.error(e?.message ?? "저장 실패");
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
          {copy.title}
        </h1>
      </div>

      {!showSkip ? (
        <Card className="bg-white rounded-3xl border-slate-200 p-6 space-y-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold text-slate-900">{copy.expertLabel} 1:1 매칭</p>
              <p className="text-xs text-slate-500">첫 15분 무료 · 비대면 채팅 또는 통화</p>
            </div>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed break-keep">{copy.desc}</p>

          <div className="space-y-2 pt-1">
            <Button
              onClick={handleBookExpert}
              className="w-full h-12 rounded-2xl text-base font-semibold"
            >
              지금 전문가 매칭
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={() => setShowSkip(true)}
              variant="ghost"
              className="w-full h-10 rounded-2xl text-sm text-slate-500 hover:text-slate-700"
            >
              <SkipForward className="w-4 h-4 mr-1.5" />
              다음에 (셀프 미션으로 진행)
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="bg-white rounded-3xl border-slate-200 p-6 space-y-5 shadow-sm">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">{fallback.title}</p>
            <p className="text-xs text-slate-500">전문가 매칭 대신 오늘은 셀프 정리로 진행해요</p>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed break-keep">{fallback.how}</p>

          {actionSteps.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <p className="text-sm font-semibold text-slate-900">미션 칸 채우기</p>
              <MissionStepsForm
                day={4}
                steps={actionSteps}
                initial={payload}
                onChange={setPayload}
              />
            </div>
          )}

          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={fallback.reflectionPrompt}
            rows={2}
            className="resize-none rounded-2xl border-slate-200"
          />


          <div className="space-y-2">
            <Button
              onClick={handleSelfMission}
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
                "셀프 미션 완료"
              )}
            </Button>
            <Button
              onClick={() => setShowSkip(false)}
              variant="ghost"
              className="w-full h-10 rounded-2xl text-sm text-slate-500"
            >
              다시 전문가 매칭 보기
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
