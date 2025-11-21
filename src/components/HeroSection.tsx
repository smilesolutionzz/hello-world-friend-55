import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import FloatingKeywords from "./FloatingKeywords";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Sparkles, BookOpen, Zap, Timer, Mic, Gift } from "lucide-react";
import { PromotionBanner } from "@/components/promotion/PromotionBanner";
import heroBg from "@/assets/hero-family-bg.jpg";
import QuickOnboarding from "@/components/onboarding/QuickOnboarding";
import InstantAIAnalysis from "./InstantAIAnalysis";

const HeroSection = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickOnboarding, setShowQuickOnboarding] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax 스크롤 효과
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartAssessment = async (path: string) => {
    setIsLoading(true);
    try {
      navigate(path);
    } finally {
      setTimeout(() => setIsLoading(false), 1000);
    }
  };
  
  const typingPhrases = [
    "아이가 3살인데 눈을 안 마주쳐요... 자폐일까요?",
    "초등학생 아들이 학교 가기 싫다고 매일 울어요",
    "사춘기 딸이 요즘 밥을 안 먹어요... 거식증인가요?",
    "남편이 술만 마시면 욕하고 물건을 던져요",
    "회사에서 매일 혼나요... 나만 못하는 것 같아서 죽고 싶어요",
    "애가 ADHD 같은데 약 먹이는 게 맞을까요?",
    "아이가 친구들한테 맞고 와요... 전학을 시켜야 할까요?",
    "자꾸 불안하고 심장이 두근거려요... 공황장애인가요?",
    "애가 틱 증상이 심해졌어요... 치료해야 하나요?",
    "시어머니 때문에 스트레스가 너무 심해서 우울해요",
    "중학생 아들이 게임만 해요... 게임 중독인가요?",
    "아이가 말을 더듬어요... 언어치료 받아야 하나요?",
    "이혼 후 아이가 변했어요... 심리상담이 필요할까요?",
    "밤마다 악몽 꾸고 식은땀 흘려요... PTSD인가요?",
    "애가 학교에서 왕따 당해요... 어떻게 도와줘야 하나요?"
  ];
  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden animate-fade-in">
      {/* Background Image with Overlay - 밝기 개선 + Parallax */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-100"
        style={{ 
          backgroundImage: `url(${heroBg})`,
          transform: `translateY(${scrollY * 0.5}px)` // Parallax 효과
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0E1A]/80 via-[#1B2333]/75 to-[#0A0E1A]/80" />
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
          
          <h1 className="text-3xl leading-tight sm:text-5xl md:text-6xl lg:text-7xl font-extrabold">
            <span className="block text-white mb-2 sm:mb-3 text-2xl sm:text-5xl md:text-6xl">
              심리 건강, ADHD,<br className="sm:hidden" /> 발달 체크
            </span>
            <span className="block bg-gradient-to-r from-[#5E8FFF] to-[#8FB9FF] bg-clip-text text-transparent mb-4 text-2xl sm:text-5xl md:text-6xl">
              3분이면<br className="sm:hidden" /> 전문가급 분석 완료
            </span>
          </h1>
          
          <div className="bg-gradient-to-r from-[#5E8FFF]/20 to-[#8FB9FF]/20 backdrop-blur-xl rounded-2xl p-6 border border-[#5E8FFF]/40 max-w-3xl mx-auto shadow-[0_8px_32px_rgba(94,143,255,0.2)]">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-3">
              <p className="text-sm sm:text-base text-white font-semibold">✓ 회원가입 없이 즉시 시작</p>
              <p className="text-sm sm:text-base text-white font-semibold">✓ 완전 무료 체험</p>
              <p className="text-sm sm:text-base text-white font-semibold">✓ 24시간 이용 가능</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
              <p className="text-xs sm:text-sm md:text-base text-white/90 font-medium">
                ⭐⭐⭐⭐⭐ 4.8/5.0 (1,247명 평가)
              </p>
              <div className="hidden sm:block w-px h-4 bg-white/30"></div>
              <p className="text-xs sm:text-sm md:text-base text-white/90 font-medium">
                🔥 <span className="text-[#FFD93D]">오늘 387명</span>이 검사 진행 중
              </p>
            </div>
          </div>
          
          {/* 즉시 AI 분석 입력창 */}
          <InstantAIAnalysis />
        </div>

        {/* CTA Buttons - 무료 분석 시작 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12 px-4">
          <Button
            size="lg"
            onClick={() => handleStartAssessment('/pmf-onboarding')}
            disabled={isLoading}
            className="group relative w-full sm:w-auto px-8 sm:px-12 py-6 sm:py-7 bg-gradient-to-r from-[#5E8FFF] to-[#8FB9FF] hover:from-[#4A7FEF] hover:to-[#7FA9EF] text-white text-base sm:text-lg font-bold rounded-xl shadow-[0_8px_30px_rgba(94,143,255,0.5)] hover:shadow-[0_12px_40px_rgba(94,143,255,0.6)] transition-all duration-300 overflow-hidden border-2 border-white/20"
          >
            {isLoading ? (
              <LoadingSpinner className="w-5 h-5" />
            ) : (
              <>
                <span className="absolute inset-0 bg-white/20 animate-pulse"></span>
                <span className="relative flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  🎁 3분 만에 무료 분석 시작
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </>
            )}
          </Button>

          <Button
            size="lg"
            onClick={() => navigate('/expert-hiring')}
            className="w-full sm:w-auto px-8 sm:px-12 py-6 sm:py-7 bg-white/10 backdrop-blur-md border-2 border-white/40 text-white text-base sm:text-lg font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
          >
            <Gift className="w-5 h-5 mr-2" />
            전문가 1:1 상담
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center">
          <p className="text-white/70 text-xs sm:text-sm">
            ✓ 회원가입 없이 즉시 시작 &nbsp;·&nbsp; ✓ 신용카드 불필요 &nbsp;·&nbsp; ✓ 24시간 언제든 무료
          </p>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
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