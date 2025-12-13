import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, CheckCircle, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { infantAssessmentQuestions } from "@/data/assessmentQuestions";
import { AssessmentQuestion } from "@/types/assessment";

interface InfantAssessmentProps {
  age: number;
  onComplete: (results: Record<string, number>) => void;
  onBack: () => void;
}

const InfantAssessment = ({ age, onComplete, onBack }: InfantAssessmentProps) => {
  // 모든 질문을 평면화
  const allQuestions: AssessmentQuestion[] = [
    ...infantAssessmentQuestions.grossMotor,
    ...infantAssessmentQuestions.fineMotor,
    ...infantAssessmentQuestions.language,
    ...infantAssessmentQuestions.social,
    ...infantAssessmentQuestions.cognitive
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showObservationGuide, setShowObservationGuide] = useState(false);

  const currentQuestion = allQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / allQuestions.length) * 100;
  const isLastQuestion = currentQuestionIndex === allQuestions.length - 1;

  const handleAnswer = (score: number) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: score
    };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      onComplete(newAnswers);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowObservationGuide(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowObservationGuide(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      gross_motor: "🏃‍♂️",
      fine_motor: "✂️", 
      language: "💬",
      social: "👥",
      cognitive: "🧠"
    };
    return icons[category as keyof typeof icons] || "📝";
  };

  const getCategoryName = (category: string) => {
    const names = {
      gross_motor: "대근육 발달",
      fine_motor: "소근육 발달",
      language: "언어 발달", 
      social: "사회성 발달",
      cognitive: "인지 발달"
    };
    return names[category as keyof typeof names] || "발달 평가";
  };

  return (
    <div className="bg-gradient-to-br from-background via-gentle-peach/20 to-warm-lavender/30 relative overflow-hidden py-8 min-h-[calc(100vh-64px)]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gentle-peach/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 right-16 w-96 h-96 bg-warm-lavender/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-brand-gradient">
              영유아 발달체크 ({age}세)
            </div>
            <div className="text-sm text-muted-foreground">
              {currentQuestionIndex + 1} / {allQuestions.length}
            </div>
          </div>
          
          <div className="w-20" /> {/* Spacer */}
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">진행률</span>
            <span className="text-sm font-semibold text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Question Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden hover-glow">
            <div className="p-8 space-y-6">
              {/* Category Badge */}
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getCategoryIcon(currentQuestion.category)}</span>
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {getCategoryName(currentQuestion.category)}
                </div>
                <div className="bg-warm-lavender/50 text-warm-lavender-foreground px-3 py-1 rounded-full text-sm">
                  {currentQuestion.ageRange}
                </div>
              </div>

              {/* Question */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground leading-relaxed">
                  {currentQuestion.text}
                </h2>
                
                {currentQuestion.materialsNeeded && (
                  <div className="bg-soft-mint/20 p-4 rounded-xl">
                    <p className="text-sm font-semibold text-foreground mb-2">필요한 준비물:</p>
                    <div className="flex flex-wrap gap-2">
                      {currentQuestion.materialsNeeded.map((material, index) => (
                        <span key={index} className="bg-soft-mint text-soft-mint-foreground px-2 py-1 rounded-lg text-sm">
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Observation Guide */}
              {currentQuestion.observationGuide && (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowObservationGuide(!showObservationGuide)}
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    관찰 가이드 {showObservationGuide ? '숨기기' : '보기'}
                  </Button>
                  
                  {showObservationGuide && (
                    <div className="bg-calm-blue/20 p-4 rounded-xl border-l-4 border-calm-blue">
                      <p className="text-foreground">{currentQuestion.observationGuide}</p>
                      {currentQuestion.clinicalSignificance && (
                        <p className="text-sm text-muted-foreground mt-2">
                          <strong>임상적 의미:</strong> {currentQuestion.clinicalSignificance}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Answer Options */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">관찰 결과를 선택해주세요:</h3>
                
                <div className="grid gap-3">
                  {/* Excellent */}
                  <Button
                    variant="outline"
                    onClick={() => handleAnswer(currentQuestion.scoringCriteria.excellent.score)}
                    className="p-6 h-auto text-left justify-start hover:bg-green-50 hover:border-green-200 group"
                  >
                    <div className="flex items-start gap-3 w-full">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="font-semibold text-green-700">매우 잘함</div>
                        <div className="text-sm text-muted-foreground">
                          {currentQuestion.scoringCriteria.excellent.description}
                        </div>
                      </div>
                    </div>
                  </Button>

                  {/* Good */}
                  <Button
                    variant="outline"
                    onClick={() => handleAnswer(currentQuestion.scoringCriteria.good.score)}
                    className="p-6 h-auto text-left justify-start hover:bg-blue-50 hover:border-blue-200 group"
                  >
                    <div className="flex items-start gap-3 w-full">
                      <CheckCircle className="w-5 h-5 text-blue-500 mt-1 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="font-semibold text-blue-700">보통</div>
                        <div className="text-sm text-muted-foreground">
                          {currentQuestion.scoringCriteria.good.description}
                        </div>
                      </div>
                    </div>
                  </Button>

                  {/* Needs Support */}
                  <Button
                    variant="outline"
                    onClick={() => handleAnswer(currentQuestion.scoringCriteria.needsSupport.score)}
                    className="p-6 h-auto text-left justify-start hover:bg-orange-50 hover:border-orange-200 group"
                  >
                    <div className="flex items-start gap-3 w-full">
                      <AlertCircle className="w-5 h-5 text-orange-500 mt-1 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="font-semibold text-orange-700">도움 필요</div>
                        <div className="text-sm text-muted-foreground">
                          {currentQuestion.scoringCriteria.needsSupport.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="ghost"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  이전 질문
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  평균 소요시간: 3분
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InfantAssessment;