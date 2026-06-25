import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Download, Palette, Sparkles, Building2, User2, Eye, Save, FileText, Check, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import html2pdf from "html2pdf.js";
import {
  DEFAULT_TEMPLATE,
  MONTHLY_SECTION_KEYS,
  WEEKLY_SECTION_KEYS,
  SUGGESTED_MONTHLY_EXTRAS,
  SUGGESTED_WEEKLY_EXTRAS,
  resolveTemplate,
  makeExtraId,
  type ReportTemplate,
  type ExtraSection,
} from "@/lib/b2bCenter/reportTemplate";

type Ctx = { centerId: string; demo?: boolean };

const PRESETS = [
  { label: "따뜻한 오렌지", c1: "#F59E0B", c2: "#FB7185", logoBg: "#FFFFFF", logoFg: "#F59E0B" },
  { label: "차분한 네이비", c1: "#1E3A8A", c2: "#3B82F6", logoBg: "#FFFFFF", logoFg: "#1E3A8A" },
  { label: "포레스트 그린", c1: "#047857", c2: "#10B981", logoBg: "#FFFFFF", logoFg: "#047857" },
  { label: "AIHPRO 골드", c1: "#0F172A", c2: "#1E293B", logoBg: "#C8B88A", logoFg: "#0F172A" },
];

