import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldCheck, Calendar, Download, TrendingUp, Heart, Target, BookOpen, Award, MessageCircle } from "lucide-react";
import MobileParentReport from "@/components/guardian-report/MobileParentReport";

type WeeklyDraft = {
  title?: string;
  greeting?: string;
  highlights?: any;
  activities_summary?: string;
  growth?: any;
  home_tips?: any;
  next_week_focus?: string;
};

type MonthlyDraft = {
  schema?: string;
  title?: string;
  stats?: { participated?: string; attendance?: string; areas?: string; therapist?: string };
  summary?: string;
  domains?: Array<{ domain?: string; prev?: number; curr?: number; delta?: string; color?: string; note?: string }>;
  highlights?: Array<{ date?: string; title?: string; body?: string } | string>;
  note?: string;
  noteTherapist?: { name?: string; meta?: string };
  practice?: Array<{ title?: string; desc?: string; time?: string } | string>;
  goals?: Array<{ label?: string; value?: string } | string>;
  goalsFooter?: string;
  center_name?: string;
};

// Defensive stringifier — never let [object Object] leak to the UI.
function s(v: any): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return v.map(s).filter(Boolean).join(" / ");
  if (typeof v === "object") {
    return (
      v.title || v.label || v.name || v.text || v.body || v.desc || v.value || v.summary || ""
    );
  }
  return "";
}

function asLines(v: any): string {
  if (!v) return "";
  if (Array.isArray(v)) return v.map((x) => `• ${s(x)}`).filter((l) => l !== "• ").join("\n");
  return s(v);
}

function weeklySections(d: WeeklyDraft) {
  return [
    { label: "보호자께 인사", value: s(d?.greeting) },
    { label: "이번 주 하이라이트", value: asLines(d?.highlights) },
    { label: "이번 주 활동 요약", value: s(d?.activities_summary) },
    { label: "관찰된 성장", value: asLines(d?.growth) },
    { label: "가정에서 해볼 활동", value: asLines(d?.home_tips) },
    { label: "다음 주 집중 방향", value: s(d?.next_week_focus) },
  ].filter((x) => x.value);
}

function findParentSession(resourceId: string): { token: string; shareToken: string } | null {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("aihpro_parent_session_")) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const v = JSON.parse(raw);
      if (v?.resource_id === resourceId && v?.parent_session_token) {
        return { token: v.parent_session_token, shareToken: key.replace("aihpro_parent_session_", "") };
      }
    }
  } catch { /* ignore */ }
  return null;
}

