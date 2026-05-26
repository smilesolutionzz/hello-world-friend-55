import { supabase } from "@/integrations/supabase/client";

export interface ParentInvite {
  id: string;
  client_id: string;
  invite_token: string;
  center_code: string;
  status: "pending" | "claimed" | "revoked";
  claimed_at: string | null;
  expires_at: string;
  created_at: string;
}

export async function createParentInvite(centerId: string, clientId: string): Promise<ParentInvite> {
  // generate code via RPC (defined in migration) — fallback to client-side if not present
  let code = "";
  try {
    const { data } = await supabase.rpc("generate_center_code");
    code = (data as string) ?? "";
  } catch {
    code = randomCode();
  }
  if (!code) code = randomCode();

  const { data, error } = await supabase
    .from("center_client_invites")
    .insert({ center_id: centerId, client_id: clientId, center_code: code })
    .select("*")
    .single();
  if (error) throw error;
  return data as ParentInvite;
}

export async function listInvitesForClient(clientId: string): Promise<ParentInvite[]> {
  const { data, error } = await supabase
    .from("center_client_invites")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ParentInvite[];
}

export async function revokeInvite(id: string) {
  await supabase.from("center_client_invites").update({ status: "revoked" }).eq("id", id);
}

export function inviteUrl(token: string) {
  if (typeof window === "undefined") return `/center-invite/${token}`;
  return `${window.location.origin}/center-invite/${token}`;
}

function randomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function markOnboardingStep(centerId: string, stepKey: string) {
  await supabase
    .from("center_onboarding_progress")
    .upsert({ center_id: centerId, step_key: stepKey }, { onConflict: "center_id,step_key" });
}
