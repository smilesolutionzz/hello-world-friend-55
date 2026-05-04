import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const SESSION_KEY = 'b2b_funnel_session_id';

const B2B_PATHS = [
  '/business',
  '/b2b-jobcoach',
  '/b2b-proposal',
  '/b2b-hr-dashboard',
  '/b2b-demo-report',
  '/business-case-studies',
  '/business-security',
];

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export async function trackB2BEvent(
  eventType: string,
  pagePath: string,
  metadata: Record<string, unknown> = {},
) {
  try {
    const sessionId = getOrCreateSessionId();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('b2b_funnel_events').insert([{
      event_type: eventType,
      page_path: pagePath,
      session_id: sessionId,
      user_id: user?.id ?? undefined,
      referrer: (typeof document !== 'undefined' ? document.referrer : '') || undefined,
      metadata: metadata as never,
    }]);
  } catch (err) {
    // Silent — tracking must not break UX
    console.warn('[b2b-funnel] track failed', err);
  }
}

/**
 * Auto-tracks page views on B2B routes.
 * Mount once at app root.
 */
export function useB2BFunnelAutoTrack() {
  const location = useLocation();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const path = location.pathname;
    if (lastPath.current === path) return;
    if (!B2B_PATHS.some((p) => path === p || path.startsWith(`${p}/`))) return;
    lastPath.current = path;
    void trackB2BEvent('page_view', path);
  }, [location.pathname]);
}
