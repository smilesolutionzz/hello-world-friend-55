import { useMemo } from "react";
import { Sparkles, TrendingUp, Calendar, Award, ChevronRight } from "lucide-react";
import WhitelabelHeader from "@/components/b2b-center/WhitelabelHeader";

interface ReportRow {
  id: string;
  client_name: string;
  center_name: string | null;
  period_start: string;
  period_end: string;
  period_type: string;
  period_yyyymm: string | null;
  title: string | null;
  status: string;
  ai_summary: string | null;
  ai_draft_json: any;
  edited_html: string | null;
  html_content: string | null;
  metrics: any;
  coach_comment: string | null;
  center_branding?: any;
}

interface StatBlock { participated: string; attendance: string; areas: string; therapist: string }
interface DomainRow { domain: string; prev: number; curr: number; delta: string; color: "emerald" | "amber"; note: string }
interface HighlightRow { date: string; title: string; body: string }
interface PracticeRow { title: string; desc: string; time: string }

function cleanObjectText(text: string): string {
  return text.replace(/\[object Object\]/g, "").replace(/\s{2,}/g, " ").trim();
}

function safeText(value: any, depth = 0): string {
  if (value == null || depth > 5) return "";
  if (typeof value === "string") return cleanObjectText(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return cleanObjectText(value.map((item) => safeText(item, depth + 1)).filter(Boolean).join(" · "));
  if (typeof value === "object") {
    const preferred = ["title", "label", "name", "text", "body", "desc", "description", "value", "summary", "note", "content"];
    for (const key of preferred) {
      const resolved = safeText(value[key], depth + 1);
      if (resolved) return resolved;
    }
    const values = Object.values(value).map((item) => safeText(item, depth + 1)).filter(Boolean);
    return cleanObjectText(values.join(" · "));
  }
  return "";
}

function defaultStats(): StatBlock { return { participated: "12회", attendance: "100%", areas: "언어·놀이", therapist: "담당 치료사" }; }
function defaultDomains(): DomainRow[] {
  return [
    { domain: "표현언어", prev: 62, curr: 74, delta: "+12", color: "emerald", note: "자발 발화 길이가 3어절에서 4-5어절로 확장" },
    { domain: "수용언어", prev: 70, curr: 76, delta: "+6", color: "emerald", note: "2단계 지시 따르기 정확도 안정화" },
    { domain: "사회적 상호작용", prev: 55, curr: 63, delta: "+8", color: "emerald", note: "또래 시작 발화 주 8회 관찰" },
    { domain: "정서 조절", prev: 58, curr: 56, delta: "-2", color: "amber", note: "전이 상황에서의 저항 지속 — 다음 달 중점 영역" },
  ];
}

export default function MobileParentReport({ report }: { report: ReportRow }) {
  const periodLabel = useMemo(() => {
    const [y, m] = (report.period_yyyymm || report.period_start.slice(0, 7)).split("-");
    return `${y}년 ${Number(m)}월`;
  }, [report]);

  const draft = report.ai_draft_json || {};
  const metrics = report.metrics || {};

  const stats: StatBlock = {
    participated: safeText(metrics.participated) || safeText(draft.stats?.participated) || defaultStats().participated,
    attendance: safeText(metrics.attendance) || safeText(draft.stats?.attendance) || defaultStats().attendance,
    areas: safeText(metrics.areas) || safeText(draft.stats?.areas) || defaultStats().areas,
    therapist: safeText(metrics.therapist) || safeText(draft.stats?.therapist) || defaultStats().therapist,
  };

  const summary: string = safeText(draft.summary) || safeText(report.ai_summary) || `이번 달 ${report.client_name} 어린이의 발달 흐름을 정리한 리포트입니다.`;
  const domains: DomainRow[] = Array.isArray(draft.domains) && draft.domains.length ? draft.domains : defaultDomains();
  const highlights: HighlightRow[] = Array.isArray(draft.highlights) ? draft.highlights : [];
  const note: string = safeText(draft.note) || safeText(report.coach_comment) || "";
  const noteTherapist = draft.noteTherapist || { name: stats.therapist, meta: "담당 치료사" };
  const practice: PracticeRow[] = Array.isArray(draft.practice) ? draft.practice : [];
  const goals: { label: string; value: string }[] = Array.isArray(draft.goals) ? draft.goals : [];
  const goalsFooter: string = safeText(draft.goalsFooter);

  // Whitelabel branding: prefer the snapshot embedded in the report draft (so old
  // reports keep their original brand), fall back to current center branding.
  const branding = draft.branding || report.center_branding || null;

  return (
    <div className="max-w-2xl mx-auto px-5 py-8 space-y-10">
      {/* Cover */}
      <header className="border-b border-[#C8B88A]/40 pb-8">
        {branding && (
          <WhitelabelHeader
            centerName={report.center_name}
            branding={branding}
            period={periodLabel}
            className="mb-5"
          />
        )}
        <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-[#C8B88A] uppercase mb-5">
          <span className="w-6 h-px bg-[#C8B88A]" /> Monthly Parent Report
        </div>
        <h1 className="text-[28px] font-serif text-neutral-900 leading-tight break-keep">{report.client_name} 보호자께</h1>
        <p className="text-sm text-neutral-600 mt-2">{periodLabel} · {report.center_name || "발달치료센터"}</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {[
            { label: "참여 회기", v: stats.participated },
            { label: "출석률", v: stats.attendance },
            { label: "치료 영역", v: stats.areas },
            { label: "담당 치료사", v: stats.therapist },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-neutral-200">
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider">{s.label}</div>
              <div className="text-[15px] font-semibold text-neutral-900 mt-1 break-keep">{s.v}</div>
            </div>
          ))}
        </div>
      </header>

      {/* 01 */}
      <Section num="01" title="이번 달 한눈에">
        <div className="bg-white rounded-3xl p-6 border border-neutral-200">
          <p className="text-[14px] text-neutral-800 leading-[1.8] whitespace-pre-wrap break-keep">{summary}</p>
        </div>
      </Section>

      {/* 02 */}
      <Section num="02" title="영역별 발달 흐름">
        <div className="space-y-3">
          {domains.map((row, i) => (
            <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF6E8] flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-[#9B8B5A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="font-semibold text-neutral-900 text-[15px] break-keep">{safeText(row.domain)}</div>
                    <div className={`text-sm font-semibold ${row.color === "emerald" ? "text-emerald-600" : "text-amber-600"}`}>{safeText(row.delta)}</div>
                  </div>
                  <div className="mt-2 h-2 bg-neutral-100 rounded-full overflow-hidden relative">
                    <div className="absolute inset-y-0 left-0 bg-neutral-300 rounded-full" style={{ width: `${row.prev}%` }} />
                    <div className={`absolute inset-y-0 left-0 rounded-full ${row.color === "emerald" ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${row.curr}%` }} />
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[12px] text-neutral-500 leading-relaxed break-keep">{safeText(row.note)}</div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-neutral-400 mt-3 px-1 leading-relaxed">* 막대는 이번 달 도달 수준이며, 회색은 지난달 기준치입니다. 표준화 점수가 아닌 센터 내부 관찰 척도(0-100)입니다.</p>
      </Section>

      {/* 03 */}
      {highlights.length > 0 && (
        <Section num="03" title="이번 달 빛났던 순간">
          <div className="space-y-3">
            {highlights.map((m, i) => (
              <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-5">
                <div className="flex items-center gap-2 text-[10px] text-[#C8B88A] uppercase tracking-wider mb-2">
                  <Calendar className="w-3 h-3" />{safeText(m.date)}
                </div>
                <div className="font-semibold text-neutral-900 leading-snug mb-2 break-keep">{safeText(m.title) || safeText(m)}</div>
                <p className="text-[13px] text-neutral-600 leading-relaxed break-keep">{safeText(m.body)}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 04 */}
      {note && (
        <Section num="04" title="담당 치료사 노트">
          <div className="bg-gradient-to-br from-[#FAF6E8] to-white rounded-3xl p-6 border border-[#C8B88A]/40">
            <p className="text-[14px] text-neutral-800 leading-[1.8] italic whitespace-pre-wrap break-keep">{note}</p>
            <div className="mt-5 flex items-center gap-3 pt-5 border-t border-[#C8B88A]/30">
              <div className="w-10 h-10 rounded-full bg-[#FFB4A2] flex items-center justify-center text-white font-semibold">{safeText(noteTherapist.name).charAt(0) || "치"}</div>
              <div>
                <div className="font-semibold text-neutral-900 text-sm">{safeText(noteTherapist.name)}</div>
                <div className="text-xs text-neutral-500">{safeText(noteTherapist.meta)}</div>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* 05 */}
      {practice.length > 0 && (
        <Section num="05" title="이번 달 가정 연습 제안">
          <div className="space-y-3">
            {practice.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-5 flex gap-3">
                <div className="w-7 h-7 rounded-full bg-neutral-900 text-white text-xs font-semibold flex items-center justify-center shrink-0">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <div className="font-semibold text-neutral-900 text-[14px] break-keep">{safeText(p.title) || safeText(p)}</div>
                    <div className="text-[10px] text-[#C8B88A] uppercase tracking-wider shrink-0">{safeText(p.time)}</div>
                  </div>
                  <p className="text-[13px] text-neutral-600 leading-relaxed break-keep">{safeText(p.desc)}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 06 */}
      {goals.length > 0 && (
        <Section num="06" title="다음 달 목표">
          <div className="bg-neutral-900 text-white rounded-3xl p-6">
            <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-[#C8B88A] uppercase mb-4">
              <Award className="w-3.5 h-3.5" /> Next Month Focus
            </div>
            <div className="space-y-4">
              {goals.map((g, i) => (
                <div key={i}>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">{safeText(g.label) || `목표 ${i + 1}`}</div>
                  <div className="text-base font-semibold break-keep">{safeText(g.value) || safeText(g)}</div>
                </div>
              ))}
            </div>
            {goalsFooter && (
              <div className="mt-5 pt-5 border-t border-white/10 flex items-center justify-between text-sm gap-3">
                <span className="text-neutral-300 flex-1 text-[13px] break-keep">{safeText(goalsFooter)}</span>
                <ChevronRight className="w-4 h-4 text-[#C8B88A] shrink-0" />
              </div>
            )}
          </div>
        </Section>
      )}

      <footer className="pt-6 border-t border-neutral-200 text-[10px] text-neutral-500 leading-relaxed">
        <p className="mb-2"><strong className="text-neutral-700">고지사항.</strong> 본 리포트는 발달 코칭 및 의사결정 지원 목적의 관찰 기록이며, 의학적 진단이나 치료 처방이 아닙니다.</p>
        <div className="flex items-center justify-between mt-3">
          <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-[#C8B88A]" /> AIHPRO B2B Center</span>
          <span>{new Date().toLocaleDateString("ko-KR")}</span>
        </div>
      </footer>
    </div>
  );
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-baseline gap-3 mb-4">
        <div className="text-[10px] font-mono text-[#C8B88A] tracking-[0.3em]">{num}</div>
        <h2 className="text-lg font-serif text-neutral-900">{title}</h2>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>
      {children}
    </section>
  );
}
