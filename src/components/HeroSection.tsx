import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Sparkles, Gift, MessageCircle } from "lucide-react";
import heroBg from "@/assets/hero-family-bg.jpg";
import InstantAIAnalysis from "./InstantAIAnalysis";
import { AnimatedBackground } from "@/components/3d/AnimatedBackground";
import { motion } from "framer-motion";
import logo from "@/assets/logo-large.png";
import { sharePage, isKakaoInitialized } from "@/lib/kakaoShare";
import { toast } from "sonner";
import { trackEvent } from "@/components/common/Analytics";
import { useTranslation } from "@/i18n";

const HeroSection = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useTranslation();

  const handleKakaoShare = () => {
    trackEvent('hero_kakao_share');
    const success = sharePage({
      title: t.hero.kakaoShareTitle,
      description: t.hero.kakaoShareDesc,
      buttonText: t.hero.kakaoShareButton,
    });
    if (!success) {
      toast.success(t.hero.kakaoShareToast);
    }
  };

  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden">
      {/* 3D Animated Background */}
      <div className="absolute inset-0 z-0 opacity-20">
        <AnimatedBackground 
          particleColor="#8FB9FF" 
          shapeColors={["#5E8FFF", "#8FB9FF", "#B4C7FF"]}
          particleCount={600}
        />
      </div>

      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster={heroBg}
        >
          <source 
            src="https://videos.pexels.com/video-files/3195440/3195440-uhd_2560_1440_25fps.mp4" 
            type="video/mp4" 
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0E1A]/93 via-[#111827]/88 to-[#0A0E1A]/93" />
      </div>

      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 -left-32 w-[400px] h-[400px] bg-gradient-to-r from-amber-500/30 to-orange-500/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-32 -right-32 w-[500px] h-[500px] bg-gradient-to-l from-blue-500/25 to-cyan-500/20 rounded-full blur-[140px]" 
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-20 md:pt-24 pb-16 min-h-screen flex flex-col">
        {/* Logo & Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4 mb-6"
        >
          <motion.img 
            src={logo} 
            alt="AIHumanPro" 
            className="w-20 h-20 md:w-24 md:h-24 object-contain"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/15 to-orange-500/15 backdrop-blur-md border border-amber-500/30 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs md:text-sm font-bold text-amber-200">{t.hero.innovationBadge}</span>
          </div>
        </motion.div>

        {/* Main Headline */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
            <span className="block text-white/95 mb-1">{t.hero.headlineTop}</span>
            <span className="block bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              {t.hero.headlineBottom}
            </span>
          </h1>
          
          <p className="text-white/70 text-xs md:text-base max-w-xl mx-auto">
            {t.hero.description}
            <br className="hidden md:block" />
            <span className="font-semibold text-white/85">{t.hero.descriptionHighlight}</span>
          </p>
        </motion.div>

        {/* AI Analysis Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 flex flex-col justify-center"
        >
          <InstantAIAnalysis />
        </motion.div>

        {/* Bottom CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          <Button
            onClick={() => navigate('/premium-assessment')}
            className="group w-full sm:w-auto px-8 py-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300 hover:scale-[1.02]"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {t.hero.ctaFreeAnalysis}
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <Button
            onClick={() => navigate('/expert-hiring')}
            variant="outline"
            className="w-full sm:w-auto px-6 py-5 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 font-medium rounded-xl transition-all duration-300"
          >
            <Gift className="w-4 h-4 mr-2" />
            {t.hero.ctaExpertConsult}
          </Button>

          <Button
            onClick={handleKakaoShare}
            variant="outline"
            className="w-full sm:w-auto px-6 py-5 bg-[#FEE500]/10 hover:bg-[#FEE500]/20 backdrop-blur-sm border border-[#FEE500]/40 text-[#FEE500] font-medium rounded-xl transition-all duration-300"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {t.hero.ctaShareFriend}
          </Button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-2 md:gap-4 text-white/60 text-xs md:text-sm">
            <span>{t.hero.trustNoSignup}</span>
            <span className="hidden sm:inline">·</span>
            <span>{t.hero.trustFree}</span>
            <span className="hidden sm:inline">·</span>
            <span>{t.hero.trust24h}</span>
          </div>
          
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 md:gap-4 text-xs md:text-sm">
            <span className="text-white/70">{t.hero.ratingCount}</span>
            <motion.span 
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-amber-400 font-semibold"
            >
              {t.hero.liveUsers}
            </motion.span>
          </div>
          
          {/* Urgency Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-xs text-white/90 font-medium">
              {t.hero.urgencyBanner}
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
