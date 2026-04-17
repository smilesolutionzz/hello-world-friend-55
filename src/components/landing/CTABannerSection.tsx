import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Clock, Users, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { useLanguage } from '@/i18n';

const CTABannerSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { localePath } = useLanguage();

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      {/* Soft accent orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-[150px]" />
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-200/20 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center space-y-6"
        >
          {/* Urgency Badge */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <motion.div 
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full"
            >
              <Clock className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-xs font-bold text-orange-700">{t.cta.urgencyBadge}</span>
            </motion.div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
              <Users className="w-3 h-3 text-emerald-600" />
              <span className="text-xs text-emerald-700">{t.cta.applicants}</span>
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-xl sm:text-3xl md:text-5xl font-bold text-slate-900 leading-tight break-keep">
            {t.cta.headline}<br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t.cta.headlineHighlight}
            </span>
          </h2>
          
          <p className="text-sm md:text-xl text-slate-600 font-medium break-keep">
            {t.cta.subheadline}
          </p>

          {/* Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-slate-500 text-sm">
            <span>{t.cta.ratingText}</span>
            <span className="hidden sm:inline">·</span>
            <span>{t.cta.reviewCount}</span>
            <span className="hidden sm:inline">·</span>
            <span className="text-amber-600">
              <Gift className="w-4 h-4 inline mr-1" />
              {t.cta.freeTokens}
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button 
              size="lg"
              onClick={() => navigate(localePath('/auth?mode=signup'))}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-lg font-bold px-10 py-7 rounded-xl shadow-lg shadow-amber-500/25"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {t.cta.signupButton}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              size="lg"
              onClick={() => navigate(localePath('/premium-assessment'))}
              variant="outline"
              className="bg-white border-slate-200 text-slate-800 text-lg font-medium px-8 py-7 rounded-xl hover:bg-slate-50"
            >
              {t.cta.tryFirst}
            </Button>
          </div>

          {/* Trust */}
          <div className="pt-4 space-y-2">
            <p className="text-slate-400 text-xs">
              {t.cta.trustLine}
            </p>
            <p className="text-amber-600 text-sm font-medium">
              {t.cta.bonusLine}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABannerSection;
