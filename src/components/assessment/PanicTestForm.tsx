import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Brain } from "lucide-react";
import { useLanguage } from "@/i18n";

interface PanicTestFormProps {
  ageGroup?: 'toddler' | 'child' | 'adult';
  onComplete: (results: {answers: number[], total: number, average: number, severity: string, ageGroup: string}) => void;
  onBack: () => void;
}

// 유아용 (3-6세) 부모 보고형 불안 검사 문항
const toddlerQKo = [
  "아이가 부모와 떨어질 때 심하게 울거나 매달립니다",
  "낯선 사람을 보면 극도로 불안해하거나 숨습니다",
  "새로운 장소에 가면 가지 않으려고 합니다",
  "밤에 혼자 자는 것을 매우 무서워합니다",
  "특정 동물이나 사물에 대해 과도한 공포를 보입니다",
  "큰 소리나 갑작스러운 변화에 과민하게 반응합니다",
  "어린이집/유치원에 가기를 거부합니다",
  "또래 아이들과 어울리기를 꺼립니다",
  "복통, 두통 등 신체 증상을 자주 호소합니다",
  "잠들기 어려워하거나 악몽을 자주 꿉니다",
  "익숙한 일상이 바뀌면 심하게 불안해합니다",
  "부모가 보이지 않으면 극심한 불안을 보입니다",
];

const toddlerQEn = [
  "My child cries excessively or clings when separated from parents",
  "My child becomes extremely anxious or hides when seeing strangers",
  "My child refuses to go to new places",
  "My child is very afraid of sleeping alone at night",
  "My child shows excessive fear of specific animals or objects",
  "My child overreacts to loud noises or sudden changes",
  "My child refuses to go to daycare/kindergarten",
  "My child is reluctant to play with peers",
  "My child frequently complains of stomachaches, headaches, etc.",
  "My child has difficulty falling asleep or frequently has nightmares",
  "My child becomes very anxious when familiar routines change",
  "My child shows extreme anxiety when parents are out of sight",
];

// 아동용 (7-12세) 불안 검사 문항
const childQKo = [
  "학교에 가면 걱정이 많이 돼요",
  "배가 아프거나 머리가 아플 때가 많아요",
  "엄마 아빠와 떨어지면 불안해요",
  "새로운 곳에 가면 무서워요",
  "친구들 앞에서 발표하면 떨려요",
  "밤에 무서운 생각이 나요",
  "나쁜 일이 일어날까봐 걱정돼요",
  "심장이 빨리 뛰는 느낌이 들어요",
  "갑자기 울고 싶어질 때가 있어요",
  "혼자 있으면 불안해요",
  "시험을 보면 너무 긴장돼요",
  "무서운 꿈을 자주 꿔요",
  "다른 아이들이 나를 싫어할까봐 걱정돼요",
  "갑자기 숨이 안 쉬어지는 느낌이 들어요",
  "뭔가 잘못될 것 같은 느낌이 들어요",
];

const childQEn = [
  "I worry a lot when I go to school",
  "I often have stomachaches or headaches",
  "I feel anxious when separated from my parents",
  "I'm scared of going to new places",
  "I tremble when presenting in front of friends",
  "I have scary thoughts at night",
  "I worry that bad things will happen",
  "I feel my heart beating fast",
  "I suddenly want to cry sometimes",
  "I feel anxious when I'm alone",
  "I get very nervous during tests",
  "I often have scary dreams",
  "I worry that other kids don't like me",
  "I sometimes feel like I can't breathe",
  "I feel like something bad is going to happen",
];

