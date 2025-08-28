import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Download, Share2, Heart, TrendingUp, AlertCircle, CheckCircle, Target, FileText, Crown } from "lucide-react";
import { useShareText } from "@/utils/shareUtils";
import { useTestActions } from "@/hooks/useTestActions";
import { useSubscription } from "@/hooks/useSubscription";

interface SelfEsteemTestResultProps {
  result: {
    answers: number[];
    total: number;
    average: number;
    level: string;
  };
  onRestart: () => void;
}

const levelConfig = {
  "매우 높음": {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    description: "매우 건강한 자존감을 가지고 있습니다",
    advice: "현재의 긍정적인 자아인식을 유지하며, 다른 사람들에게도 좋은 영향을 줄 수 있습니다."
  },
  "높음": {
    icon: TrendingUp,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    description: "건강한 자존감을 가지고 있습니다",
    advice: "자신에 대한 긍정적인 인식을 바탕으로 도전적인 목표를 설정해보세요."
  },
  "보통": {
    icon: Target,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    description: "평균적인 자존감 수준입니다",
    advice: "자신의 강점을 더 인식하고 작은 성취들을 축하하는 습관을 기르세요."
  },
  "낮음": {
    icon: AlertCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    description: "자존감을 높이는 노력이 필요합니다",
    advice: "자신의 장점을 찾아 기록하고, 긍정적인 자기대화를 연습해보세요."
  },
  "매우 낮음": {
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    description: "자존감 향상을 위한 적극적인 노력이 필요합니다",
    advice: "전문가의 도움을 받아 체계적인 자존감 향상 프로그램을 고려해보세요."
  }
};

const improvementTips = [
  "매일 자신이 잘한 일 3가지를 기록하기",
  "부정적인 자기대화를 긍정적으로 바꾸기",
  "새로운 도전을 통해 성취감 느끼기",
  "신뢰할 수 있는 사람들과 관계 맺기",
  "자신의 감정을 인정하고 수용하기",
  "완벽주의 버리고 진전에 집중하기"
];

export default function SelfEsteemTestResult({ result, onRestart }: SelfEsteemTestResultProps) {
  const config = levelConfig[result.level as keyof typeof levelConfig];
  const Icon = config.icon;
  const progressValue = (result.average / 5) * 100;
  const { shareAsText } = useShareText();
  const { generatePDFReport, saveTestResult, isGeneratingPDF, isSaving } = useTestActions();
  const { subscribed: isSubscribed } = useSubscription();

  const handleShare = () => {
    const shareContent = `자아가치 측정 결과\n\n자존감 수준: ${result.level}\n총점: ${result.total}/75점\n평균: ${result.average.toFixed(1)}점`;
    shareAsText(shareContent, "자아가치 측정 결과");
  };

  const handlePDFGenerate = () => {
    generatePDFReport({
      testType: 'selfesteem',
      total: result.total,
      average: result.average,
      level: result.level,
      ageGroup: 'adult'
    }, isSubscribed);
  };

  const handleSaveResult = () => {
    saveTestResult({
      testType: 'selfesteem',
      total: result.total,
      average: result.average,
      level: result.level,
      ageGroup: 'adult'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-4">
      <div className="max-w-4xl mx-auto pt-8 space-y-6">
        {/* 결과 헤더 */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Heart className="w-8 h-8 text-primary" />
              자아가치 측정 결과
            </CardTitle>
            <p className="text-muted-foreground">나의 자존감 수준 분석</p>
          </CardHeader>
        </Card>

        {/* 주요 결과 */}
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-full ${config.bgColor}`}>
                  <Icon className={`w-8 h-8 ${config.color}`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{result.level}</h2>
                  <p className="text-muted-foreground">{config.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{result.average.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">/ 5.0</p>
              </div>
            </div>
            
            <Progress value={progressValue} className="mb-4" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">총점</p>
                <p className="text-xl font-bold">{result.total}/75점</p>
                <p className="text-xs text-muted-foreground">최대 75점</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">평균점수</p>
                <p className="text-xl font-bold">{result.average.toFixed(1)}/5.0점</p>
                <p className="text-xs text-muted-foreground">문항당 평균</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">백분위</p>
                <p className="text-xl font-bold">{Math.round(progressValue)}%</p>
                <p className="text-xs text-muted-foreground">전체 대비</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 개인화된 조언 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              개인화된 조언
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`p-4 rounded-lg ${config.bgColor} mb-4`}>
              <p className="text-sm font-medium">{config.advice}</p>
            </div>
            
            <h4 className="font-semibold mb-3">자존감 향상을 위한 실천 방법</h4>
            <div className="grid gap-3">
              {improvementTips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Badge variant="outline" className="text-xs min-w-fit">
                    {index + 1}
                  </Badge>
                  <p className="text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 수준별 특성 */}
        <Card>
          <CardHeader>
            <CardTitle>자존감 수준별 특성</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.level === "매우 높음" && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-700 mb-2">강점</h4>
                  <ul className="text-sm text-green-600 space-y-1">
                    <li>• 자신의 가치를 확실히 알고 있음</li>
                    <li>• 실패에도 굴복하지 않는 회복력</li>
                    <li>• 타인과 건강한 관계 형성 가능</li>
                  </ul>
                </div>
              )}
              
              {(result.level === "낮음" || result.level === "매우 낮음") && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-700 mb-2">개선 포인트</h4>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>• 자신의 장점과 성취 인정하기</li>
                    <li>• 완벽주의적 사고 패턴 수정</li>
                    <li>• 지지적인 인간관계 형성하기</li>
                  </ul>
                </div>
              )}
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
          <Button 
            onClick={handlePDFGenerate} 
            variant="secondary" 
            className="flex items-center gap-2"
            disabled={isGeneratingPDF}
          >
            {isSubscribed ? <FileText className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
            {isGeneratingPDF ? "생성 중..." : isSubscribed ? "PDF 리포트" : "PDF 리포트 (프리미엄)"}
          </Button>
          <Button 
            onClick={handleSaveResult}
            variant="secondary" 
            className="flex items-center gap-2"
            disabled={isSaving}
          >
            <Download className="w-4 h-4" />
            {isSaving ? "저장 중..." : "결과 저장하기"}
          </Button>
        </div>
      </div>
    </div>
  );
}