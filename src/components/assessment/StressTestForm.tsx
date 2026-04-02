import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { AutoSaveManager, useBackupRecovery } from "@/components/mvp/AutoSaveManager";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const questionsKo = [
  { id: "stress1", text: "갑작스럽게 생긴 일들로 인해 마음이 어수선해진 적이 얼마나 자주 있나요?", options: [{ value: "0", label: "거의 없었어요" }, { value: "1", label: "가끔 있었어요" }, { value: "2", label: "종종 있었어요" }, { value: "3", label: "자주 있었어요" }, { value: "4", label: "매일같이 있었어요" }] },
  { id: "stress2", text: "중요한 상황에서 내가 아무것도 할 수 없다는 무력감을 느낀 적이 얼마나 자주 있나요?", options: [{ value: "0", label: "거의 없었어요" }, { value: "1", label: "가끔 있었어요" }, { value: "2", label: "종종 있었어요" }, { value: "3", label: "자주 있었어요" }, { value: "4", label: "매일같이 있었어요" }] },
  { id: "stress3", text: "작은 일에도 예민하게 반응하거나 짜증이 난 적이 얼마나 자주 있나요?", options: [{ value: "0", label: "거의 없었어요" }, { value: "1", label: "가끔 있었어요" }, { value: "2", label: "종종 있었어요" }, { value: "3", label: "자주 있었어요" }, { value: "4", label: "매일같이 있었어요" }] },
  { id: "stress4", text: "어려운 문제가 생겨도 '내가 해결할 수 있어'라고 자신감을 느낀 적이 얼마나 자주 있나요?", options: [{ value: "4", label: "거의 없었어요" }, { value: "3", label: "가끔 있었어요" }, { value: "2", label: "종종 있었어요" }, { value: "1", label: "자주 있었어요" }, { value: "0", label: "매일같이 있었어요" }] },
  { id: "stress5", text: "하루 일과를 마치며 '오늘도 잘 보냈다'는 만족감을 느낀 적이 얼마나 자주 있나요?", options: [{ value: "4", label: "거의 없었어요" }, { value: "3", label: "가끔 있었어요" }, { value: "2", label: "종종 있었어요" }, { value: "1", label: "자주 있었어요" }, { value: "0", label: "매일같이 있었어요" }] },
  { id: "stress6", text: "해야 할 일들이 산더미처럼 쌓여서 숨이 막힐 것 같다고 느낀 적이 얼마나 자주 있나요?", options: [{ value: "0", label: "거의 없었어요" }, { value: "1", label: "가끔 있었어요" }, { value: "2", label: "종종 있었어요" }, { value: "3", label: "자주 있었어요" }, { value: "4", label: "매일같이 있었어요" }] },
  { id: "stress7", text: "예상치 못한 문제가 생겨도 '괜찮아, 이것도 해결된다'고 여유를 느낀 적이 얼마나 자주 있나요?", options: [{ value: "4", label: "거의 없었어요" }, { value: "3", label: "가끔 있었어요" }, { value: "2", label: "종종 있었어요" }, { value: "1", label: "자주 있었어요" }, { value: "0", label: "매일같이 있었어요" }] },
  { id: "stress8", text: "잠자리에 들며 '내일도 좋은 하루가 될 거야'라는 기대감을 느낀 적이 얼마나 자주 있나요?", options: [{ value: "4", label: "거의 없었어요" }, { value: "3", label: "가끔 있었어요" }, { value: "2", label: "종종 있었어요" }, { value: "1", label: "자주 있었어요" }, { value: "0", label: "매일같이 있었어요" }] },
  { id: "stress9", text: "내 의지와 상관없이 벌어지는 일들로 인해 속이 끓어오른 적이 얼마나 자주 있나요?", options: [{ value: "0", label: "거의 없었어요" }, { value: "1", label: "가끔 있었어요" }, { value: "2", label: "종종 있었어요" }, { value: "3", label: "자주 있었어요" }, { value: "4", label: "매일같이 있었어요" }] },
  { id: "stress10", text: "문제들이 계속 쌓여서 '이제 정말 한계야'라고 느낀 적이 얼마나 자주 있나요?", options: [{ value: "0", label: "거의 없었어요" }, { value: "1", label: "가끔 있었어요" }, { value: "2", label: "종종 있었어요" }, { value: "3", label: "자주 있었어요" }, { value: "4", label: "매일같이 있었어요" }] },
  { id: "stress11", text: "주변 사람들과의 관계에서 오해나 갈등으로 마음이 상한 적이 얼마나 자주 있나요?", options: [{ value: "0", label: "거의 없었어요" }, { value: "1", label: "가끔 있었어요" }, { value: "2", label: "종종 있었어요" }, { value: "3", label: "자주 있었어요" }, { value: "4", label: "매일같이 있었어요" }] },
  { id: "stress12", text: "몸이 피곤하고 지쳐서 일상생활을 하기 힘들다고 느낀 적이 얼마나 자주 있나요?", options: [{ value: "0", label: "거의 없었어요" }, { value: "1", label: "가끔 있었어요" }, { value: "2", label: "종종 있었어요" }, { value: "3", label: "자주 있었어요" }, { value: "4", label: "매일같이 있었어요" }] }
];

