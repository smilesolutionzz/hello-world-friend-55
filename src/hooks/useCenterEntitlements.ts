import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CenterEntitlements {
  loading: boolean;
  hasAny: boolean;
  centers: Array<{ center_id: string; name: string | null }>;
  grants: {
    mind_track_7: boolean;
    assessments_unlimited: boolean;
    report_basic: boolean;
  };
}

const EMPTY: CenterEntitlements = {
  loading: true,
  hasAny: false,
  centers: [],
  grants: { mind_track_7: false, assessments_unlimited: false, report_basic: false },
};

export function useCenterEntitlements(): CenterEntitlements {
  const [state, setState] = useState<CenterEntitlements>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes?.user;
      if (!user) {
        if (!cancelled) setState({ ...EMPTY, loading: false });
        return;
      }
      const { data } = await supabase
        .from("center_b2c_grants")
        .select("center_id, grants, expires_at, center:center_organizations(name)")
        .eq("user_id", user.id);
      const now = Date.now();
      const active = (data ?? []).filter((r: any) => !r.expires_at || new Date(r.expires_at).getTime() > now);
      const merged = active.reduce(
        (acc: any, r: any) => ({
          mind_track_7: acc.mind_track_7 || !!r.grants?.mind_track_7,
          assessments_unlimited: acc.assessments_unlimited || !!r.grants?.assessments_unlimited,
          report_basic: acc.report_basic || !!r.grants?.report_basic,
        }),
        { mind_track_7: false, assessments_unlimited: false, report_basic: false },
      );
      if (!cancelled) {
        setState({
          loading: false,
          hasAny: active.length > 0,
          centers: active.map((r: any) => ({ center_id: r.center_id, name: r.center?.name ?? null })),
          grants: merged,
        });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return state;
}
