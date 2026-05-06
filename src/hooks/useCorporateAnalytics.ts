import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DeptWeeklyAggregate {
  institution_id: string;
  department_code: string;
  week_start: string;
  employee_count: number;
  avg_stress: number | null;
  avg_burnout: number | null;
  avg_satisfaction: number | null;
  at_risk_count: number | null;
  session_count: number;
  is_visible: boolean;
}
export interface CompanyOverview {
  institution_id: string;
  total_employees: number;
  total_sessions: number;
  avg_stress: number;
  avg_burnout: number;
  avg_satisfaction: number;
  at_risk_sessions: number;
  at_risk_employees: number;
  last_session_at: string;
}

export function useCorporateAnalytics(institutionId?: string) {
  const [overview, setOverview] = useState<CompanyOverview | null>(null);
  const [weekly, setWeekly] = useState<DeptWeeklyAggregate[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    try {
      let instId = institutionId;
      if (!instId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: ownInst } = await supabase
            .from('b2b_partner_institutions')
            .select('id').eq('user_id', user.id).maybeSingle();
          instId = ownInst?.id;
        }
      }
      if (!instId) { setOverview(null); setWeekly([]); return; }

      const [{ data: ov }, { data: wk }] = await Promise.all([
        supabase.from('v_b2b_company_overview' as any).select('*').eq('institution_id', instId).maybeSingle(),
        supabase.from('v_b2b_dept_weekly_aggregates' as any).select('*').eq('institution_id', instId).order('week_start', { ascending: false }).limit(200),
      ]);
      setOverview((ov as any) ?? null);
      setWeekly(((wk as any) || []) as DeptWeeklyAggregate[]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refetch(); }, [institutionId]);

  return { overview, weekly, isLoading, error, refetch, data: overview };
}
