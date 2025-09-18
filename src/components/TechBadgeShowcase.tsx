import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Cpu, Sparkles, Zap, Target, Shield } from 'lucide-react';

export const TechBadgeShowcase: React.FC = () => {
  const techFeatures = [
    {
      icon: Brain,
      title: '딥러닝 신경망',
      description: 'GPT-5 기반 최신 AI 모델',
      badge: '최신 기술',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Cpu,
      title: '실시간 분석',
      description: '즉시 처리되는 AI 분석',
      badge: '고속 처리',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Target,
      title: '정밀 분석',
      description: '99% 정확도의 AI 분석',
      badge: '고정밀',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Shield,
      title: '안전한 AI',
      description: '검증된 심리학 모델',
      badge: '신뢰성',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="py-12 bg-gradient-to-br from-slate-50 to-blue-50/50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              딥러닝 AIH 모델
            </h2>
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium">
            딥러닝 AIH 모델이 당신의 성격과 특성을 정밀하게 분석합니다
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {techFeatures.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 group hover:shadow-lg">
              <CardContent className="p-6">
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${feature.color} opacity-10 rounded-bl-full`}></div>
                <div className="relative">
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.color} mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge className={`bg-gradient-to-r ${feature.color} text-white border-0 mb-3`}>
                    {feature.badge}
                  </Badge>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full border border-primary/20">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              모든 분석 과정에 딥러닝 AIH 모델이 적용됩니다
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};