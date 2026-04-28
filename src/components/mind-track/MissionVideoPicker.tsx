import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Youtube, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface YoutubeCandidate {
  video_id: string;
  title: string;
  thumbnail?: string;
}

interface Props {
  missionId: string;
  candidates: YoutubeCandidate[];
  selectedVideoId: string | null;
  onSelected?: (videoId: string) => void;
}

/**
 * Lets the user pick their preferred recommended video for a daily mission.
 * Persists the choice to mind_track_daily_missions.selected_youtube_video_id.
 */
export default function MissionVideoPicker({ missionId, candidates, selectedVideoId, onSelected }: Props) {
  const [active, setActive] = useState<string | null>(selectedVideoId);
  const [saving, setSaving] = useState<string | null>(null);

  if (!candidates || candidates.length === 0) return null;

  const pick = async (videoId: string) => {
    setSaving(videoId);
    try {
      const { error } = await supabase
        .from("mind_track_daily_missions")
        .update({ selected_youtube_video_id: videoId })
        .eq("id", missionId);
      if (error) throw error;
      setActive(videoId);
      onSelected?.(videoId);
      toast.success("영상을 저장했어요");
    } catch (e: any) {
      toast.error(e.message || "저장에 실패했어요");
    } finally {
      setSaving(null);
    }
  };

  const playing = candidates.find((c) => c.video_id === active) ?? candidates[0];

  return (
    <Card className="p-4 mt-3 bg-slate-50/60 border-slate-200">
      <div className="flex items-center gap-2 mb-3">
        <Youtube className="w-4 h-4 text-rose-500" />
        <span className="text-sm font-bold text-slate-800">추천 영상</span>
        <Badge variant="outline" className="text-[10px]">{candidates.length}개</Badge>
      </div>

      {/* Player for the active candidate */}
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

      {/* Candidate chooser */}
      <div className="grid sm:grid-cols-3 gap-2">
        {candidates.map((c) => {
          const isActive = c.video_id === active;
          const isSaving = saving === c.video_id;
          return (
            <button
              key={c.video_id}
              type="button"
              onClick={() => pick(c.video_id)}
              disabled={!!saving}
              className={`text-left rounded-xl border-2 overflow-hidden transition-all ${
                isActive ? "border-primary ring-2 ring-primary/30" : "border-slate-200 hover:border-primary/40"
              } bg-white`}
            >
              <div className="aspect-video bg-slate-100 relative">
                {c.thumbnail ? (
                  <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-300">
                    <Youtube className="w-6 h-6" />
                  </div>
                )}
                {isActive && (
                  <span className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                )}
                {isSaving && (
                  <span className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-700 line-clamp-2 p-2 break-keep">{c.title}</p>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
