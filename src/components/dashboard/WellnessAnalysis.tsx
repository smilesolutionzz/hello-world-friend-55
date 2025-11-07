import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Activity, Brain, Users, TrendingUp, Target } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { format } from 'date-fns';

interface Observation {
  id: string;
  score_overall: number;
  created_at: string;
  age_group: string;
  categoryScores?: { [key: string]: number };
}

interface WellnessAnalysisProps {
  observations: Observation[];
}

const WellnessAnalysis: React.FC<WellnessAnalysisProps> = ({ observations }) => {
  // 전반적 건강 지수
  const healthIndex = useMemo(() => {
    if (observations.length === 0) return 0;
    const recent5 = observations.slice(0, 5);
    const avg = recent5.reduce((sum, obs) => sum + obs.score_overall, 0) / recent5.length;
    return Math.round(avg);
  }, [observations]);

  // 영역별 레이더 차트 데이터
  const radarData = useMemo(() => {
    if (observations.length === 0) return [];
    
    const categoryTotals = new Map<string, { sum: number; count: number }>();
    
    observations.slice(0, 10).forEach(obs => {
      if (obs.categoryScores) {
        Object.entries(obs.categoryScores).forEach(([category, score]) => {
          if (!categoryTotals.has(category)) {
            categoryTotals.set(category, { sum: 0, count: 0 });
          }
          const cat = categoryTotals.get(category)!;
          cat.sum += score;
          cat.count += 1;
        });
      }
    });

    return Array.from(categoryTotals.entries())
      .map(([category, { sum, count }]) => ({
        category,
        score: Math.round(sum / count),
        fullMark: 100
      }));
  }, [observations]);

  // 점수 추세 데이터
  const trendData = useMemo(() => {
    return observations.slice(0, 10).reverse().map((obs, idx) => ({
      name: `${idx + 1}회`,
      score: obs.score_overall,
      date: format(new Date(obs.created_at), 'MM/dd')
    }));
  }, [observations]);

  // 건강 등급
  const getHealthGrade = (score: number) => {
    if (score >= 90) return { grade: 'A', label: '매우 우수', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30' };
    if (score >= 80) return { grade: 'B', label: '우수', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
    if (score >= 70) return { grade: 'C', label: '양호', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    if (score >= 60) return { grade: 'D', label: '보통', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    return { grade: 'F', label: '주의', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' };
  };

  const healthGrade = getHealthGrade(healthIndex);

  // 강점 영역
  const strongAreas = useMemo(() => {
    return radarData
      .filter(d => d.score >= 80)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [radarData]);

  // 개선 필요 영역
  const weakAreas = useMemo(() => {
    return radarData
      .filter(d => d.score < 70)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);
  }, [radarData]);

  return (
    <div className="space-y-6">
      {/* 종합 건강 지수 */}
      <Card className="bg-[#0F1823] border-slate-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            <CardTitle className="text-lg font-medium text-white">종합 건강 지수</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-5xl font-bold text-white mb-2">{healthIndex}</div>
              <Badge variant="outline" className={`${healthGrade.bg} ${healthGrade.color} ${healthGrade.border}`}>
                {healthGrade.grade}등급 - {healthGrade.label}
              </Badge>
            </div>
            <div className="text-right text-sm text-slate-400">
              <p>최근 5회 평균</p>
              <p className="text-xs text-slate-500 mt-1">
                총 {observations.length}회 검사 기반
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 영역별 균형 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#0F1823] border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-medium text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              영역별 균형
            </CardTitle>
          </CardHeader>
          <CardContent>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis 
                    dataKey="category" 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                  />
                  <Radar 
                    name="점수" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                영역별 점수 데이터가 없습니다
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#0F1823] border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-medium text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              점수 추세
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis 
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '6px'
                    }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                추세 데이터가 없습니다
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 강점 & 개선 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#0F1823] border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-medium text-white flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              강점 영역
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strongAreas.length > 0 ? (
              <div className="space-y-3">
                {strongAreas.map((area, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">{area.category}</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                      {area.score}점
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                데이터가 충분하지 않습니다
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#0F1823] border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-medium text-white flex items-center gap-2">
              <Brain className="h-4 w-4 text-orange-500" />
              개선 필요 영역
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weakAreas.length > 0 ? (
              <div className="space-y-3">
                {weakAreas.map((area, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">{area.category}</span>
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                      {area.score}점
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                특별히 개선이 필요한 영역이 없습니다
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 웰니스 팁 */}
      <Card className="bg-[#0F1823] border-slate-800">
        <CardHeader>
          <CardTitle className="text-base font-medium text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-500" />
            웰니스 관리 팁
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-slate-300">
              <div className="mt-1.5 h-1 w-1 rounded-full bg-primary flex-shrink-0" />
              <span>균형 잡힌 발달을 위해 약점 영역에 집중하세요</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-300">
              <div className="mt-1.5 h-1 w-1 rounded-full bg-primary flex-shrink-0" />
              <span>강점 영역은 유지하며 더욱 발전시키세요</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-300">
              <div className="mt-1.5 h-1 w-1 rounded-full bg-primary flex-shrink-0" />
              <span>정기적인 검사로 진행 상황을 추적하세요</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default WellnessAnalysis;
