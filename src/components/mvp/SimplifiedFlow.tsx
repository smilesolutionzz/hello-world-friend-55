import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Brain, 
  UserCheck, 
  ArrowRight, 
  Check,
  Sparkles,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface SimplifiedFlowProps {
  onStepComplete?: (step: number) => void;
}

export const SimplifiedFlow = ({ onStepComplete }: SimplifiedFlowProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const coreFeatures = [
    {
      id: 1,
      title: "간단 관찰일지",
      subtitle: "무료 체험",
      description: "24시간 우리 가족의 마음 상태를 간단히 기록하고 패턴을 발견하세요",
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
      route: "/observation",
      features: ["3분 내 작성 완료", "즉시 패턴 분석", "무료 체험 가능"],
      ctaText: "무료로 시작하기",
      badge: "FREE",
      steps: [
        { name: "관찰일지 작성", path: "/observation" },
        { name: "3분 테스트", path: "/assessment" },
        { name: "프리미엄 테스트", path: "/premium-assessment" }
      ]
    },
    {
      id: 2,
      title: "AI 분석 리포트",
      subtitle: "전문가급 분석",
      description: "AI가 관찰 데이터를 분석하여 전문가 수준의 인사이트를 제공합니다",
      icon: Brain,
      color: "from-purple-500 to-pink-500",
      route: "/premium-assessment",
      features: ["AI 전문가 분석", "개인맞춤 개선방안", "24시간 내 결과"],
      ctaText: "AI 분석 받기",
      badge: "PREMIUM",
      price: "월 9,900원",
      requirement: "데이터 3개 이상 필요"
    },
    {
      id: 3,
      title: "전문가 상담",
      subtitle: "1:1 맞춤 상담",
      description: "심리 전문가와 직접 상담하여 정확한 진단과 해결방안을 받으세요",
      icon: UserCheck,
      color: "from-emerald-500 to-teal-500",
      route: "/experts",
      features: ["실시간 전문가 상담", "개별 맞춤 솔루션", "지속적 케어"],
      ctaText: "전문가 연결",
      badge: "EXPERT",
      price: "월 29,900원",
      requirement: "AI 분석 완료 후 이용"
    }
  ];

  const handleStartFeature = (feature: typeof coreFeatures[0]) => {
    console.log('🔥 SimplifiedFlow: Starting feature', feature.title, feature.route);
    
    // 단계 완료 체크
    if (!completedSteps.includes(feature.id)) {
      setCompletedSteps([...completedSteps, feature.id]);
      onStepComplete?.(feature.id);
    }

    // 사용자 여정 안내
    if (feature.id === 1) {
      toast({
        title: "🎯 첫 번째 단계 시작!",
        description: "관찰일지, 3분테스트, 프리미엄테스트로 데이터를 쌓아보세요",
      });
    } else if (feature.id === 2) {
      toast({
        title: "🧠 AI 분석으로 업그레이드",
        description: "쌓인 데이터를 바탕으로 전문가 수준의 분석을 받아보세요",
      });
    } else if (feature.id === 3) {
      toast({
        title: "👨‍⚕️ 전문가 검증 및 상담",
        description: "AI 분석 결과를 전문가가 검증하고 개인 맞춤 상담을 제공합니다",
      });
    }

    // 항상 네비게이션 수행
    navigate(feature.route);
  };

  const progressPercentage = (completedSteps.length / coreFeatures.length) * 100;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* 헤더 및 진행률 */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">우리 가족 마음 건강 관리</span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          24시간 AI + 실제 전문가와 함께하는
          <br />
          <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            단계별 케어 시스템
          </span>
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          간단한 관찰부터 시작해서 AI 분석을 거쳐 전문가 상담까지,
          <br />체계적이고 과학적인 마음 건강 관리를 경험하세요
        </p>

        {/* 진행률 표시 */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>진행 상황</span>
            <span>{completedSteps.length}/3 단계 완료</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      {/* 핵심 3단계 플로우 */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {coreFeatures.map((feature, index) => {
          const isCompleted = completedSteps.includes(feature.id);
          const isNext = !isCompleted && completedSteps.length === index;
          
          return (
            <Card 
              key={feature.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg group ${
                isCompleted ? 'ring-2 ring-primary/20 bg-primary/5' : 
                isNext ? 'ring-2 ring-primary/50 shadow-lg' : ''
              }`}
            >
              {/* 배경 그라데이션 */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
              
              {/* 완료 표시 */}
              {isCompleted && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.color} shadow-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge 
                      variant={feature.badge === 'FREE' ? 'secondary' : 'default'}
                      className={
                        feature.badge === 'FREE' ? 'bg-green-100 text-green-700' :
                        feature.badge === 'PREMIUM' ? 'bg-purple-100 text-purple-700' :
                        'bg-orange-100 text-orange-700'
                      }
                    >
                      {feature.badge}
                    </Badge>
                    {feature.price && (
                      <span className="text-xs text-muted-foreground">{feature.price}</span>
                    )}
                  </div>
                </div>
                
                <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {feature.subtitle}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed">{feature.description}</p>
                
                {/* 1단계 세부 옵션 표시 */}
                {feature.steps && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">포함된 서비스:</p>
                    <div className="grid gap-2">
                      {feature.steps.map((step, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="justify-start text-xs h-8 hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('🔥 Navigating to step:', step.path);
                            toast({
                              title: `${step.name} 시작!`,
                              description: "데이터를 쌓아서 더 정확한 분석을 받아보세요",
                            });
                            navigate(step.path);
                          }}
                        >
                          <div className="w-1 h-1 bg-primary rounded-full mr-2" />
                          {step.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 기존 특징 리스트 */}
                {!feature.steps && (
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* 조건부 요구사항 표시 */}
                {feature.requirement && (
                  <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700 font-medium">
                      ⚠️ {feature.requirement}
                    </p>
                  </div>
                )}

                <Button 
                  onClick={() => handleStartFeature(feature)}
                  className={`w-full mt-4 ${
                    isNext ? 'bg-primary hover:bg-primary/90' : ''
                  }`}
                  variant={isCompleted ? 'outline' : isNext ? 'default' : 'secondary'}
                >
                  {isCompleted ? '다시 이용하기' : feature.ctaText}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 사용자 여정 안내 */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">권장 이용 순서</h3>
              <p className="text-muted-foreground mb-4">
                최적의 결과를 위해 단계별로 진행하시는 것을 권장합니다
              </p>
              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant="outline" className="bg-white">1단계: 무료 관찰 체험 (관찰일지, 3분테스트, 프리미엄테스트)</Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground mt-1" />
                <Badge variant="outline" className="bg-white">2단계: AI 분석 확인 (데이터 3개 이상 축적 후)</Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground mt-1" />
                <Badge variant="outline" className="bg-white">3단계: 전문가 검증 및 상담 (AI 분석 완료 후)</Badge>
              </div>
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 font-medium">
                  💡 전문가 워크플로우: AI 분석 → 전문가 검증 → 맞춤 상담 → 지속 케어
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplifiedFlow;