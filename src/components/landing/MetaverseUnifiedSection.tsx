import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
  Sparkles, 
  MessageSquare,
  Users,
  Mic,
  ArrowRight,
  Star,
  ChevronDown
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export const MetaverseUnifiedSection = () => {
  const navigate = useNavigate();
  const [openCards, setOpenCards] = useState<Record<number, boolean>>({});

  const toggleCard = (index: number) => {
    setOpenCards(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const modes = [
    {
      icon: Sparkles,
      title: "금쪽 상담",
      subtitle: "나이대별 맞춤 상담",
      description: "귀여운 AI 캐릭터와 함께하는 연령별 맞춤 심리 상담",
      iconColor: "text-primary",
      bgColor: "bg-primary/5",
      features: ["👶 유아부터 👴 노인까지", "🐰 토끼 · 🦊 여우 · 🦉 올빼미", "음성 + 채팅 지원"],
      details: "연령별 특성을 고려한 맞춤형 대화 방식으로 아이부터 어른까지 누구나 편안하게 상담받을 수 있습니다. AI 캐릭터가 나이대에 맞는 말투와 공감으로 대화합니다."
    },
    {
      icon: Users,
      title: "롤플레이 연습",
      subtitle: "아동 사회성 발달 훈련",
      description: "아동의 사회적 기술과 정서 발달을 위한 맞춤형 역할 놀이",
      iconColor: "text-accent",
      bgColor: "bg-accent/5",
      features: ["👶 또래관계 연습", "😊 감정표현 훈련", "🤝 협력하기 배우기"],
      details: "아동 발달 전문가가 설계한 시나리오로 사회성과 정서 조절 능력을 키웁니다. 친구와 놀기, 감정 표현하기, 양보하기, 갈등 해결하기 등 실생활에서 필요한 사회적 기술을 안전한 가상공간에서 연습할 수 있습니다."
    },
    {
      icon: MessageSquare,
      title: "자유 대화",
      subtitle: "24시간 AI 상담",
      description: "제약 없이 언제든지 AI와 편하게 대화하기",
      iconColor: "text-secondary",
      bgColor: "bg-secondary/5",
      features: ["🌙 24시간 이용", "🔒 완전 익명", "💭 자유로운 주제"],
      details: "시간과 장소에 구애받지 않고 언제든 대화를 시작할 수 있습니다. 고민이나 일상 이야기 등 어떤 주제든 편하게 나눠보세요. 모든 대화는 완전히 익명으로 보호됩니다."
    }
  ];

  return (
    <section className="relative py-16 md:py-24 bg-background">
      {/* Simple Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utb3BhY2l0eT0iMC4wMyIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Hero Banner */}
        <div className="text-center mb-12 md:mb-16 space-y-4 md:space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-border rounded-full">
            <Mic className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              실시간 음성 AI 메타버스
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
            가상공간에서
            <br />
            <span className="text-primary">AI와 실시간 대화</span>
          </h2>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            3D 메타버스 환경에서 음성으로 AI 상담사와 자연스럽게 소통하세요
          </p>
        </div>

        {/* Mode Cards with Collapsible Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
          {modes.map((mode, index) => {
            const Icon = mode.icon;
            const isOpen = openCards[index];
            
            return (
              <Collapsible
                key={index}
                open={isOpen}
                onOpenChange={() => toggleCard(index)}
              >
                <Card 
                  className="group relative overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg bg-card"
                >
                  {/* Content */}
                  <div className="relative p-6 md:p-8 space-y-4">
                    {/* Icon */}
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl ${mode.bgColor} flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}>
                      <Icon className={`w-7 h-7 md:w-8 md:h-8 ${mode.iconColor}`} />
                    </div>
                    
                    {/* Title */}
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold mb-1 text-foreground">
                        {mode.title}
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        {mode.subtitle}
                      </p>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {mode.description}
                    </p>
                    
                    {/* Features - Always Visible */}
                    <div className="space-y-2 pt-2">
                      {mode.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Star className="w-3 h-3 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Collapsible Details */}
                    <CollapsibleContent className="animate-accordion-down">
                      <div className="pt-4 mt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {mode.details}
                        </p>
                      </div>
                    </CollapsibleContent>

                    {/* Toggle Button */}
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2 group/btn hover:bg-primary/10"
                      >
                        <span className="text-sm font-medium text-primary">
                          {isOpen ? '접기' : '자세히 보기'}
                        </span>
                        <ChevronDown className={`w-4 h-4 ml-2 text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </Card>
              </Collapsible>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="relative rounded-2xl overflow-hidden border border-border bg-card">
          <div className="relative p-8 md:p-12 text-center space-y-6">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
              지금 바로 시작하세요
            </h3>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              3D 가상공간에서 AI와 대화하며 새로운 상담 경험을 만나보세요
            </p>
            <Button
              onClick={() => navigate('/metaverse-voice')}
              size="lg"
              className="font-semibold text-base md:text-lg px-8 py-6 md:px-10 md:py-7 rounded-lg transition-all duration-300 group"
            >
              <Mic className="w-5 h-5 md:w-6 md:h-6 mr-2" />
              메타버스 상담실 입장
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
