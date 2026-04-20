import React, { useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, CheckCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SubscriptionGuardContext } from './SubscriptionGuard';
import { MIND_TRACK_PRICE, MIND_TRACK_ORIGINAL_PRICE, MIND_TRACK_DISCOUNT_PERCENT } from '@/constants/tokenCosts';
import { useNavigate } from 'react-router-dom';

/**
 * 결과 화면을 감싸서, 결제가 필요하면 블러 오버레이 + 결제 CTA를 표시합니다.
 * SubscriptionGuard의 consumeAt="result" 모드와 함께 사용합니다.
 */
export const ResultPaywall: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ctx = useContext(SubscriptionGuardContext);
  const navigate = useNavigate();

  // 컨텍스트가 없거나, 이미 잠금해제됨 → 그대로 렌더
  if (!ctx || ctx.resultUnlocked) {
    return <>{children}</>;
  }

  const {
    unlockResult,
    hasCreditAccess,
    isTrialAllowed,
    remaining,
    featureName,
    loading,
  } = ctx;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-pulse text-center">
          <Sparkles className="w-10 h-10 text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">결과 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 결과 미리보기 (블러 처리) */}
      <div className="max-h-[500px] overflow-hidden relative">
        <div className="filter blur-sm pointer-events-none select-none" aria-hidden>
          {children}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      {/* 결제 CTA 오버레이 */}
      <div className="relative -mt-20 z-10 px-4">
        <div className="max-w-lg mx-auto bg-card border-2 border-primary/20 rounded-2xl shadow-xl p-6 space-y-5">
          <div className="text-center space-y-2">
            <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Lock className="w-7 h-7 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold">검사 완료! 결과를 확인하세요</h3>
            <p className="text-sm text-muted-foreground">
              {featureName} 분석이 완료되었습니다
            </p>
          </div>

          {/* 무료 체험 가능 */}
          {isTrialAllowed && (
            <Button onClick={unlockResult} className="w-full h-12 text-base" size="lg">
              <Sparkles className="w-5 h-5 mr-2" />
              무료로 결과 확인 (남은 {remaining === Infinity ? '무제한' : `${remaining}회`})
            </Button>
          )}

          {/* 챌린지 보유 시 즉시 잠금 해제 */}
          {!isTrialAllowed && hasCreditAccess && (
            <Button onClick={unlockResult} className="w-full h-12 text-base" size="lg">
              <Sparkles className="w-5 h-5 mr-2" />
              30일 마음 챌린지로 결과 확인
            </Button>
          )}

          {/* 챌린지 미구매 → 단일 CTA */}
          {!isTrialAllowed && !hasCreditAccess && (
            <div className="space-y-3">
              <div className="border-2 border-primary rounded-xl p-4 space-y-3 relative bg-gradient-to-br from-primary/5 to-transparent">
                <Badge className="absolute -top-2.5 right-3 bg-primary text-primary-foreground text-[10px]">
                  단일 상품
                </Badge>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">30일 마음 변화 챌린지</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-muted-foreground line-through">
                      ₩{MIND_TRACK_ORIGINAL_PRICE.toLocaleString()}
                    </span>
                    <span className="text-lg font-bold text-primary">
                      ₩{MIND_TRACK_PRICE.toLocaleString()}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {MIND_TRACK_DISCOUNT_PERCENT}%↓
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {['모든 검사 결과 잠금 해제', 'AI 심층 분석 리포트', '30일 맞춤 코칭', '30일 무조건 환불 보장'].map((f, i) => (
                    <div key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={() => navigate('/pricing')} className="w-full" size="lg">
                  <Sparkles className="w-4 h-4 mr-2" />
                  30일 챌린지 시작하기
                </Button>
                <p className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                  <ShieldCheck className="w-3 h-3" />
                  마음에 들지 않으면 30일 내 100% 환불
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultPaywall;
