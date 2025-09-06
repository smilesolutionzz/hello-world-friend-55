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
  "낮은 스트레스": {
    color: "bg-green-500",
    badgeVariant: "default" as const,
    icon: CheckCircle,
    message: "건강한 스트레스 수준입니다",
    description: "현재 스트레스를 잘 관리하고 계십니다. 이 상태를 유지하세요."
  },
  "보통 스트레스": {
    color: "bg-yellow-500", 
    badgeVariant: "secondary" as const,
    icon: Brain,
    message: "적절한 관리가 필요합니다",
    description: "일상적인 스트레스 수준이지만 관리 방법을 배우면 도움이 됩니다."
  },
  "높은 스트레스": {
    color: "bg-red-500",
    badgeVariant: "destructive" as const,
    icon: AlertTriangle,
    message: "스트레스 관리가 시급합니다",
    description: "높은 스트레스 수준으로 전문적인 도움이 필요할 수 있습니다."
  }
};

const recommendations = {
  "낮은 스트레스": [
    "현재의 건강한 생활 패턴을 유지하세요",
    "규칙적인 운동과 충분한 수면을 계속하세요",
    "스트레스 관리 기술을 더욱 발전시켜 보세요",
    "주변 사람들과의 좋은 관계를 유지하세요"
  ],
  "보통 스트레스": [
    "명상이나 깊은 호흡 연습을 시작해보세요",
    "규칙적인 운동 루틴을 만드세요",
    "충분한 수면 시간을 확보하세요",
    "시간 관리 기술을 배워보세요"
  ],
  "높은 스트레스": [
    "전문 상담사나 의료진과 상담해보세요",
    "스트레스 요인을 파악하고 줄여보세요",
    "릴렉제이션 기법을 배우고 실천하세요",
    "가족이나 친구들에게 도움을 요청하세요"
  ]
};

export default function StressTestResult({ result, onRestart }: StressTestResultProps) {
  const config = levelConfig[result.severity as keyof typeof levelConfig];
  const Icon = config.icon;
  const progressValue = (result.total / 40) * 100;
  const { shareAsText } = useShareText();
  const { generatePDFReport, saveTestResult, isGeneratingPDF, isSaving } = useTestActions();
  const { balance } = useTokens();
  const isSubscribed = false; // 토큰제로 변경됨

  const handleShare = () => {
    const shareContent = `스트레스 인지 척도 검사 결과\n\n스트레스 수준: ${result.severity}\n총점: ${result.total}/40점\n평균: ${result.average.toFixed(1)}점`;
    shareAsText(shareContent, "스트레스 인지 척도 검사 결과");
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
              <CardTitle className="text-2xl">마음압박지수 측정 결과</CardTitle>
            </div>
            <div className="space-y-4">
              <Badge variant={config.badgeVariant} className="text-lg px-4 py-2">
                {result.severity}
              </Badge>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">총점</p>
                  <p className="text-2xl font-bold">{result.total}/40점</p>
                  <p className="text-xs text-muted-foreground">최대 40점</p>
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
                    {result.severity === "낮은 스트레스" 
                      ? `현재 스트레스 점수 ${result.total}점은 건강한 스트레스 관리 상태를 나타냅니다. 이는 일상생활의 압박감을 잘 조절하고 있으며, 적절한 대처 메커니즘을 갖추고 있음을 의미합니다.

**7가지 구체적 유지 방법:**
• **현재 패턴 지속**: 효과적인 스트레스 관리 방법들을 지속적으로 실천
• **예방적 관리**: 정기적인 자기 점검을 통한 스트레스 조기 감지
• **건강한 루틴**: 규칙적인 운동, 수면, 식사 패턴 꾸준히 유지
• **사회적 지지**: 긍정적인 인간관계와 지지 체계 지속 발전
• **여가 활동**: 즐거움을 주는 취미와 휴식 활동 지속적 참여
• **마음챙김**: 현재 순간에 집중하는 명상이나 마음챙김 연습
• **성장 마인드**: 작은 도전들을 통한 지속적인 자기 성장 추구

**재평가 권장:** 현재 상태를 유지하면서 3개월 후 재검사를 통해 지속적인 스트레스 관리 능력을 확인하시기 바랍니다.`
                      : result.severity === "보통 스트레스"
                      ? `현재 스트레스 점수 ${result.total}점은 일상적인 수준의 스트레스로, 적절한 관리 방법을 통해 충분히 개선할 수 있는 범위입니다. 현대인의 평균적인 스트레스 수준에 해당합니다.

**7가지 구체적 개선 방법:**
• **호흡법 연습**: 하루 3회 10분씩 4-7-8 호흡법이나 복식호흡 실시
• **운동 루틴**: 주 3회 이상 30분 유산소 운동으로 스트레스 호르몬 감소
• **시간 관리**: 우선순위 설정과 일정 관리를 통한 압박감 완화
• **이완 기법**: 점진적 근육이완법이나 요가를 통한 신체적 긴장 해소
• **수면 개선**: 규칙적인 수면 스케줄과 7-8시간 충분한 휴식 확보
• **감정 표현**: 일기 쓰기나 신뢰하는 사람과의 대화로 감정 해소
• **경계 설정**: 적절한 거절과 자기 보호를 위한 경계선 설정 연습

**재평가 권장:** 스트레스 관리 기법 적용 후 2-3개월 뒤 재검사를 통해 개선 정도를 확인하시기 바랍니다.`
                      : `현재 스트레스 점수 ${result.total}점은 높은 수준의 스트레스 상태로, 일상생활에 상당한 영향을 미칠 수 있어 적극적인 관리와 전문가 도움이 필요한 상태입니다.

**7가지 구체적 대응 방법:**
• **전문가 상담**: 정신건강 전문가나 상담사와 정기적 상담 시작
• **즉시 휴식**: 과도한 업무나 스트레스 요인에서 일시적 거리두기
• **응급 대처법**: 스트레스 상황 시 즉시 사용할 수 있는 호흡법이나 이완기법 습득
• **지지체계 활용**: 가족, 친구, 동료들에게 상황을 알리고 도움 요청
• **생활 구조화**: 스트레스 요인 최소화와 안정적인 일상 루틴 구축
• **신체 관리**: 충분한 수면, 영양 섭취, 카페인 줄이기 등 기본 건강 관리
• **단계적 회복**: 작은 목표부터 차근차근 달성하며 자신감 회복

**재평가 권장:** 전문가 상담과 함께 1-2개월 간격으로 정기적 재평가를 통해 스트레스 수준 변화를 모니터링하시기 바랍니다.`}
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

        {result.severity === "높은 스트레스" && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                전문 상담 권장
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">
                높은 스트레스 수준이 감지되었습니다. 전문가의 도움을 받아보시기 바랍니다.
              </p>
              <div className="text-sm text-red-600">
                <p>• 통합건강의학과 전문의 상담</p>
                <p>• 심리상담센터 이용</p>
                <p>• 직장 내 상담 프로그램 활용</p>
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