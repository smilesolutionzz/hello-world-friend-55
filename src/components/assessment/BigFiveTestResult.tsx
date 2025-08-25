import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Download, Share2, User, Heart, Target, Brain, Lightbulb } from "lucide-react";
import { useShareText } from "@/utils/shareUtils";

interface BigFiveTestResultProps {
  result: {
    answers: Record<string, number>;
    scores: Record<string, number>;
    total: number;
    average: number;
  };
  onRestart: () => void;
}

const factorConfig = {
  extraversion: {
    name: "외향성",
    icon: User,
    color: "bg-blue-500",
    high: "사교적이고 활동적이며 자극을 추구합니다",
    low: "조용하고 독립적이며 신중합니다"
  },
  agreeableness: {
    name: "친화성", 
    icon: Heart,
    color: "bg-green-500",
    high: "협력적이고 신뢰하며 동정심이 많습니다",
    low: "경쟁적이고 회의적이며 독립적입니다"
  },
  conscientiousness: {
    name: "성실성",
    icon: Target,
    color: "bg-purple-500", 
    high: "조직적이고 책임감 있으며 목표지향적입니다",
    low: "유연하고 자발적이며 여유로운 성향입니다"
  },
  neuroticism: {
    name: "신경성",
    icon: Brain,
    color: "bg-red-500",
    high: "감정적으로 민감하고 스트레스에 취약합니다",
    low: "감정적으로 안정되고 차분합니다"
  },
  openness: {
    name: "개방성",
    icon: Lightbulb,
    color: "bg-yellow-500",
    high: "창의적이고 호기심 많으며 새로운 것을 추구합니다",
    low: "실용적이고 전통적이며 현실적입니다"
  }
};

const getLevel = (score: number) => {
  if (score >= 4) return "높음";
  if (score >= 3) return "보통";
  return "낮음";
};

const getLevelVariant = (score: number) => {
  if (score >= 4) return "default" as const;
  if (score >= 3) return "secondary" as const;
  return "outline" as const;
};

export default function BigFiveTestResult({ result, onRestart }: BigFiveTestResultProps) {
  const { shareAsText } = useShareText();

  const handleShare = () => {
    const scoreTexts = Object.entries(result.scores)
      .map(([factor, score]) => `${factorConfig[factor as keyof typeof factorConfig].name}: ${score.toFixed(1)}`)
      .join('\n');
    
    const shareContent = `빅파이브 성격검사 결과\n\n나의 성격 특성:\n${scoreTexts}`;
    shareAsText(shareContent, "빅파이브 성격검사 결과");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-4">
      <div className="max-w-4xl mx-auto pt-8 space-y-6">
        {/* 결과 헤더 */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <User className="w-8 h-8 text-primary" />
              5차원 성격 분석 결과
            </CardTitle>
            <p className="text-muted-foreground">5가지 주요 성격 요인 분석</p>
          </CardHeader>
        </Card>

        {/* 성격 요인별 결과 */}
        <div className="grid gap-4">
          {Object.entries(result.scores).map(([factor, score]) => {
            const config = factorConfig[factor as keyof typeof factorConfig];
            const Icon = config.icon;
            const level = getLevel(score);
            const progressValue = (score / 5) * 100;
            
            return (
              <Card key={factor}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${config.color.replace('bg-', 'bg-')} text-white`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{config.name}</h3>
                        <Badge variant={getLevelVariant(score)}>{level}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{score.toFixed(1)}</p>
                      <p className="text-sm text-muted-foreground">/ 5.0</p>
                    </div>
                  </div>
                  
                  <Progress value={progressValue} className="mb-3" />
                  
                  <p className="text-sm text-muted-foreground">
                    {score >= 3.5 ? config.high : config.low}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 종합 분석 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              종합 성격 분석
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">전체 평균</p>
                  <p className="text-2xl font-bold">{result.average.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">가장 높은 특성</p>
                  <p className="text-lg font-semibold">
                    {factorConfig[
                      Object.entries(result.scores).reduce((a, b) => 
                        result.scores[a[0] as keyof typeof result.scores] > result.scores[b[0] as keyof typeof result.scores] ? a : b
                      )[0] as keyof typeof factorConfig
                    ].name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">가장 낮은 특성</p>
                  <p className="text-lg font-semibold">
                    {factorConfig[
                      Object.entries(result.scores).reduce((a, b) => 
                        result.scores[a[0] as keyof typeof result.scores] < result.scores[b[0] as keyof typeof result.scores] ? a : b
                      )[0] as keyof typeof factorConfig
                    ].name}
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">성격 유형 요약</h4>
                <p className="text-muted-foreground">
                  당신은 {result.scores.extraversion >= 3.5 ? "외향적이고" : "내향적이고"} {" "}
                  {result.scores.agreeableness >= 3.5 ? "협력적인" : "독립적인"} 성향을 보입니다. {" "}
                  {result.scores.conscientiousness >= 3.5 ? "성실하고 계획적이며" : "유연하고 자발적이며"} {" "}
                  {result.scores.openness >= 3.5 ? "새로운 경험에 개방적" : "전통적이고 실용적"}입니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 개발 제안 */}
        <Card>
          <CardHeader>
            <CardTitle>성격 발달 제안</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(result.scores).map(([factor, score]) => {
                const config = factorConfig[factor as keyof typeof factorConfig];
                if (score < 2.5) {
                  return (
                    <div key={factor} className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm">
                        <span className="font-semibold">{config.name} 향상:</span> {" "}
                        {factor === 'extraversion' && "사회적 활동이나 그룹 참여를 늘려보세요"}
                        {factor === 'agreeableness' && "타인의 관점을 이해하려 노력해보세요"}
                        {factor === 'conscientiousness' && "일정 관리와 목표 설정을 연습해보세요"}
                        {factor === 'neuroticism' && "스트레스 관리 기법을 배워보세요"}
                        {factor === 'openness' && "새로운 취미나 경험을 시도해보세요"}
                      </p>
                    </div>
                  );
                }
                return null;
              }).filter(Boolean)}
            </div>
          </CardContent>
        </Card>

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={onRestart} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            다시 검사하기
          </Button>
          <Button onClick={handleShare} className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            결과 공유하기
          </Button>
          <Button variant="secondary" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            결과 저장하기
          </Button>
        </div>
      </div>
    </div>
  );
}