export default function WhitelabelReportPreviewPage() {
  const { centerId, demo } = useOutletContext<Ctx>();
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

  const [centerName, setCenterName] = useState("햇살아동발달센터");
  const [tagline, setTagline] = useState("아이의 한 달, 따뜻하게 정리해드립니다");
  const [therapist, setTherapist] = useState("이지영 언어재활사");
  const [logoText, setLogoText] = useState("햇");
  const [phone, setPhone] = useState("02-000-0000");
  const [address, setAddress] = useState("서울 강동구");
  const [c1, setC1] = useState(PRESETS[0].c1);
  const [c2, setC2] = useState(PRESETS[0].c2);
  const [logoBg, setLogoBg] = useState(PRESETS[0].logoBg);
  const [logoFg, setLogoFg] = useState(PRESETS[0].logoFg);
  const [childName, setChildName] = useState("지호 (만 4세 7개월)");
  const [period, setPeriod] = useState("2026년 5월");
  const [busy, setBusy] = useState(false);
  const [template, setTemplate] = useState<ReportTemplate>(DEFAULT_TEMPLATE);
  const [tplTab, setTplTab] = useState<"monthly" | "weekly">("monthly");

  const applyPreset = (p: typeof PRESETS[number]) => {
    setC1(p.c1); setC2(p.c2); setLogoBg(p.logoBg); setLogoFg(p.logoFg);
  };

  const headerGradient = useMemo(() => `linear-gradient(135deg, ${c1}, ${c2})`, [c1, c2]);

  // 기관에 저장된 브랜딩이 있으면 자동으로 불러옴
  useEffect(() => {
    if (demo || !centerId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("center_organizations")
        .select("name, phone, address, branding")
        .eq("id", centerId)
        .maybeSingle();
      if (cancelled || !data) return;
      const b: any = data.branding ?? {};
      if (data.name) setCenterName(data.name);
      if (data.phone) setPhone(data.phone);
      if (data.address) setAddress(data.address);
      if (b.tagline) setTagline(b.tagline);
      if (b.therapist) setTherapist(b.therapist);
      if (b.logoText) setLogoText(b.logoText);
      if (b.c1) setC1(b.c1);
      if (b.c2) setC2(b.c2);
      if (b.logoBg) setLogoBg(b.logoBg);
      if (b.logoFg) setLogoFg(b.logoFg);
      setTemplate(resolveTemplate(b));
    })();
    return () => { cancelled = true; };
  }, [centerId, demo]);

  const saveBranding = async () => {
    if (demo) { toast({ title: "데모 모드에서는 저장되지 않아요" }); return; }
    if (!centerId) { toast({ title: "기관 선택이 필요합니다", variant: "destructive" }); return; }
    setBusy(true);
    try {
      const { error } = await supabase
        .from("center_organizations")
        .update({
          name: centerName,
          phone,
          address,
          branding: { tagline, therapist, logoText, c1, c2, logoBg, logoFg, template },
        })
        .eq("id", centerId);
      if (error) throw error;
      toast({ title: "브랜딩·템플릿이 저장됐어요", description: "다음 발행/재발행되는 주간 노트와 부모 월간 리포트부터 새 템플릿이 자동 적용됩니다. 이미 발행된 리포트는 그대로 유지됩니다." });
    } catch (e: any) {
      toast({ title: "저장 실패", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const downloadPDF = async () => {
    if (!previewRef.current) return;
    setBusy(true);
    try {
      await html2pdf().set({
        margin: [8, 8, 8, 8],
        filename: `${centerName}_부모리포트_${period.replace(/\s/g, "")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      } as any).from(previewRef.current).save();
      toast({ title: "PDF 다운로드 완료", description: `${centerName} 명의로 발행되었습니다.` });
    } catch (e: any) {
      toast({ title: "PDF 생성 실패", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">부모 리포트 — 화이트라벨 미리보기</h1>
          <p className="text-xs text-neutral-500 mt-1">
            기관 로고·명의·강조색을 설정해 우리 기관 명의의 PDF 샘플을 즉시 만들어보세요.
            저장하면 <b>다음 발행되는 부모 월간 리포트부터 자동 적용</b>됩니다.
            실제 발행은 <b>부모 월간 리포트</b> 페이지에서 진행합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={saveBranding}
            disabled={busy || demo}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C8B88A] text-white text-xs whitespace-nowrap disabled:opacity-50"
            title="이 설정을 기관 브랜딩으로 저장 — 부모 월간 리포트에 자동 적용됩니다"
          >
            <Save className="w-3.5 h-3.5" />
            {demo ? "데모(저장 불가)" : "기관 브랜딩으로 저장"}
          </button>
          <button
            onClick={downloadPDF}
            disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 text-white text-xs whitespace-nowrap disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-[#C8B88A]" />
            {busy ? "처리 중…" : "PDF 다운로드"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        {/* === Settings === */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
              <Building2 className="w-4 h-4 text-[#C8B88A]" /> 기관 정보
            </div>
            <Field label="기관명" value={centerName} onChange={setCenterName} />
            <Field label="태그라인" value={tagline} onChange={setTagline} />
            <Field label="로고 이니셜 (1~2자)" value={logoText} onChange={setLogoText} maxLength={2} />
            <Field label="대표 연락처" value={phone} onChange={setPhone} />
            <Field label="주소" value={address} onChange={setAddress} />
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
              <User2 className="w-4 h-4 text-[#C8B88A]" /> 발신자 명의
            </div>
            <Field label="치료사 / 발신자" value={therapist} onChange={setTherapist} />
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
              <Palette className="w-4 h-4 text-[#C8B88A]" /> 강조색
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  className="border border-neutral-200 rounded-lg p-2 text-xs text-left hover:bg-neutral-50"
                >
                  <div className="h-6 rounded mb-1.5" style={{ background: `linear-gradient(135deg, ${p.c1}, ${p.c2})` }} />
                  {p.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <ColorField label="강조색 1" value={c1} onChange={setC1} />
              <ColorField label="강조색 2" value={c2} onChange={setC2} />
              <ColorField label="로고 배경" value={logoBg} onChange={setLogoBg} />
              <ColorField label="로고 글자" value={logoFg} onChange={setLogoFg} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
              <Sparkles className="w-4 h-4 text-[#C8B88A]" /> 샘플 데이터
            </div>
            <Field label="아이 이름 / 월령" value={childName} onChange={setChildName} />
            <Field label="기간" value={period} onChange={setPeriod} />
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              * 미리보기는 화이트라벨 톤을 확인하기 위한 샘플 콘텐츠입니다.
              실제 부모 리포트는 회기 데이터 기반으로 생성됩니다.
            </p>
          </div>

          {/* === Report template editor === */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
                <FileText className="w-4 h-4 text-[#C8B88A]" /> 노트·리포트 템플릿
              </div>
              <div className="inline-flex rounded-full bg-neutral-100 p-0.5 text-[11px]">
                {(["monthly", "weekly"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTplTab(t)}
                    className={`px-3 py-1 rounded-full ${tplTab === t ? "bg-white shadow-sm font-semibold" : "text-neutral-500"}`}
                  >
                    {t === "monthly" ? "월간 리포트" : "주간 노트"}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              섹션을 켜고/끄거나 제목 문구를 우리 기관 톤으로 바꿔보세요. 보호자께 보내는 인사말·맺음말도 추가할 수 있어요.
              저장 후 발행되는 노트부터 자동 적용됩니다.
            </p>

            <TemplateSectionEditor
              keys={tplTab === "monthly" ? (MONTHLY_SECTION_KEYS as any) : (WEEKLY_SECTION_KEYS as any)}
              value={template[tplTab].sections}
              onChange={(sections) =>
                setTemplate({ ...template, [tplTab]: { ...template[tplTab], sections } })
              }
            />

            <div className="space-y-2 pt-2">
              <label className="block">
                <span className="text-[11px] text-neutral-500">보호자께 인사말 (선택)</span>
                <textarea
                  value={template[tplTab].intro}
                  onChange={(e) => setTemplate({ ...template, [tplTab]: { ...template[tplTab], intro: e.target.value } })}
                  rows={2}
                  placeholder="예) 한 달간의 작은 변화들을 따뜻한 마음으로 정리했습니다."
                  className="mt-1 w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-[11px] text-neutral-500">맺음말 (선택)</span>
                <textarea
                  value={template[tplTab].outro}
                  onChange={(e) => setTemplate({ ...template, [tplTab]: { ...template[tplTab], outro: e.target.value } })}
                  rows={2}
                  placeholder="예) 궁금하신 점은 언제든 담임 선생님께 연락 주세요."
                  className="mt-1 w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm"
                />
              </label>
            </div>

            {/* 추가 섹션 (커스텀) + 추천 */}
            <ExtraSectionsEditor
              extras={template[tplTab].extras}
              suggestions={tplTab === "monthly" ? SUGGESTED_MONTHLY_EXTRAS : SUGGESTED_WEEKLY_EXTRAS}
              onChange={(extras) =>
                setTemplate({ ...template, [tplTab]: { ...template[tplTab], extras } })
              }
            />
          </div>
        </div>

        {/* === Live Preview === */}
        <div className="bg-neutral-100 rounded-2xl p-6 overflow-auto">
          <div className="flex items-center justify-between mb-3 text-xs text-neutral-500">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5" /> 실시간 미리보기 (A4) — {tplTab === "monthly" ? "월간 리포트" : "주간 노트"}
            </div>
            <div className="text-[10px] text-neutral-400">편집과 동시에 반영됩니다</div>
          </div>
          <div className="mx-auto bg-white shadow-sm" style={{ width: "210mm", minHeight: "297mm" }}>
            <div ref={previewRef} style={{ padding: "18mm 16mm", color: "#1f2937", fontFamily: "'Pretendard Variable', Pretendard, sans-serif", lineHeight: 1.6, fontSize: 12 }}>
              {tplTab === "monthly" ? (
                <SampleReport
                  centerName={centerName} tagline={tagline} therapist={therapist}
                  logoText={logoText} logoBg={logoBg} logoFg={logoFg}
                  phone={phone} address={address}
                  headerGradient={headerGradient} accent={c1}
                  childName={childName} period={period}
                  template={template.monthly}
                />
              ) : (
                <SampleWeeklyNote
                  centerName={centerName} tagline={tagline} therapist={therapist}
                  logoText={logoText} logoBg={logoBg} logoFg={logoFg}
                  phone={phone} address={address}
                  headerGradient={headerGradient} accent={c1}
                  childName={childName} period={period}
                  template={template.weekly}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, maxLength }: { label: string; value: string; onChange: (v: string) => void; maxLength?: number }) {
  return (
    <label className="block">
      <span className="text-[11px] text-neutral-500">{label}</span>
      <input value={value} maxLength={maxLength} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm" />
    </label>
  );
}
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[11px] text-neutral-500">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-9 h-9 rounded border border-neutral-200" />
        <input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 border border-neutral-200 rounded-lg px-2 py-1.5 text-xs font-mono" />
      </div>
    </label>
  );
}

function TemplateSectionEditor({
  keys,
  value,
  onChange,
}: {
  keys: ReadonlyArray<{ key: string; defaultTitle: string }>;
  value: Record<string, { enabled: boolean; title: string }>;
  onChange: (v: Record<string, { enabled: boolean; title: string }>) => void;
}) {
  return (
    <div className="space-y-1.5">
      {keys.map((s) => {
        const cfg = value[s.key] ?? { enabled: true, title: s.defaultTitle };
        return (
          <div key={s.key} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...value, [s.key]: { ...cfg, enabled: !cfg.enabled } })}
              className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                cfg.enabled ? "bg-[#C8B88A] border-[#C8B88A] text-white" : "bg-white border-neutral-300 text-transparent"
              }`}
              aria-label={cfg.enabled ? "섹션 끄기" : "섹션 켜기"}
            >
              <Check className="w-3 h-3" />
            </button>
            <input
              value={cfg.title}
              onChange={(e) => onChange({ ...value, [s.key]: { ...cfg, title: e.target.value } })}
              placeholder={s.defaultTitle}
              disabled={!cfg.enabled}
              className={`flex-1 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs ${
                cfg.enabled ? "" : "bg-neutral-50 text-neutral-400 line-through"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}

function ExtraSectionsEditor({
  extras,
  suggestions,
  onChange,
}: {
  extras: ExtraSection[];
  suggestions: Array<{ title: string; body: string }>;
  onChange: (v: ExtraSection[]) => void;
}) {
  const add = (title = "", body = "") =>
    onChange([...extras, { id: makeExtraId(), title, body }]);
  const remove = (id: string) => onChange(extras.filter((e) => e.id !== id));
  const update = (id: string, patch: Partial<ExtraSection>) =>
    onChange(extras.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const usedTitles = new Set(extras.map((e) => e.title.trim()));
  const remaining = suggestions.filter((s) => !usedTitles.has(s.title.trim()));

  return (
    <div className="pt-3 border-t border-neutral-100 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-neutral-700">추가 섹션</span>
        <button
          type="button"
          onClick={() => add()}
          className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-neutral-900 text-white hover:bg-neutral-800"
        >
          <Plus className="w-3 h-3" /> 직접 추가
        </button>
      </div>

      {remaining.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] text-neutral-400 uppercase tracking-wider">추천 섹션 (클릭해서 추가)</div>
          <div className="flex flex-wrap gap-1.5">
            {remaining.map((s) => (
              <button
                key={s.title}
                type="button"
                onClick={() => add(s.title, s.body)}
                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border border-dashed border-[#C8B88A] text-[#9B8B5A] hover:bg-[#FAF6E8]"
              >
                <Plus className="w-3 h-3" /> {s.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {extras.length === 0 ? (
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          추천 섹션을 클릭하거나 직접 추가해서 우리 기관만의 항목을 넣을 수 있어요. 저장 후 발행되는 리포트에 자동 반영됩니다.
        </p>
      ) : (
        <div className="space-y-2">
          {extras.map((e, i) => (
            <div key={e.id} className="border border-neutral-200 rounded-lg p-2.5 space-y-1.5 bg-neutral-50/50">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-400 font-mono shrink-0">#{i + 1}</span>
                <input
                  value={e.title}
                  placeholder="섹션 제목"
                  onChange={(ev) => update(e.id, { title: ev.target.value })}
                  className="flex-1 border border-neutral-200 rounded-md px-2 py-1 text-xs font-semibold bg-white"
                />
                <button
                  type="button"
                  onClick={() => remove(e.id)}
                  className="p-1 text-neutral-400 hover:text-red-500"
                  aria-label="삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <textarea
                value={e.body}
                placeholder="섹션 내용 (보호자께 보여질 본문)"
                rows={2}
                onChange={(ev) => update(e.id, { body: ev.target.value })}
                className="w-full border border-neutral-200 rounded-md px-2 py-1.5 text-xs bg-white"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type PreviewTemplate = { sections: Record<string, { enabled: boolean; title: string }>; extras: ExtraSection[]; intro: string; outro: string };

function SampleReport(props: {
  centerName: string; tagline: string; therapist: string;
  logoText: string; logoBg: string; logoFg: string;
  phone: string; address: string;
  headerGradient: string; accent: string;
  childName: string; period: string;
  template: PreviewTemplate;
}) {
  const { centerName, tagline, therapist, logoText, logoBg, logoFg, phone, address, headerGradient, accent, childName, period, template } = props;
  const sec = (key: string) => template.sections[key];
  const on = (key: string) => sec(key)?.enabled !== false;
  const title = (key: string, fallback: string) => sec(key)?.title?.trim() || fallback;

  const Bar = ({ pct, label }: { pct: number; label: string }) => (
    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 50px", gap: 10, alignItems: "center", margin: "8px 0" }}>
      <div>{label}</div>
      <div style={{ height: 10, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: headerGradient }} />
      </div>
      <div style={{ textAlign: "right" }}>{pct}%</div>
    </div>
  );

  // 번호: enabled 섹션 순서대로 01,02..
  let idx = 0;
  const numbered = (key: string, fallback: string) => {
    if (!on(key)) return null;
    idx += 1;
    return `${String(idx).padStart(2, "0")}. ${title(key, fallback)}`;
  };

  return (
    <>
      {on("cover") && (
        <div style={{ background: headerGradient, color: "#fff", padding: "14px 18px", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: logoBg, color: logoFg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>
              {logoText || "·"}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{centerName}</div>
              <div style={{ fontSize: 11, opacity: 0.9 }}>{tagline}</div>
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: 11, opacity: 0.9 }}>
            {period} 월간 리포트<br />발신: {therapist}
          </div>
        </div>
      )}

      <h1 style={{ fontSize: 22, margin: "0 0 6px", letterSpacing: "-0.3px", color: "#0f172a" }}>
        {childName} 부모님께 — 한 달의 발달 이야기
      </h1>
      {template.intro ? (
        <p style={{ color: "#475569", fontSize: 12, marginBottom: 18, whiteSpace: "pre-wrap" }}>{template.intro}</p>
      ) : (
        <p style={{ color: "#6b7280", fontSize: 12, marginBottom: 20 }}>
          이번 달 회기 4회의 관찰 기록을 기반으로, 담당 치료사가 검토·발행한 리포트입니다.
        </p>
      )}

      {on("summary") && (
        <>
          <H2 accent={accent}>{numbered("summary", "이번 달 한눈에")}</H2>
          <div style={{ display: "flex", gap: 12, margin: "12px 0 18px" }}>
            {[
              { v: "+22%", l: "표현 어휘 다양성 (지난달 대비)" },
              { v: "3/4", l: "목표 미션 달성 회기 수" },
              { v: "안정", l: "정서 패턴 — 회복 빠름" },
            ].map((k) => (
              <div key={k.l} style={{ flex: 1, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: accent }}>{k.v}</div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{k.l}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {on("domains") && (
        <>
          <H2 accent={accent}>{numbered("domains", "영역별 발달 흐름")}</H2>
          <Bar pct={82} label="표현 언어" />
          <Bar pct={74} label="수용 언어" />
          <Bar pct={68} label="사회적 상호작용" />
          <Bar pct={71} label="정서 조절" />
          <Bar pct={65} label="주의·집중" />
        </>
      )}

      {on("highlights") && (
        <>
          <H2 accent={accent}>{numbered("highlights", "이번 달 빛났던 순간")}</H2>
          <ul style={{ paddingLeft: 18, margin: "8px 0 14px" }}>
            <li style={{ marginBottom: 4 }}>‘서운하다’ 라는 단어를 처음 스스로 사용한 회기</li>
            <li style={{ marginBottom: 4 }}>또래에게 먼저 “같이 하자” 라고 제안</li>
            <li>실패 후 한 번 더 시도한 블록 협동 작업</li>
          </ul>
        </>
      )}

      {on("note") && (
        <>
          <H2 accent={accent}>{numbered("note", "담당 치료사 노트")}</H2>
          <p style={{ margin: "6px 0 14px", color: "#334155" }}>
            지난달 대비 자발적 표현이 늘고, 갈등 상황에서 ‘잠깐 멈추는’ 모습을 관찰했습니다.
            가정에서도 작은 멈춤 신호를 함께 연습해 주시면 효과가 더 커집니다.
          </p>
        </>
      )}

      {on("practice") && (
        <>
          <H2 accent={accent}>{numbered("practice", "이번 달 가정 연습 제안")}</H2>
          <ol style={{ paddingLeft: 18 }}>
            <li style={{ marginBottom: 6 }}>저녁 식탁에서 ‘오늘의 단어’ 하나만 함께 이야기해보기</li>
            <li style={{ marginBottom: 6 }}>일주일에 한 번, 5분 그림책 함께 읽기</li>
            <li>화가 났을 때 ‘잠깐 멈춤’ 사인 — 손바닥 펴기 신호 함께 사용</li>
          </ol>
        </>
      )}

      {on("goals") && (
        <>
          <H2 accent={accent}>{numbered("goals", "다음 달 목표")}</H2>
          <div style={{ background: "#ecfdf5", borderLeft: `4px solid ${accent}`, padding: "10px 14px", borderRadius: 6, fontSize: 12, marginTop: 8 }}>
            복합 감정 표현 1가지 더 늘리기 · 또래와의 협동 놀이 회기 중 2회 이상 시도
          </div>
        </>
      )}

      {template.extras.map((e) => {
        if (!e.title.trim() && !e.body.trim()) return null;
        idx += 1;
        return (
          <div key={e.id}>
            <H2 accent={accent}>{`${String(idx).padStart(2, "0")}. ${e.title || "추가 섹션"}`}</H2>
            <p style={{ margin: "6px 0 14px", color: "#334155", whiteSpace: "pre-wrap" }}>{e.body}</p>
          </div>
        );
      })}

      {template.outro && (
        <p style={{ margin: "16px 0 0", color: "#475569", whiteSpace: "pre-wrap" }}>{template.outro}</p>
      )}

      <div style={{ marginTop: 22, padding: "14px 16px", border: "1px dashed #cbd5e1", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
        <div>
          본 리포트는 <b>{centerName}</b>의 담당 치료사 검토 후 발행되었습니다.<br />
          <span style={{ color: "#6b7280", fontSize: 11 }}>발신: {therapist}</span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700, color: accent }}>{centerName}</div>
          <div style={{ color: "#6b7280", fontSize: 11 }}>{address} · {phone}</div>
        </div>
      </div>

      <div style={{ marginTop: 24, paddingTop: 12, borderTop: "1px solid #e5e7eb", color: "#9ca3af", fontSize: 10.5, textAlign: "center" }}>
        Powered by AIHPRO · 본 리포트는 의료 진단을 대체하지 않으며, 발달 코칭을 위한 관찰 기록입니다.
      </div>
    </>
  );
}

function SampleWeeklyNote(props: {
  centerName: string; tagline: string; therapist: string;
  logoText: string; logoBg: string; logoFg: string;
  phone: string; address: string;
  headerGradient: string; accent: string;
  childName: string; period: string;
  template: PreviewTemplate;
}) {
  const { centerName, therapist, phone, address, accent, childName, period, template } = props;
  const sec = (key: string) => template.sections[key];
  const on = (key: string) => sec(key)?.enabled !== false;
  const title = (key: string, fallback: string) => sec(key)?.title?.trim() || fallback;

  const Sec = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 22, pageBreakInside: "avoid" }}>
      <div style={{ fontSize: 11, color: "#888", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
      <div style={{ whiteSpace: "pre-wrap", fontSize: 14, color: "#1a1a1a", lineHeight: 1.65 }}>{children}</div>
    </div>
  );

  return (
    <div style={{ fontFamily: '-apple-system, "Pretendard Variable", "Apple SD Gothic Neo", sans-serif', color: "#1a1a1a", lineHeight: 1.65 }}>
      <div style={{ color: accent, letterSpacing: "0.2em", fontSize: 11, fontWeight: 600 }}>WEEKLY THERAPY NOTE</div>
      <h1 style={{ fontSize: 22, margin: "4px 0 6px", color: "#0f172a", letterSpacing: "-0.3px" }}>
        {childName} 주간 치료노트
      </h1>
      <div style={{ color: "#666", fontSize: 12, marginBottom: 24 }}>
        {centerName} · {period} · 담당 {therapist}
      </div>

      {template.intro && (
        <Sec label="보호자께">{template.intro}</Sec>
      )}

      {on("greeting") && (
        <Sec label={title("greeting", "보호자께 인사")}>
          한 주 동안 가정에서도 따뜻하게 응원해주셔서 감사합니다. 이번 주 회기에서 보인 작은 성장을 공유드려요.
        </Sec>
      )}

      {on("highlights") && (
        <Sec label={title("highlights", "이번 주 하이라이트")}>
          • 먼저 인사를 건넨 첫 회기{"\n"}• 5분 이상 집중하여 그림책 완독{"\n"}• 차례 기다리기 성공 — 2회
        </Sec>
      )}

      {on("activities_summary") && (
        <Sec label={title("activities_summary", "이번 주 활동 요약")}>
          그림책 함께 읽기 · 감정 카드 분류 · 블록 협동 놀이. 총 3회기 진행.
        </Sec>
      )}

      {on("growth") && (
        <Sec label={title("growth", "관찰된 성장")}>
          ‘도와줘’ 라는 표현을 자발적으로 사용했고, 갈등 상황에서 잠깐 멈추는 모습을 보였어요.
        </Sec>
      )}

      {on("home_tips") && (
        <Sec label={title("home_tips", "가정에서 해볼 활동")}>
          잠자기 전 5분, 오늘 가장 즐거웠던 순간을 한 문장으로 이야기 나눠보세요.
        </Sec>
      )}

      {on("next_week_focus") && (
        <Sec label={title("next_week_focus", "다음 주 집중 방향")}>
          복합 감정(‘서운하지만 괜찮아’) 표현 연습 · 또래에게 먼저 제안하기.
        </Sec>
      )}

      {template.extras.map((e) => {
        if (!e.title.trim() && !e.body.trim()) return null;
        return (
          <Sec key={e.id} label={e.title || "추가 섹션"}>{e.body}</Sec>
        );
      })}

      {template.outro && (
        <Sec label="맺는 말">{template.outro}</Sec>
      )}

      <div style={{ marginTop: 30, paddingTop: 8, borderTop: "1px solid #eee", color: "#aaa", fontSize: 10 }}>
        {centerName} · 담당 {therapist} · {address} · {phone}
      </div>
      <div style={{ marginTop: 4, color: "#aaa", fontSize: 10 }}>
        AIHPRO Center · 본 노트는 회기 관찰 기록이며 의료 진단을 대체하지 않습니다.
      </div>
    </div>
  );
}

function H2({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <h2 style={{ fontSize: 15, margin: "22px 0 10px", color: "#0f172a", paddingBottom: 6, borderBottom: `2px solid ${accent}` }}>
      {children}
    </h2>
  );
}