export default function ParentResourceViewPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const sess = findParentSession(id);
      if (!sess) {
        setError("세션이 만료되었어요. 받으신 링크를 다시 열어 인증해주세요.");
        setLoading(false);
        return;
      }
      try {
        const { data: res, error: err } = await supabase.functions.invoke("parent-resource-fetch", {
          body: { parent_session_token: sess.token, resource_id: id },
        });
        const code = (res as any)?.error;
        if (code) {
          const map: Record<string, string> = {
            invalid_session: "보호자 인증 세션이 만료되었어요. 받으신 링크를 다시 열어 인증해주세요.",
            session_expired: "보호자 인증 세션이 만료되었어요. 받으신 링크를 다시 열어 인증해주세요.",
            forbidden: "이 리포트에 접근할 권한이 없어요.",
            expired: "공유 링크가 만료되었어요. 치료사에게 새 링크를 요청해주세요.",
            not_published: "아직 발행되지 않은 리포트예요. 잠시 후 다시 시도해주세요.",
            session_lookup_failed: "리포트를 불러오는 중 일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
          };
          throw new Error(map[code] ?? `리포트를 불러올 수 없어요 (${code})`);
        }
        if (err) throw new Error("리포트를 불러오는 중 네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
        setData(res);
      } catch (e: any) {
        setError(e?.message ?? "리포트를 불러올 수 없어요");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const draft: any = data?.report?.ai_draft_json ?? {};
  const isMonthly =
    data?.resource_type === "parent_report" ||
    data?.report?.period_type === "monthly" ||
    draft?.schema === "monthly_v1" ||
    Array.isArray(draft?.domains);

  const wSections = useMemo(() => (!isMonthly ? weeklySections(draft) : []), [draft, isMonthly]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="w-4 h-4 animate-spin" /> 리포트 불러오는 중…
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-200 p-8 text-center space-y-3">
          <div className="text-base font-medium text-neutral-800">리포트를 열 수 없어요</div>
          <div className="text-sm text-neutral-500 break-keep">{error ?? "다시 시도해주세요."}</div>
          <Link to="/" className="inline-block mt-3 text-xs text-neutral-500 hover:text-neutral-900">홈으로</Link>
        </div>
      </div>
    );
  }

  const r = data.report;
  const m: MonthlyDraft = draft;

  if (isMonthly) {
    return (
      <div className="min-h-screen bg-neutral-50 pb-8">
        <div className="max-w-2xl mx-auto px-5 pt-6">
          <div className="flex items-center gap-2 mb-3 text-xs text-neutral-500">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C8B88A]" />
            본인 인증된 보호자 전용 화면
          </div>
        </div>
        <MobileParentReport
          report={{
            ...r,
            client_name: data.child_name || "이용자",
            center_name: data.center_name || m.center_name || null,
            period_yyyymm: r.period_start?.slice(0, 7) ?? null,
            ai_summary: null,
            edited_html: null,
            html_content: null,
            metrics: {},
            coach_comment: null,
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-4 text-xs text-neutral-500">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C8B88A]" />
          본인 인증된 보호자 전용 화면
        </div>

        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-7 md:p-9">
          <div className="mb-6 pb-5 border-b border-neutral-100">
            <p className="text-[11px] tracking-[0.2em] text-[#C8B88A] mb-2">
              {isMonthly ? "MONTHLY PARENT REPORT" : "WEEKLY THERAPY NOTE"}
            </p>
            <h1 className="text-xl md:text-2xl font-semibold text-neutral-900 break-keep">
              {s(m.title) || r.title || (isMonthly ? "월간 리포트" : "주간 치료노트")}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-neutral-500">
              {data.child_name && <span className="font-medium text-neutral-700">{data.child_name}</span>}
              {!isMonthly && r.week_key && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {r.week_key}
                </span>
              )}
              {isMonthly && r.period_start && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {r.period_start} ~ {r.period_end}
                </span>
              )}
              {r.published_at && (
                <span>발행 {new Date(r.published_at).toLocaleDateString("ko-KR")}</span>
              )}
              {(m.center_name || data.center_name) && <span>· {m.center_name || data.center_name}</span>}
            </div>
          </div>

          {isMonthly ? (
            <MonthlyView m={m} />
          ) : wSections.length === 0 ? (
            <div className="text-sm text-neutral-500 py-8 text-center">아직 표시할 내용이 없어요.</div>
          ) : (
            <div className="space-y-6">
              {wSections.map((sec, i) => (
                <div key={i}>
                  <div className="text-[11px] uppercase tracking-wider text-neutral-500 mb-1.5">{sec.label}</div>
                  <div className="text-[15px] leading-relaxed whitespace-pre-wrap text-neutral-800 break-keep">{sec.value}</div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 pt-5 border-t border-neutral-100 flex items-center justify-between">
            <div className="text-[11px] text-neutral-400">
              이 화면은 본인 인증된 보호자만 열람할 수 있어요.
            </div>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 text-xs hover:bg-neutral-50"
            >
              <Download className="w-3.5 h-3.5" /> 인쇄 / PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-neutral-50 border border-neutral-100 p-3">
      <div className="text-[10px] uppercase tracking-wider text-neutral-500">{label}</div>
      <div className="text-sm font-semibold text-neutral-900 mt-1 break-keep">{value || "—"}</div>
    </div>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: any; children: any }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-[#C8B88A]" />
      <h2 className="text-base font-semibold text-neutral-900">{children}</h2>
    </div>
  );
}

function MonthlyView({ m }: { m: MonthlyDraft }) {
  const stats = m.stats || {};
  const domains = Array.isArray(m.domains) ? m.domains : [];
  const highlights = Array.isArray(m.highlights) ? m.highlights : [];
  const practice = Array.isArray(m.practice) ? m.practice : [];
  const goals = Array.isArray(m.goals) ? m.goals : [];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <StatBox label="참여 회기" value={s(stats.participated)} />
        <StatBox label="출석률" value={s(stats.attendance)} />
        <StatBox label="치료 영역" value={s(stats.areas)} />
        <StatBox label="담당 치료사" value={s(stats.therapist)} />
      </div>

      {/* Summary */}
      {s(m.summary) && (
        <div>
          <SectionTitle icon={Sparkles}>이번 달 한눈에</SectionTitle>
          <p className="text-[15px] leading-relaxed text-neutral-800 break-keep whitespace-pre-wrap">{s(m.summary)}</p>
        </div>
      )}

      {/* Domains */}
      {domains.length > 0 && (
        <div>
          <SectionTitle icon={TrendingUp}>영역별 발달 흐름</SectionTitle>
          <div className="space-y-3">
            {domains.map((d, i) => {
              const prev = Number(d?.prev ?? 0);
              const curr = Number(d?.curr ?? 0);
              const isUp = (d?.color === "emerald") || curr > prev;
              return (
                <div key={i} className="rounded-2xl border border-neutral-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-neutral-900 break-keep">{s(d?.domain)}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isUp ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{s(d?.delta) || (curr - prev >= 0 ? `+${curr - prev}` : `${curr - prev}`)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                    <div className={`h-full ${isUp ? "bg-emerald-400" : "bg-amber-400"}`} style={{ width: `${Math.min(100, Math.max(0, curr))}%` }} />
                  </div>
                  {s(d?.note) && <div className="text-xs text-neutral-600 mt-2 break-keep">{s(d?.note)}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Highlights */}
      {highlights.length > 0 && (
        <div>
          <SectionTitle icon={Heart}>빛났던 순간</SectionTitle>
          <div className="space-y-3">
            {highlights.map((h: any, i) => {
              const title = typeof h === "string" ? h : s(h?.title);
              const body = typeof h === "string" ? "" : s(h?.body);
              const date = typeof h === "string" ? "" : s(h?.date);
              return (
                <div key={i} className="rounded-2xl bg-[#FAF6E8]/40 border border-[#EFE6CC] p-4">
                  {date && <div className="text-[10px] uppercase tracking-wider text-[#8a7544] mb-1">{date}</div>}
                  {title && <div className="font-medium text-neutral-900 break-keep">{title}</div>}
                  {body && <div className="text-sm text-neutral-700 mt-1 break-keep">{body}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Note */}
      {s(m.note) && (
        <div>
          <SectionTitle icon={MessageCircle}>담당 치료사 노트</SectionTitle>
          <p className="text-[15px] leading-relaxed text-neutral-800 break-keep whitespace-pre-wrap">{s(m.note)}</p>
          {(m.noteTherapist?.name || m.noteTherapist?.meta) && (
            <div className="text-xs text-neutral-500 mt-3">— {s(m.noteTherapist?.name)} · {s(m.noteTherapist?.meta)}</div>
          )}
        </div>
      )}

      {/* Practice */}
      {practice.length > 0 && (
        <div>
          <SectionTitle icon={BookOpen}>가정 연습 제안</SectionTitle>
          <div className="space-y-3">
            {practice.map((p: any, i) => (
              <div key={i} className="rounded-2xl border border-neutral-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-neutral-900 break-keep">{s(p?.title) || s(p)}</div>
                  {s(p?.time) && <span className="text-xs text-neutral-500">{s(p?.time)}</span>}
                </div>
                {s(p?.desc) && <div className="text-sm text-neutral-700 mt-1 break-keep">{s(p?.desc)}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goals */}
      {goals.length > 0 && (
        <div>
          <SectionTitle icon={Target}>다음 달 목표</SectionTitle>
          <div className="space-y-2">
            {goals.map((g: any, i) => (
              <div key={i} className="flex items-start justify-between gap-3 rounded-xl bg-neutral-50 px-3 py-2">
                <div className="text-xs text-neutral-500 shrink-0">{s(g?.label) || `목표 ${i + 1}`}</div>
                <div className="text-sm text-neutral-900 text-right break-keep">{s(g?.value) || s(g)}</div>
              </div>
            ))}
          </div>
          {s(m.goalsFooter) && <div className="text-xs text-neutral-500 mt-3 break-keep">{s(m.goalsFooter)}</div>}
        </div>
      )}
    </div>
  );
}

function Sparkles(props: any) {
  return <Award {...props} />;
}
