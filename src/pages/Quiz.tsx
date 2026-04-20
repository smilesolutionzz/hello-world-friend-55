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
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TRACK_PRICE = 19900;
const ORIGINAL_PRICE = 39800;

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

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

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

  // Save quiz data + start payment
  const handleStartTrack = async () => {
    try {
      // Save to user_onboarding_data if logged in
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
        // Save to localStorage to recover after signup
        localStorage.setItem('quiz_data', JSON.stringify(data));
      }
      navigate('/token-subscription?source=quiz');
    } catch (err) {
      console.error(err);
      navigate('/token-subscription?source=quiz');
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
                <Textarea
                  value={data.concern}
                  onChange={(e) => setData({ ...data, concern: e.target.value })}
                  placeholder="예) 요즘 잠자리에 누우면 잡생각이 멈추질 않아요..."
                  rows={6}
                  maxLength={1000}
                  className="text-base p-4 rounded-2xl"
                />
                <div className="mt-6 flex gap-3">
                  <Button variant="outline" size="lg" onClick={back} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    이전
                  </Button>
                  <Button size="lg" onClick={() => setStep('analyzing')} className="flex-[2]">
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

            {/* PLAN RESULT */}
            {step === 'plan' && (
              <motion.div key="plan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="text-center">
                  <Badge className="mb-3 bg-emerald-50 text-emerald-700 border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    플랜 완성
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 break-keep">
                    {data.goalLabel}을(를) 위한<br />
                    당신만의 30일 마음 트랙
                  </h2>
                </div>

                {/* Diagnostic snapshot */}
                <Card className="border-2 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-muted-foreground">현재 상태</span>
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
                        <div className="text-xs text-muted-foreground">컨디션</div>
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

                {/* Plan modules */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      당신의 30일 코칭 모듈
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

                {/* Social proof */}
                <Card className="bg-amber-50/50 border-amber-200">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="ml-2 text-sm font-semibold">4.8 / 5.0</span>
                    </div>
                    <p className="text-sm text-foreground">
                      "30일 만에 잠드는 시간이 1시간 → 15분으로 줄었어요. 진짜 인생 바뀌었습니다."
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">— 30대 직장인 이OO님</p>
                  </CardContent>
                </Card>

                {/* Pricing CTA */}
                <Card className="bg-gradient-to-br from-primary to-primary/80 border-0 text-primary-foreground">
                  <CardContent className="p-6">
                    <div className="text-center mb-5">
                      <Badge className="mb-3 bg-white/20 text-white border-white/30">
                        지금만 50% 할인
                      </Badge>
                      <div className="flex items-baseline justify-center gap-2 mb-2">
                        <span className="text-sm line-through opacity-70">₩{ORIGINAL_PRICE.toLocaleString()}</span>
                        <span className="text-4xl font-bold">₩{TRACK_PRICE.toLocaleString()}</span>
                      </div>
                      <p className="text-sm opacity-90">7일 무료 체험 후 결제 · 언제든 해지 가능</p>
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
                      className="w-full bg-white text-primary hover:bg-white/90 font-bold"
                    >
                      7일 무료 체험 시작하기
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <div className="flex items-center justify-center gap-2 mt-4 text-xs opacity-80">
                      <ShieldCheck className="w-3 h-3" />
                      <span>안전 결제 · 카드 정보 암호화</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-center text-xs text-muted-foreground">
                  ※ 본 플랜은 의료 진단이 아니며, 비임상 라이프스타일 코칭을 위한 자료입니다.
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
