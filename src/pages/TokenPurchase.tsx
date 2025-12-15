import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Coins, CreditCard, Building2, Smartphone, Receipt, RefreshCw, Loader2, Crown, Users, Clock, Check, Gift, Sparkles } from 'lucide-react';
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
  
  // 무료 체험 관련 상태
  const [isFreeTrialEligible, setIsFreeTrialEligible] = useState<boolean | null>(null);
  const [freeTrialLoading, setFreeTrialLoading] = useState(false);
  const [checkingFreeTrial, setCheckingFreeTrial] = useState(false);

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

  // 프리미엄 패스 무료 체험 자격 확인
  useEffect(() => {
    const checkFreeTrialEligibility = async () => {
      // 프리미엄 패스가 아니면 체크 안함
      if (!urlProduct || urlProduct.type !== 'pass') {
        setIsFreeTrialEligible(false);
        return;
      }

      setCheckingFreeTrial(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          setIsFreeTrialEligible(false);
          return;
        }

        // 이전 프리미엄 구독 이력 확인
        const { data: previousSubs } = await supabase
          .from('user_subscriptions')
          .select('id')
          .eq('user_id', sessionData.session.user.id)
          .in('subscription_type', ['premium', 'lifetime'])
          .limit(1);

        // 무료 체험 사용 이력 확인
        const { data: existingTrial } = await supabase
          .from('user_free_trials')
          .select('id')
          .eq('user_id', sessionData.session.user.id)
          .eq('plan_type', 'premium')
          .limit(1);

        // 이전 구독이 없고, 무료 체험을 사용한 적이 없으면 무료 체험 가능
        const isEligible = (!previousSubs || previousSubs.length === 0) && (!existingTrial || existingTrial.length === 0);
        setIsFreeTrialEligible(isEligible);
        console.log('🎁 무료 체험 자격:', isEligible);
      } catch (error) {
        console.error('무료 체험 자격 확인 오류:', error);
        setIsFreeTrialEligible(false);
      } finally {
        setCheckingFreeTrial(false);
      }
    };

    checkFreeTrialEligibility();
  }, [urlProduct]);

  // 무료 체험 시작 함수
  const startFreeTrial = async () => {
    if (!urlProduct || urlProduct.type !== 'pass') return;
    
    setFreeTrialLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: '로그인 필요',
          description: '로그인 후 이용해주세요.',
          variant: 'destructive'
        });
        navigate('/auth');
        return;
      }

      // subscription_plans에서 premium 플랜 ID 찾기
      const { data: plans } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('type', 'premium')
        .eq('is_active', true)
        .limit(1);

      if (!plans || plans.length === 0) {
        throw new Error('구독 플랜을 찾을 수 없습니다.');
      }

      // Edge function 호출하여 무료 체험 시작
      const { data, error } = await supabase.functions.invoke('create-toss-payment', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: { 
          planId: plans[0].id,
          subscriptionType: 'monthly'
        }
      });

      if (error) throw error;

      if (data?.isFreeTrial) {
        toast({
          title: '🎉 무료 체험 시작!',
          description: '1개월 무료 프리미엄 패스가 활성화되었습니다.',
        });
        navigate('/token-subscription');
      } else {
        throw new Error('무료 체험 처리 중 오류가 발생했습니다.');
      }
    } catch (error: any) {
      console.error('무료 체험 시작 오류:', error);
      toast({
        title: '오류',
        description: error.message || '무료 체험 시작 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setFreeTrialLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* 모바일 상단 여백 */}
      <div className="h-20 md:h-24" />
      
      <div className="container mx-auto max-w-2xl px-4 pb-8">
        {/* URL 파라미터로 전달된 상품 결제 */}
        {urlProduct ? (
          <div className="space-y-6">
            {/* 상품 카드 */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
              {/* 헤더 영역 */}
              <div className={`px-6 py-8 text-center ${
                urlProduct.type === 'pass' 
                  ? 'bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500' 
                  : urlProduct.type === 'consult'
                  ? 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500'
                  : 'bg-gradient-to-br from-blue-500 via-cyan-500 to-sky-500'
              }`}>
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
                  urlProduct.type === 'pass' 
                    ? 'bg-white/20' 
                    : urlProduct.type === 'consult'
                    ? 'bg-white/20'
                    : 'bg-white/20'
                }`}>
                  {urlProduct.type === 'pass' && <Crown className="w-8 h-8 text-white" />}
                  {urlProduct.type === 'consult' && <Users className="w-8 h-8 text-white" />}
                  {urlProduct.type === 'cash' && <Coins className="w-8 h-8 text-white" />}
                </div>
                
                <h1 className="text-2xl font-bold text-white mb-2">
                  {urlProduct.name}
                </h1>
                
                {'duration' in urlProduct && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full text-white/90 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{urlProduct.duration} 이용</span>
                  </div>
                )}
              </div>
              
              {/* 가격 영역 */}
              <div className="px-6 py-6 text-center border-b border-slate-100 dark:border-slate-800">
                {'originalPrice' in urlProduct && (
                  <p className="text-lg text-slate-400 line-through mb-1">
                    ₩{urlProduct.originalPrice.toLocaleString()}
                  </p>
                )}
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">
                    ₩{urlProduct.price.toLocaleString()}
                  </span>
                  {'discount' in urlProduct && (
                    <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                      {urlProduct.discount}% 할인
                    </span>
                  )}
                </div>
              </div>
              
              {/* 혜택 리스트 */}
              {urlProduct.type === 'pass' && (
                <div className="px-6 py-6">
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wide">
                    포함된 혜택
                  </h3>
                  <div className="space-y-3">
                    {[
                      '모든 AI 분석 무제한',
                      '모든 심리검사 무제한',
                      '상세 리포트 무제한',
                      '프리미엄 기능 이용'
                    ].map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {'tokens' in urlProduct && (
                <div className="px-6 py-6">
                  <div className="flex items-center justify-center gap-2 text-lg">
                    <Coins className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {urlProduct.tokens} 캐시
                    </span>
                    {'bonus' in urlProduct && urlProduct.bonus > 0 && (
                      <span className="text-orange-500 font-semibold">
                        + {urlProduct.bonus} 보너스
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 무료 체험 카드 (프리미엄 패스 + 신규 사용자) */}
            {urlProduct.type === 'pass' && isFreeTrialEligible && (
              <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/50 dark:via-orange-950/50 dark:to-yellow-950/50 rounded-3xl shadow-xl overflow-hidden border-2 border-amber-400 dark:border-amber-600">
                <div className="px-6 py-6 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400 dark:border-amber-600 mb-4">
                    <Gift className="w-5 h-5 text-amber-600" />
                    <span className="font-bold text-amber-700 dark:text-amber-400">신규 가입자 특별 혜택</span>
                  </div>
                  
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                    🎉 1개월 무료 체험
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    첫 결제 ₩0원! 프리미엄 패스의 모든 기능을<br />
                    1개월간 무료로 체험해보세요
                  </p>
                  
                  <div className="space-y-3 text-left max-w-xs mx-auto mb-6">
                    {[
                      '모든 AI 분석 무제한',
                      '모든 심리검사 무제한',
                      '상세 리포트 무제한',
                      '언제든지 해지 가능'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center">
                          <Check className="w-3 h-3 text-amber-700 dark:text-amber-300" />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={startFreeTrial}
                      disabled={freeTrialLoading}
                      className="w-full h-14 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30"
                    >
                      {freeTrialLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          처리 중...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          무료 체험 시작하기
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      onClick={() => setIsFreeTrialEligible(false)}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      바로 결제하기 (무료 체험 건너뛰기)
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 결제 수단 카드 (무료 체험 자격이 없거나 건너뛴 경우) */}
            {(urlProduct.type !== 'pass' || !isFreeTrialEligible) && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                {/* 무료 체험 체크 중 로딩 */}
                {urlProduct.type === 'pass' && checkingFreeTrial && (
                  <div className="px-6 py-4 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                      <span className="text-sm text-amber-700 dark:text-amber-400">무료 체험 자격 확인 중...</span>
                    </div>
                  </div>
                )}
                
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">결제 수단 선택</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    카드, 가상계좌, 계좌이체, 휴대폰 결제
                  </p>
                </div>
                
                <div className="p-6">
                  {/* 결제 수단 아이콘 그리드 */}
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {paymentMethods.map((method, idx) => (
                      <div key={idx} className="flex flex-col items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <method.icon className="w-6 h-6 text-slate-600 dark:text-slate-400 mb-1" />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 text-center leading-tight">
                          {method.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {widgetLoading && (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
                      <span className="text-slate-500">결제 수단 불러오는 중...</span>
                    </div>
                  )}

                  <div id="payment-widget" className="w-full" style={{ minHeight: widgetLoading ? '0' : '350px' }} />

                  {/* 버튼 영역 */}
                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/token-subscription')}
                      className="flex-1 h-14 rounded-xl text-base font-medium"
                    >
                      이전
                    </Button>
                    <Button
                      onClick={requestUrlProductPayment}
                      disabled={!widgetReady}
                      className={`flex-1 h-14 rounded-xl text-base font-bold text-white ${
                        urlProduct.type === 'pass' 
                          ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700' 
                          : urlProduct.type === 'consult'
                          ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700'
                      }`}
                    >
                      {widgetReady ? `₩${urlProduct.price.toLocaleString()} 결제하기` : '준비 중...'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-slate-500">상품 정보를 불러오는 중...</p>
          </div>
        ) : !selectedPack ? (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">토큰팩 선택</h1>
              <p className="text-slate-500">원하는 토큰팩을 선택해주세요</p>
            </div>
            
            <div className="space-y-4">
              {tokenPackages.map((pack) => (
                <div 
                  key={pack.id} 
                  onClick={() => handlePackSelect(pack)}
                  className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-5 cursor-pointer hover:border-primary/50 hover:shadow-xl transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <Coins className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{pack.name}</h3>
                        <p className="text-slate-500 text-sm">
                          {pack.tokens.toLocaleString()} 토큰
                          {pack.bonus_tokens > 0 && (
                            <span className="text-orange-500 font-semibold ml-1">
                              +{pack.bonus_tokens} 보너스
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-slate-900 dark:text-white">
                        ₩{pack.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400">
                        토큰당 ₩{Math.round(pack.price / (pack.tokens + pack.bonus_tokens))}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 선택한 상품 */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-6 py-8 text-center bg-gradient-to-br from-blue-500 via-cyan-500 to-sky-500">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mb-4">
                  <Coins className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">{selectedPack.name}</h1>
                <p className="text-white/80">
                  {selectedPack.tokens.toLocaleString()} 토큰
                  {selectedPack.bonus_tokens > 0 && (
                    <span className="ml-2">+ {selectedPack.bonus_tokens} 보너스</span>
                  )}
                </p>
              </div>
              
              <div className="px-6 py-6 text-center">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">
                  ₩{selectedPack.price.toLocaleString()}
                </span>
              </div>
            </div>

            {/* 결제 수단 */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">결제 수단 선택</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  카드, 가상계좌, 계좌이체, 휴대폰 결제
                </p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {paymentMethods.map((method, idx) => (
                    <div key={idx} className="flex flex-col items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <method.icon className="w-6 h-6 text-slate-600 dark:text-slate-400 mb-1" />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 text-center leading-tight">
                        {method.label}
                      </span>
                    </div>
                  ))}
                </div>

                {widgetLoading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
                    <span className="text-slate-500">결제 수단 불러오는 중...</span>
                  </div>
                )}

                <div id="payment-widget" className="w-full" style={{ minHeight: widgetLoading ? '0' : '350px' }} />

                {!widgetVisible && !widgetLoading && selectedPack && (
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-sm text-slate-500 mb-3">
                      결제 위젯이 보이지 않나요?
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
                        다시 시도
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
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedPack(null);
                      setIsPaymentReady(false);
                    }}
                    className="flex-1 h-14 rounded-xl text-base font-medium"
                  >
                    이전
                  </Button>
                  <Button
                    onClick={requestPayment}
                    disabled={!isPaymentReady}
                    className="flex-1 h-14 rounded-xl text-base font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                  >
                    결제하기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenPurchase;
