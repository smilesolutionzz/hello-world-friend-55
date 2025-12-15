import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Baby, MessageCircle, Check } from "lucide-react";
import { TOKEN_COSTS } from "@/constants/tokenCosts";
import { useTokens } from "@/hooks/useTokens";
import TokenGate from "@/components/TokenGate";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";

interface InfantLanguageTestFormProps {
  onComplete: (results: {
    answers: number[];
    total: number;
    average: number;
    ageGroup: string;
    age: number;
    detailedAgeGroup: string;
    ageInMonths: number;
  }) => void;
  onBack: () => void;
}

// 개월수별 세밀한 발달 단계 정의
const getDetailedAgeGroup = (months: number): string => {
  if (months <= 6) return '0-6개월';
  if (months <= 12) return '7-12개월';
  if (months <= 18) return '13-18개월';
  if (months <= 24) return '19-24개월';
  if (months <= 36) return '25-36개월';
  if (months <= 48) return '37-48개월';
  if (months <= 60) return '49-60개월';
  return '61개월 이상';
};

// 개월수별 적합한 질문 세트
const getQuestionsForAge = (months: number): { question: string; category: string }[] => {
  if (months <= 6) {
    return [
      { question: "아이가 소리가 나는 방향으로 고개를 돌립니다", category: "이해력" },
      { question: "엄마/아빠 목소리를 알아듣고 반응합니다", category: "이해력" },
      { question: "옹알이를 시작했습니다 (바바, 마마 등)", category: "표현력" },
      { question: "다양한 소리를 내며 놀이합니다", category: "표현력" },
      { question: "말하는 사람의 얼굴을 쳐다봅니다", category: "사회적 소통" },
      { question: "웃거나 소리로 감정을 표현합니다", category: "사회적 소통" },
      { question: "배고픔, 불편함을 다른 울음소리로 표현합니다", category: "표현력" },
      { question: "어르는 말에 미소로 반응합니다", category: "이해력" },
      { question: "노래나 리듬에 몸을 움직여 반응합니다", category: "이해력" },
      { question: "주양육자와 눈을 맞추려 합니다", category: "사회적 소통" }
    ];
  } else if (months <= 12) {
    return [
      { question: "자신의 이름을 부르면 반응합니다", category: "이해력" },
      { question: "'안돼' 라는 말을 이해하는 것 같습니다", category: "이해력" },
      { question: "간단한 단어(맘마, 빠빠 등)를 말합니다", category: "표현력" },
      { question: "손짓으로 원하는 것을 가리킵니다", category: "표현력" },
      { question: "까꿍 놀이에 반응합니다", category: "사회적 소통" },
      { question: "박수치기나 바이바이를 따라합니다", category: "표현력" },
      { question: "익숙한 물건의 이름을 들으면 쳐다봅니다", category: "이해력" },
      { question: "다양한 억양의 옹알이를 합니다", category: "표현력" },
      { question: "어른의 말을 따라하려 합니다", category: "표현력" },
      { question: "간단한 동작(빠이빠이)에 반응합니다", category: "이해력" }
    ];
  } else if (months <= 18) {
    return [
      { question: "10개 이상의 단어를 말합니다", category: "표현력" },
      { question: "간단한 지시를 이해하고 따릅니다 (여기 와)", category: "이해력" },
      { question: "원하는 것을 손으로 가리키며 표현합니다", category: "표현력" },
      { question: "그림책을 보며 관심을 보입니다", category: "이해력" },
      { question: "신체 부위(코, 눈)를 물으면 가리킵니다", category: "이해력" },
      { question: "동물 소리를 흉내냅니다", category: "표현력" },
      { question: "노래를 들으면 몸을 흔들거나 반응합니다", category: "이해력" },
      { question: "자기 이름을 말할 수 있습니다", category: "표현력" },
      { question: "'엄마 어디?'와 같은 간단한 질문을 이해합니다", category: "이해력" },
      { question: "원하는 것을 말이나 몸짓으로 표현합니다", category: "표현력" }
    ];
  } else if (months <= 24) {
    return [
      { question: "50개 이상의 단어를 말합니다", category: "표현력" },
      { question: "두 단어를 조합하여 말합니다 (엄마 물)", category: "표현력" },
      { question: "간단한 질문을 이해합니다 (뭐야?)", category: "이해력" },
      { question: "그림책에서 사물을 가리킬 수 있습니다", category: "이해력" },
      { question: "자신을 '나'라고 표현합니다", category: "표현력" },
      { question: "색깔이나 크기를 구분하여 표현합니다", category: "표현력" },
      { question: "2단계 지시를 따를 수 있습니다", category: "이해력" },
      { question: "또래와 간단한 대화를 시도합니다", category: "사회적 소통" },
      { question: "노래 가사 일부를 따라 부릅니다", category: "표현력" },
      { question: "물건 이름을 물어봅니다 (이게 뭐야?)", category: "이해력" }
    ];
  } else if (months <= 36) {
    return [
      { question: "200개 이상의 단어를 사용합니다", category: "표현력" },
      { question: "3-4 단어 문장을 말합니다", category: "표현력" },
      { question: "'왜?', '뭐?' 등 질문을 합니다", category: "이해력" },
      { question: "간단한 이야기를 이해합니다", category: "이해력" },
      { question: "자신의 이름, 나이를 말할 수 있습니다", category: "표현력" },
      { question: "과거형 표현을 시도합니다", category: "표현력" },
      { question: "복잡한 지시를 이해합니다", category: "이해력" },
      { question: "역할놀이에서 대화를 합니다", category: "사회적 소통" },
      { question: "그림책 내용에 대해 질문합니다", category: "이해력" },
      { question: "자신의 감정을 말로 표현합니다", category: "표현력" }
    ];
  } else if (months <= 48) {
    return [
      { question: "복잡한 문장을 이해하고 사용합니다", category: "표현력" },
      { question: "이야기를 순서대로 말할 수 있습니다", category: "표현력" },
      { question: "다른 사람의 감정을 언어로 이해합니다", category: "이해력" },
      { question: "미래에 대해 말합니다 (내일, 나중에)", category: "표현력" },
      { question: "5-6 단어 이상의 문장을 만듭니다", category: "표현력" },
      { question: "질문에 적절하게 대답합니다", category: "이해력" },
      { question: "비슷한 말, 반대말을 알고 있습니다", category: "이해력" },
      { question: "노래를 많이 외워서 부릅니다", category: "표현력" },
      { question: "경험한 일을 다른 사람에게 설명합니다", category: "표현력" },
      { question: "왜?, 어떻게? 등의 질문에 답합니다", category: "이해력" }
    ];
  } else {
    return [
      { question: "긴 이야기를 이해하고 요약할 수 있습니다", category: "이해력" },
      { question: "복문을 자연스럽게 사용합니다", category: "표현력" },
      { question: "농담이나 비유를 이해합니다", category: "이해력" },
      { question: "순서대로 경험을 설명합니다", category: "표현력" },
      { question: "문제 상황을 언어로 설명합니다", category: "표현력" },
      { question: "다른 사람의 말을 끝까지 듣습니다", category: "사회적 소통" },
      { question: "예의 바른 언어를 상황에 맞게 사용합니다", category: "사회적 소통" },
      { question: "글자에 관심을 보이고 읽으려 합니다", category: "이해력" },
      { question: "창의적인 이야기를 만들어 말합니다", category: "표현력" },
      { question: "자신의 의견을 논리적으로 말합니다", category: "표현력" }
    ];
  }
};

