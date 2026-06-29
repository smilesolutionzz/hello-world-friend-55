import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import html2canvas from "html2canvas";
import { supabase } from "@/integrations/supabase/client";
import { getActiveCenterId } from "@/lib/b2bCenter/centerClient";
import { compressImage } from "@/lib/imageCompress";
import { CARD_STYLES, type CardNewsStyleKey, type RenderTokens } from "@/lib/cardNewsStyles";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, ShieldAlert, Sparkles, Copy, Download, Check, ChevronRight,
  FileText, Plus, Trash2, ImagePlus, Save, History, RotateCcw,
  Search, Calendar as CalendarIcon, Film, Send,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

type Report = {
  id: string;
  week_key: string | null;
  period_start: string | null;
  period_end: string | null;
  period_type: string | null;
  title: string | null;
  ai_draft_json: any;
  client_id: string | null;
};

type Branding = { c1?: string; c2?: string; logoText?: string; tagline?: string; logoBg?: string; logoFg?: string };
type CardItem = { tag?: string; headline: string; body: string; bg?: string | null };
type GenResult = {
  cards: CardItem[];
  instagram: string;
  naver_blog: { title: string; body: string };
  short_promo: string;
  hashtags: string[];
  seo_keywords: string[];
};
type DraftRow = {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  style_key: string | null;
  anonymized_text: string | null;
  result_json: any;
  branding: any;
};

const STEPS = ["1. 노트 선택", "2. 익명화 · 검수", "3. 카드뉴스 편집"] as const;

function flattenDraft(d: any): string {
  if (!d) return "";
  if (typeof d === "string") return d;
  try {
    if (Array.isArray(d)) return d.map(flattenDraft).join("\n");
    const parts: string[] = [];
    for (const [k, v] of Object.entries(d)) {
      if (v == null) continue;
      if (typeof v === "string" && v.trim()) parts.push(`【${k}】 ${v}`);
      else if (typeof v === "object") parts.push(`【${k}】\n${flattenDraft(v)}`);
    }
    return parts.join("\n");
  } catch { return JSON.stringify(d); }
}

async function fileToDataUrl(file: File): Promise<string> {
  const compressed = await compressImage(file, { maxSide: 1400, quality: 0.82 }).catch(() => file);
  return await new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = reject;
    fr.readAsDataURL(compressed);
  });
}

