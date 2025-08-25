import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Download, Share2, Heart, Shield, UserX, Zap } from "lucide-react";
import { shareTestResult } from "@/utils/shareUtils";

interface AttachmentStyleResultProps {
  result: {
    answers: Record<string, number>;
    anxietyScore: number;
    avoidanceScore: number;
    style: string;
    total: number;
    average: number;
  };
  onRestart: () => void;
}

const styleConfig = {
  "안정형": {
    color: "bg-green-500",
    badgeVariant: "default" as const,
    icon: Heart,
    description: "건강한 인간관계를 형성하고 유지하는 능력이 뛰어납니다.",
    characteristics: [
      "타인과 친밀한 관계를 편안하게 느낌",
      "적절한 독립성과 의존성의 균형",
      "갈등 상황에서 건설적으로 소통",
      "자신과 타인에 대한 긍정적 인식"
    ]
  },
  "불안형": {
    color: "bg-yellow-500",
    badgeVariant: "secondary" as const,
    icon: Zap,
    description: "관계에서 불안감을 느끼지만 친밀함을 강하게 원합니다.",
    characteristics: [
      "타인의 인정과 관심을 강하게 추구",
      "관계에서 버림받을 것에 대한 두려움",
      "감정 기복이 크고 민감한 반응",
      "파트너의 사랑을 지속적으로 확인하려함"
    ]
  },
  "회피형": {
    color: "bg-blue-500",
    badgeVariant: "outline" as const,
    icon: Shield,
    description: "독립성을 중시하며 지나친 친밀감을 불편해합니다.",
    characteristics: [
      "혼자 있는 것을 선호하고 편안해함",
      "타인에게 의존하는 것을 어려워함",
      "감정 표현을 억제하는 경향",
      "깊은 관계 형성을 회피하려는 성향"
    ]
  },
  "혼란형": {
    color: "bg-red-500",
    badgeVariant: "destructive" as const,
    icon: UserX,
    description: "관계에서 일관성 없는 패턴을 보이며 혼란스러워합니다.",
    characteristics: [
      "친밀함을 원하지만 동시에 두려워함",
      "관계에서 예측 불가능한 행동 패턴",
      "불안과 회피가 동시에 나타남",
      "과거 트라우마의 영향을 받을 가능성"
    ]
  }
};

const improvementTips = {
  "안정형": [
    "현재의 건강한 관계 패턴을 유지하세요",
    "다른 사람들의 애착 스타일을 이해하고 도와주세요",
    "갈등 상황에서 중재 역할을 잘 수행할 수 있습니다",
    "자신의 경험을 바탕으로 조언할 수 있습니다"
  ],
  "불안형": [
    "자기 가치감을 높이는 활동을 하세요",
    "타인의 반응에 지나치게 민감하지 않도록 노력하세요",
    "명상이나 마음챙김 연습을 해보세요",
    "안정적인 관계 경험을 늘려나가세요"
  ],
  "회피형": [
    "감정 표현 연습을 해보세요",
    "단계적으로 친밀감을 늘려나가세요",
    "신뢰할 수 있는 사람과 깊은 대화를 시도해보세요",
    "과거의 상처를 치유하는 과정이 필요할 수 있습니다"
  ],
  "혼란형": [
    "전문가의 도움을 받아보는 것이 좋습니다",
    "일관된 관계 패턴을 만들어나가세요",
    "자신의 감정을 이해하고 조절하는 법을 배우세요",
    "안전한 관계에서부터 시작해보세요"
  ]
};

export default function AttachmentStyleResult({ result, onRestart }: AttachmentStyleResultProps) {
  const config = styleConfig[result.style as keyof typeof styleConfig];
  const Icon = config.icon;
  const tips = improvementTips[result.style as keyof typeof improvementTips];

  const handleShare = () => {
    shareTestResult(
      "애착 유형 검사",
      `나의 애착 유형: ${result.style}\n불안 점수: ${result.anxietyScore.toFixed(1)}\n회피 점수: ${result.avoidanceScore.toFixed(1)}`,
      "attachment-test"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-4">
      <div className="max-w-4xl mx-auto pt-8 space-y-6">
        {/* 결과 헤더 */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Icon className="w-8 h-8 text-primary" />
              <CardTitle className="text-2xl">애착 유형 검사 결과</CardTitle>
            </div>
            <div className="space-y-4">
              <Badge variant={config.badgeVariant} className="text-lg px-4 py-2">
                {result.style}
              </Badge>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {config.description}
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* 점수 분석 */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">불안 차원</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>점수</span>
                  <span className="text-xl font-bold">{result.anxietyScore.toFixed(1)}/7.0</span>
                </div>
                <Progress value={(result.anxietyScore / 7) * 100} />
                <p className="text-sm text-muted-foreground">
                  {result.anxietyScore >= 4 ? "관계에서 불안감이 높은 편입니다" : "관계에서 비교적 안정감을 느낍니다"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">회피 차원</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>점수</span>
                  <span className="text-xl font-bold">{result.avoidanceScore.toFixed(1)}/7.0</span>
                </div>
                <Progress value={(result.avoidanceScore / 7) * 100} />
                <p className="text-sm text-muted-foreground">
                  {result.avoidanceScore >= 4 ? "친밀감을 회피하는 경향이 있습니다" : "친밀한 관계를 편안하게 느낍니다"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 특성 분석 */}
        <Card>
          <CardHeader>
            <CardTitle>나의 애착 특성</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {config.characteristics.map((characteristic, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{characteristic}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* 개선 방향 */}
        <Card>
          <CardHeader>
            <CardTitle>관계 개선 제안</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tips.map((tip, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 애착 유형별 관계 팁 */}
        <Card>
          <CardHeader>
            <CardTitle>건강한 관계를 위한 팁</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold">소통 방법</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  {result.style === "안정형" && (
                    <>
                      <li>• 열린 마음으로 솔직하게 대화하기</li>
                      <li>• 상대방의 감정을 공감하고 이해하기</li>
                    </>
                  )}
                  {result.style === "불안형" && (
                    <>
                      <li>• 감정을 즉시 표현하지 말고 한번 생각하기</li>
                      <li>• "나 메시지"로 감정 전달하기</li>
                    </>
                  )}
                  {result.style === "회피형" && (
                    <>
                      <li>• 정기적으로 감정 상태 체크하기</li>
                      <li>• 작은 감정부터 표현 연습하기</li>
                    </>
                  )}
                  {result.style === "혼란형" && (
                    <>
                      <li>• 감정 정리 시간 갖기</li>
                      <li>• 일관된 소통 패턴 만들기</li>
                    </>
                  )}
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">자기 관리</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 자신의 감정 패턴 관찰하기</li>
                  <li>• 스트레스 관리 방법 찾기</li>
                  <li>• 자기 돌봄 시간 갖기</li>
                  <li>• 필요시 전문가 도움 받기</li>
                </ul>
              </div>
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