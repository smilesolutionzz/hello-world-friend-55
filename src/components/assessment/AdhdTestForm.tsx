import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Brain, Baby, Target, Zap, Clock, ChevronRight, CheckCircle } from "lucide-react";
import { childFocusQuestions, adultFocusQuestions } from "@/data/assessmentQuestions";
import { AutoSaveManager, useBackupRecovery } from "@/components/mvp/AutoSaveManager";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n";
import { Badge } from "@/components/ui/badge";
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
  ageGroup?: 'child' | 'adult';
  onComplete: (results: {answers: number[], total: number, average: number, ageGroup: string, severity: string}) => void;
  onBack: () => void;
}

const AdhdTestForm = ({ ageGroup, onComplete, onBack }: AdhdTestFormProps) => {
  const { isEnglish } = useLanguage();
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<'child' | 'adult' | null>(ageGroup || null);
  const questionsKo = selectedAgeGroup === 'child' ? childFocusQuestions : adultFocusQuestions;
  const questionsEnArr = selectedAgeGroup === 'child' ? childQEn : adultQEn;
  const questions = selectedAgeGroup ? (isEnglish ? questionsEnArr : questionsKo) : [];
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  
  const { toast } = useToast();
  const { hasBackup, restoreBackup, discardBackup } = useBackupRecovery(`adhd-test-form-${selectedAgeGroup || 'none'}`);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);

  useEffect(() => { if (hasBackup && hasStarted) setShowRestoreDialog(true); }, [hasBackup, hasStarted]);

  const handleAgeGroupSelect = (group: 'child' | 'adult') => {
    setSelectedAgeGroup(group);
    const qs = group === 'child' ? (isEnglish ? childQEn : childFocusQuestions) : (isEnglish ? adultQEn : adultFocusQuestions);
    setAnswers(new Array(qs.length).fill(""));
    setCurrentQuestion(0);
    setHasStarted(true);
  };

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

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1);
      else completeTest(newAnswers);
    }, 500);
  };

  const handleOptionClick = (value: string) => {
    if (answers[currentQuestion] === value) {
      setTimeout(() => {
        if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1);
        else completeTest(answers);
      }, 300);
    }
  };

  const completeTest = (finalAnswers: string[]) => {
    const numericAnswers = finalAnswers.map(a => parseInt(a)).filter(a => !isNaN(a));
    if (numericAnswers.length !== questions.length) {
      toast({ title: isEnglish ? "Please answer all questions" : "답변 확인 필요", description: isEnglish ? "Please answer all items." : "모든 문항에 답변해주세요.", variant: "destructive" });
      return;
    }
    const reversedAnswers = numericAnswers.map(a => 4 - a);
    const total = reversedAnswers.reduce((sum, answer) => sum + answer, 0);
    const average = Math.round((total / reversedAnswers.length) * 10) / 10;
    
    let severity = "";
    if (total <= 27) severity = isEnglish ? "Normal Range" : "정상 범위";
    else if (total <= 36) severity = isEnglish ? "Borderline" : "경계선 수준";
    else if (total <= 45) severity = isEnglish ? "Moderate" : "중등도 수준";
    else severity = isEnglish ? "Severe" : "심각한 수준";
    
    const ageLabel = selectedAgeGroup === 'child' 
      ? (isEnglish ? 'Child/Adolescent (7-12)' : '아동청소년 (7-12세)') 
      : (isEnglish ? 'Adult (19+)' : '성인 (19세 이상)');
    onComplete({ answers: reversedAnswers, total, average, ageGroup: ageLabel, severity });
  };

  const handlePrevious = () => { if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1); };
  const currentAnswer = answers[currentQuestion] || "";

  const answerOptions = isEnglish
    ? [{ v: "1", l: "Not true", emoji: "😐" }, { v: "2", l: "Somewhat", emoji: "🤔" }, { v: "3", l: "True", emoji: "✅" }]
    : [{ v: "1", l: "그렇지 않다", emoji: "😐" }, { v: "2", l: "보통이다", emoji: "🤔" }, { v: "3", l: "그렇다", emoji: "✅" }];

  // 연령대 선택 화면
  if (!selectedAgeGroup) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          {isEnglish ? "Back" : "뒤로가기"}
        </Button>
        
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center mx-auto">
            <Target className="w-8 h-8 text-teal-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {isEnglish ? "Attention & Focus Check" : "주의집중력 자가체크"}
            </h2>
            <p className="text-muted-foreground">
              {isEnglish ? "Select your age group for tailored questions" : "연령대에 맞는 맞춤 문항이 제공됩니다"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            className="group p-6 rounded-2xl border-2 border-border hover:border-sky-400/60 bg-card hover:bg-sky-500/5 transition-all text-left"
            onClick={() => handleAgeGroupSelect('child')}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center">
                  <Baby className="w-6 h-6 text-sky-500" />
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-sky-500 transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {isEnglish ? "Child / Adolescent" : "아동·청소년"}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">{isEnglish ? "Ages 7-12" : "7세 ~ 12세"}</p>
              </div>
              <div className="space-y-2">
                {(isEnglish 
                  ? ["18 child-tailored items", "Parent observation format", "Developmental analysis"]
                  : ["아동 맞춤 18문항", "보호자 관찰 체크리스트", "발달 단계별 맞춤 분석"]
                ).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Badge className="bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] border-0">
                  <Clock className="w-3 h-3 mr-1" />
                  {isEnglish ? "~3 min" : "약 3분"}
                </Badge>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] border-0">
                  {isEnglish ? "Free" : "무료"}
                </Badge>
              </div>
            </div>
          </button>

          <button 
            className="group p-6 rounded-2xl border-2 border-border hover:border-purple-400/60 bg-card hover:bg-purple-500/5 transition-all text-left"
            onClick={() => handleAgeGroupSelect('adult')}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-purple-500" />
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-purple-500 transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {isEnglish ? "Adult" : "성인"}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">{isEnglish ? "Ages 19+" : "19세 이상"}</p>
              </div>
              <div className="space-y-2">
                {(isEnglish
                  ? ["18 adult self-check items", "Workplace focus analysis", "Personalized strategies"]
                  : ["성인 자가점검 18문항", "직장/업무 집중력 분석", "맞춤형 개선 전략 제공"]
                ).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] border-0">
                  <Clock className="w-3 h-3 mr-1" />
                  {isEnglish ? "~3 min" : "약 3분"}
                </Badge>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] border-0">
                  {isEnglish ? "Free" : "무료"}
                </Badge>
              </div>
            </div>
          </button>
        </div>

        {/* 검사 안내 */}
        <div className="p-4 rounded-xl bg-muted/40 border border-border">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">
                {isEnglish ? "About this assessment" : "이 검사에 대해"}
              </p>
              <p>
                {isEnglish 
                  ? "This screening tool evaluates attention, hyperactivity, and impulsivity patterns. Results are for reference only and not a clinical diagnosis."
                  : "주의력, 과잉행동, 충동성 패턴을 평가하는 선별 도구입니다. 결과는 참고용이며 임상 진단이 아닙니다."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 검사 진행 화면
  if (questions.length === 0 || currentQuestion >= questions.length) return null;

  return (
    <>
      {hasStarted && <AutoSaveManager data={{ answers, currentQuestion }} formId={`adhd-test-form-${selectedAgeGroup}`} interval={30000} showIndicator={true} />}

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

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" />
            {isEnglish ? "Back" : "뒤로"}
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {selectedAgeGroup === 'child' 
                ? (isEnglish ? 'Child' : '아동') 
                : (isEnglish ? 'Adult' : '성인')}
            </Badge>
            <span className="text-sm font-medium text-muted-foreground">
              {currentQuestion + 1} / {questions.length}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <Progress value={progress} className="h-2" />
          <p className="text-center text-xs text-muted-foreground">
            {isEnglish ? `${Math.round(progress)}% complete` : `${Math.round(progress)}% 완료`}
          </p>
        </div>

        {/* Question Card */}
        <Card className="p-6 md:p-8 border-border/50">
          <div className="space-y-6">
            <div className="text-center">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                Q{currentQuestion + 1}
              </span>
              <h2 className="text-lg md:text-xl font-semibold text-foreground leading-relaxed">
                {questions[currentQuestion]}
              </h2>
            </div>

            <RadioGroup value={currentAnswer} onValueChange={handleAnswer} className="space-y-3">
              {answerOptions.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => handleOptionClick(opt.v)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    currentAnswer === opt.v 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/30 hover:bg-muted/30'
                  }`}
                >
                  <RadioGroupItem value={opt.v} id={`q${currentQuestion}_opt${i}`} className="flex-shrink-0" />
                  <Label htmlFor={`q${currentQuestion}_opt${i}`} className="flex-1 text-base cursor-pointer flex items-center gap-2">
                    <span className="text-lg">{opt.emoji}</span>
                    <span>{opt.l}</span>
                  </Label>
                  <span className="text-xs text-muted-foreground">{opt.v}{isEnglish ? 'pt' : '점'}</span>
                </div>
              ))}
            </RadioGroup>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handlePrevious} 
            disabled={currentQuestion === 0}
            className="text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {isEnglish ? "Previous" : "이전 문항"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default AdhdTestForm;
