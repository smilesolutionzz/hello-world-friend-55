import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heart, Brain, Users, Briefcase, ArrowLeft, ArrowRight } from "lucide-react";
import { adultAssessmentQuestions } from "@/data/assessmentQuestions";
import { AssessmentQuestion } from "@/types/assessment";

interface AdultAssessmentProps {
  age: number;
  onComplete: (results: Record<string, number>) => void;
  onBack: () => void;
}

const AdultAssessment = ({ age, onComplete, onBack }: AdultAssessmentProps) => {
  // 모든 질문을 평면화
  const allQuestions: AssessmentQuestion[] = [
    ...adultAssessmentQuestions.emotionalWellnessCheck,
    ...adultAssessmentQuestions.mindPeaceCheck,
    ...adultAssessmentQuestions.personalCharacteristics,
    ...adultAssessmentQuestions.workplaceAdaptation
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showClinicalInfo, setShowClinicalInfo] = useState(false);

  const currentQuestion = allQuestions[currentQuestionIndex];
  
  // 질문이 없는 경우 처리
  if (!currentQuestion) {
    return <div>Loading...</div>;
  }
  
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
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setShowClinicalInfo(false);
      }, 300);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowClinicalInfo(false);
    }
  };

  const getCategoryIcon = (questionId: string) => {
    if (questionId.startsWith('emo_') || questionId.startsWith('peace_')) {
      return Heart;
    } else if (questionId.startsWith('char_')) {
      return Brain;
    } else if (questionId.startsWith('work_')) {
      return Briefcase;
    } else {
      return Users;
    }
  };

  const getCategoryName = (questionId: string) => {
    if (questionId.startsWith('emo_')) return "감정건강 체크";
    if (questionId.startsWith('peace_')) return "마음평안 평가";
    if (questionId.startsWith('char_')) return "개인특성 분석";
    if (questionId.startsWith('work_')) return "직장 적응도";
    return "심리평가";
  };

  const getCategoryColor = (questionId: string) => {
    if (questionId.startsWith('emo_')) return "from-red-100 to-red-200 text-red-700";
    if (questionId.startsWith('peace_')) return "from-orange-100 to-orange-200 text-orange-700";
    if (questionId.startsWith('char_')) return "from-blue-100 to-blue-200 text-blue-700";
    if (questionId.startsWith('work_')) return "from-green-100 to-green-200 text-green-700";
    return "from-gray-100 to-gray-200 text-gray-700";
  };

  const getAnswerOptions = () => {
    // 감정건강/마음평안 척도 기반 응답 옵션
    if (currentQuestion.id.startsWith('emo_') || currentQuestion.id.startsWith('peace_')) {
      return [
        { score: 0, label: "전혀 없음", description: "해당 증상이 전혀 없었습니다", color: "text-green-700 bg-green-50 border-green-200" },
        { score: 1, label: "경미함", description: "가끔 경미하게 느꼈습니다", color: "text-yellow-700 bg-yellow-50 border-yellow-200" },
        { score: 2, label: "보통", description: "종종 보통 정도로 느꼈습니다", color: "text-orange-700 bg-orange-50 border-orange-200" },
        { score: 3, label: "심함", description: "거의 매일 심하게 느꼈습니다", color: "text-red-700 bg-red-50 border-red-200" }
      ];
    } else {
      // 성격/직장 적응도 - 일반적인 리커트 척도
      return [
        { score: 2, label: "매우 그렇다", description: "완전히 동의합니다", color: "text-green-700 bg-green-50 border-green-200" },
        { score: 1, label: "그렇다", description: "어느 정도 동의합니다", color: "text-blue-700 bg-blue-50 border-blue-200" },
        { score: 0, label: "그렇지 않다", description: "동의하지 않습니다", color: "text-orange-700 bg-orange-50 border-orange-200" }
      ];
    }
  };

  return (
    <div className="bg-gradient-to-br from-background via-primary/10 to-primary-glow/20 relative overflow-hidden py-8 min-h-[calc(100vh-64px)]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 right-16 w-96 h-96 bg-primary-glow/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
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
              성인 임상심리평가 ({age}세)
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
                {React.createElement(getCategoryIcon(currentQuestion.id), {
                  className: "w-6 h-6 text-primary"
                })}
                <div className={`px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${getCategoryColor(currentQuestion.id)}`}>
                  {getCategoryName(currentQuestion.id)}
                </div>
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  전문 임상척도
                </div>
              </div>

              {/* Question */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground leading-relaxed">
                  {currentQuestion.text}
                </h2>
                
                {/* Clinical Significance Toggle */}
                {currentQuestion.clinicalSignificance && (
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowClinicalInfo(!showClinicalInfo)}
                      className="text-sm"
                    >
                      {showClinicalInfo ? '임상정보 숨기기' : '임상정보 보기'}
                    </Button>
                    
                    {showClinicalInfo && (
                      <div className="bg-primary/10 p-4 rounded-xl border-l-4 border-primary">
                        <p className="text-sm">
                          <strong>임상적 의미:</strong> {currentQuestion.clinicalSignificance}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-calm-blue/20 p-4 rounded-xl">
                <p className="text-sm text-foreground">
                  <strong>지난 2주간의 경험</strong>을 바탕으로 가장 적합한 답변을 선택해주세요. 
                  정확한 진단을 위해 솔직하게 응답해주시기 바랍니다.
                </p>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">응답을 선택해주세요:</h3>
                
                <div className="grid gap-3">
                  {getAnswerOptions().map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => handleAnswer(option.score)}
                      className={`p-6 h-auto text-left justify-start hover:scale-[1.02] transition-all group ${option.color}`}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="w-6 h-6 border-2 border-current rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <div className="w-3 h-3 bg-current rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold mb-1">{option.label}</div>
                          <div className="text-sm opacity-80">{option.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Assessment Type Info */}
              <div className="bg-warm-lavender/20 p-4 rounded-xl">
                <div className="text-sm space-y-1">
                  <p><strong>평가 도구:</strong> 
                    {currentQuestion.id.startsWith('emo_') && " AIH 감정건강 자가체크"}
                    {currentQuestion.id.startsWith('peace_') && " AIH 마음평안 체크"}
                    {currentQuestion.id.startsWith('char_') && " AIH 개인특성 분석"}
                    {currentQuestion.id.startsWith('work_') && " AIH 직장적응 척도"}
                  </p>
                  <p className="text-muted-foreground">
                    AIH에서 개발한 창작형 평가도구로 신뢰성 있는 분석을 제공합니다.
                  </p>
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
                  예상 소요시간: 3분
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdultAssessment;