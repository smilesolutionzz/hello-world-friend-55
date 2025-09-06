import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  Brain, 
  ClipboardList, 
  MessageCircle, 
  ArrowRight, 
  X,
  CheckCircle,
  Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthGuard } from '@/hooks/useAuthGuard';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  route: string;
  badge?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'assessment',
    title: '첫 번째: 나를 알아보기',
    description: '간단한 심리검사로 현재 상태를 파악해보세요. 3-5분이면 완료됩니다.',
    icon: <Brain className="w-6 h-6" />,
    action: '검사 시작하기',
    route: '/assessment',
    badge: '3분 소요'
  },
  {
    id: 'observation',
    title: '두 번째: 일상 관찰하기',
    description: '검사 결과를 바탕으로 일상에서 관찰되는 패턴을 기록해보세요.',
    icon: <ClipboardList className="w-6 h-6" />,
    action: '관찰일지 작성',
    route: '/observation',
    badge: '언제든지'
  },
  {
    id: 'ai_counseling',
    title: '세 번째: AI와 대화하기',
    description: '수집된 데이터를 바탕으로 AI 전문가와 상담해보세요.',
    icon: <MessageCircle className="w-6 h-6" />,
    action: 'AI 상담 시작',
    route: '/ai-counselor',
    badge: '24시간'
  }
];

interface OnboardingGuideProps {
  onComplete: () => void;
}

export function OnboardingGuide({ onComplete }: OnboardingGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuthGuard();

  useEffect(() => {
    checkIfShouldShowOnboarding();
  }, [user]);

  const checkIfShouldShowOnboarding = async () => {
    if (!user) return;

    try {
      // 사용자가 이미 온보딩을 완료했는지 확인
      const onboardingCompleted = localStorage.getItem(`onboarding_completed_${user.id}`);
      
      if (onboardingCompleted) {
        return;
      }

      // 사용자가 이미 어떤 활동을 했는지 확인
      const [assessments, observations, chatRooms] = await Promise.all([
        supabase.from('assessments').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('observation_logs').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('chat_rooms').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
      ]);

      const hasActivity = (assessments.count || 0) > 0 || 
                         (observations.count || 0) > 0 || 
                         (chatRooms.count || 0) > 0;

      // 활동이 없는 새 사용자에게만 온보딩 표시
      if (!hasActivity) {
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const handleStepAction = (step: OnboardingStep) => {
    navigate(step.route);
    handleComplete();
  };

  const handleComplete = () => {
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    }
    setIsOpen(false);
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="absolute right-0 top-0 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Header */}
          <div className="text-center mb-8 pt-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Play className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              HIGHLIGHT PRO와 함께 시작해보세요
            </h2>
            <p className="text-muted-foreground">
              3단계로 나만의 심리건강 여정을 시작할 수 있어요
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2">
              {onboardingSteps.map((_, index) => (
                <React.Fragment key={index}>
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                      ${index <= currentStep 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < onboardingSteps.length - 1 && (
                    <div 
                      className={`w-8 h-0.5 ${
                        index < currentStep ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {onboardingSteps.map((step, index) => (
              <Card 
                key={step.id}
                className={`relative transition-all ${
                  index === currentStep 
                    ? 'ring-2 ring-primary shadow-lg' 
                    : 'hover:shadow-md'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      {step.icon}
                    </div>
                    {step.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {step.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4">
                    {step.description}
                  </p>
                  <Button
                    onClick={() => handleStepAction(step)}
                    className="w-full"
                    variant={index === currentStep ? "default" : "outline"}
                  >
                    {step.action}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              💡 언제든지 순서에 상관없이 이용하실 수 있어요
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleSkip}>
                건너뛰기
              </Button>
              <Button onClick={() => handleStepAction(onboardingSteps[0])}>
                시작하기
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}