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
  Zap,
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
      gradient: "from-pink-500 via-purple-500 to-indigo-500",
      bgGradient: "from-pink-500/10 via-purple-500/10 to-indigo-500/10",
      features: ["👶 유아부터 👴 노인���지", "🐰 토끼 · 🦊 여우 · 🦉 올빼미", "음성 + 채팅 지원"],
      details: "연령별 특성을 고려한 맞춤형 대화 방식으로 아이부터 어른까지 누구나 편안하게 상담받을 수 있습니다. AI 캐릭터가 나이대에 맞는 말투와 공감으로 대화합니다."
    },
    {
      icon: Users,
      title: "롤플레이 연습",
      subtitle: "실전 시나리오 훈련",
      description: "실제 상황을 가상공간에서 연습하고 피드백 받기",
      gradient: "from-cyan-500 via-blue-500 to-purple-500",
      bgGradient: "from-cyan-500/10 via-blue-500/10 to-purple-500/10",
      features: ["👨‍👩‍👧 가족 대화", "🏢 업무 상황", "💬 갈등 해결"],
      details: "어려운 대화 상황을 미리 연습해보세요. 가족과의 대화, 직장 상사와의 면담, 갈등 상황 등 다양한 시나리오에서 실전처럼 연습하고 즉각적인 피드백을 받을 수 있습니다."
    },
    {
      icon: MessageSquare,
      title: "자유 대화",
      subtitle: "24시간 AI 상담",
      description: "제약 없이 언제든지 AI와 편하게 대화하기",
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      bgGradient: "from-emerald-500/10 via-teal-500/10 to-cyan-500/10",
      features: ["🌙 24시간 이용", "🔒 완전 익명", "💭 자유로운 주제"],
      details: "시간과 장소에 구애받지 않고 언제든 대화를 시작할 수 있습니다. 고민이나 일상 이야기 등 어떤 주제든 편하게 나눠보세요. 모든 대화는 완전히 익명으로 보호됩니다."
    }
  ];

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Advanced 3D Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5" />
      
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-cyan-500/20 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-[200px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/40 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Hero Banner */}
        <div className="text-center mb-12 md:mb-16 space-y-4 md:space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary/15 via-accent/15 to-primary/15 border border-primary/30 rounded-full backdrop-blur-md shadow-lg shadow-primary/10">
            <Mic className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              🎭 NEW 실시간 음성 AI 메타버스
            </span>
            <Zap className="w-4 h-4 text-accent animate-pulse" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent drop-shadow-lg">
              가상공간에서
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent drop-shadow-lg animate-pulse">
              AI와 실시간 대화
            </span>
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
                  className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 backdrop-blur-sm"
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${mode.bgGradient} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Animated Border Glow */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${mode.gradient} opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500`} />
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Content */}
                  <div className="relative p-6 md:p-8 space-y-4">
                    {/* Icon */}
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${mode.gradient} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-primary/30`}>
                      <Icon className="w-7 h-7 md:w-8 md:h-8 text-white drop-shadow-lg" />
                    </div>
                    
                    {/* Title */}
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold mb-1 group-hover:text-primary transition-colors">
                        {mode.title}
                      </h3>
                      <p className="text-sm text-primary/70 font-medium">
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
                      <div className="pt-4 mt-4 border-t border-primary/20">
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
        <div className="relative rounded-3xl overflow-hidden animate-scale-in">
          {/* Multi-layer Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600" />
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/50 via-purple-500/50 to-indigo-500/50 animate-pulse" />
          
          {/* Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />
          
          {/* Animated Glow Orbs */}
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/2 right-1/4 w-64 h-64 bg-cyan-300/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          
          {/* Floating Stars */}
          <Sparkles className="absolute top-8 left-12 w-6 h-6 text-white/70 animate-pulse" />
          <Sparkles className="absolute top-12 right-20 w-5 h-5 text-white/50 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <Sparkles className="absolute bottom-8 left-1/3 w-5 h-5 text-white/60 animate-pulse" style={{ animationDelay: '1s' }} />
          <Sparkles className="absolute bottom-12 right-1/3 w-4 h-4 text-white/40 animate-pulse" style={{ animationDelay: '1.5s' }} />
          
          {/* Content */}
          <div className="relative p-8 md:p-12 text-center space-y-6">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-2xl">
              지금 바로 시작하세요
            </h3>
            <p className="text-base md:text-lg text-white/95 max-w-2xl mx-auto drop-shadow-lg">
              3D 가상공간에서 AI와 대화하며 새로운 상담 경험을 만나보세요
            </p>
            <Button
              onClick={() => navigate('/metaverse-voice')}
              size="lg"
              className="bg-white hover:bg-white/95 text-violet-600 font-bold text-base md:text-lg px-8 py-6 md:px-10 md:py-7 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 group"
            >
              <Mic className="w-5 h-5 md:w-6 md:h-6 mr-2 group-hover:animate-pulse" />
              메타버스 상담실 입장
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
