import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, Calendar, TrendingUp, Heart, Target, CheckCircle2,
  ArrowRight, Award, BarChart3, Compass, Shield, Zap, Quote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import Footer from '@/components/ui/footer';
import SEOHead from '@/components/common/SEOHead';
import CoachingBadge from '@/components/branding/CoachingBadge';
import { MedicalDisclaimer } from '@/components/legal/MedicalDisclaimer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TRACK_PRICE = 19900;

const focusGoals = [
  { id: 'sleep', icon: '🌙', title: '깊은 수면 회복', desc: '잠 못 드는 밤, 무거운 아침에서 벗어나기' },
  { id: 'stress', icon: '🌿', title: '스트레스 다스리기', desc: '일상 속 긴장과 압박감을 다루는 힘 기르기' },
  { id: 'mood', icon: '☀️', title: '감정 안정', desc: '오르내리는 기분을 부드럽게 조율하기' },
  { id: 'focus', icon: '🎯', title: '집중력 회복', desc: '산만함을 줄이고 일상 효율 끌어올리기' },
  { id: 'relationship', icon: '🤝', title: '관계 개선', desc: '가족·동료와의 소통 결을 다듬기' },
  { id: 'self', icon: '🪞', title: '자기 이해 심화', desc: '내 패턴을 알고 새로운 루틴 만들기' },
];

const dailyFlow = [
  { day: '1일차', title: '베이스라인 진단', desc: '4가지 핵심 검사로 출발점 측정' },
  { day: '2~7일차', title: '습관 설계 주간', desc: '하루 3분, AI가 제안하는 마이크로 루틴' },
  { day: '8~21일차', title: '실천 & 추적', desc: '일일 체크인 + 주간 인사이트 리포트' },
  { day: '22~29일차', title: '심화 코칭', desc: '맞춤 워크북 + 1:1 AI 코파일럿 상담' },
  { day: '30일차', title: '변화 리포트', desc: 'Before/After 그래프 + 다음 30일 가이드' },
];

const benchmarkBadges = [
  { label: 'Calm 검증 모델', desc: '$2B 평가받은 라이프스타일 코칭 구조' },
  { label: 'Noom 30일 트랙', desc: 'IPO 검증된 행동 변화 프로그램 패턴' },
  { label: 'Wysa AI Coach', desc: '영국 NHS 채택 디지털 코치 프레임' },
];

