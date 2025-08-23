import ChatInterface from "./ChatInterface";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TypingAnimation } from "@/components/ui/typing-animation";

const HeroSection = () => {
  const navigate = useNavigate();
  
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
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 right-16 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-warm-lavender/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-12 sm:pb-16">
        {/* Main Headline */}
        <div className="text-center mb-8 sm:mb-16 space-y-4 sm:space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">
            <span className="block text-foreground mb-1 sm:mb-2">병원급 정확도의</span>
            <span className="block text-brand-gradient">AIH + 전문가 심리분석</span>
          </h1>
          
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3 text-lg sm:text-xl md:text-2xl">
              <p className="text-brand-gradient font-semibold">
                "불안을 데이터로, 안심을 리포트로"
              </p>
              <p className="text-muted-foreground text-base sm:text-lg">
                한 문장으로 시작해보세요
              </p>
            </div>
            
            {/* 타이핑 애니메이션 예시 */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 max-w-4xl mx-auto">
              <p className="text-sm text-muted-foreground mb-2">예시:</p>
              <div className="text-left text-sm sm:text-base text-foreground leading-relaxed min-h-[3rem] flex items-center">
                <TypingAnimation 
                  phrases={typingPhrases}
                  typingSpeed={50}
                  deletingSpeed={30}
                  pauseDuration={2000}
                  className="text-gray-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <ChatInterface />
        
        {/* CTA Section */}
        <div className="mt-12 text-center space-y-6">
          {/* 니즈별 맞춤 추천 섹션 */}
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-primary/20">
            <h3 className="text-xl sm:text-2xl font-bold mb-2">🎯 어떤 도움이 필요하신가요?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto leading-[1.6] text-center">
              당신의 니즈에 맞는 최적의 테스트를 찾아드립니다
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
              <Button 
                size="lg"
                onClick={() => navigate('/quick-needs')}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg h-11 text-sm sm:text-base"
              >
                맞춤 테스트 찾기
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/needs-assessment')}
                className="flex-1 px-6 py-3 border border-primary text-primary rounded-xl font-medium hover:bg-primary/10 transition-colors h-11 text-sm sm:text-base"
              >
                상세 니즈 분석
              </Button>
            </div>
          </div>
          
          {/* 기존 프리미엄 섹션 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200">
            <h3 className="text-xl sm:text-2xl font-bold mb-4">더 정확한 분석이 필요하신가요?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto leading-[1.6] text-center">
              프리미엄 플랜으로 전문가 수준의 AIH 분석과 개인 맞춤 상담을 받아보세요
            </p>
            <div className="flex flex-col gap-3 justify-center max-w-lg mx-auto">
              <Button 
                size="lg"
                onClick={() => navigate('/premium-assessment')}
                className="w-full px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg flex items-center justify-center gap-2 h-12 sm:h-auto"
              >
                <span className="text-lg">👑</span>
                <span className="text-sm sm:text-base">프리미엄 검사 체험</span>
              </Button>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  size="lg"
                  onClick={() => navigate('/token-subscription')}
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors h-11 text-sm sm:text-base"
                >
                  구독 플랜 보기
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/assessment')}
                  className="flex-1 px-6 py-3 border border-primary text-primary rounded-xl font-medium hover:bg-primary/10 transition-colors h-11 text-sm sm:text-base"
                >
                  무료 체험하기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;