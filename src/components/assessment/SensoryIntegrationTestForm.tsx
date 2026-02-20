import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

interface SensoryIntegrationTestFormProps {
  onComplete: (results: { answers: number[]; total: number; average: number; ageGroup: string; severity: string }) => void;
  onBack: () => void;
}

const questionsKo = [
  "아이가 특정 소리(진공청소기, 헤어드라이어 등)에 과도하게 민감하게 반응하나요?",
  "아이가 특정 촉감(모래, 점토, 크림 등)을 만지는 것을 극도로 싫어하나요?",
  "아이가 회전하는 놀이기구나 그네를 매우 좋아하거나 싫어하나요?",
  "아이가 밝은 빛이나 번쩍이는 빛에 과민반응을 보이나요?",
  "아이가 특정 음식의 질감을 거부하거나 편식이 심한가요?",
  "아이가 사람이 많은 곳에서 불안해하거나 회피하려고 하나요?",
  "아이가 옷의 재질이나 라벨, 솔기에 민감하게 반응하나요?",
  "아이가 균형을 잡는 데 어려움이 있거나 자주 넘어지나요?",
  "아이가 힘의 조절이 어려워서 너무 세게 또는 약하게 하나요?",
  "아이가 자신의 몸의 위치를 잘 인식하지 못하는 것 같나요?",
  "아이가 위험한 상황을 인지하지 못하거나 두려움이 없나요?",
  "아이가 과도하게 활동적이거나 반대로 매우 조용한가요?",
  "아이가 집중력이 부족하고 쉽게 산만해지나요?",
  "아이가 새로운 활동이나 변화에 적응하기 어려워하나요?",
  "아이가 소근육 활동(가위질, 그리기 등)에 어려움이 있나요?",
  "아이가 대근육 활동(달리기, 점프 등)을 피하거나 서툴러하나요?",
  "아이가 감정 조절이 어렵고 갑작스런 울음이나 화를 내나요?",
  "아이가 일상적인 활동(양치, 세수 등)을 거부하나요?",
  "아이가 반복적인 행동이나 자극추구 행동을 보이나요?",
  "아이가 또래와의 놀이나 상호작용에 어려움이 있나요?"
];

const questionsEn = [
  "Does your child react excessively to certain sounds (vacuum, hair dryer, etc.)?",
  "Does your child extremely dislike touching certain textures (sand, clay, cream, etc.)?",
  "Does your child strongly like or dislike spinning rides or swings?",
  "Does your child overreact to bright or flashing lights?",
  "Does your child reject certain food textures or have severe picky eating?",
  "Does your child become anxious or try to avoid crowded places?",
  "Does your child react sensitively to clothing material, labels, or seams?",
  "Does your child have difficulty balancing or fall frequently?",
  "Does your child have trouble regulating force (too hard or too soft)?",
  "Does your child seem unaware of their body position?",
  "Does your child fail to recognize dangerous situations or show no fear?",
  "Is your child excessively active or conversely very quiet?",
  "Does your child lack focus and get easily distracted?",
  "Does your child have difficulty adapting to new activities or changes?",
  "Does your child have difficulty with fine motor activities (cutting, drawing, etc.)?",
  "Does your child avoid or struggle with gross motor activities (running, jumping, etc.)?",
  "Does your child have difficulty regulating emotions with sudden crying or anger?",
  "Does your child refuse daily activities (brushing teeth, washing face, etc.)?",
  "Does your child show repetitive or sensory-seeking behaviors?",
  "Does your child have difficulty playing or interacting with peers?"
];

const optionsKo = ["전혀 그렇지 않다", "거의 그렇지 않다", "가끔 그렇다", "자주 그렇다", "매우 그렇다"];
const optionsEn = ["Not at all", "Rarely", "Sometimes", "Often", "Very much"];

const SensoryIntegrationTestForm = ({ onComplete, onBack }: SensoryIntegrationTestFormProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questionsKo.length).fill(0));
  const { toast } = useToast();
  const { isEnglish } = useLanguage();

  const questions = isEnglish ? questionsEn : questionsKo;
  const options = isEnglish ? optionsEn : optionsKo;

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = parseInt(value);
    setAnswers(newAnswers);
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        handleComplete(newAnswers);
      }
    }, 300);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const handleComplete = (finalAnswers = answers) => {
    const total = finalAnswers.reduce((sum, answer) => sum + answer, 0);
    const average = total / finalAnswers.length;
    
    let severity = isEnglish ? "Normal" : "정상";
    if (total >= 60) severity = isEnglish ? "Severe" : "심각";
    else if (total >= 40) severity = isEnglish ? "Moderate" : "중등도";
    else if (total >= 20) severity = isEnglish ? "Mild" : "경미";

    onComplete({ answers: finalAnswers, total, average, ageGroup: isEnglish ? "Children" : "아동", severity });
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
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
          <RadioGroup
            key={currentQuestion}
            value={answers[currentQuestion]?.toString() || ""}
            onValueChange={handleAnswerChange}
            className="space-y-3"
          >
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

export default SensoryIntegrationTestForm;
