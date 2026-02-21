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
import { useLanguage } from '@/i18n';

interface BigFiveTestResultProps {
  result: {
    answers: Record<string, number>;
    scores: Record<string, number>;
    total: number;
    average: number;
  };
  onRestart: () => void;
}

const factorConfigKo = {
  extraversion: { name: "외향성", icon: User, color: "bg-blue-500", high: "사교적이고 활동적이며 자극을 추구합니다", low: "조용하고 독립적이며 신중합니다" },
  agreeableness: { name: "친화성", icon: Heart, color: "bg-green-500", high: "협력적이고 신뢰하며 동정심이 많습니다", low: "경쟁적이고 회의적이며 독립적입니다" },
  conscientiousness: { name: "성실성", icon: Target, color: "bg-purple-500", high: "조직적이고 책임감 있으며 목표지향적입니다", low: "유연하고 자발적이며 여유로운 성향입니다" },
  neuroticism: { name: "신경성", icon: Brain, color: "bg-red-500", high: "감정적으로 민감하고 스트레스에 취약합니다", low: "감정적으로 안정되고 차분합니다" },
  openness: { name: "개방성", icon: Lightbulb, color: "bg-yellow-500", high: "창의적이고 호기심 많으며 새로운 것을 추구합니다", low: "실용적이고 전통적이며 현실적입니다" }
};

const factorConfigEn = {
  extraversion: { name: "Extraversion", icon: User, color: "bg-blue-500", high: "Sociable, active, and seeks stimulation", low: "Quiet, independent, and cautious" },
  agreeableness: { name: "Agreeableness", icon: Heart, color: "bg-green-500", high: "Cooperative, trusting, and compassionate", low: "Competitive, skeptical, and independent" },
  conscientiousness: { name: "Conscientiousness", icon: Target, color: "bg-purple-500", high: "Organized, responsible, and goal-oriented", low: "Flexible, spontaneous, and relaxed" },
  neuroticism: { name: "Neuroticism", icon: Brain, color: "bg-red-500", high: "Emotionally sensitive and vulnerable to stress", low: "Emotionally stable and calm" },
  openness: { name: "Openness", icon: Lightbulb, color: "bg-yellow-500", high: "Creative, curious, and seeks new experiences", low: "Practical, traditional, and realistic" }
};

