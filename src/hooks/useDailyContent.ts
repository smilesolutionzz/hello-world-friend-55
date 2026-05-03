/**
 * Day별 콘텐츠 오버라이드 로더 — 트랙(focus) 인식형
 *
 * 1) 사용자가 선택한 니즈 트랙(`enrollment.goal_focus`)에 맞는 30일 매트릭스를
 *    `mindTrackTrackContent.ts`에서 가져온 뒤,
 * 2) 관리자가 `mind_track_daily_content_overrides`에 저장한 (트랙 무관) 오버라이드를
 *    그 위에 덮어 최종 콘텐츠를 반환합니다.
 *
 * `focusId`가 주어지지 않으면 안전 기본 트랙(`stress`)을 사용합니다.
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  mergeDailyOverride,
  type MindTrackDailyContent,
} from '@/lib/mindTrackDailyContent';
import { getTrackDailyContent } from '@/lib/mindTrackTrackContent';
import { getFocus, type MindTrackFocusId } from '@/lib/mindTrackFocusTracks';

export function useDailyContent(day: number, focusId?: string | null) {
  const focus = getFocus(focusId);
  const initial = (): MindTrackDailyContent =>
    getTrackDailyContent(focus.id as MindTrackFocusId, day);

  const [content, setContent] = useState<MindTrackDailyContent>(initial);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const base = getTrackDailyContent(focus.id as MindTrackFocusId, day);
    setLoading(true);
    setContent(base);

    (async () => {
      try {
        const { data, error } = await supabase
          .from('mind_track_daily_content_overrides')
          .select('assessment, video, action, is_active')
          .eq('day_number', day)
          .eq('is_active', true)
          .maybeSingle();
        if (cancelled) return;
        if (error) {
          console.warn('[useDailyContent] override fetch failed', error);
        } else if (data) {
          // override는 트랙 콘텐츠 위에 덮어씌움
          const merged = mergeDailyOverride(day, data as never);
          setContent({
            day: base.day,
            assessment: data.assessment === undefined ? base.assessment : (merged.assessment ?? base.assessment),
            video: merged.video ?? base.video,
            action: merged.action ?? base.action,
          });
        }
      } catch (e) {
        console.warn('[useDailyContent] unexpected error', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, focus.id]);

  return { content, loading, focus };
}
