import InstantAIAnalysis from "./InstantAIAnalysis";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import FloatingKeywords from "./FloatingKeywords";
import { useState } from "react";
import { ArrowRight, Sparkles, BookOpen } from "lucide-react";
import { ExpertOnlineStatus } from "@/components/urgency/ExpertOnlineStatus";

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
    
    // 유아/아동 (4-12세)
    "5살 아이가 친구들과 어울리지 못해요... 혹시 자폐일까봐 매일 걱정돼요",
    "초등학교 2학년인데 집중을 못해서 숙제를 3시간씩 해요... ADHD인가요?",
    "초등학생 아들이 학교에서 자꾸 싸워요... 폭력성이 걱정돼서 상담받고 싶어요",
    
    // 청소년 (13-19세)
    "중2 딸이 자해를 시작했어요... 어떻게 해야 할지 모르겠고 너무 무서워요",
    "고3 아들이 극도로 예민해져서 가족 모두가 힘들어요... 입시 스트레스 때문일까요?",
    "중학생 아이가 게임만 하고 학교도 안 가려고 해요... 게임중독인 것 같아서 무서워요",
    
    // 대학생/청년 (20-30세)
    "대학생인데 시험 때마다 패닉어택이 와요... 졸업할 수 있을지 모르겠어요",
    "직장에서 매일 울고 싶어요... 이 상태로 계속 살 수 있을까요? 도움이 필요해요",
    "취업 준비하면서 우울증이 심해져요... 모든 게 의미없게 느껴져서 힘들어요",
    
    // 부부 갈등
    "남편이 저를 이해 못 해요... 대화가 안 통해서 이혼을 생각하고 있어요",
    "아내가 매일 화만 내요... 더 이상 같이 살기 힘들어요 어떻게 해야 하나요",
    "남편이 육아를 전혀 안 도와줘요... 혼자 키우는 것 같아서 너무 외롭고 힘들어요",
    "아내와 부부관계가 1년째 없어요... 이혼해야 할지 참아야 할지 모르겠어요",
    "결혼 5년차인데 남편과 대화가 없어요... 그냥 룸메이트처럼 살고 있어요",
    "남편이 바람피웠어요... 용서해야 할지 이혼해야 할지 매일 울면서 고민해요",
    "아내의 과소비가 심각해요... 빚이 늘어가는데 대화가 안 돼서 괴로워요",
    "남편이 술만 마시면 폭언을 해요... 아이들 앞에서도 그래서 견딜 수가 없어요",
    "부부싸움 후 남편이 3일째 집에 안 와요... 이게 정상인가요? 어떻게 해야 하죠",
    
    // 시댁 갈등
    "시어머니가 매일 전화해서 간섭해요... 숨이 막혀서 우울증이 올 것 같아요",
    "시댁 식구들이 명절 때마다 저만 부려먹어요... 며느리라서 당연한 건가요?",
    "시어머니가 육아에 간섭이 심해요... 스트레스로 아이한테까지 화내게 돼요",
    "시댁에서 아들 낳으라고 압박해요... 딸 둘인데 셋째를 강요당하고 있어요",
    "시누이가 저를 무시해요... 시댁 모임 때마다 모욕감에 집에 와서 울어요",
    "시댁 제사가 너무 많아요... 일하면서 명절마다 시댁 가는 게 지옥 같아요",
    "시어머니와 한집에 살아요... 매일 간섭과 잔소리로 정신병이 올 것 같아요",
    "시댁에서 친정 무시해요... 참아야 하나요 싸워야 하나요 너무 괴로워요",
    "시어머니가 손자만 보러 와요... 며느리인 저는 투명인간 취급당해요",
    "시댁 식구들이 우리 부부 사생활을 다 알려고 해요... 어디까지 참아야 하나요",
    
    // 친정 갈등
    "친정엄마가 남편 욕만 해요... 사이에 끼어서 스트레스가 너무 심해요",
    "친정오빠가 돈 빌려달래요... 남편한테 말 못하고 혼자 고민하고 있어요",
    "친정 식구들이 제 살림에 간섭해요... 시집온 지 10년인데도 계속 이래요",
    "친정아버지가 사업 실패하셨어요... 도와드려야 하는데 남편이 반대해서 괴로워요",
    "친정엄마가 우리집에 너무 자주 와요... 남편이 싫어해서 사이에서 힘들어요",
    "친정동생이 백수예요... 경제적으로 도와달라고 하는데 어디까지 해야 하나요",
    
    // 고부갈등 심화
    "시어머니가 손주 키운다고 와서 안 가요... 남편은 편만 들고 이혼하고 싶어요",
    "시댁에서 제 친정을 무시해요... 명절 때마다 친정 가는 걸 못 가게 해요",
    "시어머니가 우리 집 열쇠 들고 와요... 마음대로 들어와서 프라이버시가 없어요",
    "시댁 가족톡방에서 저만 빼놓고 대화해요... 남편도 모른 척해서 상처받아요",
    
    // 육아 + 부부 갈등
    "육아로 지쳐 죽겠는데 남편은 게임만 해요... 살려달라고 해도 안 도와줘요",
    "아이 교육 문제로 남편과 매일 싸워요... 이견이 너무 커서 이혼까지 생각해요",
    "남편이 아이 앞에서 저를 무시해요... 아이도 저를 만만하게 보기 시작했어요",
    
    // 중장년 가족 갈등
    "갱년기인데 시어머니 간병까지 해야 해요... 정말 미칠 것 같아요 도와주세요",
    "남편이 은퇴 후 집에만 있어요... 하루 종일 간섭하고 잔소리해서 숨막혀요",
    "시댁 재산 문제로 시누이와 남편이 싸워요... 사이에 낀 제가 너무 힘들어요",
    "시부모님 간병을 혼자 하고 있어요... 시누이는 딸이라고 안 해도 되나요?",
    
    // 노인 관련 가족 갈등
    "치매 시어머니 간병으로 우울증 왔어요... 요양원 보내자니 남편이 반대해요",
    "친정엄마가 자꾸 같은 말 반복해요... 치매인가요? 오빠는 나만 떠넘기려 해요",
    "시부모님 간병비로 빚이 늘어요... 시누이는 돈 안 내는데 우리만 감당해야 하나요"
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
            <span className="text-xs sm:text-sm font-bold text-white whitespace-nowrap">혁신력 1위 AI 심리·발달 케어 플랫폼</span>
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
            <p className="text-sm sm:text-base text-white font-semibold mb-3">
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

        {/* 긴급성 & 행동 유도 섹션 */}
        <div className="mb-12">
          <ExpertOnlineStatus />
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