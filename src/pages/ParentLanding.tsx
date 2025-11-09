import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Brain, 
  Video, 
  MessageSquare, 
  FileText, 
  Award,
  TrendingUp,
  Shield,
  Clock,
  Users
} from 'lucide-react';

const ParentLanding = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Video,
      title: '간편한 영상 관찰 기록',
      description: '아이의 일상을 영상으로 촬영하고, 음성으로 간편하게 메모하세요',
      color: 'text-blue-500'
    },
    {
      icon: Brain,
      title: 'AI 발달 분석',
      description: '전문가 수준의 AI가 아이의 발달 상태를 실시간으로 분석합니다',
      color: 'text-purple-500'
    },
    {
      icon: MessageSquare,
      title: '전문가 상담 연결',
      description: '필요시 발달 전문가와 즉시 연결하여 상담받을 수 있습니다',
      color: 'text-green-500'
    },
    {
      icon: FileText,
      title: '발달 리포트 생성',
      description: '주기적으로 아이의 발달 리포트를 자동 생성하여 제공합니다',
      color: 'text-orange-500'
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: '시간 절약',
      description: '병원 방문 전 사전 관찰로 진료 시간 단축'
    },
    {
      icon: Shield,
      title: '안전한 보관',
      description: '아이의 모든 발달 기록을 안전하게 보관'
    },
    {
      icon: TrendingUp,
      title: '성장 추적',
      description: '시간에 따른 발달 변화를 한눈에 확인'
    },
    {
      icon: Users,
      title: '가족 공유',
      description: '가족 구성원과 함께 아이의 성장 공유'
    }
  ];

  const pricing = [
    {
      name: '무료 체험',
      price: '무료',
      period: '14일',
      features: [
        '월 5회 AI 분석',
        '기본 발달 리포트',
        '영상 저장 최대 10개',
        '커뮤니티 이용'
      ],
      cta: '무료로 시작하기',
      popular: false
    },
    {
      name: '프리미엄',
      price: '₩29,000',
      period: '월',
      features: [
        '무제한 AI 분석',
        '상세 발달 리포트',
        '무제한 영상 저장',
        '전문가 상담 월 2회',
        '우선 지원'
      ],
      cta: '프리미엄 시작',
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/30">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            <Heart className="w-3 h-3 mr-1" />
            부모를 위한 AI 발달 관찰 서비스
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-brand-gradient mb-6">
            우리 아이의 성장,
            <br />
            AI가 함께합니다
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            일상 속 관찰을 전문가 수준의 분석으로. 
            아이의 발달 과정을 체계적으로 기록하고 분석하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/pmf-onboarding')}
              className="text-lg px-8"
            >
              14일 무료 체험 시작
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/demo')}
              className="text-lg px-8"
            >
              데모 보기
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 bg-background/50 rounded-3xl my-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              이렇게 사용하세요
            </h2>
            <p className="text-muted-foreground text-lg">
              복잡한 절차 없이, 간단하게 시작하세요
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-all">
                <CardContent className="p-6">
                  <feature.icon className={`w-12 h-12 mb-4 ${feature.color}`} />
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              왜 선택해야 할까요?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <benefit.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              합리적인 가격
            </h2>
            <p className="text-muted-foreground text-lg">
              먼저 무료로 체험해보세요
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricing.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${plan.popular ? 'border-primary border-2 shadow-xl' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      <Award className="w-4 h-4 mr-1" />
                      인기
                    </Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground ml-2">/ {plan.period}</span>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-1">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => navigate('/pmf-onboarding')}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 rounded-3xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            14일 무료 체험으로 우리 아이의 성장을 체계적으로 기록해보세요
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/pmf-onboarding')}
            className="text-lg px-12"
          >
            무료로 시작하기
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground border-t">
        <p>© 2024 AI Development Observer. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ParentLanding;
