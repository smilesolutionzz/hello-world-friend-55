import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePayment } from '@/hooks/usePayment';
import { Crown, Check, Loader2, Zap } from 'lucide-react';
import { SUBSCRIPTION_PRICE, SUBSCRIPTION_ORIGINAL_PRICE, SUBSCRIPTION_DISCOUNT_PERCENT, SINGLE_REPORT_PRICE, SUBSCRIPTION_YEARLY_PRICE, SUBSCRIPTION_YEARLY_ORIGINAL_PRICE, SUBSCRIPTION_YEARLY_DISCOUNT_PERCENT, SUBSCRIPTION_YEARLY_MONTHLY_PRICE } from '@/constants/tokenCosts';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: string;
  title?: string;
  description?: string;
  onSuccess?: () => void;
  /** 단건 결제 모드 (기본: 구독+단건 선택) */
  mode?: 'single' | 'subscription' | 'both';
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  onSuccess,
  mode = 'both',
}) => {
  const { pay, loading, isReady } = usePayment();

  const handlePaySingle = async () => {
    const success = await pay('single_report');
    if (success) {
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const handlePaySubscription = async () => {
    const success = await pay('subscription_monthly');
    if (success) {
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const handlePayYearly = async () => {
    const success = await pay('subscription_yearly');
    if (success) {
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const subscriptionFeatures = [
    '모든 AI 분석 무제한 이용',
    '프리미엄 리포트 무제한 다운로드',
    '전문가 우선 매칭',
    '광고 없는 서비스',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title || '서비스 이용하기'}</DialogTitle>
          <DialogDescription>{description || '필요에 맞는 플랜을 선택하세요.'}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 단건 결제 옵션 */}
          {(mode === 'single' || mode === 'both') && (
            <div className="p-4 border border-border rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="font-semibold">심층 분석 리포트 1회</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-muted-foreground line-through">₩9,900</span>
                <span className="text-2xl font-bold text-primary">₩{SINGLE_REPORT_PRICE.toLocaleString()}</span>
                <Badge variant="secondary" className="text-xs">60% 할인</Badge>
              </div>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handlePaySingle} 
                disabled={loading || !isReady}
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                리포트 1회 구매
              </Button>
            </div>
          )}

          {/* 구독 옵션 */}
          {(mode === 'subscription' || mode === 'both') && (
            <div className="p-4 border-2 border-primary rounded-xl space-y-3 relative">
              <Badge className="absolute -top-3 left-4 bg-primary text-primary-foreground">추천</Badge>
              <div className="flex items-center gap-2 pt-1">
                <Crown className="w-5 h-5 text-primary" />
                <span className="font-semibold">월간 구독</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-muted-foreground line-through">₩{SUBSCRIPTION_ORIGINAL_PRICE.toLocaleString()}</span>
                <span className="text-2xl font-bold text-primary">₩{SUBSCRIPTION_PRICE.toLocaleString()}</span>
                <Badge className="bg-destructive text-destructive-foreground text-xs">{SUBSCRIPTION_DISCOUNT_PERCENT}% 할인</Badge>
              </div>
              <div className="space-y-1.5">
                {subscriptionFeatures.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <Button 
                className="w-full h-11" 
                onClick={handlePaySubscription} 
                disabled={loading || !isReady}
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Crown className="w-4 h-4 mr-2" />}
                구독하기
              </Button>
            </div>
          )}

          <p className="text-xs text-center text-muted-foreground">토스페이먼츠 안전결제 • 카드/계좌이체/휴대폰</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
