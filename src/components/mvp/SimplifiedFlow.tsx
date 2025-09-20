import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Clock, 
  FileText, 
  Users,
  ArrowRight, 
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface SimplifiedFlowProps {
  onStepComplete?: (step: number) => void;
}

export const SimplifiedFlow = ({ onStepComplete }: SimplifiedFlowProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const guideSteps = [
    {
      id: 1,
      title: "무료 체험하기",
      subtitle: "AI 상담과 대화해보세요",
      icon: MessageSquare,
      color: "card-purple",
      iconColor: "icon-purple",
      route: "/free-trial",
      description: "AI와 대화하며 심리 상태를 간단히 파악해보세요"
    },
    {
      id: 2,
      title: "3분 심리체크",
      subtitle: "빠른 기본 상태 확인",
      icon: Clock,
      color: "card-green", 
      iconColor: "icon-green",
      route: "/assessment",
      description: "짧은 시간에 현재 마음 상태를 체크해보세요"
    },
    {
      id: 3,
      title: "관찰일지 작성",
      subtitle: "체계적인 행동 기록",
      icon: FileText,
      color: "card-blue",
      iconColor: "icon-blue", 
      route: "/observation",
      description: "일상 속 패턴을 발견하고 개선점을 찾아보세요"
    },
    {
      id: 4,
      title: "전문가 상담",
      subtitle: "실제 전문가와 상담",
      icon: Users,
      color: "card-orange",
      iconColor: "icon-orange",
      route: "/experts",
      description: "심리 전문가와 직접 상담하며 해결책을 찾아보세요"
    },
    {
      id: 5,
      title: "나만의 맞춤리포팅 신청",
      subtitle: "개인화된 종합 분석 보고서",
      icon: Sparkles,
      color: "card-pink",
      iconColor: "icon-pink",
      route: "/premium-assessment",
      description: "AI가 분석한 개인 맞춤형 심리 리포트를 받아보세요"
    }
  ];

  const handleStepClick = (step: typeof guideSteps[0]) => {
    console.log('🔥 SimplifiedFlow: Starting step', step.title, step.route);
    
    onStepComplete?.(step.id);
    
    toast({
      title: `${step.title} 시작!`,
      description: step.description,
    });

    navigate(step.route);
  };

  return (
    <div className="w-full bg-gradient-to-br from-background via-background to-muted/30 py-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            단계별 이용 가이드
          </h2>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
            AI 기반 심리 케어 서비스를 단계별로 체험해보세요. 무료 체험부터 전문가 상담까지.
          </p>
        </div>

        {/* Guide Steps */}
        <div className="space-y-4">
          {guideSteps.map((step, index) => (
            <Card 
              key={step.id}
              className={`card-modern ${step.color} cursor-pointer group hover:scale-[1.02] active:scale-[0.98] transition-all duration-200`}
              onClick={() => handleStepClick(step)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <step.icon className={`w-6 h-6 ${step.iconColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-lg leading-tight mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm opacity-80 leading-tight">
                        {step.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <ArrowRight className={`w-5 h-5 ${step.iconColor} group-hover:translate-x-1 transition-transform duration-200`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">무료로 시작하세요</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            모든 단계는 개별적으로 이용 가능하며, 순서에 상관없이 필요한 서비스부터 시작하실 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedFlow;