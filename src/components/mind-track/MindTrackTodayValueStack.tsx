/**
 * MindTrackTodayValueStack — "오늘의 가치 스택"
 *
 * 결제자에게 매일 노출되는 3종 고가치 자산 카드:
 *   1) 오늘의 검사 (있을 때만)
 *   2) 오늘의 추천 영상 (썸네일 + 사유)
 *   3) 오늘의 5분 액션
 *
 * /mind-track/dashboard 의 "오늘의 미션" 카드 바로 아래에 끼워넣어
 * "이 구독으로 매일 받는 콘텐츠가 이만큼이다"라는 가치를 시각적으로 증명합니다.
 */

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Youtube,
  Zap,
  ArrowRight,
  Clock,
  PlayCircle,
} from 'lucide-react';
import {
  youtubeThumbnail,
  youtubeWatchUrl,
} from '@/lib/mindTrackDailyContent';
import { logMindTrackVideoEvent } from '@/lib/mindTrackVideoEvents';
import { useDailyContent } from '@/hooks/useDailyContent';
import VideoFeedbackButton from './VideoFeedbackButton';
import VideoSuggestionForm from './VideoSuggestionForm';
import CollapsibleReason from './CollapsibleReason';
import { getTrackMissionLabel } from '@/lib/mindTrackTrackContent';
import type { MindTrackFocusId } from '@/lib/mindTrackFocusTracks';

interface Props {
  day: number;
  focusId?: string | null;
}

export default function MindTrackTodayValueStack({ day, focusId }: Props) {
  const navigate = useNavigate();
  const { content, focus } = useDailyContent(day, focusId);
  const dayLabel = String(day).padStart(2, '0');
  const missionLabel = getTrackMissionLabel(focus.id as MindTrackFocusId, day);

  const trackVideo = (eventType: 'click' | 'thumbnail_click' | 'start') => {
    logMindTrackVideoEvent({
      videoId: content.video.videoId,
      videoTitle: content.video.title,
      eventType,
      day,
    });
  };

  return (
    <section className="px-4 pb-6">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* 헤더 — 트랙 배지 + 오늘 큐레이션 */}
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-wider text-[#8a7a4d] uppercase flex items-center gap-2 flex-wrap">
              <span>Day {dayLabel} · 오늘 받는 가치</span>
              <Badge variant="outline" className={`${focus.badgeClass} text-[10px] font-bold border`}>
                {focus.icon} {focus.label} 트랙
              </Badge>
            </p>
            <h3 className="text-base md:text-lg font-bold text-slate-900 break-keep mt-1">
              {missionLabel}
            </h3>
            <p className="text-[11px] text-slate-500 break-keep mt-0.5">
              아래 검사·영상·5분 액션은 <b>{focus.label}</b> 트랙 흐름에 맞춰 매일 자동 큐레이션돼요.
            </p>
          </div>
          <Badge className="bg-[#1a1a1a] text-white border-0 text-[10px]">
            구독자 전용
          </Badge>
        </div>

        {/* 1) 오늘의 검사 */}
        {content.assessment && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[10px] font-semibold tracking-wider text-blue-600 uppercase">
                    01 · 오늘의 검사
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    {content.assessment.minutes}분
                  </span>
                </div>
                <h4 className="text-base md:text-lg font-bold text-slate-900 break-keep leading-snug">
                  {content.assessment.title}
                </h4>
                <p className="text-sm text-slate-600 mt-1 break-keep leading-relaxed">
                  {content.assessment.desc}
                </p>
                <div className="mt-3 px-3 py-2 rounded-lg bg-slate-50 border-l-2 border-[#C8B88A]">
                  <p className="text-xs text-slate-700 break-keep leading-relaxed">
                    <span className="font-semibold text-slate-900">왜 오늘? </span>
                    {content.assessment.why}
                  </p>
                </div>
                <Button
                  onClick={() => navigate(content.assessment!.route)}
                  className="mt-4 h-11 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
                >
                  지금 검사 시작
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* 2) 오늘의 추천 영상 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <a
            href={youtubeWatchUrl(content.video.videoId, day)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackVideo('thumbnail_click')}
            className="block group"
            data-aih-event="mind_track_video_click"
            data-aih-day={dayLabel}
            data-aih-video-id={content.video.videoId}
          >
            <div className="relative aspect-video bg-slate-100">
              <img
                src={youtubeThumbnail(content.video.videoId)}
                alt={content.video.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <PlayCircle className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                <Youtube className="w-3 h-3" />
                YouTube · {content.video.durationLabel}
              </div>
            </div>
          </a>
          <div className="p-5 md:p-6">
            <p className="text-[10px] font-semibold tracking-wider text-red-600 uppercase mb-1">
              02 · 오늘의 추천 영상
            </p>
            <h4 className="text-base md:text-lg font-bold text-slate-900 break-keep leading-snug">
              {content.video.title}
            </h4>
            <p className="text-xs text-slate-500 mt-1">{content.video.channel}</p>
            <div className="mt-3">
              <CollapsibleReason reason={content.video.reason} tone="rose" />
            </div>
            <div className="mt-2 flex justify-end">
              <VideoFeedbackButton day={day} videoId={content.video.videoId} />
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <Button
                asChild
                className="h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold flex-1"
              >
                <a
                  href={youtubeWatchUrl(content.video.videoId, day)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackVideo('click')}
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  영상 보기
                </a>
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  navigate(
                    `/mind-track/workbook?day=${day}&openMission=1&after_video=${content.video.videoId}`,
                  )
                }
                className="h-11 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 sm:w-auto"
              >
                시청 후 기록하기 →
              </Button>
            </div>
          </div>
        </motion.div>

        {/* 3) 오늘의 5분 액션 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] font-semibold tracking-wider text-amber-600 uppercase">
                  03 · 5분 즉시 액션
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                  <Clock className="w-3 h-3" />
                  {content.action.minutes}분
                </span>
              </div>
              <h4 className="text-base md:text-lg font-bold text-slate-900 break-keep leading-snug">
                {content.action.title}
              </h4>
              {(() => {
                const steps = content.action.howTo
                  .split('·')
                  .map((s) => s.trim())
                  .map((s) => {
                    const m = s.match(/^(\d+~\d+분)\s*(.+?)[.。]?$/);
                    return m ? { time: m[1], text: m[2] } : { time: '', text: s.replace(/[.。]$/, '') };
                  })
                  .filter((s) => s.text);
                return (
                  <ol className="mt-3 space-y-2">
                    {steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="shrink-0 mt-0.5 inline-flex items-center justify-center min-w-[58px] h-6 rounded-md bg-amber-50 text-amber-700 text-[11px] font-mono font-bold tracking-tight px-2">
                          {step.time || `${String(i + 1).padStart(2, '0')}`}
                        </span>
                        <span className="text-sm text-slate-700 break-keep leading-relaxed">
                          {step.text}
                        </span>
                      </li>
                    ))}
                  </ol>
                );
              })()}
              <Button
                onClick={() =>
                  navigate(`/mind-track/workbook?day=${day}&openMission=1`)
                }
                variant="outline"
                className="mt-4 h-11 w-full sm:w-auto rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50 font-semibold"
              >
                완료 후 워크북에 기록
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* 4) 사용자 영상 추천 */}
        <VideoSuggestionForm defaultDay={day} />
      </div>
    </section>
  );
}
