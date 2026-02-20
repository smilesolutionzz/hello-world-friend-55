import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { childFocusQuestions, adultFocusQuestions } from "@/data/assessmentQuestions";
import TokenGate from "@/components/TokenGate";
import { TOKEN_COSTS } from "@/constants/tokenCosts";
import { useTokens } from "@/hooks/useTokens";
import { AutoSaveManager, useBackupRecovery } from "@/components/mvp/AutoSaveManager";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const childQEn = [
  "My child fully engages in activities they enjoy",
  "My child approaches new tasks step by step",
  "My child listens to others until they finish speaking",
  "My child tries to complete tasks they start",
  "My child organizes things in their own systematic way",
  "My child doesn't give up on challenging tasks",
  "My child prepares necessary tools and materials on their own",
  "My child is aware of surroundings and responds appropriately",
  "My child remembers and follows daily promises and rules",
  "My child feels comfortable with seated activities",
  "My child can continue activities in their designated spot",
  "My child regulates their activity level indoors appropriately",
  "My child participates happily in quiet activities",
  "My child adjusts their energy to match the situation",
  "My child expresses themselves in an appropriate amount during conversation",
  "My child listens fully to questions before answering",
  "My child can wait their turn and follow order",
  "My child cooperates harmoniously with others"
];

const adultQEn = [
  "I pursue accuracy and precision in my work or activities",
  "I can invest sufficient time and energy in important tasks",
  "I give my full attention when talking to someone",
  "I complete planned tasks step by step",
  "I organize my work and activities with my own system",
  "I persist with difficult tasks until the end",
  "I prepare and manage necessary materials in advance",
  "I recognize changes in my environment and respond appropriately",
  "I remember and execute important appointments and tasks",
  "I feel comfortable with desk work",
  "I stay seated and participate in meetings or lectures",
  "I maintain composure in tense situations",
  "I can focus and work in quiet environments",
  "I regulate my activity level to suit the situation",
  "I maintain an appropriate pace and volume when speaking",
  "I listen to others' stories until they finish",
  "I participate in meetings and discussions while waiting my turn",
  "I work harmoniously with colleagues through cooperation"
];

interface AdhdTestFormProps {
  ageGroup: 'child' | 'adult';
  onComplete: (results: {answers: number[], total: number, average: number, ageGroup: string, severity: string}) => void;
  onBack: () => void;
}

