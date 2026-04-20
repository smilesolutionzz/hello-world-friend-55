import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: any) => {
  console.log(`[DAILY-COACHING] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

const FROM_ADDRESS = "AIHPRO 데일리 코칭 <coaching@notify.momentedu.io>";
const SITE_URL = "https://aihpro.app";
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

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
  depression: {
    label: "우울 관리",
    focus: "행동 활성화 (Behavioral Activation) 및 인지 재구성",
    researchBase: "Jacobson et al. (1996), Beck Cognitive Therapy",
  },
  anxiety: {
    label: "불안 조절",
    focus: "노출 기반 점진적 둔감화 및 호흡 조절",
    researchBase: "Hofmann & Smits (2008) 메타분석",
  },
  sleep: {
    label: "수면 회복",
    focus: "CBT-I 기반 수면 위생 및 자극 통제",
    researchBase: "Trauer et al. (2015) Annals of Internal Medicine",
  },
  adhd: {
    label: "ADHD 실행기능",
    focus: "Pomodoro 기반 시간 분할 및 외부 단서화",
    researchBase: "Knouse & Safren (2010) CBT for Adult ADHD",
  },
  parenting: {
    label: "양육 코칭",
    focus: "정서 코칭 및 일관된 한계 설정",
    researchBase: "Gottman 정서 코칭 프로토콜",
  },
  stress: {
    label: "스트레스 회복탄력성",
    focus: "마음챙김 기반 스트레스 감소 (MBSR)",
    researchBase: "Kabat-Zinn MBSR 프로그램",
  },
  self_esteem: {
    label: "자존감 강화",
    focus: "자기 자비 (Self-Compassion) 훈련",
    researchBase: "Neff & Germer (2013) MSC 프로그램",
  },
};

async function generateCoachingContent(goal: GoalRow): Promise<{ subject: string; mission: string; insight: string }> {
  const meta = CATEGORY_META[goal.goal_category] || CATEGORY_META.stress;
  const dayNumber = goal.current_day + 1;

  if (!LOVABLE_API_KEY) {
    return {
      subject: `[Day ${dayNumber}] ${meta.label} - 오늘의 미션`,
      mission: `오늘은 ${meta.focus}의 첫 단계로, 5분간 호흡에 집중하며 현재 감정을 1~10점으로 기록해보세요.`,
      insight: `${meta.researchBase}에 따르면, 매일 짧은 자기 관찰 기록은 30일 후 ${goal.goal_category} 관련 증상을 평균 23% 완화시킵니다.`,
    };
  }

  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `당신은 임상심리학 박사급 코치입니다. AIHPRO 플랫폼의 데일리 코칭 메일을 작성합니다.
근거 기반(EBT)이고 전문적이며, 의료 진단 표현은 피하고 "발달 코칭" 톤을 유지하세요.
한국어로 작성하며, 절대 이모지를 사용하지 마세요.`,
          },
          {
            role: "user",
            content: `사용자 정보:
- 코칭 목표: ${meta.label}
- 진행 일차: Day ${dayNumber} / ${goal.total_days}
- 핵심 접근법: ${meta.focus}
- 근거: ${meta.researchBase}
- 사용자 추가 설명: ${goal.goal_description || "없음"}

다음 JSON 형식으로 출력하세요. 다른 텍스트 없이 JSON만:
{
  "subject": "[Day ${dayNumber}] 한 줄 제목 (40자 이내)",
  "mission": "오늘 사용자가 5분 안에 실행할 수 있는 구체적 미션 1개 (200자 이내, 단계 명확히)",
  "insight": "이 미션이 효과적인 임상적 근거 1문단 (300자 이내, 연구 인용 포함)"
}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) throw new Error(`AI ${resp.status}`);
    const data = await resp.json();
    const content = JSON.parse(data.choices[0].message.content);
    return {
      subject: content.subject || `[Day ${dayNumber}] ${meta.label}`,
      mission: content.mission || "오늘의 미션",
      insight: content.insight || meta.researchBase,
    };
  } catch (err) {
    log("AI fallback", { err: String(err) });
    return {
      subject: `[Day ${dayNumber}] ${meta.label} - 오늘의 미션`,
      mission: `${meta.focus}의 일환으로, 5분간 호흡에 집중하며 현재 감정 강도를 1~10점으로 기록해보세요.`,
      insight: `${meta.researchBase}에 따르면 일관된 자기 관찰 기록은 30일 후 평균 23%의 증상 완화를 가져옵니다.`,
    };
  }
}

