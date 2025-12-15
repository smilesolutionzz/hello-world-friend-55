import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, CreditCard, Building2, Smartphone, Receipt, RefreshCw, Loader2, Crown, Users, Clock, Check } from 'lucide-react';
import { loadPaymentWidget, PaymentWidgetInstance } from '@tosspayments/payment-widget-sdk';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

// 세션 기반 고객 키 (페이지 새로고침해도 유지)
const getCustomerKey = () => {
  let key = sessionStorage.getItem('toss_customer_key');
  if (!key) {
    key = 'ai-highlight-customer-' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    sessionStorage.setItem('toss_customer_key', key);
  }
  return key;
};

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  is_active: boolean;
  bonus_tokens: number;
}

// 프리미엄 패스 상품 정보
const passProducts = {
  pass_30: { id: 'pass_30', name: '프리미엄 패스 30일', duration: '30일', price: 29900, originalPrice: 49900, discount: 40 },
  pass_365: { id: 'pass_365', name: '프리미엄 패스 1년', duration: '1년', price: 199000, originalPrice: 598800, discount: 67 },
  pass_lifetime: { id: 'pass_lifetime', name: '프리미엄 패스 평생', duration: '평생', price: 299000, originalPrice: 999000, discount: 70 },
};

// 캐시 충전 상품 정보
const cashProducts = {
  cash_5000: { id: 'cash_5000', name: '캐시 50', tokens: 50, price: 5000, bonus: 0 },
  cash_10000: { id: 'cash_10000', name: '캐시 110', tokens: 100, price: 10000, bonus: 10 },
};

// 상담 상품 정보
const consultProducts = {
  consult_30: { id: 'consult_30', name: '전문가 상담 30분', duration: '30분', price: 35000 },
  consult_60: { id: 'consult_60', name: '전문가 상담 60분', duration: '60분', price: 65000 },
};

