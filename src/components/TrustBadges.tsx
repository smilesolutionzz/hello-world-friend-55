import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, Shield, Users, Award, TrendingUp, Heart } from 'lucide-react';

const TrustBadges = () => {
  const badges = [
    {
      icon: Award,
      text: "AI 심리분석 플랫폼 1위",
      color: "bg-gradient-to-r from-purple-500 to-blue-500 text-white",
      shadow: "shadow-purple-200"
    },
    {
      icon: Shield,
      text: "전문가 인증 AI 분석",
      color: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
      shadow: "shadow-green-200"
    },
    {
      icon: Star,
      text: "사용자 만족도 95%",
      color: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white",
      shadow: "shadow-yellow-200"
    },
    {
      icon: Users,
      text: "누적 상담 10만건+",
      color: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
      shadow: "shadow-blue-200"
    },
    {
      icon: TrendingUp,
      text: "정확도 98% AI 분석",
      color: "bg-gradient-to-r from-indigo-500 to-purple-500 text-white",
      shadow: "shadow-indigo-200"
    },
    {
      icon: Heart,
      text: "가족 건강 케어 전문",
      color: "bg-gradient-to-r from-pink-500 to-rose-500 text-white",
      shadow: "shadow-pink-200"
    }
  ];

  return (
    <div className="py-8 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">믿을 수 있는 AI 심리분석 플랫폼</h3>
          <p className="text-gray-600">전문성과 신뢰성을 인정받은 플랫폼입니다</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 max-w-7xl mx-auto">
          {badges.map((badge, index) => (
            <div 
              key={index}
              className={`${badge.color} ${badge.shadow} rounded-2xl p-4 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
            >
              <div className="flex flex-col items-center space-y-2">
                <badge.icon className="w-8 h-8" />
                <span className="text-sm font-semibold leading-tight">{badge.text}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* 추가 신뢰 지표 */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>실시간 AI 분석 서비스</span>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>24/7 언제든지 이용 가능</span>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span>개인정보 완벽 보호</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustBadges;