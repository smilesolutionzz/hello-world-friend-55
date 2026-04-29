import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BookOpen, TrendingUp, FileText, Quote, Lightbulb, ShieldCheck } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  nickname?: string;
  trackTheme?: string;
}

/**
 * 30일 완주 시 받게 될 워크북 PDF의 샘플 6장 미리보기.
 * 책 페이지 메타포로 "이런 결과물이 손에 남는다"를 보여줘서 동기부여.
 */
export default function WorkbookSamplePreviewModal({
  open,
  onOpenChange,
  nickname = "당신",
  trackTheme,
}: Props) {
  const sampleTheme = trackTheme || "스트레스 회복과 회복탄력성 강화";

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
            아래는 샘플입니다. 실제로는 당신의 30일 데이터로 채워집니다.
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
                  Vol. 01 · 30 Days
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
                <div className="text-sm text-slate-700 break-keep">
                  {sampleTheme}
                </div>
              </div>

              <div className="text-center text-[11px] text-slate-500 mb-4">
                <div className="font-bold text-slate-700">{nickname}</div>
                <div className="mt-1">2026.04.01 — 2026.04.30</div>
              </div>
            </div>
          </PageFrame>

          {/* PAGE 2 — 여는 글 */}
          <PageFrame label="여는 글 · Opening">
            <Page>
              <PageHeader title="30일 전, 당신이 원했던 것" chapter="00" />
              <p className="text-[13px] text-slate-700 leading-[1.9] break-keep">
                "요즘 마음이 너무 무거워요. 매일 아침이 두렵고, 작은 일에도 쉽게
                지쳐요. 다시 나답게 살고 싶어요."
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-[10px] font-bold tracking-[0.15em] text-[#8a7a4d] uppercase mb-2">
                  Baseline · 시작점
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <Stat label="스트레스" value="78" tone="rose" />
                  <Stat label="에너지" value="32" tone="amber" />
                  <Stat label="명료도" value="41" tone="slate" />
                </div>
              </div>
            </Page>
          </PageFrame>

          {/* PAGE 3 — 마음 변화 그래프 */}
          <PageFrame label="1장 · 마음 변화 그래프">
            <Page>
              <PageHeader title="30일간 마음의 흐름" chapter="01" icon={TrendingUp} />
              <p className="text-[12px] text-slate-500 mb-4 break-keep">
                매일 체크인 데이터를 바탕으로 그린 당신의 회복 곡선
              </p>

              {/* 가짜 라인차트 */}
              <div className="h-32 relative bg-gradient-to-b from-[#fbf7eb] to-white rounded-xl p-3 border border-[#C8B88A]/20">
                <svg viewBox="0 0 300 100" className="w-full h-full">
                  <path
                    d="M0,80 Q40,75 60,68 T120,55 T180,42 T240,30 T300,22"
                    stroke="#8a7a4d"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M0,80 Q40,75 60,68 T120,55 T180,42 T240,30 T300,22 L300,100 L0,100 Z"
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
                <Delta label="스트레스" before="78" after="42" tone="emerald" />
                <Delta label="에너지" before="32" after="68" tone="emerald" />
                <Delta label="명료도" before="41" after="74" tone="emerald" />
              </div>
            </Page>
          </PageFrame>

          {/* PAGE 4 — 30일의 기록 */}
          <PageFrame label="2장 · 30일의 기록">
            <Page>
              <PageHeader title="당신이 남긴 말들" chapter="02" icon={Quote} />
              <div className="space-y-3">
                {[
                  { day: 3, mood: 4, text: "오늘은 처음으로 산책을 5분 했다. 햇빛이 따뜻했다." },
                  { day: 12, mood: 6, text: "어제보다 30분 일찍 잠들었다. 작은 변화가 쌓이는 게 보인다." },
                  { day: 21, mood: 7, text: "오랜만에 친구에게 먼저 연락했다. 무겁지 않았다." },
                ].map((c) => (
                  <div key={c.day} className="border-l-2 border-[#C8B88A]/50 pl-3">
                    <div className="text-[10px] font-mono text-slate-400">
                      Day {c.day} · 무드 {c.mood}/10
                    </div>
                    <p className="text-[12.5px] text-slate-700 mt-1 break-keep leading-relaxed">
                      "{c.text}"
                    </p>
                  </div>
                ))}
                <div className="text-[10px] text-slate-400 text-center pt-2">
                  ··· 27개의 기록이 더 이어집니다 ···
                </div>
              </div>
            </Page>
          </PageFrame>

          {/* PAGE 5 — 핵심 인사이트 */}
          <PageFrame label="4장 · 핵심 인사이트">
            <Page>
              <PageHeader title="30일이 알려준 것" chapter="04" icon={Lightbulb} />
              <div className="space-y-4">
                {[
                  {
                    title: "성장 패턴",
                    body: "주중보다 주말에 무드 점수가 안정적이며, 사람과의 짧은 접촉이 회복의 핵심 트리거였습니다.",
                  },
                  {
                    title: "발견한 자기이해",
                    body: "스트레스 신호를 신체 감각(어깨 긴장, 얕은 호흡)으로 먼저 알아차리는 능력이 생겼습니다.",
                  },
                  {
                    title: "다음 30일을 위한 제안",
                    body: "주 2회 30분 산책 + 주 1회 신뢰하는 사람과의 대화를 루틴화하기를 권합니다.",
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
            매일 체크인을 쌓아갈수록, 위 페이지들이 당신의 이야기로 채워집니다.
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
