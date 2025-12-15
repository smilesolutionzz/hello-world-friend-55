import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, Users, Crown, ArrowRight, 
  Check, Coins, Clock, Gift, ChevronLeft, Sparkles, MessageCircle, Zap
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
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-200 dark:border-violet-800 mb-6">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span className="text-sm font-medium text-violet-600 dark:text-violet-400">AI Highlight 프리미엄</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-slate-900 via-violet-800 to-slate-900 dark:from-white dark:via-violet-300 dark:to-white bg-clip-text text-transparent">
          무엇을 하고 싶으세요?
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          원하는 서비스를 선택하면 바로 안내해드려요
        </p>
      </div>

      {/* Service Cards */}
      <div className="grid gap-5 max-w-2xl mx-auto">
        {/* AI 분석 */}
        <div 
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-50 to-blue-100 dark:from-sky-950/50 dark:to-blue-900/30 p-1 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20"
          onClick={() => setStep('ai-analysis')}
        >
          <div className="relative rounded-[22px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-6 flex items-center gap-5">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">AI 분석 받고 싶어요</h3>
              <p className="text-slate-500 dark:text-slate-400">심리검사, 사주, 꿈해석 등</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50 group-hover:bg-blue-500 transition-colors">
              <ArrowRight className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>

        {/* 전문가 상담 */}
        <div 
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/50 dark:to-teal-900/30 p-1 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/20"
          onClick={() => setStep('consultation')}
        >
          <div className="relative rounded-[22px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-6 flex items-center gap-5">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">전문가 상담 받고 싶어요</h3>
              <p className="text-slate-500 dark:text-slate-400">1:1 화상/전화 상담</p>
            </div>
            <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/50 group-hover:bg-emerald-500 transition-colors">
              <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>

        {/* 무제한 이용 */}
        <div 
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-100 via-purple-100 to-fuchsia-100 dark:from-violet-950/50 dark:via-purple-900/30 dark:to-fuchsia-900/30 p-1 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/30"
          onClick={() => setStep('unlimited')}
        >
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-0 shadow-lg">
              <Zap className="w-3 h-3 mr-1" />
              추천
            </Badge>
          </div>
          <div className="relative rounded-[22px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-6 flex items-center gap-5">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-400 via-purple-400 to-fuchsia-400 rounded-2xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity" />
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 shadow-lg">
                <Crown className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">무제한으로 쓰고 싶어요</h3>
              <p className="text-slate-500 dark:text-slate-400">프리미엄 패스 구매</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50 group-hover:bg-gradient-to-r group-hover:from-violet-500 group-hover:to-fuchsia-500 transition-all">
              <ArrowRight className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* 현재 보유 캐시 */}
      <div className="text-center mt-10">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl px-6 py-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="text-xs text-amber-600 dark:text-amber-400">현재 보유</div>
            <div className="text-lg font-bold text-amber-700 dark:text-amber-300">{tokenBalance?.current_tokens || 0} 캐시</div>
          </div>
        </div>
      </div>
    </div>
  );

  // AI 분석 선택 화면
  const renderAIAnalysis = () => (
    <div className="animate-fade-in">
      <Button 
        variant="ghost" 
        onClick={() => setStep('select')}
        className="mb-6 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        뒤로
      </Button>

      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-5 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-xl shadow-blue-500/30 mb-5">
          <Brain className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-black mb-3 text-slate-900 dark:text-white">AI 분석 이용하기</h2>
        <p className="text-muted-foreground text-lg">캐시를 충전하고 원하는 분석을 받으세요</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* 소량 충전 */}
        <div className="group relative rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 p-6 transition-all duration-300 hover:shadow-xl">
          <div className="text-center">
            <div className="text-5xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              ₩5,000
            </div>
            <div className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-6">50 캐시</div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 mb-8">
              <div className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-blue-500" />
                <span>AI 분석 12회</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-blue-500" />
                <span>기본 검사 25회</span>
              </div>
            </div>
            <Button 
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold shadow-lg shadow-blue-500/25"
              onClick={() => handlePurchase('cash', 'cash_5000', 5000)}
              disabled={loading}
            >
              충전하기
            </Button>
          </div>
        </div>

        {/* 인기 충전 */}
        <div className="group relative rounded-3xl bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 dark:from-blue-950/50 dark:via-sky-900/30 dark:to-cyan-900/30 border-2 border-blue-300 dark:border-blue-700 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20">
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg px-4 py-1">
            인기
          </Badge>
          <div className="text-center">
            <div className="text-5xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              ₩10,000
            </div>
            <div className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-1">110 캐시</div>
            <div className="inline-flex items-center gap-1 text-emerald-600 text-sm font-medium mb-6">
              <Gift className="w-4 h-4" />
              <span>+10 보너스</span>
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 mb-8">
              <div className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-blue-500" />
                <span>AI 분석 27회</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-blue-500" />
                <span>기본 검사 55회</span>
              </div>
            </div>
            <Button 
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold shadow-lg shadow-blue-500/25"
              onClick={() => handlePurchase('cash', 'cash_10000', 10000)}
              disabled={loading}
            >
              충전하기
            </Button>
          </div>
        </div>
      </div>

      {/* 또는 무제한 안내 */}
      <div className="text-center mt-10 p-6 rounded-3xl bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/30 dark:via-purple-950/30 dark:to-fuchsia-950/30 border border-purple-200 dark:border-purple-800 max-w-3xl mx-auto">
        <p className="text-slate-600 dark:text-slate-400 mb-4">매번 충전이 번거로우시다면?</p>
        <Button 
          className="rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-bold shadow-lg shadow-purple-500/25"
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
    <div className="animate-fade-in">
      <Button 
        variant="ghost" 
        onClick={() => setStep('select')}
        className="mb-6 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        뒤로
      </Button>

      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-5 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-xl shadow-emerald-500/30 mb-5">
          <Users className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-black mb-3 text-slate-900 dark:text-white">전문가 1:1 상담</h2>
        <p className="text-muted-foreground text-lg">검증된 전문가와 깊이 있는 상담을 받으세요</p>
      </div>

      {/* 예약 안내 */}
      <div className="max-w-3xl mx-auto mb-8 p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-amber-800 dark:text-amber-300 text-lg mb-2">상담 예약 안내</h4>
            <ol className="text-sm text-amber-700 dark:text-amber-400 space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center justify-center">1</span>
                아래 전문가 리스트에서 원하시는 전문가를 선택하세요
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center justify-center">2</span>
                "예약하기" 버튼을 클릭하여 카카오톡으로 연락주세요
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center justify-center">3</span>
                결제 안내와 함께 상담 시간을 매칭해드립니다
              </li>
            </ol>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* 30분 상담 */}
        <div className="group relative rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 p-6 transition-all duration-300 hover:shadow-xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-3">
              <Clock className="w-5 h-5" />
              <span className="font-medium">30분 상담</span>
            </div>
            <div className="text-5xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
              ₩35,000
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 mb-8">
              <div className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>1:1 화상/전화 상담</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>전문가 맞춤 조언</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>상담 노트 제공</span>
              </div>
            </div>
            <Button 
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/25"
              onClick={() => window.open('https://open.kakao.com/o/sHLdK3Ch', '_blank')}
            >
              예약하기
            </Button>
          </div>
        </div>

        {/* 60분 상담 */}
        <div className="group relative rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/50 dark:via-teal-900/30 dark:to-cyan-900/30 border-2 border-emerald-300 dark:border-emerald-700 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/20">
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-lg px-4 py-1">
            추천
          </Badge>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-3">
              <Clock className="w-5 h-5" />
              <span className="font-medium">60분 상담</span>
            </div>
            <div className="text-5xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
              ₩65,000
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 mb-8">
              <div className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>1:1 화상/전화 상담</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>심층 분석 및 조언</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>상담 노트 제공</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>후속 질문 1회 포함</span>
              </div>
            </div>
            <Button 
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/25"
              onClick={() => window.open('https://open.kakao.com/o/sHLdK3Ch', '_blank')}
            >
              예약하기
            </Button>
          </div>
        </div>
      </div>

      {/* 전문가 리스트 보기 */}
      <div className="flex flex-col items-center gap-4 mt-10">
        <Button 
          size="lg"
          className="rounded-2xl bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white font-bold shadow-lg px-8"
          onClick={() => navigate('/expert-hiring')}
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
    <div className="animate-fade-in">
      <Button 
        variant="ghost" 
        onClick={() => setStep('select')}
        className="mb-6 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        뒤로
      </Button>

      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-5 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 shadow-xl shadow-purple-500/30 mb-5">
          <Crown className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-black mb-3 text-slate-900 dark:text-white">프리미엄 패스</h2>
        <p className="text-muted-foreground text-lg">한 번 결제로 모든 기능을 무제한 이용하세요</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* 30일 */}
        <div className="group relative rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 p-6 transition-all duration-300 hover:shadow-xl">
          <div className="text-center">
            <div className="text-lg font-medium text-slate-500 dark:text-slate-400 mb-2">30일</div>
            <div className="text-4xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-1">
              ₩29,900
            </div>
            <div className="text-sm text-slate-400 line-through mb-3">₩49,900</div>
            <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 mb-6">40% 할인</Badge>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 text-left mb-8">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>모든 AI 분석 무제한</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>모든 심리검사 무제한</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>상세 리포트 무제한</span>
              </div>
            </div>
            <Button 
              className="w-full h-12 rounded-2xl font-bold"
              variant="outline"
              onClick={() => handlePurchase('pass', 'pass_30', 29900)}
              disabled={loading}
            >
              선택하기
            </Button>
          </div>
        </div>

        {/* 365일 - 추천 */}
        <div className="group relative rounded-3xl bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/50 dark:via-purple-900/30 dark:to-fuchsia-900/30 border-2 border-purple-400 dark:border-purple-600 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20">
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 shadow-lg px-4 py-1">
            추천
          </Badge>
          <div className="text-center">
            <div className="text-lg font-medium text-slate-500 dark:text-slate-400 mb-2">1년</div>
            <div className="text-4xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-1">
              ₩199,000
            </div>
            <div className="text-sm text-slate-400 line-through mb-3">₩598,800</div>
            <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 mb-6">67% 할인</Badge>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 text-left mb-8">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>모든 AI 분석 무제한</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>모든 심리검사 무제한</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>상세 리포트 무제한</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>전문가 상담 30% 할인</span>
              </div>
            </div>
            <Button 
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold shadow-lg shadow-purple-500/25"
              onClick={() => handlePurchase('pass', 'pass_365', 199000)}
              disabled={loading}
            >
              선택하기
            </Button>
          </div>
        </div>

        {/* 평생 */}
        <div className="group relative rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/50 dark:via-orange-900/30 dark:to-yellow-900/30 border-2 border-amber-400 dark:border-amber-600 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/20">
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg px-4 py-1">
            🏆 BEST
          </Badge>
          <div className="text-center">
            <div className="text-lg font-medium text-slate-500 dark:text-slate-400 mb-2">평생</div>
            <div className="text-4xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-1">
              ₩299,000
            </div>
            <div className="text-sm text-slate-400 line-through mb-3">₩999,000</div>
            <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 mb-6">70% 할인</Badge>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 text-left mb-8">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>평생 모든 기능 무제한</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>신규 기능 평생 무료</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>전문가 상담 40% 할인</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>VIP 고객 지원</span>
              </div>
            </div>
            <Button 
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg shadow-amber-500/25"
              onClick={() => handlePurchase('pass', 'pass_lifetime', 299000)}
              disabled={loading}
            >
              평생 이용하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 pt-28 pb-16 max-w-5xl">
        {step === 'select' && renderMainSelect()}
        {step === 'ai-analysis' && renderAIAnalysis()}
        {step === 'consultation' && renderConsultation()}
        {step === 'unlimited' && renderUnlimited()}
      </div>
    </div>
  );
};

export default TokenSubscription;
