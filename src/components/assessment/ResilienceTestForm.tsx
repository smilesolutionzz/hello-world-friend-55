import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Loader2, Shield, Zap, Heart, Brain, Target, Sparkles, RefreshCw } from "lucide-react";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { useLanguage } from "@/i18n";

const questionsKo = [
  { id: "r1", category: "stress_recovery", text: "예상치 못한 위기 상황에서도 침착함을 유지할 수 있다" },
  { id: "r2", category: "stress_recovery", text: "스트레스 상황 후 비교적 빠르게 평소 상태로 돌아온다" },
  { id: "r3", category: "stress_recovery", text: "실패나 거절을 경험해도 다시 시도할 수 있다" },
  { id: "r4", category: "stress_recovery", text: "업무 압박이 심할 때도 수면과 식사를 유지한다" },
  { id: "r5", category: "stress_recovery", text: "감정적으로 힘든 상황에서 나만의 회복 방법이 있다" },
  { id: "r6", category: "stress_recovery", text: "스트레스를 받아도 중요한 일에 집중할 수 있다" },
  { id: "r7", category: "stress_recovery", text: "힘든 시기가 지나면 더 강해진 느낌이 든다" },
  { id: "r8", category: "stress_recovery", text: "부정적 감정에 오래 머물지 않고 전환할 수 있다" },
  { id: "r9", category: "adaptability", text: "갑작스러운 변화에 유연하게 적응하는 편이다" },
  { id: "r10", category: "adaptability", text: "새로운 환경이나 팀에 빠르게 적응한다" },
  { id: "r11", category: "adaptability", text: "계획이 틀어져도 대안을 찾는 것이 어렵지 않다" },
  { id: "r12", category: "adaptability", text: "불확실한 상황에서도 결정을 내릴 수 있다" },
  { id: "r13", category: "adaptability", text: "예상과 다른 결과도 수용할 수 있다" },
  { id: "r14", category: "adaptability", text: "새로운 방식을 시도하는 것에 열린 편이다" },
  { id: "r15", category: "adaptability", text: "상황에 맞게 나의 행동이나 전략을 조절한다" },
  { id: "r16", category: "adaptability", text: "변화를 위협보다 기회로 보려고 노력한다" },
  { id: "r17", category: "emotional_stability", text: "감정의 기복이 심하지 않은 편이다" },
  { id: "r18", category: "emotional_stability", text: "비판이나 부정적 피드백에 크게 흔들리지 않는다" },
  { id: "r19", category: "emotional_stability", text: "나의 감정을 잘 인식하고 표현할 수 있다" },
  { id: "r20", category: "emotional_stability", text: "타인의 부정적 감정에 과도하게 영향받지 않는다" },
  { id: "r21", category: "emotional_stability", text: "불안하거나 걱정될 때 스스로를 진정시킬 수 있다" },
  { id: "r22", category: "emotional_stability", text: "분노가 올라와도 충동적으로 행동하지 않는다" },
  { id: "r23", category: "emotional_stability", text: "어려운 상황에서도 유머를 잃지 않으려 한다" },
  { id: "r24", category: "emotional_stability", text: "나 자신에 대해 전반적으로 긍정적이다" },
  { id: "r25", category: "social_support", text: "어려울 때 도움을 요청할 수 있는 사람이 있다" },
  { id: "r26", category: "social_support", text: "힘든 일을 나눌 수 있는 친구나 동료가 있다" },
  { id: "r27", category: "social_support", text: "주변 사람들에게 지지받고 있다고 느낀다" },
  { id: "r28", category: "social_support", text: "필요할 때 먼저 도움을 요청하는 편이다" },
  { id: "r29", category: "social_support", text: "신뢰할 수 있는 멘토나 조언자가 있다" },
  { id: "r30", category: "social_support", text: "직장 외 관계(가족, 친구)가 나의 버팀목이 된다" },
  { id: "r31", category: "purpose_growth", text: "어려움 속에서도 의미나 교훈을 찾으려 한다" },
  { id: "r32", category: "purpose_growth", text: "실패를 성장의 기회로 볼 수 있다" },
  { id: "r33", category: "purpose_growth", text: "내가 하는 일에 의미와 가치를 느낀다" },
  { id: "r34", category: "purpose_growth", text: "장기적 목표가 힘든 시기를 버티는 힘이 된다" },
  { id: "r35", category: "purpose_growth", text: "역경을 통해 더 나은 사람이 될 수 있다고 믿는다" },
  { id: "r36", category: "purpose_growth", text: "나의 능력은 노력으로 개발될 수 있다고 생각한다" },
  { id: "r37", category: "purpose_growth", text: "과거의 어려움이 지금의 나를 더 강하게 만들었다" },
  { id: "r38", category: "purpose_growth", text: "미래에 대해 전반적으로 희망적이다" }
];

