import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import WeeklyMissions from "@/components/WeeklyMissions"; // 비활성화됨
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Heart,
  Brain,
  Users,
  Sparkles,
  Clover
} from "lucide-react";

interface WeeklyInsightsProps {
  totalActivities: number;
  averageScore: number;
  trendDirection: 'up' | 'down' | 'stable';
  weeklyGoal?: number;
}

export function WeeklyInsights({ 
  totalActivities, 
  averageScore, 
  trendDirection,
  weeklyGoal = 5 
}: WeeklyInsightsProps) {
  const progress = Math.min((totalActivities / weeklyGoal) * 100, 100);

  // 가족을 위한 이번 주 행운의 숫자 생성 (주간 기준으로 고정)
  const generateLuckyNumbers = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // 이번 주 시작일로 설정
    
    // 주간 시드를 기반으로 고정된 숫자 생성
    const weekSeed = Math.floor(weekStart.getTime() / (7 * 24 * 60 * 60 * 1000));
    const numbers = [];
    
    for (let i = 0; i < 6; i++) {
      // 각 숫자마다 다른 시드 사용하여 1-45 범위의 숫자 생성
      const seed = (weekSeed + i * 7) % 1000;
      const number = (seed % 45) + 1;
      
      // 중복 방지
      if (!numbers.includes(number)) {
        numbers.push(number);
      } else {
        // 중복시 다른 숫자로 대체
        const alternativeNumber = ((seed + 13) % 45) + 1;
        numbers.push(alternativeNumber);
      }
    }
    
    return numbers.sort((a, b) => a - b);
  };

  const luckyNumbers = generateLuckyNumbers();

  const getTrendColor = () => {
    switch (trendDirection) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <BarChart3 className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">이번 주 인사이트</h3>
      </div>

      <div className="space-y-4">
        {/* 모바일에서 카드 형태로 예쁘게 배치 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 주간 목표 진행률 */}
          <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold">주간 목표</span>
              </div>
              <Badge variant={progress >= 100 ? 'default' : 'secondary'} className="shadow-sm">
                {totalActivities}/{weeklyGoal}
              </Badge>
            </div>
            <div className="w-full bg-white/60 rounded-full h-3 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-primary to-primary-glow h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              {progress >= 100 ? "목표 달성! 🎉" : `목표까지 ${Math.max(0, weeklyGoal - totalActivities)}개 남음`}
            </p>
          </div>

          {/* 평균 점수 */}
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-semibold">평균 점수</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl text-green-700">{averageScore}</span>
                {getTrendIcon()}
              </div>
            </div>
            <p className="text-xs text-green-600 font-medium">
              {averageScore >= 80 ? "매우 좋음" : averageScore >= 60 ? "양호함" : "개선 필요"}
            </p>
          </div>
        </div>

        {/* AI 추천사항 */}
        <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-900">AI 맞춤 조언</h4>
              <p className="text-xs text-blue-600">개인화된 웰빙 가이드</p>
            </div>
          </div>
          <p className="text-sm text-blue-800 leading-relaxed font-medium">
            {progress < 50 
              ? "💪 꾸준한 관리가 건강한 마음의 시작입니다. 오늘 하나씩 시작해보세요!"
              : progress >= 100 
              ? "🌟 놀라운 성과예요! 이런 꾸준함이 가족의 행복을 만들어갑니다."
              : "👏 정말 잘하고 계세요! 조금만 더 하면 목표 달성이에요."
            }
          </p>
        </div>

        {/* 가족을 위한 행운의 숫자 */}
        <div className="p-4 bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 rounded-xl border border-yellow-200/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center">
              <Clover className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-yellow-900">이번 주 행운의 숫자</h4>
              <p className="text-xs text-yellow-600">가족 모두를 위한 특별한 숫자</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-3">
            {luckyNumbers.map((number, index) => (
              <div 
                key={index} 
                className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform"
              >
                <span className="text-white font-bold text-sm">{number}</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-center gap-1 text-xs text-yellow-700">
            <Sparkles className="w-3 h-3" />
            <span className="font-medium">행운이 가득한 한 주 되세요!</span>
            <Sparkles className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* 주간 미션 섹션 임시 비활성화 - 구현 완료 후 활성화 예정
      <div className="mt-6">
        <WeeklyMissions />
      </div>
      */}
    </Card>
  );
}