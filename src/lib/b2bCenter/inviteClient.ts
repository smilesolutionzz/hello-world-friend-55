import { supabase } from "@/integrations/supabase/client";

export interface CenterInvite {
  id: string;
  center_id: string;
  email: string;
  role: string;
  token: string;
  invited_by: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export async function createCenterInvite(
  centerId: string,
  email: string,
  role: "owner" | "admin" | "therapist" | "viewer" = "therapist"
): Promise<CenterInvite> {
  const { data, error } = await supabase.rpc("create_center_invite", {
    _center_id: centerId,
    _email: email,
    _role: role,
  });
  if (error) throw new Error(error.message);
  return data as unknown as CenterInvite;
}

export async function acceptCenterInvite(token: string) {
  const { data, error } = await supabase.rpc("accept_center_invite", { _token: token });
  if (error) throw new Error(error.message);
  return data;
}

export async function listCenterInvites(centerId: string): Promise<CenterInvite[]> {
  const { data, error } = await supabase
    .from("center_invites")
    .select("*")
    .eq("center_id", centerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as CenterInvite[];
}

export function buildInviteUrl(token: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://aihpro.app";
  return `${origin}/b2b-center/invite/${token}`;
}
