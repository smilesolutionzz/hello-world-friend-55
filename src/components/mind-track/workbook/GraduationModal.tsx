import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Sparkles, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { ConcernThread } from "@/lib/mindTrackConcernThread";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  thread: ConcernThread;
  enrollmentId: string;
}

export default function GraduationModal({ open, onOpenChange, thread, enrollmentId }: Props) {
  const [loading, setLoading] = useState(false);
  const [workbook, setWorkbook] = useState<any>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      // 이미 발급된 졸업 워크북이 있는지 먼저 조회
      const { data: existing } = await supabase
        .from("mind_track_graduation_workbooks" as any)
        .select("*")
        .eq("thread_id", thread.id)
        .maybeSingle();
      if (existing) {
        if (!cancelled) { setWorkbook(existing); setLoading(false); }
        return;
      }
      // 없으면 생성
      const { data, error } = await supabase.functions.invoke("mind-track-graduate", {
        body: { threadId: thread.id, enrollmentId },
      });
      if (!cancelled) {
        if (!error && data?.workbook) setWorkbook(data.workbook);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, thread.id, enrollmentId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-white rounded-3xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-[#8a7a4d] text-xs tracking-wider font-semibold">
            <Trophy className="w-4 h-4" /> GRADUATION · DAY 14
          </div>
          <DialogTitle className="text-2xl font-semibold text-slate-900 break-keep">
            14일을 완주하셨어요
          </DialogTitle>
          <DialogDescription className="text-slate-500 break-keep">
            "{thread.concern_title}" 고민과 함께한 여정을 졸업 워크북으로 남겨드려요.
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="py-12 flex flex-col items-center gap-3 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-sm">졸업 워크북을 만들고 있어요…</p>
          </div>
        )}

        {!loading && workbook && (
          <div className="space-y-4 pt-2">
            <div className="bg-[#FAFAF7] rounded-2xl p-5">
              <p className="text-xs tracking-wider text-[#8a7a4d] font-semibold mb-2">점수 변화</p>
              <p className="text-2xl font-semibold text-slate-900">
                {thread.baseline_score} <span className="text-slate-300 mx-2">→</span> {thread.current_score}
                <span className="text-base text-slate-500 ml-2">/ 10</span>
              </p>
            </div>

            {workbook.keepsake_quote && (
              <div className="bg-white border border-[#C8B88A]/40 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-[#8a7a4d] text-xs font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> 14일 뒤 나에게
                </div>
                <p className="text-slate-800 leading-relaxed break-keep">"{workbook.keepsake_quote}"</p>
              </div>
            )}

            <div className="flex gap-2">
              {workbook.pdf_url && (
                <Button asChild className="flex-1 h-12 rounded-2xl">
                  <a href={workbook.pdf_url} target="_blank" rel="noreferrer">
                    <Download className="w-4 h-4 mr-1" /> PDF 다운로드
                  </a>
                </Button>
              )}
              <Button variant="outline" className="flex-1 h-12 rounded-2xl" onClick={() => onOpenChange(false)}>
                닫기
              </Button>
            </div>
          </div>
        )}

        {!loading && !workbook && (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-500">졸업 워크북 생성에 실패했어요. 잠시 후 다시 시도해주세요.</p>
            <Button variant="outline" className="mt-4 rounded-2xl" onClick={() => onOpenChange(false)}>닫기</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
