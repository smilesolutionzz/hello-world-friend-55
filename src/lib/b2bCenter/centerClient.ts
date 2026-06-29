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
  trial_started_at?: string | null;
  trial_ends_at?: string | null;
  trial_status?: string | null;
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
  const { data, error } = await supabase.rpc("create_center_org", { _name: name });
  if (error) {
    console.error("[createCenter] rpc error", error);
    if (error.message?.includes("AUTH_REQUIRED")) {
      throw new Error("로그인이 필요합니다. 다시 로그인 후 시도하세요.");
    }
    throw new Error(error.message || "기관 생성에 실패했습니다.");
  }
  if (!data) throw new Error("생성된 기관 정보를 받지 못했습니다.");
  return data as CenterOrg;
}

/**
 * 활성 기관 ID 저장.
 * - 브라우저별: 기존 키(`b2b_center_active_id`) — 하위 호환.
 * - 사용자별: `b2b_center_active_id:<userId>` — 같은 브라우저에서 여러 계정을 써도 충돌 X,
 *   다른 브라우저로 이동해도 같은 계정이면 최근 선택을 복원할 수 있게 별도 트래킹.
 *   (단, localStorage는 기기 로컬이므로 진짜 크로스-디바이스 복원은 `listMyCenters()` 결과로 1개면 자동 선택하는 가드로 해결)
 */
const ACTIVE_KEY = "b2b_center_active_id";
const userKey = (uid: string) => `${ACTIVE_KEY}:${uid}`;

export function getActiveCenterId(userId?: string | null): string | null {
  if (typeof window === "undefined") return null;
  if (userId) {
    const scoped = localStorage.getItem(userKey(userId));
    if (scoped) return scoped;
  }
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveCenterId(id: string, userId?: string | null) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_KEY, id);
  if (userId) localStorage.setItem(userKey(userId), id);
}

/**
 * 활성 기관을 결정해서 반환한다.
 * - 저장된 ID가 멤버십 목록에 있으면 그대로 사용
 * - 없고 멤버십이 1개면 자동 선택 + 저장
 * - 여러 개면 null 반환 (호출자가 선택 UI를 띄워야 함)
 */
export function resolveActiveCenter(
  centers: Pick<CenterOrg, "id">[],
  userId?: string | null,
): string | null {
  if (!centers.length) return null;
  const stored = getActiveCenterId(userId);
  if (stored && centers.some((c) => c.id === stored)) return stored;
  if (centers.length === 1) {
    setActiveCenterId(centers[0].id, userId);
    return centers[0].id;
  }
  return null;
}
