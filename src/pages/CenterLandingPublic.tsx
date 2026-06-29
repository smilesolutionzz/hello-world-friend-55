import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import {
  Loader2, ShieldCheck, Phone, CheckCircle2,
  Heart, Users, ClipboardList, Shield, Sparkles, Leaf, Stethoscope, School, Smile,
  ChevronRight, ChevronDown, ImageIcon,
} from "lucide-react";
import {
  type LandingConfig, type SolutionItem,
  TEMPLATE_META, resolveLandingCopy,
} from "@/lib/b2bCenter/landingTemplates";

interface LandingRow {
  center_id: string;
  name: string;
  landing_config: LandingConfig;
}

const formSchema = z.object({
  parent_name: z.string().trim().min(1, "이름을 입력해주세요").max(60),
  phone: z.string().trim().min(7, "연락처를 정확히 입력해주세요").max(20)
    .regex(/^[0-9+\-\s().]{7,20}$/, "연락처 형식이 올바르지 않아요"),
  concern: z.string().trim().max(2000).optional().or(z.literal("")),
});

const SOLUTION_ICONS: Record<SolutionItem["icon"], React.ComponentType<{ className?: string }>> = {
  heart: Heart, users: Users, clipboard: ClipboardList, shield: Shield,
  sparkles: Sparkles, leaf: Leaf, stethoscope: Stethoscope, school: School, smile: Smile,
};

const GOLD = "#C8B88A";
const GOLD_SOFT = "#EFE7D2";

