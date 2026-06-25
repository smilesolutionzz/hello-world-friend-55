import { useEffect, useMemo, useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Upload, Sparkles, Loader2, FileText, Wand2, Send, Image as ImageIcon, Trash2, Download, FileSpreadsheet, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import * as XLSX from "xlsx";
import ShareWithParentDialog from "@/components/b2b-center/ShareWithParentDialog";
import WeeklySessionRecords from "@/components/b2b-center/WeeklySessionRecords";
import {
  resolveTemplate,
  WEEKLY_SECTION_KEYS,
  DEFAULT_TEMPLATE,
  type ReportTemplate,
} from "@/lib/b2bCenter/reportTemplate";

type WeeklyTpl = ReportTemplate["weekly"];

type Ctx = { centerId: string; demo?: boolean };

function isoWeekKey(d: Date): string {
  const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - day);
  const y = dt.getUTCFullYear();
  const yStart = new Date(Date.UTC(y, 0, 1));
  const w = Math.ceil(((dt.getTime() - yStart.getTime()) / 86400000 + 1) / 7);
  return `${y}-W${String(w).padStart(2, "0")}`;
}

function fileToBase64(file: File): Promise<{ b64: string; mime: string }> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res({ b64: String(r.result), mime: file.type || "image/jpeg" });
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function draftToPlainSections(d: any, tpl?: WeeklyTpl): { label: string; value: string }[] {
  const J = (v: any) => Array.isArray(v) ? v.filter(Boolean).join("\n• ") : (v ?? "");
  const t = tpl ?? DEFAULT_TEMPLATE.weekly;
  const titleOf = (k: string, fb: string) => t.sections[k]?.title || fb;
  const enabled = (k: string) => t.sections[k]?.enabled !== false;
  const raw: { key: string; label: string; value: string }[] = [
    { key: "_title", label: "제목", value: d?.title ?? "" },
    { key: "greeting", label: titleOf("greeting", "보호자께 인사"), value: d?.greeting ?? "" },
    { key: "highlights", label: titleOf("highlights", "이번 주 하이라이트"), value: Array.isArray(d?.highlights) && d.highlights.length ? "• " + J(d.highlights) : "" },
    { key: "activities_summary", label: titleOf("activities_summary", "이번 주 활동 요약"), value: d?.activities_summary ?? "" },
    { key: "growth", label: titleOf("growth", "관찰된 성장"), value: Array.isArray(d?.growth) && d.growth.length ? "• " + J(d.growth) : "" },
    { key: "home_tips", label: titleOf("home_tips", "가정에서 해볼 활동"), value: Array.isArray(d?.home_tips) && d.home_tips.length ? "• " + J(d.home_tips) : "" },
    { key: "next_week_focus", label: titleOf("next_week_focus", "다음 주 집중 방향"), value: d?.next_week_focus ?? "" },
  ];
  const filtered = raw.filter((r) => r.key === "_title" || enabled(r.key));
  const sections = filtered.map(({ label, value }) => ({ label, value }));
  if (t.intro) sections.splice(1, 0, { label: "보호자께", value: t.intro });
  if (t.outro) sections.push({ label: "맺음말", value: t.outro });
  return sections;
}

