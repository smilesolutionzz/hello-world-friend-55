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
      subtitle: "실전 시뮬레이션 훈련",
      description: "면접, 발표, 대인관계 등 다양한 상황을 AI와 실전처럼 연습",
      iconColor: "text-accent",
      bgColor: "bg-accent/5",
      features: ["💼 면접 · 발표 연습", "👥 대인관계 훈련", "👶 아동 사회성 발달"],
      details: "취업 면접, 프레젠테이션, 어려운 대화 등 실생활의 다양한 상황을 안전한 가상공간에서 미리 연습해보세요. 아동의 경우 또래관계, 감정표현, 협력하기 등 사회성 발달을 위한 맞춤형 시나리오를 제공합니다."
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

        {/* Mode Cards - Sandwich Style */}
        <div className="max-w-3xl mx-auto space-y-4 mb-12">
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
                  className="group relative overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 bg-card"
                >
                  <div className="relative p-6 md:p-8">
                    {/* Header Row */}
                    <div className="flex items-start gap-4 mb-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-lg ${mode.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 md:w-7 md:h-7 ${mode.iconColor}`} />
                      </div>
                      
                      {/* Title & Description */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg md:text-xl font-bold mb-1 text-foreground">
                          {mode.title}
                        </h3>
                        <p className="text-xs md:text-sm text-muted-foreground font-medium mb-2">
                          {mode.subtitle}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {mode.description}
                        </p>
                      </div>
                      
                      {/* Toggle Button */}
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-shrink-0 hover:bg-primary/10"
                        >
                          <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    
                    {/* Features - Always Visible */}
                    <div className="flex flex-wrap gap-3 mb-2">
                      {mode.features.map((feature, idx) => (
                        <div key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 rounded-full text-xs">
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Collapsible Details */}
                    <CollapsibleContent className="animate-accordion-down">
                      <div className="pt-4 mt-2 border-t border-border">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {mode.details}
                        </p>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Card>
              </Collapsible>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="relative rounded-2xl overflow-hidden border border-border bg-card">
          <div className="relative p-6 md:p-12 text-center space-y-4 md:space-y-6">
            <h3 className="text-xl md:text-3xl lg:text-4xl font-bold text-foreground">
              지금 바로 시작하세요
            </h3>
            <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
              3D 가상공간에서 AI와 대화하며 새로운 상담 경험을 만나보세요
            </p>
            <Button
              onClick={() => navigate('/metaverse-voice')}
              size="lg"
              className="font-semibold text-sm md:text-lg px-6 py-5 md:px-10 md:py-7 rounded-lg transition-all duration-300 group w-full md:w-auto"
            >
              <Mic className="w-4 h-4 md:w-6 md:h-6 mr-2" />
              <span className="truncate">메타버스 상담실 입장</span>
              <ArrowRight className="w-4 h-4 md:w-6 md:h-6 ml-2 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
