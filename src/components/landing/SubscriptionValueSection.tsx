import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, Lock, Brain, FileText, Users, Sparkles, CheckCircle2, ArrowRight,
  Zap, TrendingUp, Shield, Infinity, Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { useLanguage } from '@/i18n/LanguageContext';

const SubscriptionValueSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { localePath } = useLanguage();

  const freeFeatures = [
    { name: t.subscription.feat1, available: true },
    { name: t.subscription.feat2, available: true },
    { name: t.subscription.feat3, available: false },
    { name: t.subscription.feat4, available: false },
    { name: t.subscription.feat5, available: false },
    { name: t.subscription.feat6, available: false },
  ];

  const premiumFeatures = [
    { name: t.subscription.feat1, available: true },
    { name: t.subscription.feat2, available: true },
    { name: t.subscription.feat3, available: true, highlight: true },
    { name: t.subscription.feat4, available: true, highlight: true },
    { name: t.subscription.feat5, available: true, highlight: true },
    { name: t.subscription.feat6, available: true, highlight: true },
  ];

  const valueProps = [
    { icon: Brain, title: t.subscription.value1Title, description: t.subscription.value1Desc, savings: t.subscription.value1Savings },
    { icon: FileText, title: t.subscription.value2Title, description: t.subscription.value2Desc, savings: t.subscription.value2Savings },
    { icon: Users, title: t.subscription.value3Title, description: t.subscription.value3Desc, savings: t.subscription.value3Savings },
    { icon: Infinity, title: t.subscription.value4Title, description: t.subscription.value4Desc, savings: t.subscription.value4Savings }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-slate-100/80 via-violet-50/50 to-slate-100/80 dark:from-slate-900 dark:via-violet-950/30 dark:to-slate-900">
      <div className="container mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 px-4 py-1">
            <Crown className="w-3 h-3 mr-1" />
            {t.subscription.badge}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.subscription.heading} <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{t.subscription.headingHighlight}</span>{t.subscription.headingEnd}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.subscription.subheading} <strong className="text-foreground">{t.subscription.subheadingBold}</strong>{t.subscription.subheadingEnd}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-14">
          {/* Free Plan */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <Card className="p-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur border border-slate-200 dark:border-slate-700 h-full shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl">
                  <Lock className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{t.subscription.freeTitle}</h3>
                  <p className="text-sm text-muted-foreground">{t.subscription.freeSub}</p>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                {freeFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {feature.available ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Lock className="w-5 h-5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                      )}
                      <span className={feature.available ? 'text-foreground' : 'text-muted-foreground line-through'}>{feature.name}</span>
                    </div>
                    {!feature.available && (
                      <Badge variant="outline" className="text-xs border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-950/30">{t.subscription.locked}</Badge>
                    )}
                  </div>
                ))}
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-center mb-4">
                <p className="text-sm">
                  <span className="text-amber-600">⚠️</span> {t.subscription.freeWarning}<br />
                  <span className="text-amber-600 font-bold">{t.subscription.freeWarningBold}</span>
                </p>
              </div>
              <Button onClick={() => navigate(localePath('/token-subscription'))} variant="outline" className="w-full border-slate-300 dark:border-slate-600 font-medium py-5" size="lg">
                <Lock className="w-4 h-4 mr-2" />
                {t.subscription.upgradeButton}
              </Button>
            </Card>
          </motion.div>

          {/* Premium Plan */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <Card className="p-6 bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-violet-950/50 dark:via-slate-800 dark:to-purple-950/50 border-2 border-violet-300 dark:border-violet-700 h-full relative overflow-hidden shadow-xl shadow-violet-500/10">
              <div className="absolute top-4 right-4">
                <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shadow-lg">
                  <Zap className="w-3 h-3 mr-1" />
                  {t.subscription.popular}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/30">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{t.subscription.premiumTitle}</h3>
                  <p className="text-sm text-muted-foreground">{t.subscription.premiumSub}</p>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${feature.highlight ? 'text-violet-500' : 'text-emerald-500'}`} />
                    <span className="text-foreground">{feature.name}</span>
                    {feature.highlight && <Badge className="ml-auto text-xs bg-emerald-500 text-white border-0">NEW</Badge>}
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-violet-200 dark:border-violet-800">
                  <div>
                    <p className="text-sm text-muted-foreground line-through">{t.subscription.priceOriginal}</p>
                    <p className="text-2xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{t.subscription.priceNow}</p>
                  </div>
                  <Badge className="bg-rose-500 text-white border-0 font-bold">{t.subscription.discount}</Badge>
                </div>
                <Button onClick={() => navigate(localePath('/token-subscription'))} className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold py-6 shadow-lg shadow-violet-500/30" size="lg">
                  <Crown className="w-5 h-5 mr-2" />
                  {t.subscription.premiumButton}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Value Props */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">
            {t.subscription.valueHeading} <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{t.subscription.valueHighlight}</span>
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {valueProps.map((prop, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Card className="p-5 h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur hover:shadow-lg transition-all border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/50 rounded-lg">
                      <prop.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <h4 className="font-bold text-sm">{prop.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{prop.description}</p>
                  <Badge variant="secondary" className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {prop.savings}
                  </Badge>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>{t.subscription.trustPayment}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-violet-500" />
            <span>{t.subscription.trustRefund}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{t.subscription.trustCancel}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SubscriptionValueSection;
