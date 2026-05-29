import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquareHeart } from "lucide-react";
import { addSnapshot, type ConcernThread } from "@/lib/mindTrackConcernThread";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  thread: ConcernThread;
  enrollmentId: string;
  dayNumber: number;
  sessionIndex?: number | null;
  onCompleted?: (report?: any) => void;
}

export default function SessionWrapDialog({
  open, onOpenChange, thread, enrollmentId, dayNumber, sessionIndex, onCompleted,
}: Props) {
  const [score, setScore] = useState(thread.current_score);
  const [evidence, setEvidence] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState<any>(null);

  const submit = async () => {
    if (evidence.trim().length < 5) {
      toast.error("오늘 무엇이 달라졌는지 한 줄 적어주세요");
      return;
    }
    setSubmitting(true);
    try {
      await addSnapshot({
        threadId: thread.id,
        dayNumber,
        sessionIndex: sessionIndex ?? null,
        selfScore: score,
        evidence: evidence.trim(),
      });

      // 세션 Day 일 때만 리포트 생성
      if (sessionIndex != null) {
        const { data, error } = await supabase.functions.invoke("mind-track-session-report", {
          body: {
            threadId: thread.id,
            enrollmentId,
            dayNumber,
            selfScore: score,
            evidence: evidence.trim(),
          },
        });
        if (!error && data?.report) setReport(data.report);
      }

      toast.success("오늘 기록이 그래프에 추가됐어요");
      onCompleted?.(report);
    } catch (e: any) {
      console.error(e);
      toast.error("저장 중 문제가 발생했어요");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white rounded-3xl">
        <DialogHeader>
          <p className="text-xs tracking-wider text-[#8a7a4d] font-semibold">SESSION WRAP · DAY {dayNumber}</p>
          <DialogTitle className="text-xl font-semibold text-slate-900 break-keep">
            오늘 끝, 한 줄로 정리해요
          </DialogTitle>
          <DialogDescription className="text-slate-500 break-keep">
            "{thread.concern_title}" 고민의 무게를 지금 다시 매겨주세요.
          </DialogDescription>
        </DialogHeader>

        {!report ? (
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-slate-700">
                지금 이 고민의 무게는? <span className="text-[#8a7a4d] font-semibold">{score} / 10</span>
              </label>
              <Slider value={[score]} min={1} max={10} step={1} onValueChange={(v) => setScore(v[0])} className="mt-3" />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>1 (가벼움)</span><span>10 (매우 무거움)</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">오늘 무엇이 달라졌어요?</label>
              <Textarea
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="예: 떼쓰는 시간이 5분으로 줄었다 / 처음으로 거절을 말로 표현했다"
                rows={3}
                className="mt-1 rounded-xl"
                maxLength={400}
              />
            </div>
            <DialogFooter>
              <Button onClick={submit} disabled={submitting} className="w-full h-12 rounded-2xl">
                {submitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />저장 중…</>) : "저장하고 회차 리포트 보기"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="pt-2">
            <div className="flex items-center gap-2 text-[#8a7a4d] text-sm font-semibold mb-3">
              <MessageSquareHeart className="w-4 h-4" /> 회차 리포트 · Day {dayNumber}
            </div>
            <p className="text-base font-semibold text-slate-900 mb-2 break-keep">{report.summary}</p>
            {Array.isArray(report.key_wins) && report.key_wins.length > 0 && (
              <div className="mb-3">
                <p className="text-xs tracking-wider text-slate-400 font-semibold mb-1">핵심 변화</p>
                <ul className="space-y-1 text-sm text-slate-700">
                  {report.key_wins.map((w: string, i: number) => (
                    <li key={i} className="flex gap-2"><span className="text-[#C8B88A]">·</span><span className="break-keep">{w}</span></li>
                  ))}
                </ul>
              </div>
            )}
            {report.next_focus && (
              <div className="bg-[#FAFAF7] rounded-2xl p-4">
                <p className="text-xs tracking-wider text-[#8a7a4d] font-semibold mb-1">다음 세션 초점</p>
                <p className="text-sm text-slate-700 break-keep">{report.next_focus}</p>
              </div>
            )}
            <Button className="w-full h-12 rounded-2xl mt-4" onClick={() => onOpenChange(false)}>닫기</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
