import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, TrendingUp, ArrowRight, Building2, Handshake } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InsurancePartnerSection = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Shield,
      title: "조기 발견으로 비용 절감",
      description: "AI 기반 발달 모니터링으로 잠재적 위험을 조기에 감지하여 장기 치료 비용 최소화"
    },
    {
      icon: Users,
      title: "30-40대 부모 고객층 확대",
      description: "아동 발달 보험 상품으로 신규 가입자 유치 및 고객 베이스 확장"
    },
    {
      icon: TrendingUp,
      title: "고객 LTV 향상",
      description: "지속적인 케어 제공으로 고객 충성도 제고 및 장기 관계 구축"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-primary-subtle via-background to-accent/20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 backdrop-blur-sm rounded-full border border-primary/20 mb-6">
              <Handshake className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">보험사 파트너십</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              보험사와 함께 만드는
              <br />
              아이 발달 안심 케어
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              AI 기반 발달 모니터링으로 조기 개입과 장기 비용 절감을 실현하고,
              <br />
              새로운 고객층 확보와 고객 가치 향상을 동시에 달성하세요
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {benefits.map((benefit, index) => (
              <Card 
                key={index}
                className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 card-glass"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center mb-4 backdrop-blur-sm border border-primary/20">
                    <benefit.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl mb-2">{benefit.title}</CardTitle>
                  <CardDescription className="text-base">
                    {benefit.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-500/20 text-center">
              <p className="text-3xl font-bold text-primary mb-2">3단계</p>
              <p className="text-sm text-muted-foreground">케어 워크플로우</p>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/20 text-center">
              <p className="text-3xl font-bold text-primary mb-2">15+</p>
              <p className="text-sm text-muted-foreground">심리검사 제공</p>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 backdrop-blur-sm border border-purple-500/20 text-center">
              <p className="text-3xl font-bold text-primary mb-2">100+</p>
              <p className="text-sm text-muted-foreground">전문가 네트워크</p>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 backdrop-blur-sm border border-orange-500/20 text-center">
              <p className="text-3xl font-bold text-primary mb-2">24/7</p>
              <p className="text-sm text-muted-foreground">AI 케어 지원</p>
            </div>
          </div>

          {/* CTA Card */}
          <Card className="border-none shadow-2xl card-glass-blue overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 backdrop-blur-sm rounded-full border border-primary/20">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">보험사 담당자님께</span>
                  </div>
                  <h3 className="text-3xl font-bold">
                    지금 바로 파트너십을
                    <br />
                    시작해보세요
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    상세한 제안서와 ROI 분석 자료를 제공해드립니다.
                    <br />
                    전담 팀이 맞춤형 협력 방안을 제시해드립니다.
                  </p>
                </div>
                
                <div className="flex flex-col gap-4">
                  <Button 
                    size="lg" 
                    className="gap-2 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-primary-glow text-lg px-8 h-14"
                    onClick={() => navigate('/insurance-partnership')}
                  >
                    파트너십 상세보기
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    또는 02-1234-5678로 연락주세요
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default InsurancePartnerSection;