const MindTrack: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleStart = async () => {
    if (!selectedGoal) {
      toast.error('먼저 집중 목표를 하나 선택해주세요');
      return;
    }
    if (!user) {
      navigate('/auth?redirect=/mind-track');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('mind_track_enrollments').insert({
        user_id: user.id,
        track_type: 'mind_30day',
        goal_focus: selectedGoal,
        payment_status: 'pending',
        payment_amount: TRACK_PRICE,
      });
      if (error) throw error;
      toast.success('등록 완료! 결제 페이지로 이동합니다.');
      navigate('/pricing?product=mind_track_30');
    } catch (e: any) {
      toast.error(e.message || '등록 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="30일 마음 변화 트랙 · AIHPRO 마음 코칭"
        description="30일간 측정 가능한 마음의 변화. 베이스라인 진단부터 일일 코칭, 변화 리포트까지. 비의료 발달 코칭 도구."
        canonicalUrl="https://aihpro.app/mind-track"
      />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30">
        <UnifiedNavigation />

        {/* Hero */}
        <section className="relative pt-28 pb-16 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex justify-center gap-2">
                <CoachingBadge variant="pill" />
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  킬러 상품
                </Badge>
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight break-keep">
                30일 후, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">달라진 나</span>를<br />
                숫자로 확인하세요
              </h1>

              <p className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto break-keep leading-relaxed">
                Calm·Noom·Wysa 글로벌 모델을 한국형으로 재설계한<br className="hidden md:block" />
                <strong className="text-slate-900">측정 가능한 마음 변화 프로그램</strong>
              </p>

              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {benchmarkBadges.map((b) => (
                  <div key={b.label} className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 shadow-sm">
                    <strong className="text-slate-900">{b.label}</strong> · {b.desc}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-4 pt-4">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-slate-900">₩19,900</div>
                  <div className="text-xs text-slate-500 line-through">₩39,800</div>
                </div>
                <div className="text-left text-sm text-slate-600">
                  <div className="font-semibold text-slate-900">론칭 50% 할인</div>
                  <div>구독 회원은 무료 포함</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Goal Selection */}
        <section className="px-4 pb-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">먼저, 30일 동안 집중할 목표를 골라주세요</h2>
              <p className="text-slate-600">선택한 목표에 맞춰 일일 코칭이 자동 설계됩니다</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {focusGoals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal.id)}
                  className={`p-4 md:p-5 rounded-2xl border-2 text-left transition-all ${
                    selectedGoal === goal.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02]'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{goal.icon}</div>
                  <div className="font-bold text-slate-900 text-sm md:text-base mb-1">{goal.title}</div>
                  <div className="text-xs text-slate-500 break-keep">{goal.desc}</div>
                  {selectedGoal === goal.id && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-2" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 30 Day Flow */}
        <section className="px-4 pb-16 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-5xl mx-auto py-12">
            <div className="text-center mb-10">
              <Calendar className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">30일, 이렇게 진행됩니다</h2>
              <p className="text-slate-600">하루 3~5분, 부담 없이 누적되는 변화</p>
            </div>
            <div className="space-y-3">
              {dailyFlow.map((step, i) => (
                <motion.div
                  key={step.day}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 bg-white p-4 md:p-5 rounded-2xl border border-slate-200"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-blue-600">{step.day}</span>
                      <h3 className="font-bold text-slate-900">{step.title}</h3>
                    </div>
                    <p className="text-sm text-slate-600 mt-1 break-keep">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Value Pillars */}
        <section className="px-4 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">왜 이 트랙이 다른가</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-blue-100">
                <CardContent className="p-6 space-y-3">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                  <h3 className="font-bold text-slate-900">측정 가능한 변화</h3>
                  <p className="text-sm text-slate-600 break-keep">
                    RCI(신뢰변화지수) 기반으로 1일차 vs 30일차를 통계적으로 비교. 단순 후기가 아닌 데이터로 증명.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-purple-100">
                <CardContent className="p-6 space-y-3">
                  <Zap className="w-8 h-8 text-purple-600" />
                  <h3 className="font-bold text-slate-900">매일 3분, 부담 ZERO</h3>
                  <p className="text-sm text-slate-600 break-keep">
                    명상 앱처럼 길지 않고, 검사처럼 무겁지 않습니다. 출근길·점심시간에 끝나는 마이크로 루틴.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-amber-100">
                <CardContent className="p-6 space-y-3">
                  <Shield className="w-8 h-8 text-amber-600" />
                  <h3 className="font-bold text-slate-900">의료가 아닌 코칭</h3>
                  <p className="text-sm text-slate-600 break-keep">
                    진단·치료가 아닌 자기이해·습관설계·웰빙 가이드. 누구나 안심하고 시작할 수 있습니다.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-16 bg-gradient-to-br from-blue-600 to-purple-600">
          <div className="max-w-3xl mx-auto text-center text-white space-y-6">
            <Award className="w-12 h-12 mx-auto opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold break-keep">
              30일 후, 숫자로 증명되는 변화
            </h2>
            <p className="text-white/90 text-base md:text-lg break-keep">
              지금 시작하면 ₩19,900 (정가 ₩39,800)<br />
              만족하지 않으면 14일 내 100% 환불
            </p>
            <div className="pt-2">
              <Button
                size="lg"
                onClick={handleStart}
                disabled={loading}
                className="bg-white text-blue-700 hover:bg-slate-100 text-lg px-8 py-6 h-auto rounded-2xl shadow-2xl font-bold"
              >
                {loading ? '등록 중...' : (
                  <>
                    {selectedGoal ? '30일 트랙 시작하기' : '먼저 목표를 선택해주세요'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
            <p className="text-white/70 text-xs">
              결제는 다음 단계에서 진행됩니다 · 안전한 토스페이먼츠 결제
            </p>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="px-4 py-8 max-w-4xl mx-auto">
          <MedicalDisclaimer variant="full" />
        </section>

        <Footer />
      </div>
    </>
  );
};

export default MindTrack;
