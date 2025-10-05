import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, RotateCcw, Copy, Loader2, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PersonalizedProductRecommendation } from "@/components/product/PersonalizedProductRecommendation";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface OtrovertResultProps {
  result: any;
  onShare: () => void;
  onRetry: () => void;
  onShareText: () => void;
}

export default function OtrovertResult({ result, onShare, onRetry, onShareText }: OtrovertResultProps) {
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [graphData, setGraphData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    analyzeWithAI();
  }, []);

  const analyzeWithAI = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('otrovert-analyzer', {
        body: {
          answers: result.answers,
          personalityType: result.personalityType,
          score: result.score
        }
      });

      if (error) throw error;

      if (data.analysis) {
        setAiAnalysis(data.analysis);
      }
      
      if (data.graphData) {
        setGraphData(data.graphData);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('AI 분석 오류:', error);
      toast({
        title: "분석 오류",
        description: "AI 분석을 불러오는데 실패했습니다.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const radarChartData = graphData ? [
    { subject: '사회적 에너지', value: graphData.socialEnergy, fullMark: 100 },
    { subject: '혼자 시간', value: graphData.aloneTime, fullMark: 100 },
    { subject: '그룹 선호', value: graphData.groupPreference, fullMark: 100 },
    { subject: '의사소통', value: graphData.communication, fullMark: 100 },
    { subject: '사고 스타일', value: graphData.thinkingStyle, fullMark: 100 }
  ] : [];

  const barChartData = graphData ? [
    { name: '외향성', value: graphData.extroversion },
    { name: '내향성', value: graphData.introversion }
  ] : [];

  return (
    <div className="container mx-auto p-6 max-w-4xl pb-32">
      <Card className="border-2 border-primary/20 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
          <div className="text-center space-y-4">
            <CardTitle className="text-3xl">🎭 오트로버트 성격 분석 결과</CardTitle>
            <div className="flex items-center justify-center gap-4">
              <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                {result.personalityType}
              </Badge>
              <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                점수: {result.score}
              </Badge>
            </div>
          </div>
        </CardHeader>

          <CardContent className="p-8 space-y-8">
            {/* 기본 설명 */}
            <div className="text-center space-y-3">
              <p className="text-lg text-muted-foreground leading-relaxed">
                {result.typeDescription}
              </p>
            </div>

            {/* AI 분석 로딩/결과 */}
            {isLoading ? (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-600" />
                <p className="text-lg font-semibold text-indigo-900">AI가 당신의 성격을 깊이 분석하고 있습니다...</p>
                <p className="text-sm text-indigo-600 mt-2">잠시만 기다려주세요</p>
              </div>
            ) : aiAnalysis && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-900">
                  <TrendingUp className="w-6 h-6" />
                  AI 전문가 분석
                </h3>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                  {aiAnalysis}
                </div>
              </div>
            )}

            {/* 그래프 */}
            {graphData && (
              <div className="space-y-6">
                {/* 외향성 vs 내향성 바 차트 */}
                <div className="bg-white rounded-xl p-6 border-2 border-indigo-100">
                  <h3 className="text-xl font-bold mb-4 text-center text-indigo-900">
                    외향성 vs 내향성 비율
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* 성격 차원 레이더 차트 */}
                <div className="bg-white rounded-xl p-6 border-2 border-indigo-100">
                  <h3 className="text-xl font-bold mb-4 text-center text-indigo-900">
                    성격 차원별 분석
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarChartData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar
                        name="당신의 성격"
                        dataKey="value"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.6}
                      />
                      <Tooltip />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                  <p className="text-sm text-center text-muted-foreground mt-4">
                    * 높을수록 외향적, 낮을수록 내향적 특성을 의미합니다
                  </p>
                </div>
              </div>
            )}

            {/* 특징들 */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-indigo-900">✨ 핵심 특징</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.characteristics?.map((char: string, index: number) => (
                  <div key={index} className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <p className="text-sm">{char}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 강점 */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-xl font-bold mb-4 text-green-800">{result.strengthsTitle}</h3>
              <ul className="space-y-2">
                {result.strengths?.map((strength: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-green-700">
                    <span className="text-green-600">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 주의할 점 */}
            <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
              <h3 className="text-xl font-bold mb-4 text-amber-800">{result.weaknessesTitle}</h3>
              <ul className="space-y-2">
                {result.weaknesses?.map((weakness: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-amber-700">
                    <span className="text-amber-600">⚠</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 추천사항 */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-xl font-bold mb-4 text-blue-800">💡 발전을 위한 제안</h3>
              <ul className="space-y-2">
                {result.recommendations?.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-blue-700">
                    <span className="text-blue-600">→</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 공유 버튼들 */}
            <div className="flex flex-col gap-3 pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={onShare} 
                  size="lg" 
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  친구들에게 공유하기
                </Button>
                <Button onClick={onRetry} variant="outline" size="lg" className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  다시 테스트하기
                </Button>
              </div>
              <Button onClick={onShareText} variant="secondary" size="lg" className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                📋 텍스트로 복사하기
              </Button>
            </div>

            {/* 안내 문구 */}
            <div className="text-center text-sm text-muted-foreground pt-4 border-t">
              <p>
                ※ 이 테스트는 재미와 자기 이해를 위한 것으로, 공식적인 심리 진단이 아닙니다.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 맞춤형 상품 추천 섹션 */}
        <PersonalizedProductRecommendation 
          testType="otrovert"
          testResult={result}
          userProfile={{
            personality: result.personalityType
          }}
        />
      </div>
    );
  }
