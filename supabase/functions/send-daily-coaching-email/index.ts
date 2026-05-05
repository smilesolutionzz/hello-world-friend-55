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
  whyToday: string;
  microScript: string[];
  keyActions: string[];
  insight: string;
  expectedOutcome: string;
  eveningReflection: string;
}

function getPhase(dayNumber: number, totalDays: number) {
  const ratio = dayNumber / totalDays;
  if (ratio <= 0.25) return {
    phase: "1주차 · 자각(Awareness)",
    phaseGoal: "내 패턴을 알아차리는 감각 만들기",
    pastFocus: "지금까지: 감정·신체 신호를 관찰하는 기초 훈련 단계",
    nextFocus: "다음 단계: 패턴을 흔드는 작은 실험",
  };
  if (ratio <= 0.5) return {
    phase: "2주차 · 실험(Experiment)",
    phaseGoal: "기존 반응 대신 새로운 행동을 시도하기",
    pastFocus: "지금까지: 자각이 자리잡으며 반응 사이 '틈'이 생기는 시기",
    nextFocus: "다음 단계: 효과 있는 행동을 일상에 박아 넣기",
  };
  if (ratio <= 0.75) return {
    phase: "3주차 · 통합(Integration)",
    phaseGoal: "효과 있는 행동을 루틴으로 굳히기",
    pastFocus: "지금까지: 새 행동이 의식적 노력 없이 시작되기 시작하는 단계",
    nextFocus: "다음 단계: 압박 상황에서도 흔들리지 않는 회복 탄력",
  };
  return {
    phase: "4주차 · 회복탄력(Resilience)",
    phaseGoal: "스트레스 상황에서도 무너지지 않는 자기조절 능력",
    pastFocus: "지금까지: 자각→실험→통합을 거쳐 자기 조절 회로가 안정화되는 시기",
    nextFocus: "다음 단계: 30일 이후, 스스로 코치가 되어 루틴을 유지하기",
  };
}

