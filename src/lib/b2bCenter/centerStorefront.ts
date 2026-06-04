import { supabase } from "@/integrations/supabase/client";

/**
 * 센터 스토어 slug 발급/조회 — 멱등.
 * - 호출자는 해당 센터의 owner/admin 이어야 함 (RPC 내부에서 검증).
 * - 발급된 slug 는 기존 partner_* 시스템에 그대로 매핑되어 콘텐츠/공개 페이지로 재사용됨.
 */
export async function ensureCenterStorefront(centerId: string): Promise<string> {
  const { data, error } = await supabase.rpc("ensure_center_storefront", { _center_id: centerId });
  if (error) {
    if (error.message?.includes("FORBIDDEN")) throw new Error("센터 운영자만 스토어를 발급할 수 있어요.");
    if (error.message?.includes("AUTH_REQUIRED")) throw new Error("로그인이 필요합니다.");
    throw error;
  }
  if (!data) throw new Error("스토어 발급에 실패했습니다.");
  return data as string;
}

export interface CenterPublic {
  id: string;
  name: string;
  storefront_slug: string | null;
  address: string | null;
  phone: string | null;
}

/** 공개 스토어 페이지: slug 로 센터 메타 조회 */
export async function fetchCenterBySlug(slug: string): Promise<CenterPublic | null> {
  const { data, error } = await supabase
    .from("center_organizations")
    .select("id,name,storefront_slug,address,phone")
    .eq("storefront_slug", slug)
    .maybeSingle();
  if (error) {
    console.warn("[fetchCenterBySlug]", error);
    return null;
  }
  return data as CenterPublic | null;
}