const questionsEn = [
  { id: "stress1", text: "How often have you felt unsettled due to unexpected events?", options: [{ value: "0", label: "Rarely" }, { value: "1", label: "Occasionally" }, { value: "2", label: "Sometimes" }, { value: "3", label: "Often" }, { value: "4", label: "Almost every day" }] },
  { id: "stress2", text: "How often have you felt helpless, unable to do anything in important situations?", options: [{ value: "0", label: "Rarely" }, { value: "1", label: "Occasionally" }, { value: "2", label: "Sometimes" }, { value: "3", label: "Often" }, { value: "4", label: "Almost every day" }] },
  { id: "stress3", text: "How often have you been irritable or sensitive over minor things?", options: [{ value: "0", label: "Rarely" }, { value: "1", label: "Occasionally" }, { value: "2", label: "Sometimes" }, { value: "3", label: "Often" }, { value: "4", label: "Almost every day" }] },
  { id: "stress4", text: "How often have you felt confident that you could handle difficult problems?", options: [{ value: "4", label: "Rarely" }, { value: "3", label: "Occasionally" }, { value: "2", label: "Sometimes" }, { value: "1", label: "Often" }, { value: "0", label: "Almost every day" }] },
  { id: "stress5", text: "How often have you felt satisfied at the end of the day, thinking 'Today was a good day'?", options: [{ value: "4", label: "Rarely" }, { value: "3", label: "Occasionally" }, { value: "2", label: "Sometimes" }, { value: "1", label: "Often" }, { value: "0", label: "Almost every day" }] },
  { id: "stress6", text: "How often have you felt overwhelmed by piling tasks?", options: [{ value: "0", label: "Rarely" }, { value: "1", label: "Occasionally" }, { value: "2", label: "Sometimes" }, { value: "3", label: "Often" }, { value: "4", label: "Almost every day" }] },
  { id: "stress7", text: "How often have you felt relaxed thinking 'It's okay, this will work out' despite unexpected problems?", options: [{ value: "4", label: "Rarely" }, { value: "3", label: "Occasionally" }, { value: "2", label: "Sometimes" }, { value: "1", label: "Often" }, { value: "0", label: "Almost every day" }] },
  { id: "stress8", text: "How often have you felt hopeful going to bed, thinking 'Tomorrow will be a good day'?", options: [{ value: "4", label: "Rarely" }, { value: "3", label: "Occasionally" }, { value: "2", label: "Sometimes" }, { value: "1", label: "Often" }, { value: "0", label: "Almost every day" }] },
  { id: "stress9", text: "How often have you felt frustrated by things beyond your control?", options: [{ value: "0", label: "Rarely" }, { value: "1", label: "Occasionally" }, { value: "2", label: "Sometimes" }, { value: "3", label: "Often" }, { value: "4", label: "Almost every day" }] },
  { id: "stress10", text: "How often have you felt 'I've reached my limit' from accumulating problems?", options: [{ value: "0", label: "Rarely" }, { value: "1", label: "Occasionally" }, { value: "2", label: "Sometimes" }, { value: "3", label: "Often" }, { value: "4", label: "Almost every day" }] },
  { id: "stress11", text: "How often have you been hurt by misunderstandings or conflicts with people around you?", options: [{ value: "0", label: "Rarely" }, { value: "1", label: "Occasionally" }, { value: "2", label: "Sometimes" }, { value: "3", label: "Often" }, { value: "4", label: "Almost every day" }] },
  { id: "stress12", text: "How often have you felt too tired and exhausted to carry on with daily life?", options: [{ value: "0", label: "Rarely" }, { value: "1", label: "Occasionally" }, { value: "2", label: "Sometimes" }, { value: "3", label: "Often" }, { value: "4", label: "Almost every day" }] }
];