async function generateCoachingContent(goal: GoalRow): Promise<CoachingContent> {
  const meta = CATEGORY_META[goal.goal_category] || CATEGORY_META.stress;
  const dayNumber = goal.current_day + 1;
  const phase = getPhase(dayNumber, goal.total_days);

  const fallback: CoachingContent = {
    missionSummary: `${phase.phase} · 오늘은 5분 자기관찰`,
    mission: `${meta.focus}의 일환으로, 5분간 호흡에 집중하며 현재 감정 강도를 1~10점으로 기록해보세요.`,
    whyToday: `오늘은 ${phase.phase}에 해당합니다. ${phase.phaseGoal}이 이번 주의 핵심이며, 5분 자기관찰은 이 단계의 가장 단단한 기초가 됩니다.`,
    microScript: [
      "0:00 — 휴대폰 무음, 의자에 등 펴고 앉기",
      "0:30 — 코로 4초 들숨, 6초 날숨 3회",
      "1:30 — 지금 감정을 한 단어로 호명하기",
      "3:00 — 1~10점으로 강도 기록",
      "4:30 — 끝낸 뒤 한 줄 변화 노트",
    ],
    keyActions: [
      "타이머 5분 설정 후 조용한 자리 확보",
      "호흡에만 집중하며 감정 강도 기록",
      "끝난 뒤 한 줄 일지로 변화 메모",
    ],
    insight: `${meta.researchBase}에 따르면 일관된 자기 관찰 기록은 30일 후 평균 23%의 증상 완화를 가져옵니다.`,
    expectedOutcome: "5분 뒤, 머리가 조금 가벼워지고 감정 강도가 1~2점 정도 내려간 것을 감지할 수 있습니다.",
    eveningReflection: "오늘 미션 전과 후, 내 몸의 어디가 가장 다르게 느껴졌는가?",
  };

  if (!LOVABLE_API_KEY) return fallback;

  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        reasoning: { effort: "medium" },
        messages: [
          { role: "system", content: `당신은 임상심리학 박사급 코치이자 행동설계 전문가입니다. AIHPRO 프리미엄 30일 트랙의 데일리 코칭 메일을 작성합니다.

[작성 철학]
- 사용자는 ₩19,900을 지불한 유료 구독자입니다. "돈 낸 가치가 있다"는 감각이 매일 느껴져야 합니다.
- 일반 명상 앱이 줄 수 없는 것: (1) 오늘 이 미션이 트랙의 어느 단계에서 왜 필요한지의 임상적 논리, (2) 0~5분의 시간축 스크립트, (3) 끝낸 직후의 기대 변화, (4) 잠들기 전 회고 질문.
- 어제·오늘·내일이 연결된 "여정의 N일차"라는 감각을 반드시 만들어주세요.
- 톤: 박사급 임상가가 한 명의 클라이언트에게 직접 쓴 1:1 노트. 상투적 동기부여 슬로건 금지.

[절대 규칙]
- 모든 출력은 반드시 한국어. 영어 단어/문장 사용 금지(고유명사·연구명·시간표기 0:30 등 예외).
- 이모지·아이콘·마크다운 기호(#, *, -, > 등) 사용 절대 금지.
- JSON 외 다른 텍스트 출력 금지.` },
          { role: "user", content: `[유료 구독자 컨텍스트]
- 코칭 목표: ${meta.label}
- 진행 일차: Day ${dayNumber} / ${goal.total_days}
- 트랙 단계: ${phase.phase}
- 이번 단계의 목적: ${phase.phaseGoal}
- ${phase.pastFocus}
- ${phase.nextFocus}
- 핵심 접근법: ${meta.focus}
- 임상 근거: ${meta.researchBase}
- 사용자 추가 설명: ${goal.goal_description || "없음"}

다음 JSON 스키마로 작성하세요. 각 필드는 트랙 단계와 일차를 명시적으로 반영해야 합니다.

{
  "missionSummary": "오늘 미션의 본질을 1줄로 (40자 이내, '오늘'이 왜 특별한지 암시)",
  "mission": "오늘 5분 안에 실행할 단 하나의 구체적 미션. 장소·자세·도구까지 명시 (200자 이내)",
  "whyToday": "왜 하필 Day ${dayNumber}의 ${phase.phase}에서 이 미션이 필요한가. 어제까지 쌓인 것 위에 오늘 무엇이 더해지는지 임상적으로 설명 (250자 이내)",
  "microScript": [
    "0:00 — 시작 자세/세팅 (한 문장)",
    "0:30 — 첫 행동",
    "1:30 — 중간 핵심 행동",
    "3:00 — 변화 관찰",
    "4:30 — 마무리·기록"
  ],
  "keyActions": ["행동1 (15자 이내)", "행동2 (15자 이내)", "행동3 (15자 이내)"],
  "insight": "오늘 미션이 효과적인 임상 근거. 가능하면 효과 크기/% 숫자 포함 (300자 이내, 연구명만 영문 허용)",
  "expectedOutcome": "미션 직후 사용자가 몸/머리/감정에서 감지할 변화 (120자 이내, 과장 금지·구체적 신체 감각 위주)",
  "eveningReflection": "잠들기 전 스스로에게 던질 한 줄 질문 (60자 이내, 평가형 아닌 관찰형)"
}` },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!resp.ok) throw new Error(`AI ${resp.status}`);
    const data = await resp.json();
    const c = JSON.parse(data.choices[0].message.content);
    const sanitize = (s: string) => {
      let out = String(s ?? "");
      try {
        out = out.replace(/\p{Extended_Pictographic}/gu, "");
        out = out.replace(/[\u{1F300}-\u{1FAFF}]/gu, "");
        out = out.replace(/[\u{2600}-\u{27BF}]/gu, "");
      } catch (_) { /* ignore */ }
      out = out
        .replace(/[\uD800-\uDFFF]/g, "")
        .replace(/[\uFE00-\uFE0F]/g, "")
        .replace(/\u200D/g, "")
        .replace(/\uFFFD/g, "");
      out = out
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/\(\s*\)/g, "")
        .replace(/\s+([,.!?])/g, "$1")
        .replace(/\s+/g, " ")
        .trim();
      return out;
    };
    const isKorean = (s: string) => {
      const txt = String(s ?? "");
      const hangul = (txt.match(/[\uAC00-\uD7AF]/g) || []).length;
      const letters = (txt.match(/[A-Za-z\uAC00-\uD7AF]/g) || []).length;
      return letters === 0 || hangul / letters >= 0.3;
    };
    const pickKo = (val: string, fb: string) => {
      const s = sanitize(val);
      return s && isKorean(s) ? s : fb;
    };
    const koActions = Array.isArray(c.keyActions) && c.keyActions.length >= 3
      ? c.keyActions.slice(0, 3).map((a: string) => sanitize(a)).filter((a: string) => isKorean(a))
      : [];
    const koScript = Array.isArray(c.microScript) && c.microScript.length >= 3
      ? c.microScript.slice(0, 6).map((a: string) => sanitize(a)).filter((a: string) => isKorean(a))
      : [];
    return {
      missionSummary: pickKo(c.missionSummary, fallback.missionSummary),
      mission: pickKo(c.mission, fallback.mission),
      whyToday: pickKo(c.whyToday, fallback.whyToday),
      microScript: koScript.length >= 3 ? koScript : fallback.microScript,
      keyActions: koActions.length >= 3 ? koActions : fallback.keyActions,
      insight: pickKo(c.insight, fallback.insight),
      expectedOutcome: pickKo(c.expectedOutcome, fallback.expectedOutcome),
      eveningReflection: pickKo(c.eveningReflection, fallback.eveningReflection),
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

    async function callTransactionalEmail(payload: any): Promise<{ ok: boolean; error?: string; body?: any; renderCheck?: any }> {
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

        // 추적 토큰 생성 + 토큰 매핑 저장
        const trackingToken = crypto.randomUUID().replace(/-/g, '');
        const dataWithToken = { ...templateData, trackingToken };

        const html = await renderAsync(
          React.createElement(dailyCoachingTpl.component, dataWithToken)
        );

        // 렌더 결과 검증 (??/04 섹션 노출 여부)
        const ufffdCount = (html.match(/\uFFFD/g) || []).length;
        const qqCount = (html.match(/\?\?/g) || []).length;
        const hasReplacementChar = ufffdCount > 0 || qqCount > 0;
        const hasSection04 = /04 · 오늘의 추천 영상/.test(html);
        const hasSection03 = /03 · 임상적 근거/.test(html);
        const hasSection05 = /05 · 오늘의 기록/.test(html);
        const renderIssues: string[] = [];
        if (ufffdCount > 0) renderIssues.push(`ufffd:${ufffdCount}`);
        if (qqCount > 0) renderIssues.push(`qq:${qqCount}`);
        if (!hasSection03) renderIssues.push('missing_section_03');
        if (!hasSection04) renderIssues.push('missing_section_04');
        if (!hasSection05) renderIssues.push('missing_section_05');
        // ?? / U+FFFD 발견 시 주변 컨텍스트 추출 (디버깅)
        let qqSamples: string[] = [];
        if (qqCount > 0) {
          const re = /.{0,40}\?\?.{0,40}/g;
          qqSamples = (html.match(re) || []).slice(0, 5);
        }
        let ufffdSamples: string[] = [];
        if (ufffdCount > 0) {
          const re2 = /.{0,40}\uFFFD.{0,40}/g;
          ufffdSamples = (html.match(re2) || []).slice(0, 5);
        }
        log('render check', { recipientEmail, ufffdCount, qqCount, hasSection03, hasSection04, hasSection05, qqSamples, ufffdSamples });

        await supa.from('daily_coaching_email_tokens').insert({
          token: trackingToken,
          recipient_email: recipientEmail,
          send_log_message_id: idempotencyKey,
          day_number: templateData.dayNumber ?? null,
          category: templateData.categoryLabel ?? null,
          has_section_04: hasSection04,
          has_replacement_char: hasReplacementChar,
          render_issues: renderIssues,
        }).then(() => {}, (e) => log('token insert failed', { err: String(e) }));

        const subject = typeof dailyCoachingTpl.subject === 'function'
          ? dailyCoachingTpl.subject(dataWithToken)
          : dailyCoachingTpl.subject;

        const result = await resend.emails.send({
          from: FROM_ADDRESS,
          reply_to: REPLY_TO,
          to: [recipientEmail],
          subject,
          html,
        });

        const renderCheck = { hasReplacementChar, hasSection03, hasSection04, hasSection05, trackingToken };

        if ((result as any)?.error) {
          await supa.from('email_send_log').insert({
            message_id: idempotencyKey,
            template_name: templateName,
            recipient_email: recipientEmail,
            status: 'failed',
            error_message: JSON.stringify((result as any).error),
            metadata: { renderCheck },
          });
          return { ok: false, error: JSON.stringify((result as any).error), body: result, renderCheck };
        }

        await supa.from('email_send_log').insert({
          message_id: idempotencyKey,
          template_name: templateName,
          recipient_email: recipientEmail,
          status: 'sent',
          metadata: { resend_id: (result as any)?.data?.id, renderCheck },
        });

        return { ok: true, body: result, renderCheck };
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
      const day = testDay && testDay > 0 ? testDay : 7;
      const sampleGoal: GoalRow = {
        id: "test", user_id: "test", goal_category: "stress", goal_description: null,
        target_age_group: null, current_day: day - 1, total_days: 30, start_date: todayStr,
      };
      const meta = CATEGORY_META.stress;
      const content = await generateCoachingContent(sampleGoal);
      const prefs: VideoPreferences = { interest_topics: [], difficulty_level: "beginner", preferred_duration: "short", language: "ko" };
      const videos = await fetchYouTubeVideos(sampleGoal.goal_category, content.mission, new Set(), prefs);
      const result = await callTransactionalEmail({
        templateName: 'daily-coaching',
        recipientEmail: testEmail,
        idempotencyKey: `daily-coaching-test-d${day}-${Date.now()}`,
        templateData: {
          nickname: '테스트', dayNumber: day, totalDays: 30,
          categoryLabel: meta.label,
          missionSummary: content.missionSummary,
          mission: content.mission,
          whyToday: content.whyToday,
          microScript: content.microScript,
          keyActions: content.keyActions,
          insight: content.insight, researchBase: meta.researchBase,
          expectedOutcome: content.expectedOutcome,
          eveningReflection: content.eveningReflection,
          videos,
        },
      });
      if (!result.ok) throw new Error(result.error);
      return new Response(JSON.stringify({ success: true, mode: 'test', to: testEmail, day, videoCount: videos.length, body: result.body }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // === Preflight: 매일 발송 직전 자동 테스트 메일 (운영자) ===
    try {
      const PREFLIGHT_TO = 'kijung_kku@naver.com';
      const sampleGoal: GoalRow = {
        id: 'preflight', user_id: 'preflight', goal_category: 'stress',
        goal_description: null, target_age_group: null,
        current_day: 6, total_days: 30, start_date: todayStr,
      };
      const metaPF = CATEGORY_META.stress;
      const contentPF = await generateCoachingContent(sampleGoal);
      const prefsPF: VideoPreferences = { interest_topics: [], difficulty_level: 'beginner', preferred_duration: 'short', language: 'ko' };
      const videosPF = await fetchYouTubeVideos(sampleGoal.goal_category, contentPF.mission, new Set(), prefsPF);
      const pre = await callTransactionalEmail({
        templateName: 'daily-coaching',
        recipientEmail: PREFLIGHT_TO,
        idempotencyKey: `daily-coaching-preflight-${todayStr}-${Date.now()}`,
        templateData: {
          nickname: '운영자(프리플라이트)', dayNumber: 7, totalDays: 30,
          categoryLabel: metaPF.label,
          missionSummary: contentPF.missionSummary,
          mission: contentPF.mission,
          whyToday: contentPF.whyToday,
          microScript: contentPF.microScript,
          keyActions: contentPF.keyActions,
          insight: contentPF.insight,
          researchBase: metaPF.researchBase,
          expectedOutcome: contentPF.expectedOutcome,
          eveningReflection: contentPF.eveningReflection,
          videos: videosPF,
        },
      });
      log('PREFLIGHT result', { ok: pre.ok, renderCheck: pre.renderCheck, error: pre.error });
    } catch (e) {
      log('PREFLIGHT error (continuing)', { err: String(e) });
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
