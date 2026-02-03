import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2, CreditCard, Crown, Coins, MessageCircle } from 'lucide-react';
import { usePayment, ProductId, PRODUCTS } from '@/hooks/usePayment';

interface PayButtonProps extends Omit<ButtonProps, 'onClick' | 'onError'> {
  productId: ProductId;
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
  const product = PRODUCTS[productId];

  const handleClick = async () => {
    const success = await pay(productId);
    if (success) {
      onSuccess?.();
    } else {
      onPaymentError?.('결제가 취소되었습니다.');
    }
  };

  const getIcon = () => {
    if (!showIcon) return null;
    switch (product.type) {
      case 'pass':
        return <Crown className="w-4 h-4 mr-2" />;
      case 'cash':
        return <Coins className="w-4 h-4 mr-2" />;
      case 'consult':
        return <MessageCircle className="w-4 h-4 mr-2" />;
      default:
        return <CreditCard className="w-4 h-4 mr-2" />;
    }
  };

  const getLabel = () => {
    if (label) return label;
    if (children) return children;
    
    const priceText = showPrice ? ` ₩${product.price.toLocaleString()}` : '';
    return `${product.name}${priceText}`;
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading || !isReady}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        getIcon()
      )}
      {getLabel()}
    </Button>
  );
};

// 간편 패스 구매 버튼
export const BuyPassButton: React.FC<Omit<PayButtonProps, 'productId'> & { passType?: 'pass_30' }> = ({
  passType = 'pass_30',
  ...props
}) => (
  <PayButton productId={passType} {...props} />
);

// 간편 캐시 충전 버튼
export const BuyCashButton: React.FC<Omit<PayButtonProps, 'productId'> & { cashType?: 'cash_5000' | 'cash_10000' }> = ({
  cashType = 'cash_5000',
  ...props
}) => (
  <PayButton productId={cashType} {...props} />
);

// 간편 상담 예약 버튼
export const BuyConsultButton: React.FC<Omit<PayButtonProps, 'productId'> & { consultType?: 'consult_30' | 'consult_60' }> = ({
  consultType = 'consult_30',
  ...props
}) => (
  <PayButton productId={consultType} {...props} />
);

export default PayButton;
