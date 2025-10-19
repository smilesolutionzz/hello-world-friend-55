import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, Brain, Heart, Sparkles, ArrowLeft, ArrowRight, 
  Star, Gem, Crown, Zap, Target, Lightbulb 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Question {
  id: number;
  text: string;
  category: 'honesty' | 'emotionality' | 'extraversion' | 'agreeableness' | 'conscientiousness' | 'openness';
  reverse?: boolean;
}

const questions: Question[] = [
  // Honesty (진실성)
  { id: 1, text: "내 실수를 인정하고 솔직하게 말하는 편이다", category: 'honesty' },
  { id: 2, text: "작은 성과도 크게 부풀려 이야기하고 싶은 유혹을 느낀다", category: 'honesty', reverse: true },
  { id: 3, text: "남들보다 더 나은 대우를 기대하는 것은 자연스럽다고 본다", category: 'honesty', reverse: true },
  { id: 4, text: "나보다 잘되는 사람을 보면 축하해주기 어렵다", category: 'honesty', reverse: true },
  { id: 5, text: "이득이 된다면 약간의 거짓말은 괜찮다고 생각한다", category: 'honesty', reverse: true },
  { id: 6, text: "돈보다 마음의 평화가 더 소중하다", category: 'honesty' },
  { id: 7, text: "내가 얼마나 대단한지 다른 사람들이 알아주길 바란다", category: 'honesty', reverse: true },
  { id: 8, text: "겸손함은 내가 추구하는 중요한 가치다", category: 'honesty' },

  // Emotionality (감성)
  { id: 9, text: "힘든 상황에서도 감정을 잘 다스릴 수 있다", category: 'emotionality', reverse: true },
  { id: 10, text: "다른 사람이 힘들어하는 모습을 보면 마음이 아프다", category: 'emotionality' },
  { id: 11, text: "사소한 문제에도 걱정이 많은 편이다", category: 'emotionality' },
  { id: 12, text: "친구나 가족에게 정서적 안정감을 주는 역할을 한다", category: 'emotionality' },
  { id: 13, text: "위협적인 순간에도 두렵지 않다", category: 'emotionality', reverse: true },
  { id: 14, text: "사람들과의 정서적 연결이 나에게 큰 힘이 된다", category: 'emotionality' },
  { id: 15, text: "기분 변화가 거의 없는 편이다", category: 'emotionality', reverse: true },
  { id: 16, text: "어려운 사람을 도울 때 진심으로 보람을 느낀다", category: 'emotionality' },

  // eXtraversion (사교성)
  { id: 17, text: "여러 사람과 함께 있으면 활기가 넘친다", category: 'extraversion' },
  { id: 18, text: "혼자만의 시간이 나에게 가장 편안하다", category: 'extraversion', reverse: true },
  { id: 19, text: "모임이나 행사에 참여하는 것이 즐겁다", category: 'extraversion' },
  { id: 20, text: "조용한 곳에서 혼자 지내는 것을 선호한다", category: 'extraversion', reverse: true },
  { id: 21, text: "새로운 사람들을 만나는 기회를 적극적으로 찾는다", category: 'extraversion' },
  { id: 22, text: "처음 보는 사람과 대화하는 것이 불편하다", category: 'extraversion', reverse: true },
  { id: 23, text: "관심의 중심에 서는 것을 좋아한다", category: 'extraversion' },
  { id: 24, text: "사람이 많은 곳에 있으면 지친다", category: 'extraversion', reverse: true },

  // Agreeableness (조화성)
  { id: 25, text: "상대방의 잘못을 쉽게 받아들이고 용서한다", category: 'agreeableness' },
  { id: 26, text: "누군가 나를 섭섭하게 했다면 오래 기억하는 편이다", category: 'agreeableness', reverse: true },
  { id: 27, text: "의견 차이가 있을 때 중간 지점을 찾는다", category: 'agreeableness' },
  { id: 28, text: "토론에서 내 주장을 끝까지 밀고 나간다", category: 'agreeableness', reverse: true },
  { id: 29, text: "상대방의 관점에서 생각하려고 노력한다", category: 'agreeableness' },
  { id: 30, text: "비난을 들으면 즉시 반박하고 싶어진다", category: 'agreeableness', reverse: true },
  { id: 31, text: "경쟁보다는 함께 협력하는 것이 좋다", category: 'agreeableness' },
  { id: 32, text: "다른 사람의 실수를 빠르게 지적하는 편이다", category: 'agreeableness', reverse: true },

  // Conscientiousness (계획성)
  { id: 33, text: "일을 시작하기 전에 구체적인 계획을 세운다", category: 'conscientiousness' },
  { id: 34, text: "기한을 지키는 것이 어려울 때가 많다", category: 'conscientiousness', reverse: true },
  { id: 35, text: "결과물의 완성도를 매우 중요하게 생각한다", category: 'conscientiousness' },
  { id: 36, text: "계획보다는 그때그때 상황에 맞춰 행동한다", category: 'conscientiousness', reverse: true },
  { id: 37, text: "장기적인 목표를 향해 꾸준히 노력한다", category: 'conscientiousness' },
  { id: 38, text: "주변을 깔끔하게 정리하는 것이 어렵다", category: 'conscientiousness', reverse: true },
  { id: 39, text: "맡은 일에 대한 책임감이 강하다", category: 'conscientiousness' },
  { id: 40, text: "해야 할 일을 나중으로 미루곤 한다", category: 'conscientiousness', reverse: true },

  // Openness to Experience (탐구성)
  { id: 41, text: "새로운 생각이나 시각을 접하는 것이 흥미롭다", category: 'openness' },
  { id: 42, text: "검증된 방법을 따르는 것이 안전하다고 생각한다", category: 'openness', reverse: true },
  { id: 43, text: "예술 작품이나 문화 활동에 관심이 많다", category: 'openness' },
  { id: 44, text: "실용적이지 않은 것은 가치가 적다고 본다", category: 'openness', reverse: true },
  { id: 45, text: "창의적인 상상을 하는 것을 즐긴다", category: 'openness' },
  { id: 46, text: "규칙적이고 예측 가능한 일상을 좋아한다", category: 'openness', reverse: true },
  { id: 47, text: "다른 문화와 사고방식을 이해하려 한다", category: 'openness' },
  { id: 48, text: "옛날 방식이 가장 확실하다고 생각한다", category: 'openness', reverse: true },
];

