import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/i18n";

// EPDS (Edinburgh Postnatal Depression Scale) - Cox et al., 1987
// 한국어 표준화 버전 기반
const questionsKo = [
  { id: "epds1", text: "나는 웃을 수 있었고, 일상의 재미있는 면을 볼 수 있었다.", options: [{ value: "0", label: "예전과 같이 그렇다" }, { value: "1", label: "예전만큼은 아니지만 그렇다" }, { value: "2", label: "확실히 예전보다 그렇지 못하다" }, { value: "3", label: "전혀 그렇지 못하다" }] },
  { id: "epds2", text: "나는 즐거운 기대감을 가지고 앞일을 바라보았다.", options: [{ value: "0", label: "예전과 같이 그렇다" }, { value: "1", label: "예전보다는 덜 그렇다" }, { value: "2", label: "확실히 예전보다 덜 그렇다" }, { value: "3", label: "거의 그렇지 못하다" }] },
  { id: "epds3", text: "일이 잘못될 때 불필요하게 자신을 탓하였다.", options: [{ value: "3", label: "대부분 그랬다" }, { value: "2", label: "가끔 그랬다" }, { value: "1", label: "자주 그렇지는 않았다" }, { value: "0", label: "전혀 그렇지 않았다" }] },
  { id: "epds4", text: "특별한 이유 없이 불안하거나 걱정이 되었다.", options: [{ value: "0", label: "전혀 그렇지 않았다" }, { value: "1", label: "거의 그렇지 않았다" }, { value: "2", label: "가끔 그랬다" }, { value: "3", label: "자주 그랬다" }] },
  { id: "epds5", text: "특별한 이유 없이 무섭거나 공포감을 느꼈다.", options: [{ value: "3", label: "상당히 많이 그랬다" }, { value: "2", label: "가끔 그랬다" }, { value: "1", label: "별로 그렇지 않았다" }, { value: "0", label: "전혀 그렇지 않았다" }] },
  { id: "epds6", text: "일들이 내게 벅차게 다가왔다.", options: [{ value: "3", label: "대부분 감당할 수 없었다" }, { value: "2", label: "가끔 평소처럼 대처하지 못했다" }, { value: "1", label: "대부분 잘 대처해왔다" }, { value: "0", label: "평소처럼 잘 대처해왔다" }] },
  { id: "epds7", text: "너무 불행한 기분이 들어 잠을 잘 수가 없었다.", options: [{ value: "3", label: "대부분 그랬다" }, { value: "2", label: "가끔 그랬다" }, { value: "1", label: "자주 그렇지는 않았다" }, { value: "0", label: "전혀 그렇지 않았다" }] },
  { id: "epds8", text: "슬프거나 비참한 느낌이 들었다.", options: [{ value: "3", label: "대부분 그랬다" }, { value: "2", label: "꽤 자주 그랬다" }, { value: "1", label: "자주 그렇지는 않았다" }, { value: "0", label: "전혀 그렇지 않았다" }] },
  { id: "epds9", text: "너무 불행한 기분이 들어 울었다.", options: [{ value: "3", label: "대부분 그랬다" }, { value: "2", label: "꽤 자주 그랬다" }, { value: "1", label: "가끔 그랬다" }, { value: "0", label: "전혀 그렇지 않았다" }] },
  { id: "epds10", text: "자해에 대한 생각이 들었다.", options: [{ value: "3", label: "꽤 자주 그랬다" }, { value: "2", label: "가끔 그랬다" }, { value: "1", label: "거의 그렇지 않았다" }, { value: "0", label: "전혀 그렇지 않았다" }] },
];

