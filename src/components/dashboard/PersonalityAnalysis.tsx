import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Loader2, Sparkles, TrendingUp, AlertCircle, CheckCircle2, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';

interface AnalysisResult {
  personalityType: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  categories: {
    정서: number;
    인지: number;
    사회성: number;
    신체: number;
    행동: number;
  };
  summary: string;
}

interface PersonalityAnalysisProps {
  testData: any[];
  observations: any[];
}

export function PersonalityAnalysis({ testData, observations }: PersonalityAnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateAnalysis = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('personality-analysis', {
        body: { 
          testData: testData.slice(0, 5),
          observations: observations.slice(0, 5)
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        toast({
          title: "분석 실패",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setAnalysis(data.analysis);
      toast({
        title: "분석 완료",
        description: "AI 기반 성격 분석이 생성되었습니다.",
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "분석 오류",
        description: error.message || "분석 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl border border-purple-500/20 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
          <Brain className="w-5 h-5 text-purple-400" />
          AI 성격 분석
        </CardTitle>
        <CardDescription className="text-purple-300/70">
          검사 데이터를 기반으로 한 객관적인 성격 분석
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!analysis ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-slate-400 mb-4 text-sm">
              검사 데이터를 분석하여 성격 특성을 파악합니다
            </p>
            <Button 
              onClick={generateAnalysis}
              disabled={loading || (testData.length === 0 && observations.length === 0)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  분석 시작
                </>
              )}
            </Button>
            {testData.length === 0 && observations.length === 0 && (
              <p className="text-xs text-slate-500 mt-2">
                분석할 데이터가 없습니다
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* 성격 유형 */}
            <div className="p-4 bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-lg">
              <h3 className="text-sm font-semibold text-purple-200 mb-2">분석 결과</h3>
              <p className="text-lg font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                {analysis.personalityType}
              </p>
              <p className="text-sm text-purple-200/80 mt-2">
                {analysis.summary}
              </p>
            </div>

            {/* 레이더 차트 */}
            {analysis.categories && (
              <div className="bg-slate-800/40 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-white mb-4">영역별 발달 수준</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={Object.entries(analysis.categories).map(([key, value]) => ({
                    category: key,
                    점수: value
                  }))}>
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
                      name="점수" 
                      dataKey="점수" 
                      stroke="#a855f7" 
                      fill="#a855f7" 
                      fillOpacity={0.5}
                    />
                    <Legend wrapperStyle={{ color: '#fff' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* 강점 */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                주요 강점
              </h3>
              <div className="space-y-2">
                {analysis.strengths.map((strength, index) => (
                  <div 
                    key={index}
                    className="p-3 bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg"
                  >
                    <p className="text-sm text-green-100">{strength}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 개선 영역 */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                개선이 필요한 영역
              </h3>
              <div className="space-y-2">
                {analysis.weaknesses.map((weakness, index) => (
                  <div 
                    key={index}
                    className="p-3 bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-500/30 rounded-lg"
                  >
                    <p className="text-sm text-amber-100">{weakness}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 추천 사항 */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                발전 방향 및 추천
              </h3>
              <div className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <div 
                    key={index}
                    className="p-3 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-500/30 rounded-lg"
                  >
                    <p className="text-sm text-blue-100">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={generateAnalysis}
              disabled={loading}
              variant="outline"
              className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  재분석 중...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  재분석
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
