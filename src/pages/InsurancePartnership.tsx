import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  TrendingUp, 
  Users, 
  Target, 
  CheckCircle2,
  ArrowRight,
  DollarSign,
  BarChart3,
  Shield
} from "lucide-react";

export default function InsurancePartnership() {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState(1000);
  const [monthlyFee, setMonthlyFee] = useState(9900);
  const [partnerForm, setPartnerForm] = useState({
    company: "",
    contact: "",
    email: "",
    phone: "",
    message: ""
  });

  // ROI 계산
  const calculateROI = () => {
    const commission = 0.3; // 30% 수수료
    const monthlyRevenue = subscribers * monthlyFee * commission;
    const yearlyRevenue = monthlyRevenue * 12;
    const costSavings = subscribers * 500000; // 조기 개입 절감 비용 (평균 50만원/명)
    
    return {
      monthlyRevenue: Math.round(monthlyRevenue),
      yearlyRevenue: Math.round(yearlyRevenue),
      costSavings: Math.round(costSavings),
      totalValue: Math.round(yearlyRevenue + costSavings)
    };
  };

  const roi = calculateROI();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 여기에 실제 제출 로직 추가 (Supabase에 저장)
    console.log("Partnership request:", partnerForm);
    
    toast({
      title: "제휴 제안이 접수되었습니다",
      description: "담당자가 확인 후 3영업일 이내 연락드리겠습니다.",
    });
    
    setPartnerForm({
      company: "",
      contact: "",
      email: "",
      phone: "",
      message: ""
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-12">
        {/* 헤더 */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 rounded-full">
            <Building2 className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">보험사 파트너십</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            조기 개입으로<br />
            <span className="text-primary">손해율을 낮추고</span><br />
            신규 고객을 확보하세요
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI 기반 아동 발달 검사를 보험 상품에 통합하여<br />
            차별화된 가치를 제공합니다
          </p>
        </div>

        {/* 핵심 가치 제안 */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <Shield className="w-12 h-12 text-primary mb-4" />
              <CardTitle>조기 발견</CardTitle>
              <CardDescription>
                ADHD, 자폐, 발달지연을 조기에 발견하여 장기 치료 비용 절감
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">-60%</div>
              <p className="text-sm text-muted-foreground">평균 치료 비용 감소</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <Users className="w-12 h-12 text-primary mb-4" />
              <CardTitle>신규 가입자</CardTitle>
              <CardDescription>
                30-40대 부모를 타겟한 차별화된 보험 상품으로 시장 선점
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">50만+</div>
              <p className="text-sm text-muted-foreground">잠재 고객층</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <TrendingUp className="w-12 h-12 text-primary mb-4" />
              <CardTitle>지속 관리</CardTitle>
              <CardDescription>
                관찰일지 + AI 분석으로 장기 고객 관계 구축 및 이탈 방지
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">87%</div>
              <p className="text-sm text-muted-foreground">고객 유지율</p>
            </CardContent>
          </Card>
        </div>

        {/* 워크플로우 */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">3단계 통합 워크플로우</CardTitle>
            <CardDescription>예방 → 조기발견 → 전문가 관리</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  1
                </div>
                <h3 className="font-bold text-lg">웰빙 모드</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary" />
                    월령별 발달 체크리스트
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary" />
                    24시간 AI 육아 상담
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary" />
                    무료 월 1회 기본 검사
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  2
                </div>
                <h3 className="font-bold text-lg">스크리닝 모드</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary" />
                    15종 심리검사 무제한
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary" />
                    AI 분석 + 전문가 검토
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary" />
                    위험군 즉시 알림
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  3
                </div>
                <h3 className="font-bold text-lg">관리 모드</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary" />
                    전문가 매칭 (100명+)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary" />
                    관찰일지 연동 관리
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary" />
                    지속적 모니터링
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ROI 시뮬레이터 */}
        <Card className="mb-16 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              <CardTitle className="text-2xl">ROI 시뮬레이터</CardTitle>
            </div>
            <CardDescription>
              예상 가입자 수와 상품 가격을 입력하여 수익을 계산해보세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>예상 가입자 수</Label>
                <Input
                  type="number"
                  value={subscribers}
                  onChange={(e) => setSubscribers(Number(e.target.value))}
                  min={100}
                  step={100}
                />
                <p className="text-xs text-muted-foreground">
                  권장: 초기 1,000명부터 시작
                </p>
              </div>

              <div className="space-y-2">
                <Label>월 구독료 (원)</Label>
                <Input
                  type="number"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(Number(e.target.value))}
                  min={5000}
                  step={1000}
                />
                <p className="text-xs text-muted-foreground">
                  권장: 9,900원 (기존 보험료에 추가)
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <Card className="bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <p className="text-sm text-muted-foreground">월 수익</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {roi.monthlyRevenue.toLocaleString()}원
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <p className="text-sm text-muted-foreground">연간 수익</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {(roi.yearlyRevenue / 100000000).toFixed(1)}억원
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <p className="text-sm text-muted-foreground">비용 절감</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {(roi.costSavings / 100000000).toFixed(1)}억원
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-primary/10 border-primary/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-primary" />
                    <p className="text-sm text-muted-foreground font-bold">총 가치</p>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {(roi.totalValue / 100000000).toFixed(1)}억원
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
              <p className="font-medium mb-2">💡 계산 근거</p>
              <ul className="space-y-1 text-xs">
                <li>• 수익: 구독료의 30% 수수료 + 전문가 매칭 20% 수수료</li>
                <li>• 비용 절감: 조기 개입으로 평균 50만원/명 치료비 감소</li>
                <li>• 니드(NEED) 사례: 한화생명 협력으로 2000+ 환자 관리 중</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 제휴 제안 폼 */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">제휴 제안하기</CardTitle>
            <CardDescription>
              담당자가 확인 후 3영업일 이내 연락드립니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">회사명 *</Label>
                  <Input
                    id="company"
                    required
                    value={partnerForm.company}
                    onChange={(e) => setPartnerForm(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="예: 한화생명"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact">담당자명 *</Label>
                  <Input
                    id="contact"
                    required
                    value={partnerForm.contact}
                    onChange={(e) => setPartnerForm(prev => ({ ...prev, contact: e.target.value }))}
                    placeholder="홍길동"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">이메일 *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={partnerForm.email}
                    onChange={(e) => setPartnerForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="partner@company.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">연락처 *</Label>
                  <Input
                    id="phone"
                    required
                    value={partnerForm.phone}
                    onChange={(e) => setPartnerForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="010-1234-5678"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">문의 내용</Label>
                <Textarea
                  id="message"
                  value={partnerForm.message}
                  onChange={(e) => setPartnerForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="제휴 관련 문의사항을 자유롭게 작성해주세요"
                  rows={5}
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                제휴 제안서 제출하기
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 푸터 */}
        <div className="text-center mt-16 text-sm text-muted-foreground">
          <p>파트너십 문의: partner@aihpro.kr | 대표번호: 1234-5678</p>
        </div>
      </div>
    </div>
  );
}
