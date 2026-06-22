import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Circle, MinusCircle, Sparkles, ShieldCheck, FileText, Loader2, Copy, X, Upload } from "lucide-react";

type Ctx = { centerId: string; demo?: boolean };

// 발달재활서비스 voucher_type_id
const DEV_VOUCHER_TYPE_ID = "cd278a6e-41f9-43a8-a9a8-3ecc5485431c";

type AuditItem = {
  id: string;
  category: string;
  item_name: string;
  description: string | null;
  is_critical: boolean;
  source_citation: string | null;
  source_type: "official" | "common" | "custom" | null;
  can_generate_doc: boolean;
  generate_prompt: string | null;
  sort_order: number;
  item_code: string | null;
};
type State = { audit_item_id: string; status: "pending" | "done" | "na"; note: string | null };

const CATEGORY_ORDER = ["시설", "인력", "회기·일지", "회계", "바우처청구", "안전", "개인정보", "종사자교육"];

// D-day (다음 지도점검 가정: 매년 9월 셋째 주). 2026-09-15
function getDDay(): number {
  const target = new Date("2026-09-15T00:00:00+09:00").getTime();
  return Math.max(0, Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24)));
}

export default function AuditKitPage() {
  const { centerId, demo } = useOutletContext<Ctx>();
  const [searchParams] = useSearchParams();
  const isDemo = demo || searchParams.get("demo") === "1" || searchParams.get("demo") === "true";
  const { toast } = useToast();
  const [items, setItems] = useState<AuditItem[]>([]);
  const [state, setState] = useState<Record<string, State>>({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("시설");
  const [genItem, setGenItem] = useState<AuditItem | null>(null);
  const [genText, setGenText] = useState<string>("");
  const [genLoading, setGenLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data: itemsData } = await supabase
        .from("voucher_audit_items")
        .select("id, category, item_name, description, is_critical, source_citation, source_type, can_generate_doc, generate_prompt, sort_order, item_code")
        .eq("voucher_type_id", DEV_VOUCHER_TYPE_ID)
        .order("sort_order", { ascending: true });
      if (cancelled) return;
      const list = (itemsData ?? []) as AuditItem[];
      setItems(list);

      if (isDemo) {
        // Demo: ~65% 완료 / 일부 N/A
        const seed: Record<string, State> = {};
        list.forEach((it, i) => {
          const m = i % 10;
          seed[it.id] = {
            audit_item_id: it.id,
            status: m < 6 ? "done" : m === 9 ? "na" : "pending",
            note: null,
          };
        });
        setState(seed);
      } else if (centerId) {
        const { data: stateData } = await supabase
          .from("center_audit_state")
          .select("audit_item_id, status, note")
          .eq("center_id", centerId);
        const map: Record<string, State> = {};
        (stateData ?? []).forEach((s: any) => { map[s.audit_item_id] = s; });
        setState(map);
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [centerId, isDemo]);

  const counts = useMemo(() => {
    const done = items.filter((it) => state[it.id]?.status === "done").length;
    const na = items.filter((it) => state[it.id]?.status === "na").length;
    const applicable = items.length - na;
    const pct = applicable === 0 ? 0 : Math.round((done / applicable) * 100);
    return { total: items.length, done, na, pct, applicable };
  }, [items, state]);

  const byCategory = useMemo(() => {
    const m: Record<string, AuditItem[]> = {};
    items.forEach((it) => { (m[it.category] = m[it.category] || []).push(it); });
    return m;
  }, [items]);

  async function setStatus(item: AuditItem, status: "pending" | "done" | "na") {
    const prev = state[item.id];
    const next: State = { audit_item_id: item.id, status, note: prev?.note ?? null };
    setState((s) => ({ ...s, [item.id]: next }));
    if (isDemo) return;
    if (!centerId) return;
    const { error } = await supabase.from("center_audit_state").upsert(
      { center_id: centerId, audit_item_id: item.id, status, note: next.note, updated_at: new Date().toISOString() },
      { onConflict: "center_id,audit_item_id" }
    );
    if (error) {
      toast({ title: "저장 실패", description: error.message, variant: "destructive" });
      if (prev) setState((s) => ({ ...s, [item.id]: prev })); else setState((s) => { const c = { ...s }; delete c[item.id]; return c; });
    }
  }

  async function generateDoc(item: AuditItem) {
    setGenItem(item);
    setGenText("");
    setGenLoading(true);
    try {
      const prompt = item.generate_prompt ?? `${item.item_name} 양식을 작성해주세요.`;
      const { data, error } = await supabase.functions.invoke("expand-therapy-note", {
        body: { text: prompt, instruction: "professional" },
      });
      if (error) throw error;
      setGenText((data as any)?.text ?? "");
    } catch (e: any) {
      toast({ title: "초안 생성 실패", description: e?.message ?? String(e), variant: "destructive" });
      setGenText("초안 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setGenLoading(false);
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => toast({ title: "복사됨" }));
  }

  function download(text: string, name: string) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${name}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  const dday = getDDay();
  const pendingGeneratable = items.filter((it) => it.can_generate_doc && state[it.id]?.status !== "done" && state[it.id]?.status !== "na");

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#C8B88A]" />
            지도점검 대응 키트
          </h1>
          <p className="text-sm text-neutral-500 mt-1 break-keep">
            2026년 발달재활서비스 지도점검 준비 — 65항목 체크리스트 + 누락 서류 AI 초안.
          </p>
        </div>
        {isDemo && <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">데모 모드</span>}
      </div>

      {/* Section 1: D-day + Progress */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:col-span-2 flex items-center gap-6">
          <DonutProgress pct={counts.pct} />
          <div className="flex-1">
            <p className="text-xs text-neutral-500">2026 지도점검</p>
            <p className="text-3xl font-semibold mt-1">D-{dday}<span className="text-base text-neutral-400 ml-2">(9/15 가정)</span></p>
            <div className="flex gap-4 mt-3 text-sm">
              <span className="text-emerald-700"><b>{counts.done}</b> 완료</span>
              <span className="text-neutral-500"><b>{counts.total - counts.done - counts.na}</b> 대기</span>
              <span className="text-neutral-400"><b>{counts.na}</b> 해당없음</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-dashed border-neutral-300 p-6 flex flex-col items-center justify-center text-center">
          <Upload className="w-6 h-6 text-neutral-400 mb-2" />
          <p className="text-sm font-medium">시·도 공문 업로드</p>
          <p className="text-xs text-neutral-500 mt-1 break-keep">올해 점검 공문을 올리면 항목이 자동 보강됩니다. (Phase 2)</p>
          <button disabled className="mt-3 px-4 py-1.5 rounded-full bg-neutral-100 text-neutral-400 text-xs">곧 출시</button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {CATEGORY_ORDER.map((c) => {
          const list = byCategory[c] ?? [];
          const done = list.filter((it) => state[it.id]?.status === "done").length;
          const active = activeCategory === c;
          return (
            <button key={c} onClick={() => setActiveCategory(c)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition ${active ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400"}`}>
              {c} <span className={`ml-1 text-xs ${active ? "text-neutral-300" : "text-neutral-400"}`}>{done}/{list.length}</span>
            </button>
          );
        })}
      </div>

      {/* Section 2: Checklist */}
      <div className="space-y-3 mb-10">
        {loading ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-neutral-400">불러오는 중…</div>
        ) : (byCategory[activeCategory] ?? []).map((it) => {
          const st = state[it.id]?.status ?? "pending";
          return (
            <div key={it.id} className="bg-white rounded-2xl border border-neutral-200 p-5">
              <div className="flex items-start gap-4">
                <button onClick={() => setStatus(it, st === "done" ? "pending" : "done")} className="mt-0.5 shrink-0" title="완료 토글">
                  {st === "done" ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> :
                   st === "na" ? <MinusCircle className="w-6 h-6 text-neutral-300" /> :
                   <Circle className="w-6 h-6 text-neutral-300" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <h3 className={`font-medium ${st === "done" ? "text-neutral-500 line-through" : ""}`}>{it.item_name}</h3>
                    {it.is_critical && <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-semibold">필수</span>}
                    {it.source_type === "common" && <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px]">공통 기준</span>}
                    {it.source_type === "official" && <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px]">법령</span>}
                  </div>
                  {it.description && <p className="text-sm text-neutral-500 mt-1 break-keep">{it.description}</p>}
                  {it.source_citation && (
                    <p className="text-xs text-neutral-400 mt-2">근거: {it.source_citation}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {it.can_generate_doc && (
                    <button onClick={() => generateDoc(it)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#C8B88A]/10 text-[#8a7a4c] hover:bg-[#C8B88A]/20 text-xs font-medium">
                      <Sparkles className="w-3.5 h-3.5" /> AI 초안
                    </button>
                  )}
                  <button onClick={() => setStatus(it, st === "na" ? "pending" : "na")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border ${st === "na" ? "bg-neutral-100 text-neutral-500 border-neutral-200" : "bg-white text-neutral-400 border-neutral-200 hover:text-neutral-600"}`}>
                    해당없음
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {!loading && (byCategory[activeCategory]?.length ?? 0) === 0 && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-neutral-400">항목이 없습니다.</div>
        )}
      </div>

      {/* Section 3: AI 누락 서류 패널 */}
      {pendingGeneratable.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#C8B88A]" /> 누락 가능성이 있는 서류 ({pendingGeneratable.length})
          </h2>
          <p className="text-sm text-neutral-500 mb-4 break-keep">아래 항목은 AI가 양식 초안을 만들어드립니다. 생성 후 센터 실정에 맞게 편집해 사용하세요.</p>
          <div className="grid md:grid-cols-2 gap-3">
            {pendingGeneratable.slice(0, 8).map((it) => (
              <button key={it.id} onClick={() => generateDoc(it)}
                className="text-left bg-white border border-neutral-200 hover:border-[#C8B88A] rounded-2xl p-4 transition">
                <p className="text-xs text-neutral-400">{it.category}</p>
                <p className="font-medium mt-1">{it.item_name}</p>
                <p className="text-xs text-[#8a7a4c] mt-2 inline-flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI 초안 생성</p>
              </button>
            ))}
          </div>
          {pendingGeneratable.length > 8 && (
            <p className="text-xs text-neutral-400 mt-3">+ {pendingGeneratable.length - 8}개 더 (체크리스트에서 항목별로 생성)</p>
          )}
        </section>
      )}

      <p className="text-xs text-neutral-400 mt-12 break-keep">
        ※ 본 체크리스트는 보건복지부 발달재활서비스 운영 지침 및 일반 공통 기준을 토대로 작성된 가이드입니다.
        실제 지도점검 항목은 시·도별로 상이할 수 있으니 관할 공문을 함께 확인하세요.
      </p>

      {/* AI 초안 모달 */}
      {genItem && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setGenItem(null)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between p-6 border-b border-neutral-100">
              <div>
                <p className="text-xs text-neutral-400">{genItem.category}</p>
                <h3 className="text-lg font-semibold mt-1">{genItem.item_name}</h3>
                <p className="text-xs text-neutral-500 mt-1">AI 초안 — 사용 전 편집 필수</p>
              </div>
              <button onClick={() => setGenItem(null)} className="p-2 hover:bg-neutral-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {genLoading ? (
                <div className="flex items-center gap-2 text-neutral-400"><Loader2 className="w-4 h-4 animate-spin" /> 초안 생성 중…</div>
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-sm text-neutral-800 leading-relaxed">{genText}</pre>
              )}
            </div>
            {!genLoading && genText && (
              <div className="p-4 border-t border-neutral-100 flex gap-2 justify-end">
                <button onClick={() => copy(genText)} className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-neutral-200 text-sm hover:bg-neutral-50">
                  <Copy className="w-4 h-4" /> 복사
                </button>
                <button onClick={() => download(genText, genItem.item_name)} className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-neutral-900 text-white text-sm">
                  다운로드
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DonutProgress({ pct }: { pct: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="shrink-0">
      <circle cx="48" cy="48" r={r} fill="none" stroke="#f1f1f1" strokeWidth="10" />
      <circle cx="48" cy="48" r={r} fill="none" stroke="#C8B88A" strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`} transform="rotate(-90 48 48)" />
      <text x="48" y="54" textAnchor="middle" className="fill-neutral-900" style={{ fontSize: 20, fontWeight: 600 }}>{pct}%</text>
    </svg>
  );
}
