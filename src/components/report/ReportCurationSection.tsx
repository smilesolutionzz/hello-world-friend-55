import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaymentModal } from '@/components/payments/PaymentModal';
import { useSubscription } from '@/hooks/useSubscription';
import { useLanguage } from '@/i18n/LanguageContext';
import { SINGLE_REPORT_PRICE, SUBSCRIPTION_PRICE } from '@/constants/tokenCosts';
import {
  Brain, Heart, Users, Sparkles, Shield, Activity,
  ArrowRight, Crown, Zap, CheckCircle2, Lock
} from 'lucide-react';

interface CuratedTest {
  name: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  tag: 'free' | 'premium';
  color: string;
}

const CURATED_TESTS_KO: CuratedTest[] = [
  {
    name: '우울증 선별검사',
    description: '정서 상태를 빠르게 확인하는 AI 기반 검사',
    icon: <Heart className="w-5 h-5" />,
    path: '/assessment/depression',
    tag: 'free',
    color: 'from-pink-500 to-rose-500',
  },
  {
    name: '불안장애 선별검사',
    description: '만성 불안과 걱정 수준을 정밀 측정',
    icon: <Shield className="w-5 h-5" />,
    path: '/assessment/anxiety',
    tag: 'free',
    color: 'from-amber-500 to-orange-500',
  },
  {
    name: '회복탄력성 검사',
    description: '스트레스 대처 능력과 심리적 회복력 분석',
    icon: <Activity className="w-5 h-5" />,
    path: '/assessment/resilience',
    tag: 'premium',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    name: '관계 역동성 심층 분석',
    description: '대인관계 패턴과 애착 유형 분석',
    icon: <Users className="w-5 h-5" />,
    path: '/assessment/relationship-dynamics',
    tag: 'premium',
    color: 'from-violet-500 to-purple-500',
  },
  {
    name: '에너지 흐름 검사',
    description: '일상 에너지 분배와 번아웃 위험도 측정',
    icon: <Sparkles className="w-5 h-5" />,
    path: '/assessment/energy-flow',
    tag: 'premium',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    name: '자존감 검사',
    description: '자기 가치감과 자존감 수준 평가',
    icon: <Brain className="w-5 h-5" />,
    path: '/assessment/self-esteem',
    tag: 'free',
    color: 'from-cyan-500 to-blue-500',
  },
];

const CURATED_TESTS_EN: CuratedTest[] = [
  {
    name: 'Depression Screening',
    description: 'AI-powered emotional state assessment',
    icon: <Heart className="w-5 h-5" />,
    path: '/assessment/depression',
    tag: 'free',
    color: 'from-pink-500 to-rose-500',
  },
  {
    name: 'Anxiety Screening',
    description: 'Measure chronic anxiety and worry levels',
    icon: <Shield className="w-5 h-5" />,
    path: '/assessment/anxiety',
    tag: 'free',
    color: 'from-amber-500 to-orange-500',
  },
  {
    name: 'Resilience Assessment',
    description: 'Analyze stress coping and psychological resilience',
    icon: <Activity className="w-5 h-5" />,
    path: '/assessment/resilience',
    tag: 'premium',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    name: 'Relationship Dynamics Analysis',
    description: 'Diagnose interpersonal patterns and attachment types',
    icon: <Users className="w-5 h-5" />,
    path: '/assessment/relationship-dynamics',
    tag: 'premium',
    color: 'from-violet-500 to-purple-500',
  },
  {
    name: 'Energy Flow Assessment',
    description: 'Measure daily energy distribution and burnout risk',
    icon: <Sparkles className="w-5 h-5" />,
    path: '/assessment/energy-flow',
    tag: 'premium',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    name: 'Self-Esteem Scale (Rosenberg)',
    description: 'Evaluate self-worth and self-esteem levels',
    icon: <Brain className="w-5 h-5" />,
    path: '/assessment/self-esteem',
    tag: 'free',
    color: 'from-cyan-500 to-blue-500',
  },
];

interface ReportCurationSectionProps {
  concerns?: string;
}

