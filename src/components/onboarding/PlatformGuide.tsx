import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  ClipboardList, 
  MessageCircle, 
  ArrowRight, 
  X,
  CheckCircle,
  Play,
  Users,
  BarChart3,
  Heart,
  Sparkles
} from 'lucide-react';

interface GuideStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  image?: string;
  highlight: string;
}

const guideSteps: GuideStep[] = [
  {
    id: 1,
    title: "AI 맞춤형검사로 시작하세요",
    description: "3분만에 현재 심리상태를 정확히 파악할 수 있어요. 연령대별 맞춤 검사를 제공합니다.",
    icon: <Brain className="w-6 h-6" />,
    highlight: "3분 검사"
  },
  {
    id: 2,
    title: "일상을 관찰하고 기록하세요",
    description: "매일의 변화를 기록하면 AI가 패턴을 분석해서 맞춤 조언을 드려요.",
    icon: <ClipboardList className="w-6 h-6" />,
    highlight: "AI 패턴 분석"
  },
  {
    id: 3,
    title: "AI 상담으로 깊이 있는 대화를",
    description: "24시간 언제든지 AI 전문가와 상담할 수 있어요. 축적된 데이터로 더 정확한 상담이 가능합니다.",
    icon: <MessageCircle className="w-6 h-6" />,
    highlight: "24시간 상담"
  },
  {
    id: 4,
    title: "전문가 연결과 종합 리포팅",
    description: "필요시 실제 전문가와 연결되고, 모든 데이터를 종합한 전문 리포트를 받을 수 있어요.",
    icon: <Users className="w-6 h-6" />,
    highlight: "전문가 연결"
  }
];

interface PlatformGuideProps {
  onComplete: () => void;
}

export function PlatformGuide({ onComplete }: PlatformGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenGuide, setHasSeenGuide] = useState(false);

  useEffect(() => {
    // 가이드를 본 적이 있는지 확인
    const seenGuide = localStorage.getItem('platform_guide_seen');
    const hiddenToday = localStorage.getItem('platform_guide_hidden_today');
    
    if (!seenGuide && !hiddenToday) {
      // 1초 후에 가이드 표시 (페이지 로드 후 자연스럽게)
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
    setHasSeenGuide(true);
  }, []);

  const handleNext = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('platform_guide_seen', 'true');
    setIsOpen(false);
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleHideToday = () => {
    // 오늘 날짜로 숨김 설정 (자정까지 유효)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    localStorage.setItem('platform_guide_hidden_today', tomorrow.getTime().toString());
    setIsOpen(false);
    onComplete();
  };

  // 이미 본 사용자이거나 팝업이 열려있지 않으면 렌더링하지 않음
  if (hasSeenGuide || !isOpen) return null;

  const currentGuideStep = guideSteps[currentStep];
  const progressPercentage = ((currentStep + 1) / guideSteps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="absolute right-0 top-0 h-8 w-8 p-0 z-10"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Header */}
          <div className="text-center mb-6 pt-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              HIGHLIGHT PRO 둘러보기
            </h2>
            <p className="text-muted-foreground text-sm">
              1분만에 AI 맞춤형검사 플랫폼을 이해해보세요
            </p>
            
            {/* Progress Bar */}
            <div className="mt-4 px-4">
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>단계 {currentStep + 1}</span>
                <span>{guideSteps.length}단계 중</span>
              </div>
            </div>
          </div>

          {/* Current Step Content */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary-glow/10">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  {currentGuideStep.icon}
                </div>
                <div className="flex-1">
                  <Badge variant="secondary" className="mb-2">
                    {currentGuideStep.highlight}
                  </Badge>
                  <CardTitle className="text-xl">{currentGuideStep.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {currentGuideStep.description}
              </p>

              {/* Visual Guide based on step */}
              <div className="bg-white/50 rounded-lg p-4 mb-6">
                {currentStep === 0 && (
                  <div className="text-center">
                    <Brain className="w-16 h-16 text-primary mx-auto mb-3" />
                    <div className="text-sm text-muted-foreground">
                      "내 마음은 지금 어떤 상태일까?" <br />
                      간단한 질문으로 시작해보세요
                    </div>
                  </div>
                )}
                {currentStep === 1 && (
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-primary mx-auto mb-3" />
                    <div className="text-sm text-muted-foreground">
                      매일의 기록이 쌓이면 <br />
                      AI가 패턴을 발견해드려요
                    </div>
                  </div>
                )}
                {currentStep === 2 && (
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-primary mx-auto mb-3" />
                    <div className="text-sm text-muted-foreground">
                      언제든지 편안하게 <br />
                      AI 전문가와 대화하세요
                    </div>
                  </div>
                )}
                {currentStep === 3 && (
                  <div className="text-center">
                    <Heart className="w-16 h-16 text-primary mx-auto mb-3" />
                    <div className="text-sm text-muted-foreground">
                      더 깊은 도움이 필요하면 <br />
                      실제 전문가를 연결해드려요
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step Indicators */}
          <div className="flex justify-center mb-6 mt-4">
            <div className="flex items-center space-x-2">
              {guideSteps.map((_, index) => (
                <div 
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index <= currentStep 
                      ? 'bg-primary' 
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button 
              variant="ghost" 
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="opacity-50 disabled:opacity-25"
            >
              이전
            </Button>
            
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">
                약 {Math.max(1, guideSteps.length - currentStep)}분 남음
              </div>
              <div className="flex flex-col gap-1">
                <Button variant="ghost" onClick={handleSkip} className="text-xs">
                  건너뛰기
                </Button>
                <Button variant="ghost" onClick={handleHideToday} className="text-xs text-muted-foreground">
                  오늘 다시 보지 않기
                </Button>
              </div>
            </div>

            <Button onClick={handleNext} className="min-w-[100px]">
              {currentStep === guideSteps.length - 1 ? (
                <>
                  시작하기
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  다음
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}