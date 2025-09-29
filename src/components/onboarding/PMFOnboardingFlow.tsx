import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight, Sparkles, Heart, Brain, Target, Clock, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface PMFOnboardingFlowProps {
  onComplete: (data: any) => void;
}

const PMFOnboardingFlow: React.FC<PMFOnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    mainConcern: '',
    targetPerson: '',
    experience: '',
    motivation: ''
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const steps = [
    {
      id: 'welcome',
      title: '🎯 3분만에 AI 심리분석 체험하기',
      subtitle: '지금 바로 무료로 시작해보세요',
      progress: 25
    },
    {
      id: 'concern',
      title: '가장 걱정되는 부분은?',
      subtitle: '한 가지만 선택해주세요',
      progress: 50
    },
    {
      id: 'target',
      title: '누구를 위한 분석인가요?',
      subtitle: '관찰 대상을 선택해주세요',
      progress: 75
    },
    {
      id: 'preview',
      title: '🎉 무료 체험 시작!',
      subtitle: '지금 바로 관찰일지를 작성해보세요',
      progress: 100
    }
  ];

  const concerns = [
    { id: 'development', label: '발달 지연', icon: Brain, color: 'bg-blue-500' },
    { id: 'behavior', label: '행동 문제', icon: Target, color: 'bg-green-500' },
    { id: 'emotion', label: '감정 조절', icon: Heart, color: 'bg-red-500' },
    { id: 'social', label: '사회성', icon: Sparkles, color: 'bg-purple-500' }
  ];

  const targets = [
    { id: 'child', label: '우리 아이 (0-12세)', description: '발달 관찰에 특화' },
    { id: 'teen', label: '청소년 (13-18세)', description: '정서 분석에 특화' },
    { id: 'adult', label: '성인 (본인)', description: '심리상태 분석' },
    { id: 'family', label: '가족 전체', description: '관계 역학 분석' }
  ];

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      // 무료 체험 시작
      localStorage.setItem('pmf_onboarding_data', JSON.stringify(userData));
      localStorage.setItem('free_trial_started', 'true');
      
      toast({
        title: "🎉 무료 체험 시작!",
        description: "지금 바로 관찰일지를 작성해보세요",
      });
      
      onComplete(userData);
      navigate('/observation');
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true;
      case 1: return userData.mainConcern !== '';
      case 2: return userData.targetPerson !== '';
      case 3: return true;
      default: return false;
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              PMF 검증 체험
            </Badge>
            <Badge variant="outline" className="text-xs">
              {currentStep + 1}/{steps.length}
            </Badge>
          </div>
          
          <Progress value={currentStepData.progress} className="w-full h-2" />
          
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-foreground">
              {currentStepData.title}
            </CardTitle>
            <p className="text-muted-foreground text-lg">
              {currentStepData.subtitle}
            </p>
          </div>

          {currentStep === 0 && (
            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>3분 소요</span>
              </div>
              <div className="flex items-center space-x-1">
                <Gift className="w-4 h-4" />
                <span>완전 무료</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>회원가입 불필요</span>
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 0: Welcome */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-medium">1. 간단 관찰</h3>
                  <p className="text-sm text-muted-foreground">30초 관찰 체험</p>
                </div>
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-medium">2. AI 분석</h3>
                  <p className="text-sm text-muted-foreground">즉시 결과 확인</p>
                </div>
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-medium">3. 맞춤 솔루션</h3>
                  <p className="text-sm text-muted-foreground">개인화된 가이드</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Main Concern */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {concerns.map((concern) => (
                <Card
                  key={concern.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    userData.mainConcern === concern.id
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setUserData(prev => ({ ...prev, mainConcern: concern.id }))}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${concern.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <concern.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-medium text-lg">{concern.label}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Step 2: Target Person */}
          {currentStep === 2 && (
            <div className="space-y-3">
              {targets.map((target) => (
                <Card
                  key={target.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    userData.targetPerson === target.id
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setUserData(prev => ({ ...prev, targetPerson: target.id }))}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-lg">{target.label}</h3>
                      <p className="text-sm text-muted-foreground">{target.description}</p>
                    </div>
                    {userData.targetPerson === target.id && (
                      <CheckCircle className="w-6 h-6 text-primary" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Step 3: Preview */}
          {currentStep === 3 && (
            <div className="space-y-6 text-center">
              <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                <h3 className="text-xl font-bold mb-2">🎯 맞춤 분석 준비 완료!</h3>
                <p className="text-muted-foreground mb-4">
                  {userData.mainConcern === 'development' && '발달 관찰'}
                  {userData.mainConcern === 'behavior' && '행동 패턴 분석'}
                  {userData.mainConcern === 'emotion' && '감정 상태 분석'}
                  {userData.mainConcern === 'social' && '사회성 발달 분석'}
                  에 특화된 관찰일지가 준비되었습니다.
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <span className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>무료 AI 분석 1회</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>맞춤 개선 가이드</span>
                  </span>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  💡 <strong>체험 팁:</strong> 간단한 일상 행동도 괜찮습니다. 
                  "놀이시간에 혼자 노는 모습을 10분간 관찰" 정도로 시작해보세요!
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              이전
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center space-x-2"
              size="lg"
            >
              <span>
                {currentStep === steps.length - 1 ? '🚀 무료 체험 시작하기' : '다음'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PMFOnboardingFlow;