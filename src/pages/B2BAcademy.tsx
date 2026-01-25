import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Eye, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Users, 
  Brain, 
  Sparkles,
  CheckCircle,
  Building2,
  GraduationCap,
  HeartHandshake,
  Zap,
  BarChart3,
  MessageSquare,
  Settings,
  ArrowRight,
  Play,
  Star,
  Clock,
  Shield,
  Rocket,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { B2BIntegratedDashboard } from '@/components/b2b/B2BIntegratedDashboard';

const B2BAcademy = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<'landing' | 'demo'>('landing');
  const [formData, setFormData] = useState({
    institutionName: '',
    contactPerson: '',
    email: '',
    phone: '',
    institutionType: 'academy',
    studentCount: '',
    message: ''
  });

  const aiAgents = [
    {
      name: '학습 역량 분석',
      description: '학생별 학습 강점과 취약점을 AI가 정밀 분석하여 맞춤형 학습 전략을 제안합니다',
      features: ['과목별 분석', '학습 패턴 진단', '성적 예측', '스타일 파악'],
      gradient: 'from-blue-500 to-cyan-500',
      stats: { requests: 247, tokens: 1847, response: '~3초' }
    },
    {
      name: '학부모 소통 리포트',
      description: '학부모에게 발송할 맞춤형 리포트를 자동 생성하고 카카오톡/이메일로 발송합니다',
      features: ['주간/월간 리포트', '성취도 알림', '학습 현황', '다음 달 계획'],
      gradient: 'from-violet-500 to-purple-500',
      stats: { requests: 456, tokens: 2891, response: '~5초' }
    },
    {
      name: '정서 위기 감지',
      description: '학생의 정서적 변화와 위험 신호를 조기에 감지하여 즉시 알립니다',
      features: ['정서 모니터링', '위기 조기 감지', '긴급 알림', '전문가 연계'],
      gradient: 'from-rose-500 to-pink-500',
      stats: { requests: 52, tokens: 312, response: '~2초' }
    },
    {
      name: '맞춤 학습 코칭',
      description: '개별 학생 맞춤형 학습 로드맵과 코칭 전략을 AI가 설계합니다',
      features: ['학습 로드맵', '목표 달성 전략', '동기 부여', '습관 개선'],
      gradient: 'from-amber-500 to-orange-500',
      stats: { requests: 134, tokens: 982, response: '~4초' }
    },
  ];

  const benefits = [
    {
      icon: Brain,
      title: '전문 심리검사 도구',
      description: '발달, 정서, 학습태도 등 20+ 검사 도구 무제한 사용',
    },
    {
      icon: FileText,
      title: 'AI 자동 리포트',
      description: 'AI가 검사 결과를 분석해 전문가 수준 리포트 자동 생성',
    },
    {
      icon: Send,
      title: '학부모 발송 시스템',
      description: '카카오톡/이메일로 학부모에게 리포트 자동 발송',
    },
    {
      icon: BarChart3,
      title: '대시보드 분석',
      description: '학생별/반별 심리 현황 실시간 모니터링',
    },
    {
      icon: Shield,
      title: '위기 조기 감지',
      description: 'AI가 정서적 위험 신호를 감지하면 즉시 알림',
    },
    {
      icon: HeartHandshake,
      title: '전문가 연계',
      description: '필요시 심리상담사/치료사 직접 연결',
    },
  ];

  const pricingPlans = [
    {
      name: '스타터',
      price: '무료',
      period: '',
      description: '소규모 기관 체험용',
      features: ['학생 10명까지', '기본 심리검사 5종', '월 20회 리포트', '이메일 발송'],
      recommended: false,
    },
    {
      name: '그로스',
      price: '99,000',
      period: '/월',
      description: '중소규모 학원/센터',
      features: ['학생 100명까지', '전체 심리검사', '무제한 리포트', '카카오톡 발송', 'AI 분석 포함', '대시보드 분석'],
      recommended: true,
    },
    {
      name: '엔터프라이즈',
      price: '문의',
      period: '',
      description: '대형 기관/프랜차이즈',
      features: ['학생 무제한', '화이트라벨링', 'API 연동', '전담 매니저', '커스텀 리포트', 'SLA 보장'],
      recommended: false,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('b2b_inquiries').insert({
        organization_name: formData.institutionName,
        contact_person: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        organization_type: formData.institutionType,
        num_users: parseInt(formData.studentCount) || null,
        service_interest: 'academy_reporting',
        message: formData.message,
      });

      if (error) throw error;

      toast({
        title: '문의가 접수되었습니다',
        description: '영업일 기준 1일 이내 연락드리겠습니다.',
      });
      setFormData({
        institutionName: '',
        contactPerson: '',
        email: '',
        phone: '',
        institutionType: 'academy',
        studentCount: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: '문의 접수 실패',
        description: '잠시 후 다시 시도해주세요.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo Mode - 통합 대시보드
  if (activeSection === 'demo') {
    return (
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setActiveSection('landing')}
          className="fixed top-20 left-4 z-50 bg-slate-900/90 border-slate-700 hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          랜딩 페이지로
        </Button>
        <B2BIntegratedDashboard institutionName="체험 학원" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-slate-950 to-pink-600/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 py-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-6 bg-violet-500/20 text-violet-300 border-violet-500/30 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              학원/센터를 위한 심리검사 플랫폼
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              학생 심리검사, <br />
              <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                AI가 분석하고 리포트까지
              </span>
            </h1>
            
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              20+ 전문 심리검사 도구로 학생을 평가하고, AI가 분석한 리포트를
              학부모에게 자동 발송하세요. 상담 연계로 수익화까지.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg"
                onClick={() => setActiveSection('demo')}
                className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-lg h-14 px-8 rounded-xl"
              >
                무료 체험 시작
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/assessment')}
                className="border-slate-700 hover:bg-slate-800 text-lg h-14 px-8 rounded-xl text-white"
              >
                <Play className="w-5 h-5 mr-2" />
                검사 데모 보기
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-12 text-slate-500 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>500+ 기관 이용중</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>50,000+ 리포트 발송</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>학부모 만족도 94%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30">
              <Zap className="w-4 h-4 mr-2" />
              AI 에이전트 시스템
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              4가지 AI 에이전트가 학원 업무를 자동화합니다
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              학습 분석부터 학부모 소통, 정서 케어, 맞춤 코칭까지 모두 AI로 자동화
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiAgents.map((agent, idx) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-slate-900/80 border-slate-800 h-full hover:border-slate-700 transition-all hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${agent.gradient} w-fit mb-4`}>
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{agent.name}</h3>
                    <p className="text-slate-400 text-sm mb-4">{agent.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {agent.features.map((f) => (
                        <Badge key={f} variant="outline" className="border-slate-700 text-slate-300 text-xs">
                          {f}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-slate-800">
                      <div>
                        <p className="text-lg font-bold text-white">{agent.stats.requests}</p>
                        <p className="text-xs text-slate-500">요청</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">{agent.stats.tokens}</p>
                        <p className="text-xs text-slate-500">토큰</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">{agent.stats.response}</p>
                        <p className="text-xs text-slate-500">응답</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button
              onClick={() => setActiveSection('demo')}
              size="lg"
              className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              에이전트 직접 체험하기
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              왜 AIHPRO인가요?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              학원/센터 운영에 필요한 모든 심리검사 도구를 제공합니다
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-slate-800/50 border-slate-700 h-full hover:border-violet-500/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="p-3 bg-violet-500/20 rounded-xl w-fit mb-4">
                      <benefit.icon className="w-6 h-6 text-violet-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                    <p className="text-slate-400 text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              합리적인 요금제
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              기관 규모에 맞는 요금제를 선택하세요
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`h-full ${
                  plan.recommended 
                    ? 'bg-gradient-to-b from-violet-500/20 to-pink-500/10 border-violet-500/50 scale-105' 
                    : 'bg-slate-900/80 border-slate-800'
                }`}>
                  <CardContent className="p-6">
                    {plan.recommended && (
                      <Badge className="mb-4 bg-gradient-to-r from-violet-500 to-pink-500 text-white border-0">
                        <Star className="w-3 h-3 mr-1" />
                        추천
                      </Badge>
                    )}
                    <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                    <p className="text-slate-400 text-sm mb-4">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-3xl font-bold text-white">{plan.price}</span>
                      <span className="text-slate-400">{plan.period}</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full ${
                        plan.recommended 
                          ? 'bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600' 
                          : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                      onClick={() => setActiveSection('demo')}
                    >
                      {plan.price === '문의' ? '상담 신청' : '시작하기'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                도입 문의하기
              </h2>
              <p className="text-slate-400">
                무료 상담을 통해 기관에 맞는 솔루션을 제안받으세요
              </p>
            </motion.div>

            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-400 mb-1 block">기관명 *</label>
                      <Input
                        required
                        placeholder="예: 해법수학학원"
                        value={formData.institutionName}
                        onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 mb-1 block">담당자명 *</label>
                      <Input
                        required
                        placeholder="홍길동"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-400 mb-1 block">이메일 *</label>
                      <Input
                        type="email"
                        required
                        placeholder="example@academy.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 mb-1 block">연락처 *</label>
                      <Input
                        required
                        placeholder="010-1234-5678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">학생 수</label>
                    <Input
                      type="number"
                      placeholder="50"
                      value={formData.studentCount}
                      onChange={(e) => setFormData({ ...formData, studentCount: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">문의 내용</label>
                    <Textarea
                      placeholder="궁금하신 점이나 요청사항을 적어주세요..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 h-12"
                  >
                    {isSubmitting ? '접수 중...' : '무료 상담 신청'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default B2BAcademy;
