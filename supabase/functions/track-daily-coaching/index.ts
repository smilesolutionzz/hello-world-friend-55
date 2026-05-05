// Tracking pixel + click redirect for daily coaching emails.
// GET ?t=<token>&e=open  -> 1x1 transparent gif + insert 'open' event
// GET ?t=<token>&e=click&u=<encoded url> -> insert 'click' event + 302 redirect
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

const PIXEL = Uint8Array.from(
  atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"),
  (c) => c.charCodeAt(0),
);

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const url = new URL(req.url);
  const token = url.searchParams.get("t") || "";
  const eventType = (url.searchParams.get("e") || "open") as "open" | "click";
  const target = url.searchParams.get("u") || "";

  const supa = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    if (token) {
      const ipRaw = req.headers.get("x-forwarded-for") || "";
      const ip_hash = ipRaw ? (await sha256(ipRaw)).slice(0, 16) : null;
      await supa.from("daily_coaching_email_events").insert({
        token,
        event_type: eventType,
        target_url: target || null,
        user_agent: req.headers.get("user-agent")?.slice(0, 500) || null,
        ip_hash,
        metadata: { ts: new Date().toISOString() },
      });
    }
  } catch (e) {
    console.error("[track-daily-coaching] insert failed", e);
  }

  if (eventType === "click" && target) {
    return new Response(null, {
      status: 302,
      headers: { ...cors, Location: target, "Cache-Control": "no-store" },
    });
  }

  return new Response(PIXEL, {
    status: 200,
    headers: {
      ...cors,
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Content-Length": String(PIXEL.length),
    },
  });
});
