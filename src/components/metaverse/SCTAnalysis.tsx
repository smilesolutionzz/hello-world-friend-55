import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { SCT_QUESTIONS, analyzeSCTResponses, SCTAgeGroup, SCTAnalysisResult } from '@/utils/SCTQuestions';
import { SCTVisualization } from './SCTVisualization';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, ArrowLeft, Download, Save } from 'lucide-react';

interface SCTAnalysisProps {
  ageGroup: SCTAgeGroup;
  onComplete?: () => void;
}

export const SCTAnalysis: React.FC<SCTAnalysisProps> = ({ ageGroup, onComplete }) => {
  const questions = SCT_QUESTIONS[ageGroup];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [analysisResult, setAnalysisResult] = useState<SCTAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const currentResponse = responses[currentQuestion.id] || '';

  const handleResponseChange = (value: string) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    if (!currentResponse.trim()) {
      toast.error('답변을 입력해주세요');
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsAnalyzing(true);
    
    try {
      const responseArray = questions.map(q => ({
        questionId: q.id,
        response: responses[q.id] || '',
      }));

      const result = analyzeSCTResponses(ageGroup, responseArray);
      setAnalysisResult(result);
      
      toast.success('심층 분석이 완료되었습니다!');
    } catch (error) {
      console.error('분석 오류:', error);
      toast.error('분석 중 오류가 발생했습니다');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!analysisResult) return;

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('로그인이 필요합니다');
        return;
      }

      const { error } = await supabase
        .from('ai_health_insights')
        .insert({
          user_id: user.id,
          insight_type: 'sct_deep_analysis',
          content: JSON.stringify(analysisResult),
          confidence_score: analysisResult.overallScore,
        });

      if (error) throw error;

      toast.success('분석 결과가 저장되었습니다');
    } catch (error) {
      console.error('저장 오류:', error);
      toast.error('저장 중 오류가 발생했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadText = () => {
    if (!analysisResult) return;

    const text = `
SCT 심층 분석 결과
==================

연령 그룹: ${ageGroup}
분석 일시: ${analysisResult.timestamp.toLocaleString('ko-KR')}
종합 점수: ${analysisResult.overallScore}/100

대상관계이론 분석
-----------------
자기 표상 (${analysisResult.objectRelations.selfRepresentation.score}점):
${analysisResult.objectRelations.selfRepresentation.description}
패턴: ${analysisResult.objectRelations.selfRepresentation.patterns.join(', ')}

대상 표상 (${analysisResult.objectRelations.objectRepresentation.score}점):
${analysisResult.objectRelations.objectRepresentation.description}
- 어머니: ${analysisResult.objectRelations.objectRepresentation.parentalFigures.mother}
- 아버지: ${analysisResult.objectRelations.objectRepresentation.parentalFigures.father}

분리-개별화:
${analysisResult.objectRelations.separationIndividuation.stage}
과제: ${analysisResult.objectRelations.separationIndividuation.challenges.join(', ')}

방어기제:
${analysisResult.objectRelations.defenseMechanisms.map(d => `- ${d.type}: ${d.description}`).join('\n')}

애착이론 분석
-------------
주요 애착 유형: ${analysisResult.attachment.primaryStyle}

애착 점수:
- 안정: ${analysisResult.attachment.styleScores.secure}
- 불안: ${analysisResult.attachment.styleScores.anxious}
- 회피: ${analysisResult.attachment.styleScores.avoidant}
- 혼란: ${analysisResult.attachment.styleScores.disorganized}

내적 작동 모델:
- 자기 관점: ${analysisResult.attachment.internalWorkingModel.selfView}
- 타인 관점: ${analysisResult.attachment.internalWorkingModel.othersView}
- 관계 기대: ${analysisResult.attachment.internalWorkingModel.relationshipExpectations}

정서 조절 (${analysisResult.attachment.emotionalRegulation.score}점):
- 강점: ${analysisResult.attachment.emotionalRegulation.strengths.join(', ')}
- 과제: ${analysisResult.attachment.emotionalRegulation.challenges.join(', ')}

결핍 및 욕구 분석
-----------------
미충족 욕구:
${analysisResult.needsAnalysis.unmetNeeds.map(n => `- ${n.need} (심각도: ${n.severity}/10)\n  나타나는 양상: ${n.manifestations.join(', ')}`).join('\n')}

보상적 행동 패턴:
${analysisResult.needsAnalysis.compensatoryBehaviors.map(b => `- ${b}`).join('\n')}

핵심 신념:
${analysisResult.needsAnalysis.coreBeliefs.map(b => `- ${b}`).join('\n')}

극복 방법 및 성장 전략
---------------------
주요 초점: ${analysisResult.therapeuticRecommendations.primaryFocus}

치료적 개입:
${analysisResult.therapeuticRecommendations.interventions.map(i => `
${i.area}
전략: ${i.strategy}
실천 방법:
${i.practices.map(p => `  - ${p}`).join('\n')}
`).join('\n')}

강점:
${analysisResult.therapeuticRecommendations.strengths.map(s => `- ${s}`).join('\n')}

성장 잠재력:
${analysisResult.therapeuticRecommendations.growthPotential}

응답 내역
---------
${analysisResult.responses.map((r, idx) => `${idx + 1}. ${r.stem}\n   → ${r.response}`).join('\n\n')}
    `.trim();

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SCT분석결과_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('분석 결과를 다운로드했습니다');
  };

  if (analysisResult) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            SCT 심층 분석 결과
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={handleSaveToDatabase}
              disabled={isSaving}
              size="sm"
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? '저장 중...' : '저장'}
            </Button>
            <Button
              onClick={handleDownloadText}
              size="sm"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              다운로드
            </Button>
          </div>
        </div>
        
        <SCTVisualization result={analysisResult} />
        
        {onComplete && (
          <div className="flex justify-center mt-6">
            <Button onClick={onComplete} variant="outline">
              완료
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <Card className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 p-8 max-w-2xl w-full">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto" />
          <p className="text-lg text-foreground">심층 분석 중입니다...</p>
          <p className="text-sm text-muted-foreground">
            대상관계이론과 애착이론을 기반으로 당신의 내면을 분석하고 있습니다
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>질문 {currentQuestionIndex + 1} / {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 p-8">
        <div className="space-y-6">
          <div>
            <p className="text-xs text-purple-400 mb-2">
              {currentQuestion.category === 'self' && '자기 이해'}
              {currentQuestion.category === 'mother' && '어머니'}
              {currentQuestion.category === 'father' && '아버지'}
              {currentQuestion.category === 'family' && '가족'}
              {currentQuestion.category === 'peer' && '또래/관계'}
              {currentQuestion.category === 'authority' && '권위자'}
              {currentQuestion.category === 'fear' && '두려움'}
              {currentQuestion.category === 'desire' && '욕구'}
              {currentQuestion.category === 'past' && '과거'}
              {currentQuestion.category === 'future' && '미래'}
            </p>
            <h3 className="text-2xl font-bold text-foreground">
              {currentQuestion.stem}
            </h3>
          </div>

          <Textarea
            value={currentResponse}
            onChange={(e) => handleResponseChange(e.target.value)}
            placeholder="이어지는 내용을 자유롭게 작성해주세요..."
            className="min-h-[150px] bg-slate-800/50 border-purple-500/30 text-foreground resize-none"
            autoFocus
          />

          <div className="flex justify-between gap-4">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="w-32"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              이전
            </Button>

            <Button
              onClick={handleNext}
              disabled={!currentResponse.trim()}
              className="w-32 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {currentQuestionIndex === questions.length - 1 ? '완료' : '다음'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Info */}
      <Card className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 p-4">
        <p className="text-xs text-muted-foreground text-center">
          💡 떠오르는 대로 솔직하게 답변해주세요. 정답이 없으며, 모든 답변은 안전하게 보호됩니다.
        </p>
      </Card>
    </div>
  );
};
