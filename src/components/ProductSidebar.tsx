import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Crown, FileText, Clock, Brain, Users, MessageCircle, Star, Zap, Gift } from 'lucide-react';

const ProductSidebar = () => {
  const navigate = useNavigate();

  const products = [
    {
      icon: <Clock className="w-5 h-5" />,
      title: "3분 심리검사",
      tokenCost: "1토큰",
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
      tokenCost: "5토큰",
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
      icon: <MessageCircle className="w-5 h-5" />,
      title: "30분 상담 (카카오)",
      tokenCost: "30토큰",
      badge: "PRO전문가상담",
      badgeType: "recommended",
      description: "카카오톡 채팅 전문가 상담",
      route: "/experts"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "AIH박사급리포팅",
      tokenCost: "50토큰",
      badge: "프리미엄",
      badgeType: "premium",
      description: "15페이지이상의 맞춤 리포팅(PDF제공)",
      route: "/experts"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "가족케어 패키지",
      tokenCost: "20토큰",
      badge: "확장",
      badgeType: "package",
      description: "가족 전체 심리관리",
      route: "/family"
    }
  ];

  const handleProductClick = (route: string) => {
    navigate(route);
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
    <div className="w-72 bg-gradient-to-b from-slate-800 to-slate-900 text-white h-[calc(100vh-4rem)] p-4 overflow-y-auto flex flex-col border-r border-slate-600">{/* 네비게이션 높이만큼 조정 */}
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-brand-gradient mb-2">AIHPRO</h2>
        <p className="text-sm text-slate-300">심리상담 전문 플랫폼</p>
        <button 
          onClick={() => navigate('/quick-needs')}
          className="mt-3 w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
        >
          🎯 맞춤 테스트 찾기
        </button>
      </div>

      {/* Products */}
      <div className="space-y-3">
        {products.map((product, index) => (
          <Card 
            key={index}
            className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 transition-all duration-200 cursor-pointer hover-glow"
            onClick={() => handleProductClick(product.route)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="text-primary">
                    {product.icon}
                  </div>
                  <span className="text-sm font-medium text-white">
                    {product.title}
                  </span>
                </div>
                <Badge 
                  className={`text-xs px-2 py-1 ${getBadgeVariant(product.badgeType)}`}
                >
                  {product.badge}
                </Badge>
              </div>
              <p className="text-xs text-slate-300 mb-2">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-blue-400">
                  {product.tokenCost}
                </span>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-xs px-3 py-1 h-7 bg-transparent border-slate-500 text-slate-200 hover:bg-slate-600"
                >
                  자세히보기
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
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
            <h3 className="font-bold mb-1">무료 상담 이벤트</h3>
            <p className="text-xs text-purple-100 mb-3">
              첫 상담 무료 체험하고
              <br />심리 건강 체크해보세요
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
      <div className="mt-6 pt-4 border-t border-slate-600 pb-4">
        <Button 
          className="w-full btn-brand mb-2"
          onClick={() => navigate('/token-subscription')}
        >
          <Gift className="w-4 h-4 mr-2" />
          구독 관리
        </Button>
        <p className="text-xs text-slate-400 text-center">
          토큰팩 또는 무제한 플랜으로 업그레이드하세요
        </p>
      </div>
    </div>
  );
};

export default ProductSidebar;