const InfantLanguageTestForm = ({ onComplete, onBack }: InfantLanguageTestFormProps) => {
  const [step, setStep] = useState<'age-input' | 'test'>('age-input');
  const [ageInMonths, setAgeInMonths] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const { consumeTokens } = useTokens();

  const questions = getQuestionsForAge(ageInMonths);
  const progress = step === 'test' ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  const handleAgeSubmit = () => {
    if (ageInMonths > 0 && ageInMonths <= 72) {
      setAnswers(new Array(questions.length).fill(""));
      setStep('test');
    }
  };

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
    
    // 자동으로 다음 질문으로 이동
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        handleComplete(newAnswers);
      }
    }, 300);
  };

  const handleComplete = (finalAnswers: string[]) => {
    const numericAnswers = finalAnswers.map(a => {
      const parsed = parseInt(a);
      return isNaN(parsed) ? 0 : parsed;
    });
    
    const total = numericAnswers.reduce((sum, answer) => sum + answer, 0);
    const average = Math.round((total / numericAnswers.length) * 10) / 10;
    const detailedAgeGroup = getDetailedAgeGroup(ageInMonths);
    
    onComplete({
      answers: numericAnswers,
      total,
      average,
      ageGroup: '영유아',
      age: ageInMonths,
      detailedAgeGroup,
      ageInMonths
    });
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleStartTest = async () => {
    const success = await consumeTokens(TOKEN_COSTS.LANGUAGE_TEST);
    if (success) {
      setHasStarted(true);
    }
  };

  // 개월수 입력 화면
  if (step === 'age-input') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gentle-peach/30 via-background to-calm-blue/20">
        <UnifiedNavigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
                <Baby className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary">영유아 언어발달 검사</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                아이의 개월수를 입력해주세요
              </h1>
              <p className="text-muted-foreground">
                정확한 개월수에 맞춰 맞춤형 질문이 제공됩니다
              </p>
            </div>

            <Card className="p-8 shadow-lg">
              <div className="space-y-6">
                <div className="text-center">
                  <Label className="text-lg font-semibold mb-4 block">
                    아이의 현재 개월수
                  </Label>
                  
                  <div className="flex items-center justify-center gap-4">
                    <input
                      type="number"
                      min="1"
                      max="72"
                      value={ageInMonths || ''}
                      onChange={(e) => setAgeInMonths(parseInt(e.target.value) || 0)}
                      className="w-32 p-4 text-3xl text-center font-bold border-2 border-primary/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="0"
                    />
                    <span className="text-2xl font-semibold text-muted-foreground">개월</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-4">
                    1개월 ~ 72개월 (0~6세) 사이의 개월수를 입력해주세요
                  </p>
                </div>

                {/* 개월수 빠른 선택 버튼 */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground text-center">빠른 선택</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[6, 12, 18, 24, 30, 36, 48, 60].map((months) => (
                      <Button
                        key={months}
                        variant={ageInMonths === months ? "default" : "outline"}
                        className="text-sm"
                        onClick={() => setAgeInMonths(months)}
                      >
                        {months}개월
                      </Button>
                    ))}
                  </div>
                </div>

                {ageInMonths > 0 && (
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-center text-sm">
                      <span className="font-semibold text-primary">{getDetailedAgeGroup(ageInMonths)}</span> 발달 단계에 맞는 질문이 제공됩니다
                    </p>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={handleAgeSubmit}
                    disabled={!ageInMonths || ageInMonths < 1 || ageInMonths > 72}
                    className="flex-1 btn-brand"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    검사 시작하기
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // 토큰 게이트
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gentle-peach/30 via-background to-calm-blue/20 p-6 flex items-center justify-center">
        <TokenGate
          tokensRequired={TOKEN_COSTS.LANGUAGE_TEST}
          featureName={`영유아 언어발달 검사 (${ageInMonths}개월 맞춤 10문항)`}
          onProceed={handleStartTest}
        />
      </div>
    );
  }

  const currentAnswer = answers[currentQuestion];

  // 검사 화면
  return (
    <div className="min-h-screen bg-gradient-to-br from-gentle-peach/30 via-background to-calm-blue/20">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full mb-2">
              <Baby className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {ageInMonths}개월 • {getDetailedAgeGroup(ageInMonths)}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">영유아 언어발달 검사</h1>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>질문 {currentQuestion + 1} / {questions.length}</span>
              <span>{Math.round(progress)}% 완료</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <Card className="p-6 shadow-lg">
            {/* Category Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-accent/20 text-accent-foreground text-xs font-medium rounded-full">
                {questions[currentQuestion].category}
              </span>
            </div>

            {/* Question */}
            <h2 className="text-xl font-semibold text-foreground mb-6">
              {questions[currentQuestion].question}
            </h2>

            {/* Answer Options */}
            <RadioGroup 
              value={currentAnswer} 
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              <div 
                className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  currentAnswer === "3" 
                    ? "border-green-500 bg-green-50 dark:bg-green-950/30" 
                    : "border-border hover:border-green-300 hover:bg-green-50/50"
                }`}
                onClick={() => handleAnswer("3")}
              >
                <RadioGroupItem value="3" id="option3" className="text-green-600" />
                <Label htmlFor="option3" className="flex-1 cursor-pointer">
                  <span className="font-medium text-green-700 dark:text-green-400">항상 그렇다</span>
                  <span className="text-muted-foreground ml-2">(3점)</span>
                </Label>
                {currentAnswer === "3" && <Check className="w-5 h-5 text-green-600" />}
              </div>

              <div 
                className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  currentAnswer === "2" 
                    ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30" 
                    : "border-border hover:border-yellow-300 hover:bg-yellow-50/50"
                }`}
                onClick={() => handleAnswer("2")}
              >
                <RadioGroupItem value="2" id="option2" className="text-yellow-600" />
                <Label htmlFor="option2" className="flex-1 cursor-pointer">
                  <span className="font-medium text-yellow-700 dark:text-yellow-400">가끔 그렇다</span>
                  <span className="text-muted-foreground ml-2">(2점)</span>
                </Label>
                {currentAnswer === "2" && <Check className="w-5 h-5 text-yellow-600" />}
              </div>

              <div 
                className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  currentAnswer === "1" 
                    ? "border-red-500 bg-red-50 dark:bg-red-950/30" 
                    : "border-border hover:border-red-300 hover:bg-red-50/50"
                }`}
                onClick={() => handleAnswer("1")}
              >
                <RadioGroupItem value="1" id="option1" className="text-red-600" />
                <Label htmlFor="option1" className="flex-1 cursor-pointer">
                  <span className="font-medium text-red-700 dark:text-red-400">전혀 아니다</span>
                  <span className="text-muted-foreground ml-2">(1점)</span>
                </Label>
                {currentAnswer === "1" && <Check className="w-5 h-5 text-red-600" />}
              </div>
            </RadioGroup>

            {/* Navigation */}
            <div className="flex justify-between pt-6 mt-6 border-t">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                이전
              </Button>
              
              <div className="flex gap-1">
                {questions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full ${
                      idx === currentQuestion 
                        ? 'bg-primary' 
                        : answers[idx] 
                          ? 'bg-primary/50' 
                          : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              <Button 
                onClick={() => {
                  if (currentQuestion === questions.length - 1) {
                    handleComplete(answers);
                  } else {
                    setCurrentQuestion(currentQuestion + 1);
                  }
                }}
                disabled={!currentAnswer}
                className="btn-brand"
              >
                {currentQuestion === questions.length - 1 ? '결과 보기' : '다음'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InfantLanguageTestForm;
