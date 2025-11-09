import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles, Building2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/common/SEOHead";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "부모 플랜",
      icon: Users,
      description: "우리 아이를 위한 개인 맞춤 케어",
      price: "9,900",
      period: "월",
      features: [
        "관찰일지 무제한 작성",
        "AI 분석 리포트 월 5회",
        "발달 영역별 상세 분석",
        "성장 추적 타임라인",
        "전문가 상담 1회 (월)",
        "맞춤 육아 가이드"
      ],
      cta: "시작하기",
      popular: false,
      accountType: "parent"
    },
    {
      name: "교사 플랜",
      icon: Sparkles,
      description: "학급 전체를 효율적으로 관리",
      price: "29,900",
      period: "월",
      features: [
        "학생 30명까지 관리",
        "관찰일지 무제한 작성",
        "AI 분석 리포트 무제한",
        "학부모 공유 기능",
        "맞춤형 리포팅 템플릿",
        "전문가 상담 3회 (월)",
        "우선 고객 지원",
        "교육 자료 라이브러리"
      ],
      cta: "무료 체험 시작",
      popular: true,
      accountType: "teacher"
    },
    {
      name: "기관 플랜",
      icon: Building2,
      description: "기관 전체의 디지털 전환",
      price: "맞춤 견적",
      period: "",
      features: [
        "무제한 학생 관리",
        "다중 교사 계정",
        "관찰일지 무제한 작성",
        "AI 분석 리포트 무제한",
        "기관 전용 대시보드",
        "데이터 분석 및 인사이트",
        "API 연동 지원",
        "전담 계정 매니저",
        "맞춤형 온보딩 교육",
        "24/7 우선 지원"
      ],
      cta: "상담 신청",
      popular: false,
      accountType: "institution"
    }
  ];

  const handlePlanSelect = (accountType: string) => {
    if (accountType === "institution") {
      navigate("/contact");
    } else {
      navigate("/auth");
    }
  };

  return (
    <>
      <SEOHead
        title="가격 안내 - AIHUMANPRO"
        description="AIHUMANPRO의 부모, 교사, 기관별 맞춤 플랜을 확인하세요. 합리적인 가격으로 AI 기반 발달 관리를 시작하세요."
        keywords="가격, 플랜, 구독, 부모 플랜, 교사 플랜, 기관 플랜, AIHUMANPRO 가격"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/30">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              모두를 위한 플랜
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              부모님, 교사님, 기관까지 - 각자의 필요에 맞는 최적의 솔루션을 제공합니다
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <Card 
                  key={index}
                  className={`relative transition-all duration-300 hover:shadow-xl ${
                    plan.popular 
                      ? "border-primary shadow-lg scale-105 md:scale-110" 
                      : "hover:scale-105"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      인기
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <CardDescription className="text-base">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-6">
                      <div className="flex items-baseline justify-center gap-2">
                        {plan.price !== "맞춤 견적" && (
                          <span className="text-4xl font-bold">{plan.price}</span>
                        )}
                        {plan.price === "맞춤 견적" && (
                          <span className="text-3xl font-bold">{plan.price}</span>
                        )}
                        {plan.period && (
                          <span className="text-muted-foreground">원 / {plan.period}</span>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground/90">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                      onClick={() => handlePlanSelect(plan.accountType)}
                    >
                      {plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="mt-24 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">자주 묻는 질문</h2>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">플랜은 언제든 변경할 수 있나요?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    네, 언제든지 플랜을 업그레이드하거나 다운그레이드할 수 있습니다. 
                    변경 시 남은 기간에 대한 요금은 일할 계산되어 조정됩니다.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">무료 체험 기간이 있나요?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    모든 플랜에서 14일 무료 체험을 제공합니다. 체험 기간 동안 전체 기능을 
                    사용해보시고 결정하실 수 있습니다. 카드 등록이 필요하며, 체험 종료 전 
                    취소하시면 요금이 청구되지 않습니다.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">기관 플랜 견적은 어떻게 받나요?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    기관 플랜은 규모와 필요에 따라 맞춤 견적을 제공해드립니다. 
                    '상담 신청' 버튼을 클릭하여 문의 양식을 작성해주시면, 
                    전담 매니저가 24시간 내에 연락드립니다.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">결제 방법은 무엇이 있나요?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    신용카드, 체크카드, 계좌이체를 지원합니다. 
                    기관 플랜의 경우 세금계산서 발행이 가능합니다.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-24 text-center">
            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
              <CardContent className="py-12">
                <h2 className="text-3xl font-bold mb-4">아직 고민 중이신가요?</h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  전문 상담사와 1:1 상담을 통해 우리 아이, 우리 학급, 우리 기관에 
                  가장 적합한 플랜을 찾아보세요.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg"
                    onClick={() => navigate("/expert")}
                  >
                    상담 신청하기
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate("/")}
                  >
                    서비스 더 알아보기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
};

export default Pricing;