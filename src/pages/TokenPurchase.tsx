import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Coins, CreditCard, Building2, Smartphone, Receipt, Loader2, Check, Sparkles, Crown, Zap, Wallet, ArrowRight } from 'lucide-react';
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

  // Toss Client Key 가져오기
  useEffect(() => {
    const fetchClientKey = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          return;
        }

        // 통합 결제 시스템에서 clientKey 로드
        const { data, error } = await supabase.functions.invoke('unified-payment', {
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
          body: { action: 'get-client-key' },
        });

        if (error) {
          throw error;
        }

        if (data?.clientKey) {
          console.log('✅ Toss Client Key 로드 완료 (unified-payment)');
          setTossClientKey(data.clientKey);
        }
      } catch (error) {
        console.error('❌ Client Key 로드 실패:', error);
      }
    };

    fetchClientKey();
  }, []);

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
    console.log('🛒 결제 버튼 클릭:', { packId: pack.id, price: pack.price, tokens: pack.tokens });
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

      // 통합 결제 시스템: 결제 정보 생성
      const totalTokens = pack.tokens + (pack.bonus_tokens || 0);

      const { data, error } = await supabase.functions.invoke('unified-payment', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: {
          action: 'create-payment',
          productId: pack.id,
          productType: 'cash',
          productName: pack.name,
          amount: pack.price,
          tokens: totalTokens,
        },
      });

      if (error || !data?.success || !data?.paymentData) {
        throw new Error(data?.error || error?.message || '결제 정보 생성에 실패했습니다.');
      }

      console.log('✅ 결제 정보 생성 완료 (unified-payment):', data.paymentData);

      // 토스페이먼츠 SDK 로드 및 결제 요청
      console.log('🚀 토스 결제창 호출 시작:', data.paymentData.orderId);
      const tossPayments = await loadTossPayments(tossClientKey);

      await tossPayments.requestPayment('카드', {
        amount: data.paymentData.amount,
        orderId: data.paymentData.orderId,
        orderName: data.paymentData.orderName,
        customerEmail: data.paymentData.customerEmail,
        customerName: data.paymentData.customerName,
        successUrl: `${window.location.origin}/payment-complete?type=cash`,
        failUrl: `${window.location.origin}/payment-complete?status=fail`,
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
    console.log('🛒 URL 상품 결제 버튼 클릭:', urlProduct);
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

      // 캐시 상품인 경우 토큰 수량 계산 (보너스 포함)
      let tokenAmount = 0;
      if (urlProduct.type === 'cash' && 'tokens' in urlProduct) {
        tokenAmount = urlProduct.tokens; // 이미 보너스 포함된 총 토큰 수
      }

      // 통합 결제 시스템: 결제 정보 생성
      const { data, error } = await supabase.functions.invoke('unified-payment', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: {
          action: 'create-payment',
          productId: urlProduct.id,
          productType: urlProduct.type,
          productName: urlProduct.type === 'cash' && 'displayAmount' in urlProduct
            ? `캐시 ${(urlProduct as any).displayAmount.toLocaleString()}원 충전`
            : urlProduct.name,
          amount: urlProduct.price,
          tokens: tokenAmount,
        },
      });

      if (error || !data?.success || !data?.paymentData) {
        throw new Error(data?.error || error?.message || '결제 정보 생성에 실패했습니다.');
      }

      console.log('🚀 토스 결제창 호출 시작 (URL 상품):', data.paymentData.orderId);
      const tossPayments = await loadTossPayments(tossClientKey);

      await tossPayments.requestPayment('카드', {
        amount: data.paymentData.amount,
        orderId: data.paymentData.orderId,
        orderName: data.paymentData.orderName,
        customerEmail: data.paymentData.customerEmail,
        customerName: data.paymentData.customerName,
        successUrl: `${window.location.origin}/payment-complete?type=${urlProduct.type}`,
        failUrl: `${window.location.origin}/payment-complete?status=fail`,
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

                  {/* 결제 버튼 */}
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
                </div>
              </div>
            )}

            {/* 캐시 충전 상품 카드 */}
            {urlProduct.type === 'cash' && (
              <div className="bg-card rounded-3xl shadow-xl overflow-hidden border border-border">
                <div className="px-6 py-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-center">
                  <Badge className="mb-3 bg-white/20 text-white border-0">캐시 충전</Badge>
                  <h1 className="text-2xl font-bold text-white">
                    {'displayAmount' in urlProduct ? `${urlProduct.displayAmount.toLocaleString()}원 충전` : urlProduct.name}
                  </h1>
                </div>

                <div className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Wallet className="w-8 h-8 text-primary" />
                    <span className="text-3xl font-bold text-foreground">
                      {'displayAmount' in urlProduct ? `${(urlProduct as any).displayAmount.toLocaleString()}원 충전` : `${urlProduct.price.toLocaleString()}원`}
                    </span>
                    {'displayAmount' in urlProduct && (urlProduct as any).displayAmount > urlProduct.price && (
                      <Badge className="bg-amber-500 text-white">+{((urlProduct as any).displayAmount - urlProduct.price).toLocaleString()}원 보너스</Badge>
                    )}
                  </div>
                  <p className="text-4xl font-black text-primary mb-2">
                    ₩{urlProduct.price.toLocaleString()}
                  </p>
                  {'displayAmount' in urlProduct && urlProduct.displayAmount > urlProduct.price && (
                    <p className="text-sm text-emerald-600 font-medium mb-6">
                      {(urlProduct.displayAmount - urlProduct.price).toLocaleString()}원 추가 혜택!
                    </p>
                  )}

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
