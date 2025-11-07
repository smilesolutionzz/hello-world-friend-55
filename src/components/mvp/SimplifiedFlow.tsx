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
      color: "card-glass-pink",
      iconColor: "icon-purple",
      route: "/free-trial",
      description: "AI와 대화하며 심리 상태를 간단히 파악해보세요",
      emoji: "💬"
    },
    {
      id: 2,
      title: "관찰일지 작성",
      subtitle: "체계적인 행동 기록",
      icon: FileText,
      color: "card-glass-green",
      iconColor: "icon-green", 
      route: "/observation",
      description: "일상 속 패턴을 발견하고 개선점을 찾아보세요",
      emoji: "📝"
    },
    {
      id: 3,
      title: "3분 온보딩",
      subtitle: "빠른 기본 상태 확인",
      icon: Clock,
      color: "card-glass-blue", 
      iconColor: "icon-blue",
      route: "/assessment",
      description: "짧은 시간에 현재 마음 상태를 체크해보세요",
      emoji: "⏱️"
    },
    {
      id: 4,
      title: "전문가 상담",
      subtitle: "실제 전문가와 상담",
      icon: Users,
      color: "card-glass-orange",
      iconColor: "icon-orange",
      route: "/expert-hiring",
      description: "심리 전문가와 직접 상담하며 해결책을 찾아보세요",
      emoji: "👨‍⚕️"
    },
    {
      id: 5,
      title: "맞춤 리포트",
      subtitle: "개인화된 종합 분석 보고서",
      icon: Sparkles,
      color: "card-glass-purple",
      iconColor: "icon-pink",
      route: "/dashboard",
      description: "AI가 분석한 개인 맞춤형 심리 리포트를 받아보세요",
      emoji: "✨"
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
    <div className="w-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Premium Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200/50 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">단계별 맞춤 케어</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            가족건강 여정을 함께 걸어보세요
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            무료 체험부터 전문가 상담까지 맞춤 심리 케어
          </p>
        </div>

        {/* Premium Grid Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {guideSteps.map((step, index) => (
            <Card 
              key={step.id}
              className={`${step.color} cursor-pointer group relative overflow-hidden animate-float hover-glow`}
              onClick={() => handleStepClick(step)}
            >
              <CardContent className="p-6">
                {/* Card Number Badge */}
                <div className="absolute top-4 right-4 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-600">{step.id}</span>
                </div>
                
                {/* Icon & Emoji */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/80 rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-xl">{step.emoji}</span>
                  </div>
                  <step.icon className={`w-6 h-6 ${step.iconColor} opacity-70`} />
                </div>
                
                {/* Content */}
                <div className="space-y-2 mb-4">
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {step.subtitle}
                  </p>
                </div>
                
                {/* Description */}
                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                  {step.description}
                </p>
                
                {/* Arrow Indicator */}
                <div className="flex justify-end">
                  <ArrowRight className={`w-5 h-5 ${step.iconColor} group-hover:translate-x-1 transition-transform duration-200`} />
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Special CTA Card */}
          <Card className="card-glass-yellow cursor-pointer group relative overflow-hidden md:col-span-2 lg:col-span-1 hover-glow">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/80 rounded-xl flex items-center justify-center shadow-sm mx-auto mb-4">
                  <span className="text-xl">🎯</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  무료로 시작하기
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  어떤 서비스가 맞는지 모르겠다면?
                </p>
                <Button 
                  className="btn-premium w-full group-hover:scale-105 transition-transform"
                  onClick={() => handleStepClick(guideSteps[0])}
                >
                  지금 체험해보기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Message */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 border border-gray-200/50 rounded-full shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              모든 서비스는 개별 이용 가능하며, 언제든 시작할 수 있습니다
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedFlow;