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
  Zap
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
      description: '스트레스, 불안, 우울 등 정신건강 조기 선별 및 전문가 연계',
      stats: '생산성 23% 향상'
    },
    {
      icon: Baby,
      title: '자녀 발달 검사',
      description: '직원 자녀(0-7세) 발달 상태 AI 분석 및 전문 상담 제공',
      stats: '육아 스트레스 40% 감소'
    },
    {
      icon: Heart,
      title: '가족 통합 케어',
      description: '직원과 가족 전체를 위한 통합 정신건강 관리 솔루션',
      stats: '가족 만족도 89%'
    },
    {
      icon: BarChart3,
      title: '조직 건강 대시보드',
      description: 'HR팀을 위한 익명화된 조직 전체 건강 현황 분석',
      stats: '이직률 35% 감소'
    }
  ];

  const packages = [
    {
      name: 'Essential',
      target: '50-200명',
      price: '직원 1인당 월 3,000원',
      features: [
        '직원 스트레스 체크 (월 1회)',
        'AI 분석 리포트',
        '위기 상담 핫라인',
        'HR 대시보드 (기본)'
      ],
      recommended: false
    },
    {
      name: 'Professional',
      target: '200-1,000명',
      price: '직원 1인당 월 5,000원',
      features: [
        'Essential 전체 기능',
        '자녀 발달 검사 (연 2회)',
        '전문가 상담 월 1회 포함',
        '부서별 분석 리포트',
        '관리자 교육 프로그램'
      ],
      recommended: true
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
        '커스텀 리포트',
        'API 연동 지원'
      ],
      recommended: false
    }
  ];

  const caseStudies = [
    {
      company: 'A 대기업 (직원 5,000명)',
      result: '6개월 만에 병가 사용률 28% 감소',
      quote: '직원들의 정신건강을 선제적으로 관리할 수 있게 되었습니다.'
    },
    {
      company: 'B 스타트업 (직원 150명)',
      result: '1년간 이직률 42% → 18% 감소',
      quote: '자녀 케어 서비스가 워킹맘들에게 큰 호응을 얻었습니다.'
    },
    {
      company: 'C 제조업체 (직원 800명)',
      result: '직원 만족도 조사 점수 34점 상승',
      quote: 'EAP 도입 후 조직 분위기가 확연히 좋아졌습니다.'
    }
  ];

  const stats = [
    { value: '60%', label: 'AI로 인한 생산성 향상', source: 'McKinsey 2025' },
    { value: '6.2조$', label: 'Brain Capital 시장 규모', source: '2050 예측' },
    { value: '89%', label: 'EAP 도입 기업 만족도', source: '국내 조사' },
    { value: '3.2배', label: 'EAP 투자 대비 수익', source: 'ROI 연구' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center"
        >
          <Badge className="mb-4 bg-white/10 text-white border-white/20">
            <Building2 className="w-3 h-3 mr-1" />
            Enterprise EAP Solution
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            직원의 정신건강이
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              기업의 경쟁력입니다
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            AI 기반 정신건강 관리 + 자녀 발달 케어
            <br />
            <strong className="text-white">직원과 가족 모두를 위한 통합 EAP 솔루션</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-lg px-8 bg-white text-slate-900 hover:bg-white/90"
            >
              무료 상담 신청
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/b2b-proposal')}
              className="text-lg px-8 border-white/30 text-white hover:bg-white/10"
            >
              제안서 다운로드
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center bg-white/5 rounded-2xl p-6 backdrop-blur"
            >
              <p className="text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-white/60 mt-1">{stat.label}</p>
              <Badge variant="outline" className="mt-2 text-xs border-white/20 text-white/60">
                {stat.source}
              </Badge>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-white/10 border-white/20">Why EAP?</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              AIHPRO EAP의 4가지 핵심 가치
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
              >
                <Card className="h-full bg-white/5 border-white/10 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-white mb-2">{benefit.title}</h3>
                        <p className="text-sm text-white/60 mb-3">{benefit.description}</p>
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-white/10 border-white/20">Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              기업 규모에 맞는 패키지
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((pkg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
              >
                <Card className={`h-full ${pkg.recommended ? 'bg-gradient-to-br from-blue-600 to-purple-700 border-0' : 'bg-white/5 border-white/10'} backdrop-blur relative`}>
                  {pkg.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-yellow-500 text-yellow-900">
                        <Sparkles className="w-3 h-3 mr-1" />
                        추천
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl text-white">{pkg.name}</CardTitle>
                    <p className="text-white/60 text-sm">{pkg.target}</p>
                    <p className="text-2xl font-bold text-white mt-4">{pkg.price}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                          <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full mt-6 ${pkg.recommended ? 'bg-white text-purple-700 hover:bg-white/90' : 'bg-white/10 hover:bg-white/20'}`}
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
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-white/10 border-white/20">Success Stories</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              도입 기업 성공 사례
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {caseStudies.map((study, index) => (
              <Card key={index} className="bg-white/5 border-white/10 backdrop-blur">
                <CardContent className="p-6">
                  <Badge variant="outline" className="mb-4 border-white/20 text-white/60">
                    {study.company}
                  </Badge>
                  <p className="text-xl font-bold text-green-400 mb-3">{study.result}</p>
                  <p className="text-sm text-white/60 italic">"{study.quote}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white border-0 text-slate-900">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">EAP 도입 상담 신청</CardTitle>
              <p className="text-muted-foreground">
                기업 맞춤 컨설팅을 무료로 제공합니다
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">회사명 *</label>
                    <Input
                      value={formData.company_name}
                      onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                      placeholder="예: (주)ABC"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">직원 수 *</label>
                    <Select
                      value={formData.employee_count}
                      onValueChange={(value) => setFormData({...formData, employee_count: value})}
                    >
                      <SelectTrigger>
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
                    <label className="text-sm font-medium mb-1 block">담당자명 *</label>
                    <Input
                      value={formData.contact_name}
                      onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                      placeholder="홍길동"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">직책</label>
                    <Input
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      placeholder="예: HR 팀장"
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
                  <label className="text-sm font-medium mb-1 block">현재 복지 현황</label>
                  <Select
                    value={formData.current_welfare}
                    onValueChange={(value) => setFormData({...formData, current_welfare: value})}
                  >
                    <SelectTrigger>
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
                  <label className="text-sm font-medium mb-1 block">추가 문의사항</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="관심 분야나 궁금한 점을 적어주세요"
                    rows={4}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '제출 중...' : '무료 상담 신청하기'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-sm text-white/40 border-t border-white/10">
        <div className="flex flex-wrap justify-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>eap@aihpro.kr</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>02-1234-5678</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>평일 09:00 - 18:00</span>
          </div>
        </div>
        <p>© 2024 AIHPRO. AI 기반 기업 정신건강 관리 솔루션</p>
      </footer>
    </div>
  );
};

export default EAPService;
