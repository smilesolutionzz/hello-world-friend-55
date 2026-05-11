// Workbook sample preview funnel tracking — writes to GA + user_analytics_events
// (now supports anonymous guests via NULL user_id + persistent anon session id).

import { supabase } from "@/integrations/supabase/client";
import { trackEvent as gaTrackEvent } from "@/components/common/Analytics";

export type WorkbookFunnelEvent =
  | "mt_workbook_sample_open"
  | "mt_workbook_sample_complete"
  | "mt_workbook_sample_cta_click"
  | "mt_action_book_preview_view"
  | "mt_action_book_live_generate"
  | "mt_action_book_pdf_download"
  | "mt_action_book_unlock_cta_click";

/**
 * Personalization fields applied to a workbook sample render.
 * Used to measure which fields actually move CTA conversion.
 */
export interface PersonalizationFlags {
  has_nickname?: boolean;
  has_track_theme?: boolean; // primary_goal mapped to a theme
  has_checkins?: boolean;
  has_baselines?: boolean;
  checkin_count?: number;
  baseline_count?: number;
  current_day?: number;
}

const ANON_SESSION_KEY = "aihpro_anon_session_id";

function detectDevice(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent || "";
  const w = window.innerWidth;
  if (/iPad|Tablet/i.test(ua) || (w >= 768 && w < 1024)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua) || w < 768) return "mobile";
  return "desktop";
}

/**
 * Persistent anonymous session id stored in localStorage so funnels
 * survive page reloads and tab switches for guest traffic.
 */
function getAnonSessionId(): string {
  try {
    let id = localStorage.getItem(ANON_SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(ANON_SESSION_KEY, id);
    }
    // Mirror to sessionStorage for downstream consumers
    try {
      if (!sessionStorage.getItem("session_id")) {
        sessionStorage.setItem("session_id", id);
      }
    } catch {
      /* ignore */
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export async function trackWorkbookFunnel(
  event: WorkbookFunnelEvent,
  properties: Record<string, any> = {},
) {
  const device = detectDevice();
  const enriched = { ...properties, device };

  // 1) GA / Hotjar / Clarity — fires for everyone
  gaTrackEvent(event, enriched);

  // 2) DB insert — both guests (user_id NULL) and authenticated users
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id ?? null;
    const sessionId = userId
      ? sessionStorage.getItem("session_id") || (() => {
          const id = crypto.randomUUID();
          try { sessionStorage.setItem("session_id", id); } catch {}
          return id;
        })()
      : getAnonSessionId();

    const payload: any = {
      user_id: userId,
      session_id: sessionId,
      event_name: event,
      page_path: typeof window !== "undefined" ? window.location.pathname : null,
      referrer: typeof document !== "undefined" ? document.referrer : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      event_properties: { ...enriched, logged_in: !!userId, anon_session: !userId },
    };

    await supabase.from("user_analytics_events").insert(payload);
  } catch (e) {
    // Silent — analytics must never break UX
    console.warn("[workbookFunnel] insert failed", e);
  }
}
