import { supabase } from '@/integrations/supabase/client';
import { trackEvent } from '@/components/common/Analytics';

export type TrackAudience = 'child' | 'teen' | 'adult' | 'parent';

export type TrackEntrySource =
  | 'mind_track_hub'
  | 'track_adult_landing'
  | 'track_parent_landing'
  | 'track_teen_landing'
  | 'track_child_redirect'
  | 'nav'
  | 'other';

export interface TrackEntryClickParams {
  audience: TrackAudience;
  source: TrackEntrySource;
  destination: string;
  from_audience?: TrackAudience | null;
}

/**
 * 트랙 입구 클릭(카드/링크/리다이렉트) 통합 추적.
 * - GA4 + Hotjar + Clarity (window.gtag 등) 으로 'track_entry_click' 이벤트 전송
 * - 로그인 사용자는 user_analytics_events 에도 적재 → 어드민 대시보드에서 audience별 유입 경로 분석
 */
export async function trackTrackEntryClick(params: TrackEntryClickParams) {
  const payload = {
    audience: params.audience,
    source: params.source,
    destination: params.destination,
    from_audience: params.from_audience ?? null,
    timestamp: new Date().toISOString(),
  };

  try {
    trackEvent('track_entry_click', payload);
  } catch (err) {
    console.warn('[track_entry_click] analytics emit failed', err);
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const sessionId =
      sessionStorage.getItem('session_id') ??
      (() => {
        const id = crypto.randomUUID();
        sessionStorage.setItem('session_id', id);
        return id;
      })();

    await supabase.from('user_analytics_events').insert({
      user_id: session.user.id,
      session_id: sessionId,
      event_name: 'track_entry_click',
      page_path: typeof window !== 'undefined' ? window.location.pathname : null,
      referrer: typeof document !== 'undefined' ? document.referrer : null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      event_properties: payload,
    });
  } catch (err) {
    console.warn('[track_entry_click] db insert failed', err);
  }
}
