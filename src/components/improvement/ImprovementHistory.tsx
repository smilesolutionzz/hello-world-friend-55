import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown, Minus, Target, Brain, Sparkles } from "lucide-react";
import { format, differenceInWeeks, startOfYear } from 'date-fns';
import { ko } from 'date-fns/locale';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface Observation {
  id: string;
  created_at: string;
  age_group: string;
  score_overall: number;
  categoryScores?: { [key: string]: number };
}

interface ImprovementHistoryProps {
  observations: Observation[];
}

interface PersonalityTrait {
  title: string;
  description: string;
  score: number;
}

interface PersonalityAnalysis {
  traits: PersonalityTrait[];
  summary: string;
}

const ImprovementHistory: React.FC<ImprovementHistoryProps> = ({ observations }) => {
  const { toast } = useToast();
  const [personalityAnalysis, setPersonalityAnalysis] = useState<PersonalityAnalysis | null>(null);
  const [analyzingPersonality, setAnalyzingPersonality] = useState(false);

  // 시간순 정렬 (오래된 것부터)
  const sortedObservations = useMemo(() => {
    return [...observations]
      .filter(obs => obs.score_overall > 0 || (obs.categoryScores && Object.keys(obs.categoryScores).length > 0))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [observations]);

  // 성격 분석 실행
  const analyzePersonality = async () => {
    if (sortedObservations.length === 0) return;
    
    setAnalyzingPersonality(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-personality', {
        body: { observations: sortedObservations }
      });

      if (error) throw error;

      setPersonalityAnalysis(data);
      toast({
        title: "성격 분석 완료",
        description: "AI가 당신의 성격 특성을 분석했습니다.",
      });
    } catch (error: any) {
      console.error('Personality analysis error:', error);
      toast({
        title: "분석 실패",
        description: error.message || "성격 분석에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setAnalyzingPersonality(false);
    }
  };

  // 자동 분석 (데이터가 2개 이상일 때)
  useEffect(() => {
    if (sortedObservations.length >= 2 && !personalityAnalysis) {
      analyzePersonality();
    }
  }, [sortedObservations.length]);

  // 카테고리별 점수 추이 데이터 생성
  const categoryTrendData = useMemo(() => {
    if (sortedObservations.length === 0) return [];

    // 모든 카테고리 수집
    const allCategories = new Set<string>();
    sortedObservations.forEach(obs => {
      if (obs.categoryScores) {
        Object.keys(obs.categoryScores).forEach(cat => allCategories.add(cat));
      }
    });

    // 각 검사별 데이터 생성 (주차별)
    return sortedObservations.map((obs, index) => {
      const obsDate = new Date(obs.created_at);
      const yearStart = startOfYear(obsDate);
      const weekNumber = differenceInWeeks(obsDate, yearStart) + 1;
      
      const dataPoint: any = {
        name: `${index + 1}차`,
        date: `${weekNumber}주차`,
        fullDate: format(obsDate, 'yyyy년 MM월 dd일', { locale: ko }) + ` (${weekNumber}주차)`,
      };

      if (obs.categoryScores) {
        Object.entries(obs.categoryScores).forEach(([category, score]) => {
          dataPoint[category] = score;
        });
      }

      return dataPoint;
    });
  }, [sortedObservations]);

  // 카테고리별 개선율 계산
  const categoryImprovements = useMemo(() => {
    if (sortedObservations.length < 2) return [];

    const categories = new Set<string>();
    sortedObservations.forEach(obs => {
      if (obs.categoryScores) {
        Object.keys(obs.categoryScores).forEach(cat => categories.add(cat));
      }
    });

    const improvements: Array<{
      category: string;
      firstScore: number;
      lastScore: number;
      improvement: number;
      improvementPercent: number;
      trend: 'up' | 'down' | 'stable';
    }> = [];

    categories.forEach(category => {
      // 해당 카테고리의 첫 번째와 마지막 점수 찾기
      let firstScore = 0;
      let lastScore = 0;

      for (const obs of sortedObservations) {
        if (obs.categoryScores && obs.categoryScores[category]) {
          firstScore = obs.categoryScores[category];
          break;
        }
      }

      for (let i = sortedObservations.length - 1; i >= 0; i--) {
        const obs = sortedObservations[i];
        if (obs.categoryScores && obs.categoryScores[category]) {
          lastScore = obs.categoryScores[category];
          break;
        }
      }

      if (firstScore > 0) {
        const improvement = lastScore - firstScore;
        const improvementPercent = (improvement / firstScore) * 100;
        
        improvements.push({
          category,
          firstScore,
          lastScore,
          improvement,
          improvementPercent,
          trend: improvement > 2 ? 'up' : improvement < -2 ? 'down' : 'stable'
        });
      }
    });

    return improvements.sort((a, b) => b.improvement - a.improvement);
  }, [sortedObservations]);

  // 카테고리 색상 매핑
  const categoryColors: { [key: string]: string } = {
    '정서': '#0ea5e9',
    '행동': '#10b981',
    '인지': '#f59e0b',
    '사회성': '#8b5cf6',
    '신체': '#ef4444',
    '언어': '#06b6d4',
    '감각': '#ec4899',
    '자조': '#84cc16'
  };

  const defaultColors = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

  if (sortedObservations.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="bg-[#0F1823] border-slate-800">
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-400 text-lg mb-2">개선 이력이 없습니다</p>
              <p className="text-slate-500 text-sm">검사를 완료하면 카테고리별 점수 개선 추이를 확인할 수 있습니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sortedObservations.length === 1) {
    return (
      <div className="space-y-6">
        <Card className="bg-[#0F1823] border-slate-800">
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-400 text-lg mb-2">검사 기록이 1개만 있습니다</p>
              <p className="text-slate-500 text-sm">최소 2개 이상의 검사 기록이 있어야 개선 추이를 확인할 수 있습니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 카테고리별 점수 추이 차트 */}
      <Card className="bg-[#0F1823] border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white">카테고리별 점수 추이</CardTitle>
          <p className="text-sm text-slate-400 mt-1">
            시간에 따른 각 영역의 점수 변화를 확인하세요
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={categoryTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8"
                tick={{ fill: '#e2e8f0' }}
              />
              <YAxis 
                stroke="#94a3b8"
                tick={{ fill: '#e2e8f0' }}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0F1419', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                labelStyle={{ color: '#fff', marginBottom: '8px' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: any, name: string) => [`${value}점`, name]}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return payload[0].payload.fullDate;
                  }
                  return label;
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px', color: '#fff' }}
                iconType="line"
              />
              {categoryImprovements.map((cat, index) => (
                <Line
                  key={cat.category}
                  type="monotone"
                  dataKey={cat.category}
                  stroke={categoryColors[cat.category] || defaultColors[index % defaultColors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name={cat.category}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI 성격 분석 카드 */}
      <Card className="bg-[#0F1823] border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                AI 성격 분석
              </CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                검사 데이터로 분석한 당신의 성격 특성
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={analyzePersonality}
              disabled={analyzingPersonality || sortedObservations.length < 2}
              className="border-slate-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {analyzingPersonality ? "분석 중..." : "재분석"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {analyzingPersonality ? (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-pulse" />
              <p className="text-slate-300 mb-2">AI가 성격을 분석하는 중...</p>
              <p className="text-sm text-slate-500">잠시만 기다려주세요</p>
            </div>
          ) : personalityAnalysis ? (
            <div className="space-y-6">
              {/* 요약 */}
              <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-800/30 rounded-lg p-4">
                <p className="text-slate-200 leading-relaxed">{personalityAnalysis.summary}</p>
              </div>

              {/* 특성 카드들 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personalityAnalysis.traits.map((trait, index) => (
                  <div key={index} className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-white font-semibold">{trait.title}</h4>
                      <span className="text-sm text-purple-400 font-medium">{trait.score}%</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{trait.description}</p>
                    <Progress value={trait.score} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-2">검사 데이터가 부족합니다</p>
              <p className="text-sm text-slate-500">2개 이상의 검사를 완료하면 성격 분석이 가능합니다</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 카테고리별 비교 바 차트 */}
      <Card className="bg-[#0F1823] border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white">처음 vs 현재 점수 비교</CardTitle>
          <p className="text-sm text-slate-400 mt-1">
            각 영역의 처음 점수와 현재 점수를 비교합니다
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryImprovements.map(cat => ({
              category: cat.category,
              처음: cat.firstScore,
              현재: cat.lastScore
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                dataKey="category" 
                stroke="#94a3b8"
                tick={{ fill: '#e2e8f0' }}
              />
              <YAxis 
                stroke="#94a3b8"
                tick={{ fill: '#e2e8f0' }}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0F1419', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ color: '#fff' }} />
              <Bar dataKey="처음" fill="#64748b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="현재" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImprovementHistory;
