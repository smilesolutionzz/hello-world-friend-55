import { Button } from '@/components/ui/button';
import { ArrowUpRight, Sparkles, ShieldCheck, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { useLanguage } from '@/i18n';

const CTABannerSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { localePath } = useLanguage();

  return (
    <section className="relative py-24 md:py-36 overflow-hidden bg-[#0A0A0B]">
      {/* Editorial gradient field */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,115,0.08),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(255,255,255,0.03),_transparent_70%)]" />
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        {/* Top & bottom hairlines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto"
        >
          {/* Eyebrow */}
          <div className="flex items-center justify-center mb-10">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#D4AF73]/60" />
              <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-[#D4AF73] font-medium">
                Begin Your Journey
              </span>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#D4AF73]/60" />
            </div>
          </div>

          {/* Editorial headline */}
          <h2 className="text-center font-serif text-white leading-[1.05] tracking-tight break-keep">
            <span className="block text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light">
              {t.cta.headline}
            </span>
            <span className="block mt-3 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-normal italic bg-gradient-to-r from-[#E8D5B0] via-[#D4AF73] to-[#B8935A] bg-clip-text text-transparent">
              {t.cta.headlineHighlight}
            </span>
          </h2>

          {/* Subheadline */}
          <p className="mt-8 text-center text-base md:text-lg text-white/55 font-light max-w-2xl mx-auto leading-relaxed break-keep">
            {t.cta.subheadline}
          </p>

          {/* Refined trust row */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs md:text-sm text-white/40">
            <div className="flex items-center gap-2">
              <Star className="w-3.5 h-3.5 fill-[#D4AF73] text-[#D4AF73]" />
              <span className="tracking-wide">{t.cta.ratingText}</span>
            </div>
            <span className="hidden md:inline w-px h-4 bg-white/10" />
            <span className="tracking-wide">{t.cta.reviewCount}</span>
            <span className="hidden md:inline w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-white/50" />
              <span className="tracking-wide">{t.cta.applicants}</span>
            </div>
          </div>

          {/* CTA cluster */}
          <div className="mt-14 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => navigate(localePath('/quiz'))}
              className="group relative h-14 px-10 bg-white hover:bg-[#F5F5F5] text-[#0A0A0B] text-[15px] font-medium tracking-wide rounded-none border-0 shadow-[0_20px_60px_-15px_rgba(212,175,115,0.5)] transition-all duration-500 hover:shadow-[0_25px_70px_-15px_rgba(212,175,115,0.7)] hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 mr-3 text-[#D4AF73]" />
              <span>{t.cta.signupButton ? '1분 무료 진단 시작' : '1분 무료 진단 시작'}</span>
              <ArrowUpRight className="w-4 h-4 ml-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Button>

            <Button
              size="lg"
              onClick={() => navigate(localePath('/auth?mode=signup'))}
              variant="ghost"
              className="h-14 px-8 text-white/70 hover:text-white hover:bg-white/5 text-[15px] font-light tracking-wide rounded-none border border-white/15 hover:border-white/30 transition-all duration-300"
            >
              {t.cta.signupButton}
            </Button>
          </div>

          {/* Footer fineprint */}
          <div className="mt-12 text-center space-y-2">
            <p className="text-[11px] md:text-xs text-white/30 tracking-widest uppercase">
              {t.cta.trustLine}
            </p>
            <p className="text-xs md:text-sm text-[#D4AF73]/70 font-light italic">
              {t.cta.bonusLine}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABannerSection;
