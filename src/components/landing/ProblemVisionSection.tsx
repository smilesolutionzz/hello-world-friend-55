import { Heart, Shield, Users, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import problemVisionBg from '@/assets/problem-vision-bg.jpg';

const ProblemVisionSection = () => {
  const problems = [
    {
      icon: Building2,
      title: "병원·센터 방문이 부담스럽다",
      description: "두려움과 낙인 때문에 전문기관 방문을 망설이게 돼요"
    },
    {
      icon: Shield,
      title: "예방적 관리가 필요하다",
      description: "심각해지기 전에 조기 발견하고 관리하는 것이 중요해요"
    },
    {
      icon: Heart,
      title: "발달·심리 케어가 복잡하다",
      description: "어디서부터 시작해야 할지, 누구에게 도움을 받아야 할지 막막해요"
    },
    {
      icon: Users,
      title: "전문가 연결이 어렵다",
      description: "내게 맞는 전문가를 찾기 어렵고 비용 부담도 커요"
    }
  ];

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${problemVisionBg})` }}
      >
        <div className="absolute inset-0 bg-background/90" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary mb-4 tracking-wide uppercase">Why AI Highlight Pro?</p>
          <h2 className="text-base sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6">
            왜 AIHumanPro가 필요한가요?
          </h2>
        </div>

        {/* Problems - Mobile Accordion, Desktop Grid */}
        <div className="mb-16">
          {/* Mobile: Accordion */}
          <div className="lg:hidden">
            <Accordion type="single" collapsible className="space-y-3">
              {problems.map((problem, index) => {
                const Icon = problem.icon;
                return (
                  <AccordionItem 
                    key={index} 
                    value={`problem-${index}`}
                    className="border rounded-2xl overflow-hidden bg-card"
                  >
                    <AccordionTrigger className="px-5 py-4 hover:no-underline">
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-sm font-bold text-foreground text-left flex-1">
                          {problem.title}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-4">
                      <p className="text-sm text-muted-foreground leading-relaxed pl-13">
                        {problem.description}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>

          {/* Desktop: Grid */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-6">
            {problems.map((problem, index) => {
              const Icon = problem.icon;
              return (
                <Card 
                  key={index}
                  className="p-8 bg-card border border-border rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-foreground mb-3 whitespace-nowrap">{problem.title}</h3>
                  <p className="text-foreground drop-shadow-md leading-relaxed">{problem.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Solution Statement */}
        <div className="text-center">
          <p className="text-base sm:text-lg md:text-xl font-semibold text-foreground max-w-3xl mx-auto leading-relaxed">
            AIHumanPro는 <span className="text-primary">AI 기술과 전문가의 협업</span>으로 예방부터 회복까지 함께 돕습니다
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemVisionSection;
