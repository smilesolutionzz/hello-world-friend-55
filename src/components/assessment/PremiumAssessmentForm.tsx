import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, CheckCircle, Crown } from "lucide-react";
import { fourChoiceOptions } from "@/data/premiumAssessmentQuestions";
import { useTokens } from "@/hooks/useTokens";
import { TOKEN_COSTS } from "@/constants/tokenCosts";
import { useToast } from "@/hooks/use-toast";

interface PremiumAssessmentFormProps {
  assessmentType: string;
  questions: any[];
  assessmentInfo: any;
  onComplete: (results: Record<string, number>) => void;
  onBack: () => void;
}

const PremiumAssessmentForm = ({ 
  assessmentType, 
  questions, 
  assessmentInfo,
  onComplete, 
  onBack 
}: PremiumAssessmentFormProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const { consumeTokens, checkTokenAvailability } = useTokens();
  const { toast } = useToast();

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswerChange = (value: string) => {
    const numValue = parseInt(value);
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: numValue
    };
    setAnswers(newAnswers);
    
    // 약간의 딜레이 후 다음 문항으로 이동 (렌더링 안정화)
    setTimeout(() => {
      if (!isLastQuestion) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }, 300);
  };

  // 같은 답을 다시 클릭했을 때도 다음으로 넘어가도록 처리
  const handleOptionClick = (optionValue: number) => {
    if (answers[currentQuestion.id] === optionValue) {
      // 이미 같은 값이 선택되어 있으면 onValueChange가 발생하지 않으므로 직접 다음으로 이동
      setTimeout(() => {
        if (!isLastQuestion) {
          setCurrentQuestionIndex(prev => prev + 1);
        }
      }, 300);
    }
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      // 베타 기간 동안 토큰 체크 및 소비 비활성화
      const BETA_END_DATE = new Date('2025-10-30T23:59:59+09:00');
      const isBetaPeriod = new Date() < BETA_END_DATE;
      
      if (!isBetaPeriod) {
        // 베타 기간 종료 후에만 토큰 확인 및 소비
        const tokenCost = TOKEN_COSTS.PREMIUM_ASSESSMENT;
        if (!checkTokenAvailability(tokenCost)) {
          toast({
            title: "토큰 부족",
            description: `프리미엄 검사 분석을 위해 ${tokenCost}토큰이 필요합니다. 토큰을 충전해주세요.`,
            variant: "destructive"
          });
          return;
        }

        const tokenSuccess = await consumeTokens(tokenCost);
        if (!tokenSuccess) {
          toast({
            title: "토큰 소비 실패",
            description: "토큰 소비 중 오류가 발생했습니다. 다시 시도해주세요.",
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "검사 완료",
          description: `${tokenCost}토큰이 사용되어 전문가급 분석을 시작합니다.`,
        });
      } else {
        // 베타 기간 중 안내 메시지
      }

      // 카테고리별 점수 계산 (4점 척도 → 7점 척도 변환)
      const categoryScores: Record<string, number> = {};
      const categories = [...new Set(questions.map(q => q.category))];
      
      categories.forEach(category => {
        const categoryQuestions = questions.filter(q => q.category === category);
        const categoryAnswers = categoryQuestions
          .map(q => {
            let score = answers[q.id] || 2; // 기본값 2점 (4지선다 중간값)
            
            // 역문항 처리
            if (q.reverse) {
              score = 5 - score; // 4점 척도에서 역산
            }
            
            // 가중치 적용 (있는 경우)
            if (q.weight) {
              score = score * q.weight;
            }
            
            return score;
          });
        
        if (categoryAnswers.length > 0) {
          const average = categoryAnswers.reduce((sum, score) => sum + score, 0) / categoryAnswers.length;
          // 4점 척도(1-4)를 7점 척도(1-7)로 변환: (score - 1) / 3 * 6 + 1
          const scaledScore = ((average - 1) / 3) * 6 + 1;
          categoryScores[category] = Math.round(scaledScore * 10) / 10; // 소수점 1자리
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
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-blue-50/30 relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 right-16 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-200/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
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
              <Crown className="w-5 h-5 text-yellow-500" />
              <div className="text-lg font-semibold text-brand-gradient">
                {assessmentInfo.title}
              </div>
              <Crown className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-sm text-muted-foreground">
              {currentQuestionIndex + 1} / {questions.length} • 프리미엄 심리테스트
            </div>
          </div>
          
          <div className="w-20" />
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">진행률</span>
            <span className="text-sm font-semibold text-purple-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Question Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden hover-glow border-purple-200">
            <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-semibold text-purple-600">
                    {currentQuestionIndex + 1}
                  </div>
                  <span className="text-sm text-purple-600 font-medium">
                    {assessmentInfo.subtitle}
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
                {(currentQuestion.options || fourChoiceOptions).map((option) => (
                  <div key={option.value} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-purple-50/50 transition-colors">
                    <RadioGroupItem value={option.value.toString()} id={option.value.toString()} />
                    <Label htmlFor={option.value.toString()} className="flex-1 cursor-pointer font-medium">
                      <div className="flex items-center justify-between">
                        <span>{option.label}</span>
                        <span className="text-sm text-purple-600 font-semibold">{option.value}점</span>
                      </div>
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
                      <span>응답 완료</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleNext}
                  disabled={!isAnswered}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isLastQuestion ? "분석 시작" : "다음"}
                  {!isLastQuestion && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Navigation */}
        <div className="max-w-4xl mx-auto mt-6">
          <Card className="p-4 bg-white/70 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? "bg-purple-600 text-white"
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

        {/* Premium Notice */}
        <div className="max-w-4xl mx-auto mt-6">
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-sm mb-2">
                <Crown className="w-4 h-4 text-yellow-600" />
                <span className="text-yellow-800 font-medium">
                  프리미엄 회원만의 특별한 전문 심리테스트를 진행 중입니다
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

export default PremiumAssessmentForm;