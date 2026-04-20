import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import {
  Building2,
  TrendingDown,
  TrendingUp,
  HeartPulse,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Users,
  Brain,
  LineChart,
} from 'lucide-react';
import { z } from 'zod';

const inquirySchema = z.object({
  organization_name: z.string().trim().min(1, '회사명을 입력해주세요').max(100),
  contact_person: z.string().trim().min(1, '담당자명을 입력해주세요').max(50),
  position: z.string().trim().max(50).optional(),
  email: z.string().trim().email('올바른 이메일을 입력해주세요').max(255),
  phone: z.string().trim().min(9, '전화번호를 입력해주세요').max(20),
  num_users: z.coerce.number().int().min(1).max(100000),
  message: z.string().trim().max(1000).optional(),
});

const tiers = [
  {
    label: '스타터',
    range: '10–49인',
    price: '₩17,900',
    unit: '/ 1인 · 30일',
    note: '소규모 팀 · 즉시 시작',
    highlight: false,
  },
  {
    label: '그로스',
    range: '50–199인',
    price: '₩14,900',
    unit: '/ 1인 · 30일',
    note: 'HR 대시보드 · 부서별 히트맵',
    highlight: true,
  },
  {
    label: '엔터프라이즈',
    range: '200인+',
    price: '맞춤 견적',
    unit: 'SLA · 전담 매니저',
    note: 'SSO · 보안 감사 · 온사이트 워크숍',
    highlight: false,
  },
];

const metrics = [
  {
    icon: TrendingDown,
    value: '-23%',
    label: '직원 이탈률',
    sub: '도입 6개월 평균',
  },
  {
    icon: TrendingUp,
    value: '+18%',
    label: '고용 유지율',
    sub: '12개월 추적 기준',
  },
  {
    icon: HeartPulse,
    value: '7.2 → 4.1',
    label: '번아웃 위험 지수',
    sub: 'PHQ·GAD 기반 정서 지수',
  },
];

const features = [
  { icon: Brain, title: '주간 마음 체크인', desc: '5분 내외 익명 설문 + 30일 정서 트렌드 자동 추적' },
  { icon: LineChart, title: '부서별 정서 대시보드', desc: '익명 처리된 데이터를 부서·직급별로 시각화하여 위험 부서 조기 발견' },
  { icon: ShieldCheck, title: '위기 신호 자동 알림', desc: '고위험 신호 감지 시 HR/EAP 담당자에게 즉시 알림 (개인 식별 불가)' },
  { icon: BarChart3, title: '월간 경영진 리포트', desc: '이탈률·유지율·웰빙 지수 변화를 PDF로 자동 생성하여 경영진 보고' },
];

const trustItems = [
  '익명 보장 · 개인정보 분리 보관',
  '직원 1인당 최소 정보만 수집',
  '데이터 위·수탁 계약(DPA) 제공',
  '국내 클라우드 리전 보관',
];

