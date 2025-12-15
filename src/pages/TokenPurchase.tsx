import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Coins, CreditCard, Building2, Smartphone, Receipt, Loader2, Check, Gift, Sparkles } from 'lucide-react';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

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
  const [tokenPackages, setTokenPackages] = useState<TokenPackage[]>([]);
  const [selectedPack, setSelectedPack] = useState<TokenPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [tossClientKey, setTossClientKey] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  // 무료 체험 관련 상태
  const [isFreeTrialEligible, setIsFreeTrialEligible] = useState<boolean | null>(null);
  const [freeTrialLoading, setFreeTrialLoading] = useState(false);
  const [checkingFreeTrial, setCheckingFreeTrial] = useState(false);

  // URL 파라미터에서 상품 정보 가져오기
  const purchaseType = searchParams.get('type');
  const productId = searchParams.get('id');

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

  // 프리미엄 패스 무료 체험 자격 확인
  useEffect(() => {
    const checkFreeTrialEligibility = async () => {
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

        const { data: previousSubs } = await supabase
          .from('user_subscriptions')
          .select('id')
          .eq('user_id', sessionData.session.user.id)
          .in('subscription_type', ['premium', 'lifetime'])
          .limit(1);

        const { data: existingTrial } = await supabase
          .from('user_free_trials')
          .select('id')
          .eq('user_id', sessionData.session.user.id)
          .eq('plan_type', 'premium')
          .limit(1);

        const isEligible = (!previousSubs || previousSubs.length === 0) && (!existingTrial || existingTrial.length === 0);
        setIsFreeTrialEligible(isEligible);
      } catch (error) {
        console.error('무료 체험 자격 확인 오류:', error);
        setIsFreeTrialEligible(false);
      } finally {
        setCheckingFreeTrial(false);
      }
    };

    checkFreeTrialEligibility();
  }, [urlProduct]);

  // Toss Client Key 가져오기
  useEffect(() => {
    const fetchClientKey = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          return;
        }

        const { data, error } = await supabase.functions.invoke('create-token-payment', {
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
          body: { 
            packageId: 'temp',
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

      const { data: plans } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('type', 'premium')
        .eq('is_active', true)
        .limit(1);

      if (!plans || plans.length === 0) {
        throw new Error('구독 플랜을 찾을 수 없습니다.');
      }

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
        navigate('/free-trial-success');
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

  // 토스페이먼츠 결제 요청 (리다이렉트 방식)
  const requestPayment = async (pack: TokenPackage) => {
    if (!tossClientKey) {
      toast({
        title: '결제 준비 중',
        description: '결제 시스템을 불러오는 중입니다. 잠시 후 다시 시도해주세요.',
        variant: 'destructive'
      });
      return;
    }

    setPaymentLoading(true);
    try {
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

      // Edge function 호출하여 결제 정보 생성
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-token-payment', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: { 
          packageId: pack.id,
          paymentType: 'token'
        }
      });

      if (paymentError || !paymentData?.paymentData) {
        throw new Error(paymentError?.message || '결제 정보 생성에 실패했습니다.');
      }

      const { paymentData: tossPaymentData } = paymentData;
      console.log('✅ 결제 정보 생성 완료:', tossPaymentData);

      // 토스페이먼츠 SDK 로드 및 결제 요청 (리다이렉트 방식)
      const tossPayments = await loadTossPayments(tossClientKey);
      
      await tossPayments.requestPayment('카드', {
        amount: tossPaymentData.amount,
        orderId: tossPaymentData.orderId,
        orderName: tossPaymentData.orderName,
        customerEmail: tossPaymentData.customerEmail,
        customerName: tossPaymentData.customerName,
        successUrl: `${window.location.origin}/token-payment-success`,
        failUrl: `${window.location.origin}/token-payment-fail`,
      });
    } catch (err: any) {
      console.error('❌ 결제 요청 오류:', err);
      toast({
        title: '결제 오류',
        description: err.message || '결제 처리 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  // URL 상품 결제 요청
  const requestUrlProductPayment = async () => {
    if (!urlProduct || !tossClientKey) {
      toast({
        title: '결제 준비 중',
        description: '결제 시스템을 불러오는 중입니다. 잠시 후 다시 시도해주세요.',
        variant: 'destructive'
      });
      return;
    }

    setPaymentLoading(true);
    try {
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

      const orderId = `${urlProduct.type}_${urlProduct.id}_${Date.now()}`;
      
      const tossPayments = await loadTossPayments(tossClientKey);
      
      await tossPayments.requestPayment('카드', {
        amount: urlProduct.price,
        orderId,
        orderName: urlProduct.name,
        customerEmail: sessionData.session.user.email || '',
        customerName: sessionData.session.user.user_metadata?.full_name || '고객',
        successUrl: `${window.location.origin}/token-payment-success?type=${urlProduct.type}`,
        failUrl: `${window.location.origin}/token-payment-fail`,
      });
    } catch (err: any) {
      console.error('❌ URL 상품 결제 요청 오류:', err);
      toast({
        title: '결제 오류',
        description: err.message || '결제 처리 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const paymentMethods = [
    { icon: CreditCard, label: '신용/체크카드' },
    { icon: Building2, label: '가상계좌' },
    { icon: Receipt, label: '계좌이체' },
    { icon: Smartphone, label: '휴대폰 결제' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="h-20 md:h-24" />
      
      <div className="container mx-auto max-w-2xl px-4 pb-8">
        {/* URL 파라미터로 전달된 상품 결제 */}
        {urlProduct ? (
          <div className="space-y-6">
            {/* 상품 카드 */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className={`px-6 py-8 text-center ${
                urlProduct.type === 'pass' 
                  ? 'bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500'
                  : urlProduct.type === 'consult'
                  ? 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500'
                  : 'bg-gradient-to-br from-blue-500 via-cyan-500 to-sky-500'
              }`}>
                <Badge className="mb-4 bg-white/20 text-white border-white/30">
                  {urlProduct.type === 'pass' ? '프리미엄 패스' : urlProduct.type === 'consult' ? '전문가 상담' : '캐시 충전'}
                </Badge>
                <h1 className="text-2xl font-bold text-white mb-2">{urlProduct.name}</h1>
                {'duration' in urlProduct && (
                  <p className="text-white/80">{urlProduct.duration}</p>
                )}
              </div>
              
              <div className="px-6 py-8 text-center border-b border-slate-100 dark:border-slate-800">
                {'originalPrice' in urlProduct && (
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-lg text-slate-400 line-through">
                      ₩{urlProduct.originalPrice.toLocaleString()}
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      {urlProduct.discount}% OFF
                    </Badge>
                  </div>
                )}
                <span className="text-4xl font-black text-slate-900 dark:text-white">
                  ₩{urlProduct.price.toLocaleString()}
                </span>
              </div>
              
              {'tokens' in urlProduct && (
                <div className="px-6 py-6 text-center">
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

              {urlProduct.type === 'pass' && (
                <div className="px-6 py-6 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-500 mb-4">포함된 혜택</h3>
                  <div className="space-y-3">
                    {['모든 AI 분석 무제한', '모든 심리검사 무제한', '상세 리포트 무제한', '프리미엄 기능 이용'].map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 무료 체험 카드 (프리미엄 패스 + 신규 사용자) */}
            {urlProduct.type === 'pass' && isFreeTrialEligible && (
              <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/50 dark:via-orange-950/50 dark:to-yellow-950/50 rounded-3xl shadow-xl overflow-hidden border-2 border-amber-400 dark:border-amber-600">
                <div className="px-6 py-6 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400 mb-4">
                    <Gift className="w-5 h-5 text-amber-600" />
                    <span className="font-bold text-amber-700 dark:text-amber-400">신규 가입자 특별 혜택</span>
                  </div>
                  
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                    🎉 1개월 무료 체험
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    첫 결제 ₩0원! 프리미엄 패스의 모든 기능을 1개월간 무료로 체험해보세요
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={startFreeTrial}
                      disabled={freeTrialLoading}
                      className="w-full h-14 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    >
                      {freeTrialLoading ? (
                        <><Loader2 className="w-5 h-5 animate-spin mr-2" />처리 중...</>
                      ) : (
                        <><Sparkles className="w-5 h-5 mr-2" />무료 체험 시작하기</>
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

            {/* 결제 버튼 카드 */}
            {(urlProduct.type !== 'pass' || !isFreeTrialEligible) && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
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

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/token-subscription')}
                      className="flex-1 h-14 rounded-xl text-base font-medium"
                    >
                      이전
                    </Button>
                    <Button
                      onClick={requestUrlProductPayment}
                      disabled={paymentLoading || !tossClientKey}
                      className={`flex-1 h-14 rounded-xl text-base font-bold text-white ${
                        urlProduct.type === 'pass' 
                          ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700' 
                          : urlProduct.type === 'consult'
                          ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700'
                      }`}
                    >
                      {paymentLoading ? (
                        <><Loader2 className="w-5 h-5 animate-spin mr-2" />결제 중...</>
                      ) : (
                        `₩${urlProduct.price.toLocaleString()} 결제하기`
                      )}
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
                  onClick={() => setSelectedPack(pack)}
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

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPack(null)}
                    className="flex-1 h-14 rounded-xl text-base font-medium"
                  >
                    이전
                  </Button>
                  <Button
                    onClick={() => requestPayment(selectedPack)}
                    disabled={paymentLoading || !tossClientKey}
                    className="flex-1 h-14 rounded-xl text-base font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                  >
                    {paymentLoading ? (
                      <><Loader2 className="w-5 h-5 animate-spin mr-2" />결제 중...</>
                    ) : (
                      `₩${selectedPack.price.toLocaleString()} 결제하기`
                    )}
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
