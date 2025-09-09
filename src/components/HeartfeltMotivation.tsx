import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Sparkles } from 'lucide-react';

interface HeartfeltMotivationProps {
  variant?: 'gentle' | 'hopeful' | 'understanding';
  className?: string;
}

const HeartfeltMotivation: React.FC<HeartfeltMotivationProps> = ({ 
  variant = 'gentle', 
  className = '' 
}) => {
  const messages = {
    gentle: {
      title: "마음 깊은 곳의 이야기",
      main: "사람들은 언제나 슬퍼하는 마음을 한 공간에 숨겨두고 있습니다.",
      sub: "그 마음을 조용히 꺼내어, 우리가 함께 들여다보겠습니다.",
      icon: Heart,
      gradient: "from-rose-100 via-pink-50 to-white",
      iconColor: "text-rose-500"
    },
    hopeful: {
      title: "데이터가 전하는 따뜻함",
      main: "과학적 분석을 통해 발견된 당신의 마음",
      sub: "전문가가 천천히 스며들어 공감하고 위로해드립니다.",
      icon: Sparkles,
      gradient: "from-blue-100 via-sky-50 to-white",
      iconColor: "text-blue-500"
    },
    understanding: {
      title: "전문가 네트워크",
      main: "검증된 전문가들이 과학적 데이터를 바탕으로 도움을 드립니다.",
      sub: "체계적인 분석과 맞춤형 솔루션으로 실질적인 변화를 만들어갑니다.",
      icon: Heart,
      gradient: "from-green-100 via-emerald-50 to-white",
      iconColor: "text-green-500"
    }
  };

  const currentMessage = messages[variant];
  const Icon = currentMessage.icon;

  return (
    <Card className={`border-0 shadow-md ${className}`}>
      <CardContent className={`p-6 bg-gradient-to-br ${currentMessage.gradient}`}>
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className={`p-3 rounded-full bg-white/80 ${currentMessage.iconColor}`}>
              <Icon size={24} />
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-gray-800">
              {currentMessage.title}
            </h4>
            
            <p className="text-base text-gray-700 leading-relaxed">
              {currentMessage.main}
            </p>
            
            <p className="text-sm text-gray-600 leading-relaxed">
              {currentMessage.sub}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeartfeltMotivation;