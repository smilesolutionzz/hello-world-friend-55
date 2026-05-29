// Mind-Track Action Prescribe
// ---------------------------------------------------------------
// 사용자×Day에 대해 전문가 솔루션 카드(JSON)를 생성/upsert.
// LLM은 진단·액션·근거만, 영상/상품 매칭은 코드(카탈로그)가 결정.
//
// POST { enrollmentId, dayNumber, audience?, focus?, force? }
//   → { prescription }
//
// 정책:
//  - 같은 enrollment×day에 캐시가 있으면 force=false일 때 그대로 반환.
//  - LLM 호출은 Gemini 3.1, reasoning.effort medium.
//  - 위기 신호(자해/타해)는 prescription 생성을 건너뛰고 safety 분기 반환.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

// 화이트리스트 카탈로그 (edge function 내 인라인 — 외부 import 불가)
type Audience = "parent" | "child_dev" | "adult" | "teen";
type FocusTag =
  | "tantrum" | "discipline" | "sleep" | "aba_speech" | "aba_play"
  | "sensory" | "attachment" | "school_adapt" | "sibling"
  | "burnout" | "anxiety" | "depression" | "sleep_adult"
  | "relationship" | "self_esteem" | "motivation";

interface VideoEntry {
  id: string; channelName: string; programName?: string;
  audiences: Audience[]; tags: FocusTag[];
  whyTemplate: string; searchSeed: string;
}

const VIDEOS: VideoEntry[] = [
  { id: "geumjjok", channelName: "채널A", programName: "금쪽같은 내 새끼",
    audiences: ["parent"], tags: ["tantrum","discipline","attachment","sibling","school_adapt"],
    whyTemplate: "실제 가정의 행동 사례를 전문가가 분석해 오늘 액션의 적용 맥락이 잘 보입니다.",
    searchSeed: "금쪽같은 내 새끼" },
  { id: "changed-child", channelName: "SBS", programName: "우리 아이가 달라졌어요",
    audiences: ["parent"], tags: ["tantrum","discipline","sleep","attachment"],
    whyTemplate: "일관된 반응 원리의 고전적 사례를 시각적으로 확인할 수 있습니다.",
    searchSeed: "우리 아이가 달라졌어요" },
  { id: "choi-minjun", channelName: "최민준의 아들TV",
    audiences: ["parent"], tags: ["tantrum","discipline","motivation","school_adapt"],
    whyTemplate: "남아 양육 특화 전문가 채널. 충동·에너지 조절 관점에서 오늘 액션을 보완.",
    searchSeed: "최민준의 아들tv" },
  { id: "baessa", channelName: "베싸TV",
    audiences: ["parent","child_dev"], tags: ["sleep","aba_speech","aba_play","attachment"],
    whyTemplate: "근거 기반 영유아 양육 채널. 관찰 포인트를 학술 자료로 뒷받침.",
    searchSeed: "베싸TV" },
  { id: "aba-class", channelName: "ABA 부모교실",
    audiences: ["child_dev"], tags: ["aba_speech","aba_play","sensory","tantrum"],
    whyTemplate: "ABA 행동기법(ABC·강화·소거)의 부모 적용 사례.",
    searchSeed: "ABA 부모교육" },
  { id: "dr-jung", channelName: "정신과의사 정우열",
    audiences: ["adult","parent"], tags: ["burnout","anxiety","depression","self_esteem"],
    whyTemplate: "임상 전문의 채널. 인지 재구성/행동 활성화 액션을 짧은 강의로 보강.",
    searchSeed: "정신과의사 정우열" },
  { id: "doctor-friends", channelName: "닥터프렌즈",
    audiences: ["adult"], tags: ["anxiety","depression","sleep_adult","burnout"],
    whyTemplate: "의사 3인이 정신·신체 건강 이슈를 풀어주는 채널.",
    searchSeed: "닥터프렌즈" },
  { id: "ebs-teen", channelName: "EBS", programName: "청소년 마음건강",
    audiences: ["teen","parent"], tags: ["motivation","self_esteem","school_adapt","anxiety"],
    whyTemplate: "공교육 매체의 청소년 정서·동기 다큐.",
    searchSeed: "EBS 청소년 마음건강" },
];

