import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Crown, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PastLifeJobTestFreeProps {
  onComplete?: (result: any) => void;
  onBack?: () => void;
}

const questions = [
  {
    id: 1,
    text: "가장 끌리는 활동은?",
    options: [
      { value: "scholar", label: "책을 읽고 글을 쓰는 일" },
      { value: "warrior", label: "신체적 훈련과 무술 연마" },
      { value: "merchant", label: "물건을 거래하고 장사하는 일" },
      { value: "artist", label: "그림이나 음악 등 예술 활동" }
    ]
  },
  {
    id: 2,
    text: "이상적인 하루 일과는?",
    options: [
      { value: "scholar", label: "조용한 서재에서 연구에 몰두" },
      { value: "warrior", label: "훈련장에서 체력과 기술 단련" },
      { value: "merchant", label: "시장에서 활발하게 거래" },
      { value: "artist", label: "작업실에서 창작 활동" }
    ]
  },
  {
    id: 3,
    text: "갈등 상황에서의 해결 방식은?",
    options: [
      { value: "scholar", label: "깊이 사고하고 논리적으로 접근" },
      { value: "warrior", label: "직접적이고 즉각적으로 행동" },
      { value: "merchant", label: "협상과 타협을 통한 해결" },
      { value: "artist", label: "창의적이고 독특한 방법 모색" }
    ]
  },
  {
    id: 4,
    text: "가장 중요하게 생각하는 가치는?",
    options: [
      { value: "scholar", label: "지혜와 진리 추구" },
      { value: "warrior", label: "명예와 용기" },
      { value: "merchant", label: "실용성과 효율성" },
      { value: "artist", label: "아름다움과 창의성" }
    ]
  },
  {
    id: 5,
    text: "사람들과의 관계에서 선호하는 역할은?",
    options: [
      { value: "scholar", label: "조언자나 멘토 역할" },
      { value: "warrior", label: "리더나 보호자 역할" },
      { value: "merchant", label: "중재자나 연결고리 역할" },
      { value: "artist", label: "영감을 주는 창조자 역할" }
    ]
  },
  {
    id: 6,
    text: "가장 매력적인 환경은?",
    options: [
      { value: "scholar", label: "고요한 도서관이나 서원" },
      { value: "warrior", label: "넓은 훈련장이나 전투 현장" },
      { value: "merchant", label: "번화한 시장이나 상점" },
      { value: "artist", label: "아름다운 정원이나 화실" }
    ]
  }
];

const PastLifeJobTestFree = ({ onComplete, onBack }: PastLifeJobTestFreeProps) => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
    
    // 즉시 다음 문항으로 이동
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      analyzeResult();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const analyzeResult = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const counts = { scholar: 0, warrior: 0, merchant: 0, artist: 0 };
      
      Object.values(answers).forEach(answer => {
        if (counts.hasOwnProperty(answer)) {
          counts[answer as keyof typeof counts]++;
        }
      });

      const maxJob = Object.entries(counts).reduce((a, b) => counts[a[0] as keyof typeof counts] > counts[b[0] as keyof typeof counts] ? a : b);
      
      const jobTypes = {
        scholar: {
          job: '학자 (Scholar)',
          era: '조선시대 성균관',
          description: '학문을 사랑하고 지혜를 추구하는 선비의 모습을 가지고 있습니다.',
          traits: ['지적 호기심', '깊은 사고', '차분한 성격', '진리 추구'],
          modernConnection: '현재의 연구자, 교수, 작가의 기질을 가지고 있어요.'
        },
        warrior: {
          job: '무관 (Warrior)',
          era: '고구려 전성기',
          description: '용기와 정의감이 강한 무사의 기질을 가지고 있습니다.',
          traits: ['강한 의지', '리더십', '정의감', '행동력'],
          modernConnection: '현재의 군인, 경찰, 운동선수의 기질을 가지고 있어요.'
        },
        merchant: {
          job: '상인 (Merchant)',
          era: '고려 개경 시대',
          description: '사람들과의 소통을 즐기고 실용적인 사고를 하는 상인의 모습입니다.',
          traits: ['사교성', '협상 능력', '현실적 사고', '적응력'],
          modernConnection: '현재의 사업가, 영업사원, 서비스업의 기질을 가지고 있어요.'
        },
        artist: {
          job: '예술가 (Artist)',
          era: '신라 황금기',
          description: '아름다움을 추구하고 창의적인 예술가의 혼을 가지고 있습니다.',
          traits: ['창의성', '감성', '독창성', '미적 감각'],
          modernConnection: '현재의 디자이너, 음악가, 화가의 기질을 가지고 있어요.'
        }
      };

      const result = {
        pastLifeJob: jobTypes[maxJob[0] as keyof typeof jobTypes],
        counts,
        answers,
        testType: 'past_life_job_free',
        completedAt: new Date().toISOString()
      };

      // 무료 체험 결과 페이지로 이동
      navigate('/free-trial-result', { state: { testResult: result } });
      setIsAnalyzing(false);
    }, 2000);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              <div className="text-center">
                <h3 className="font-semibold text-lg">전생 직업 분석 중...</h3>
                <p className="text-muted-foreground">과거로 시간여행을 떠나고 있어요</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => navigate('/free-trial')} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              돌아가기
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentQuestion + 1} / {questions.length}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-6 h-6 text-amber-600" />
            <h1 className="text-2xl font-bold">내 전생은 어떤 직업?</h1>
          </div>
          <p className="text-muted-foreground mb-4">
            재미있는 AI 분석으로 알아보는 나의 전생 직업
          </p>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {currentQ.text}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={answers[currentQuestion] || ""}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              {currentQ.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-amber-50 transition-colors">
                  <RadioGroupItem value={option.value} id={`option-${index}`} />
                  <Label 
                    htmlFor={`option-${index}`} 
                    className="flex-1 cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                이전
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PastLifeJobTestFree;