const BusinessSubscription: React.FC = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    organization_name: '',
    contact_person: '',
    position: '',
    email: '',
    phone: '',
    num_users: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = inquirySchema.safeParse(form);
    if (!parsed.success) {
      toast({
        title: '입력 확인 필요',
        description: parsed.error.issues[0].message,
        variant: 'destructive',
      });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('b2b_inquiries').insert({
        organization_name: parsed.data.organization_name,
        organization_type: 'corporate',
        contact_person: parsed.data.contact_person,
        position: parsed.data.position || null,
        email: parsed.data.email,
        phone: parsed.data.phone,
        num_users: parsed.data.num_users,
        service_interest: '30day_mind_track_business',
        message: parsed.data.message || null,
        status: 'new',
      });
      if (error) throw error;
      toast({
        title: '데모 신청이 접수되었습니다',
        description: '24시간 이내에 담당자가 연락드릴게요.',
      });
      setForm({
        organization_name: '',
        contact_person: '',
        position: '',
        email: '',
        phone: '',
        num_users: '',
        message: '',
      });
    } catch (err: any) {
      toast({
        title: '접수 실패',
        description: err.message || '잠시 후 다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>기업용 30일 마음 트랙 · AIHPRO</title>
        <meta
          name="description"
          content="사내 직원 정서를 30일 단위로 체크하고 이탈률을 줄이며 고용 유지율을 데이터로 높이는 기업용 구독 서비스."
        />
        <link rel="canonical" href="https://aihpro.app/subscription/business" />
      </Helmet>

      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero */}
        <section className="container mx-auto px-4 pt-16 pb-12 md:pt-24 md:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Building2 className="w-3 h-3 mr-1" />
              기업 전용 · For HR Teams
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-5 break-keep">
              직원의 마음을 데이터로 지키는<br className="hidden md:block" />
              <span className="text-primary">30일 마음 트랙 · 기업용</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground break-keep leading-relaxed">
              사내 정서를 매주 익명으로 체크하고, 부서별 번아웃·이탈 위험을 미리 발견하세요.<br />
              <strong className="text-foreground">이탈률은 낮추고 고용 유지율은 데이터로 끌어올립니다.</strong>
            </p>
          </motion.div>

          {/* Metric strip */}
          <div className="grid md:grid-cols-3 gap-4 mt-12 max-w-4xl mx-auto">
            {metrics.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-0 shadow-sm bg-white">
                  <CardContent className="p-6 text-center">
                    <m.icon className="w-6 h-6 mx-auto mb-3 text-primary" />
                    <p className="text-3xl font-bold text-foreground">{m.value}</p>
                    <p className="text-sm font-medium mt-1">{m.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{m.sub}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">HR 담당자가 매일 쓰는 4가지 기능</h2>
            <p className="text-muted-foreground">설문지·엑셀·외부 EAP 없이 한 화면에서 끝납니다.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {features.map((f, i) => (
              <Card key={i} className="border-border/50 hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground break-keep leading-relaxed">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Pricing tiers */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">인원 구간별 패키지</h2>
            <p className="text-muted-foreground">사내 인원수에 맞춰 자동 계산됩니다 · 모든 플랜 7일 무료 체험</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {tiers.map((t, i) => (
              <Card
                key={i}
                className={`relative ${
                  t.highlight
                    ? 'border-primary border-2 shadow-lg scale-[1.02]'
                    : 'border-border/50'
                }`}
              >
                {t.highlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    가장 많이 선택
                  </Badge>
                )}
                <CardContent className="p-7">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{t.range}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4">{t.label}</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold">{t.price}</span>
                    <span className="text-sm text-muted-foreground ml-1">{t.unit}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-5">{t.note}</p>
                  <Button
                    variant={t.highlight ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => document.getElementById('demo-form')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    무료 데모 신청
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Trust */}
        <section className="container mx-auto px-4 py-8">
          <Card className="max-w-4xl mx-auto bg-slate-50 border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">데이터 보안 & 직원 프라이버시</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {trustItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Demo form */}
        <section id="demo-form" className="container mx-auto px-4 py-16 md:py-20">
          <Card className="max-w-2xl mx-auto border-2 border-primary/20 shadow-xl">
            <CardContent className="p-8 md:p-10">
              <div className="text-center mb-8">
                <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">무료 데모</Badge>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">담당자에게 30분 데모받기</h2>
                <p className="text-sm text-muted-foreground">
                  영업일 기준 24시간 이내 연락드립니다 · 가입·결제 의무 없음
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="org">회사명 *</Label>
                    <Input
                      id="org"
                      value={form.organization_name}
                      onChange={(e) => setForm({ ...form, organization_name: e.target.value })}
                      placeholder="(주) 아이에이치프로"
                      maxLength={100}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="users">사내 인원수 *</Label>
                    <Input
                      id="users"
                      type="number"
                      min={1}
                      value={form.num_users}
                      onChange={(e) => setForm({ ...form, num_users: e.target.value })}
                      placeholder="예) 50"
                      required
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">담당자명 *</Label>
                    <Input
                      id="name"
                      value={form.contact_person}
                      onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                      placeholder="홍길동"
                      maxLength={50}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">직책</Label>
                    <Input
                      id="position"
                      value={form.position}
                      onChange={(e) => setForm({ ...form, position: e.target.value })}
                      placeholder="HR팀장"
                      maxLength={50}
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">업무 이메일 *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="hr@company.com"
                      maxLength={255}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">연락처 *</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="010-0000-0000"
                      maxLength={20}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="message">전하실 메시지 (선택)</Label>
                  <Textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="현재 겪고 있는 조직 이슈나 도입 시기 등을 알려주세요."
                    maxLength={1000}
                    rows={3}
                  />
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? '접수 중...' : '무료 데모 신청하기'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  제출 시 개인정보 처리방침에 동의하는 것으로 간주됩니다.
                </p>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
};

export default BusinessSubscription;
