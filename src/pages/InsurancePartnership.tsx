import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Users, 
  TrendingUp, 
  Heart, 
  Brain, 
  Activity,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building2,
  Mail,
  Phone,
  MessageSquare
} from "lucide-react";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";

const InsurancePartnership = () => {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState(1000);
  const [monthlyFee, setMonthlyFee] = useState(10000);
  const [partnerForm, setPartnerForm] = useState({
    company: "",
    contact: "",
    email: "",
    phone: "",
    message: ""
  });

  const calculateROI = () => {
    const monthlyRevenue = subscribers * monthlyFee;
    const yearlyRevenue = monthlyRevenue * 12;
    const costSavings = subscribers * 50000; // 조기 개입으로 인한 연간 절감액
    const totalValue = yearlyRevenue + costSavings;
    
    return {
      monthlyRevenue,
      yearlyRevenue,
      costSavings,
      totalValue
    };
  };

  const roi = calculateROI();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Partnership inquiry:", partnerForm);
    
    toast({
      title: "문의가 접수되었습니다",
      description: "담당자가 빠른 시일 내에 연락드리겠습니다.",
    });
    
    setPartnerForm({
      company: "",
      contact: "",
      email: "",
      phone: "",
      message: ""
    });
  };

  const benefits = [
    {
      icon: Heart,
      title: "조기 발견",
      description: "AI 기반 발달 모니터링으로 잠재적 위험 조기 감지",
      gradient: "from-pink-500/20 to-rose-500/20"
    },
    {
      icon: Users,
      title: "신규 가입자 확보",
      description: "30-40대 부모 타겟 고객층 확대",
      gradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
      icon: TrendingUp,
      title: "지속적인 관리",
      description: "장기 관리로 고객 충성도 및 LTV 향상",
      gradient: "from-purple-500/20 to-indigo-500/20"
    }
  ];

  const workflow = [
    {
      step: "1단계",
      title: "웰빙 모드",
      description: "월별 발달 체크리스트 & AI 육아 챗봇",
      icon: Shield
    },
    {
      step: "2단계",
      title: "스크리닝 모드",
      description: "15가지 심리검사 무제한 & AI 분석",
      icon: Brain
    },
    {
      step: "3단계",
      title: "관리 모드",
      description: "전문가 매칭 & 지속 모니터링",
      icon: Activity
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-subtle via-background to-accent/20">
      <UnifiedNavigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 backdrop-blur-sm rounded-full border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">보험사 전용 파트너십 프로그램</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent leading-tight">
              우리 아이 발달 안심 보험
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              AI 기반 아동 발달 모니터링으로 <span className="text-primary font-semibold">조기 개입</span>과 
              <span className="text-primary font-semibold"> 장기 비용 절감</span>을 실현하세요
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-primary-glow">
                <MessageSquare className="h-5 w-5" />
                파트너십 문의하기
              </Button>
              <Button size="lg" variant="outline" className="gap-2 backdrop-blur-sm">
                ROI 시뮬레이터 보기
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Benefits */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                핵심 가치 제안
              </h2>
              <p className="text-lg text-muted-foreground">
                보험사와 고객 모두에게 실질적인 혜택을 제공합니다
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <Card 
                  key={index} 
                  className="relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 card-glass"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-50`} />
                  <CardHeader className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center mb-4 backdrop-blur-sm border border-primary/20">
                      <benefit.icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-2xl mb-2">{benefit.title}</CardTitle>
                    <CardDescription className="text-base text-foreground/80">
                      {benefit.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-20 bg-gradient-to-br from-muted/30 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                3단계 케어 워크플로우
              </h2>
              <p className="text-lg text-muted-foreground">
                예방부터 전문가 연결까지 체계적인 케어 시스템
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {workflow.map((step, index) => (
                <div key={index} className="relative">
                  <Card className="h-full border-none shadow-xl hover:shadow-2xl transition-all duration-300 card-glass-blue">
                    <CardHeader className="text-center pb-6">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4 shadow-lg">
                        <step.icon className="h-10 w-10 text-white" />
                      </div>
                      <div className="inline-block px-4 py-1 bg-primary/10 backdrop-blur-sm rounded-full text-sm font-semibold text-primary mb-3">
                        {step.step}
                      </div>
                      <CardTitle className="text-2xl">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                  {index < workflow.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="h-8 w-8 text-primary/40" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ROI Simulator */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Card className="border-none shadow-2xl card-glass-purple">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-4xl mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  ROI 시뮬레이터
                </CardTitle>
                <CardDescription className="text-lg">
                  예상 수익과 비용 절감 효과를 확인해보세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="subscribers" className="text-base font-semibold">가입자 수</Label>
                    <Input
                      id="subscribers"
                      type="number"
                      value={subscribers}
                      onChange={(e) => setSubscribers(Number(e.target.value))}
                      className="text-lg h-12 border-primary/20 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="monthlyFee" className="text-base font-semibold">월 구독료 (원)</Label>
                    <Input
                      id="monthlyFee"
                      type="number"
                      value={monthlyFee}
                      onChange={(e) => setMonthlyFee(Number(e.target.value))}
                      className="text-lg h-12 border-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 pt-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-500/20">
                    <p className="text-sm text-muted-foreground mb-2">월 매출</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {roi.monthlyRevenue.toLocaleString()}원
                    </p>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/20">
                    <p className="text-sm text-muted-foreground mb-2">연 매출</p>
                    <p className="text-3xl font-bold text-green-600">
                      {roi.yearlyRevenue.toLocaleString()}원
                    </p>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 backdrop-blur-sm border border-purple-500/20">
                    <p className="text-sm text-muted-foreground mb-2">연간 비용 절감</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {roi.costSavings.toLocaleString()}원
                    </p>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 backdrop-blur-sm border border-orange-500/20">
                    <p className="text-sm text-muted-foreground mb-2">총 가치</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {roi.totalValue.toLocaleString()}원
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Partnership Form */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border-none shadow-2xl card-glass-green">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-4xl mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  파트너십 문의
                </CardTitle>
                <CardDescription className="text-lg">
                  보험사 담당자님의 연락처를 남겨주시면 상세한 제안서와 함께 연락드리겠습니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="company" className="text-base font-semibold flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      보험사명
                    </Label>
                    <Input
                      id="company"
                      value={partnerForm.company}
                      onChange={(e) => setPartnerForm({...partnerForm, company: e.target.value})}
                      required
                      className="h-12 border-primary/20 focus:border-primary"
                      placeholder="예: 삼성생명"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="contact" className="text-base font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      담당자명
                    </Label>
                    <Input
                      id="contact"
                      value={partnerForm.contact}
                      onChange={(e) => setPartnerForm({...partnerForm, contact: e.target.value})}
                      required
                      className="h-12 border-primary/20 focus:border-primary"
                      placeholder="홍길동"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-base font-semibold flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        이메일
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={partnerForm.email}
                        onChange={(e) => setPartnerForm({...partnerForm, email: e.target.value})}
                        required
                        className="h-12 border-primary/20 focus:border-primary"
                        placeholder="example@insurance.com"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-base font-semibold flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" />
                        연락처
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={partnerForm.phone}
                        onChange={(e) => setPartnerForm({...partnerForm, phone: e.target.value})}
                        required
                        className="h-12 border-primary/20 focus:border-primary"
                        placeholder="010-1234-5678"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="message" className="text-base font-semibold flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      문의 내용
                    </Label>
                    <Textarea
                      id="message"
                      value={partnerForm.message}
                      onChange={(e) => setPartnerForm({...partnerForm, message: e.target.value})}
                      rows={5}
                      className="border-primary/20 focus:border-primary resize-none"
                      placeholder="파트너십에 대한 문의사항이나 관심 분야를 자유롭게 작성해주세요"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-primary to-primary-glow hover:shadow-xl transition-all"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    문의하기
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Footer */}
      <section className="py-12 bg-gradient-to-r from-primary/5 to-accent/5 border-t border-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h3 className="text-2xl font-bold">더 궁금한 점이 있으신가요?</h3>
            <p className="text-muted-foreground">
              전화나 이메일로 언제든지 문의해주세요. 전담 팀이 신속하게 답변드리겠습니다.
            </p>
            <div className="flex flex-wrap gap-6 justify-center pt-4">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                <span className="font-semibold">02-1234-5678</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <span className="font-semibold">partnership@maum.ai</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InsurancePartnership;
