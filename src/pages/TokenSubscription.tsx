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

      // 패키지별 Stripe 결제 링크 설정
      const pkg = packages.find(p => p.id === packageId);
      console.log('=== Found package:', pkg);
      
      if (pkg) {
        // 스타터팩 (100개 이하)
        if (pkg.token_count <= 100) {
          console.log('=== Redirecting to Stripe payment link for starter pack');
          const url = 'https://buy.stripe.com/test_5kQ3cpf8ybdH5CS9HrcEw01';
          console.log('=== Opening URL:', url);
          window.open(url, '_blank');
          return;
        }
        // 프리미엄팩 (101-500개)
        else if (pkg.token_count <= 500) {
          console.log('=== Redirecting to Stripe payment link for premium pack');
          const url = 'https://buy.stripe.com/test_7sY00d1hI4Pj0iydXHcEw02';
          console.log('=== Opening URL:', url);
          window.open(url, '_blank');
          return;
        }
        // 프로팩 (500개 초과)
        else {
          console.log('=== Redirecting to Stripe payment link for pro pack');
          const url = 'https://buy.stripe.com/test_9B6dR3aSi5TnaXc6vfcEw00';
          console.log('=== Opening URL:', url);
          window.open(url, '_blank');
          return;
        }
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

      if (data?.url) {
        console.log('=== Redirecting to Stripe checkout');
        // Stripe 체크아웃으로 리다이렉트
        window.location.href = data.url;
      } else {
        throw new Error('결제 URL을 받지 못했습니다.');
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
            ))
          )}
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

        {/* Founder's Letter */}
        <div className="mt-20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-warm-cream via-soft-lavender/30 to-gentle-peach rounded-3xl p-8 md:p-12 shadow-2xl border border-primary/10 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-primary/20 mb-4">
                    <Brain className="w-5 h-5 text-primary" />
                    <span className="text-primary font-semibold text-sm">창립자의 손편지</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    여러분께 전하는 진심
                  </h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
                </div>

                <div className="prose prose-lg max-w-none text-foreground/90 leading-relaxed space-y-6">
                  <p className="text-lg md:text-xl text-center font-medium text-primary mb-8 break-keep leading-relaxed">
                    "사랑하는 하이라이트 프로의<br className="hidden sm:block"/>
                    <span className="sm:hidden"> </span>첫 번째 이용자님께"
                  </p>
                  
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-white/30">
                    <p className="mb-6 text-base md:text-lg leading-relaxed break-keep">
                      안녕하세요. 저는 하이라이트 프로를 밤새 개발하며 몇 달 동안 준비해온 사람입니다.
                    </p>
                    
                    <p className="mb-6 text-base md:text-lg leading-relaxed break-keep">
                      처음 이 플랫폼을 시작한 이유는 단순했습니다.<br className="hidden sm:block"/>
                      <span className="sm:hidden"> </span><span className="font-semibold text-primary break-keep">
                        "내 아이의 발달, 내 마음의 상태, 부모님의 건강을 조금 더 쉽게 지켜볼 수 있다면 얼마나 좋을까?"
                      </span>
                    </p>
                    
                    <p className="mb-6 text-base md:text-lg leading-relaxed">
                      지난 <span className="font-bold text-primary">14년 동안</span> 
                      유소년 스포츠클럽, 발달센터, 심리상담센터, 그리고 병원 발달클리닉을 운영하며 
                      수많은 분들을 만났습니다. 그 과정에서 저는 깨달았습니다.
                    </p>
                    
                    <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 my-8 border-l-4 border-primary">
                      <p className="text-base md:text-lg leading-relaxed font-medium italic break-keep">
                        아이의 언어 발달이 늦는 건 아닐까,<br className="hidden sm:block"/>
                        <span className="sm:hidden"> </span>친구 관계에서 힘들어하지는 않을까,<br className="hidden sm:block"/>
                        <span className="sm:hidden"> </span>직장에서의 스트레스가 너무 심한 건 아닐까,<br className="hidden sm:block"/>
                        <span className="sm:hidden"> </span>부모님이 혹시 기억력이나 생활능력에 변화를 겪고 계시지는 않을까…
                      </p>
                    </div>
                    
                    <p className="mb-6 text-base md:text-lg leading-relaxed">
                      현장에서 만난 아이들, 부모님들, 그리고 치열하게 살아가는 성인과 노인분들까지…
                      각자의 고민과 어려움이 있음에도 쉽게 도움을 받을 길이 없는 현실을 보며,
                      제가 가진 기술과 경험으로 무엇을 바꿀 수 있을지 고민했습니다.
                    </p>
                    
                    <p className="mb-6 text-base md:text-lg leading-relaxed">
                      전문가를 만나기까지 몇 달을 기다려야 하고, 
                      비싼 검사비용 때문에 망설이시는 분들의 마음이 너무나 잘 보였습니다.
                      그래서 마음먹었습니다.
                    </p>
                    
                    <div className="bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl p-6 my-8 border border-primary/30">
                      <p className="text-lg md:text-xl font-bold text-center text-primary mb-4 leading-relaxed break-keep">
                        "누구나 단 3분이면,<br className="hidden sm:block"/>
                        <span className="sm:hidden"> </span>내 마음과 내 가족의 상태를<br className="hidden sm:block"/>
                        <span className="sm:hidden"> </span>쉽게 확인하고 기록할 수 있게 만들자."
                      </p>
                      <p className="text-base md:text-lg leading-relaxed text-center break-keep">
                        그렇게 만들어진 것이 바로 하이라이트 프로입니다.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-warm-cream to-soft-lavender/50 rounded-2xl p-6 md:p-8 shadow-lg border border-primary/20">
                    <div className="text-center mb-6">
                      <p className="text-lg md:text-xl font-bold text-primary mb-4 leading-relaxed break-keep">
                        짧게 남긴 기록이 데이터가 되고<br className="hidden sm:block"/>
                        <span className="sm:hidden"> </span>수천번 전문검사들과 해석들을 돌려 엔진을 고도화시켜 만들어낸<br className="hidden sm:block"/>
                        <span className="sm:hidden"> </span>AI가 빠르게 분석하고<br className="hidden sm:block"/>
                        <span className="sm:hidden"> </span>필요와 위험성이 데이터를 통해 감지되면<br className="hidden sm:block"/>
                        <span className="sm:hidden"> </span>PRO전문가가 함께 코멘트를 더해주는 시스템
                      </p>
                    </div>
                    
                    <p className="text-base md:text-lg leading-relaxed mb-6">
                      작은 기록이 쌓여서, 어느 순간 큰 변화를 예방할 수 있다면,
                      그것만으로도 이 플랫폼이 존재할 이유가 충분하다고 생각합니다.
                    </p>
                    
                    <p className="text-base md:text-lg leading-relaxed mb-6">
                      3분의 짧은 검사와 기록이 쌓여, 한 사람의 삶을 지켜낼 수 있다면.
                      AI가 빠르게 해석하고, 검증된 전문가가 마지막 터치를 더해
                      누군가에게 <span className="font-bold text-primary">"당신은 혼자가 아닙니다"</span>라는 메시지를 줄 수 있다면.
                      그것만으로도 충분히 의미 있는 길이라고 믿습니다.
                    </p>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-white/50">
                    <p className="text-base md:text-lg leading-relaxed mb-6">
                      저희는 단순한 기술이 아니라, <span className="font-bold text-primary">사람을 위한 도구</span>를 만들고 있습니다.
                      저는 한 발짝이라도 먼저 내디뎌서,
                      발달센터와 병원, 주간보호센터, 그리고 가족에게 
                      '신뢰할 수 있는 기록과 분석의 파트너'가 되고 싶습니다.
                    </p>
                    
                    <p className="text-base md:text-lg leading-relaxed mb-6">
                      당신이 오늘 남긴 작은 기록이, 내일의 안심으로 이어지기를 바라며,
                      저는 오늘도 밤을 새워 이 플랫폼을 다듬고 있습니다.
                    </p>
                    
                    <p className="text-lg md:text-xl font-bold text-center text-primary mt-6 leading-relaxed break-keep">
                      여러분의 소중한 가족들이 행복하게 성장할 수 있도록,<br className="hidden sm:block"/>
                      <span className="sm:hidden"> </span>제가 직접 만든 이 도구가 든든한 동반자가 되겠습니다.
                    </p>
                  </div>
                  
                  <div className="text-center mt-8">
                    <div className="inline-block">
                      <p className="text-lg text-muted-foreground mb-4 leading-relaxed break-keep">
                        하이라이트 프로와 함께 걸어주셔서 감사합니다.<br className="hidden sm:block"/>
                        <span className="sm:hidden"> </span>앞으로의 여정에서 더 많은 가치를 드릴 수 있도록 최선을 다하겠습니다.
                      </p>
                      <p className="text-lg text-muted-foreground mb-2">마음을 담아</p>
                      <div className="flex items-center gap-3 justify-center">
                        <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-primary"></div>
                        <span className="font-bold text-xl text-primary">AI 하이라이트프로 창립자 이수석</span>
                        <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-primary"></div>
                      </div>
                    </div>
                  </div>
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