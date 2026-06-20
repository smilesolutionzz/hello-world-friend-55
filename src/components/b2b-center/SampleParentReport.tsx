import { useEffect, useMemo, useState } from "react";
import { X, Download, Printer, Sparkles, TrendingUp, Heart, Target, MessageCircle, Calendar, Award, BookOpen, ChevronRight, Share2, Settings2, Check, Copy, Mail, MessageSquare, Pencil } from "lucide-react";
import { DEMO_SESSIONS, DEMO_THERAPISTS, DEMO_PROGRAMS } from "@/lib/b2bCenter/demoData";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  open: boolean;
  onClose: () => void;
  clientId?: string;
  clientName?: string;
  period?: string; // 표시용 (예: "2026년 4월")
  periodKey?: string; // 저장 키용 (예: "2026-04")
}

type SectionKey = "cover" | "summary" | "domains" | "highlights" | "note" | "practice" | "goals";
const ALL_SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "cover", label: "표지 / 요약 지표" },
  { key: "summary", label: "이번 달 한눈에" },
  { key: "domains", label: "영역별 발달 흐름" },
  { key: "highlights", label: "빛났던 순간" },
  { key: "note", label: "담당 치료사 노트" },
  { key: "practice", label: "가정 연습 제안" },
  { key: "goals", label: "다음 달 목표" },
];

interface ReportData {
  sections: Record<SectionKey, boolean>;
  stats: { participated: string; attendance: string; areas: string; therapist: string };
  summary: string;
  domains: { domain: string; prev: number; curr: number; delta: string; color: "emerald" | "amber"; note: string }[];
  highlights: { date: string; title: string; body: string }[];
  note: string;
  noteTherapist: { name: string; meta: string };
  practice: { title: string; desc: string; time: string }[];
  goals: { label: string; value: string }[];
  goalsFooter: string;
}

const DEFAULT_SECTIONS: Record<SectionKey, boolean> = {
  cover: true, summary: true, domains: true, highlights: true, note: true, practice: true, goals: true,
};

