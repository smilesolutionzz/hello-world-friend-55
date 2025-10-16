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
  // Honesty-Humility (진실성-겸손)
  { id: 1, text: "내 이익을 위해 상황을 왜곡하는 것이 괜찮다고 여긴다", category: 'honesty', reverse: true },
  { id: 2, text: "나의 성취를 과시하지 않으려 노력한다", category: 'honesty' },
  { id: 3, text: "재산을 많이 모으는 것이 삶의 최고 목표다", category: 'honesty', reverse: true },
  { id: 4, text: "특권을 누릴 자격이 있다고 보지 않는다", category: 'honesty' },
  { id: 5, text: "득이 되면 원칙을 굽힐 수 있다", category: 'honesty', reverse: true },
  { id: 6, text: "타인의 행복을 함께 기뻐할 수 있다", category: 'honesty' },
  { id: 7, text: "자신의 역량을 부풀려 말하곤 한다", category: 'honesty', reverse: true },
  { id: 8, text: "정신적 충만함이 물질보다 소중하다", category: 'honesty' },

  // Emotionality (감수성)
  { id: 9, text: "긴장된 상황에서도 평정심을 잃지 않는다", category: 'emotionality', reverse: true },
  { id: 10, text: "남의 아픔에 깊은 연민을 느낀다", category: 'emotionality' },
  { id: 11, text: "사소한 일에도 걱정이 많아진다", category: 'emotionality' },
  { id: 12, text: "주변인에게 정서적 도움을 주려 한다", category: 'emotionality' },
  { id: 13, text: "위험 앞에서도 두려움이 없다", category: 'emotionality', reverse: true },
  { id: 14, text: "친밀한 관계를 무척 소중히 여긴다", category: 'emotionality' },
  { id: 15, text: "감정의 변화가 거의 없다", category: 'emotionality', reverse: true },
  { id: 16, text: "약한 이를 돕는 모습에 깊이 감동한다", category: 'emotionality' },

  // eXtraversion (활력성)
  { id: 17, text: "여럿이 함께 하는 것이 재미있다", category: 'extraversion' },
  { id: 18, text: "고요한 공간을 더 좋아한다", category: 'extraversion', reverse: true },
  { id: 19, text: "모임에서 원기를 회복한다", category: 'extraversion' },
  { id: 20, text: "홀로 있을 때 가장 편안하다", category: 'extraversion', reverse: true },
  { id: 21, text: "사람들과 어울리는 기회를 만든다", category: 'extraversion' },
  { id: 22, text: "새 사람 만나기가 부담된다", category: 'extraversion', reverse: true },
  { id: 23, text: "대화의 주도권을 갖는 걸 즐긴다", category: 'extraversion' },
  { id: 24, text: "인파 속에서 기운이 빠진다", category: 'extraversion', reverse: true },

  // Agreeableness (협력성)
  { id: 25, text: "남의 잘못을 너그럽게 받아준다", category: 'agreeableness' },
  { id: 26, text: "다툼이 있으면 한참 마음에 담아둔다", category: 'agreeableness', reverse: true },
  { id: 27, text: "양보와 조정을 자연스럽게 한다", category: 'agreeableness' },
  { id: 28, text: "내 생각을 관철하기 위해 밀어붙인다", category: 'agreeableness', reverse: true },
  { id: 29, text: "상대 처지를 헤아리려 애쓴다", category: 'agreeableness' },
  { id: 30, text: "지적받으면 변명부터 한다", category: 'agreeableness', reverse: true },
  { id: 31, text: "경쟁보다 협업이 낫다고 본다", category: 'agreeableness' },
  { id: 32, text: "남의 실책을 금방 지적한다", category: 'agreeableness', reverse: true },

  // Conscientiousness (계획성)
  { id: 33, text: "일을 순서대로 정리해서 진행한다", category: 'conscientiousness' },
  { id: 34, text: "기한을 자주 넘긴다", category: 'conscientiousness', reverse: true },
  { id: 35, text: "완성도 있게 마무리하는 게 중요하다", category: 'conscientiousness' },
  { id: 36, text: "즉흥적 행동을 더 좋아한다", category: 'conscientiousness', reverse: true },
  { id: 37, text: "목표를 정하고 지속적으로 실천한다", category: 'conscientiousness' },
  { id: 38, text: "정돈하는 데 서툴다", category: 'conscientiousness', reverse: true },
  { id: 39, text: "책임을 다하려는 마음이 강하다", category: 'conscientiousness' },
  { id: 40, text: "큰 일을 자꾸 뒤로 미룬다", category: 'conscientiousness', reverse: true },

  // Openness to Experience (탐구성)
  { id: 41, text: "새 관점과 아이디어를 즐겨 탐색한다", category: 'openness' },
  { id: 42, text: "검증된 방법을 계속 쓰는 게 편하다", category: 'openness', reverse: true },
  { id: 43, text: "예술과 문화에 흥미가 깊다", category: 'openness' },
  { id: 44, text: "추상보다 실용을 선호한다", category: 'openness', reverse: true },
  { id: 45, text: "상상하는 것을 즐긴다", category: 'openness' },
  { id: 46, text: "반복되는 일상이 좋다", category: 'openness', reverse: true },
  { id: 47, text: "다른 문화와 가치를 존중한다", category: 'openness' },
  { id: 48, text: "전통 방식이 최선이라 생각한다", category: 'openness', reverse: true },
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
      toast.success('6차원 성격 분석이 완료되었습니다!');
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
            AI가 당신의 6차원 성격을 분석하고 있습니다
          </h3>
          <p className="text-muted-foreground mb-8">
            진실성, 감수성, 활력성, 협력성, 계획성, 탐구성을 심층 분석하여 상세한 프로필을 생성합니다...
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
            <span className="font-bold">6차원 성격진단</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            6차원 심층 성격 분석
          </h1>
          <p className="text-muted-foreground">
            진실성, 감수성, 활력성, 협력성, 계획성, 탐구성을 과학적으로 측정합니다
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
