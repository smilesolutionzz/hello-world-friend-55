import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePayment, PRODUCTS, ProductId } from '@/hooks/usePayment';
import { Crown, Coins, MessageCircle, Check, Loader2, Sparkles } from 'lucide-react';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: ProductId;
  title?: string;
  description?: string;
  onSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onOpenChange,
  productId,
  title,
  description,
  onSuccess,
}) => {
  const { pay, loading, isReady } = usePayment();
  const product = productId ? PRODUCTS[productId] : null;

  const handlePay = async () => {
    if (!productId) return;
    const success = await pay(productId);
    if (success) {
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const getIcon = () => {
    if (!product) return <Crown className="w-8 h-8" />;
    switch (product.type) {
      case 'pass':
        return <Crown className="w-8 h-8 text-amber-500" />;
      case 'cash':
        return <Coins className="w-8 h-8 text-emerald-500" />;
      case 'consult':
        return <MessageCircle className="w-8 h-8 text-blue-500" />;
      default:
        return <Sparkles className="w-8 h-8 text-primary" />;
    }
  };

  const getFeatures = () => {
    if (!product) return [];
    switch (product.type) {
      case 'pass':
        return [
          '모든 AI 분석 무제한 이용',
          '프리미엄 리포트 다운로드',
          '전문가 우선 매칭',
          '광고 없는 서비스',
        ];
      case 'cash':
        return [
          'AI 심층 분석 이용 가능',
          '전문 리포트 열람',
          '유효기간 무제한',
        ];
      case 'consult':
        return [
          '검증된 전문 상담사',
          '화상/음성 상담 선택',
          '상담 기록 저장',
        ];
      default:
        return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {getIcon()}
            <div>
              <DialogTitle>{title || product?.name || '결제하기'}</DialogTitle>
              <DialogDescription>
                {description || product?.description || '안전하게 결제를 진행합니다.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {product && (
          <div className="space-y-4">
            {/* 가격 표시 */}
            <div className="p-4 bg-muted/50 rounded-xl text-center">
              {'originalPrice' in product && product.originalPrice && (
                <div className="text-sm text-muted-foreground line-through">
                  ₩{(product.originalPrice as number).toLocaleString()}
                </div>
              )}
              <div className="text-3xl font-bold text-primary">
                ₩{product.price.toLocaleString()}
              </div>
              {'discount' in product && product.discount && (
                <Badge className="mt-2 bg-destructive text-destructive-foreground">
                  {product.discount as number}% 할인
                </Badge>
              )}
            </div>

            {/* 기능 목록 */}
            <div className="space-y-2">
              {getFeatures().map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* 결제 버튼 */}
            <Button
              className="w-full h-12"
              onClick={handlePay}
              disabled={loading || !isReady}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  결제 처리 중...
                </>
              ) : (
                <>결제하기</>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              토스페이먼츠 안전결제 • 카드/계좌이체/휴대폰
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
