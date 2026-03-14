import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Shield, Brain, Heart, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import AnalysisLoadingScreen from './AnalysisLoadingScreen';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Question {
  id: number;
  text: string;
  category: 'projection' | 'denial' | 'rationalization' | 'displacement' | 'regression' | 'sublimation' | 'repression' | 'reaction_formation';
}

const questions: Question[] = [
  // Projection (투사)
  { id: 1, text: "다른 사람들이 나를 비판한다고 느낄 때가 많다", category: 'projection' },
  { id: 2, text: "내가 느끼는 부정적인 감정을 다른 사람이 먼저 느꼈을 거라고 생각한다", category: 'projection' },
  { id: 3, text: "내 단점을 다른 사람에게서 발견하면 유난히 신경 쓰인다", category: 'projection' },
  
  // Denial (부정)
  { id: 4, text: "힘든 일이 생기면 '별일 아니야'라고 생각하며 넘어간다", category: 'denial' },
  { id: 5, text: "내게 문제가 있다는 말을 들어도 쉽게 받아들이지 못한다", category: 'denial' },
  { id: 6, text: "불편한 진실은 애써 생각하지 않으려 노력한다", category: 'denial' },
  
  // Rationalization (합리화)
  { id: 7, text: "실패했을 때 그럴 만한 이유를 찾아 설명하는 편이다", category: 'rationalization' },
  { id: 8, text: "내가 원하지 않는 결과가 나왔을 때 '원래 그런 거야'라고 생각한다", category: 'rationalization' },
  { id: 9, text: "나쁜 선택을 한 후에도 그것이 최선이었다고 스스로를 설득한다", category: 'rationalization' },
  
  // Displacement (전위)
  { id: 10, text: "화가 났을 때 원인이 된 사람이 아닌 다른 대상에게 화풀이한다", category: 'displacement' },
  { id: 11, text: "직장에서 받은 스트레스를 집에서 가족에게 푼다", category: 'displacement' },
  { id: 12, text: "억울한 상황에서 약한 대상에게 감정을 표출한 적이 있다", category: 'displacement' },
  
  // Regression (퇴행)
  { id: 13, text: "스트레스를 받으면 어린아이처럼 행동하고 싶어진다", category: 'regression' },
  { id: 14, text: "힘들 때 누군가 나를 돌봐주길 바란다", category: 'regression' },
  { id: 15, text: "어려운 결정 앞에서 도망치고 싶은 마음이 든다", category: 'regression' },
  
  // Sublimation (승화)
  { id: 16, text: "부정적인 감정을 창조적인 활동으로 표현한다", category: 'sublimation' },
  { id: 17, text: "분노나 슬픔을 운동이나 예술로 풀어낸다", category: 'sublimation' },
  { id: 18, text: "힘든 경험을 다른 사람을 돕는 데 활용한다", category: 'sublimation' },
  
  // Repression (억압)
  { id: 19, text: "불편한 기억은 자연스럽게 잊혀진다", category: 'repression' },
  { id: 20, text: "트라우마적 경험에 대한 기억이 희미하다", category: 'repression' },
  { id: 21, text: "과거의 고통스러운 일들이 잘 떠오르지 않는다", category: 'repression' },
  
  // Reaction Formation (반동형성)
  { id: 22, text: "싫어하는 사람에게 오히려 더 친절하게 대한다", category: 'reaction_formation' },
  { id: 23, text: "두려운 것에 대해 과도하게 용감한 척한다", category: 'reaction_formation' },
  { id: 24, text: "원하는 것을 얻지 못했을 때 '원하지도 않았어'라고 말한다", category: 'reaction_formation' },
];

interface DefenseMechanismTestProps {
  onComplete: (result: any) => void;
  onBack?: () => void;
}

