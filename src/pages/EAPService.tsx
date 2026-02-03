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
  Users,
  Brain,
  Heart,
  Baby,
  BarChart3,
  Shield,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  Clock,
  Sparkles,
  Target,
  Zap,
  Award,
  LineChart,
  HeartHandshake,
  Rocket,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';

const EAPService = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    employee_count: '',
    contact_name: '',
    position: '',
    contact_email: '',
    contact_phone: '',
    current_welfare: '',
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
          organization_type: 'enterprise',
          contact_person: formData.contact_name,
          position: formData.position,
          email: formData.contact_email,
          phone: formData.contact_phone,
          service_interest: 'eap',
          message: `현재 복지 현황: ${formData.current_welfare}\n\n${formData.message}`,
          num_users: parseInt(formData.employee_count) || null,
          status: 'new'
        });

      if (error) throw error;

      toast({
        title: "문의가 접수되었습니다",
        description: "담당 컨설턴트가 24시간 내 연락드립니다.",
      });
      
      setFormData({
        company_name: '',
        employee_count: '',
        contact_name: '',
        position: '',
        contact_email: '',
        contact_phone: '',
        current_welfare: '',
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

  const benefits = [
    {
      icon: Brain,
      title: '직원 정신건강 관리',
      description: '스트레스, 불안, 우울 조기 선별 및 전문가 연계',
      stats: '생산성 23% 향상',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Baby,
      title: '자녀 발달 케어',
      description: '직원 자녀(0-7세) AI 발달 분석 및 전문 상담',
      stats: '육아 스트레스 40% 감소',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: HeartHandshake,
      title: '가족 통합 케어',
      description: '직원과 가족을 위한 통합 정신건강 솔루션',
      stats: '가족 만족도 89%',
      color: 'from-violet-500 to-purple-500'
    },
    {
      icon: LineChart,
      title: '조직 건강 대시보드',
      description: 'HR팀 익명화 조직 건강 현황 분석 제공',
      stats: '이직률 35% 감소',
      color: 'from-emerald-500 to-teal-500'
    }
  ];

  const packages = [
    {
      name: 'Essential',
      target: '50-200명',
      price: '1인당 월 3,000원',
      features: [
        '직원 스트레스 체크 (월 1회)',
        'AI 분석 리포트',
        '위기 상담 핫라인',
        'HR 대시보드 (기본)'
      ],
      recommended: false,
      color: 'border-slate-200 dark:border-slate-700'
    },
    {
      name: 'Professional',
      target: '200-1,000명',
      price: '1인당 월 5,000원',
      features: [
        'Essential 전체 기능',
        '자녀 발달 검사 (연 2회)',
        '전문가 상담 월 1회 포함',
        '부서별 분석 리포트',
        '관리자 교육 프로그램'
      ],
      recommended: true,
      color: 'border-violet-400'
    },
    {
      name: 'Enterprise',
      target: '1,000명 이상',
      price: '맞춤 견적',
      features: [
        'Professional 전체 기능',
        '무제한 전문가 상담',
        '가족 통합 케어 프로그램',
        '전담 CS 매니저',
        '커스텀 리포트 & API 연동'
      ],
      recommended: false,
      color: 'border-amber-400'
    }
  ];

  const caseStudies = [
    {
      company: 'A 대기업',
      employees: '5,000명',
      result: '병가 사용률 28% 감소',
      quote: '직원 정신건강을 선제적으로 관리할 수 있게 되었습니다.',
      period: '6개월'
    },
    {
      company: 'B 스타트업',
      employees: '150명',
      result: '이직률 42% → 18%',
      quote: '자녀 케어 서비스가 워킹맘들에게 큰 호응을 얻었습니다.',
      period: '1년'
    },
    {
      company: 'C 제조업체',
      employees: '800명',
      result: '만족도 34점 상승',
      quote: 'EAP 도입 후 조직 분위기가 확연히 좋아졌습니다.',
      period: '8개월'
    }
  ];

  const stats = [
    { value: '60%', label: 'AI 생산성 향상', icon: Rocket },
    { value: '6.2조$', label: 'Brain Capital 시장', icon: TrendingUp },
    { value: '89%', label: 'EAP 도입 만족도', icon: Star },
    { value: '3.2배', label: 'EAP 투자 ROI', icon: Award }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-violet-400/20 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-400/20 to-cyan-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        </div>

        <div className="container relative mx-auto px-4 pt-20 pb-16 md:pt-28 md:pb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge className="mb-6 bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 px-4 py-1.5 text-sm">
              <Building2 className="w-4 h-4 mr-2" />
              Enterprise EAP Solution
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              직원의 정신건강이
              <br />
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                기업의 경쟁력입니다
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              AI 기반 정신건강 관리 + 자녀 발달 케어<br className="md:hidden" />
              <strong className="text-foreground"> 직원과 가족 모두를 위한 통합 EAP 솔루션</strong>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-lg px-8 h-14 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-xl shadow-violet-500/25"
              >
                무료 상담 신청
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/b2b-proposal')}
                className="text-lg px-8 h-14 border-2"
              >
                제안서 다운로드
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="text-center p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <p className="text-2xl md:text-3xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border-0">
              Why AIHPRO EAP?
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">4가지 핵심</span> 가치
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full bg-white dark:bg-slate-800/80 border-0 shadow-lg hover:shadow-xl transition-all group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                        <benefit.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{benefit.description}</p>
                        <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {benefit.stats}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border-0">
              Pricing
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              기업 규모에 맞는 <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">패키지</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {packages.map((pkg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`h-full relative overflow-hidden ${
                  pkg.recommended 
                    ? 'bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-violet-950/50 dark:via-slate-800 dark:to-purple-950/50 border-2 border-violet-400 shadow-xl shadow-violet-500/10' 
                    : 'bg-white dark:bg-slate-800/80 border-0 shadow-lg'
                }`}>
                  {pkg.recommended && (
                    <div className="absolute top-0 right-0">
                      <Badge className="rounded-none rounded-bl-lg bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0">
                        <Sparkles className="w-3 h-3 mr-1" />
                        추천
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <CardTitle className={`text-xl ${pkg.recommended ? 'text-violet-700 dark:text-violet-300' : ''}`}>
                      {pkg.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{pkg.target}</p>
                    <p className={`text-2xl font-bold mt-4 ${pkg.recommended ? 'bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent' : ''}`}>
                      {pkg.price}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <ul className="space-y-3 mb-6">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${pkg.recommended ? 'text-violet-500' : 'text-emerald-500'}`} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full ${
                        pkg.recommended 
                          ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white' 
                          : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                      onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      상담 신청
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border-0">
              Success Stories
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              도입 기업 <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">성공 사례</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {caseStudies.map((study, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full bg-white dark:bg-slate-800/80 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="text-xs">
                        {study.company}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {study.employees}
                      </Badge>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-1">{study.period} 만에</p>
                      <p className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        {study.result}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground italic">"{study.quote}"</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white dark:bg-slate-800 border-0 shadow-2xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
            <CardHeader className="text-center pt-8">
              <Badge className="mx-auto mb-3 bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border-0">
                Free Consultation
              </Badge>
              <CardTitle className="text-2xl">EAP 도입 상담 신청</CardTitle>
              <p className="text-muted-foreground">
                기업 맞춤 컨설팅을 무료로 제공합니다
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">회사명 *</label>
                    <Input
                      value={formData.company_name}
                      onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                      placeholder="예: (주)ABC"
                      required
                      className="h-11"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">직원 수 *</label>
                    <Select
                      value={formData.employee_count}
                      onValueChange={(value) => setFormData({...formData, employee_count: value})}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="직원 수 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">50명 미만</SelectItem>
                        <SelectItem value="100">50-100명</SelectItem>
                        <SelectItem value="300">100-300명</SelectItem>
                        <SelectItem value="500">300-500명</SelectItem>
                        <SelectItem value="1000">500-1,000명</SelectItem>
                        <SelectItem value="5000">1,000명 이상</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">담당자명 *</label>
                    <Input
                      value={formData.contact_name}
                      onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                      placeholder="홍길동"
                      required
                      className="h-11"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">직책</label>
                    <Input
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      placeholder="예: HR 팀장"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">이메일 *</label>
                    <Input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                      placeholder="email@company.com"
                      required
                      className="h-11"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">연락처 *</label>
                    <Input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                      placeholder="010-0000-0000"
                      required
                      className="h-11"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">현재 복지 현황</label>
                  <Select
                    value={formData.current_welfare}
                    onValueChange={(value) => setFormData({...formData, current_welfare: value})}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="현재 상황 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">EAP 없음</SelectItem>
                      <SelectItem value="basic">기본 EAP 운영 중</SelectItem>
                      <SelectItem value="advanced">고급 복지 프로그램 운영 중</SelectItem>
                      <SelectItem value="considering">신규 도입 검토 중</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">추가 문의사항</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="관심 분야나 궁금한 점을 적어주세요"
                    rows={4}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '제출 중...' : '무료 상담 신청하기'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-10 border-t">
        <div className="flex flex-wrap justify-center items-center gap-6 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-violet-500" />
            <span>eap@aihpro.kr</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-violet-500" />
            <span>02-1234-5678</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-500" />
            <span>평일 09:00 - 18:00</span>
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          © 2024 AIHPRO. AI 기반 기업 정신건강 관리 솔루션
        </p>
      </footer>
    </div>
  );
};

export default EAPService;
