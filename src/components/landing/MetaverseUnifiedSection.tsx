import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { MetaverseBackground } from "@/components/3d/MetaverseBackground";
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
      title: "AI 맞춤 상담",
      subtitle: "전 연령 개인화 케어",
      description: "3D 아바타와 함께하는 몰입형 심리 상담 경험",
      iconColor: "text-violet-400",
      bgGradient: "from-violet-500/20 via-purple-500/20 to-fuchsia-500/20",
      glowColor: "shadow-[0_0_40px_rgba(139,92,246,0.3)]",
      features: [
        { icon: "🎯", text: "AI 기반 감정 분석", highlight: true },
        { icon: "🎭", text: "맞춤형 캐릭터 선택" },
        { icon: "🎤", text: "실시간 음성 대화" }
      ],
      stats: { users: "1,200+", satisfaction: "98%" },
      details: "최신 AI 기술로 당신의 감정을 이해하고, 나이와 성향에 맞춘 개인화된 상담을 제공합니다. 귀여운 3D 캐릭터가 편안한 대화 환경을 만들어줍니다."
    },
    {
      icon: Users,
      title: "사회성 훈련",
      subtitle: "AI 롤플레잉 시뮬레이션",
      description: "다양한 사회적 상황을 역할극으로 연습하며 대인관계 능력 향상",
      iconColor: "text-cyan-400",
      bgGradient: "from-cyan-500/20 via-blue-500/20 to-indigo-500/20",
      glowColor: "shadow-[0_0_40px_rgba(6,182,212,0.3)]",
      features: [
        { icon: "🎭", text: "실감나는 역할극 시나리오", highlight: true },
        { icon: "📊", text: "대화 패턴 실시간 분석" },
        { icon: "🏆", text: "단계별 성장 추적" }
      ],
      stats: { scenarios: "50+", improvement: "85%" },
      details: "친구 사귀기, 갈등 해결, 면접 준비 등 실생활 상황을 AI 캐릭터와 롤플레잉으로 연습합니다. 나의 대화 방식을 분석받고, 더 나은 소통 방법을 배워보세요."
    },
    {
      icon: MessageSquare,
      title: "무제한 대화",
      subtitle: "언제나 함께하는 AI 친구",
      description: "시간 제한 없이, 언제 어디서나 당신의 이야기를 들어줄 AI",
      iconColor: "text-rose-400",
      bgGradient: "from-rose-500/20 via-pink-500/20 to-red-500/20",
      glowColor: "shadow-[0_0_40px_rgba(244,63,94,0.3)]",
      features: [
        { icon: "⚡", text: "즉시 연결 (대기시간 0초)", highlight: true },
        { icon: "🔐", text: "완벽한 보안 암호화" },
        { icon: "🌙", text: "새벽에도 언제든지" }
      ],
      stats: { available: "연중무휴", privacy: "100%" },
      details: "밤낮 구분 없이, 시간 제한 없이 대화할 수 있습니다. 혼자 있고 싶을 때도, 누군가와 이야기하고 싶을 때도 AI 친구가 항상 곁에 있습니다. 완벽한 익명성으로 마음 편하게 털어놓으세요."
    }
  ];

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* 3D Animated Background */}
      <div className="absolute inset-0 opacity-40">
        <MetaverseBackground />
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background pointer-events-none" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-accent/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />

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

        {/* Mode Cards - Modern Glass Morphism Style */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 mb-16">
          {modes.map((mode, index) => {
            const Icon = mode.icon;
            const isOpen = openCards[index];
            
            return (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Glow Effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${mode.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 ${mode.glowColor}`} />
                
                {/* Card */}
                <Card className="relative h-full backdrop-blur-xl bg-card/40 border border-border/30 rounded-3xl overflow-hidden transition-all duration-500 hover:border-primary/50 hover:-translate-y-2 hover:shadow-2xl">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className={`absolute inset-0 bg-gradient-to-br ${mode.bgGradient}`} />
                  </div>
                  
                  <div className="relative p-8 space-y-6">
                    {/* Header */}
                    <div className="space-y-4">
                      {/* Icon with animated background */}
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-br ${mode.bgGradient} rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition-opacity`} />
                        <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${mode.bgGradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                          <Icon className={`w-8 h-8 ${mode.iconColor}`} />
                        </div>
                      </div>
                      
                      {/* Title & Subtitle */}
                      <div>
                        <h3 className="text-2xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                          {mode.title}
                        </h3>
                        <p className="text-sm font-semibold text-primary/80 mb-3">
                          {mode.subtitle}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {mode.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex gap-4 py-4 border-y border-border/30">
                      {Object.entries(mode.stats).map(([key, value]) => (
                        <div key={key} className="flex-1 text-center">
                          <div className="text-xl font-bold text-primary mb-1">{value}</div>
                          <div className="text-xs text-muted-foreground capitalize">{key}</div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Features */}
                    <div className="space-y-3">
                      {mode.features.map((feature, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-center gap-3 text-sm p-3 rounded-xl transition-all duration-200 ${
                            feature.highlight 
                              ? 'bg-primary/10 border border-primary/20 font-semibold' 
                              : 'hover:bg-muted/30'
                          }`}
                        >
                          <span className="text-2xl">{feature.icon}</span>
                          <span className={feature.highlight ? 'text-foreground' : 'text-muted-foreground'}>
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Expandable Details */}
                    <Collapsible open={isOpen} onOpenChange={() => toggleCard(index)}>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between hover:bg-primary/10 group/btn"
                        >
                          <span className="text-sm font-medium">상세 정보</span>
                          <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                        </Button>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="animate-accordion-down">
                        <div className="pt-4 text-sm text-muted-foreground leading-relaxed border-t border-border/30 mt-4">
                          {mode.details}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="relative rounded-2xl overflow-hidden border border-primary/20 bg-card/60 backdrop-blur-md shadow-xl">
          {/* CTA Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb)/0.1),transparent_50%)]" />
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
