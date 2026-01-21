import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles, Building2, Users, Zap, Crown, Gift, Shield, Brain, TrendingUp, Bell, FileText, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/common/SEOHead";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const Pricing = () => {
  const navigate = useNavigate();

  // 무료 기능 목록
  const freeFeatures = [
    { icon: FileText, label: "관찰일지 무제한 작성", description: "매일 아이의 행동과 발달을 기록하세요" },
    { icon: Brain, label: "기본 AI 분석", description: "월 3회 AI 분석 리포트 제공" },
    { icon: TrendingUp, label: "발달 추적 타임라인", description: "성장 기록을 한눈에 확인" },
    { icon: Bell, label: "주간 발달 알림", description: "주요 변화 알림 수신" },
  ];

  // 프리미엄 플랜
  const premiumPlans = [
    {
      id: "premium_basic",
      name: "프리미엄",
      icon: Sparkles,
      description: "AI 분석을 무제한으로",
      price: "9,900",
      period: "월",
      highlight: false,
      badge: null,
      features: [
        "무료 기능 모두 포함",
        "AI 분석 리포트 무제한",
        "발달 영역별 심층 분석",
        "맞춤 육아 가이드",
        "월간 발달 종합 리포트",
      ],
      notIncluded: [
        "전문가 상담",
        "위기 감지 알림",
      ],
      cta: "프리미엄 시작",
    },
    {
      id: "premium_plus",
      name: "프리미엄 플러스",
      icon: Crown,
      description: "전문가 연결까지 완벽하게",
      price: "19,900",
      period: "월",
      highlight: true,
      badge: "인기",
      features: [
        "프리미엄 기능 모두 포함",
        "전문가 상담 월 1회 (30분)",
        "위기 감지 시 긴급 알림",
        "우선 전문가 매칭",
        "발달 검사 해석 상담",
        "전문가 메모 열람",
      ],
      notIncluded: [],
      cta: "가장 인기있는 플랜",
    },
  ];

  // B2B 플랜
  const b2bPlans = [
    {
      id: "institution_basic",
      name: "학교/학원 기본",
      icon: Building2,
      description: "원아 30명까지 관리",
      price: "49,000",
      period: "월",
      features: [
        "원아/학생 30명 관리",
        "교사/관리자 계정 3개",
        "학부모 발달 알림 발송",
        "위험도 알림 대시보드",
        "월간 학급 발달 리포트",
      ],
    },
    {
      id: "institution_pro",
      name: "기관 프로",
      icon: Shield,
      description: "전체 기관 디지털 전환",
      price: "맞춤 견적",
      period: "",
      features: [
        "무제한 원아/학생 관리",
        "무제한 교사 계정",
        "학부모 연결 현황 대시보드",
        "자동 발달 리포트 생성",
        "전문가 연결 수수료 할인",
        "전담 계정 매니저",
        "API 연동 지원",
      ],
    },
  ];

  // 전문가 연결 수수료 정보
  const expertFees = [
    { type: "일반 상담", fee: "상담료의 20%", description: "플랫폼 중개 수수료" },
    { type: "긴급 연결", fee: "+5,000원", description: "24시간 내 매칭 보장" },
    { type: "심층 상담", fee: "상담료의 15%", description: "60분 이상 심층 상담" },
  ];

  const handlePlanSelect = (planId: string) => {
    if (planId.includes("institution")) {
      navigate("/contact");
    } else {
      navigate("/auth");
    }
  };

  return (
    <>
      <SEOHead
        title="가격 안내 - 무료로 시작하세요 | AIHUMANPRO"
        description="기본 기능은 무료! AI 심층분석과 전문가 연결이 필요할 때만 프리미엄을 선택하세요."
        keywords="무료, 프리미엄, 구독, AI 분석, 전문가 상담, 발달 관리"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/30">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30">
              <Gift className="w-3 h-3 mr-1" />
              기본 기능 무료
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              부담 없이 시작하세요
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              관찰일지 작성과 기본 AI 분석은 <strong className="text-foreground">완전 무료</strong>입니다.<br />
              더 깊은 분석과 전문가 연결이 필요할 때만 업그레이드하세요.
            </p>
          </motion.div>

          {/* 무료 기능 섹션 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl mx-auto mb-16"
          >
            <Card className="border-2 border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Gift className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  무료 플랜
                  <Badge variant="secondary" className="bg-green-500/20 text-green-700">Forever Free</Badge>
                </CardTitle>
                <CardDescription className="text-base">
                  신용카드 없이 바로 시작하세요
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-green-600">₩0</span>
                  <span className="text-muted-foreground ml-2">영원히</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {freeFeatures.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{feature.label}</p>
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter className="justify-center">
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => navigate("/auth")}
                >
                  무료로 시작하기
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* 프리미엄 플랜 섹션 */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-2">프리미엄 플랜</h2>
            <p className="text-muted-foreground text-center mb-8">더 깊은 분석과 전문가 연결이 필요할 때</p>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {premiumPlans.map((plan, index) => {
                const Icon = plan.icon;
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <Card 
                      className={`relative h-full transition-all duration-300 hover:shadow-xl ${
                        plan.highlight 
                          ? "border-primary shadow-lg ring-2 ring-primary/20" 
                          : "hover:border-primary/50"
                      }`}
                    >
                      {plan.badge && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                          {plan.badge}
                        </div>
                      )}
                      
                      <CardHeader className="text-center pb-4">
                        <div className={`w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center ${
                          plan.highlight ? 'bg-primary/20' : 'bg-muted'
                        }`}>
                          <Icon className={`w-7 h-7 ${plan.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                        <div className="mt-4">
                          <span className="text-3xl font-bold">{plan.price}</span>
                          <span className="text-muted-foreground">원 / {plan.period}</span>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <ul className="space-y-2">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        
                        {plan.notIncluded.length > 0 && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground mb-2">미포함:</p>
                            <ul className="space-y-1">
                              {plan.notIncluded.map((item, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <X className="w-3 h-3" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>

                      <CardFooter>
                        <Button
                          className="w-full"
                          variant={plan.highlight ? "default" : "outline"}
                          size="lg"
                          onClick={() => handlePlanSelect(plan.id)}
                        >
                          {plan.cta}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* 전문가 연결 수수료 */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="max-w-4xl mx-auto mb-16"
          >
            <Card className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-500" />
                  전문가 연결 수수료
                </CardTitle>
                <CardDescription>
                  구독과 별개로 전문가 상담 시 적용되는 플랫폼 수수료입니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  {expertFees.map((fee, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-background/50 text-center">
                      <p className="font-semibold text-lg text-purple-600">{fee.fee}</p>
                      <p className="font-medium text-sm mt-1">{fee.type}</p>
                      <p className="text-xs text-muted-foreground">{fee.description}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  * 프리미엄 플러스 구독 시 전문가 연결 수수료 10% 할인
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* B2B 섹션 */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-2">학교 · 학원 · 어린이집</Badge>
              <h2 className="text-2xl font-bold">기관용 플랜</h2>
              <p className="text-muted-foreground">원아/학생 발달 관리와 학부모 연결을 한번에</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {b2bPlans.map((plan, index) => {
                const Icon = plan.icon;
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                          </div>
                        </div>
                        <div className="mt-4">
                          <span className="text-2xl font-bold">{plan.price}</span>
                          {plan.period && <span className="text-muted-foreground">원 / {plan.period}</span>}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => handlePlanSelect(plan.id)}
                        >
                          {plan.price === "맞춤 견적" ? "상담 신청" : "시작하기"}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* 비교 테이블 */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">플랜 비교</h2>
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">기능</th>
                      <th className="text-center p-4 font-medium text-green-600">무료</th>
                      <th className="text-center p-4 font-medium">프리미엄</th>
                      <th className="text-center p-4 font-medium bg-primary/5">프리미엄+</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4">관찰일지 작성</td>
                      <td className="text-center p-4"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center p-4"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                      <td className="text-center p-4 bg-primary/5"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">AI 분석 리포트</td>
                      <td className="text-center p-4 text-muted-foreground">월 3회</td>
                      <td className="text-center p-4">무제한</td>
                      <td className="text-center p-4 bg-primary/5">무제한</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">발달 영역 심층분석</td>
                      <td className="text-center p-4"><X className="w-4 h-4 text-muted-foreground mx-auto" /></td>
                      <td className="text-center p-4"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                      <td className="text-center p-4 bg-primary/5"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">전문가 상담</td>
                      <td className="text-center p-4 text-muted-foreground">별도 결제</td>
                      <td className="text-center p-4 text-muted-foreground">별도 결제</td>
                      <td className="text-center p-4 bg-primary/5">월 1회 포함</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">위기 감지 알림</td>
                      <td className="text-center p-4"><X className="w-4 h-4 text-muted-foreground mx-auto" /></td>
                      <td className="text-center p-4"><X className="w-4 h-4 text-muted-foreground mx-auto" /></td>
                      <td className="text-center p-4 bg-primary/5"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4">전문가 수수료 할인</td>
                      <td className="text-center p-4"><X className="w-4 h-4 text-muted-foreground mx-auto" /></td>
                      <td className="text-center p-4"><X className="w-4 h-4 text-muted-foreground mx-auto" /></td>
                      <td className="text-center p-4 bg-primary/5">10% 할인</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
              <CardContent className="py-12">
                <h2 className="text-3xl font-bold mb-4">지금 바로 시작하세요</h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  신용카드 없이 무료로 시작하고,<br />
                  필요할 때만 업그레이드하세요.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => navigate("/auth")}
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    무료로 시작하기
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate("/expert")}
                  >
                    전문가 상담 먼저 받기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </div>
    </>
  );
};

export default Pricing;
