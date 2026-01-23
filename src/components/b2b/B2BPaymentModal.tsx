import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, CreditCard, Shield, Zap } from 'lucide-react';
import { usePayment, PRODUCTS, ProductId } from '@/hooks/usePayment';

interface B2BPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: ProductId;
  onSuccess?: () => void;
}

export const B2BPaymentModal: React.FC<B2BPaymentModalProps> = ({
  isOpen,
  onClose,
  productId,
  onSuccess
}) => {
  const { pay, loading, isReady } = usePayment();
  const product = PRODUCTS[productId];

  if (!product) return null;

  const handlePayment = async () => {
    const success = await pay(productId);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  const benefits = {
    b2b_proposal_premium: [
      '기관 맞춤 로고 및 정보 반영',
      '프린트 최적화 레이아웃',
      'PDF 형식으로 공유 가능',
      '영업팀 직접 활용 가능'
    ],
    b2b_sample_report: [
      '5종 발달검사 샘플 리포트',
      '학부모용/기관용 버전 포함',
      '실제 데이터 기반 예시',
      '프레젠테이션 활용 가능'
    ],
    b2b_consulting_1hr: [
      '전문 컨설턴트 1:1 상담',
      '기관 맞춤 도입 전략 제안',
      'ROI 예측 및 분석',
      '질의응답 및 기술 데모'
    ],
    b2b_pilot_deposit: [
      '3개월 무료 시범 운영',
      '전담 CS 매니저 배정',
      '정식 계약 시 예치금 100% 차감',
      '미계약 시 전액 환불'
    ]
  };

  const productBenefits = benefits[productId as keyof typeof benefits] || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            {product.name}
          </DialogTitle>
          <DialogDescription>
            {product.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 가격 표시 */}
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6 text-center">
              <p className="text-4xl font-bold text-blue-600">
                ₩{product.price.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                부가세 포함 / 즉시 이용
              </p>
            </CardContent>
          </Card>

          {/* 혜택 리스트 */}
          <div className="space-y-2">
            <p className="text-sm font-medium">포함 내용:</p>
            <ul className="space-y-2">
              {productBenefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* 보안 뱃지 */}
          <div className="flex items-center justify-center gap-4 py-2">
            <Badge variant="outline" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              안전결제
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              즉시발급
            </Badge>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            취소
          </Button>
          <Button 
            onClick={handlePayment} 
            disabled={loading || !isReady}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? '결제 중...' : '결제하기'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default B2BPaymentModal;
