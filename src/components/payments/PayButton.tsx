import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2, Crown } from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';

interface PayButtonProps extends Omit<ButtonProps, 'onClick' | 'onError'> {
  productId?: string;
  audience?: 'child' | 'adult' | 'parent' | 'teen';
  onSuccess?: () => void;
  onPaymentError?: (error: string) => void;
  showPrice?: boolean;
  showIcon?: boolean;
  label?: string;
}

export const PayButton: React.FC<PayButtonProps> = ({
  productId,
  audience,
  onSuccess,
  onPaymentError,
  showPrice = true,
  showIcon = true,
  label,
  children,
  ...props
}) => {
  const { pay, loading, isReady } = usePayment();

  const handleClick = async () => {
    const finalProductId = productId || 'mind_track_7';
    if (finalProductId === 'mind_track_7' || finalProductId === 'mind_track_30') {
      // audience 우선순위: prop → ?audience= URL 파라미터 → 'child'
      let aud: 'child' | 'adult' | 'parent' | 'teen' = audience ?? 'child';
      if (!audience) {
        const raw = new URLSearchParams(window.location.search).get('audience');
        if (raw && ['child', 'adult', 'parent', 'teen'].includes(raw)) {
          aud = raw as typeof aud;
        }
      }
      const { ensureMindTrackEnrollment } = await import('@/lib/mindTrackEnrollment');
      await ensureMindTrackEnrollment({}, finalProductId === 'mind_track_7' ? '7d' : '30d', aud);
      console.log('[PayButton] enrollment ensured', { sku: finalProductId, audience: aud });
    }
    const success = await pay(finalProductId);
    if (success) {
      onSuccess?.();
    } else {
      onPaymentError?.('결제가 취소되었습니다.');
    }
  };

  return (
    <Button onClick={handleClick} disabled={loading || !isReady} {...props}>
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : showIcon ? (
        <Crown className="w-4 h-4 mr-2" />
      ) : null}
      {children || label || (showPrice ? '7일 마음 트랙 ₩7,900' : '7일 마음 트랙 시작')}
    </Button>
  );
};

// 하위 호환성
export const BuyPassButton = PayButton;
export const BuyCashButton = PayButton;
export const BuyConsultButton = PayButton;

export default PayButton;
