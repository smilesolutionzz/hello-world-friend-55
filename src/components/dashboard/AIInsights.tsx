import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertCircle, Sparkles, Target, Calendar } from "lucide-react";
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Observation {
  id: string;
  score_overall: number;
  created_at: string;
  age_group: string;
  categoryScores?: { [key: string]: number };
}

interface AIInsightsProps {
  observations: Observation[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ observations }) => {
  const insights = useMemo(() => {
    if (observations.length === 0) {
      return {
        trend: 'stable',
        trendText: '데이터 없음',
        improvements: [],
        concerns: [],
        recommendations: [],
        nextCheckDate: null
      };
    }

    const recent5 = observations.slice(0, 5);
    const scores = recent5.map(o => o.score_overall);
    
    // 추세 분석
    let trend = 'stable';
    let trendText = '안정적';
    if (scores.length >= 2) {
      const avgRecent = scores.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
      const avgOlder = scores.slice(2).reduce((a, b) => a + b, 0) / (scores.length - 2);
      const diff = avgRecent - avgOlder;
      
      if (diff > 5) {
        trend = 'improving';
        trendText = '개선 중';
      } else if (diff < -5) {
        trend = 'declining';
        trendText = '주의 필요';
      }
    }

    // 개선 영역
    const improvements: string[] = [];
    const concerns: string[] = [];
    
    if (recent5.length >= 2) {
      const latest = recent5[0];
      const previous = recent5[1];
      
      if (latest.categoryScores && previous.categoryScores) {
        Object.keys(latest.categoryScores).forEach(category => {
          const latestScore = latest.categoryScores![category];
          const prevScore = previous.categoryScores![category];
          
          if (latestScore > prevScore + 3) {
            improvements.push(category);
          } else if (latestScore < prevScore - 3) {
            concerns.push(category);
          }
        });
      }
    }

    // 추천 사항
    const recommendations: string[] = [];
    
    if (trend === 'improving') {
      recommendations.push('현재의 긍정적인 추세를 유지하세요');
      recommendations.push('정기적인 검사로 진행상황을 모니터링하세요');
    } else if (trend === 'declining') {
      recommendations.push('전문가 상담을 고려해보세요');
      recommendations.push('생활 패턴 변화를 점검해보세요');
    } else {
      recommendations.push('꾸준한 관리가 중요합니다');
    }
    
    if (concerns.length > 0) {
      recommendations.push(`${concerns[0]} 영역에 특별한 관심이 필요합니다`);
    }
    
    if (improvements.length > 0) {
      recommendations.push(`${improvements[0]} 영역의 개선이 두드러집니다`);
    }

    // 다음 검사 제안일
    const lastCheckDate = new Date(observations[0].created_at);
    const nextCheckDate = new Date(lastCheckDate);
    nextCheckDate.setDate(nextCheckDate.getDate() + 30);

    return {
      trend,
      trendText,
      improvements,
      concerns,
      recommendations,
      nextCheckDate
    };
  }, [observations]);

  const getTrendColor = () => {
    switch (insights.trend) {
      case 'improving': return 'text-green-500';
      case 'declining': return 'text-orange-500';
      default: return 'text-blue-500';
    }
  };

  const getTrendIcon = () => {
    switch (insights.trend) {
      case 'improving': return <TrendingUp className="h-5 w-5" />;
      case 'declining': return <AlertCircle className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* AI 분석 요약 */}
      <Card className="bg-[#0F1823] border-slate-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-medium text-white">AI 분석 요약</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={getTrendColor()}>
              {getTrendIcon()}
            </div>
            <div>
              <p className="text-sm text-slate-400">현재 추세</p>
              <p className={`text-lg font-semibold ${getTrendColor()}`}>
                {insights.trendText}
              </p>
            </div>
          </div>
          
          {observations.length > 0 && (
            <div className="text-sm text-slate-300">
              최근 {Math.min(observations.length, 5)}회의 검사를 분석한 결과입니다.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 개선 영역 & 주의 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#0F1823] border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-medium text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              개선 영역
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.improvements.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {insights.improvements.map((area, idx) => (
                  <Badge key={idx} variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                    {area}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                최근 두드러진 개선 영역이 없습니다
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#0F1823] border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-medium text-white flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              주의 영역
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.concerns.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {insights.concerns.map((area, idx) => (
                  <Badge key={idx} variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                    {area}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                특별히 주의가 필요한 영역이 없습니다
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI 추천 사항 */}
      <Card className="bg-[#0F1823] border-slate-800">
        <CardHeader>
          <CardTitle className="text-base font-medium text-white flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            맞춤 추천 사항
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {insights.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <p className="text-sm text-slate-300">{rec}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 다음 검사 제안 */}
      {insights.nextCheckDate && (
        <Card className="bg-[#0F1823] border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-medium text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              다음 검사 제안
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300">
              권장 검사일: <span className="text-white font-medium">
                {format(insights.nextCheckDate, 'yyyy년 M월 d일 (E)', { locale: ko })}
              </span>
            </p>
            <p className="text-xs text-slate-500 mt-2">
              정기적인 검사로 발달 과정을 체계적으로 관리하세요
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIInsights;
