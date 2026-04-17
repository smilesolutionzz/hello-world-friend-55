import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, CheckCircle, Brain, Users, MessageSquare, BookOpen, Target } from "lucide-react";
import { childAssessmentQuestions, getCategoryDisplayName, getCategoryDescription } from "@/data/childAssessmentQuestions";

interface ChildAssessmentSimplifiedProps {
  age: number;
  onComplete: (results: Record<string, number>) => void;
  onBack: () => void;
}

const ChildAssessmentSimplified = ({ age, onComplete, onBack }: ChildAssessmentSimplifiedProps) => {
  // 모든 질문을 평면화
  const allQuestions = [
    ...childAssessmentQuestions.attention,
    ...childAssessmentQuestions.memory,
    ...childAssessmentQuestions.social,
    ...childAssessmentQuestions.language,
    ...childAssessmentQuestions.learning
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const safeIndex = allQuestions.length > 0
    ? Math.min(Math.max(currentQuestionIndex, 0), allQuestions.length - 1)
    : 0;
  const currentQuestion = allQuestions[safeIndex];
  const progress = allQuestions.length > 0 ? ((safeIndex + 1) / allQuestions.length) * 100 : 0;
  const isLastQuestion = safeIndex === allQuestions.length - 1;

  const getCategoryIcon = (category: string) => {
    const icons = {
      attention: Target,
      memory: Brain,
      social: Users,
      language: MessageSquare,
      learning: BookOpen
    };
    return icons[category as keyof typeof icons] || Brain;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      attention: "bg-blue-100 text-blue-800",
      memory: "bg-purple-100 text-purple-800", 
      social: "bg-green-100 text-green-800",
      language: "bg-orange-100 text-orange-800",
      learning: "bg-pink-100 text-pink-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: parseInt(value)
    }));
    
    // 자동으로 다음 질문으로 이동
    setTimeout(() => {
      handleNext();
    }, 500);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // 카테고리별 평균 점수 계산
      const categoryScores: Record<string, number> = {};
      
      Object.keys(childAssessmentQuestions).forEach(category => {
        const categoryQuestions = childAssessmentQuestions[category as keyof typeof childAssessmentQuestions];
        const categoryAnswers = categoryQuestions
          .map(q => answers[q.id] || 0)
          .filter(score => score !== undefined);
        
        if (categoryAnswers.length > 0) {
          const average = categoryAnswers.reduce((sum, score) => sum + score, 0) / categoryAnswers.length;
          categoryScores[getCategoryDisplayName(category)] = Math.round(average * 100 / 3); // 0-100 점수로 변환
        }
      });

      onComplete(categoryScores);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const isAnswered = answers[currentQuestion.id] !== undefined;

  return (
    <div className="bg-gradient-to-br from-background via-calm-blue/20 to-soft-mint/30 relative overflow-hidden py-8 min-h-[calc(100vh-64px)]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-calm-blue/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 right-16 w-96 h-96 bg-soft-mint/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
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
              아동청소년 발달평가 ({age}세)
            </div>
            <div className="text-sm text-muted-foreground">
              {currentQuestionIndex + 1} / {allQuestions.length}
            </div>
          </div>
          
          <div className="w-20" />
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
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-4">
                {React.createElement(getCategoryIcon(currentQuestion.category), {
                  className: "w-6 h-6 text-primary"
                })}
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(currentQuestion.category)}`}>
                  {getCategoryDisplayName(currentQuestion.category)}
                </div>
              </div>
              <CardTitle className="text-xl leading-relaxed">
                {currentQuestion.text}
              </CardTitle>
              {(currentQuestion as any).example && (
                <p className="text-sm text-muted-foreground mt-2">
                  {(currentQuestion as any).example}
                </p>
              )}
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Category Description */}
              <div className="bg-primary/5 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {getCategoryDescription(currentQuestion.category)}
                </p>
              </div>

              {/* Answer Options */}
              <RadioGroup
                value={answers[currentQuestion.id]?.toString() || ""}
                onValueChange={handleAnswerChange}
                className="space-y-4"
              >
                {Object.entries(currentQuestion.scoringCriteria).map(([key, criteria]) => (
                  <div key={key} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={criteria.score.toString()} id={key} className="mt-1" />
                    <Label htmlFor={key} className="flex-1 cursor-pointer">
                      <div className="font-medium mb-1">
                        {criteria.score}점 - {criteria.description}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  이전
                </Button>

                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">
                    연령대: {currentQuestion.ageRange}
                  </div>
                  {isAnswered && (
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      답변 완료
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleNext}
                  disabled={!isAnswered}
                  className="flex items-center gap-2"
                >
                  {isLastQuestion ? "결과 보기" : "다음"}
                  {!isLastQuestion && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Navigation */}
        <div className="max-w-4xl mx-auto mt-6">
          <Card className="p-4">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {allQuestions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? "bg-primary text-primary-foreground"
                      : answers[allQuestions[index].id] !== undefined
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChildAssessmentSimplified;