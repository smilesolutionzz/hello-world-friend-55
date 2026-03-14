import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import AnalysisLoadingScreen from './AnalysisLoadingScreen';
import { useTokens } from "@/hooks/useTokens";
import { TOKEN_COSTS } from "@/constants/tokenCosts";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n";

const questionsKo = [
  { id: "attach1", text: "다른 사람과 친밀해지는 것이 쉽다", dimension: "avoidance", reverse: true },
  { id: "attach2", text: "다른 사람에게 의존하는 것이 편하지 않다", dimension: "avoidance", reverse: false },
  { id: "attach3", text: "혼자 있는 것이 편하다", dimension: "avoidance", reverse: false },
  { id: "attach4", text: "사람들이 나에게 너무 가까워지려 할 때 불편하다", dimension: "avoidance", reverse: false },
  { id: "attach5", text: "사람들과 가까워지고 싶지만 상처받을까 봐 망설여진다", dimension: "anxiety", reverse: false },
  { id: "attach6", text: "다른 사람들이 나만큼 가까워지고 싶어하지 않을까 봐 걱정된다", dimension: "anxiety", reverse: false },
  { id: "attach7", text: "혼자 남겨질까 봐 걱정된다", dimension: "anxiety", reverse: false },
  { id: "attach8", text: "연인이 나를 진정으로 사랑하는지 의심할 때가 있다", dimension: "anxiety", reverse: false },
  { id: "attach9", text: "다른 사람에게 의존하는 것은 자연스러운 일이다", dimension: "avoidance", reverse: true },
  { id: "attach10", text: "가까운 사람들과의 관계에서 편안함을 느낀다", dimension: "avoidance", reverse: true },
  { id: "attach11", text: "사람들이 나를 받아들여주지 않을까 봐 걱정된다", dimension: "anxiety", reverse: false },
  { id: "attach12", text: "나는 사랑받을 가치가 없는 사람이라고 생각할 때가 있다", dimension: "anxiety", reverse: false }
];

const questionsEn = [
  { id: "attach1", text: "It is easy for me to become close to others", dimension: "avoidance", reverse: true },
  { id: "attach2", text: "I am not comfortable depending on others", dimension: "avoidance", reverse: false },
  { id: "attach3", text: "I feel comfortable being alone", dimension: "avoidance", reverse: false },
  { id: "attach4", text: "I feel uncomfortable when people try to get too close to me", dimension: "avoidance", reverse: false },
  { id: "attach5", text: "I want to get close to people but hesitate for fear of getting hurt", dimension: "anxiety", reverse: false },
  { id: "attach6", text: "I worry that others don't want to be as close as I do", dimension: "anxiety", reverse: false },
  { id: "attach7", text: "I worry about being left alone", dimension: "anxiety", reverse: false },
  { id: "attach8", text: "I sometimes doubt whether my partner truly loves me", dimension: "anxiety", reverse: false },
  { id: "attach9", text: "Depending on others is a natural thing", dimension: "avoidance", reverse: true },
  { id: "attach10", text: "I feel comfortable in relationships with close people", dimension: "avoidance", reverse: true },
  { id: "attach11", text: "I worry that people won't accept me", dimension: "anxiety", reverse: false },
  { id: "attach12", text: "I sometimes think I'm not worthy of being loved", dimension: "anxiety", reverse: false }
];

const optionsKo = [{ value: "1", label: "전혀 그렇지 않다" },{ value: "2", label: "그렇지 않다" },{ value: "3", label: "약간 그렇지 않다" },{ value: "4", label: "보통이다" },{ value: "5", label: "약간 그렇다" },{ value: "6", label: "그렇다" },{ value: "7", label: "매우 그렇다" }];
const optionsEn = [{ value: "1", label: "Strongly disagree" },{ value: "2", label: "Disagree" },{ value: "3", label: "Slightly disagree" },{ value: "4", label: "Neutral" },{ value: "5", label: "Slightly agree" },{ value: "6", label: "Agree" },{ value: "7", label: "Strongly agree" }];

interface AttachmentStyleFormProps {
  onComplete: (results: { answers: Record<string, number>; anxietyScore: number; avoidanceScore: number; style: string; total: number; average: number; analysis?: string; }) => void;
  onBack: () => void;
}

