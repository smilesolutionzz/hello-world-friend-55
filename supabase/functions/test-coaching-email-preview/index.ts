// Test endpoint: sends a sample daily coaching email with YouTube recommendations
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FROM_ADDRESS = "AIHPRO 데일리 코칭 <coaching@aihpro.app>";
const REPLY_TO = "support@aihpro.app";
const SITE_URL = "https://aihpro.app";
const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");

interface YTVideo { videoId: string; title: string; channelTitle: string; thumbnail: string; reason: string; }

const SEARCH_TERMS_BY_CATEGORY: Record<string, string[]> = {
  stress: ["마음챙김 명상 5분", "스트레스 해소 호흡법"],
  depression: ["우울증 극복 방법", "행동 활성화"],
  anxiety: ["불안 완화 호흡법", "공황 대처"],
  sleep: ["수면 위생", "잠 잘오는 방법"],
  adhd: ["성인 ADHD 집중력", "포모도로 시간관리"],
  parenting: ["정서 코칭 양육법", "아이 감정 코칭"],
  self_esteem: ["자기 자비 명상", "자존감 회복"],
};

async function fetchYouTubeVideos(category: string, mission: string): Promise<YTVideo[]> {
  if (!YOUTUBE_API_KEY) return [];
  const terms = SEARCH_TERMS_BY_CATEGORY[category] || SEARCH_TERMS_BY_CATEGORY.stress;
  const out: YTVideo[] = [];
  for (const term of terms.slice(0, 2)) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&relevanceLanguage=ko&regionCode=KR&order=relevance&safeSearch=strict&q=${encodeURIComponent(term)}&key=${YOUTUBE_API_KEY}`;
      const r = await fetch(url);
      if (!r.ok) continue;
      const j = await r.json();
      const item = j.items?.[0];
      if (!item) continue;
      out.push({
        videoId: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        reason: `오늘 미션 "${mission.slice(0, 28)}…"에 도움이 되는 ${term} 영상`,
      });
    } catch (e) { console.error("yt err", term, e); }
  }
  return out;
}

function buildHtml(nickname: string, videos: YTVideo[]) {
  const dayNumber = 7;
  const totalDays = 30;
  const progressPct = Math.round((dayNumber / totalDays) * 100);
  const categoryLabel = "스트레스 회복탄력성";
  const mission = "오늘은 마음챙김 호흡을 5분간 시도하고, 호흡 전후의 긴장감을 1~10점으로 기록해보세요.";
  const insight = "Kabat-Zinn MBSR 프로그램 연구에 따르면, 매일 5분의 마음챙김 호흡 훈련은 8주 후 코르티솔 수치를 평균 19% 감소시킵니다.";
  const researchBase = "Kabat-Zinn MBSR 프로그램";

  const videosHtml = videos.length === 0 ? '' : `
    <div style="margin:0 0 28px;">
      <div style="font-size:11px;letter-spacing:0.16em;color:#64748b;text-transform:uppercase;margin-bottom:12px;">03 · 오늘의 추천 영상</div>
      ${videos.map(v => `
        <a href="https://www.youtube.com/watch?v=${v.videoId}" style="display:block;text-decoration:none;color:#0f172a;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:12px;margin-bottom:10px;">
          <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="width:140px;vertical-align:top;padding-right:14px;">
                <img src="${v.thumbnail}" alt="" width="140" height="80" style="width:140px;height:80px;object-fit:cover;border-radius:8px;display:block;border:0;" />
              </td>
              <td style="vertical-align:top;">
                <div style="font-size:14px;font-weight:600;color:#0f172a;line-height:1.4;margin-bottom:4px;">${v.title}</div>
                <div style="font-size:11px;color:#64748b;margin-bottom:6px;">${v.channelTitle}</div>
                <div style="font-size:11px;color:#94a3b8;line-height:1.5;">${v.reason}</div>
              </td>
            </tr>
          </table>
        </a>
      `).join('')}
    </div>`;

  return `<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,'Pretendard Variable',Inter,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:8px;padding:10px 14px;margin-bottom:20px;font-size:12px;color:#78350f;">
      🧪 <strong>테스트 메일</strong> — 실제 구독자에게는 매일 아침 8시(KST)에 자동 발송됩니다.
    </div>
    <div style="font-size:11px;letter-spacing:0.18em;color:#64748b;text-transform:uppercase;margin-bottom:8px;">AIHPRO Daily Coaching</div>
    <div style="font-size:13px;color:#475569;margin-bottom:24px;">${nickname}님 · ${categoryLabel} 트랙</div>
    <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:6px;">
      <div style="font-family:Georgia,serif;font-size:42px;font-weight:600;color:#0f172a;line-height:1;">Day ${String(dayNumber).padStart(2,'0')}</div>
      <div style="font-size:13px;color:#94a3b8;">/ ${totalDays}일 트랙</div>
    </div>
    <div style="height:4px;background:#f1f5f9;border-radius:99px;margin:18px 0 32px;overflow:hidden;">
      <div style="width:${progressPct}%;height:100%;background:linear-gradient(90deg,#0f172a,#3b82f6);"></div>
    </div>
    <div style="border-left:3px solid #0f172a;padding:4px 0 4px 16px;margin-bottom:28px;">
      <div style="font-size:11px;letter-spacing:0.16em;color:#64748b;text-transform:uppercase;margin-bottom:8px;">01 · 오늘의 미션</div>
      <div style="font-size:16px;line-height:1.65;color:#0f172a;font-weight:500;">${mission}</div>
    </div>
    <div style="background:#f8fafc;border-radius:12px;padding:20px 22px;margin-bottom:28px;">
      <div style="font-size:11px;letter-spacing:0.16em;color:#64748b;text-transform:uppercase;margin-bottom:10px;">02 · 임상적 근거</div>
      <div style="font-size:14px;line-height:1.7;color:#334155;">${insight}</div>
      <div style="margin-top:14px;font-size:11px;color:#94a3b8;font-style:italic;">근거 기반: ${researchBase}</div>
    </div>
    ${videosHtml}
    <a href="${SITE_URL}/observation-log" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:600;">오늘의 기록 남기기 →</a>
    <div style="margin-top:40px;padding-top:24px;border-top:1px solid #e2e8f0;font-size:11px;line-height:1.7;color:#94a3b8;">
      본 메일은 의료 진단·치료를 대체하지 않으며, 발달 코칭 및 자기관찰 도구로 제공됩니다.<br/>
      © AIHPRO · 매일 아침 8시(KST) 자동 발송
    </div>
  </div>
</body></html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { to, nickname } = await req.json();
    if (!to) throw new Error("to required");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY missing");
    const resend = new Resend(resendKey);

    const mission = "오늘은 마음챙김 호흡을 5분간 시도하고, 호흡 전후의 긴장감을 1~10점으로 기록해보세요.";
    const videos = await fetchYouTubeVideos("stress", mission);

    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      reply_to: REPLY_TO,
      to: [to],
      subject: `[테스트] [Day 07] 스트레스 회복탄력성 - 오늘의 미션 + 추천 영상`,
      html: buildHtml(nickname || "테스트", videos),
    });

    return new Response(JSON.stringify({ success: true, videoCount: videos.length, result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ success: false, error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
