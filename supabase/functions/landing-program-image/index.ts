import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "partner-media";

interface ReqBody {
  center_id: string;
  title: string;
  desc?: string;
  template?: string;
}

const TEMPLATE_HINT: Record<string, string> = {
  dev_center: "child development therapy room, soft natural light, calm",
  psych_center: "warm counseling room, soft armchairs, plants, gentle light",
  day_activity: "bright community activity space, simple furniture, warm",
  daycare: "soft cozy daycare interior, wooden toys, pastel light",
  kindergarten: "bright kindergarten classroom interior, warm wood, art supplies",
  nursing_home: "calm care home interior, soft window light, plants, ceramics",
  nursing_hospital: "calm bright medical care interior, white linens, soft light",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { center_id, title, desc = "", template = "" }: ReqBody = await req.json();
    if (!center_id || !title) {
      return new Response(JSON.stringify({ error: "center_id and title required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
    const SVC = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!KEY) throw new Error("LOVABLE_API_KEY missing");

    const ctx = TEMPLATE_HINT[template] ?? "calm wellness studio interior";

    // 1) Turn program copy into a concrete photographic scene (EN).
    let scene = "";
    try {
      const sr = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content:
                "Convert the Korean program name and description into a SINGLE concrete photographic scene (English, max 35 words) that literally represents the program's theme. NEVER include children, NEVER show identifiable human faces (hands, backs, silhouettes, empty space only). No text, no logos, no clinical/medical equipment. Output only the scene description.",
            },
            { role: "user", content: `Context: ${ctx}\nProgram: ${title}\nDesc: ${desc}` },
          ],
        }),
      });
      if (sr.ok) {
        const sj = await sr.json();
        scene = String(sj?.choices?.[0]?.message?.content ?? "").trim().replace(/^["']|["']$/g, "");
      }
    } catch (_) { /* noop */ }
    if (!scene) scene = `${ctx}, related to ${title}`;

    // 2) Generate the image (square, calm editorial photo).
    const prompt = `Photograph, warm editorial lifestyle, natural soft light, shallow depth of field, real textures (wood, linen, paper, ceramic, plants, fabric). Scene: ${scene}. Calm, magazine quality, low-detail empty area on one side. Strictly no children, no clearly identifiable human faces, no text, no logos, no medical equipment.`;

    const imgRes = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-image-2",
        prompt,
        size: "1024x1024",
        quality: "low",
        n: 1,
      }),
    });
    if (!imgRes.ok) {
      const t = await imgRes.text();
      return new Response(JSON.stringify({ error: `image gen failed: ${imgRes.status} ${t}` }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const ij = await imgRes.json();
    const b64 = ij?.data?.[0]?.b64_json;
    if (!b64) throw new Error("no image returned");

    // 3) Upload to storage.
    const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const supa = createClient(SUPA_URL, SVC);
    const path = `landing/${center_id}/programs/ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
    const { error: upErr } = await supa.storage.from(BUCKET).upload(path, bin, {
      contentType: "image/png", upsert: false,
    });
    if (upErr) throw upErr;
    const { data: pub } = supa.storage.from(BUCKET).getPublicUrl(path);

    return new Response(JSON.stringify({ url: pub.publicUrl, scene }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
