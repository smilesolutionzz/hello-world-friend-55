import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, Users, Crown, ArrowRight, Sparkles, 
  Check, Coins, Clock, Gift, ChevronLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTokens } from '@/hooks/useTokens';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';

type Step = 'select' | 'ai-analysis' | 'consultation' | 'unlimited';

const TokenSubscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tokenBalance } = useTokens();
  const [step, setStep] = useState<Step>('select');
  const [loading, setLoading] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const handlePurchase = async (type: string, id: string, price: number) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({ 
          title: "로그인 필요", 
          description: "구매하려면 먼저 로그인해주세요." 
        });
        navigate('/auth');
        return;
      }

      navigate(`/token-purchase?type=${type}&id=${id}&price=${price}`);
    } catch (error: any) {
      toast({ 
        title: "오류", 
        description: error.message || "오류가 발생했습니다.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  // 메인 선택 화면
  const renderMainSelect = () => (
    <div className="space-y-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          무엇을 하고 싶으세요?
        </h1>
        <p className="text-muted-foreground text-lg">
          원하는 것을 선택하면 바로 안내해드려요
        </p>
      </div>

      <div className="grid gap-4 max-w-2xl mx-auto">
        {/* AI 분석 */}
        <Card 
          className="cursor-pointer hover:shadow-lg hover:border-blue-400 transition-all group"
          onClick={() => setStep('ai-analysis')}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 group-hover:scale-110 transition-transform">
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">🔮 AI 분석 받고 싶어요</h3>
              <p className="text-muted-foreground">심리검사, 사주, 꿈해석 등</p>
            </div>
            <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-blue-500 transition-colors" />
          </CardContent>
        </Card>

        {/* 전문가 상담 */}
        <Card 
          className="cursor-pointer hover:shadow-lg hover:border-green-400 transition-all group"
          onClick={() => setStep('consultation')}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">👨‍⚕️ 전문가 상담 받고 싶어요</h3>
              <p className="text-muted-foreground">1:1 화상/전화 상담</p>
            </div>
            <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-green-500 transition-colors" />
          </CardContent>
        </Card>

        {/* 무제한 이용 */}
        <Card 
          className="cursor-pointer hover:shadow-lg hover:border-purple-400 transition-all group border-2 border-purple-200 dark:border-purple-800"
          onClick={() => setStep('unlimited')}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 group-hover:scale-110 transition-transform">
              <Crown className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">👑 다 무제한으로 쓰고 싶어요</h3>
              <p className="text-muted-foreground">프리미엄 패스 구매</p>
            </div>
            <Badge className="bg-purple-500 text-white mr-2">추천</Badge>
            <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-purple-500 transition-colors" />
          </CardContent>
        </Card>
      </div>

      {/* 현재 보유 캐시 */}
      <div className="text-center mt-8">
        <div className="inline-flex items-center gap-2 bg-muted/50 rounded-full px-5 py-2">
          <Coins className="w-5 h-5 text-amber-500" />
          <span className="text-sm">현재 보유: <strong>{tokenBalance?.current_tokens || 0} 캐시</strong></span>
        </div>
      </div>
    </div>
  );

  // AI 분석 선택 화면
  const renderAIAnalysis = () => (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => setStep('select')}
        className="mb-4"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        뒤로
      </Button>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-blue-100 dark:bg-blue-900/40 mb-4">
          <Brain className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">AI 분석 이용하기</h2>
        <p className="text-muted-foreground">캐시를 충전하고 원하는 분석을 받으세요</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {/* 소량 충전 */}
        <Card className="hover:shadow-lg transition-all">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">₩5,000</div>
            <div className="text-lg font-medium mb-4">50 캐시</div>
            <div className="space-y-2 text-sm text-muted-foreground mb-6">
              <p>• AI 분석 12회</p>
              <p>• 기본 검사 25회</p>
            </div>
            <Button 
              className="w-full bg-blue-500 hover:bg-blue-600"
              onClick={() => handlePurchase('cash', 'cash_5000', 5000)}
              disabled={loading}
            >
              충전하기
            </Button>
          </CardContent>
        </Card>

        {/* 인기 충전 */}
        <Card className="hover:shadow-lg transition-all border-2 border-blue-400 relative">
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500">인기</Badge>
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">₩10,000</div>
            <div className="text-lg font-medium mb-1">110 캐시</div>
            <div className="flex items-center justify-center gap-1 text-green-600 text-sm mb-4">
              <Gift className="w-4 h-4" />
              <span>+10 보너스</span>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground mb-6">
              <p>• AI 분석 27회</p>
              <p>• 기본 검사 55회</p>
            </div>
            <Button 
              className="w-full bg-blue-500 hover:bg-blue-600"
              onClick={() => handlePurchase('cash', 'cash_10000', 10000)}
              disabled={loading}
            >
              충전하기
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 또는 무제한 안내 */}
      <div className="text-center mt-8 p-6 bg-purple-50 dark:bg-purple-950/30 rounded-2xl max-w-3xl mx-auto">
        <p className="text-muted-foreground mb-3">매번 충전이 번거로우시다면?</p>
        <Button 
          variant="outline"
          className="border-purple-400 text-purple-600 hover:bg-purple-50"
          onClick={() => setStep('unlimited')}
        >
          <Crown className="w-4 h-4 mr-2" />
          프리미엄 패스로 무제한 이용하기
        </Button>
      </div>
    </div>
  );

  // 전문가 상담 화면
  const renderConsultation = () => (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => setStep('select')}
        className="mb-4"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        뒤로
      </Button>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-green-100 dark:bg-green-900/40 mb-4">
          <Users className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">전문가 1:1 상담</h2>
        <p className="text-muted-foreground">검증된 전문가와 깊이 있는 상담을 받으세요</p>
      </div>

      {/* 예약 안내 */}
      <div className="max-w-3xl mx-auto mb-6 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📋</div>
          <div>
            <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-1">상담 예약 안내</h4>
            <ol className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
              <li>1. 아래 전문가 리스트에서 원하시는 전문가를 선택하세요</li>
              <li>2. "예약하기" 버튼을 클릭하여 카카오톡으로 연락주세요</li>
              <li>3. 결제 안내와 함께 상담 시간을 매칭해드립니다</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {/* 30분 상담 */}
        <Card className="hover:shadow-lg transition-all">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-lg font-medium">30분 상담</span>
            </div>
            <div className="text-4xl font-bold text-primary mb-4">₩35,000</div>
            <div className="space-y-2 text-sm text-muted-foreground mb-6">
              <p>• 1:1 화상/전화 상담</p>
              <p>• 전문가 맞춤 조언</p>
              <p>• 상담 노트 제공</p>
            </div>
            <Button 
              className="w-full bg-green-500 hover:bg-green-600"
              onClick={() => window.open('https://open.kakao.com/o/sHLdK3Ch', '_blank')}
            >
              예약하기
            </Button>
          </CardContent>
        </Card>

        {/* 60분 상담 */}
        <Card className="hover:shadow-lg transition-all border-2 border-green-400 relative">
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500">추천</Badge>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-lg font-medium">60분 상담</span>
            </div>
            <div className="text-4xl font-bold text-primary mb-4">₩65,000</div>
            <div className="space-y-2 text-sm text-muted-foreground mb-6">
              <p>• 1:1 화상/전화 상담</p>
              <p>• 심층 분석 및 조언</p>
              <p>• 상담 노트 제공</p>
              <p>• 후속 질문 1회 포함</p>
            </div>
            <Button 
              className="w-full bg-green-500 hover:bg-green-600"
              onClick={() => window.open('https://open.kakao.com/o/sHLdK3Ch', '_blank')}
            >
              예약하기
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 전문가 리스트 보기 */}
      <div className="flex flex-col items-center gap-3 mt-8">
        <Button 
          variant="outline"
          size="lg"
          onClick={() => navigate('/expert-hiring')}
          className="border-green-400 text-green-600 hover:bg-green-50"
        >
          <Users className="w-5 h-5 mr-2" />
          전문가 리스트 보기
        </Button>
        <p className="text-sm text-muted-foreground">
          원하시는 전문가를 선택하신 후 카카오톡으로 문의해주세요
        </p>
      </div>
    </div>
  );

  // 무제한 (프리미엄 패스) 화면
  const renderUnlimited = () => (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => setStep('select')}
        className="mb-4"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        뒤로
      </Button>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-purple-100 dark:bg-purple-900/40 mb-4">
          <Crown className="w-10 h-10 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">프리미엄 패스</h2>
        <p className="text-muted-foreground">한 번 결제로 모든 기능을 무제한 이용하세요</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {/* 30일 */}
        <Card className="hover:shadow-lg transition-all">
          <CardContent className="p-6 text-center">
            <div className="text-lg font-medium text-muted-foreground mb-2">30일</div>
            <div className="text-3xl font-bold text-primary mb-1">₩29,900</div>
            <div className="text-sm text-muted-foreground line-through mb-4">₩49,900</div>
            <Badge variant="destructive" className="mb-4">40% 할인</Badge>
            <div className="space-y-2 text-sm text-left mb-6">
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
            </div>
            <Button 
              className="w-full"
              variant="outline"
              onClick={() => handlePurchase('pass', 'pass_30', 29900)}
              disabled={loading}
            >
              선택하기
            </Button>
          </CardContent>
        </Card>

        {/* 365일 - 추천 */}
        <Card className="hover:shadow-lg transition-all border-2 border-purple-400 relative">
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500">추천</Badge>
          <CardContent className="p-6 text-center">
            <div className="text-lg font-medium text-muted-foreground mb-2">1년</div>
            <div className="text-3xl font-bold text-primary mb-1">₩199,000</div>
            <div className="text-sm text-muted-foreground line-through mb-4">₩598,800</div>
            <Badge variant="destructive" className="mb-4">67% 할인</Badge>
            <div className="space-y-2 text-sm text-left mb-6">
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
                <span>전문가 상담 30% 할인</span>
              </div>
            </div>
            <Button 
              className="w-full bg-purple-500 hover:bg-purple-600"
              onClick={() => handlePurchase('pass', 'pass_365', 199000)}
              disabled={loading}
            >
              선택하기
            </Button>
          </CardContent>
        </Card>

        {/* 평생 */}
        <Card className="hover:shadow-lg transition-all border-2 border-amber-400 relative">
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500">🏆 BEST</Badge>
          <CardContent className="p-6 text-center">
            <div className="text-lg font-medium text-muted-foreground mb-2">평생</div>
            <div className="text-3xl font-bold text-primary mb-1">₩299,000</div>
            <div className="text-sm text-muted-foreground line-through mb-4">₩999,000</div>
            <Badge variant="destructive" className="mb-4">70% 할인</Badge>
            <div className="space-y-2 text-sm text-left mb-6">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>평생 모든 기능 무제한</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>신규 기능 평생 무료</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>전문가 상담 40% 할인</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>VIP 고객 지원</span>
              </div>
            </div>
            <Button 
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              onClick={() => handlePurchase('pass', 'pass_lifetime', 299000)}
              disabled={loading}
            >
              평생 이용하기
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-5xl">
        {step === 'select' && renderMainSelect()}
        {step === 'ai-analysis' && renderAIAnalysis()}
        {step === 'consultation' && renderConsultation()}
        {step === 'unlimited' && renderUnlimited()}
      </div>
    </div>
  );
};

export default TokenSubscription;