interface HexacoTestProps {
  onComplete: (result: any) => void;
  onBack: () => void;
}

export const HexacoTest: React.FC<HexacoTestProps> = ({ onComplete, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
        honesty: 0,
        emotionality: 0,
        extraversion: 0,
        agreeableness: 0,
        conscientiousness: 0,
        openness: 0,
      };

      const categoryCounts: Record<string, number> = {
        honesty: 0,
        emotionality: 0,
        extraversion: 0,
        agreeableness: 0,
        conscientiousness: 0,
        openness: 0,
      };

      questions.forEach((q) => {
        let score = finalAnswers[q.id] || 0;
        // Reverse scoring for reverse items
        if (q.reverse) {
          score = 6 - score; // 1->5, 2->4, 3->3, 4->2, 5->1
        }
        categoryScores[q.category] += score;
        categoryCounts[q.category]++;
      });

      // 평균 점수 계산 (0-100 스케일)
      const averageScores: Record<string, number> = {};
      Object.keys(categoryScores).forEach((category) => {
        averageScores[category] = Math.round(
          ((categoryScores[category] / (categoryCounts[category] * 5)) * 100)
        );
      });

      // AI 분석 요청
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'analyze-hexaco',
        {
          body: {
            categoryScores: averageScores,
            answers: finalAnswers,
          },
        }
      );

      if (analysisError) throw analysisError;

      const result = {
        testType: 'hexaco',
        categoryScores: averageScores,
        analysis: analysisData.analysis,
        totalScore: Math.round(
          Object.values(averageScores).reduce((a, b) => a + b, 0) / 6
        ),
        completedAt: new Date().toISOString(),
      };

      // 결과 저장
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          await supabase.from('test_results').insert({
            user_id: user.id,
            test_type_id: 'hexaco',
            scores: result,
          });
        } catch (err) {
          console.log('Could not save to test_results:', err);
        }
      }

      onComplete(result);
      toast.success('성격 분석이 완료되었습니다!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-12 text-center">
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full animate-pulse mx-auto mb-6 flex items-center justify-center">
                <Brain className="w-12 h-12 text-white" />
              </div>
              <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-bounce" />
            </div>
          </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AI가 당신의 성격을 분석하고 있습니다
            </h3>
            <p className="text-muted-foreground mb-8">
              6가지 차원의 성격 특성을 심층 분석하여 상세한 프로필을 생성합니다...
            </p>
          <div className="flex justify-center gap-2">
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-full mb-4">
            <Crown className="w-5 h-5" />
<span className="font-bold">퍼스널리티 컴퍼스</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            6차원 성격 나침반 검사
          </h1>
          <p className="text-muted-foreground">
            진실성, 감성, 사교성, 조화성, 계획성, 탐구성을 종합 측정합니다
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              질문 {currentQuestion + 1} / {questions.length}
            </span>
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="p-8 mb-6 shadow-xl border-2 border-indigo-200 dark:border-indigo-800">
          <div className="mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl">
                <Gem className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
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
              { label: '전혀 그렇지 않다', score: 1, color: 'from-red-400 to-red-500' },
              { label: '그렇지 않다', score: 2, color: 'from-orange-400 to-orange-500' },
              { label: '보통이다', score: 3, color: 'from-yellow-400 to-yellow-500' },
              { label: '그렇다', score: 4, color: 'from-green-400 to-green-500' },
              { label: '매우 그렇다', score: 5, color: 'from-blue-400 to-blue-500' },
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
          <Button
            onClick={currentQuestion === 0 ? onBack : handlePrevious}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentQuestion === 0 ? '목록으로' : '이전'}
          </Button>

          <div className="text-sm text-muted-foreground">
            {currentQuestion === questions.length - 1 ? '마지막 질문입니다' : '답변을 선택해주세요'}
          </div>

          <div className="w-20"></div>
        </div>
      </div>
    </div>
  );
};
