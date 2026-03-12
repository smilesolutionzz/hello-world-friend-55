import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, Brain, Heart, Sparkles, Home, Share2, TrendingUp,
  Shield, Zap, Target, Users, Star, Lightbulb, ArrowLeft, Download, Wallet, Lock 
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useToast } from '@/hooks/use-toast';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { CashBalanceDisplay } from '@/components/paywall/CashBalanceDisplay';
import { BlurredContent } from '@/components/paywall/BlurredContent';
import { useSubscription } from '@/hooks/useSubscription';
import { useLanguage } from '@/i18n/LanguageContext';

interface HexacoResultProps {
  result: {
    categoryScores: Record<string, number>;
    analysis: string;
    totalScore: number;
  };
  onBack: () => void;
}

const getDimensionInfo = (isEnglish: boolean): Record<string, { 
  name: string; nameEn: string; icon: any; description: string; 
  highTrait: string; lowTrait: string; color: string;
}> => ({
  honesty: {
    name: isEnglish ? 'Honesty-Humility' : '정직-겸손',
    nameEn: 'Honesty-Humility', icon: Shield,
    description: isEnglish ? 'Level of morality, fairness, and humility' : '도덕성, 공정성, 겸손함의 정도',
    highTrait: isEnglish ? 'Honest, humble, and has few material desires' : '정직하고 겸손하며 물질적 욕구가 적음',
    lowTrait: isEnglish ? 'Self-centered, arrogant, and pursues material gain' : '자기중심적이고 거만하며 물질적 이득을 추구',
    color: 'from-blue-500 to-cyan-500',
  },
  emotionality: {
    name: isEnglish ? 'Emotionality' : '정서성',
    nameEn: 'Emotionality', icon: Heart,
    description: isEnglish ? 'Emotional reactivity and empathy' : '감정적 반응성과 공감 능력',
    highTrait: isEnglish ? 'Emotional, empathetic, and prone to anxiety' : '감성적이고 공감 능력이 뛰어나며 불안을 잘 느낌',
    lowTrait: isEnglish ? 'Emotionally stable, independent, and brave' : '감정적으로 안정적이고 독립적이며 용감함',
    color: 'from-pink-500 to-rose-500',
  },
  extraversion: {
    name: isEnglish ? 'Extraversion' : '외향성',
    nameEn: 'eXtraversion', icon: Zap,
    description: isEnglish ? 'Level of sociability and energy' : '사교성과 활력의 수준',
    highTrait: isEnglish ? 'Sociable, active, and has high positive energy' : '사교적이고 활동적이며 긍정적인 에너지가 높음',
    lowTrait: isEnglish ? 'Quiet, introverted, and prefers solitude' : '조용하고 내향적이며 혼자 있는 것을 선호',
    color: 'from-orange-500 to-amber-500',
  },
  agreeableness: {
    name: isEnglish ? 'Agreeableness' : '원만성',
    nameEn: 'Agreeableness', icon: Users,
    description: isEnglish ? 'Attitude of tolerance and cooperation' : '관용과 협력의 태도',
    highTrait: isEnglish ? 'Forgiving, cooperative, and good at compromise' : '용서를 잘하고 협조적이며 타협을 잘함',
    lowTrait: isEnglish ? 'Critical, stubborn, and strongly assertive' : '비판적이고 완고하며 자기주장이 강함',
    color: 'from-green-500 to-emerald-500',
  },
  conscientiousness: {
    name: isEnglish ? 'Conscientiousness' : '성실성',
    nameEn: 'Conscientiousness', icon: Target,
    description: isEnglish ? 'Level of organization and diligence' : '조직화와 근면성의 정도',
    highTrait: isEnglish ? 'Organized, responsible, and perfectionist' : '조직적이고 책임감이 강하며 완벽주의적',
    lowTrait: isEnglish ? 'Spontaneous, flexible, and laid-back' : '즉흥적이고 유연하며 편안한 태도',
    color: 'from-purple-500 to-violet-500',
  },
  openness: {
    name: isEnglish ? 'Openness' : '개방성',
    nameEn: 'Openness to Experience', icon: Lightbulb,
    description: isEnglish ? 'Openness to novelty and creativity' : '새로움에 대한 개방성과 창의성',
    highTrait: isEnglish ? 'Creative, curious, and artistically inclined' : '창의적이고 호기심이 많으며 예술적 감각이 뛰어남',
    lowTrait: isEnglish ? 'Traditional, practical, and prefers the familiar' : '전통적이고 실용적이며 익숙한 것을 선호',
    color: 'from-indigo-500 to-blue-500',
  },
});

