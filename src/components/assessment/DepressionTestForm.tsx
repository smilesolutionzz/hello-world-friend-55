import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { TOKEN_COSTS } from "@/constants/tokenCosts";
import { useTokens } from "@/hooks/useTokens";
import TokenGate from "@/components/TokenGate";
import { useLanguage } from "@/i18n";

interface DepressionTestFormProps {
  ageGroup?: 'child' | 'adolescent' | 'adult';
  onComplete: (results: {answers: number[], total: number, average: number, severity: string, ageGroup: string}) => void;
  onBack: () => void;
}

const childQKo = ["나는 슬프지 않다","나는 앞으로 좋은 일이 생길 거라고 생각한다","나는 실패한 것 같은 느낌이 들지 않는다","나는 예전처럼 놀이나 활동이 재미있다","나는 내가 나쁜 아이라고 생각하지 않는다","나는 혼날 것 같은 느낌이 들지 않는다","나는 나 자신이 싫지 않다","나는 나쁜 일이 일어나면 내 탓이라고 생각하지 않는다","나는 평소보다 더 울지 않는다","나는 평소보다 더 걱정하지 않는다","나는 친구들과 노는 것이 좋다","나는 결정을 잘 내릴 수 있다","나는 내 외모가 괜찮다고 생각한다","나는 숙제나 공부를 할 수 있다","나는 잠을 잘 잔다","나는 평소처럼 힘이 있다","나는 밥을 잘 먹는다","나는 아프지 않다","나는 외롭지 않다","나는 학교 가는 것이 싫지 않다","나는 가족들과 지내는 것이 좋다"];
const childQEn = ["I am not sad","I think good things will happen","I don't feel like a failure","Activities are still fun like before","I don't think I'm a bad kid","I don't feel like I'll get in trouble","I don't dislike myself","I don't blame myself when bad things happen","I don't cry more than usual","I don't worry more than usual","I enjoy playing with friends","I can make decisions well","I think I look okay","I can do my homework and studies","I sleep well","I have energy like usual","I eat well","I'm not in pain","I'm not lonely","I don't dislike going to school","I enjoy being with family"];

const adolQKo = ["나는 슬프지 않다","나는 앞날에 대해 낙담하거나 실망하지 않는다","나는 실패자라는 느낌이 들지 않는다","나는 예전과 똑같이 일상생활에서 만족과 기쁨을 느낀다","나는 특별히 죄책감을 느끼지 않는다","나는 벌을 받고 있다는 느낌이 들지 않는다","나는 나 자신에 대해 실망하거나 혐오감을 느끼지 않는다","나는 일상적인 일들에 대해 평소보다 나 자신을 더 탓하지 않는다","나는 자해에 대한 생각이 없다","나는 평소보다 더 울지 않는다","나는 평소보다 더 초조하거나 불안하지 않다","나는 친구들에 대한 관심을 잃지 않았다","나는 평소만큼 쉽게 결정을 내린다","나는 내 외모에 대해 걱정하지 않는다","나는 예전처럼 학업이나 활동을 할 수 있다","나는 평소처럼 잠을 잘 잔다","나는 평소보다 더 피곤하지 않다","나는 평소와 다름없이 식욕이 좋다","나는 최근에 체중이 별로 줄지 않았다","나는 평소보다 내 건강을 더 염려하지 않는다","나는 취미활동에 대한 관심이 평소와 다르지 않다"];
const adolQEn = ["I am not sad","I am not discouraged about the future","I don't feel like a failure","I feel satisfied with daily life just like before","I don't feel particularly guilty","I don't feel like I'm being punished","I'm not disappointed or disgusted with myself","I don't blame myself more than usual","I have no thoughts of self-harm","I don't cry more than usual","I'm not more restless or anxious than usual","I haven't lost interest in friends","I make decisions as easily as before","I'm not worried about my appearance","I can do schoolwork as before","I sleep as well as usual","I'm not more tired than usual","My appetite is normal","I haven't lost much weight recently","I don't worry about my health more than usual","My interest in hobbies is unchanged"];

