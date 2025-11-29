import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, Clock, Users, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ctaBannerBg from '@/assets/cta-banner-bg.jpg';
import { AnimatedBackground } from '@/components/3d/AnimatedBackground';
import { motion } from 'framer-motion';

const CTABannerSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* 3D Animated Background */}
      <div className="absolute inset-0 z-0 opacity-25 md:opacity-35">
        <AnimatedBackground 
          particleColor="#8FB9FF" 
          shapeColors={["#5E8FFF", "#8FB9FF", "#B4C7FF"]}
          particleCount={3000}
        />
      </div>

      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(${ctaBannerBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0E1A]/95 via-[#1B2333]/90 to-[#0A0E1A]/95" />
      </div>

      {/* Animated Gradient Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.35, 0.2]
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#5E8FFF]/30 rounded-full blur-[140px] z-0" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.25, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[140px] z-0" 
      />

      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto space-y-6 md:space-y-8"
        >
          {/* Urgency Badge */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-orange-500/20 backdrop-blur-md border border-orange-500/40 rounded-full"
            >
              <Clock className="w-3 h-3 md:w-4 md:h-4 text-orange-300" />
              <span className="text-xs md:text-sm font-bold text-white">🔥 론칭 특가 <span className="text-orange-300">50% 할인</span> - 선착순 500명!</span>
            </motion.div>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/40 text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2">
              <Users className="w-3 h-3 mr-1" />
              현재 387명 신청
            </Badge>
          </div>

          {/* Company Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex justify-center mb-6"
          >
            <img 
              src="/company-logo.png" 
              alt="AIHumanPro Logo" 
              className="h-24 md:h-32 lg:h-40 w-auto object-contain"
            />
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight px-4"
          >
            AIHumanPro와 함께<br />
            당신의 회복을 시작하세요
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl lg:text-2xl text-white/80 font-medium"
          >
            3분이면 충분합니다
          </motion.p>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-white/80">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-sm">⭐⭐⭐⭐⭐</span>
              <span className="text-sm font-medium">4.8/5.0 평점</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/30"></div>
            <div className="text-sm font-medium">
              💬 1,247명의 실제 후기
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/30"></div>
            <div className="text-sm font-medium">
              <Gift className="w-4 h-4 inline mr-1 text-[#FFD93D]" />
              가입 시 <span className="text-[#FFD93D] font-bold">무료 10토큰</span> 제공
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button 
              size="lg"
              onClick={() => navigate('/pmf-onboarding')}
              className="group relative w-full sm:w-auto px-12 py-7 bg-gradient-to-r from-[#5E8FFF] to-[#8FB9FF] hover:from-[#4A7FEF] hover:to-[#7FA9EF] text-white text-lg font-bold rounded-xl shadow-[0_8px_30px_rgba(94,143,255,0.5)] hover:shadow-[0_12px_40px_rgba(94,143,255,0.6)] transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/20 animate-pulse"></span>
              <span className="relative flex items-center gap-2">
                🎁 무료로 시작하기
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
            
            <Button 
              size="lg"
              onClick={() => navigate('/expert-hiring')}
              className="w-full sm:w-auto px-12 py-7 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white text-lg font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              전문가 상담 연결
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 border-t border-white/10">
            <p className="text-white/60 text-xs sm:text-sm">
              ✓ 회원가입 없이 즉시 시작 &nbsp;·&nbsp; ✓ 신용카드 불필요 &nbsp;·&nbsp; ✓ 언제든 무료 체험
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABannerSection;