const AdhdTestForm = ({ ageGroup, onComplete, onBack }: AdhdTestFormProps) => {
  const { isEnglish } = useLanguage();
  const questionsKo = ageGroup === 'child' ? childFocusQuestions : adultFocusQuestions;
  const questionsEnArr = ageGroup === 'child' ? childQEn : adultQEn;
  const questions = isEnglish ? questionsEnArr : questionsKo;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(questions.length).fill(""));
  const [hasStarted, setHasStarted] = useState(false);
  const { consumeTokens } = useTokens();
  const { toast } = useToast();
  const { hasBackup, restoreBackup, discardBackup } = useBackupRecovery(`adhd-test-form-${ageGroup}`);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);

  useEffect(() => { if (hasBackup && hasStarted) setShowRestoreDialog(true); }, [hasBackup, hasStarted]);

  const handleRestoreBackup = () => {
    const backup = restoreBackup();
    if (backup) {
      setAnswers(backup.answers || new Array(questions.length).fill(""));
      setCurrentQuestion(backup.currentQuestion || 0);
      toast({ title: isEnglish ? "Backup restored" : "백업 복구됨", description: isEnglish ? "Previous progress loaded." : "이전에 작성하던 내용을 불러왔습니다." });
    }
    setShowRestoreDialog(false);
  };

  const handleDiscardBackup = () => { discardBackup(); setShowRestoreDialog(false); };
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1);
      else completeTest(newAnswers);
    }, 500);
  };

  const completeTest = (finalAnswers: string[]) => {
    const numericAnswers = finalAnswers.map(a => parseInt(a)).filter(a => !isNaN(a));
    if (numericAnswers.length !== questions.length) {
      toast({ title: isEnglish ? "Please answer all questions" : "답변 확인 필요", description: isEnglish ? "Please answer all items." : "모든 문항에 답변해주세요.", variant: "destructive" });
      return;
    }
    const total = numericAnswers.reduce((sum, answer) => sum + answer, 0);
    const average = Math.round((total / numericAnswers.length) * 10) / 10;
    
    let severity = "";
    if (total <= 27) severity = isEnglish ? "Normal Range" : "정상 범위";
    else if (total <= 36) severity = isEnglish ? "Borderline" : "경계선 수준";
    else if (total <= 45) severity = isEnglish ? "Moderate" : "중등도 수준";
    else severity = isEnglish ? "Severe" : "심각한 수준";
    
    onComplete({ answers: numericAnswers, total, average, ageGroup: ageGroup === 'child' ? (isEnglish ? 'Child/Adolescent' : '아동청소년') : (isEnglish ? 'Adult' : '성인'), severity });
  };

  const handleStartTest = async () => {
    const success = await consumeTokens(TOKEN_COSTS.FOCUS_CHECK);
    if (success) setHasStarted(true);
  };

  const handlePrevious = () => { if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1); };
  const currentAnswer = answers[currentQuestion];

  const answerOptions = isEnglish
    ? [{ v: "1", l: "Not true (1)" }, { v: "2", l: "Somewhat (2)" }, { v: "3", l: "True (3)" }]
    : [{ v: "1", l: "그렇지 않다 (1점)" }, { v: "2", l: "보통이다 (2점)" }, { v: "3", l: "그렇다 (3점)" }];

  if (!hasStarted) {
    return (
      <TokenGate tokensRequired={TOKEN_COSTS.FOCUS_CHECK} featureName={isEnglish ? "AIH Focus Self-Check" : "AIH 집중력 자가점검"} onProceed={handleStartTest}>
        <div className="space-y-4 text-center">
          <div className="text-lg font-semibold">{isEnglish ? "AIH Focus Self-Check Features" : "AIH 집중력 자가점검 특징"}</div>
          <ul className="space-y-2 text-sm text-muted-foreground max-w-md mx-auto">
            <li>• {ageGroup === 'child' ? (isEnglish ? 'Child/Adolescent tailored items' : '아동청소년 맞춤 문항') : (isEnglish ? 'Adult tailored items' : '성인 맞춤 문항')}</li>
            <li>• {isEnglish ? `${questions.length} items, ~3 min` : `총 ${questions.length}문항, 약 3분 소요`}</li>
            <li>• {isEnglish ? 'Personal focus pattern analysis' : '개인 집중력 패턴 분석'}</li>
            <li>• {isEnglish ? 'Customized improvement suggestions' : '맞춤형 개선 방향 제안'}</li>
          </ul>
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm font-medium mb-2">{isEnglish ? "Want a more detailed ADHD type analysis?" : "더 정확한 ADHD 유형 분석을 원하신다면?"}</p>
            <Button variant="outline" onClick={() => window.location.href = '/advanced-adhd-test'} className="mt-2">
              {isEnglish ? "View 12 ADHD Type Analysis" : "12가지 ADHD 유형 분석 보기"}
            </Button>
          </div>
        </div>
      </TokenGate>
    );
  }

  return (
    <>
      {hasStarted && <AutoSaveManager data={{ answers, currentQuestion }} formId={`adhd-test-form-${ageGroup}`} interval={30000} showIndicator={true} />}

      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isEnglish ? "Previous Progress Found" : "이전 작성 내용 발견"}</AlertDialogTitle>
            <AlertDialogDescription>{isEnglish ? "We found your previous progress. Continue?" : "이전에 작성하다 중단한 내용이 있습니다. 계속 작성하시겠습니까?"}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardBackup}>{isEnglish ? "Start Over" : "새로 시작"}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreBackup}>{isEnglish ? "Continue" : "이어서 작성"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="max-w-4xl mx-auto p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              {isEnglish ? "Back" : "뒤로가기"}
            </Button>
            <span className="text-sm text-muted-foreground">{currentQuestion + 1} / {questions.length}</span>
          </div>

          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-center text-sm text-muted-foreground">{isEnglish ? `Progress: ${Math.round(progress)}%` : `진행률: ${Math.round(progress)}%`}</p>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center">{questions[currentQuestion]}</h2>
            <RadioGroup value={currentAnswer} onValueChange={handleAnswer} className="space-y-4">
              {answerOptions.map((opt, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt.v} id={`option${i}`} />
                  <Label htmlFor={`option${i}`} className="text-base cursor-pointer">{opt.l}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-start pt-6">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
              {isEnglish ? "Previous" : "이전"}
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};

export default AdhdTestForm;
