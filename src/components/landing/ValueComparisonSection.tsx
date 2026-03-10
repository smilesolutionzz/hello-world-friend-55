import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Sparkles, ArrowRight, Heart, Shield, Users, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { useLanguage } from '@/i18n/LanguageContext';

const ValueComparisonSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { localePath } = useLanguage();

  const problems = [
    { icon: Building2, title: t.valueComparison.problem1Title, desc: t.valueComparison.problem1Desc },
    { icon: Shield, title: t.valueComparison.problem2Title, desc: t.valueComparison.problem2Desc },
    { icon: Heart, title: t.valueComparison.problem3Title, desc: t.valueComparison.problem3Desc },
    { icon: Users, title: t.valueComparison.problem4Title, desc: t.valueComparison.problem4Desc }
  ];

  const comparison = [
    { feature: t.valueComparison.feature1, traditional: t.valueComparison.feature1Trad, ours: t.valueComparison.feature1Ours },
    { feature: t.valueComparison.feature2, traditional: t.valueComparison.feature2Trad, ours: t.valueComparison.feature2Ours },
    { feature: t.valueComparison.feature3, traditional: t.valueComparison.feature3Trad, ours: t.valueComparison.feature3Ours },
    { feature: t.valueComparison.feature4, traditional: t.valueComparison.feature4Trad, ours: t.valueComparison.feature4Ours },
    { feature: t.valueComparison.feature5, traditional: t.valueComparison.feature5Trad, ours: t.valueComparison.feature5Ours }
  ];

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 -z-10">
        <video autoPlay muted loop playsInline preload="none" className="w-full h-full object-cover">
          <source src="https://videos.pexels.com/video-files/7579953/7579953-uhd_2560_1440_24fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/92 via-slate-900/88 to-slate-800/92" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-300">{t.valueComparison.badgeText}</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
            {t.valueComparison.heading}
          </h2>
          <p className="text-white/60 text-sm md:text-base">
            {t.valueComparison.subheading}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-12">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-4 md:p-5 bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all"
              >
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-sm md:text-base font-bold text-white mb-1">{problem.title}</h3>
                <p className="text-xs md:text-sm text-white/50">{problem.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 gap-2 p-4 border-b border-white/5 bg-slate-700/30">
              <div className="text-xs font-medium text-white/40"></div>
              <div className="text-xs font-medium text-white/60 text-center">{t.valueComparison.tableTraditional}</div>
              <div className="text-xs font-medium text-emerald-400 text-center">{t.valueComparison.tableOurs}</div>
            </div>
            
            {comparison.map((item, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                <div className="text-sm font-medium text-white">{item.feature}</div>
                <div className="flex items-center justify-center gap-1.5">
                  <X className="w-3.5 h-3.5 text-red-400/70 shrink-0" />
                  <span className="text-xs text-white/50 text-center">{item.traditional}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-xs text-emerald-300 font-medium text-center">{item.ours}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button 
              onClick={() => navigate(localePath('/assessment'))}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold px-8 py-6 rounded-xl shadow-lg shadow-emerald-500/25"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {t.valueComparison.ctaButton}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-white/40 text-xs mt-3">{t.valueComparison.ctaSubtext}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ValueComparisonSection;
