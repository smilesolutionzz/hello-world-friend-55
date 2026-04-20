import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Calendar, CheckCircle2, ArrowRight, Award, BarChart3,
  Shield, Zap, Loader2, Lightbulb, Target, Heart, MessageSquareHeart, Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import Footer from '@/components/ui/footer';
import SEOHead from '@/components/common/SEOHead';
import CoachingBadge from '@/components/branding/CoachingBadge';
import { MedicalDisclaimer } from '@/components/legal/MedicalDisclaimer';
import HumanTouchManifesto from '@/components/branding/HumanTouchManifesto';
import { SmartScrollReveal } from '@/components/ui/smart-scroll-reveal';
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
  { id: 'parenting', icon: '🤱', title: '육아 번아웃 회복', desc: '엄마·아빠의 지친 마음을 회복하는 30일' },
  { id: 'child_development', icon: '🌱', title: '아이 발달 코칭', desc: '연령별 발달 포인트와 부모 대응법 익히기' },
  { id: 'family_communication', icon: '💕', title: '아이와의 소통', desc: '훈육 갈등 줄이고 안정 애착 만들기' },
];

const dailyFlow = [
  { day: '1일차', title: '나의 출발점 기록', desc: '간단한 셀프 체크로 지금의 나를 정리' },
  { day: '2~7일차', title: '하루 3분 마음 루틴', desc: '맞춤 마이크로 액션을 매일 안내' },
  { day: '8~21일차', title: '실천하며 기록하기', desc: '매일 체크인 + 주간 인사이트 정리본' },
  { day: '22~29일차', title: '깊이 있는 코칭', desc: '맞춤 워크북과 AI 코파일럿 1:1 대화' },
  { day: '30일차', title: '나의 변화 리포트', desc: '시작과 지금을 비교하고 다음 한 달 가이드' },
];

interface ConcernReport {
  summary: string;
  rootCauses: string[];
  currentState: { stress: number; energy: number; clarity: number };
  quickActions: string[];
  trackRecommendation: {
    matchedGoal: string;
    reason: string;
    expectedChange: string;
  };
}

