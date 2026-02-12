import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePayment } from '@/hooks/usePayment';
import { Crown } from 'lucide-react';
import { SUBSCRIPTION_PRICE } from '@/constants/tokenCosts';

interface B2BPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  onSuccess?: () => void;
}

export const B2BPaymentModal: React.FC<B2BPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { pay, loading, isReady } = usePayment();

  const handlePayment = async () => {
    const success = await pay('subscription_monthly');
    if (success && onSuccess) onSuccess();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            월간 구독
          </DialogTitle>
          <DialogDescription>B2B 소액 상품이 구독으로 통합되었습니다.</DialogDescription>
        </DialogHeader>
        <div className="text-center py-4">
          <p className="text-3xl font-bold text-primary">₩{SUBSCRIPTION_PRICE.toLocaleString()}/월</p>
          <p className="text-sm text-muted-foreground mt-2">모든 기능 무제한 이용</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">취소</Button>
          <Button onClick={handlePayment} disabled={loading || !isReady} className="flex-1">
            {loading ? '결제 중...' : '구독하기'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default B2BPaymentModal;
