import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, CheckCircle, Crown, Baby } from "lucide-react";
import { allLanguageDevelopmentQuestions, LanguageDevelopmentQuestion } from "@/data/languageDevelopmentQuestions";

interface LanguageDevelopmentFormProps {
  onComplete: (results: Record<string, number>, answers: Record<string, string>) => void;
  onBack: () => void;
}

const LanguageDevelopmentForm = ({ onComplete, onBack }: LanguageDevelopmentFormProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const questions = allLanguageDevelopmentQuestions;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: parseInt(value)
    }));
    
    // 즉시 다음 문항으로 이동
    handleNext();
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // 결과 계산
      const receptiveQuestions = questions.filter(q => q.category === 'receptive');
      const expressiveQuestions = questions.filter(q => q.category === 'expressive');
      
      // 옵션 인덱스(0,1,2)를 실제 점수로 변환
      // 0 = 잘 못함 (0점), 1 = 보통 (0.5점), 2 = 잘함 (1점)
      const receptiveScore = receptiveQuestions.reduce((sum, q) => {
        const answer = answers[q.id] || 0;
        const score = answer === 0 ? 0 : answer === 1 ? 0.5 : 1;
        return sum + score;
      }, 0);
      
      const expressiveScore = expressiveQuestions.reduce((sum, q) => {
        const answer = answers[q.id] || 0;
        const score = answer === 0 ? 0 : answer === 1 ? 0.5 : 1;
        return sum + score;
      }, 0);
      
      const totalScore = receptiveScore + expressiveScore;

      // 최대 점수: 수용언어 23점, 표현언어 22점, 총 45점 (각 문항 최대 1점)
      const receptiveMaxScore = 23;
      const expressiveMaxScore = 22;
      const totalMaxScore = 45;

      const results = {
        receptive: receptiveScore,
        expressive: expressiveScore,
        total: totalScore,
        receptive_percentage: Math.round((receptiveScore / receptiveMaxScore) * 100),
        expressive_percentage: Math.round((expressiveScore / expressiveMaxScore) * 100),
        total_percentage: Math.round((totalScore / totalMaxScore) * 100)
      };

      // 답변 데이터를 문자열로 변환하여 전달
      const stringAnswers: Record<string, string> = {};
      Object.entries(answers).forEach(([questionId, answerIndex]) => {
        const question = questions.find(q => q.id === questionId);
        if (question) {
          stringAnswers[questionId] = question.options[answerIndex] || '';
        }
      });

      onComplete(results, stringAnswers);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-peach-bloom/10 to-lavender-mist/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-peach-bloom/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 right-16 w-96 h-96 bg-lavender-mist/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-warm-lavender/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
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
            <div className="flex items-center justify-center gap-2 mb-2">
              <Baby className="w-6 h-6 text-peach-bloom" />
              <div className="text-lg font-semibold text-brand-gradient">
                AIH 영유아 언어발달 자가체크
              </div>
              <Baby className="w-6 h-6 text-peach-bloom" />
            </div>
            <div className="text-sm text-muted-foreground">
              {currentQuestionIndex + 1} / {questions.length} • {currentQuestion.category === 'receptive' ? '수용언어' : '표현언어'} • {currentQuestion.ageRange}개월
            </div>
          </div>
          
          <div className="w-20" />
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">진행률</span>
            <span className="text-sm font-semibold text-peach-bloom">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Question Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden hover-glow border-peach-bloom/30">
            <CardHeader className="pb-4 bg-gradient-to-r from-peach-bloom/10 to-lavender-mist/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-peach-bloom/20 rounded-full flex items-center justify-center text-sm font-semibold text-peach-bloom">
                    {currentQuestionIndex + 1}
                  </div>
                  <span className="text-sm text-peach-bloom font-medium">
                    {currentQuestion.category === 'receptive' ? '수용언어' : '표현언어'} • {currentQuestion.ageRange}개월
                  </span>
                </div>
                <Crown className="w-4 h-4 text-yellow-500" />
              </div>
              <CardTitle className="text-xl leading-relaxed mt-4">
                {currentQuestion.text}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6 p-8">
              {/* Answer Options */}
              <RadioGroup
                value={answers[currentQuestion.id]?.toString() || ""}
                onValueChange={handleAnswerChange}
                className="space-y-3"
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-peach-bloom/5 transition-colors">
                    <RadioGroupItem value={index.toString()} id={index.toString()} />
                    <Label htmlFor={index.toString()} className="flex-1 cursor-pointer font-medium">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t">
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
                  {isAnswered && (
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="animate-pulse">1.2초 후 자동 진행...</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleNext}
                  disabled={!isAnswered}
                  className="flex items-center gap-2 bg-gradient-to-r from-peach-bloom to-warm-lavender hover:from-peach-bloom/80 hover:to-warm-lavender/80"
                >
                  {isLastQuestion ? "결과 확인" : "다음"}
                  {!isLastQuestion && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Navigation */}
        <div className="max-w-4xl mx-auto mt-6">
          <Card className="p-4 bg-white/70 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1 flex-wrap">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-6 h-6 rounded-full text-xs font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? "bg-peach-bloom text-white"
                      : answers[questions[index].id] !== undefined
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

        {/* Category Progress */}
        <div className="max-w-4xl mx-auto mt-6">
          <Card className="p-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-peach-bloom">수용언어</span>
                  <span className="text-xs text-muted-foreground">
                    {questions.filter(q => q.category === 'receptive' && answers[q.id] !== undefined).length} / 23
                  </span>
                </div>
                <Progress 
                  value={(questions.filter(q => q.category === 'receptive' && answers[q.id] !== undefined).length / 23) * 100} 
                  className="h-2" 
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-warm-lavender">표현언어</span>
                  <span className="text-xs text-muted-foreground">
                    {questions.filter(q => q.category === 'expressive' && answers[q.id] !== undefined).length} / 22
                  </span>
                </div>
                <Progress 
                  value={(questions.filter(q => q.category === 'expressive' && answers[q.id] !== undefined).length / 22) * 100} 
                  className="h-2" 
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Premium Notice */}
        <div className="max-w-4xl mx-auto mt-6">
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-sm mb-2">
                <Crown className="w-4 h-4 text-yellow-600" />
                <span className="text-yellow-800 font-medium">
                  프리미엄 영유아 언어발달 전문 검사를 진행 중입니다
                </span>
                <Crown className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="text-xs text-yellow-700 border-t border-yellow-200 pt-2">
                ※ 본 검사는 원저작과는 무관한 창작형 검사입니다.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LanguageDevelopmentForm;