interface StressTestFormProps {
  onComplete: (results: {
    answers: number[];
    total: number;
    average: number;
    severity: string;
  }) => void;
  onBack: () => void;
}

export default function StressTestForm({ onComplete, onBack }: StressTestFormProps) {
  const { isEnglish } = useLanguage();
  const questions = isEnglish ? questionsEn : questionsKo;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { hasBackup, restoreBackup, discardBackup } = useBackupRecovery('stress-test-form');
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);

  useEffect(() => {
    if (hasBackup) {
      setShowRestoreDialog(true);
    }
  }, [hasBackup]);

  const handleRestoreBackup = () => {
    const backup = restoreBackup();
    if (backup) {
      setAnswers(backup.answers || {});
      setCurrentQuestion(backup.currentQuestion || 0);
      toast({
        title: isEnglish ? "Backup restored" : "백업 복구됨",
        description: isEnglish ? "Your previous progress has been loaded." : "이전에 작성하던 내용을 불러왔습니다.",
      });
    }
    setShowRestoreDialog(false);
  };

  const handleDiscardBackup = () => {
    discardBackup();
    setShowRestoreDialog(false);
  };

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        analyzeResultsWithAnswers(newAnswers);
      }
    }, 500);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const analyzeResultsWithAnswers = (finalAnswers: Record<string, string>) => {
    const answerValues = Object.values(finalAnswers).map(Number);
    const total = answerValues.reduce((sum, value) => sum + value, 0);
    const average = total / answerValues.length;
    
    let severity: string;
    if (total <= 16) {
      severity = isEnglish ? "Healthy Mental State" : "건강한 마음상태";
    } else if (total <= 32) {
      severity = isEnglish ? "Attention Needed" : "주의 필요";
    } else {
      severity = isEnglish ? "Management Needed" : "관리 필요";
    }
    
    onComplete({ answers: answerValues, total, average, severity });
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  if (!currentQ) return null;

  return (
    <>
      <AutoSaveManager data={{ answers, currentQuestion }} formId="stress-test-form" interval={30000} showIndicator={true} />

      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isEnglish ? "Previous Progress Found" : "이전 작성 내용 발견"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isEnglish ? "We found your previous progress. Would you like to continue?" : "이전에 작성하다 중단한 내용이 있습니다. 계속 작성하시겠습니까?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardBackup}>
              {isEnglish ? "Start Over" : "새로 시작"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreBackup}>
              {isEnglish ? "Continue" : "이어서 작성"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                {isEnglish ? "Back" : "돌아가기"}
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentQuestion + 1} / {questions.length}
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{isEnglish ? "Stress Level Assessment" : "스트레스지수 측정"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">{currentQ.text}</h3>
                <RadioGroup
                  value={answers[currentQ.id] || ""}
                  onValueChange={(value) => handleAnswer(currentQ.id, value)}
                  className="space-y-3"
                >
                  {currentQ.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`stress-q${currentQuestion}-opt${index}`} />
                      <Label htmlFor={`stress-q${currentQuestion}-opt${index}`} className="cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex justify-start pt-4">
                <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0} className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {isEnglish ? "Previous" : "이전"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
