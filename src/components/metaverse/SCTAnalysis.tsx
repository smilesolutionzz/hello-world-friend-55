import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  SCT_QUESTIONS, 
  analyzeSCTResponse, 
  analyzeSCTResults,
  type SCTAgeGroup,
  type SCTResponse 
} from '@/utils/SCTQuestions';
import { SCTVisualization } from './SCTVisualization';
import { ArrowRight, CheckCircle, Sparkles, Download, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SCTAnalysisProps {
  ageGroup: SCTAgeGroup;
  onComplete: (results: any) => void;
  onMessage: (message: string, isUser: boolean) => void;
}

export const SCTAnalysis = ({ ageGroup, onComplete, onMessage }: SCTAnalysisProps) => {
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<SCTResponse[]>([]);
  const [currentCompletion, setCurrentCompletion] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const questions = SCT_QUESTIONS[ageGroup];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const ageGroupLabels: Record<SCTAgeGroup, string> = {
    infant: '유아',
    teen: '청소년',
    adult: '성인',
    parent: '부모',
    senior: '노인'
  };

  useEffect(() => {
    // 시작 메시지
    const welcomeMessage = `안녕하세요! ${ageGroupLabels[ageGroup]} SCT 검사를 시작합니다. 제시된 문장을 보고 떠오르는 대로 자유롭게 완성해주세요. 정답은 없으며, 솔직하게 답변하는 것이 가장 중요합니다.`;
    onMessage(welcomeMessage, false);
    
    setTimeout(() => {
      onMessage(currentQuestion.stem, false);
    }, 1000);
  }, []);

  const handleSubmit = () => {
    if (!currentCompletion.trim()) {
      toast({
        title: "답변을 입력해주세요",
        variant: "destructive"
      });
      return;
    }

    // 사용자 답변 표시
    onMessage(`${currentQuestion.stem} ${currentCompletion}`, true);

    // 답변 분석
    const analysis = analyzeSCTResponse(currentQuestion, currentCompletion);
    
    const newResponse: SCTResponse = {
      questionId: currentQuestion.id,
      stem: currentQuestion.stem,
      completion: currentCompletion,
      category: currentQuestion.category,
      sentiment: analysis.sentiment,
      score: analysis.score,
      keywords: analysis.keywords,
      timestamp: new Date()
    };

    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    // AI 반응
    setTimeout(() => {
      const reactions = [
        '네, 잘 들었습니다.',
        '답변해주셔서 감사합니다.',
        '소중한 이야기네요.',
        '잘 이해했습니다.',
        '계속해서 편하게 답변해주세요.'
      ];
      const reaction = reactions[Math.floor(Math.random() * reactions.length)];
      onMessage(reaction, false);

      // 우려되는 답변에 대한 추가 반응
      if (analysis.sentiment === 'concern') {
        setTimeout(() => {
          onMessage('힘든 상황인 것 같네요. 혼자 고민하지 마시고 전문가의 도움을 받는 것도 좋습니다.', false);
        }, 1500);
      }
    }, 800);

    setCurrentCompletion('');

    // 다음 질문 또는 완료
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        onMessage(questions[currentQuestionIndex + 1].stem, false);
      }, analysis.sentiment === 'concern' ? 3000 : 1500);
    } else {
      // 검사 완료
      completeAnalysis(updatedResponses);
    }
  };

  const completeAnalysis = async (finalResponses: SCTResponse[]) => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      onMessage('모든 문항에 답변해주셔서 감사합니다. 이제 결과를 분석하겠습니다.', false);
    }, 1000);

    // 결과 분석
    setTimeout(() => {
      const analysisResults = analyzeSCTResults(finalResponses);
      setResults(analysisResults);
      
      // 마이데이터에 저장
      saveToDatabase(analysisResults, finalResponses);
      
      // 결과 메시지
      setTimeout(() => {
        let message = '';
        switch (analysisResults.severity) {
          case 'critical':
            message = '분석 결과, 즉시 전문가의 도움이 필요한 상황입니다. 정신건강위기상담전화 1577-0199로 연락하시거나 가까운 정신건강복지센터를 방문해주세요.';
            break;
          case 'high':
            message = '일부 영역에서 어려움이 감지되었습니다. 전문가 상담을 통해 도움을 받으시길 권장합니다.';
            break;
          case 'medium':
            message = '전반적으로 안정적이지만, 일부 주의가 필요한 영역이 있습니다. 지속적인 관심과 대화가 도움이 될 것입니다.';
            break;
          case 'low':
            message = '건강한 심리 상태를 유지하고 계십니다. 현재의 긍정적인 환경을 계속 유지해주세요.';
            break;
        }
        onMessage(message, false);
      }, 2000);

      setTimeout(() => {
        onMessage('상세한 분석 결과를 확인하실 수 있습니다.', false);
        setShowResults(true);
        setIsAnalyzing(false);
      }, 3500);

      onComplete({
        ...analysisResults,
        responses: finalResponses,
        ageGroup,
        timestamp: new Date()
      });
    }, 2000);
  };

  const saveToDatabase = async (analysisResults: any, finalResponses: SCTResponse[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase.from('ai_health_insights').insert({
          user_id: user.id,
          insight_type: 'sct_analysis',
          content: JSON.stringify({
            ageGroup,
            severity: analysisResults.severity,
            averageScore: analysisResults.averageScore,
            categoryAverages: analysisResults.categoryAverages,
            sentimentDistribution: analysisResults.sentimentDistribution,
            topKeywords: analysisResults.topKeywords,
            responsesCount: finalResponses.length,
            concernCount: analysisResults.concernResponses.length
          }),
          confidence_score: analysisResults.severity === 'critical' ? 95 : 
                           analysisResults.severity === 'high' ? 85 :
                           analysisResults.severity === 'medium' ? 70 : 60
        });
        
        if (error) {
          console.error('Error saving SCT result:', error);
        } else {
          toast({
            title: "결과 저장 완료",
            description: "마이데이터에 검사 결과가 저장되었습니다",
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDownloadResults = () => {
    if (!results) return;

    const text = `
SCT 분석 결과
날짜: ${new Date().toLocaleString('ko-KR')}
연령대: ${ageGroupLabels[ageGroup]}

=== 종합 점수 ===
평균 점수: ${results.averageScore.toFixed(1)} / 10
심각도: ${results.severity}
총 응답: ${results.totalResponses}개
우려 응답: ${results.concernResponses.length}개

=== 감정 분포 ===
긍정: ${results.sentimentDistribution.positive}개
부정: ${results.sentimentDistribution.negative}개
중립: ${results.sentimentDistribution.neutral}개
우려: ${results.sentimentDistribution.concern}개

=== 영역별 점수 ===
${results.categoryAverages.map((cat: any) => 
  `${cat.category}: ${cat.average.toFixed(1)}점`
).join('\n')}

=== 주요 키워드 ===
${results.topKeywords.map((kw: any) => 
  `${kw.keyword} (${kw.count}회)`
).join(', ')}

=== 상세 응답 ===
${responses.map((r, i) => 
  `${i + 1}. ${r.stem} ${r.completion}\n   [${r.sentiment}] 점수: ${r.score}`
).join('\n\n')}
`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SCT분석_${ageGroupLabels[ageGroup]}_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (showResults && results) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold">검사 완료</h3>
            <Button onClick={handleDownloadResults} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              결과 다운로드
            </Button>
          </div>
        </Card>
        
        <SCTVisualization results={results} ageGroup={ageGroup} />
      </div>
    );
  }

  return (
    <Card className="p-6 space-y-4 bg-background/95 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">SCT 문장완성검사</h3>
          <p className="text-sm text-muted-foreground">{ageGroupLabels[ageGroup]} 전용</p>
        </div>
        <Badge variant="outline">
          {currentQuestionIndex + 1} / {questions.length}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">진행률</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {!isAnalyzing && currentQuestion && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-2">
            <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-3 flex-1">
              <p className="font-medium text-lg text-primary">
                {currentQuestion.stem}
              </p>
              <textarea
                value={currentCompletion}
                onChange={(e) => setCurrentCompletion(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="떠오르는 대로 자유롭게 완성해주세요..."
                className="w-full p-3 rounded-lg border bg-background min-h-[80px] resize-none focus:ring-2 focus:ring-primary"
                disabled={isAnalyzing}
                autoFocus
              />
              <div className="text-xs text-muted-foreground">
                💡 Tip: 정답은 없습니다. 가장 먼저 떠오르는 생각을 솔직하게 적어주세요.
              </div>
            </div>
          </div>
        </Card>
      )}

      {isAnalyzing && (
        <Card className="p-6 text-center">
          <div className="animate-pulse space-y-3">
            <Sparkles className="w-12 h-12 text-primary mx-auto" />
            <p className="font-medium">답변을 분석하고 있습니다...</p>
            <p className="text-sm text-muted-foreground">잠시만 기다려주세요</p>
          </div>
        </Card>
      )}

      {!isAnalyzing && (
        <Button
          onClick={handleSubmit}
          disabled={!currentCompletion.trim() || isAnalyzing}
          className="w-full"
          size="lg"
        >
          {currentQuestionIndex < questions.length - 1 ? (
            <>
              다음 문항
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              검사 완료
              <CheckCircle className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      )}

      {responses.length > 0 && !isAnalyzing && (
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">
            완료된 문항: {responses.length}개
          </p>
          <div className="flex gap-1">
            {responses.map((r, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full ${
                  r.sentiment === 'concern' ? 'bg-destructive' :
                  r.sentiment === 'negative' ? 'bg-orange-500' :
                  r.sentiment === 'positive' ? 'bg-green-500' :
                  'bg-muted'
                }`}
                title={`${r.stem} - ${r.sentiment}`}
              />
            ))}
            {Array.from({ length: questions.length - responses.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="h-2 flex-1 rounded-full bg-muted/30"
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
