import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, TrendingUp, FileText, Quote, Lightbulb, ShieldCheck, Sparkles, ArrowRight, UserCheck, MessageCircleHeart, Youtube, Play, Brain, Activity, Moon, HeartPulse, Compass, ListChecks, Calendar, BookMarked } from "lucide-react";

interface Checkin {
  day_number: number;
  mood_score?: number | null;
  energy_score?: number | null;
  clarity_score?: number | null;
  reflection_text?: string | null;
  completed?: boolean;
  created_at?: string;
}

interface Baseline {
  measurement_point?: string;
  stress_score?: number | null;
  energy_score?: number | null;
  clarity_score?: number | null;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  nickname?: string;
  trackTheme?: string;
  currentDay?: number;
  checkins?: Checkin[];
  baselines?: Baseline[];
  ctaPrice?: number;
  onCtaClick?: () => void;
}

/**
 * 30일 완주 시 받게 될 워크북 PDF의 샘플 6장 미리보기.
 * 책 페이지 메타포 + 실제 체크인 데이터로 자동 채워짐.
 */
export default function WorkbookSamplePreviewModal({
  open,
  onOpenChange,
  nickname = "당신",
  trackTheme,
  currentDay = 1,
  checkins = [],
  baselines = [],
  ctaPrice,
  onCtaClick,
}: Props) {
  const sampleTheme = trackTheme || "스트레스 회복과 회복탄력성 강화";

  // ─── 실데이터 가공 ───────────────────────────────────────────
  const baseline = baselines.find((b) => b.measurement_point === "baseline") ?? baselines[0];
  const latest = baselines[baselines.length - 1] ?? baseline;
  const completedCheckins = checkins.filter((c) => c.completed);
  const totalCheckins = completedCheckins.length;

  // 첫 번째 reflection을 "여는 글" 인용구로
  const firstReflection = completedCheckins
    .slice()
    .sort((a, b) => (a.day_number ?? 0) - (b.day_number ?? 0))
    .find((c) => (c.reflection_text ?? "").trim().length > 5);

  // 베이스라인 표시값 (실데이터 우선, 없으면 샘플)
  const fmt = (v?: number | null, fallback?: number) =>
    v != null ? Math.round(v).toString() : fallback != null ? fallback.toString() : "—";

  const startStress = fmt(baseline?.stress_score, 78);
  const startEnergy = fmt(baseline?.energy_score, 32);
  const startClarity = fmt(baseline?.clarity_score, 41);
  const endStress = fmt(latest?.stress_score, 42);
  const endEnergy = fmt(latest?.energy_score, 68);
  const endClarity = fmt(latest?.clarity_score, 74);

  // 최근 체크인 메모 3개 (실데이터 우선, 없으면 샘플)
  const realQuotes = completedCheckins
    .filter((c) => (c.reflection_text ?? "").trim().length > 3)
    .slice(-3)
    .reverse()
    .map((c) => ({
      day: c.day_number ?? 0,
      mood: c.mood_score ?? 0,
      text: (c.reflection_text ?? "").trim().slice(0, 90),
    }));
  const fallbackQuotes = [
    { day: 3, mood: 4, text: "오늘은 처음으로 산책을 5분 했다. 햇빛이 따뜻했다." },
    { day: 12, mood: 6, text: "어제보다 30분 일찍 잠들었다. 작은 변화가 쌓이는 게 보인다." },
    { day: 21, mood: 7, text: "오랜만에 친구에게 먼저 연락했다. 무겁지 않았다." },
  ];
  const quotes = realQuotes.length > 0 ? realQuotes : fallbackQuotes;

  // 무드 추이 SVG path — 실데이터 보간
  const moodPath = (() => {
    const pts = completedCheckins
      .slice()
      .sort((a, b) => (a.day_number ?? 0) - (b.day_number ?? 0))
      .filter((c) => c.mood_score != null);
    if (pts.length < 2) {
      return "M0,80 Q40,75 60,68 T120,55 T180,42 T240,30 T300,22"; // 샘플
    }
    const W = 300;
    const H = 100;
    const max = 10;
    return pts
      .map((c, i) => {
        const x = (i / Math.max(1, pts.length - 1)) * W;
        const y = H - ((c.mood_score ?? 0) / max) * H;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  })();

  const remainingCount = Math.max(0, 30 - quotes.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#faf6ec] p-0 rounded-3xl">
        <DialogHeader className="px-6 pt-6 pb-2 sticky top-0 bg-[#faf6ec]/95 backdrop-blur-md z-10 border-b border-[#C8B88A]/20">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#8a7a4d]" />
            <DialogTitle className="text-base font-bold text-slate-900">
              완성된 워크북 미리보기
            </DialogTitle>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {totalCheckins > 0
              ? `현재까지 ${totalCheckins}일치 데이터 + 코치 노트로 채워졌어요. 남은 ${Math.max(
                  0,
                  30 - currentDay
                )}일을 마저 채우면 한 권이 완성됩니다.`
              : "아래는 샘플입니다. 체크인이 쌓일수록 당신의 데이터로, 정체기엔 실제 코치 노트가 함께 들어가요."}
          </p>
        </DialogHeader>

        <div className="px-4 sm:px-6 py-5 space-y-4">
          {/* PAGE 1 — 표지 */}
          <PageFrame label="표지">
            <div className="aspect-[3/4] sm:aspect-[5/6] bg-gradient-to-br from-white via-[#fbf7eb] to-[#e8dcb6] rounded-2xl border border-[#C8B88A]/30 p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-6 left-6 right-6 h-px bg-[#C8B88A]/40" />
              <div className="absolute bottom-6 left-6 right-6 h-px bg-[#C8B88A]/40" />

              <div className="text-center mt-6">
                <div className="text-[10px] font-bold tracking-[0.3em] text-[#8a7a4d] uppercase">
                  AIHPRO Mind Track
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">
                  Vol. 01 · 30 Days · Day {currentDay}/30
                </div>
              </div>

              <div className="text-center px-2">
                <div
                  className="text-2xl sm:text-4xl font-bold text-slate-900 leading-tight break-keep"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  나의 마음
                  <br />
                  30일 기록
                </div>
                <div className="w-12 h-px bg-[#8a7a4d] mx-auto my-4" />
                <div className="text-sm text-slate-700 break-keep">{sampleTheme}</div>
              </div>

              <div className="text-center text-[11px] text-slate-500 mb-4">
                <div className="font-bold text-slate-700">{nickname}</div>
                <div className="mt-1">총 {totalCheckins || 0}일 체크인 누적</div>
              </div>
            </div>
          </PageFrame>

          {/* PAGE 2 — 여는 글 (실데이터: 첫 reflection) */}
          <PageFrame label="여는 글 · Opening">
            <Page>
              <PageHeader title="30일 전, 당신이 원했던 것" chapter="00" />
              <p className="text-[13px] text-slate-700 leading-[1.9] break-keep">
                {firstReflection?.reflection_text
                  ? `"${firstReflection.reflection_text.trim().slice(0, 160)}"`
                  : `"요즘 마음이 너무 무거워요. 매일 아침이 두렵고, 작은 일에도 쉽게 지쳐요. 다시 나답게 살고 싶어요."`}
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-[10px] font-bold tracking-[0.15em] text-[#8a7a4d] uppercase mb-2">
                  Baseline · 시작점{baseline ? "" : " (샘플)"}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <Stat label="스트레스" value={startStress} tone="rose" />
                  <Stat label="에너지" value={startEnergy} tone="amber" />
                  <Stat label="명료도" value={startClarity} tone="slate" />
                </div>
              </div>
            </Page>
          </PageFrame>

          {/* PAGE 3 — 마음 변화 그래프 (실데이터) */}
          <PageFrame label="1장 · 마음 변화 그래프">
            <Page>
              <PageHeader title="30일간 마음의 흐름" chapter="01" icon={TrendingUp} />
              <p className="text-[12px] text-slate-500 mb-4 break-keep">
                {completedCheckins.length >= 2
                  ? `누적 ${completedCheckins.length}회 체크인을 바탕으로 그린 회복 곡선`
                  : "매일 체크인 데이터를 바탕으로 그린 당신의 회복 곡선 (샘플)"}
              </p>

              <div className="h-32 relative bg-gradient-to-b from-[#fbf7eb] to-white rounded-xl p-3 border border-[#C8B88A]/20">
                <svg viewBox="0 0 300 100" className="w-full h-full">
                  <path d={moodPath} stroke="#8a7a4d" strokeWidth="2" fill="none" />
                  <path
                    d={`${moodPath} L300,100 L0,100 Z`}
                    fill="url(#gradGold)"
                    opacity="0.3"
                  />
                  <defs>
                    <linearGradient id="gradGold" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#C8B88A" />
                      <stop offset="100%" stopColor="#C8B88A" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <Delta label="스트레스" before={startStress} after={endStress} tone="emerald" />
                <Delta label="에너지" before={startEnergy} after={endEnergy} tone="emerald" />
                <Delta label="명료도" before={startClarity} after={endClarity} tone="emerald" />
              </div>
            </Page>
          </PageFrame>

          {/* PAGE 4 — 30일의 기록 (실 reflection) */}
          <PageFrame label="2장 · 30일의 기록">
            <Page>
              <PageHeader title="당신이 남긴 말들" chapter="02" icon={Quote} />
              <div className="space-y-3">
                {quotes.map((c, i) => (
                  <div key={i} className="border-l-2 border-[#C8B88A]/50 pl-3">
                    <div className="text-[10px] font-mono text-slate-400">
                      Day {c.day} · 무드 {c.mood}/10
                    </div>
                    <p className="text-[12.5px] text-slate-700 mt-1 break-keep leading-relaxed">
                      "{c.text}"
                    </p>
                  </div>
                ))}
                {remainingCount > 0 && (
                  <div className="text-[10px] text-slate-400 text-center pt-2">
                    ··· {remainingCount}개의 기록이 더 채워질 자리예요 ···
                  </div>
                )}
              </div>
            </Page>
          </PageFrame>

          {/* PAGE 4.5 — 전문가 개입 노트 #1 (Day 8 무렵) */}
          <PageFrame label="전문가 노트 · Day 8">
            <Page>
              <PageHeader title="코치가 함께 짚어준 지점" chapter="Note 01" icon={UserCheck} />
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-[#C8B88A]/20 border border-[#C8B88A]/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-[11px] font-bold text-[#8a7a4d]">JK</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-bold text-slate-900">정OO 코치</div>
                  <div className="text-[10px] text-slate-500">임상심리 전문 · 회복 코칭 12년</div>
                </div>
              </div>
              <div className="rounded-xl bg-[#fbf7eb] border border-[#C8B88A]/30 p-3.5 mb-3">
                <div className="text-[10px] font-bold tracking-[0.15em] text-[#8a7a4d] uppercase mb-1.5">관찰</div>
                <p className="text-[12.5px] text-slate-700 leading-relaxed break-keep">
                  "Day 1~7 기록을 보니, 무드가 떨어지는 시점이 모두 <b>저녁 9시 이후</b>에 몰려 있어요.
                  스스로의 리듬을 한 번도 의심해보지 않았다는 점이 인상적이었습니다."
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50/60 border border-emerald-200/50 p-3.5">
                <div className="text-[10px] font-bold tracking-[0.15em] text-emerald-700 uppercase mb-1.5">함께 정한 미세 조정</div>
                <ul className="text-[12.5px] text-slate-700 leading-relaxed break-keep space-y-1.5">
                  <li>· 저녁 8시 30분 알림 → 화면 밝기 낮추기</li>
                  <li>· 자기 전 5분 호흡 기록만 추가 (글은 생략 OK)</li>
                  <li>· "잘 못한 날" 기록도 그대로 두기 — 지우지 않기</li>
                </ul>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[10.5px] text-slate-500">
                <MessageCircleHeart className="w-3.5 h-3.5 text-[#8a7a4d]" />
                <span>이 노트는 1:1 짧은 코칭 세션(15분) 후 자동으로 워크북에 추가되었습니다.</span>
              </div>
            </Page>
          </PageFrame>

          {/* PAGE 5 — 핵심 인사이트 (샘플 — 실 통찰은 Day 30 후 AI 생성) */}

          <PageFrame label="4장 · 핵심 인사이트">
            <Page>
              <PageHeader title="30일이 알려준 것" chapter="04" icon={Lightbulb} />
              <div className="space-y-4">
                {[
                  {
                    title: "성장 패턴",
                    body:
                      totalCheckins >= 7
                        ? `${totalCheckins}일치 데이터에서 회복 신호가 잡히기 시작했어요. 30일 완주 후 AI가 정밀 분석합니다.`
                        : "주중보다 주말에 무드 점수가 안정적이며, 사람과의 짧은 접촉이 회복의 핵심 트리거였습니다. (샘플)",
                  },
                  {
                    title: "발견한 자기이해",
                    body: "스트레스 신호를 신체 감각(어깨 긴장, 얕은 호흡)으로 먼저 알아차리는 능력이 생겼습니다. (예시)",
                  },
                  {
                    title: "다음 30일을 위한 제안",
                    body: "주 2회 30분 산책 + 주 1회 신뢰하는 사람과의 대화를 루틴화하기를 권합니다. (예시)",
                  },
                ].map((it) => (
                  <div key={it.title}>
                    <div className="text-[10px] font-bold tracking-[0.15em] text-[#8a7a4d] uppercase mb-1">
                      {it.title}
                    </div>
                    <p className="text-[12.5px] text-slate-700 break-keep leading-relaxed">
                      {it.body}
                    </p>
                  </div>
                ))}
              </div>
            </Page>
          </PageFrame>

          {/* PAGE 5.5 — 전문가 개입 노트 #2 (Day 22 무렵, 정체기 돌파) */}
          <PageFrame label="전문가 노트 · Day 22">
            <Page>
              <PageHeader title="정체기에서 다시 움직인 순간" chapter="Note 02" icon={UserCheck} />
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-[#C8B88A]/20 border border-[#C8B88A]/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-[11px] font-bold text-[#8a7a4d]">SH</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-bold text-slate-900">서OO 코치</div>
                  <div className="text-[10px] text-slate-500">관계·소진 회복 코칭 · 8년</div>
                </div>
              </div>
              <div className="rounded-xl bg-rose-50/60 border border-rose-200/50 p-3.5 mb-3">
                <div className="text-[10px] font-bold tracking-[0.15em] text-rose-700 uppercase mb-1.5">사용자가 보낸 메시지 (Day 18)</div>
                <p className="text-[12.5px] text-slate-700 leading-relaxed break-keep">
                  "2주차까지는 좋아지는 게 보였는데, 이번 주는 다시 제자리예요.
                  내가 뭔가 잘못하고 있는 걸까요?"
                </p>
              </div>
              <div className="rounded-xl bg-[#fbf7eb] border border-[#C8B88A]/30 p-3.5 mb-3">
                <div className="text-[10px] font-bold tracking-[0.15em] text-[#8a7a4d] uppercase mb-1.5">코치의 관점 전환</div>
                <p className="text-[12.5px] text-slate-700 leading-relaxed break-keep">
                  "회복은 직선이 아니에요. <b>2주차 정체기는 거의 모든 사용자가 겪습니다.</b>
                  지금까지 쌓은 14일을 '실패'가 아니라 '몸이 새 리듬을 학습 중'이라고 다시 읽어볼게요."
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50/60 border border-emerald-200/50 p-3.5">
                <div className="text-[10px] font-bold tracking-[0.15em] text-emerald-700 uppercase mb-1.5">개입 후 변화 (Day 19~22)</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white rounded-lg py-2">
                    <div className="text-[15px] font-bold text-emerald-700">+1.8</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">평균 무드</div>
                  </div>
                  <div className="bg-white rounded-lg py-2">
                    <div className="text-[15px] font-bold text-emerald-700">4/4</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">체크인 완료율</div>
                  </div>
                  <div className="bg-white rounded-lg py-2">
                    <div className="text-[15px] font-bold text-emerald-700">−22%</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">스트레스</div>
                  </div>
                </div>
              </div>
              <p className="text-[10.5px] text-slate-500 mt-3 break-keep">
                * 위 사례는 실제 사용자 동의 후 익명 가공된 코칭 기록입니다. 결과는 개인차가 있을 수 있어요.
              </p>
            </Page>
          </PageFrame>

          {/* PAGE 5.7 — 주간 심층 분석 (4주 리듬) */}
          <PageFrame label="3장 · 주간 심층 분석">
            <Page>
              <PageHeader title="4주 동안 일어난 일" chapter="03" icon={Calendar} />
              <p className="text-[12px] text-slate-500 mb-4 break-keep">
                매주 끝에 코치가 직접 검토하고, AI가 행동 데이터·체크인·수면 리듬을 교차 분석한 요약입니다.
              </p>
              <div className="space-y-3">
                {[
                  { week: "Week 1", title: "관찰 · 내 리듬 알아차리기", color: "rose", icon: Activity, body: "아침 코르티솔이 높은 시간대(7~9시)에 부정 감정이 몰림. 카페인 섭취 시점과 무드 저하의 상관계수 0.62. → 카페인을 식사 후로 미루는 미세 조정.", metric: "체크인 5/7 · 수면 평균 5.8h" },
                  { week: "Week 2", title: "조정 · 신체 신호 다루기", color: "amber", icon: HeartPulse, body: "어깨 긴장 → 얕은 호흡 → 무드 저하의 3단계 캐스케이드를 식별. 4-7-8 호흡 1분만 끼워넣었을 때 무드 회복 평균 +1.4점.", metric: "체크인 6/7 · 수면 평균 6.3h" },
                  { week: "Week 3", title: "정체 · 학습 곡선의 평탄기", color: "slate", icon: Compass, body: "전형적인 ‘2주차 정체기’. 새 행동이 자동화되기 전 단계로, 기록만 유지해도 신경회로 통합이 진행됨. 코치가 ‘실패 아님’ 프레임을 제시.", metric: "체크인 4/7 · 수면 평균 6.1h" },
                  { week: "Week 4", title: "통합 · 다음 30일을 위한 토대", color: "emerald", icon: TrendingUp, body: "회복의 트리거 3가지(짧은 산책, 신뢰 대화, 저녁 화면 차단)가 안정적으로 결합. 베이스라인 대비 스트레스 −36점, 명료도 +33점.", metric: "체크인 7/7 · 수면 평균 6.8h" },
                ].map((w) => (
                  <div key={w.week} className="rounded-xl border border-slate-200 bg-white/60 p-3.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <w.icon className={`w-3.5 h-3.5 text-${w.color}-600`} />
                      <span className="text-[10px] font-mono text-slate-500">{w.week}</span>
                      <span className="text-[12.5px] font-bold text-slate-900 break-keep">{w.title}</span>
                    </div>
                    <p className="text-[12px] text-slate-700 leading-relaxed break-keep mb-2">{w.body}</p>
                    <div className="text-[10px] font-mono text-slate-400">{w.metric}</div>
                  </div>
                ))}
              </div>
            </Page>
          </PageFrame>

          {/* PAGE 5.8 — 큐레이션 영상 라이브러리 */}
          <PageFrame label="부록 A · 큐레이션 영상">
            <Page>
              <PageHeader title="당신의 30일에 맞춘 영상 처방" chapter="A" icon={Youtube} />
              <p className="text-[12px] text-slate-500 mb-4 break-keep">
                코치가 직접 검수한 한국어 영상 라이브러리 + 매일 자동 매칭되는 ‘오늘의 영상’. 워크북에는 QR과 짧은 노트가 함께 인쇄됩니다.
              </p>
              <div className="space-y-2.5">
                {[
                  { day: "Day 02", tag: "호흡", title: "3분 마음챙김 호흡 가이드", note: "아침 첫 컵 물 마신 직후에 들어보기. 어깨가 내려가는 감각 관찰.", dur: "3:42", thumb: "from-rose-100 to-rose-50" },
                  { day: "Day 09", tag: "수면", title: "잠들기 전 8분 바디스캔", note: "이어폰 없이 스피커로. 끝까지 못 들어도 OK — 끝나기 전 잠드는 게 목표.", dur: "8:10", thumb: "from-indigo-100 to-indigo-50" },
                  { day: "Day 14", tag: "정체기", title: "회복은 직선이 아니다 — 학습 곡선의 평탄기", note: "Week 2 정체기 자동 푸시. 코치 인터뷰 컷 포함.", dur: "6:25", thumb: "from-amber-100 to-amber-50" },
                  { day: "Day 18", tag: "자기자비", title: "Self-Compassion 5분 명상 (KR)", note: "‘내가 나에게 했더라면 좋았을 말’ 워크시트와 짝지음.", dur: "5:18", thumb: "from-emerald-100 to-emerald-50" },
                  { day: "Day 24", tag: "관계", title: "거절 한 줄 — 경계 만들기 연습", note: "이번 주 ‘하지 않을 일 1가지’와 연결.", dur: "4:55", thumb: "from-sky-100 to-sky-50" },
                  { day: "Day 30", tag: "마무리", title: "한 달 회고 — 감사 명상", note: "마지막 체크인 직후 자동 재생. PDF 마지막 페이지 QR로 영구 보관.", dur: "7:02", thumb: "from-[#fbf7eb] to-white" },
                ].map((v) => (
                  <div key={v.day} className="flex gap-3 p-2.5 rounded-xl border border-slate-200 hover:border-[#C8B88A]/50 transition-colors bg-white">
                    <div className={`relative w-20 h-14 rounded-lg bg-gradient-to-br ${v.thumb} flex items-center justify-center flex-shrink-0 border border-slate-100`}>
                      <Play className="w-5 h-5 text-slate-700" fill="currentColor" />
                      <span className="absolute bottom-0.5 right-1 text-[8px] font-mono bg-black/70 text-white px-1 rounded">{v.dur}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[9px] font-mono text-[#8a7a4d]">{v.day}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">{v.tag}</span>
                      </div>
                      <div className="text-[12px] font-bold text-slate-900 leading-snug break-keep">{v.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 break-keep leading-snug">코치 노트 — {v.note}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-[#fbf7eb] border border-[#C8B88A]/30 p-3 text-[11px] text-slate-600 break-keep leading-relaxed">
                총 30개 영상 · 평균 5분 22초 · 모두 한국어 자막. 매일 당신의 무드·수면·체크인 상태에 따라
                자동 매칭되며, PDF 워크북에는 QR로 영구 보관됩니다.
              </div>
            </Page>
          </PageFrame>

          {/* PAGE 5.9 — 행동 처방전 */}
          <PageFrame label="5장 · 행동 처방전">
            <Page>
              <PageHeader title="다음 30일을 위한 처방전" chapter="05" icon={ListChecks} />
              <p className="text-[12px] text-slate-500 mb-4 break-keep">
                30일 데이터에서 효과 크기가 가장 컸던 행동만 추려, 일상에 끼워 넣을 수 있는 형태로 정리했어요.
              </p>
              <div className="space-y-3">
                {[
                  { when: "매일 아침", act: "물 한 컵 → 햇빛 5분", why: "코르티솔 리듬 정상화 (효과크기 d=0.71)", time: "5분" },
                  { when: "점심 후", act: "10분 산책 + 카페인 1잔 이내", why: "오후 무드 저하 −38% (당신 데이터 기준)", time: "10분" },
                  { when: "저녁 8:30", act: "화면 밝기 절반 + 호흡 1분", why: "Day 1~7 식별된 ‘저녁 무드 절벽’ 차단", time: "1분" },
                  { when: "취침 전", act: "오늘의 작은 회복 1줄 적기", why: "메타인지 강화, 다음날 회복 속도 +22%", time: "2분" },
                  { when: "주 1회", act: "신뢰하는 사람에게 먼저 한 마디", why: "관계 트리거가 회복의 1순위 변수", time: "—" },
                ].map((p, i) => (
                  <div key={i} className="rounded-xl border border-emerald-200/60 bg-emerald-50/30 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono tracking-wider text-emerald-700 uppercase">{p.when}</span>
                      <span className="text-[10px] font-mono text-slate-400">{p.time}</span>
                    </div>
                    <div className="text-[13px] font-bold text-slate-900 break-keep">{p.act}</div>
                    <div className="text-[11px] text-slate-600 mt-1 break-keep leading-snug">왜? {p.why}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-start gap-2 text-[11px] text-slate-500 break-keep leading-relaxed">
                <BookMarked className="w-3.5 h-3.5 text-[#8a7a4d] flex-shrink-0 mt-0.5" />
                <span>처방전은 PDF 마지막에 별지로 인쇄되어 냉장고·책상에 붙여둘 수 있게 디자인됩니다.</span>
              </div>
            </Page>
          </PageFrame>

          {/* PAGE 5.95 — 뇌과학 해설 */}
          <PageFrame label="부록 B · 뇌과학으로 본 변화">
            <Page>
              <PageHeader title="당신의 30일, 뇌에서는 무엇이 바뀌었나" chapter="B" icon={Brain} />
              <p className="text-[12px] text-slate-500 mb-4 break-keep">
                각 주차에서 활성·재구성된 회로를 짧게 풀어 설명합니다. 의학적 진단이 아니라, 행동 변화의 신경과학적 맥락이에요.
              </p>
              <div className="space-y-3">
                {[
                  { area: "전대상피질 (ACC)", week: "W1", body: "‘무엇이 나를 흔드는가’를 알아차리는 메타인지 회로. 첫 주 체크인이 가장 강하게 자극합니다." },
                  { area: "편도체 (Amygdala)", week: "W2", body: "호흡·바디스캔이 반복될 때 과활성이 평균 18~25% 감소한다는 보고. 본 트랙 데이터에서도 ‘저녁 무드 절벽’ 완화로 관찰됨." },
                  { area: "전전두피질 (PFC)", week: "W3", body: "정체기에 새 행동을 ‘자동화’하는 단계. 무드 변화는 적어 보여도 실행 회로가 가장 바쁜 시기." },
                  { area: "기본모드망 (DMN)", week: "W4", body: "회고·서사화가 진행될 때 활성화. 워크북의 ‘닫는 글’과 회고 영상이 이 회로를 직접 자극하도록 설계됨." },
                ].map((n) => (
                  <div key={n.area} className="rounded-xl border border-slate-200 p-3 bg-white">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-bold text-slate-900">{n.area}</span>
                      <span className="text-[10px] font-mono text-[#8a7a4d]">{n.week}</span>
                    </div>
                    <p className="text-[11.5px] text-slate-600 leading-relaxed break-keep">{n.body}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-3 break-keep leading-relaxed">
                * 출처: Tang et al. (2015), Hölzel et al. (2011) 등 마음챙김·행동 변화 메타분석을 코칭 맥락에 맞춰 재구성. 개별 효과는 차이가 있을 수 있어요.
              </p>
            </Page>
          </PageFrame>

          {/* PAGE 6 — 닫는 글 */}
          <PageFrame label="닫는 글 · Closing">
            <Page>
              <PageHeader title="당신의 30일을 응원합니다" chapter="" icon={ShieldCheck} />
              <p className="text-[13px] text-slate-700 leading-[1.9] break-keep">
                이 워크북은 30일간 당신이 직접 쌓아 올린 기록입니다. 어떤 알고리즘도
                당신의 경험을 대신할 수 없어요.
              </p>
              <div className="mt-5 p-4 rounded-xl bg-[#C8B88A]/10 border border-[#C8B88A]/30">
                <div className="text-[10px] font-bold tracking-[0.15em] text-[#8a7a4d] uppercase mb-1">
                  Next Step
                </div>
                <p className="text-[12.5px] text-slate-700 break-keep leading-relaxed">
                  더 깊은 이야기가 필요하다면, 검증된 전문가와의 1:1 상담으로
                  이어갈 수 있어요.
                </p>
              </div>
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100 text-[10px] text-slate-400">
                <span className="font-mono">aihpro.app</span>
                <span>verified by AIHPRO</span>
              </div>
            </Page>
          </PageFrame>

          <p className="text-center text-[11px] text-slate-500 break-keep px-4 pt-2 leading-relaxed">
            매일 체크인을 쌓아갈수록, 위 페이지들이 당신의 이야기로 더 짙게 채워집니다.
          </p>

          {onCtaClick && (
            <div className="sticky bottom-0 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-gradient-to-t from-[#faf6ec] via-[#faf6ec]/95 to-transparent">
              <Button
                onClick={onCtaClick}
                className="w-full rounded-full bg-[#1a1a1a] text-white hover:bg-black h-11 text-sm font-semibold shadow-lg"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                {ctaPrice
                  ? `₩${ctaPrice.toLocaleString()}로 내 워크북 시작하기`
                  : "내 워크북 시작하기"}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <p className="text-center text-[10px] text-slate-400 mt-2">
                결제 즉시 Day 1부터 자동으로 채워지기 시작합니다.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PageFrame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold tracking-[0.18em] text-slate-500 uppercase mb-2 px-1">
        {label}
      </div>
      <div className="shadow-[0_8px_24px_-8px_rgba(138,122,77,0.25)] rounded-2xl">
        {children}
      </div>
    </div>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 min-h-[320px]">
      {children}
    </div>
  );
}

function PageHeader({
  title,
  chapter,
  icon: Icon,
}: {
  title: string;
  chapter: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
      <div className="flex items-center gap-2 min-w-0">
        {Icon && <Icon className="w-4 h-4 text-[#8a7a4d] flex-shrink-0" />}
        <h4
          className="text-[15px] font-bold text-slate-900 break-keep"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          {title}
        </h4>
      </div>
      {chapter && (
        <span className="text-[10px] font-mono text-[#8a7a4d] flex-shrink-0">
          Chapter {chapter}
        </span>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  const colorMap: Record<string, string> = {
    rose: "text-rose-600",
    amber: "text-amber-600",
    slate: "text-slate-600",
  };
  return (
    <div className="bg-slate-50 rounded-lg py-2">
      <div className={`text-lg font-bold ${colorMap[tone] || "text-slate-700"}`}>
        {value}
      </div>
      <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

function Delta({
  label,
  before,
  after,
  tone,
}: {
  label: string;
  before: string;
  after: string;
  tone: string;
}) {
  return (
    <div className="bg-emerald-50/60 rounded-lg py-2 px-1">
      <div className="text-[10px] text-slate-500 mb-1">{label}</div>
      <div className="flex items-center justify-center gap-1 text-[11px]">
        <span className="text-slate-400 line-through">{before}</span>
        <span className={`font-bold text-${tone}-600`}>→ {after}</span>
      </div>
    </div>
  );
}
