import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Baby,
  Camera,
  MessageCircle,
  FileText,
  Users,
  Heart,
  Clock,
  Shield,
  Star,
  CheckCircle2,
  Smile
} from 'lucide-react';

const DaycareLanding = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Camera,
      title: '간편 사진/영상 기록',
      description: '아이의 일상을 사진과 영상으로 쉽게 기록하고 부모에게 전송',
      color: 'text-blue-500'
    },
    {
      icon: MessageCircle,
      title: '실시간 부모 소통',
      description: '알림장, 메시지로 부모와 실시간 소통하여 신뢰 강화',
      color: 'text-purple-500'
    },
    {
      icon: FileText,
      title: 'AI 발달 관찰',
      description: '아이의 발달 상황을 AI가 분석하여 자동으로 리포트 생성',
      color: 'text-green-500'
    },
    {
      icon: Users,
      title: '반별 관리',
      description: '여러 반을 효율적으로 관리하고 선생님별 권한 설정',
      color: 'text-orange-500'
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: '업무 시간 단축',
      description: '알림장 작성 시간 70% 절감, 더 많은 시간을 아이들과'
    },
    {
      icon: Heart,
      title: '부모 만족도 UP',
      description: '실시간 사진/영상 공유로 부모 만족도 대폭 향상'
    },
    {
      icon: Shield,
      title: '안전한 관리',
      description: '모든 데이터 암호화 및 안전한 백업으로 안심'
    },
    {
      icon: Star,
      title: '원아 모집 증가',
      description: 'IT 시스템 도입으로 신뢰도 상승, 원아 모집 효과'
    }
  ];

  const useCases = [
    {
      title: '어린이집',
      description: '영유아 관찰 기록과 부모 소통을 한 곳에서 관리',
      stats: '부모 만족도 98%',
      icon: Baby
    },
    {
      title: '유치원',
      description: '활동 사진 자동 분류 및 학부모 앱 전송으로 편리',
      stats: '업무 시간 70% 감소',
      icon: Smile
    },
    {
      title: '놀이학교',
      description: '개별 아동 발달 추적으로 차별화된 교육 서비스',
      stats: '재등록률 95%',
      icon: Heart
    }
  ];

  const pricing = {
    name: '유치원/어린이집 패키지',
    features: [
      '원아 수 무제한',
      '선생님 계정 무제한',
      '부모 앱 자동 연동',
      '무제한 사진/영상 저장',
      '자동 알림장 생성',
      'AI 발달 리포트',
      '데이터 안전 백업',
      '전화/카카오톡 지원'
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/30">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            <Baby className="w-3 h-3 mr-1" />
            유치원/어린이집 전용 스마트 관리 시스템
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-brand-gradient mb-6">
            아이들에게 집중하세요,
            <br />
            나머지는 AI가 합니다
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            알림장 작성부터 부모 소통까지 자동화로 해결!
            <br />
            선생님은 아이들과 더 많은 시간을 보내세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/pmf-onboarding')}
              className="text-lg px-8"
            >
              무료 체험 신청
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
              원 운영에 필요한 모든 기능
            </h2>
            <p className="text-muted-foreground text-lg">
              복잡한 설정 없이 오늘부터 바로 사용
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
              원 운영이 달라집니다
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
              이런 곳에서 사용 중
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <Card key={index} className="hover:shadow-lg transition-all">
                <CardContent className="p-6 text-center">
                  <useCase.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-bold text-xl mb-3">{useCase.title}</h3>
                  <p className="text-muted-foreground mb-4">{useCase.description}</p>
                  <div className="bg-primary/10 rounded-lg p-3">
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
              원 규모에 맞는 합리적인 요금제
            </p>
          </div>

          <Card className="border-primary border-2 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{pricing.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">문의</span>
                  <span className="text-muted-foreground ml-2">원 규모별 견적</span>
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
                onClick={() => navigate('/pmf-onboarding')}
              >
                무료 체험 신청하기
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
            30일 무료 체험으로 우리 원에 맞는 시스템을 확인해보세요
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/pmf-onboarding')}
            className="text-lg px-12"
          >
            30일 무료 체험
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

export default DaycareLanding;
