import ChatInterface from "./ChatInterface";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TypingAnimation } from "@/components/ui/typing-animation";

const HeroSection = () => {
  const navigate = useNavigate();
  
  const typingPhrases = [
    "우리 아이 20개월인데 아직도 엄마밖에 못하고, 울음을 멈추지 못해서 걱정이에요",
    "최근 직장에서 스트레스가 심해서 불안하고 우울한 기분이 계속 지속되고 있어요",
    "중학생 딸이 친구관계 때문에 힘들어하는데 어떻게 도와줘야 할지 모르겠어요",
    "결혼 후 남편과의 관계에서 소통이 잘 안 되고 자꾸 갈등이 생겨서 힘들어요",
    "60대 부모님이 건망증이 심해지시는데 치매 초기 증상인지 걱정됩니다",
    "고등학생 아들이 게임만 하고 공부는 안 해서 미래가 걱정되어요"
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
            <span className="block text-foreground mb-1 sm:mb-2">데이터로 읽는 마음,</span>
            <span className="block text-brand-gradient">AI 심리분석 플랫폼</span>
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
              프리미엄 플랜으로 전문가 수준의 AI 분석과 개인 맞춤 상담을 받아보세요
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