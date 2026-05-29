import { supabase } from "@/integrations/supabase/client";

export interface ActionItem {
  title: string;
  when: string;
  how: string;
  why: string;
}

export interface VideoPick {
  title: string;
  channel: string;
  searchQuery: string;
  youtubeSearchUrl: string;
  why: string;
}

export interface ProductPick {
  name: string;
  ageRange: string;
  why: string;
  searchKeyword: string;
}

export interface ActionPrescription {
  id: string;
  enrollment_id: string;
  day_number: number;
  audience: string;
  framework: string | null;
  track_focus: string | null;
  summary: string | null;
  actions: ActionItem[];
  rationale: { framework?: string; key_principles?: string[] };
  observation_points: string[];
  video_picks: VideoPick[];
  product_picks: ProductPick[];
  generated_at: string;
}

export async function fetchOrCreatePrescription(params: {
  enrollmentId: string;
  dayNumber: number;
  audience?: string;
  focus?: string | null;
  force?: boolean;
}): Promise<ActionPrescription | null> {
  // cache hit shortcut
  if (!params.force) {
    const { data } = await supabase
      .from("mind_track_action_prescriptions")
      .select("*")
      .eq("enrollment_id", params.enrollmentId)
      .eq("day_number", params.dayNumber)
      .maybeSingle();
    if (data) return data as unknown as ActionPrescription;
  }
  const { data, error } = await supabase.functions.invoke(
    "mind-track-action-prescribe",
    {
      body: {
        enrollmentId: params.enrollmentId,
        dayNumber: params.dayNumber,
        audience: params.audience,
        focus: params.focus,
        force: params.force ?? false,
      },
    },
  );
  if (error) {
    console.error("[prescription] invoke failed", error);
    return null;
  }
  return (data as any)?.prescription as ActionPrescription;
}
