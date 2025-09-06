import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Download, Share2, Brain, AlertTriangle, CheckCircle, FileText, Crown } from "lucide-react";
import { useShareText } from "@/utils/shareUtils";
import { useTestActions } from "@/hooks/useTestActions";
import { useTokens } from "@/hooks/useTokens";
import { NextStepSuggestion } from '@/components/onboarding/NextStepSuggestion';

interface StressTestResultProps {
  result: {
    answers: number[];
    total: number;
    average: number;
    severity: string;
  };
  onRestart: () => void;
}

const levelConfig = {
  "건강한 마음상태": {
    color: "bg-green-500",
    badgeVariant: "default" as const,
    icon: CheckCircle,
    message: "마음이 안정적이고 건강합니다",
    description: "현재 일상의 압박감을 잘 조절하고 있으며, 정신적 회복력이 우수한 상태입니다."
  },
  "주의 필요": {
    color: "bg-yellow-500", 
    badgeVariant: "secondary" as const,
    icon: Brain,
    message: "마음의 균형이 조금 흔들리고 있어요",
    description: "일상적인 스트레스가 누적되고 있습니다. 적절한 관리를 통해 건강한 상태로 회복할 수 있어요."
  },
  "관리 필요": {
    color: "bg-red-500",
    badgeVariant: "destructive" as const,
    icon: AlertTriangle,
    message: "마음의 부담이 상당히 크네요",
    description: "일상생활에 영향을 주는 수준의 심리적 압박을 받고 있습니다. 적극적인 관리가 필요해요."
  }
};

const recommendations = {
  "건강한 마음상태": [
    "현재의 균형 잡힌 생활방식을 계속 유지해보세요",
    "작은 성취들을 인정하고 스스로를 격려해주세요",
    "새로운 도전이나 취미활동으로 성장의 기회를 만들어보세요",
    "주변 사람들과의 긍정적인 소통을 지속해보세요"
  ],
  "주의 필요": [
    "하루 10분씩 나만의 휴식 시간을 만들어보세요",
    "좋아하는 음악을 들으며 마음을 달래보세요",
    "간단한 스트레칭이나 산책으로 몸과 마음을 풀어보세요",
    "신뢰할 수 있는 사람과 마음 속 이야기를 나눠보세요"
  ],
  "관리 필요": [
    "전문 상담사나 심리치료사의 도움을 받아보세요",
    "마음의 부담을 줄일 수 있는 현실적인 방법을 찾아보세요",
    "충분한 휴식과 수면을 통해 회복의 시간을 가져보세요",
    "가족이나 친구들에게 현재 상황을 솔직하게 이야기해보세요"
  ]
};