const questionsEn = [
  { id: "r1", category: "stress_recovery", text: "I can stay calm even in unexpected crisis situations" },
  { id: "r2", category: "stress_recovery", text: "I return to my normal state relatively quickly after stress" },
  { id: "r3", category: "stress_recovery", text: "I can try again even after failure or rejection" },
  { id: "r4", category: "stress_recovery", text: "I maintain sleep and eating habits even under work pressure" },
  { id: "r5", category: "stress_recovery", text: "I have my own recovery methods for emotionally difficult situations" },
  { id: "r6", category: "stress_recovery", text: "I can focus on important tasks even when stressed" },
  { id: "r7", category: "stress_recovery", text: "I feel stronger after going through tough times" },
  { id: "r8", category: "stress_recovery", text: "I can shift away from negative emotions without dwelling on them" },
  { id: "r9", category: "adaptability", text: "I adapt flexibly to sudden changes" },
  { id: "r10", category: "adaptability", text: "I quickly adapt to new environments or teams" },
  { id: "r11", category: "adaptability", text: "Finding alternatives when plans change isn't difficult for me" },
  { id: "r12", category: "adaptability", text: "I can make decisions even in uncertain situations" },
  { id: "r13", category: "adaptability", text: "I can accept results different from expectations" },
  { id: "r14", category: "adaptability", text: "I'm open to trying new approaches" },
  { id: "r15", category: "adaptability", text: "I adjust my behavior and strategies to fit the situation" },
  { id: "r16", category: "adaptability", text: "I try to see change as opportunity rather than threat" },
  { id: "r17", category: "emotional_stability", text: "My mood doesn't fluctuate much" },
  { id: "r18", category: "emotional_stability", text: "I'm not easily shaken by criticism or negative feedback" },
  { id: "r19", category: "emotional_stability", text: "I can recognize and express my emotions well" },
  { id: "r20", category: "emotional_stability", text: "I'm not overly affected by others' negative emotions" },
  { id: "r21", category: "emotional_stability", text: "I can calm myself down when anxious or worried" },
  { id: "r22", category: "emotional_stability", text: "I don't act impulsively even when anger rises" },
  { id: "r23", category: "emotional_stability", text: "I try not to lose my sense of humor in difficult situations" },
  { id: "r24", category: "emotional_stability", text: "I feel generally positive about myself" },
  { id: "r25", category: "social_support", text: "I have people I can ask for help when things are tough" },
  { id: "r26", category: "social_support", text: "I have friends or colleagues I can share difficult times with" },
  { id: "r27", category: "social_support", text: "I feel supported by people around me" },
  { id: "r28", category: "social_support", text: "I tend to ask for help first when needed" },
  { id: "r29", category: "social_support", text: "I have a trustworthy mentor or advisor" },
  { id: "r30", category: "social_support", text: "Relationships outside work (family, friends) are my support system" },
  { id: "r31", category: "purpose_growth", text: "I try to find meaning or lessons even in hardship" },
  { id: "r32", category: "purpose_growth", text: "I can see failure as a growth opportunity" },
  { id: "r33", category: "purpose_growth", text: "I find meaning and value in what I do" },
  { id: "r34", category: "purpose_growth", text: "Long-term goals give me strength during tough times" },
  { id: "r35", category: "purpose_growth", text: "I believe adversity can make me a better person" },
  { id: "r36", category: "purpose_growth", text: "I believe my abilities can be developed through effort" },
  { id: "r37", category: "purpose_growth", text: "Past difficulties have made me stronger today" },
  { id: "r38", category: "purpose_growth", text: "I feel generally hopeful about the future" }
];