// =================== Card Renderer ===================
function CardRender({
  card, idx, total, style, tokens, refCb,
}: {
  card: CardItem;
  idx: number;
  total: number;
  style: CardNewsStyleKey;
  tokens: RenderTokens;
  refCb: (el: HTMLDivElement | null) => void;
}) {
  const { c1, c2, bg1, fg, logoText, centerName } = tokens;
  const tag = card.tag || `CARD ${idx + 1}`;
  const headline = card.headline || "";
  const body = card.body || "";
  const bg = card.bg || null;

  const baseClass = "aspect-square rounded-3xl overflow-hidden relative flex flex-col";
  const pageNum = `${idx + 1} / ${total}`;

  switch (style) {
    case "ivory-serif":
      return (
        <div ref={refCb} className={`${baseClass} p-10`}
          style={{ background: bg ? undefined : "linear-gradient(160deg,#FAF6EE 0%,#EFE6D2 100%)", color: "#1F2937" }}>
          {bg && <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
          <div className="relative z-10 flex flex-col h-full justify-between gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: c1, color: bg1 }}>{logoText.slice(0,2)}</div>
                <div className="text-xs tracking-wider opacity-70">{centerName}</div>
              </div>
              <div className="text-[10px] tracking-[0.2em] opacity-60">{tag}</div>
            </div>
            <div className="space-y-5">
              <div className="h-px w-12" style={{ background: c1 }} />
              <div className="text-3xl leading-tight font-semibold" style={{ fontFamily: "'Instrument Serif',serif", wordBreak: "keep-all" }}>{headline}</div>
              <div className="text-[15px] leading-relaxed opacity-80" style={{ wordBreak: "keep-all" }}>{body}</div>
            </div>
            <div className="text-[10px] opacity-50 text-right">{pageNum}</div>
          </div>
        </div>
      );

    case "soft-pastel":
      return (
        <div ref={refCb} className={`${baseClass} p-10`}
          style={{ background: bg ? undefined : `linear-gradient(160deg, ${c1}22 0%, ${c2}22 60%, #ffffff 100%)`, color: "#1F2937" }}>
          {bg && <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />}
          <div className="relative z-10 flex flex-col h-full justify-between gap-6">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-[10px] tracking-widest">{tag}</Badge>
              <div className="text-xs opacity-70">{centerName}</div>
            </div>
            <div className="space-y-4">
              <div className="text-2xl leading-snug font-bold" style={{ wordBreak: "keep-all" }}>{headline}</div>
              <div className="text-sm leading-relaxed opacity-85" style={{ wordBreak: "keep-all" }}>{body}</div>
            </div>
            <div className="flex items-center justify-between text-[11px] opacity-60">
              <div>{logoText}</div><div>{pageNum}</div>
            </div>
          </div>
        </div>
      );

    case "magazine-bw":
      return (
        <div ref={refCb} className={`${baseClass} text-white`}
          style={{ background: bg ? "#000" : "#111" }}>
          {bg && <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />
          <div className="relative z-10 flex flex-col h-full justify-between p-10 gap-6">
            <div className="flex items-center justify-between">
              <div className="text-[10px] tracking-[0.4em] uppercase opacity-80">{tag}</div>
              <div className="text-xs opacity-80">{centerName}</div>
            </div>
            <div className="space-y-4">
              <div className="h-1 w-14" style={{ background: c1 }} />
              <div className="text-3xl leading-tight font-black" style={{ wordBreak: "keep-all" }}>{headline}</div>
              <div className="text-sm leading-relaxed opacity-90" style={{ wordBreak: "keep-all" }}>{body}</div>
            </div>
            <div className="flex items-center justify-between text-[10px] opacity-70">
              <div>{logoText}</div><div>{pageNum}</div>
            </div>
          </div>
        </div>
      );

    case "photo-overlay":
      return (
        <div ref={refCb} className={`${baseClass}`} style={{ background: bg ? "#0f172a" : `linear-gradient(160deg,${bg1} 0%, ${c2} 100%)` }}>
          {bg && <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)" }} />
          <div className="relative z-10 flex flex-col h-full justify-end p-10 gap-5 text-white">
            <div className="flex items-center gap-3 mb-auto">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center text-xs font-bold">{logoText.slice(0,2)}</div>
              <div className="text-xs opacity-80">{centerName}</div>
              <div className="ml-auto text-[10px] tracking-widest opacity-70">{tag}</div>
            </div>
            <div className="rounded-2xl p-5 backdrop-blur" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <div className="text-2xl font-semibold leading-snug" style={{ wordBreak: "keep-all" }}>{headline}</div>
              <div className="text-sm opacity-90 mt-3 leading-relaxed" style={{ wordBreak: "keep-all" }}>{body}</div>
            </div>
            <div className="text-[10px] opacity-70 text-right">{pageNum}</div>
          </div>
        </div>
      );

    case "rounded-poster":
      return (
        <div ref={refCb} className={`${baseClass} p-8`} style={{ background: bg ? undefined : `linear-gradient(160deg, ${c1} 0%, ${c2} 100%)`, color: "#1F2937" }}>
          {bg && <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />}
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between">
              <div className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest" style={{ background: "#fff", color: bg1 }}>{tag}</div>
              <div className="text-xs opacity-80">{centerName}</div>
            </div>
            <div className="rounded-3xl p-7 bg-white/85 backdrop-blur space-y-4 shadow-xl">
              <div className="text-2xl font-extrabold leading-snug" style={{ wordBreak: "keep-all" }}>{headline}</div>
              <div className="text-sm leading-relaxed opacity-80" style={{ wordBreak: "keep-all" }}>{body}</div>
            </div>
            <div className="flex justify-between items-center text-[11px] opacity-70">
              <div>{logoText}</div><div>{pageNum}</div>
            </div>
          </div>
        </div>
      );

    case "minimal-border":
      return (
        <div ref={refCb} className={`${baseClass} p-10`} style={{ background: "#ffffff", color: "#0F172A", border: "1px solid #E5E7EB" }}>
          {bg && <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />}
          <div className="relative z-10 flex flex-col h-full justify-between gap-6">
            <div className="flex items-center justify-between">
              <div className="text-xs tracking-wider opacity-60">{centerName}</div>
              <div className="text-[10px] tracking-[0.2em]" style={{ color: c1 }}>{tag}</div>
            </div>
            <div className="space-y-5">
              <div className="text-3xl font-bold leading-tight" style={{ wordBreak: "keep-all" }}>{headline}</div>
              <div className="text-[15px] leading-relaxed opacity-80" style={{ wordBreak: "keep-all" }}>{body}</div>
            </div>
            <div className="flex items-center justify-between text-[10px] opacity-50">
              <div className="h-px w-10" style={{ background: c1 }} />
              <div>{pageNum}</div>
            </div>
          </div>
        </div>
      );

    case "gold-dark":
    default:
      return (
        <div ref={refCb} className={`${baseClass} p-10 text-white`}
          style={{ background: bg ? "#0F172A" : `linear-gradient(160deg, ${bg1} 0%, ${c2} 100%)` }}>
          {bg && <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
          <div className="relative z-10 flex flex-col h-full justify-between gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: c1, color: bg1 }}>{logoText.slice(0,2)}</div>
                <div className="text-xs opacity-80">{centerName}</div>
              </div>
              <div className="text-[10px] tracking-[0.3em] opacity-70">{tag}</div>
            </div>
            <div className="space-y-4">
              <div className="h-0.5 w-12" style={{ background: c1 }} />
              <div className="text-2xl font-semibold leading-snug" style={{ wordBreak: "keep-all" }}>{headline}</div>
              <div className="text-sm leading-relaxed opacity-90" style={{ wordBreak: "keep-all" }}>{body}</div>
            </div>
            <div className="text-[10px] opacity-60 text-right">{pageNum}</div>
          </div>
        </div>
      );
  }
}

// =================== Mini Style Preview ===================
// 스타일 선택 칩에서 보이는 실제 카드와 동일한 축소 프리뷰.
// 생성 전/후 모두 동일한 렌더러로 미리보기를 제공한다.
function MiniStylePreview({
  style, tokens, sample,
}: {
  style: CardNewsStyleKey;
  tokens: RenderTokens;
  sample: CardItem;
}) {
  // 360px 카드를 100px로 축소 (스케일 0.278). 컨테이너는 정사각 100px.
  const PREVIEW = 100;
  const BASE = 360;
  const scale = PREVIEW / BASE;
  return (
    <div className="relative overflow-hidden" style={{ width: PREVIEW, height: PREVIEW }}>
      <div
        style={{ width: BASE, height: BASE, transform: `scale(${scale})`, transformOrigin: "top left" }}
        className="pointer-events-none"
      >
        <CardRender card={sample} idx={0} total={1} style={style} tokens={tokens} refCb={() => {}} />
      </div>
    </div>
  );
}

// =================== Page ===================
export default function CardNewsStudioPage() {
  const { toast } = useToast();
  const centerId = getActiveCenterId();

  const [step, setStep] = useState(0);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [manualText, setManualText] = useState("");

  const [anonLoading, setAnonLoading] = useState(false);
  const [anonText, setAnonText] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [reviewed, setReviewed] = useState(false);

  const [genLoading, setGenLoading] = useState(false);
  const [cardCount, setCardCount] = useState(4);
  const [keywords, setKeywords] = useState("");
  const [result, setResult] = useState<GenResult | null>(null);

  const [branding, setBranding] = useState<Branding>({ c1: "#C8B88A", c2: "#1F2937", logoBg: "#0F172A", logoFg: "#ffffff" });
  const [centerName, setCenterName] = useState("");
  const [centerType, setCenterType] = useState("발달지원센터");
  const [styleKey, setStyleKey] = useState<CardNewsStyleKey>("gold-dark");

  const [drafts, setDrafts] = useState<DraftRow[]>([]);
  const [savingDraft, setSavingDraft] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

  // 생성 내역 필터/검색
  const [draftSearch, setDraftSearch] = useState("");
  const [draftMonth, setDraftMonth] = useState<string>("all"); // YYYY-MM or "all"
  const [draftStyle, setDraftStyle] = useState<string>("all");

  // 숏폼 베타 신청 상태
  const [shortsOpen, setShortsOpen] = useState(false);
  const [shortsNote, setShortsNote] = useState("");
  const [shortsContact, setShortsContact] = useState("");
  const [shortsSubmitting, setShortsSubmitting] = useState(false);
  const [shortsRequested, setShortsRequested] = useState(false);

  // 로드: 발행된 노트 + 브랜딩 + 저장된 카드뉴스 내역
  useEffect(() => {
    if (!centerId) return;
    (async () => {
      const [rs, org, ds] = await Promise.all([
        supabase
          .from("center_parent_reports")
          .select("id, week_key, period_start, period_end, period_type, title, ai_draft_json, client_id")
          .eq("center_id", centerId).eq("status", "published")
          .order("published_at", { ascending: false }).limit(50),
        supabase.from("center_organizations").select("name, branding").eq("id", centerId).maybeSingle(),
        supabase.from("card_news_drafts")
          .select("id, title, created_at, updated_at, style_key, anonymized_text, result_json, branding")
          .eq("center_id", centerId).order("updated_at", { ascending: false }).limit(30),
      ]);
      setReports((rs.data as Report[]) || []);
      if ((org.data as any)?.name) setCenterName((org.data as any).name);
      const b: any = (org.data as any)?.branding ?? {};
      setBranding((prev) => ({ ...prev, ...b }));
      setDrafts((ds.data as DraftRow[]) || []);
    })();
  }, [centerId]);

  const selected = useMemo(() => reports.find((r) => r.id === selectedReportId) || null, [reports, selectedReportId]);
  const sourceText = useMemo(() => {
    if (manualText.trim()) return manualText.trim();
    if (selected) return flattenDraft(selected.ai_draft_json);
    return "";
  }, [manualText, selected]);

  async function runAnonymize() {
    if (!sourceText) { toast({ title: "원본 노트를 선택하거나 붙여넣어 주세요" }); return; }
    setAnonLoading(true); setReviewed(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("https://hrcqxjetmzxoephgyjlb.supabase.co/functions/v1/card-news-anonymize", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify({ source_text: sourceText, source_type: selected?.period_type ?? "weekly" }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "anonymize failed");
      setAnonText(j.anonymized_text || "");
      setWarnings(Array.isArray(j.warnings) ? j.warnings : []);
      setStep(1);
    } catch (e: any) {
      toast({ title: "익명화 실패", description: e?.message ?? String(e), variant: "destructive" });
    } finally { setAnonLoading(false); }
  }

  async function runGenerate() {
    if (!reviewed) { toast({ title: "검수 완료 후 진행 가능합니다", variant: "destructive" }); return; }
    if (!anonText.trim()) { toast({ title: "익명화된 본문이 비어 있습니다", variant: "destructive" }); return; }
    setGenLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("https://hrcqxjetmzxoephgyjlb.supabase.co/functions/v1/card-news-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify({
          anonymized_text: anonText, center_name: centerName, center_type: centerType,
          card_count: cardCount, keywords: keywords.split(/[, ]+/).filter(Boolean),
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "generate failed");
      setResult({
        ...(j as GenResult),
        cards: (j.cards || []).slice(0, 5).map((c: any) => ({ tag: c.tag, headline: c.headline, body: c.body, bg: null })),
      });
      setCurrentDraftId(null);
      setStep(2);
    } catch (e: any) {
      toast({ title: "생성 실패", description: e?.message ?? String(e), variant: "destructive" });
    } finally { setGenLoading(false); }
  }

  async function copy(text: string, label = "복사됨") {
    try { await navigator.clipboard.writeText(text); toast({ title: label }); }
    catch { toast({ title: "복사 실패", variant: "destructive" }); }
  }

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  async function downloadCard(idx: number) {
    const el = cardRefs.current[idx];
    if (!el) return;
    const canvas = await html2canvas(el, { backgroundColor: null, scale: 2, useCORS: true, allowTaint: true });
    const link = document.createElement("a");
    link.download = `cardnews-${idx + 1}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }
  async function downloadAll() {
    for (let i = 0; i < (result?.cards.length ?? 0); i++) await downloadCard(i);
  }

  function updateCard(i: number, patch: Partial<CardItem>) {
    if (!result) return;
    const cards = result.cards.map((c, idx) => idx === i ? { ...c, ...patch } : c);
    setResult({ ...result, cards });
  }
  function addCard() {
    if (!result || result.cards.length >= 5) return;
    setResult({
      ...result,
      cards: [...result.cards, { tag: `CARD ${result.cards.length + 1}`, headline: "새 카드 제목", body: "여기에 본문을 입력하세요." , bg: null }],
    });
  }
  function removeCard(i: number) {
    if (!result || result.cards.length <= 1) return;
    setResult({ ...result, cards: result.cards.filter((_, idx) => idx !== i) });
  }
  async function pickCardBg(i: number, file: File) {
    try {
      const url = await fileToDataUrl(file);
      updateCard(i, { bg: url });
    } catch { toast({ title: "이미지를 불러올 수 없습니다", variant: "destructive" }); }
  }

  // =================== Save / Load ===================
  async function saveDraft() {
    if (!centerId || !result) return;
    setSavingDraft(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다");
      const payload = {
        center_id: centerId,
        owner_id: user.id,
        title: result.cards?.[0]?.headline?.slice(0, 60) || (selected?.title ?? "카드뉴스"),
        source_type: selected?.period_type ?? (manualText ? "manual" : null),
        source_report_id: selected?.id ?? null,
        anonymized_text: anonText,
        result_json: result as any,
        style_key: styleKey,
        branding: branding as any,
      };
      if (currentDraftId) {
        const { error } = await supabase.from("card_news_drafts").update({
          title: payload.title, anonymized_text: payload.anonymized_text,
          result_json: payload.result_json, style_key: payload.style_key, branding: payload.branding,
        }).eq("id", currentDraftId);
        if (error) throw error;
        toast({ title: "내역 업데이트됨" });
      } else {
        const { data, error } = await supabase.from("card_news_drafts").insert(payload).select("id").single();
        if (error) throw error;
        setCurrentDraftId(data.id);
        toast({ title: "생성 내역에 저장됨" });
      }
      const { data: ds } = await supabase.from("card_news_drafts")
        .select("id, title, created_at, updated_at, style_key, anonymized_text, result_json, branding")
        .eq("center_id", centerId).order("updated_at", { ascending: false }).limit(30);
      setDrafts((ds as DraftRow[]) || []);
    } catch (e: any) {
      toast({ title: "저장 실패", description: e?.message ?? String(e), variant: "destructive" });
    } finally { setSavingDraft(false); }
  }

  function loadDraft(d: DraftRow) {
    setResult(d.result_json as GenResult);
    setAnonText(d.anonymized_text ?? "");
    setStyleKey((d.style_key as CardNewsStyleKey) || "gold-dark");
    setBranding((prev) => ({ ...prev, ...(d.branding ?? {}) }));
    setReviewed(true);
    setCurrentDraftId(d.id);
    setStep(2);
    toast({ title: `"${d.title ?? "카드뉴스"}" 불러옴` });
  }

  async function deleteDraft(id: string) {
    if (!confirm("이 카드뉴스 내역을 삭제할까요? 되돌릴 수 없습니다.")) return;
    const { error } = await supabase.from("card_news_drafts").delete().eq("id", id);
    if (error) { toast({ title: "삭제 실패", description: error.message, variant: "destructive" }); return; }
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    if (currentDraftId === id) setCurrentDraftId(null);
    toast({ title: "삭제됨" });
  }

  const tokens: RenderTokens = {
    c1: branding.c1 || "#C8B88A",
    c2: branding.c2 || "#1F2937",
    bg1: branding.logoBg || "#0F172A",
    fg: branding.logoFg || "#ffffff",
    logoText: branding.logoText || centerName.slice(0, 2) || "C",
    centerName: centerName || "",
  };

  return (
    <div className="space-y-8 pb-24">
      <Helmet><title>카드뉴스 만들기 · 마케팅 스튜디오</title></Helmet>

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">치료노트 → 카드뉴스</h1>
        <p className="text-sm text-muted-foreground">
          실제 노트를 익명화한 뒤 카드뉴스 이미지와 SNS 카피를 만들어요. 생성 내역에 저장하면 언제든 다시 열어 복사·다운로드할 수 있어요.
        </p>
      </header>

      {/* Stepper */}
      <div className="flex items-center gap-2 text-sm flex-wrap">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => setStep(i)}
              className={`px-3 py-1.5 rounded-full border transition ${step === i ? "bg-foreground text-background border-foreground" : "bg-background text-muted-foreground hover:text-foreground"}`}
            >{s}</button>
            {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Step 0 */}
      {step === 0 && (
        <>
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <h2 className="font-medium">발행된 노트 선택</h2>
            </div>
            {reports.length === 0 ? (
              <p className="text-sm text-muted-foreground">발행된 주간/월간 노트가 아직 없어요. 아래 텍스트 입력으로 진행할 수 있어요.</p>
            ) : (
              <div className="grid gap-2 max-h-72 overflow-auto">
                {reports.map((r) => (
                  <button key={r.id} onClick={() => setSelectedReportId(r.id)}
                    className={`text-left p-3 rounded-xl border transition ${selectedReportId === r.id ? "border-foreground bg-muted/30" : "hover:bg-muted/20"}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium truncate">{r.title || `${r.period_type === "monthly" ? "월간" : "주간"} 리포트`}</div>
                      <div className="text-xs text-muted-foreground shrink-0">{r.week_key || `${r.period_start} ~ ${r.period_end}`}</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{flattenDraft(r.ai_draft_json).slice(0, 120)}</div>
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-2 pt-2 border-t">
              <Label className="text-xs text-muted-foreground">또는 직접 노트 본문 붙여넣기</Label>
              <Textarea rows={5} value={manualText} onChange={(e) => setManualText(e.target.value)} placeholder="이번 주 회기 관찰 내용을 붙여넣어도 됩니다…" />
            </div>

            <div className="flex justify-end">
              <Button onClick={runAnonymize} disabled={!sourceText || anonLoading}>
                {anonLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                AI 익명화 시작
              </Button>
            </div>
          </Card>

          {/* 생성 내역 */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <h2 className="font-medium">생성 내역</h2>
              <span className="text-xs text-muted-foreground">({drafts.length})</span>
            </div>
            {drafts.length === 0 ? (
              <p className="text-sm text-muted-foreground">아직 저장된 카드뉴스가 없어요. 편집 화면에서 "내역에 저장"을 누르면 여기로 모입니다.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {drafts.map((d) => (
                  <div key={d.id} className="p-4 rounded-xl border hover:bg-muted/30 transition space-y-2">
                    <div className="text-sm font-medium line-clamp-1">{d.title ?? "카드뉴스"}</div>
                    <div className="text-[11px] text-muted-foreground">{new Date(d.updated_at).toLocaleString("ko-KR")} · {d.style_key}</div>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => loadDraft(d)}>불러오기</Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteDraft(d.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <Card className="p-6 space-y-5">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-900">
              <div className="font-medium">게시 전 개인정보 노출 여부를 반드시 확인하세요</div>
              <div className="text-xs mt-0.5">아동/이용자 이름·생년월일·구체 진단명·가족 정보가 남아있지 않은지 사람 눈으로 검수해야 다음 단계로 진행할 수 있어요.</div>
            </div>
          </div>

          {warnings.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <div className="font-medium mb-1">AI가 추가 확인을 권한 항목</div>
              <ul className="list-disc pl-4 space-y-0.5">{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
            </div>
          )}

          <div>
            <Label className="text-xs text-muted-foreground">익명화된 본문 (직접 수정 가능)</Label>
            <Textarea rows={10} value={anonText} onChange={(e) => { setAnonText(e.target.value); setReviewed(false); }} />
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">카드 수</Label>
              <Input type="number" min={1} max={5} value={cardCount} onChange={(e) => setCardCount(Math.max(1, Math.min(5, Number(e.target.value) || 4)))} />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">강조 키워드 (쉼표 구분, 선택)</Label>
              <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="언어치료, 사회성, 부모상담" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input type="checkbox" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} className="w-4 h-4" />
            위 본문에 개인정보가 남아있지 않음을 확인했습니다 (검수 완료)
          </label>

          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>이전</Button>
            <Button onClick={runGenerate} disabled={!reviewed || genLoading}>
              {genLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              카드뉴스 · SNS 카피 생성
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2 */}
      {step === 2 && result && (
        <div className="space-y-8">
          {/* 브랜딩 + 스타일 */}
          <Card className="p-6 space-y-5">
            <div className="grid sm:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs">센터명</Label>
                <Input value={centerName} onChange={(e) => setCenterName(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">로고 텍스트</Label>
                <Input value={branding.logoText || centerName.slice(0, 2)} onChange={(e) => setBranding({ ...branding, logoText: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">포인트 컬러</Label>
                <Input type="color" value={branding.c1 || "#C8B88A"} onChange={(e) => setBranding({ ...branding, c1: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">배경(딥)</Label>
                <Input type="color" value={branding.logoBg || "#0F172A"} onChange={(e) => setBranding({ ...branding, logoBg: e.target.value })} />
              </div>
            </div>

            <div>
              <Label className="text-xs mb-2 block">카드 스타일</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {CARD_STYLES.map((s) => (
                  <button key={s.key} onClick={() => setStyleKey(s.key)} type="button"
                    className={`text-left rounded-xl overflow-hidden border transition ${styleKey === s.key ? "ring-2 ring-foreground border-foreground" : "border-border hover:border-foreground/40"}`}>
                    <div className="h-14 w-full" style={{ background: s.thumb }} />
                    <div className="p-2">
                      <div className="text-xs font-medium">{s.label}</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-2">{s.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* 카드뉴스 편집 */}
          <section className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-medium">카드뉴스 ({result.cards.length}/5장) — 문구·이미지 직접 수정 가능</h2>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={addCard} disabled={result.cards.length >= 5}>
                  <Plus className="w-4 h-4 mr-1" />카드 추가
                </Button>
                <Button size="sm" variant="outline" onClick={downloadAll}>
                  <Download className="w-4 h-4 mr-2" />전체 PNG
                </Button>
                <Button size="sm" onClick={saveDraft} disabled={savingDraft}>
                  {savingDraft ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {currentDraftId ? "내역 업데이트" : "내역에 저장"}
                </Button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {result.cards.map((c, i) => (
                <div key={i} className="space-y-3">
                  <CardRender card={c} idx={i} total={result.cards.length} style={styleKey} tokens={tokens}
                    refCb={(el) => { cardRefs.current[i] = el; }} />

                  {/* 인라인 편집 패널 */}
                  <div className="p-3 rounded-xl border bg-muted/20 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input className="h-8 text-xs" value={c.tag ?? ""} placeholder="라벨 (예: 사례 01)"
                        onChange={(e) => updateCard(i, { tag: e.target.value })} />
                      <Button size="sm" variant="ghost" onClick={() => removeCard(i)} disabled={result.cards.length <= 1}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <Input className="h-9" value={c.headline} placeholder="헤드라인"
                      onChange={(e) => updateCard(i, { headline: e.target.value })} />
                    <Textarea rows={3} value={c.body} placeholder="본문"
                      onChange={(e) => updateCard(i, { body: e.target.value })} />
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <label className="inline-flex items-center text-xs px-3 py-1.5 rounded-md border cursor-pointer hover:bg-background">
                        <ImagePlus className="w-3.5 h-3.5 mr-1" />배경 이미지
                        <input type="file" accept="image/*" className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) pickCardBg(i, f); e.currentTarget.value = ""; }} />
                      </label>
                      {c.bg && (
                        <Button size="sm" variant="ghost" onClick={() => updateCard(i, { bg: null })}>
                          <RotateCcw className="w-3.5 h-3.5 mr-1" />배경 제거
                        </Button>
                      )}
                      <div className="ml-auto flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => downloadCard(i)}>
                          <Download className="w-3.5 h-3.5 mr-1" />PNG
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => copy(`${c.headline}\n\n${c.body}`, "카드 본문 복사됨")}>
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SNS 카피 */}
          <section className="grid lg:grid-cols-2 gap-4">
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">인스타그램 게시글</h3>
                <Button size="sm" variant="outline" onClick={() => copy(result.instagram)}><Copy className="w-3.5 h-3.5 mr-1" />복사</Button>
              </div>
              <Textarea rows={10} value={result.instagram} onChange={(e) => setResult({ ...result, instagram: e.target.value })} />
            </Card>

            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">네이버 블로그</h3>
                <Button size="sm" variant="outline" onClick={() => copy(`${result.naver_blog.title}\n\n${result.naver_blog.body}`)}><Copy className="w-3.5 h-3.5 mr-1" />복사</Button>
              </div>
              <Input value={result.naver_blog.title} onChange={(e) => setResult({ ...result, naver_blog: { ...result.naver_blog, title: e.target.value } })} placeholder="블로그 제목" />
              <Textarea rows={14} value={result.naver_blog.body} onChange={(e) => setResult({ ...result, naver_blog: { ...result.naver_blog, body: e.target.value } })} />
            </Card>

            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">짧은 홍보 문구 (문자/카톡)</h3>
                <Button size="sm" variant="outline" onClick={() => copy(result.short_promo)}><Copy className="w-3.5 h-3.5 mr-1" />복사</Button>
              </div>
              <Textarea rows={3} value={result.short_promo} onChange={(e) => setResult({ ...result, short_promo: e.target.value })} />
            </Card>

            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">SEO 해시태그 · 키워드</h3>
                <Button size="sm" variant="outline" onClick={() => copy(result.hashtags.join(" "))}><Copy className="w-3.5 h-3.5 mr-1" />해시태그 복사</Button>
              </div>
              <div className="flex flex-wrap gap-1.5">{result.hashtags.map((h, i) => <Badge key={i} variant="secondary">{h}</Badge>)}</div>
              <div className="text-xs text-muted-foreground">키워드: {result.seo_keywords.join(", ")}</div>
            </Card>
          </section>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>이전 (검수로 돌아가기)</Button>
            <Button variant="outline" onClick={() => { setStep(0); setResult(null); setAnonText(""); setReviewed(false); setSelectedReportId(null); setManualText(""); setCurrentDraftId(null); }}>
              처음부터 다시
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