function buildDefault(clientName: string, sessions: typeof DEMO_SESSIONS, periodKey: string): ReportData {
  const completed = sessions.filter((s) => s.status === "completed");
  const total = sessions.length;
  const attendance = total ? Math.round((completed.length / total) * 100) : 100;
  const therapistIds = Array.from(new Set(sessions.map((s) => s.therapist_id)));
  const therapistName = therapistIds.map((id) => DEMO_THERAPISTS.find((t) => t.id === id)?.name).filter(Boolean).join(", ") || "—";
  const areas = Array.from(new Set(sessions.map((s) => DEMO_PROGRAMS.find((p) => p.id === s.program_id)?.category).filter(Boolean))).join("·") || "—";

  return {
    sections: { ...DEFAULT_SECTIONS },
    stats: {
      participated: completed.length ? `${completed.length}회` : "12회",
      attendance: total ? `${attendance}%` : "100%",
      areas: areas !== "—" ? areas : "언어·놀이",
      therapist: therapistName !== "—" ? therapistName : "김민지",
    },
    summary: `이번 달 ${clientName.split(" ")[0]} 어린이는 총 ${completed.length || 12}회기를 참여했고, 표현언어 영역에서 의미 있는 진전을 보였습니다. 자발 발화 길이가 3어절에서 4-5어절로 확장되었으며, 또래와의 협동 놀이에서 먼저 말을 거는 시도가 주 평균 8회 관찰되었습니다. 전이 상황에서의 저항이 일부 남아 있어, 다음 달에는 시각적 일정표를 활용한 예측가능성 훈련을 함께 진행할 예정입니다.`,
    domains: [
      { domain: "표현언어", prev: 62, curr: 74, delta: "+12", color: "emerald", note: "자발 발화 길이가 3어절에서 4-5어절로 확장" },
      { domain: "수용언어", prev: 70, curr: 76, delta: "+6", color: "emerald", note: "2단계 지시 따르기 정확도 안정화" },
      { domain: "사회적 상호작용", prev: 55, curr: 63, delta: "+8", color: "emerald", note: "또래 시작 발화 주 8회 관찰" },
      { domain: "정서 조절", prev: 58, curr: 56, delta: "-2", color: "amber", note: "전이 상황에서의 저항 지속 — 다음 달 중점 영역" },
    ],
    highlights: [
      { date: "1주차", title: "처음으로 친구에게 먼저 놀이를 제안했어요", body: "블록 영역에서 또래에게 자발적으로 다가가 놀이 제안을 했고, 5분간 협동 놀이가 이어졌습니다." },
      { date: "2주차", title: "감정 단어를 스스로 사용했어요", body: "퍼즐을 완성한 후 기쁨을 자발적으로 표현했습니다. 처음으로 감정 어휘가 자발적으로 나왔습니다." },
      { date: "3주차", title: "지시 따르기 정확도가 안정화되었어요", body: "2단계 지시를 5회 중 5회 모두 성공했습니다." },
      { date: "4주차", title: "역할놀이에서 주도성을 보였어요", body: "역할을 자발적으로 선택하고, 치료사에게 역할을 지정해주는 모습이 관찰되었습니다." },
    ],
    note: "이번 달 자기 표현의 폭이 눈에 띄게 넓어졌습니다. 관계 단어를 자발적으로 사용하기 시작한 것은 사회성 발달의 중요한 신호입니다. 가정에서도 말을 시작할 때 충분히 기다려주시고, 완성된 문장을 반복해서 들려주시면 문장 길이가 더 빠르게 늘 거예요. 전이 상황의 어려움은 흔한 발달 과정의 일부이니, 다음 활동을 미리 알려주는 작은 루틴을 함께 만들어가요.",
    noteTherapist: { name: `${therapistName.split(",")[0] || "김민지"} 치료사`, meta: "담당 치료사" },
    practice: [
      { title: "식사 시간 열린 질문 놀이", desc: "하루 한 끼 식사에서 누가/무엇/어디 질문을 3-5회 던져주세요. 답을 못해도 괜찮습니다.", time: "5분/회" },
      { title: "전이 카드 만들기", desc: "다음 활동을 그림으로 보여주는 카드 3장(놀이 → 정리 → 간식)을 만들어 보여주세요.", time: "준비 10분, 매일" },
      { title: "잠자기 전 한 문장 말하기", desc: "오늘 가장 좋았던 일을 한 문장으로 말해보세요. 부모님이 먼저 시범을 보여주세요.", time: "3분/회" },
    ],
    goals: [
      { label: "주요 목표", value: "전이 상황 자기조절" },
      { label: "회기 횟수", value: "12회 (주 3회)" },
      { label: "재평가 일정", value: "다음 달 말" },
    ],
    goalsFooter: "다음 달 첫 회기에 보호자 면담 10분을 함께 진행합니다.",
  };
}

const storageKey = (clientId: string, periodKey: string) => `parent-report:${clientId}:${periodKey}`;

