import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePayment } from '@/hooks/usePayment';
import { Sparkles, Check, Loader2, ShieldCheck, Zap } from 'lucide-react';
import {
  MIND_TRACK_PRICE,
  MIND_TRACK_ORIGINAL_PRICE,
  MIND_TRACK_7_PRICE,
  MIND_TRACK_7_ORIGINAL_PRICE,
  MIND_TRACK_7_DISCOUNT_PERCENT,
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

type Plan = '7d' | '30d';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  onSuccess,
}) => {
  const { pay, loading, isReady } = usePayment();
  const [plan, setPlan] = useState<Plan>('7d');

  const handlePay = async () => {
    const { ensureMindTrackEnrollment } = await import('@/lib/mindTrackEnrollment');
    await ensureMindTrackEnrollment({}, plan);
    const success = await pay(plan === '7d' ? 'mind_track_7' : 'mind_track_30');
    if (success) {
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const features7 = [
    '하루 5분 맞춤 코칭 미션 7일',
    '주 1회 변화 리포트',
    '전문가 코칭 가이드 동봉',
    '7일 내 100% 환불 보장',
  ];

  const features30 = [
    '하루 5분 맞춤 코칭 미션 30일',
    '주간 변화 트래킹 & 리마인더',
    '종료 시 변화 종합 리포트(PDF)',
    '7일 내 100% 환불 보장',
  ];

  const isSeven = plan === '7d';
  const features = isSeven ? features7 : features30;
  const price = isSeven ? MIND_TRACK_7_PRICE : MIND_TRACK_PRICE;
  const original = isSeven ? MIND_TRACK_7_ORIGINAL_PRICE : MIND_TRACK_ORIGINAL_PRICE;
  const days = isSeven ? 7 : 30;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title || '마음 변화 트랙'}</DialogTitle>
          <DialogDescription>
            {description || '일시불 · 자동 결제 없음 · 7일 내 100% 환불'}
          </DialogDescription>
        </DialogHeader>

        {/* Plan toggle */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPlan('7d')}
            className={`relative rounded-2xl border-2 p-3 text-left transition-all ${
              isSeven
                ? 'border-primary bg-primary/5'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] font-bold text-amber-600">추천</span>
            </div>
            <div className="text-xs text-slate-500">7일 시작</div>
            <div className="text-base font-bold text-slate-900">₩{MIND_TRACK_7_PRICE.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500">하루 약 ₩{Math.round(MIND_TRACK_7_PRICE / 7).toLocaleString()}</div>
          </button>
          <button
            type="button"
            onClick={() => setPlan('30d')}
            className={`relative rounded-2xl border-2 p-3 text-left transition-all ${
              !isSeven
                ? 'border-primary bg-primary/5'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="text-[10px] font-medium text-slate-400 mb-1">한 번에 길게</div>
            <div className="text-xs text-slate-500">30일</div>
            <div className="text-base font-bold text-slate-900">₩{MIND_TRACK_PRICE.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500">하루 약 ₩{Math.round(MIND_TRACK_PRICE / 30).toLocaleString()}</div>
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-5 border-2 border-primary rounded-2xl space-y-4 relative bg-gradient-to-br from-primary/5 to-transparent">
            <Badge className="absolute -top-3 left-4 bg-primary text-primary-foreground">
              <Sparkles className="w-3 h-3 mr-1" />
              {isSeven ? `${MIND_TRACK_7_DISCOUNT_PERCENT}% OFF · 7일 챌린지` : '30일 한 번에'}
            </Badge>

            <div className="pt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-muted-foreground line-through">
                  ₩{original.toLocaleString()}
                </span>
                <span className="text-3xl font-black text-primary">
                  ₩{price.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">· 일시불</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                하루 약 ₩{Math.round(price / days).toLocaleString()} · 자동 결제 없음
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
              {isSeven ? '7일 마음 트랙 시작하기' : '30일 마음 트랙 시작하기'}
            </Button>

            <p className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
              <ShieldCheck className="w-3 h-3" />
              마음에 들지 않으면 7일 내 100% 환불 보장
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
