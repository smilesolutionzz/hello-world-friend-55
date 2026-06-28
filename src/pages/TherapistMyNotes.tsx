import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Send, FileText, ChevronLeft, Calendar, Share2 } from "lucide-react";
import ShareWithParentDialog from "@/components/b2b-center/ShareWithParentDialog";

type Therapist = { id: string; center_id: string; name: string };
type Client = { id: string; name: string; guardian_phone?: string | null };

function isoWeek(d: Date): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((+date - +yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function weekRange(weekKey: string) {
  const m = weekKey.match(/^(\d{4})-W(\d{2})$/)!;
  const y = +m[1], w = +m[2];
  const jan4 = new Date(Date.UTC(y, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const wk1 = new Date(jan4); wk1.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));
  const s = new Date(wk1); s.setUTCDate(wk1.getUTCDate() + (w - 1) * 7);
  const e = new Date(s); e.setUTCDate(s.getUTCDate() + 6);
  return { start: s.toISOString().slice(0, 10), end: e.toISOString().slice(0, 10) };
}

export default function TherapistMyNotes() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selClient, setSelClient] = useState<string>("");
  const [weekKey, setWeekKey] = useState<string>(isoWeek(new Date()));
  const [report, setReport] = useState<any>(null);
  const [sessionsThisWeek, setSessionsThisWeek] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  async function bootstrap() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { nav("/auth"); return; }

    const { data: ts } = await supabase
      .from("center_therapists").select("id, center_id, name")
      .eq("linked_user_id", user.id);
    const tlist = (ts ?? []) as Therapist[];
    setTherapists(tlist);

    if (tlist.length === 0) { setLoading(false); return; }

    // 본인 담당 아동: 본인 세션의 distinct clients
    const { data: sess } = await supabase
      .from("center_sessions")
      .select("client_id, center_clients:client_id(id, name, guardian_phone)")
      .in("therapist_id", tlist.map((t) => t.id));
    const seen = new Map<string, Client>();
    (sess ?? []).forEach((s: any) => { if (s.center_clients) seen.set(s.center_clients.id, s.center_clients); });
    const list = Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
    setClients(list);
    if (list.length > 0 && !selClient) setSelClient(list[0].id);
    setLoading(false);
  }

  useEffect(() => { bootstrap(); /* eslint-disable-next-line */ }, []);

  async function loadReport() {
    if (!selClient) return;
    const { start, end } = weekRange(weekKey);
    const tIds = therapists.map((t) => t.id);
    const [{ data: rep }, { data: sess }] = await Promise.all([
      supabase.from("center_parent_reports")
        .select("*")
        .eq("client_id", selClient).eq("week_key", weekKey).eq("period_type", "weekly").maybeSingle(),
      supabase.from("center_sessions")
        .select("id, session_date, start_time, end_time, status, note, program_id, meta")
        .eq("client_id", selClient).in("therapist_id", tIds)
        .gte("session_date", start).lte("session_date", end)
        .order("session_date"),
    ]);
    setReport(rep);
    setSessionsThisWeek(sess ?? []);
  }
  useEffect(() => { loadReport(); /* eslint-disable-next-line */ }, [selClient, weekKey, therapists.length]);

  const therapist = therapists[0];

  async function generate() {
    if (!therapist || !selClient) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-weekly-therapy-note", {
        body: { centerId: therapist.center_id, clientId: selClient, weekKey, therapistId: therapist.id, allowEmpty: true },
      });
      if (error) throw error;
      toast({ title: "AI 초안이 생성되었어요", description: data?.draft?.title ?? "" });
      await loadReport();
    } catch (e: any) {
      toast({ title: "생성 실패", description: e?.message ?? String(e), variant: "destructive" });
    } finally { setGenerating(false); }
  }

  async function saveEdits(html: string) {
    if (!report) return;
    const { error } = await supabase.from("center_parent_reports").update({ edited_html: html }).eq("id", report.id);
    if (error) { toast({ title: "저장 실패", description: error.message, variant: "destructive" }); return; }
    setReport({ ...report, edited_html: html });
  }

  async function publish() {
    if (!report) return;
    setPublishing(true);
    const { error } = await supabase.from("center_parent_reports").update({
      status: "published", published_at: new Date().toISOString(),
    }).eq("id", report.id);
    setPublishing(false);
    if (error) { toast({ title: "발행 실패", description: error.message, variant: "destructive" }); return; }
    toast({ title: "발행 완료", description: "보호자에게 노출됩니다." });
    setReport({ ...report, status: "published", published_at: new Date().toISOString() });
  }

  async function aiExpand(field: "consult" | "record" | "special", text: string, sessionId: string) {
    try {
      const { data, error } = await supabase.functions.invoke("expand-session-record", { body: { field, text } });
      if (error) throw error;
      const expanded = data?.expanded ?? text;
      const s = sessionsThisWeek.find((x) => x.id === sessionId);
      if (!s) return;
      const newMeta = { ...(s.meta ?? {}), records: { ...(s.meta?.records ?? {}), [field]: expanded } };
      await supabase.from("center_sessions").update({ meta: newMeta }).eq("id", sessionId);
      setSessionsThisWeek((prev) => prev.map((x) => x.id === sessionId ? { ...x, meta: newMeta } : x));
      toast({ title: "AI 확장 완료" });
    } catch (e: any) {
      toast({ title: "확장 실패", description: e?.message ?? String(e), variant: "destructive" });
    }
  }

  async function saveRecord(sessionId: string, patch: Record<string, string>) {
    const s = sessionsThisWeek.find((x) => x.id === sessionId);
    if (!s) return;
    const newMeta = { ...(s.meta ?? {}), records: { ...(s.meta?.records ?? {}), ...patch } };
    setSessionsThisWeek((prev) => prev.map((x) => x.id === sessionId ? { ...x, meta: newMeta } : x));
    await supabase.from("center_sessions").update({ meta: newMeta }).eq("id", sessionId);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>;
  if (therapists.length === 0) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center"><p className="mb-3">계정이 연결되지 않았습니다.</p><Link to="/therapist/my-schedule" className="text-sm underline">초대코드 입력하러 가기</Link></div>
    </div>
  );

  const draft = report?.ai_draft_json ?? null;

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <Helmet><title>내 주간노트 — 치료사</title></Helmet>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/therapist/my-schedule" className="p-1.5 rounded-full hover:bg-neutral-100"><ChevronLeft className="w-4 h-4" /></Link>
          <div>
            <p className="text-[10px] tracking-widest text-neutral-400">MY WEEKLY NOTES</p>
            <h1 className="text-base font-semibold">{therapist.name} 선생님</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Link to="/therapist/my-schedule" className="px-2 py-1 rounded-full border border-neutral-200">일정</Link>
          <Link to="/therapist/my-clients" className="px-2 py-1 rounded-full border border-neutral-200">내 아동</Link>
        </div>
      </header>

      <div className="p-4 grid md:grid-cols-[260px_1fr] gap-4">
        <aside className="bg-white rounded-2xl border border-neutral-200 p-3 max-h-[70vh] overflow-y-auto">
          <p className="text-xs text-neutral-500 mb-2 px-1">담당 아동 {clients.length}명</p>
          {clients.length === 0 && <p className="text-xs text-neutral-400 px-1">담당 아동이 없습니다.</p>}
          {clients.map((c) => (
            <button key={c.id} onClick={() => setSelClient(c.id)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm mb-1 ${selClient === c.id ? "bg-neutral-900 text-white" : "hover:bg-neutral-100"}`}>
              {c.name}
            </button>
          ))}
        </aside>

        <main className="space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex items-center gap-3 flex-wrap">
            <Calendar className="w-4 h-4 text-neutral-500" />
            <input type="week" value={weekKey.replace("-W", "-W")}
              onChange={(e) => setWeekKey(e.target.value)}
              className="text-sm border border-neutral-200 rounded-lg px-2 py-1" />
            <span className="text-xs text-neutral-500">{weekRange(weekKey).start} ~ {weekRange(weekKey).end}</span>
            <span className="text-xs text-neutral-400 ml-auto">본인 세션 {sessionsThisWeek.length}건</span>
          </div>

          {/* 세션별 기록 입력 */}
          <section className="bg-white rounded-2xl border border-neutral-200 p-4">
            <h2 className="text-sm font-semibold mb-3">이번 주 회기기록</h2>
            {sessionsThisWeek.length === 0 ? (
              <p className="text-xs text-neutral-400">이번 주에 본인 담당 회기가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {sessionsThisWeek.map((s) => (
                  <div key={s.id} className="border border-neutral-200 rounded-xl p-3">
                    <p className="text-xs font-medium mb-2">{s.session_date} {s.start_time?.slice(0,5)}–{s.end_time?.slice(0,5)} <span className="text-neutral-400 ml-1">[{s.status}]</span></p>
                    {(["consult","record","special"] as const).map((f) => (
                      <RecordField key={f} field={f} value={s.meta?.records?.[f] ?? ""}
                        onSave={(v) => saveRecord(s.id, { [f]: v })}
                        onExpand={(v) => aiExpand(f, v, s.id)} />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 주간 노트 초안 */}
          <section className="bg-white rounded-2xl border border-neutral-200 p-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h2 className="text-sm font-semibold flex items-center gap-2"><FileText className="w-4 h-4" /> 보호자용 주간 노트</h2>
              <div className="flex items-center gap-2">
                <button onClick={generate} disabled={generating || !selClient}
                  className="text-xs px-3 py-1.5 rounded-full bg-neutral-900 text-white inline-flex items-center gap-1 disabled:opacity-50">
                  {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  {report ? "초안 재생성" : "AI 초안 생성"}
                </button>
                {report && report.status !== "published" && (
                  <button onClick={publish} disabled={publishing}
                    className="text-xs px-3 py-1.5 rounded-full bg-emerald-600 text-white inline-flex items-center gap-1 disabled:opacity-50">
                    {publishing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />} 보호자에게 발행
                  </button>
                )}
                {report?.status === "published" && (
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">발행됨</span>
                )}
              </div>
            </div>

            {!report && <p className="text-xs text-neutral-400">아직 초안이 없습니다. 위의 회기기록을 작성한 뒤 "AI 초안 생성"을 눌러주세요.</p>}

            {draft && (
              <div className="space-y-3">
                <div><label className="text-[10px] text-neutral-500">제목</label><div className="text-base font-medium">{draft.title ?? "—"}</div></div>
                <div><label className="text-[10px] text-neutral-500">인사말</label><p className="text-sm text-neutral-700 break-keep">{draft.greeting}</p></div>
                {draft.highlights?.length > 0 && <div><label className="text-[10px] text-neutral-500">이번 주 하이라이트</label><ul className="text-sm list-disc pl-5 space-y-0.5">{draft.highlights.map((h: string, i: number) => <li key={i}>{h}</li>)}</ul></div>}
                <div><label className="text-[10px] text-neutral-500">활동 요약</label><p className="text-sm text-neutral-700 break-keep">{draft.activities_summary}</p></div>
                {draft.growth?.length > 0 && <div><label className="text-[10px] text-neutral-500">관찰된 성장</label><ul className="text-sm list-disc pl-5 space-y-0.5">{draft.growth.map((h: string, i: number) => <li key={i}>{h}</li>)}</ul></div>}
                {draft.home_tips?.length > 0 && <div><label className="text-[10px] text-neutral-500">가정 활동 제안</label><ul className="text-sm list-disc pl-5 space-y-0.5">{draft.home_tips.map((h: string, i: number) => <li key={i}>{h}</li>)}</ul></div>}
                <div><label className="text-[10px] text-neutral-500">다음 주 집중 방향</label><p className="text-sm text-neutral-700 break-keep">{draft.next_week_focus}</p></div>

                <details className="mt-2">
                  <summary className="text-xs text-neutral-500 cursor-pointer">직접 HTML로 편집 (선택)</summary>
                  <textarea defaultValue={report?.edited_html ?? ""}
                    onBlur={(e) => saveEdits(e.target.value)}
                    className="mt-2 w-full min-h-[120px] text-xs font-mono p-2 border border-neutral-200 rounded-lg" />
                </details>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function RecordField({ field, value, onSave, onExpand }: { field: "consult"|"record"|"special"; value: string; onSave: (v: string) => void; onExpand: (v: string) => void }) {
  const [v, setV] = useState(value);
  useEffect(() => { setV(value); }, [value]);
  const label = field === "consult" ? "활동내용" : field === "record" ? "주관평가" : "특이사항";
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-1">
        <label className="text-[11px] text-neutral-500">{label}</label>
        <button type="button" onClick={() => onExpand(v)} disabled={!v.trim()} className="text-[10px] text-blue-600 inline-flex items-center gap-0.5 disabled:opacity-30"><Sparkles className="w-2.5 h-2.5" /> AI 확장</button>
      </div>
      <textarea value={v} onChange={(e) => setV(e.target.value)} onBlur={() => onSave(v)}
        placeholder={`${label} 키워드 한 줄도 OK — AI 확장으로 문장화`}
        className="w-full text-xs border border-neutral-200 rounded-lg px-2 py-1.5 min-h-[48px] resize-y" />
    </div>
  );
}
