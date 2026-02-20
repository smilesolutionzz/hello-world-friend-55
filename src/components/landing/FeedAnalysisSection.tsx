import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Upload, ArrowRight, Brain, Sparkles, Eye, Heart } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { useLanguage } from '@/i18n/LanguageContext';

const FeedAnalysisSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { localePath } = useLanguage();

  const unconsciousTypes = [
    { icon: "🎬", name: t.feedAnalysis.type1 }, { icon: "🔊", name: t.feedAnalysis.type2 },
    { icon: "🎭", name: t.feedAnalysis.type3 }, { icon: "🌋", name: t.feedAnalysis.type4 },
    { icon: "🌉", name: t.feedAnalysis.type5 }, { icon: "❄️", name: t.feedAnalysis.type6 },
    { icon: "👻", name: t.feedAnalysis.type7 }, { icon: "🏰", name: t.feedAnalysis.type8 },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-slate-950 via-violet-950/20 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[100px]" />
      </div>
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/20 border border-violet-500/30 rounded-full mb-6">
            <Upload className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-bold text-violet-300">{t.feedAnalysis.badge}</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
            {t.feedAnalysis.heading1}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">{t.feedAnalysis.heading2}</span>
          </h2>
          <p className="text-white/60 text-sm md:text-base max-w-md mx-auto">{t.feedAnalysis.description1}<br />{t.feedAnalysis.description2}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="grid grid-cols-4 gap-2 md:gap-3 mb-10 max-w-lg mx-auto">
          {unconsciousTypes.map((type, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 + idx * 0.05 }} className="bg-slate-800/60 border border-white/10 rounded-xl p-2 md:p-3 text-center hover:border-violet-500/30 transition-colors">
              <div className="text-2xl md:text-3xl mb-1">{type.icon}</div>
              <p className="text-[9px] md:text-[10px] text-white/70 leading-tight">{type.name}</p>
            </motion.div>
          ))}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex flex-wrap justify-center gap-3 mb-10">
          {[{ icon: Eye, text: t.feedAnalysis.feat1, color: "text-violet-400" }, { icon: Brain, text: t.feedAnalysis.feat2, color: "text-fuchsia-400" }, { icon: Heart, text: t.feedAnalysis.feat3, color: "text-pink-400" }].map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-slate-800/40 border border-white/5 rounded-full">
              <feature.icon className={`w-4 h-4 ${feature.color}`} />
              <span className="text-sm text-white/80">{feature.text}</span>
            </div>
          ))}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="text-center">
          <Button onClick={() => navigate(localePath('/assessment/feed-analysis'))} size="lg" className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 hover:from-violet-600 hover:via-fuchsia-600 hover:to-pink-600 text-white font-bold px-10 py-7 text-lg rounded-xl shadow-lg shadow-violet-500/20">
            <Upload className="w-5 h-5 mr-2" />{t.feedAnalysis.ctaButton}<ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="mt-4 text-white/40 text-sm"><Sparkles className="w-3.5 h-3.5 inline mr-1" />{t.feedAnalysis.ctaSubtext}</p>
        </motion.div>
      </div>
    </section>
  );
};

export default FeedAnalysisSection;
