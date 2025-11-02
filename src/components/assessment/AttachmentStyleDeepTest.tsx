import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Question {
  id: number;
  text: string;
  category: 'secure' | 'anxious' | 'avoidant' | 'fearful';
}

const questions: Question[] = [
  // Secure Attachment (안정 애착)
  { id: 1, text: "나는 다른 사람과 가까워지는 것이 편안하다", category: 'secure' },
  { id: 2, text: "나는 필요할 때 타인에게 의지할 수 있다고 느낀다", category: 'secure' },
  { id: 3, text: "관계에서 친밀함과 독립성의 균형을 잘 유지한다", category: 'secure' },
  { id: 4, text: "상대방이 나를 사랑한다는 확신이 있다", category: 'secure' },
  { id: 5, text: "갈등이 생겨도 건설적으로 해결할 수 있다고 믿는다", category: 'secure' },
  { id: 6, text: "나는 관계에서 안정감을 느낀다", category: 'secure' },

  // Anxious Attachment (불안 애착)
  { id: 7, text: "상대방이 나만큼 나를 좋아하지 않을까 걱정된다", category: 'anxious' },
  { id: 8, text: "상대방과 완전히 하나가 되고 싶은 욕구가 강하다", category: 'anxious' },
  { id: 9, text: "버림받을까 봐 두렵다", category: 'anxious' },
  { id: 10, text: "상대방의 사소한 행동에도 민감하게 반응한다", category: 'anxious' },
  { id: 11, text: "혼자 있으면 불안하고 상대방이 필요하다", category: 'anxious' },
  { id: 12, text: "관계에서 끊임없이 확신을 얻고 싶어한다", category: 'anxious' },
  { id: 13, text: "상대방의 연락이 없으면 최악의 상황을 상상한다", category: 'anxious' },
  { id: 14, text: "관계에서 나의 욕구가 충족되지 않는다고 느낀다", category: 'anxious' },

  // Avoidant Attachment (회피 애착)
  { id: 15, text: "나는 독립적이고 혼자서도 잘 지낸다", category: 'avoidant' },
  { id: 16, text: "다른 사람에게 의지하는 것이 불편하다", category: 'avoidant' },
  { id: 17, text: "너무 가까워지면 부담스럽다", category: 'avoidant' },
  { id: 18, text: "감정을 표현하는 것이 어렵다", category: 'avoidant' },
  { id: 19, text: "관계에서 거리를 두는 것이 편하다", category: 'avoidant' },
  { id: 20, text: "상대방이 너무 의존적이면 답답하다", category: 'avoidant' },
  { id: 21, text: "친밀한 관계보다 개인 시간이 더 중요하다", category: 'avoidant' },
  { id: 22, text: "관계에서 자유로움을 잃고 싶지 않다", category: 'avoidant' },

  // Fearful-Avoidant (혼란 애착)
  { id: 23, text: "친밀해지고 싶지만 동시에 두렵다", category: 'fearful' },
  { id: 24, text: "가까워지면 상처받을까 봐 걱정된다", category: 'fearful' },
  { id: 25, text: "사랑받고 싶지만 거부당할까 두렵다", category: 'fearful' },
  { id: 26, text: "관계에서 갈등하는 감정을 자주 느낀다", category: 'fearful' },
  { id: 27, text: "상대방을 믿기 어렵다", category: 'fearful' },
  { id: 28, text: "관계가 불안정하고 예측하기 어렵다", category: 'fearful' },
  { id: 29, text: "친밀함을 원하면서도 밀어낸다", category: 'fearful' },
  { id: 30, text: "관계에서 안전함을 느끼기 어렵다", category: 'fearful' },
];

interface AttachmentStyleDeepTestProps {
  onComplete: (result: any) => void;
  onBack?: () => void;
}

