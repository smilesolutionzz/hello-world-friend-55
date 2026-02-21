import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Crown, Sparkles } from "lucide-react";
import { parentingStyleAssessmentQuestions } from "@/data/premiumAssessmentQuestions";
import TokenGate from "../TokenGate";
import { useTokens } from "@/hooks/useTokens";
import { useLanguage } from "@/i18n/LanguageContext";

interface ParentingStyleFormProps {
  onComplete: (results: any) => void;
  onBack: () => void;
}

const ParentingStyleForm = ({ onComplete, onBack }: ParentingStyleFormProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [hasStarted, setHasStarted] = useState(false);
  const [childAge, setChildAge] = useState<string>('');
  const [childGender, setChildGender] = useState<string>('');
  const { consumeTokens } = useTokens();
  const { isEnglish } = useLanguage();

  const allQuestions = Object.values(parentingStyleAssessmentQuestions).flat();

  const categoryLabelsMap = isEnglish ? {
    warmth_acceptance: 'Warmth & Acceptance',
    behavioral_control: 'Behavioral Control',
    psychological_control: 'Psychological Control',
    autonomy_support: 'Autonomy Support',
    communication_support: 'Communication Support',
  } : {
    warmth_acceptance: '온정수용',
    behavioral_control: '행동통제',
    psychological_control: '심리통제',
    autonomy_support: '자율성지지',
    communication_support: '의사소통지지',
  };

  const optionLabels = isEnglish
    ? [
        { value: 1, label: "Strongly Disagree" },
        { value: 2, label: "Disagree" },
        { value: 3, label: "Agree" },
        { value: 4, label: "Strongly Agree" }
      ]
    : [
        { value: 1, label: "전혀 그렇지 않다" },
        { value: 2, label: "그렇지 않다" },
        { value: 3, label: "그렇다" },
        { value: 4, label: "매우 그렇다" }
      ];

  const handleAnswer = (value: string) => {
    const questionId = allQuestions[currentQuestion].id;
    setAnswers(prev => ({ ...prev, [questionId]: parseInt(value) }));
    handleNext();
  };

  const handleStartTest = async () => {
    try {
      const success = await consumeTokens(10);
      if (success) setHasStarted(true);
    } catch (error) {
      console.error('Token deduction failed:', error);
    }
  };

  const calculateScores = () => {
    const scores: Record<string, number> = {
      warmth_acceptance: 0, behavioral_control: 0, psychological_control: 0,
      autonomy_support: 0, communication_support: 0
    };
    const categoryCounts: Record<string, number> = { ...scores };

    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = allQuestions.find(q => q.id === questionId);
      if (question) {
        const weight = (question as any).weight || 1.0;
        const score = (question as any).reverse ? (5 - answer) : answer;
        scores[question.category] += score * weight;
        categoryCounts[question.category]++;
      }
    });

    Object.keys(scores).forEach(category => {
      if (categoryCounts[category] > 0) {
        scores[category] = Math.round((scores[category] / categoryCounts[category]) * 10) / 10;
      }
    });
    return scores;
  };

  const handleNext = () => {
    if (currentQuestion < allQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const scores = calculateScores();
      onComplete({
        scores, assessmentType: 'parentingStyle', childAge, childGender,
        totalQuestions: allQuestions.length, completedAt: new Date().toISOString()
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  if (!hasStarted) {
    return (
      <TokenGate
        tokensRequired={10}
        featureName={isEnglish ? "Premium Parenting Style Assessment" : "프리미엄 부모양육태도 검사"}
        onProceed={handleStartTest}
        children={
          <div className="space-y-4 mt-6">
            <div>
              <Label htmlFor="childAge" className="text-sm font-medium">
                {isEnglish ? "Child's Age (optional)" : "자녀 연령 (선택사항)"}
              </Label>
              <input id="childAge" type="number" min="1" max="18"
                placeholder={isEnglish ? "e.g., 5" : "예: 5세"}
                value={childAge} onChange={(e) => setChildAge(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <Label htmlFor="childGender" className="text-sm font-medium">
                {isEnglish ? "Child's Gender (optional)" : "자녀 성별 (선택사항)"}
              </Label>
              <select id="childGender" value={childGender} onChange={(e) => setChildGender(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">{isEnglish ? "Not selected" : "선택하지 않음"}</option>
                <option value="male">{isEnglish ? "Male" : "남자"}</option>
                <option value="female">{isEnglish ? "Female" : "여자"}</option>
              </select>
            </div>
          </div>
        }
      />
    );
  }

  const progress = ((currentQuestion + 1) / allQuestions.length) * 100;
  const currentQuestionData = allQuestions[currentQuestion];
  const currentAnswer = answers[currentQuestionData.id];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/20 to-blue-50/20 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 right-16 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>
      <div className="relative z-10 container mx-auto px-6 pt-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            {isEnglish ? 'Go Back' : '뒤로가기'}
          </Button>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {isEnglish ? 'Premium Parenting Style Assessment' : '프리미엄 부모양육태도 검사'}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {currentQuestion + 1} / {allQuestions.length} {isEnglish ? 'questions' : '문항'}
            </p>
          </div>
          <div className="w-20" />
        </div>

        <div className="max-w-4xl mx-auto mb-8">
          <Progress value={progress} className="h-3" />
          <p className="text-center text-sm text-muted-foreground mt-2">
            {Math.round(progress)}% {isEnglish ? 'complete' : '완료'}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-purple-200 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">
                  {categoryLabelsMap[currentQuestionData.category as keyof typeof categoryLabelsMap] || (isEnglish ? 'Parenting' : '양육태도')} {isEnglish ? 'Area' : '영역'}
                </span>
              </div>
              <CardTitle className="text-xl leading-relaxed">{currentQuestionData.text}</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <RadioGroup value={currentAnswer?.toString() || ''} onValueChange={handleAnswer} className="space-y-4">
                {optionLabels.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3 p-4 rounded-lg border-2 border-transparent hover:border-purple-200 hover:bg-purple-50/50 transition-all duration-200">
                    <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                    <Label htmlFor={`option-${option.value}`} className="flex-1 text-base cursor-pointer">{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto mt-8 flex justify-between items-center">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            {isEnglish ? 'Previous' : '이전'}
          </Button>
          <Button onClick={handleNext} disabled={!currentAnswer}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            {currentQuestion === allQuestions.length - 1 ? (isEnglish ? 'Complete' : '완료') : (isEnglish ? 'Next' : '다음')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="max-w-4xl mx-auto mt-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {allQuestions.map((_, index) => (
              <button key={index} onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full text-xs font-medium border-2 transition-all duration-200 ${
                  index === currentQuestion ? 'bg-purple-600 text-white border-purple-600'
                    : answers[allQuestions[index].id] ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-gray-100 text-gray-600 border-gray-300 hover:border-purple-300'
                }`}
              >{index + 1}</button>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800 text-sm">
              {isEnglish
                ? '💎 Premium Assessment | Evidence-based In-depth Analysis | AI-Personalized Parenting Guide'
                : '💎 프리미엄 검사 | 과학적 근거 기반 심층분석 | AI 맞춤형 양육 가이드 제공'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentingStyleForm;
