import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Brain, Users } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const LoadingCompassion: React.FC = () => {
  const [currentStep, setCurrentStep] = React.useState(0);

  const steps = [
    {
      icon: Heart,
      title: "마음을 꺼내는 중...",
      message: "숨겨진 감정들을 조용히 살펴보고 있습니다",
      color: "text-rose-500"
    },
    {
      icon: Brain,
      title: "데이터로 이해하는 중...",
      message: "AI가 당신의 마음의 패턴을 분석하고 있습니다",
      color: "text-blue-500"
    },
    {
      icon: Users,
      title: "전문가가 스며드는 중...",
      message: "20년 경력 전문가들이 공감의 마음으로 준비 중입니다",
      color: "text-green-500"
    }
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <Card className="border-0 shadow-lg max-w-md mx-auto">
      <CardContent className="p-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className={`p-4 rounded-full bg-white shadow-md ${currentStepData.color}`}>
              <Icon size={32} />
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-800">
              {currentStepData.title}
            </h3>
            
            <p className="text-gray-600 leading-relaxed">
              {currentStepData.message}
            </p>
          </div>
          
          <div className="flex justify-center">
            <LoadingSpinner className="w-8 h-8" />
          </div>
          
          <div className="pt-4 text-sm text-gray-500 italic">
            "사람들은 언제나 슬퍼하는 마음을 한 공간에 숨겨두고 있다..."
          </div>
          
          <div className="flex justify-center space-x-2 pt-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-gray-800' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingCompassion;