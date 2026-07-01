import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  DEMO_SESSIONS,
  DEMO_CLIENTS,
  DEMO_THERAPISTS,
  DEMO_PROGRAMS,
  
  DEMO_PARENT_REPORTS,
} from "@/lib/b2bCenter/demoData";
import {
  TrendingUp,
  Users,
  
  Calendar,
  Wallet,
  Clock,
  ArrowRight,
  FileText,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import OnboardingChecklist from "@/components/b2b-center/OnboardingChecklist";

type Ctx = { centerId: string; demo?: boolean };

const fmtKRW = (n: number) => n.toLocaleString() + "원";
const todayStr = () => new Date().toISOString().slice(0, 10);
const ymd = (d: Date) => d.toISOString().slice(0, 10);

interface DashboardData {
  // 오늘
  todaySessions: Array<{ id: string; start: string; end: string; clientName: string; therapistName: string; therapistColor: string; programName: string; status: string }>;
  todayCount: number;
  todayDone: number;
  todayUpcoming: number;
  // 이번 주
  weekRevenue: number;
  weekRevenuePrev: number;
  weekSessions: number;
  weekCancelled: number;
  weekNoShow: number;
  // 매출
  monthRevenue: number;
  outstandingKRW: number;
  outstandingCount: number;
  // 액션
  waitingClients: number;
  reportsDue: number;
  // 이번 주 주간노트 작성 현황
  weeklyNoteDraft: number;
  weeklyNotePublished: number;
  weeklyNoteExpected: number; // 서비스 이용 이용자 수 기반 목표
  // 부모 공유 열람 현황 (최근 7일)
  shareLinksSent: number;
  shareLinksViewed: number;
  // 치료사 가동률 top
  topTherapists: Array<{ name: string; color: string; sessions: number }>;
  cancelRate: number;
}

export default function OpsDashboardPage() {
  const { centerId, demo } = useOutletContext<Ctx>();
  const nav = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (demo) setData(buildDemoData());
      else setData(await buildLiveData(centerId));
      setLoading(false);
    })();
  }, [centerId, demo]);

  if (loading || !data) return <div className="p-12 text-center text-neutral-400">불러오는 중…</div>;

  const revenueDelta = data.weekRevenuePrev > 0
    ? Math.round(((data.weekRevenue - data.weekRevenuePrev) / data.weekRevenuePrev) * 100)
    : 0;

  const goSchedule = () => nav("/b2b-center/app/schedule");
  const goBilling = () => nav("/b2b-center/app/billing");
  const goClients = () => nav("/b2b-center/app/clients");
  const goReports = () => nav("/b2b-center/app/parent-reports");
  const goReports = () => nav("/b2b-center/app/parent-reports");

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <OnboardingChecklist centerId={centerId} demo={demo} />

      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">오늘 한눈에</h1>
        <p className="text-sm text-neutral-500">
          {new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" })} · 운영에 바로 쓰는 핵심 정보만 모아놨어요.
        </p>
      </div>

      {/* === 1. 액션 카드: 즉시 처리 필요한 것 === */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <ActionCard
          title="오늘 회기"
          value={`${data.todayCount}건`}
          sub={`완료 ${data.todayDone} · 남음 ${data.todayUpcoming}`}
          icon={Calendar}
          color="#A0C4FF"
          cta="일정 보기"
          onClick={goSchedule}
        />
        <ActionCard
          title="미수금"
          value={data.outstandingKRW > 0 ? fmtKRW(data.outstandingKRW) : "0원"}
          sub={data.outstandingCount > 0 ? `미수 ${data.outstandingCount}건 · 청구 필요` : "모두 수납 완료"}
          icon={Wallet}
          color="#FFB4A2"
          alert={data.outstandingCount > 0}
          cta="수납 관리"
          onClick={goBilling}
        />
        <ActionCard
          title="대기 이용자"
          value={`${data.waitingClients}명`}
          sub={data.waitingClients > 0 ? "치료사 배정 필요" : "대기 없음"}
          icon={UserPlus}
          color="#FFD6A5"
          alert={data.waitingClients > 0}
          cta="이용자 관리"
          onClick={goClients}
        />
        <ActionCard
          title="부모 리포트"
          value={`${data.reportsDue}건`}
          sub={data.reportsDue > 0 ? "발행 대기 (Draft)" : "최신 상태"}
          icon={FileText}
          color="#B8E0D2"
          alert={data.reportsDue > 0}
          cta="리포트 작성"
          onClick={goReports}
        />
      </div>

      {/* === 2. 이번 주 성과 + 오늘 일정 === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* 이번 주 성과 */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-neutral-500" />
            <h3 className="font-semibold">이번 주 성과</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-neutral-500 mb-1">매출 (이번 주)</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-semibold">{fmtKRW(data.weekRevenue)}</p>
                {data.weekRevenuePrev > 0 && (
                  <span className={`text-xs font-medium ${revenueDelta >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                    {revenueDelta >= 0 ? "▲" : "▼"} {Math.abs(revenueDelta)}%
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-1">지난주 {fmtKRW(data.weekRevenuePrev)}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-neutral-100">
              <MiniStat label="회기" value={data.weekSessions.toString()} />
              <MiniStat label="취소" value={data.weekCancelled.toString()} tone={data.weekCancelled > 0 ? "warning" : "default"} />
              <MiniStat label="노쇼" value={data.weekNoShow.toString()} tone={data.weekNoShow > 0 ? "danger" : "default"} />
            </div>
            <div className="pt-3 border-t border-neutral-100">
              <p className="text-xs text-neutral-500 mb-1">이번 달 누적 매출</p>
              <p className="text-lg font-semibold">{fmtKRW(data.monthRevenue)}</p>
            </div>
          </div>
        </div>

        {/* 오늘 일정 타임라인 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-500" />
              <h3 className="font-semibold">오늘 일정</h3>
            </div>
            <button onClick={goSchedule} className="text-xs text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1">
              전체 일정 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {data.todaySessions.length === 0 ? (
            <div className="py-10 text-center text-sm text-neutral-400">
              오늘은 등록된 회기가 없어요.
            </div>
          ) : (
            <div className="space-y-2 max-h-[360px] overflow-y-auto">
              {data.todaySessions.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-50">
                  <div className="text-xs font-mono text-neutral-500 w-24 shrink-0">
                    {s.start}–{s.end}
                  </div>
                  <div
                    className="w-1 h-8 rounded-full shrink-0"
                    style={{ background: s.therapistColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.clientName}</p>
                    <p className="text-xs text-neutral-500 truncate">
                      {s.therapistName} · {s.programName}
                    </p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* === 3. 가동률 + 평가 일정 === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">치료사 가동률 (이번 주 Top 5)</h3>
            <button onClick={() => nav("/b2b-center/app/by-therapist")} className="text-xs text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1">
              전체 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {data.topTherapists.length === 0 ? (
              <p className="text-sm text-neutral-400">데이터 없음</p>
            ) : (
              data.topTherapists.map((t) => {
                const max = Math.max(...data.topTherapists.map((x) => x.sessions), 1);
                return (
                  <div key={t.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{t.name}</span>
                      <span className="text-neutral-500">{t.sessions}회기</span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${(t.sessions / max) * 100}%`, background: t.color }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-xs text-neutral-500">취소율 (이번 주)</span>
            <span className={`text-sm font-semibold ${data.cancelRate > 0.1 ? "text-amber-600" : "text-neutral-900"}`}>
              {(data.cancelRate * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-neutral-500" />
              <h3 className="font-semibold">이번 주 주간노트 작성 현황</h3>
            </div>
            <button onClick={() => nav("/b2b-center/app/notes")} className="text-xs text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1">
              치료노트 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {(() => {
            const done = data.weeklyNotePublished;
            const draft = data.weeklyNoteDraft;
            const total = Math.max(data.weeklyNoteExpected, done + draft, 1);
            const donePct = (done / total) * 100;
            const draftPct = (draft / total) * 100;
            return (
              <>
                <div className="flex items-baseline gap-2 mb-3">
                  <p className="text-2xl font-semibold">{done}</p>
                  <p className="text-xs text-neutral-500">/ 목표 {data.weeklyNoteExpected}건 발행</p>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden flex mb-3">
                  <div className="h-full bg-emerald-400" style={{ width: `${donePct}%` }} />
                  <div className="h-full bg-amber-300" style={{ width: `${draftPct}%` }} />
                </div>
                <div className="flex gap-4 text-xs text-neutral-600">
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> 발행 {done}</span>
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-300" /> 초안 {draft}</span>
                  <span className="inline-flex items-center gap-1 text-neutral-400"><span className="w-2 h-2 rounded-full bg-neutral-200" /> 미작성 {Math.max(0, data.weeklyNoteExpected - done - draft)}</span>
                </div>
              </>
            );
          })()}

          <div className="pt-4 mt-4 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-neutral-500" />
                <h4 className="text-sm font-semibold">부모 공유 열람 (최근 7일)</h4>
              </div>
              <button onClick={goReports} className="text-xs text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1">
                리포트 <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            {data.shareLinksSent === 0 ? (
              <p className="text-xs text-neutral-400 py-2">아직 공유된 링크가 없어요.</p>
            ) : (
              <>
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="text-xl font-semibold">{data.shareLinksViewed}</p>
                  <p className="text-xs text-neutral-500">
                    / 발송 {data.shareLinksSent}건 · 열람률 {Math.round((data.shareLinksViewed / data.shareLinksSent) * 100)}%
                  </p>
                </div>
                <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-800 rounded-full"
                    style={{ width: `${(data.shareLinksViewed / data.shareLinksSent) * 100}%` }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({
  title, value, sub, icon: Icon, color, cta, onClick, alert,
}: { title: string; value: string; sub: string; icon: any; color: string; cta: string; onClick: () => void; alert?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`text-left bg-white rounded-2xl border p-5 transition hover:shadow-md hover:-translate-y-0.5 ${alert ? "border-amber-300 ring-1 ring-amber-100" : "border-neutral-200"}`}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-neutral-500">{title}</p>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: color + "33" }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-semibold mb-1">{value}</p>
      <p className="text-xs text-neutral-500 mb-3 min-h-[16px]">{sub}</p>
      <div className="inline-flex items-center gap-1 text-xs font-medium text-neutral-700">
        {cta} <ArrowRight className="w-3 h-3" />
      </div>
    </button>
  );
}

function MiniStat({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "warning" | "danger" }) {
  const cls = tone === "danger" ? "text-rose-500" : tone === "warning" ? "text-amber-600" : "text-neutral-900";
  return (
    <div>
      <p className="text-[10px] text-neutral-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-base font-semibold ${cls}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon?: any }> = {
    completed: { label: "완료", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    scheduled: { label: "예정", cls: "bg-neutral-50 text-neutral-600 border-neutral-200" },
    cancelled: { label: "취소", cls: "bg-rose-50 text-rose-600 border-rose-200" },
    cancelled_client: { label: "취소", cls: "bg-rose-50 text-rose-600 border-rose-200" },
    cancelled_center: { label: "취소", cls: "bg-rose-50 text-rose-600 border-rose-200" },
    no_show: { label: "노쇼", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  };
  const info = map[status] ?? { label: status, cls: "bg-neutral-50 text-neutral-600 border-neutral-200" };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${info.cls} shrink-0`}>
      {info.label}
    </span>
  );
}

// ===================== Data builders =====================

function startOfWeek(d = new Date()): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function buildDemoData(): DashboardData {
  const today = todayStr();
  const todayItems = DEMO_SESSIONS
    .filter((s) => s.session_date === today)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
    .map((s) => {
      const client = DEMO_CLIENTS.find((c) => c.id === s.client_id);
      const therapist = DEMO_THERAPISTS.find((t) => t.id === s.therapist_id);
      const program = DEMO_PROGRAMS.find((p) => p.id === s.program_id);
      return {
        id: s.id,
        start: s.start_time,
        end: s.end_time,
        clientName: client?.display_name ?? "—",
        therapistName: therapist?.name ?? "—",
        therapistColor: therapist?.color ?? "#ccc",
        programName: program?.name ?? "—",
        status: s.status,
      };
    });

  const completed = DEMO_SESSIONS.filter((s) => s.status === "completed");
  const cancelled = DEMO_SESSIONS.filter((s) => s.status?.startsWith("cancelled"));
  const weekRevenue = completed.reduce((sum, s) => sum + s.price_krw, 0);

  const topTherapists = DEMO_THERAPISTS.map((t) => ({
    name: t.name,
    color: t.color,
    sessions: completed.filter((s) => s.therapist_id === t.id).length,
  })).sort((a, b) => b.sessions - a.sessions).slice(0, 5);

  return {
    todaySessions: todayItems,
    todayCount: todayItems.length,
    todayDone: todayItems.filter((s) => s.status === "completed").length,
    todayUpcoming: todayItems.filter((s) => s.status === "scheduled").length,
    weekRevenue,
    weekRevenuePrev: Math.round(weekRevenue * 0.88),
    weekSessions: DEMO_SESSIONS.length,
    weekCancelled: cancelled.length,
    weekNoShow: 1,
    monthRevenue: 12_480_000,
    outstandingKRW: 480_000,
    outstandingCount: 3,
    waitingClients: DEMO_CLIENTS.filter((c) => c.status === "대기").length,
    reportsDue: DEMO_PARENT_REPORTS.filter((r) => r.status === "draft").length,
    weeklyNoteDraft: 2,
    weeklyNotePublished: 5,
    weeklyNoteExpected: DEMO_CLIENTS.filter((c) => c.status === "enrolled" || c.status === "이용중").length || 8,
    shareLinksSent: 6,
    shareLinksViewed: 4,
    topTherapists,
    cancelRate: cancelled.length / Math.max(DEMO_SESSIONS.length, 1),
  };
}

async function buildLiveData(centerId: string): Promise<DashboardData> {
  const today = todayStr();
  const weekStart = ymd(startOfWeek());
  const prevWeekStart = ymd(new Date(startOfWeek().getTime() - 7 * 86400000));
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const monthStartStr = ymd(monthStart);

  const sb: any = supabase;
  const weeklyStart = weekStart; // 이번 주 월요일
  const shareSince = ymd(new Date(Date.now() - 7 * 86400000));
  const [todayRes, weekRes, prevWeekRes, monthPayRes, clientRes, therRes, programRes, reportRes, weeklyNoteRes, shareLinkRes, outstandingRes] = await Promise.all([
    sb.from("center_sessions").select("id, start_time, end_time, client_id, therapist_id, program_id, status").eq("center_id", centerId).eq("session_date", today).order("start_time"),
    sb.from("center_sessions").select("status, price_krw, therapist_id").eq("center_id", centerId).gte("session_date", weekStart),
    sb.from("center_sessions").select("price_krw, status").eq("center_id", centerId).gte("session_date", prevWeekStart).lt("session_date", weekStart),
    sb.from("center_payments").select("amount_krw").eq("center_id", centerId).gte("paid_at", monthStartStr),
    sb.from("center_clients").select("id, name, status").eq("center_id", centerId),
    sb.from("center_therapists").select("id, name"),
    sb.from("center_programs").select("id, name").eq("center_id", centerId),
    sb.from("center_parent_reports").select("id, status").eq("center_id", centerId).eq("status", "draft"),
    sb.from("center_parent_reports").select("id, status, client_id").eq("center_id", centerId).eq("period_type", "weekly").gte("period_start", weeklyStart),
    sb.from("center_parent_share_links").select("id, last_accessed_at, access_count, revoked_at").eq("center_id", centerId).gte("sms_sent_at", shareSince),
    sb.from("center_payments").select("amount_krw, status").eq("center_id", centerId).eq("status", "pending"),
  ]);


  const clients = clientRes.data ?? [];
  const therapists = therRes.data ?? [];
  const programs = programRes.data ?? [];
  const palette = ["#FFB4A2", "#B8E0D2", "#FFD6A5", "#CAFFBF", "#A0C4FF", "#FFC8DD"];
  const therapistMap = new Map<string, { name: string; color: string }>(therapists.map((t: any, i: number) => [t.id, { name: t.name, color: palette[i % palette.length] }]));
  const clientMap = new Map(clients.map((c: any) => [c.id, c.name]));
  const programMap = new Map(programs.map((p: any) => [p.id, p.name]));

  const todaySessions = (todayRes.data ?? []).map((s: any) => ({
    id: s.id,
    start: (s.start_time ?? "").slice(0, 5),
    end: (s.end_time ?? "").slice(0, 5),
    clientName: clientMap.get(s.client_id) ?? "—",
    therapistName: therapistMap.get(s.therapist_id)?.name ?? "—",
    therapistColor: therapistMap.get(s.therapist_id)?.color ?? "#ccc",
    programName: programMap.get(s.program_id) ?? "—",
    status: s.status ?? "scheduled",
  }));

  const week = weekRes.data ?? [];
  const weekCompleted = week.filter((s: any) => s.status === "completed");
  const weekCancelled = week.filter((s: any) => s.status?.startsWith("cancelled"));
  const weekNoShow = week.filter((s: any) => s.status === "no_show");
  const weekRevenue = weekCompleted.reduce((sum: number, s: any) => sum + (s.price_krw ?? 0), 0);
  const weekRevenuePrev = (prevWeekRes.data ?? []).filter((s: any) => s.status === "completed").reduce((sum: number, s: any) => sum + (s.price_krw ?? 0), 0);
  const monthRevenue = (monthPayRes.data ?? []).reduce((sum: number, p: any) => sum + (p.amount_krw ?? 0), 0);

  const topTherapists = therapists
    .map((t: any, i: number) => ({
      name: t.name,
      color: palette[i % palette.length],
      sessions: weekCompleted.filter((s: any) => s.therapist_id === t.id).length,
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 5);

  const outstanding = outstandingRes.data ?? [];
  const outstandingKRW = outstanding.reduce((sum: number, p: any) => sum + (p.amount_krw ?? 0), 0);

  const weeklyNotes = weeklyNoteRes.data ?? [];
  const weeklyNotePublished = weeklyNotes.filter((r: any) => r.status === "published" || r.status === "sent").length;
  const weeklyNoteDraft = weeklyNotes.filter((r: any) => r.status === "draft").length;
  const activeClientCount = clients.filter((c: any) => c.status === "enrolled" || c.status === "이용중" || c.status === "active").length;
  const weeklyNoteExpected = Math.max(activeClientCount, weeklyNotePublished + weeklyNoteDraft);

  const shareLinks = (shareLinkRes.data ?? []).filter((l: any) => !l.revoked_at);
  const shareLinksSent = shareLinks.length;
  const shareLinksViewed = shareLinks.filter((l: any) => (l.access_count ?? 0) > 0 || l.last_accessed_at).length;

  return {
    todaySessions,
    todayCount: todaySessions.length,
    todayDone: todaySessions.filter((s) => s.status === "completed").length,
    todayUpcoming: todaySessions.filter((s) => s.status === "scheduled").length,
    weekRevenue,
    weekRevenuePrev,
    weekSessions: week.length,
    weekCancelled: weekCancelled.length,
    weekNoShow: weekNoShow.length,
    monthRevenue,
    outstandingKRW,
    outstandingCount: outstanding.length,
    waitingClients: clients.filter((c: any) => c.status === "waiting" || c.status === "대기").length,
    reportsDue: (reportRes.data ?? []).length,
    weeklyNoteDraft,
    weeklyNotePublished,
    weeklyNoteExpected,
    shareLinksSent,
    shareLinksViewed,
    topTherapists,
    cancelRate: week.length > 0 ? weekCancelled.length / week.length : 0,
  };
}