interface ProductEntry {
  id: string; name: string; ageRange: string;
  tags: FocusTag[]; whyTemplate: string; searchKeyword: string;
}
const PRODUCTS: ProductEntry[] = [
  { id: "object-cards", name: "사물 그림카드", ageRange: "12-36m",
    tags: ["aba_speech"], whyTemplate: "명사 단어 자극과 공동주시 형성. 하루 5분 카드 보여주기.",
    searchKeyword: "영유아 사물 그림카드 한글" },
  { id: "cause-effect", name: "인과관계 누름 장난감", ageRange: "12-30m",
    tags: ["aba_play","aba_speech"], whyTemplate: "누르면 반응하는 장난감은 강화제로 작동해 자발 행동을 늘려줍니다.",
    searchKeyword: "영유아 인과관계 장난감 누름" },
  { id: "play-dough", name: "점토 세트", ageRange: "2-6y",
    tags: ["aba_play","sensory"], whyTemplate: "소근육·촉감 자극과 차례 지키기 연습에 좋습니다.",
    searchKeyword: "유아 천연 점토 세트" },
  { id: "weighted-blanket", name: "아동 무게 담요", ageRange: "3-10y",
    tags: ["sleep","sensory"], whyTemplate: "심부 압력이 진정 반응을 도와 잠들기 전 각성도를 낮춥니다(체중 10% 이내).",
    searchKeyword: "아동 무게 담요 1.5kg" },
  { id: "emotion-cards", name: "감정 표현 카드", ageRange: "3-8y",
    tags: ["tantrum","attachment"], whyTemplate: "감정 라벨링이 전두엽을 활성화해 떼쓰기 강도를 줄여줍니다.",
    searchKeyword: "아동 감정 카드 한글" },
  { id: "visual-schedule", name: "비주얼 스케줄 보드", ageRange: "3-10y",
    tags: ["discipline","sleep","school_adapt"], whyTemplate: "예측 가능성을 높여 전환기 떼쓰기를 줄여주는 ABA antecedent 조절 도구.",
    searchKeyword: "비주얼 스케줄 보드 아동" },
  { id: "sensory-bin", name: "감각 통합 놀이박스", ageRange: "2-6y",
    tags: ["sensory","aba_play"], whyTemplate: "다양한 텍스처로 촉각 방어를 낮추고 주의집중을 늘려줍니다.",
    searchKeyword: "유아 감각 놀이 박스" },
];

function normalizeFocus(input?: string | null): FocusTag | null {
  if (!input) return null;
  const s = String(input).toLowerCase();
  if (s.includes("tantrum") || s.includes("떼") || s.includes("훈육")) return "tantrum";
  if (s.includes("sleep") || s.includes("수면") || s.includes("잠")) return "sleep";
  if (s.includes("speech") || s.includes("언어")) return "aba_speech";
  if (s.includes("play") || s.includes("놀이")) return "aba_play";
  if (s.includes("sensory") || s.includes("감각")) return "sensory";
  if (s.includes("attach") || s.includes("애착")) return "attachment";
  if (s.includes("school") || s.includes("학교") || s.includes("등원")) return "school_adapt";
  if (s.includes("burnout") || s.includes("번아웃")) return "burnout";
  if (s.includes("anxi") || s.includes("불안")) return "anxiety";
  if (s.includes("depress") || s.includes("우울")) return "depression";
  if (s.includes("self") || s.includes("자존")) return "self_esteem";
  if (s.includes("motiv") || s.includes("동기")) return "motivation";
  if (s.includes("discipline")) return "discipline";
  return null;
}

