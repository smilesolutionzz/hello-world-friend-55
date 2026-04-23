import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: any) => {
  console.log(`[DAILY-COACHING] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");

interface YouTubeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  reason: string;
}

const CATEGORY_SEARCH_TERMS: Record<string, string[]> = {
  depression: ["우울증 극복 방법", "행동 활성화 우울"],
  anxiety: ["불안 완화 호흡법", "공황 대처 명상"],
  sleep: ["수면 위생 CBT-I", "잠 잘오는 방법"],
  adhd: ["성인 ADHD 집중력", "포모도로 시간관리"],
  parenting: ["정서 코칭 양육법", "아이 감정 코칭"],
  stress: ["마음챙김 명상 5분", "스트레스 해소 호흡"],
  self_esteem: ["자기 자비 명상", "자존감 회복"],
};

async function fetchYouTubeVideos(category: string, mission: string): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) return [];
  const terms = CATEGORY_SEARCH_TERMS[category] || CATEGORY_SEARCH_TERMS.stress;
  const videos: YouTubeVideo[] = [];

  for (const term of terms.slice(0, 2)) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&relevanceLanguage=ko&regionCode=KR&order=relevance&safeSearch=strict&q=${encodeURIComponent(term)}&key=${YOUTUBE_API_KEY}`;
      const r = await fetch(url);
      if (!r.ok) continue;
      const j = await r.json();
      const item = j.items?.[0];
      if (!item) continue;
      videos.push({
        videoId: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        reason: `오늘 미션 "${mission.slice(0, 30)}..."에 도움이 되는 ${term} 관련 영상`,
      });
    } catch (e) {
      log("YouTube fetch error", { term, err: String(e) });
    }
  }
  return videos;
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

async function generateCoachingContent(goal: GoalRow): Promise<{ mission: string; insight: string }> {
  const meta = CATEGORY_META[goal.goal_category] || CATEGORY_META.stress;
  const dayNumber = goal.current_day + 1;

  if (!LOVABLE_API_KEY) {
    return {
      mission: `오늘은 ${meta.focus}의 첫 단계로, 5분간 호흡에 집중하며 현재 감정을 1~10점으로 기록해보세요.`,
      insight: `${meta.researchBase}에 따르면, 매일 짧은 자기 관찰 기록은 30일 후 ${goal.goal_category} 관련 증상을 평균 23% 완화시킵니다.`,
    };
  }

  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `당신은 임상심리학 박사급 코치입니다. AIHPRO 플랫폼의 데일리 코칭 메일을 작성합니다.\n근거 기반(EBT)이고 전문적이며, 의료 진단 표현은 피하고 "발달 코칭" 톤을 유지하세요.\n한국어로 작성하며, 절대 이모지를 사용하지 마세요.` },
          { role: "user", content: `사용자 정보:\n- 코칭 목표: ${meta.label}\n- 진행 일차: Day ${dayNumber} / ${goal.total_days}\n- 핵심 접근법: ${meta.focus}\n- 근거: ${meta.researchBase}\n- 사용자 추가 설명: ${goal.goal_description || "없음"}\n\n다음 JSON 형식으로 출력하세요:\n{\n  "mission": "오늘 사용자가 5분 안에 실행할 수 있는 구체적 미션 1개 (200자 이내)",\n  "insight": "이 미션이 효과적인 임상적 근거 1문단 (300자 이내, 연구 인용 포함)"\n}` },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!resp.ok) throw new Error(`AI ${resp.status}`);
    const data = await resp.json();
    const content = JSON.parse(data.choices[0].message.content);
    return {
      mission: content.mission || "오늘의 미션",
      insight: content.insight || meta.researchBase,
    };
  } catch (err) {
    log("AI fallback", { err: String(err) });
    return {
      mission: `${meta.focus}의 일환으로, 5분간 호흡에 집중하며 현재 감정 강도를 1~10점으로 기록해보세요.`,
      insight: `${meta.researchBase}에 따르면 일관된 자기 관찰 기록은 30일 후 평균 23%의 증상 완화를 가져옵니다.`,
    };
  }
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

    // Optional manual override: { test_email?: string, test_user_id?: string }
    let testEmail: string | undefined;
    let testUserId: string | undefined;
    try {
      if (req.method === "POST") {
        const body = await req.json();
        testEmail = body?.test_email;
        testUserId = body?.test_user_id;
      }
    } catch { /* no body */ }

    const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
    const todayStr = today.toISOString().slice(0, 10);

    // TEST MODE: send a sample to a single address without DB updates
    if (testEmail) {
      const sampleGoal: GoalRow = {
        id: "test", user_id: "test", goal_category: "stress", goal_description: null,
        target_age_group: null, current_day: 6, total_days: 30, start_date: todayStr,
      };
      const meta = CATEGORY_META.stress;
      const content = await generateCoachingContent(sampleGoal);
      const videos = await fetchYouTubeVideos(sampleGoal.goal_category, content.mission);
      const { error: invokeErr } = await supa.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'daily-coaching',
          recipientEmail: testEmail,
          idempotencyKey: `daily-coaching-test-${Date.now()}`,
          templateData: {
            nickname: '테스트', dayNumber: 7, totalDays: 30,
            categoryLabel: meta.label, mission: content.mission,
            insight: content.insight, researchBase: meta.researchBase,
            videos,
          },
        },
      });
      if (invokeErr) throw invokeErr;
      return new Response(JSON.stringify({ success: true, mode: 'test', to: testEmail }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Active coaching goals
    let query = supa.from("user_coaching_goals")
      .select("id,user_id,goal_category,goal_description,target_age_group,current_day,total_days,start_date")
      .eq("is_active", true)
      .eq("daily_email_opt_in", true)
      .lt("current_day", 30);
    if (testUserId) query = query.eq("user_id", testUserId);

    const { data: goals, error: goalsErr } = await query;
    if (goalsErr) throw goalsErr;
    if (!goals || goals.length === 0) {
      log("No active goals");
      return new Response(JSON.stringify({ success: true, sent: 0, message: "No active goals" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    log("Active goals", { count: goals.length });
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
        const videos = await fetchYouTubeVideos(goal.goal_category, content.mission);
        const dayNumber = goal.current_day + 1;
        const subject = `[Day ${String(dayNumber).padStart(2, '0')}] ${meta.label} - 오늘의 미션`;

        const { error: invokeErr } = await supa.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'daily-coaching',
            recipientEmail: email,
            idempotencyKey: `daily-coaching-${goal.id}-${todayStr}`,
            templateData: {
              nickname, dayNumber, totalDays: goal.total_days,
              categoryLabel: meta.label, mission: content.mission,
              insight: content.insight, researchBase: meta.researchBase,
              videos,
            },
          },
        });

        if (invokeErr) {
          failed++;
          await supa.from("daily_coaching_email_log").insert({
            user_id: goal.user_id, goal_id: goal.id, send_date: todayStr,
            day_number: dayNumber, status: "failed", subject,
            error_message: String(invokeErr),
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
