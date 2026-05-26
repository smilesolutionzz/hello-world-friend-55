import { supabase } from "@/integrations/supabase/client";

export type CenterRole = "owner" | "admin" | "therapist" | "viewer";

export interface CenterOrg {
  id: string;
  owner_id: string;
  name: string;
  business_no?: string | null;
  phone?: string | null;
  address?: string | null;
  contract_expires_at?: string | null;
  plan: string;
  created_at: string;
}

/** 현재 로그인한 사용자가 속한 기관 목록 */
export async function listMyCenters(): Promise<CenterOrg[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data: members, error } = await supabase
    .from("center_members")
    .select("center_id, role, center_organizations:center_id(*)")
    .eq("user_id", user.id);
  if (error) throw error;
  return (members ?? []).map((m: any) => m.center_organizations).filter(Boolean);
}

export async function createCenter(name: string): Promise<CenterOrg> {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) throw new Error("로그인이 필요합니다. 다시 로그인 후 시도하세요.");
  const { data, error } = await supabase
    .from("center_organizations")
    .insert({ name, owner_id: user.id })
    .select("*")
    .maybeSingle();
  if (error) {
    console.error("[createCenter] insert error", error);
    throw new Error(error.message || "기관 생성에 실패했습니다.");
  }
  if (!data) throw new Error("생성된 기관을 불러오지 못했습니다. 권한을 확인하세요.");
  return data as CenterOrg;
}

/** localStorage 활성 기관 */
const ACTIVE_KEY = "b2b_center_active_id";
export function getActiveCenterId(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem(ACTIVE_KEY) : null;
}
export function setActiveCenterId(id: string) {
  if (typeof window !== "undefined") localStorage.setItem(ACTIVE_KEY, id);
}
