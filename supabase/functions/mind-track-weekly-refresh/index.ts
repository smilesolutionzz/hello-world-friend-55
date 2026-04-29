// Generate next week's missions based on user's check-in data
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { enrollmentId, weekNumber } = await req.json();
    if (!enrollmentId || !weekNumber || weekNumber < 2 || weekNumber > 5) {
      throw new Error("Invalid weekNumber (must be 2-5)");
    }

    // Load workbook + recent check-ins
    const [{ data: workbook }, { data: checkins }, { data: enrollment }] = await Promise.all([
      supabase.from("mind_track_workbooks").select("*").eq("enrollment_id", enrollmentId).maybeSingle(),
      supabase.from("mind_track_checkins").select("*").eq("enrollment_id", enrollmentId).order("day_number", { ascending: true }),
      supabase.from("mind_track_enrollments").select("goal_focus").eq("id", enrollmentId).maybeSingle(),
    ]);

    if (!workbook) throw new Error("Workbook not found");

    // Already generated?
    const startDay = (weekNumber - 1) * 7 + 1;
    const endDay = Math.min(weekNumber * 7, 30);
    const { count: existing } = await supabase
      .from("mind_track_daily_missions")
      .select("*", { count: "exact", head: true })
      .eq("enrollment_id", enrollmentId)
      .gte("day_number", startDay)
      .lte("day_number", endDay);
    if ((existing ?? 0) > 0) {
      return new Response(JSON.stringify({ success: true, alreadyGenerated: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const recentNotes = (checkins ?? [])
      .slice(-7)
      .map((c) => `Day ${c.day_number}: 완료=${c.completed} 기분=${c.mood_score} 에너지=${c.energy_score} 명료성=${c.clarity_score} ${c.reflection_note ? `메모: ${c.reflection_note}` : ""}`)
      .join("\n");

    const weekTheme = (workbook.weekly_themes as any[])?.find((w) => w.week === weekNumber);
    const dayCount = endDay - startDay + 1;

    const systemPrompt = `당신은 깊이 있는 코칭 가이드입니다. 사용자의 지난 주 체크인 데이터를 보고 ${weekNumber}주차 일일 미션 ${dayCount}개를 "구체적·단계적·측정가능한" 형태로 생성하세요.

[규칙]
- 의료 용어/외부 브랜드 약어(MBTI/CBT/Calm/Wysa/Noom 등) 금지
- 추상적 위로 금지. 언제·어디서·무엇을·얼마나가 명확해야 함
- 지난주 잘한 영역은 한 단계 확장, 어려워한 영역은 더 작게 분해
- 매 미션은 다음 필드 모두 채울 것: title(8~16자 동사형), description(2~3문장 구체), why_it_matters(1문장), action_steps(3~5개 짧은 단계), success_criteria(객관적 완료 기준 1문장), deeper_prompts(2~3개 자기성찰 질문), difficulty(easy/medium/deep)
- JSON만 출력

[출력]
{"missions":[{"day":${startDay},"title":"...","description":"...","type":"reflection|action|breathing|journaling|connection","minutes":7,"difficulty":"medium","why_it_matters":"...","action_steps":["...","...","..."],"success_criteria":"...","deeper_prompts":["...","..."]}, ...]}`;

    const userPrompt = `[챌린지 슬로건] ${workbook.challenge_theme}
[이번 주차 테마] ${weekTheme?.theme ?? ""} - ${weekTheme?.focus ?? ""}
[지난 체크인 7일치]
${recentNotes || "아직 데이터 없음"}

day ${startDay}부터 ${endDay}까지 ${dayCount}개 미션을 JSON으로만 출력하세요.`;

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

    if (!aiRes.ok) throw new Error(`AI failed: ${await aiRes.text()}`);
    const parsed = JSON.parse((await aiRes.json()).choices[0].message.content);
    const missions = parsed.missions ?? [];

    // Helper: fetch up to 3 YouTube candidates for a query (Korean, KR region).
    // Falls back to empty list if YOUTUBE_API_KEY is missing or the request fails.
    const ytKey = Deno.env.get("YOUTUBE_API_KEY");
    async function fetchCandidates(q: string): Promise<Array<{ video_id: string; title: string; thumbnail: string }>> {
      if (!ytKey || !q) return [];
      try {
        const url =
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=3` +
          `&relevanceLanguage=ko&regionCode=KR&safeSearch=strict&q=${encodeURIComponent(q)}&key=${ytKey}`;
        const r = await fetch(url);
        if (!r.ok) return [];
        const j = await r.json();
        return (j.items ?? [])
          .filter((it: any) => it?.id?.videoId)
          .map((it: any) => ({
            video_id: it.id.videoId,
            title: it.snippet?.title ?? "",
            thumbnail: it.snippet?.thumbnails?.medium?.url ?? it.snippet?.thumbnails?.default?.url ?? "",
          }));
      } catch (e) {
        console.error("YT candidates fetch failed:", e);
        return [];
      }
    }

    if (missions.length > 0) {
      // Day별 YouTube 검색 키워드 (1~30)
      const DAY_YT: Record<number, string> = {
        1:'마음챙김 시작 5분',2:'3분 마음챙김 호흡',3:'감정 알아차림 명상',4:'몸의 긴장 풀기 스트레칭',5:'5분 작은 습관',
        6:'에너지 도둑 멈추기',7:'한 주 회고 명상',8:'아침 마음챙김 루틴',9:'부정적 생각 끊기',10:'에너지 회복 낮잠',
        11:'관계 패턴 알아차림',12:'4-7-8 호흡법',13:'저널링 글쓰기 5분',14:'2주 셀프 코칭',15:'중간 점검 자기 동기',
        16:'회피 극복 작은 시작',17:'도움 요청 의사소통',18:'강한 감정 다루기',19:'자기 자비 명상',20:'환경 정리 미니멀',
        21:'3주 마음 변화 회고',22:'내면 탐색 자기이해',23:'AI 코칭 대화 활용',24:'재발 방지 신호',25:'회복 루틴 5분',
        26:'관계 회복 진솔한 대화',27:'거절 경계 만들기',28:'4주 마음챙김 정리',29:'한 달 셀프 리포트',30:'30일 마음 변화 마무리 감사 명상',
      };
      // Resolve YouTube candidates per mission day in parallel
      const rows = await Promise.all(
        missions.map(async (m: any) => {
          const q = DAY_YT[m.day] ?? null;
          const candidates = q ? await fetchCandidates(q) : [];
          return {
            user_id: user.id,
            enrollment_id: enrollmentId,
            workbook_id: workbook.id,
            day_number: m.day,
            week_number: weekNumber,
            mission_title: m.title,
            mission_description: m.description,
            mission_type: m.type,
            estimated_minutes: m.minutes ?? 5,
            youtube_query: q,
            youtube_candidates: candidates,
            // Keep first candidate as the default for legacy fields
            youtube_video_id: candidates[0]?.video_id ?? null,
            youtube_title: candidates[0]?.title ?? null,
            youtube_thumbnail: candidates[0]?.thumbnail ?? null,
          };
        }),
      );
      await supabase.from("mind_track_daily_missions").insert(rows);
    }

    return new Response(JSON.stringify({ success: true, generated: missions.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("weekly-refresh error:", e);
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