export default function AttachmentStyleForm({ onComplete, onBack }: AttachmentStyleFormProps) {
  const { isEnglish } = useLanguage();
  const questions = isEnglish ? questionsEn : questionsKo;
  const options = isEnglish ? optionsEn : optionsKo;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const { consumeTokens, checkTokenAvailability } = useTokens();
  const { toast } = useToast();

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) setCurrentQuestion(prev => prev + 1);
      else analyzeResultsWithAnswers(newAnswers);
    }, 300);
  };

  const handlePrevious = () => { if (currentQuestion > 0) setCurrentQuestion(prev => prev - 1); };
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) setCurrentQuestion(prev => prev + 1);
    else analyzeResultsWithAnswers(answers);
  };

  const analyzeResultsWithAnswers = async (finalAnswers: Record<string, string>) => {
    const requiredTokens = TOKEN_COSTS.RELATIONSHIP_TYPE;
    if (!checkTokenAvailability(requiredTokens)) {
      toast({ title: isEnglish ? "Not enough tokens" : "토큰이 부족합니다", description: isEnglish ? `${requiredTokens} tokens required.` : `이 검사를 진행하려면 ${requiredTokens}토큰이 필요합니다.`, variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    setTimeLeft(60);
    setAnalysisProgress(0);

    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => Math.min(prev + 2, 95));
      setTimeLeft(prev => Math.max(0, prev - 2));
    }, 1000);
    
    try {
      let anxietyScore = 0, avoidanceScore = 0, anxietyCount = 0, avoidanceCount = 0;
      
      questions.forEach(question => {
        const answer = parseInt(finalAnswers[question.id] || "0");
        const score = question.reverse ? 8 - answer : answer;
        if (question.dimension === "anxiety") { anxietyScore += score; anxietyCount++; }
        else { avoidanceScore += score; avoidanceCount++; }
      });
      
      anxietyScore = anxietyScore / anxietyCount;
      avoidanceScore = avoidanceScore / avoidanceCount;
      
      let style: string;
      if (anxietyScore < 4 && avoidanceScore < 4) style = isEnglish ? "Secure" : "안정형";
      else if (anxietyScore >= 4 && avoidanceScore < 4) style = isEnglish ? "Anxious" : "불안형";
      else if (anxietyScore < 4 && avoidanceScore >= 4) style = isEnglish ? "Avoidant" : "회피형";
      else style = isEnglish ? "Disorganized" : "혼란형";
      
      const tokenConsumed = await consumeTokens(requiredTokens);
      if (!tokenConsumed) throw new Error("Token consumption failed");

      const { data: sessionData } = await supabase.auth.getSession();
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-attachment-style', {
        headers: { Authorization: `Bearer ${sessionData.session?.access_token}` },
        body: { anxietyScore, avoidanceScore, style, answers: finalAnswers }
      });

      if (analysisError) throw analysisError;

      const answerValues = Object.fromEntries(Object.entries(answers).map(([key, value]) => [key, parseInt(value)]));
      const total = anxietyScore + avoidanceScore;
      const average = total / 2;
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      setTimeLeft(0);

      onComplete({ answers: answerValues, anxietyScore, avoidanceScore, style, total, average, analysis: analysisData?.analysis });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({ title: isEnglish ? "Analysis Failed" : "분석 실패", description: isEnglish ? "An error occurred. Please try again." : "분석 중 오류가 발생했습니다. 다시 시도해주세요.", variant: "destructive" });
      clearInterval(progressInterval);
      setIsAnalyzing(false);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const isAnswered = answers[currentQ.id] !== undefined;

  if (isAnalyzing) {
    return <AnalysisLoadingScreen testName={isEnglish ? "Attachment Style" : "애착 유형"} estimatedSeconds={30} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              {isEnglish ? "Back" : "돌아가기"}
            </Button>
            <span className="text-sm text-muted-foreground">{currentQuestion + 1} / {questions.length}</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{isEnglish ? "Attachment Style Test" : "애착 유형 검사"}</CardTitle>
            <p className="text-sm text-muted-foreground">{isEnglish ? "Discover your relationship patterns" : "인간관계에서의 나의 패턴을 알아보세요"}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-4">{currentQ.text}</h3>
              <RadioGroup value={answers[currentQ.id] || ""} onValueChange={(value) => handleAnswer(currentQ.id, value)} className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`attach-q${currentQuestion}-opt${index}`} />
                    <Label htmlFor={`attach-q${currentQuestion}-opt${index}`} className="cursor-pointer">{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                {isEnglish ? "Previous" : "이전"}
              </Button>
              <Button onClick={handleNext} disabled={!isAnswered} className="flex items-center gap-2">
                {currentQuestion === questions.length - 1 ? (isEnglish ? "View Results" : "결과 보기") : (isEnglish ? "Next" : "다음")}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
