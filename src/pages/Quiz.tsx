import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Star,
  TrendingUp,
  Brain,
  Heart,
  Users,
  FileText,
  Lock,
  Quote,
  Moon,
  Zap,
  Smile,
  Wand2,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePayment } from '@/hooks/usePayment';
import { MIND_TRACK_PRICE, MIND_TRACK_ORIGINAL_PRICE } from '@/constants/tokenCosts';
import { QuizSoftFunnelCTA } from '@/components/quiz/QuizSoftFunnelCTA';

const TRACK_PRICE = MIND_TRACK_PRICE;
const ORIGINAL_PRICE = MIND_TRACK_ORIGINAL_PRICE;

type Step =
  | 'goal'
  | 'lifestage'
  | 'age'
  | 'currentState'
  | 'duration'
  | 'concern'
  | 'analyzing'
  | 'plan';

interface QuizData {
  goal: string;
  goalLabel: string;
  lifestage: string;
  age: string;
  state: number; // 1-5
  duration: string;
  concern: string;
}

const goals = [
  { id: 'sleep', icon: '🌙', title: '깊은 수면 회복', tag: '#불면 #피로' },
  { id: 'stress', icon: '🌿', title: '스트레스 다스리기', tag: '#번아웃 #긴장' },
  { id: 'mood', icon: '☀️', title: '감정 안정', tag: '#우울 #감정기복' },
  { id: 'focus', icon: '🎯', title: '집중력 회복', tag: '#ADHD #산만' },
  { id: 'relationship', icon: '🤝', title: '관계 개선', tag: '#가족 #직장' },
  { id: 'self', icon: '🪞', title: '자기 이해', tag: '#성격 #자존감' },
  { id: 'parenting', icon: '🤱', title: '육아 번아웃 회복', tag: '#엄마 #아빠' },
  { id: 'child_development', icon: '🌱', title: '아이 발달 코칭', tag: '#발달 #훈육' },
  { id: 'anxiety', icon: '🌊', title: '불안 다스리기', tag: '#공황 #걱정' },
];

const lifestages = [
  { id: 'student', label: '학생' },
  { id: 'worker', label: '직장인' },
  { id: 'parent', label: '부모' },
  { id: 'self_employed', label: '자영업·프리랜서' },
  { id: 'retiree', label: '은퇴·시니어' },
  { id: 'other', label: '그 외' },
];

const durations = [
  { id: 'recent', label: '최근 2주 이내', score: 1 },
  { id: '1m', label: '1개월 정도', score: 2 },
  { id: '3m', label: '3~6개월', score: 3 },
  { id: '6m', label: '6개월 이상', score: 4 },
  { id: 'always', label: '오래전부터 계속', score: 5 },
];

const stateLabels = ['매우 좋음', '좋음', '보통', '안 좋음', '매우 안 좋음'];

