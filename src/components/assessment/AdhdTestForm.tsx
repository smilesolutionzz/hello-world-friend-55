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

interface AdhdTestFormProps {
  ageGroup: 'child' | 'adult';
  onComplete: (results: {answers: number[], total: number, average: number, ageGroup: string, severity: string}) => void;
  onBack: () => void;
}

const AdhdTestForm = ({ ageGroup, onComplete, onBack }: AdhdTestFormProps) => {
  const questions = ageGroup === 'child' ? childFocusQuestions : adultFocusQuestions;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(questions.length).fill("")); // 빈 문자열로 초기화
  const [hasStarted, setHasStarted] = useState(false);
  const { consumeTokens } = useTokens();
  const { toast } = useToast();
  const { hasBackup, restoreBackup, discardBackup } = useBackupRecovery(`adhd-test-form-${ageGroup}`);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);

  // 백업 데이터가 있으면 복구 대화상자 표시
  useEffect(() => {
    if (hasBackup && hasStarted) {
      setShowRestoreDialog(true);
    }
  }, [hasBackup, hasStarted]);

  const handleRestoreBackup = () => {
    const backup = restoreBackup();
    if (backup) {
      setAnswers(backup.answers || new Array(questions.length).fill(""));
      setCurrentQuestion(backup.currentQuestion || 0);
      toast({
        title: "백업 복구됨",
        description: "이전에 작성하던 내용을 불러왔습니다.",
      });
    }
    setShowRestoreDialog(false);
  };

  const handleDiscardBackup = () => {
    discardBackup();
    setShowRestoreDialog(false);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
    
    // 자동으로 다음 문항으로 이동 (0.5초 지연)
    setTimeout(() => {
      handleNext();
    }, 500);
  };

  const handleStartTest = async () => {
    const success = await consumeTokens(TOKEN_COSTS.FOCUS_CHECK);
    if (success) {
      setHasStarted(true);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 테스트 완료 - null/NaN 방지 처리
      const numericAnswers = answers
        .map(a => parseInt(a))
        .filter(a => !isNaN(a)); // NaN 필터링
      
      // 모든 문항에 답변했는지 확인
      if (numericAnswers.length !== questions.length) {
        console.error('Not all questions answered:', numericAnswers.length, 'of', questions.length);
        return;
      }
      
      const total = numericAnswers.reduce((sum, answer) => sum + answer, 0);
      const average = Math.round((total / numericAnswers.length) * 10) / 10;
      
      let severity = "";
      // ADHD 테스트는 0-3점 척도 (0=전혀없음, 1=가끔, 2=자주, 3=매우자주)
      // 18개 문항 * 3점 = 54점 만점
      // 점수가 높을수록 ADHD 증상이 심함
      // 점수 분포를 재조정하여 더 정확한 평가
      if (total <= 13) {  // 약 24% 이하
        severity = "정상 범위";
      } else if (total <= 22) {  // 약 41% 이하
        severity = "경계선 수준";
      } else if (total <= 35) {  // 약 65% 이하
        severity = "중등도 수준";
      } else {  // 65% 초과
        severity = "심각한 수준";
      }
      
      onComplete({
        answers: numericAnswers,
        total,
        average,
        ageGroup: ageGroup === 'child' ? '아동청소년' : '성인',
        severity
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const currentAnswer = answers[currentQuestion];
  const canProceed = currentAnswer !== ""; // 빈 문자열이 아니어야 함

  // 토큰 게이트 표시
  if (!hasStarted) {
    return (
      <TokenGate
        tokensRequired={TOKEN_COSTS.FOCUS_CHECK}
        featureName="AIH 집중력 자가점검"
        onProceed={handleStartTest}
      >
        <div className="space-y-4 text-center">
          <div className="text-lg font-semibold">AIH 집중력 자가점검 특징</div>
          <ul className="space-y-2 text-sm text-muted-foreground max-w-md mx-auto">
            <li>• {ageGroup === 'child' ? '아동청소년' : '성인'} 맞춤 문항</li>
            <li>• 총 {questions.length}문항, 약 3분 소요</li>
            <li>• 개인 집중력 패턴 분석</li>
            <li>• 맞춤형 개선 방향 제안</li>
          </ul>
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm font-medium mb-2">더 정확한 ADHD 유형 분석을 원하신다면?</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/advanced-adhd-test'}
              className="mt-2"
            >
              12가지 ADHD 유형 분석 보기
            </Button>
          </div>
        </div>
      </TokenGate>
    );
  }

  return (
    <>
      {/* 자동 저장 관리자 */}
      {hasStarted && (
        <AutoSaveManager
          data={{ answers, currentQuestion }}
          formId={`adhd-test-form-${ageGroup}`}
          interval={30000}
          showIndicator={true}
        />
      )}

      {/* 백업 복구 대화상자 */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>이전 작성 내용 발견</AlertDialogTitle>
            <AlertDialogDescription>
              이전에 작성하다 중단한 내용이 있습니다. 계속 작성하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardBackup}>
              새로 시작
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreBackup}>
              이어서 작성
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="max-w-4xl mx-auto p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentQuestion + 1} / {questions.length}
          </span>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-center text-sm text-muted-foreground">
            진행률: {Math.round(progress)}%
          </p>
        </div>

        {/* Question */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-center">
            {questions[currentQuestion]}
          </h2>

          <RadioGroup 
            value={currentAnswer} 
            onValueChange={handleAnswer}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="option1" />
              <Label htmlFor="option1" className="text-base cursor-pointer">
                그렇지 않다 (1점)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="option2" />
              <Label htmlFor="option2" className="text-base cursor-pointer">
                보통이다 (2점)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="option3" />
              <Label htmlFor="option3" className="text-base cursor-pointer">
                그렇다 (3점)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Navigation */}
        <div className="flex justify-start pt-6">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            이전
          </Button>
        </div>
      </div>
    </Card>
    </>
  );
};

export default AdhdTestForm;