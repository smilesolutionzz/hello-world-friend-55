/**
 * 7일 트랙 — Day별 통합 리소스 패널
 *
 * 한 화면에서 ‘오늘의 4가지 자산’을 모두 제공:
 *  1) 자체 플랫폼 추천 검사 (있는 Day만)
 *  2) 큐레이션 유튜브 영상
 *  3) 미션 이론 근거 (왜 이 미션인가)
 *  4) 5분 즉시 실천 액션
 *
 * 검사는 우리 플랫폼 내부 라우트로 직접 진입하고, 완료되면
 * mind_track_checkins에 자동 기록됩니다(/assessment의 핸들러가 처리).
 */
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  ClipboardCheck,
  PlayCircle,
  Sparkles,
  Zap,
  Clock,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import {
  getDailyContent,
  getDailyVideos,
  youtubeThumbnail,
  youtubeWatchUrl,
} from "@/lib/mindTrackDailyContent";
import YouTubePlayer from "@/components/ui/youtube-player";
import { getDayTheory } from "@/lib/mindTrack7DayTheory";
import {
  buildMissionState,
  getAssessmentForDay,
  isAssessmentMissionCompleted,
} from "@/lib/mindTrackAssessmentMissions";

export default function DailyResourcePanel({
  enrollmentId,
  day,
}: {
  enrollmentId: string;
  day: number;
}) {
  const navigate = useNavigate();
  const content = getDailyContent(day);
  const theory = getDayTheory(day);
  const assessmentRec = getAssessmentForDay(day);
  const assessmentDone = isAssessmentMissionCompleted(enrollmentId, day);

  const handleStartAssessment = () => {
    if (!assessmentRec) return;
    navigate(assessmentRec.route, {
      state: buildMissionState(assessmentRec, enrollmentId, day),
    });
  };

  return (
    <div className="space-y-4">
      {/* 1) 오늘의 추천 검사 */}
      {assessmentRec && (
        <Card className="bg-white rounded-3xl border-amber-200/70 ring-1 ring-amber-100 p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
              <ClipboardCheck className="w-3 h-3 mr-1" />
              Day {day} · 오늘의 진단
            </Badge>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" /> {assessmentRec.minutes}분
            </span>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900 break-keep">
              {assessmentRec.title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed break-keep">
              {assessmentRec.desc}
            </p>
            <p className="text-xs text-amber-800/90 bg-amber-50 rounded-xl px-3 py-2 leading-relaxed break-keep">
              왜 지금: {assessmentRec.why}
            </p>
          </div>
          <Button
            onClick={handleStartAssessment}
            className="w-full h-12 rounded-2xl text-base font-semibold"
            variant={assessmentDone ? "secondary" : "default"}
          >
            {assessmentDone ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                다시 진단하기
              </>
            ) : (
              <>지금 {assessmentRec.minutes}분 진단 시작</>
            )}
          </Button>
        </Card>
      )}

      {/* 2) 오늘의 추천 유튜브 영상 */}
      <Card className="bg-white rounded-3xl border-slate-200 p-5 space-y-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-slate-200 text-slate-700 bg-white">
            <PlayCircle className="w-3 h-3 mr-1" />
            오늘의 영상 추천
          </Badge>
          <span className="text-xs text-slate-500">{content.video.durationLabel}</span>
        </div>
        <a
          href={youtubeWatchUrl(content.video.videoId, day)}
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 ring-1 ring-slate-200">
            <img
              src={youtubeThumbnail(content.video.videoId)}
              alt={content.video.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
            </div>
          </div>
          <div className="pt-3 space-y-1">
            <p className="text-sm font-semibold text-slate-900 leading-snug break-keep line-clamp-2">
              {content.video.title}
            </p>
            <p className="text-xs text-slate-500">{content.video.channel}</p>
            <p className="text-xs text-slate-600 leading-relaxed break-keep pt-1">
              {content.video.reason}
            </p>
          </div>
        </a>
      </Card>

      {/* 3) 미션 이론 근거 */}
      <Card className="bg-slate-50 rounded-3xl border-slate-200 p-5 space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-slate-700" />
          <span className="text-xs font-semibold text-slate-700">
            왜 이 미션인가 — 이론 근거
          </span>
        </div>
        <h4 className="text-base font-bold text-slate-900 break-keep">
          {theory.title}
        </h4>
        <p className="text-sm text-slate-700 leading-relaxed break-keep">
          {theory.body}
        </p>
        <p className="text-[11px] text-slate-500 pt-1">근거: {theory.basis}</p>
      </Card>

      {/* 4) 5분 즉시 실천 액션 */}
      <Card className="bg-white rounded-3xl border-emerald-100 p-5 space-y-2 shadow-sm">
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-50">
            <Zap className="w-3 h-3 mr-1" />
            5분 즉시 실천
          </Badge>
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3 h-3" /> {content.action.minutes}분
          </span>
        </div>
        <h4 className="text-base font-bold text-slate-900 break-keep">
          {content.action.title}
        </h4>
        <p className="text-sm text-slate-700 leading-relaxed break-keep">
          {content.action.howTo}
        </p>
        <p className="text-[11px] text-slate-400 pt-1 inline-flex items-center gap-1">
          <ArrowUpRight className="w-3 h-3" /> 아래 미션 기록에 한 줄 남기면 완료
        </p>
      </Card>
    </div>
  );
}
