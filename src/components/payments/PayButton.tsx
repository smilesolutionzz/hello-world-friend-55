import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2, Crown } from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';

interface PayButtonProps extends Omit<ButtonProps, 'onClick' | 'onError'> {
  productId?: string;
  onSuccess?: () => void;
  onPaymentError?: (error: string) => void;
  showPrice?: boolean;
  showIcon?: boolean;
  label?: string;
}

export const PayButton: React.FC<PayButtonProps> = ({
  productId,
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
    const success = await pay(productId || 'mind_track_30');
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
      {children || label || (showPrice ? '30일 마음 트랙 ₩19,900' : '30일 마음 트랙')}
    </Button>
  );
};

// 하위 호환성
export const BuyPassButton = PayButton;
export const BuyCashButton = PayButton;
export const BuyConsultButton = PayButton;

export default PayButton;
