import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Package, Clock, Building2, Sparkles } from 'lucide-react';
import { B2BPaymentModal } from './B2BPaymentModal';
import { ProductId } from '@/hooks/usePayment';
import { motion } from 'framer-motion';

interface B2BProductCardsProps {
  onPurchaseComplete?: (productId: ProductId) => void;
}

export const B2BProductCards: React.FC<B2BProductCardsProps> = ({ onPurchaseComplete }) => {
  const [selectedProduct, setSelectedProduct] = useState<ProductId | null>(null);

  const products = [
    {
      id: 'b2b_proposal_premium' as ProductId,
      icon: FileText,
      title: '프리미엄 제안서',
      description: '기관 정보가 반영된 맞춤 PDF 제안서',
      price: 30000,
      popular: false
    },
    {
      id: 'b2b_sample_report' as ProductId,
      icon: Package,
      title: '샘플 리포트 세트',
      description: '실제 서비스 리포트 5종 체험',
      price: 99000,
      popular: true
    },
    {
      id: 'b2b_consulting_1hr' as ProductId,
      icon: Clock,
      title: '1시간 전문 컨설팅',
      description: 'B2B 도입 전략 1:1 상담',
      price: 200000,
      popular: false
    },
    {
      id: 'b2b_pilot_deposit' as ProductId,
      icon: Building2,
      title: '파일럿 예치금',
      description: '3개월 무료 체험 시작 (환불 가능)',
      price: 500000,
      popular: false
    }
  ];

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`relative h-full transition-all hover:shadow-lg ${product.popular ? 'border-2 border-blue-500' : 'hover:border-blue-200'}`}>
              {product.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-500">
                    <Sparkles className="w-3 h-3 mr-1" />
                    인기
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                  <product.icon className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{product.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-blue-600">
                    ₩{product.price.toLocaleString()}
                  </span>
                  <Button 
                    size="sm"
                    onClick={() => setSelectedProduct(product.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    구매
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {selectedProduct && (
        <B2BPaymentModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          productId={selectedProduct}
          onSuccess={() => {
            setSelectedProduct(null);
            onPurchaseComplete?.(selectedProduct);
          }}
        />
      )}
    </>
  );
};

export default B2BProductCards;
