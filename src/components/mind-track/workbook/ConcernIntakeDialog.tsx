import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createConcernThread } from "@/lib/mindTrackConcernThread";
import { toast } from "sonner";

interface Props {
  open: boolean;
  enrollmentId: string;
  audience: string;
  trackFocus?: string | null;
  onCreated: () => void;
}

export default function ConcernIntakeDialog({ open, enrollmentId, audience, trackFocus, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [goal, setGoal] = useState("");
  const [baseline, setBaseline] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (title.trim().length < 3) {
      toast.error("고민 제목을 3자 이상 적어주세요");
      return;
    }
    setSubmitting(true);
    const created = await createConcernThread({
      enrollmentId, audience, trackFocus,
      title: title.trim(),
      detail: detail.trim() || undefined,
      goal: goal.trim() || undefined,
      baselineScore: baseline,
    });
    setSubmitting(false);
    if (!created) {
      toast.error("저장에 실패했어요. 잠시 후 다시 시도해주세요.");
      return;
    }
    toast.success("고민이 등록되었어요. 14일 동안 함께 추적할게요.");
    onCreated();
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-lg bg-white rounded-3xl">
        <DialogHeader>
          <p className="text-xs tracking-wider text-[#8a7a4d] font-semibold">START · 내 고민 등록</p>
          <DialogTitle className="text-xl font-semibold text-slate-900 break-keep">
            이 트랙에서 해결하고 싶은 고민이 뭔가요?
          </DialogTitle>
          <DialogDescription className="text-slate-500 break-keep">
            14일 동안 같은 고민을 끝까지 따라가요. 매일 점수 변화가 그래프로 쌓이고, 회차 리포트로 정리돼요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium text-slate-700">고민 한 줄</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 아이가 잘 때마다 떼를 써요"
              className="mt-1 rounded-xl"
              maxLength={80}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">조금 더 설명 (선택)</label>
            <Textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="언제 / 어떤 상황에서 가장 어렵나요?"
              rows={3}
              className="mt-1 rounded-xl"
              maxLength={400}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">14일 뒤 어떻게 됐으면 해요? (선택)</label>
            <Input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="예: 떼 부리는 횟수가 절반으로 줄었으면"
              className="mt-1 rounded-xl"
              maxLength={120}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              지금 이 고민의 무게는? <span className="text-[#8a7a4d] font-semibold">{baseline} / 10</span>
            </label>
            <Slider
              value={[baseline]}
              min={1} max={10} step={1}
              onValueChange={(v) => setBaseline(v[0])}
              className="mt-3"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>1 (가벼움)</span><span>10 (매우 무거움)</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={submitting} className="w-full h-12 rounded-2xl">
            {submitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />등록 중…</>) : "14일 트래킹 시작"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
