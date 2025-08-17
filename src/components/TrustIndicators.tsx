import { Award, Users, TrendingUp, Heart } from "lucide-react";

const TrustIndicators = () => {
  const stats = [
    {
      icon: Users,
      number: "10,000+",
      label: "누적 이용자",
      description: "신뢰받는 정신건강 파트너"
    },
    {
      icon: Award,
      number: "95%",
      label: "만족도",
      description: "검증된 AI 분석 정확도"
    },
    {
      icon: TrendingUp,
      number: "24시간",
      label: "실시간 상담",
      description: "언제나 도움받을 수 있는 시스템"
    },
    {
      icon: Heart,
      number: "100+",
      label: "전문 상담사",
      description: "검증된 전문가 네트워크"
    }
  ];

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">신뢰할 수 있는 이유</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            데이터와 전문성을 바탕으로 한 검증된 정신건강 케어 플랫폼
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{stat.number}</div>
              <div className="font-semibold mb-1">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Partnership CTA */}
        <div className="mt-16 bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">함께 성장하는 파트너십</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            의료기관, 기업, 상담센터와의 제휴를 통해 더 나은 정신건강 서비스를 만들어갑니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.open('https://open.kakao.com/o/sHLdK3Ch', '_blank')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              제휴 문의하기
            </button>
            <button 
              onClick={() => window.location.href = '/subscription'}
              className="px-6 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition-colors"
            >
              기관혜택 PDF받기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;