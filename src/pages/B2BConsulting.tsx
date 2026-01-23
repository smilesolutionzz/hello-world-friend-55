import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building2,
  Brain,
  BarChart3,
  FileText,
  TrendingUp,
  Shield,
  CheckCircle2,
  Users,
  Target,
  Lightbulb,
  ArrowRight,
  Phone,
  Mail,
  Calendar,
  Award,
  Zap,
  CreditCard,
  Rocket
} from 'lucide-react';
import { motion } from 'framer-motion';
import { B2BProductCards } from '@/components/b2b/B2BProductCards';
import { B2BPaymentModal } from '@/components/b2b/B2BPaymentModal';

const B2BConsulting = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPilotPayment, setShowPilotPayment] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
    employee_count: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    interest_area: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('b2b_inquiries')
        .insert({
          organization_name: formData.company_name,
          organization_type: formData.industry,
          contact_person: formData.contact_name,
          email: formData.contact_email,
          phone: formData.contact_phone,
          service_interest: formData.interest_area,
          message: formData.message,
          num_users: parseInt(formData.employee_count) || null,
          status: 'new'
        });

      if (error) throw error;

      toast({
        title: "문의가 접수되었습니다",
        description: "영업일 기준 24시간 내 담당자가 연락드립니다.",
      });
      
      setFormData({
        company_name: '',
        industry: '',
        employee_count: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        interest_area: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast({
        title: "문의 접수 실패",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const solutions = [
    {
      icon: Brain,
      title: 'AI 발달 선별 솔루션',
      description: '0-7세 아동의 발달 상태를 AI가 객관적으로 분석하여 조기 발견을 지원합니다',
      target: '어린이집 · 유치원 · 발달센터',
      price: '월 50만원~'
    },
    {
      icon: Users,
      title: '기업 EAP 프로그램',
      description: '직원 정신건강 및 자녀 발달 케어를 통합한 복지 프로그램입니다',
      target: '중견기업 · 대기업 HR',
      price: '연 계약 별도 협의'
    },
    {
      icon: FileText,
      title: '기관용 리포팅 시스템',
      description: '바우처 일지, IEP, 종합 리포트 자동 생성으로 행정 업무를 90% 절감합니다',
      target: '발달재활 · 언어치료기관',
      price: '월 30만원~'
    },
    {
      icon: BarChart3,
      title: 'Brain Capital 컨설팅',
      description: '조직의 인적자본 가치 극대화를 위한 데이터 기반 컨설팅 서비스입니다',
      target: '정부기관 · 교육청 · 기업',
      price: '프로젝트별 협의'
    }
  ];

  const stats = [
    { value: '6.2조', label: 'Brain Capital 시장 (2050)', source: 'McKinsey' },
    { value: '60%', label: 'Agentic AI 생산성 향상', source: 'McKinsey 2025' },
    { value: '7-13%', label: '조기개입 투자수익률', source: 'MHI 연구' },
    { value: '164+', label: '현재 플랫폼 이용자', source: '실시간' }
  ];

  const process = [
    { step: '01', title: '무료 상담', description: '니즈 파악 및 맞춤 솔루션 제안' },
    { step: '02', title: '파일럿 운영', description: '3개월 무료 시범 운영' },
    { step: '03', title: '성과 분석', description: 'ROI 측정 및 리포트 제공' },
    { step: '04', title: '정식 계약', description: '맞춤형 연간 계약 체결' }
  ];

  const credentials = [
    '예비창업패키지 선정',
    '아동심리학회 자문',
    '15,000+ 누적 이용자',
    '40+ 전문가 네트워크'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-background to-blue-50/30">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center"
        >
          <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
            <Building2 className="w-3 h-3 mr-1" />
            B2B Enterprise Solutions
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
            AI 기반 아동발달
            <br />
            선별 & 컨설팅 솔루션
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            McKinsey가 말하는 "Brain Capital" 시대, 
            <br />
            <strong>6.2조 달러 시장</strong>을 선점할 파트너를 찾습니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-lg px-8 bg-blue-600 hover:bg-blue-700"
            >
              무료 컨설팅 신청
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/b2b-proposal')}
              className="text-lg px-8"
            >
              제안서 다운로드
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 pb-4">
                  <p className="text-3xl md:text-4xl font-bold text-blue-600">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  <Badge variant="outline" className="mt-2 text-xs">{stat.source}</Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Solutions Section */}
      <section className="container mx-auto px-4 py-16 bg-white/50 rounded-3xl my-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4">Solutions</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              기관 맞춤형 솔루션
            </h2>
            <p className="text-muted-foreground text-lg">
              McKinsey, KPMG가 주목한 트렌드에 맞춘 솔루션
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {solutions.map((solution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
              >
                <Card className="h-full border-2 hover:border-blue-300 transition-all hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <solution.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{solution.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{solution.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-xs">{solution.target}</Badge>
                          <Badge className="text-xs bg-green-100 text-green-700">{solution.price}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4">Process</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              도입 프로세스
            </h2>
            <p className="text-muted-foreground">
              <strong>3개월 무료 파일럿</strong>으로 ROI를 먼저 확인하세요
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {process.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                  {item.step}
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                {index < process.length - 1 && (
                  <ArrowRight className="w-6 h-6 text-muted-foreground mx-auto mt-4 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {credentials.map((item, index) => (
              <Badge key={index} variant="outline" className="py-2 px-4 text-sm">
                <Award className="w-4 h-4 mr-2" />
                {item}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="inquiry-form" className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-blue-200 shadow-xl">
            <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="text-2xl">무료 컨설팅 신청</CardTitle>
              <p className="text-muted-foreground">
                24시간 내 담당자가 연락드립니다
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">기관/회사명 *</label>
                    <Input
                      value={formData.company_name}
                      onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                      placeholder="예: ABC 어린이집"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">업종 *</label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => setFormData({...formData, industry: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="업종 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daycare">어린이집/유치원</SelectItem>
                        <SelectItem value="academy">학원</SelectItem>
                        <SelectItem value="development_center">발달센터/치료기관</SelectItem>
                        <SelectItem value="hospital">병원/의료기관</SelectItem>
                        <SelectItem value="enterprise">기업 (EAP)</SelectItem>
                        <SelectItem value="government">공공기관/교육청</SelectItem>
                        <SelectItem value="other">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">담당자명 *</label>
                    <Input
                      value={formData.contact_name}
                      onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                      placeholder="홍길동"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">직원/이용자 수</label>
                    <Input
                      type="number"
                      value={formData.employee_count}
                      onChange={(e) => setFormData({...formData, employee_count: e.target.value})}
                      placeholder="예: 50"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">이메일 *</label>
                    <Input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                      placeholder="email@company.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">연락처 *</label>
                    <Input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                      placeholder="010-0000-0000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">관심 솔루션 *</label>
                  <Select
                    value={formData.interest_area}
                    onValueChange={(value) => setFormData({...formData, interest_area: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="관심 분야 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development_screening">AI 발달 선별 솔루션</SelectItem>
                      <SelectItem value="eap">기업 EAP 프로그램</SelectItem>
                      <SelectItem value="reporting">기관용 리포팅 시스템</SelectItem>
                      <SelectItem value="brain_capital">Brain Capital 컨설팅</SelectItem>
                      <SelectItem value="custom">맞춤형 솔루션 문의</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">추가 문의사항</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="구체적인 니즈나 궁금한 점을 적어주세요"
                    rows={4}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '제출 중...' : '무료 컨설팅 신청하기'}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  제출 시 개인정보처리방침에 동의하는 것으로 간주합니다
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Instant Purchase Section */}
      <section className="container mx-auto px-4 py-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl my-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">
              <CreditCard className="w-3 h-3 mr-1" />
              즉시 구매
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-muted-foreground text-lg">
              상담 대기 없이 바로 구매 가능한 B2B 서비스
            </p>
          </div>
          <B2BProductCards 
            onPurchaseComplete={(productId) => {
              toast({
                title: "구매 완료!",
                description: "결제가 완료되었습니다. 담당자가 곧 연락드립니다."
              });
            }}
          />
        </div>
      </section>

      {/* Fast Track CTA */}
      <section className="container mx-auto px-4 py-12">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-700 text-white border-0">
          <CardContent className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">파일럿 프로그램 즉시 시작</h3>
                  <p className="text-white/80">
                    예치금 결제 후 바로 3개월 무료 시범 운영을 시작하세요
                  </p>
                </div>
              </div>
              <Button 
                size="lg" 
                onClick={() => setShowPilotPayment(true)}
                className="bg-white text-blue-700 hover:bg-white/90 text-lg px-8"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                ₩500,000 예치금 결제
              </Button>
            </div>
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex flex-wrap gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  정식 계약 시 100% 차감
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  미계약 시 전액 환불
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  전담 CS 매니저 배정
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Contact Info */}
      <section className="container mx-auto px-4 py-8 mb-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              <span>b2b@aihpro.kr</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              <span>02-1234-5678</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>평일 09:00 - 18:00</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground border-t">
        <p>© 2024 AIHPRO. AI 기반 아동발달 선별 및 전문가 매칭 플랫폼</p>
      </footer>

      {/* Pilot Payment Modal */}
      <B2BPaymentModal
        isOpen={showPilotPayment}
        onClose={() => setShowPilotPayment(false)}
        productId="b2b_pilot_deposit"
        onSuccess={() => {
          setShowPilotPayment(false);
          toast({
            title: "파일럿 시작!",
            description: "예치금 결제가 완료되었습니다. 담당자가 1영업일 내 연락드립니다."
          });
        }}
      />
    </div>
  );
};

export default B2BConsulting;
