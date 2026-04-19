// Initialize 30-day Mind Track: takes baseline assessment + generates AI workbook + first week missions
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BaselineInput {
  enrollmentId: string;
  mode: "quick" | "precise";
  goalFocus: string;
  // 3 core scores 0-100
  stressScore: number;
  energyScore: number;
  clarityScore: number;
  primaryConcern?: string;
  rawResponses?: Record<string, unknown>;
}

const goalLabels: Record<string, string> = {
  stress: "스트레스 회복",
  anxiety: "불안 다스리기",
  sleep: "수면의 질 회복",
  selfworth: "자존감 단단히",
  relationship: "관계 스트레스",
  parenting: "육아 번아웃 회복",
  child_development: "아이 발달 코칭",
  family_communication: "아이와의 소통",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const input = await req.json() as BaselineInput;

    // 1. Save baseline assessment (3 data points)
    const { data: baseline, error: baselineErr } = await supabase
      .from("mind_track_baseline_assessments")
      .insert({
        user_id: user.id,
        enrollment_id: input.enrollmentId,
        assessment_mode: input.mode,
        measurement_point: "baseline",
        stress_score: input.stressScore,
        energy_score: input.energyScore,
        clarity_score: input.clarityScore,
        primary_concern: input.primaryConcern,
        raw_responses: input.rawResponses ?? {},
      })
      .select()
      .single();
    if (baselineErr) throw baselineErr;

    // 2. Generate AI workbook + week 1 missions
    const goalLabel = goalLabels[input.goalFocus] ?? input.goalFocus;
    const systemPrompt = `당신은 따뜻한 코칭 가이드입니다. 사용자의 30일 마음 변화 트랙 초기 워크북과 1주차 미션 7개를 작성하세요.

[엄격한 규칙]
- '진단', '치료', '환자', '증상' 같은 의료 용어 금지
- 'Noom', 'Calm', 'Wysa', 'CBT', 'RCI' 등 외부 브랜드/학계 약어 금지
- 따뜻하고 일상적인 한국어 사용
- 미션은 5분 이내 실천 가능한 구체적 행동
- 모든 응답은 반드시 JSON 형식

[출력 JSON 스키마]
{
  "workbook": {
    "initialSummary": "현재 마음 상태에 대한 따뜻한 2-3문장 요약",
    "rootCauses": ["원인1", "원인2", "원인3"],
    "strengthAreas": ["강점1", "강점2"],
    "challengeTheme": "30일 챌린지 한 줄 슬로건",
    "weeklyThemes": [
      {"week": 1, "theme": "...", "focus": "..."},
      {"week": 2, "theme": "...", "focus": "..."},
      {"week": 3, "theme": "...", "focus": "..."},
      {"week": 4, "theme": "...", "focus": "..."},
      {"week": 5, "theme": "...", "focus": "마무리/축하"}
    ],
    "expectedOutcomes": ["기대 효과1", "기대 효과2", "기대 효과3"]
  },
  "week1Missions": [
    {"day": 1, "title": "...", "description": "...", "type": "reflection|action|breathing|journaling|connection", "minutes": 5},
    {"day": 2, ...}, ... {"day": 7, ...}
  ]
}`;

    const userPrompt = `[목표] ${goalLabel}
[고민] ${input.primaryConcern ?? "없음"}
[초기 점수] 스트레스 ${input.stressScore}/100, 에너지 ${input.energyScore}/100, 명료성 ${input.clarityScore}/100

위 정보를 바탕으로 워크북과 1주차 미션 7개를 JSON으로만 출력하세요.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      throw new Error(`AI generation failed: ${errText}`);
    }

    const aiData = await aiRes.json();
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) throw new Error("AI returned empty content");
    const parsed = JSON.parse(content);
    const wb = parsed.workbook;
    const missions = parsed.week1Missions ?? [];

    // 3. Save workbook
    const { data: workbook, error: wbErr } = await supabase
      .from("mind_track_workbooks")
      .insert({
        user_id: user.id,
        enrollment_id: input.enrollmentId,
        initial_summary: wb.initialSummary,
        root_causes: wb.rootCauses,
        strength_areas: wb.strengthAreas,
        challenge_theme: wb.challengeTheme,
        weekly_themes: wb.weeklyThemes,
        expected_outcomes: wb.expectedOutcomes,
      })
      .select()
      .single();
    if (wbErr) throw wbErr;

    // 4. Save week 1 missions
    if (missions.length > 0) {
      const missionRows = missions.map((m: any) => ({
        user_id: user.id,
        enrollment_id: input.enrollmentId,
        workbook_id: workbook.id,
        day_number: m.day,
        week_number: 1,
        mission_title: m.title,
        mission_description: m.description,
        mission_type: m.type,
        estimated_minutes: m.minutes ?? 5,
      }));
      const { error: mErr } = await supabase
        .from("mind_track_daily_missions")
        .insert(missionRows);
      if (mErr) throw mErr;
    }

    // 5. Activate enrollment
    await supabase
      .from("mind_track_enrollments")
      .update({
        payment_status: "completed",
        status: "active",
        started_at: new Date().toISOString(),
        current_day: 1,
      })
      .eq("id", input.enrollmentId)
      .eq("user_id", user.id);

    return new Response(
      JSON.stringify({ success: true, workbookId: workbook.id, baselineId: baseline.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("mind-track-init error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
