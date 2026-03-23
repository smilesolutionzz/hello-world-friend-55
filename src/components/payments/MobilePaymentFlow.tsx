import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, Crown, Zap, ArrowLeft, ArrowRight, Check, 
  ChevronRight, Loader2, Shield, Star, FileText, Heart
} from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';
import { useSubscription } from '@/hooks/useSubscription';
import { useAccessControl } from '@/hooks/useAccessControl';
import { supabase } from '@/integrations/supabase/client';
import { SUBSCRIPTION_PRICE, SUBSCRIPTION_ORIGINAL_PRICE, SUBSCRIPTION_DISCOUNT_PERCENT, SINGLE_REPORT_PRICE, SINGLE_TEST_PRICE } from '@/constants/tokenCosts';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'select' | 'tests' | 'plan' | 'confirm';

interface MobilePaymentFlowProps {
  initialStep?: Step;
  onComplete?: () => void;
}

const ASSESSMENT_CATEGORIES = [
  { id: 'mental', label: '심리검사', desc: '우울·불안·스트레스', icon: Brain, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  { id: 'personality', label: '성격분석', desc: 'MBTI·Big5·방어기제', icon: Star, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  { id: 'child', label: '발달검사', desc: '아동 발달·감각·학습', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  { id: 'career', label: '진로·관계', desc: '직업흥미·애착·소통', icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
];

type TestItem = {
  id: string;
  title: string;
  desc: string;
  icon: string;
  route: string;
  badge?: string;
};

const CATEGORY_TESTS: Record<string, TestItem[]> = {
  mental: [
    { id: 'depression', title: '우울감 자가체크', desc: '연령별 우울 수준 평가', icon: '😔', route: '/assessment' },
    { id: 'panic', title: '불안감 수준검사', desc: '연령별 불안 수준 평가', icon: '😰', route: '/assessment' },
    { id: 'stress', title: '스트레스 검사', desc: '스트레스 수준 진단', icon: '😫', route: '/assessment' },
    { id: 'selfesteem', title: '자존감 검사', desc: '자기효능감·자아존중감', icon: '💝', route: '/assessment' },
    { id: 'adhd', title: '주의집중력 검사', desc: 'ADHD 선별검사', icon: '🎯', route: '/assessment' },
  ],
  personality: [
    { id: 'psychological', title: '심리 성격유형 검사', desc: '종합 심리유형 분석', icon: '🧠', route: '/assessment', badge: '프리미엄' },
    { id: 'bigfive', title: 'Big5 성격특성 검사', desc: '5대 성격요인 분석', icon: '📊', route: '/assessment', badge: '프리미엄' },
    { id: 'defense', title: '방어기제 검사', desc: '무의식적 방어유형', icon: '🛡️', route: '/assessment/defense-mechanism-test', badge: 'NEW' },
    { id: 'resilience', title: '회복탄력성 검사', desc: '스트레스 대처능력', icon: '💪', route: '/assessment', badge: 'NEW' },
  ],
  child: [
    { id: 'developmental-delay', title: '발달지연 선별검사', desc: '전반적 발달 수준', icon: '🧒', route: '/assessment' },
    { id: 'language', title: '영유아 언어발달 검사', desc: '언어·의사소통 발달', icon: '🗣️', route: '/assessment' },
    { id: 'sensory-integration', title: '감각통합 검사', desc: '감각처리 능력', icon: '✋', route: '/assessment' },
    { id: 'learning-disability', title: '학습장애 선별검사', desc: '학습 능력 평가', icon: '📚', route: '/assessment' },
    { id: 'social-development', title: '사회성 발달 검사', desc: '또래관계·사회적응', icon: '👥', route: '/assessment' },
    { id: 'challenging-behavior', title: '문제행동 체크리스트', desc: '행동 문제 평가', icon: '⚡', route: '/assessment' },
    { id: 'adaptive-behavior', title: '적응행동 검사', desc: '일상생활 적응력', icon: '🏠', route: '/assessment' },
    { id: 'parent-child-play', title: '부모-자녀 놀이평가', desc: '상호작용 관찰', icon: '🤝', route: '/assessment' },
  ],
  career: [
    { id: 'career', title: '직업흥미 검사', desc: '적성·직업 탐색', icon: '💼', route: '/assessment', badge: '프리미엄' },
    { id: 'attachment-deep', title: '애착유형 검사', desc: '대인관계 패턴 분석', icon: '💕', route: '/assessment/attachment-style-test', badge: 'NEW' },
  ],
};

const STEP_LABELS: Record<Step, string> = {
  select: '카테고리',
  tests: '검사선택',
  plan: '플랜선택',
  confirm: '결제',
};

const STEPS_ORDER: Step[] = ['select', 'tests', 'plan', 'confirm'];

export const MobilePaymentFlow: React.FC<MobilePaymentFlowProps> = ({ 
  initialStep = 'select',
  onComplete 
}) => {
  const navigate = useNavigate();
  const { pay, loading, isReady } = usePayment();
  const { isPremiumUser, isLifetimeUser } = useSubscription();
  const { reportCredits, testCredits } = useAccessControl();
  const [step, setStep] = useState<Step>(initialStep);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState<TestItem | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const isPremium = isPremiumUser() || isLifetimeUser();

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    check();
  }, []);

  const handleSelectCategory = (id: string) => {
    setSelectedCategory(id);
    if (isPremium) {
      navigate('/assessment');
    } else {
      setStep('tests');
    }
  };

  const handleSelectTest = (test: TestItem) => {
    setSelectedTest(test);
    setStep('plan');
  };

  const handleGoToTest = () => {
    if (selectedTest) {
      navigate(selectedTest.route);
    }
  };

  const redirectToLogin = (redirectPath: string) => {
    localStorage.setItem('auth_redirect_after', redirectPath);
    navigate('/auth?mode=signup');
  };

  const handlePayTest = async () => {
    if (!isAuthenticated) {
      redirectToLogin('/token-subscription');
      return;
    }
    await pay('single_test');
  };

  const handlePaySingle = async () => {
    if (!isAuthenticated) {
      redirectToLogin('/token-subscription');
      return;
    }
    await pay('single_report');
  };

  const handlePaySubscription = async () => {
    if (!isAuthenticated) {
      redirectToLogin('/token-subscription');
      return;
    }
    await pay('subscription_monthly');
  };

  const handleBack = () => {
    const currentIndex = STEPS_ORDER.indexOf(step);
    if (currentIndex > 0) {
      setStep(STEPS_ORDER[currentIndex - 1]);
    } else {
      navigate(-1);
    }
  };

  const currentStepIndex = STEPS_ORDER.indexOf(step);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background pb-20">
      {/* Step indicator */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={handleBack} className="p-1">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 flex items-center gap-1">
            {STEPS_ORDER.filter(s => s !== 'confirm').map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1 ${step === s ? 'text-primary font-semibold' : i < currentStepIndex ? 'text-primary/60' : 'text-muted-foreground'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step === s ? 'bg-primary text-primary-foreground' : 
                    i < currentStepIndex ? 'bg-primary/20 text-primary' : 
                    'bg-muted text-muted-foreground'
                  }`}>
                    {i < currentStepIndex ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className="text-[11px] hidden min-[360px]:inline whitespace-nowrap">
                    {STEP_LABELS[s]}
                  </span>
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 rounded ${i < currentStepIndex ? 'bg-primary/40' : 'bg-muted'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: 카테고리 선택 */}
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-foreground">어떤 검사를 해볼까요?</h2>
                <p className="text-sm text-muted-foreground mt-1">카테고리를 선택하세요</p>
              </div>

              <div className="space-y-3">
                {ASSESSMENT_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border border-border ${cat.bg} hover:shadow-md transition-all active:scale-[0.98] text-left`}
                    >
                      <div className={`p-3 rounded-xl bg-background shadow-sm ${cat.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground">{cat.label}</div>
                        <div className="text-xs text-muted-foreground">{cat.desc}</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </button>
                  );
                })}
              </div>

              {isPremium && (
                <div className="mt-6 p-3 rounded-xl bg-primary/5 border border-primary/20 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-primary font-medium">
                    <Crown className="w-4 h-4" />
                    프리미엄 구독 중 · 모든 검사 무제한 이용
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: 검사 목록 */}
          {step === 'tests' && selectedCategory && (
            <motion.div
              key="tests"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center mb-5">
                <h2 className="text-xl font-bold text-foreground">
                  {ASSESSMENT_CATEGORIES.find(c => c.id === selectedCategory)?.label}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">원하는 검사를 선택하세요</p>
              </div>

              <div className="space-y-2">
                {(CATEGORY_TESTS[selectedCategory] || []).map((test) => (
                  <button
                    key={test.id}
                    onClick={() => handleSelectTest(test)}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all active:scale-[0.98] text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg flex-shrink-0">
                      {test.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-foreground truncate">{test.title}</span>
                        {test.badge && (
                          <Badge className={`text-[9px] px-1.5 py-0 flex-shrink-0 ${
                            test.badge === 'NEW' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary border-0'
                          }`}>
                            {test.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{test.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>

              {/* 이용 현황 간략 */}
              {!isPremium && (
                <div className="mt-4 p-3 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>검사 이용권 <strong className="text-foreground">{testCredits}회</strong></span>
                    <span>리포트 이용권 <strong className="text-foreground">{reportCredits}회</strong></span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: 플랜 선택 */}
          {step === 'plan' && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="text-center mb-5">
                <h2 className="text-xl font-bold text-foreground">이용 방법을 선택하세요</h2>
                {selectedTest && (
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-foreground font-medium">{selectedTest.title}</span> 결과를 확인하려면 플랜이 필요해요
                  </p>
                )}
              </div>

              {/* 내 이용 현황 */}
              <div className="p-4 rounded-2xl bg-muted/50 border border-border mb-2">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">내 이용 현황</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 rounded-xl bg-background">
                    <div className="text-lg font-bold text-foreground">
                      {isPremium ? '∞' : testCredits}
                    </div>
                    <div className="text-[10px] text-muted-foreground">검사 이용권</div>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-background">
                    <div className="text-lg font-bold text-foreground">
                      {isPremium ? '∞' : reportCredits}
                    </div>
                    <div className="text-[10px] text-muted-foreground">리포트 이용권</div>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-background">
                    <div className={`text-lg font-bold ${isPremium ? 'text-primary' : 'text-muted-foreground'}`}>
                      {isPremium ? '활성' : '미구독'}
                    </div>
                    <div className="text-[10px] text-muted-foreground">구독 상태</div>
                  </div>
                </div>
                {!isAuthenticated && (
                  <p className="text-[11px] text-muted-foreground mt-2 text-center">
                    로그인하면 보유 이용권을 확인할 수 있어요
                  </p>
                )}
              </div>

              {/* 이용권이 있으면 바로 검사하기 버튼 */}
              {isAuthenticated && (testCredits > 0 || isPremium) && selectedTest && (
                <Card className="p-4 border-2 border-emerald-400 rounded-2xl space-y-3 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-500" />
                    <span className="font-bold text-foreground">이용권으로 바로 검사하기</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    보유한 이용권으로 바로 검사를 시작할 수 있어요
                  </p>
                  <Button
                    className="w-full h-12 text-base font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={handleGoToTest}
                  >
                    {selectedTest.title} 시작하기
                  </Button>
                </Card>
              )}

              {/* 검사 1회 구매 */}
              <Card className="p-4 border border-border rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-500" />
                    <span className="font-bold text-foreground">검사 1회</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">가벼운 시작</Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-foreground">₩{SINGLE_TEST_PRICE.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">/ 1회</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" />심리검사 1회 이용</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" />기본 결과 확인</li>
                </ul>
                <Button
                  variant="outline"
                  className="w-full h-12 text-base font-semibold rounded-xl"
                  onClick={handlePayTest}
                  disabled={isAuthenticated ? (loading || !isReady) : false}
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  검사 1회 구매
                </Button>
              </Card>

              <Card className="p-4 border border-border rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <span className="font-bold text-foreground">1회 이용권</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">60% 할인</Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-muted-foreground line-through">₩9,900</span>
                  <span className="text-2xl font-extrabold text-foreground">₩{SINGLE_REPORT_PRICE.toLocaleString()}</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" />전문가급 AI 심층 분석 1회</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" />맞춤 가이드 & 제언 포함</li>
                </ul>
                <Button
                  variant="outline"
                  className="w-full h-12 text-base font-semibold rounded-xl"
                  onClick={handlePaySingle}
                  disabled={isAuthenticated ? (loading || !isReady) : false}
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  리포트 1회 구매
                </Button>
              </Card>

              {/* 월간 구독 - 추천 */}
              <Card className="p-4 border-2 border-primary rounded-2xl space-y-3 relative overflow-hidden">
                <Badge className="absolute top-0 right-0 rounded-none rounded-bl-xl bg-primary text-primary-foreground text-xs px-3 py-1">
                  추천
                </Badge>
                <div className="flex items-center gap-2 pt-1">
                  <Crown className="w-5 h-5 text-primary" />
                  <span className="font-bold text-foreground">월간 구독</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-muted-foreground line-through">₩{SUBSCRIPTION_ORIGINAL_PRICE.toLocaleString()}</span>
                  <span className="text-2xl font-extrabold text-primary">₩{SUBSCRIPTION_PRICE.toLocaleString()}</span>
                  <Badge className="bg-destructive text-destructive-foreground text-xs">{SUBSCRIPTION_DISCOUNT_PERCENT}% 할인</Badge>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" />모든 AI 분석 무제한 이용</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" />프리미엄 리포트 무제한</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" />전문가 우선 매칭</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" />광고 없는 서비스</li>
                </ul>
                <Button
                  className="w-full h-12 text-base font-semibold rounded-xl"
                  onClick={handlePaySubscription}
                  disabled={isAuthenticated ? (loading || !isReady) : false}
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Crown className="w-4 h-4 mr-2" />}
                  구독 시작하기
                </Button>
              </Card>

              {/* 신뢰 배지 */}
              <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" />안전결제</span>
                <span>카드 · 계좌이체 · 휴대폰</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MobilePaymentFlow;