function downloadPDF(clientName: string, weekKey: string, draft: any, tpl?: WeeklyTpl) {
  const sections = draftToPlainSections(draft, tpl);
  const win = window.open("", "_blank", "width=820,height=900");
  if (!win) { alert("팝업이 차단되었습니다. 팝업을 허용해주세요."); return; }
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>치료노트 ${clientName} ${weekKey}</title>
    <style>
      @page { size: A4; margin: 18mm; }
      body { font-family: -apple-system, "Pretendard Variable", "Apple SD Gothic Neo", sans-serif; color:#1a1a1a; line-height:1.65; }
      .gold { color:#C8B88A; letter-spacing:.2em; font-size:11px; }
      h1 { font-size:22px; margin:4px 0 6px; }
      .meta { color:#666; font-size:12px; margin-bottom:24px; }
      .sec { margin-bottom:18px; page-break-inside: avoid; }
      .label { font-size:11px; color:#888; margin-bottom:6px; text-transform:uppercase; letter-spacing:.1em; }
      .val { white-space:pre-wrap; font-size:14px; }
      hr { border:none; border-top:1px solid #eee; margin:12px 0; }
      .foot { margin-top:30px; font-size:10px; color:#aaa; border-top:1px solid #eee; padding-top:8px; }
    </style></head><body>
    <div class="gold">WEEKLY THERAPY NOTE</div>
    <h1>${escapeHTML(draft?.title || "주간 치료노트")}</h1>
    <div class="meta">${escapeHTML(clientName)} · ${escapeHTML(weekKey)}</div>
    ${sections.filter(s => s.value).map(s => `<div class="sec"><div class="label">${escapeHTML(s.label)}</div><div class="val">${escapeHTML(s.value)}</div></div>`).join("")}
    <div class="foot">AIHPRO Center · 발행일 ${new Date().toLocaleDateString("ko-KR")}</div>
    <script>window.onload=()=>{setTimeout(()=>window.print(),300);}</script>
    </body></html>`;
  win.document.write(html);
  win.document.close();
}

function escapeHTML(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function downloadXLSX(clientName: string, weekKey: string, draft: any, tpl?: WeeklyTpl) {
  const sections = draftToPlainSections(draft, tpl);
  const rows = [["항목", "내용"], ...sections.map(s => [s.label, s.value])];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 18 }, { wch: 80 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "치료노트");
  XLSX.writeFile(wb, `치료노트_${clientName}_${weekKey}.xlsx`);
}

export default function TherapyNotesPage() {
  const { centerId, demo } = useOutletContext<Ctx>();
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [clientSearch, setClientSearch] = useState("");
  const [weekKey, setWeekKey] = useState(() => isoWeekKey(new Date()));
  const [uploads, setUploads] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [editedDraft, setEditedDraft] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [rewriting, setRewriting] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [viewingHistory, setViewingHistory] = useState<any>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [weeklyTpl, setWeeklyTpl] = useState<WeeklyTpl>(DEFAULT_TEMPLATE.weekly);

  // Load per-center weekly template (from center_organizations.branding.template).
  useEffect(() => {
    if (!centerId || demo) { setWeeklyTpl(DEFAULT_TEMPLATE.weekly); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("center_organizations")
        .select("branding")
        .eq("id", centerId)
        .maybeSingle();
      if (!cancelled) setWeeklyTpl(resolveTemplate((data as any)?.branding).weekly);
    })();
    return () => { cancelled = true; };
  }, [centerId, demo]);

  const loadHistory = async () => {
    if (!selectedClient) { setHistory([]); return; }
    const { data } = await supabase
      .from("center_parent_reports")
      .select("id, week_key, period_start, period_end, title, status, published_at, ai_draft_json")
      .eq("center_id", centerId)
      .eq("client_id", selectedClient)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(200);
    setHistory(data || []);
  };
  useEffect(() => { loadHistory(); /* eslint-disable-next-line */ }, [selectedClient, centerId]);

  useEffect(() => {
    if (demo) return;
    supabase.from("center_clients").select("id, name, guardian_phone").eq("center_id", centerId).in("status", ["enrolled", "waiting"]).order("name").then(({ data }) => {
      setClients(data || []);
      if (data?.[0]) setSelectedClient(data[0].id);
    });
  }, [centerId, demo]);

  const loadWeek = async () => {
    if (!selectedClient) return;
    const { data: ups } = await supabase
      .from("center_session_uploads")
      .select("*")
      .eq("center_id", centerId)
      .eq("client_id", selectedClient)
      .eq("week_key", weekKey)
      .order("session_date", { ascending: true });
    setUploads(ups || []);

    const { data: rep } = await supabase
      .from("center_parent_reports")
      .select("*")
      .eq("center_id", centerId)
      .eq("client_id", selectedClient)
      .eq("week_key", weekKey)
      .eq("period_type", "weekly")
      .maybeSingle();
    setReport(rep);
    setEditedDraft(rep?.ai_draft_json ?? null);
  };

  useEffect(() => { loadWeek(); /* eslint-disable-next-line */ }, [selectedClient, weekKey, centerId]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || !selectedClient) { toast({ title: "이용자를 먼저 선택하세요" }); return; }
    setUploading(true);
    try {
      for (const f of Array.from(files)) {
        const { b64, mime } = await fileToBase64(f);
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`https://hrcqxjetmzxoephgyjlb.supabase.co/functions/v1/analyze-session-upload`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            centerId,
            clientId: selectedClient,
            sessionDate: new Date().toISOString().slice(0, 10),
            imageBase64: b64,
            mimeType: mime,
          }),
        });
        const j = await res.json();
        if (!res.ok) throw new Error(j.error || j.detail || "upload failed");
      }
      toast({ title: "업로드 + AI 분석 완료" });
      loadWeek();
    } catch (e: any) {
      toast({ title: "업로드 실패", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const deleteUpload = async (id: string) => {
    if (!confirm("이 업로드를 삭제할까요?")) return;
    await supabase.from("center_session_uploads").delete().eq("id", id);
    loadWeek();
  };

  const generate = async () => {
    if (!selectedClient) { toast({ title: "이용자를 먼저 선택하세요" }); return; }
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`https://hrcqxjetmzxoephgyjlb.supabase.co/functions/v1/generate-weekly-therapy-note`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${session?.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ centerId, clientId: selectedClient, weekKey, allowEmpty: true }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || j.detail);
      toast({ title: "주간 노트 초안 생성 완료", description: uploads.length === 0 ? "이번 주 일정 기반으로 작성됐어요. 일지 사진을 올리면 더 풍부해져요." : undefined });
      loadWeek();
    } catch (e: any) {
      toast({ title: "생성 실패", description: e?.message ?? String(e), variant: "destructive" });
    } finally { setGenerating(false); }
  };

  const rewriteField = async (key: string, instruction: string) => {
    const cur = editedDraft?.[key];
    const textVal = Array.isArray(cur) ? cur.join("\n") : (cur ?? "");
    if (!textVal) return;
    setRewriting(key);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`https://hrcqxjetmzxoephgyjlb.supabase.co/functions/v1/expand-therapy-note`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${session?.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ text: textVal, instruction }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);
      setEditedDraft({ ...editedDraft, [key]: Array.isArray(cur) ? j.text.split("\n").filter(Boolean) : j.text });
    } catch (e: any) {
      toast({ title: "재작성 실패", description: e?.message, variant: "destructive" });
    } finally { setRewriting(null); }
  };

  const saveDraft = async () => {
    if (!report) return;
    const { error } = await supabase.from("center_parent_reports").update({ ai_draft_json: editedDraft, title: editedDraft?.title ?? null }).eq("id", report.id);
    if (error) { toast({ title: "저장 실패", description: error.message, variant: "destructive" }); return; }
    toast({ title: "저장됨" });
    loadWeek();
  };

  const publish = async () => {
    if (!report) return;
    if (!confirm("치료노트를 발행하시겠어요?\n발행 후 '부모 공유' 버튼으로 카톡 공유 링크를 보내주세요.")) return;
    await supabase.from("center_parent_reports").update({
      ai_draft_json: editedDraft,
      title: editedDraft?.title ?? null,
      status: "published",
      published_at: new Date().toISOString(),
    }).eq("id", report.id);
    toast({ title: "발행 완료", description: "이제 '부모 공유' 버튼으로 카톡 공유 링크를 만들 수 있어요." });
    loadWeek();
    loadHistory();
    setShareOpen(true);
  };

  const clientName = useMemo(() => clients.find(c => c.id === selectedClient)?.name ?? "—", [clients, selectedClient]);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">치료노트</h1>
          <p className="text-sm text-neutral-500 mt-1 break-keep">회기 일지 사진을 올리면 AI가 주간 치료노트 초안을 만들어드려요. 편집 후 보호자에게 바로 공유하세요.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            placeholder="이용자 이름 검색"
            className="border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white w-40"
          />
          <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white max-w-[200px]">
            <option value="">이용자 선택 ({clients.filter(c => !clientSearch || c.name?.toLowerCase().includes(clientSearch.toLowerCase())).length}명)</option>
            {clients
              .filter(c => !clientSearch || c.name?.toLowerCase().includes(clientSearch.toLowerCase()))
              .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="week" value={weekKey.replace("-W", "-W")} onChange={(e) => setWeekKey(e.target.value)} className="border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white" />
        </div>
      </div>

      {/* Upload */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className="bg-white rounded-3xl border-2 border-dashed border-[#C8B88A]/60 p-8 text-center"
      >
        <Upload className="w-8 h-8 mx-auto text-[#C8B88A] mb-3" />
        <p className="font-medium mb-1">회기 일지 사진 업로드</p>
        <p className="text-sm text-neutral-500 mb-4 break-keep">손글씨 일지·프린트 기록·메모 모두 가능. 사진을 드래그하거나 버튼으로 선택하세요.</p>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={uploading}
            onClick={() => {
              if (!selectedClient) { toast({ title: "이용자를 먼저 선택하세요" }); return; }
              fileRef.current?.click();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 text-white text-sm disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            {uploading ? "분석 중…" : "사진 선택"}
          </button>
        </div>
      </div>

      {/* Upload list */}
      <div className="bg-white rounded-3xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div>
            <h2 className="font-semibold">이번 주 회기 ({uploads.length}건 일지 사진)</h2>
            <p className="text-xs text-neutral-500 mt-0.5">사진이 없어도 일정에 잡힌 회기와 담당 선생님 기준으로 노트를 만들 수 있어요.</p>
          </div>
          <button disabled={generating || !selectedClient} onClick={generate} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C8B88A] text-neutral-900 text-sm font-medium disabled:opacity-50">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? "생성 중…" : uploads.length === 0 ? "일정 기반 자동 생성" : "주간 치료노트 자동 생성"}
          </button>
        </div>
        {uploads.length === 0 ? (
          <p className="text-sm text-neutral-400 py-6 text-center">아직 업로드가 없어요.</p>
        ) : (
          <div className="space-y-3">
            {uploads.map((u) => {
              const e = u.ai_extracted || {};
              return (
                <div key={u.id} className="border border-neutral-100 rounded-2xl p-4 bg-neutral-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{u.session_date}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.status === "parsed" ? "bg-emerald-50 text-emerald-700" : u.status === "used" ? "bg-neutral-100 text-neutral-600" : u.status === "failed" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{u.status}</span>
                      <button onClick={() => deleteUpload(u.id)} className="text-neutral-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  {e.activities?.length > 0 && <p className="text-xs text-neutral-600"><b>활동:</b> {e.activities.join(", ")}</p>}
                  {e.emotions?.length > 0 && <p className="text-xs text-neutral-600"><b>감정:</b> {e.emotions.join(", ")}</p>}
                  {e.progress_notes && <p className="text-xs text-neutral-700 mt-1">{e.progress_notes}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Draft editor */}
      {report && editedDraft && (
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs tracking-widest text-[#C8B88A] mb-1">WEEKLY NOTE</p>
              <h2 className="text-xl font-semibold">{clientName} · {weekKey}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${report.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                {report.status === "published" ? "발행됨" : "초안"}
              </span>
            </div>
          </div>

          <EditableField label="제목" value={editedDraft.title} onChange={(v) => setEditedDraft({ ...editedDraft, title: v })} />
          <EditableField label="보호자께 인사" value={editedDraft.greeting} onChange={(v) => setEditedDraft({ ...editedDraft, greeting: v })} multiline onRewrite={(inst) => rewriteField("greeting", inst)} rewriting={rewriting === "greeting"} />
          <EditableArray label="이번 주 하이라이트" value={editedDraft.highlights} onChange={(v) => setEditedDraft({ ...editedDraft, highlights: v })} />
          <EditableField label="이번 주 활동 요약" value={editedDraft.activities_summary} onChange={(v) => setEditedDraft({ ...editedDraft, activities_summary: v })} multiline onRewrite={(inst) => rewriteField("activities_summary", inst)} rewriting={rewriting === "activities_summary"} />
          <EditableArray label="관찰된 성장" value={editedDraft.growth} onChange={(v) => setEditedDraft({ ...editedDraft, growth: v })} />
          <EditableArray label="가정에서 해볼 활동" value={editedDraft.home_tips} onChange={(v) => setEditedDraft({ ...editedDraft, home_tips: v })} />
          <EditableField label="다음 주 집중 방향" value={editedDraft.next_week_focus} onChange={(v) => setEditedDraft({ ...editedDraft, next_week_focus: v })} multiline onRewrite={(inst) => rewriteField("next_week_focus", inst)} rewriting={rewriting === "next_week_focus"} />

          <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-neutral-100">
            <button onClick={() => downloadPDF(clientName, weekKey, editedDraft, weeklyTpl)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 text-sm hover:bg-neutral-50">
              <Download className="w-4 h-4" /> PDF 다운로드
            </button>
            <button onClick={() => downloadXLSX(clientName, weekKey, editedDraft, weeklyTpl)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 text-sm hover:bg-neutral-50">
              <FileSpreadsheet className="w-4 h-4" /> 엑셀 다운로드
            </button>
            <button onClick={saveDraft} className="px-4 py-2 rounded-full border border-neutral-200 text-sm">초안 저장</button>
            <button onClick={publish} className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-neutral-200 text-sm">
              <Send className="w-4 h-4" /> {report.status === "published" ? "다시 발행" : "발행"}
            </button>
            <button
              onClick={() => setShareOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-neutral-900 text-white text-sm"
            >
              <Share2 className="w-4 h-4 text-[#C8B88A]" /> 부모 공유
            </button>
          </div>
        </div>
      )}

      {report && (
        <ShareWithParentDialog
          open={shareOpen && !viewingHistory}
          onClose={() => setShareOpen(false)}
          resourceType="therapy_note"
          resourceId={report.id}
          childId={selectedClient}
          centerId={centerId}
          defaultPhone={clients.find((c) => c.id === selectedClient)?.guardian_phone ?? ""}
          childName={clientName}
        />
      )}

      {!report && uploads.length > 0 && (
        <div className="bg-[#FAF6E8] border border-[#C8B88A]/30 rounded-2xl p-5 text-sm text-neutral-700">
          <FileText className="w-5 h-5 text-[#C8B88A] inline mr-2" />
          업로드는 있지만 아직 주간 노트가 없어요. 상단에서 <b>주간 치료노트 자동 생성</b>을 눌러주세요.
        </div>
      )}

      {/* 발행 캘린더 */}
      {selectedClient && (
        <PublishCalendar
          clientName={clientName}
          history={history}
          month={calMonth}
          onPrevMonth={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))}
          onNextMonth={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))}
          onJumpToWeek={(wk) => setWeekKey(wk)}
          onView={(rep) => setViewingHistory(rep)}
        />
      )}

      {viewingHistory && (
        <HistoryViewer
          clientName={clientName}
          report={viewingHistory}
          onClose={() => setViewingHistory(null)}
          onShare={() => setShareOpen(true)}
          tpl={weeklyTpl}
        />
      )}
      {viewingHistory && (
        <ShareWithParentDialog
          open={shareOpen && !!viewingHistory}
          onClose={() => setShareOpen(false)}
          resourceType="therapy_note"
          resourceId={viewingHistory.id}
          childId={selectedClient}
          centerId={centerId}
          defaultPhone={clients.find((c) => c.id === selectedClient)?.guardian_phone ?? ""}
          childName={clientName}
        />
      )}
    </div>
  );
}

function PublishCalendar({ clientName, history, month, onPrevMonth, onNextMonth, onJumpToWeek, onView }: any) {
  const year = month.getFullYear();
  const mon = month.getMonth();
  const firstDay = new Date(year, mon, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, mon + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, mon, d));
  while (cells.length % 7 !== 0) cells.push(null);

  // map date string -> report
  const byDate = new Map<string, any>();
  history.forEach((r: any) => {
    const dt = r.published_at ? new Date(r.published_at) : null;
    if (!dt) return;
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    if (!byDate.has(key)) byDate.set(key, r);
  });

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs tracking-widest text-[#C8B88A] mb-1">PUBLISH CALENDAR</p>
          <h2 className="font-semibold flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> {clientName} · 발행 캘린더</h2>
          <p className="text-xs text-neutral-500 mt-1">발행된 날짜를 클릭하면 그날 보낸 치료노트를 볼 수 있어요.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onPrevMonth} className="p-1.5 rounded-full border border-neutral-200 hover:bg-neutral-50"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm font-medium w-24 text-center">{year}년 {mon + 1}월</span>
          <button onClick={onNextMonth} className="p-1.5 rounded-full border border-neutral-200 hover:bg-neutral-50"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-neutral-500 mb-1">
        {["일","월","화","수","목","금","토"].map(d => <div key={d} className="py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => {
          if (!c) return <div key={i} className="h-16" />;
          const key = `${c.getFullYear()}-${String(c.getMonth() + 1).padStart(2, "0")}-${String(c.getDate()).padStart(2, "0")}`;
          const rep = byDate.get(key);
          return (
            <button
              key={i}
              onClick={() => rep && onView(rep)}
              disabled={!rep}
              className={`h-16 rounded-xl border text-left p-1.5 transition ${rep ? "border-[#C8B88A] bg-[#FAF6E8] hover:bg-[#F0E8C8] cursor-pointer" : "border-neutral-100 bg-white"}`}
            >
              <div className={`text-xs ${rep ? "font-semibold text-neutral-900" : "text-neutral-400"}`}>{c.getDate()}</div>
              {rep && (
                <div className="text-[10px] text-[#9A8B5C] mt-0.5 truncate">📝 {rep.week_key}</div>
              )}
            </button>
          );
        })}
      </div>
      {history.length > 0 && (
        <div className="mt-5 pt-4 border-t border-neutral-100">
          <p className="text-xs text-neutral-500 mb-2">최근 발행 ({history.length}건)</p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {history.slice(0, 12).map((r: any) => (
              <button
                key={r.id}
                onClick={() => onView(r)}
                className="w-full flex items-center justify-between text-left text-xs px-3 py-2 rounded-lg hover:bg-neutral-50"
              >
                <span className="text-neutral-700 truncate">{r.title || "주간 치료노트"} · {r.week_key}</span>
                <span className="text-neutral-400 ml-2 shrink-0">{r.published_at ? new Date(r.published_at).toLocaleDateString("ko-KR") : "-"}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryViewer({ clientName, report, onClose, onShare, tpl }: any) {
  const d = report.ai_draft_json || {};
  const sections = draftToPlainSections(d, tpl);
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs tracking-widest text-[#C8B88A] mb-1">PUBLISHED NOTE</p>
            <h3 className="text-lg font-semibold">{d.title || "주간 치료노트"}</h3>
            <p className="text-xs text-neutral-500 mt-1">{clientName} · {report.week_key} · 발행 {report.published_at ? new Date(report.published_at).toLocaleString("ko-KR") : "-"}</p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 text-xl leading-none">×</button>
        </div>
        <div className="space-y-4">
          {sections.filter(s => s.value).map((s, i) => (
            <div key={i}>
              <div className="text-[11px] uppercase tracking-wider text-neutral-500 mb-1">{s.label}</div>
              <div className="text-sm whitespace-pre-wrap text-neutral-800">{s.value}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-neutral-100">
          <button onClick={() => downloadPDF(clientName, report.week_key, d, tpl)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 text-sm hover:bg-neutral-50">
            <Download className="w-4 h-4" /> PDF
          </button>
          <button onClick={() => downloadXLSX(clientName, report.week_key, d, tpl)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 text-sm hover:bg-neutral-50">
            <FileSpreadsheet className="w-4 h-4" /> 엑셀
          </button>
          {onShare && (
            <button onClick={onShare} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-neutral-900 text-white text-sm">
              <Share2 className="w-4 h-4 text-[#C8B88A]" /> 부모 공유
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EditableField({ label, value, onChange, multiline, onRewrite, rewriting }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-neutral-600">{label}</label>
        {onRewrite && (
          <div className="flex items-center gap-1">
            {rewriting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" /> : (
              <>
                <RewriteBtn onClick={() => onRewrite("expand")}>확장</RewriteBtn>
                <RewriteBtn onClick={() => onRewrite("soften")}>부드럽게</RewriteBtn>
                <RewriteBtn onClick={() => onRewrite("parent_friendly")}>부모 친화</RewriteBtn>
                <RewriteBtn onClick={() => onRewrite("shorten")}>줄이기</RewriteBtn>
              </>
            )}
          </div>
        )}
      </div>
      {multiline ? (
        <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm" />
      ) : (
        <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm" />
      )}
    </div>
  );
}

function EditableArray({ label, value, onChange }: any) {
  const arr: string[] = Array.isArray(value) ? value : [];
  return (
    <div>
      <label className="text-xs font-medium text-neutral-600 mb-1.5 block">{label}</label>
      <div className="space-y-1.5">
        {arr.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input value={item} onChange={(e) => { const next = [...arr]; next[i] = e.target.value; onChange(next); }} className="flex-1 border border-neutral-200 rounded-lg px-3 py-1.5 text-sm" />
            <button onClick={() => onChange(arr.filter((_, j) => j !== i))} className="text-neutral-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        <button onClick={() => onChange([...arr, ""])} className="text-xs text-neutral-500 hover:text-neutral-900">+ 항목 추가</button>
      </div>
    </div>
  );
}

function RewriteBtn({ onClick, children }: any) {
  return <button onClick={onClick} className="text-[10px] px-2 py-0.5 rounded-full border border-neutral-200 hover:bg-neutral-50 inline-flex items-center gap-1"><Wand2 className="w-2.5 h-2.5" />{children}</button>;
}
