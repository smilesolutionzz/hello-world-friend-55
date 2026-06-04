import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ExternalLink, MapPin, Phone, Store, BookOpen } from "lucide-react";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import SEOHead from "@/components/common/SEOHead";
import { Button } from "@/components/ui/button";
import { fetchCenterBySlug } from "@/lib/b2bCenter/centerStorefront";
import {
  fetchPartnerPrograms,
  fetchPartnerProducts,
  formatKRW,
  logPartnerClick,
} from "@/lib/partnerMarket";

export default function CenterStorefrontPublic() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();

  const centerQ = useQuery({
    queryKey: ["center_public", slug],
    queryFn: () => fetchCenterBySlug(slug),
    enabled: !!slug,
  });
  const programsQ = useQuery({
    queryKey: ["partner_programs", slug],
    queryFn: () => fetchPartnerPrograms(slug),
    enabled: !!slug,
  });
  const productsQ = useQuery({
    queryKey: ["partner_products", slug],
    queryFn: () => fetchPartnerProducts(slug),
    enabled: !!slug,
  });

  const center = centerQ.data;
  const programs = programsQ.data ?? [];
  const products = productsQ.data ?? [];

  const handleExternal = (url: string | null, type: "program" | "product", id: string) => {
    if (!url) return;
    logPartnerClick(slug, type, id);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (centerQ.isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <UnifiedNavigation />
        <div className="max-w-3xl mx-auto px-5 py-20 text-center text-neutral-400 text-sm">불러오는 중…</div>
      </div>
    );
  }

  if (!center) {
    return (
      <div className="min-h-screen bg-white">
        <Helmet><title>센터를 찾을 수 없습니다</title></Helmet>
        <UnifiedNavigation />
        <div className="max-w-3xl mx-auto px-5 py-16 text-center">
          <h1 className="text-xl font-bold">센터를 찾을 수 없습니다</h1>
          <Button className="mt-6" onClick={() => navigate("/find-center")}>센터 찾기로</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <SEOHead
        title={`${center.name} · 운영 프로그램·자료`}
        description={`${center.name}의 운영 프로그램과 추천 도서·교구를 확인하세요.`}
      />
      <UnifiedNavigation />

      {/* Hero */}
      <div className="border-b border-neutral-100 bg-[#FAF6E8]/30">
        <div className="max-w-3xl mx-auto px-5 py-10">
          <button onClick={() => navigate(-1)} className="text-xs text-neutral-500 inline-flex items-center gap-1 mb-4 hover:text-neutral-900">
            <ArrowLeft className="w-3.5 h-3.5" /> 뒤로
          </button>
          <p className="text-[11px] tracking-widest text-[#C8B88A] mb-2">CENTER STOREFRONT</p>
          <h1 className="text-3xl font-bold break-keep">{center.name}</h1>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-neutral-600">
            {center.address && (
              <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{center.address}</span>
            )}
            {center.phone && (
              <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{center.phone}</span>
            )}
          </div>
        </div>
      </div>

      {/* Programs */}
      <section className="max-w-3xl mx-auto px-5 pt-10">
        <div className="flex items-center gap-2 mb-4">
          <Store className="w-4 h-4 text-[#C8B88A]" />
          <h2 className="text-lg font-bold">운영 프로그램</h2>
          <span className="text-xs text-neutral-400">({programs.length})</span>
        </div>
        {programs.length === 0 ? (
          <p className="text-sm text-neutral-400 py-8 text-center border border-dashed border-neutral-200 rounded-xl">
            아직 등록된 프로그램이 없습니다.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {programs.map((p) => (
              <div key={p.id} className="rounded-2xl border border-neutral-200 bg-white overflow-hidden flex flex-col">
                {p.thumbnail_url && (
                  <div className="aspect-[16/10] bg-neutral-100 overflow-hidden">
                    <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4 flex-1 flex flex-col">
                  <p className="text-[11px] text-neutral-500 mb-1">{[p.category, p.target_age].filter(Boolean).join(" · ")}</p>
                  <p className="font-semibold text-sm break-keep">{p.title}</p>
                  {p.duration_text && <p className="text-xs text-neutral-500 mt-1">{p.duration_text}</p>}
                  {p.description && <p className="text-xs text-neutral-600 mt-2 line-clamp-3 break-keep">{p.description}</p>}
                  <div className="mt-3 flex items-center justify-between pt-3 border-t border-neutral-100">
                    <p className="text-sm font-bold">{formatKRW(p.price_krw)}</p>
                    <Button size="sm" disabled={!p.cta_url} onClick={() => handleExternal(p.cta_url, "program", p.id)}>
                      {p.cta_label || "신청하기"} <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Products */}
      <section className="max-w-3xl mx-auto px-5 pt-10">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-[#C8B88A]" />
          <h2 className="text-lg font-bold">추천 도서·교구</h2>
          <span className="text-xs text-neutral-400">({products.length})</span>
        </div>
        {products.length === 0 ? (
          <p className="text-sm text-neutral-400 py-8 text-center border border-dashed border-neutral-200 rounded-xl">
            아직 등록된 도서·교구가 없습니다.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {products.map((p) => (
              <div key={p.id} className="rounded-2xl border border-neutral-200 bg-white overflow-hidden flex flex-col">
                {p.thumbnail_url && (
                  <div className="aspect-square bg-neutral-100 overflow-hidden">
                    <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4 flex-1 flex flex-col">
                  <p className="text-[11px] text-neutral-500 mb-1">{p.kind === "book" ? "도서" : p.kind === "kit" ? "키트" : "굿즈"}{p.author ? ` · ${p.author}` : ""}</p>
                  <p className="font-semibold text-sm break-keep">{p.title}</p>
                  {p.description && <p className="text-xs text-neutral-600 mt-2 line-clamp-3 break-keep">{p.description}</p>}
                  <div className="mt-3 flex items-center justify-between pt-3 border-t border-neutral-100">
                    <p className="text-sm font-bold">{formatKRW(p.price_krw)}</p>
                    <Button size="sm" variant="outline" disabled={!p.external_buy_url} onClick={() => handleExternal(p.external_buy_url, "product", p.id)}>
                      구매하기 <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="max-w-3xl mx-auto px-5 mt-12 text-[11px] text-neutral-400 break-keep">
        ※ AIHPRO는 본 센터의 외부 구매·신청 처리에 직접 관여하지 않습니다. 결제·환불·배송 문의는 각 센터로 직접 연락 바랍니다.
      </p>
    </div>
  );
}
