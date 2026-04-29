import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Youtube,
  Check,
  Loader2,
  PlayCircle,
  Sparkles,
  ListChecks,
  MessageSquareHeart,
  CloudUpload,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { YoutubeCandidate } from "./MissionVideoPicker";

interface Props {
  missionId: string;
  missionType?: string;
  candidates: YoutubeCandidate[];
  initialWatched?: string[];
  /** Reflection persisted with the check-in (final). Wins over draft when present. */
  initialReflection?: string;
  /** Draft reflection saved on the mission row (auto-save before check-in). */
  initialDraftReflection?: string;
  /** If provided, reflection is read-only / pre-filled (e.g. user already checked in). */
  reflectionReadonly?: boolean;
}

// 미션 타입별 회고 프롬프트 — 영상 후 어떤 질문에 답하면 좋은지 톤을 맞춥니다.
const REFLECTION_PROMPTS_BY_TYPE: Record<string, string[]> = {
  reflection: [
    "어떤 장면 또는 한 마디가 가장 와닿았나요?",
    "오늘 내 상황과 연결되는 부분은 무엇이었나요?",
    "내일 한 가지만 시도한다면 무엇을 해보고 싶나요?",
  ],
  action: [
    "영상에서 본 실천 중 오늘 바로 해볼 수 있는 건 무엇인가요?",
    "그 행동을 5분 안에 끝낼 수 있는 단계로 쪼개본다면?",
    "행동을 가로막는 작은 장애물은 무엇이고 어떻게 줄일 수 있을까요?",
  ],
  breathing: [
    "영상의 호흡 리듬을 따라 했을 때 몸의 어떤 부위가 풀렸나요?",
    "호흡 후 머릿속 생각의 속도는 어떻게 달라졌나요?",
    "오늘 하루 중 다시 이 호흡을 꺼내 쓸 수 있는 순간은 언제일까요?",
  ],
  journaling: [
    "영상에서 들은 표현 중 내 감정을 가장 잘 설명한 한 단어는?",
    "지금 떠오르는 장면 하나를 5문장으로 적는다면?",
    "오늘의 감정을 한 문장으로 요약한다면 무엇인가요?",
  ],
  connection: [
    "영상이 떠올리게 한 사람은 누구였나요?",
    "그 사람에게 보낼 한 줄 메시지를 적어본다면?",
    "관계에서 오늘 내가 작게라도 바꿔보고 싶은 한 가지는?",
  ],
};

const FALLBACK_PROMPTS = REFLECTION_PROMPTS_BY_TYPE.reflection;

/**
 * 미션 학습 카드 — 여러 추천 영상을 시청하고 느낀 점을 기록.
 * - 영상 리스트(썸네일) → 클릭 시 인라인 임베드 재생
 * - "시청 완료" 토글로 watched_video_ids 누적 저장
 * - 느낀점 자동 저장(디바운스 800ms) → mind_track_daily_missions.video_reflection_draft
 * - 진행률 텍스트 + 프로그레스바
 * - 미션 타입별 회고 프롬프트
 */
export default function MissionLearningCard({
  missionId,
  missionType,
  candidates,
  initialWatched = [],
  initialReflection = "",
  initialDraftReflection = "",
  reflectionReadonly = false,
}: Props) {
  const [watched, setWatched] = useState<string[]>(initialWatched);
  const [activeId, setActiveId] = useState<string | null>(candidates[0]?.video_id ?? null);
  // 우선순위: 체크인된 최종 reflection > 임시 draft
  const [reflection, setReflection] = useState(initialReflection || initialDraftReflection || "");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "saved">("idle");
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedDraftRef = useRef<string>(initialDraftReflection || initialReflection || "");

  const playing = useMemo(
    () => candidates.find((c) => c.video_id === activeId) ?? candidates[0],
    [candidates, activeId],
  );

  const prompts = useMemo(
    () => REFLECTION_PROMPTS_BY_TYPE[missionType || ""] ?? FALLBACK_PROMPTS,
    [missionType],
  );

  // Draft autosave (debounced 800ms) — only when not readonly.
  useEffect(() => {
    if (reflectionReadonly) return;
    if (reflection === lastSavedDraftRef.current) return;
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    setDraftStatus("saving");
    draftTimerRef.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from("mind_track_daily_missions")
          .update({ video_reflection_draft: reflection })
          .eq("id", missionId);
        if (error) throw error;
        lastSavedDraftRef.current = reflection;
        setDraftStatus("saved");
      } catch {
        setDraftStatus("idle");
      }
    }, 800);
    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, [reflection, missionId, reflectionReadonly]);

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
  const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Card className="p-4 mt-3 bg-white border-slate-200 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
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

      {/* Progress bar */}
      <div className="mb-3">
        <Progress
          value={progressPct}
          className={`h-1.5 ${allWatched ? "[&>div]:bg-emerald-500" : "[&>div]:bg-primary"}`}
        />
        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500 tabular-nums">
          <span>진행도</span>
          <span className={allWatched ? "text-emerald-600 font-semibold" : ""}>{progressPct}%</span>
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
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <MessageSquareHeart className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-900">영상을 본 뒤 느낀점</span>
            <span className="text-[10px] text-rose-500 font-semibold">필수</span>
          </div>
          {!reflectionReadonly && (
            <span className="text-[10px] text-amber-700/80 flex items-center gap-1">
              {draftStatus === "saving" ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" /> 저장 중
                </>
              ) : draftStatus === "saved" ? (
                <>
                  <CloudCheck className="w-3 h-3" /> 자동 저장됨
                </>
              ) : null}
            </span>
          )}
        </div>
        <ul className="text-[11px] text-amber-800/90 space-y-0.5 mb-2 list-disc list-inside break-keep">
          {prompts.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
        <Textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="최소 10자 이상 적어주세요. 새로고침해도 자동 저장된 내용이 유지됩니다."
          rows={3}
          readOnly={reflectionReadonly}
          className="resize-none bg-white text-sm"
          data-mission-video-reflection={missionId}
        />
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-amber-700/80 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            체크인 완료 시 함께 저장됩니다
          </span>
          <span
            className={`text-[10px] tabular-nums ${
              reflection.trim().length >= 10 ? "text-emerald-600 font-semibold" : "text-slate-400"
            }`}
          >
            {reflection.trim().length}/10자
          </span>
        </div>
      </div>
    </Card>
  );
}
