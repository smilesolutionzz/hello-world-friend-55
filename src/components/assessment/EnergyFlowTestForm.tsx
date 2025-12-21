import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Loader2, Zap, Sun, Moon, Battery } from "lucide-react";

const questions = [
  {
    id: "energy1",
    text: "아침에 눈을 떴을 때 기분과 컨디션은 어떤가요?",
    options: [
      { value: "4", label: "상쾌하고 활력이 넘침" },
      { value: "3", label: "나쁘지 않음, 움직일 준비 됨" },
      { value: "2", label: "좀 더 자고 싶지만 괜찮음" },
      { value: "1", label: "피곤하고 일어나기 힘듦" },
      { value: "0", label: "매우 지치고 무기력함" }
    ]
  },
  {
    id: "energy2",
    text: "하루 중 가장 집중이 잘 되는 시간대는 언제인가요?",
    options: [
      { value: "morning", label: "오전 (6시-12시)" },
      { value: "afternoon", label: "오후 (12시-18시)" },
      { value: "evening", label: "저녁 (18시-22시)" },
      { value: "night", label: "밤 (22시 이후)" },
      { value: "irregular", label: "일정하지 않음" }
    ]
  },
  {
    id: "energy3",
    text: "점심 식사 후 오후 시간대에 에너지 수준은 어떤가요?",
    options: [
      { value: "4", label: "오전과 동일하게 활력 있음" },
      { value: "3", label: "약간 나른하지만 집중 가능" },
      { value: "2", label: "확실히 피곤해지는 느낌" },
      { value: "1", label: "졸음이 밀려와 힘듦" },
      { value: "0", label: "거의 아무것도 하기 힘듦" }
    ]
  },
  {
    id: "energy4",
    text: "피곤함을 느낄 때 주로 어떻게 회복하나요?",
    options: [
      { value: "active", label: "가벼운 운동이나 산책" },
      { value: "rest", label: "짧은 휴식이나 낮잠" },
      { value: "caffeine", label: "커피나 에너지 음료" },
      { value: "food", label: "간식이나 음식 섭취" },
      { value: "push", label: "그냥 버티며 진행" }
    ]
  },
  {
    id: "energy5",
    text: "일주일 기준 신체적으로 활발하게 움직이는 날은 며칠인가요?",
    options: [
      { value: "4", label: "5일 이상" },
      { value: "3", label: "3-4일" },
      { value: "2", label: "1-2일" },
      { value: "1", label: "거의 없음" },
      { value: "0", label: "전혀 없음" }
    ]
  },
  {
    id: "energy6",
    text: "스트레스를 받을 때 에너지 수준에 미치는 영향은?",
    options: [
      { value: "4", label: "오히려 더 집중됨" },
      { value: "3", label: "큰 영향 없음" },
      { value: "2", label: "약간 지치는 느낌" },
      { value: "1", label: "상당히 에너지가 빠짐" },
      { value: "0", label: "완전히 탈진됨" }
    ]
  },
  {
    id: "energy7",
    text: "밤에 잠자리에 들 때 보통 어떤 상태인가요?",
    options: [
      { value: "4", label: "적당히 피곤하고 바로 잠듦" },
      { value: "3", label: "잠들기까지 시간이 좀 걸림" },
      { value: "2", label: "머리가 복잡해 잠들기 어려움" },
      { value: "1", label: "너무 피곤한데 잠이 안 옴" },
      { value: "0", label: "만성적인 수면 문제 있음" }
    ]
  },
  {
    id: "energy8",
    text: "주말과 평일의 에너지 수준 차이가 어느 정도인가요?",
    options: [
      { value: "4", label: "거의 비슷함" },
      { value: "3", label: "주말에 약간 더 활력 있음" },
      { value: "2", label: "주말에 확실히 더 좋음" },
      { value: "1", label: "평일엔 탈진, 주말에 회복" },
      { value: "0", label: "주말에도 회복되지 않음" }
    ]
  },
  {
    id: "energy9",
    text: "새로운 일이나 도전에 대한 에너지는 어떤가요?",
    options: [
      { value: "4", label: "설레고 에너지가 충전됨" },
      { value: "3", label: "긍정적으로 받아들임" },
      { value: "2", label: "부담스럽지만 해볼 만함" },
      { value: "1", label: "힘들게 느껴짐" },
      { value: "0", label: "감당하기 어려움" }
    ]
  },
  {
    id: "energy10",
    text: "현재 전반적인 에너지 만족도는 어떤가요?",
    options: [
      { value: "4", label: "매우 만족, 활력 넘침" },
      { value: "3", label: "대체로 괜찮음" },
      { value: "2", label: "조금 아쉬움" },
      { value: "1", label: "많이 부족함" },
      { value: "0", label: "심각하게 부족함" }
    ]
  }
];

