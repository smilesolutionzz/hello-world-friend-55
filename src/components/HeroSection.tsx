import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Sparkles, Gift, Mic } from "lucide-react";
import heroBg from "@/assets/hero-family-bg.jpg";
import InstantAIAnalysis from "./InstantAIAnalysis";
import { AnimatedBackground } from "@/components/3d/AnimatedBackground";
import { motion } from "framer-motion";
import logo from "@/assets/logo-large.png";

const HeroSection = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-100 z-0"
        style={{ 
          backgroundImage: `url(${heroBg})`,
          transform: `translateY(${scrollY * 0.3}px)`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0E1A]/95 via-[#111827]/90 to-[#0A0E1A]/95" />
      </div>

      {/* Animated Gradient Orbs - 더 부드럽게 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.35, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 -left-32 w-[400px] h-[400px] bg-gradient-to-r from-amber-500/30 to-orange-500/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-32 -right-32 w-[500px] h-[500px] bg-gradient-to-l from-blue-500/25 to-cyan-500/20 rounded-full blur-[140px]" 
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-20 md:pt-24 pb-16 min-h-screen flex flex-col">
        {/* 로고 & 배지 */}
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
            <span className="text-xs md:text-sm font-bold text-amber-200">혁신력 1위 AI 심리·발달 케어 플랫폼</span>
          </div>
        </motion.div>

        {/* 메인 헤드라인 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
            <span className="block text-white/95 mb-1">심리 건강, ADHD, 발달 체크</span>
            <span className="block bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              3분이면 전문가급 분석 완료
            </span>
          </h1>
          
          <p className="text-white/70 text-xs md:text-base max-w-xl mx-auto">
            고민을 적으면 AI가 즉시 분석해드려요.
            <br className="hidden md:block" />
            <span className="font-semibold text-white/85">9가지 전문 리포트 + AI 발달 예측을 무료로 제공합니다.</span>
          </p>
        </motion.div>

        {/* AI 분석 입력창 - 메인 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 flex flex-col justify-center"
        >
          <InstantAIAnalysis />
        </motion.div>

        {/* 하단 CTA 버튼들 */}
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
            3분 만에 무료 분석 시작
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <Button
            onClick={() => navigate('/expert-hiring')}
            variant="outline"
            className="w-full sm:w-auto px-6 py-5 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 font-medium rounded-xl transition-all duration-300"
          >
            <Gift className="w-4 h-4 mr-2" />
            전문가 상담
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
            <span>✓ 회원가입 없이 즉시 시작</span>
            <span className="hidden sm:inline">·</span>
            <span>✓ 완전 무료</span>
            <span className="hidden sm:inline">·</span>
            <span>✓ 24시간 이용 가능</span>
          </div>
          
          <div className="mt-3 flex items-center justify-center gap-4 text-xs md:text-sm">
            <span className="text-white/70">⭐ 4.8/5.0 (4,248명)</span>
            <span className="text-amber-400/80">🔥 오늘 320명 검사 중</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
