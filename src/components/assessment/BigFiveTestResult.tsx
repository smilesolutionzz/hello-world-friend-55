import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Download, Share2, User, Heart, Target, Brain, Lightbulb, Save, FileDown, Crown, Wallet, Lock, Sparkles } from "lucide-react";
import { useShareText } from "@/utils/shareUtils";
import { useTestResultActions } from "@/hooks/useTestResultActions";
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { CashBalanceDisplay } from '@/components/paywall/CashBalanceDisplay';
import { BlurredContent } from '@/components/paywall/BlurredContent';
import { useSubscription } from '@/hooks/useSubscription';

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
  const { generatePDFReport, saveTestResult, isGeneratingPDF, isSaving } = useTestResultActions();

  // 분석 텍스트 생성
  const analysisText = Object.entries(result.scores)
    .map(([factor, score]) => {
      const config = factorConfig[factor as keyof typeof factorConfig];
      const level = getLevel(score);
      return `${config.name}(${score.toFixed(1)}점/${level}): ${score >= 3 ? config.high : config.low}`;
    })
    .join('\n');

  // 자동 저장 - 분석 포함
  useAutoSaveTestResult({
    testType: '빅파이브 성격검사',
    results: { 
      total: result.total, 
      average: result.average, 
      scores: result.scores
    },
    analysis: analysisText
  });

  const handleShare = () => {
    const scoreTexts = Object.entries(result.scores)
      .map(([factor, score]) => `${factorConfig[factor as keyof typeof factorConfig].name}: ${score.toFixed(1)}`)
      .join('\n');
    
    const shareContent = `빅파이브 성격검사 결과\n\n나의 성격 특성:\n${scoreTexts}`;
    shareAsText(shareContent, "빅파이브 성격검사 결과");
  };

  const handleSaveResult = () => {
    saveTestResult({
      testType: '빅파이브 성격검사',
      results: {
        total: result.total,
        average: result.average,
        scores: result.scores,
        answers: result.answers
      },
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

        {/* 점수 범위 안내 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">📊 점수 분류 기준</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="font-semibold text-red-800">낮음 (1.0-2.5점)</p>
                <p className="text-sm text-red-600 mt-1">개선이 필요한 영역</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="font-semibold text-yellow-800">보통 (2.6-3.5점)</p>
                <p className="text-sm text-yellow-600 mt-1">평균 수준</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="font-semibold text-green-800">높음 (3.6-5.0점)</p>
                <p className="text-sm text-green-600 mt-1">강점 영역</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 종합 분석 - 확장된 해석 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              ✨ 상세 성격 분석
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">전체 평균</p>
                  <p className="text-2xl font-bold">{result.average.toFixed(1)}/5.0점</p>
                  <p className="text-xs text-muted-foreground">문항당 평균</p>
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
              
              <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <h4 className="text-xl font-semibold text-purple-800 mb-4">🔍 전문가 종합 해석</h4>
                <div className="prose prose-purple max-w-none">
                  <p className="text-base leading-relaxed text-gray-800 whitespace-pre-line">
                    당신의 성격 프로필은 {result.scores.extraversion >= 3.5 ? "외향적이고 사회적" : "내향적이고 신중한"} 특성을 보여줍니다. 
                    {result.scores.agreeableness >= 3.5 ? "타인과의 협력을 중시하며" : "독립적인 판단을 선호하며"}, 
                    {result.scores.conscientiousness >= 3.5 ? "체계적이고 계획적인 접근" : "유연하고 자발적인 접근"}을 하는 경향이 있습니다.

**7가지 구체적 개발 방법:**
• **자기인식 강화**: 매일 10분씩 자기성찰 시간 갖기
• **소통 능력 향상**: 주 2회 이상 새로운 사람과 의미있는 대화하기  
• **스트레스 관리**: 명상, 호흡법, 요가 등으로 정서 조절 능력 기르기
• **목표 설정**: SMART 기법으로 달성 가능한 단기/장기 목표 수립
• **창의성 개발**: 새로운 취미나 도전 과제를 월 1회 이상 시도하기
• **관계 개선**: 가족/친구와 깊이 있는 대화와 공감 시간 늘리기
• **자기 돌봄**: 신체적/정신적 건강을 위한 일관된 루틴 구축하기

**심화 분석:**
• 외향성 {result.scores.extraversion.toFixed(1)}점 - {result.scores.extraversion >= 4 ? "매우 활발하고 사교적이며 에너지를 타인과의 상호작용에서 얻습니다" :
  result.scores.extraversion >= 3 ? "적절한 사교성을 갖추고 있으며 상황에 따라 내성적/외향적 특성을 보입니다" : 
  "조용하고 신중하며 깊이 있는 소수의 관계를 선호합니다"}
• 친화성 {result.scores.agreeableness.toFixed(1)}점 - {result.scores.agreeableness >= 4 ? "타인에 대한 신뢰와 배려가 뛰어나며 협력적 관계를 잘 형성합니다" :
  result.scores.agreeableness >= 3 ? "균형잡힌 대인관계 접근으로 상황에 따라 협력과 독립성을 조절합니다" :
  "독립적 판단을 선호하며 객관적이고 현실적인 관점을 유지합니다"}
• 성실성 {result.scores.conscientiousness.toFixed(1)}점 - {result.scores.conscientiousness >= 4 ? "매우 체계적이고 책임감 있으며 목표 달성 능력이 뛰어납니다" :
  result.scores.conscientiousness >= 3 ? "적당한 계획성과 유연성을 겸비하여 상황 적응력이 좋습니다" :
  "자발적이고 유연한 접근을 선호하며 즉흥적 결정에 편안함을 느낍니다"}

**재평가 권장:** 성격 특성은 경험과 의식적 노력을 통해 발전할 수 있으므로, 3-6개월 후 재검사를 통해 개인적 성장과 변화를 추적하시기 바랍니다.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 전문가 연결 CTA */}
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">성격 전문가 상담 받기</h4>
              <p className="text-sm text-muted-foreground mb-3">
                성격검사 결과를 바탕으로 전문가 상담을 받아보세요.
              </p>
              <Button 
                onClick={() => window.open('/expert-hiring', '_self')}
                className="gap-2"
              >
                <User className="w-4 h-4" />
                심리전문가 고용하기
              </Button>
            </div>
          </div>
        </Card>

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => generatePDFReport({
              testType: 'bigfive',
              results: {
                ...result,
                ageGroup: '성인'
              },
              analysis: '5차원 성격 분석 완료',
              testInfo: {
                testName: '5차원 성격 분석',
                date: new Date().toLocaleDateString('ko-KR')
              }
            })}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            {isGeneratingPDF ? 'PDF 생성 중...' : 'PDF 다운로드'}
          </Button>
          <Button onClick={onRestart} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            다시 검사하기
          </Button>
          <Button onClick={handleShare} className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            결과 공유하기
          </Button>
          <Button 
            onClick={handleSaveResult} 
            disabled={isSaving}
            variant="secondary" 
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? '저장 중...' : '결과 저장하기'}
          </Button>
        </div>
      </div>
    </div>
  );
}