export const AttachmentStyleDeepTest: React.FC<AttachmentStyleDeepTestProps> = ({ onComplete, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswerChange = (value: string) => {
    const score = parseInt(value);
    setAnswers({ ...answers, [questions[currentQuestion].id]: score });
    
    // Auto-advance to next question after a short delay
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      }
    }, 300);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResult = () => {
    setIsAnalyzing(true);

    const categoryScores: Record<string, number> = {
      secure: 0,
      anxious: 0,
      avoidant: 0,
      fearful: 0,
    };

    const categoryCounts: Record<string, number> = {
      secure: 0,
      anxious: 0,
      avoidant: 0,
      fearful: 0,
    };

    Object.entries(answers).forEach(([questionId, score]) => {
      const question = questions.find(q => q.id === parseInt(questionId));
      if (question) {
        categoryScores[question.category] += score;
        categoryCounts[question.category]++;
      }
    });

    // Calculate average scores
    const averageScores = Object.entries(categoryScores).map(([category, total]) => ({
      category,
      average: categoryCounts[category] > 0 ? total / categoryCounts[category] : 0,
    }));

    // Sort by average score
    averageScores.sort((a, b) => b.average - a.average);

    const dominantStyle = averageScores[0].category;
    const dominantScore = averageScores[0].average;

    // Calculate total score
    const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
    const averageScore = totalScore / Object.keys(answers).length;

    const styleDescriptions = {
      secure: {
        name: '안정 애착',
        emoji: '💚',
        description: '건강한 관계 패턴을 가지고 있습니다. 친밀함과 독립성의 균형을 잘 유지하며, 타인을 신뢰하고 자신감 있게 관계를 맺습니다.',
        strengths: ['안정적인 관계 형성', '감정 조절 능력', '건강한 경계 설정', '신뢰와 친밀감'],
        challenges: ['특별한 어려움 없음', '지속적인 관계 유지 노력'],
        tips: ['현재의 건강한 패턴을 유지하세요', '다른 사람들에게 긍정적인 모델이 되어주세요'],
      },
      anxious: {
        name: '불안 애착',
        emoji: '💛',
        description: '관계에서 강한 친밀함을 원하지만, 버림받을까 하는 두려움이 큽니다. 상대방의 사랑과 관심을 계속 확인하고 싶어합니다.',
        strengths: ['깊은 감정 표현', '헌신적인 태도', '관계에 대한 열정', '공감 능력'],
        challenges: ['과도한 걱정과 불안', '의존성', '거절 민감성', '자존감 문제'],
        tips: ['자기 위안 능력을 키우세요', '상대방에게 공간을 주는 연습을 하세요', '자신의 가치를 인정하세요'],
      },
      avoidant: {
        name: '회피 애착',
        emoji: '💙',
        description: '독립성을 중요시하며 타인과의 친밀함을 불편해합니다. 감정적 거리를 유지하고 자급자족하려는 경향이 있습니다.',
        strengths: ['독립성', '자기 의존성', '이성적 사고', '자율성'],
        challenges: ['친밀감 회피', '감정 표현의 어려움', '취약함 보이기 힘듦', '관계 유지의 어려움'],
        tips: ['감정을 인정하고 표현하는 연습을 하세요', '친밀함이 안전할 수 있음을 배우세요', '취약함을 보이는 것도 괜찮습니다'],
      },
      fearful: {
        name: '혼란 애착',
        emoji: '💜',
        description: '친밀함을 원하면서도 두려워하는 양가감정이 있습니다. 관계에서 불안정하고 예측하기 어려운 패턴을 보입니다.',
        strengths: ['높은 감수성', '깊은 공감 능력', '자기 인식', '회복 가능성'],
        challenges: ['양가감정', '신뢰 문제', '관계 불안정', '감정 조절 어려움'],
        tips: ['안전한 관계 경험을 쌓으세요', '전문가 도움을 받는 것을 고려하세요', '자기 돌봄을 우선시하세요'],
      },
    };

    setTimeout(() => {
      setIsAnalyzing(false);
      onComplete({
        categoryScores,
        averageScores,
        dominantStyle,
        dominantScore,
        totalScore,
        averageScore,
        styleInfo: styleDescriptions[dominantStyle as keyof typeof styleDescriptions],
        allStyles: styleDescriptions,
        answers,
      });
    }, 1500);
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
              <h3 className="text-xl font-semibold">애착 유형 분석 중...</h3>
              <p className="text-muted-foreground">AI가 당신의 애착 패턴을 심층 분석하고 있습니다</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto pt-8 pb-12">
        <Card className="shadow-xl">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack || (() => navigate('/assessment'))}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                뒤로
              </Button>
              <span className="text-sm font-medium text-muted-foreground">
                {currentQuestion + 1} / {questions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-center space-y-2">
              <CardTitle className="text-2xl">애착 유형 심층 분석</CardTitle>
              <CardDescription className="text-base">
                각 문항을 읽고 자신과 얼마나 일치하는지 선택해주세요
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-lg">
              <p className="text-lg font-medium text-center">
                {questions[currentQuestion].text}
              </p>
            </div>

            <RadioGroup
              value={answers[questions[currentQuestion].id]?.toString()}
              onValueChange={handleAnswerChange}
              className="space-y-3"
            >
              {[
                { value: '1', label: '전혀 그렇지 않다', color: 'bg-red-50 hover:bg-red-100 border-red-200' },
                { value: '2', label: '그렇지 않다', color: 'bg-orange-50 hover:bg-orange-100 border-orange-200' },
                { value: '3', label: '보통이다', color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200' },
                { value: '4', label: '그렇다', color: 'bg-green-50 hover:bg-green-100 border-green-200' },
                { value: '5', label: '매우 그렇다', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200' },
              ].map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${option.color} ${
                    answers[questions[currentQuestion].id]?.toString() === option.value
                      ? 'ring-2 ring-primary ring-offset-2'
                      : ''
                  }`}
                  onClick={() => handleAnswerChange(option.value)}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label
                    htmlFor={option.value}
                    className="flex-1 cursor-pointer font-medium"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                이전
              </Button>
              <Button
                onClick={handleNext}
                disabled={!answers[questions[currentQuestion].id]}
                className="gap-2"
              >
                {currentQuestion === questions.length - 1 ? '결과 보기' : '다음'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
