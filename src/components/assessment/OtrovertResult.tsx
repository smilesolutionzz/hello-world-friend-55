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

      if (data?.analysis) {
        setAiAnalysis(data.analysis);
      } else {
        // 분석 데이터가 없을 경우 기본 메시지
        setAiAnalysis(getDefaultAnalysis());
      }
      
      if (data?.graphData) {
        setGraphData(data.graphData);
      } else {
        // 그래프 데이터가 없을 경우 기본 데이터
        setGraphData(getDefaultGraphData());
      }

      setIsLoading(false);
    } catch (error) {
      console.error('AI 분석 오류:', error);
      
      // 에러 발생 시 기본 분석 및 그래프 데이터 제공
      setAiAnalysis(getDefaultAnalysis());
      setGraphData(getDefaultGraphData());
      
      toast({
        title: "분석 오류",
        description: "AI 분석 중 오류가 발생했습니다. 기본 분석을 표시합니다. 다시 시도 버튼을 눌러보세요.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  // 기본 분석 텍스트 생성
  const getDefaultAnalysis = () => {
    const score = parseFloat(result.score) || 0;
    if (isNaN(score)) return "점수 분석 중 오류가 발생했습니다.";
    if (score <= 3) {
      return `당신은 외향적 오트로버트입니다. (${score}점)

외향적 오트로버트는 사회적 상황에서 에너지를 얻지만, 때로는 혼자만의 시간도 필요로 합니다. 사람들과 함께 있는 것을 즐기지만, 깊은 대화와 의미 있는 관계를 선호합니다.

**주요 특성:**
• 사교적이면서도 내면의 성찰을 중요시함
• 다양한 활동을 즐기지만 과도한 자극은 피함
• 폭넓은 인맥과 깊은 우정을 동시에 추구

**권장사항:**
• 사회 활동과 휴식의 균형을 유지하세요
• 깊이 있는 대화를 나눌 수 있는 소수의 친구를 소중히 하세요
• 필요할 때는 혼자만의 시간을 가져도 괜찮습니다`;
    } else if (score <= 6) {
      return `당신은 균형잡힌 오트로버트입니다. (${score}점)

균형잡힌 오트로버트는 외향성과 내향성의 중간에 위치하여, 상황에 따라 유연하게 대처할 수 있습니다. 혼자 있을 때도, 함께 있을 때도 편안함을 느낍니다.

**주요 특성:**
• 상황에 따라 사교적이거나 조용할 수 있음
• 다양한 환경에 잘 적응함
• 균형잡힌 에너지 관리 능력

**권장사항:**
• 자신의 컨디션을 잘 관찰하고 필요에 따라 조절하세요
• 다양한 유형의 사람들과 교류하며 폭넓은 경험을 쌓으세요
• 때로는 계획적으로, 때로는 즉흥적으로 활동하세요`;
    } else {
      return `당신은 내향적 오트로버트입니다. (${score}점)

내향적 오트로버트는 혼자만의 시간을 통해 에너지를 충전하지만, 의미 있는 사회적 관계도 소중히 여깁니다. 깊이 있는 사고와 내면의 세계를 중시합니다.

**주요 특성:**
• 조용하고 사색적인 환경을 선호
• 소수의 깊은 관계를 중시
• 혼자만의 시간을 통해 재충전
• 신중하고 깊이 있는 사고

**권장사항:**
• 충분한 휴식과 혼자만의 시간을 확보하세요
• 소수의 친한 친구들과 깊이 있는 대화를 나누세요
• 자신의 내향성을 받아들이고 존중하세요
• 필요한 경우에만 사회 활동에 참여하세요`;
    }
  };

  // 기본 그래프 데이터 생성
  const getDefaultGraphData = () => {
    const score = parseFloat(result.score) || 0;
    if (isNaN(score)) return { extroversion: 50, introversion: 50, socialEnergy: 50, aloneTime: 50, groupPreference: 50, communication: 50, thinkingStyle: 50 };
    const introversionScore = (score / 9) * 100;
    const extroversionScore = 100 - introversionScore;

    return {
      extroversion: extroversionScore,
      introversion: introversionScore,
      socialEnergy: extroversionScore * 0.9,
      aloneTime: introversionScore * 0.9,
      groupPreference: extroversionScore * 0.85,
      communication: 50 + (extroversionScore - 50) * 0.7,
      thinkingStyle: introversionScore * 0.8
    };
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
