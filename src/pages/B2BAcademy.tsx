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
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const B2BAcademy = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    institutionName: '',
    contactPerson: '',
    email: '',
    phone: '',
    institutionType: 'academy',
    studentCount: '',
    message: ''
  });

  // Demo data for showcase
  const reportStats = {
    monthSent: 124,
    openRate: 87,
    pendingBookings: 12,
    drafts: 5
  };

  const recentReports = [
    { name: '1월 3주차 학습 리포트', student: '김민준', type: '주간', status: '발송 완료' },
    { name: '수학 취약점 분석 리포트', student: '최수아', type: '맞춤', status: '초안' },
    { name: '1월 3주차 학습 리포트', student: '정우진', type: '주간', status: '예약됨' },
    { name: '1월 3주차 학습 리포트', student: '한소희', type: '주간', status: '발송 완료' },
  ];

  const aiAgents = [
    {
      name: 'AI 심리검사 분석가',
      description: '학생별 심리 상태를 분석하여 맞춤형 리포트를 생성합니다',
      features: ['발달검사', '정서분석', '학습태도', '사회성평가'],
      gradient: 'from-violet-500 to-purple-600',
      stats: { requests: 300, tokens: 1309, response: '~2초' }
    },
    {
      name: 'AI 학부모 리포터',
      description: '학부모에게 자녀의 심리/학습 현황을 정기적으로 보고합니다',
      features: ['주간 리포트', '성취도 알림', '상담 요약', '발달 제안'],
      gradient: 'from-orange-400 to-pink-500',
      stats: { requests: 200, tokens: 791, response: '~2초' }
    },
    {
      name: 'AI 위기 감지기',
      description: '학생의 정서적 위험 신호를 조기에 탐지하고 알립니다',
      features: ['위험 감지', '긴급 알림', '상담 연계', '추적 관리'],
      gradient: 'from-red-400 to-rose-500',
      stats: { requests: 50, tokens: 234, response: '~1초' }
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
                onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-lg h-14 px-8 rounded-xl"
              >
                무료 체험 시작
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/assessment')}
                className="border-slate-700 hover:bg-slate-800 text-lg h-14 px-8 rounded-xl"
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

      {/* Demo Preview - Report Center */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              리포트 센터 미리보기
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              학부모에게 발송한 리포트를 한눈에 관리하세요
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <Card className="bg-slate-900/80 border-slate-800 overflow-hidden backdrop-blur-xl">
              <CardHeader className="border-b border-slate-800 pb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-2xl text-white">리포트 센터</CardTitle>
                    <p className="text-slate-400 text-sm mt-1">학부모에게 발송한 리포트를 관리하세요</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
                      <Send className="w-4 h-4 mr-2" />
                      일괄 발송
                    </Button>
                    <Button className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600">
                      <FileText className="w-4 h-4 mr-2" />
                      리포트 작성
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-violet-500/20 rounded-lg">
                        <Send className="w-5 h-5 text-violet-400" />
                      </div>
                      <span className="text-2xl font-bold text-white">{reportStats.monthSent}</span>
                    </div>
                    <p className="text-slate-400 text-sm">이번 달 발송</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Eye className="w-5 h-5 text-green-400" />
                      </div>
                      <span className="text-2xl font-bold text-white">{reportStats.openRate}%</span>
                    </div>
                    <p className="text-slate-400 text-sm">평균 열람률</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="text-2xl font-bold text-white">{reportStats.pendingBookings}</span>
                    </div>
                    <p className="text-slate-400 text-sm">예약 대기</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-orange-500/20 rounded-lg">
                        <FileText className="w-5 h-5 text-orange-400" />
                      </div>
                      <span className="text-2xl font-bold text-white">{reportStats.drafts}</span>
                    </div>
                    <p className="text-slate-400 text-sm">초안 저장</p>
                  </div>
                </div>

                {/* Reports Table */}
                <div className="bg-slate-800/30 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-3 gap-4 p-4 border-b border-slate-700/50 text-sm text-slate-400">
                    <span>리포트</span>
                    <span>유형</span>
                    <span>상태</span>
                  </div>
                  {recentReports.map((report, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-4 p-4 border-b border-slate-800/50 last:border-0">
                      <div>
                        <p className="font-medium text-white">{report.name}</p>
                        <p className="text-sm text-slate-500">{report.student}</p>
                      </div>
                      <div>
                        <Badge variant="outline" className={`
                          ${report.type === '주간' ? 'border-blue-500/50 text-blue-400' : ''}
                          ${report.type === '맞춤' ? 'border-pink-500/50 text-pink-400' : ''}
                          ${report.type === '월간' ? 'border-violet-500/50 text-violet-400' : ''}
                        `}>
                          {report.type}
                        </Badge>
                      </div>
                      <div>
                        <Badge className={`
                          ${report.status === '발송 완료' ? 'bg-green-500/20 text-green-400 border-0' : ''}
                          ${report.status === '초안' ? 'bg-slate-500/20 text-slate-400 border-0' : ''}
                          ${report.status === '예약됨' ? 'bg-blue-500/20 text-blue-400 border-0' : ''}
                        `}>
                          {report.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Report Banner */}
                <div className="mt-6 p-6 bg-gradient-to-r from-violet-500/10 to-pink-500/10 rounded-xl border border-violet-500/20">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">AI가 자동으로 리포트를 작성해드려요</h4>
                      <p className="text-sm text-slate-400">학생 데이터를 분석하여 맞춤형 리포트를 생성합니다</p>
                    </div>
                    <Button className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600">
                      AI 리포트 생성
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30">
              <Zap className="w-4 h-4 mr-2" />
              AI 에이전트
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              AI가 자동으로 분석하고 리포팅합니다
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              3가지 AI 에이전트가 학생 심리검사부터 학부모 리포팅까지 자동화합니다
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {aiAgents.map((agent, idx) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-slate-900/80 border-slate-800 h-full hover:border-slate-700 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${agent.gradient}`}>
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500/20 text-green-400 border-0">활성</Badge>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-2">{agent.name}</h3>
                    <p className="text-sm text-slate-400 mb-4">{agent.description}</p>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-white">1/{agent.stats.requests}</p>
                        <p className="text-xs text-slate-500">이번 달 요청</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">{agent.stats.tokens}</p>
                        <p className="text-xs text-slate-500">토큰 사용</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">{agent.stats.response}</p>
                        <p className="text-xs text-slate-500">평균 응답</p>
                      </div>
                    </div>
                    
                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {agent.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="border-slate-700 text-slate-300 text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button className={`w-full bg-gradient-to-r ${agent.gradient} hover:opacity-90`}>
                      <Play className="w-4 h-4 mr-2" />
                      에이전트 실행
                    </Button>
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>사용량</span>
                        <span>0%</span>
                      </div>
                      <Progress value={0} className="h-1.5 bg-slate-800" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              학원/센터가 선택하는 이유
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              심리검사 도입으로 학부모 신뢰도 상승, 상담 연계로 추가 수익 창출
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, idx) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-slate-900/50 border-slate-800 h-full hover:border-violet-500/50 transition-colors group">
                  <CardContent className="p-6">
                    <div className="p-3 bg-violet-500/10 rounded-xl w-fit mb-4 group-hover:bg-violet-500/20 transition-colors">
                      <benefit.icon className="w-6 h-6 text-violet-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                    <p className="text-sm text-slate-400">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-green-500/20 text-green-300 border-green-500/30">
              <Rocket className="w-4 h-4 mr-2" />
              합리적인 가격
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              기관 규모에 맞는 요금제
            </h2>
            <p className="text-slate-400">
              소규모 기관은 무료로 시작하세요
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
                <Card className={`relative h-full ${
                  plan.recommended 
                    ? 'bg-gradient-to-b from-violet-500/10 to-slate-900 border-violet-500/50' 
                    : 'bg-slate-900/80 border-slate-800'
                }`}>
                  {plan.recommended && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-violet-500 to-pink-500 border-0 px-4 py-1">
                        <Star className="w-4 h-4 mr-1" />
                        추천
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                      <p className="text-sm text-slate-400 mb-4">{plan.description}</p>
                      <div className="flex items-end justify-center gap-1">
                        {plan.price !== '문의' && <span className="text-slate-400">₩</span>}
                        <span className="text-4xl font-bold text-white">{plan.price}</span>
                        <span className="text-slate-400">{plan.period}</span>
                      </div>
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
                      onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      {plan.price === '무료' ? '무료 시작' : plan.price === '문의' ? '상담 문의' : '시작하기'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                무료 체험 신청
              </h2>
              <p className="text-slate-400">
                영업일 기준 1일 이내 담당자가 연락드립니다
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-slate-900/80 border-slate-800">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-slate-400 block mb-2">기관명 *</label>
                        <Input
                          required
                          placeholder="예: 밝은미래학원"
                          value={formData.institutionName}
                          onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 block mb-2">담당자명 *</label>
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
                        <label className="text-sm text-slate-400 block mb-2">이메일 *</label>
                        <Input
                          type="email"
                          required
                          placeholder="email@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 block mb-2">연락처 *</label>
                        <Input
                          required
                          placeholder="010-0000-0000"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-slate-400 block mb-2">기관 유형</label>
                        <select
                          value={formData.institutionType}
                          onChange={(e) => setFormData({ ...formData, institutionType: e.target.value })}
                          className="w-full h-10 px-3 rounded-md bg-slate-800 border border-slate-700 text-white"
                        >
                          <option value="academy">학원</option>
                          <option value="development_center">발달센터</option>
                          <option value="daycare">어린이집/유치원</option>
                          <option value="school">학교</option>
                          <option value="counseling_center">상담센터</option>
                          <option value="other">기타</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 block mb-2">학생 수</label>
                        <Input
                          type="number"
                          placeholder="예: 50"
                          value={formData.studentCount}
                          onChange={(e) => setFormData({ ...formData, studentCount: e.target.value })}
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-slate-400 block mb-2">문의 내용</label>
                      <Textarea
                        placeholder="궁금한 점이나 요청사항을 입력해주세요"
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
                      {isSubmitting ? '접수 중...' : '무료 체험 신청하기'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2025 AIHPRO. 학원/센터를 위한 AI 심리검사 플랫폼</p>
        </div>
      </footer>
    </div>
  );
};

export default B2BAcademy;
