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
  // Honesty-Humility (정직-겸손)
  { id: 1, text: "다른 사람을 속이는 것이 정당화될 때가 있다고 생각한다", category: 'honesty', reverse: true },
  { id: 2, text: "나는 내가 가진 것에 대해 자랑하지 않는 편이다", category: 'honesty' },
  { id: 3, text: "부자가 되는 것이 인생에서 가장 중요하다", category: 'honesty', reverse: true },
  { id: 4, text: "특별한 대우를 받을 자격이 있다고 생각하지 않는다", category: 'honesty' },
  { id: 5, text: "규칙을 어기더라도 이익이 크다면 할 수 있다", category: 'honesty', reverse: true },
  { id: 6, text: "다른 사람의 성공을 진심으로 기뻐할 수 있다", category: 'honesty' },
  { id: 7, text: "나의 능력이나 업적을 과장하는 경향이 있다", category: 'honesty', reverse: true },
  { id: 8, text: "물질적 소유보다 정신적 가치가 더 중요하다", category: 'honesty' },

  // Emotionality (정서성)
  { id: 9, text: "스트레스 상황에서도 침착함을 유지한다", category: 'emotionality', reverse: true },
  { id: 10, text: "다른 사람의 고통을 보면 깊이 공감한다", category: 'emotionality' },
  { id: 11, text: "작은 일에도 쉽게 불안해진다", category: 'emotionality' },
  { id: 12, text: "사람들에게 감정적인 지지를 제공하는 것을 좋아한다", category: 'emotionality' },
  { id: 13, text: "위험한 상황에서도 두려움을 느끼지 않는다", category: 'emotionality', reverse: true },
  { id: 14, text: "다른 사람과의 유대감을 매우 중요하게 생각한다", category: 'emotionality' },
  { id: 15, text: "감정 기복이 거의 없는 편이다", category: 'emotionality', reverse: true },
  { id: 16, text: "약자를 돕는 일에 깊은 감동을 느낀다", category: 'emotionality' },

  // eXtraversion (외향성)
  { id: 17, text: "사람들과 어울리는 것이 즐겁다", category: 'extraversion' },
  { id: 18, text: "조용한 환경을 선호한다", category: 'extraversion', reverse: true },
  { id: 19, text: "파티나 모임에서 활력을 얻는다", category: 'extraversion' },
  { id: 20, text: "혼자 있을 때 더 편안하다", category: 'extraversion', reverse: true },
  { id: 21, text: "사교적인 활동을 적극적으로 찾는다", category: 'extraversion' },
  { id: 22, text: "새로운 사람을 만나는 것이 부담스럽다", category: 'extraversion', reverse: true },
  { id: 23, text: "대화의 중심이 되는 것을 즐긴다", category: 'extraversion' },
  { id: 24, text: "사람이 많은 곳에서 에너지가 소진된다", category: 'extraversion', reverse: true },

  // Agreeableness (원만성)
  { id: 25, text: "다른 사람을 쉽게 용서하는 편이다", category: 'agreeableness' },
  { id: 26, text: "사람들과 갈등이 생기면 오래 기억한다", category: 'agreeableness', reverse: true },
  { id: 27, text: "타협하는 것을 자연스럽게 받아들인다", category: 'agreeableness' },
  { id: 28, text: "내 의견을 관철시키기 위해 강하게 주장한다", category: 'agreeableness', reverse: true },
  { id: 29, text: "다른 사람의 입장을 이해하려 노력한다", category: 'agreeableness' },
  { id: 30, text: "비판을 받으면 방어적으로 반응한다", category: 'agreeableness', reverse: true },
  { id: 31, text: "협력하는 것이 경쟁하는 것보다 좋다", category: 'agreeableness' },
  { id: 32, text: "다른 사람의 실수를 쉽게 지적한다", category: 'agreeableness', reverse: true },

  // Conscientiousness (성실성)
  { id: 33, text: "일을 체계적으로 계획하고 실행한다", category: 'conscientiousness' },
  { id: 34, text: "마감일을 자주 놓친다", category: 'conscientiousness', reverse: true },
  { id: 35, text: "완벽하게 끝내는 것이 중요하다", category: 'conscientiousness' },
  { id: 36, text: "즉흥적으로 행동하는 것을 선호한다", category: 'conscientiousness', reverse: true },
  { id: 37, text: "목표를 세우고 꾸준히 추구한다", category: 'conscientiousness' },
  { id: 38, text: "정리정돈을 잘 하지 못한다", category: 'conscientiousness', reverse: true },
  { id: 39, text: "책임감이 강한 편이다", category: 'conscientiousness' },
  { id: 40, text: "중요한 일을 미루는 경향이 있다", category: 'conscientiousness', reverse: true },

  // Openness to Experience (개방성)
  { id: 41, text: "새로운 아이디어나 관점을 탐구하는 것을 즐긴다", category: 'openness' },
  { id: 42, text: "익숙한 방식을 고수하는 것이 편하다", category: 'openness', reverse: true },
  { id: 43, text: "예술과 문화에 관심이 많다", category: 'openness' },
  { id: 44, text: "추상적인 개념보다 실용적인 것을 선호한다", category: 'openness', reverse: true },
  { id: 45, text: "상상력이 풍부한 편이다", category: 'openness' },
  { id: 46, text: "일상적이고 반복적인 것을 선호한다", category: 'openness', reverse: true },
  { id: 47, text: "다양한 문화와 가치관을 존중한다", category: 'openness' },
  { id: 48, text: "전통적인 방식이 가장 좋다고 생각한다", category: 'openness', reverse: true },
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
      toast.success('HEXACO 분석이 완료되었습니다!');
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
            AI가 당신의 HEXACO 성격을 분석하고 있습니다
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
            <span className="font-bold">HEXACO 성격 검사</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            6차원 심층 성격 분석
          </h1>
          <p className="text-muted-foreground">
            정직-겸손, 정서성, 외향성, 원만성, 성실성, 개방성을 과학적으로 측정합니다
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
