import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Users, MessageCircle, Gamepad2, Brain, Ear } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { socialBehaviorCheckQuestions } from "@/data/socialBehaviorCheckQuestions";
import ModernAnalysisLoading from "./ModernAnalysisLoading";
import BirthDateSelector from "./BirthDateSelector";
import { useLanguage } from "@/i18n/LanguageContext";

interface SocialBehaviorCheckFormProps {
  onComplete: (results: any, answers: Record<string, string>) => void;
  onBack: () => void;
}

const SocialBehaviorCheckForm: React.FC<SocialBehaviorCheckFormProps> = ({ onComplete, onBack }) => {
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [ageInMonths, setAgeInMonths] = useState<number>(0);
  const [ageGroup, setAgeGroup] = useState<string>("");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isEnglish } = useLanguage();

  const handleBirthDateConfirm = (date: Date, months: number, group: string) => {
    setBirthDate(date);
    setAgeInMonths(months);
    setAgeGroup(group);
  };

  const allQuestions = Object.values(socialBehaviorCheckQuestions).flat();
  const totalQuestions = allQuestions.length;
  const progress = ((currentStep + 1) / totalQuestions) * 100;
  const currentQuestion = allQuestions[currentStep];

  const categoryIcons = {
    social_interaction: Users, play_peer: Gamepad2, communication: MessageCircle,
    behavioral_patterns: Brain, sensory_response: Ear
  };

  const categoryLabels = isEnglish ? {
    social_interaction: "Social Interaction", play_peer: "Play & Peer Relations",
    communication: "Communication", behavioral_patterns: "Behavioral Patterns",
    sensory_response: "Sensory Response"
  } : {
    social_interaction: "사회적 상호작용", play_peer: "놀이 및 또래관계",
    communication: "의사소통", behavioral_patterns: "행동 패턴",
    sensory_response: "감각 반응"
  };

  const categoryColors = {
    social_interaction: "bg-blue-100 text-blue-600", play_peer: "bg-green-100 text-green-600",
    communication: "bg-purple-100 text-purple-600", behavioral_patterns: "bg-orange-100 text-orange-600",
    sensory_response: "bg-pink-100 text-pink-600"
  };

  if (!birthDate) {
    return (
      <BirthDateSelector
        testTitle={isEnglish ? "AIH Social Behavior Development Self-Check" : "AIH 사회적 행동 발달 자가체크"}
        testSubtitle="SBDS-AIH (Social Behavior Development Self-check)"
        testDescription={isEnglish ? "A parent self-check tool to assess your child's social behavior patterns in daily life" : "일상에서 관찰되는 아이의 사회적 행동 패턴을 체크하는 부모용 자가점검 도구입니다"}
        onConfirm={handleBirthDateConfirm}
        onBack={onBack}
      />
    );
  }

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    if (currentStep < totalQuestions - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit(newAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (finalAnswers: Record<string, string>) => {
    setIsLoading(true);
    try {
      const categoryScores: Record<string, number[]> = {};
      Object.entries(finalAnswers).forEach(([questionId, answer]) => {
        const question = allQuestions.find(q => q.id === questionId);
        if (question) {
          if (!categoryScores[question.category]) categoryScores[question.category] = [];
          let score = parseInt(answer);
          if (isNaN(score)) score = 0;
          score = score * (question.weight || 1.0);
          categoryScores[question.category].push(score);
        }
      });

      const results: Record<string, number> = {};
      Object.entries(categoryScores).forEach(([category, scores]) => {
        const validScores = scores.filter(s => !isNaN(s));
        const avg = validScores.length > 0 ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length : 0;
        results[category] = Math.round((avg / 4) * 100);
      });

      const overallScore = Math.round(Object.values(results).reduce((sum, score) => sum + score, 0) / Object.keys(results).length);

      const { data, error } = await supabase.functions.invoke('social-behavior-analyzer', {
        body: { results, overallScore, answers: finalAnswers, ageGroup, ageInMonths, birthDate: birthDate.toISOString() }
      });
      if (error) throw error;
      onComplete({ ...data.analysis, scores: results, overallScore }, finalAnswers);
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: isEnglish ? "Analysis Failed" : "분석 실패",
        description: isEnglish ? "An error occurred. Please try again later." : "결과 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    const quotes = isEnglish ? [
      { text: "Every child blooms at their own pace.", author: "Child Development Expert" },
      { text: "A parent's observation is the first step to understanding.", author: "Developmental Psychology" },
      { text: "Discovering strengths becomes the seed of growth.", author: "Positive Psychology" },
      { text: "Deeper understanding leads to more accurate support.", author: "Early Intervention Research" },
    ] : [
      { text: "모든 아이는 자신만의 속도로 꽃을 피웁니다.", author: "아동발달전문가" },
      { text: "부모의 관찰은 아이 이해의 첫걸음입니다.", author: "발달심리학회" },
      { text: "강점을 발견하면 성장의 씨앗이 됩니다.", author: "긍정심리학" },
      { text: "이해가 깊어질수록 지원은 정확해집니다.", author: "조기개입연구" },
    ];

    const insights = isEnglish ? [
      { category: "Observation", text: "Daily observation provides the most accurate developmental information." },
      { category: "Strengths", text: "Every child has unique strengths." },
      { category: "Support", text: "Timely support promotes development." },
      { category: "Understanding", text: "There is always a reason behind every behavior." },
    ] : [
      { category: "관찰", text: "일상 속 관찰이 가장 정확한 발달 정보를 줍니다." },
      { category: "강점", text: "모든 아이에게는 고유한 강점이 있습니다." },
      { category: "지원", text: "적시 적소의 지원이 발달을 촉진합니다." },
      { category: "이해", text: "행동 뒤에는 항상 이유가 있습니다." },
    ];

    return (
      <ModernAnalysisLoading
        title={isEnglish ? "Analyzing Social Behavior Development" : "사회적 행동 발달 분석 중"}
        description={isEnglish ? "AI is comprehensively analyzing your observations..." : "AI가 관찰 내용을 종합 분석하고 있습니다..."}
        estimatedTime={20}
        icon={Users}
        quotes={quotes}
        insights={insights}
      />
    );
  }

  const IconComponent = categoryIcons[currentQuestion.category as keyof typeof categoryIcons] || Users;
  const categoryColor = categoryColors[currentQuestion.category as keyof typeof categoryColors] || "bg-gray-100 text-gray-600";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-50/20 to-blue-50/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            {isEnglish ? 'Go Back' : '뒤로가기'}
          </Button>
          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              {isEnglish ? 'AIH Social Behavior Development Self-Check' : 'AIH 사회적 행동 발달 자가체크'}
            </h1>
            <p className="text-sm text-muted-foreground">SBDS-AIH (Social Behavior Development Self-check)</p>
          </div>
          <div className="w-20" />
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{isEnglish ? 'Progress' : '진행률'}</span>
            <span className="text-sm text-muted-foreground">{currentStep + 1} / {totalQuestions}</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="border-2 border-green-200 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className={`p-3 rounded-full ${categoryColor}`}><IconComponent className="w-6 h-6" /></div>
                <div>
                  <CardTitle className="text-lg">
                    {categoryLabels[currentQuestion.category as keyof typeof categoryLabels]} {isEnglish ? 'Area' : '영역'}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {isEnglish ? `Question ${currentStep + 1}` : `문항 ${currentStep + 1}`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg md:text-xl font-medium mb-2 leading-relaxed">{currentQuestion.text}</h3>
                <p className="text-sm text-muted-foreground">
                  {isEnglish ? 'Select based on observations from the past 2-4 weeks' : '최근 2-4주간 관찰한 내용을 바탕으로 선택해주세요'}
                </p>
              </div>
              <div className="grid gap-3">
                {currentQuestion.options.map((option) => (
                  <Button
                    key={option.value}
                    variant={answers[currentQuestion.id] === option.value.toString() ? "default" : "outline"}
                    className={`w-full p-4 h-auto text-left justify-start transition-all ${
                      answers[currentQuestion.id] === option.value.toString() ? "bg-green-600 hover:bg-green-700 border-green-600" : "hover:bg-green-50 border-gray-200"
                    }`}
                    onClick={() => handleAnswer(option.value.toString())}
                  >
                    <div className="flex items-center w-full">
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 flex-shrink-0 ${
                        answers[currentQuestion.id] === option.value.toString() ? "bg-white border-white" : "border-gray-400"
                      }`}>
                        {answers[currentQuestion.id] === option.value.toString() && <div className="w-2 h-2 bg-green-600 rounded-full m-auto mt-0.5" />}
                      </div>
                      <span className="flex-1 text-base">{option.label}</span>
                    </div>
                  </Button>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4">
                <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0} className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {isEnglish ? 'Previous' : '이전'}
                </Button>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {isEnglish ? `${totalQuestions - currentStep - 1} questions remaining` : `${totalQuestions - currentStep - 1}개 문항 남음`}
                  </p>
                </div>
                {answers[currentQuestion.id] && currentStep < totalQuestions - 1 && (
                  <Button onClick={() => setCurrentStep(currentStep + 1)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                    {isEnglish ? 'Next' : '다음'} <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
                {!answers[currentQuestion.id] && <div className="w-16" />}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-3xl mx-auto mt-8">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h4 className="font-semibold text-green-900">📋 {isEnglish ? 'Self-Check Notice' : '자가체크 안내'}</h4>
                <p className="text-sm text-green-800 leading-relaxed">
                  {isEnglish
                    ? 'This self-check is NOT a diagnostic tool. It is a reference material to understand your child\'s developmental characteristics based on daily observations. If you have concerns, please consult a specialist.'
                    : '본 자가체크는 진단 도구가 아닙니다. 부모님의 일상 관찰을 바탕으로 아이의 발달 특성을 이해하는 참고 자료입니다. 걱정되는 부분이 있다면 전문가와 상담하세요.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SocialBehaviorCheckForm;
