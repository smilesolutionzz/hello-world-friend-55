import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, Gift, Zap, Crown, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/i18n';
import { useLanguage } from '@/i18n/LanguageContext';

export const MainPromoSection = () => {
  const navigate = useNavigate();
  const { user } = useAuthGuard();
  const [isFreeTrialEligible, setIsFreeTrialEligible] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const { t } = useTranslation();
  const { localePath } = useLanguage();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();
      setTimeLeft({ hours: Math.floor(diff / (1000 * 60 * 60)), minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)), seconds: Math.floor((diff % (1000 * 60)) / 1000) });
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkEligibility = async () => {
      if (!user) { setIsFreeTrialEligible(true); return; }
      const { data: subscriptions } = await supabase.from('user_subscriptions').select('id').eq('user_id', user.id).in('subscription_type', ['premium', 'lifetime']).limit(1);
      const { data: trials } = await supabase.from('user_free_trials').select('id').eq('user_id', user.id).eq('plan_type', 'premium').limit(1);
      setIsFreeTrialEligible((!subscriptions || subscriptions.length === 0) && (!trials || trials.length === 0));
    };
    checkEligibility();
  }, [user]);

  const benefits = [t.mainPromo.benefit1, t.mainPromo.benefit2, t.mainPromo.benefit3, t.mainPromo.benefit4];

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-6">
          <Badge className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-4 py-1.5 text-sm font-bold animate-pulse"><Gift className="w-4 h-4 mr-1" />{t.mainPromo.badge}</Badge>
        </div>

        <Card className="relative overflow-hidden border-2 border-violet-500/30 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-fuchsia-500/5 to-purple-500/5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2"><Crown className="w-6 h-6 text-violet-400" /><span className="text-violet-400 font-bold text-lg">{t.mainPromo.premiumPass}</span></div>
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                    {isFreeTrialEligible ? (<><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">{t.mainPromo.freeTrialTitle}</span>{t.mainPromo.freeTrialTitleEnd}</>) : (<>{t.mainPromo.premiumTitle}<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">{t.mainPromo.premiumTitleHighlight}</span></>)}
                  </h2>
                  <p className="text-slate-400">{isFreeTrialEligible ? t.mainPromo.freeTrialDesc : t.mainPromo.premiumDesc}</p>
                </div>
                <div className="space-y-3">
                  {benefits.map((benefit, index) => (<div key={index} className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" /><span>{benefit}</span></div>))}
                </div>
                <div className="flex items-baseline gap-3">
                  {isFreeTrialEligible ? (<><span className="text-4xl font-black text-white">{t.mainPromo.priceZero}</span><span className="text-slate-400">{t.mainPromo.priceFreeNote} <span className="text-violet-400 font-semibold">{t.mainPromo.priceMonthly}</span>{t.mainPromo.pricePerMonth}</span></>) : (<span className="text-4xl font-black text-white">{t.mainPromo.priceMonthly}<span className="text-lg font-normal text-slate-400">{t.mainPromo.pricePerMonth}</span></span>)}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700">
                  <div className="flex items-center justify-center gap-2 mb-3"><Clock className="w-5 h-5 text-fuchsia-400" /><span className="text-fuchsia-400 font-semibold">{isFreeTrialEligible ? t.mainPromo.timerFreeLabel : t.mainPromo.timerPremiumLabel}</span></div>
                  <div className="flex justify-center gap-3">
                    {[{ value: timeLeft.hours, label: t.mainPromo.hours }, { value: timeLeft.minutes, label: t.mainPromo.minutes }, { value: timeLeft.seconds, label: t.mainPromo.seconds }].map((item, index) => (
                      <div key={index} className="text-center"><div className="bg-gradient-to-b from-slate-700 to-slate-800 rounded-lg px-4 py-3 border border-slate-600"><span className="text-3xl font-mono font-bold text-white">{String(item.value).padStart(2, '0')}</span></div><span className="text-xs text-slate-500 mt-1 block">{item.label}</span></div>
                    ))}
                  </div>
                </div>
                <Button onClick={() => navigate(localePath('/token-subscription?plan=premium'))} size="lg" className="w-full h-14 text-lg font-bold bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-500 hover:from-violet-600 hover:via-fuchsia-600 hover:to-purple-600 text-white shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.02]">
                  <Zap className="w-5 h-5 mr-2" />{isFreeTrialEligible ? t.mainPromo.freeTrialButton : t.mainPromo.premiumButton}<ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <div className="flex items-center justify-center gap-4 text-xs text-slate-500"><span>{t.mainPromo.guarantee1}</span><span>{t.mainPromo.guarantee2}</span></div>
              </div>
            </div>

            {isFreeTrialEligible && (
              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <div className="flex items-center justify-center gap-3 text-sm"><Sparkles className="w-5 h-5 text-violet-400" /><span className="text-slate-300">{t.mainPromo.autoSubNote} <span className="text-violet-400 font-bold">{t.mainPromo.autoSubBold}</span>{t.mainPromo.autoSubEnd}</span></div>
              </div>
            )}
          </div>
        </Card>
        <p className="text-center text-slate-500 text-sm mt-6">{t.mainPromo.socialProof}</p>
      </div>
    </section>
  );
};

export default MainPromoSection;
