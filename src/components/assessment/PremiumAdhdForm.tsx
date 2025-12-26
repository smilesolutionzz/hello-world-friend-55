import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Brain, Target, Activity, CheckCircle } from "lucide-react";
import { premiumAdhdQuestions, ageSpecificAdhdQuestions, comorbidityScreening, functionalImpairment } from "@/data/premiumAdhdQuestions";
import TokenGate from "@/components/TokenGate";
import { TOKEN_COSTS } from "@/constants/tokenCosts";
import { useTokens } from "@/hooks/useTokens";
import BirthDateSelector from "./BirthDateSelector";

interface PremiumAdhdFormProps {
  ageGroup?: 'child' | 'adolescent' | 'adult';
  onComplete: (results: {
    answers: Record<string, number>;
    scores: {
      inattention: number;
      hyperactivity: number;
      impulsivity: number;
      executiveDysfunction: number;
      comorbidity: number;
      functionalImpairment: number;
    };
    totalScore: number;
    severityLevel: string;
    adhdSubtype: string;
    ageGroup: string;
    ageInMonths?: number;
    birthDate?: string;
  }) => void;
  onBack: () => void;
}

const PremiumAdhdForm = ({ ageGroup: initialAgeGroup, onComplete, onBack }: PremiumAdhdFormProps) => {
  // 모든 useState 훅을 최상단에 선언 (React Hooks 규칙)
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [ageInMonths, setAgeInMonths] = useState<number>(0);
  const [derivedAgeGroup, setDerivedAgeGroup] = useState<'child' | 'adolescent' | 'adult'>('adult');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [hasStarted, setHasStarted] = useState(false);
  const { consumeTokens } = useTokens();

  const handleBirthDateConfirm = (date: Date, months: number, group: string) => {
    setBirthDate(date);
    setAgeInMonths(months);
    
    // 연령에 따른 그룹 결정
    if (months < 144) { // 12세 미만
      setDerivedAgeGroup('child');
    } else if (months < 228) { // 19세 미만
      setDerivedAgeGroup('adolescent');
    } else {
      setDerivedAgeGroup('adult');
    }
  };

  // 생년월일 미입력 시 생년월일 선택 화면 표시
  if (!birthDate) {
    return (
      <BirthDateSelector
        testTitle="AIH 독창적 ADHD 종합평가"
        testSubtitle="맞춤형 다차원 평가 시스템"
        testDescription="과학적 근거 기반의 연령별 맞춤 ADHD 증상 분석과 AI 전문가급 해석을 제공합니다"
        onConfirm={handleBirthDateConfirm}
        onBack={onBack}
      />
    );
  }

  const ageGroup = initialAgeGroup || derivedAgeGroup;

  // 연령에 따른 질문 조합
  const getAllQuestions = () => {
    const coreQuestions = [
      ...premiumAdhdQuestions.inattention,
      ...premiumAdhdQuestions.hyperactivity,
      ...premiumAdhdQuestions.impulsivity,
      ...premiumAdhdQuestions.executive_dysfunction
    ];
    
    const ageSpecific = ageSpecificAdhdQuestions[ageGroup] || [];
    const comorbidity = [...comorbidityScreening.anxiety, ...comorbidityScreening.depression, ...comorbidityScreening.learning_difficulties];
    const functional = [...functionalImpairment.academic, ...functionalImpairment.social, ...functionalImpairment.occupational];
    
    return [...coreQuestions, ...ageSpecific, ...comorbidity, ...functional];
  };

  const questions = getAllQuestions();
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    const questionId = questions[currentQuestion].id;
    setAnswers(prev => ({
      ...prev,
      [questionId]: parseInt(value)
    }));
    
    // 자동으로 다음 문항으로 이동 (1.2초 지연)
    setTimeout(() => {
      handleNext();
    }, 1200);
  };

  const handleStartTest = async () => {
    const success = await consumeTokens(TOKEN_COSTS.PREMIUM_ASSESSMENT);
    if (success) {
      setHasStarted(true);
    }
  };

  const calculateScores = () => {
    let inattentionScore = 0;
    let hyperactivityScore = 0;
    let impulsivityScore = 0;
    let executiveDysfunctionScore = 0;
    let comorbidityScore = 0;
    let functionalImpairmentScore = 0;

    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      const weightedScore = answer * (question.severity_weight || 1);

      if (question.category === 'inattention') {
        inattentionScore += weightedScore;
      } else if (question.category === 'hyperactivity') {
        hyperactivityScore += weightedScore;
      } else if (question.category === 'impulsivity') {
        impulsivityScore += weightedScore;
      } else if (question.category === 'executive_dysfunction') {
        executiveDysfunctionScore += weightedScore;
      } else if (question.category.includes('comorbid')) {
        comorbidityScore += weightedScore;
      } else if (question.category.includes('functioning')) {
        functionalImpairmentScore += weightedScore;
      }
    });

    return {
      inattention: inattentionScore,
      hyperactivity: hyperactivityScore,
      impulsivity: impulsivityScore,
      executiveDysfunction: executiveDysfunctionScore,
      comorbidity: comorbidityScore,
      functionalImpairment: functionalImpairmentScore
    };
  };

  const determineSeverityAndSubtype = (scores: {
    inattention: number;
    hyperactivity: number;
    impulsivity: number;
    executiveDysfunction: number;
    comorbidity: number;
    functionalImpairment: number;
  }) => {
    const totalScore = scores.inattention + scores.hyperactivity + scores.impulsivity + 
                      scores.executiveDysfunction + scores.comorbidity + scores.functionalImpairment;
    
    let severityLevel = "";
    if (totalScore <= 120) {
      severityLevel = "경미한 수준";
    } else if (totalScore <= 240) {
      severityLevel = "중등도 수준";
    } else {
      severityLevel = "심각한 수준";
    }

    let adhdSubtype = "";
    if (scores.inattention > scores.hyperactivity + scores.impulsivity) {
      adhdSubtype = "부주의 우세형";
    } else if (scores.hyperactivity + scores.impulsivity > scores.inattention) {
      adhdSubtype = "과잉행동-충동성 우세형";
    } else {
      adhdSubtype = "복합형";
    }

    return { severityLevel, adhdSubtype, totalScore };
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 테스트 완료
      const scores = calculateScores();
      const { severityLevel, adhdSubtype, totalScore } = determineSeverityAndSubtype(scores);
      
      onComplete({
        answers,
        scores,
        totalScore,
        severityLevel,
        adhdSubtype,
        ageGroup: ageGroup === 'child' ? '아동' : ageGroup === 'adolescent' ? '청소년' : '성인',
        ageInMonths,
        birthDate: birthDate?.toISOString()
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const currentQuestionId = questions[currentQuestion]?.id;
  const currentAnswer = answers[currentQuestionId];
  const canProceed = currentAnswer !== undefined && currentAnswer >= 0;

  // 토큰 게이트 표시
  if (!hasStarted) {
    return (
      <TokenGate
        tokensRequired={TOKEN_COSTS.PREMIUM_ASSESSMENT}
        featureName="AIH 프리미엄 ADHD 정밀검사"
        onProceed={handleStartTest}
      >
        <div className="space-y-6 text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            CAT 기반 프리미엄 ADHD 정밀검사
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="p-4 bg-primary/5 rounded-lg">
              <Brain className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-2">AHI-FOCUS 기반 정밀진단</h3>
              <p className="text-sm text-muted-foreground">AIH 독창적 진단 기준에 따른 체계적 평가</p>
            </div>
            
            <div className="p-4 bg-accent/5 rounded-lg">
              <Target className="w-8 h-8 mx-auto mb-2 text-accent" />
              <h3 className="font-semibold mb-2">4영역 세분화 분석</h3>
              <p className="text-sm text-muted-foreground">부주의/과잉행동/충동성/실행기능 정밀분석</p>
            </div>
            
            <div className="p-4 bg-secondary/5 rounded-lg">
              <Activity className="w-8 h-8 mx-auto mb-2 text-secondary" />
              <h3 className="font-semibold mb-2">AI 심층 분석</h3>
              <p className="text-sm text-muted-foreground">개인별 맞춤 치료방향 및 생활관리 가이드</p>
            </div>
          </div>

          <div className="bg-warning/10 p-4 rounded-lg max-w-2xl mx-auto">
            <ul className="space-y-2 text-sm">
              <li>• {ageGroup === 'child' ? '아동' : ageGroup === 'adolescent' ? '청소년' : '성인'} 맞춤 평가 문항</li>
              <li>• 총 {questions.length}문항, 약 15-20분 소요</li>
              <li>• ADHD 하위유형 판별 및 동반질환 선별</li>
              <li>• 일상생활 기능 수준 평가</li>
              <li>• 개인별 치료 및 관리 방향 제시</li>
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">
              {currentQuestion + 1} / {questions.length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {currentQ?.category === 'inattention' ? '부주의 증상' :
               currentQ?.category === 'hyperactivity' ? '과잉행동 증상' :
               currentQ?.category === 'impulsivity' ? '충동성 증상' :
               currentQ?.category === 'executive_dysfunction' ? '실행기능 평가' :
               currentQ?.category?.includes('comorbid') ? '동반질환 선별' :
               currentQ?.category?.includes('functioning') ? '기능 수준 평가' :
               currentQ?.category?.includes('specific') ? '연령별 특성' : '기타'}
            </div>
          </div>
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
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">
              {currentQ?.text}
            </h2>
            {(currentQ as any)?.subcategory && (
              <p className="text-sm text-muted-foreground">
                평가 영역: {(currentQ as any).subcategory}
              </p>
            )}
          </div>

          <RadioGroup 
            value={currentAnswer?.toString() || ""} 
            onValueChange={handleAnswer}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0" id="option0" />
              <Label htmlFor="option0" className="text-base cursor-pointer">
                전혀 그렇지 않다 (0점)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="option1" />
              <Label htmlFor="option1" className="text-base cursor-pointer">
                가끔 그렇다 (1점)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="option2" />
              <Label htmlFor="option2" className="text-base cursor-pointer">
                자주 그렇다 (2점)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="option3" />
              <Label htmlFor="option3" className="text-base cursor-pointer">
                거의 항상 그렇다 (3점)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            이전
          </Button>
          
          <div className="text-center">
            {canProceed && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="animate-pulse">1.2초 후 자동 진행...</span>
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleNext}
            disabled={!canProceed}
            className="btn-brand"
          >
            {currentQuestion === questions.length - 1 ? 'AI 분석 시작' : '다음'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PremiumAdhdForm;