const questionsEn = [
  { id: "epds1", text: "I have been able to laugh and see the funny side of things.", options: [{ value: "0", label: "As much as I always could" }, { value: "1", label: "Not quite so much now" }, { value: "2", label: "Definitely not so much now" }, { value: "3", label: "Not at all" }] },
  { id: "epds2", text: "I have looked forward with enjoyment to things.", options: [{ value: "0", label: "As much as I ever did" }, { value: "1", label: "Rather less than I used to" }, { value: "2", label: "Definitely less than I used to" }, { value: "3", label: "Hardly at all" }] },
  { id: "epds3", text: "I have blamed myself unnecessarily when things went wrong.", options: [{ value: "3", label: "Yes, most of the time" }, { value: "2", label: "Yes, some of the time" }, { value: "1", label: "Not very often" }, { value: "0", label: "No, never" }] },
  { id: "epds4", text: "I have been anxious or worried for no good reason.", options: [{ value: "0", label: "No, not at all" }, { value: "1", label: "Hardly ever" }, { value: "2", label: "Yes, sometimes" }, { value: "3", label: "Yes, very often" }] },
  { id: "epds5", text: "I have felt scared or panicky for no very good reason.", options: [{ value: "3", label: "Yes, quite a lot" }, { value: "2", label: "Yes, sometimes" }, { value: "1", label: "No, not much" }, { value: "0", label: "No, not at all" }] },
  { id: "epds6", text: "Things have been getting on top of me.", options: [{ value: "3", label: "Yes, most of the time I haven't been able to cope at all" }, { value: "2", label: "Yes, sometimes I haven't been coping as well as usual" }, { value: "1", label: "No, most of the time I have coped quite well" }, { value: "0", label: "No, I have been coping as well as ever" }] },
  { id: "epds7", text: "I have been so unhappy that I have had difficulty sleeping.", options: [{ value: "3", label: "Yes, most of the time" }, { value: "2", label: "Yes, sometimes" }, { value: "1", label: "Not very often" }, { value: "0", label: "No, not at all" }] },
  { id: "epds8", text: "I have felt sad or miserable.", options: [{ value: "3", label: "Yes, most of the time" }, { value: "2", label: "Yes, quite often" }, { value: "1", label: "Not very often" }, { value: "0", label: "No, not at all" }] },
  { id: "epds9", text: "I have been so unhappy that I have been crying.", options: [{ value: "3", label: "Yes, most of the time" }, { value: "2", label: "Yes, quite often" }, { value: "1", label: "Only occasionally" }, { value: "0", label: "No, never" }] },
  { id: "epds10", text: "The thought of harming myself has occurred to me.", options: [{ value: "3", label: "Yes, quite often" }, { value: "2", label: "Sometimes" }, { value: "1", label: "Hardly ever" }, { value: "0", label: "Never" }] },
];

interface EpdsTestFormProps {
  onComplete: (results: { answers: number[]; total: number; average: number; severity: string }) => void;
  onBack?: () => void;
}

const EpdsTestForm = ({ onComplete, onBack }: EpdsTestFormProps) => {
  const { isEnglish } = useLanguage();
  const questions = isEnglish ? questionsEn : questionsKo;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(questions.length).fill(""));

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        submitResults(newAnswers);
      }
    }, 400);
  };

  const submitResults = (finalAnswers: string[]) => {
    const numericAnswers = finalAnswers.map(a => parseInt(a) || 0);
    const total = numericAnswers.reduce((sum, v) => sum + v, 0);
    const average = total / questions.length;

    // EPDS scoring: 0-9 낮은 위험, 10-12 경계, 13+ 높은 위험
    let severity: string;
    if (total >= 13) severity = isEnglish ? 'High Risk' : '높은 위험';
    else if (total >= 10) severity = isEnglish ? 'Borderline' : '경계';
    else severity = isEnglish ? 'Low Risk' : '낮은 위험';

    onComplete({ answers: numericAnswers, total, average, severity });
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const q = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {isEnglish ? 'Back' : '돌아가기'}
            </Button>
          )}
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-1">
              {isEnglish ? 'Parenting Depression Check (EPDS)' : '육아 우울감 체크 (EPDS)'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isEnglish
                ? 'Based on Edinburgh Postnatal Depression Scale (Cox et al., 1987)'
                : 'Edinburgh 산후우울증 척도 기반 · 지난 7일간의 기분을 떠올려 주세요'}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">{currentQuestion + 1} / {questions.length}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg leading-relaxed">{q.text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={answers[currentQuestion]} onValueChange={handleAnswer}>
              {q.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={option.value} id={`epds-${currentQuestion}-${option.value}`} />
                  <Label htmlFor={`epds-${currentQuestion}-${option.value}`} className="cursor-pointer flex-1">{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
            <div className="flex justify-start pt-4">
              <Button variant="outline" onClick={prevQuestion} disabled={currentQuestion === 0}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {isEnglish ? 'Previous' : '이전'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EpdsTestForm;
