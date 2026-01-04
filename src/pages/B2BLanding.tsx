import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, Users, Shield, BarChart3, CheckCircle2, 
  School, Building, Hospital, Phone, Mail, ArrowRight,
  Sparkles, Clock, TrendingUp, Award, Home
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const B2BLanding = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    organization_name: '',
    organization_type: '',
    contact_person: '',
    email: '',
    phone: '',
    num_users: '',
    service_interest: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const institutionTypes = [
    { value: 'kindergarten', label: '어린이집/유치원', icon: School },
    { value: 'school', label: '초·중·고등학교', icon: School },
    { value: 'counseling_center', label: '상담센터', icon: Building },
    { value: 'hospital', label: '병원/의원', icon: Hospital },
    { value: 'corporate', label: '기업', icon: Building2 },
    { value: 'government', label: '공공기관', icon: Building2 }
  ];

  const plans = [
    {
      name: 'Starter',
      price: '99,000',
      period: '월',
      users: '최대 50명',
      features: [
        '기본 심리검사 10종',
        '월별 리포트',
        '이메일 지원',
        '기본 대시보드'
      ],
      recommended: false
    },
    {
      name: 'Standard',
      price: '199,000',
      period: '월',
      users: '최대 150명',
      features: [
        '전체 심리검사 20+종',
        '실시간 AI 분석',
        '전담 매니저 배정',
        '고급 대시보드',
        'API 연동'
      ],
      recommended: true
    },
    {
      name: 'Pro',
      price: '399,000',
      period: '월',
      users: '무제한',
      features: [
        'Standard 모든 기능',
        '커스텀 검사 도구',
        '전문가 상담 연계',
        '온프레미스 옵션',
        '24/7 전용 지원',
        '정부 감사 대응'
      ],
      recommended: false
    }
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: '90% 비용 절감',
      description: '기존 오프라인 검사 대비 획기적인 비용 절감'
    },
    {
      icon: Clock,
      title: '24시간 이용',
      description: '언제 어디서나 접근 가능한 온라인 플랫폼'
    },
    {
      icon: BarChart3,
      title: '실시간 분석',
      description: 'AI 기반 즉시 분석 및 리포트 제공'
    },
    {
      icon: Shield,
      title: '데이터 보안',
      description: '개인정보보호법 준수 및 암호화 저장'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('b2b_inquiries')
        .insert({
          organization_name: formData.organization_name,
          organization_type: formData.organization_type,
          contact_person: formData.contact_person,
          email: formData.email,
          phone: formData.phone,
          num_users: parseInt(formData.num_users) || null,
          service_interest: formData.service_interest,
          message: formData.message
        });

      if (error) throw error;

      toast.success('문의가 접수되었습니다! 영업일 기준 1-2일 내 연락드리겠습니다.');
      setFormData({
        organization_name: '',
        organization_type: '',
        contact_person: '',
        email: '',
        phone: '',
        num_users: '',
        service_interest: '',
        message: ''
      });
    } catch (error) {
      console.error('B2B inquiry error:', error);
      toast.error('문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">AI하이라이트PRO</span>
            <Badge variant="outline" className="ml-2">기관용</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <Home className="w-4 h-4 mr-2" />
            홈으로
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            B2B 기관 전용
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            기관을 위한<br />
            <span className="text-primary">AI 심리케어 솔루션</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            어린이집, 학교, 상담센터, 기업까지<br />
            20+ 전문 심리검사와 AI 분석을 한 플랫폼에서
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}>
              무료 상담 신청
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
              요금제 보기
            </Button>
          </div>
        </div>
      </section>

      {/* Institution Types */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">어떤 기관에서 사용하나요?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {institutionTypes.map((type) => (
              <Card key={type.value} className="text-center hover:border-primary transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <type.icon className="w-10 h-10 mx-auto mb-3 text-primary" />
                  <p className="font-medium text-sm">{type.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">왜 AI하이라이트PRO인가요?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">기관용 요금제</h2>
          <p className="text-center text-muted-foreground mb-12">규모와 필요에 맞는 플랜을 선택하세요</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative ${plan.recommended ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {plan.recommended && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    추천
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.users}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">₩{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full mt-6" 
                    variant={plan.recommended ? 'default' : 'outline'}
                    onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    상담 신청
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <p className="text-center text-muted-foreground mt-8">
            * 연간 계약 시 20% 할인 적용 | 첫 1개월 무료 체험 가능
          </p>
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="inquiry-form" className="py-16 px-4 bg-muted/30">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">무료 상담 신청</h2>
          <p className="text-center text-muted-foreground mb-8">
            담당자가 1-2 영업일 내 연락드립니다
          </p>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organization_name">기관명 *</Label>
                    <Input
                      id="organization_name"
                      value={formData.organization_name}
                      onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                      placeholder="예: 행복어린이집"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization_type">기관 유형 *</Label>
                    <Select 
                      value={formData.organization_type}
                      onValueChange={(value) => setFormData({ ...formData, organization_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {institutionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_person">담당자명 *</Label>
                    <Input
                      id="contact_person"
                      value={formData.contact_person}
                      onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                      placeholder="홍길동"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="num_users">예상 이용자 수</Label>
                    <Input
                      id="num_users"
                      type="number"
                      value={formData.num_users}
                      onChange={(e) => setFormData({ ...formData, num_users: e.target.value })}
                      placeholder="예: 100"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일 *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@company.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">연락처 *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="010-1234-5678"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service_interest">관심 서비스 *</Label>
                  <Select 
                    value={formData.service_interest}
                    onValueChange={(value) => setFormData({ ...formData, service_interest: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assessment">심리검사 서비스</SelectItem>
                      <SelectItem value="counseling">상담 연계 서비스</SelectItem>
                      <SelectItem value="monitoring">모니터링/리포트</SelectItem>
                      <SelectItem value="all">종합 솔루션</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">추가 문의사항</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="궁금하신 점이나 요청사항을 적어주세요"
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? '제출 중...' : '상담 신청하기'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-xl font-bold mb-4">직접 연락하기</h3>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a href="tel:010-1234-5678" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
              <Phone className="w-5 h-5" />
              010-1234-5678
            </a>
            <a href="mailto:b2b@aihighlight.pro" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
              <Mail className="w-5 h-5" />
              b2b@aihighlight.pro
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2024 AI하이라이트PRO. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default B2BLanding;
