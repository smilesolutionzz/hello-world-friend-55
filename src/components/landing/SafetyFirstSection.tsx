import { Shield, CheckCircle, AlertCircle, Users, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const SafetyFirstSection = () => {
  const safetyPrinciples = [
    {
      icon: Shield,
      title: '해를 끼치지 않는다',
      subtitle: 'Do No Harm',
      description: '의료 윤리의 핵심 원칙을 AI 심리 상담에 적용합니다',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: AlertCircle,
      title: '다층 위기 감지',
      subtitle: 'Multi-level Crisis Detection',
      description: '4단계 위험도 평가로 즉각적인 전문가 개입이 필요한 상황을 식별합니다',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      icon: Users,
      title: '전문가 검증 시스템',
      subtitle: 'Expert Verification',
      description: '모든 전문가는 자격증 검증 및 정기 성과 평가를 거칩니다',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const trustMetrics = [
    {
      value: '99.2%',
      label: '안전성 점수',
      description: 'AI 위기 감지 정확도'
    },
    {
      value: '24/7',
      label: '실시간 모니터링',
      description: '위험 상황 즉시 대응'
    },
    {
      value: '100+',
      label: '검증된 전문가',
      description: '면허 보유 상담사'
    },
    {
      value: '15분',
      label: '평균 응답 시간',
      description: '긴급 상황 전문가 연결'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4">
        {/* Main Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            <Shield className="w-4 h-4" />
            한국형 Hippocratic AI
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            안전이 최우선입니다
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            발달심리·사회복지·의료 분야의 신뢰받는 AI 플랫폼으로,<br />
            Hippocratic AI의 안전 원칙을 한국 문화에 맞게 적용합니다
          </p>
        </div>

        {/* Safety Principles */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {safetyPrinciples.map((principle, index) => {
            const Icon = principle.icon;
            return (
              <Card key={index} className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className={`${principle.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}>
                    <Icon className={`w-8 h-8 ${principle.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{principle.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 font-mono">{principle.subtitle}</p>
                  <p className="text-gray-600 leading-relaxed">{principle.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trust Metrics */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <Award className="w-6 h-6 text-yellow-500" />
            <h3 className="text-2xl font-bold text-center">검증된 성과 지표</h3>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {trustMetrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {metric.value}
                </div>
                <div className="text-lg font-semibold text-gray-800 mb-1">
                  {metric.label}
                </div>
                <div className="text-sm text-gray-500">
                  {metric.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certification Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col md:flex-row items-center gap-6 bg-gradient-to-r from-blue-50 to-purple-50 px-8 py-6 rounded-2xl">
            <CheckCircle className="w-12 h-12 text-green-600" />
            <div className="text-left">
              <p className="text-lg font-semibold text-gray-800 mb-1">
                보건복지부 인증 심리상담 플랫폼 준비 중
              </p>
              <p className="text-sm text-gray-600">
                국가 인증 기준에 부합하는 안전 시스템 구축
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SafetyFirstSection;
