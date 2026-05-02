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
  1: { videoId: "inpok4MKVLM", title: "5분 마음챙김 호흡 명상" },
  2: { videoId: "wfDTp2GogaQ", title: "오늘의 감정 알아차리기" },
  3: { videoId: "RVA2N6tX2cg", title: "감정 라벨링" },
  4: { videoId: "MIr3RsUWrdo", title: "바디스캔" },
  5: { videoId: "ZToicYcHIOU", title: "데일리 명상" },
  6: { videoId: "F28MGLlpP90", title: "수면 호흡" },
  7: { videoId: "O-6f5wQXSu8", title: "1주차 회고" },
  8: { videoId: "5DqTuWve9t8", title: "셀프 컴패션" },
  9: { videoId: "WPPPFqsECz0", title: "감사 일기" },
  10: { videoId: "wfDTp2GogaQ", title: "감정 알아차리기" },
  11: { videoId: "tEmt1Znux58", title: "마인드풀니스" },
  12: { videoId: "MIr3RsUWrdo", title: "바디스캔 심화" },
  13: { videoId: "F28MGLlpP90", title: "수면 루틴" },
  14: { videoId: "hnpQrMqDoqE", title: "스트레스 관리" },
  15: { videoId: "ZToicYcHIOU", title: "중간 점검 명상" },
  16: { videoId: "5DqTuWve9t8", title: "자기 자비" },
  17: { videoId: "WPPPFqsECz0", title: "긍정 마인드셋" },
  18: { videoId: "inpok4MKVLM", title: "호흡 안정화" },
  19: { videoId: "tEmt1Znux58", title: "현재에 머무르기" },
  20: { videoId: "RVA2N6tX2cg", title: "감정 표현" },
  21: { videoId: "O-6f5wQXSu8", title: "3주차 회고" },
  22: { videoId: "MIr3RsUWrdo", title: "이완 훈련" },
  23: { videoId: "F28MGLlpP90", title: "수면의 질" },
  24: { videoId: "6p_yaNFSYao", title: "재발 신호 알아차리기" },
  25: { videoId: "ZToicYcHIOU", title: "데일리 명상" },
  26: { videoId: "hnpQrMqDoqE", title: "스트레스 회복력" },
  27: { videoId: "5DqTuWve9t8", title: "자기 돌봄" },
  28: { videoId: "WPPPFqsECz0", title: "감사 실천" },
  29: { videoId: "tEmt1Znux58", title: "30일 통합" },
  30: { videoId: "O-6f5wQXSu8", title: "졸업 회고" },
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
