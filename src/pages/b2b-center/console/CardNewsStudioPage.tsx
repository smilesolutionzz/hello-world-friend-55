import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import html2canvas from "html2canvas";
import { supabase } from "@/integrations/supabase/client";
import { getActiveCenterId } from "@/lib/b2bCenter/centerClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldAlert, Sparkles, Copy, Download, Check, ChevronRight, FileText } from "lucide-react";

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
type CardItem = { tag?: string; headline: string; body: string };
type GenResult = {
  cards: CardItem[];
  instagram: string;
  naver_blog: { title: string; body: string };
  short_promo: string;
  hashtags: string[];
  seo_keywords: string[];
};

const STEPS = ["1. 노트 선택", "2. 익명화 · 검수", "3. 카드뉴스 · SNS 카피"] as const;

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

  // 로드: 발행된 주간/월간 노트
  useEffect(() => {
    if (!centerId) return;
    (async () => {
      const [{ data: rs }, { data: org }] = await Promise.all([
        supabase
          .from("center_parent_reports")
          .select("id, week_key, period_start, period_end, period_type, title, ai_draft_json, client_id")
          .eq("center_id", centerId)
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(50),
        supabase.from("center_organizations").select("name, branding").eq("id", centerId).maybeSingle(),
      ]);
      setReports(rs || []);
      if (org?.name) setCenterName(org.name);
      const b: any = org?.branding ?? {};
      setBranding((prev) => ({ ...prev, ...b }));
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
          anonymized_text: anonText,
          center_name: centerName,
          center_type: centerType,
          card_count: cardCount,
          keywords: keywords.split(/[, ]+/).filter(Boolean),
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "generate failed");
      setResult(j as GenResult);
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
    const canvas = await html2canvas(el, { backgroundColor: null, scale: 2, useCORS: true });
    const link = document.createElement("a");
    link.download = `cardnews-${idx + 1}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }
  async function downloadAll() {
    for (let i = 0; i < (result?.cards.length ?? 0); i++) await downloadCard(i);
  }

  return (
    <div className="space-y-6 pb-24">
      <Helmet><title>카드뉴스 만들기 · 마케팅 스튜디오</title></Helmet>

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">치료노트 → 카드뉴스</h1>
        <p className="text-sm text-muted-foreground">
          실제 노트를 익명화한 뒤 카드뉴스 이미지와 SNS 카피를 만들어요. 자동 업로드는 하지 않습니다 — 생성 → 복사/다운로드까지.
        </p>
      </header>

      {/* Stepper */}
      <div className="flex items-center gap-2 text-sm">
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

      {/* Step 0: 노트 선택 */}
      {step === 0 && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <h2 className="font-medium">발행된 노트 선택</h2>
          </div>
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">발행된 주간/월간 노트가 아직 없어요. 아래 텍스트 입력으로 진행할 수 있어요.</p>
          ) : (
            <div className="grid gap-2 max-h-72 overflow-auto">
              {reports.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedReportId(r.id)}
                  className={`text-left p-3 rounded-lg border transition ${selectedReportId === r.id ? "border-foreground bg-muted/30" : "hover:bg-muted/20"}`}
                >
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
      )}

      {/* Step 1: 익명화 검수 */}
      {step === 1 && (
        <Card className="p-5 space-y-4">
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

      {/* Step 2: 결과 */}
      {step === 2 && result && (
        <div className="space-y-6">
          {/* 브랜딩 */}
          <Card className="p-4 grid sm:grid-cols-4 gap-3">
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
          </Card>

          {/* 카드뉴스 */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">카드뉴스 ({result.cards.length}장)</h2>
              <Button size="sm" variant="outline" onClick={downloadAll}><Download className="w-4 h-4 mr-2" />전체 PNG 다운로드</Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.cards.map((c, i) => (
                <div key={i} className="space-y-2">
                  <div
                    ref={(el) => { cardRefs.current[i] = el; }}
                    className="aspect-square rounded-2xl overflow-hidden relative p-7 flex flex-col justify-between text-white"
                    style={{ background: `linear-gradient(160deg, ${branding.logoBg || "#0F172A"} 0%, ${branding.c2 || "#1F2937"} 100%)` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: branding.c1, color: branding.logoBg }}>
                          {(branding.logoText || centerName || "C").slice(0, 2)}
                        </div>
                        <div className="text-xs opacity-80">{centerName}</div>
                      </div>
                      <div className="text-[10px] tracking-widest opacity-70">{c.tag || `CARD ${i + 1}`}</div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-0.5 w-10" style={{ background: branding.c1 }} />
                      <div className="text-xl font-semibold leading-snug" style={{ wordBreak: "keep-all" }}>{c.headline}</div>
                      <div className="text-sm leading-relaxed opacity-90" style={{ wordBreak: "keep-all" }}>{c.body}</div>
                    </div>
                    <div className="text-[10px] opacity-60 text-right">{i + 1} / {result.cards.length}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => downloadCard(i)}><Download className="w-3.5 h-3.5 mr-1" />PNG</Button>
                    <Button size="sm" variant="ghost" onClick={() => copy(`${c.headline}\n\n${c.body}`, "카드 본문 복사됨")}><Copy className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SNS 카피 */}
          <section className="grid lg:grid-cols-2 gap-4">
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">인스타그램 게시글</h3>
                <Button size="sm" variant="outline" onClick={() => copy(result.instagram)}><Copy className="w-3.5 h-3.5 mr-1" />복사</Button>
              </div>
              <Textarea rows={10} value={result.instagram} onChange={(e) => setResult({ ...result, instagram: e.target.value })} />
            </Card>

            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">네이버 블로그</h3>
                <Button size="sm" variant="outline" onClick={() => copy(`${result.naver_blog.title}\n\n${result.naver_blog.body}`)}><Copy className="w-3.5 h-3.5 mr-1" />복사</Button>
              </div>
              <Input value={result.naver_blog.title} onChange={(e) => setResult({ ...result, naver_blog: { ...result.naver_blog, title: e.target.value } })} placeholder="블로그 제목" />
              <Textarea rows={14} value={result.naver_blog.body} onChange={(e) => setResult({ ...result, naver_blog: { ...result.naver_blog, body: e.target.value } })} />
            </Card>

            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">짧은 홍보 문구 (문자/카톡)</h3>
                <Button size="sm" variant="outline" onClick={() => copy(result.short_promo)}><Copy className="w-3.5 h-3.5 mr-1" />복사</Button>
              </div>
              <Textarea rows={3} value={result.short_promo} onChange={(e) => setResult({ ...result, short_promo: e.target.value })} />
            </Card>

            <Card className="p-4 space-y-3">
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
            <Button variant="outline" onClick={() => { setStep(0); setResult(null); setAnonText(""); setReviewed(false); setSelectedReportId(null); setManualText(""); }}>처음부터 다시</Button>
          </div>
        </div>
      )}
    </div>
  );
}