function pickVideos(focus: FocusTag | null, audience: Audience, limit = 3) {
  return VIDEOS
    .map(v => {
      let s = 0;
      if (!v.audiences.includes(audience)) return { v, s: -1 };
      s += 3;
      if (focus && v.tags.includes(focus)) s += 5;
      return { v, s };
    })
    .filter(x => x.s >= 0)
    .sort((a,b) => b.s - a.s)
    .slice(0, limit)
    .map(x => ({
      title: x.v.programName ? `${x.v.channelName} · ${x.v.programName}` : x.v.channelName,
      channel: x.v.channelName,
      searchQuery: x.v.searchSeed + (focus ? ` ${focus}` : ""),
      youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(x.v.searchSeed)}`,
      why: x.v.whyTemplate,
    }));
}

function pickProducts(focus: FocusTag | null, audience: Audience, limit = 3) {
  if (audience !== "child_dev") return [];
  return PRODUCTS
    .map(p => {
      let s = 3;
      if (focus && p.tags.includes(focus)) s += 5;
      return { p, s };
    })
    .sort((a,b) => b.s - a.s)
    .slice(0, limit)
    .map(x => ({
      name: x.p.name,
      ageRange: x.p.ageRange,
      why: x.p.whyTemplate,
      searchKeyword: x.p.searchKeyword,
    }));
}

function pickFramework(audience: Audience, focus: FocusTag | null) {
  if (audience === "child_dev") return {
    framework: "ABA",
    principles: [
      "ABC 분석: 선행자극(A) → 행동(B) → 결과(C)를 분리해 관찰.",
      "정적 강화: 원하는 행동 직후 즉시 보상.",
      "소거: 부적절 행동에 대한 반응을 일관되게 거둡니다.",
    ],
  };
  if (audience === "parent") {
    if (focus === "sleep") return {
      framework: "BehavioralSleep",
      principles: [
        "일관된 수면 의식이 멜라토닌 시점을 정렬.",
        "잠자리 환경(빛·소리·온도)을 2주 이상 유지.",
        "깨움 시 반응 강도를 점진적으로 낮춤(graduated extinction).",
      ],
    };
    return {
      framework: "PCIT",
      principles: [
        "CDI(아동 주도): 따라하기·묘사·칭찬·반영·즐기기(PRIDE).",
        "명령은 직접·구체·긍정형으로.",
        "결과(타임아웃·칭찬)를 예측 가능하게 일관 적용.",
      ],
    };
  }
  if (audience === "teen") return {
    framework: "MI",
    principles: [
      "열린 질문·반영으로 변화 동기 이끌기.",
      "저항에는 굴러가기(rolling with resistance).",
      "가치-행동 불일치를 부드럽게 비추기.",
    ],
  };
  return {
    framework: "CBT",
    principles: [
      "자동적 사고를 적어 인지 왜곡 식별.",
      "행동 활성화: 작은 즐거움·숙달 활동 스케줄링.",
      "회피를 단계적 노출로 대체.",
    ],
  };
}

interface ActionItem {
  title: string;
  when: string;
  how: string;
  why: string;
}

async function llmGenerateActions(input: {
  audience: Audience;
  focus: FocusTag | null;
  framework: string;
  principles: string[];
  recentJournal: string;
  dayNumber: number;
}): Promise<{ summary: string; actions: ActionItem[]; observation_points: string[] }> {
  const sys = `당신은 ${input.framework} 프레임워크에 기반해 한국 가정·개인에게 처방을 내리는 전문가입니다.
오늘(Day ${input.dayNumber})에 사용자가 즉시 실행할 수 있는 솔루션을 JSON으로만 제시하세요.
원칙은 다음과 같습니다: ${input.principles.join(" / ")}
의학적 진단·약물 권장은 금지. 발달 트랙(child_dev)일 때만 관찰 항목(observation_points)을 채우세요.
모든 출력은 한국어, 부드럽고 단호한 전문가 톤. 이모지/마크다운 금지.`;

  const user = `audience: ${input.audience}
focus: ${input.focus ?? "general"}
최근 기록:
${input.recentJournal || "(기록 없음)"}`;

  const body = {
    model: "google/gemini-3.1-flash-lite-preview",
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
    reasoning: { effort: "medium" },
    tools: [{
      type: "function",
      function: {
        name: "emit_prescription",
        description: "Return today's expert prescription in structured form.",
        parameters: {
          type: "object",
          properties: {
            summary: { type: "string", description: "전문가 한 줄 진단 (50자 이내)" },
            actions: {
              type: "array",
              minItems: 3, maxItems: 3,
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  when: { type: "string", description: "오늘 언제/어떤 상황에서" },
                  how: { type: "string", description: "구체적 스크립트·행동. 2~3문장." },
                  why: { type: "string", description: "메커니즘 한 문장." },
                },
                required: ["title","when","how","why"],
                additionalProperties: false,
              },
            },
            observation_points: {
              type: "array",
              items: { type: "string" },
              description: "발달 트랙일 때 오늘 관찰할 ABC 항목 (3~5개). 그 외엔 빈 배열.",
            },
          },
          required: ["summary","actions","observation_points"],
          additionalProperties: false,
        },
      },
    }],
    tool_choice: { type: "function", function: { name: "emit_prescription" } },
  };

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`gateway ${resp.status}: ${t.slice(0,200)}`);
  }
  const data = await resp.json();
  const call = data?.choices?.[0]?.message?.tool_calls?.[0];
  if (!call?.function?.arguments) throw new Error("no tool call");
  const parsed = JSON.parse(call.function.arguments);
  return parsed;
}

function fallbackPrescription(audience: Audience, focus: FocusTag | null) {
  return {
    summary: "오늘은 가볍게: 어제 관찰을 1줄로 다시 적어보세요.",
    actions: [
      { title: "한 줄 회고",
        when: "오늘 저녁 자기 전 5분",
        how: "어제 가장 기억에 남는 순간 하나를 한 문장으로 적어보세요.",
        why: "기록은 패턴 인식의 첫 단계입니다." },
      { title: "호흡 4-7-8",
        when: "지금 바로",
        how: "코로 4초 들이쉬고 7초 멈추고 8초 내쉬기를 3회.",
        why: "부교감 신경 활성으로 각성도를 낮춥니다." },
      { title: "감정 단어 1개 고르기",
        when: "오늘 하루 중 1번",
        how: "지금 느낌과 가장 가까운 감정 단어 하나를 고르고 왜인지 한 줄.",
        why: "감정 라벨링은 편도체 활동을 줄여줍니다." },
    ],
    observation_points: audience === "child_dev"
      ? ["떼쓰기 직전의 선행자극", "행동의 지속 시간", "끝났을 때 부모의 반응"]
      : [],
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { enrollmentId, dayNumber, audience, focus, force } = await req.json();

    if (!enrollmentId || typeof dayNumber !== "number") {
      return new Response(JSON.stringify({ error: "missing enrollmentId/dayNumber" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. enrollment lookup
    const { data: enrollment, error: eErr } = await supabase
      .from("mind_track_enrollments")
      .select("id, user_id, audience, goal_focus, baseline_data")
      .eq("id", enrollmentId)
      .single();
    if (eErr || !enrollment) {
      return new Response(JSON.stringify({ error: "enrollment not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. cache check
    if (!force) {
      const { data: cached } = await supabase
        .from("mind_track_action_prescriptions")
        .select("*")
        .eq("enrollment_id", enrollmentId)
        .eq("day_number", dayNumber)
        .maybeSingle();
      if (cached) {
        return new Response(JSON.stringify({ prescription: cached, cached: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const aud = (audience || enrollment.audience || "parent") as Audience;
    const focusTag = normalizeFocus(focus || enrollment.goal_focus);
    const fw = pickFramework(aud, focusTag);

    // 3. recent journal
    const { data: logs } = await supabase
      .from("mind_track_session_logs")
      .select("answers, feedback, day_number, created_at")
      .eq("enrollment_id", enrollmentId)
      .order("created_at", { ascending: false })
      .limit(2);
    const recentJournal = (logs || [])
      .map((l: any) => `Day ${l.day_number}: ${JSON.stringify(l.answers || {}).slice(0,400)}`)
      .join("\n");

    // 4. LLM
    let llm;
    try {
      llm = await llmGenerateActions({
        audience: aud, focus: focusTag,
        framework: fw.framework, principles: fw.principles,
        recentJournal, dayNumber,
      });
    } catch (err) {
      console.error("[prescribe] llm failed, using fallback", err);
      llm = fallbackPrescription(aud, focusTag);
    }

    const videos = pickVideos(focusTag, aud, 3);
    const products = pickProducts(focusTag, aud, 3);

    const row = {
      enrollment_id: enrollmentId,
      user_id: enrollment.user_id,
      day_number: dayNumber,
      track_focus: focusTag,
      audience: aud,
      framework: fw.framework,
      summary: llm.summary,
      actions: llm.actions,
      rationale: { framework: fw.framework, key_principles: fw.principles },
      observation_points: aud === "child_dev" ? llm.observation_points : [],
      video_picks: videos,
      product_picks: products,
      email_status: "pending",
      generated_at: new Date().toISOString(),
    };

    const { data: upserted, error: uErr } = await supabase
      .from("mind_track_action_prescriptions")
      .upsert(row, { onConflict: "enrollment_id,day_number" })
      .select()
      .single();
    if (uErr) throw uErr;

    return new Response(JSON.stringify({ prescription: upserted, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[prescribe] error", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