const MindTrack: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 고민 진단 리포트
  const [concern, setConcern] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [report, setReport] = useState<ConcernReport | null>(null);
  const [polishing, setPolishing] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  const examplePlaceholders = [
    '예) 요즘 잠자리에 누우면 잡생각이 멈추질 않고, 아침마다 너무 무기력해요...',
    '예) 회사에서 작은 일에도 짜증이 나고, 퇴근 후엔 아무것도 하기 싫어요.',
    '예) 아이가 말을 안 듣는데 화부터 나서, 그러고 나면 또 죄책감이 들어요.',
    '예) 사람들 앞에 서면 심장이 두근거리고 머릿속이 하얘져요.',
    '예) 미래가 막막해서 자꾸 불안하고, 작은 일도 결정하기가 힘들어요.',
    '예) 남편(아내)과 대화만 하면 싸우게 되고, 점점 거리감이 느껴져요.',
    '예) 다이어트를 시작했다가 무너지고를 반복해서 자존감이 바닥이에요.',
    '예) 친구 관계에서 자꾸 눈치를 보게 되고, 진짜 내 모습을 잃은 것 같아요.',
  ];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  // 입력값이 비어있을 때만 5초마다 예시 placeholder 회전
  useEffect(() => {
    if (concern.length > 0) return;
    const t = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % examplePlaceholders.length);
    }, 5000);
    return () => clearInterval(t);
  }, [concern.length, examplePlaceholders.length]);

  const handlePolish = async () => {
    if (concern.trim().length < 2) {
      toast.error('다듬을 내용을 조금 더 적어주세요');
      return;
    }
    setPolishing(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'mind-track-concern-polish',
        { body: { concern: concern.trim() } }
      );
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.polished) {
        setConcern(data.polished);
        toast.success('AI가 자연스럽게 다듬었어요');
      }
    } catch (e: any) {
      toast.error(e.message || '다듬기에 실패했습니다');
    } finally {
      setPolishing(false);
    }
  };

  const handleGenerateReport = async () => {
    if (concern.trim().length < 5) {
      toast.error('고민을 조금 더 자세히 적어주세요 (5자 이상)');
      return;
    }
    setReportLoading(true);
    setReport(null);
    try {
      const { data, error } = await supabase.functions.invoke(
        'mind-track-concern-report',
        { body: { concern: concern.trim(), goal: selectedGoal } }
      );
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setReport(data as ConcernReport);

      // AI가 추천한 목표를 자동 선택
      if (data?.trackRecommendation?.matchedGoal) {
        setSelectedGoal(data.trackRecommendation.matchedGoal);
      }

      // 결과 섹션으로 부드럽게 스크롤
      setTimeout(() => {
        document.getElementById('concern-report-result')?.scrollIntoView({
          behavior: 'smooth', block: 'start',
        });
      }, 200);
    } catch (e: any) {
      toast.error(e.message || '리포트 생성에 실패했습니다');
    } finally {
      setReportLoading(false);
    }
  };

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

  const recommendedGoal = report
    ? focusGoals.find((g) => g.id === report.trackRecommendation.matchedGoal)
    : null;

  return (
    <>
      <SEOHead
        title="30일 마음 변화 트랙 · 무료 고민 리포트"
        description="고민을 적으면 즉석 마음 리포트가 나오고, 나에게 맞춤 30일 변화 트랙을 제안받을 수 있어요."
        canonicalUrl="https://aihpro.app/mind-track"
      />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30">
        <UnifiedNavigation />

        {/* Hero */}
        <section className="relative pt-28 pb-10 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-5"
            >
              <div className="flex justify-center gap-2 flex-wrap">
                <CoachingBadge variant="pill" />
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  무료 고민 리포트 + 30일 트랙
                </Badge>
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight break-keep">
                지금 마음에 걸리는 고민,<br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  3분 안에 정리해드릴게요
                </span>
              </h1>

              <p className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto break-keep leading-relaxed">
                고민을 한 줄 적으면 <strong className="text-slate-900">즉석 마음 리포트</strong>를 받고,<br className="hidden md:block" />
                나에게 꼭 맞는 <strong className="text-slate-900">30일 변화 트랙</strong>을 제안받을 수 있어요.
              </p>
            </motion.div>
          </div>
        </section>

        {/* 휴먼터치 매니페스토 — 따뜻형 카드 */}
        <SmartScrollReveal kind="text" className="px-4 pb-8 block">
          <HumanTouchManifesto variant="track" />
        </SmartScrollReveal>

        {/* 무료 고민 리포트 입력 */}
        <section className="px-4 pb-12">
          <div className="max-w-3xl mx-auto">
            <Card className="border-2 border-blue-100 shadow-xl bg-white">
              <CardContent className="p-6 md:p-8 space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center flex-shrink-0">
                    <MessageSquareHeart className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg md:text-xl font-bold text-slate-900">
                        무료 고민 리포트 받기
                      </h2>
                      <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-700 bg-emerald-50">
                        무료 · 비로그인 OK
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">
                      어떤 고민이든 편하게 적어주세요. 판단하지 않고 따뜻하게 정리해드려요.
                    </p>
                  </div>
                </div>

                <Textarea
                  value={concern}
                  onChange={(e) => setConcern(e.target.value)}
                  placeholder={examplePlaceholders[placeholderIdx]}
                  className="min-h-[120px] resize-none text-base leading-relaxed border-slate-200 focus:border-blue-400 transition-all"
                  maxLength={500}
                  disabled={reportLoading || polishing}
                />

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{concern.length} / 500</span>
                    <span className="hidden sm:inline">입력하신 내용은 저장되지 않아요</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePolish}
                    disabled={polishing || reportLoading || concern.trim().length < 2}
                    className="h-8 text-xs gap-1.5 border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
                  >
                    {polishing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        다듬는 중...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        AI로 자연스럽게 다듬기
                      </>
                    )}
                  </Button>
                </div>

                <Button
                  onClick={handleGenerateReport}
                  disabled={reportLoading || concern.trim().length < 5}
                  className="w-full h-13 py-4 text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl"
                >
                  {reportLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      마음을 들여다보는 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      무료 리포트 받기
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 고민 리포트 결과 */}
        <AnimatePresence>
          {report && (
            <motion.section
              id="concern-report-result"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="px-4 pb-16"
            >
              <div className="max-w-3xl mx-auto space-y-5">
                {/* Summary */}
                <Card className="border-blue-100 shadow-md">
                  <CardContent className="p-6 md:p-7 space-y-4">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-500" />
                      <h3 className="font-bold text-slate-900 text-lg">지금 마음 들여다보기</h3>
                    </div>
                    <p className="text-slate-700 leading-relaxed break-keep">{report.summary}</p>
                  </CardContent>
                </Card>

                {/* Current state bars */}
                <Card className="border-slate-100 shadow-sm">
                  <CardContent className="p-6 md:p-7 space-y-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-500" />
                      <h3 className="font-bold text-slate-900 text-lg">현재 마음 상태</h3>
                    </div>
                    <div className="space-y-4">
                      <StateBar label="스트레스 부담감" value={report.currentState.stress} color="rose" inverse />
                      <StateBar label="마음의 에너지" value={report.currentState.energy} color="amber" />
                      <StateBar label="생각의 명료함" value={report.currentState.clarity} color="emerald" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      ※ 셀프 리포트 기반 추정치. 의료적 진단이 아니에요.
                    </p>
                  </CardContent>
                </Card>

                {/* Root causes */}
                {report.rootCauses?.length > 0 && (
                  <Card className="border-slate-100 shadow-sm">
                    <CardContent className="p-6 md:p-7 space-y-4">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        <h3 className="font-bold text-slate-900 text-lg">짚어볼 만한 원인</h3>
                      </div>
                      <ul className="space-y-2">
                        {report.rootCauses.map((c, i) => (
                          <li key={i} className="flex gap-2 text-slate-700 text-sm leading-relaxed">
                            <span className="text-amber-500 font-bold flex-shrink-0">{i + 1}.</span>
                            <span className="break-keep">{c}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Quick actions */}
                {report.quickActions?.length > 0 && (
                  <Card className="border-emerald-100 shadow-sm bg-emerald-50/30">
                    <CardContent className="p-6 md:p-7 space-y-4">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-bold text-slate-900 text-lg">오늘 바로 해볼 수 있는 것</h3>
                      </div>
                      <ul className="space-y-2.5">
                        {report.quickActions.map((a, i) => (
                          <li key={i} className="flex gap-2.5 text-slate-700 text-sm leading-relaxed">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span className="break-keep">{a}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Track recommendation */}
                <Card className="border-2 border-blue-200 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50">
                  <CardContent className="p-6 md:p-8 space-y-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-slate-900 text-lg">
                        이 고민에 딱 맞는 30일 트랙
                      </h3>
                    </div>

                    {recommendedGoal && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-blue-100">
                        <div className="text-3xl">{recommendedGoal.icon}</div>
                        <div>
                          <div className="font-bold text-slate-900">{recommendedGoal.title}</div>
                          <div className="text-xs text-slate-500">{recommendedGoal.desc}</div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="font-semibold text-slate-900 mb-1">왜 이 트랙인가요?</div>
                        <p className="text-slate-700 leading-relaxed break-keep">
                          {report.trackRecommendation.reason}
                        </p>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 mb-1">30일 후, 기대되는 변화</div>
                        <p className="text-slate-700 leading-relaxed break-keep">
                          {report.trackRecommendation.expectedChange}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <div className="text-2xl font-bold text-slate-900">₩19,900</div>
                        <div className="text-xs text-slate-500 line-through">₩39,800 · 14일 환불</div>
                      </div>
                      <Button
                        onClick={() => {
                          document.getElementById('goal-section')?.scrollIntoView({
                            behavior: 'smooth', block: 'start',
                          });
                        }}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 px-6 rounded-xl font-bold"
                      >
                        30일 트랙으로 이어가기
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Goal Selection */}
        <SmartScrollReveal kind="cards" className="block">
          <section id="goal-section" className="px-4 pb-16 scroll-mt-24">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  30일 동안 집중할 목표를 골라주세요
                </h2>
                <p className="text-slate-600">선택한 목표에 맞춰 일일 코칭이 자동 설계돼요</p>
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
        </SmartScrollReveal>

        {/* 30 Day Flow */}
        <section className="px-4 pb-16 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-5xl mx-auto py-12">
            <div className="text-center mb-10">
              <Calendar className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">30일, 이렇게 진행돼요</h2>
              <p className="text-slate-600">하루 3~5분, 부담 없이 누적되는 변화</p>
            </div>
            <div className="space-y-3">
              {dailyFlow.map((step, i) => (
                <motion.div
                  key={step.day}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
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
        <SmartScrollReveal kind="stats" className="block">
          <section className="px-4 py-16">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">왜 이 트랙이 다를까요</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="border-blue-100">
                  <CardContent className="p-6 space-y-3">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                    <h3 className="font-bold text-slate-900">눈에 보이는 변화</h3>
                    <p className="text-sm text-slate-600 break-keep">
                      1일차와 30일차의 셀프 체크 결과를 한눈에 비교. 막연한 후기가 아닌 내 데이터로 확인.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-purple-100">
                  <CardContent className="p-6 space-y-3">
                    <Zap className="w-8 h-8 text-purple-600" />
                    <h3 className="font-bold text-slate-900">매일 3분, 부담 ZERO</h3>
                    <p className="text-sm text-slate-600 break-keep">
                      명상 앱처럼 길지 않고, 검사처럼 무겁지 않아요. 출근길·점심시간에 끝나는 짧은 루틴.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-amber-100">
                  <CardContent className="p-6 space-y-3">
                    <Shield className="w-8 h-8 text-amber-600" />
                    <h3 className="font-bold text-slate-900">의료가 아닌 코칭</h3>
                    <p className="text-sm text-slate-600 break-keep">
                      진단·치료가 아닌 자기이해·습관설계·웰빙 가이드. 누구나 안심하고 시작할 수 있어요.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </SmartScrollReveal>

        {/* CTA */}
        <SmartScrollReveal kind="cta" className="block">
          <section className="px-4 py-16 bg-gradient-to-br from-blue-600 to-purple-600">
            <div className="max-w-3xl mx-auto text-center text-white space-y-6">
              <Award className="w-12 h-12 mx-auto opacity-90" />
              <h2 className="text-3xl md:text-4xl font-bold break-keep">
                30일 후, 한결 가벼워진 마음으로
              </h2>
              <p className="text-white/90 text-base md:text-lg break-keep">
                지금 시작하면 ₩19,900 (정가 ₩39,800)<br />
                7일 무료 체험 후 결제 · 언제든 해지 가능
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
        </SmartScrollReveal>

        <section className="px-4 py-8 max-w-4xl mx-auto">
          <MedicalDisclaimer variant="full" />
        </section>

        <Footer />
      </div>
    </>
  );
};

// 상태 막대
function StateBar({
  label, value, color, inverse = false,
}: { label: string; value: number; color: 'rose' | 'amber' | 'emerald'; inverse?: boolean }) {
  const colorMap = {
    rose: 'bg-gradient-to-r from-rose-400 to-orange-400',
    amber: 'bg-gradient-to-r from-amber-400 to-yellow-400',
    emerald: 'bg-gradient-to-r from-emerald-400 to-teal-400',
  };
  const textColor = {
    rose: 'text-rose-600',
    amber: 'text-amber-600',
    emerald: 'text-emerald-600',
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className={`text-sm font-bold tabular-nums ${textColor[color]}`}>{value}</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className={`h-full rounded-full ${colorMap[color]}`}
        />
      </div>
    </div>
  );
}

export default MindTrack;
