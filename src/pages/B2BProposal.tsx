import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Brain, BarChart3, CheckCircle2, ArrowRight, Heart, 
  Users, Shield, FileText, BookOpen, Activity, Clock,
  Building2, Phone, Mail, TrendingUp, Star, Sparkles,
  ChevronDown
} from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } })
};

const B2BProposal = () => {
  const { toast } = useToast();
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [formData, setFormData] = useState({
    institution_name: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    institution_type: '',
    user_count: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.institution_name || !formData.contact_name || !formData.contact_phone) {
      toast({ title: '기관명, 담당자명, 연락처를 입력해주세요.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('b2b_inquiries').insert({
        organization_name: formData.institution_name,
        contact_person: formData.contact_name,
        phone: formData.contact_phone,
        email: formData.contact_email || 'N/A',
        organization_type: formData.institution_type || '노인복지시설',
        service_interest: 'b2b_care_bundle',
        num_users: parseInt(formData.user_count) || 0,
        message: formData.message || null,
      });
      if (error) throw error;
      toast({ title: '도입 문의가 접수되었습니다!', description: '영업일 기준 1일 이내 연락드리겠습니다.' });
      setFormData({ institution_name: '', contact_name: '', contact_phone: '', contact_email: '', institution_type: '', user_count: '', message: '' });
      setInquiryOpen(false);
    } catch (e: any) {
      toast({ title: '오류가 발생했습니다', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-400 rounded-full blur-[150px]" />
        </div>
        <div className="relative container mx-auto px-4 py-20 md:py-28 max-w-5xl">
          <motion.div initial="hidden" animate="visible" className="text-center">
            <motion.div variants={fadeUp} custom={0}>
              <Badge className="mb-6 bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-sm px-4 py-1.5">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                3개월 무료 파일럿 프로그램
              </Badge>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              일지 쓰느라 야근하시죠?<br />
              <span className="text-emerald-400">AI가 3분 만에 써드립니다</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-4">
              사례관리 기록 · 프로그램 운영일지 · 바우처 서류 · 보호자 리포트<br />
              <span className="text-emerald-300 font-medium">메모 3줄이면 AI가 공식 양식에 맞는 완성 문서를 생성합니다</span>
            </motion.p>
            <motion.p variants={fadeUp} custom={3} className="text-sm text-slate-400 mb-10">
              주간보호센터 · 노인복지시설 · 지역아동센터 · 발달클리닉
            </motion.p>
            <motion.div variants={fadeUp} custom={4} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-lg px-8 h-14 rounded-xl shadow-lg shadow-emerald-500/25"
                onClick={() => {
                  setInquiryOpen(true);
                  document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                무료 파일럿 신청하기
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-slate-500 text-slate-200 hover:bg-slate-700/50 text-lg px-8 h-14 rounded-xl"
                onClick={() => document.getElementById('solution')?.scrollIntoView({ behavior: 'smooth' })}
              >
                솔루션 자세히 보기
                <ChevronDown className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.h2 variants={fadeUp} custom={0} className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              이런 고민, 하고 계시지 않나요?
            </motion.h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: FileText, title: '사례관리 기록 지옥', desc: '이용자마다 사례관리 기록지 작성에 매번 30분 이상' },
              { icon: Clock, title: '프로그램 일지 야근', desc: '프로그램 운영일지 쓰느라 퇴근 후 1~2시간 추가 근무' },
              { icon: Users, title: '바우처 서류 부담', desc: '정부 양식에 맞춘 바우처 제공기록지 작성이 복잡' },
              { icon: Activity, title: '보호자 리포트 요청', desc: '보호자가 변화 리포트를 요구하지만 만들 시간이 없음' },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Card className="h-full border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 bg-white">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-6 h-6 text-red-400" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Document Automation Demo */}
      <section id="solution" className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.div variants={fadeUp} custom={0}>
              <Badge className="mb-4 bg-emerald-50 text-emerald-700 border-emerald-200">핵심 기능</Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              메모 3줄 → 완성 문서 3분
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-slate-500 max-w-xl mx-auto">
              직원이 간단히 메모만 입력하면, AI가 행정 양식에 맞는 공식 문서를 자동 생성합니다
            </motion.p>
          </motion.div>

          {/* Before/After */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <motion.div variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Card className="h-full border-red-200 bg-red-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-red-500" />
                    </div>
                    <h3 className="font-bold text-red-700">Before: 기존 방식</h3>
                  </div>
                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="flex items-start gap-2"><span className="text-red-400 shrink-0">✗</span> 사례관리 기록지 수기 작성 — 30분/건</div>
                    <div className="flex items-start gap-2"><span className="text-red-400 shrink-0">✗</span> 프로그램 운영일지 — 매일 퇴근 후 1시간</div>
                    <div className="flex items-start gap-2"><span className="text-red-400 shrink-0">✗</span> 바우처 제공기록지 — 양식 찾고 작성 30분</div>
                    <div className="flex items-start gap-2"><span className="text-red-400 shrink-0">✗</span> 보호자 리포트 — 요청 시 반나절 소요</div>
                    <div className="mt-4 p-3 bg-red-100 rounded-lg text-red-700 font-medium text-center">
                      일 평균 서류 작업: 2~3시간
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Card className="h-full border-emerald-300 bg-emerald-50/50 shadow-lg shadow-emerald-100">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-emerald-700">After: AIHPRO 도입 후</h3>
                  </div>
                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="flex items-start gap-2"><span className="text-emerald-500 shrink-0">✓</span> 메모 3줄 입력 → AI 사례관리 기록 — <strong>3분</strong></div>
                    <div className="flex items-start gap-2"><span className="text-emerald-500 shrink-0">✓</span> 활동 선택 → AI 프로그램 일지 — <strong>3분</strong></div>
                    <div className="flex items-start gap-2"><span className="text-emerald-500 shrink-0">✓</span> 자동 양식 적용 바우처 서류 — <strong>1분</strong></div>
                    <div className="flex items-start gap-2"><span className="text-emerald-500 shrink-0">✓</span> 보호자 리포트 자동 생성/발송 — <strong>자동</strong></div>
                    <div className="mt-4 p-3 bg-emerald-100 rounded-lg text-emerald-700 font-medium text-center">
                      일 평균 서류 작업: 15~20분 (80% 절감)
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* AI Document Types */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { 
                icon: FileText, color: 'blue', 
                title: 'AI 서류 자동화', 
                features: ['사례관리 기록지 자동 생성', '프로그램 운영일지 자동 생성', '바우처 제공기록지 (6종)', '세션/상담 기록지', 'PDF·워드 다운로드'] 
              },
              { 
                icon: Brain, color: 'emerald', 
                title: 'AI 인지건강 모니터링', 
                features: ['30종+ 인지·정서 검사', '이용자별 변화 추이 대시보드', '위험 신호 자동 알림', '보호자 리포트 자동 발송'] 
              },
              { 
                icon: BookOpen, color: 'amber', 
                title: 'AI 회고록 (Memory Legacy)', 
                features: ['어르신 음성 회고록 제작', 'AI 자서전 자동 편집', '가족 공유 앨범', '명절 선물용 제본 서비스'] 
              },
            ].map((item, i) => {
              const colorMap: Record<string, string> = {
                blue: 'bg-blue-50 text-blue-600',
                emerald: 'bg-emerald-50 text-emerald-600',
                amber: 'bg-amber-50 text-amber-600',
              };
              return (
                <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <Card className={`h-full border-slate-200 hover:shadow-xl transition-all duration-300 ${i === 0 ? 'ring-2 ring-emerald-300' : ''}`}>
                    {i === 0 && (
                      <div className="absolute -top-3 left-4">
                        <Badge className="bg-emerald-500 text-white"><Star className="w-3 h-3 mr-1" />핵심</Badge>
                      </div>
                    )}
                    <CardContent className="p-6 pt-8">
                      <div className={`w-12 h-12 rounded-xl ${colorMap[item.color]} flex items-center justify-center mb-4`}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-4">{item.title}</h3>
                      <ul className="space-y-2.5">
                        {item.features.map((f, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Value Props */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-8 md:p-12">
            <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">기관이 얻는 가치</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { metric: '서류 시간 80% 절감', desc: '일 2시간 → 20분', icon: Clock },
                { metric: '야근 제로', desc: '일지 작성 퇴근 전 완료', icon: Heart },
                { metric: '감사 대비 완벽', desc: '공식 양식 100% 충족', icon: Shield },
                { metric: '보호자 신뢰 UP', desc: '전문적 리포트 자동 발송', icon: TrendingUp },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-3">
                    <item.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="font-bold text-emerald-700 mb-1">{item.metric}</div>
                  <div className="text-sm text-slate-500">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.h2 variants={fadeUp} custom={0} className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              서류 자동화, 이 가격에 가능합니다
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-slate-500">
              파일럿 3개월 무료 → 데이터 확인 후 결정
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: '기본',
                price: '9.9',
                users: '이용자 30명',
                badge: null,
                features: ['AI 서류 자동화 (일지·기록지)', 'AI 인지·정서 검사 무제한', '이용자별 변화 추이', '직원 관리 대시보드', '월간 보호자 리포트'],
                cta: '파일럿 신청',
              },
              {
                name: '프로',
                price: '19.9',
                users: '이용자 80명',
                badge: '추천',
                features: ['기본 플랜 전체 포함', '사례관리 보고서 자동 생성', '보호자 리포트 자동 발송', '정부 바우처 서류 자동화', 'AI 회고록 월 10건', '위험 신호 알림'],
                cta: '파일럿 신청',
              },
              {
                name: '프리미엄',
                price: '29.9',
                users: '이용자 무제한',
                badge: '인기',
                features: ['프로 플랜 전체 포함', 'AI 회고록 무제한', '가족 공유 앨범', '기관 브랜딩 커스텀', '전담 CS 매니저'],
                cta: '파일럿 신청',
              },
            ].map((plan, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Card className={`h-full relative ${plan.badge === '추천' ? 'border-emerald-400 shadow-xl shadow-emerald-100' : 'border-slate-200'}`}>
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className={plan.badge === '추천' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}>
                        <Star className="w-3 h-3 mr-1" />{plan.badge}
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6 pt-8">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{plan.name}</h3>
                      <p className="text-sm text-slate-500 mb-4">{plan.users}</p>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-slate-900">₩{plan.price}</span>
                        <span className="text-slate-500">만/월</span>
                      </div>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full rounded-xl h-12 ${plan.badge === '추천' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
                      variant={plan.badge === '추천' ? 'default' : 'outline'}
                      onClick={() => {
                        setInquiryOpen(true);
                        setFormData(prev => ({ ...prev, message: `${plan.name} 플랜 (${plan.price}만원/월) 문의` }));
                        document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      {plan.cta}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-sm text-slate-400 mt-8">
            * 파일럿 3개월 무료 체험 후, 데이터 기반으로 도입 여부를 결정하실 수 있습니다.
          </p>
        </div>
      </section>

      {/* Use Case Scenario */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp} custom={0} className="text-2xl md:text-3xl font-bold text-slate-900 mb-10 text-center">
              도입 시나리오
            </motion.h2>
          </motion.div>
          <div className="space-y-6">
            {[
              { step: '1', title: '킥오프 (1주차)', desc: '기관 니즈 분석, 관리자 계정 발급, 이용자 등록', color: 'bg-blue-500' },
              { step: '2', title: '온보딩 (2주차)', desc: '직원 교육, 첫 검사 실행, 대시보드 세팅', color: 'bg-emerald-500' },
              { step: '3', title: '운영 (3~12주차)', desc: '주간/월간 리포트 자동 발송, 회고록 제작 시작', color: 'bg-amber-500' },
              { step: '4', title: '성과 분석 (13주차)', desc: '3개월 변화 추이 리포트 제공, 정식 계약 협의', color: 'bg-purple-500' },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="flex items-start gap-5"
              >
                <div className={`w-10 h-10 rounded-full ${item.color} text-white flex items-center justify-center font-bold shrink-0 text-sm`}>
                  {item.step}
                </div>
                <div className="flex-1 pb-6 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
            <motion.h2 variants={fadeUp} custom={0} className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              검증된 플랫폼
            </motion.h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '47개', label: '제휴 기관' },
              { value: '30종+', label: 'AI 검사' },
              { value: '39.6%', label: '검사 전환율' },
              { value: '23,000', label: '유튜브 구독자' },
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="text-center p-6 bg-white rounded-xl shadow-sm"
              >
                <div className="text-2xl md:text-3xl font-bold text-emerald-600 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="inquiry" className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
            <motion.h2 variants={fadeUp} custom={0} className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              무료 파일럿 신청
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-slate-500">
              3개월 무료로 직접 경험해보세요. 영업일 기준 1일 이내 연락드립니다.
            </motion.p>
          </motion.div>

          <Card className="border-slate-200 shadow-lg">
            <CardContent className="p-6 md:p-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">기관명 *</label>
                  <Input 
                    value={formData.institution_name}
                    onChange={e => setFormData(p => ({ ...p, institution_name: e.target.value }))}
                    placeholder="예: 행복 주간보호센터"
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">기관 유형</label>
                  <Input 
                    value={formData.institution_type}
                    onChange={e => setFormData(p => ({ ...p, institution_type: e.target.value }))}
                    placeholder="예: 주간보호센터"
                    className="h-11"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">담당자명 *</label>
                  <Input 
                    value={formData.contact_name}
                    onChange={e => setFormData(p => ({ ...p, contact_name: e.target.value }))}
                    placeholder="홍길동"
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">연락처 *</label>
                  <Input 
                    value={formData.contact_phone}
                    onChange={e => setFormData(p => ({ ...p, contact_phone: e.target.value }))}
                    placeholder="010-1234-5678"
                    className="h-11"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">이메일</label>
                  <Input 
                    type="email"
                    value={formData.contact_email}
                    onChange={e => setFormData(p => ({ ...p, contact_email: e.target.value }))}
                    placeholder="email@center.com"
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">이용자 수 (대략)</label>
                  <Input 
                    type="number"
                    value={formData.user_count}
                    onChange={e => setFormData(p => ({ ...p, user_count: e.target.value }))}
                    placeholder="30"
                    className="h-11"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">문의 내용</label>
                <Textarea 
                  value={formData.message}
                  onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                  placeholder="관심 있는 플랜이나 궁금한 점을 적어주세요"
                  rows={3}
                />
              </div>
              <Button 
                className="w-full h-13 text-lg bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-lg shadow-emerald-200"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? '접수 중...' : '무료 파일럿 신청하기'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-xs text-slate-400 text-center">
                * 신청 후 영업일 기준 1일 이내 담당자가 연락드립니다. 파일럿 기간 중 추가 비용은 없습니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            "보호자가 감동하면, 기관이 성장합니다"
          </h2>
          <p className="text-slate-400 mb-8">
            인지 케어 + AI 회고록. 어르신과 가족 모두를 위한<br />
            시장에 없는 유일한 통합 솔루션
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> b2b@aihpro.app
            </span>
            <span className="hidden sm:block">·</span>
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> 문의: 파일럿 신청 폼 이용
            </span>
            <span className="hidden sm:block">·</span>
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4" /> aihpro.app
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default B2BProposal;
