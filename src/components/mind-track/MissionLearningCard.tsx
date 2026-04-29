import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Youtube, Check, Loader2, PlayCircle, Sparkles, ListChecks, MessageSquareHeart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { YoutubeCandidate } from "./MissionVideoPicker";

interface Props {
  missionId: string;
  candidates: YoutubeCandidate[];
  initialWatched?: string[];
  initialReflection?: string;
  /** If provided, reflection is read-only / pre-filled (e.g. user already checked in). */
  reflectionReadonly?: boolean;
}

const REFLECTION_PROMPTS = [
  "어떤 장면 또는 한 마디가 가장 와닿았나요?",
  "오늘 내 상황과 연결되는 부분은 무엇이었나요?",
  "내일 한 가지만 시도한다면 무엇을 해보고 싶나요?",
];

/**
 * 미션 학습 카드 — 여러 추천 영상을 시청하고 느낀 점을 기록.
 * - 영상 리스트(썸네일) → 클릭 시 인라인 임베드 재생
 * - "시청 완료" 토글로 watched_video_ids 누적 저장
 * - 느낀점(video_reflection) 자동 저장 (디바운스 800ms)
 * - 진행률 표시 (n / m)
 */
export default function MissionLearningCard({
  missionId,
  candidates,
  initialWatched = [],
  initialReflection = "",
  reflectionReadonly = false,
}: Props) {
  const [watched, setWatched] = useState<string[]>(initialWatched);
  const [activeId, setActiveId] = useState<string | null>(candidates[0]?.video_id ?? null);
  const [reflection, setReflection] = useState(initialReflection);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [reflectionSaving, setReflectionSaving] = useState(false);
  const [reflectionSavedAt, setReflectionSavedAt] = useState<number | null>(null);

  const playing = useMemo(
    () => candidates.find((c) => c.video_id === activeId) ?? candidates[0],
    [candidates, activeId],
  );

  // Reflection is read by the check-in dialog (via DOM data attribute) at submit time.
  // No auto-save here — keeps everything in one transactional check-in write.

  if (!candidates || candidates.length === 0) return null;

  const toggleWatched = async (videoId: string) => {
    const isWatched = watched.includes(videoId);
    const next = isWatched ? watched.filter((v) => v !== videoId) : [...watched, videoId];
    setSavingId(videoId);
    try {
      const { error } = await supabase
        .from("mind_track_daily_missions")
        .update({ watched_video_ids: next })
        .eq("id", missionId);
      if (error) throw error;
      setWatched(next);
      if (!isWatched) toast.success("시청 완료로 표시했어요");
    } catch (e: any) {
      toast.error(e.message || "저장 실패");
    } finally {
      setSavingId(null);
    }
  };

  const total = candidates.length;
  const done = watched.length;
  const allWatched = done >= total;

  return (
    <Card className="p-4 mt-3 bg-white border-slate-200 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Youtube className="w-4 h-4 text-rose-500" />
          <span className="text-sm font-bold text-slate-900">오늘의 학습 영상</span>
          <Badge variant="outline" className="text-[10px]">{total}편</Badge>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <ListChecks className={`w-3.5 h-3.5 ${allWatched ? "text-emerald-500" : "text-slate-400"}`} />
          <span className={`font-semibold tabular-nums ${allWatched ? "text-emerald-600" : "text-slate-600"}`}>
            {done}/{total} 시청
          </span>
        </div>
      </div>

      {/* Player */}
      {playing && (
        <div className="rounded-xl overflow-hidden border border-slate-200 mb-3 aspect-video bg-black">
          <iframe
            key={playing.video_id}
            src={`https://www.youtube.com/embed/${playing.video_id}?rel=0`}
            title={playing.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Candidate list */}
      <div className="space-y-2 mb-4">
        {candidates.map((c) => {
          const isActive = c.video_id === playing?.video_id;
          const isWatched = watched.includes(c.video_id);
          const isSaving = savingId === c.video_id;
          return (
            <div
              key={c.video_id}
              className={`flex gap-2 p-2 rounded-xl border transition-all ${
                isActive ? "border-primary bg-primary/5" : "border-slate-200 bg-white"
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveId(c.video_id)}
                className="relative flex-shrink-0 w-24 aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200 group"
                aria-label={`${c.title} 재생`}
              >
                {c.thumbnail ? (
                  <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-300">
                    <Youtube className="w-5 h-5" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                  <PlayCircle className={`w-6 h-6 ${isActive ? "text-white" : "text-white/0 group-hover:text-white"}`} />
                </div>
              </button>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <p className="text-xs text-slate-800 line-clamp-2 break-keep leading-snug">{c.title}</p>
                <Button
                  size="sm"
                  variant={isWatched ? "default" : "outline"}
                  onClick={() => toggleWatched(c.video_id)}
                  disabled={isSaving}
                  className={`h-7 text-[11px] mt-1 self-start ${
                    isWatched ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500" : ""
                  }`}
                >
                  {isSaving ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : isWatched ? (
                    <>
                      <Check className="w-3 h-3 mr-1" /> 시청 완료
                    </>
                  ) : (
                    "시청 완료로 표시"
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reflection prompts + textarea */}
      <div className="rounded-xl bg-amber-50/60 border border-amber-200 p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <MessageSquareHeart className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold text-amber-900">영상을 본 뒤 느낀점</span>
          {reflectionSaving && <Loader2 className="w-3 h-3 animate-spin text-amber-600" />}
        </div>
        <ul className="text-[11px] text-amber-800/90 space-y-0.5 mb-2 list-disc list-inside break-keep">
          {REFLECTION_PROMPTS.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
        <Textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="짧게 한 줄도 좋아요. 체크인할 때 함께 저장돼요."
          rows={3}
          readOnly={reflectionReadonly}
          className="resize-none bg-white text-sm"
          data-mission-video-reflection={missionId}
        />
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-amber-700/80 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            느낀점은 체크인 완료 시 함께 저장됩니다
          </span>
          <span className="text-[10px] text-slate-400 tabular-nums">{reflection.length}자</span>
        </div>
      </div>
    </Card>
  );
}