export const DefenseMechanismTest: React.FC<DefenseMechanismTestProps> = ({ onComplete, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (score: number) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: score };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      analyzeResults(newAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const analyzeResults = async (finalAnswers: Record<number, number>) => {
    setIsAnalyzing(true);

    try {
      // 카테고리별 점수 계산
      const categoryScores: Record<string, number> = {
        projection: 0,
        denial: 0,
        rationalization: 0,
        displacement: 0,
        regression: 0,
        sublimation: 0,
        repression: 0,
        reaction_formation: 0,
      };

      const categoryCounts: Record<string, number> = {
        projection: 0,
        denial: 0,
        rationalization: 0,
        displacement: 0,
        regression: 0,
        sublimation: 0,
        repression: 0,
        reaction_formation: 0,
      };

      questions.forEach((q) => {
        const score = finalAnswers[q.id] || 0;
        categoryScores[q.category] += score;
        categoryCounts[q.category]++;
      });

      // 평균 점수 계산 (0-100% 정규화)
      const averageScores: Record<string, number> = {};
      Object.keys(categoryScores).forEach((category) => {
        // 각 카테고리의 평균 점수를 구하고 0-100 범위로 정규화 (최대값 5점)
        const avgScore = categoryScores[category] / categoryCounts[category];
        averageScores[category] = Math.round((avgScore / 5) * 100);
      });

      // 주요 방어기제 찾기 (상위 3개)
      const sortedMechanisms = Object.entries(averageScores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

      // AI 분석 요청
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'analyze-defense-mechanism',
        {
          body: {
            categoryScores: averageScores,
            primaryMechanisms: sortedMechanisms.map(([name]) => name),
            answers: finalAnswers,
          },
        }
      );

      if (analysisError) throw analysisError;

      const result = {
        testType: 'defense-mechanism',
        categoryScores: averageScores,
        primaryMechanisms: sortedMechanisms,
        analysis: analysisData.analysis,
        totalScore: Math.round(
          Object.values(averageScores).reduce((a, b) => a + b, 0) / 8
        ),
        completedAt: new Date().toISOString(),
      };

      // 결과 저장
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Save to test_results table if it exists
        try {
          await supabase.from('test_results').insert({
            user_id: user.id,
            test_type_id: 'defense-mechanism',
            scores: result,
          });
        } catch (err) {
          console.log('Could not save to test_results:', err);
        }
      }

      onComplete(result);
      toast.success('분석이 완료되었습니다!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return <AnalysisLoadingScreen testName="방어기제" estimatedSeconds={25} />;
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full mb-4">
            <Shield className="w-5 h-5" />
            <span className="font-bold">방어기제 분석</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            나의 심리 방어기제 이해하기
          </h1>
          <p className="text-muted-foreground">
            무의식적으로 사용하는 방어기제를 발견하고 건강한 대처법을 찾아보세요
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              질문 {currentQuestion + 1} / {questions.length}
            </span>
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="p-8 mb-6 shadow-xl border-2 border-purple-200 dark:border-purple-800">
          <div className="mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl">
                <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-bold text-foreground leading-relaxed">
                  {question.text}
                </h3>
              </div>
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {[
              { label: '전혀 그렇지 않다', score: 1, color: 'from-gray-400 to-gray-500' },
              { label: '그렇지 않다', score: 2, color: 'from-blue-400 to-blue-500' },
              { label: '보통이다', score: 3, color: 'from-yellow-400 to-yellow-500' },
              { label: '그렇다', score: 4, color: 'from-orange-400 to-orange-500' },
              { label: '매우 그렇다', score: 5, color: 'from-red-400 to-red-500' },
            ].map((option) => (
              <Button
                key={option.score}
                onClick={() => handleAnswer(option.score)}
                className={`w-full h-14 text-lg font-semibold bg-gradient-to-r ${option.color} hover:opacity-90 text-white border-0 shadow-md transition-all hover:scale-105`}
                variant="outline"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          {currentQuestion === 0 && onBack ? (
            <Button
              onClick={onBack}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              3분 테스트
            </Button>
          ) : (
            <Button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              이전
            </Button>
          )}

          <div className="text-sm text-muted-foreground">
            {currentQuestion === questions.length - 1 ? '마지막 질문입니다' : '답변을 선택해주세요'}
          </div>

          <div className="w-20"></div>
        </div>
      </div>
    </div>
  );
};
