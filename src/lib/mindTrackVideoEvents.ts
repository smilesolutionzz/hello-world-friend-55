/**
 * MindTrack 영상 이벤트 로거 — 안전 모드
 *
 * 원칙: 이벤트 기록 실패가 사용자 경험을 절대 깨뜨리지 않습니다.
 *   - 모든 호출은 fire-and-forget (await 강제 안 함)
 *   - try/catch 로 감싸 RLS·네트워크 오류를 흡수
 *   - 실패 시 콘솔 + sessionStorage 의 'aih_log_errors' 큐에 기록 (관리자 진단용)
 *   - GA dataLayer 푸시는 항상 시도 (Supabase 실패 무관)
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

function recordError(scope: string, err: unknown) {
  try {
    console.warn(`[mindTrackVideoEvents:${scope}]`, err);
    if (typeof window === 'undefined') return;
    const key = 'aih_log_errors';
    const raw = sessionStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    arr.unshift({
      scope,
      message: err instanceof Error ? err.message : String(err),
      ts: new Date().toISOString(),
    });
    sessionStorage.setItem(key, JSON.stringify(arr.slice(0, 20)));
  } catch {
    // 무시 — 로깅의 로깅 실패는 절대 throw 하지 않음
  }
}

export function logMindTrackVideoEvent(params: LogParams): void {
  const { videoId, videoTitle, eventType, day, metadata = {} } = params;

  // 1) GA dataLayer push — 동기, 실패 무시
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
    recordError('dataLayer', e);
  }

  // 2) Supabase 기록 — 비동기, 실패해도 throw 안 함
  void (async () => {
    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr) {
        recordError('auth', authErr);
        return;
      }
      if (!user) return; // 익명 사용자는 조용히 스킵
      const { error } = await supabase.from('mind_track_video_events').insert({
        user_id: user.id,
        video_id: videoId,
        video_title: videoTitle ?? null,
        event_type: eventType,
        day_number: day ?? null,
        metadata: metadata as never,
      });
      if (error) recordError('insert', error);
    } catch (e) {
      recordError('catch', e);
    }
  })();
}
