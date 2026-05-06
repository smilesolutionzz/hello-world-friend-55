import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Crown, Zap, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import QuoteRequestDialog from './QuoteRequestDialog';

interface JobCoachPlan {
  id: string;
  plan_key: string;
  plan_name: string;
  tier: 'starter' | 'pro' | 'enterprise';
  price_per_employee_monthly: number;
  min_employees: number;
  max_employees: number | null;
  free_coaching_per_employee: number;
  features: string[];
  description: string | null;
  is_recommended: boolean;
}

const tierIcon: Record<string, any> = {
  starter: Zap,
  pro: Sparkles,
  enterprise: Crown,
};

interface Props {
  onSelectPlan?: (tier: string) => void;
}

export const JobCoachPricingTiers: React.FC<Props> = ({ onSelectPlan }) => {
  const [plans, setPlans] = useState<JobCoachPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [quotePlan, setQuotePlan] = useState<JobCoachPlan | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('b2b_jobcoach_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      setPlans((data as any) || []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">요금제 로딩 중...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {plans.map((plan, idx) => {
        const Icon = tierIcon[plan.tier] || Sparkles;
        const isPro = plan.is_recommended;
        return (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
          >
            <Card
              className={`relative h-full p-6 flex flex-col ${
                isPro
                  ? 'border-2 border-primary shadow-2xl bg-gradient-to-br from-primary/5 via-white to-blue-50'
                  : 'border border-border bg-white'
              }`}
            >
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1 text-xs font-bold">
                    가장 인기
                  </Badge>
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`p-2 rounded-lg ${
                    isPro ? 'bg-primary text-primary-foreground' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {plan.tier}
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-1 break-keep">
                {plan.plan_name}
              </h3>
              <p className="text-xs text-slate-600 mb-5 break-keep min-h-[36px]">
                {plan.description}
              </p>

              <div className="mb-5">
                {plan.tier === 'enterprise' ? (
                  <div>
                    <span className="text-3xl font-black text-slate-900">맞춤 견적</span>
                    <p className="text-xs text-slate-600 mt-1">500명 이상 · 협의</p>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-slate-900">
                      ₩{plan.price_per_employee_monthly.toLocaleString()}
                    </span>
                    <span className="text-sm text-slate-600">/명·월</span>
                  </div>
                )}
                <p className="text-[11px] text-slate-500 mt-1.5">
                  최소 {plan.min_employees}명
                  {plan.max_employees ? ` · 최대 ${plan.max_employees}명` : ''}
                </p>
              </div>

              <div className="space-y-2.5 mb-6 flex-1">
                {(plan.features || []).map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        isPro ? 'text-primary' : 'text-emerald-600'
                      }`}
                    />
                    <span className="break-keep leading-relaxed">{f}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className={`w-full h-11 font-bold ${
                  isPro
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
                onClick={() => onSelectPlan?.(plan.tier)}
              >
                {plan.tier === 'enterprise' ? '맞춤 상담 요청' : '도입 문의하기'}
              </Button>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default JobCoachPricingTiers;
