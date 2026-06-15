// Analyze a therapy session upload (photo of handwritten log) via Gemini Vision.
// Body: { centerId, clientId, therapistId?, sessionDate?, weekKey?, imageBase64 (data URL or raw base64), mimeType? }
// Creates a center_session_uploads row, uploads image to storage bucket, returns the row.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "center-session-uploads";

function isoWeekKey(d: Date): string {
  const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - day);
  const y = dt.getUTCFullYear();
  const yStart = new Date(Date.UTC(y, 0, 1));
  const w = Math.ceil(((dt.getTime() - yStart.getTime()) / 86400000 + 1) / 7);
  return `${y}-W${String(w).padStart(2, "0")}`;
}

async function ensureBucket(admin: ReturnType<typeof createClient>) {
  try {
    const { data } = await admin.storage.getBucket(BUCKET);
    if (data) return;
  } catch (_) { /* ignore */ }
  await admin.storage.createBucket(BUCKET, { public: false });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: { user } } = await admin.auth.getUser(auth.replace("Bearer ", ""));
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });

    const body = await req.json();
    const { centerId, clientId, therapistId, sessionDate, imageBase64, mimeType } = body;
    if (!centerId || !clientId || !imageBase64) {
      return new Response(JSON.stringify({ error: "centerId, clientId, imageBase64 required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    // Verify membership
    const { data: mem } = await admin.from("center_members").select("user_id").eq("center_id", centerId).eq("user_id", user.id).maybeSingle();
    if (!mem) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });

    const sd = sessionDate ? new Date(sessionDate) : new Date();
    const weekKey = isoWeekKey(sd);
    const mt = mimeType || "image/jpeg";
    const ext = mt.includes("png") ? "png" : "jpg";

    // Strip data URL prefix
    const rawB64 = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
    const bytes = Uint8Array.from(atob(rawB64), c => c.charCodeAt(0));

    await ensureBucket(admin);
    const path = `${centerId}/${clientId}/${sd.toISOString().slice(0,10)}-${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await admin.storage.from(BUCKET).upload(path, bytes, { contentType: mt, upsert: false });
    if (upErr) throw upErr;

    // Insert upload row (pending)
    const { data: row, error: insErr } = await admin.from("center_session_uploads").insert({
      center_id: centerId,
      client_id: clientId,
      therapist_id: therapistId ?? null,
      session_date: sd.toISOString().slice(0,10),
      week_key: weekKey,
      storage_path: path,
      status: "pending",
      uploaded_by: user.id,
    }).select().single();
    if (insErr) throw insErr;

    // Call Gemini Vision via Lovable AI Gateway (OpenAI-compatible chat completions)
    const prompt = `이 이미지는 치료사가 손으로 쓴 회기 일지 또는 출력된 치료 기록입니다. 다음을 JSON으로만 반환하세요 (다른 설명 금지):
{
  "ocr_text": "원문 전체 텍스트",
  "activities": ["오늘 진행한 활동들"],
  "emotions": ["관찰된 아동 감정/태도"],
  "goals": ["오늘 다룬 치료 목표"],
  "progress_notes": "주요 진전/특이사항을 2-3문장",
  "next_steps": ["다음 회기 제안"]
}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "당신은 치료 기록을 읽고 정확히 JSON으로 구조화하는 비서입니다. JSON 외 어떤 텍스트도 출력하지 마세요." },
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: `data:${mt};base64,${rawB64}` } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      await admin.from("center_session_uploads").update({ status: "failed", error_message: errText.slice(0, 500) }).eq("id", row.id);
      return new Response(JSON.stringify({ error: "ai_failed", detail: errText, upload: row }), { status: 502, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const aiJson = await aiRes.json();
    const text = aiJson.choices?.[0]?.message?.content ?? "{}";
    let extracted: any = {};
    try { extracted = JSON.parse(text); } catch { extracted = { ocr_text: text }; }

    const { data: updated } = await admin.from("center_session_uploads").update({
      status: "parsed",
      ocr_text: extracted.ocr_text ?? null,
      ai_extracted: extracted,
    }).eq("id", row.id).select().single();

    return new Response(JSON.stringify({ upload: updated }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("[analyze-session-upload]", e);
    return new Response(JSON.stringify({ error: e?.message ?? String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
