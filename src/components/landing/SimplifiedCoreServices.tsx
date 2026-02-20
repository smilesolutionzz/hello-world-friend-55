import React from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles, Heart, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { useLanguage } from '@/i18n/LanguageContext';

const SimplifiedCoreServices = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { localePath } = useLanguage();

  const services = [
    {
      step: 1,
      icon: Brain,
      title: t.coreServices.step1Title,
      badge: t.coreServices.step1Badge,
      description: t.coreServices.step1Desc,
      features: t.coreServices.step1Features,
      gradient: 'from-violet-500 to-purple-500',
      route: '/observation'
    },
    {
      step: 2,
      icon: Sparkles,
      title: t.coreServices.step2Title,
      badge: t.coreServices.step2Badge,
      description: t.coreServices.step2Desc,
      features: t.coreServices.step2Features,
      gradient: 'from-blue-500 to-cyan-500',
      route: '/assessment'
    },
    {
      step: 3,
      icon: Heart,
      title: t.coreServices.step3Title,
      badge: t.coreServices.step3Badge,
      description: t.coreServices.step3Desc,
      features: t.coreServices.step3Features,
      gradient: 'from-rose-500 to-pink-500',
      route: '/expert-matching'
    }
  ];

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-slate-800 via-slate-900 to-slate-900">
      <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 left-0 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-semibold text-violet-300">{t.coreServices.badgeText}</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
            {t.coreServices.heading}
          </h2>
          <p className="text-white/60 text-sm md:text-base">
            {t.coreServices.subheading}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={service.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="group relative"
            >
              <div className="relative h-full bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5 md:p-6 hover:border-white/10 transition-all duration-300">
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-slate-700 border border-white/10 rounded-xl flex items-center justify-center">
                  <span className={`text-lg font-bold bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent`}>
                    {service.step}
                  </span>
                </div>

                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${service.gradient} mb-4`}>
                  <service.icon className="w-6 h-6 text-white" />
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{service.title}</h3>
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-white/10 rounded-full text-white/70">
                      {service.badge}
                    </span>
                  </div>
                  <p className="text-sm text-white/50">{service.description}</p>
                </div>

                <div className="space-y-2 mb-5">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-xs text-white/70">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => navigate(localePath(service.route))}
                  className={`w-full bg-gradient-to-r ${service.gradient} text-white font-medium py-5 rounded-xl border-0`}
                >
                  {t.coreServices.startButton}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SimplifiedCoreServices;
