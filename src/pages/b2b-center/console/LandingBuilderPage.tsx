import { useEffect, useMemo, useState } from "react";
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
import { Loader2, Copy, ExternalLink, Eye, Save } from "lucide-react";

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

export default function LandingBuilderPage() {
  const { toast } = useToast();
  const centerId = getActiveCenterId();
  const [org, setOrg] = useState<OrgRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
        setTemplate(cfg.template ?? "dev_center");
        setConfig({
          template: cfg.template ?? "dev_center",
          hero_title: cfg.hero_title ?? "",
          hero_subtitle: cfg.hero_subtitle ?? "",
          strengths: cfg.strengths?.length ? cfg.strengths : emptyLandingConfig(cfg.template ?? "dev_center").strengths,
          specialties: cfg.specialties?.length ? cfg.specialties : emptyLandingConfig(cfg.template ?? "dev_center").specialties,
          cta_label: cfg.cta_label ?? "",
          region: cfg.region ?? "",
        });
      }
      setLoading(false);
    })();
  }, [centerId]);

  const publicUrl = useMemo(() => {
    if (!slug) return "";
    return `${window.location.origin}/lp/${slug}`;
  }, [slug]);

  function changeTemplate(next: LandingTemplateKey) {
    setTemplate(next);
    setConfig((c) => ({ ...c, template: next }));
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

  async function save() {
    if (!centerId) return;
    const cleanSlug = slugify(slug);
    if (!/^[a-z0-9][a-z0-9-]{2,39}$/.test(cleanSlug)) {
      toast({ title: "슬러그 형식", description: "영문 소문자/숫자/대시, 3~40자", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("center_organizations")
        .update({
          landing_slug: cleanSlug,
          landing_published: published,
          landing_config: { ...config, template } as any,
        })
        .eq("id", centerId);
      if (error) throw error;
      setSlug(cleanSlug);
      toast({ title: "저장 완료", description: published ? "랜딩이 공개되었어요" : "초안으로 저장되었어요" });
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

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      <header className="space-y-1">
        <div className="text-xs tracking-[0.18em] text-neutral-400">MARKETING STUDIO</div>
        <h1 className="text-2xl font-semibold">랜딩 페이지 만들기</h1>
        <p className="text-sm text-neutral-500">5분 안에 우리 기관 홍보 페이지를 만들고, 들어온 문의는 콘솔에서 바로 확인할 수 있어요.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Editor */}
        <section className="space-y-6 rounded-3xl border border-neutral-100 bg-white p-6">
          <div className="space-y-2">
            <div className="text-xs tracking-[0.18em] text-neutral-400">01 · 템플릿</div>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(TEMPLATE_META) as LandingTemplateKey[]).map((k) => (
                <button
                  key={k}
                  onClick={() => changeTemplate(k)}
                  className={`rounded-2xl border px-3 py-3 text-xs font-medium ${
                    template === k ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                  }`}
                >
                  {TEMPLATE_META[k].label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs tracking-[0.18em] text-neutral-400">02 · 공개 URL</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">/lp/</span>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="our-center" />
            </div>
            {publicUrl && <div className="text-[11px] text-neutral-400 break-all">{publicUrl}</div>}
          </div>

          <div className="space-y-2">
            <div className="text-xs tracking-[0.18em] text-neutral-400">03 · 히어로 문구</div>
            <Input
              value={config.hero_title ?? ""}
              onChange={(e) => setConfig({ ...config, hero_title: e.target.value })}
              placeholder={`기본: ${TEMPLATE_META[template].hero_title.split("{name}").join(org.name)}`}
            />
            <Input
              value={config.hero_subtitle ?? ""}
              onChange={(e) => setConfig({ ...config, hero_subtitle: e.target.value })}
              placeholder={`기본: ${TEMPLATE_META[template].hero_subtitle}`}
            />
            <Input
              value={config.region ?? ""}
              onChange={(e) => setConfig({ ...config, region: e.target.value })}
              placeholder="지역 (예: 서울 강남구)"
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs tracking-[0.18em] text-neutral-400">04 · 전문 분야 태그 (쉼표로 구분)</div>
            <Input
              value={config.specialties.join(", ")}
              onChange={(e) => updateSpecialtyInput(e.target.value)}
              placeholder="언어치료, 감각통합, 인지학습"
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs tracking-[0.18em] text-neutral-400">05 · 우리 기관 강점 3가지</div>
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
            <div className="text-xs tracking-[0.18em] text-neutral-400">06 · 문의 버튼 문구</div>
            <Input
              value={config.cta_label ?? ""}
              onChange={(e) => setConfig({ ...config, cta_label: e.target.value })}
              placeholder={TEMPLATE_META[template].cta_label}
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-neutral-50 p-4">
            <div>
              <div className="text-sm font-medium">공개 게시</div>
              <div className="text-xs text-neutral-500">꺼두면 외부에서 페이지가 열리지 않아요.</div>
            </div>
            <Switch checked={published} onCheckedChange={setPublished} />
          </div>

          <div className="flex gap-2">
            <Button onClick={save} disabled={saving} className="flex-1 rounded-2xl">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              저장
            </Button>
            <Button variant="outline" onClick={copyUrl} disabled={!publicUrl} className="rounded-2xl">
              <Copy className="w-4 h-4 mr-2" /> 링크 복사
            </Button>
            <Button
              variant="outline"
              onClick={() => publicUrl && window.open(publicUrl, "_blank")}
              disabled={!publicUrl || !published}
              className="rounded-2xl"
              title={!published ? "공개 게시 후 열람 가능" : "새 창에서 열기"}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </section>

        {/* Preview */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs tracking-[0.18em] text-neutral-400">
            <Eye className="w-3.5 h-3.5" /> LIVE PREVIEW
          </div>
          <div className="rounded-3xl border border-neutral-100 bg-white p-6 space-y-5">
            <div className="text-[10px] tracking-[0.2em] text-neutral-400">{preview.meta.label.toUpperCase()}</div>
            <h2 className="text-2xl font-semibold leading-snug break-keep">{preview.heroTitle}</h2>
            <p className="text-sm text-neutral-500 break-keep">{preview.heroSub}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {config.specialties.map((s) => (
                <span key={s} className="rounded-full bg-neutral-100 text-neutral-600 text-[11px] px-2.5 py-1">#{s}</span>
              ))}
            </div>
            <ul className="space-y-2 text-sm text-neutral-700 pt-2">
              {config.strengths.filter(Boolean).map((s, i) => (
                <li key={i} className="flex gap-3"><span className="text-neutral-400 text-xs">{String(i + 1).padStart(2, "0")}</span><span>{s}</span></li>
              ))}
            </ul>
            <div className="rounded-2xl bg-neutral-900 text-white text-sm text-center py-3">{preview.cta}</div>
          </div>
        </section>
      </div>
    </div>
  );
}