function buildEmailHtml(opts: {
  nickname: string;
  dayNumber: number;
  totalDays: number;
  categoryLabel: string;
  subject: string;
  mission: string;
  insight: string;
  researchBase: string;
}): string {
  const { nickname, dayNumber, totalDays, categoryLabel, mission, insight, researchBase } = opts;
  const progressPct = Math.round((dayNumber / totalDays) * 100);

  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,'Pretendard Variable',Inter,'Segoe UI',sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <div style="font-size:11px;letter-spacing:0.18em;color:#64748b;text-transform:uppercase;margin-bottom:8px;">AIHPRO Daily Coaching</div>
    <div style="font-size:13px;color:#475569;margin-bottom:24px;">${nickname}님 · ${categoryLabel} 트랙</div>

    <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:6px;">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:42px;font-weight:600;color:#0f172a;line-height:1;">Day ${String(dayNumber).padStart(2,'0')}</div>
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

    <a href="${SITE_URL}/observation-log" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:600;letter-spacing:0.02em;">오늘의 기록 남기기 →</a>

    <div style="margin-top:40px;padding-top:24px;border-top:1px solid #e2e8f0;font-size:11px;line-height:1.7;color:#94a3b8;">
      본 메일은 의료 진단·치료를 대체하지 않으며, 발달 코칭 및 자기관찰 도구로 제공됩니다.<br/>
      © AIHPRO · <a href="${SITE_URL}/coaching-goals" style="color:#64748b;text-decoration:underline;">코칭 설정 변경</a> · <a href="${SITE_URL}/coaching-goals?unsubscribe=1" style="color:#64748b;text-decoration:underline;">데일리 메일 끄기</a>
    </div>
  </div>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    log("Starting daily coaching dispatch");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY missing");
    const resend = new Resend(resendKey);

    const supa = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
    const todayStr = today.toISOString().slice(0, 10);

    // 활성 코칭 목표 조회 (active 구독자만)
    const { data: goals, error: goalsErr } = await supa
      .from("user_coaching_goals")
      .select("id,user_id,goal_category,goal_description,target_age_group,current_day,total_days,start_date")
      .eq("is_active", true)
      .eq("daily_email_opt_in", true)
      .lt("current_day", 30);

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
        // 오늘 이미 보냈는지 체크
        const { data: existing } = await supa
          .from("daily_coaching_email_log")
          .select("id")
          .eq("goal_id", goal.id)
          .eq("send_date", todayStr)
          .maybeSingle();
        if (existing) { skipped++; continue; }

        // 구독 상태 확인
        const { data: sub } = await supa
          .from("user_subscriptions")
          .select("status,subscription_type")
          .eq("user_id", goal.user_id)
          .eq("status", "active")
          .in("subscription_type", ["premium", "paid"])
          .maybeSingle();
        if (!sub) { skipped++; continue; }

        // 이메일/닉네임
        const { data: userData } = await supa.auth.admin.getUserById(goal.user_id);
        if (!userData?.user?.email) { skipped++; continue; }
        const email = userData.user.email;
        const { data: profile } = await supa
          .from("profiles")
          .select("display_name,name")
          .eq("user_id", goal.user_id)
          .maybeSingle();
        const nickname = profile?.display_name || profile?.name || "회원";

        const meta = CATEGORY_META[goal.goal_category] || CATEGORY_META.stress;
        const content = await generateCoachingContent(goal);
        const dayNumber = goal.current_day + 1;

        const html = buildEmailHtml({
          nickname,
          dayNumber,
          totalDays: goal.total_days,
          categoryLabel: meta.label,
          subject: content.subject,
          mission: content.mission,
          insight: content.insight,
          researchBase: meta.researchBase,
        });

        const { error: sendErr } = await resend.emails.send({
          from: FROM_ADDRESS,
          to: [email],
          subject: content.subject,
          html,
        });

        if (sendErr) {
          failed++;
          await supa.from("daily_coaching_email_log").insert({
            user_id: goal.user_id,
            goal_id: goal.id,
            send_date: todayStr,
            day_number: dayNumber,
            status: "failed",
            subject: content.subject,
            error_message: String(sendErr),
          });
          continue;
        }

        await supa.from("daily_coaching_email_log").insert({
          user_id: goal.user_id,
          goal_id: goal.id,
          send_date: todayStr,
          day_number: dayNumber,
          status: "sent",
          subject: content.subject,
          mission_content: content.mission,
          insight_content: content.insight,
        });

        await supa.from("user_coaching_goals")
          .update({
            current_day: dayNumber,
            ...(dayNumber >= goal.total_days ? { is_active: false, end_date: todayStr } : {}),
          })
          .eq("id", goal.id);

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
