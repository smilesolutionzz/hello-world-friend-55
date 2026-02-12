import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SUBSCRIPTION_PRICE } from '@/constants/tokenCosts';

interface B2BProductCardsProps {
  onPurchaseComplete?: (productId: string) => void;
}

export const B2BProductCards: React.FC<B2BProductCardsProps> = () => {
  const navigate = useNavigate();

  return (
    <Card className="max-w-lg mx-auto ring-2 ring-primary">
      <CardContent className="p-8 text-center">
        <Crown className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h3 className="text-xl font-bold mb-2">월간 구독</h3>
        <p className="text-3xl font-black text-primary mb-4">₩{SUBSCRIPTION_PRICE.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/월</span></p>
        <ul className="space-y-2 mb-6 text-left">
          {['모든 AI 분석 무제한', 'PDF 리포트 다운로드', '전문가 우선 매칭'].map((b, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />{b}
            </li>
          ))}
        </ul>
        <Button onClick={() => navigate('/token-subscription')} className="w-full" size="lg">
          구독하기
        </Button>
      </CardContent>
    </Card>
  );
};

export default B2BProductCards;
