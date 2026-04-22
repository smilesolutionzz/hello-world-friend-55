import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePayment } from '@/hooks/usePayment';
import { Sparkles, Check, Loader2, ShieldCheck } from 'lucide-react';
import {
  MIND_TRACK_PRICE,
  MIND_TRACK_ORIGINAL_PRICE,
  MIND_TRACK_DISCOUNT_PERCENT,
} from '@/constants/tokenCosts';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: string;
  title?: string;
  description?: string;
  onSuccess?: () => void;
  /** @deprecated 단일 상품으로 통일됨 */
  mode?: 'single' | 'subscription' | 'both';
  /** @deprecated 단일 상품으로 통일됨 */
  creditType?: 'test' | 'report';
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
    const success = await pay('mind_track_30');
    if (success) {
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const features = [
    '모든 심층 검사 무제한',
    'AI 심층 분석 리포트 무제한',
    '전문가 코칭 가이드 동봉',
    '주간 변화 트래킹 & 리마인더',
    '종료 시 변화 종합 리포트(PDF)',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title || '30일 마음 변화 트랙'}</DialogTitle>
          <DialogDescription>
            {description || '단일 상품 · 일시불 · 자동 결제 없음'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-5 border-2 border-primary rounded-2xl space-y-4 relative bg-gradient-to-br from-primary/5 to-transparent">
            <Badge className="absolute -top-3 left-4 bg-primary text-primary-foreground">
              <Sparkles className="w-3 h-3 mr-1" />
              {MIND_TRACK_DISCOUNT_PERCENT}% OFF · 단일 상품
            </Badge>

            <div className="pt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-muted-foreground line-through">
                  ₩{MIND_TRACK_ORIGINAL_PRICE.toLocaleString()}
                </span>
                <span className="text-3xl font-black text-primary">
                  ₩{MIND_TRACK_PRICE.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">· 일시불</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                하루 약 ₩{Math.round(MIND_TRACK_PRICE / 30).toLocaleString()} · 자동 결제 없음
              </p>
            </div>

            <div className="space-y-1.5">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <Button
              className="w-full h-12 text-base font-semibold"
              onClick={handlePay}
              disabled={loading || !isReady}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              30일 마음 트랙 시작하기
            </Button>

            <p className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
              <ShieldCheck className="w-3 h-3" />
              마음에 들지 않으면 30일 내 100% 환불 보장
            </p>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            토스페이먼츠 안전결제 · 카드 / 계좌이체 / 휴대폰
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
