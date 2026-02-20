import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

interface DevelopmentalDelayTestFormProps {
  onComplete: (results: { answers: number[]; total: number; average: number; ageGroup: string; severity: string; selectedAgeRange?: string }) => void;
  onBack: () => void;
}

const questionsKo = [
  "아이가 또래 아이들과 비교해 언어 발달이 늦다고 느끼시나요?",
  "아이가 간단한 지시사항을 이해하고 따르는 데 어려움이 있나요?",
  "아이가 걸음마를 시작한 시기가 늦었다고 생각하시나요?",
  "아이가 눈맞춤을 잘 하지 않거나 피하는 경향이 있나요?",
  "아이가 놀이에 집중하는 시간이 매우 짧나요?",
  "아이가 새로운 환경이나 사람에 대한 적응이 어려운가요?",
  "아이가 또래와의 상호작용에 관심을 보이지 않나요?",
  "아이가 반복적인 행동이나 관심사에 집착하는 경향이 있나요?",
  "아이가 감정 표현이나 조절에 어려움을 보이나요?",
  "아이가 소근육 발달(그리기, 블록 쌓기 등)이 늦다고 느끼시나요?",
  "아이가 대근육 발달(뛰기, 점프 등)이 늦다고 느끼시나요?",
  "아이가 일상생활 기술(식사, 옷 입기 등) 습득이 어려운가요?",
  "아이가 학습 능력이나 기억력에 문제가 있다고 생각하시나요?",
  "아이가 주의 집중에 어려움을 보이나요?",
  "아이가 사회적 상황에서 적절한 반응을 보이지 못하나요?",
  "아이가 변화에 대한 적응력이 떨어지나요?",
  "아이가 문제 해결 능력이 또래에 비해 부족하다고 느끼시나요?",
  "아이가 창의적 놀이나 상상놀이에 관심이 적나요?",
  "아이가 규칙적인 일과나 루틴을 따르는 데 어려움이 있나요?",
  "전반적으로 아이의 발달이 걱정스럽다고 느끼시나요?"
];

const questionsEn = [
  "Do you feel your child's language development is delayed compared to peers?",
  "Does your child have difficulty understanding and following simple instructions?",
  "Do you think your child started walking later than expected?",
  "Does your child tend to avoid or not make eye contact?",
  "Is your child's attention span during play very short?",
  "Does your child have difficulty adapting to new environments or people?",
  "Does your child show no interest in interacting with peers?",
  "Does your child tend to fixate on repetitive behaviors or interests?",
  "Does your child show difficulty expressing or regulating emotions?",
  "Do you feel your child's fine motor development (drawing, stacking blocks) is delayed?",
  "Do you feel your child's gross motor development (running, jumping) is delayed?",
  "Does your child have difficulty acquiring daily living skills (eating, dressing)?",
  "Do you think your child has problems with learning ability or memory?",
  "Does your child show difficulty with attention and focus?",
  "Does your child fail to respond appropriately in social situations?",
  "Does your child have poor adaptability to changes?",
  "Do you feel your child's problem-solving ability is lacking compared to peers?",
  "Does your child show little interest in creative or imaginative play?",
  "Does your child have difficulty following regular routines?",
  "Overall, do you feel concerned about your child's development?"
];

const ageRangesKo = [
  { label: "0~12개월", value: "0-12m" },
  { label: "13~24개월", value: "13-24m" },
  { label: "25~36개월", value: "25-36m" },
  { label: "37~48개월", value: "37-48m" },
  { label: "49~60개월", value: "49-60m" },
  { label: "5~7세", value: "5-7y" },
];

const ageRangesEn = [
  { label: "0-12 months", value: "0-12m" },
  { label: "13-24 months", value: "13-24m" },
  { label: "25-36 months", value: "25-36m" },
  { label: "37-48 months", value: "37-48m" },
  { label: "49-60 months", value: "49-60m" },
  { label: "5-7 years", value: "5-7y" },
];

const optionsKo = ["전혀 그렇지 않다", "거의 그렇지 않다", "가끔 그렇다", "자주 그렇다", "매우 그렇다"];
const optionsEn = ["Not at all", "Rarely", "Sometimes", "Often", "Very much"];

const DevelopmentalDelayTestForm = ({ onComplete, onBack }: DevelopmentalDelayTestFormProps) => {
  const [selectedAgeRange, setSelectedAgeRange] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(questionsKo.length).fill(""));
  const { toast } = useToast();
  const { isEnglish } = useLanguage();

  const questions = isEnglish ? questionsEn : questionsKo;
  const options = isEnglish ? optionsEn : optionsKo;
  const ageRanges = isEnglish ? ageRangesEn : ageRangesKo;

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
    
    toast({ description: isEnglish ? "Answer saved" : "답변이 저장되었습니다", duration: 1000 });
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleComplete(newAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const handleComplete = (finalAnswers = answers) => {
    const numericAnswers = finalAnswers.map(a => { const p = parseInt(a); return isNaN(p) ? 0 : p; });
    const total = numericAnswers.reduce((sum, answer) => sum + answer, 0);
    const average = total / numericAnswers.length;
    
    let severity = isEnglish ? "Normal" : "정상";
    if (total >= 60) severity = isEnglish ? "Severe" : "심각";
    else if (total >= 40) severity = isEnglish ? "Moderate" : "중등도";
    else if (total >= 20) severity = isEnglish ? "Mild" : "경미";

    onComplete({ answers: numericAnswers, total, average, ageGroup: isEnglish ? "Children" : "아동", severity, selectedAgeRange: selectedAgeRange || undefined });
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (!selectedAgeRange) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ChevronLeft className="w-4 h-4 mr-2" />
            {isEnglish ? "Back" : "뒤로가기"}
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{isEnglish ? "Please select your child's age range" : "아이의 연령대를 선택해주세요"}</CardTitle>
            <p className="text-sm text-muted-foreground">{isEnglish ? "Developmental standards vary by age, so accurate age selection is important." : "연령에 따라 발달 기준이 다르므로, 정확한 연령 선택이 중요합니다."}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {ageRanges.map((range) => (
                <Button key={range.value} variant="outline" className="h-14 text-base" onClick={() => setSelectedAgeRange(range.value)}>
                  {range.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setSelectedAgeRange(null)} className="mb-4">
          <ChevronLeft className="w-4 h-4 mr-2" />
          {isEnglish ? "Back" : "뒤로가기"}
        </Button>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{isEnglish ? "Question" : "질문"} {currentQuestion + 1} / {questions.length}</span>
            <span>{Math.round(progress)}% {isEnglish ? "complete" : "완료"}</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{questions[currentQuestion]}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup key={currentQuestion} value={answers[currentQuestion]} onValueChange={handleAnswerChange} className="space-y-3">
            {options.map((label, i) => (
              <div key={i} className="flex items-center space-x-2">
                <RadioGroupItem value={i.toString()} id={`q${currentQuestion}-option${i}`} />
                <Label htmlFor={`q${currentQuestion}-option${i}`} className="cursor-pointer">{label}</Label>
              </div>
            ))}
          </RadioGroup>
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              {isEnglish ? "Previous" : "이전"}
            </Button>
            <div className="text-sm text-muted-foreground">
              {isEnglish ? "Select an answer to proceed" : "답변을 선택하면 자동으로 다음으로 넘어갑니다"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevelopmentalDelayTestForm;
