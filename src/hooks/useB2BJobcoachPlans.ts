import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface B2BJobcoachPlan {
  id: string;
  plan_key: string;
  plan_name: string;
  tier: string;
  price_per_employee_monthly: number;
  min_employees: number;
  max_employees: number | null;
  is_recommended: boolean;
}

/**
 * B2B 잡코치 플랜을 DB에서 로드한다.
 * 가격은 절대 코드/메모리 하드코딩 금지 (memory: pricing constants).
 */
export function useB2BJobcoachPlans() {
  const [plans, setPlans] = useState<B2BJobcoachPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('b2b_jobcoach_plans')
        .select('id, plan_key, plan_name, tier, price_per_employee_monthly, min_employees, max_employees, is_recommended')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (!cancelled) {
        if (!error && data) setPlans(data as B2BJobcoachPlan[]);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getByKey = (key: string) => plans.find((p) => p.plan_key === key);
  const recommended = plans.find((p) => p.is_recommended) ?? plans[1] ?? plans[0];

  return { plans, loading, getByKey, recommended };
}
