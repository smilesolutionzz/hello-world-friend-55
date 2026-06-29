import { useEffect, useMemo, useRef, useState } from "react";
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
  LANDING_SECTION_LABELS,
  type LandingTemplateKey,
  type LandingConfig,
  type LandingSectionKey,
  type ProcessStep,
  type FaqItem,
  type SolutionItem,
  type TrustItem,
  type ProgramItem,
  emptyLandingConfig,
} from "@/lib/b2bCenter/landingTemplates";

import CenterLandingPublic from "@/pages/CenterLandingPublic";
import { compressImage, extFromMime } from "@/lib/imageCompress";
import {
  Loader2, Copy, ExternalLink, Save, Sparkles, Wand2,
  Upload, Trash2, Plus, Image as ImageIcon, ArrowUp, ArrowDown,
} from "lucide-react";

interface OrgRow {
  id: string;
  name: string;
  landing_slug: string | null;
  landing_published: boolean;
  landing_config: any;
}

const STORAGE_BUCKET = "partner-media";
const MAX_GALLERY = 10;
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB raw before compression

function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD")
    .replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

export default function LandingBuilderPage() {
  const { toast } = useToast();
  const centerId = getActiveCenterId();
  const [org, setOrg] = useState<OrgRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiKeywords, setAiKeywords] = useState("");

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
        const hasCfg = row.landing_config && Object.keys(row.landing_config).length > 0;
        const cfg = hasCfg ? (row.landing_config as LandingConfig) : emptyLandingConfig("dev_center");
        applyConfig(cfg);
        if (!hasCfg) setPicker(true);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerId]);

  function applyConfig(cfg: LandingConfig) {
    const tpl = cfg.template ?? "dev_center";
    setTemplate(tpl);
    const fb = emptyLandingConfig(tpl);
    setConfig({
      template: tpl,
      hero_badge: cfg.hero_badge ?? fb.hero_badge,
      hero_title: cfg.hero_title ?? fb.hero_title,
      hero_subtitle: cfg.hero_subtitle ?? fb.hero_subtitle,
      strengths: cfg.strengths?.length ? cfg.strengths : fb.strengths,
      specialties: cfg.specialties?.length ? cfg.specialties : fb.specialties,
      cta_label: cfg.cta_label ?? fb.cta_label,
      region: cfg.region ?? "",
      highlight: cfg.highlight ?? fb.highlight,
      concerns_title: cfg.concerns_title ?? fb.concerns_title,
      concerns: cfg.concerns?.length ? cfg.concerns : fb.concerns,
      solutions_title: cfg.solutions_title ?? fb.solutions_title,
      solutions: cfg.solutions?.length ? cfg.solutions : fb.solutions,
      trust_title: cfg.trust_title ?? fb.trust_title,
      trust: cfg.trust?.length ? cfg.trust : fb.trust,
      process_title: cfg.process_title ?? fb.process_title,
      process: cfg.process?.length ? cfg.process : fb.process,
      faqs_title: cfg.faqs_title ?? fb.faqs_title,
      faqs: cfg.faqs?.length ? cfg.faqs : fb.faqs,
      hero_image_url: cfg.hero_image_url ?? "",
      gallery: cfg.gallery ?? [],
      programs: cfg.programs?.length ? cfg.programs : fb.programs,
      sections: cfg.sections ?? {},
    });
  }


  const publicUrl = useMemo(() => slug ? `${window.location.origin}/lp/${slug}` : "", [slug]);

  function pickTemplate(k: LandingTemplateKey) {
    applyConfig(emptyLandingConfig(k));
    setPicker(false);
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
    } finally { setSaving(false); }
  }

  function copyUrl() {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    toast({ title: "링크가 복사되었어요" });
  }

  // ─── Image upload helpers ─────────────────────────────────────────────
  async function uploadOne(file: File, subdir: string): Promise<string | null> {
    if (!centerId) return null;
    if (file.size > MAX_FILE_BYTES) {
      toast({ title: "파일이 너무 큽니다", description: "원본 8MB 이하만 가능해요", variant: "destructive" });
      return null;
    }
    try {
      const blob = await compressImage(file, { maxSide: 1600, quality: 0.85 });
      const ext = extFromMime(blob.type);
      const path = `landing/${centerId}/${subdir}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, blob, {
        contentType: blob.type, upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      return data.publicUrl;
    } catch (e: any) {
      toast({ title: "업로드 실패", description: e?.message ?? "다시 시도해주세요", variant: "destructive" });
      return null;
    }
  }

  async function pickHeroImage(file: File) {
    const url = await uploadOne(file, "hero");
    if (url) setConfig((c) => ({ ...c, hero_image_url: url }));
  }
  async function pickGalleryFiles(files: FileList | null) {
    if (!files) return;
    const remaining = MAX_GALLERY - (config.gallery?.length ?? 0);
    const toUpload = Array.from(files).slice(0, Math.max(0, remaining));
    for (const f of toUpload) {
      const url = await uploadOne(f, "gallery");
      if (url) setConfig((c) => ({ ...c, gallery: [...(c.gallery ?? []), url] }));
    }
  }
  async function pickProgramImage(idx: number, file: File) {
    const url = await uploadOne(file, "programs");
    if (!url) return;
    setConfig((c) => {
      const arr = [...(c.programs ?? [])];
      arr[idx] = { ...(arr[idx] ?? { title: "", desc: "" }), image_url: url };
      return { ...c, programs: arr };
    });
  }

  function removeGallery(i: number) {
    setConfig((c) => ({ ...c, gallery: (c.gallery ?? []).filter((_, idx) => idx !== i) }));
  }
  function moveGallery(i: number, dir: -1 | 1) {
    setConfig((c) => {
      const arr = [...(c.gallery ?? [])];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return c;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...c, gallery: arr };
    });
  }

  // ─── AI generate ──────────────────────────────────────────────────────
  async function runAi() {
    if (!org) return;
    setAiBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("landing-ai-generate", {
        body: {
          template,
          center_name: org.name,
          region: config.region ?? "",
          keywords: aiKeywords.split(",").map((s) => s.trim()).filter(Boolean),
        },
      });
      if (error) throw error;
      const j: any = data ?? {};
      if (j.error) throw new Error(j.error);
      setConfig((c) => ({
        ...c,
        hero_subtitle: j.hero_subtitle?.trim() || c.hero_subtitle,
        concerns: Array.isArray(j.concerns) && j.concerns.length ? j.concerns.slice(0, 4) : c.concerns,
        solutions: Array.isArray(j.solutions) && j.solutions.length
          ? j.solutions.slice(0, 4).map((s: any): SolutionItem => ({
              icon: ["heart","users","clipboard","shield","sparkles","leaf","stethoscope","school","smile"].includes(s.icon) ? s.icon : "sparkles",
              title: String(s.title ?? "").slice(0, 30),
              desc: String(s.desc ?? "").slice(0, 200),
            }))
          : c.solutions,
        trust: Array.isArray(j.trust) && j.trust.length
          ? j.trust.slice(0, 4).map((t: any): TrustItem => ({ label: String(t.label ?? ""), value: String(t.value ?? "") }))
          : c.trust,
        process: Array.isArray(j.process) && j.process.length
          ? j.process.slice(0, 4).map((p: any): ProcessStep => ({ title: String(p.title ?? ""), desc: String(p.desc ?? "") }))
          : c.process,
        faqs: Array.isArray(j.faqs) && j.faqs.length
          ? j.faqs.slice(0, 6).map((f: any): FaqItem => ({ q: String(f.q ?? ""), a: String(f.a ?? "") }))
          : c.faqs,
      }));
      toast({ title: "AI 카피 생성 완료", description: "필요한 부분만 다듬어 저장하세요" });
    } catch (e: any) {
      toast({ title: "AI 생성 실패", description: e?.message ?? "다시 시도해주세요", variant: "destructive" });
    } finally { setAiBusy(false); }
  }

  // ─── Mock preview row so we can re-use the public component as-is ─────
  const previewRow = useMemo(() => org ? ({
    center_id: org.id,
    name: org.name,
    landing_config: { ...config, template } as LandingConfig,
  }) : null, [org, config, template]);

  if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;
  if (!centerId || !org) return <div className="p-8 text-sm text-neutral-500">먼저 활성 기관을 선택해주세요.</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="text-xs tracking-[0.18em] text-neutral-400">MARKETING STUDIO</div>
          <h1 className="text-2xl font-semibold">랜딩 페이지 만들기</h1>
          <p className="text-sm text-neutral-500">발달·심리·돌봄 기관용 롱폼 랜딩. 가입 없이 누구나 들어와 문의를 남길 수 있어요.</p>
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
          <Button variant="outline" size="sm" onClick={() => publicUrl && window.open(publicUrl, "_blank")}
                  disabled={!publicUrl || !published} className="rounded-xl">
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> 열기
          </Button>
        </div>
      </div>

      {/* AI generate bar */}
      <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-amber-900">
          <Wand2 className="w-4 h-4" /> AI로 랜딩 내용 채우기
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <Input
            value={aiKeywords}
            onChange={(e) => setAiKeywords(e.target.value)}
            placeholder="핵심 특징 키워드 (쉼표로 구분) — 예: 강남구, 임상 10년, 부모코칭"
            className="bg-white"
          />
          <Button onClick={runAi} disabled={aiBusy} className="rounded-xl bg-neutral-900 hover:bg-black text-white whitespace-nowrap">
            {aiBusy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            AI 초안 생성
          </Button>
        </div>
        <p className="text-[11px] text-amber-800/70">
          기관 유형과 키워드에 맞춰 공감·솔루션·신뢰·과정·FAQ 섹션의 초안을 생성합니다. 생성 후에도 자유롭게 수정할 수 있어요.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
        {/* ─── Editor ─── */}
        <section className="space-y-5">
          <Block title="기본 설정">
            <Field label="공개 URL 슬러그">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">/lp/</span>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="our-center" />
              </div>
            </Field>
            <Field label="지역">
              <Input value={config.region ?? ""} onChange={(e) => setConfig({ ...config, region: e.target.value })}
                     placeholder="예: 서울 강남구" />
            </Field>
            <Field label="상단 배지">
              <Input value={config.hero_badge ?? ""} onChange={(e) => setConfig({ ...config, hero_badge: e.target.value })} />
            </Field>
            <Field label="메인 타이틀">
              <Textarea rows={2} value={config.hero_title ?? ""} onChange={(e) => setConfig({ ...config, hero_title: e.target.value })} />
            </Field>
            <Field label="강조 단어 (타이틀 안에서 노란 형광펜)">
              <Input value={config.highlight ?? ""} onChange={(e) => setConfig({ ...config, highlight: e.target.value })} />
            </Field>
            <Field label="서브타이틀">
              <Textarea rows={3} value={config.hero_subtitle ?? ""} onChange={(e) => setConfig({ ...config, hero_subtitle: e.target.value })} />
            </Field>
            <Field label="CTA 버튼 문구">
              <Input value={config.cta_label ?? ""} onChange={(e) => setConfig({ ...config, cta_label: e.target.value })} />
            </Field>
            <Field label="전문 분야 / 태그 (쉼표 구분)">
              <Input value={config.specialties.join(", ")}
                     onChange={(e) => setConfig({ ...config, specialties: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} />
            </Field>
          </Block>

          <Block title="이미지 업로드">
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              원아·아동·이용자 얼굴이 포함된 사진은 보호자 서면동의를 받은 것만 업로드해주세요. 업로드 시 자동으로 1600px 이하로 리사이즈됩니다.
            </p>
            <Field label="히어로 배경 이미지">
              <ImagePickerBox
                url={config.hero_image_url ?? ""}
                onPick={pickHeroImage}
                onClear={() => setConfig((c) => ({ ...c, hero_image_url: "" }))}
                ratio="aspect-[16/9]"
              />
            </Field>

            <Field label={`공간 갤러리 (최대 ${MAX_GALLERY}장)`}>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {(config.gallery ?? []).map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-neutral-200 group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition">
                      <div className="flex gap-1">
                        <button onClick={() => moveGallery(i, -1)} className="p-1 bg-white/80 rounded"><ArrowUp className="w-3 h-3" /></button>
                        <button onClick={() => moveGallery(i, 1)} className="p-1 bg-white/80 rounded"><ArrowDown className="w-3 h-3" /></button>
                      </div>
                      <button onClick={() => removeGallery(i)} className="p-1 bg-white/80 rounded text-red-600"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
                {(config.gallery?.length ?? 0) < MAX_GALLERY && (
                  <UploadTile multiple onFiles={pickGalleryFiles} />
                )}
              </div>
            </Field>
          </Block>

          <Block title="공감 (보호자 고민)">
            <Field label="섹션 타이틀">
              <Input value={config.concerns_title ?? ""} onChange={(e) => setConfig({ ...config, concerns_title: e.target.value })} />
            </Field>
            {[0,1,2,3].map((i) => (
              <Textarea key={i} rows={2} className="mt-2"
                        value={config.concerns?.[i] ?? ""}
                        onChange={(e) => {
                          const arr = [...(config.concerns ?? [])];
                          arr[i] = e.target.value;
                          setConfig({ ...config, concerns: arr });
                        }}
                        placeholder={TEMPLATE_META[template].defaultConcerns[i] ?? ""} />
            ))}
          </Block>

          <Block title="솔루션">
            <Field label="섹션 타이틀">
              <Input value={config.solutions_title ?? ""} onChange={(e) => setConfig({ ...config, solutions_title: e.target.value })} />
            </Field>
            {(config.solutions ?? []).map((s, i) => (
              <div key={i} className="grid grid-cols-[1fr_2fr] gap-2 mt-2">
                <Input value={s.title}
                       onChange={(e) => {
                         const arr = [...(config.solutions ?? [])];
                         arr[i] = { ...arr[i], title: e.target.value };
                         setConfig({ ...config, solutions: arr });
                       }}
                       placeholder="제목" />
                <Textarea rows={2} value={s.desc}
                          onChange={(e) => {
                            const arr = [...(config.solutions ?? [])];
                            arr[i] = { ...arr[i], desc: e.target.value };
                            setConfig({ ...config, solutions: arr });
                          }}
                          placeholder="설명" />
              </div>
            ))}
          </Block>

          <Block title="강점 (체크리스트)">
            {[0,1,2].map((i) => (
              <Textarea key={i} rows={2} className="mt-2"
                        value={config.strengths[i] ?? ""}
                        onChange={(e) => {
                          const arr = [...config.strengths]; arr[i] = e.target.value;
                          setConfig({ ...config, strengths: arr });
                        }}
                        placeholder={TEMPLATE_META[template].defaultStrengths[i]} />
            ))}
          </Block>

          <Block title="신뢰 지표">
            {(config.trust ?? []).map((t, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 mt-2">
                <Input value={t.label} placeholder="라벨"
                       onChange={(e) => {
                         const arr = [...(config.trust ?? [])];
                         arr[i] = { ...arr[i], label: e.target.value };
                         setConfig({ ...config, trust: arr });
                       }} />
                <Input value={t.value} placeholder="값"
                       onChange={(e) => {
                         const arr = [...(config.trust ?? [])];
                         arr[i] = { ...arr[i], value: e.target.value };
                         setConfig({ ...config, trust: arr });
                       }} />
              </div>
            ))}
          </Block>

          <Block title="진행 과정 (4단계)">
            {[0,1,2,3].map((i) => {
              const step = config.process?.[i] ?? { title: "", desc: "" };
              return (
                <div key={i} className="grid grid-cols-[1fr_2fr] gap-2 mt-2">
                  <Input value={step.title} placeholder={`0${i+1}. 제목`}
                         onChange={(e) => {
                           const arr = [...(config.process ?? [])];
                           arr[i] = { ...step, title: e.target.value };
                           setConfig({ ...config, process: arr });
                         }} />
                  <Textarea rows={2} value={step.desc} placeholder="설명"
                            onChange={(e) => {
                              const arr = [...(config.process ?? [])];
                              arr[i] = { ...step, desc: e.target.value };
                              setConfig({ ...config, process: arr });
                            }} />
                </div>
              );
            })}
          </Block>

          <Block title="FAQ">
            {(config.faqs ?? []).map((f, i) => (
              <div key={i} className="space-y-2 mt-2 border-t border-neutral-100 pt-2 first:border-t-0 first:pt-0">
                <Input value={f.q} placeholder="질문"
                       onChange={(e) => {
                         const arr = [...(config.faqs ?? [])];
                         arr[i] = { ...f, q: e.target.value };
                         setConfig({ ...config, faqs: arr });
                       }} />
                <Textarea rows={2} value={f.a} placeholder="답변"
                          onChange={(e) => {
                            const arr = [...(config.faqs ?? [])];
                            arr[i] = { ...f, a: e.target.value };
                            setConfig({ ...config, faqs: arr });
                          }} />
              </div>
            ))}
            <Button variant="outline" size="sm" className="mt-2"
                    onClick={() => setConfig({ ...config, faqs: [...(config.faqs ?? []), { q: "", a: "" }] })}>
              <Plus className="w-3.5 h-3.5 mr-1" /> FAQ 추가
            </Button>
          </Block>

          <Block title="프로그램">
            {(config.programs ?? []).map((p, i) => (
              <div key={i} className="grid grid-cols-[80px_1fr] gap-3 mt-3 items-start">
                <div className="relative">
                  <div className="aspect-square rounded-xl bg-neutral-100 overflow-hidden flex items-center justify-center border border-neutral-200">
                    {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-neutral-300" />}
                  </div>
                  <UploadInline onFile={(f) => pickProgramImage(i, f)} />
                </div>
                <div className="space-y-2">
                  <Input value={p.title} placeholder="프로그램명"
                         onChange={(e) => {
                           const arr = [...(config.programs ?? [])];
                           arr[i] = { ...p, title: e.target.value };
                           setConfig({ ...config, programs: arr });
                         }} />
                  <Textarea rows={2} value={p.desc} placeholder="설명"
                            onChange={(e) => {
                              const arr = [...(config.programs ?? [])];
                              arr[i] = { ...p, desc: e.target.value };
                              setConfig({ ...config, programs: arr });
                            }} />
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="mt-3"
                    onClick={() => setConfig({ ...config, programs: [...(config.programs ?? []), { title: "", desc: "" }] })}>
              <Plus className="w-3.5 h-3.5 mr-1" /> 프로그램 추가
            </Button>
          </Block>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => save({ publish: false })} disabled={saving} className="flex-1 rounded-2xl">
              초안 저장
            </Button>
            <Button onClick={() => save({ publish: true })} disabled={saving} className="flex-1 rounded-2xl bg-neutral-900 hover:bg-black text-white">
              저장하고 공개
            </Button>
          </div>
        </section>

        {/* ─── Live preview: full long-form ─── */}
        <section className="space-y-3">
          <div className="text-xs tracking-[0.18em] text-neutral-400">LIVE PREVIEW · 전체 랜딩페이지</div>
          <div className="rounded-3xl border border-neutral-200 overflow-hidden bg-neutral-50">
            <div className="h-[80vh] overflow-y-auto bg-white">
              {previewRow && <CenterLandingPublic previewRow={previewRow} />}
            </div>
          </div>
        </section>
      </div>

      {picker && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-start sm:items-center justify-center p-4 overflow-y-auto" onClick={() => setPicker(false)}>
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 my-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">페이지 템플릿 선택</h2>
                <p className="text-xs text-neutral-500 mt-1">사용할 기관 유형을 선택해주세요. 내용은 언제든 수정·AI 재생성이 가능해요.</p>
              </div>
              <button onClick={() => setPicker(false)} className="text-neutral-400 hover:text-neutral-700 text-lg">×</button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(Object.keys(TEMPLATE_META) as LandingTemplateKey[]).map((k) => {
                const meta = TEMPLATE_META[k];
                const active = template === k;
                return (
                  <button key={k} onClick={() => pickTemplate(k)}
                          className={`text-left border rounded-2xl p-4 hover:border-neutral-900 transition ${active ? "border-neutral-900 ring-2 ring-neutral-900/10" : "border-neutral-200"}`}>
                    <div className="text-sm font-semibold">{meta.label}</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">{meta.category}</div>
                    <div className="mt-3 text-[12px] text-neutral-600 leading-relaxed line-clamp-3 break-keep">{meta.hero_subtitle}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>, document.body)}
    </div>
  );
}

// ─── helper UI ─────────────────────────────────────────────────────────
function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-neutral-100 bg-white p-5 md:p-6 space-y-3">
      <div className="text-xs tracking-[0.18em] text-neutral-400">{title}</div>
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="text-[11px] text-neutral-500">{label}</div>
      {children}
    </div>
  );
}

function ImagePickerBox({
  url, onPick, onClear, ratio = "aspect-video",
}: { url: string; onPick: (f: File) => void; onClear: () => void; ratio?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className={`relative ${ratio} w-full rounded-2xl overflow-hidden border border-dashed border-neutral-300 bg-neutral-50 flex items-center justify-center`}>
      {url ? (
        <>
          <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute top-2 right-2 flex gap-1">
            <button onClick={() => ref.current?.click()} className="px-2 py-1 text-[11px] bg-white/90 rounded-md flex items-center gap-1">
              <Upload className="w-3 h-3" /> 변경
            </button>
            <button onClick={onClear} className="px-2 py-1 text-[11px] bg-white/90 rounded-md flex items-center gap-1 text-red-600">
              <Trash2 className="w-3 h-3" /> 제거
            </button>
          </div>
        </>
      ) : (
        <button onClick={() => ref.current?.click()} className="text-sm text-neutral-500 flex flex-col items-center gap-1.5">
          <Upload className="w-5 h-5" /> 클릭해서 이미지 업로드
        </button>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden"
             onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])} />
    </div>
  );
}
function UploadTile({ onFiles, multiple = false }: { onFiles: (f: FileList | null) => void; multiple?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <button onClick={() => ref.current?.click()} type="button"
            className="aspect-square rounded-xl border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 hover:border-neutral-500 hover:text-neutral-700 transition">
      <Plus className="w-5 h-5" />
      <input ref={ref} type="file" accept="image/*" className="hidden" multiple={multiple}
             onChange={(e) => onFiles(e.target.files)} />
    </button>
  );
}
function UploadInline({ onFile }: { onFile: (f: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button onClick={() => ref.current?.click()} type="button"
              className="mt-1 w-full text-[10px] text-neutral-500 hover:text-neutral-800 flex items-center justify-center gap-1">
        <Upload className="w-3 h-3" /> 사진
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden"
             onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
    </>
  );
}