export default function CenterLandingPublic({ previewRow }: { previewRow?: LandingRow } = {}) {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [row, setRow] = useState<LandingRow | null>(previewRow ?? null);
  const [loading, setLoading] = useState(!previewRow);
  const [form, setForm] = useState({ parent_name: "", phone: "", concern: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (previewRow) { setRow(previewRow); setLoading(false); return; }
    if (!slug) { setLoading(false); return; }
    (async () => {
      const { data, error } = await supabase.rpc("get_center_landing_by_slug", { _slug: slug });
      if (!error && Array.isArray(data) && data.length > 0) {
        setRow(data[0] as unknown as LandingRow);
      }
      setLoading(false);
    })();
  }, [slug, previewRow]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin" /></div>;
  }
  if (!row) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center space-y-3 max-w-md">
          <div className="text-sm tracking-[0.18em] text-neutral-400">PAGE NOT FOUND</div>
          <h1 className="text-2xl font-semibold">존재하지 않거나 비공개된 페이지예요</h1>
          <p className="text-sm text-neutral-500">관리자에게 URL을 다시 확인해주세요.</p>
        </div>
      </div>
    );
  }

  const config = row.landing_config || ({ template: "dev_center", strengths: [], specialties: [] } as LandingConfig);
  const copy = resolveLandingCopy(row.name, config);
  const {
    meta, heroTitle, heroSub, heroBadge, cta, highlight,
    concernsTitle, concerns, solutionsTitle, solutions,
    trustTitle, trust, processTitle, process, faqsTitle, faqs, programs,
  } = copy;
  const heroImage = config.hero_image_url?.trim() || "";
  const gallery = (config.gallery || []).filter((u) => !!u?.trim());

  async function submit() {
    const parsed = formSchema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "확인해주세요", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("leads").insert({
        center_id: row!.center_id,
        parent_name: parsed.data.parent_name,
        phone: parsed.data.phone,
        concern: parsed.data.concern || null,
        source: "landing",
      });
      if (error) throw error;
      setDone(true);
    } catch (e: any) {
      toast({ title: "전송 실패", description: e?.message ?? "잠시 후 다시 시도해주세요", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  function scrollToInquiry() {
    document.getElementById("inquiry")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 antialiased">
      <Helmet>
        <title>{row.name} · {cta}</title>
        <meta name="description" content={`${row.name} - ${heroSub}`} />
      </Helmet>

      {/* ① HERO */}
      <section className="relative overflow-hidden">
        {heroImage ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${heroImage})` }}
              aria-hidden
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-white" aria-hidden />
          </>
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(60% 60% at 50% 0%, rgba(200,184,138,0.12) 0%, rgba(255,255,255,0) 70%)",
            }}
          />
        )}
        <div className={`relative max-w-3xl mx-auto px-6 pt-20 md:pt-32 pb-16 md:pb-24 text-center space-y-6 ${heroImage ? "text-white" : ""}`}>
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] tracking-[0.2em] border"
            style={heroImage
              ? { borderColor: "rgba(255,255,255,0.5)", color: "#fff", background: "rgba(0,0,0,0.25)" }
              : { borderColor: GOLD_SOFT, color: "#8a784a", background: "#fdfaf2" }}
          >
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: heroImage ? "#fff" : GOLD }} />
            {heroBadge}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight break-keep">
            {renderHighlighted(heroTitle, highlight, !!heroImage)}
          </h1>
          <p className={`text-base md:text-lg break-keep max-w-2xl mx-auto ${heroImage ? "text-white/90" : "text-neutral-600"}`}>
            {heroSub}
          </p>
          {config.region && <p className={`text-sm ${heroImage ? "text-white/70" : "text-neutral-400"}`}>{config.region}</p>}

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Button
              onClick={scrollToInquiry}
              className="rounded-full px-6 h-12 text-sm font-medium text-white"
              style={{ backgroundColor: heroImage ? "#000" : "#1a1a1a" }}
            >
              {cta} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {config.specialties?.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center pt-4">
              {config.specialties.slice(0, 6).map((s) => (
                <span
                  key={s}
                  className="rounded-full px-3 py-1.5 text-[11px]"
                  style={heroImage
                    ? { color: "#fff", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)" }
                    : { color: "#525252", background: "#fafafa", border: "1px solid #f4f4f5" }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ② 공감 */}
      {concerns.length > 0 && (
        <section className="bg-[#f7f6f3] border-y border-neutral-100">
          <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
            <SectionHeader eyebrow="CONCERNS" title={concernsTitle} />
            <div className="grid md:grid-cols-2 gap-4 mt-12">
              {concerns.slice(0, 4).map((c, i) => (
                <article key={i} className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02),0_8px_24px_-12px_rgba(0,0,0,0.08)]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold mb-3"
                       style={{ background: GOLD_SOFT, color: "#7a6a3e" }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className="text-[15px] leading-relaxed text-neutral-700 break-keep">"{c}"</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ③ 솔루션 */}
      {solutions.length > 0 && (
        <section className="bg-white">
          <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
            <SectionHeader eyebrow="OUR APPROACH" title={solutionsTitle} />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
              {solutions.slice(0, 6).map((s, i) => {
                const Icon = SOLUTION_ICONS[s.icon] ?? Sparkles;
                return (
                  <article key={i} className="rounded-2xl border border-neutral-100 p-6 hover:border-neutral-200 transition-colors bg-white">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: GOLD_SOFT }}>
                      <Icon className="w-5 h-5" style={{ color: "#8a784a" }} />
                    </div>
                    <h3 className="text-base font-semibold mb-2">{s.title}</h3>
                    <p className="text-sm text-neutral-600 leading-relaxed break-keep">{s.desc}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ④ 차별점/신뢰 */}
      {(trust.length > 0 || config.strengths?.length > 0) && (
        <section className="bg-[#f7f6f3] border-y border-neutral-100">
          <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
            <SectionHeader eyebrow="WHY US" title={trustTitle} />

            {trust.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12">
                {trust.slice(0, 4).map((t, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-neutral-100 px-5 py-6 text-center">
                    <div className="text-[11px] tracking-[0.18em] text-neutral-400">{t.label}</div>
                    <div className="mt-2 text-lg font-semibold" style={{ color: "#3a3424" }}>{t.value}</div>
                  </div>
                ))}
              </div>
            )}

            {config.strengths?.length > 0 && (
              <ul className="mt-10 grid md:grid-cols-1 gap-3 max-w-3xl mx-auto">
                {config.strengths.filter(Boolean).map((s, i) => (
                  <li key={i} className="flex items-start gap-3 bg-white rounded-2xl border border-neutral-100 p-4">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" style={{ color: GOLD }} />
                    <span className="text-[15px] leading-relaxed text-neutral-700 break-keep">{s}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* ④-2 프로그램 (사진 카드) */}
      {programs.length > 0 && (
        <section className="bg-white">
          <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
            <SectionHeader eyebrow="PROGRAMS" title="주요 프로그램" />
            <div className="grid md:grid-cols-3 gap-5 mt-12">
              {programs.slice(0, 6).map((p, i) => (
                <article key={i} className="rounded-2xl overflow-hidden border border-neutral-100 bg-white">
                  <div className="aspect-[4/3] bg-neutral-100 flex items-center justify-center overflow-hidden">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-neutral-300" />
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-semibold mb-1.5">{p.title}</h3>
                    <p className="text-sm text-neutral-600 leading-relaxed break-keep">{p.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ⑤ 진행 과정 */}
      {process.length > 0 && (
        <section className="bg-[#f7f6f3] border-y border-neutral-100">
          <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
            <SectionHeader eyebrow="PROCESS" title={processTitle} />
            <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
              {process.slice(0, 4).map((p, i) => (
                <li key={i} className="bg-white rounded-2xl border border-neutral-100 p-6">
                  <div className="text-[11px] tracking-[0.18em]" style={{ color: GOLD }}>STEP {String(i + 1).padStart(2, "0")}</div>
                  <h3 className="text-base font-semibold mt-2">{p.title.replace(/^\d+\.\s*/, "")}</h3>
                  <p className="text-sm text-neutral-600 mt-2 leading-relaxed break-keep">{p.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ⑥ 갤러리 (사진 있을 때만) */}
      {gallery.length > 0 && (
        <section className="bg-white">
          <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
            <SectionHeader eyebrow="OUR SPACE" title="공간 둘러보기" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-12">
              {gallery.slice(0, 10).map((url, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-2xl bg-neutral-100">
                  <img src={url} alt={`${row.name} 공간 ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ⑦ FAQ */}
      {faqs.length > 0 && (
        <section className="bg-[#f7f6f3] border-y border-neutral-100">
          <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
            <SectionHeader eyebrow="FAQ" title={faqsTitle} />
            <div className="mt-10 space-y-2">
              {faqs.slice(0, 6).map((f, i) => {
                const open = openFaq === i;
                return (
                  <div key={i} className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="text-[15px] font-medium text-neutral-800 break-keep">{f.q}</span>
                      <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
                    </button>
                    {open && (
                      <div className="px-5 pb-5 text-sm text-neutral-600 leading-relaxed break-keep">{f.a}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ⑧ 최종 CTA + 문의 폼 */}
      <section id="inquiry" className="bg-white">
        <div className="max-w-xl mx-auto px-6 py-16 md:py-24">
          <SectionHeader eyebrow="INQUIRY" title={cta} />
          <p className="text-sm text-neutral-500 text-center mt-3">
            가입 없이 정보만 남기시면 {row.name}에서 직접 연락드립니다.
          </p>

          <div className="mt-8 rounded-3xl border border-neutral-100 bg-white p-6 md:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.02),0_12px_32px_-16px_rgba(0,0,0,0.12)]">
            {done ? (
              <div className="flex items-start gap-3 rounded-2xl bg-[#fdfaf2] border border-[#EFE7D2] p-5">
                <CheckCircle2 className="w-5 h-5 mt-0.5" style={{ color: GOLD }} />
                <div className="text-sm">
                  <div className="font-medium text-neutral-900">문의가 접수되었어요</div>
                  <div className="text-neutral-500 mt-1">담당자가 영업일 기준 1~2일 내로 연락드립니다.</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-500">보호자/본인 이름 *</label>
                  <Input value={form.parent_name} onChange={(e) => setForm({ ...form, parent_name: e.target.value })}
                         placeholder="홍길동" className="bg-white text-neutral-900 h-11 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-500">연락처 *</label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                         placeholder="010-1234-5678" inputMode="tel" className="bg-white text-neutral-900 h-11 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-500">문의 내용 (선택)</label>
                  <Textarea value={form.concern} onChange={(e) => setForm({ ...form, concern: e.target.value })}
                            placeholder="궁금하신 점이나 자녀/본인 상황을 자유롭게 적어주세요."
                            rows={4} maxLength={2000} className="bg-white text-neutral-900 rounded-xl" />
                </div>
                <Button onClick={submit} disabled={submitting}
                        className="w-full rounded-2xl h-12 text-sm font-medium text-white"
                        style={{ backgroundColor: "#1a1a1a" }}>
                  {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Phone className="w-4 h-4 mr-2" />}
                  {submitting ? "전송 중..." : cta}
                </Button>
                <p className="text-[11px] leading-relaxed text-neutral-400">
                  제출하신 정보는 {row.name}의 상담 회신 목적으로만 사용되며, 마케팅 수신에 활용되지 않습니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ⑨ 푸터 */}
      <footer className="border-t border-neutral-100 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-10 text-center space-y-2">
          <div className="text-sm font-medium text-neutral-700">{row.name}</div>
          <div className="text-[11px] text-neutral-400">
            {meta.label} · {config.region || "상담 가능 지역 안내"} · 본 페이지는 AIHPRO 마케팅 스튜디오로 제작되었습니다.
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center space-y-3">
      <div className="text-[11px] tracking-[0.24em]" style={{ color: GOLD }}>{eyebrow}</div>
      <h2 className="text-2xl md:text-4xl font-semibold tracking-tight break-keep">{title}</h2>
      <div className="flex justify-center pt-1">
        <span className="block w-10 h-px" style={{ background: GOLD }} />
      </div>
    </div>
  );
}

function renderHighlighted(text: string, highlight: string, onDark = false) {
  if (!highlight) return text;
  const idx = text.indexOf(highlight);
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span
        className="px-1.5 rounded"
        style={{
          background: onDark
            ? "linear-gradient(180deg, transparent 55%, rgba(255,255,255,0.35) 55%)"
            : "linear-gradient(180deg, transparent 55%, rgba(200,184,138,0.45) 55%)",
        }}
      >
        {highlight}
      </span>
      {text.slice(idx + highlight.length)}
    </>
  );
}
