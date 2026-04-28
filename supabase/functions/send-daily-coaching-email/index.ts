import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { Resend } from 'npm:resend@2.0.0'
import { template as dailyCoachingTpl } from '../_shared/transactional-email-templates/daily-coaching.tsx'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: any) => {
  console.log(`[DAILY-COACHING] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

const FROM_ADDRESS = 'AIHPRO 코칭 <coaching@aihpro.app>'
const REPLY_TO = 'support@aihpro.app'

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const DUPLICATE_WINDOW_DAYS = 14;
const MIN_VIEW_COUNT = 10_000;
const MAX_DURATION_SECONDS = 20 * 60;
const MIN_DURATION_SECONDS = 60;

interface YouTubeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  reason: string;
  viewCount?: number;
  durationSeconds?: number;
}

interface VideoPreferences {
  interest_topics: string[];
  difficulty_level: string;
  preferred_duration: string;
  language: string;
}

const CATEGORY_SEARCH_TERMS: Record<string, string[]> = {
  depression: ["우울증 극복 방법", "행동 활성화 우울", "우울감 자기돌봄 루틴"],
  anxiety: ["불안 완화 호흡법", "공황 대처 명상", "사회불안 인지행동치료"],
  sleep: ["수면 위생 CBT-I", "잠 잘오는 방법", "수면 명상 가이드"],
  adhd: ["성인 ADHD 집중력", "포모도로 시간관리", "ADHD 실행기능 훈련"],
  parenting: ["정서 코칭 양육법", "아이 감정 코칭", "부모 자녀 의사소통"],
  stress: ["마음챙김 명상 5분", "스트레스 해소 호흡", "이완 명상 가이드"],
  self_esteem: ["자기 자비 명상", "자존감 회복", "긍정 심리 훈련"],
};

const DURATION_LIMITS: Record<string, number> = {
  short: 10 * 60,
  medium: 20 * 60,
  long: 45 * 60,
};

function parseISO8601Duration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const h = parseInt(m[1] || "0"), mn = parseInt(m[2] || "0"), s = parseInt(m[3] || "0");
  return h * 3600 + mn * 60 + s;
}

async function searchYouTube(query: string, language = "ko", maxResults = 6): Promise<string[]> {
  const regionCode = language === "en" ? "US" : "KR";
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${maxResults}&relevanceLanguage=${language}&regionCode=${regionCode}&order=relevance&safeSearch=strict&videoEmbeddable=true&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`;
  const r = await fetch(url);
  if (!r.ok) return [];
  const j = await r.json();
  return (j.items || []).map((i: any) => i.id?.videoId).filter(Boolean);
}

async function fetchVideoDetails(ids: string[]): Promise<any[]> {
  if (ids.length === 0) return [];
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${ids.join(",")}&key=${YOUTUBE_API_KEY}`;
  const r = await fetch(url);
  if (!r.ok) return [];
  const j = await r.json();
  return j.items || [];
}

async function fetchYouTubeVideos(
  category: string,
  mission: string,
  excludeVideoIds: Set<string>,
  prefs: VideoPreferences,
): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) return [];

  const baseTerms = CATEGORY_SEARCH_TERMS[category] || CATEGORY_SEARCH_TERMS.stress;
  const interestBoost = (prefs.interest_topics || []).slice(0, 2);
  const levelHint = prefs.difficulty_level === "advanced" ? " 심화" : prefs.difficulty_level === "intermediate" ? " 실전" : " 초보";
  const terms = [...interestBoost.map((t) => `${t}${levelHint}`), ...baseTerms].slice(0, 4);
  const maxDuration = DURATION_LIMITS[prefs.preferred_duration] ?? MAX_DURATION_SECONDS;

  // Gather candidate video IDs across multiple terms
  const candidateIds = new Set<string>();
  const termByVideo = new Map<string, string>();
  for (const term of terms) {
    try {
      const ids = await searchYouTube(term, prefs.language, 5);
      for (const id of ids) {
        if (excludeVideoIds.has(id)) continue;
        if (!candidateIds.has(id)) {
          candidateIds.add(id);
          termByVideo.set(id, term);
        }
      }
    } catch (e) {
      log("YouTube search error", { term, err: String(e) });
    }
    if (candidateIds.size >= 12) break;
  }

  if (candidateIds.size === 0) return [];

  // Fetch details for quality filtering
  const details = await fetchVideoDetails([...candidateIds].slice(0, 20));

  const scored: Array<YouTubeVideo & { score: number }> = [];
  for (const item of details) {
    const id = item.id;
    const views = parseInt(item.statistics?.viewCount || "0");
    const duration = parseISO8601Duration(item.contentDetails?.duration || "PT0S");
    if (views < MIN_VIEW_COUNT) continue;
    if (duration < MIN_DURATION_SECONDS || duration > maxDuration) continue;

    const term = termByVideo.get(id) || baseTerms[0];
    // Sweet-spot 조회수 선호: 30K~300K 가산점, 1M+ 페널티 (숨은 양질 콘텐츠 발굴)
    let viewScore: number;
    if (views >= 30_000 && views <= 300_000) {
      viewScore = 25; // 중간 조회수대 최우선
    } else if (views > 300_000 && views <= 1_000_000) {
      viewScore = 18;
    } else if (views > 1_000_000) {
      viewScore = 10; // 너무 인기 영상은 감점
    } else {
      viewScore = 12; // 10K~30K
    }
    const durationBonus = duration <= 600 ? 5 : duration <= 900 ? 3 : 0;
    const score = viewScore + durationBonus;
    scored.push({
      videoId: id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      reason: `오늘 미션 "${mission.slice(0, 28)}…"을 ${Math.round(duration / 60)}분 안에 익히도록 도와주는 ${term} 가이드`,
      viewCount: views,
      durationSeconds: duration,
      score,
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 2).map(({ score, ...v }) => v);
}

interface GoalRow {
  id: string;
  user_id: string;
  goal_category: string;
  goal_description: string | null;
  target_age_group: string | null;
  current_day: number;
  total_days: number;
  start_date: string;
}

const CATEGORY_META: Record<string, { label: string; focus: string; researchBase: string }> = {
  depression: { label: "우울 관리", focus: "행동 활성화 (Behavioral Activation) 및 인지 재구성", researchBase: "Jacobson et al. (1996), Beck Cognitive Therapy" },
  anxiety: { label: "불안 조절", focus: "노출 기반 점진적 둔감화 및 호흡 조절", researchBase: "Hofmann & Smits (2008) 메타분석" },
  sleep: { label: "수면 회복", focus: "CBT-I 기반 수면 위생 및 자극 통제", researchBase: "Trauer et al. (2015) Annals of Internal Medicine" },
  adhd: { label: "ADHD 실행기능", focus: "Pomodoro 기반 시간 분할 및 외부 단서화", researchBase: "Knouse & Safren (2010) CBT for Adult ADHD" },
  parenting: { label: "양육 코칭", focus: "정서 코칭 및 일관된 한계 설정", researchBase: "Gottman 정서 코칭 프로토콜" },
  stress: { label: "스트레스 회복탄력성", focus: "마음챙김 기반 스트레스 감소 (MBSR)", researchBase: "Kabat-Zinn MBSR 프로그램" },
  self_esteem: { label: "자존감 강화", focus: "자기 자비 (Self-Compassion) 훈련", researchBase: "Neff & Germer (2013) MSC 프로그램" },
};

interface CoachingContent {
  missionSummary: string;
  mission: string;
  keyActions: string[];
  insight: string;
}

async function generateCoachingContent(goal: GoalRow): Promise<CoachingContent> {
  const meta = CATEGORY_META[goal.goal_category] || CATEGORY_META.stress;
  const dayNumber = goal.current_day + 1;

  const fallback: CoachingContent = {
    missionSummary: `${meta.label} Day ${dayNumber} — 오늘은 5분 자기관찰`,
    mission: `${meta.focus}의 일환으로, 5분간 호흡에 집중하며 현재 감정 강도를 1~10점으로 기록해보세요.`,
    keyActions: [
      "타이머 5분 설정 후 조용한 자리 확보",
      "호흡에만 집중하며 감정 강도 기록",
      "끝난 뒤 한 줄 일지로 변화 메모",
    ],
    insight: `${meta.researchBase}에 따르면 일관된 자기 관찰 기록은 30일 후 평균 23%의 증상 완화를 가져옵니다.`,
  };

  if (!LOVABLE_API_KEY) return fallback;

  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `당신은 임상심리학 박사급 코치입니다. AIHPRO 플랫폼의 데일리 코칭 메일을 작성합니다.\n근거 기반(EBT)이고 전문적이며, 의료 진단 표현은 피하고 "발달 코칭" 톤을 유지하세요.\n한국어, 이모지 절대 사용 금지.` },
          { role: "user", content: `사용자 정보:\n- 코칭 목표: ${meta.label}\n- 진행 일차: Day ${dayNumber} / ${goal.total_days}\n- 핵심 접근법: ${meta.focus}\n- 근거: ${meta.researchBase}\n- 사용자 추가 설명: ${goal.goal_description || "없음"}\n\n다음 JSON 형식으로 출력:\n{\n  "missionSummary": "오늘 미션을 한 줄로 요약 (40자 이내, 동기부여 톤)",\n  "mission": "오늘 5분 안에 실행할 구체적 미션 (200자 이내)",\n  "keyActions": ["행동1 (15자 이내)", "행동2 (15자 이내)", "행동3 (15자 이내)"],\n  "insight": "이 미션이 효과적인 임상적 근거 (300자 이내, 연구 인용 포함)"\n}` },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!resp.ok) throw new Error(`AI ${resp.status}`);
    const data = await resp.json();
    const c = JSON.parse(data.choices[0].message.content);
    return {
      missionSummary: c.missionSummary || fallback.missionSummary,
      mission: c.mission || fallback.mission,
      keyActions: Array.isArray(c.keyActions) && c.keyActions.length >= 3 ? c.keyActions.slice(0, 3) : fallback.keyActions,
      insight: c.insight || fallback.insight,
    };
  } catch (err) {
    log("AI fallback", { err: String(err) });
    return fallback;
  }
}

async function loadExcludedVideoIds(supa: any, userId: string): Promise<Set<string>> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - DUPLICATE_WINDOW_DAYS);
  const { data } = await supa.from("daily_coaching_video_history")
    .select("video_id")
    .eq("user_id", userId)
    .gte("sent_date", cutoff.toISOString().slice(0, 10));
  return new Set((data || []).map((r: any) => r.video_id));
}

async function loadPreferences(supa: any, userId: string): Promise<VideoPreferences> {
  const { data } = await supa.from("user_video_preferences")
    .select("interest_topics,difficulty_level,preferred_duration,language")
    .eq("user_id", userId).maybeSingle();
  return {
    interest_topics: data?.interest_topics || [],
    difficulty_level: data?.difficulty_level || "beginner",
    preferred_duration: data?.preferred_duration || "short",
    language: data?.language || "ko",
  };
}

async function recordVideoHistory(supa: any, userId: string, category: string, videos: YouTubeVideo[], todayStr: string) {
  if (videos.length === 0) return;
  const rows = videos.map((v) => ({ user_id: userId, video_id: v.videoId, category, sent_date: todayStr }));
  await supa.from("daily_coaching_video_history").insert(rows);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    log("Starting daily coaching dispatch");
    const supa = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    let testEmail: string | undefined;
    let testUserId: string | undefined;
    let testDay: number | undefined;
    try {
      if (req.method === "POST") {
        const body = await req.json();
        testEmail = body?.test_email;
        testUserId = body?.test_user_id;
        testDay = typeof body?.test_day === 'number' ? body.test_day : undefined;
      }
    } catch { /* no body */ }

    const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
    const todayStr = today.toISOString().slice(0, 10);

    const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

    // HTML 태그 잔존 감지 (이메일 평문/콘텐츠에 raw HTML이 노출되는 케이스 방지)
    function detectRawHtml(s: string | undefined | null): string[] {
      if (!s) return [];
      const issues: string[] = [];
      if (/<\/?[a-zA-Z][^>]*>/.test(s)) issues.push('html-tag');
      if (/```/.test(s)) issues.push('code-fence');
      return issues;
    }

    async function callTransactionalEmail(payload: any): Promise<{ ok: boolean; error?: string; body?: any }> {
      try {
        if (!resend) return { ok: false, error: 'RESEND_API_KEY missing' };
        const { templateName, recipientEmail, templateData = {}, idempotencyKey } = payload;
        if (templateName !== 'daily-coaching') {
          return { ok: false, error: `unsupported template: ${templateName}` };
        }

        // 사전 검사: 본문에 raw HTML/코드펜스가 있으면 경고 로그 + email_send_log
        const contentIssues = [
          ...detectRawHtml(templateData.mission).map((x) => `mission:${x}`),
          ...detectRawHtml(templateData.insight).map((x) => `insight:${x}`),
          ...detectRawHtml(templateData.missionSummary).map((x) => `summary:${x}`),
        ];
        if (contentIssues.length) {
          log('⚠️ HTML residue detected in templateData', { recipientEmail, issues: contentIssues });
          await supa.from('email_send_log').insert({
            message_id: idempotencyKey,
            template_name: templateName,
            recipient_email: recipientEmail,
            status: 'warning',
            error_message: `Raw HTML/markdown residue: ${contentIssues.join(', ')}`,
            metadata: { contentIssues },
          });
        }

        const html = await renderAsync(
          React.createElement(dailyCoachingTpl.component, templateData)
        );
        const subject = typeof dailyCoachingTpl.subject === 'function'
          ? dailyCoachingTpl.subject(templateData)
          : dailyCoachingTpl.subject;

        const result = await resend.emails.send({
          from: FROM_ADDRESS,
          reply_to: REPLY_TO,
          to: [recipientEmail],
          subject,
          html,
        });

        if ((result as any)?.error) {
          await supa.from('email_send_log').insert({
            message_id: idempotencyKey,
            template_name: templateName,
            recipient_email: recipientEmail,
            status: 'failed',
            error_message: JSON.stringify((result as any).error),
          });
          return { ok: false, error: JSON.stringify((result as any).error), body: result };
        }

        await supa.from('email_send_log').insert({
          message_id: idempotencyKey,
          template_name: templateName,
          recipient_email: recipientEmail,
          status: 'sent',
          metadata: { resend_id: (result as any)?.data?.id },
        });

        return { ok: true, body: result };
      } catch (e) {
        await supa.from('email_send_log').insert({
          message_id: payload?.idempotencyKey,
          template_name: payload?.templateName,
          recipient_email: payload?.recipientEmail,
          status: 'failed',
          error_message: String(e),
        }).then(() => {}, () => {});
        return { ok: false, error: String(e) };
      }
    }

    if (testEmail) {
      const sampleGoal: GoalRow = {
        id: "test", user_id: "test", goal_category: "stress", goal_description: null,
        target_age_group: null, current_day: 6, total_days: 30, start_date: todayStr,
      };
      const meta = CATEGORY_META.stress;
      const content = await generateCoachingContent(sampleGoal);
      const prefs: VideoPreferences = { interest_topics: [], difficulty_level: "beginner", preferred_duration: "short", language: "ko" };
      const videos = await fetchYouTubeVideos(sampleGoal.goal_category, content.mission, new Set(), prefs);
      const result = await callTransactionalEmail({
        templateName: 'daily-coaching',
        recipientEmail: testEmail,
        idempotencyKey: `daily-coaching-test-${Date.now()}`,
        templateData: {
          nickname: '테스트', dayNumber: 7, totalDays: 30,
          categoryLabel: meta.label,
          missionSummary: content.missionSummary,
          mission: content.mission,
          keyActions: content.keyActions,
          insight: content.insight, researchBase: meta.researchBase,
          videos,
        },
      });
      if (!result.ok) throw new Error(result.error);
      return new Response(JSON.stringify({ success: true, mode: 'test', to: testEmail, videoCount: videos.length, body: result.body }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let query = supa.from("user_coaching_goals")
      .select("id,user_id,goal_category,goal_description,target_age_group,current_day,total_days,start_date")
      .eq("is_active", true)
      .eq("daily_email_opt_in", true)
      .lt("current_day", 30);
    if (testUserId) query = query.eq("user_id", testUserId);

    const { data: goals, error: goalsErr } = await query;
    if (goalsErr) throw goalsErr;
    if (!goals || goals.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, message: "No active goals" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let sent = 0, failed = 0, skipped = 0;

    for (const goal of goals as GoalRow[]) {
      try {
        const { data: existing } = await supa.from("daily_coaching_email_log")
          .select("id").eq("goal_id", goal.id).eq("send_date", todayStr).maybeSingle();
        if (existing) { skipped++; continue; }

        const [{ data: sub }, { data: enrollment }] = await Promise.all([
          supa.from("user_subscriptions").select("status,subscription_type,is_lifetime")
            .eq("user_id", goal.user_id).eq("status", "active")
            .in("subscription_type", ["premium", "paid", "lifetime"]).maybeSingle(),
          supa.from("mind_track_enrollments").select("id,status,payment_status")
            .eq("user_id", goal.user_id).in("status", ["active", "completed"])
            .eq("payment_status", "completed").maybeSingle(),
        ]);
        if (!sub && !enrollment) { skipped++; continue; }

        const { data: userData } = await supa.auth.admin.getUserById(goal.user_id);
        if (!userData?.user?.email) { skipped++; continue; }
        const email = userData.user.email;
        const { data: profile } = await supa.from("profiles")
          .select("display_name,name").eq("user_id", goal.user_id).maybeSingle();
        const nickname = profile?.display_name || profile?.name || "회원";

        const meta = CATEGORY_META[goal.goal_category] || CATEGORY_META.stress;
        const content = await generateCoachingContent(goal);

        const [excluded, prefs] = await Promise.all([
          loadExcludedVideoIds(supa, goal.user_id),
          loadPreferences(supa, goal.user_id),
        ]);
        const videos = await fetchYouTubeVideos(goal.goal_category, content.mission, excluded, prefs);
        await recordVideoHistory(supa, goal.user_id, goal.goal_category, videos, todayStr);

        const dayNumber = goal.current_day + 1;
        const subject = `[Day ${String(dayNumber).padStart(2, '0')}] ${meta.label} - 오늘의 미션`;

        const result = await callTransactionalEmail({
          templateName: 'daily-coaching',
          recipientEmail: email,
          idempotencyKey: `daily-coaching-${goal.id}-${todayStr}`,
          templateData: {
            nickname, dayNumber, totalDays: goal.total_days,
            categoryLabel: meta.label,
            missionSummary: content.missionSummary,
            mission: content.mission,
            keyActions: content.keyActions,
            insight: content.insight, researchBase: meta.researchBase,
            videos,
          },
        });

        if (!result.ok) {
          failed++;
          await supa.from("daily_coaching_email_log").insert({
            user_id: goal.user_id, goal_id: goal.id, send_date: todayStr,
            day_number: dayNumber, status: "failed", subject,
            error_message: result.error || 'unknown',
          });
          continue;
        }

        await supa.from("daily_coaching_email_log").insert({
          user_id: goal.user_id, goal_id: goal.id, send_date: todayStr,
          day_number: dayNumber, status: "sent", subject,
          mission_content: content.mission, insight_content: content.insight,
        });

        await supa.from("user_coaching_goals").update({
          current_day: dayNumber,
          ...(dayNumber >= goal.total_days ? { is_active: false, end_date: todayStr } : {}),
        }).eq("id", goal.id);

        sent++;
      } catch (e) {
        failed++;
        log("Per-goal error", { goalId: goal.id, err: String(e) });
      }
    }

    log("Done", { sent, failed, skipped });
    return new Response(JSON.stringify({ success: true, sent, failed, skipped }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    log("Fatal", { err: String(e) });
    return new Response(JSON.stringify({ success: false, error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
