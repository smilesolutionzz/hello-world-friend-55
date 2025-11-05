import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, CreditCard, Building2, Smartphone, Receipt } from 'lucide-react';
import { loadPaymentWidget, PaymentWidgetInstance } from '@tosspayments/payment-widget-sdk';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';

const CUSTOMER_KEY = 'ai-highlight-customer-' + nanoid();

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  is_active: boolean;
}

const TokenPurchase = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const paymentMethodsWidgetRef = useRef<ReturnType<PaymentWidgetInstance['renderPaymentMethods']> | null>(null);
  const [tokenPackages, setTokenPackages] = useState<TokenPackage[]>([]);
  const [selectedPack, setSelectedPack] = useState<TokenPackage | null>(null);
  const [isPaymentReady, setIsPaymentReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tossClientKey, setTossClientKey] = useState<string | null>(null);

  // 실제 DB에서 토큰 패키지 조회
  useEffect(() => {
    const fetchTokenPackages = async () => {
      try {
        const { data, error } = await supabase
          .from('token_packages')
          .select('*')
          .eq('is_active', true)
          .order('token_count', { ascending: true });

        if (error) throw error;

        console.log('✅ 토큰 패키지 조회 완료:', data);
        
        // DB 컬럼명을 인터페이스에 맞게 변환
        const mappedPackages: TokenPackage[] = (data || []).map(pkg => ({
          id: pkg.id,
          name: pkg.name,
          tokens: pkg.token_count,
          price: pkg.price_krw,
          is_active: pkg.is_active
        }));
        
        setTokenPackages(mappedPackages);

        // URL 파라미터에서 토큰 수량이 있으면 해당 패키지 자동 선택
        const requestedTokens = searchParams.get('tokens');
        if (requestedTokens && mappedPackages.length > 0) {
          const targetTokens = parseInt(requestedTokens);
          const matchingPackage = mappedPackages.find(pkg => pkg.tokens === targetTokens);
          if (matchingPackage) {
            console.log('✅ URL 파라미터로 자동 선택된 패키지:', matchingPackage);
            setSelectedPack(matchingPackage);
          }
        }
      } catch (error) {
        console.error('❌ 토큰 패키지 조회 오류:', error);
        toast({
          title: '패키지 조회 실패',
          description: '토큰 패키지 정보를 불러오는데 실패했습니다.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTokenPackages();
  }, [toast, searchParams]);

  // Toss Client Key 가져오기
  useEffect(() => {
    const fetchClientKey = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          console.log('로그인 필요');
          return;
        }

        const { data, error } = await supabase.functions.invoke('create-token-payment', {
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
          body: { 
            packageId: 'temp', // 임시값으로 clientKey만 가져오기
            paymentType: 'token'
          }
        });

        if (!error && data?.clientKey) {
          console.log('✅ Toss Client Key 로드 완료');
          setTossClientKey(data.clientKey);
        }
      } catch (error) {
        console.error('❌ Client Key 로드 실패:', error);
      }
    };

    fetchClientKey();
  }, []);

  useEffect(() => {
    const initializePaymentWidget = async () => {
      if (!tossClientKey) {
        console.log('⏳ Toss Client Key 대기 중...');
        return;
      }

      try {
        console.log('🔧 결제 위젯 초기화 시작');
        const paymentWidget = await loadPaymentWidget(tossClientKey, CUSTOMER_KEY);
        paymentWidgetRef.current = paymentWidget;
        console.log('✅ 결제 위젯 초기화 완료');
      } catch (error) {
        console.error('❌ 결제 위젯 초기화 실패:', error);
        toast({
          title: '결제 시스템 오류',
          description: '결제 위젯을 불러오는데 실패했습니다.',
          variant: 'destructive'
        });
      }
    };

    initializePaymentWidget();
  }, [tossClientKey, toast]);

  useEffect(() => {
    if (selectedPack && paymentWidgetRef.current) {
      const renderPaymentMethods = async () => {
        try {
          console.log('🎨 결제 수단 렌더링 시작:', selectedPack);
          setIsPaymentReady(false);
          
          // 기존 위젯이 있다면 제거
          const widgetContainer = document.getElementById('payment-widget');
          if (widgetContainer) {
            widgetContainer.innerHTML = '';
          }

          const paymentMethodsWidget = await paymentWidgetRef.current?.renderPaymentMethods(
            '#payment-widget',
            { value: selectedPack.price },
            { variantKey: 'DEFAULT' }
          );
          
          paymentMethodsWidgetRef.current = paymentMethodsWidget;
          console.log('✅ 결제 수단 렌더링 완료');
          setIsPaymentReady(true);
        } catch (error) {
          console.error('❌ 결제 수단 렌더링 실패:', error);
          toast({
            title: '결제 수단 로드 실패',
            description: '결제 수단을 불러오는데 실패했습니다. 페이지를 새로고침 해주세요.',
            variant: 'destructive'
          });
        }
      };
      renderPaymentMethods();
    }
  }, [selectedPack, toast]);

  const handlePackSelect = (pack: TokenPackage) => {
    console.log('📦 선택된 패키지:', pack);
    setSelectedPack(pack);
    setIsPaymentReady(false);
  };

  const requestPayment = async () => {
    if (!selectedPack || !paymentWidgetRef.current) {
      console.error('❌ 결제 요청 불가: selectedPack 또는 paymentWidget 없음');
      toast({
        title: '결제 준비 중',
        description: '결제 준비가 완료될 때까지 기다려주세요.',
        variant: 'destructive'
      });
      return;
    }

    if (!isPaymentReady) {
      console.error('❌ 결제 UI가 아직 렌더링되지 않음');
      toast({
        title: '결제 UI 로딩 중',
        description: '결제 수단이 로딩 중입니다. 잠시만 기다려주세요.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // 먼저 create-token-payment API를 호출하여 결제 정보 생성
      console.log('🔄 토큰 결제 생성 요청 시작');
      console.log('📦 선택된 패키지 ID:', selectedPack.id);
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: '로그인 필요',
          description: '로그인 후 결제를 진행해주세요.',
          variant: 'destructive'
        });
        navigate('/auth');
        return;
      }
      
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-token-payment', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: { 
          packageId: selectedPack.id, // 실제 DB의 패키지 ID 사용
          paymentType: 'token'
        }
      });

      if (paymentError || !paymentData) {
        console.error('❌ 토큰 결제 생성 실패:', paymentError);
        throw new Error(paymentError?.message || '결제 정보 생성에 실패했습니다.');
      }

      const { paymentData: tossPaymentData } = paymentData;
      console.log('✅ 토큰 결제 정보 생성 완료:', tossPaymentData);

      console.log('💳 결제 요청 시작:', { 
        orderId: tossPaymentData.orderId, 
        orderName: tossPaymentData.orderName, 
        amount: tossPaymentData.amount 
      });

      await paymentWidgetRef.current.requestPayment({
        orderId: tossPaymentData.orderId,
        orderName: tossPaymentData.orderName,
        successUrl: `${window.location.origin}/token-payment-success`,
        failUrl: `${window.location.origin}/token-payment-fail`,
        customerEmail: tossPaymentData.customerEmail,
        customerName: tossPaymentData.customerName,
      });
    } catch (err: any) {
      console.error('❌ 결제 요청 오류:', err);
      toast({
        title: '결제 오류',
        description: err.message || '결제 처리 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    }
  };

  const paymentMethods = [
    { icon: CreditCard, label: '신용/체크카드', description: '간편하고 빠른 카드 결제' },
    { icon: Building2, label: '가상계좌', description: '계좌이체로 안전하게' },
    { icon: Receipt, label: '계좌이체', description: '실시간 계좌이체' },
    { icon: Smartphone, label: '휴대폰 결제', description: '휴대폰으로 간편하게' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">토큰 구매</h1>
          <p className="text-muted-foreground">원하는 토큰팩과 결제 방법을 선택해주세요</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">토큰 패키지 정보를 불러오는 중...</p>
          </div>
        ) : !selectedPack ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-4">토큰팩 선택</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tokenPackages.map((pack) => (
                <Card key={pack.id} className="shadow-xl border-2 hover:border-primary/50 transition-colors cursor-pointer">
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
                      onClick={() => handlePackSelect(pack)}
                      className="w-full h-12 text-lg font-bold"
                      style={{ backgroundColor: '#0064FF' }}
                    >
                      선택하기
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">선택한 상품</CardTitle>
                    <p className="text-muted-foreground mt-2">
                      {selectedPack.name} - {selectedPack.tokens.toLocaleString()}토큰
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">
                      ₩{selectedPack.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">결제 수단 선택</CardTitle>
                <p className="text-sm text-muted-foreground">
                  카드, 가상계좌, 계좌이체, 휴대폰 결제를 지원합니다
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {paymentMethods.map((method, idx) => (
                    <div key={idx} className="flex flex-col items-center p-4 border rounded-lg hover:border-primary/50 transition-colors">
                      <method.icon className="w-8 h-8 mb-2 text-primary" />
                      <span className="text-sm font-medium text-center">{method.label}</span>
                      <span className="text-xs text-muted-foreground text-center mt-1">{method.description}</span>
                    </div>
                  ))}
                </div>

                <div id="payment-widget" className="min-h-[400px]" />

                <div className="flex gap-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedPack(null);
                      setIsPaymentReady(false);
                    }}
                    className="flex-1"
                  >
                    다시 선택
                  </Button>
                  <Button
                    onClick={requestPayment}
                    disabled={!isPaymentReady}
                    className="flex-1 h-12 text-lg font-bold"
                    style={{ backgroundColor: '#0064FF' }}
                  >
                    결제하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenPurchase;
