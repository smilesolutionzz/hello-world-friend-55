import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Store, ExternalLink, Copy, Check, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ensureCenterStorefront,
} from "@/lib/b2bCenter/centerStorefront";
import {
  fetchPartnerPrograms,
  fetchPartnerProducts,
} from "@/lib/partnerMarket";
import { PartnerRowItem, PartnerEditDialog } from "@/pages/PartnerConsole";

interface Ctx {
  centerId: string;
  demo?: boolean;
}

type Tab = "programs" | "products";

export default function CenterStorefrontPage() {
  const { centerId, demo } = useOutletContext<Ctx>();
  const { user, authenticated } = useAuthGuard();
  const qc = useQueryClient();

  const [slug, setSlug] = useState<string | null>(null);
  const [centerName, setCenterName] = useState<string>("");
  const [provisioning, setProvisioning] = useState(false);
  const [tab, setTab] = useState<Tab>("programs");
  const [editing, setEditing] = useState<null | { kind: "program" | "product"; row?: any }>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (demo) {
      setSlug("center-demo");
      setCenterName("데모 센터");
      return;
    }
    if (!centerId) return;
    supabase
      .from("center_organizations")
      .select("name,storefront_slug")
      .eq("id", centerId)
      .maybeSingle()
      .then(({ data }) => {
        setCenterName(data?.name ?? "");
        setSlug(data?.storefront_slug ?? null);
      });
  }, [centerId, demo]);

  const handleProvision = async () => {
    if (demo) return toast.message("데모 모드에서는 발급되지 않아요");
    setProvisioning(true);
    try {
      const s = await ensureCenterStorefront(centerId);
      setSlug(s);
      toast.success("스토어가 발급되었어요");
    } catch (e: any) {
      toast.error(e.message ?? "발급에 실패했어요");
    } finally {
      setProvisioning(false);
    }
  };

  const publicUrl = slug ? `${window.location.origin}/center/${slug}` : "";

  const programsQ = useQuery({
    queryKey: ["center_storefront_programs", slug],
    queryFn: () => fetchPartnerPrograms(slug!, { ownerView: true }),
    enabled: !!slug && !demo,
  });
  const productsQ = useQuery({
    queryKey: ["center_storefront_products", slug],
    queryFn: () => fetchPartnerProducts(slug!, { ownerView: true }),
    enabled: !!slug && !demo,
  });

  const handleDelete = async (kind: "program" | "product", id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    const table = kind === "program" ? "partner_programs" : "partner_products";
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("삭제되었습니다");
    qc.invalidateQueries({ queryKey: ["center_storefront_programs", slug] });
    qc.invalidateQueries({ queryKey: ["center_storefront_products", slug] });
  };

  const copy = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Helmet><title>스토어 — AIHPRO 센터</title></Helmet>

      <div>
        <p className="text-xs tracking-widest text-neutral-500 mb-1">STOREFRONT</p>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Store className="w-5 h-5 text-[#C8B88A]" />
          센터 스토어
        </h1>
        <p className="text-sm text-neutral-500 mt-1 break-keep">
          운영 프로그램·추천 도서·교구를 등록해 학부모에게 공개 페이지로 노출합니다. 결제는 외부 링크(자사몰·스마트스토어 등)로 연결됩니다.
        </p>
      </div>

      {/* Storefront URL panel */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        {!slug ? (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-semibold mb-1">아직 스토어가 발급되지 않았습니다</p>
              <p className="text-sm text-neutral-500 break-keep">발급하면 즉시 공개 페이지가 생기고, 학부모는 링크로 바로 신청·구매 클릭이 가능합니다.</p>
            </div>
            <Button onClick={handleProvision} disabled={provisioning || !authenticated}>
              {provisioning ? "발급 중…" : "스토어 발급"}
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-neutral-500 mb-1">공개 URL</p>
              <p className="font-mono text-sm truncate">{publicUrl}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={copy}>
                {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? "복사됨" : "URL 복사"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(publicUrl, "_blank")}>
                미리보기 <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {slug && !demo && (
        <>
          {/* Tabs */}
          <div className="flex gap-2 border-b border-neutral-200">
            {(["programs", "products"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                  tab === t
                    ? "border-[#C8B88A] text-neutral-900"
                    : "border-transparent text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {t === "programs" ? "운영 프로그램" : "도서·굿즈·교구"}
              </button>
            ))}
          </div>

          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => setEditing({ kind: tab === "programs" ? "program" : "product" })}
            >
              <Plus className="w-4 h-4 mr-1" /> 새로 등록
            </Button>
          </div>

          <div className="space-y-2">
            {tab === "programs" &&
              (programsQ.data ?? []).map((row) => (
                <PartnerRowItem
                  key={row.id}
                  title={row.title}
                  subtitle={[row.category, row.target_age, row.duration_text].filter(Boolean).join(" · ")}
                  priceLabel={row.price_krw ? `₩${row.price_krw.toLocaleString("ko-KR")}` : "가격 문의"}
                  thumb={row.thumbnail_url}
                  published={row.is_published}
                  onEdit={() => setEditing({ kind: "program", row })}
                  onDelete={() => handleDelete("program", row.id)}
                />
              ))}
            {tab === "products" &&
              (productsQ.data ?? []).map((row) => (
                <PartnerRowItem
                  key={row.id}
                  title={row.title}
                  subtitle={[row.kind === "book" ? "도서" : row.kind === "kit" ? "키트" : "굿즈", row.author].filter(Boolean).join(" · ")}
                  priceLabel={row.price_krw ? `₩${row.price_krw.toLocaleString("ko-KR")}` : "가격 문의"}
                  thumb={row.thumbnail_url}
                  published={row.is_published}
                  onEdit={() => setEditing({ kind: "product", row })}
                  onDelete={() => handleDelete("product", row.id)}
                />
              ))}
            {tab === "programs" && (programsQ.data ?? []).length === 0 && (
              <p className="text-sm text-neutral-500 py-10 text-center">아직 등록된 프로그램이 없습니다.</p>
            )}
            {tab === "products" && (productsQ.data ?? []).length === 0 && (
              <p className="text-sm text-neutral-500 py-10 text-center">아직 등록된 도서·교구가 없습니다.</p>
            )}
          </div>
        </>
      )}

      {editing && slug && user && (
        <PartnerEditDialog
          slug={slug}
          userId={user.id}
          kind={editing.kind}
          row={editing.row}
          institutionName={centerName}
          institutionType="센터"
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            qc.invalidateQueries({ queryKey: ["center_storefront_programs", slug] });
            qc.invalidateQueries({ queryKey: ["center_storefront_products", slug] });
          }}
        />
      )}
    </div>
  );
}