const adultQKo = ["나는 슬프지 않다","나는 앞날에 대해 낙담하거나 실망하지 않는다","나는 실패자라는 느낌이 들지 않는다","나는 예전과 똑같이 일상생활에서 만족과 기쁨을 느낀다","나는 특별히 죄책감을 느끼지 않는다","나는 벌을 받고 있다는 느낌이 들지 않는다","나는 나 자신에 대해 실망하거나 혐오감을 느끼지 않는다","나는 일상적인 일들에 대해 평소보다 나 자신을 더 탓하지 않는다","나는 자해에 대한 생각이 없다","나는 평소보다 더 울지 않는다","나는 평소보다 더 초조하거나 불안하지 않다","나는 다른 사람들에 대한 관심을 잃지 않았다","나는 평소만큼 쉽게 결정을 내린다","나는 내가 예전보다 더 못생겨 보인다고 걱정하지 않는다","나는 예전처럼 일을 할 수 있다","나는 평소처럼 잠을 잘 잔다","나는 평소보다 더 피곤하지 않다","나는 평소와 다름없이 식욕이 좋다","나는 최근에 체중이 별로 줄지 않았다","나는 평소보다 내 건강을 더 염려하지 않는다","나는 일상 활동에 대한 흥미가 평소와 다르지 않다"];
const adultQEn = ["I am not sad","I am not discouraged about the future","I don't feel like a failure","I feel satisfied with daily life just like before","I don't feel particularly guilty","I don't feel like I'm being punished","I'm not disappointed or disgusted with myself","I don't blame myself more than usual","I have no thoughts of self-harm","I don't cry more than usual","I'm not more restless or anxious than usual","I haven't lost interest in other people","I make decisions as easily as before","I'm not worried about looking worse than before","I can work as well as before","I sleep as well as usual","I'm not more tired than usual","My appetite is normal","I haven't lost much weight recently","I don't worry about my health more than usual","My interest in daily activities is unchanged"];

const getQuestions = (ageGroup: 'child' | 'adolescent' | 'adult', isEn: boolean) => {
  if (ageGroup === 'child') return isEn ? childQEn : childQKo;
  if (ageGroup === 'adolescent') return isEn ? adolQEn : adolQKo;
  return isEn ? adultQEn : adultQKo;
};

const getAgeGroupLabel = (ageGroup: 'child' | 'adolescent' | 'adult', isEn: boolean) => {
  if (ageGroup === 'child') return isEn ? 'Child (7-12)' : '아동 (7-12세)';
  if (ageGroup === 'adolescent') return isEn ? 'Adolescent (13-18)' : '청소년 (13-18세)';
  return isEn ? 'Adult (19+)' : '성인 (19세 이상)';
};

