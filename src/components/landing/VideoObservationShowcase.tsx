import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Video, Brain, FileText, Sparkles, CheckCircle2, ArrowRight, Baby, User, Heart, Activity, MessageCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from '@/i18n';
import { useLanguage } from '@/i18n/LanguageContext';

export const VideoObservationShowcase = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { localePath } = useLanguage();

  const analysisCategories = [
    { icon: Baby, title: t.videoObservation.cat1Title, description: t.videoObservation.cat1Desc, color: "from-pink-400 to-rose-400" },
    { icon: MessageCircle, title: t.videoObservation.cat2Title, description: t.videoObservation.cat2Desc, color: "from-blue-400 to-cyan-400" },
    { icon: Brain, title: t.videoObservation.cat3Title, description: t.videoObservation.cat3Desc, color: "from-purple-400 to-violet-400" },
    { icon: User, title: t.videoObservation.cat4Title, description: t.videoObservation.cat4Desc, color: "from-green-400 to-emerald-400" },
    { icon: Heart, title: t.videoObservation.cat5Title, description: t.videoObservation.cat5Desc, color: "from-orange-400 to-amber-400" },
    { icon: Activity, title: t.videoObservation.cat6Title, description: t.videoObservation.cat6Desc, color: "from-teal-400 to-cyan-400" }
  ];

  const features = [t.videoObservation.feat1, t.videoObservation.feat2, t.videoObservation.feat3, t.videoObservation.feat4, t.videoObservation.feat5, t.videoObservation.feat6];

  return (
    <section className="py-20 px-4 relative overflow-hidden bg-gradient-to-b from-white to-slate-50">
      <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-purple-200/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-pink-200/20 rounded-full blur-[120px]" />
      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-full mb-6">
            <Video className="w-4 h-4" />{t.videoObservation.badge}
          </div>
          <h2 className="text-xl md:text-5xl font-bold mb-4 text-slate-900 text-center leading-tight">
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">{t.videoObservation.heading1}</span>
            <br className="md:hidden" />
            {t.videoObservation.heading2}
          </h2>
          <p className="text-xs md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed px-4 text-center break-keep">
            {t.videoObservation.desc1}<br />
            <span className="text-purple-600 font-semibold">{t.videoObservation.desc2}</span>
          </p>
        </motion.div>

        <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
          {analysisCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card key={index} className="group p-4 bg-white border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}><Icon className="w-6 h-6 text-white" /></div>
                <h3 className="font-bold text-slate-900 text-sm mb-1 md:whitespace-nowrap">{category.title}</h3>
                <p className="text-xs text-slate-500 leading-tight">{category.description}</p>
              </Card>
            );
          })}
        </motion.div>

        <motion.div className="flex flex-col lg:flex-row items-center gap-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-3xl p-8 border border-purple-200" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }}>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4"><Sparkles className="w-5 h-5 text-amber-500" /><span className="text-amber-600 font-semibold">{t.videoObservation.whyVideo}</span></div>
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature, index) => (<div key={index} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /><span className="text-sm text-slate-700">{feature}</span></div>))}
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 lg:min-w-[280px]">
            <div className="flex items-center gap-2 text-slate-500"><Clock className="w-4 h-4" /><span className="text-sm">{t.videoObservation.analysisTime}</span></div>
            <Button onClick={() => navigate(localePath('/observation'))} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6 text-lg rounded-xl group">
              <Video className="w-5 h-5 mr-2" />{t.videoObservation.ctaButton}<ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-xs text-slate-400 text-center">{t.videoObservation.uploadNote}</p>
          </div>
        </motion.div>

        <motion.div className="text-center mt-8" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.6 }}>
          <div className="inline-flex flex-wrap justify-center items-center gap-2 md:gap-4 text-slate-500 text-xs md:text-sm">
            <div className="flex items-center gap-1"><FileText className="w-4 h-4" /><span>{t.videoObservation.trustReport}</span></div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1"><Brain className="w-4 h-4" /><span>{t.videoObservation.trustAI}</span></div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1"><Sparkles className="w-4 h-4" /><span>{t.videoObservation.trustFree}</span></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
