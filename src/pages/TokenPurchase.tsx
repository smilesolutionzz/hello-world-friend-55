import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins } from 'lucide-react';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { useToast } from '@/hooks/use-toast';

const TOSS_CLIENT_KEY = 'live_gck_ma60RZbIrqo1lKlBKmjW3wzYWBn1';

const TOKEN_PACKS = [
  { tokens: 50, price: 9900, name: '토큰팩 50' },
  { tokens: 150, price: 19900, name: '토큰팩 150' },
  { tokens: 400, price: 39900, name: '토큰팩 400' }
];

const TokenPurchase = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const requestPayment = async (amount: number, packName: string, tokenCount: number) => {
    try {
      const orderId = `order-${Date.now()}`;
      const orderName = `${packName} (${tokenCount}토큰)`;
      const successUrl = `${window.location.origin}/payment-success?orderId=${encodeURIComponent(orderId)}&amount=${amount}&pack=${encodeURIComponent(packName)}`;
      const failUrl = `${window.location.origin}/payment-fail?orderId=${encodeURIComponent(orderId)}&amount=${amount}&pack=${encodeURIComponent(packName)}`;

      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);

      await tossPayments.requestPayment('카드', {
        amount,
        orderId,
        orderName,
        customerName: 'AI Highlight 사용자',
        successUrl,
        failUrl
      });
    } catch (err: any) {
      console.error('Toss error:', err);
      toast({
        title: '결제 오류',
        description: `${err.code || ''} ${err.message || ''}`,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">토큰 구매</h1>
          <p className="text-muted-foreground">원하는 토큰팩을 선택해주세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TOKEN_PACKS.map((pack, idx) => (
            <Card key={idx} className="shadow-xl border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <Coins className="w-12 h-12 mx-auto mb-2" />
                <CardTitle className="text-2xl font-bold">{pack.name}</CardTitle>
              </CardHeader>
              
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {pack.tokens.toLocaleString()} 토큰
                  </div>
                  <div className="text-2xl font-semibold">
                    ₩{pack.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    토큰당 ₩{Math.round(pack.price / pack.tokens)}
                  </div>
                </div>

                <Button
                  onClick={() => requestPayment(pack.price, pack.name, pack.tokens)}
                  className="w-full h-12 text-lg font-bold"
                  style={{ backgroundColor: '#0064FF' }}
                >
                  구매하기
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TokenPurchase;
