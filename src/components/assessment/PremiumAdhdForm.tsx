import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Brain, Target, Activity } from "lucide-react";
import { premiumAdhdQuestions, ageSpecificAdhdQuestions, comorbidityScreening, functionalImpairment } from "@/data/premiumAdhdQuestions";
import TokenGate from "@/components/TokenGate";
import { TOKEN_COSTS } from "@/constants/tokenCosts";
import { useTokens } from "@/hooks/useTokens";
import BirthDateSelector from "./BirthDateSelector";
import { useLanguage } from "@/i18n/LanguageContext";

interface PremiumAdhdFormProps {
  ageGroup?: 'child' | 'adolescent' | 'adult';
  onComplete: (results: {
    answers: Record<string, number>;
    scores: { inattention: number; hyperactivity: number; impulsivity: number; executiveDysfunction: number; comorbidity: number; functionalImpairment: number; };
    totalScore: number; severityLevel: string; adhdSubtype: string; ageGroup: string;
    ageInMonths?: number; birthDate?: string;
  }) => void;
  onBack: () => void;
}

const PremiumAdhdForm = ({ ageGroup: initialAgeGroup, onComplete, onBack }: PremiumAdhdFormProps) => {
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [ageInMonths, setAgeInMonths] = useState<number>(0);
  const [derivedAgeGroup, setDerivedAgeGroup] = useState<'child' | 'adolescent' | 'adult'>('adult');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [hasStarted, setHasStarted] = useState(false);
  const { consumeTokens } = useTokens();
  const { isEnglish } = useLanguage();

  const handleBirthDateConfirm = (date: Date, months: number, group: string) => {
    setBirthDate(date);
    setAgeInMonths(months);
    if (months < 144) setDerivedAgeGroup('child');
    else if (months < 228) setDerivedAgeGroup('adolescent');
    else setDerivedAgeGroup('adult');
  };

  if (!birthDate) {
    return (
      <BirthDateSelector
        testTitle={isEnglish ? "AIH Comprehensive ADHD Assessment" : "AIH 독창적 ADHD 종합평가"}
        testSubtitle={isEnglish ? "Multi-dimensional Assessment System" : "맞춤형 다차원 평가 시스템"}
        testDescription={isEnglish ? "Scientifically-grounded age-specific ADHD symptom analysis with AI expert-level interpretation" : "과학적 근거 기반의 연령별 맞춤 ADHD 증상 분석과 AI 전문가급 해석을 제공합니다"}
        onConfirm={handleBirthDateConfirm}
        onBack={onBack}
      />
    );
  }

  const ageGroup = initialAgeGroup || derivedAgeGroup;

  const getAllQuestions = () => {
    const coreQuestions = [...premiumAdhdQuestions.inattention, ...premiumAdhdQuestions.hyperactivity, ...premiumAdhdQuestions.impulsivity, ...premiumAdhdQuestions.executive_dysfunction];
    const ageSpecific = ageSpecificAdhdQuestions[ageGroup] || [];
    const comorbidity = [...comorbidityScreening.anxiety, ...comorbidityScreening.depression, ...comorbidityScreening.learning_difficulties];
    const functional = [...functionalImpairment.academic, ...functionalImpairment.social, ...functionalImpairment.occupational];
    return [...coreQuestions, ...ageSpecific, ...comorbidity, ...functional];
  };

  const questions = getAllQuestions();
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const ageGroupLabel = (g: string) => {
    if (isEnglish) return g === 'child' ? 'Child' : g === 'adolescent' ? 'Adolescent' : 'Adult';
    return g === 'child' ? '아동' : g === 'adolescent' ? '청소년' : '성인';
  };

  const categoryLabel = (cat: string) => {
    if (isEnglish) {
      if (cat === 'inattention') return 'Inattention Symptoms';
      if (cat === 'hyperactivity') return 'Hyperactivity Symptoms';
      if (cat === 'impulsivity') return 'Impulsivity Symptoms';
      if (cat === 'executive_dysfunction') return 'Executive Function';
      if (cat?.includes('comorbid')) return 'Comorbidity Screening';
      if (cat?.includes('functioning')) return 'Functional Assessment';
      if (cat?.includes('specific')) return 'Age-specific Characteristics';
      return 'Other';
    }
    if (cat === 'inattention') return '부주의 증상';
    if (cat === 'hyperactivity') return '과잉행동 증상';
    if (cat === 'impulsivity') return '충동성 증상';
    if (cat === 'executive_dysfunction') return '실행기능 평가';
    if (cat?.includes('comorbid')) return '동반질환 선별';
    if (cat?.includes('functioning')) return '기능 수준 평가';
    if (cat?.includes('specific')) return '연령별 특성';
    return '기타';
  };

  const handleAnswer = (value: string) => {
    const questionId = questions[currentQuestion].id;
    setAnswers(prev => ({ ...prev, [questionId]: parseInt(value) }));
    handleNext();
  };

  const handleStartTest = async () => {
    const success = await consumeTokens(TOKEN_COSTS.PREMIUM_ASSESSMENT);
    if (success) setHasStarted(true);
  };

  const calculateScores = () => {
    let inattentionScore = 0, hyperactivityScore = 0, impulsivityScore = 0,
      executiveDysfunctionScore = 0, comorbidityScore = 0, functionalImpairmentScore = 0;

    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = questions.find(q => q.id === questionId);
      if (!question) return;
      const weightedScore = answer * (question.severity_weight || 1);
      if (question.category === 'inattention') inattentionScore += weightedScore;
      else if (question.category === 'hyperactivity') hyperactivityScore += weightedScore;
      else if (question.category === 'impulsivity') impulsivityScore += weightedScore;
      else if (question.category === 'executive_dysfunction') executiveDysfunctionScore += weightedScore;
      else if (question.category.includes('comorbid')) comorbidityScore += weightedScore;
      else if (question.category.includes('functioning')) functionalImpairmentScore += weightedScore;
    });

    return { inattention: inattentionScore, hyperactivity: hyperactivityScore, impulsivity: impulsivityScore,
      executiveDysfunction: executiveDysfunctionScore, comorbidity: comorbidityScore, functionalImpairment: functionalImpairmentScore };
  };

  const determineSeverityAndSubtype = (scores: ReturnType<typeof calculateScores>) => {
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    let severityLevel = "";
    if (isEnglish) {
      if (totalScore <= 120) severityLevel = "Mild";
      else if (totalScore <= 240) severityLevel = "Moderate";
      else severityLevel = "Severe";
    } else {
      if (totalScore <= 120) severityLevel = "경미한 수준";
      else if (totalScore <= 240) severityLevel = "중등도 수준";
      else severityLevel = "심각한 수준";
    }
    let adhdSubtype = "";
    if (isEnglish) {
      if (scores.inattention > scores.hyperactivity + scores.impulsivity) adhdSubtype = "Predominantly Inattentive";
      else if (scores.hyperactivity + scores.impulsivity > scores.inattention) adhdSubtype = "Predominantly Hyperactive-Impulsive";
      else adhdSubtype = "Combined Type";
    } else {
      if (scores.inattention > scores.hyperactivity + scores.impulsivity) adhdSubtype = "부주의 우세형";
      else if (scores.hyperactivity + scores.impulsivity > scores.inattention) adhdSubtype = "과잉행동-충동성 우세형";
      else adhdSubtype = "복합형";
    }
    return { severityLevel, adhdSubtype, totalScore };
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const scores = calculateScores();
      const { severityLevel, adhdSubtype, totalScore } = determineSeverityAndSubtype(scores);
      onComplete({
        answers, scores, totalScore, severityLevel, adhdSubtype,
        ageGroup: ageGroupLabel(ageGroup), ageInMonths, birthDate: birthDate?.toISOString()
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const currentQuestionId = questions[currentQuestion]?.id;
  const currentAnswer = answers[currentQuestionId];
  const canProceed = currentAnswer !== undefined && currentAnswer >= 0;

  const optionLabels = isEnglish
    ? [
        { value: "0", label: "Not at all (0)" },
        { value: "1", label: "Sometimes (1)" },
        { value: "2", label: "Often (2)" },
        { value: "3", label: "Almost always (3)" }
      ]
    : [
        { value: "0", label: "전혀 그렇지 않다 (0점)" },
        { value: "1", label: "가끔 그렇다 (1점)" },
        { value: "2", label: "자주 그렇다 (2점)" },
        { value: "3", label: "거의 항상 그렇다 (3점)" }
      ];

  if (!hasStarted) {
    return (
      <TokenGate
        tokensRequired={TOKEN_COSTS.PREMIUM_ASSESSMENT}
        featureName={isEnglish ? "AIH Premium ADHD Assessment" : "AIH 프리미엄 ADHD 정밀검사"}
        onProceed={handleStartTest}
      >
        <div className="space-y-6 text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {isEnglish ? 'CAT-based Premium ADHD Assessment' : 'CAT 기반 프리미엄 ADHD 정밀검사'}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="p-4 bg-primary/5 rounded-lg">
              <Brain className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-2">{isEnglish ? 'AHI-FOCUS Precision Diagnosis' : 'AHI-FOCUS 기반 정밀진단'}</h3>
              <p className="text-sm text-muted-foreground">{isEnglish ? 'Systematic assessment based on AIH diagnostic criteria' : 'AIH 독창적 진단 기준에 따른 체계적 평가'}</p>
            </div>
            <div className="p-4 bg-accent/5 rounded-lg">
              <Target className="w-8 h-8 mx-auto mb-2 text-accent" />
              <h3 className="font-semibold mb-2">{isEnglish ? '4-Domain Analysis' : '4영역 세분화 분석'}</h3>
              <p className="text-sm text-muted-foreground">{isEnglish ? 'Inattention/Hyperactivity/Impulsivity/Executive Function' : '부주의/과잉행동/충동성/실행기능 정밀분석'}</p>
            </div>
            <div className="p-4 bg-secondary/5 rounded-lg">
              <Activity className="w-8 h-8 mx-auto mb-2 text-secondary" />
              <h3 className="font-semibold mb-2">{isEnglish ? 'AI In-depth Analysis' : 'AI 심층 분석'}</h3>
              <p className="text-sm text-muted-foreground">{isEnglish ? 'Personalized treatment direction & lifestyle guide' : '개인별 맞춤 치료방향 및 생활관리 가이드'}</p>
            </div>
          </div>
          <div className="bg-warning/10 p-4 rounded-lg max-w-2xl mx-auto">
            <ul className="space-y-2 text-sm">
              <li>• {ageGroupLabel(ageGroup)} {isEnglish ? 'tailored assessment items' : '맞춤 평가 문항'}</li>
              <li>• {isEnglish ? `Total ${questions.length} questions, approx. 15-20 minutes` : `총 ${questions.length}문항, 약 15-20분 소요`}</li>
              <li>• {isEnglish ? 'ADHD subtype identification & comorbidity screening' : 'ADHD 하위유형 판별 및 동반질환 선별'}</li>
              <li>• {isEnglish ? 'Daily functioning level assessment' : '일상생활 기능 수준 평가'}</li>
              <li>• {isEnglish ? 'Personalized treatment & management guidance' : '개인별 치료 및 관리 방향 제시'}</li>
            </ul>
          </div>
        </div>
      </TokenGate>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <Card className="max-w-4xl mx-auto p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            {isEnglish ? 'Go Back' : '뒤로가기'}
          </Button>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">{currentQuestion + 1} / {questions.length}</div>
            <div className="text-xs text-muted-foreground mt-1">{categoryLabel(currentQ?.category)}</div>
          </div>
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-center text-sm text-muted-foreground">
            {isEnglish ? `Progress: ${Math.round(progress)}%` : `진행률: ${Math.round(progress)}%`}
          </p>
        </div>

        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">{currentQ?.text}</h2>
            {(currentQ as any)?.subcategory && (
              <p className="text-sm text-muted-foreground">
                {isEnglish ? 'Assessment Area:' : '평가 영역:'} {(currentQ as any).subcategory}
              </p>
            )}
          </div>
          <RadioGroup value={currentAnswer?.toString() || ""} onValueChange={handleAnswer} className="space-y-4">
            {optionLabels.map((opt) => (
              <div key={opt.value} className="flex items-center space-x-2">
                <RadioGroupItem value={opt.value} id={`option${opt.value}`} />
                <Label htmlFor={`option${opt.value}`} className="text-base cursor-pointer">{opt.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between items-center pt-6">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
            {isEnglish ? 'Previous' : '이전'}
          </Button>
          <Button onClick={handleNext} disabled={!canProceed} className="btn-brand">
            {currentQuestion === questions.length - 1 ? (isEnglish ? 'Start AI Analysis' : 'AI 분석 시작') : (isEnglish ? 'Next' : '다음')}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PremiumAdhdForm;
