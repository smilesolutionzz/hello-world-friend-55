// Workbook sample preview funnel tracking — writes both to GA (via Analytics)
// and to our own `user_analytics_events` table so the admin dashboard can
// build a proper conversion funnel by login state and device.

import { supabase } from "@/integrations/supabase/client";
import { trackEvent as gaTrackEvent } from "@/components/common/Analytics";

export type WorkbookFunnelEvent =
  | "mt_workbook_sample_open"
  | "mt_workbook_sample_complete"
  | "mt_workbook_sample_cta_click";

function detectDevice(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent || "";
  const w = window.innerWidth;
  if (/iPad|Tablet/i.test(ua) || (w >= 768 && w < 1024)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua) || w < 768) return "mobile";
  return "desktop";
}

function getOrCreateSessionId(): string {
  try {
    let id = sessionStorage.getItem("session_id");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("session_id", id);
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

  // 1) GA / Hotjar / Clarity
  gaTrackEvent(event, enriched);

  // 2) DB — logged in only (RLS requires auth.uid() = user_id)
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    await supabase.from("user_analytics_events").insert({
      user_id: session.user.id,
      session_id: getOrCreateSessionId(),
      event_name: event,
      page_path: typeof window !== "undefined" ? window.location.pathname : null,
      referrer: typeof document !== "undefined" ? document.referrer : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      event_properties: { ...enriched, logged_in: true },
    });
  } catch (e) {
    // Silent — analytics must never break UX
    console.warn("[workbookFunnel] insert failed", e);
  }
}
