import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Download, Share2, Heart, TrendingUp, AlertCircle, CheckCircle, Target, FileText, Crown } from "lucide-react";
import { useShareText } from "@/utils/shareUtils";
import { useTestActions } from "@/hooks/useTestActions";
import { useTokens } from "@/hooks/useTokens";

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
  const { balance } = useTokens();
  const isSubscribed = false; // 토큰제로 변경됨

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
              ✨ 상세 자존감 분석
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <h4 className="text-xl font-semibold text-purple-800 mb-4">🔍 전문가 상세 해석</h4>
                <div className="prose prose-purple max-w-none">
                  <p className="text-base leading-relaxed text-gray-800 whitespace-pre-line">
                    {result.level === "매우 높음"
                      ? `현재 자존감 점수 ${result.total}점은 매우 건강하고 안정적인 자아상을 나타냅니다. 이는 자신의 가치를 명확히 인식하고 있으며, 타인의 평가에 흔들리지 않는 내적 안정감을 갖추고 있음을 의미합니다.

**7가지 구체적 발전 방법:**
• **멘토링 역할**: 자존감이 낮은 사람들에게 긍정적 영향력 발휘하기
• **도전 과제**: 새로운 영역에서의 성장을 통한 자기효능감 확장
• **감사 실천**: 매일 자신과 타인에 대한 감사 표현으로 긍정성 강화
• **목표 설정**: 개인적 성장을 위한 의미있는 장기 목표 수립
• **리더십 개발**: 팀이나 그룹에서 긍정적 리더십 역할 적극 수행
• **균형 유지**: 겸손과 자신감의 건강한 균형점 지속적 유지
• **지속적 학습**: 새로운 지식과 기술 습득을 통한 자기계발 추진

**재평가 권장:** 현재 상태를 유지하면서 6개월 후 재검사를 통해 지속적인 자존감 발전과 타인에게 미치는 긍정적 영향을 확인하시기 바랍니다.`
                      : result.level === "높음"
                      ? `현재 자존감 점수 ${result.total}점은 건강한 수준의 자존감을 나타냅니다. 전반적으로 자신에 대해 긍정적으로 인식하고 있으며, 적절한 자신감을 갖추고 있는 상태입니다.

**7가지 구체적 발전 방법:**
• **강점 활용**: 개인의 장점과 재능을 더욱 적극적으로 발휘하기
• **도전 증가**: 안전지대를 벗어나 새로운 경험과 성취 추구
• **관계 심화**: 기존 인간관계를 더욱 깊고 의미있게 발전시키기
• **자기표현**: 자신의 의견과 감정을 더욱 자신있게 표현하기
• **성취 축하**: 작은 성공들도 인정하고 축하하는 습관 기르기
• **피드백 수용**: 건설적 비판을 성장의 기회로 받아들이기
• **가치 명확화**: 개인의 핵심 가치와 신념을 더욱 명확히 정립

**재평가 권장:** 자존감 발전 노력 후 3-6개월 뒤 재검사를 통해 성장 정도와 삶의 만족도 변화를 확인하시기 바랍니다.`
                      : result.level === "보통"
                      ? `현재 자존감 점수 ${result.total}점은 평균적인 수준으로, 상황에 따라 자신감이 변동될 수 있는 상태입니다. 적절한 노력을 통해 충분히 향상시킬 수 있는 범위입니다.

**7가지 구체적 개선 방법:**
• **강점 발견**: 매일 자신이 잘한 일 3가지씩 기록하고 인정하기
• **긍정 대화**: 부정적 자기대화를 긍정적이고 현실적인 표현으로 바꾸기
• **성취 경험**: 작은 목표들을 설정하고 달성하며 성공 경험 쌓기
• **지지체계**: 격려와 지지를 주는 사람들과의 관계 더욱 발전시키기
• **자기 돌봄**: 신체적, 정신적 건강을 위한 일상 루틴 구축하기
• **비교 중단**: 타인과의 비교보다 과거의 자신과 비교하는 습관 기르기
• **전문가 도움**: 필요시 상담을 통한 체계적인 자존감 향상 프로그램 참여

**재평가 권장:** 자존감 향상 노력 후 3-6개월 뒤 재검사를 통해 개선 정도와 일상생활에서의 변화를 확인하시기 바랍니다.`
                      : result.level === "낮음"
                      ? `현재 자존감 점수 ${result.total}점은 낮은 수준으로, 자신에 대한 부정적 인식이 일상생활에 영향을 미칠 수 있는 상태입니다. 적극적인 개선 노력이 필요합니다.

**7가지 구체적 회복 방법:**
• **전문가 상담**: 자존감 전문 상담사와의 정기적 상담 시작
• **인지 재구성**: 부정적 사고 패턴을 식별하고 현실적 사고로 교정
• **작은 성공**: 달성 가능한 매우 작은 목표들부터 차근차근 달성
• **자기 돌봄**: 기본적인 자기 관리(수면, 식사, 운동)부터 체계적 시작
• **경계 설정**: 타인의 부정적 평가로부터 자신을 보호하는 방법 학습
• **지지 그룹**: 비슷한 경험을 가진 사람들과의 지지 모임 참여
• **감정 표현**: 일기 쓰기나 예술 활동을 통한 감정 표출과 정리

**재평가 권장:** 전문가 도움과 함께 2-3개월 간격으로 정기적 재평가를 통해 자존감 회복 과정을 모니터링하시기 바랍니다.`
                      : `현재 자존감 점수 ${result.total}점은 매우 낮은 수준으로, 즉시 전문적 도움이 필요한 상태입니다. 자신에 대한 부정적 인식이 심각하여 일상생활 전반에 상당한 영향을 미치고 있을 가능성이 높습니다.

**7가지 즉시 실행 방법:**
• **응급 상담**: 즉시 정신건강 전문가나 상담센터 연락하여 긴급 상담 받기
• **안전 계획**: 자해나 극단적 생각 시 즉시 연락할 수 있는 지원체계 구축
• **기본 돌봄**: 하루 한 가지씩 자신을 위한 작은 친절 실천하기
• **지지 요청**: 가족이나 신뢰하는 친구에게 상황 알리고 도움 요청
• **전문 치료**: 필요시 의료진과 상담하여 약물 치료 등 종합적 접근
• **안전 환경**: 스트레스 요인을 최소화하고 안정적인 환경 조성
• **단계적 회복**: 작은 변화부터 시작하여 점진적으로 자존감 회복

**재평가 권장:** 전문가 치료와 함께 1-2개월 간격으로 집중적인 모니터링과 재평가를 통해 자존감 회복 과정을 세심하게 관리하시기 바랍니다.`}
                  </p>
                </div>
              </div>
              
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