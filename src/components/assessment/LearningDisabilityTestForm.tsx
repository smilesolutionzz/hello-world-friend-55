import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

interface LearningDisabilityTestFormProps {
  onComplete: (results: { answers: number[]; total: number; average: number; ageGroup: string; severity: string }) => void;
  onBack: () => void;
}

const questionsKo = [
  "아이가 또래에 비해 읽기 능력이 현저히 부족한가요?",
  "아이가 글자를 거꾸로 쓰거나 순서를 바꿔서 쓰는 경우가 자주 있나요?",
  "아이가 단순한 계산 문제도 어려워하나요?",
  "아이가 숫자의 순서나 개념을 이해하는 데 어려움이 있나요?",
  "아이가 지시사항을 듣고 기억하는 데 어려움이 있나요?",
  "아이가 학습한 내용을 금방 잊어버리는 경우가 많나요?",
  "아이가 집중해야 할 때 주의가 쉽게 산만해지나요?",
  "아이가 과제를 끝까지 완성하는 데 어려움이 있나요?",
  "아이가 글쓰기나 받아쓰기에 특별한 어려움을 보이나요?",
  "아이가 시간 개념(어제, 오늘, 내일 등)을 이해하기 어려워하나요?",
  "아이가 공간 지각(위, 아래, 좌, 우 등)에 어려움이 있나요?",
  "아이가 순서나 단계를 기억하고 따르는 데 어려움이 있나요?",
  "아이가 새로운 학습 내용을 받아들이는 속도가 매우 느린가요?",
  "아이가 또래와의 학습 격차가 점점 벌어지고 있나요?",
  "아이가 학습에 대한 의욕이나 자신감이 부족한가요?",
  "아이가 문제 해결을 위한 전략을 스스로 찾지 못하나요?",
  "아이가 언어적 설명을 이해하는 데 어려움이 있나요?",
  "아이가 시각적 정보 처리에 어려움을 보이나요?",
  "아이가 추상적 개념 이해가 어려운가요?",
  "아이가 학습 관련 스트레스나 불안을 자주 보이나요?"
];

const questionsEn = [
  "Is your child's reading ability significantly below peers?",
  "Does your child frequently write letters backwards or in wrong order?",
  "Does your child struggle with even simple math problems?",
  "Does your child have difficulty understanding number sequences or concepts?",
  "Does your child have difficulty hearing and remembering instructions?",
  "Does your child often quickly forget what was learned?",
  "Does your child get easily distracted when needing to focus?",
  "Does your child have difficulty completing tasks to the end?",
  "Does your child show particular difficulty with writing or dictation?",
  "Does your child have difficulty understanding time concepts (yesterday, today, tomorrow)?",
  "Does your child have difficulty with spatial awareness (up, down, left, right)?",
  "Does your child have difficulty remembering and following sequences or steps?",
  "Is your child very slow at absorbing new learning content?",
  "Is the learning gap between your child and peers widening?",
  "Does your child lack motivation or confidence in learning?",
  "Does your child struggle to find problem-solving strategies on their own?",
  "Does your child have difficulty understanding verbal explanations?",
  "Does your child show difficulty processing visual information?",
  "Does your child have difficulty understanding abstract concepts?",
  "Does your child frequently show stress or anxiety related to learning?"
];

const optionsKo = ["전혀 그렇지 않다", "거의 그렇지 않다", "가끔 그렇다", "자주 그렇다", "매우 그렇다"];
const optionsEn = ["Not at all", "Rarely", "Sometimes", "Often", "Very much"];

const LearningDisabilityTestForm = ({ onComplete, onBack }: LearningDisabilityTestFormProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(questionsKo.length).fill(""));
  const { toast } = useToast();
  const { isEnglish } = useLanguage();

  const questions = isEnglish ? questionsEn : questionsKo;
  const options = isEnglish ? optionsEn : optionsKo;

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleComplete(newAnswers);
    }
  };

  const handleComplete = (finalAnswers = answers) => {
    const numericAnswers = finalAnswers.map(a => { const p = parseInt(a); return isNaN(p) ? 0 : p; });
    const total = numericAnswers.reduce((sum, answer) => sum + answer, 0);
    const average = total / numericAnswers.length;
    let severity = isEnglish ? "Normal" : "정상";
    if (total >= 60) severity = isEnglish ? "Severe" : "심각";
    else if (total >= 40) severity = isEnglish ? "Moderate" : "중등도";
    else if (total >= 20) severity = isEnglish ? "Mild" : "경미";
    onComplete({ answers: numericAnswers, total, average, ageGroup: isEnglish ? "School-age" : "학령기", severity });
  };

  const handlePrevious = () => { if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1); };
  if (currentQuestion >= questions.length) return null;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ChevronLeft className="w-4 h-4 mr-2" />{isEnglish ? "Back" : "뒤로가기"}
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
        <CardHeader><CardTitle className="text-lg">{questions[currentQuestion]}</CardTitle></CardHeader>
        <CardContent>
          <RadioGroup value={answers[currentQuestion]} onValueChange={handleAnswerChange} className="space-y-3">
            {options.map((label, i) => (
              <div key={i} className="flex items-center space-x-2">
                <RadioGroupItem value={i.toString()} id={`option${i}`} />
                <Label htmlFor={`option${i}`} className="cursor-pointer">{label}</Label>
              </div>
            ))}
          </RadioGroup>
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
              <ChevronLeft className="w-4 h-4 mr-2" />{isEnglish ? "Previous" : "이전"}
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

export default LearningDisabilityTestForm;
