// Validates all 30-day Mind Track YouTube videos via oEmbed.
// Invalid (404/401) videos trigger an admin_notifications row.
// Reads overrides from mind_track_daily_content_overrides; falls back to defaults
// passed in the request body (optional). Designed for cron invocation.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VideoEntry {
  day: number;
  videoId: string;
  title?: string;
  source: "override" | "default";
}

// Default 30-day video list (mirrors src/lib/mindTrackDailyContent.ts).
// Kept in-sync manually; overrides take precedence when present in DB.
const DEFAULT_VIDEOS: Record<number, { videoId: string; title: string }> = {
  1: { videoId: "TGoAN5L_oPI", title: "5분 마음챙김 명상" },
  2: { videoId: "wQfWgYCMeLw", title: "감정 흘려보내기 명상" },
  3: { videoId: "3hyTLOCQFTE", title: "감정 라벨링" },
  4: { videoId: "GBBh694I1bw", title: "바디스캔 (안희영)" },
  5: { videoId: "Uuq4OME-7-M", title: "5초 법칙 (멜 로빈스)" },
  6: { videoId: "Oo43FrfVXOk", title: "거절은 다정한 경계" },
  7: { videoId: "Lllh4HdUMvk", title: "회복탄력성 (김주환)" },
  8: { videoId: "6Qu5E3MrVH8", title: "5분 명상 — 습관" },
  9: { videoId: "cvPS_25gRPs", title: "생각 비우기 명상" },
  10: { videoId: "XgVjs-WeBWY", title: "10분 호흡 명상 (마보)" },
  11: { videoId: "NKoiz6YtlRE", title: "멈추는 호흡법" },
  12: { videoId: "QN9v0nkmR_o", title: "박스 호흡법" },
  13: { videoId: "ZcEBlA-9r9k", title: "10분 편안 명상" },
  14: { videoId: "dZewQEbQQM0", title: "5분 호흡명상" },
  15: { videoId: "LaM3-_ntnjU", title: "빼기 명상" },
  16: { videoId: "Bcs33wFg-KA", title: "회피의 과학" },
  17: { videoId: "Tiwk1f6ZS9Y", title: "회피형 극복법" },
  18: { videoId: "TtTbhde9A3E", title: "RAIN 자기돌봄 명상" },
  19: { videoId: "YkFiiNBo6O0", title: "자애 명상 (마보)" },
  20: { videoId: "xeul9fEvo-Q", title: "긍정 확언" },
  21: { videoId: "_MTd1opMBk0", title: "10분 평온 명상" },
  22: { videoId: "0KROAacWzEA", title: "렛고 명상" },
  23: { videoId: "PIoK5ZdYk6E", title: "5분 아침 명상" },
  24: { videoId: "GQgjJUN02u4", title: "재발방지 알아차림 명상" },
  25: { videoId: "yiysD0Jl2Wo", title: "10분 데일리 명상" },
  26: { videoId: "inxAScz0PTM", title: "누워서 10분 명상" },
  27: { videoId: "NsVVO9hnCJ4", title: "이완 명상" },
  28: { videoId: "hTSLx_wCQjU", title: "불편한 감정 명상" },
  29: { videoId: "RptypCXGN-c", title: "10분 긍정 확언" },
  30: { videoId: "c9W414XrdF0", title: "밤 마무리 명상" },
};

async function checkVideo(videoId: string): Promise<{ ok: boolean; status: number }> {
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  try {
    const res = await fetch(url, { method: "GET" });
    return { ok: res.status === 200, status: res.status };
  } catch (_e) {
    return { ok: false, status: 0 };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    // 1) Build day → video map (overrides win)
    const map: Record<number, VideoEntry> = {};
    for (const [d, v] of Object.entries(DEFAULT_VIDEOS)) {
      map[Number(d)] = { day: Number(d), videoId: v.videoId, title: v.title, source: "default" };
    }
    const { data: overrides } = await supabase
      .from("mind_track_daily_content_overrides")
      .select("day_number, video, is_active")
      .eq("is_active", true);
    for (const row of overrides ?? []) {
      const v: any = row.video;
      if (v?.videoId) {
        map[row.day_number] = {
          day: row.day_number,
          videoId: v.videoId,
          title: v.title ?? map[row.day_number]?.title,
          source: "override",
        };
      }
    }

    // 2) Validate via oEmbed (parallel, capped)
    const entries = Object.values(map).sort((a, b) => a.day - b.day);
    const results = await Promise.all(
      entries.map(async (e) => ({ ...e, ...(await checkVideo(e.videoId)) })),
    );
    const invalid = results.filter((r) => !r.ok);

    // 3) Notify admins if any invalid
    if (invalid.length > 0) {
      const lines = invalid
        .map((i) => `Day ${i.day} (${i.source}): ${i.videoId} → HTTP ${i.status}${i.title ? ` · ${i.title}` : ""}`)
        .join("\n");
      await supabase.from("admin_notifications").insert({
        notification_type: "mindtrack_video_invalid",
        title: `MindTrack 영상 ${invalid.length}개 검증 실패`,
        message: `다음 영상이 비공개/삭제 상태입니다. 관리자 페이지(/admin/mind-track-content)에서 교체해 주세요.\n\n${lines}`,
        priority: "high",
      });
    }

    return new Response(
      JSON.stringify({
        checked: results.length,
        invalid_count: invalid.length,
        invalid,
        ts: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[validate-mindtrack-videos]", e);
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