export default function StressTestResult({ result, onRestart }: StressTestResultProps) {
  const config = levelConfig[result.severity as keyof typeof levelConfig];
  const Icon = config.icon;
  const progressValue = (result.total / 48) * 100;
  const { shareAsText } = useShareText();
  const { generatePDFReport, saveTestResult, isGeneratingPDF, isSaving } = useTestActions();
  const { balance } = useTokens();
  const isSubscribed = false; // 토큰제로 변경됨

  const handleShare = () => {
    const shareContent = `스트레스지수 측정 결과\n\n나의 마음상태: ${result.severity}\n총점: ${result.total}/48점\n평균: ${result.average.toFixed(1)}점`;
    shareAsText(shareContent, "스트레스지수 측정 결과");
  };

  const handlePDFGenerate = () => {
    generatePDFReport({
      testType: 'stress',
      total: result.total,
      average: result.average,
      severity: result.severity,
      ageGroup: 'adult'
    }, isSubscribed);
  };

  const handleSaveResult = () => {
    saveTestResult({
      testType: 'stress',
      total: result.total,
      average: result.average,
      severity: result.severity,
      ageGroup: 'adult'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-4">
      <div className="max-w-4xl mx-auto pt-8 space-y-6">
        {/* 결과 헤더 */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Icon className="w-8 h-8 text-primary" />
              <CardTitle className="text-2xl">스트레스지수 측정 결과</CardTitle>
            </div>
            <div className="space-y-4">
              <Badge variant={config.badgeVariant} className="text-lg px-4 py-2">
                {result.severity}
              </Badge>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">총점</p>
                  <p className="text-2xl font-bold">{result.total}/48점</p>
                  <p className="text-xs text-muted-foreground">최대 48점</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">평균</p>
                  <p className="text-2xl font-bold">{result.average.toFixed(1)}/4.0점</p>
                  <p className="text-xs text-muted-foreground">문항당 평균</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">백분위</p>
                  <p className="text-2xl font-bold">{Math.round(progressValue)}%</p>
                  <p className="text-xs text-muted-foreground">전체 대비</p>
                </div>
              </div>
              <div className="max-w-md mx-auto">
                <Progress value={progressValue} className="h-3" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* AI 분석 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              ✨ 상세 스트레스 분석 결과
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <h4 className="text-xl font-semibold text-purple-800 mb-4">🔍 전문가 상세 해석</h4>
                <div className="prose prose-purple max-w-none">
                  <p className="text-base leading-relaxed text-gray-800 whitespace-pre-line">
                    {result.severity === "건강한 마음상태" 
                      ? `현재 스트레스지수 ${result.total}점은 매우 건강한 정신 상태를 나타냅니다. 일상의 크고 작은 스트레스들을 효과적으로 관리하고 있으며, 정신적 회복력이 우수한 상태입니다.

**🌟 건강한 마음을 유지하는 7가지 비법:**
• **감정 조절 능력**: 어려운 상황에서도 감정을 균형 있게 유지하는 능력이 뛰어남
• **현실적 사고**: 문제를 객관적으로 바라보고 해결 가능한 방법을 찾는 능력
• **회복력**: 실패나 좌절에서 빠르게 회복하고 학습하는 탄력성
• **대인관계**: 건강한 경계선을 유지하며 타인과 조화롭게 소통하는 능력
• **자기인식**: 자신의 감정과 상태를 정확히 파악하고 관리하는 능력
• **생활 균형**: 일과 휴식, 개인과 관계의 균형을 적절히 유지하는 능력
• **성장 마인드**: 도전을 기회로 보고 지속적으로 발전하려는 적극적 태도

**💡 지속 관리 방법:** 현재의 건강한 상태를 유지하기 위해 정기적인 자기 점검과 균형 잡힌 생활 패턴을 지속하시기 바랍니다.`
                      : result.severity === "주의 필요"
                      ? `현재 스트레스지수 ${result.total}점은 일상적인 스트레스가 조금씩 누적되고 있는 상태입니다. 아직 심각한 수준은 아니지만, 적절한 관리를 통해 건강한 상태로 회복할 수 있는 중요한 시점이에요.

**🔄 마음의 균형을 되찾는 7가지 방법:**
• **일상 리듬 조정**: 수면, 식사, 활동의 규칙적인 패턴으로 마음의 안정감 확보
• **감정 표현**: 억눌린 감정들을 일기나 대화를 통해 건강하게 해소하기
• **소소한 즐거움**: 하루 중 작은 기쁨을 찾고 즐기는 시간을 의식적으로 만들기
• **몸과 마음 이완**: 간단한 스트레칭, 심호흡, 따뜻한 차 한 잔으로 긴장 풀기
• **경계선 설정**: 과도한 요구나 부담에 'No'라고 말할 수 있는 용기 기르기
• **지지체계 활용**: 믿을 만한 사람들과의 소통으로 마음의 무게 나누기
• **현재 집중**: 미래의 걱정보다 지금 이 순간에 집중하는 마음챙김 연습

**🌱 회복 기간:** 적극적인 관리를 통해 2-3개월 내 건강한 상태로 회복 가능합니다.`
                      : `현재 스트레스지수 ${result.total}점은 상당한 수준의 심리적 부담을 받고 있는 상태입니다. 일상생활에 영향을 주는 정도로, 지금 이 순간부터 적극적인 관리와 도움이 필요합니다.

**🆘 마음의 부담을 줄이는 7가지 응급처방:**
• **전문가 도움**: 심리상담사나 정신건강의학과 전문의의 체계적인 도움 받기
• **즉시 휴식**: 과도한 업무나 스트레스 요인에서 일시적으로 거리 두기
• **기본 생활 관리**: 충분한 수면, 영양 섭취, 적절한 운동으로 체력 회복
• **감정 안전망**: 신뢰할 수 있는 가족이나 친구들에게 현재 상황 솔직하게 이야기하기
• **작은 목표**: 큰 부담 대신 하루하루 작고 달성 가능한 목표로 성취감 쌓기
• **응급 대처법**: 압박감이 클 때 즉시 사용할 수 있는 호흡법이나 이완 기법 습득
• **환경 조정**: 스트레스 요인을 최소화하고 안정적인 환경 만들기

**⚡ 중요한 메시지:** 혼자 견디려 하지 마세요. 지금 상태는 충분히 도움받을 만한 상황이며, 적절한 지원을 받으면 분명히 회복될 수 있습니다.`}
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">{config.message}</h4>
                <p className="text-muted-foreground">{config.description}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">개인 맞춤 추천사항</h4>
                <ul className="space-y-2">
                  {recommendations[result.severity as keyof typeof recommendations].map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 예방 관리 팁 */}
        <Card>
          <CardHeader>
            <CardTitle>스트레스 예방 관리법</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold">일상 관리</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 규칙적인 생활 패턴 유지</li>
                  <li>• 충분한 수면 (7-8시간)</li>
                  <li>• 균형 잡힌 식단</li>
                  <li>• 규칙적인 운동</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">정신 건강</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 명상과 호흡 연습</li>
                  <li>• 취미 활동 즐기기</li>
                  <li>• 사회적 관계 유지</li>
                  <li>• 전문가 상담 고려</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {result.severity === "관리 필요" && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                전문 상담 권장
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">
                마음의 부담이 상당히 큰 상태입니다. 전문가의 체계적인 도움을 받으시길 권해드려요.
              </p>
              <div className="text-sm text-red-600">
                <p>• 정신건강의학과 전문의 진료</p>
                <p>• 심리상담센터나 마음건강센터 이용</p>
                <p>• 직장 내 EAP(Employee Assistance Program) 활용</p>
                <p>• 온라인 심리상담 플랫폼 이용</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 다음 단계 제안 */}
        <NextStepSuggestion className="mb-6" />

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