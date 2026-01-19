import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Heart,
  Brain,
  Activity,
  Users,
  FileText,
  TrendingUp,
  Clock,
  Shield,
  Award,
  CheckCircle2
} from 'lucide-react';

const DevelopmentCenterLanding = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Activity,
      title: '전문적 발달 평가',
      description: 'AI 기반 발달 평가로 정확한 진단과 체계적인 기록 관리',
      color: 'text-blue-500'
    },
    {
      icon: Brain,
      title: '개별화 중재 계획',
      description: '아동별 맞춤 중재 계획 수립 및 진행 상황 자동 추적',
      color: 'text-purple-500'
    },
    {
      icon: FileText,
      title: '통합 리포트',
      description: '부모, 치료사, 전문가가 함께 보는 통합 발달 리포트',
      color: 'text-green-500'
    },
    {
      icon: Users,
      title: '협업 시스템',
      description: '다양한 전문가 간 원활한 정보 공유와 협업 지원',
      color: 'text-orange-500'
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: '효율적인 관리',
      description: '평가부터 리포팅까지 자동화로 업무 시간 60% 단축'
    },
    {
      icon: TrendingUp,
      title: '치료 효과 증대',
      description: 'AI 분석 기반 맞춤 중재로 치료 효과 극대화'
    },
    {
      icon: Shield,
      title: '전문성 강화',
      description: '체계적인 데이터 관리로 전문 센터로서의 신뢰도 향상'
    },
    {
      icon: Award,
      title: '객관적 증거',
      description: '데이터 기반 치료 효과 입증으로 보험 청구 용이'
    }
  ];

  const specializations = [
    {
      title: '언어 치료',
      description: '언어 발달 평가, 중재 계획, 진행 기록을 통합 관리',
      icon: '🗣️'
    },
    {
      title: '작업 치료',
      description: '미세/대근육 운동 발달 추적 및 감각 통합 치료 기록',
      icon: '✋'
    },
    {
      title: '행동 치료',
      description: 'ABA 데이터 수집, 행동 분석, 중재 전략 수립 지원',
      icon: '🎯'
    },
    {
      title: '발달 검사',
      description: '각종 발달 검사 기록 및 결과 분석, 추적 관찰',
      icon: '📊'
    }
  ];

  const pricing = {
    name: '발달센터 패키지',
    features: [
      '아동 등록 수 무제한',
      '무제한 AI 발달 분석',
      '전문가별 계정 제공',
      '부모 앱 연동',
      '자동 리포트 생성',
      '데이터 암호화 및 백업',
      '법적 문서 관리',
      '전담 기술 지원'
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/30">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            <Heart className="w-3 h-3 mr-1" />
            발달센터 전용 통합 관리 솔루션
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-brand-gradient mb-6">
            아동 발달,
            <br />
            과학적으로 관리하세요
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            평가부터 중재, 리포팅까지 AI가 도와드립니다.
            <br />
            전문가는 치료에만 집중하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/assessment')}
              className="text-lg px-8"
            >
              무료 시연 신청
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
              전문 센터를 위한 기능
            </h2>
            <p className="text-muted-foreground text-lg">
              치료사와 부모가 함께 사용하는 통합 시스템
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
              센터 운영이 달라집니다
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

      {/* Specializations Section */}
      <section className="container mx-auto px-4 py-16 bg-muted/30 rounded-3xl">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              모든 치료 영역 지원
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specializations.map((spec, index) => (
              <Card key={index} className="hover:shadow-lg transition-all text-center">
                <CardContent className="p-6">
                  <div className="text-5xl mb-4">{spec.icon}</div>
                  <h3 className="font-bold text-lg mb-3">{spec.title}</h3>
                  <p className="text-sm text-muted-foreground">{spec.description}</p>
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
              센터 규모별 맞춤 요금
            </h2>
            <p className="text-muted-foreground text-lg">
              합리적인 가격으로 전문 서비스 제공
            </p>
          </div>

          <Card className="border-primary border-2 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{pricing.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">문의</span>
                  <span className="text-muted-foreground ml-2">센터 규모별 견적</span>
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
                무료 시연 신청하기
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 rounded-3xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            전문 센터의 선택
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            이미 많은 발달센터가 사용 중입니다. 지금 무료 시연을 신청하세요.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/assessment')}
            className="text-lg px-12"
          >
            무료 시연 신청
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

export default DevelopmentCenterLanding;
