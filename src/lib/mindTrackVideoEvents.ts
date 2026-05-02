/**
 * MindTrack 영상 이벤트 로거
 *
 * 추천 영상의 클릭/시청 시작/완료 등의 이벤트를 videoId 기준으로
 *   1) Supabase `mind_track_video_events` 테이블에 기록 (관리자 분석용)
 *   2) GA dataLayer 로 push (외부 GA/믹스패널 분석용)
 * 두 곳에 동시에 남깁니다. 두 경로 모두 실패해도 사용자 경험은 깨지지 않도록
 * 모든 호출은 fire-and-forget 입니다.
 */

import { supabase } from '@/integrations/supabase/client';

export type MindTrackVideoEventType =
  | 'click'
  | 'thumbnail_click'
  | 'start'
  | 'complete';

interface LogParams {
  videoId: string;
  videoTitle?: string;
  eventType: MindTrackVideoEventType;
  day?: number;
  metadata?: Record<string, unknown>;
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export async function logMindTrackVideoEvent(params: LogParams): Promise<void> {
  const { videoId, videoTitle, eventType, day, metadata = {} } = params;

  // 1) GA dataLayer push (즉시 — 동기적)
  try {
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'mind_track_video_event',
        mt_video_id: videoId,
        mt_video_title: videoTitle,
        mt_event_type: eventType,
        mt_day: day,
        ...metadata,
      });
    }
  } catch (e) {
    // dataLayer 실패는 무시
  }

  // 2) Supabase 기록 (인증된 사용자만 — RLS 가 보호)
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('mind_track_video_events').insert({
      user_id: user.id,
      video_id: videoId,
      video_title: videoTitle ?? null,
      event_type: eventType,
      day_number: day ?? null,
      metadata: metadata as never,
    });
  } catch (e) {
    // 로깅 실패는 사용자 경험에 영향 없음
    console.warn('[mindTrackVideoEvents] insert failed', e);
  }
}
