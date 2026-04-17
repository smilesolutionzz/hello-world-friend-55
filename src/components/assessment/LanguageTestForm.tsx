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
import { useLanguage } from "@/i18n/LanguageContext";

interface LanguageTestFormProps {
  ageGroup: 'infant' | 'child';
  age: number;
  onComplete: (results: {answers: number[], total: number, average: number, ageGroup: string, age: number, detailedAgeGroup: string, ageInMonths: number}) => void;
  onBack: () => void;
}

const getDetailedAgeGroup = (age: number): string => {
  if (age <= 12) return '0-12개월';
  if (age <= 24) return '13-24개월';
  if (age <= 36) return '25-36개월';
  if (age <= 48) return '37-48개월';
  if (age <= 60) return '49-60개월';
  if (age <= 72) return '61-72개월';
  return '73개월 이상';
};

const languageQuestionsKo = {
  'infant': [
    "아이가 자신의 이름을 들으면 반응을 보입니다", "간단한 지시사항을 이해하고 따릅니다", "10개 이상의 단어를 말할 수 있습니다",
    "두 단어를 조합하여 표현합니다", "일상적인 물건의 이름을 말할 수 있습니다", "그림책을 보며 관심을 보입니다",
    "간단한 질문에 몸짓으로 대답합니다", "음성 모방을 시도합니다", "친숙한 사람과 소리로 소통합니다",
    "노래나 운율에 반응을 보입니다", "원하는 것을 말이나 몸짓으로 표현합니다", "책의 그림을 가리키며 이름을 말합니다",
    "간단한 문장을 이해합니다", "색깔이나 크기를 구분하여 표현합니다", "자신의 감정을 단어로 표현하려 합니다",
    "다른 사람의 말을 따라 합니다", "일상 활동을 언어로 표현합니다", "질문에 적절히 대답하려 노력합니다",
    "새로운 단어를 배우려는 관심을 보입니다", "상황에 맞는 인사말을 사용합니다"
  ],
  'child': [
    "또래와 원활하게 대화할 수 있습니다", "복잡한 문장을 이해하고 사용합니다", "이야기를 순서대로 말할 수 있습니다",
    "은유나 비유 표현을 이해합니다", "토론이나 설명을 논리적으로 합니다", "다양한 어휘를 상황에 맞게 사용합니다",
    "읽기와 쓰기 능력이 연령에 적합합니다", "농담이나 말장난을 이해합니다", "감정을 언어로 세밀하게 표현합니다",
    "학습 내용을 언어로 설명할 수 있습니다", "질문을 만들어 궁금한 것을 묻습니다", "상대방의 말을 끝까지 듣고 반응합니다",
    "예의 바른 언어 사용을 합니다", "문제 상황을 언어로 설명하고 해결책을 제시합니다", "이야기를 창의적으로 만들어 말합니다",
    "다른 사람의 기분을 언어로 파악합니다", "복잡한 지시사항을 이해하고 따릅니다", "언어로 협상하고 타협합니다",
    "자신의 의견을 논리적으로 표현합니다", "언어 규칙을 잘 지켜 말합니다"
  ],
};

const languageQuestionsEn = {
  'infant': [
    "The child responds when hearing their name", "Understands and follows simple instructions", "Can say 10 or more words",
    "Combines two words to express", "Can name everyday objects", "Shows interest when looking at picture books",
    "Answers simple questions with gestures", "Attempts to imitate sounds", "Communicates with familiar people using sounds",
    "Responds to songs or rhythms", "Expresses wants through words or gestures", "Points at pictures in books and names them",
    "Understands simple sentences", "Distinguishes and expresses colors or sizes", "Tries to express emotions with words",
    "Imitates other people's speech", "Expresses daily activities in words", "Tries to answer questions appropriately",
    "Shows interest in learning new words", "Uses appropriate greetings for situations"
  ],
  'child': [
    "Can converse smoothly with peers", "Understands and uses complex sentences", "Can tell a story in sequence",
    "Understands metaphors and figurative language", "Discusses and explains logically", "Uses diverse vocabulary appropriately",
    "Reading and writing skills are age-appropriate", "Understands jokes and wordplay", "Expresses emotions with nuanced language",
    "Can explain learning content verbally", "Creates questions to ask about curiosities", "Listens to others fully and responds",
    "Uses polite language", "Explains problem situations and suggests solutions", "Creatively makes up stories",
    "Identifies others' moods through language", "Understands and follows complex instructions", "Negotiates and compromises with language",
    "Expresses opinions logically", "Follows language rules when speaking"
  ],
};

