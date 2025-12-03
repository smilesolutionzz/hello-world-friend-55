import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Shield, Brain, Heart, Sparkles, Home, TrendingUp, Download, ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { TextToSpeechButton } from '@/components/audio/TextToSpeechButton';
import { useToast } from '@/hooks/use-toast';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { PDFHeader } from '@/components/common/PDFHeader';

interface DefenseMechanismResultProps {
  result: {
    categoryScores: Record<string, number>;
    primaryMechanisms: [string, number][];
    analysis: string;
    totalScore: number;
  };
  onBack?: () => void;
}

const mechanismInfo: Record<string, { name: string; emoji: string; description: string; healthyTip: string }> = {
  projection: {
    name: '투사',
    emoji: '🔄',
    description: '자신의 감정이나 생각을 다른 사람에게 돌리는 경향',
    healthyTip: '내 감정을 인정하고 소유하는 연습이 필요합니다',
  },
  denial: {
    name: '부정',
    emoji: '🙈',
    description: '불편한 현실을 받아들이지 않으려는 경향',
    healthyTip: '작은 것부터 천천히 현실을 직면하는 용기가 필요합니다',
  },
  rationalization: {
    name: '합리화',
    emoji: '🤔',
    description: '불편한 행동이나 선택을 논리적으로 정당화하는 경향',
    healthyTip: '진짜 감정과 논리적 설명을 구분하는 연습이 도움됩니다',
  },
  displacement: {
    name: '전위',
    emoji: '➡️',
    description: '감정을 원래 대상이 아닌 다른 곳에 표출하는 경향',
    healthyTip: '감정을 적절한 대상에게 건강하게 표현하는 방법을 배워보세요',
  },
  regression: {
    name: '퇴행',
    emoji: '👶',
    description: '스트레스 상황에서 어린 시절 행동으로 돌아가는 경향',
    healthyTip: '성숙한 대처 방식을 개발하고 자기 돌봄을 실천해보세요',
  },
  sublimation: {
    name: '승화',
    emoji: '✨',
    description: '부정적 에너지를 긍정적이고 창조적인 활동으로 전환',
    healthyTip: '가장 건강한 방어기제! 계속 발전시켜 나가세요',
  },
  repression: {
    name: '억압',
    emoji: '🔒',
    description: '불편한 기억이나 감정을 무의식으로 밀어내는 경향',
    healthyTip: '안전한 환경에서 억압된 감정을 천천히 풀어보세요',
  },
  reaction_formation: {
    name: '반동형성',
    emoji: '🔄',
    description: '진짜 감정과 반대되는 행동을 보이는 경향',
    healthyTip: '진짜 감정을 인정하고 진실되게 표현하는 연습이 필요합니다',
  },
};

export const DefenseMechanismResult: React.FC<DefenseMechanismResultProps> = ({ result, onBack }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDownloadPDF = async () => {
    await downloadResultAsPDF(
      'defense-result-content',
      '방어기제_분석결과',
      () => {
        toast({
          title: "PDF 다운로드 완료",
          description: "방어기제 분석 결과가 저장되었습니다.",
        });
      },
      (error) => {
        toast({
          title: "다운로드 실패",
          description: error.message,
          variant: "destructive",
        });
      }
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600 dark:text-red-400';
    if (score >= 60) return 'text-orange-600 dark:text-orange-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 60) return 'bg-orange-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-4">
      <div id="defense-result-content" className="max-w-4xl mx-auto py-8">
        {/* PDF Header */}
        <PDFHeader testName="방어기제 분석 결과" />
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full mb-4">
            <Shield className="w-5 h-5" />
            <span className="font-bold">분석 완료</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            당신의 방어기제 프로필
          </h1>
          <p className="text-muted-foreground">
            무의식적 심리 패턴을 이해하고 건강한 성장의 기회로 만들어보세요
          </p>
        </div>

        {/* Overall Score */}
        <Card className="p-8 mb-6 text-center border-2 border-purple-200 dark:border-purple-800">
          <div className="mb-4">
            <Brain className="w-16 h-16 mx-auto text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">종합 방어기제 지수</h2>
          <div className="text-6xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {result.totalScore}
          </div>
          <p className="text-muted-foreground">
            {result.totalScore >= 70 ? '높은 방어기제 사용' : 
             result.totalScore >= 50 ? '보통 수준의 방어기제' : 
             '건강한 대처 방식'}
          </p>
        </Card>

        {/* Primary Mechanisms */}
        <Card className="p-8 mb-6 border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h2 className="text-2xl font-bold">주요 방어기제 TOP 3</h2>
          </div>

          <div className="space-y-6">
            {result.primaryMechanisms.map(([mechanism, score], index) => {
              const info = mechanismInfo[mechanism];
              return (
                <div key={mechanism} className="relative">
                  <div className="flex items-start gap-4 mb-3">
                    <div className={`text-4xl ${index === 0 ? 'scale-110' : ''}`}>
                      {info.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold">
                          {index + 1}위: {info.name}
                        </h3>
                        <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                          {score}%
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-3">{info.description}</p>
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          💡 {info.healthyTip}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={score} 
                    className={`h-2 ${getProgressColor(score)}`}
                  />
                </div>
              );
            })}
          </div>
        </Card>

        {/* All Mechanisms Breakdown */}
        <Card className="p-8 mb-6 border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h2 className="text-2xl font-bold">전체 방어기제 분석</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(result.categoryScores)
              .sort(([, a], [, b]) => b - a)
              .map(([mechanism, score]) => {
                const info = mechanismInfo[mechanism];
                return (
                  <div key={mechanism} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{info.emoji}</span>
                        <span className="font-semibold">{info.name}</span>
                      </div>
                      <span className={`text-xl font-bold ${getScoreColor(score)}`}>
                        {score}%
                      </span>
                    </div>
                    <Progress value={score} className="h-1.5" />
                  </div>
                );
              })}
          </div>
        </Card>

        {/* AI Analysis */}
        <Card className="p-8 mb-6 border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h2 className="text-2xl font-bold">AI 심층 분석</h2>
            </div>
            <TextToSpeechButton 
              text={result.analysis} 
              className="ml-auto"
            />
          </div>
          
          <div className="prose dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-foreground leading-relaxed">
              {result.analysis}
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            className="gap-2"
            size="lg"
          >
            <Download className="w-5 h-5" />
            PDF 다운로드
          </Button>
          
          {onBack ? (
            <Button
              onClick={onBack}
              variant="outline"
              className="gap-2"
              size="lg"
            >
              <ArrowLeft className="w-5 h-5" />
              다시 테스트하기
            </Button>
          ) : (
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="gap-2"
              size="lg"
            >
              <Home className="w-5 h-5" />
              홈으로
            </Button>
          )}
          
          <Button
            onClick={() => navigate('/assessment')}
            className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            size="lg"
          >
            <Brain className="w-5 h-5" />
            다른 테스트 하기
          </Button>
        </div>
      </div>
    </div>
  );
};
