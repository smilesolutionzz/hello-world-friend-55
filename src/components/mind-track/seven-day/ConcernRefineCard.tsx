/**
 * 7일 트랙 — 진짜 고민 다시 적기 → Day 1~7 맞춤 미션 재생성
 *
 * 사용자가 더 깊고 구체적인 고민을 적으면 mind-track-regenerate 에지 함수를 호출해
 * 기존 mind_track_daily_missions(Day 1~7)를 새로 생성하고,
 * enrollment.baseline_data.primary_concern 을 업데이트합니다.
 */
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, RefreshCcw, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  enrollmentId: string;
  currentConcern?: string | null;
  onRegenerated: () => void;
}

export default function ConcernRefineCard({
  enrollmentId,
  currentConcern,
  onRegenerated,
}: Props) {
  const [concern, setConcern] = useState(currentConcern ?? "");
  const [loading, setLoading] = useState(false);
  const [expanding, setExpanding] = useState(false);
  const [open, setOpen] = useState(false);

  const handleAIExpand = async () => {
    const text = concern.trim();
    if (text.length < 5) {
      toast.error("확장할 내용을 최소 5자 이상 적어주세요");
      return;
    }
    setExpanding(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "mind-track-concern-polish",
        { body: { concern: text } },
      );
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const polished = (data?.polished ?? "").trim();
      if (!polished) throw new Error("AI 확장 결과가 비어 있어요");
      setConcern(polished.slice(0, 1200));
      toast.success("AI가 고민을 더 풍부하게 다듬어줬어요");
    } catch (e: any) {
      toast.error(e?.message ?? "AI 확장 중 문제가 발생했어요");
    } finally {
      setExpanding(false);
    }
  };

  const handleRegenerate = async () => {
    const text = concern.trim();
    if (text.length < 20) {
      toast.error("최소 20자 이상 구체적으로 적어주세요 (언제·어디서·누구와·무엇이)");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "mind-track-regenerate",
        { body: { enrollmentId, concern: text } },
      );
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error ?? "재생성 실패");
      toast.success("당신의 고민에 맞춘 Day 1~7 미션이 새로 생성되었어요");
      onRegenerated();
    } catch (e: any) {
      toast.error(e?.message ?? "재생성 중 문제가 발생했어요");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Card className="bg-gradient-to-br from-[#FAF7EE] to-white rounded-3xl border-[#C8B88A]/40 p-5 space-y-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Badge className="bg-[#C8B88A]/20 text-[#8a7a4d] border-[#C8B88A]/40 hover:bg-[#C8B88A]/20">
            <Sparkles className="w-3 h-3 mr-1" />
            맞춤 미션 더 정확하게
          </Badge>
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 break-keep">
            지금의 진짜 고민, 한 단락만 더 적어볼까요?
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed break-keep">
            짧은 한 줄이 아니라 ‘언제·어디서·누구와·무엇이 어려운지’를 적어주시면,
            Day 1부터 Day 7까지의 미션이 당신 상황에 맞춰 새로 생성돼요.
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          variant="outline"
          className="w-full h-11 rounded-2xl border-[#C8B88A]/50 text-[#8a7a4d] hover:bg-[#C8B88A]/10"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          맞춤 미션 업그레이드
        </Button>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-3xl border-[#C8B88A]/50 ring-1 ring-[#C8B88A]/20 p-5 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <Badge className="bg-[#C8B88A]/15 text-[#8a7a4d] border-[#C8B88A]/30 hover:bg-[#C8B88A]/20">
          <Sparkles className="w-3 h-3 mr-1" />
          진짜 고민 입력
        </Badge>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-slate-400 hover:text-slate-600"
        >
          접기
        </button>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed break-keep">
        예) “요즘 6살 아이가 어린이집 등원만 하면 매일 아침 30분씩 울어요.
        제가 출근 때문에 마음이 급해져서 결국 화를 내고, 그 죄책감이 하루 종일 남아요.”
      </p>
      <Textarea
        value={concern}
        onChange={(e) => setConcern(e.target.value)}
        rows={6}
        placeholder="언제·어디서·누구와·무엇이 어려운지 한 단락으로 적어주세요"
        className="resize-none rounded-2xl border-slate-200 text-sm"
        maxLength={1200}
      />
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>최소 20자 · 최대 1,200자</span>
        <span>{concern.length} / 1,200</span>
      </div>

      <Button
        type="button"
        onClick={handleAIExpand}
        disabled={expanding || loading || concern.trim().length < 5}
        variant="outline"
        className="w-full h-11 rounded-2xl border-[#C8B88A]/50 text-[#8a7a4d] hover:bg-[#C8B88A]/10"
      >
        {expanding ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            AI가 고민을 풍부하게 다듬는 중…
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4 mr-2" />
            AI로 고민 풍부하게 확장하기
          </>
        )}
      </Button>

      <Button
        type="button"
        onClick={handleRegenerate}
        disabled={loading || expanding}
        className="w-full h-12 rounded-2xl text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span className="text-white">Day 1~7 맞춤 미션 새로 만드는 중…</span>
          </>
        ) : (
          <>
            <RefreshCcw className="w-5 h-5 mr-2" />
            <span className="text-white">이 고민으로 Day 1~7 미션 재생성</span>
          </>
        )}
      </Button>
      <p className="text-[11px] text-slate-400 text-center">
        기존 Day 1~7 맞춤 미션은 새 미션으로 교체됩니다. 체크인 기록은 그대로 보존돼요.
      </p>
    </Card>
  );
}