export default function SampleParentReport({ open, onClose, clientId = "demo", clientName = "민준 (5세)", period = "2026년 4월", periodKey }: Props) {
  const pk = periodKey || period;
  const sessions = useMemo(() => DEMO_SESSIONS.filter((s) => s.client_id === clientId), [clientId]);

  const [data, setData] = useState<ReportData>(() => buildDefault(clientName, sessions, pk));
  const [centerName, setCenterName] = useState<string>("");

  const [editMode, setEditMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // Load saved state when key changes. Priority: DB ai_draft_json (monthly_v1) > localStorage > default.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      // 1) Try DB monthly report for this client + period
      const periodStart = /^\d{4}-\d{2}$/.test(pk) ? `${pk}-01` : null;
      if (periodStart && clientId && clientId !== "demo" && clientId !== "c1") {
        const { data } = await supabase
          .from("center_parent_reports")
          .select("ai_draft_json, center_id")
          .eq("client_id", clientId)
          .eq("period_type", "monthly")
          .eq("period_start", periodStart)
          .maybeSingle();
        const draft: any = data?.ai_draft_json;
        // Resolve real center name (draft.center_name preferred; fallback to org lookup)
        let resolvedCenterName = draft?.center_name as string | undefined;
        if (!resolvedCenterName && data?.center_id) {
          const { data: org } = await supabase
            .from("center_organizations")
            .select("name")
            .eq("id", data.center_id)
            .maybeSingle();
          resolvedCenterName = org?.name ?? "";
        }
        if (!cancelled && resolvedCenterName) setCenterName(resolvedCenterName);
        if (!cancelled && draft && draft.schema === "monthly_v1") {
          setData({ ...buildDefault(clientName, sessions, pk), ...draft });
          return;
        }
      }

      // 2) Local edits
      try {
        const raw = localStorage.getItem(storageKey(clientId, pk));
        if (!cancelled) {
          if (raw) setData({ ...buildDefault(clientName, sessions, pk), ...JSON.parse(raw) });
          else setData(buildDefault(clientName, sessions, pk));
        }
      } catch {
        if (!cancelled) setData(buildDefault(clientName, sessions, pk));
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line
  }, [open, clientId, pk]);

  const save = (next: ReportData) => {
    setData(next);
    try { localStorage.setItem(storageKey(clientId, pk), JSON.stringify(next)); } catch {}
  };

  const update = (patch: Partial<ReportData>) => save({ ...data, ...patch });

  const toggleSection = (k: SectionKey) => update({ sections: { ...data.sections, [k]: !data.sections[k] } });

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const u = new URL(window.location.href);
    u.searchParams.set("report", clientId);
    u.searchParams.set("period", pk);
    return u.toString();
  }, [clientId, pk]);

  const shareSubject = `[월간 부모 리포트] ${clientName} · ${period}`;
  const shareBody = `${clientName} 보호자께\n\n${period} 월간 리포트가 발행되었습니다. 아래 링크에서 확인해주세요.\n\n${shareUrl}`;

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl); toast({ title: "링크가 복사되었어요" }); }
    catch { toast({ title: "복사 실패", variant: "destructive" }); }
  };

  if (!open) return null;

  const S = data.sections;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <div className="bg-[#FAF7F0] rounded-3xl w-full max-w-4xl shadow-2xl my-4 overflow-hidden">
        {/* Toolbar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-neutral-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-neutral-600 min-w-0">
            <Sparkles className="w-4 h-4 text-[#C8B88A] shrink-0" />
            <span className="font-medium text-neutral-800 truncate">월간 부모 리포트</span>
            {editMode && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">편집 중</span>}
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <button onClick={() => setEditMode((v) => !v)} className={`px-3 py-1.5 text-xs rounded-full inline-flex items-center gap-1.5 ${editMode ? "bg-neutral-900 text-white" : "hover:bg-neutral-100 text-neutral-700"}`}>
              {editMode ? <><Check className="w-3.5 h-3.5" /> 저장 완료</> : <><Pencil className="w-3.5 h-3.5" /> 편집</>}
            </button>
            <button onClick={() => setShowSettings((v) => !v)} className="px-3 py-1.5 text-xs rounded-full hover:bg-neutral-100 inline-flex items-center gap-1.5 text-neutral-700"><Settings2 className="w-3.5 h-3.5" /> 섹션</button>
            <button onClick={() => setShowShare(true)} className="px-3 py-1.5 text-xs rounded-full bg-[#C8B88A] text-white inline-flex items-center gap-1.5 hover:bg-[#b8a87a]"><Share2 className="w-3.5 h-3.5" /> 보호자에게 보내기</button>
            <button onClick={() => window.print()} className="hidden sm:inline-flex px-3 py-1.5 text-xs rounded-full hover:bg-neutral-100 items-center gap-1.5 text-neutral-700"><Printer className="w-3.5 h-3.5" /> 인쇄</button>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-neutral-100"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Section settings drawer */}
        {showSettings && (
          <div className="bg-white border-b border-neutral-200 px-6 py-4">
            <div className="text-xs text-neutral-500 mb-3">포함할 섹션을 선택하세요. 선택한 섹션만 보호자에게 발행됩니다.</div>
            <div className="flex flex-wrap gap-2">
              {ALL_SECTIONS.map((s) => (
                <button key={s.key} onClick={() => toggleSection(s.key)} className={`px-3 py-1.5 rounded-full text-xs border inline-flex items-center gap-1.5 ${S[s.key] ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-600 border-neutral-200"}`}>
                  {S[s.key] && <Check className="w-3 h-3" />} {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Report body */}
        <div className="px-6 sm:px-14 py-12 space-y-12">

          {S.cover && (
            <header className="border-b border-[#C8B88A]/40 pb-10">
              <div className="flex items-center gap-2 text-[11px] tracking-[0.3em] text-[#C8B88A] uppercase mb-6">
                <span className="w-8 h-px bg-[#C8B88A]" /> Monthly Parent Report
              </div>
              <h1 className="text-4xl sm:text-5xl font-serif text-neutral-900 leading-tight mb-3">{clientName} 보호자께</h1>
              <p className="text-lg text-neutral-600">{period}{centerName ? ` · ${centerName}` : ""}</p>
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "참여 회기", key: "participated" as const },
                  { label: "출석률", key: "attendance" as const },
                  { label: "치료 영역", key: "areas" as const },
                  { label: "담당 치료사", key: "therapist" as const },
                ].map((s) => (
                  <div key={s.key} className="bg-white rounded-2xl p-4 border border-neutral-200">
                    <div className="text-[11px] text-neutral-500 uppercase tracking-wider">{s.label}</div>
                    <Editable as="div" className="text-lg font-semibold text-neutral-900 mt-1" editable={editMode}
                      value={data.stats[s.key]} onChange={(v) => update({ stats: { ...data.stats, [s.key]: v } })} />
                  </div>
                ))}
              </div>
            </header>
          )}

          {S.summary && (
            <section>
              <SectionLabel num="01" title="이번 달 한눈에" />
              <div className="bg-white rounded-3xl p-8 border border-neutral-200">
                <Editable as="p" className="text-neutral-800 leading-relaxed text-[15px] whitespace-pre-wrap" editable={editMode}
                  value={data.summary} onChange={(v) => update({ summary: v })} />
              </div>
            </section>
          )}

          {S.domains && (
            <section>
              <SectionLabel num="02" title="영역별 발달 흐름" />
              <div className="space-y-3">
                {data.domains.map((row, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-5 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF6E8] flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5 text-[#9B8B5A]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-3">
                        <Editable as="div" className="font-semibold text-neutral-900" editable={editMode}
                          value={row.domain} onChange={(v) => { const d = [...data.domains]; d[i] = { ...d[i], domain: v }; update({ domains: d }); }} />
                        <Editable as="div" className={`text-sm font-semibold ${row.color === "emerald" ? "text-emerald-600" : "text-amber-600"}`} editable={editMode}
                          value={row.delta} onChange={(v) => { const d = [...data.domains]; d[i] = { ...d[i], delta: v }; update({ domains: d }); }} />
                      </div>
                      <div className="mt-2 h-2 bg-neutral-100 rounded-full overflow-hidden relative">
                        <div className="absolute inset-y-0 left-0 bg-neutral-300 rounded-full" style={{ width: `${row.prev}%` }} />
                        <div className={`absolute inset-y-0 left-0 rounded-full ${row.color === "emerald" ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${row.curr}%` }} />
                      </div>
                      <Editable as="div" className="mt-2 text-xs text-neutral-500" editable={editMode}
                        value={row.note} onChange={(v) => { const d = [...data.domains]; d[i] = { ...d[i], note: v }; update({ domains: d }); }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-neutral-400 mt-3 px-1">* 막대는 이번 달 도달 수준이며, 회색은 지난달 기준치입니다. 표준화 점수가 아닌 센터 내부 관찰 척도(0-100)입니다.</p>
            </section>
          )}

          {S.highlights && (
            <section>
              <SectionLabel num="03" title="이번 달 빛났던 순간" />
              <div className="grid sm:grid-cols-2 gap-4">
                {data.highlights.map((m, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-5">
                    <div className="flex items-center gap-2 text-[11px] text-[#C8B88A] uppercase tracking-wider mb-2">
                      <Calendar className="w-3 h-3" />
                      <Editable as="span" editable={editMode} value={m.date}
                        onChange={(v) => { const h = [...data.highlights]; h[i] = { ...h[i], date: v }; update({ highlights: h }); }} />
                    </div>
                    <Editable as="div" className="font-semibold text-neutral-900 leading-snug mb-2" editable={editMode}
                      value={m.title} onChange={(v) => { const h = [...data.highlights]; h[i] = { ...h[i], title: v }; update({ highlights: h }); }} />
                    <Editable as="p" className="text-sm text-neutral-600 leading-relaxed" editable={editMode}
                      value={m.body} onChange={(v) => { const h = [...data.highlights]; h[i] = { ...h[i], body: v }; update({ highlights: h }); }} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {S.note && (
            <section>
              <SectionLabel num="04" title="담당 치료사 노트" />
              <div className="bg-gradient-to-br from-[#FAF6E8] to-white rounded-3xl p-8 border border-[#C8B88A]/40 relative">
                <Editable as="p" className="text-neutral-800 leading-relaxed text-[15px] italic whitespace-pre-wrap" editable={editMode}
                  value={data.note} onChange={(v) => update({ note: v })} />
                <div className="mt-6 flex items-center gap-3 pt-6 border-t border-[#C8B88A]/30">
                  <div className="w-10 h-10 rounded-full bg-[#FFB4A2] flex items-center justify-center text-white font-semibold">{data.noteTherapist.name.charAt(0)}</div>
                  <div>
                    <Editable as="div" className="font-semibold text-neutral-900 text-sm" editable={editMode}
                      value={data.noteTherapist.name} onChange={(v) => update({ noteTherapist: { ...data.noteTherapist, name: v } })} />
                    <Editable as="div" className="text-xs text-neutral-500" editable={editMode}
                      value={data.noteTherapist.meta} onChange={(v) => update({ noteTherapist: { ...data.noteTherapist, meta: v } })} />
                  </div>
                </div>
              </div>
            </section>
          )}

          {S.practice && (
            <section>
              <SectionLabel num="05" title="이번 달 가정 연습 제안" />
              <div className="space-y-3">
                {data.practice.map((p, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-5 flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-neutral-900 text-white text-sm font-semibold flex items-center justify-center shrink-0">{i + 1}</div>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between gap-3 mb-1">
                        <Editable as="div" className="font-semibold text-neutral-900" editable={editMode}
                          value={p.title} onChange={(v) => { const a = [...data.practice]; a[i] = { ...a[i], title: v }; update({ practice: a }); }} />
                        <Editable as="div" className="text-[11px] text-[#C8B88A] uppercase tracking-wider shrink-0" editable={editMode}
                          value={p.time} onChange={(v) => { const a = [...data.practice]; a[i] = { ...a[i], time: v }; update({ practice: a }); }} />
                      </div>
                      <Editable as="p" className="text-sm text-neutral-600 leading-relaxed" editable={editMode}
                        value={p.desc} onChange={(v) => { const a = [...data.practice]; a[i] = { ...a[i], desc: v }; update({ practice: a }); }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {S.goals && (
            <section>
              <SectionLabel num="06" title="다음 달 목표" />
              <div className="bg-neutral-900 text-white rounded-3xl p-8">
                <div className="flex items-center gap-2 text-[11px] tracking-[0.3em] text-[#C8B88A] uppercase mb-4">
                  <Award className="w-3.5 h-3.5" /> Next Month Focus
                </div>
                <div className="grid sm:grid-cols-3 gap-6">
                  {data.goals.map((g, i) => (
                    <div key={i}>
                      <Editable as="div" className="text-[11px] text-neutral-400 uppercase tracking-wider mb-1" editable={editMode}
                        value={g.label} onChange={(v) => { const a = [...data.goals]; a[i] = { ...a[i], label: v }; update({ goals: a }); }} />
                      <Editable as="div" className="text-lg font-semibold" editable={editMode}
                        value={g.value} onChange={(v) => { const a = [...data.goals]; a[i] = { ...a[i], value: v }; update({ goals: a }); }} />
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-sm gap-3">
                  <Editable as="span" className="text-neutral-300 flex-1" editable={editMode}
                    value={data.goalsFooter} onChange={(v) => update({ goalsFooter: v })} />
                  <ChevronRight className="w-4 h-4 text-[#C8B88A] shrink-0" />
                </div>
              </div>
            </section>
          )}

          <footer className="pt-8 border-t border-neutral-200 text-[11px] text-neutral-500 leading-relaxed">
            <p className="mb-2"><strong className="text-neutral-700">고지사항.</strong> 본 리포트는 발달 코칭 및 의사결정 지원 목적의 관찰 기록이며, 의학적 진단이나 치료 처방이 아닙니다.</p>
            <div className="flex items-center justify-between mt-4">
              <span>{centerName || "발달치료센터"} · AIHPRO B2B Center로 발행</span>
              <span>{new Date().toLocaleDateString("ko-KR")}</span>
            </div>
          </footer>
        </div>
      </div>

      {/* Share modal */}
      {showShare && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowShare(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">보호자에게 리포트 보내기</h3>
              <button onClick={() => setShowShare(false)} className="p-1 rounded-full hover:bg-neutral-100"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-neutral-500 mb-4">선택한 섹션만 포함된 리포트 링크를 보호자에게 전달합니다.</p>
            <div className="bg-neutral-50 rounded-lg p-3 text-xs text-neutral-600 break-all mb-4 border border-neutral-200">{shareUrl}</div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={copyLink} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs text-neutral-700"><Copy className="w-4 h-4" /> 링크 복사</button>
              <a href={`mailto:?subject=${encodeURIComponent(shareSubject)}&body=${encodeURIComponent(shareBody)}`} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs text-neutral-700"><Mail className="w-4 h-4" /> 이메일</a>
              <a href={`sms:?&body=${encodeURIComponent(shareBody)}`} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs text-neutral-700"><MessageSquare className="w-4 h-4" /> 문자</a>
            </div>
            <p className="text-[11px] text-neutral-400 mt-4 leading-relaxed">기기에 설치된 메일/문자 앱으로 열립니다. 보호자 연락처가 등록되어 있으면 자동으로 채워집니다.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-baseline gap-4 mb-5">
      <div className="text-[11px] font-mono text-[#C8B88A] tracking-[0.3em]">{num}</div>
      <h2 className="text-xl font-serif text-neutral-900">{title}</h2>
      <div className="flex-1 h-px bg-neutral-200" />
    </div>
  );
}

/** 인라인 편집 가능한 텍스트. editable=true일 때만 contentEditable 활성화. */
function Editable({ as: Tag = "div", editable, value, onChange, className = "" }: {
  as?: any; editable: boolean; value: string; onChange: (v: string) => void; className?: string;
}) {
  return (
    <Tag
      className={`${className} ${editable ? "outline outline-2 outline-amber-200/60 outline-offset-2 rounded px-1 -mx-1 hover:outline-amber-400 focus:outline-amber-500" : ""}`}
      contentEditable={editable}
      suppressContentEditableWarning
      onBlur={(e: any) => { const v = e.currentTarget.innerText; if (v !== value) onChange(v); }}
    >
      {value}
    </Tag>
  );
}
