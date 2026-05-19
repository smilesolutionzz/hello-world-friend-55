import { supabase } from '@/integrations/supabase/client';
import { trackEvent } from '@/components/common/Analytics';

export type BottomTabId = 'quiz' | 'journey' | 'track' | 'expert' | 'profile';

export const BOTTOM_TAB_EVENT = 'bottom_tab_click';

export interface BottomTabClickParams {
  tab: BottomTabId;
  destination: string;
  from_path?: string;
}

/**
 * 하단바 탭 클릭 통합 추적.
 * - GA4 등으로 'bottom_tab_click' 이벤트 전송
 * - 로그인 사용자는 user_analytics_events 에도 적재 → 어드민 대시보드에서 탭별 유입 경로 분석
 */
export async function trackBottomTabClick(params: BottomTabClickParams) {
  const payload = {
    tab: params.tab,
    destination: params.destination,
    from_path: params.from_path ?? (typeof window !== 'undefined' ? window.location.pathname : null),
    timestamp: new Date().toISOString(),
  };

  try {
    trackEvent(BOTTOM_TAB_EVENT, payload);
  } catch (err) {
    console.warn('[bottom_tab_click] analytics emit failed', err);
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
      event_name: BOTTOM_TAB_EVENT,
      page_path: typeof window !== 'undefined' ? window.location.pathname : null,
      referrer: typeof document !== 'undefined' ? document.referrer : null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      event_properties: payload,
    });
  } catch (err) {
    console.warn('[bottom_tab_click] db insert failed', err);
  }
}
