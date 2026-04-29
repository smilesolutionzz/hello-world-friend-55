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
    const systemPrompt = `당신은 깊이 있는 코칭 가이드입니다. 사용자의 30일 마음 변화 트랙 초기 워크북과 1주차 미션 7개를 "추상적 위로"가 아닌 "구체적·단계적·측정가능한 실천"으로 설계하세요.

[엄격한 규칙]
- '진단', '치료', '환자', '증상' 같은 의료 용어 금지
- 'Noom', 'Calm', 'Wysa', 'CBT', 'RCI', 'MBTI' 등 외부 브랜드/학계 약어 금지
- 따뜻하지만 명료한 한국어. "~해보세요" 남발 금지, 구체 명사·동사 사용
- 모든 응답은 반드시 JSON 형식

[미션 품질 기준 — 매우 중요]
1) title: 8~16자, 동사로 시작하는 구체 행동 (X "내 마음 살펴보기" → O "퇴근길 3가지 감정 메모하기")
2) description: 2~3문장. 언제/어디서/얼마나/무엇을 명확히. 추상어("마음", "여유")만 쓰지 말고 상황·도구·트리거 명시
3) why_it_matters: 1문장. 이 미션이 사용자의 목표/고민과 어떻게 연결되는지
4) action_steps: 3~5개의 순서 있는 짧은 행동 단계 (각 6~20자, 체크리스트로 동작)
5) success_criteria: 1문장. "오늘 이 미션을 완료했다"고 말할 수 있는 객관적 기준 (예: "걱정 3개를 종이에 적었다")
6) deeper_prompts: 2~3개의 깊이 있는 자기성찰 질문 (체크인 시 영상/행동 후 작성용)
7) difficulty: easy(5분 이내) / medium(5~10분) / deep(10~15분, 주 1~2회만)

[출력 JSON 스키마]
{
  "workbook": {
    "initialSummary": "현재 마음 상태에 대한 따뜻하지만 구체적인 2-3문장 요약",
    "rootCauses": ["구체적 원인1", "구체적 원인2", "구체적 원인3"],
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
    {
      "day": 1,
      "title": "...",
      "description": "...",
      "type": "reflection|action|breathing|journaling|connection",
      "minutes": 7,
      "difficulty": "easy|medium|deep",
      "why_it_matters": "...",
      "action_steps": ["1단계", "2단계", "3단계"],
      "success_criteria": "...",
      "deeper_prompts": ["질문1", "질문2"]
    }
    // day 2~7 동일 스키마
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
