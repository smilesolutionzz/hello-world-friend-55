import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Brain, Users, Repeat, Volume2, MessageCircle, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { autismSpectrumScreeningQuestions } from "@/data/premiumAssessmentQuestions";
import AnalysisLoadingOverlay from "@/components/analysis/AnalysisLoadingOverlay";
import BirthDateSelector from "./BirthDateSelector";

interface AutismSpectrumFormProps {
  onComplete: (results: any, answers: Record<string, string>) => void;
  onBack: () => void;
}

const AutismSpectrumForm: React.FC<AutismSpectrumFormProps> = ({ onComplete, onBack }) => {
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [ageInMonths, setAgeInMonths] = useState<number>(0);
  const [ageGroup, setAgeGroup] = useState<string>("");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleBirthDateConfirm = (date: Date, months: number, group: string) => {
    setBirthDate(date);
    setAgeInMonths(months);
    setAgeGroup(group);
  };

  // 생년월일 미입력 시 생년월일 선택 화면 표시
  if (!birthDate) {
    return (
      <BirthDateSelector
        testTitle="AIH 신경발달 조기선별검사"
        testSubtitle="ASES-AIH (Autism Spectrum Early Screening)"
        testDescription="자폐 스펙트럼의 조기 선별을 위한 과학적 근거 기반의 연령 맞춤형 검사입니다"
        onConfirm={handleBirthDateConfirm}
        onBack={onBack}
      />
    );
  }

  // Flatten all questions
  const allQuestions = Object.values(autismSpectrumScreeningQuestions).flat();
  const totalQuestions = allQuestions.length;
  const progress = ((currentStep + 1) / totalQuestions) * 100;

  const currentQuestion = allQuestions[currentStep];

  const categoryIcons = {
    social_communication: Users,
    restricted_repetitive: Repeat,
    sensory_processing: Volume2,
    communication_language: MessageCircle,
    adaptive_functioning: Target
  };

  const categoryLabels = {
    social_communication: "사회적 소통",
    restricted_repetitive: "제한적 반복행동",
    sensory_processing: "감각처리",
    communication_language: "의사소통 언어",
    adaptive_functioning: "적응기능"
  };

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
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (finalAnswers: Record<string, string>) => {
    setIsLoading(true);
    try {
      // Calculate scores by category
      const categoryScores: Record<string, number[]> = {};
      
      Object.entries(finalAnswers).forEach(([questionId, answer]) => {
        const question = allQuestions.find(q => q.id === questionId);
        if (question) {
          if (!categoryScores[question.category]) {
            categoryScores[question.category] = [];
          }
          
          let score = parseInt(answer);
          if (isNaN(score)) score = 0;
          
          // Apply reverse scoring if needed
          if (question.reverse) {
            score = 5 - score;
          }
          
          // Apply weight
          score = score * (question.weight || 1.0);
          
          categoryScores[question.category].push(score);
        }
      });

      // Calculate average scores
      const results: Record<string, number> = {};
      Object.entries(categoryScores).forEach(([category, scores]) => {
        const validScores = scores.filter(s => !isNaN(s));
        results[category] = validScores.length > 0 
          ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length 
          : 0;
      });

      // Call the analysis function with age info
      const { data, error } = await supabase.functions.invoke('autism-spectrum-analyzer', {
        body: { 
          results,
          answers: finalAnswers,
          ageGroup,
          ageInMonths,
          birthDate: birthDate.toISOString()
        }
      });

      if (error) throw error;

      // Pass the complete data including scores
      const completeResults = {
        ...data.analysis,
        scores: data.scores
      };
      
      onComplete(completeResults, finalAnswers);
    } catch (error) {
      console.error('분석 처리 중 오류:', error);
      toast({
        title: "분석 실패",
        description: "결과 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AnalysisLoadingOverlay 
        isLoading={isLoading}
        estimatedTime={25}
        title="자폐 스펙트럼 분석 중"
        description="전문적인 AI가 검사 결과를 심층 분석하고 있습니다..."
      />
    );
  }

  const IconComponent = categoryIcons[currentQuestion.category as keyof typeof categoryIcons] || Brain;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/20 to-purple-50/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AIH 신경발달 조기선별검사
            </h1>
            <p className="text-sm text-muted-foreground">ASES-AIH (Autism Spectrum Early Screening)</p>
          </div>
          <div className="w-20" />
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">진행률</span>
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} / {totalQuestions}
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Question Card */}
        <div className="max-w-3xl mx-auto">
          <Card className="border-2 border-blue-200 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-blue-100">
                  <IconComponent className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {categoryLabels[currentQuestion.category as keyof typeof categoryLabels]} 영역
                  </CardTitle>
                  <CardDescription className="text-sm">
                    문항 {currentStep + 1}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-medium mb-2 leading-relaxed">
                  {currentQuestion.text}
                </h3>
                <p className="text-sm text-muted-foreground">
                  가장 가깝다고 생각되는 답변을 선택해주세요
                </p>
              </div>

              <div className="grid gap-3">
                {currentQuestion.options.map((option) => (
                  <Button
                    key={option.value}
                    variant={answers[currentQuestion.id] === option.value.toString() ? "default" : "outline"}
                    className={`w-full p-4 h-auto text-left justify-start transition-all ${
                      answers[currentQuestion.id] === option.value.toString()
                        ? "bg-blue-600 hover:bg-blue-700 border-blue-600" 
                        : "hover:bg-blue-50 border-gray-200"
                    }`}
                    onClick={() => handleAnswer(option.value.toString())}
                  >
                    <div className="flex items-center w-full">
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 flex-shrink-0 ${
                        answers[currentQuestion.id] === option.value.toString()
                          ? "bg-white border-white" 
                          : "border-gray-400"
                      }`}>
                        {answers[currentQuestion.id] === option.value.toString() && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full m-auto mt-0.5" />
                        )}
                      </div>
                      <span className="flex-1 text-base">{option.label}</span>
                    </div>
                  </Button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-4">
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  이전
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {totalQuestions - currentStep - 1}개 문항 남음
                  </p>
                </div>

                {answers[currentQuestion.id] && currentStep < totalQuestions - 1 && (
                  <Button 
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="flex items-center gap-2"
                  >
                    다음
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
                
                {!answers[currentQuestion.id] && (
                  <div className="w-16" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assessment Info */}
        <div className="max-w-3xl mx-auto mt-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h4 className="font-semibold text-blue-900">검사 안내</h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                  본 검사는 자폐 스펙트럼의 조기 선별을 위한 과학적 근거 기반의 창작형 도구입니다. 
                  진단이 아닌 선별 목적으로 사용되며, 정확한 평가를 위해서는 전문의와 상담하시기 바랍니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AutismSpectrumForm;