const LanguageTestForm = ({ ageGroup, age, onComplete, onBack }: LanguageTestFormProps) => {
  const { isEnglish } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(20).fill(""));
  const [hasStarted, setHasStarted] = useState(false);
  const { consumeTokens } = useTokens();

  const questions = isEnglish ? languageQuestionsEn[ageGroup] : languageQuestionsKo[ageGroup];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1);
      else completeTest(newAnswers);
    }, 300);
  };

  const completeTest = (finalAnswers: string[]) => {
    const numericAnswers = finalAnswers.map(a => { const p = parseInt(a); return isNaN(p) ? 0 : p; });
    const total = numericAnswers.reduce((sum, a) => sum + a, 0);
    const average = Math.round((total / numericAnswers.length) * 10) / 10;
    const ageGroupLabel = ageGroup === 'infant' ? (isEnglish ? 'Infant' : '영유아') : (isEnglish ? 'Child' : '아동청소년');
    onComplete({ answers: numericAnswers, total, average, ageGroup: ageGroupLabel, age, detailedAgeGroup: getDetailedAgeGroup(age), ageInMonths: age });
  };

  const handleStartTest = async () => {
    const success = await consumeTokens(TOKEN_COSTS.LANGUAGE_TEST);
    if (success) setHasStarted(true);
  };

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-6 flex items-center justify-center">
        <TokenGate
          tokensRequired={TOKEN_COSTS.LANGUAGE_TEST}
          featureName={isEnglish ? `Language Development Check (${ageGroup === 'infant' ? 'Infant' : 'Child'} 20 items)` : `언어발달 자가체크 (${ageGroup === 'infant' ? '영유아' : '아동청소년'} 20문항)`}
          featureKey="LANGUAGE_TEST"
          onProceed={handleStartTest}
        />
      </div>
    );
  }

  const optLabel1 = isEnglish ? 'Not at all (1)' : '전혀 아니다 (1점)';
  const optLabel2 = isEnglish ? 'Average (2)' : '보통이다 (2점)';
  const optLabel3 = isEnglish ? 'Very much so (3)' : '매우 그렇다 (3점)';

  return (
    <Card className="max-w-4xl mx-auto p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2"><ArrowLeft className="w-4 h-4" />{isEnglish ? 'Go Back' : '뒤로가기'}</Button>
          <span className="text-sm text-muted-foreground">{currentQuestion + 1} / {questions.length}</span>
        </div>
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-center text-sm text-muted-foreground">{isEnglish ? 'Progress' : '진행률'}: {Math.round(progress)}%</p>
        </div>
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-center">{questions[currentQuestion]}</h2>
          <RadioGroup value={answers[currentQuestion]} onValueChange={handleAnswer} className="space-y-4">
            <div className="flex items-center space-x-2"><RadioGroupItem value="1" id={`lang-q${currentQuestion}-opt1`} /><Label htmlFor={`lang-q${currentQuestion}-opt1`} className="text-base cursor-pointer">{optLabel1}</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="2" id={`lang-q${currentQuestion}-opt2`} /><Label htmlFor={`lang-q${currentQuestion}-opt2`} className="text-base cursor-pointer">{optLabel2}</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="3" id={`lang-q${currentQuestion}-opt3`} /><Label htmlFor={`lang-q${currentQuestion}-opt3`} className="text-base cursor-pointer">{optLabel3}</Label></div>
          </RadioGroup>
        </div>
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={() => currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1)} disabled={currentQuestion === 0}>{isEnglish ? 'Previous' : '이전'}</Button>
          <Button onClick={() => { if (currentQuestion === questions.length - 1) completeTest(answers); else setCurrentQuestion(currentQuestion + 1); }} disabled={!answers[currentQuestion]} className="btn-brand">
            {currentQuestion === questions.length - 1 ? (isEnglish ? 'View Results' : '결과 보기') : (isEnglish ? 'Next' : '다음')}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default LanguageTestForm;
