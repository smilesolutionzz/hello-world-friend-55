import React from 'react';
import { Heart, Users, Brain, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface EmotionalJourneyFunnelProps {
  stage: 'discovery' | 'understanding' | 'connection' | 'healing';
  className?: string;
}

const EmotionalJourneyFunnel: React.FC<EmotionalJourneyFunnelProps> = ({ stage, className = '' }) => {
  const journeyStages = {
    discovery: {
      icon: Heart,
      title: "마음의 여정 시작",
      message: "전문적인 분석과 과학적 접근을 통해 당신을 이해합니다.",
      subMessage: "정확한 데이터 기반의 맞춤형 솔루션을 제공합니다.",
      bgGradient: "from-rose-50 to-pink-50",
      iconColor: "text-rose-500"
    },
    understanding: {
      icon: Brain,
      title: "데이터로 마음을 읽다",
      message: "AI와 과학적 분석을 통해 당신의 내면을 이해합니다.",
      subMessage: "숨겨진 패턴과 감정을 객관적으로 발견하고 분석합니다.",
      bgGradient: "from-blue-50 to-indigo-50",
      iconColor: "text-blue-500"
    },
    connection: {
      icon: Users,
      title: "전문가가 스며들다",
      message: "20년 경력의 전문가들이 당신의 마음에 천천히 스며듭니다.",
      subMessage: "판단하지 않고, 온전히 공감하며 함께 걸어갑니다.",
      bgGradient: "from-green-50 to-emerald-50",
      iconColor: "text-green-500"
    },
    healing: {
      icon: Shield,
      title: "위로와 치유의 시간",
      message: "혼자가 아니라는 걸 느끼는 순간, 치유가 시작됩니다.",
      subMessage: "당신의 마음이 다시 따뜻해질 때까지 함께 하겠습니다.",
      bgGradient: "from-purple-50 to-violet-50",
      iconColor: "text-purple-500"
    }
  };

  const currentStage = journeyStages[stage];
  const Icon = currentStage.icon;

  return (
    <Card className={`border-0 shadow-lg ${className}`}>
      <CardContent className={`p-8 bg-gradient-to-br ${currentStage.bgGradient} rounded-lg`}>
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className={`p-4 rounded-full bg-white/80 ${currentStage.iconColor}`}>
              <Icon size={32} />
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-gray-800">
              {currentStage.title}
            </h3>
            
            <p className="text-lg text-gray-700 leading-relaxed font-medium">
              {currentStage.message}
            </p>
            
            <p className="text-base text-gray-600 leading-relaxed">
              {currentStage.subMessage}
            </p>
          </div>
          
          <div className="flex justify-center pt-4">
            <div className="flex space-x-2">
              {Object.keys(journeyStages).map((stageKey, index) => (
                <div
                  key={stageKey}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    stageKey === stage 
                      ? 'bg-gray-800' 
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmotionalJourneyFunnel;