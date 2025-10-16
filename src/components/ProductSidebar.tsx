import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Crown, FileText, Clock, Brain, Users, MessageCircle, Star, Zap, Gift } from 'lucide-react';

const ProductSidebar = () => {
  const navigate = useNavigate();

  const scrollToComprehensiveReport = () => {
    // Find the ComprehensiveReportSection and scroll to it
    const reportSection = document.querySelector('[data-section="comprehensive-report"]');
    if (reportSection) {
      reportSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // If not found, navigate to dashboard where it should be visible
      navigate('/dashboard');
      setTimeout(() => {
        const reportSection = document.querySelector('[data-section="comprehensive-report"]');
        if (reportSection) {
          reportSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  };

  const products = [
    {
      icon: <Clock className="w-5 h-5" />,
      title: "3분 심리검사",
      tokenCost: "2토큰",
      badge: "시작",
      badgeType: "popular",
      description: "빠른 기본 심리상태 체크",
      route: "/assessment"
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "관찰일지 작성",
      tokenCost: "3토큰",
      badge: "습관형성",
      badgeType: "new",
      description: "체계적인 행동 관찰 기록",
      route: "/observation"
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: "AI 상담사",
      tokenCost: "무료",
      badge: "추천",
      badgeType: "recommended",
      description: "24시간 AI 심리상담",
      route: "/ai-counselor"
    },
    {
      icon: <Crown className="w-5 h-5" />,
      title: "프리미엄 검사",
      tokenCost: "8토큰",
      badge: "심화분석",
      badgeType: "hot",
      description: "전문가급 상세 심리분석",
      route: "/premium-assessment"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "가족케어 패키지",
      tokenCost: "20토큰",
      badge: "확장",
      badgeType: "package",
      description: "가족 전체 심리관리",
      route: "/family"
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: "20분상담(비대면)",
      tokenCost: "150토큰",
      badge: "PRO전문가상담",
      badgeType: "recommended",
      description: "카카오톡,전화,화상 전문가 상담",
      route: "/expert-hiring"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "AIH박사급리포팅",
      tokenCost: "200토큰",
      badge: "프리미엄",
      badgeType: "premium",
      description: "15페이지이상의 맞춤 리포팅(PDF)",
      route: "/experts"
    }
  ];

  const handleProductClick = (route: string) => {
    navigate(route);
  };

  const handleDetailClick = (product: any, e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    
    if (product.title === "AIH박사급리포팅") {
      window.open("https://smilesolution.kr/product/%ED%86%A0%EB%93%A4%EB%9F%AC%ED%8E%80-%EC%BB%AC%EB%9F%AC%ED%92%80-%EB%8F%84%ED%98%95-%EB%B8%94%EB%A1%9D/15/category/1/display/4/", "_blank");
    } else if (product.title === "20분상담(비대면)") {
      navigate("/expert-hiring");
    } else {
      navigate(product.route);
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'hot':
        return 'bg-red-500 text-white hover:bg-red-600';
      case 'new':
        return 'bg-green-500 text-white hover:bg-green-600';
      case 'popular':
        return 'bg-blue-500 text-white hover:bg-blue-600';
      case 'recommended':
        return 'bg-purple-500 text-white hover:bg-purple-600';
      case 'latest':
        return 'bg-orange-500 text-white hover:bg-orange-600';
      case 'package':
        return 'bg-pink-500 text-white hover:bg-pink-600';
      case 'premium':
        return 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600';
      default:
        return 'bg-gray-500 text-white hover:bg-gray-600';
    }
  };

  return (
    <div className="w-72 bg-black text-white h-[calc(100vh-4rem)] p-4 overflow-y-auto flex flex-col border-r border-gray-700">
      {/* Hook Section */}
      <div className="mb-6 p-4 bg-gray-800/80 rounded-lg border border-gray-600">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-bold text-yellow-400">왜 AIHPRO인가?</h3>
        </div>
        <div className="space-y-2 text-base font-medium">
          <p className="text-gray-100">✅ <span className="text-green-400 font-bold">3분</span>만에 전문가급 분석</p>
          <p className="text-gray-100">✅ <span className="text-blue-400 font-bold">30+</span> 전문기관과 제휴</p>
          <p className="text-gray-100">✅ <span className="text-purple-400 font-bold">15,000+</span> 가족이 신뢰</p>
        </div>
      </div>

      {/* Story Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-3">누구를 위한 검사인가요?</h2>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="p-3 bg-gray-800/60 rounded-lg border-l-4 border-pink-500">
            <p className="text-pink-400 font-bold text-base">👶 우리 아이 발달</p>
            <p className="text-gray-300 text-sm">언어·인지·사회성 발달 체크</p>
          </div>
          <div className="p-3 bg-gray-800/60 rounded-lg border-l-4 border-blue-500">
            <p className="text-blue-400 font-bold text-base">👤 성인 심리상태</p>
            <p className="text-gray-300 text-sm">스트레스·우울·불안 관리</p>
          </div>
          <div className="p-3 bg-gray-800/60 rounded-lg border-l-4 border-orange-500">
            <p className="text-orange-400 font-bold text-base">👴 부모님 인지</p>
            <p className="text-gray-300 text-sm">기억력·인지능력 조기 점검</p>
          </div>
        </div>
      </div>

      {/* Offer Section - 단계별 제안 */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white mb-3">💎 단계별 솔루션</h3>
        
        {/* STEP 1: 무료 체험 */}
        <div className="p-4 bg-gray-800/80 rounded-lg border border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full font-bold">STEP 1</span>
            <span className="text-white font-bold text-base">무료 체험</span>
          </div>
          <div className="space-y-2">
            <Button 
              size="sm"
              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
              onClick={() => navigate('/ai-counselor')}
            >
              🤖 AI 상담사 (무료)
            </Button>
            <Button 
              size="sm"
              variant="outline"
              className="w-full border-green-500 text-green-400 hover:bg-green-900/30 text-sm font-medium bg-transparent"
              onClick={() => navigate('/assessment')}
            >
              ⚡ 3분 심리검사 (2토큰)
            </Button>
          </div>
        </div>

        {/* STEP 2: 정밀 분석 */}
        <div className="p-4 bg-gray-800/80 rounded-lg border border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full font-bold">STEP 2</span>
            <span className="text-white font-bold text-base">정밀 분석</span>
          </div>
          <div className="space-y-2">
            <Button 
              size="sm"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
              onClick={() => navigate('/observation')}
            >
              📝 관찰일지 (3토큰)
            </Button>
            <Button 
              size="sm"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium"
              onClick={() => navigate('/premium-assessment')}
            >
              👑 프리미엄 검사 (8토큰)
            </Button>
          </div>
        </div>

        {/* STEP 3: 전문가 상담 */}
        <div className="p-4 bg-gray-800/80 rounded-lg border border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-orange-500 text-white text-sm px-3 py-1 rounded-full font-bold">STEP 3</span>
            <span className="text-white font-bold text-base">전문가 케어</span>
          </div>
          <div className="space-y-2">
            <Button 
              size="sm"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium"
              onClick={() => navigate('/expert-hiring')}
            >
              👨‍⚕️ 20분 상담 (150토큰)
            </Button>
            <Button 
              size="sm"
              className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
              onClick={scrollToComprehensiveReport}
            >
              📊 박사급 리포트 (200토큰)
            </Button>
          </div>
        </div>
      </div>

      {/* Special Promotion */}
      <div className="mt-6">
        <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-none text-white">
          <CardContent className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-yellow-300" />
              </div>
            </div>
            <h3 className="font-bold mb-1 text-lg">무료 체험 이벤트</h3>
            <p className="text-sm text-purple-100 mb-3 font-medium">
              회원가입시 10토큰 지급되고
              <br />매일 로그인시 2토큰씩 추가지급됩니다. 궁금증을 해결하세요
            </p>
            <Button 
              size="sm"
              className="w-full bg-white text-purple-600 hover:bg-purple-50"
              onClick={() => navigate('/ai-counselor')}
            >
              무료체험하기
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom CTA */}
      <div className="mt-6 pt-4 border-t border-gray-600 pb-4">
        <Button 
          className="w-full btn-brand mb-2 text-base font-semibold"
          onClick={() => navigate('/token-subscription')}
        >
          <Zap className="w-4 h-4 mr-2" />
          토큰 충전
        </Button>
        <p className="text-sm text-gray-300 text-center font-medium">
          토큰팩 또는 무제한 플랜으로 업그레이드하세요
        </p>
      </div>
    </div>
  );
};

export default ProductSidebar;