export default function BigFiveTestResult({ result, onRestart }: BigFiveTestResultProps) {
  const { shareAsText } = useShareText();
  const { generatePDFReport, saveTestResult, isGeneratingPDF, isSaving } = useTestResultActions();
  const { isEnglish } = useLanguage();
  const factorConfig = isEnglish ? factorConfigEn : factorConfigKo;

  const getLevel = (score: number) => score >= 4 ? (isEnglish ? "High" : "높음") : score >= 3 ? (isEnglish ? "Average" : "보통") : (isEnglish ? "Low" : "낮음");
  const getLevelVariant = (score: number) => score >= 4 ? "default" as const : score >= 3 ? "secondary" as const : "outline" as const;

  const analysisText = Object.entries(result.scores)
    .map(([factor, score]) => {
      const config = factorConfig[factor as keyof typeof factorConfig];
      const level = getLevel(score);
      return `${config.name}(${score.toFixed(1)}/${level}): ${score >= 3 ? config.high : config.low}`;
    }).join('\n');

  useAutoSaveTestResult({
    testType: isEnglish ? 'Big Five Personality Test' : '빅파이브 성격검사',
    results: { total: result.total, average: result.average, scores: result.scores },
    analysis: analysisText
  });

  const handleShare = () => {
    const scoreTexts = Object.entries(result.scores)
      .map(([factor, score]) => `${factorConfig[factor as keyof typeof factorConfig].name}: ${score.toFixed(1)}`)
      .join('\n');
    shareAsText(`${isEnglish ? 'Big Five Personality Test Results' : '빅파이브 성격검사 결과'}\n\n${scoreTexts}`, isEnglish ? "Big Five Results" : "빅파이브 성격검사 결과");
  };

  const handleSaveResult = () => {
    saveTestResult({ testType: isEnglish ? 'Big Five Personality Test' : '빅파이브 성격검사', results: { total: result.total, average: result.average, scores: result.scores, answers: result.answers }, ageGroup: 'adult' });
  };

  const highestFactor = Object.entries(result.scores).reduce((a, b) => result.scores[a[0] as keyof typeof result.scores] > result.scores[b[0] as keyof typeof result.scores] ? a : b)[0];
  const lowestFactor = Object.entries(result.scores).reduce((a, b) => result.scores[a[0] as keyof typeof result.scores] < result.scores[b[0] as keyof typeof result.scores] ? a : b)[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-4">
      <div className="max-w-4xl mx-auto pt-8 space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <User className="w-8 h-8 text-primary" />
              {isEnglish ? '5-Factor Personality Analysis' : '5차원 성격 분석 결과'}
            </CardTitle>
            <p className="text-muted-foreground">{isEnglish ? 'Analysis of 5 major personality factors' : '5가지 주요 성격 요인 분석'}</p>
          </CardHeader>
        </Card>

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
                      <div className={`p-2 rounded-full ${config.color} text-white`}><Icon className="w-5 h-5" /></div>
                      <div><h3 className="text-lg font-semibold">{config.name}</h3><Badge variant={getLevelVariant(score)}>{level}</Badge></div>
                    </div>
                    <div className="text-right"><p className="text-2xl font-bold">{score.toFixed(1)}</p><p className="text-sm text-muted-foreground">/ 5.0</p></div>
                  </div>
                  <Progress value={progressValue} className="mb-3" />
                  <p className="text-sm text-muted-foreground">{score >= 3.5 ? config.high : config.low}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-xl font-semibold">{isEnglish ? '📊 Score Classification' : '📊 점수 분류 기준'}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="font-semibold text-red-800">{isEnglish ? 'Low (1.0-2.5)' : '낮음 (1.0-2.5점)'}</p>
                <p className="text-sm text-red-600 mt-1">{isEnglish ? 'Needs improvement' : '개선이 필요한 영역'}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="font-semibold text-yellow-800">{isEnglish ? 'Average (2.6-3.5)' : '보통 (2.6-3.5점)'}</p>
                <p className="text-sm text-yellow-600 mt-1">{isEnglish ? 'Average level' : '평균 수준'}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="font-semibold text-green-800">{isEnglish ? 'High (3.6-5.0)' : '높음 (3.6-5.0점)'}</p>
                <p className="text-sm text-green-600 mt-1">{isEnglish ? 'Strength area' : '강점 영역'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              {isEnglish ? '✨ Detailed Personality Analysis' : '✨ 상세 성격 분석'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">{isEnglish ? 'Overall Average' : '전체 평균'}</p>
                  <p className="text-2xl font-bold">{result.average.toFixed(1)}/5.0</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{isEnglish ? 'Highest Trait' : '가장 높은 특성'}</p>
                  <p className="text-lg font-semibold">{factorConfig[highestFactor as keyof typeof factorConfig].name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{isEnglish ? 'Lowest Trait' : '가장 낮은 특성'}</p>
                  <p className="text-lg font-semibold">{factorConfig[lowestFactor as keyof typeof factorConfig].name}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-4">
            <User className="w-8 h-8 text-primary flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">{isEnglish ? 'Get Expert Consultation' : '성격 전문가 상담 받기'}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {isEnglish ? 'Get professional counseling based on your personality test results.' : '성격검사 결과를 바탕으로 전문가 상담을 받아보세요.'}
              </p>
              <Button onClick={() => window.open('/expert-hiring', '_self')} className="gap-2">
                <User className="w-4 h-4" />{isEnglish ? 'Find a Psychologist' : '심리전문가 고용하기'}
              </Button>
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => generatePDFReport({ testType: 'bigfive', results: { ...result, ageGroup: isEnglish ? 'Adult' : '성인' }, analysis: isEnglish ? '5-Factor Personality Analysis Complete' : '5차원 성격 분석 완료', testInfo: { testName: isEnglish ? '5-Factor Personality Analysis' : '5차원 성격 분석', date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR') } })} disabled={isGeneratingPDF} className="flex items-center gap-2">
            <FileDown className="w-4 h-4" />{isGeneratingPDF ? (isEnglish ? 'Generating...' : 'PDF 생성 중...') : (isEnglish ? 'Download PDF' : 'PDF 다운로드')}
          </Button>
          <Button onClick={onRestart} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />{isEnglish ? 'Retake Test' : '다시 검사하기'}
          </Button>
          <Button onClick={handleShare} className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />{isEnglish ? 'Share Results' : '결과 공유하기'}
          </Button>
          <Button onClick={handleSaveResult} disabled={isSaving} variant="secondary" className="flex items-center gap-2">
            <Save className="w-4 h-4" />{isSaving ? (isEnglish ? 'Saving...' : '저장 중...') : (isEnglish ? 'Save Results' : '결과 저장하기')}
          </Button>
        </div>
      </div>
    </div>
  );
}
