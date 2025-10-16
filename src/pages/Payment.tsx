import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { Check, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // 토스페이먼츠 결제 상품 정의
  const products = [
    {
      id: 'premium_month',
      name: '프리미엄 월간 구독',
      price: 29900,
      description: '무제한 AI 상담 + 전문가 매칭',
      features: [
        '무제한 AI 심리 상담',
        '전문가 1:1 매칭',
        '맞춤형 리포트 제공',
        '우선 예약 지원'
      ]
    },
    {
      id: 'token_100',
      name: '토큰 100개',
      price: 9900,
      description: '검사 및 상담에 사용 가능',
      features: [
        '검사 10회 가능',
        'AI 상담 20회',
        '30일 유효기간',
        '환불 가능'
      ]
    },
    {
      id: 'expert_consultation',
      name: '전문가 상담권',
      price: 50000,
      description: '전문 심리상담사 1:1 상담',
      features: [
        '50분 전문 상담',
        '원하는 시간 예약',
        '화상/대면 선택',
        '상담 리포트 제공'
      ]
    }
  ];

  const handlePayment = async (product: typeof products[0]) => {
    try {
      setLoading(true);

      // TODO: 토스페이먼츠 결제창 연동
      // 현재는 준비 중 메시지만 표시
      toast({
        title: "결제 준비 중",
        description: `${product.name} 결제가 곧 가능합니다. 토스페이먼츠 연동 진행 중입니다.`,
      });

      // 실제 구현 시:
      // 1. 서버에 주문 생성 요청
      // 2. 토스페이먼츠 결제창 호출
      // 3. 결제 완료 후 콜백 처리

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "결제 오류",
        description: "결제 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/10 to-soft-mint/20">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 py-24 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">서비스 결제</h1>
          <p className="text-xl text-muted-foreground">
            필요한 서비스를 선택하고 안전하게 결제하세요
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{product.price.toLocaleString()}원</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handlePayment(product)}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  결제하기
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Info */}
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>결제 안내</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">안전한 결제</h4>
              <p>토스페이먼츠를 통한 안전한 결제 서비스를 제공합니다. 신용카드, 계좌이체, 간편결제 등 다양한 결제 수단을 이용하실 수 있습니다.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">환불 정책</h4>
              <p>서비스 미사용 시 7일 이내 100% 환불 가능합니다. 부분 사용 시에는 이용 비율에 따라 차감 후 환불됩니다.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">문의</h4>
              <p>결제 관련 문의: aihpro@naver.com</p>
            </div>
          </CardContent>
        </Card>

        {/* 토스페이먼츠 상점 정보 */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>상점아이디(MID): aihpror1lo</p>
          <p className="mt-1">운영: (AI)하이라이트 | 대표: 이수석 | 사업자등록번호: 206-12-62002</p>
        </div>
      </div>
    </div>
  );
};

export default Payment;
