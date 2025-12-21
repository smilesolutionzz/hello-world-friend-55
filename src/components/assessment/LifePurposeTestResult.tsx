import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Compass, Star, Target, Sparkles, Mountain, Heart, Lightbulb, Download, Share2, TrendingUp } from "lucide-react";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";

interface LifePurposeTestResultProps {
  results: {
    answers: Record<string, string>;
    categoryScores: Record<string, number>;
    totalScore: number;
    purposeType: string;
    clarityLevel: string;
    recommendations: string[];
  };
  onBack: () => void;
}

export default function LifePurposeTestResult({ results, onBack }: LifePurposeTestResultProps) {
  const { categoryScores, totalScore, purposeType, clarityLevel, recommendations } = results;

  const getTypeInfo = () => {
    switch (purposeType) {
      case "명확한 방향 탐색자":
        return {
          color: "from-emerald-500 to-teal-500",
          bgColor: "bg-emerald-50",
          emoji: "🌟",
          description: "삶의 방향이 명확하고, 가치관과 목표가 잘 정렬되어 있어요. 의미 있는 삶을 살고 있습니다.",
          quote: "\"목적이 있는 삶은 어떤 폭풍에도 흔들리지 않는다.\""
        };
      case "성장하는 탐험가":
        return {
          color: "from-blue-500 to-indigo-500",
          bgColor: "bg-blue-50",
          emoji: "🚀",
          description: "삶의 의미를 능동적으로 찾아가고 있어요. 대부분의 영역에서 방향성이 있으며, 성장 중입니다.",
          quote: "\"여정 자체가 목적지다. 계속 나아가라.\""
        };
      case "방향 모색 중인 여행자":
        return {
          color: "from-amber-500 to-orange-500",
          bgColor: "bg-amber-50",
          emoji: "🧭",
          description: "삶의 방향을 탐색하는 과정에 있어요. 이 시기는 자기발견을 위한 중요한 시간입니다.",
          quote: "\"길을 잃어봐야 새로운 길을 발견할 수 있다.\""
        };
      default:
        return {
          color: "from-purple-500 to-pink-500",
          bgColor: "bg-purple-50",
          emoji: "🌱",
          description: "의미를 찾는 여정을 시작하고 있어요. 작은 질문들부터 시작해보세요.",
          quote: "\"씨앗이 싹을 틔우려면 어둠 속에서 시간이 필요하다.\""
        };
    }
  };

  const categoryInfo: Record<string, { icon: React.ReactNode; name: string; description: string }> = {
    fulfillment: { 
      icon: <Heart className="w-5 h-5" />, 
      name: '실존적 충만감',
      description: '일상에서 의미와 만족을 느끼는 정도'
    },
    values: { 
      icon: <Star className="w-5 h-5" />, 
      name: '가치 명확성',
      description: '핵심 가치관의 명료함과 일관성'
    },
    goals: { 
      icon: <Target className="w-5 h-5" />, 
      name: '목표 일관성',
      description: '목표 설정과 실행의 지속성'
    },
    awareness: { 
      icon: <Compass className="w-5 h-5" />, 
      name: '자기 인식',
      description: '자신에 대한 이해와 성찰 능력'
    }
  };

  const typeInfo = getTypeInfo();

  const getScoreColor = (score: number) => {
    if (score >= 75) return "bg-emerald-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 45) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getClarityBadgeColor = () => {
    switch (clarityLevel) {
      case "매우 높음": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "높음": return "bg-blue-100 text-blue-800 border-blue-200";
      case "보통": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-rose-100 text-rose-800 border-rose-200";
    }
  };

  return (
    <>
      <UnifiedNavigation />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 pt-20 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              돌아가기
            </Button>
          </div>

          {/* 메인 결과 카드 */}
          <Card className="border-indigo-200 shadow-xl mb-6 overflow-hidden">
            <div className={`bg-gradient-to-r ${typeInfo.color} p-6 text-white`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Mountain className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">삶의 의미 및 목적 탐색 결과</h2>
                    <p className="text-white/80">40문항 4개 영역 심층 분석 리포트</p>
                  </div>
                </div>
                <div className="text-4xl">{typeInfo.emoji}</div>
              </div>
            </div>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xl px-6 py-2 mb-4">
                  {purposeType}
                </Badge>
                <div className="text-5xl font-bold text-indigo-600 mb-2">{totalScore}점</div>
                <p className="text-muted-foreground">삶의 의미 명확성 종합 점수</p>
                <Progress value={totalScore} className="w-full mt-4 h-3" />
              </div>
              <div className={`p-4 rounded-lg ${typeInfo.bgColor} mb-4`}>
                <p className="text-lg mb-2">{typeInfo.description}</p>
                <p className="text-sm italic text-muted-foreground">{typeInfo.quote}</p>
              </div>
              <div className="flex justify-center">
                <Badge className={`text-sm px-4 py-2 ${getClarityBadgeColor()}`}>
                  방향 명확성: {clarityLevel}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* 4개 영역 점수 */}
          <Card className="border-indigo-200 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                4가지 삶의 의미 영역 분석
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(categoryScores).map(([category, score]) => (
                  <div key={category} className="p-4 bg-gradient-to-r from-white to-indigo-50 rounded-lg border border-indigo-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-600">{categoryInfo[category]?.icon}</span>
                        <span className="font-medium">{categoryInfo[category]?.name}</span>
                      </div>
                      <Badge className={`${getScoreColor(score)} text-white`}>{score}점</Badge>
                    </div>
                    <Progress value={score} className="h-2 mb-2" />
                    <p className="text-xs text-muted-foreground">{categoryInfo[category]?.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 맞춤 성찰 가이드 */}
          <Card className="border-indigo-200 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                맞춤 성찰 가이드
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                    <span className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 성찰 질문 */}
          <Card className="border-indigo-200 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                오늘의 성찰 질문
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <p className="text-purple-800 font-medium">"만약 실패가 존재하지 않는다면, 무엇을 하고 싶은가요?"</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
                  <p className="text-indigo-800 font-medium">"5년 전의 나에게 해주고 싶은 조언은 무엇인가요?"</p>
                </div>
                <div className="p-4 bg-pink-50 rounded-lg border-l-4 border-pink-500">
                  <p className="text-pink-800 font-medium">"오늘 내가 진정으로 감사한 것은 무엇인가요?"</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 액션 버튼 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600">
              <Download className="w-4 h-4 mr-2" />
              결과 저장하기
            </Button>
            <Button variant="outline" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              공유하기
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
