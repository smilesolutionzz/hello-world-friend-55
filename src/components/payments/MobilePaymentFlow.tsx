import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, Crown, Zap, ArrowLeft, ArrowRight, Check, 
  ChevronRight, Loader2, Shield, Star, FileText
} from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';
import { useSubscription } from '@/hooks/useSubscription';
import { useAccessControl } from '@/hooks/useAccessControl';
import { supabase } from '@/integrations/supabase/client';
import { SUBSCRIPTION_PRICE, SUBSCRIPTION_ORIGINAL_PRICE, SUBSCRIPTION_DISCOUNT_PERCENT, SINGLE_REPORT_PRICE, SINGLE_TEST_PRICE } from '@/constants/tokenCosts';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'select' | 'plan' | 'confirm';

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
      setStep('plan');
    }
  };

  const handlePayTest = async () => {
    if (!isAuthenticated) {
      localStorage.setItem('auth_redirect_after', '/token-subscription');
      navigate('/auth?mode=signup');
      return;
    }
    await pay('single_test');
  };

  const handlePaySingle = async () => {
    if (!isAuthenticated) {
      localStorage.setItem('auth_redirect_after', '/token-subscription');
      navigate('/auth?mode=signup');
      return;
    }
    await pay('single_report');
  };

  const handlePaySubscription = async () => {
    if (!isAuthenticated) {
      localStorage.setItem('auth_redirect_after', '/token-subscription');
      navigate('/auth?mode=signup');
      return;
    }
    await pay('subscription_monthly');
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background pb-20">
      {/* Step indicator */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => step === 'plan' ? setStep('select') : navigate(-1)} className="p-1">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 flex items-center gap-2">
            {(['select', 'plan', 'confirm'] as Step[]).map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 ${step === s ? 'text-primary font-semibold' : i < ['select', 'plan', 'confirm'].indexOf(step) ? 'text-primary/60' : 'text-muted-foreground'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === s ? 'bg-primary text-primary-foreground' : 
                    i < ['select', 'plan', 'confirm'].indexOf(step) ? 'bg-primary/20 text-primary' : 
                    'bg-muted text-muted-foreground'
                  }`}>
                    {i < ['select', 'plan', 'confirm'].indexOf(step) ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className="text-xs hidden min-[360px]:inline">
                    {s === 'select' ? '검사선택' : s === 'plan' ? '플랜선택' : '결제'}
                  </span>
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 rounded ${i < ['select', 'plan', 'confirm'].indexOf(step) ? 'bg-primary/40' : 'bg-muted'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: 검사 카테고리 선택 */}
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

              {!isPremium && reportCredits > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-center">
                  <div className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                    <Zap className="w-4 h-4 inline mr-1" />
                    리포트 이용권 {reportCredits}회 남음
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: 플랜 선택 */}
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
                <p className="text-sm text-muted-foreground mt-1">심층 분석 결과를 확인하려면 플랜이 필요해요</p>
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
                  disabled={loading || !isReady}
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
                  disabled={loading || !isReady}
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
