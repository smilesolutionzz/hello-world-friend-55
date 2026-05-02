/**
 * Day별 콘텐츠 오버라이드 로더
 *
 * 관리자가 `mind_track_daily_content_overrides` 에 저장한 값을 가져와
 * 코드 기본값(`mindTrackDailyContent.ts`) 위에 덮어씌운 최종 콘텐츠를
 * 반환합니다.
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  getDefaultDailyContent,
  mergeDailyOverride,
  type MindTrackDailyContent,
} from '@/lib/mindTrackDailyContent';

export function useDailyContent(day: number) {
  const [content, setContent] = useState<MindTrackDailyContent>(() =>
    getDefaultDailyContent(day),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setContent(getDefaultDailyContent(day));

    supabase
      .from('mind_track_daily_content_overrides')
      .select('assessment, video, action, is_active')
      .eq('day_number', day)
      .eq('is_active', true)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setContent(
          mergeDailyOverride(day, data as never),
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [day]);

  return { content, loading };
}
