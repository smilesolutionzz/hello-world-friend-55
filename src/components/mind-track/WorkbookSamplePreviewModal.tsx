import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, TrendingUp, FileText, Quote, Lightbulb, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

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
              ? `현재까지 ${totalCheckins}일치 데이터로 채워졌어요. 남은 ${Math.max(
                  0,
                  30 - currentDay
                )}일을 마저 채우면 한 권이 완성됩니다.`
              : "아래는 샘플입니다. 체크인이 쌓일수록 당신의 데이터로 자동 채워져요."}
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

          <p className="text-center text-[11px] text-slate-500 break-keep px-4 pt-2 pb-2 leading-relaxed">
            매일 체크인을 쌓아갈수록, 위 페이지들이 당신의 이야기로 더 짙게 채워집니다.
          </p>
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
