import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Brain, 
  Heart, 
  Shield, 
  Users, 
  Sparkles, 
  Target,
  Activity,
  MessageCircle,
  CheckCircle,
  ArrowRight,
  Mic
} from "lucide-react";

export const MetaverseUnifiedSection = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MessageCircle,
      title: "대화형 SCT 문장완성검사",
      description: "연령별 맞춤 문장완성을 통해 무의식적 내면을 탐색합니다",
      gradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
      icon: Heart,
      title: "대상관계 분석",
      description: "자기표상과 대상표상을 분석하여 관계 패턴을 파악합니다",
      gradient: "from-rose-500/20 to-pink-500/20"
    },
    {
      icon: Users,
      title: "애착 유형 진단",
      description: "내적 작동모델을 통해 애착 스타일과 정서조절 능력을 평가합니다",
      gradient: "from-purple-500/20 to-indigo-500/20"
    },
    {
      icon: Shield,
      title: "방어기제 식별",
      description: "무의식적 방어기제와 대응 전략을 분석합니다",
      gradient: "from-amber-500/20 to-orange-500/20"
    },
    {
      icon: Target,
      title: "충족되지 않은 욕구",
      description: "안전, 관계, 인정, 자율성, 유능감 욕구를 평가합니다",
      gradient: "from-emerald-500/20 to-teal-500/20"
    },
    {
      icon: Activity,
      title: "치료적 개입 추천",
      description: "개인화된 치료 전략과 실천 방법을 제시합니다",
      gradient: "from-violet-500/20 to-fuchsia-500/20"
    }
  ];

  const ageGroups = [
    { label: "유아", emoji: "👶", color: "bg-blue-500/10 text-blue-600" },
    { label: "청소년", emoji: "🧒", color: "bg-purple-500/10 text-purple-600" },
    { label: "성인", emoji: "👨", color: "bg-emerald-500/10 text-emerald-600" },
    { label: "부모", emoji: "👪", color: "bg-rose-500/10 text-rose-600" },
    { label: "노인", emoji: "👴", color: "bg-amber-500/10 text-amber-600" }
  ];

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* 🎭 NEW Banner - 상단 강조 배너 */}
        <div className="mb-12 relative bg-gradient-to-r from-cyan-500/90 via-blue-500/90 to-indigo-500/90 rounded-2xl p-6 md:p-8 overflow-hidden shadow-2xl">
          {/* 배경 애니메이션 효과 */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
          
          {/* 떠다니는 별 효과 */}
          <Sparkles className="absolute top-4 left-10 w-5 h-5 text-white/60 animate-pulse" />
          <Sparkles className="absolute top-6 right-20 w-4 h-4 text-white/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <Sparkles className="absolute bottom-4 left-1/4 w-4 h-4 text-white/50 animate-pulse" style={{ animationDelay: '1s' }} />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-1">
              {/* 아이콘 */}
              <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/20 backdrop-blur-sm animate-pulse flex-shrink-0">
                <Mic className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>
              
              {/* 메시지 */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="inline-flex items-center px-3 py-1 bg-white/30 backdrop-blur-sm rounded-full text-xs font-bold text-white shadow-lg">
                    🎭 NEW
                  </span>
                  <h3 className="text-white font-bold text-lg md:text-2xl">AI 메타버스 상담실 오픈!</h3>
                </div>
                <p className="text-white/90 text-sm md:text-base">
                  가상공간에서 AI 상담사와 실시간 음성 대화를 경험해보세요 ✨
                </p>
              </div>
            </div>

            {/* 버튼 */}
            <Button
              onClick={() => navigate('/metaverse-voice')}
              size="lg"
              className="bg-white hover:bg-white/90 text-blue-600 font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 whitespace-nowrap"
            >
              <Mic className="w-5 h-5 mr-2" />
              지금 체험하기
            </Button>
          </div>
        </div>

        {/* Section Header */}
        <div className="text-center mb-16 space-y-4 md:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-primary/10 border border-primary/20 rounded-full">
            <Brain className="w-3 h-3 md:w-4 md:h-4 text-primary" />
            <span className="text-xs md:text-sm font-semibold text-primary">세계 최초 AI 메타버스 심층 심리 분석</span>
          </div>
          
          <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
            금쪽같은 내새끼의
            <br />
            <span className="text-primary">심층 상담</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-primary font-semibold mt-2">
            이제 AI 메타버스로 만나보세요
          </p>
          
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            아이들이 편안하게 대화하듯, AI가 자연스러운 대화로 마음을 열어줍니다
            <br className="hidden sm:block" />
            대화 속에 숨겨진 <span className="font-semibold text-primary">관계 패턴과 애착 유형</span>을 전문가 수준으로 분석해드립니다
          </p>
        </div>

        {/* Main Features Grid - Mobile Accordion, Desktop Grid */}
        <div className="mb-16">
          {/* Mobile: Accordion */}
          <div className="md:hidden">
            <Accordion type="single" collapsible className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <AccordionItem key={index} value={`feature-${index}`} className="border rounded-lg px-4 bg-card">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-base font-bold text-foreground text-left">{feature.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground leading-relaxed pl-13">
                        {feature.description}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>

          {/* Desktop: Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className={`group p-6 bg-gradient-to-br ${feature.gradient} backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:scale-105`}
                >
                  <div className="flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Age Groups */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            5가지 연령별 맞춤 분석
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {ageGroups.map((group, index) => (
              <div 
                key={index}
                className={`px-6 py-3 ${group.color} rounded-full font-semibold text-sm flex items-center gap-2 hover:scale-105 transition-transform cursor-default`}
              >
                <span className="text-xl">{group.emoji}</span>
                {group.label}
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Process - Mobile Accordion, Desktop Grid */}
        <Card className="p-6 md:p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 mb-12">
          <h3 className="text-base md:text-2xl font-bold mb-6 md:mb-8 text-center flex items-center justify-center gap-2">
            <Target className="w-4 h-4 md:w-6 md:h-6 text-primary" />
            자연스러운 대화로 마음 읽기
          </h3>
          
          {/* Mobile: Accordion */}
          <div className="md:hidden">
            <Accordion type="single" collapsible className="space-y-3">
              {[
                { step: "1", title: "편안한 대화", desc: "친구와 이야기하듯 자연스러운 문장완성" },
                { step: "2", title: "마음 읽기", desc: "대화 속 숨겨진 감정과 관계 패턴 발견" },
                { step: "3", title: "진짜 욕구", desc: "표현하지 못한 진짜 마음 찾기" },
                { step: "4", title: "따뜻한 조언", desc: "아이에게 꼭 맞는 케어 방법 제시" }
              ].map((item, index) => (
                <AccordionItem key={index} value={`step-${index}`} className="border rounded-lg px-4 bg-background/50">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/30 flex-shrink-0">
                        <span className="text-sm font-bold text-primary">{item.step}</span>
                      </div>
                      <span className="text-sm font-bold text-foreground text-left">{item.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground pl-11">{item.desc}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Desktop: Grid */}
          <div className="hidden md:grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "편안한 대화", desc: "친구와 이야기하듯 자연스러운 문장완성" },
              { step: "2", title: "마음 읽기", desc: "대화 속 숨겨진 감정과 관계 패턴 발견" },
              { step: "3", title: "진짜 욕구", desc: "표현하지 못한 진짜 마음 찾기" },
              { step: "4", title: "따뜻한 조언", desc: "아이에게 꼭 맞는 케어 방법 제시" }
            ].map((item, index) => (
              <div key={index} className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto border-2 border-primary/30">
                  <span className="text-lg font-bold text-primary">{item.step}</span>
                </div>
                <h4 className="font-bold text-foreground">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Key Insights - Mobile Accordion, Desktop Grid */}
        <div className="mb-12">
          {/* Mobile: Accordion */}
          <div className="md:hidden">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="object-relations" className="border rounded-lg overflow-hidden">
                <AccordionTrigger className="px-6 py-4 bg-gradient-to-br from-rose-500/10 to-pink-500/10 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-500" />
                    <span className="text-base font-bold">대상관계이론 분석 항목</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 py-4 bg-gradient-to-br from-rose-500/5 to-pink-500/5">
                  <ul className="space-y-3">
                    {[
                      "자기표상 (Self Representation)",
                      "대상표상 (Object Representation)",
                      "분리-개별화 단계 평가",
                      "방어기제 패턴 분석",
                      "대인관계 스키마 파악"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="attachment-theory" className="border rounded-lg overflow-hidden">
                <AccordionTrigger className="px-6 py-4 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    <span className="text-base font-bold">애착이론 분석 항목</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 py-4 bg-gradient-to-br from-purple-500/5 to-indigo-500/5">
                  <ul className="space-y-3">
                    {[
                      "애착 유형 진단 (안정/불안/회피)",
                      "내적 작동 모델 (IWM) 분석",
                      "정서 조절 능력 평가",
                      "친밀감에 대한 두려움",
                      "관계에서의 안정감 수준"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Desktop: Grid */}
          <div className="hidden md:grid md:grid-cols-2 gap-8">
            <Card className="p-8 bg-gradient-to-br from-rose-500/10 to-pink-500/10 border-rose-500/20">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                대상관계이론 분석 항목
              </h3>
              <ul className="space-y-3">
                {[
                  "자기표상 (Self Representation)",
                  "대상표상 (Object Representation)",
                  "분리-개별화 단계 평가",
                  "방어기제 패턴 분석",
                  "대인관계 스키마 파악"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/20">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                애착이론 분석 항목
              </h3>
              <ul className="space-y-3">
                {[
                  "애착 유형 진단 (안정/불안/회피)",
                  "내적 작동 모델 (IWM) 분석",
                  "정서 조절 능력 평가",
                  "친밀감에 대한 두려움",
                  "관계에서의 안정감 수준"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">지금 바로 무료로 체험하세요</span>
          </div>
          
          <Button 
            size="lg"
            onClick={() => navigate("/metaverse-voice")}
            className="group text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:shadow-xl hover:shadow-primary/20 transition-all duration-300"
          >
            메타버스 심층 분석 시작하기
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <p className="text-sm text-muted-foreground">
            * 최초 1회 무료 체험 제공 · 평균 소요 시간 15분
          </p>
        </div>
      </div>
    </section>
  );
};
