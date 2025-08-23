import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Zap, Star, Crown, Check, Sparkles, Brain, Coins, Rocket, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTokens } from '@/hooks/useTokens';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import TokenBalance from '@/components/TokenBalance';

interface TokenPackage {
  id: string;
  name: string;
  description: string;
  token_count: number;
  price_krw: number;
  is_popular: boolean;
}

const TokenSubscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tokenBalance } = useTokens();
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchasingPackageId, setPurchasingPackageId] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('token_packages')
        .select('*')
        .eq('is_active', true)
        .order('price_krw', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: "오류",
        description: "토큰 패키지를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handlePurchase = async (packageId: string) => {
    console.log('=== Purchase started for package:', packageId);
    
    setPurchasingPackageId(packageId);
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({ 
          title: "로그인 필요", 
          description: "토큰을 구매하려면 먼저 로그인해주세요." 
        });
        navigate('/auth');
        return;
      }

      console.log('=== Calling create-token-order function');
      
      const { data, error } = await supabase.functions.invoke('create-token-order', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { packageId }
      });

      console.log('=== Function response:', { data, error });

      if (error) {
        console.error('=== Function error:', error);
        throw error;
      }

      if (data?.clientKey && data?.paymentData) {
        console.log('=== Starting payment process');
        await initiatePayment(data.clientKey, data.paymentData);
      } else {
        throw new Error('결제 데이터를 받지 못했습니다.');
      }
    } catch (error: any) {
      console.error('=== Purchase error:', error);
      toast({ 
        title: "오류", 
        description: error.message || "결제 처리 중 오류가 발생했습니다.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
      setPurchasingPackageId(null);
    }
  };

  const initiatePayment = async (clientKey: string, paymentData: any) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.tosspayments.com/v1/payment-widget';
      script.async = true;
      
      script.onload = () => {
        try {
          console.log('=== TossPayments script loaded');
          const paymentWidget = (window as any).PaymentWidget(clientKey, 'ANONYMOUS');
          
          const modal = document.createElement('div');
          modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
          modal.innerHTML = `
            <div class="bg-white p-6 rounded-lg max-w-md w-full relative">
              <button class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl" onclick="this.closest('.fixed').remove(); window.rejectPayment();">&times;</button>
              <h3 class="text-lg font-semibold mb-4">토큰 구매</h3>
              <div id="payment-method" class="mb-4"></div>
              <div id="agreement" class="mb-4"></div>
              <button id="pay-button" class="w-full bg-blue-500 text-white py-3 rounded-md font-medium hover:bg-blue-600">
                결제하기
              </button>
            </div>
          `;
          
          document.body.appendChild(modal);

          paymentWidget.renderPaymentMethods(
            '#payment-method',
            { value: paymentData.amount },
            { variantKey: 'DEFAULT' }
          );

          paymentWidget.renderAgreement('#agreement', { variantKey: 'AGREEMENT' });

          const payButton = modal.querySelector('#pay-button') as HTMLButtonElement;
          (window as any).rejectPayment = () => reject(new Error('사용자가 결제를 취소했습니다.'));
          
          payButton.onclick = async () => {
            try {
              console.log('=== Requesting payment');
              await paymentWidget.requestPayment({
                orderId: paymentData.orderId,
                orderName: paymentData.orderName,
                customerName: paymentData.customerName,
                customerEmail: paymentData.customerEmail,
                successUrl: `${window.location.origin}/token-payment-success`,
                failUrl: `${window.location.origin}/token-payment-fail`,
              });
              resolve(true);
            } catch (error) {
              console.error('=== Payment request failed:', error);
              reject(error);
            }
          };
        } catch (error) {
          console.error('=== Payment widget error:', error);
          reject(error);
        }
      };
      
      script.onerror = () => {
        reject(new Error('토스페이먼츠 스크립트를 불러올 수 없습니다.'));
      };
      
      document.head.appendChild(script);
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getPlanIcon = (tokenCount: number) => {
    if (tokenCount <= 100) return <Zap className="h-8 w-8 text-blue-500" />;
    if (tokenCount <= 500) return <Sparkles className="h-8 w-8 text-purple-500" />;
    return <Trophy className="h-8 w-8 text-yellow-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI 토큰 구매
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            필요한 만큼만 구매하여 AI 분석 서비스를 이용하세요
          </p>
          
          <div className="flex justify-center mb-8">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <TokenBalance showPurchaseButton={false} />
            </div>
          </div>
        </div>

        {/* Packages */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                pkg.is_popular 
                  ? 'border-2 border-purple-400 shadow-lg scale-105' 
                  : 'border border-border hover:border-primary/20'
              }`}
              style={{ overflow: 'visible' }}
            >
              {pkg.is_popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-sm font-bold shadow-lg">
                    🔥 인기 선택
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-6 pt-12">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100">
                    {getPlanIcon(pkg.token_count)}
                  </div>
                </div>
                
                <CardTitle className="text-2xl mb-2">{pkg.name}</CardTitle>
                <p className="text-muted-foreground text-sm mb-4">{pkg.description}</p>
                
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-foreground">
                    ₩{formatPrice(pkg.price_krw)}
                  </div>
                  <div className="text-xl font-bold text-primary">
                    {pkg.token_count}개 토큰
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pb-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-sm">{pkg.token_count}개 토큰 즉시 지급</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-sm">영구 사용 가능</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-sm">안전한 결제 시스템</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    className="w-full py-3 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                    disabled={loading}
                    onClick={() => {
                      console.log('=== Button clicked for package:', pkg.id);
                      handlePurchase(pkg.id);
                    }}
                  >
                    {purchasingPackageId === pkg.id ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                        처리중...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Rocket className="w-5 h-5" />
                        지금 구매하기
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 max-w-4xl mx-auto">
            <Coins className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">토큰 시스템의 장점</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-left space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-medium">필요한 만큼만 결제</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-medium">영구 사용 가능</span>
                </div>
              </div>
              <div className="text-left space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-medium">투명한 가격 체계</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-medium">언제든 추가 구매</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenSubscription;