import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// --- date helpers (Monday-start week, local time) ---
export function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = (x.getDay() + 6) % 7; // 0 = Monday
  x.setDate(x.getDate() - day);
  return x;
}
export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
export function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "—";
  return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, "0")}.${String(dt.getDate()).padStart(2, "0")}`;
}

export interface BetaCenter {
  id: string;
  name: string;
  is_beta_partner: boolean;
  beta_started_at: string | null;
  beta_notes: string | null;
}

export interface CenterMetrics {
  centerId: string;
  centerName: string;
  cohortWeek: number | null;
  firstUploadAt: string | null;
  firstReportAt: string | null;
  firstParentViewAt: string | null;
  parentActivationPct: number | null; // 0..100
  parentsReceived: number;
  parentsOpened: number;
}

export interface GlobalMetrics {
  parentActivationPct: number | null;
  parentsReceived: number;
  parentsOpened: number;
  reportsPublished: number;
  uploadsThisWeek: number;
  parentReturnPct: number | null;
}

export function useBetaMetrics() {
  const [loading, setLoading] = useState(true);
  const [centers, setCenters] = useState<BetaCenter[]>([]);
  const [global, setGlobal] = useState<GlobalMetrics | null>(null);
  const [perCenter, setPerCenter] = useState<CenterMetrics[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: orgs, error: orgErr } = await supabase
        .from("center_organizations")
        .select("id,name,is_beta_partner,beta_started_at,beta_notes")
        .eq("is_beta_partner", true)
        .order("beta_started_at", { ascending: true });
      if (orgErr) throw orgErr;
      const betaCenters: BetaCenter[] = (orgs ?? []) as any;
      setCenters(betaCenters);

      if (betaCenters.length === 0) {
        setGlobal({
          parentActivationPct: null,
          parentsReceived: 0,
          parentsOpened: 0,
          reportsPublished: 0,
          uploadsThisWeek: 0,
          parentReturnPct: null,
        });
        setPerCenter([]);
        return;
      }
      const ids = betaCenters.map((c) => c.id);

      const now = new Date();
      const weekStart = startOfWeek(now);
      const weekEnd = addDays(weekStart, 7);
      const prevWeekStart = addDays(weekStart, -7);

      // Share links created this week and prev week (for activation + return)
      const { data: linksThis } = await supabase
        .from("center_parent_share_links")
        .select("center_id,parent_phone_e164,first_verified_at,last_accessed_at,access_count,created_at")
        .in("center_id", ids)
        .gte("created_at", weekStart.toISOString())
        .lt("created_at", weekEnd.toISOString());
      const { data: linksPrev } = await supabase
        .from("center_parent_share_links")
        .select("center_id,parent_phone_e164,first_verified_at,access_count")
        .in("center_id", ids)
        .gte("created_at", prevWeekStart.toISOString())
        .lt("created_at", weekStart.toISOString());
      // All-time first events per center
      const { data: linksAll } = await supabase
        .from("center_parent_share_links")
        .select("center_id,parent_phone_e164,first_verified_at,created_at")
        .in("center_id", ids);
      const { data: uploadsAll } = await supabase
        .from("center_session_uploads")
        .select("center_id,created_at")
        .in("center_id", ids);
      const { data: uploadsThisWeekRows } = await supabase
        .from("center_session_uploads")
        .select("id,center_id,created_at")
        .in("center_id", ids)
        .gte("created_at", weekStart.toISOString())
        .lt("created_at", weekEnd.toISOString());
      const { data: reportsAll } = await supabase
        .from("center_parent_reports")
        .select("center_id,generated_at,sent_at,published_at,created_at,status")
        .in("center_id", ids);
      const { data: reportsThisWeek } = await supabase
        .from("center_parent_reports")
        .select("id,center_id,generated_at,published_at,sent_at,status")
        .in("center_id", ids)
        .gte("created_at", weekStart.toISOString())
        .lt("created_at", weekEnd.toISOString());

      // --- Global ---
      const thisPhones = new Set(
        (linksThis ?? []).map((r: any) => `${r.center_id}::${r.parent_phone_e164}`).filter(Boolean),
      );
      const thisOpenedPhones = new Set(
        (linksThis ?? [])
          .filter((r: any) => r.first_verified_at)
          .map((r: any) => `${r.center_id}::${r.parent_phone_e164}`),
      );
      const prevOpenedPhones = new Set(
        (linksPrev ?? [])
          .filter((r: any) => r.first_verified_at)
          .map((r: any) => `${r.center_id}::${r.parent_phone_e164}`),
      );
      const returningCount = [...thisOpenedPhones].filter((p) => prevOpenedPhones.has(p)).length;
      const parentActivation = thisPhones.size > 0 ? Math.round((thisOpenedPhones.size / thisPhones.size) * 100) : null;
      const parentReturn = prevOpenedPhones.size > 0 ? Math.round((returningCount / prevOpenedPhones.size) * 100) : null;

      setGlobal({
        parentActivationPct: parentActivation,
        parentsReceived: thisPhones.size,
        parentsOpened: thisOpenedPhones.size,
        reportsPublished: (reportsThisWeek ?? []).length,
        uploadsThisWeek: (uploadsThisWeekRows ?? []).length,
        parentReturnPct: parentReturn,
      });

      // --- Per center ---
      const byCenter = (rows: any[] | null, getDate: (r: any) => string | null) => {
        const map = new Map<string, string>();
        (rows ?? []).forEach((r) => {
          const d = getDate(r);
          if (!d) return;
          const prev = map.get(r.center_id);
          if (!prev || d < prev) map.set(r.center_id, d);
        });
        return map;
      };
      const firstUploads = byCenter(uploadsAll, (r) => r.created_at);
      const firstReports = byCenter(reportsAll, (r) => r.published_at ?? r.generated_at ?? r.created_at);
      const firstViews = byCenter(linksAll, (r) => r.first_verified_at);

      const perCenterMetrics: CenterMetrics[] = betaCenters.map((c) => {
        const links = (linksThis ?? []).filter((r: any) => r.center_id === c.id);
        const phones = new Set(links.map((r: any) => r.parent_phone_e164).filter(Boolean));
        const opened = new Set(links.filter((r: any) => r.first_verified_at).map((r: any) => r.parent_phone_e164));
        const pct = phones.size > 0 ? Math.round((opened.size / phones.size) * 100) : null;
        let cohortWeek: number | null = null;
        if (c.beta_started_at) {
          const start = startOfWeek(new Date(c.beta_started_at));
          const diff = Math.floor((weekStart.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
          cohortWeek = Math.max(1, diff + 1);
        }
        return {
          centerId: c.id,
          centerName: c.name,
          cohortWeek,
          firstUploadAt: firstUploads.get(c.id) ?? null,
          firstReportAt: firstReports.get(c.id) ?? null,
          firstParentViewAt: firstViews.get(c.id) ?? null,
          parentActivationPct: pct,
          parentsReceived: phones.size,
          parentsOpened: opened.size,
        };
      });
      setPerCenter(perCenterMetrics);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { loading, error, centers, global, perCenter, reload: load };
}
