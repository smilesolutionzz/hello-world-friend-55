import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Loader2, ShieldCheck, Phone, CheckCircle2 } from "lucide-react";
import {
  type LandingConfig,
  TEMPLATE_META,
  resolveLandingCopy,
} from "@/lib/b2bCenter/landingTemplates";

interface LandingRow {
  center_id: string;
  name: string;
  landing_config: LandingConfig;
}

const formSchema = z.object({
  parent_name: z.string().trim().min(1, "이름을 입력해주세요").max(60),
  phone: z
    .string()
    .trim()
    .min(7, "연락처를 정확히 입력해주세요")
    .max(20)
    .regex(/^[0-9+\-\s().]{7,20}$/, "연락처 형식이 올바르지 않아요"),
  concern: z.string().trim().max(2000).optional().or(z.literal("")),
});

const themeStyles = {
  light: {
    page: "bg-white text-neutral-900",
    muted: "text-neutral-500",
    chip: "bg-neutral-100 text-neutral-700",
    card: "bg-white border-neutral-100",
    btn: "bg-neutral-900 hover:bg-black text-white",
    highlight: "bg-[#FFF299] text-neutral-900",
  },
  dark: {
    page: "bg-[#0f1813] text-white",
    muted: "text-white/60",
    chip: "bg-white/10 text-white/80",
    card: "bg-white/[0.04] border-white/10",
    btn: "bg-[#d8ff3a] hover:bg-[#caf030] text-black",
    highlight: "bg-[#d8ff3a] text-black",
  },
  pastel: {
    page: "bg-[#eaf2ff] text-neutral-900",
    muted: "text-neutral-600",
    chip: "bg-white/80 text-neutral-700",
    card: "bg-white/80 border-white",
    btn: "bg-[#1c3fa3] hover:bg-[#152f7a] text-white",
    highlight: "bg-[#1c3fa3] text-white",
  },
} as const;

export default function CenterLandingPublic() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [row, setRow] = useState<LandingRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ parent_name: "", phone: "", concern: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    (async () => {
      const { data, error } = await supabase.rpc("get_center_landing_by_slug", { _slug: slug });
      if (!error && Array.isArray(data) && data.length > 0) {
        setRow(data[0] as unknown as LandingRow);
      }
      setLoading(false);
    })();
  }, [slug]);

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
  const { meta, heroTitle, heroSub, heroBadge, cta, highlight } = resolveLandingCopy(row.name, config);
  const theme = themeStyles[TEMPLATE_META[config.template]?.theme ?? "light"];

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

  return (
    <div className={`min-h-screen ${theme.page}`}>
      <Helmet>
        <title>{row.name} · {cta}</title>
        <meta name="description" content={`${row.name} - ${heroSub}`} />
      </Helmet>

      <div className="max-w-2xl mx-auto px-6 py-14 md:py-20 space-y-12">
        {/* Hero */}
        <header className="space-y-5 text-center">
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] tracking-[0.18em] ${theme.chip}`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            {heroBadge}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight break-keep">
            {renderHighlighted(heroTitle, highlight, theme.highlight)}
          </h1>
          <p className={`text-base md:text-lg break-keep ${theme.muted}`}>{heroSub}</p>
          {config.region && <p className={`text-sm ${theme.muted}`}>· {config.region}</p>}
        </header>

        {/* Specialties */}
        {config.specialties?.length > 0 && (
          <section className="flex flex-wrap gap-2 justify-center">
            {config.specialties.map((s) => (
              <span key={s} className={`rounded-full px-3 py-1.5 text-xs ${theme.chip}`}>#{s}</span>
            ))}
          </section>
        )}

        {/* Strengths */}
        {config.strengths?.length > 0 && (
          <section className={`rounded-3xl border p-6 md:p-8 space-y-4 ${theme.card}`}>
            <h2 className="text-lg font-semibold text-center">이런 분께 추천합니다</h2>
            <ul className="space-y-4 max-w-md mx-auto">
              {config.strengths.filter(Boolean).map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm md:text-base leading-relaxed break-keep">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 opacity-70" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Form */}
        <section id="inquiry" className={`rounded-3xl border p-6 md:p-8 space-y-5 ${theme.card}`}>
          <div className="space-y-1 text-center">
            <div className={`text-xs tracking-[0.18em] ${theme.muted}`}>INQUIRY</div>
            <h2 className="text-xl font-semibold">{cta}</h2>
            <p className={`text-sm ${theme.muted}`}>가입 없이 정보만 남기시면 {row.name}에서 직접 연락드려요.</p>
          </div>

          {done ? (
            <div className="flex items-start gap-3 rounded-2xl bg-white border border-neutral-100 p-5 text-neutral-900">
              <CheckCircle2 className="w-5 h-5 mt-0.5 text-emerald-600" />
              <div className="text-sm">
                <div className="font-medium">문의가 접수되었어요</div>
                <div className="text-neutral-500 mt-1">담당자가 영업일 기준 1~2일 내로 연락드립니다.</div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className={`text-xs ${theme.muted}`}>보호자/본인 이름 *</label>
                <Input value={form.parent_name} onChange={(e) => setForm({ ...form, parent_name: e.target.value })} placeholder="홍길동" className="bg-white text-neutral-900" />
              </div>
              <div>
                <label className={`text-xs ${theme.muted}`}>연락처 *</label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="010-1234-5678" inputMode="tel" className="bg-white text-neutral-900" />
              </div>
              <div>
                <label className={`text-xs ${theme.muted}`}>문의 내용 (선택)</label>
                <Textarea
                  value={form.concern}
                  onChange={(e) => setForm({ ...form, concern: e.target.value })}
                  placeholder="궁금하신 점이나 자녀/본인 상황을 자유롭게 적어주세요."
                  rows={4}
                  maxLength={2000}
                  className="bg-white text-neutral-900"
                />
              </div>
              <Button onClick={submit} disabled={submitting} className={`w-full rounded-2xl ${theme.btn}`}>
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Phone className="w-4 h-4 mr-2" />}
                {submitting ? "전송 중..." : cta}
              </Button>
              <p className={`text-[11px] leading-relaxed ${theme.muted}`}>
                제출하신 정보는 {row.name}의 상담 회신 목적으로만 사용되며, 마케팅 수신에 활용되지 않습니다.
              </p>
            </div>
          )}
        </section>

        <footer className={`pt-4 text-[11px] text-center ${theme.muted}`}>
          이 페이지는 AIHPRO 마케팅 스튜디오로 제작되었습니다. · {meta.label}
        </footer>
      </div>
    </div>
  );
}

function renderHighlighted(text: string, highlight: string, cls: string) {
  if (!highlight) return text;
  const idx = text.indexOf(highlight);
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className={`${cls} px-1.5 rounded`}>{highlight}</mark>
      {text.slice(idx + highlight.length)}
    </>
  );
}