// 성인용 (19세 이상) 불안 검사 문항
const adultQKo = [
  "갑작스러운 심장 두근거림이나 심장이 빨리 뛰는 증상이 있습니까?",
  "땀이 나거나 몸이 떨리는 증상이 있습니까?",
  "숨이 막히거나 질식할 것 같은 느낌이 있습니까?",
  "가슴이 답답하거나 아픈 증상이 있습니까?",
  "메스꺼움이나 복부 불편감이 있습니까?",
  "어지럽거나 불안정한 느낌, 또는 기절할 것 같은 느낌이 있습니까?",
  "춥거나 뜨거운 느낌이 있습니까?",
  "손발이 저리거나 무감각한 느낌이 있습니까?",
  "자신이 분리된 것 같거나 비현실적인 느낌이 있습니까?",
  "통제력을 잃거나 미칠 것 같은 두려움이 있습니까?",
  "죽을 것 같은 두려움이 있습니까?",
  "이러한 증상들이 갑작스럽게 나타납니까?",
  "증상이 최고조에 달하는 데 몇 분 정도 걸립니까?",
  "이런 증상 때문에 일상생활에 지장이 있습니까?",
  "특정 장소나 상황을 피하게 됩니까?",
  "또 다시 이런 증상이 올까봐 걱정이 됩니까?",
  "이런 증상이 한 달에 몇 번 이상 반복됩니까?",
  "증상이 나타나면 즉시 그 자리를 벗어나고 싶어집니까?",
  "다른 사람들이 이런 증상을 알아챌까봐 걱정됩니까?",
  "이런 증상 때문에 전문가의 도움을 받고 싶다고 생각합니까?",
  "증상이 나타날 때 현실감을 잃는 느낌이 있습니까?",
];

const adultQEn = [
  "Do you experience sudden heart pounding or rapid heartbeat?",
  "Do you experience sweating or body trembling?",
  "Do you feel shortness of breath or a choking sensation?",
  "Do you experience chest tightness or pain?",
  "Do you experience nausea or abdominal discomfort?",
  "Do you feel dizzy, unsteady, or as if you might faint?",
  "Do you experience hot or cold flashes?",
  "Do you experience numbness or tingling in your hands and feet?",
  "Do you feel detached from yourself or a sense of unreality?",
  "Do you fear losing control or going crazy?",
  "Do you fear dying?",
  "Do these symptoms appear suddenly?",
  "Does it take a few minutes for symptoms to peak?",
  "Do these symptoms interfere with your daily life?",
  "Do you avoid certain places or situations?",
  "Do you worry about these symptoms recurring?",
  "Do these symptoms repeat more than a few times a month?",
  "Do you want to immediately leave when symptoms appear?",
  "Do you worry about others noticing your symptoms?",
  "Do you feel you need professional help for these symptoms?",
  "Do you feel a loss of reality when symptoms appear?",
];

const getQuestions = (ageGroup: 'toddler' | 'child' | 'adult', isEn: boolean) => {
  if (ageGroup === 'toddler') return isEn ? toddlerQEn : toddlerQKo;
  if (ageGroup === 'child') return isEn ? childQEn : childQKo;
  return isEn ? adultQEn : adultQKo;
};

const getAgeGroupLabel = (ageGroup: 'toddler' | 'child' | 'adult', isEn: boolean) => {
  if (ageGroup === 'toddler') return isEn ? 'Toddler (3-6)' : '유아 (3-6세)';
  if (ageGroup === 'child') return isEn ? 'Child (7-12)' : '아동 (7-12세)';
  return isEn ? 'Adult (19+)' : '성인 (19세 이상)';
};

