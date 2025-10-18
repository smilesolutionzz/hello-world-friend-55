import InstantAIAnalysis from "./InstantAIAnalysis";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import FloatingKeywords from "./FloatingKeywords";
import { useState } from "react";
import { ArrowRight, Sparkles, BookOpen } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartAssessment = async (path: string) => {
    setIsLoading(true);
    try {
      navigate(path);
    } finally {
      setTimeout(() => setIsLoading(false), 1000);
    }
  };
  
  const typingPhrases = [
    // 영유아 (0-3세)
    "14개월 아기가 아직 걷지 못해요... 다른 아이들과 비교되어서 너무 걱정돼요",
    "2살인데 아직 말을 한 마디도 안 해요... 발달장애일까봐 밤마다 울어요",
    "신생아가 계속 울기만 해요... 하루 종일 진정이 안 되어서 지쳐가고 있어요",
    "18개월인데 애착이 심해서 잠깐도 떨어질 수가 없어요... 이게 정상인가요?",
    
    // 유아/아동 (4-12세)
    "5살 아이가 친구들과 어울리지 못해요... 혹시 자폐일까봐 매일 걱정돼요",
    "초등학교 2학년인데 집중을 못해서 숙제를 3시간씩 해요... ADHD인가요?",
    "8살 딸이 밤마다 악몽을 꿔서 우리 방으로 와요... 무슨 트라우마가 있는 걸까요?",
    "초등학생 아들이 학교에서 자꾸 싸워요... 폭력성이 걱정돼서 상담받고 싶어요",
    
    // 청소년 (13-19세)
    "중2 딸이 자해를 시작했어요... 어떻게 해야 할지 모르겠고 너무 무서워요",
    "고3 아들이 극도로 예민해져서 가족 모두가 힘들어요... 입시 스트레스 때문일까요?",
    "중학생 아이가 게임만 하고 학교도 안 가려고 해요... 게임중독인 것 같아서 무서워요",
    "고등학생 딸이 거식증 같아요... 살이 너무 빠져서 병원에 가야 할까요?",
    
    // 대학생/청년 (20-30세)
    "대학생인데 시험 때마다 패닉어택이 와요... 졸업할 수 있을지 모르겠어요",
    "직장에서 매일 울고 싶어요... 이 상태로 계속 살 수 있을까요? 도움이 필요해요",
    "취업 준비하면서 우울증이 심해져요... 모든 게 의미없게 느껴져서 힘들어요",
    "연애와 결혼에 대한 강박이 심해요... 혼자 있는 시간이 너무 두려워요",
    
    // 주부/중년 (30-50세)  
    "육아 스트레스로 아이에게 화를 자주 내요... 나쁜 엄마가 된 것 같아서 괴로워요",
    "남편과 매일 싸워요... 이혼을 생각하고 있는데 아이들 때문에 고민돼요",
    "갱년기인지 감정 기복이 심해졌어요... 가족들이 저를 피하는 것 같아요",
    "직장맘인데 죄책감과 피로가 극심해요... 모든 걸 포기하고 싶어져요",
    
    // 중장년 (50-65세)
    "빈둥지 증후군으로 우울해요... 아이들이 독립하니 삶의 목적을 잃었어요",
    "갱년기 우울증이 심해서 아무것도 하기 싫어요... 호르몬 치료를 받아야 할까요?",
    "직장에서 은퇴 압박을 받아요... 미래에 대한 불안감으로 잠을 못 자요",
    "부모님 간병으로 스트레스가 극심해요... 나도 우울해지는 것 같아서 무서워요",
    
    // 노인 (65세 이상)
    "엄마가 자꾸 같은 말을 반복해요... 치매인가요? 어떻게 대처해야 할까요?",
    "80세 아버지가 갑자기 우울해하세요... 밥도 안 드시고 활동을 거부해요",
    "할머니가 없는 사람을 본다고 해요... 이게 치매 증상인지 확인하고 싶어요",
    "혼자 사는 노인 분이 점점 고립되고 있어요... 어떤 도움을 드려야 할까요?"
  ];
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-[#0A0E1A] via-[#1B2333] to-[#0A0E1A] overflow-hidden">
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
            <span className="text-xs sm:text-sm font-bold text-white whitespace-nowrap">한국 1위 AI 심리·발달 케어 플랫폼</span>
          </div>
          
          <h1 className="text-4xl leading-tight sm:text-6xl md:text-7xl font-extrabold">
            <span className="block text-white mb-2 sm:mb-3">
              심리 고민, ADHD, 발달 평가
            </span>
            <span className="block bg-gradient-to-r from-[#5E8FFF] to-[#8FB9FF] bg-clip-text text-transparent mb-4">
              3분이면 전문가급 분석 완료
            </span>
          </h1>
          
          <div className="bg-gradient-to-r from-[#5E8FFF]/10 to-[#8FB9FF]/10 backdrop-blur-lg rounded-2xl p-6 border border-[#5E8FFF]/30 max-w-3xl mx-auto">
            <p className="text-lg sm:text-2xl text-white font-semibold mb-3">
              ✓ 회원가입 없이 즉시 시작 &nbsp; ✓ 완전 무료 체험 &nbsp; ✓ 24시간 이용 가능
            </p>
            <p className="text-sm sm:text-base text-white/70">
              2,000명이 먼저 경험한 AI+전문가 통합 케어
            </p>
          </div>
          
          {/* 타이핑 애니메이션 */}
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 max-w-4xl mx-auto">
            <p className="text-sm text-white/60 mb-3">이런 고민이 있으신가요?</p>
            <div className="text-left text-base text-white/90 leading-relaxed min-h-[4rem] flex items-center">
              <TypingAnimation 
                phrases={typingPhrases}
                typingSpeed={50}
                deletingSpeed={30}
                pauseDuration={2000}
                className="text-white/90"
              />
            </div>
          </div>
        </div>


        {/* Instant AI Analysis - 즉시 후킹 요소 */}
        <div className="mb-12">
          <InstantAIAnalysis />
        </div>
        
        {/* CTA Buttons - 명확한 행동 유도 */}
        <div className="flex flex-col gap-6 justify-center items-center mb-16">
          {/* 메인 CTA */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button 
              size="lg"
              onClick={() => navigate('/assessment')}
              className="group relative w-full sm:w-auto px-12 py-7 bg-gradient-to-r from-[#5E8FFF] to-[#8FB9FF] hover:from-[#4A7FEF] hover:to-[#7AA8EF] text-white text-xl font-extrabold rounded-2xl shadow-[0_8px_32px_rgba(94,143,255,0.5)] hover:shadow-[0_12px_40px_rgba(94,143,255,0.7)] transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 animate-pulse" />
                무료로 3분 테스트 시작
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
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

          {/* 신뢰 지표 */}
          <div className="flex flex-wrap gap-6 justify-center items-center text-white/70 text-sm mt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>실시간 2,000+ 사용자</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⭐</span>
              <span>평균 4.8/5.0 만족도</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔒</span>
              <span>100% 익명 보장</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;