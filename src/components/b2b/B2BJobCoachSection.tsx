import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Heart, ShieldCheck, TrendingDown, Users2, MessageCircle, BarChart3, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { JobCoachPricingTiers } from './JobCoachPricingTiers';
import { JobCoachInquiryDialog } from './JobCoachInquiryDialog';
import { useNavigate } from 'react-router-dom';

const VALUE_PROPS = [
  {
    icon: ShieldCheck,
    title: '완전 익명 보장',
    desc: 'HR은 개인 데이터 절대 열람 불가. 부서별 집계 지표만 제공해 임직원 신뢰 확보.',
    color: 'emerald',
  },
  {
    icon: Heart,
    title: '휴먼터치 코칭',
    desc: '검증된 임상 전문가 50+ 풀과 카톡·줌으로 1:1 익명 상담. AI는 매칭, 사람은 마음.',
    color: 'rose',
  },
  {
    icon: TrendingDown,
    title: '이직률 30% 감소 목표',
    desc: '번아웃·이직 위험을 조기 감지해 골든타임에 개입. 평균 1인 이직비용 ₩7,000만.',
    color: 'blue',
  },
  {
    icon: BarChart3,
    title: '월간 조직 진단',
    desc: '부서별 정신건강·번아웃·만족도 리포트로 HR 의사결정을 데이터 기반으로 전환.',
    color: 'purple',
  },
];

const FLOW_STEPS = [
  { num: '01', title: '익명 진단', desc: '월 1회 5분 체크인으로 번아웃·스트레스 자동 측정', icon: Sparkles },
  { num: '02', title: 'AI 1차 코칭', desc: '24시간 익명 AI 챗봇이 즉각 대응 + 위험군 식별', icon: MessageCircle },
  { num: '03', title: '전문가 매칭', desc: '필요 시 검증된 코치와 카톡/줌 연결 (15분~50분)', icon: Users2 },
  { num: '04', title: 'HR 인사이트', desc: '부서별 집계 리포트로 조직 문화 개선 액션 도출', icon: BarChart3 },
];

interface Props {
  /** /b2b-proposal 내부에서 사용 시 변형 */
  embedded?: boolean;
}

export const B2BJobCoachSection: React.FC<Props> = ({ embedded = false }) => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | undefined>();

  const handleSelect = (tier: string) => {
    setSelectedTier(tier);
    setDialogOpen(true);
  };

  return (
    <section className={embedded ? 'py-16' : 'py-20 md:py-28'}>
      <div className="max-w-6xl mx-auto px-4">
        {/* 히어로 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full mb-4">
            <Briefcase className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              B2B Job Coach
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 break-keep leading-tight">
            직장 내 정신건강을<br />
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              AI + 휴먼 코치
            </span>
            로 케어합니다
          </h2>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto break-keep leading-relaxed">
            번아웃·이직위험을 조기 감지하고, 검증된 임상 전문가와 익명으로 연결하는
            <strong className="text-slate-900"> 차세대 EAP</strong>입니다.
            기존 EAP 대비 <strong className="text-primary">60% 저렴</strong>한 비용으로 시작하세요.
          </p>
        </motion.div>

        {/* 가치 제안 4개 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {VALUE_PROPS.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="p-5 h-full bg-white border border-border hover:shadow-lg transition-shadow">
                  <div className={`inline-flex p-2.5 rounded-xl bg-${v.color}-100 text-${v.color}-700 mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1.5 break-keep">{v.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed break-keep">{v.desc}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* 4단계 플로우 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-border p-6 md:p-10 mb-16"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 break-keep">
              임직원 한 명이 겪는 4단계 플로우
            </h3>
            <p className="text-sm text-slate-600 break-keep">
              모든 데이터는 익명 처리되며 HR은 집계만 확인합니다
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {FLOW_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative">
                  <div className="bg-white rounded-2xl p-5 border border-border h-full">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-black text-primary">{step.num}</span>
                      <Icon className="w-5 h-5 text-slate-400" />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1.5 break-keep">{step.title}</h4>
                    <p className="text-xs text-slate-600 break-keep leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 가격 플랜 */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 break-keep">
              회사 규모에 맞는 3가지 플랜
            </h3>
            <p className="text-sm text-slate-600 break-keep">
              30일 무료 시범 운영 · 도입 후 만족도 80% 미달 시 100% 환불
            </p>
          </div>
          <JobCoachPricingTiers onSelectPlan={handleSelect} />
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-slate-900 text-white p-8 md:p-12 text-center"
        >
          <h3 className="text-2xl md:text-3xl font-black mb-3 break-keep">
            지금 우리 회사의 마음 건강을 점검해보세요
          </h3>
          <p className="text-sm md:text-base text-slate-300 mb-6 max-w-xl mx-auto break-keep">
            샘플 HR 대시보드와 부서별 진단 리포트 데모를 보여드립니다. 30분이면 충분합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 px-8"
              onClick={() => setDialogOpen(true)}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              무료 도입 상담 신청
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white font-bold h-12 px-8"
              onClick={() => navigate('/b2b-demo-report')}
            >
              샘플 리포트 미리보기
            </Button>
          </div>
        </motion.div>
      </div>

      <JobCoachInquiryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultTier={selectedTier}
      />
    </section>
  );
};

export default B2BJobCoachSection;
