import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Minus, TrendingUp, Calendar, Award } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface TestComparisonProps {
  recentTests: any[];
  observations: any[];
}

export function TestComparison({ recentTests, observations }: TestComparisonProps) {
  const [test1, setTest1] = useState<string>('');
  const [test2, setTest2] = useState<string>('');
  const [comparisonData, setComparisonData] = useState<any>(null);

  // 모든 검사를 하나의 배열로 합치기
  const allTests = [
    ...recentTests.map(test => ({
      id: test.id,
      name: test.test_types.name,
      date: test.completed_at,
      score: test.scores?.total_score || 0,
      scores: test.scores,
      type: 'test'
    })),
    ...observations.map(obs => ({
      id: obs.id,
      name: '바로 검사',
      date: obs.created_at,
      score: obs.score_overall || 0,
      scores: obs.categoryScores || {},
      type: 'observation'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  useEffect(() => {
    if (test1 && test2) {
      compareTests();
    }
  }, [test1, test2]);

  const compareTests = () => {
    let testA = allTests.find(t => t.id === test1);
    let testB = allTests.find(t => t.id === test2);

    if (!testA || !testB) return;

    // 날짜 기준으로 정렬 (이전 검사가 더 과거여야 함)
    const dateA = new Date(testA.date).getTime();
    const dateB = new Date(testB.date).getTime();
    
    if (dateA > dateB) {
      // 날짜 순서가 잘못된 경우 swap
      [testA, testB] = [testB, testA];
    }

    // 점수 차이 계산
    const scoreDiff = testB.score - testA.score;
    const scoreChange = testA.score > 0 ? ((scoreDiff / testA.score) * 100) : 0;

    // 카테고리별 비교 (있는 경우)
    const categories = new Set([
      ...Object.keys(testA.scores || {}),
      ...Object.keys(testB.scores || {})
    ]);

    const categoryComparison = Array.from(categories)
      .filter(cat => cat !== 'total_score')
      .map(category => ({
        category: category,
        before: testA.scores[category] || 0,
        after: testB.scores[category] || 0,
        change: (testB.scores[category] || 0) - (testA.scores[category] || 0)
      }));

    // 레이더 차트용 데이터
    const radarData = categoryComparison.map(item => ({
      category: item.category,
      이전: item.before,
      이후: item.after
    }));

    setComparisonData({
      testA,
      testB,
      scoreDiff,
      scoreChange,
      categoryComparison,
      radarData
    });
  };

  const getChangeIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="w-4 h-4 text-green-400" />;
    if (value < 0) return <ArrowDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-green-400 bg-green-500/10 border-green-500/30';
    if (value < 0) return 'text-red-400 bg-red-500/10 border-red-500/30';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl border border-purple-500/20 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          검사 결과 비교
        </CardTitle>
        <CardDescription className="text-purple-300/70">
          두 검사 결과를 비교하여 변화를 확인하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 검사 선택 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-300">이전 검사</label>
            <Select value={test1} onValueChange={setTest1}>
              <SelectTrigger className="bg-slate-800/50 border-purple-500/30 text-white">
                <SelectValue placeholder="검사를 선택하세요" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-purple-500/30">
                {allTests.map((test) => (
                  <SelectItem key={test.id} value={test.id} className="text-white">
                    {test.name} ({format(new Date(test.date), 'yyyy-MM-dd', { locale: ko })})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-300">이후 검사</label>
            <Select value={test2} onValueChange={setTest2}>
              <SelectTrigger className="bg-slate-800/50 border-purple-500/30 text-white">
                <SelectValue placeholder="검사를 선택하세요" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-purple-500/30">
                {allTests.map((test) => (
                  <SelectItem key={test.id} value={test.id} className="text-white">
                    {test.name} ({format(new Date(test.date), 'yyyy-MM-dd', { locale: ko })})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 비교 결과 */}
        {comparisonData ? (
          <div className="space-y-6 animate-fade-in">
            {/* 전체 점수 비교 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-900/40 to-blue-950/40 backdrop-blur-xl border border-blue-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-blue-300/80">이전 검사</span>
                    <Calendar className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">
                    {comparisonData.testA.name}
                  </p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    {comparisonData.testA.score.toFixed(1)}점
                  </p>
                  <p className="text-xs text-blue-300/70 mt-1">
                    {format(new Date(comparisonData.testA.date), 'yyyy년 MM월 dd일', { locale: ko })}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/40 to-purple-950/40 backdrop-blur-xl border border-purple-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-purple-300/80">변화량</span>
                    {getChangeIcon(comparisonData.scoreDiff)}
                  </div>
                  <p className={`text-2xl font-bold ${comparisonData.scoreDiff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {comparisonData.scoreDiff > 0 ? '+' : ''}{comparisonData.scoreDiff.toFixed(1)}
                  </p>
                  <p className={`text-xs mt-1 ${comparisonData.scoreChange >= 0 ? 'text-green-300/70' : 'text-red-300/70'}`}>
                    {comparisonData.scoreChange > 0 ? '+' : ''}{comparisonData.scoreChange.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-900/40 to-emerald-950/40 backdrop-blur-xl border border-emerald-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-emerald-300/80">이후 검사</span>
                    <Award className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">
                    {comparisonData.testB.name}
                  </p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                    {comparisonData.testB.score.toFixed(1)}점
                  </p>
                  <p className="text-xs text-emerald-300/70 mt-1">
                    {format(new Date(comparisonData.testB.date), 'yyyy년 MM월 dd일', { locale: ko })}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 카테고리별 비교 */}
            {comparisonData.categoryComparison.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  카테고리별 변화
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {comparisonData.categoryComparison.map((item: any, index: number) => (
                    <div 
                      key={index}
                      className="p-4 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-purple-500/20 rounded-lg hover:border-purple-400/40 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{item.category}</span>
                        <Badge className={getChangeColor(item.change)}>
                          {getChangeIcon(item.change)}
                          {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-blue-300">{item.before.toFixed(1)}</span>
                        <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${item.change >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.abs(item.change / item.before) * 100}%` }}
                          />
                        </div>
                        <span className={item.change >= 0 ? 'text-green-300' : 'text-red-300'}>
                          {item.after.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 레이더 차트 */}
                {comparisonData.radarData.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-4">
                      시각적 비교
                    </h3>
                    <div className="bg-slate-800/40 rounded-lg p-4">
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={comparisonData.radarData}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis 
                            dataKey="category" 
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                          />
                          <PolarRadiusAxis 
                            angle={90} 
                            domain={[0, 100]}
                            tick={{ fill: '#94a3b8' }}
                          />
                          <Radar 
                            name="이전" 
                            dataKey="이전" 
                            stroke="#3b82f6" 
                            fill="#3b82f6" 
                            fillOpacity={0.3}
                          />
                          <Radar 
                            name="이후" 
                            dataKey="이후" 
                            stroke="#10b981" 
                            fill="#10b981" 
                            fillOpacity={0.3}
                          />
                          <Legend 
                            wrapperStyle={{ color: '#fff' }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 종합 분석 */}
            <div className="p-4 bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-lg">
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                종합 분석
              </h3>
              <p className="text-sm text-purple-200/80">
                {comparisonData.scoreDiff >= 0 ? (
                  <>
                    전반적으로 <span className="font-semibold text-green-400">{Math.abs(comparisonData.scoreChange).toFixed(1)}%</span> 개선되었습니다. 
                    {comparisonData.categoryComparison.filter((c: any) => c.change > 0).length > 0 && (
                      <> 특히 {comparisonData.categoryComparison.filter((c: any) => c.change > 0).map((c: any) => c.category).join(', ')} 영역에서 향상이 두드러집니다.</>
                    )}
                  </>
                ) : (
                  <>
                    전반적으로 <span className="font-semibold text-red-400">{Math.abs(comparisonData.scoreChange).toFixed(1)}%</span> 감소했습니다. 
                    {comparisonData.categoryComparison.filter((c: any) => c.change < 0).length > 0 && (
                      <> {comparisonData.categoryComparison.filter((c: any) => c.change < 0).map((c: any) => c.category).join(', ')} 영역에 더 많은 관심이 필요합니다.</>
                    )}
                  </>
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-purple-500/30" />
            <p className="text-sm text-purple-400/60 mb-2">
              비교할 두 개의 검사를 선택하세요
            </p>
            <p className="text-xs text-purple-300/50">
              검사 결과를 비교하여 개선 사항을 확인할 수 있습니다
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
