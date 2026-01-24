import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building2, Users, Brain, ArrowRight, Check, 
  Mail, Phone, FileText, BarChart3, Shield, 
  Clock, Sparkles, MessageCircle, Bot,
  Send, Play, Zap
} from 'lucide-react';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { B2BReportCenter } from '@/components/b2b/B2BReportCenter';
import { B2BAIAgentPanel } from '@/components/b2b/B2BAIAgentPanel';

const B2BAcademy = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDemo, setShowDemo] = useState(false);
  const [formData, setFormData] = useState({
    institutionName: '',
    institutionType: '',
    contactName: '',
    phone: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('b2b_inquiries').insert({
        organization_name: formData.institutionName,
        organization_type: formData.institutionType || '학원/센터',
        contact_person: formData.contactName,
        phone: formData.phone,
        email: formData.email,
        message: formData.message,
        service_interest: 'B2B Academy',
        status: 'pending'
      });

      if (error) throw error;

      toast({
        title: "문의가 접수되었습니다",
        description: "영업일 기준 1일 이내 연락드리겠습니다.",
      });

      setFormData({
        institutionName: '',
        institutionType: '',
        contactName: '',
        phone: '',
        email: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: "오류가 발생했습니다",
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showDemo) {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedNavigation />
        <div className="pt-20 pb-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold">B2B 대시보드 체험</h1>
                <p className="text-muted-foreground">실제 기관용 대시보드를 체험해보세요</p>
              </div>
              <Button variant="outline" onClick={() => setShowDemo(false)}>
                랜딩페이지로 돌아가기
              </Button>
            </div>

            <B2BReportCenter institutionName="체험 학원" />
            <div className="mt-8">
              <B2BAIAgentPanel />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavigation />
      
      <div className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />
          
          <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <Badge className="mb-6 bg-white/10 text-white border-white/20">
                <Building2 className="w-3 h-3 mr-1" />
                학원 · 어린이집 · 발달센터 전용
              </Badge>

              <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
                아동 발달 모니터링
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  AI가 자동으로
                </span>
              </h1>

              <p className="text-lg text-white/70 mb-8 max-w-xl">
                선생님은 관찰만, 분석과 리포팅은 AI가.
                <br />
                부모 만족도는 높이고, 업무 부담은 줄이세요.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-white text-indigo-900 hover:bg-white/90 font-bold rounded-full px-8"
                  onClick={() => setShowDemo(true)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  무료 데모 체험
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 rounded-full px-8"
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  도입 상담 신청
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pain Points */}
        <section className="py-16 border-b">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                이런 고민 있으신가요?
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: FileText, title: '부모 상담 자료 준비', desc: '매번 수기로 관찰 기록 정리하느라 시간이 부족해요' },
                { icon: MessageCircle, title: '학부모 소통', desc: '발달 상황을 전문적으로 설명하기 어려워요' },
                { icon: BarChart3, title: '객관적 평가', desc: '감에 의존한 평가는 신뢰도가 낮아요' }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="h-full bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900">
                    <CardContent className="p-6">
                      <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/30 w-fit mb-4">
                        <item.icon className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                      </div>
                      <h3 className="font-bold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Solution Features */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                Solution
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                AIHPRO가 해결합니다
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: Bot,
                  title: 'AI 관찰 분석',
                  desc: '선생님의 간단한 관찰 메모를 전문적인 발달 분석으로 변환합니다.',
                  features: ['언어 발달 분석', '사회성 평가', '인지 발달 체크']
                },
                {
                  icon: Send,
                  title: '자동 리포트 발송',
                  desc: '분석 결과를 예쁜 리포트로 만들어 부모님께 자동 발송합니다.',
                  features: ['이메일 자동 발송', '카카오톡 연동', '열람 확인']
                },
                {
                  icon: BarChart3,
                  title: '대시보드 분석',
                  desc: '원아별, 반별 발달 현황을 한눈에 파악할 수 있습니다.',
                  features: ['월별 추이 분석', '위험군 자동 알림', '통계 리포트']
                },
                {
                  icon: Shield,
                  title: '안전한 데이터 관리',
                  desc: '아이들의 민감 정보를 안전하게 관리합니다.',
                  features: ['개인정보 암호화', '접근 권한 관리', '백업 시스템']
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex-shrink-0">
                          <item.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4">{item.desc}</p>
                          <div className="flex flex-wrap gap-2">
                            {item.features.map((f, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {f}
                              </Badge>
                            ))}
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

        {/* Pricing */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20">
                Pricing
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                기관 규모에 맞는 요금제
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Starter',
                  desc: '소규모 학원/센터',
                  price: '30만원',
                  capacity: '30명 이하',
                  features: ['AI 관찰 분석', '월간 리포트', '이메일 발송', '기본 대시보드'],
                  popular: false
                },
                {
                  name: 'Growth',
                  desc: '중형 기관',
                  price: '50만원',
                  capacity: '31-100명',
                  features: ['Starter 전체 포함', '실시간 알림', '카카오 연동', '전담 매니저', '커스텀 리포트'],
                  popular: true
                },
                {
                  name: 'Enterprise',
                  desc: '대형 기관 / 프랜차이즈',
                  price: '맞춤 견적',
                  capacity: '100명 이상',
                  features: ['Growth 전체 포함', 'API 연동', '다중 지점 관리', 'SLA 보장', '온사이트 교육'],
                  popular: false
                }
              ].map((plan, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className={`h-full relative ${plan.popular ? 'border-2 border-violet-500 shadow-lg' : ''}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-violet-500 text-white border-0">
                          <Sparkles className="w-3 h-3 mr-1" />
                          인기
                        </Badge>
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground">{plan.desc}</p>
                        <div className="mt-4">
                          <span className="text-3xl font-black">{plan.price}</span>
                          {plan.price !== '맞춤 견적' && <span className="text-muted-foreground">/월</span>}
                        </div>
                        <Badge variant="outline" className="mt-2">{plan.capacity}</Badge>
                      </div>

                      <div className="space-y-3 mb-6">
                        {plan.features.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>

                      <Button
                        className={`w-full ${plan.popular ? 'bg-violet-500 hover:bg-violet-600' : ''}`}
                        variant={plan.popular ? 'default' : 'outline'}
                        onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
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

        {/* Contact Form */}
        <section id="contact" className="py-16 md:py-24 bg-slate-900 text-white">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                도입 상담 신청
              </h2>
              <p className="text-white/60">
                기관에 맞는 맞춤 솔루션을 제안해드립니다
              </p>
            </div>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-white/60 mb-1 block">기관명 *</label>
                      <Input
                        required
                        placeholder="예) 해피키즈 어린이집"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        value={formData.institutionName}
                        onChange={(e) => setFormData({...formData, institutionName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-white/60 mb-1 block">기관 유형</label>
                      <Input
                        placeholder="어린이집/학원/센터"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        value={formData.institutionType}
                        onChange={(e) => setFormData({...formData, institutionType: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-white/60 mb-1 block">담당자명 *</label>
                    <Input
                      required
                      placeholder="홍길동"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      value={formData.contactName}
                      onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-white/60 mb-1 block">연락처 *</label>
                      <Input
                        required
                        type="tel"
                        placeholder="010-0000-0000"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-white/60 mb-1 block">이메일 *</label>
                      <Input
                        required
                        type="email"
                        placeholder="email@example.com"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-white/60 mb-1 block">문의 내용</label>
                    <Textarea
                      placeholder="도입 관련 문의사항을 자유롭게 적어주세요"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 min-h-[100px]"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '제출 중...' : '상담 신청하기'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/40">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>1644-0000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>b2b@aihpro.app</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default B2BAcademy;