const optionsKo = [{ value: "5", label: "매우 그렇다" },{ value: "4", label: "그렇다" },{ value: "3", label: "보통이다" },{ value: "2", label: "그렇지 않다" },{ value: "1", label: "전혀 그렇지 않다" }];
const optionsEn = [{ value: "5", label: "Strongly agree" },{ value: "4", label: "Agree" },{ value: "3", label: "Neutral" },{ value: "2", label: "Disagree" },{ value: "1", label: "Strongly disagree" }];

interface ResilienceTestFormProps {
  onComplete: (results: { answers: Record<string, string>; categoryScores: Record<string, number>; totalScore: number; resilienceType: string; resilienceLevel: string; recommendations: string[]; }) => void;
  onBack: () => void;
}

export default function ResilienceTestForm({ onComplete, onBack }: ResilienceTestFormProps) {
  const { isEnglish } = useLanguage();
  const questions = isEnglish ? questionsEn : questionsKo;
  const options = isEnglish ? optionsEn : optionsKo;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) setCurrentQuestion(prev => prev + 1);
      else analyzeResults(newAnswers);
    }, 400);
  };

  const handlePrevious = () => { if (currentQuestion > 0) setCurrentQuestion(prev => prev - 1); };

  const analyzeResults = (finalAnswers: Record<string, string>) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const categories = ['stress_recovery', 'adaptability', 'emotional_stability', 'social_support', 'purpose_growth'];
      const categoryScores: Record<string, number> = {};
      
      categories.forEach(cat => {
        const catQuestions = questions.filter(q => q.category === cat);
        let catTotal = 0;
        catQuestions.forEach(q => { catTotal += parseInt(finalAnswers[q.id] || '3'); });
        categoryScores[cat] = Math.round((catTotal / (catQuestions.length * 5)) * 100);
      });

      const totalScore = Math.round(Object.values(categoryScores).reduce((a, b) => a + b, 0) / categories.length);

      let resilienceType: string;
      if (totalScore >= 80) resilienceType = isEnglish ? "Outstanding Resilience Leader" : "탁월한 회복력 리더";
      else if (totalScore >= 65) resilienceType = isEnglish ? "Stable Adapter" : "안정적인 적응자";
      else if (totalScore >= 50) resilienceType = isEnglish ? "Growing Recoverer" : "성장 중인 회복자";
      else resilienceType = isEnglish ? "Resilience Development Needed" : "회복력 개발 필요";

      let resilienceLevel: string;
      if (totalScore >= 80) resilienceLevel = isEnglish ? "Very High" : "매우 높음";
      else if (totalScore >= 65) resilienceLevel = isEnglish ? "High" : "높음";
      else if (totalScore >= 50) resilienceLevel = isEnglish ? "Average" : "보통";
      else if (totalScore >= 35) resilienceLevel = isEnglish ? "Low" : "낮음";
      else resilienceLevel = isEnglish ? "Needs Attention" : "관심 필요";

      const recommendations: string[] = [];
      if (categoryScores.stress_recovery < 60) recommendations.push(isEnglish ? "Try regular exercise or meditation to relieve stress" : "스트레스 해소를 위한 규칙적인 운동이나 명상을 시작해보세요");
      if (categoryScores.adaptability < 60) recommendations.push(isEnglish ? "Start with small changes to gradually increase flexibility" : "작은 변화부터 시작해 점진적으로 유연성을 높여보세요");
      if (categoryScores.emotional_stability < 60) recommendations.push(isEnglish ? "Try journaling or mindfulness breathing exercises" : "감정일기를 써보거나 마음챙김 호흡을 연습해보세요");
      if (categoryScores.social_support < 60) recommendations.push(isEnglish ? "Schedule regular conversations with someone you trust" : "신뢰할 수 있는 사람과 정기적으로 대화하는 시간을 가져보세요");
      if (categoryScores.purpose_growth < 60) recommendations.push(isEnglish ? "Write down your values and long-term goals" : "나의 가치관과 장기 목표를 글로 정리해보세요");
      if (recommendations.length === 0) recommendations.push(isEnglish ? "Your resilience is excellent. Keep up your self-care routine!" : "현재 회복탄력성이 좋습니다. 지속적인 자기관리로 유지해주세요");

      onComplete({ answers: finalAnswers, categoryScores, totalScore, resilienceType, resilienceLevel, recommendations });
      setIsAnalyzing(false);
    }, 2500);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  if (!currentQ) return null;

  const getCategoryInfo = (category: string) => {
    const infoKo: Record<string, { icon: React.ReactNode; name: string; color: string }> = {
      stress_recovery: { icon: <RefreshCw className="w-5 h-5" />, name: '스트레스 회복력', color: 'text-emerald-600' },
      adaptability: { icon: <Zap className="w-5 h-5" />, name: '적응 유연성', color: 'text-amber-600' },
      emotional_stability: { icon: <Heart className="w-5 h-5" />, name: '정서적 안정성', color: 'text-rose-600' },
      social_support: { icon: <Target className="w-5 h-5" />, name: '사회적 지지망', color: 'text-blue-600' },
      purpose_growth: { icon: <Brain className="w-5 h-5" />, name: '목적의식 & 성장', color: 'text-purple-600' }
    };
    const infoEn: Record<string, { icon: React.ReactNode; name: string; color: string }> = {
      stress_recovery: { icon: <RefreshCw className="w-5 h-5" />, name: 'Stress Recovery', color: 'text-emerald-600' },
      adaptability: { icon: <Zap className="w-5 h-5" />, name: 'Adaptability', color: 'text-amber-600' },
      emotional_stability: { icon: <Heart className="w-5 h-5" />, name: 'Emotional Stability', color: 'text-rose-600' },
      social_support: { icon: <Target className="w-5 h-5" />, name: 'Social Support', color: 'text-blue-600' },
      purpose_growth: { icon: <Brain className="w-5 h-5" />, name: 'Purpose & Growth', color: 'text-purple-600' }
    };
    const info = isEnglish ? infoEn : infoKo;
    return info[category] || { icon: <Sparkles className="w-5 h-5" />, name: category, color: 'text-gray-600' };
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 border-emerald-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Shield className="h-12 w-12 text-emerald-500 animate-pulse" />
                <Sparkles className="h-6 w-6 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg text-emerald-800">{isEnglish ? "Deep resilience analysis..." : "회복탄력성 심층 분석 중..."}</h3>
                <p className="text-emerald-600">{isEnglish ? "Analyzing 5 domains comprehensively" : "5가지 영역을 종합적으로 분석하고 있어요"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const catInfo = getCategoryInfo(currentQ.category);

  return (
    <>
      <UnifiedNavigation />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 pt-20">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                {isEnglish ? "Back" : "돌아가기"}
              </Button>
              <span className="text-sm text-muted-foreground">{currentQuestion + 1} / {questions.length}</span>
            </div>
            <Progress value={progress} className="w-full h-2 bg-emerald-100" />
          </div>

          <Card className="border-emerald-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg"><Shield className="w-6 h-6" /></div>
                  <div>
                    <CardTitle className="text-xl">{isEnglish ? "Resilience Test" : "회복탄력성 검사"}</CardTitle>
                    <p className="text-white/80 text-sm flex items-center gap-2">
                      {catInfo.icon}
                      {catInfo.name} {isEnglish ? "Domain" : "영역"}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="font-medium mb-4 text-lg">{currentQ.text}</h3>
                <RadioGroup value={answers[currentQ.id] || ""} onValueChange={(value) => handleAnswer(currentQ.id, value)} className="space-y-3">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer border border-transparent hover:border-emerald-200">
                      <RadioGroupItem value={option.value} id={`resilience-q${currentQuestion}-opt${index}`} />
                      <Label htmlFor={`resilience-q${currentQuestion}-opt${index}`} className="cursor-pointer flex-1">{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="flex justify-start pt-4">
                <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0} className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {isEnglish ? "Previous" : "이전"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