interface EnergyFlowTestFormProps {
  onComplete: (results: {
    answers: Record<string, string>;
    totalScore: number;
    energyType: string;
    peakTime: string;
    recoveryStyle: string;
    burnoutRisk: string;
  }) => void;
  onBack: () => void;
}

export default function EnergyFlowTestForm({ onComplete, onBack }: EnergyFlowTestFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        analyzeResults(newAnswers);
      }
    }, 400);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const analyzeResults = (finalAnswers: Record<string, string>) => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      // 점수 계산 (숫자형 답변만)
      const numericQuestions = ['energy1', 'energy3', 'energy5', 'energy6', 'energy7', 'energy8', 'energy9', 'energy10'];
      let totalScore = 0;
      numericQuestions.forEach(q => {
        const val = parseInt(finalAnswers[q] || '0');
        if (!isNaN(val)) totalScore += val;
      });

      // 에너지 유형 분류
      let energyType: string;
      if (totalScore >= 28) {
        energyType = "활력충만형";
      } else if (totalScore >= 20) {
        energyType = "균형안정형";
      } else if (totalScore >= 12) {
        energyType = "회복필요형";
      } else {
        energyType = "에너지관리필요형";
      }

      // 피크 타임
      const peakTimeMap: Record<string, string> = {
        'morning': '아침형 (모닝버드)',
        'afternoon': '오후형 (점심파)',
        'evening': '저녁형 (나이트오울)',
        'night': '야행형 (올빼미)',
        'irregular': '불규칙형'
      };
      const peakTime = peakTimeMap[finalAnswers['energy2']] || '불규칙형';

      // 회복 스타일
      const recoveryMap: Record<string, string> = {
        'active': '능동적 회복형',
        'rest': '휴식형',
        'caffeine': '자극의존형',
        'food': '에너지보충형',
        'push': '버티기형'
      };
      const recoveryStyle = recoveryMap[finalAnswers['energy4']] || '복합형';

      // 번아웃 위험도
      let burnoutRisk: string;
      if (totalScore >= 24) {
        burnoutRisk = "낮음";
      } else if (totalScore >= 16) {
        burnoutRisk = "보통";
      } else if (totalScore >= 8) {
        burnoutRisk = "주의";
      } else {
        burnoutRisk = "높음";
      }

      onComplete({
        answers: finalAnswers,
        totalScore,
        energyType,
        peakTime,
        recoveryStyle,
        burnoutRisk
      });
      
      setIsAnalyzing(false);
    }, 1500);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Battery className="h-12 w-12 text-amber-500 animate-pulse" />
                <Zap className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg text-amber-800">에너지 패턴 분석 중...</h3>
                <p className="text-amber-600">최적의 활동 시간대를 찾고 있어요</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              돌아가기
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentQuestion + 1} / {questions.length}
            </span>
          </div>
          <Progress value={progress} className="w-full h-2 bg-amber-100" />
        </div>

        <Card className="border-amber-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Zap className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl">일상 에너지 흐름 검사</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h3 className="font-medium mb-4 text-lg">{currentQ.text}</h3>
              <RadioGroup
                value={answers[currentQ.id] || ""}
                onValueChange={(value) => handleAnswer(currentQ.id, value)}
                className="space-y-3"
              >
                {currentQ.options.map((option, index) => (
                  <div 
                    key={index} 
                    className="flex items-center space-x-2 p-3 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer border border-transparent hover:border-amber-200"
                  >
                    <RadioGroupItem value={option.value} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-start pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                이전
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
