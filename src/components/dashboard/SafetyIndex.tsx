import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingUp, Info } from "lucide-react";

interface SafetyIndexProps {
  observations: Array<{
    score_overall: number;
    categoryScores?: Record<string, number>;
    created_at: string;
  }>;
}

const SafetyIndex: React.FC<SafetyIndexProps> = ({ observations }) => {
  // 안전 지수 계산
  const calculateSafetyIndex = () => {
    if (observations.length === 0) return { score: 75, level: 'good' };
    
    // 최근 데이터들의 평균 점수 계산
    const recentScores = observations.slice(0, 5);
    const avgScore = recentScores.reduce((sum, obs) => sum + (obs.score_overall || 75), 0) / recentScores.length;
    
    // 점수 변화 추이 고려
    const trend = observations.length >= 2 ? 
      observations[0].score_overall - observations[1].score_overall : 0;
    
    // 안전 지수 = 평균 점수 + 추세 보정
    const safetyScore = Math.max(0, Math.min(100, avgScore + (trend * 0.3)));
    
    let level = 'excellent';
    if (safetyScore < 50) level = 'caution';
    else if (safetyScore < 70) level = 'attention';
    else if (safetyScore < 85) level = 'good';
    
    return { score: Math.round(safetyScore), level, trend };
  };

  const safety = calculateSafetyIndex();
  
  const getLevelConfig = (level: string) => {
    switch (level) {
      case 'excellent':
        return { 
          label: '우수', 
          color: 'bg-green-500', 
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          description: '안정적인 상태입니다'
        };
      case 'good':
        return { 
          label: '양호', 
          color: 'bg-blue-500', 
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          description: '전반적으로 좋은 상태입니다'
        };
      case 'attention':
        return { 
          label: '주의', 
          color: 'bg-yellow-500', 
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          description: '관심이 필요한 영역이 있습니다'
        };
      case 'caution':
        return { 
          label: '경고', 
          color: 'bg-red-500', 
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          description: '적극적인 관리가 필요합니다'
        };
      default:
        return { 
          label: '보통', 
          color: 'bg-gray-500', 
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          description: '평균적인 상태입니다'
        };
    }
  };

  const levelConfig = getLevelConfig(safety.level);

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            생활 안전 지수
          </div>
          <Badge variant="outline" className={levelConfig.textColor}>
            {levelConfig.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 안전 점수 시각화 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              {safety.score}점
            </span>
            {safety.trend && (
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp 
                  className={`w-3 h-3 ${safety.trend > 0 ? 'text-green-600 rotate-0' : 'text-red-600 rotate-180'}`} 
                />
                <span className={safety.trend > 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(safety.trend).toFixed(1)}
                </span>
              </div>
            )}
          </div>
          <Progress 
            value={safety.score} 
            className="h-2" 
          />
        </div>

        {/* 상태 설명 */}
        <div className={`p-3 rounded-lg ${levelConfig.bgColor}`}>
          <p className={`text-sm ${levelConfig.textColor}`}>
            {levelConfig.description}
          </p>
        </div>

        {/* 보험 관련 힌트 (자연스럽게) */}
        {safety.score < 70 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">생활 안전 팁</p>
                <p>스트레스 관리와 함께 예상치 못한 상황에 대한 대비책도 고려해보세요.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SafetyIndex;