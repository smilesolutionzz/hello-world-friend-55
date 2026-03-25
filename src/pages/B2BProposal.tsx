import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, CheckCircle2, ArrowRight, 
  Users, Eye, Megaphone, TrendingUp, Star, Sparkles,
  Building2, Phone, Mail, Target, Zap, Award,
  ChevronDown, MousePointerClick, Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } })
};

const B2BProposal = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    institution_name: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    institution_type: '',
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
      const { error } = await supabase.from('b2b_ad_inquiries').insert({
        institution_name: formData.institution_name,
        contact_name: formData.contact_name,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email || 'N/A',
        institution_type: formData.institution_type || '기타',
        message: formData.message || null,
      });
      if (error) throw error;
      toast({ title: '광고 문의가 접수되었습니다!', description: '영업일 기준 1일 이내 연락드리겠습니다.' });
      setFormData({ institution_name: '', contact_name: '', contact_phone: '', contact_email: '', institution_type: '', message: '' });
    } catch (e: any) {
      toast({ title: '오류가 발생했습니다', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-violet-400 rounded-full blur-[150px]" />
        </div>
        <div className="relative container mx-auto px-4 py-20 md:py-28 max-w-5xl">
          <motion.div initial="hidden" animate="visible" className="text-center">
            <motion.div variants={fadeUp} custom={0}>
              <Badge className="mb-6 bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-sm px-4 py-1.5">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                AIHPRO 기관 광고 파트너
              </Badge>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              심리·건강 검사하러 온 유저에게<br />
              <span className="text-indigo-400">귀 기관을 바로 노출하세요</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-4">
              월 10,000+ 페이지뷰 · 39.6% 검사 전환율<br />
              <span className="text-indigo-300 font-medium">정밀 타겟팅된 심리·건강 관심 유저에게 직접 도달합니다</span>
            </motion.p>
            <motion.p variants={fadeUp} custom={3} className="text-sm text-slate-400 mb-10">
              병원 · 발달센터 · 상담센터 · 치료실 · 복지시설 · 클리닉
            </motion.p>
            <motion.div variants={fadeUp} custom={4} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-indigo-500 hover:bg-indigo-600 text-white text-lg px-8 h-14 rounded-xl shadow-lg shadow-indigo-500/25"
                onClick={() => document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' })}
              >
                광고 문의하기
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-slate-500 text-slate-200 hover:bg-slate-700/50 text-lg px-8 h-14 rounded-xl"
                onClick={() => document.getElementById('why')?.scrollIntoView({ behavior: 'smooth' })}
              >
                왜 AIHPRO인가?
                <ChevronDown className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '10,000+', label: '월간 페이지뷰', icon: Eye },
              { value: '39.6%', label: '검사 전환율', icon: MousePointerClick },
              { value: '23K', label: '유튜브 구독자', icon: Users },
              { value: '47개', label: '제휴 기관', icon: Building2 },
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="text-center p-5 rounded-xl bg-slate-50"
              >
                <stat.icon className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why AIHPRO */}
      <section id="why" className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.h2 variants={fadeUp} custom={0} className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              왜 AIHPRO에 광고해야 할까요?
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-slate-500 max-w-xl mx-auto">
              일반 광고 플랫폼과 달리, 이미 심리·건강에 관심이 높은 유저만 모여 있습니다
            </motion.p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                icon: Target, color: 'text-rose-500 bg-rose-50',
                title: '정밀 타겟 유저', 
                desc: '심리검사, 발달검사, 인지검사를 직접 수행하는 유저 → 이미 서비스 필요성을 느끼고 있는 고관여 잠재 고객' 
              },
              { 
                icon: TrendingUp, color: 'text-indigo-500 bg-indigo-50',
                title: '높은 전환율', 
                desc: '39.6% 검사 전환율 — 유저가 단순 방문이 아닌 "행동"을 하는 플랫폼. 광고 클릭 → 예약 전환 기대치 극대화' 
              },
              { 
                icon: Award, color: 'text-amber-500 bg-amber-50',
                title: '신뢰 기반 노출', 
                desc: '23K 유튜브 채널과 검증된 AI 검사 플랫폼에서의 노출 = 일반 배너 대비 높은 신뢰도와 브랜드 인지도' 
              },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Card className="h-full border-slate-200 hover:shadow-lg transition-all duration-300 bg-white">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ad Products */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.div variants={fadeUp} custom={0}>
              <Badge className="mb-4 bg-indigo-50 text-indigo-700 border-indigo-200">광고 상품</Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              기관에 딱 맞는 홍보 상품을 선택하세요
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: '스타터',
                price: '30',
                period: '월',
                badge: null,
                desc: '검사 결과 페이지 하단 배너',
                features: [
                  '검사 결과 페이지 배너 노출',
                  '기관 프로필 페이지 생성',
                  '월 노출 리포트 제공',
                  '기관 로고 + 한줄 소개',
                ],
              },
              {
                name: '프로',
                price: '70',
                period: '월',
                badge: '인기',
                desc: '검사 결과 + 메인 피드 노출',
                features: [
                  '스타터 전체 포함',
                  '메인 홈 피드 추천 기관 노출',
                  '검사 결과 내 "근처 전문기관" 추천',
                  '기관 상세 페이지 (소개·후기·예약링크)',
                  '클릭/전환 분석 대시보드',
                ],
              },
              {
                name: '프리미엄',
                price: '150',
                period: '월',
                badge: '최대효과',
                desc: '독점 카테고리 + 컨설팅',
                features: [
                  '프로 전체 포함',
                  '해당 검사 카테고리 독점 노출',
                  '유튜브 채널 공동 콘텐츠 (월 1회)',
                  '블로그/SEO 콘텐츠 제작',
                  'SNS 공동 마케팅',
                  '전담 광고 매니저',
                ],
              },
            ].map((plan, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Card className={`h-full relative ${plan.badge === '인기' ? 'border-indigo-400 shadow-xl shadow-indigo-100' : 'border-slate-200'}`}>
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className={plan.badge === '인기' ? 'bg-indigo-500 text-white' : 'bg-amber-500 text-white'}>
                        <Star className="w-3 h-3 mr-1" />{plan.badge}
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6 pt-8">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{plan.name}</h3>
                      <p className="text-xs text-slate-400 mb-4">{plan.desc}</p>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-slate-900">₩{plan.price}</span>
                        <span className="text-slate-500">만/{plan.period}</span>
                      </div>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full rounded-xl h-12 ${plan.badge === '인기' ? 'bg-indigo-500 hover:bg-indigo-600' : ''}`}
                      variant={plan.badge === '인기' ? 'default' : 'outline'}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, message: `${plan.name} 광고 상품 (${plan.price}만원/월) 문의` }));
                        document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      광고 문의하기
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-sm text-slate-400 mt-8">
            * 연간 계약 시 20% 할인. 첫 달 무료 체험 가능.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp} custom={0} className="text-2xl md:text-3xl font-bold text-slate-900 mb-10 text-center">
              광고 노출 방식
            </motion.h2>
          </motion.div>
          <div className="space-y-6">
            {[
              { step: '1', title: '유저가 심리검사 수행', desc: 'ADHD, 우울, 발달, 인지 등 30종+ 검사를 진행하며 자신의 상태를 확인', color: 'bg-indigo-500' },
              { step: '2', title: '검사 결과 페이지에서 기관 노출', desc: '검사 결과와 연관된 전문 기관이 "추천 전문기관"으로 자연스럽게 노출', color: 'bg-violet-500' },
              { step: '3', title: '유저가 기관 프로필 확인', desc: '기관 소개, 전문 분야, 위치, 후기, 예약 링크를 포함한 전용 프로필 페이지', color: 'bg-rose-500' },
              { step: '4', title: '예약/문의로 전환', desc: '유저가 기관에 직접 예약 또는 전화 문의 → 실질적 신규 고객 확보', color: 'bg-amber-500' },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="flex items-start gap-5"
              >
                <div className={`w-10 h-10 rounded-full ${item.color} text-white flex items-center justify-center font-bold shrink-0 text-sm`}>
                  {item.step}
                </div>
                <div className="flex-1 pb-6 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
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
              광고 문의하기
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-slate-500">
              첫 달 무료 체험으로 효과를 직접 확인하세요
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
                    placeholder="예: 마음힐링 심리상담센터"
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">기관 유형</label>
                  <Input 
                    value={formData.institution_type}
                    onChange={e => setFormData(p => ({ ...p, institution_type: e.target.value }))}
                    placeholder="예: 심리상담센터, 병원, 발달센터"
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
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">문의 내용</label>
                <Textarea 
                  value={formData.message}
                  onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                  placeholder="관심 있는 광고 상품이나 궁금한 점을 적어주세요"
                  rows={3}
                />
              </div>
              <Button 
                className="w-full h-13 text-lg bg-indigo-500 hover:bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? '접수 중...' : '광고 문의 접수하기'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-xs text-slate-400 text-center">
                * 영업일 기준 1일 이내 담당자가 연락드립니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            심리·건강 검사를 찾는 유저에게<br />
            귀 기관을 알리세요
          </h2>
          <p className="text-slate-400 mb-8">
            AIHPRO는 검사 → 결과 → 전문기관 연결까지<br />
            유저 여정 전체에서 자연스러운 광고 노출을 제공합니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> ad@aihpro.app
            </span>
            <span className="hidden sm:block">·</span>
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> 광고 문의 폼 이용
            </span>
            <span className="hidden sm:block">·</span>
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4" /> aihpro.app
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default B2BProposal;
