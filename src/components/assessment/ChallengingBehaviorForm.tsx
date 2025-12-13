import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, AlertTriangle } from "lucide-react";

const questions = [
  {
    id: 'cb1',
    category: '자해행동',
    text: '자신의 몸을 때리거나 꼬집거나 물어뜯는 행동을 합니까?',
    description: '머리 박기, 얼굴 때리기, 손 물기 등'
  },
  {
    id: 'cb2',
    category: '자해행동',
    text: '머리를 벽이나 바닥에 박는 행동을 합니까?',
    description: '반복적으로 머리를 부딪히는 행동'
  },
  {
    id: 'cb3',
    category: '공격행동',
    text: '다른 사람을 때리거나 밀치거나 발로 차는 행동을 합니까?',
    description: '타인에 대한 신체적 공격'
  },
  {
    id: 'cb4',
    category: '공격행동',
    text: '다른 사람을 물거나 할퀴는 행동을 합니까?',
    description: '타인에게 상처를 입히는 행동'
  },
  {
    id: 'cb5',
    category: '공격행동',
    text: '다른 사람에게 침을 뱉거나 물건을 던지는 행동을 합니까?',
    description: '공격적인 행동 표현'
  },
  {
    id: 'cb6',
    category: '파괴행동',
    text: '물건을 부수거나 찢거나 망가뜨리는 행동을 합니까?',
    description: '장난감, 가구, 물건 파괴'
  },
  {
    id: 'cb7',
    category: '파괴행동',
    text: '가구나 벽에 낙서하거나 긁는 행동을 합니까?',
    description: '재산 손상 행동'
  },
  {
    id: 'cb8',
    category: '상동행동',
    text: '같은 동작을 반복적으로 계속하는 행동을 합니까?',
    description: '손 흔들기, 몸 흔들기, 뱅뱅 돌기 등'
  },
  {
    id: 'cb9',
    category: '상동행동',
    text: '같은 소리를 반복적으로 내거나 같은 말을 계속 합니까?',
    description: '반향어, 반복적인 소리 내기'
  },
  {
    id: 'cb10',
    category: '상동행동',
    text: '물건을 반복적으로 정렬하거나 특정 순서를 고집합니까?',
    description: '의식적이고 반복적인 행동 패턴'
  },
  {
    id: 'cb11',
    category: '부적절한 사회적 행동',
    text: '다른 사람의 개인 공간을 침범하거나 부적절하게 만지려고 합니까?',
    description: '사회적 경계 위반'
  },
  {
    id: 'cb12',
    category: '부적절한 사회적 행동',
    text: '공공장소에서 옷을 벗거나 부적절한 행동을 합니까?',
    description: '사회적으로 부적절한 행동'
  },
  {
    id: 'cb13',
    category: '부적절한 사회적 행동',
    text: '큰 소리를 지르거나 비명을 지르는 행동을 합니까?',
    description: '소음을 내는 행동'
  },
  {
    id: 'cb14',
    category: '거부행동',
    text: '요청받은 활동을 거부하거나 과제를 회피합니까?',
    description: '지시 불이행, 도망가기'
  },
  {
    id: 'cb15',
    category: '거부행동',
    text: '식사나 목욕 등 일상 활동을 심하게 거부합니까?',
    description: '일상생활 거부 행동'
  }
];

const scoringOptions = [
  { value: 0, label: '전혀 없음', description: '해당 행동이 전혀 나타나지 않음' },
  { value: 1, label: '가끔', description: '월 1-2회 정도 나타남' },
  { value: 2, label: '자주', description: '주 1-2회 정도 나타남' },
  { value: 3, label: '매우 자주', description: '거의 매일 또는 하루에 여러 번 나타남' }
];

interface ChallengingBehaviorFormProps {
  onComplete: (results: { answers: number[]; total: number; average: number; severity: string }) => void;
  onBack: () => void;
}

const ChallengingBehaviorForm = ({ onComplete, onBack }: ChallengingBehaviorFormProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const currentQuestion = questions[currentIndex];

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = score;
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const total = newAnswers.reduce((sum, val) => sum + val, 0);
      const average = total / questions.length;
      
      let severity = '경미';
      if (average >= 2.5) severity = '심각';
      else if (average >= 1.5) severity = '중등도';
      else if (average >= 0.5) severity = '경도';

      onComplete({
        answers: newAnswers,
        total,
        average,
        severity
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
          <div className="text-center">
            <h2 className="text-xl font-bold text-brand-gradient">도전행동 평가</h2>
            <p className="text-sm text-muted-foreground">
              {currentIndex + 1} / {questions.length}
            </p>
          </div>
          <div className="w-20" />
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">진행률</span>
            <span className="font-semibold text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                {currentQuestion.category}
              </span>
            </div>
            <CardTitle className="text-xl leading-relaxed">
              {currentQuestion.text}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {currentQuestion.description}
            </p>
          </CardHeader>

          <CardContent>
            <RadioGroup
              value={answers[currentIndex]?.toString()}
              onValueChange={(value) => handleAnswer(parseInt(value))}
              className="space-y-3"
            >
              {scoringOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                  <Label htmlFor={`option-${option.value}`} className="flex-1 cursor-pointer">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                이전
              </Button>
              <span className="text-sm text-muted-foreground">
                {answers[currentIndex] !== -1 ? '응답 완료 ✓' : '답변을 선택해주세요'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>평가 안내:</strong> 최근 한 달 동안의 행동을 기준으로 응답해주세요. 
              정확한 평가를 위해 관찰된 실제 행동을 바탕으로 답변해주시기 바랍니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChallengingBehaviorForm;
