import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/integrations/supabase/client";
import { getActiveCenterId } from "@/lib/b2bCenter/centerClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  TEMPLATE_META,
  type LandingTemplateKey,
  type LandingConfig,
  emptyLandingConfig,
  resolveLandingCopy,
} from "@/lib/b2bCenter/landingTemplates";
import { Loader2, Copy, ExternalLink, Eye, Save, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";

interface OrgRow {
  id: string;
  name: string;
  landing_slug: string | null;
  landing_published: boolean;
  landing_config: any;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

const themeStyles = {
  light: { wrap: "bg-white text-neutral-900", muted: "text-neutral-500", chip: "bg-neutral-100 text-neutral-600", btn: "bg-neutral-900 text-white", card: "border-neutral-100" },
  dark: { wrap: "bg-[#0f1813] text-white", muted: "text-white/60", chip: "bg-white/10 text-white/80", btn: "bg-[#d8ff3a] text-black", card: "border-white/10 bg-white/[0.04]" },
  pastel: { wrap: "bg-[#eaf2ff] text-neutral-900", muted: "text-neutral-600", chip: "bg-white/80 text-neutral-700", btn: "bg-[#1c3fa3] text-white", card: "border-white/70 bg-white/70" },
} as const;

export default function LandingBuilderPage() {
  const { toast } = useToast();
  const centerId = getActiveCenterId();
  const [org, setOrg] = useState<OrgRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState(false);

  const [slug, setSlug] = useState("");
  const [published, setPublished] = useState(false);
  const [template, setTemplate] = useState<LandingTemplateKey>("dev_center");
  const [config, setConfig] = useState<LandingConfig>(emptyLandingConfig("dev_center"));

  useEffect(() => {
    if (!centerId) { setLoading(false); return; }
    (async () => {
      const { data, error } = await supabase
        .from("center_organizations")
        .select("id, name, landing_slug, landing_published, landing_config")
        .eq("id", centerId)
        .maybeSingle();
      if (!error && data) {
        const row = data as unknown as OrgRow;
        setOrg(row);
        setSlug(row.landing_slug ?? slugify(row.name));
        setPublished(row.landing_published);
        const cfg = (row.landing_config && Object.keys(row.landing_config).length > 0
          ? row.landing_config
          : emptyLandingConfig("dev_center")) as LandingConfig;
        applyConfig(cfg);
        if (!row.landing_config || Object.keys(row.landing_config).length === 0) {
          setPicker(true);
        }
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerId]);

  function applyConfig(cfg: LandingConfig) {
    const tpl = cfg.template ?? "dev_center";
    setTemplate(tpl);
    const fallback = emptyLandingConfig(tpl);
    setConfig({
      template: tpl,
      hero_badge: cfg.hero_badge ?? "",
      hero_title: cfg.hero_title ?? "",
      hero_subtitle: cfg.hero_subtitle ?? "",
      strengths: cfg.strengths?.length ? cfg.strengths : fallback.strengths,
      specialties: cfg.specialties?.length ? cfg.specialties : fallback.specialties,
      cta_label: cfg.cta_label ?? "",
      region: cfg.region ?? "",
      highlight: cfg.highlight ?? "",
    });
  }

  const publicUrl = useMemo(() => {
    if (!slug) return "";
    return `${window.location.origin}/lp/${slug}`;
  }, [slug]);

  function pickTemplate(k: LandingTemplateKey) {
    applyConfig(emptyLandingConfig(k));
    setPicker(false);
  }

  function updateStrength(i: number, v: string) {
    setConfig((c) => {
      const arr = [...c.strengths];
      arr[i] = v;
      return { ...c, strengths: arr };
    });
  }

  function updateSpecialtyInput(v: string) {
    setConfig((c) => ({ ...c, specialties: v.split(",").map((x) => x.trim()).filter(Boolean) }));
  }

  async function save(opts?: { publish?: boolean }) {
    if (!centerId) return;
    const cleanSlug = slugify(slug);
    if (!/^[a-z0-9][a-z0-9-]{2,39}$/.test(cleanSlug)) {
      toast({ title: "슬러그 형식", description: "영문 소문자/숫자/대시, 3~40자", variant: "destructive" });
      return;
    }
    const nextPublished = opts?.publish ?? published;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("center_organizations")
        .update({
          landing_slug: cleanSlug,
          landing_published: nextPublished,
          landing_config: { ...config, template } as any,
        })
        .eq("id", centerId);
      if (error) throw error;
      setSlug(cleanSlug);
      setPublished(nextPublished);
      toast({ title: "저장 완료", description: nextPublished ? "랜딩이 공개되었어요" : "초안으로 저장되었어요" });
    } catch (e: any) {
      toast({
        title: "저장 실패",
        description: e?.message?.includes("unique") ? "이미 사용중인 슬러그예요" : (e?.message ?? "다시 시도해주세요"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  function copyUrl() {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    toast({ title: "링크가 복사되었어요" });
  }

  if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;
  if (!centerId || !org) {
    return <div className="p-8 text-sm text-neutral-500">먼저 활성 기관을 선택해주세요.</div>;
  }

  const preview = resolveLandingCopy(org.name, { ...config, template });
  const theme = themeStyles[TEMPLATE_META[template].theme];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="text-xs tracking-[0.18em] text-neutral-400">MARKETING STUDIO</div>
          <h1 className="text-2xl font-semibold">랜딩 페이지 만들기</h1>
          <p className="text-sm text-neutral-500">템플릿을 골라 내용을 채우면, 가입 없이 누구나 들어와 문의를 남길 수 있는 공개 링크가 생겨요.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPicker(true)} className="rounded-2xl">
            <Sparkles className="w-4 h-4 mr-2" /> 템플릿 바꾸기
          </Button>
          <Button onClick={() => save({ publish: true })} disabled={saving} className="rounded-2xl bg-neutral-900 hover:bg-black text-white">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            저장하고 공개
          </Button>
        </div>
      </header>

      {/* Public link bar */}
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm">
          <div className="text-xs text-neutral-500 tracking-[0.1em]">PUBLIC LINK · 가입 없이 열림</div>
          <div className="font-medium break-all">{publicUrl || "/lp/슬러그"}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <Switch checked={published} onCheckedChange={(v) => save({ publish: v })} /> 공개
          </div>
          <Button variant="outline" size="sm" onClick={copyUrl} disabled={!publicUrl} className="rounded-xl">
            <Copy className="w-3.5 h-3.5 mr-1.5" /> 복사
          </Button>
          <Button variant="outline" size="sm" onClick={() => publicUrl && window.open(publicUrl, "_blank")} disabled={!publicUrl || !published} className="rounded-xl">
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> 열기
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6">
        {/* Editor */}
        <section className="space-y-5 rounded-3xl border border-neutral-100 bg-white p-6">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-neutral-900 text-white text-[11px] px-2.5 py-1">{TEMPLATE_META[template].label}</span>
            <span className="text-[11px] text-neutral-400">{TEMPLATE_META[template].category}</span>
          </div>

          <div className="space-y-2">
            <div className="text-xs tracking-[0.18em] text-neutral-400">공개 URL 슬러그</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">/lp/</span>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="our-center" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs tracking-[0.18em] text-neutral-400">상단 배지 (작은 문구)</div>
            <Input
              value={config.hero_badge ?? ""}
              onChange={(e) => setConfig({ ...config, hero_badge: e.target.value })}
              placeholder={TEMPLATE_META[template].hero_badge}
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs tracking-[0.18em] text-neutral-400">메인 타이틀</div>
            <Textarea
              rows={2}
              value={config.hero_title ?? ""}
              onChange={(e) => setConfig({ ...config, hero_title: e.target.value })}
              placeholder={TEMPLATE_META[template].hero_title.split("{name}").join(org.name)}
            />
            <Input
              value={config.highlight ?? ""}
              onChange={(e) => setConfig({ ...config, highlight: e.target.value })}
              placeholder="강조할 한 마디 (예: 단 3초 만에) — 타이틀 안에서 노란 형광펜으로 표시돼요"
            />
            <Textarea
              rows={2}
              value={config.hero_subtitle ?? ""}
              onChange={(e) => setConfig({ ...config, hero_subtitle: e.target.value })}
              placeholder={TEMPLATE_META[template].hero_subtitle}
            />
            <Input
              value={config.region ?? ""}
              onChange={(e) => setConfig({ ...config, region: e.target.value })}
              placeholder="지역 (예: 서울 강남구)"
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs tracking-[0.18em] text-neutral-400">전문 분야 / 태그 (쉼표로 구분)</div>
            <Input
              value={config.specialties.join(", ")}
              onChange={(e) => updateSpecialtyInput(e.target.value)}
              placeholder={TEMPLATE_META[template].defaultSpecialties.join(", ")}
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs tracking-[0.18em] text-neutral-400">강점 / 체크포인트 3가지</div>
            {[0, 1, 2].map((i) => (
              <Textarea
                key={i}
                rows={2}
                value={config.strengths[i] ?? ""}
                onChange={(e) => updateStrength(i, e.target.value)}
                placeholder={TEMPLATE_META[template].defaultStrengths[i]}
              />
            ))}
          </div>

          <div className="space-y-2">
            <div className="text-xs tracking-[0.18em] text-neutral-400">문의 버튼 문구</div>
            <Input
              value={config.cta_label ?? ""}
              onChange={(e) => setConfig({ ...config, cta_label: e.target.value })}
              placeholder={TEMPLATE_META[template].cta_label}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => save({ publish: false })} disabled={saving} className="flex-1 rounded-2xl">
              초안 저장
            </Button>
            <Button onClick={() => save({ publish: true })} disabled={saving} className="flex-1 rounded-2xl bg-neutral-900 hover:bg-black text-white">
              저장하고 공개
            </Button>
          </div>
        </section>

        {/* Preview */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs tracking-[0.18em] text-neutral-400">
            <Eye className="w-3.5 h-3.5" /> LIVE PREVIEW · 공개 페이지와 동일
          </div>
          <div className={`rounded-3xl border ${theme.card} ${theme.wrap} p-7 space-y-6`}>
            <div className="flex justify-center">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] tracking-[0.18em] ${theme.chip}`}>
                <ShieldCheck className="w-3 h-3" /> {preview.heroBadge}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-center leading-snug break-keep">
              {renderHighlighted(preview.heroTitle, preview.highlight, TEMPLATE_META[template].theme)}
            </h2>
            <p className={`text-sm text-center break-keep ${theme.muted}`}>{preview.heroSub}</p>
            {config.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {config.specialties.map((s) => (
                  <span key={s} className={`rounded-full text-[11px] px-2.5 py-1 ${theme.chip}`}>#{s}</span>
                ))}
              </div>
            )}
            <ul className="space-y-3 pt-2 max-w-sm mx-auto">
              {config.strengths.filter(Boolean).map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm break-keep">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 opacity-70" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <div className={`rounded-2xl text-sm text-center py-3 font-medium ${theme.btn}`}>{preview.cta}</div>
          </div>
        </section>
      </div>

      {/* Template picker modal */}
      {picker && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-start sm:items-center justify-center p-4 overflow-y-auto" onClick={() => setPicker(false)}>
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 my-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">페이지 템플릿 선택</h2>
                <p className="text-xs text-neutral-500 mt-1">사용할 페이지 템플릿을 선택해주세요. 내용은 언제든 다시 바꿀 수 있어요.</p>
              </div>
              <button onClick={() => setPicker(false)} className="text-neutral-400 hover:text-neutral-700 text-lg">×</button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Object.keys(TEMPLATE_META) as LandingTemplateKey[]).map((k) => {
                const meta = TEMPLATE_META[k];
                const t = themeStyles[meta.theme];
                return (
                  <button
                    key={k}
                    onClick={() => pickTemplate(k)}
                    className={`text-left border rounded-2xl overflow-hidden hover:border-neutral-900 transition ${template === k ? "border-neutral-900 ring-2 ring-neutral-900/10" : "border-neutral-200"}`}
                  >
                    <div className="p-3">
                      <div className="text-sm font-semibold">{meta.label}</div>
                      <div className="text-[11px] text-neutral-500">{meta.category}</div>
                    </div>
                    <div className={`${t.wrap} p-4 text-center space-y-2 min-h-[180px]`}>
                      <div className={`text-[9px] tracking-[0.18em] ${t.muted}`}>{meta.hero_badge}</div>
                      <div className="text-xs font-semibold leading-snug break-keep line-clamp-3">{meta.hero_title.split("{name}").join(org.name)}</div>
                      <div className={`text-[10px] ${t.muted} line-clamp-2`}>{meta.hero_subtitle}</div>
                      <div className={`inline-block text-[10px] px-3 py-1 rounded-full ${t.btn}`}>{meta.cta_label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function renderHighlighted(text: string, highlight: string, theme: "light" | "dark" | "pastel") {
  if (!highlight) return text;
  const idx = text.indexOf(highlight);
  if (idx < 0) return text;
  const bg = theme === "dark" ? "bg-[#d8ff3a] text-black" : theme === "pastel" ? "bg-[#1c3fa3] text-white" : "bg-[#FFF299] text-neutral-900";
  return (
    <>
      {text.slice(0, idx)}
      <mark className={`${bg} px-1.5 rounded`}>{highlight}</mark>
      {text.slice(idx + highlight.length)}
    </>
  );
}