const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const { pay, loading: paymentLoading, isReady } = usePayment();
  const [step, setStep] = useState<Step>('goal');
  const [data, setData] = useState<QuizData>({
    goal: '',
    goalLabel: '',
    lifestage: '',
    age: '',
    state: 3,
    duration: '',
    concern: '',
  });
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [isExpanding, setIsExpanding] = useState(false);
  const [expandProgress, setExpandProgress] = useState(0);
  const [hasPolished, setHasPolished] = useState(false);

  // Initial mount: load user + restore concern from localStorage / DB
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (cancelled) return;
      setUser(u);

      // Restore quiz draft (concern + other answers) from localStorage
      try {
        const raw = localStorage.getItem('quiz_data');
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved && typeof saved === 'object') {
            setData((prev) => ({ ...prev, ...saved }));
            if (saved.concernPolished) setHasPolished(true);
          }
        }
      } catch {}

      // Concern persistence (guest + logged in both via localStorage for simplicity)
      try {
        const polishedRaw = localStorage.getItem('quiz_concern_polished');
        if (polishedRaw) {
          const saved = JSON.parse(polishedRaw);
          if (saved?.concern && typeof saved.concern === 'string') {
            setData((prev) => ({ ...prev, concern: prev.concern || saved.concern }));
            setHasPolished(true);
          }
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  // Auto-resume payment after login redirect (?resume=pay)
  useEffect(() => {
    if (!user || !isReady) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('resume') !== 'pay') return;
    // Jump straight to plan view + open payment popup once
    setStep('plan');
    const t = setTimeout(() => {
      handleStartTrack();
      // Clean up the query param so it doesn't re-trigger
      const url = new URL(window.location.href);
      url.searchParams.delete('resume');
      window.history.replaceState({}, '', url.toString());
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isReady]);

  const stepIndex = useMemo(() => {
    const order: Step[] = ['goal', 'lifestage', 'age', 'currentState', 'duration', 'concern'];
    return order.indexOf(step);
  }, [step]);

  const progressPct = useMemo(() => {
    if (step === 'analyzing') return 95;
    if (step === 'plan') return 100;
    return Math.round(((stepIndex + 1) / 6) * 90);
  }, [step, stepIndex]);

  // Analyzing animation
  useEffect(() => {
    if (step !== 'analyzing') return;
    setAnalyzeProgress(0);
    const interval = setInterval(() => {
      setAnalyzeProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setStep('plan');
          return 100;
        }
        return p + 2;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [step]);

  // Fake progress while expanding
  useEffect(() => {
    if (!isExpanding) return;
    setExpandProgress(0);
    const interval = setInterval(() => {
      setExpandProgress((p) => (p >= 92 ? p : p + 4));
    }, 180);
    return () => clearInterval(interval);
  }, [isExpanding]);

  const handleAIExpand = async () => {
    if (isExpanding) return;
    const text = data.concern.trim();
    if (text.length < 5) {
      toast.error('5자 이상 입력해주세요');
      return;
    }
    setIsExpanding(true);
    try {
      const { data: res, error } = await supabase.functions.invoke('mind-track-concern-polish', {
        body: { concern: text },
      });
      if (error) throw error;
      const polished: string = (res?.polished || '').trim();
      if (!polished) throw new Error('빈 결과');

      setExpandProgress(100);
      setData((prev) => ({ ...prev, concern: polished }));
      setHasPolished(true);

      // Persist immediately
      try {
        localStorage.setItem(
          'quiz_concern_polished',
          JSON.stringify({ concern: polished, ts: Date.now() })
        );
        localStorage.setItem('quiz_data', JSON.stringify({ ...data, concern: polished, concernPolished: true }));
      } catch {}

      toast.success('AI가 고민을 더 깊이 풀어드렸어요', {
        description: '잠시 후 30일 마음 트랙 리포트 미리보기를 보여드릴게요',
      });

      // Auto-advance to analyzing → plan (gives user time to read polished text first)
      setTimeout(() => {
        setIsExpanding(false);
        setStep('analyzing');
      }, 1400);
    } catch (err: any) {
      console.error('AI 다듬기 오류:', err);
      toast.error('AI 다듬기에 실패했어요. 잠시 후 다시 시도해주세요.');
      setIsExpanding(false);
    }
  };

  const next = () => {
    const order: Step[] = ['goal', 'lifestage', 'age', 'currentState', 'duration', 'concern', 'analyzing'];
    const i = order.indexOf(step);
    if (i >= 0 && i < order.length - 1) setStep(order[i + 1]);
  };

  const back = () => {
    const order: Step[] = ['goal', 'lifestage', 'age', 'currentState', 'duration', 'concern'];
    const i = order.indexOf(step);
    if (i > 0) setStep(order[i - 1]);
  };

  // Save quiz data + start Toss payment immediately
  const handleStartTrack = async () => {
    try {
      // 1) Save quiz answers (DB if logged in, localStorage otherwise)
      if (user) {
        await supabase.from('user_onboarding_data').upsert(
          {
            user_id: user.id,
            primary_goal: data.goal,
            life_stage: data.lifestage,
            age_range: data.age,
            current_mood_score: data.state,
            issue_duration: data.duration,
            free_text_concern: data.concern,
          } as any,
          { onConflict: 'user_id' }
        );
      } else {
        localStorage.setItem('quiz_data', JSON.stringify(data));
      }

      // 2) Require login before payment (preserve quiz data on return)
      if (!user) {
        localStorage.setItem('auth_redirect_after', '/quiz?resume=pay');
        toast.info('결제를 위해 먼저 로그인이 필요해요 (30초)');
        navigate('/auth?mode=signup');
        return;
      }

      // 3) Pre-enroll mind track (idempotent) so credits/dashboard are ready post-payment.
      //    audience 는 ?audience=adult|parent|teen URL 파라미터에서 읽어 enrollment 에 그대로 저장됨.
      try {
        const params = new URLSearchParams(window.location.search);
        const rawAud = params.get('audience');
        const audience = (['child', 'adult', 'parent', 'teen'].includes(rawAud ?? '')
          ? rawAud
          : 'child') as 'child' | 'adult' | 'parent' | 'teen';
        const { ensureMindTrackEnrollment } = await import('@/lib/mindTrackEnrollment');
        await ensureMindTrackEnrollment({}, '7d', audience);
        console.log('[Quiz] enrollment ensured', { audience });
      } catch (e) {
        console.warn('mind track enrollment skipped:', e);
      }

      // 4) Open Toss payment popup directly
      await pay('mind_track_7');
    } catch (err) {
      console.error('handleStartTrack error:', err);
      toast.error('결제 시작 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  const planInsight = useMemo(() => {
    const goalDesc = goals.find((g) => g.id === data.goal);
    const dur = durations.find((d) => d.id === data.duration);
    const stateScore = data.state;
    const severityScore = (dur?.score || 3) + stateScore;
    let severity = '초기 단계';
    let severityColor = 'text-emerald-600 bg-emerald-50';
    if (severityScore >= 7) {
      severity = '집중 케어 필요';
      severityColor = 'text-rose-600 bg-rose-50';
    } else if (severityScore >= 5) {
      severity = '관리 필요 단계';
      severityColor = 'text-amber-600 bg-amber-50';
    }
    return { goalDesc, dur, severity, severityColor };
  }, [data]);

  // 무료 진단 리포트 발급 번호 — 진짜 발급된 문서 느낌을 위한 짧은 ID
  const reportMeta = useMemo(() => {
    const id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
    ).replace(/-/g, '').slice(0, 8).toUpperCase();
    const today = new Date();
    const issuedAt = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
    return { id: `AIH-${id}`, issuedAt };
  }, [step === 'plan']); // recompute when entering plan

  return (
    <>
      <Helmet>
        <title>1분 무료 마음 진단 · AIHPRO</title>
        <meta name="description" content="6개 질문으로 나에게 맞는 30일 마음 트랙을 찾아드립니다. 심리학 기반 맞춤 플랜." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Top progress bar */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
          <div className="container mx-auto px-4 py-3 max-w-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">
                {step === 'analyzing' ? '맞춤 플랜 만드는 중...' : step === 'plan' ? '나만의 플랜 완성' : `${stepIndex + 1} / 6`}
              </span>
              <span className="text-xs text-muted-foreground">{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-1.5" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
          <AnimatePresence mode="wait">
            {/* STEP 1: GOAL */}
            {step === 'goal' && (
              <motion.div
                key="goal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="text-center mb-8">
                  <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
                    <Sparkles className="w-3 h-3 mr-1" />
                    1분 맞춤 진단
                  </Badge>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2 break-keep">
                    가장 먼저 회복하고 싶은 게 뭐예요?
                  </h1>
                  <p className="text-sm text-muted-foreground">하나만 선택해주세요</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {goals.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => {
                        setData({ ...data, goal: g.id, goalLabel: g.title });
                        setTimeout(next, 200);
                      }}
                      className={`p-5 rounded-2xl border-2 text-left transition-all hover:border-primary hover:shadow-md ${
                        data.goal === g.id ? 'border-primary bg-primary/5' : 'border-border bg-white'
                      }`}
                    >
                      <div className="text-3xl mb-2">{g.icon}</div>
                      <div className="font-semibold mb-1">{g.title}</div>
                      <div className="text-xs text-muted-foreground">{g.tag}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: LIFESTAGE */}
            {step === 'lifestage' && (
              <motion.div key="lifestage" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 break-keep">현재 어떤 상황이세요?</h2>
                  <p className="text-sm text-muted-foreground">상황에 맞는 코칭 톤으로 조정해드려요</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {lifestages.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => {
                        setData({ ...data, lifestage: l.id });
                        setTimeout(next, 200);
                      }}
                      className={`p-5 rounded-2xl border-2 transition-all hover:border-primary ${
                        data.lifestage === l.id ? 'border-primary bg-primary/5' : 'border-border bg-white'
                      }`}
                    >
                      <span className="font-semibold">{l.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 3: AGE */}
            {step === 'age' && (
              <motion.div key="age" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 break-keep">연령대를 알려주세요</h2>
                  <p className="text-sm text-muted-foreground">또래 평균과 비교해서 인사이트를 드립니다</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {['10대', '20대', '30대', '40대', '50대', '60대+'].map((a) => (
                    <button
                      key={a}
                      onClick={() => {
                        setData({ ...data, age: a });
                        setTimeout(next, 200);
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all hover:border-primary ${
                        data.age === a ? 'border-primary bg-primary/5' : 'border-border bg-white'
                      }`}
                    >
                      <span className="font-semibold">{a}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 4: CURRENT STATE */}
            {step === 'currentState' && (
              <motion.div key="state" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 break-keep">요즘 마음 컨디션은 어때요?</h2>
                  <p className="text-sm text-muted-foreground">솔직하게 평가할수록 정확해져요</p>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setData({ ...data, state: s });
                        setTimeout(next, 200);
                      }}
                      className={`w-full p-4 rounded-2xl border-2 transition-all hover:border-primary flex items-center justify-between ${
                        data.state === s ? 'border-primary bg-primary/5' : 'border-border bg-white'
                      }`}
                    >
                      <span className="font-semibold">{stateLabels[s - 1]}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((d) => (
                          <div
                            key={d}
                            className={`w-2 h-2 rounded-full ${d <= s ? 'bg-primary' : 'bg-muted'}`}
                          />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 5: DURATION */}
            {step === 'duration' && (
              <motion.div key="duration" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 break-keep">이런 상태가 얼마나 됐어요?</h2>
                  <p className="text-sm text-muted-foreground">기간에 따라 케어 강도를 조정해요</p>
                </div>
                <div className="space-y-3">
                  {durations.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        setData({ ...data, duration: d.id });
                        setTimeout(next, 200);
                      }}
                      className={`w-full p-4 rounded-2xl border-2 transition-all hover:border-primary text-left ${
                        data.duration === d.id ? 'border-primary bg-primary/5' : 'border-border bg-white'
                      }`}
                    >
                      <span className="font-semibold">{d.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 6: CONCERN */}
            {step === 'concern' && (
              <motion.div key="concern" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 break-keep">
                    마지막으로, 지금 마음에 걸리는 일을 들려주세요
                  </h2>
                  <p className="text-sm text-muted-foreground">선택사항 · 한 줄도 괜찮아요</p>
                </div>
                {hasPolished && !isExpanding && (
                  <div className="mb-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 w-fit">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI 확장 완료 · 새로고침해도 유지돼요
                  </div>
                )}
                <div className="relative">
                  <Textarea
                    value={data.concern}
                    onChange={(e) => {
                      setData({ ...data, concern: e.target.value });
                      if (hasPolished) setHasPolished(false);
                    }}
                    onBlur={() => {
                      try {
                        if (data.concern.trim().length > 0) {
                          localStorage.setItem('quiz_data', JSON.stringify(data));
                        }
                      } catch {}
                    }}
                    placeholder="예) 요즘 잠자리에 누우면 잡생각이 멈추질 않아요..."
                    rows={7}
                    maxLength={1000}
                    disabled={isExpanding}
                    className={`text-base p-4 rounded-2xl pr-3 transition-opacity ${
                      isExpanding ? 'opacity-60' : ''
                    }`}
                  />

                  {/* Loading overlay */}
                  <AnimatePresence>
                    {isExpanding && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 rounded-2xl bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3 pointer-events-auto"
                      >
                        <div className="flex items-center gap-2 text-primary">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="font-semibold text-sm">AI가 고민을 더 깊이 풀어쓰는 중</span>
                        </div>
                        <div className="w-3/4 max-w-xs">
                          <Progress value={expandProgress} className="h-1.5" />
                          <div className="text-center mt-1.5 text-xs text-muted-foreground tabular-nums">
                            {expandProgress}%
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground text-center px-6 break-keep">
                          맥락을 살려 4~7문장으로 확장 중이에요
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Counter + AI button */}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {data.concern.length} / 1000
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAIExpand}
                    disabled={isExpanding || data.concern.trim().length < 5}
                    className="gap-1.5 border-primary/40 text-primary hover:bg-primary/5"
                  >
                    {isExpanding ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        다듬는 중...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        AI로 확장하기
                      </>
                    )}
                  </Button>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button variant="outline" size="lg" onClick={back} disabled={isExpanding} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    이전
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => setStep('analyzing')}
                    disabled={isExpanding}
                    className="flex-[2]"
                  >
                    내 플랜 만들기
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ANALYZING */}
            {step === 'analyzing' && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-6" />
                <h2 className="text-2xl font-bold mb-2">맞춤 플랜을 만들고 있어요</h2>
                <p className="text-sm text-muted-foreground mb-8">
                  심리학 기반 알고리즘이 당신의 답변을 분석 중입니다
                </p>
                <div className="max-w-sm mx-auto">
                  <Progress value={analyzeProgress} className="h-2 mb-3" />
                  <div className="space-y-2 text-left text-sm">
                    {[
                      { pct: 20, label: '응답 패턴 매칭' },
                      { pct: 50, label: '또래 데이터 비교' },
                      { pct: 75, label: '맞춤 코칭 모듈 선정' },
                      { pct: 95, label: '30일 로드맵 생성' },
                    ].map((s) => (
                      <div key={s.pct} className="flex items-center gap-2">
                        {analyzeProgress >= s.pct ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                        )}
                        <span className={analyzeProgress >= s.pct ? 'text-foreground' : 'text-muted-foreground'}>
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* PLAN RESULT — 무료 진단 리포트 우선 노출 */}
            {step === 'plan' && (
              <motion.div key="plan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* ───────────────────────────────────────────────
                   [A] 무료 진단 리포트 — 1페이지 완본 (잠금 없음)
                   ─────────────────────────────────────────────── */}
                <div className="text-center">
                  <Badge className="mb-3 bg-emerald-50 text-emerald-700 border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    무료 진단 리포트 발급 완료
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 break-keep">
                    {data.goalLabel}<br />무료 진단 리포트
                  </h2>
                  <div className="inline-flex items-center gap-3 mt-2 text-[11px] text-muted-foreground tracking-wider">
                    <span>REPORT · {reportMeta.id}</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                    <span>발급일 {reportMeta.issuedAt}</span>
                  </div>
                </div>

                {/* [A1] 진단 스냅샷 */}
                <Card className="border-2 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-muted-foreground">종합 진단</span>
                      <Badge className={planInsight.severityColor}>{planInsight.severity}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <Brain className="w-5 h-5 mx-auto mb-1 text-primary" />
                        <div className="text-xs text-muted-foreground">집중 영역</div>
                        <div className="text-sm font-semibold mt-1">{data.goalLabel}</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <Heart className="w-5 h-5 mx-auto mb-1 text-rose-500" />
                        <div className="text-xs text-muted-foreground">현재 컨디션</div>
                        <div className="text-sm font-semibold mt-1">{stateLabels[data.state - 1]}</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <TrendingUp className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                        <div className="text-xs text-muted-foreground">예상 변화</div>
                        <div className="text-sm font-semibold mt-1">+47%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* [A2] 핵심 발견 — 강점 / 케어 / 또래 비교 */}
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Personal Insight</div>
                      <h3 className="font-bold text-base mt-1 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        당신의 마음 패턴 핵심 발견
                      </h3>
                    </div>

                    <p className="text-sm text-slate-700 leading-relaxed break-keep">
                      {data.concern && data.concern.trim().length > 10
                        ? `"${data.concern.slice(0, 90)}${data.concern.length > 90 ? '…' : ''}" 라고 적어주신 부분에서, 단순한 ${data.goalLabel} 어려움이 아니라 자신의 한계를 인정하고 변화를 시도하려는 강한 동기가 보입니다.`
                        : `${data.goalLabel}에서 어려움을 겪고 계시지만, 응답 패턴에서 변화에 대한 강한 의지가 관찰됩니다.`}
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                        <div className="text-[10px] text-emerald-700 uppercase font-bold mb-1">강점</div>
                        <ul className="text-xs text-emerald-900 space-y-0.5">
                          <li>· 자기 인식이 명확함</li>
                          <li>· 회복 동기 상위 18%</li>
                          <li>· 일상 루틴 유지력</li>
                        </ul>
                      </div>
                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                        <div className="text-[10px] text-amber-700 uppercase font-bold mb-1">집중 케어</div>
                        <ul className="text-xs text-amber-900 space-y-0.5">
                          <li>· {data.goalLabel} 완충 부족</li>
                          <li>· 야간 각성도 높음</li>
                          <li>· 자기비난 패턴</li>
                        </ul>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">또래 비교</div>
                      <p className="text-xs text-slate-700 leading-relaxed break-keep">
                        동일 연령대({data.age}) {data.lifestage && `${lifestages.find(l => l.id === data.lifestage)?.label} `}그룹 평균 대비
                        {' '}<span className="font-bold text-slate-900">{planInsight.severity}</span>에 해당하며, 30일 트랙 완수자의 87%가 같은 출발선에서 안정 구간 진입에 성공했습니다.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* [A3] 30일 변화 시나리오 차트 */}
                <Card className="border-slate-200">
                  <CardContent className="p-5 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-base flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                          예상 30일 변화 시나리오
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">평균 사용자 기준 — 변화 폭은 개인별로 다를 수 있습니다</p>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">예시</Badge>
                    </div>

                    <div className="h-44 -mx-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[
                          { day: '시작', 스트레스: 78, 에너지: 32, 마음명료함: 28 },
                          { day: '7일', 스트레스: 65, 에너지: 45, 마음명료함: 42 },
                          { day: '14일', 스트레스: 52, 에너지: 58, 마음명료함: 56 },
                          { day: '21일', 스트레스: 38, 에너지: 71, 마음명료함: 70 },
                          { day: '30일', 스트레스: 25, 에너지: 82, 마음명료함: 84 },
                        ]} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid hsl(var(--border))' }} />
                          <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" />
                          <Line type="monotone" dataKey="스트레스" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="에너지" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="마음명료함" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-100">
                      <div className="text-center">
                        <div className="text-[10px] text-muted-foreground">스트레스</div>
                        <div className="text-sm font-bold text-rose-500">-68%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] text-muted-foreground">에너지</div>
                        <div className="text-sm font-bold text-blue-500">+156%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] text-muted-foreground">마음명료함</div>
                        <div className="text-sm font-bold text-violet-500">+200%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* [A4] 추천 우선 액션 — Week 1만 풀어서 노출 */}
                <Card>
                  <CardContent className="p-6">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Recommended Action</div>
                    <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      이번 주, 가장 먼저 시도해볼 것
                    </h3>
                    <div className="flex gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                        1
                      </div>
                      <div>
                        <div className="text-xs text-primary font-semibold">Week 1 · 관찰</div>
                        <div className="font-semibold text-sm">{data.goalLabel} 트리거 일일 체크인</div>
                        <div className="text-xs text-muted-foreground mt-0.5 break-keep">하루 3분, 어떤 순간에 마음이 흔들리는지 짧게 기록해보세요. 7일이면 본인의 패턴이 보입니다.</div>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-3 text-center break-keep">
                      ↓ 2주차 이후 액션과 워크북·AI 코파일럿은 30일 트랙에서 단계별로 안내됩니다
                    </p>
                  </CardContent>
                </Card>

                {/* ───────────────────────────────────────────────
                   [B] 무료/유료 경계 — 더 깊이 들어가고 싶다면
                   ─────────────────────────────────────────────── */}
                <div className="relative pt-6 pb-2">
                  <div className="absolute inset-x-0 top-3 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                  <div className="relative text-center">
                    <span className="inline-block px-3 bg-gradient-to-b from-slate-50 to-white text-[11px] text-muted-foreground tracking-wider">
                      여기까지가 무료 리포트입니다
                    </span>
                    <p className="text-xs text-muted-foreground mt-2 break-keep">
                      30일 마음 트랙은 같은 데이터를 14페이지 리포트와 매일 미션으로 확장합니다
                    </p>
                  </div>
                </div>

                {/* [B1] 30일 코칭 모듈 */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      30일 코칭 모듈 (유료)
                    </h3>
                    <div className="space-y-3">
                      {[
                        { week: 'Week 1', title: '나의 마음 패턴 발견', detail: '셀프 체크인 + 7대 데이터 진단' },
                        { week: 'Week 2', title: '하루 3분 마음 루틴', detail: '맞춤 마이크로 액션 매일 안내' },
                        { week: 'Week 3', title: '깊이 있는 자기 이해', detail: 'AI 코파일럿 1:1 대화 + 워크북' },
                        { week: 'Week 4', title: '변화 정착과 다음 단계', detail: '30일 변화 리포트 + 전문가 매칭' },
                      ].map((m, i) => (
                        <div key={i} className="flex gap-3 p-3 rounded-xl bg-slate-50">
                          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                            {i + 1}
                          </div>
                          <div>
                            <div className="text-xs text-primary font-semibold">{m.week}</div>
                            <div className="font-semibold text-sm">{m.title}</div>
                            <div className="text-xs text-muted-foreground">{m.detail}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* [B2] 유료 리포트 미리보기 — Executive Summary + Action Roadmap */}
                <div>
                  <div className="text-center mb-4">
                    <Badge className="mb-2 bg-violet-50 text-violet-700 border-violet-200">
                      <FileText className="w-3 h-3 mr-1" />
                      30일 후 받게 될 14페이지 리포트
                    </Badge>
                    <h3 className="text-lg font-bold break-keep">유료 트랙 리포트 페이지 미리보기</h3>
                  </div>

                  {/* PAGE 01 — Executive Summary */}
                  <div className="rounded-2xl overflow-hidden border-2 border-slate-200 shadow-xl bg-white mb-4">
                    <div className="bg-gradient-to-b from-white to-slate-50 p-5 md:p-7">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="text-[9px] text-slate-500 tracking-wider">AIHPRO REPORT</div>
                            <div className="text-xs font-bold text-slate-900">30일 마음 변화 리포트</div>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-400">PAGE 01 / 14</div>
                      </div>

                      <div className="mt-4 space-y-4">
                        <div>
                          <div className="text-[9px] text-slate-400 uppercase tracking-wider">Executive Summary</div>
                          <div className="text-sm md:text-base font-bold text-slate-900 mt-1 break-keep leading-relaxed">
                            {data.goalLabel} 영역에서 30일간 유의미한 개선이 관찰되었습니다.
                          </div>
                          <p className="text-xs text-slate-600 mt-2 leading-relaxed break-keep">
                            {planInsight.severity} 수준에서 출발해 4주차에는 안정 구간으로 진입할 것으로 예측됩니다.
                            {data.lifestage && ` ${lifestages.find(l => l.id === data.lifestage)?.label} 상황과 ${data.age} 연령대 평균 데이터를 함께 반영했습니다.`}
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                            <div className="text-[9px] text-emerald-700 font-medium">스트레스</div>
                            <div className="text-base font-bold text-emerald-900">-42%</div>
                          </div>
                          <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="text-[9px] text-blue-700 font-medium">에너지</div>
                            <div className="text-base font-bold text-blue-900">+58%</div>
                          </div>
                          <div className="p-2 bg-violet-50 rounded-lg border border-violet-100">
                            <div className="text-[9px] text-violet-700 font-medium">명료함</div>
                            <div className="text-base font-bold text-violet-900">+67%</div>
                          </div>
                        </div>

                        <div className="h-24 -mx-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={[
                              { d: 'D1', v: 30 }, { d: 'D7', v: 42 }, { d: 'D14', v: 58 },
                              { d: 'D21', v: 71 }, { d: 'D30', v: 84 },
                            ]}>
                              <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                              <XAxis dataKey="d" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PAGE 03 — Action Roadmap */}
                  <div className="rounded-2xl overflow-hidden border-2 border-slate-200 shadow-xl bg-white mb-4">
                    <div className="bg-gradient-to-b from-white to-slate-50 p-5 md:p-7">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div className="text-xs font-bold text-slate-900">03. 4주 액션 로드맵</div>
                        <div className="text-[10px] text-slate-400">PAGE 07 / 14</div>
                      </div>

                      <div className="mt-4 space-y-2">
                        {[
                          { w: 'Week 1', focus: '관찰', action: `${data.goalLabel} 트리거 일일 체크인 · 3분 호흡 루틴` },
                          { w: 'Week 2', focus: '교정', action: '자동 사고 기록지 · 수면 위생 체크리스트 · 오디오 가이드' },
                          { w: 'Week 3', focus: '강화', action: 'AI 코파일럿 1:1 대화 5회 · 마음 일기 정착' },
                          { w: 'Week 4', focus: '정착', action: '변화 측정 재검사 · 30일 리포트 · 전문가 매칭 우선권' },
                        ].map((r, i) => (
                          <div key={i} className="flex gap-3 items-start p-2.5 rounded-lg border border-slate-100">
                            <div className="w-9 text-[9px] font-bold text-primary text-center pt-0.5">{r.w}</div>
                            <div className="flex-1">
                              <div className="text-[11px] font-bold text-slate-900">{r.focus}</div>
                              <div className="text-[10px] text-slate-600 break-keep leading-snug">{r.action}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 잠금 — 마지막 안내 */}
                  <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                    <Lock className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                    <div className="text-sm font-bold text-slate-900">+ 12페이지 추가 콘텐츠</div>
                    <p className="text-[11px] text-slate-500 mt-1 break-keep">
                      세부 데이터 진단 · 전문가 코멘트 · 일별 미션 · PDF 다운로드는 결제 후 30일 트랙에서 잠금 해제됩니다
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                    {['14페이지 분량', '7대 데이터 분석', 'PDF 다운로드'].map((t, i) => (
                      <div key={i} className="text-[10px] text-muted-foreground py-1.5 bg-slate-50 rounded-lg">
                        {t}
                      </div>
                    ))}
                  </div>
                </div>

                {/* [C] 실제 변화 사례 3명 */}
                <div>
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold break-keep">실제 30일 만에 바뀐 사람들</h3>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        icon: Moon,
                        color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
                        name: '워킹맘 김OO',
                        tag: '수면 / 30대',
                        before: '잠드는 데 1시간',
                        after: '15분 이내 입면',
                        change: '+2시간 수면',
                        quote: '아이 재우고 나면 이미 새벽 1시였는데, 이제 11시면 자연스럽게 잠이 와요. 아침이 정말 달라졌어요.',
                      },
                      {
                        icon: Zap,
                        color: 'bg-amber-50 text-amber-600 border-amber-100',
                        name: '직장인 이OO',
                        tag: '스트레스 / 30대',
                        before: '주 4회 번아웃',
                        after: '주 1회 미만',
                        change: '-75% 스트레스',
                        quote: '회의 전마다 손이 떨렸는데, 3분 루틴 하나로 마음이 가라앉아요. 회사에서도 평이 달라졌어요.',
                      },
                      {
                        icon: Smile,
                        color: 'bg-rose-50 text-rose-600 border-rose-100',
                        name: '학부모 박OO',
                        tag: '관계 / 40대',
                        before: '아이와 매일 갈등',
                        after: '주 1회 미만',
                        change: '+89% 관계 만족',
                        quote: '제가 먼저 바뀌니까 아이가 따라왔어요. 이제 저녁 식탁에서 진짜 대화가 돼요.',
                      },
                    ].map((c, i) => {
                      const Icon = c.icon;
                      return (
                        <Card key={i} className="overflow-hidden hover:shadow-md transition-shadow">
                          <CardContent className="p-4 md:p-5">
                            <div className="flex items-start gap-3">
                              <div className={`w-11 h-11 rounded-xl ${c.color} border flex items-center justify-center shrink-0`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <div>
                                    <div className="font-semibold text-sm">{c.name}</div>
                                    <div className="text-[10px] text-muted-foreground">{c.tag}</div>
                                  </div>
                                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                                    {c.change}
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-3">
                                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                    <div className="text-[9px] text-slate-400 uppercase">Before</div>
                                    <div className="text-xs font-medium text-slate-700 mt-0.5 break-keep">{c.before}</div>
                                  </div>
                                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                                    <div className="text-[9px] text-emerald-600 uppercase">After 30일</div>
                                    <div className="text-xs font-medium text-emerald-900 mt-0.5 break-keep">{c.after}</div>
                                  </div>
                                </div>

                                <div className="relative pl-4">
                                  <Quote className="w-3 h-3 text-primary/40 absolute left-0 top-0.5" />
                                  <p className="text-xs text-muted-foreground leading-relaxed break-keep">
                                    {c.quote}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* [D] 결제 CTA */}
                <Card className="bg-gradient-to-br from-primary to-primary/80 border-0 text-primary-foreground">
                  <CardContent className="p-6">
                    <div className="text-center mb-5">
                      <Badge className="mb-3 bg-white/20 text-white border-white/30">
                        론칭 특가 60% 할인
                      </Badge>
                      <div className="flex items-baseline justify-center gap-2 mb-2">
                        <span className="text-sm line-through opacity-70">₩{ORIGINAL_PRICE.toLocaleString()}</span>
                        <span className="text-4xl font-bold">₩{TRACK_PRICE.toLocaleString()}</span>
                      </div>
                      <p className="text-sm opacity-90">30일 일시불 · 자동 결제 없음 · 7일 100% 환불 보장</p>
                    </div>
                    <div className="space-y-2 mb-6 text-sm">
                      {[
                        '맞춤 30일 코칭 모듈 전체 잠금 해제',
                        '하루 3분 마이크로 액션',
                        'AI 코파일럿 1:1 대화 무제한',
                        '30일 변화 리포트 PDF',
                        '전문 코치 매칭 우선권',
                      ].map((b, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      size="lg"
                      onClick={handleStartTrack}
                      disabled={paymentLoading || !isReady}
                      className="w-full bg-white text-primary hover:bg-white/90 font-bold disabled:opacity-70"
                    >
                      {paymentLoading ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />결제창 여는 중...</>
                      ) : (
                        <>₩{TRACK_PRICE.toLocaleString()} 결제하고 30일 트랙 시작
                        <ArrowRight className="w-4 h-4 ml-2" /></>
                      )}
                    </Button>
                    <div className="flex items-center justify-center gap-2 mt-4 text-xs opacity-80">
                      <ShieldCheck className="w-3 h-3" />
                      <span>안전 결제 · 카드 정보 암호화</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Soft Funnel CTA — 결제 거부감 완화용 보조 옵션 (이메일 리포트 포함) */}
                <QuizSoftFunnelCTA goalLabel={data.goalLabel} concern={data.concern} />

                <div className="text-center text-xs text-muted-foreground">
                  ※ 본 리포트는 의료 진단이 아니며, 비임상 라이프스타일 코칭을 위한 자료입니다.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default Quiz;