const DepressionTestForm = ({ ageGroup = 'adult', onComplete, onBack }: DepressionTestFormProps) => {
  const { isEnglish } = useLanguage();
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<'child' | 'adolescent' | 'adult' | null>(ageGroup || null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const { consumeTokens } = useTokens();

  const questions = selectedAgeGroup ? getQuestions(selectedAgeGroup, isEnglish) : [];
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  const handleAgeGroupSelect = (group: 'child' | 'adolescent' | 'adult') => {
    setSelectedAgeGroup(group);
    setAnswers(new Array(getQuestions(group, isEnglish).length).fill(""));
  };

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      setTimeout(() => calculateResults(newAnswers), 300);
    }
  };

  const calculateResults = (finalAnswers: string[]) => {
    const numericAnswers = finalAnswers.map(a => {
      const parsed = parseInt(a);
      if (isNaN(parsed)) return 0;
      return 3 - parsed;
    });
    
    const total = numericAnswers.reduce((sum, answer) => sum + answer, 0);
    const average = total > 0 ? Math.round((total / questions.length) * 10) / 10 : 0;
    
    let severity = "";
    if (total <= 13) severity = isEnglish ? "Normal" : "정상";
    else if (total <= 19) severity = isEnglish ? "Mild Depression" : "가벼운 우울";
    else if (total <= 28) severity = isEnglish ? "Moderate Depression" : "중등도 우울";
    else severity = isEnglish ? "Severe Depression" : "심한 우울";
    
    onComplete({ answers: numericAnswers, total, average, severity, ageGroup: getAgeGroupLabel(selectedAgeGroup!, isEnglish) });
  };

  const handlePrevious = () => { if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1); };
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1);
    else calculateResults(answers);
  };

  const currentAnswer = answers[currentQuestion] || "";
  const canProceed = currentAnswer !== "";

  const handleStartTest = async () => {
    const success = await consumeTokens(TOKEN_COSTS.DEPRESSION_TEST);
    if (success) setHasStarted(true);
  };

  const answerOptions = isEnglish
    ? [{ v: "1", l: "Not true (1)" }, { v: "2", l: "Somewhat (2)" }, { v: "3", l: "True (3)" }]
    : [{ v: "1", l: "그렇지 않다 (1점)" }, { v: "2", l: "보통이다 (2점)" }, { v: "3", l: "그렇다 (3점)" }];

  if (!selectedAgeGroup) {
    return (
      <Card className="max-w-2xl mx-auto p-8">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{isEnglish ? "Select your age group" : "연령대를 선택해주세요"}</h2>
            <p className="text-muted-foreground">{isEnglish ? "Questions are tailored to your age" : "연령에 맞는 검사 문항이 제공됩니다"}</p>
          </div>
          <div className="grid gap-4">
            {(['child', 'adolescent', 'adult'] as const).map(g => (
              <Button key={g} variant="outline" className="h-auto p-6 flex flex-col items-start text-left hover:bg-primary/5 hover:border-primary" onClick={() => handleAgeGroupSelect(g)}>
                <span className="text-lg font-semibold">{getAgeGroupLabel(g, isEnglish)}</span>
                <span className="text-sm text-muted-foreground">
                  {isEnglish
                    ? g === 'child' ? 'Elementary school items' : g === 'adolescent' ? 'Middle/high school items' : 'Adult items'
                    : g === 'child' ? '초등학생 대상 문항' : g === 'adolescent' ? '중고등학생 대상 문항' : '성인 대상 문항'}
                </span>
              </Button>
            ))}
          </div>
          <Button variant="ghost" onClick={onBack} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isEnglish ? "Back" : "뒤로가기"}
          </Button>
        </div>
      </Card>
    );
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6 flex items-center justify-center">
        <TokenGate
          tokensRequired={TOKEN_COSTS.DEPRESSION_TEST}
          featureName={isEnglish ? `Depression Self-Check - ${getAgeGroupLabel(selectedAgeGroup, isEnglish)} (21 items)` : `우울증 자가체크 - ${getAgeGroupLabel(selectedAgeGroup, isEnglish)} (21문항)`}
          featureKey="DEPRESSION_TEST"
          onProceed={handleStartTest}
        />
      </div>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            {isEnglish ? "Back" : "뒤로가기"}
          </Button>
          <div className="text-right">
            <span className="text-xs text-muted-foreground block">{getAgeGroupLabel(selectedAgeGroup, isEnglish)}</span>
            <span className="text-sm text-muted-foreground">{currentQuestion + 1} / {questions.length}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-center text-sm text-muted-foreground">
            {isEnglish ? `Progress: ${Math.round(progress)}%` : `진행률: ${Math.round(progress)}%`}
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-center">{questions[currentQuestion]}</h2>
          <RadioGroup value={currentAnswer} onValueChange={handleAnswer} className="space-y-4">
            {answerOptions.map((opt, i) => (
              <div key={i} className="flex items-center space-x-2">
                <RadioGroupItem value={opt.v} id={`depression-q${currentQuestion}-opt${i}`} />
                <Label htmlFor={`depression-q${currentQuestion}-opt${i}`} className="text-base cursor-pointer">{opt.l}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between items-center pt-6">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
            {isEnglish ? "Previous" : "이전"}
          </Button>
          <span className="text-sm text-muted-foreground">
            {isEnglish ? "Auto-advances on selection" : "답변 선택 시 자동으로 넘어갑니다"}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default DepressionTestForm;
