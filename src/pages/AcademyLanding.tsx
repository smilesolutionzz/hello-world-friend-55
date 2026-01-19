import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap,
  Users,
  BarChart3,
  Brain,
  FileText,
  TrendingUp,
  Clock,
  Shield,
  Star,
  CheckCircle2
} from 'lucide-react';

const AcademyLanding = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: '학생 맞춤 관리',
      description: '개별 학생의 학습 패턴과 행동을 체계적으로 기록하고 분석합니다',
      color: 'text-blue-500'
    },
    {
      icon: Brain,
      title: 'AI 학습 분석',
      description: '학생별 강점과 약점을 AI가 자동으로 분석하여 맞춤 학습 전략을 제안합니다',
      color: 'text-purple-500'
    },
    {
      icon: FileText,
      title: '학부모 리포트',
      description: '학습 진도와 행동 관찰을 정기적으로 학부모에게 자동 전송합니다',
      color: 'text-green-500'
    },
    {
      icon: BarChart3,
      title: '성과 추적',
      description: '학생들의 학습 성과를 시각화하여 한눈에 확인할 수 있습니다',
      color: 'text-orange-500'
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: '업무 시간 50% 절감',
      description: '자동화된 기록 시스템으로 행정 업무 대폭 감소'
    },
    {
      icon: TrendingUp,
      title: '학생 성과 향상',
      description: 'AI 분석 기반 맞춤 지도로 학습 효율 극대화'
    },
    {
      icon: Shield,
      title: '학부모 신뢰 강화',
      description: '투명한 리포팅으로 학원에 대한 신뢰도 향상'
    },
    {
      icon: Star,
      title: '차별화된 서비스',
      description: 'AI 기술로 경쟁 학원과 확실한 차별화'
    }
  ];

  const useCases = [
    {
      title: '영어학원',
      description: '학생별 발음, 어휘력, 독해력을 AI가 분석하여 맞춤 커리큘럼 제공',
      stats: '학습 효율 35% 향상'
    },
    {
      title: '수학학원',
      description: '문제 풀이 패턴 분석으로 취약 개념 자동 파악 및 보완 학습',
      stats: '성적 향상률 40% 증가'
    },
    {
      title: '종합학원',
      description: '과목별 학습 관리와 학습 태도 분석으로 종합적인 학생 케어',
      stats: '학부모 만족도 95%'
    }
  ];

  const pricing = {
    name: '학원 패키지',
    features: [
      '학생 수 무제한',
      '무제한 AI 분석',
      '자동 학부모 리포트',
      '강사 계정 최대 10개',
      '데이터 보안 및 백업',
      '전용 관리자 대시보드',
      '전화/이메일 기술 지원'
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/30">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            <GraduationCap className="w-3 h-3 mr-1" />
            학원 전용 AI 학습 관리 솔루션
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-brand-gradient mb-6">
            학원 운영의 새로운 기준,
            <br />
            AI가 만듭니다
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            학생 관리부터 학부모 소통까지, AI가 자동화합니다.
            <br />
            더 많은 시간을 학생 지도에 집중하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/assessment')}
              className="text-lg px-8"
            >
              무료 상담 신청
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/demo')}
              className="text-lg px-8"
            >
              데모 체험하기
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 bg-background/50 rounded-3xl my-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              학원에 필요한 모든 기능
            </h2>
            <p className="text-muted-foreground text-lg">
              복잡한 설정 없이 바로 사용 가능합니다
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
              학원이 달라집니다
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <benefit.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold mb-2 text-lg">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="container mx-auto px-4 py-16 bg-muted/30 rounded-3xl">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              이런 학원에 딱입니다
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <Card key={index} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-3">{useCase.title}</h3>
                  <p className="text-muted-foreground mb-4">{useCase.description}</p>
                  <div className="bg-primary/10 rounded-lg p-3 text-center">
                    <p className="text-primary font-bold">{useCase.stats}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              투명한 가격
            </h2>
            <p className="text-muted-foreground text-lg">
              학원 규모에 맞는 합리적인 요금제
            </p>
          </div>

          <Card className="border-primary border-2 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{pricing.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">문의</span>
                  <span className="text-muted-foreground ml-2">학원 규모별 견적</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {pricing.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-1 w-5 h-5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full"
                size="lg"
                onClick={() => navigate('/assessment')}
              >
                무료 상담 신청하기
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 rounded-3xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            무료 상담으로 우리 학원에 맞는 솔루션을 확인해보세요
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/assessment')}
            className="text-lg px-12"
          >
            무료 상담 신청
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

export default AcademyLanding;
