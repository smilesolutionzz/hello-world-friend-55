import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Zap, Star, Crown, Check, Sparkles, Brain, Coins, Plus, Rocket, Trophy } from 'lucide-react';
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
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({ 
        title: "로그인 필요", 
        description: "토큰을 구매하려면 먼저 로그인해주세요." 
      });
      navigate('/auth');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { 
          planId: packageId,
          subscriptionType: 'one-time' // 일회성 토큰 구매
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "결제 페이지로 이동",
          description: "Stripe 결제 페이지가 새 창에서 열렸습니다.",
        });
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({ 
        title: "오류", 
        description: error.message || "결제 처리 중 오류가 발생했습니다.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getPlanIcon = (tokenCount: number) => {
    if (tokenCount <= 100) return <Zap className="h-12 w-12 text-blue-500" />;
    if (tokenCount <= 500) return <Sparkles className="h-12 w-12 text-purple-500" />;
    return <Trophy className="h-12 w-12 text-yellow-500" />;
  };

  const getValuePerToken = (price: number, tokenCount: number) => {
    return Math.round(price / tokenCount);
  };

  const getGradientClass = (tokenCount: number) => {
    if (tokenCount <= 100) return 'from-blue-500 to-cyan-500';
    if (tokenCount <= 500) return 'from-purple-500 to-pink-500';
    return 'from-yellow-500 to-orange-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 py-16">
        {/* 히어로 섹션 */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium mb-8 shadow-sm">
            <Brain className="w-5 h-5" />
            AI 심리 분석 토큰 시스템
          </div>
          
          <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            스마트한 토큰으로<br />
            맞춤 AI 분석
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            필요한 만큼만 구매하고, 언제든 사용하세요.<br />
            투명하고 효율적인 토큰 기반 AI 심리 분석 서비스
          </p>
          
          {/* 현재 토큰 잔액 */}
          <div className="flex justify-center mb-12">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <TokenBalance showPurchaseButton={false} />
            </div>
          </div>
        </div>

        {/* 토큰 패키지 섹션 */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">토큰 패키지 선택</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              당신의 분석 필요에 맞는 최적의 토큰 패키지를 선택하세요
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg, index) => {
              const valuePerToken = getValuePerToken(pkg.price_krw, pkg.token_count);
              const gradientClass = getGradientClass(pkg.token_count);
              
              return (
                <Card 
                  key={pkg.id} 
                  className={`relative group transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
                    pkg.is_popular 
                      ? 'border-2 border-purple-400 shadow-xl scale-105' 
                      : 'border-2 border-transparent hover:border-primary/20'
                  } overflow-hidden`}
                >
                  {/* 배경 그라데이션 */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  {pkg.is_popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 text-sm font-bold shadow-lg">
                        🔥 인기 선택
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8 pt-12">
                    {/* 아이콘 */}
                    <div className="flex justify-center mb-6">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradientClass} shadow-lg`}>
                        {getPlanIcon(pkg.token_count)}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3">{pkg.name}</h3>
                    <p className="text-muted-foreground text-base mb-6">{pkg.description}</p>
                    
                    {/* 가격 */}
                    <div className="space-y-2">
                      <div className="text-5xl font-bold text-foreground">
                        ₩{formatPrice(pkg.price_krw)}
                      </div>
                      <div className={`text-2xl font-bold bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>
                        {pkg.token_count}개 토큰
                      </div>
                      <div className="text-sm text-muted-foreground">
                        토큰당 ₩{valuePerToken}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pb-8">
                    {/* 혜택 리스트 */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${gradientClass} flex items-center justify-center`}>
                          <Check className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-foreground font-medium">{pkg.token_count}개 토큰 즉시 지급</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${gradientClass} flex items-center justify-center`}>
                          <Check className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-foreground font-medium">영구 사용 가능</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${gradientClass} flex items-center justify-center`}>
                          <Check className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-foreground font-medium">안전한 Stripe 결제</span>
                      </div>
                      {pkg.token_count >= 200 && (
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${gradientClass} flex items-center justify-center`}>
                            <Check className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-foreground font-medium">프리미엄 분석 지원</span>
                        </div>
                      )}
                      {pkg.token_count >= 1000 && (
                        <>
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${gradientClass} flex items-center justify-center`}>
                              <Check className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-foreground font-medium">전문가급 심층 분석</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${gradientClass} flex items-center justify-center`}>
                              <Check className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-foreground font-medium">우선 고객 지원</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* CTA 버튼 */}
                    <div className="pt-6">
                      <Button 
                        className={`w-full py-4 text-lg font-bold bg-gradient-to-r ${gradientClass} hover:shadow-lg hover:scale-105 transition-all duration-300 text-white border-0`}
                        disabled={loading}
                        onClick={() => handlePurchase(pkg.id)}
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                            처리중...
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <Rocket className="w-6 h-6" />
                            지금 구매하기
                          </div>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* 토큰 사용 가이드 */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">토큰 사용 가이드</h2>
            <p className="text-lg text-muted-foreground">각 분석별 토큰 소모량을 확인하세요</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center p-8 hover:shadow-lg transition-all duration-300 group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">기본 분석</h3>
              <div className="text-3xl font-bold text-blue-600 mb-3">2-5 토큰</div>
              <p className="text-muted-foreground">심리상태 체크, ADHD 테스트, 우울감 진단</p>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-all duration-300 group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">프리미엄 분석</h3>
              <div className="text-3xl font-bold text-purple-600 mb-3">5-8 토큰</div>
              <p className="text-muted-foreground">꿈 해석, 사주 분석, AI 코치 상담</p>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-all duration-300 group">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">전문가급 분석</h3>
              <div className="text-3xl font-bold text-yellow-600 mb-3">10+ 토큰</div>
              <p className="text-muted-foreground">종합 심리 검사, 전문가 리포트</p>
            </Card>
          </div>
        </div>

        {/* 혜택 섹션 */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-12 max-w-4xl mx-auto">
            <Coins className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">토큰 시스템의 장점</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div className="text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold">필요한 만큼만 결제</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold">영구 사용 가능</span>
                </div>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold">투명한 가격 체계</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold">언제든 추가 구매</span>
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