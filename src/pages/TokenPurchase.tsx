import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Coins, CreditCard, Building2, Smartphone, Receipt, Loader2, Check, Gift, Sparkles, Crown, Zap, Wallet, ArrowRight } from 'lucide-react';
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

// 캐시 충전 상품 정보 (1 token = 100원)
const cashProducts = {
  cash_5000: { id: 'cash_5000', name: '5,000원 캐시', tokens: 50, price: 5000, bonus: 0, displayAmount: 5000 },
  cash_10000: { id: 'cash_10000', name: '11,000원 캐시', tokens: 110, price: 10000, bonus: 10, displayAmount: 11000 },
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
            {/* 프리미엄 패스 상품 카드 - 무료 체험 통합 */}
            {urlProduct.type === 'pass' && (
              <div className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-amber-500/10 rounded-3xl shadow-xl overflow-hidden border-2 border-primary">
                {/* 상단 배지 */}
                <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-6 h-6 text-white" />
                    <span className="font-bold text-white text-lg">프리미엄 패스</span>
                  </div>
                  <Badge className="bg-white/20 text-white border-0">
                    <Zap className="w-3 h-3 mr-1" />
                    인기
                  </Badge>
                </div>

                {/* 기능 목록 */}
                <div className="px-6 py-6 bg-card">
                  <p className="text-sm text-muted-foreground mb-4">모든 기능 무제한</p>
                  <div className="space-y-3 mb-6">
                    {[
                      { name: '기본 심리검사', new: false },
                      { name: '간단 결과 요약', new: false },
                      { name: 'AI 심층 분석', new: true },
                      { name: '전문가 맞춤 추천', new: true },
                      { name: 'PDF 리포트 다운로드', new: true },
                      { name: '무제한 검사', new: true },
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <Check className={`w-5 h-5 ${feature.new ? 'text-amber-500' : 'text-green-500'}`} />
                        <span className="text-foreground font-medium">{feature.name}</span>
                        {feature.new && (
                          <Badge className="bg-amber-500 text-white text-xs border-0">NEW</Badge>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 가격 및 할인 */}
                  <div className="p-4 bg-background rounded-xl mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        {'originalPrice' in urlProduct && (
                          <p className="text-sm text-muted-foreground line-through">월 {urlProduct.originalPrice.toLocaleString()}원</p>
                        )}
                        <p className="text-2xl font-bold text-primary">월 {urlProduct.price.toLocaleString()}원</p>
                      </div>
                      {'discount' in urlProduct && (
                        <Badge className="bg-destructive text-destructive-foreground">{urlProduct.discount}% 할인</Badge>
                      )}
                    </div>
                  </div>

                  {/* 무료 체험 또는 바로 결제 */}
                  {isFreeTrialEligible && !checkingFreeTrial ? (
                    <div className="space-y-3">
                      <Button
                        onClick={startFreeTrial}
                        disabled={freeTrialLoading}
                        className="w-full h-14 rounded-xl text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                      >
                        {freeTrialLoading ? (
                          <><Loader2 className="w-5 h-5 animate-spin mr-2" />처리 중...</>
                        ) : (
                          <><Gift className="w-5 h-5 mr-2" />1개월 무료 체험 시작</>
                        )}
                      </Button>
                      <p className="text-center text-sm text-muted-foreground">
                        💳 카드 등록 불필요 • 자동 결제 없음
                      </p>
                      <Button
                        variant="ghost"
                        onClick={() => setIsFreeTrialEligible(false)}
                        className="w-full text-muted-foreground hover:text-foreground"
                      >
                        바로 결제하기 (무료 체험 건너뛰기) →
                      </Button>
                    </div>
                  ) : checkingFreeTrial ? (
                    <div className="flex items-center justify-center gap-2 py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span className="text-muted-foreground">무료 체험 자격 확인 중...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        onClick={requestUrlProductPayment}
                        disabled={paymentLoading || !tossClientKey}
                        className="w-full h-14 rounded-xl text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                      >
                        {paymentLoading ? (
                          <><Loader2 className="w-5 h-5 animate-spin mr-2" />결제 중...</>
                        ) : (
                          <><Crown className="w-5 h-5 mr-2" />프리미엄 시작하기<ArrowRight className="w-5 h-5 ml-2" /></>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 캐시 충전 상품 카드 */}
            {urlProduct.type === 'cash' && (
              <div className="bg-card rounded-3xl shadow-xl overflow-hidden border border-border">
                <div className="px-6 py-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-center">
                  <Badge className="mb-3 bg-white/20 text-white border-0">캐시 충전</Badge>
                  <h1 className="text-2xl font-bold text-white">{urlProduct.name}</h1>
                </div>

                <div className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Wallet className="w-8 h-8 text-primary" />
                    <span className="text-3xl font-bold text-foreground">
                      {'tokens' in urlProduct && urlProduct.tokens} 캐시
                    </span>
                    {'bonus' in urlProduct && urlProduct.bonus > 0 && (
                      <Badge className="bg-amber-500 text-white">+{urlProduct.bonus} 보너스</Badge>
                    )}
                  </div>
                  <p className="text-4xl font-black text-primary mb-6">
                    ₩{urlProduct.price.toLocaleString()}
                  </p>

                  <Button
                    onClick={requestUrlProductPayment}
                    disabled={paymentLoading || !tossClientKey}
                    className="w-full h-14 rounded-xl text-lg font-bold bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
                  >
                    {paymentLoading ? (
                      <><Loader2 className="w-5 h-5 animate-spin mr-2" />결제 중...</>
                    ) : (
                      <>결제하기</>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* 전문가 상담 상품 카드 */}
            {urlProduct.type === 'consult' && (
              <div className="bg-card rounded-3xl shadow-xl overflow-hidden border border-border">
                <div className="px-6 py-6 bg-gradient-to-r from-emerald-500 to-green-500 text-center">
                  <Badge className="mb-3 bg-white/20 text-white border-0">전문가 상담</Badge>
                  <h1 className="text-2xl font-bold text-white">{urlProduct.name}</h1>
                  {'duration' in urlProduct && (
                    <p className="text-white/80 mt-1">{urlProduct.duration}</p>
                  )}
                </div>

                <div className="px-6 py-8 text-center">
                  <p className="text-4xl font-black text-primary mb-6">
                    ₩{urlProduct.price.toLocaleString()}
                  </p>

                  <Button
                    onClick={requestUrlProductPayment}
                    disabled={paymentLoading || !tossClientKey}
                    className="w-full h-14 rounded-xl text-lg font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                  >
                    {paymentLoading ? (
                      <><Loader2 className="w-5 h-5 animate-spin mr-2" />결제 중...</>
                    ) : (
                      <>결제하기</>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* 결제 수단 안내 */}
            <div className="bg-muted/50 rounded-2xl p-4">
              <p className="text-sm font-medium text-foreground mb-3">결제 수단</p>
              <div className="grid grid-cols-4 gap-2">
                {paymentMethods.map((method, idx) => (
                  <div key={idx} className="flex flex-col items-center p-2 rounded-lg bg-background">
                    <method.icon className="w-5 h-5 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground text-center">{method.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-slate-500">상품 정보를 불러오는 중...</p>
          </div>
        ) : !selectedPack ? (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">캐시 충전</h1>
              <p className="text-muted-foreground">원하는 캐시팩을 선택해주세요</p>
            </div>
            
            <div className="space-y-4">
              {tokenPackages.map((pack) => (
                <div 
                  key={pack.id} 
                  onClick={() => setSelectedPack(pack)}
                  className="bg-card rounded-2xl shadow-lg border border-border p-5 cursor-pointer hover:border-primary/50 hover:shadow-xl transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                        <Wallet className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{pack.name}</h3>
                        <p className="text-muted-foreground text-sm">
                          {pack.tokens.toLocaleString()} 캐시
                          {pack.bonus_tokens > 0 && (
                            <span className="text-amber-500 font-semibold ml-1">
                              +{pack.bonus_tokens} 보너스
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-foreground">
                        ₩{pack.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        캐시당 ₩{Math.round(pack.price / (pack.tokens + pack.bonus_tokens))}
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
            <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden">
              <div className="px-6 py-8 text-center bg-gradient-to-br from-primary via-purple-500 to-blue-500">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mb-4">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">{selectedPack.name}</h1>
                <p className="text-white/80">
                  {selectedPack.tokens.toLocaleString()} 캐시
                  {selectedPack.bonus_tokens > 0 && (
                    <span className="ml-2">+ {selectedPack.bonus_tokens} 보너스</span>
                  )}
                </p>
              </div>
              
              <div className="px-6 py-6 text-center">
                <span className="text-4xl font-bold text-foreground">
                  ₩{selectedPack.price.toLocaleString()}
                </span>
              </div>
            </div>

            {/* 결제 수단 */}
            <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden">
              <div className="px-6 py-5 border-b border-border">
                <h2 className="text-lg font-bold text-foreground">결제 수단 선택</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  카드, 가상계좌, 계좌이체, 휴대폰 결제
                </p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {paymentMethods.map((method, idx) => (
                    <div key={idx} className="flex flex-col items-center p-3 rounded-xl bg-muted/50">
                      <method.icon className="w-6 h-6 text-muted-foreground mb-1" />
                      <span className="text-xs font-medium text-muted-foreground text-center leading-tight">
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
                    className="flex-1 h-14 rounded-xl text-base font-bold text-white bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
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