const PanicTestForm = ({ ageGroup, onComplete, onBack }: PanicTestFormProps) => {
  const { isEnglish } = useLanguage();
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<'toddler' | 'child' | 'adult' | null>(ageGroup || null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [hasStarted, setHasStarted] = useState(false);

  const questions = selectedAgeGroup ? getQuestions(selectedAgeGroup, isEnglish) : [];
  if (currentQuestion >= questions.length) return null;
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  const handleAgeGroupSelect = (group: 'toddler' | 'child' | 'adult') => {
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
      return isNaN(parsed) ? 0 : parsed;
    });

    const total = numericAnswers.reduce((sum, answer) => sum + answer, 0);
    const maxScore = questions.length * 3;
    const average = Math.round((total / questions.length) * 10) / 10;

    let severity = "";
    const pct = (total / maxScore) * 100;
    if (pct <= 25) severity = isEnglish ? "Normal" : "정상";
    else if (pct <= 50) severity = isEnglish ? "Mild" : "경미";
    else if (pct <= 75) severity = isEnglish ? "Moderate" : "중등도";
    else severity = isEnglish ? "Severe" : "심각";

    onComplete({ answers: numericAnswers, total, average, severity, ageGroup: getAgeGroupLabel(selectedAgeGroup!, isEnglish) });
  };

  const handlePrevious = () => { if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1); };
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1);
    else calculateResults(answers);
  };

  const currentAnswer = answers[currentQuestion] || "";
  const canProceed = currentAnswer !== "";

  const handleStartTest = () => {
    setHasStarted(true);
  };

  // 연령대 선택 화면
  if (!selectedAgeGroup) {
    return (
      <Card className="max-w-2xl mx-auto p-8">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{isEnglish ? "Select your age group" : "연령대를 선택해주세요"}</h2>
            <p className="text-muted-foreground text-sm px-4">{isEnglish ? "Questions are tailored to your age" : "연령에 맞는 검사 문항이 제공됩니다"}</p>
          </div>
          <div className="grid gap-4">
            {(['toddler', 'child', 'adult'] as const).map(g => (
              <Button key={g} variant="outline" className="h-auto p-6 flex flex-col items-start text-left hover:bg-primary/5 hover:border-primary" onClick={() => handleAgeGroupSelect(g)}>
                <span className="text-lg font-semibold">{getAgeGroupLabel(g, isEnglish)}</span>
                <span className="text-sm text-muted-foreground">
                  {isEnglish
                    ? g === 'toddler' ? 'Parent-report preschool anxiety screening (12 items)' 
                      : g === 'child' ? 'Elementary school anxiety screening (15 items)' 
                      : 'Adult anxiety/panic screening (21 items)'
                    : g === 'toddler' ? '부모 보고형 유아 불안 선별 검사 (12문항)' 
                      : g === 'child' ? '초등학생 대상 불안 선별 검사 (15문항)' 
                      : '성인 대상 불안/공황 선별 검사 (21문항)'}
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

  // 체험검사 - 검사 시작 CTA 화면
  if (!hasStarted) {
    const ageLabel = getAgeGroupLabel(selectedAgeGroup!, isEnglish);
    const questionCount = selectedAgeGroup === 'toddler' ? 12 : selectedAgeGroup === 'child' ? 15 : 21;
    return (
      <Card className="max-w-2xl mx-auto p-8">
        <div className="space-y-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">
              {isEnglish ? 'Anxiety Level Check' : '불안감 수준 확인'}
            </h2>
            <p className="text-muted-foreground">
              {isEnglish 
                ? `${ageLabel} · ${questionCount} questions · About 3-5 min`
                : `${ageLabel} · ${questionCount}문항 · 약 3~5분 소요`}
            </p>
          </div>
          <div className="bg-muted/50 rounded-xl p-5 text-left space-y-2">
            <p className="text-sm font-medium text-foreground">
              {isEnglish ? '📋 Before you start' : '📋 검사 안내'}
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>{isEnglish ? '• Answer honestly based on your recent feelings' : '• 최근 2주간의 상태를 기준으로 솔직하게 답해주세요'}</li>
              <li>{isEnglish ? '• There are no right or wrong answers' : '• 정답은 없으며, 느끼는 그대로 선택하시면 됩니다'}</li>
              <li>{isEnglish ? '• Results are for reference only' : '• 결과는 참고용이며 전문 진단을 대체하지 않습니다'}</li>
            </ul>
          </div>
          <div className="space-y-3">
            <Button 
              onClick={handleStartTest} 
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              size="lg"
            >
              {isEnglish ? 'Start Assessment →' : '검사 시작하기 →'}
            </Button>
            <Button variant="ghost" onClick={() => setSelectedAgeGroup(null)} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {isEnglish ? 'Change age group' : '연령대 다시 선택'}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const answerOptions = isEnglish
    ? [{ v: "1", l: "Not at all (1)" }, { v: "2", l: "Sometimes (2)" }, { v: "3", l: "Often (3)" }]
    : [{ v: "1", l: "그렇지 않다 (1점)" }, { v: "2", l: "보통이다 (2점)" }, { v: "3", l: "그렇다 (3점)" }];

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
                <RadioGroupItem value={opt.v} id={`panic-q${currentQuestion}-opt${i}`} />
                <Label htmlFor={`panic-q${currentQuestion}-opt${i}`} className="text-base cursor-pointer">{opt.l}</Label>
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

export default PanicTestForm;