export const HexacoResult: React.FC<HexacoResultProps> = ({ result, onBack }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isEnglish } = useLanguage();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const dimensionInfo = getDimensionInfo(isEnglish);

  useAutoSaveTestResult({
    testType: 'HEXACO 성격검사',
    results: { categoryScores: result.categoryScores, totalScore: result.totalScore },
    analysis: result.analysis,
    severity: isEnglish ? 'Normal' : '보통',
    ageGroup: 'adult',
  });

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await downloadResultAsPDF('hexaco-result', isEnglish ? 'Personality_Compass_Result.pdf' : '퍼스널리티_컴퍼스_결과.pdf');
      toast({ title: isEnglish ? "PDF Downloaded" : "PDF 다운로드 완료", description: isEnglish ? "Results saved as PDF." : "검사 결과가 PDF로 저장되었습니다." });
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast({ title: isEnglish ? "PDF Generation Failed" : "PDF 생성 실패", description: isEnglish ? "Please try again later." : "잠시 후 다시 시도해주세요.", variant: "destructive" });
    } finally { setIsGeneratingPDF(false); }
  };

  const getScoreLevel = (score: number) => {
    if (isEnglish) {
      if (score >= 70) return { level: 'Very High', color: 'text-blue-600 dark:text-blue-400' };
      if (score >= 55) return { level: 'High', color: 'text-green-600 dark:text-green-400' };
      if (score >= 45) return { level: 'Average', color: 'text-yellow-600 dark:text-yellow-400' };
      if (score >= 30) return { level: 'Low', color: 'text-orange-600 dark:text-orange-400' };
      return { level: 'Very Low', color: 'text-red-600 dark:text-red-400' };
    }
    if (score >= 70) return { level: '매우 높음', color: 'text-blue-600 dark:text-blue-400' };
    if (score >= 55) return { level: '높음', color: 'text-green-600 dark:text-green-400' };
    if (score >= 45) return { level: '보통', color: 'text-yellow-600 dark:text-yellow-400' };
    if (score >= 30) return { level: '낮음', color: 'text-orange-600 dark:text-orange-400' };
    return { level: '매우 낮음', color: 'text-red-600 dark:text-red-400' };
  };

  const sortedDimensions = Object.entries(result.categoryScores).sort(([, a], [, b]) => b - a);

  return (
    <div id="hexaco-result" className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 p-4">
      <div className="max-w-5xl mx-auto py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-full mb-4">
            <Crown className="w-5 h-5" />
            <span className="font-bold">{isEnglish ? 'Premium Analysis Complete' : '프리미엄 분석 완료'}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {isEnglish ? 'Your Personality Profile' : '당신의 성격 프로필'}
          </h1>
          <p className="text-muted-foreground">
            {isEnglish ? '6-Dimension personality trait analysis results' : '6차원 성격 특성 분석 결과입니다'}
          </p>
        </div>

        <Card className="p-8 mb-6 text-center border-2 border-indigo-200 dark:border-indigo-800">
          <div className="mb-4"><Brain className="w-16 h-16 mx-auto text-indigo-600 dark:text-indigo-400" /></div>
          <h2 className="text-2xl font-bold mb-2">{isEnglish ? 'Overall Personality Index' : '종합 성격 지수'}</h2>
          <div className="text-6xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{result.totalScore}</div>
          <p className="text-muted-foreground">
            {result.totalScore >= 60 
              ? (isEnglish ? 'High social adaptability' : '높은 사회적 적응성')
              : result.totalScore >= 40 
                ? (isEnglish ? 'Balanced personality traits' : '균형잡힌 성격 특성')
                : (isEnglish ? 'Independent disposition' : '독립적인 성향')}
          </p>
        </Card>

        <Card className="p-8 mb-6 border-2 border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-2xl font-bold">{isEnglish ? '6-Dimension Analysis' : '6차원 성격 분석'}</h2>
          </div>
          <div className="space-y-6">
            {sortedDimensions.map(([dimension, score]) => {
              const info = dimensionInfo[dimension];
              if (!info) return null;
              const Icon = info.icon;
              const scoreLevel = getScoreLevel(score);
              return (
                <div key={dimension} className="relative">
                  <div className="flex items-start gap-4 mb-3">
                    <div className={`p-3 bg-gradient-to-br ${info.color} rounded-xl`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold">{info.name}</h3>
                          <p className="text-sm text-muted-foreground">{info.nameEn}</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${scoreLevel.color}`}>{score}</div>
                          <div className="text-sm text-muted-foreground">{scoreLevel.level}</div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{info.description}</p>
                      <div className="grid md:grid-cols-2 gap-3 mb-3">
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
                            {isEnglish ? 'High Score Traits' : '높은 점수 특성'}
                          </p>
                          <p className="text-xs text-blue-800 dark:text-blue-200">{info.highTrait}</p>
                        </div>
                        <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                          <p className="text-xs font-semibold text-orange-900 dark:text-orange-100 mb-1">
                            {isEnglish ? 'Low Score Traits' : '낮은 점수 특성'}
                          </p>
                          <p className="text-xs text-orange-800 dark:text-orange-200">{info.lowTrait}</p>
                        </div>
                      </div>
                      <Progress value={score} className="h-3" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-8 mb-6 border-2 border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-2xl font-bold">{isEnglish ? 'Key Personality Traits' : '핵심 성격 특성'}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {sortedDimensions.slice(0, 3).map(([dimension, score]) => {
              const info = dimensionInfo[dimension];
              if (!info) return null;
              const Icon = info.icon;
              return (
                <div key={dimension} className={`p-6 bg-gradient-to-br ${info.color} rounded-xl text-white`}>
                  <Icon className="w-8 h-8 mb-3" />
                  <h3 className="font-bold text-lg mb-2">{info.name}</h3>
                  <div className="text-3xl font-bold mb-2">{score}</div>
                  <p className="text-sm opacity-90">{score >= 50 ? info.highTrait : info.lowTrait}</p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-8 mb-6 border-2 border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-2xl font-bold">{isEnglish ? 'AI Expert Analysis' : 'AI 전문가 심층 분석'}</h2>
          </div>
          <div className="prose dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-foreground leading-relaxed">{result.analysis}</div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={onBack} variant="outline" className="gap-2" size="lg">
            <ArrowLeft className="w-5 h-5" />{isEnglish ? 'Back' : '뒤로가기'}
          </Button>
          <Button onClick={() => navigate('/')} variant="outline" className="gap-2" size="lg">
            <Home className="w-5 h-5" />{isEnglish ? 'Home' : '홈으로'}
          </Button>
          <Button onClick={handleDownloadPDF} disabled={isGeneratingPDF} variant="outline" className="gap-2" size="lg">
            <Download className="w-5 h-5" />
            {isGeneratingPDF ? (isEnglish ? 'Generating...' : 'PDF 생성 중...') : (isEnglish ? 'Download PDF' : 'PDF 다운로드')}
          </Button>
          <Button onClick={() => navigate('/premium-assessment')} className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" size="lg">
            <Crown className="w-5 h-5" />{isEnglish ? 'Take Another Test' : '다른 테스트 하기'}
          </Button>
        </div>
      </div>
    </div>
  );
};
