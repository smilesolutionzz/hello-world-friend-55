import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePayment } from '@/hooks/usePayment';
import { Crown, Check, Loader2 } from 'lucide-react';
import { SUBSCRIPTION_PRICE, SUBSCRIPTION_ORIGINAL_PRICE, SUBSCRIPTION_DISCOUNT_PERCENT } from '@/constants/tokenCosts';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: string;
  title?: string;
  description?: string;
  onSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  onSuccess,
}) => {
  const { pay, loading, isReady } = usePayment();

  const handlePay = async () => {
    const success = await pay('subscription_monthly');
    if (success) {
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const features = [
    '모든 AI 분석 무제한 이용',
    '프리미엄 리포트 다운로드',
    '전문가 우선 매칭',
    '광고 없는 서비스',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-8 h-8 text-primary" />
            <div>
              <DialogTitle>{title || '월간 구독'}</DialogTitle>
              <DialogDescription>{description || '모든 기능을 무제한으로 이용하세요.'}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-xl text-center">
            <div className="text-sm text-muted-foreground line-through">₩{SUBSCRIPTION_ORIGINAL_PRICE.toLocaleString()}</div>
            <div className="text-3xl font-bold text-primary">₩{SUBSCRIPTION_PRICE.toLocaleString()}</div>
            <Badge className="mt-2 bg-destructive text-destructive-foreground">{SUBSCRIPTION_DISCOUNT_PERCENT}% 할인</Badge>
          </div>

          <div className="space-y-2">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <Button className="w-full h-12" onClick={handlePay} disabled={loading || !isReady}>
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />결제 처리 중...</>
            ) : (
              <>구독하기</>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">토스페이먼츠 안전결제 • 카드/계좌이체/휴대폰</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
