import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Heart, 
  Shield, 
  Clock, 
  Users, 
  Sparkles,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface ValuePropositionProps {
  onStartTrial: () => void;
}

const ValueProposition: React.FC<ValuePropositionProps> = ({ onStartTrial }) => {
  const features = [
    {
      icon: Brain,
      title: "AI 심리 분석",
      description: "10년 경력 전문가 수준의 정밀 분석",
      color: "text-blue-600"
    },
    {
      icon: Clock,
      title: "3분 만에 결과",
      description: "긴 검사 없이 빠른 인사이트 제공", 
      color: "text-green-600"
    },
    {
      icon: Shield,
      title: "개인정보 보호",
      description: "익명 분석으로 안전한 상담 환경",
      color: "text-purple-600"
    },
    {
      icon: Users,
      title: "전문가 연결",
      description: "필요시 검증된 전문가와 1:1 상담",
      color: "text-orange-600"
    }
  ];

  const testimonials = [
    {
      name: "김○○ (35세, 7세 아들 엄마)",
      content: "아이 행동이 걱정됐는데, 3분 만에 전문적인 분석을 받을 수 있어서 놀랐어요.",
      rating: 5
    },
    {
      name: "박○○ (28세, 직장인)",
      content: "스트레스가 심했는데 내 성향을 정확히 파악하고 맞춤 솔루션까지 받았어요.",
      rating: 5
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2">
          <Sparkles className="h-4 w-4 mr-2" />
          한국 최초 AI 심리 분석 플랫폼
        </Badge>
        
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          24시간 AI 심리전문가와<br />
          함께하는 마음 건강 관리
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          복잡한 심리검사 대신 3분 간단 관찰로<br />
          전문가 수준의 분석과 맞춤 솔루션을 받아보세요
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            onClick={onStartTrial} 
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 lg:px-8 lg:py-4 text-sm lg:text-lg w-full sm:w-auto"
          >
            <Heart className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
            무료로 체험하기
            <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5 ml-2" />
          </Button>
          <div className="text-xs lg:text-sm text-muted-foreground text-center">
            ✨ 회원가입 없이 바로 체험 | 💳 결제 정보 불필요
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <feature.icon className={`h-12 w-12 ${feature.color} mx-auto mb-4`} />
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How it works */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-center mb-8">이렇게 간단해요</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: 1, title: "3분 관찰 기록", desc: "일상 속 행동이나 감정을 간단히 적어주세요" },
            { step: 2, title: "AI 분석 완료", desc: "전문가 수준의 정밀 분석이 자동으로 진행됩니다" },
            { step: 3, title: "맞춤 솔루션", desc: "개인별 특성에 맞는 구체적인 개선방안을 제공합니다" }
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Testimonials */}
      <div className="text-center space-y-6">
        <h2 className="text-2xl font-bold">이미 2,000명이 경험했어요</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <CheckCircle key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-3">"{testimonial.content}"</p>
              <p className="text-sm font-medium">- {testimonial.name}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">
            지금 바로 무료로 시작해보세요
          </h2>
          <p className="text-muted-foreground mb-6">
            첫 번째 분석은 완전 무료입니다. 마음에 들지 않으면 언제든 중단하실 수 있어요.
          </p>
          <Button 
            size="lg" 
            onClick={onStartTrial} 
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white w-full sm:w-auto"
          >
            무료 체험 시작하기
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ValueProposition;