const ReportCurationSection: React.FC<ReportCurationSectionProps> = () => {
  const navigate = useNavigate();
  const { isEnglish } = useLanguage();
  const { isPremiumUser, isLifetimeUser } = useSubscription();
  const [paymentOpen, setPaymentOpen] = useState(false);

  const isPremium = isPremiumUser() || isLifetimeUser();
  const tests = isEnglish ? CURATED_TESTS_EN : CURATED_TESTS_KO;

  return (
    <>
      <div className="space-y-6 pt-10 border-t-4 border-violet-200">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-100 rounded-full">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span className="text-xs font-bold text-violet-700">
              {isEnglish ? 'AI RECOMMENDED' : 'AI 맞춤 추천'}
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {isEnglish ? 'Recommended Assessments for You' : '리포트 기반 맞춤 검사 안내'}
          </h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            {isEnglish
              ? 'Based on your report analysis, these assessments can provide deeper insights.'
              : '분석 결과를 바탕으로, 더 정밀한 자기 이해를 위해 추천드리는 검사입니다.'}
          </p>
        </div>

        {/* 검사 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tests.map((test, index) => (
            <motion.div
              key={test.path}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => navigate(test.path)}
              className="group relative flex items-start gap-3 p-4 rounded-xl border-2 border-slate-100 hover:border-violet-200 bg-white hover:bg-violet-50/30 cursor-pointer transition-all"
            >
              <div className={`shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${test.color} flex items-center justify-center text-white shadow-sm`}>
                {test.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-sm font-bold text-slate-800 truncate">{test.name}</h4>
                  {test.tag === 'free' ? (
                    <Badge className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0 border-0 shrink-0">
                      {isEnglish ? 'FREE' : '무료'}
                    </Badge>
                  ) : (
                    <Badge className="bg-violet-100 text-violet-700 text-[10px] px-1.5 py-0 border-0 shrink-0">
                      <Lock className="w-2.5 h-2.5 mr-0.5" />
                      PRO
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">{test.description}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 transition-colors shrink-0 mt-1" />
            </motion.div>
          ))}
        </div>

        {/* CTA 섹션 */}
        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-violet-50 to-indigo-50 border-2 border-violet-200 rounded-2xl p-6 text-center space-y-4"
          >
            <h3 className="text-lg font-black text-slate-800">
              {isEnglish ? '🔓 Unlock All Premium Assessments' : '🔓 프리미엄 검사 모두 이용하기'}
            </h3>
            <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-600">
              {[
                isEnglish ? '✓ Unlimited deep analysis' : '✓ 무제한 심층 분석',
                isEnglish ? '✓ AI personalized insights' : '✓ AI 맞춤형 인사이트',
                isEnglish ? '✓ Expert-level reports' : '✓ 전문가급 리포트',
              ].map((benefit) => (
                <span key={benefit} className="flex items-center gap-1 px-2 py-1 bg-white rounded-full border border-violet-100">
                  {benefit}
                </span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => setPaymentOpen(true)}
                variant="outline"
                className="bg-white border-violet-300 text-violet-700 hover:bg-violet-50 gap-1.5"
              >
                <Zap className="w-4 h-4" />
                {isEnglish ? `1 Report ₩${SINGLE_REPORT_PRICE.toLocaleString()}` : `1회 이용 ₩${SINGLE_REPORT_PRICE.toLocaleString()}`}
              </Button>
              <Button
                onClick={() => navigate('/token-subscription')}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white gap-1.5"
              >
                <Crown className="w-4 h-4" />
                {isEnglish
                  ? `Unlimited ₩${SUBSCRIPTION_PRICE.toLocaleString()}/mo`
                  : `무제한 ₩${SUBSCRIPTION_PRICE.toLocaleString()}/월`}
              </Button>
            </div>
          </motion.div>
        )}

        {/* 구독자용 CTA */}
        {isPremium && (
          <div className="text-center">
            <Button
              onClick={() => navigate('/assessment')}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white gap-2 px-8"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isEnglish ? 'Go to All Assessments' : '전체 검사 보러가기'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <PaymentModal open={paymentOpen} onOpenChange={setPaymentOpen} mode="single" />
    </>
  );
};

export default ReportCurationSection;
