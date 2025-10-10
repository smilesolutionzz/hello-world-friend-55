import { ClipboardCheck, Brain, UserCheck, FileText, ArrowRight } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      icon: ClipboardCheck,
      title: "자가진단",
      description: "간단한 질문에 답하며 현재 상태를 파악합니다"
    },
    {
      number: "02",
      icon: Brain,
      title: "AI 분석",
      description: "딥러닝 AI가 데이터를 분석하고 평가합니다"
    },
    {
      number: "03",
      icon: UserCheck,
      title: "상담 연결",
      description: "전문가와 매칭하여 맞춤 상담을 시작합니다"
    },
    {
      number: "04",
      icon: FileText,
      title: "리포트 제공",
      description: "상세한 분석 리포트와 솔루션을 받습니다"
    }
  ];

  return (
    <section className="py-32 bg-gradient-to-br from-secondary to-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 whitespace-nowrap">
            어떻게 작동하나요?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            4단계로 완성되는 AI 통합 케어
          </p>
        </div>

        {/* Desktop: Horizontal Timeline */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
            
            <div className="grid grid-cols-4 gap-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="relative text-center">
                    {/* Step Circle */}
                    <div className="relative z-10 w-32 h-32 mx-auto bg-card border-4 border-primary rounded-full flex items-center justify-center mb-6 shadow-xl">
                      <Icon className="w-12 h-12 text-primary" />
                    </div>
                    
                    {/* Arrow (except last) */}
                    {index < steps.length - 1 && (
                      <ArrowRight className="hidden xl:block absolute top-14 -right-4 w-8 h-8 text-primary/40" />
                    )}
                    
                    <div className="space-y-3">
                      <div className="text-5xl font-bold text-primary/20">
                        {step.number}
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed px-2">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile: Vertical Timeline */}
        <div className="md:hidden space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative flex gap-6">
                {/* Vertical Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-primary/20" />
                )}
                
                {/* Step Circle */}
                <div className="relative z-10 flex-shrink-0 w-16 h-16 bg-card border-4 border-primary rounded-full flex items-center justify-center shadow-lg">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                
                <div className="flex-1 pt-2">
                  <div className="text-3xl font-bold text-primary/20 mb-2">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
