import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle } from "lucide-react";

const questions = [
  {
    id: 'ab1',
    category: '일상생활 기술',
    text: '스스로 식사를 할 수 있습니까?',
    description: '숟가락, 젓가락 사용하여 음식 먹기'
  },
  {
    id: 'ab2',
    category: '일상생활 기술',
    text: '스스로 옷을 입고 벗을 수 있습니까?',
    description: '단추, 지퍼 사용 포함'
  },
  {
    id: 'ab3',
    category: '일상생활 기술',
    text: '스스로 화장실을 사용할 수 있습니까?',
    description: '배변, 위생 관리'
  },
  {
    id: 'ab4',
    category: '일상생활 기술',
    text: '스스로 손과 얼굴을 씻을 수 있습니까?',
    description: '개인 위생 관리'
  },
  {
    id: 'ab5',
    category: '일상생활 기술',
    text: '스스로 양치질을 할 수 있습니까?',
    description: '치아 관리'
  },
  {
    id: 'ab6',
    category: '사회적 기술',
    text: '다른 사람과 눈을 맞추며 대화할 수 있습니까?',
    description: '아이컨택, 사회적 상호작용'
  },
  {
    id: 'ab7',
    category: '사회적 기술',
    text: '차례를 기다릴 수 있습니까?',
    description: '순서 지키기, 인내심'
  },
  {
    id: 'ab8',
    category: '사회적 기술',
    text: '다른 사람과 물건을 나누거나 공유할 수 있습니까?',
    description: '협력, 공유 능력'
  },
  {
    id: 'ab9',
    category: '사회적 기술',
    text: '기본적인 인사(안녕하세요, 감사합니다)를 할 수 있습니까?',
    description: '사회적 예절'
  },
  {
    id: 'ab10',
    category: '의사소통 기술',
    text: '자신의 욕구나 필요를 표현할 수 있습니까?',
    description: '말, 몸짓, 그림 등으로 의사 표현'
  },
  {
    id: 'ab11',
    category: '의사소통 기술',
    text: '간단한 지시나 요청을 이해하고 따를 수 있습니까?',
    description: '1-2단계 지시 이해'
  },
  {
    id: 'ab12',
    category: '의사소통 기술',
    text: '질문에 적절하게 대답할 수 있습니까?',
    description: '상황에 맞는 응답'
  },
  {
    id: 'ab13',
    category: '자기관리 기술',
    text: '위험한 상황을 인식하고 피할 수 있습니까?',
    description: '안전 인식'
  },
  {
    id: 'ab14',
    category: '자기관리 기술',
    text: '도움이 필요할 때 요청할 수 있습니까?',
    description: '도움 요청 능력'
  },
  {
    id: 'ab15',
    category: '자기관리 기술',
    text: '자신의 물건을 관리할 수 있습니까?',
    description: '소지품 정리, 관리'
  },
  {
    id: 'ab16',
    category: '지역사회 적응',
    text: '외출 시 안전하게 보행할 수 있습니까?',
    description: '길 건너기, 신호 지키기'
  },
  {
    id: 'ab17',
    category: '지역사회 적응',
    text: '상점이나 공공장소에서 적절하게 행동할 수 있습니까?',
    description: '사회적 규칙 이해'
  },
  {
    id: 'ab18',
    category: '지역사회 적응',
    text: '교통수단(버스, 지하철)을 이용할 수 있습니까?',
    description: '대중교통 이용 능력'
  }
];

const scoringOptions = [
  { value: 0, label: '전혀 못함', description: '도움 없이는 전혀 수행할 수 없음' },
  { value: 1, label: '많은 도움 필요', description: '대부분의 과정에서 도움이 필요함' },
  { value: 2, label: '약간의 도움 필요', description: '부분적으로 도움이 필요함' },
  { value: 3, label: '독립적으로 가능', description: '도움 없이 스스로 수행 가능' }
];

interface AdaptiveBehaviorFormProps {
  onComplete: (results: { answers: number[]; total: number; average: number; level: string }) => void;
  onBack: () => void;
}

const AdaptiveBehaviorForm = ({ onComplete, onBack }: AdaptiveBehaviorFormProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const currentQuestion = questions[currentIndex];

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = score;
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 300);
    } else {
      const total = newAnswers.reduce((sum, val) => sum + val, 0);
      const average = total / questions.length;
      
      let level = '매우 낮음';
      if (average >= 2.5) level = '높음';
      else if (average >= 1.5) level = '중간';
      else if (average >= 0.5) level = '낮음';

      onComplete({
        answers: newAnswers,
        total,
        average,
        level
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
            <h2 className="text-xl font-bold text-brand-gradient">적응행동 평가</h2>
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
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
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
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <p className="text-sm text-green-800 dark:text-green-200">
              💡 <strong>평가 안내:</strong> 현재 실제로 수행할 수 있는 능력을 기준으로 응답해주세요. 
              가끔 할 수 있거나 과거에 했던 것이 아닌, 현재 일관되게 보이는 능력을 평가해주시기 바랍니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdaptiveBehaviorForm;
