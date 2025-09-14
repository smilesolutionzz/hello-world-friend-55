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
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [purchasingPackageId, setPurchasingPackageId] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    console.log('=== Fetching token packages...');
    setPackagesLoading(true);
    try {
      const { data, error } = await supabase
        .from('token_packages')
        .select('*')
        .eq('is_active', true)
        .order('price_krw', { ascending: true });

      console.log('=== Packages data:', data);
      console.log('=== Packages error:', error);

      if (error) throw error;
      setPackages(data || []);
      
      if (!data || data.length === 0) {
        console.warn('=== No token packages found');
        toast({
          title: "알림",
          description: "사용 가능한 토큰 패키지가 없습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('=== Error fetching packages:', error);
      toast({
        title: "오류",
        description: "토큰 패키지를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setPackagesLoading(false);
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

      // MVP 기간에는 무통장입금만 사용
      toast({
        title: "알림",
        description: "현재 MVP 기간으로 무통장입금만 지원됩니다. 아래 무통장입금을 이용해주세요.",
        variant: "default",
      });
      return;

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
      
      {/* 하이브리드 모델 1단계 안내 배너 */}
      <div className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 text-white py-4 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-blue-400/20 to-purple-400/20 animate-pulse"></div>
        <div className="container mx-auto relative z-10">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="bg-white/20 rounded-full p-2">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">🎯 1단계: 하이브리드 모델 런칭!</h2>
            </div>
            <p className="text-lg font-medium">
              토큰제와 구독제를 모두 제공합니다. 본인에게 맞는 방식을 선택하세요!
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-4 text-sm">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-bold">🆓 무료 체험</div>
                <div>월 1회 무료 체험</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-bold">🪙 토큰팩</div>
                <div>9,900원/50토큰 (시험용)</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-bold">💎 베이직</div>
                <div>19,900원/월 무제한</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            하이브리드 모델 선택
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            토큰제와 구독제 중 본인에게 맞는 방식을 선택하세요
          </p>
          
          <div className="flex justify-center mb-8">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <TokenBalance showPurchaseButton={false} />
            </div>
          </div>
        </div>

        {/* 하이브리드 선택 섹션 */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-8">어떤 방식이 나에게 맞을까요?</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-8 border border-green-200">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">베이직 구독 (추천)</h3>
                <div className="text-2xl font-bold text-green-600 mb-2">19,900원/월</div>
                <p className="text-muted-foreground">무제한 이용 가능</p>
              </div>
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">매월 무제한 검사</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">AI 상세 분석</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">전문가 상담 연결</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">24/7 지원</span>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/subscription')}
                className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-3"
              >
                베이직 구독 시작하기
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                매월 10회 이상 이용하시면 더 경제적입니다
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border border-purple-200">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">토큰팩 (시험용)</h3>
                <div className="text-2xl font-bold text-purple-600 mb-2">9,900원</div>
                <p className="text-muted-foreground">50토큰 (토큰당 198원)</p>
              </div>
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">필요한 만큼만 결제</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">토큰 영구 사용 가능</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">서비스 체험용</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">무통장입금 지원</span>
                </div>
              </div>
              <Button 
                onClick={() => window.location.href = '/bank-transfer'}
                className="w-full mt-6 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3"
              >
                토큰팩 구매하기
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                월 9회 이하 이용시 경제적입니다
              </p>
            </div>
          </div>
        </div>

        {/* 토큰제 vs 구독제 비교 */}
        <div className="mt-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">하이브리드 모델 1단계 비교</h2>
            <div className="bg-gradient-to-br from-background to-muted/30 rounded-3xl p-8 shadow-lg border border-border">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">🆓 무료 체험</div>
                  <div className="text-sm text-muted-foreground mb-4">
                    월 1회 무료로 체험하세요
                  </div>
                  <ul className="text-sm space-y-1 text-left">
                    <li>• 월 1회 심리검사</li>
                    <li>• AI 기본 분석</li>
                    <li>• 결과 요약 제공</li>
                  </ul>
                </div>
                
                <div className="text-center border-l border-r border-border px-6">
                  <div className="text-2xl font-bold mb-2">🪙 토큰팩</div>
                  <div className="text-sm text-muted-foreground mb-4">
                    9,900원으로 50토큰 (시험용)
                  </div>
                  <ul className="text-sm space-y-1 text-left">
                    <li>• 필요한 만큼만 결제</li>
                    <li>• 토큰 영구 보관</li>
                    <li>• 서비스 체험에 최적</li>
                    <li>• 무통장입금 지원</li>
                  </ul>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">💎 베이직 구독</div>
                  <div className="text-sm text-muted-foreground mb-4">
                    19,900원/월 무제한 이용
                  </div>
                  <ul className="text-sm space-y-1 text-left">
                    <li>• 무제한 검사 및 분석</li>
                    <li>• 전문가 상담 연결</li>
                    <li>• 24/7 고객 지원</li>
                    <li>• 정기 이용자에게 최적</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-lg font-semibold text-primary mb-4">
                  🎯 어떤 방식이 나에게 맞을까요?
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="font-bold text-purple-800 mb-2">토큰팩이 적합한 분</div>
                    <ul className="text-purple-700 space-y-1">
                      <li>• 월 9회 이하 이용 예정</li>
                      <li>• 서비스를 먼저 체험하고 싶은 분</li>
                      <li>• 필요할 때만 결제하고 싶은 분</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="font-bold text-green-800 mb-2">베이직 구독이 적합한 분</div>
                    <ul className="text-green-700 space-y-1">
                      <li>• 월 10회 이상 이용 예정</li>
                      <li>• 정기적인 관리가 필요한 분</li>
                      <li>• 전문가 상담까지 원하는 분</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 기존 토큰 패키지들 (참고용) */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">토큰 패키지 상세</h2>
            <p className="text-muted-foreground">
              현재 시험 운영 중인 토큰 패키지입니다
            </p>
          </div>

          {/* Packages */}
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packagesLoading ? (
              // Loading state
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader className="text-center pb-6 pt-12">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-200 rounded mx-auto w-24"></div>
                      <div className="h-4 bg-gray-200 rounded mx-auto w-32"></div>
                      <div className="h-8 bg-gray-200 rounded mx-auto w-20"></div>
                      <div className="h-6 bg-gray-200 rounded mx-auto w-16"></div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-8">
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded flex-1"></div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4">
                      <div className="w-full h-12 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : packages.length === 0 ? (
              // No packages state
              <div className="col-span-full text-center py-16">
                <div className="bg-card border border-border rounded-2xl p-8 max-w-md mx-auto">
                  <div className="text-muted-foreground mb-4">
                    <Coins className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">토큰 패키지가 없습니다</h3>
                  <p className="text-muted-foreground mb-4">
                    현재 사용 가능한 토큰 패키지가 없습니다.
                  </p>
                  <Button 
                    onClick={fetchPackages}
                    variant="outline"
                    className="mx-auto"
                  >
                    다시 시도
                  </Button>
                </div>
              </div>
            ) : (
              packages.map((pkg) => (
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
                        className="w-full py-3 text-lg font-bold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                        disabled={loading}
                        onClick={() => {
                          window.location.href = '/bank-transfer';
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Rocket className="w-5 h-5" />
                          무통장입금으로 구매하기
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20" id="faq">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">자주 묻는 질문</h2>
            <div className="space-y-6">
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-lg mb-2">하이브리드 모델이란 무엇인가요?</h3>
                <p className="text-muted-foreground">
                  토큰제와 구독제를 모두 제공하는 시스템입니다. 
                  사용 패턴에 따라 본인에게 맞는 방식을 선택할 수 있어 더욱 경제적입니다.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-lg mb-2">어떤 방식을 선택해야 하나요?</h3>
                <p className="text-muted-foreground">
                  월 10회 이상 이용 예정이시면 베이직 구독이, 
                  월 9회 이하 또는 가끔 이용하시면 토큰팩이 더 경제적입니다.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-lg mb-2">나중에 방식을 변경할 수 있나요?</h3>
                <p className="text-muted-foreground">
                  네, 언제든지 변경 가능합니다. 
                  토큰은 영구 보관되므로 구독으로 변경 후에도 기존 토큰을 사용할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenSubscription;