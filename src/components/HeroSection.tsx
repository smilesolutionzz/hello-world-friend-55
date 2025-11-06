import InstantAIAnalysis from "./InstantAIAnalysis";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import FloatingKeywords from "./FloatingKeywords";
import { useState } from "react";
import { ArrowRight, Sparkles, BookOpen, Zap, Timer } from "lucide-react";
import { ExpertOnlineStatus } from "@/components/urgency/ExpertOnlineStatus";
import { PromotionBanner } from "@/components/promotion/PromotionBanner";
import heroBg from "@/assets/hero-family-bg.jpg";
import QuickOnboarding from "@/components/onboarding/QuickOnboarding";

const HeroSection = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickOnboarding, setShowQuickOnboarding] = useState(false);

  const handleStartAssessment = async (path: string) => {
    setIsLoading(true);
    try {
      navigate(path);
    } finally {
      setTimeout(() => setIsLoading(false), 1000);
    }
  };
  
  const typingPhrases = [
    "우리 아이 발달이 또래보다 느린 것 같아요",
    "청소년기 자녀와 대화가 잘 안 돼요",
    "부부 관계 개선이 필요해요"
  ];
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0E1A]/95 via-[#1B2333]/90 to-[#0A0E1A]/95" />
      </div>

      {/* Background Blur Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-96 h-96 bg-[#5E8FFF]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 -right-40 w-96 h-96 bg-[#5E8FFF]/15 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-20 pb-28 min-h-screen flex flex-col justify-center">
        {/* Main Headline - 명확하고 즉시 이해되는 메시지 */}
        <div className="text-center mb-16 space-y-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5E8FFF]/20 to-[#8FB9FF]/20 backdrop-blur-md border border-[#5E8FFF]/40 rounded-full shadow-lg animate-pulse">
            <Sparkles className="w-4 h-4 text-[#8FB9FF]" />
            <span className="text-xs sm:text-sm font-bold text-white whitespace-nowrap">혁신력 1위 AI 심리·발달 케어 플랫폼</span>
          </div>
          
          <h1 className="text-2xl leading-tight sm:text-6xl md:text-7xl font-extrabold">
            <span className="block text-white mb-2 sm:mb-3 text-xl sm:text-6xl">
              심리 고민, ADHD,<br className="sm:hidden" /> 발달 평가
            </span>
            <span className="block bg-gradient-to-r from-[#5E8FFF] to-[#8FB9FF] bg-clip-text text-transparent mb-4 text-xl sm:text-6xl">
              3분이면<br className="sm:hidden" /> 전문가급 분석 완료
            </span>
          </h1>
          
          <div className="bg-gradient-to-r from-[#5E8FFF]/10 to-[#8FB9FF]/10 backdrop-blur-lg rounded-2xl p-6 border border-[#5E8FFF]/30 max-w-3xl mx-auto">
            <p className="text-sm sm:text-base text-white font-semibold mb-3">
              ✓ 회원가입 없이 즉시 시작 &nbsp; ✓ 완전 무료 체험 &nbsp; ✓ 24시간 이용 가능
            </p>
            <p className="text-xs sm:text-sm md:text-base text-white/70">
              2,000명이 먼저 경험한 AI+전문가 통합 케어
            </p>
          </div>
          
          {/* 타이핑 애니메이션 */}
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 max-w-4xl mx-auto">
            <p className="text-sm text-white/60 mb-3">이런 고민이 있으신가요?</p>
            <div className="text-left text-base text-white/90 leading-relaxed min-h-[4rem] flex items-center">
              <TypingAnimation 
                phrases={typingPhrases}
                typingSpeed={80}
                deletingSpeed={50}
                pauseDuration={3000}
                className="text-white/90"
              />
            </div>
          </div>
        </div>


        {/* 프로모션 배너 */}
        <div className="mb-8">
          <PromotionBanner variant="hero" />
        </div>

        {/* Instant AI Analysis - 즉시 후킹 요소 */}
        <div className="mb-12">
          <InstantAIAnalysis />
        </div>

        {/* 긴급성 & 행동 유도 섹션 */}
        <div className="mb-12">
          <ExpertOnlineStatus />
        </div>
        
        {/* CTA Buttons - 명확한 행동 유도 */}
        <div className="flex flex-col gap-6 justify-center items-center mb-16">
          {/* 메인 CTA - 30초 퀵 온보딩 */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button 
              size="lg"
              onClick={() => setShowQuickOnboarding(true)}
              className="group relative w-full sm:w-auto px-12 py-7 bg-gradient-to-r from-[#5E8FFF] to-[#8FB9FF] hover:from-[#4A7FEF] hover:to-[#7AA8EF] text-white text-xl font-extrabold rounded-2xl shadow-[0_8px_32px_rgba(94,143,255,0.5)] hover:shadow-[0_12px_40px_rgba(94,143,255,0.7)] transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center gap-3">
                <Zap className="w-6 h-6 animate-pulse" />
                30초만에 무료 체험
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </span>
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/assessment')}
              className="group relative w-full sm:w-auto px-8 py-7 bg-white/10 hover:bg-white/20 text-white text-lg font-bold rounded-2xl border-2 border-white/30 hover:border-white/50 backdrop-blur-sm transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                3분 정밀 검사
              </span>
            </Button>
          </div>

          {/* 서브 CTA */}
          <div className="flex flex-col sm:flex-row gap-3 text-center">
            <button
              onClick={() => navigate('/subscription')}
              className="text-white/80 hover:text-white text-sm font-medium underline decoration-[#5E8FFF]/50 hover:decoration-[#5E8FFF] transition-all"
            >
              💎 프리미엄 플랜 보기 (무제한 이용)
            </button>
            <span className="hidden sm:inline text-white/40">|</span>
            <button
              onClick={() => navigate('/platform-manual')}
              className="text-white/80 hover:text-white text-sm font-medium underline decoration-[#5E8FFF]/50 hover:decoration-[#5E8FFF] transition-all"
            >
              📖 플랫폼 사용법 보기
            </button>
          </div>

        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </div>

      {/* 퀵 온보딩 다이얼로그 */}
      <QuickOnboarding 
        open={showQuickOnboarding} 
        onClose={() => setShowQuickOnboarding(false)} 
      />
    </section>
  );
};

export default HeroSection;