const TokenPurchase = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const paymentMethodsWidgetRef = useRef<ReturnType<PaymentWidgetInstance['renderPaymentMethods']> | null>(null);
  const customerKeyRef = useRef<string>(getCustomerKey());
  const [tokenPackages, setTokenPackages] = useState<TokenPackage[]>([]);
  const [selectedPack, setSelectedPack] = useState<TokenPackage | null>(null);
  const [isPaymentReady, setIsPaymentReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tossClientKey, setTossClientKey] = useState<string | null>(null);
  const [widgetReady, setWidgetReady] = useState(false);
  const [inIframe, setInIframe] = useState(false);
  const [widgetVisible, setWidgetVisible] = useState(false);
  const [widgetLoading, setWidgetLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // URL 파라미터에서 상품 정보 가져오기
  const purchaseType = searchParams.get('type'); // 'pass', 'cash', 'consult', or null (token)
  const productId = searchParams.get('id');
  const productPrice = searchParams.get('price') ? parseInt(searchParams.get('price')!) : null;

  // URL 파라미터로 전달된 상품 정보 가져오기
  const getUrlProduct = () => {
    if (!purchaseType || !productId) return null;
    
    if (purchaseType === 'pass' && productId in passProducts) {
      return { type: 'pass', ...passProducts[productId as keyof typeof passProducts] };
    }
    if (purchaseType === 'cash' && productId in cashProducts) {
      return { type: 'cash', ...cashProducts[productId as keyof typeof cashProducts] };
    }
    if (purchaseType === 'consult' && productId in consultProducts) {
      return { type: 'consult', ...consultProducts[productId as keyof typeof consultProducts] };
    }
    return null;
  };

  const urlProduct = getUrlProduct();

  // 실제 DB에서 토큰 패키지 조회 (URL 파라미터가 없을 때만)
  useEffect(() => {
    if (urlProduct) {
      setLoading(false);
      return;
    }

    const fetchTokenPackages = async () => {
      try {
        const { data, error } = await supabase
          .from('token_packages')
          .select('*')
          .eq('is_active', true)
          .order('token_count', { ascending: true });

        if (error) throw error;

        console.log('✅ 토큰 패키지 조회 완료:', data);
        
        const mappedPackages: TokenPackage[] = (data || []).map(pkg => ({
          id: pkg.id,
          name: pkg.name,
          tokens: pkg.token_count,
          price: pkg.price_krw,
          is_active: pkg.is_active,
          bonus_tokens: pkg.bonus_tokens || 0
        }));
        
        setTokenPackages(mappedPackages);

        const requestedTokens = searchParams.get('tokens');
        if (requestedTokens && mappedPackages.length > 0) {
          const targetTokens = parseInt(requestedTokens);
          const matchingPackage = mappedPackages.find(pkg => pkg.tokens === targetTokens);
          if (matchingPackage) {
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
  }, [toast, searchParams, urlProduct]);

  // 프리뷰(iFrame) 환경 감지
  useEffect(() => {
    try {
      setInIframe(window.self !== window.top);
    } catch {
      setInIframe(true);
    }
  }, []);

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
        setWidgetReady(false);
        const paymentWidget = await loadPaymentWidget(tossClientKey, customerKeyRef.current);
        paymentWidgetRef.current = paymentWidget;
        setWidgetReady(true);
        console.log('✅ 결제 위젯 초기화 완료');
      } catch (error) {
        console.error('❌ 결제 위젯 초기화 실패:', error);
        setWidgetReady(false);
        toast({
          title: '결제 시스템 오류',
          description: '결제 위젯을 불러오는데 실패했습니다. 페이지를 새로고침 해주세요.',
          variant: 'destructive'
        });
      }
    };

    initializePaymentWidget();
  }, [tossClientKey, toast]);

  // 위젯 렌더링 함수
  const renderWidget = useCallback(async () => {
    if (!selectedPack || !widgetReady || !paymentWidgetRef.current) {
      return false;
    }

    try {
      setWidgetLoading(true);
      console.log('🎨 결제 수단 렌더링 시작:', {
        pack: selectedPack.name,
        price: selectedPack.price,
        widgetReady,
        hasWidget: !!paymentWidgetRef.current
      });
      
      setIsPaymentReady(false);
      setWidgetVisible(false);
      
      // 기존 위젯이 있다면 제거
      const widgetContainer = document.getElementById('payment-widget');
      if (widgetContainer) {
        console.log('🧹 기존 위젯 컨테이너 초기화');
        widgetContainer.innerHTML = '';
      } else {
        console.error('❌ payment-widget 컨테이너를 찾을 수 없음');
        setWidgetLoading(false);
        return false;
      }

      console.log('💳 renderPaymentMethods 호출 시작');
      const paymentMethodsWidget = paymentWidgetRef.current.renderPaymentMethods(
        '#payment-widget',
        { value: selectedPack.price },
        { variantKey: 'DEFAULT' }
      );
      
      paymentMethodsWidgetRef.current = paymentMethodsWidget;
      console.log('✅ 결제 수단 렌더링 완료');
      
      // 여러 번 체크하여 iframe 로딩 확인 (최대 5초)
      let attempts = 0;
      const maxAttempts = 10;
      const checkInterval = 500;
      
      return new Promise<boolean>((resolve) => {
        const checkIframe = () => {
          const mounted = !!document.querySelector('#payment-widget iframe');
          attempts++;
          
          if (mounted) {
            setWidgetVisible(true);
            setIsPaymentReady(true);
            setWidgetLoading(false);
            console.log('👀 위젯 표시됨 (시도:', attempts, ')');
            resolve(true);
          } else if (attempts >= maxAttempts) {
            setWidgetVisible(false);
            setIsPaymentReady(false);
            setWidgetLoading(false);
            console.log('⚠️ 위젯이 표시되지 않음 (도메인/iFrame 차단 가능)');
            resolve(false);
          } else {
            setTimeout(checkIframe, checkInterval);
          }
        };
        
        setTimeout(checkIframe, checkInterval);
      });
    } catch (error) {
      console.error('❌ 결제 수단 렌더링 실패:', error);
      setWidgetLoading(false);
      toast({
        title: '결제 수단 로드 실패',
        description: '결제 위젯을 불러오지 못했습니다. 재시도 버튼을 눌러주세요.',
        variant: 'destructive'
      });
      return false;
    }
  }, [selectedPack, widgetReady, toast]);

  // URL 상품용 위젯 렌더링
  const renderUrlProductWidget = useCallback(async () => {
    if (!urlProduct || !widgetReady || !paymentWidgetRef.current) {
      return false;
    }

    try {
      setWidgetLoading(true);
      console.log('🎨 URL 상품 결제 수단 렌더링 시작:', urlProduct);
      
      const widgetContainer = document.getElementById('payment-widget');
      if (widgetContainer) {
        widgetContainer.innerHTML = '';
      } else {
        setWidgetLoading(false);
        return false;
      }

      const paymentMethodsWidget = paymentWidgetRef.current.renderPaymentMethods(
        '#payment-widget',
        { value: urlProduct.price },
        { variantKey: 'DEFAULT' }
      );
      
      paymentMethodsWidgetRef.current = paymentMethodsWidget;
      
      let attempts = 0;
      const maxAttempts = 10;
      const checkInterval = 500;
      
      return new Promise<boolean>((resolve) => {
        const checkIframe = () => {
          const mounted = !!document.querySelector('#payment-widget iframe');
          attempts++;
          
          if (mounted) {
            setWidgetVisible(true);
            setWidgetLoading(false);
            resolve(true);
          } else if (attempts >= maxAttempts) {
            setWidgetVisible(false);
            setWidgetLoading(false);
            resolve(false);
          } else {
            setTimeout(checkIframe, checkInterval);
          }
        };
        
        setTimeout(checkIframe, checkInterval);
      });
    } catch (error) {
      console.error('❌ URL 상품 결제 수단 렌더링 실패:', error);
      setWidgetLoading(false);
      return false;
    }
  }, [urlProduct, widgetReady]);

  // URL 상품 위젯 렌더링 트리거
  useEffect(() => {
    if (urlProduct && widgetReady && paymentWidgetRef.current) {
      renderUrlProductWidget();
    }
  }, [urlProduct, widgetReady, renderUrlProductWidget]);

  useEffect(() => {
    const renderPaymentMethods = async () => {
      if (!selectedPack) {
        console.log('⏳ 패키지 선택 대기 중');
        return;
      }
      
      if (!widgetReady) {
        console.log('⏳ 위젯 준비 대기 중');
        return;
      }
      
      if (!paymentWidgetRef.current) {
        console.log('⏳ paymentWidget 대기 중');
        return;
      }

      await renderWidget();
    };
    
    renderPaymentMethods();
  }, [selectedPack, widgetReady, renderWidget]);

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

  // URL 상품 결제 요청
  const requestUrlProductPayment = async () => {
    if (!urlProduct || !paymentWidgetRef.current) {
      toast({
        title: '결제 준비 중',
        description: '결제 준비가 완료될 때까지 기다려주세요.',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log('🔄 URL 상품 결제 요청 시작:', urlProduct);
      
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
      
      // 주문 ID 생성
      const orderId = `${urlProduct.type}_${urlProduct.id}_${Date.now()}`;
      
      console.log('💳 결제 요청 시작:', { 
        orderId, 
        orderName: urlProduct.name, 
        amount: urlProduct.price 
      });

      await paymentWidgetRef.current.requestPayment({
        orderId,
        orderName: urlProduct.name,
        successUrl: `${window.location.origin}/token-payment-success?type=${urlProduct.type}`,
        failUrl: `${window.location.origin}/token-payment-fail`,
        customerEmail: sessionData.session.user.email || '',
        customerName: sessionData.session.user.user_metadata?.full_name || '고객',
      });
    } catch (err: any) {
      console.error('❌ URL 상품 결제 요청 오류:', err);
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
          <h1 className="text-4xl font-bold mb-4">
            {urlProduct?.type === 'pass' ? '프리미엄 패스 구매' : 
             urlProduct?.type === 'consult' ? '전문가 상담 예약' : 
             urlProduct?.type === 'cash' ? '캐시 충전' : '토큰 구매'}
          </h1>
          <p className="text-muted-foreground">
            {urlProduct?.type === 'pass' ? '모든 기능을 무제한으로 이용하세요' : 
             urlProduct?.type === 'consult' ? '전문가와 1:1 상담을 예약하세요' : 
             urlProduct?.type === 'cash' ? 'AI 분석에 사용할 캐시를 충전하세요' : 
             '원하는 토큰팩과 결제 방법을 선택해주세요'}
          </p>
        </div>

        {/* URL 파라미터로 전달된 상품 결제 */}
        {urlProduct ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {urlProduct.type === 'pass' && (
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40">
                        <Crown className="w-8 h-8 text-purple-600" />
                      </div>
                    )}
                    {urlProduct.type === 'consult' && (
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40">
                        <Users className="w-8 h-8 text-green-600" />
                      </div>
                    )}
                    {urlProduct.type === 'cash' && (
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40">
                        <Coins className="w-8 h-8 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-2xl">{urlProduct.name}</CardTitle>
                      {'duration' in urlProduct && (
                        <p className="text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {urlProduct.duration}
                        </p>
                      )}
                      {'tokens' in urlProduct && (
                        <p className="text-muted-foreground mt-1">
                          {urlProduct.tokens} 캐시 {'bonus' in urlProduct && urlProduct.bonus > 0 && `+ ${urlProduct.bonus} 보너스`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {'originalPrice' in urlProduct && (
                      <p className="text-sm text-muted-foreground line-through">
                        ₩{urlProduct.originalPrice.toLocaleString()}
                      </p>
                    )}
                    <p className="text-3xl font-bold text-primary">
                      ₩{urlProduct.price.toLocaleString()}
                    </p>
                    {'discount' in urlProduct && (
                      <Badge variant="destructive" className="mt-1">{urlProduct.discount}% 할인</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              {urlProduct.type === 'pass' && (
                <CardContent className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>모든 AI 분석 무제한</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>모든 심리검사 무제한</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>상세 리포트 무제한</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>프리미엄 기능 이용</span>
                    </div>
                  </div>
                </CardContent>
              )}
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
                    </div>
                  ))}
                </div>

                {widgetLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
                    <span className="text-muted-foreground">결제 수단을 불러오는 중...</span>
                  </div>
                )}

                <div id="payment-widget" className="w-full" style={{ minHeight: widgetLoading ? '0' : '400px' }} />

                <div className="flex gap-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/token-subscription')}
                    className="flex-1"
                  >
                    다시 선택
                  </Button>
                  <Button
                    onClick={requestUrlProductPayment}
                    disabled={!widgetReady}
                    className="flex-1 h-12 text-lg font-bold"
                    style={{ backgroundColor: urlProduct.type === 'pass' ? '#9333ea' : urlProduct.type === 'consult' ? '#22c55e' : '#0064FF' }}
                  >
                    {widgetReady ? '결제하기' : '준비 중...'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : loading ? (
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
                        {pack.bonus_tokens > 0 && (
                          <div className="text-lg text-orange-500 font-semibold mt-1">
                            + {pack.bonus_tokens} 보너스 토큰 🎁
                          </div>
                        )}
                      </div>
                      <div className="text-2xl font-semibold">
                        ₩{pack.price.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        {pack.bonus_tokens > 0 ? (
                          <span className="text-orange-600 font-semibold">
                            총 {(pack.tokens + pack.bonus_tokens).toLocaleString()}토큰 (토큰당 ₩{Math.round(pack.price / (pack.tokens + pack.bonus_tokens))})
                          </span>
                        ) : (
                          <span>토큰당 ₩{Math.round(pack.price / pack.tokens)}</span>
                        )}
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
                      {selectedPack.bonus_tokens > 0 && (
                        <span className="text-orange-500 font-semibold ml-2">
                          + 보너스 {selectedPack.bonus_tokens}토큰 🎁 (총 {(selectedPack.tokens + selectedPack.bonus_tokens).toLocaleString()}토큰)
                        </span>
                      )}
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

                {widgetLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
                    <span className="text-muted-foreground">결제 수단을 불러오는 중...</span>
                  </div>
                )}

                <div id="payment-widget" className="w-full" style={{ minHeight: widgetLoading ? '0' : '400px' }} />

                {!widgetVisible && !widgetLoading && selectedPack && (
                  <div className="mt-3 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-3">
                      결제 위젯이 보이지 않나요? 아래 방법을 시도해보세요:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          setRetryCount(prev => prev + 1);
                          await renderWidget();
                        }}
                        className="gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        다시 시도 ({retryCount})
                      </Button>
                      {inIframe && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(window.location.href, '_blank', 'noopener')}
                        >
                          새 창에서 열기
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.location.reload()}
                      >
                        페이지 새로고침
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      * 팝업 차단이나 광고 차단 앱이 활성화되어 있다면 비활성화 후 다시 시도해주세요.
                    </p>
                  </div>
                )}

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
