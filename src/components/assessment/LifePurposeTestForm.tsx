import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Compass, Star, Target, Sparkles, Mountain, Heart } from "lucide-react";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { useLanguage } from "@/i18n/LanguageContext";

const questionsKo = [
  { id: "lp1", category: "fulfillment", text: "아침에 일어났을 때, 오늘 하루가 기대되나요?" },
  { id: "lp2", category: "fulfillment", text: "내가 하는 일이 세상에 의미 있는 변화를 만든다고 느끼나요?" },
  { id: "lp3", category: "fulfillment", text: "삶에서 진정한 만족감을 느끼는 순간이 자주 있나요?" },
  { id: "lp4", category: "fulfillment", text: "내 존재가 누군가에게 소중하다고 느끼나요?" },
  { id: "lp5", category: "fulfillment", text: "과거의 선택들에 대해 대체로 만족하나요?" },
  { id: "lp6", category: "fulfillment", text: "현재 삶이 내가 원하던 모습에 가깝나요?" },
  { id: "lp7", category: "fulfillment", text: "어려운 상황에서도 삶의 의미를 찾을 수 있나요?" },
  { id: "lp8", category: "fulfillment", text: "나를 표현할 수 있는 활동이나 공간이 있나요?" },
  { id: "lp9", category: "fulfillment", text: "삶에서 감사함을 자주 느끼나요?" },
  { id: "lp10", category: "fulfillment", text: "죽음을 생각할 때, 후회가 많을 것 같나요?" },
  { id: "lp11", category: "values", text: "나에게 가장 중요한 가치가 무엇인지 명확히 알고 있나요?" },
  { id: "lp12", category: "values", text: "중요한 결정을 할 때, 나의 가치관을 기준으로 판단하나요?" },
  { id: "lp13", category: "values", text: "가치관이 서로 충돌할 때, 우선순위를 정할 수 있나요?" },
  { id: "lp14", category: "values", text: "주변의 기대보다 내 가치관을 따르는 편인가요?" },
  { id: "lp15", category: "values", text: "내 가치관에 맞는 삶을 살고 있다고 느끼나요?" },
  { id: "lp16", category: "values", text: "가치관이 시간이 지나도 일관성 있게 유지되나요?" },
  { id: "lp17", category: "values", text: "가치관에 반하는 일을 요구받으면 거절할 수 있나요?" },
  { id: "lp18", category: "values", text: "내 가치관을 다른 사람에게 설명할 수 있나요?" },
  { id: "lp19", category: "values", text: "가치관을 실천하기 위해 노력하고 있나요?" },
  { id: "lp20", category: "values", text: "돈이나 명예보다 중요하게 여기는 것이 있나요?" },
  { id: "lp21", category: "goals", text: "1년 후, 5년 후 내 모습이 구체적으로 그려지나요?" },
  { id: "lp22", category: "goals", text: "장기 목표를 위해 단기 만족을 포기할 수 있나요?" },
  { id: "lp23", category: "goals", text: "목표를 향해 꾸준히 노력하고 있나요?" },
  { id: "lp24", category: "goals", text: "목표가 가치관과 일치한다고 느끼나요?" },
  { id: "lp25", category: "goals", text: "실패해도 같은 목표를 향해 다시 도전하나요?" },
  { id: "lp26", category: "goals", text: "목표 달성을 위한 구체적인 계획이 있나요?" },
  { id: "lp27", category: "goals", text: "진행 상황을 정기적으로 점검하나요?" },
  { id: "lp28", category: "goals", text: "목표가 현실적이면서도 도전적인가요?" },
  { id: "lp29", category: "goals", text: "목표 달성이 삶의 의미와 연결된다고 느끼나요?" },
  { id: "lp30", category: "goals", text: "외부 장애물에도 불구하고 목표를 유지하나요?" },
  { id: "lp31", category: "awareness", text: "나의 강점과 약점을 정확히 알고 있나요?" },
  { id: "lp32", category: "awareness", text: "내 감정의 원인을 잘 파악하나요?" },
  { id: "lp33", category: "awareness", text: "정기적으로 자기 성찰의 시간을 갖나요?" },
  { id: "lp34", category: "awareness", text: "피드백을 열린 마음으로 받아들이나요?" },
  { id: "lp35", category: "awareness", text: "나의 행동 패턴을 인식하고 있나요?" },
  { id: "lp36", category: "awareness", text: "성장을 위해 불편한 진실도 직시하나요?" },
  { id: "lp37", category: "awareness", text: "나에 대한 평가가 상황에 따라 일관되나요?" },
  { id: "lp38", category: "awareness", text: "내가 무엇을 원하는지 명확히 아나요?" },
  { id: "lp39", category: "awareness", text: "과거 경험에서 교훈을 얻으려 노력하나요?" },
  { id: "lp40", category: "awareness", text: "내 삶의 방향이 맞는지 정기적으로 점검하나요?" }
];

const questionsEn = [
  { id: "lp1", category: "fulfillment", text: "Do you look forward to each new day when you wake up?" },
  { id: "lp2", category: "fulfillment", text: "Do you feel your work creates meaningful change in the world?" },
  { id: "lp3", category: "fulfillment", text: "Do you frequently experience moments of true satisfaction in life?" },
  { id: "lp4", category: "fulfillment", text: "Do you feel your existence is precious to someone?" },
  { id: "lp5", category: "fulfillment", text: "Are you generally satisfied with your past choices?" },
  { id: "lp6", category: "fulfillment", text: "Is your current life close to what you envisioned?" },
  { id: "lp7", category: "fulfillment", text: "Can you find meaning even in difficult situations?" },
  { id: "lp8", category: "fulfillment", text: "Do you have activities or spaces to express yourself?" },
  { id: "lp9", category: "fulfillment", text: "Do you frequently feel grateful in life?" },
  { id: "lp10", category: "fulfillment", text: "When you think about death, do you think you'd have many regrets?" },
  { id: "lp11", category: "values", text: "Do you clearly know what values are most important to you?" },
  { id: "lp12", category: "values", text: "Do you make important decisions based on your values?" },
  { id: "lp13", category: "values", text: "Can you prioritize when your values conflict?" },
  { id: "lp14", category: "values", text: "Do you follow your own values over others' expectations?" },
  { id: "lp15", category: "values", text: "Do you feel you're living in alignment with your values?" },
  { id: "lp16", category: "values", text: "Do your values remain consistent over time?" },
  { id: "lp17", category: "values", text: "Can you refuse when asked to do something against your values?" },
  { id: "lp18", category: "values", text: "Can you explain your values to others?" },
  { id: "lp19", category: "values", text: "Are you actively working to practice your values?" },
  { id: "lp20", category: "values", text: "Is there something you value more than money or fame?" },
  { id: "lp21", category: "goals", text: "Can you clearly picture yourself 1 year and 5 years from now?" },
  { id: "lp22", category: "goals", text: "Can you sacrifice short-term pleasure for long-term goals?" },
  { id: "lp23", category: "goals", text: "Are you consistently working toward your goals?" },
  { id: "lp24", category: "goals", text: "Do your goals align with your values?" },
  { id: "lp25", category: "goals", text: "Do you try again toward the same goals even after failure?" },
  { id: "lp26", category: "goals", text: "Do you have a specific plan for achieving your goals?" },
  { id: "lp27", category: "goals", text: "Do you regularly check your progress?" },
  { id: "lp28", category: "goals", text: "Are your goals realistic yet challenging?" },
  { id: "lp29", category: "goals", text: "Do you feel achieving your goals connects to life's meaning?" },
  { id: "lp30", category: "goals", text: "Do you maintain your goals despite external obstacles?" },
  { id: "lp31", category: "awareness", text: "Do you accurately know your strengths and weaknesses?" },
  { id: "lp32", category: "awareness", text: "Can you identify the causes of your emotions?" },
  { id: "lp33", category: "awareness", text: "Do you regularly take time for self-reflection?" },
  { id: "lp34", category: "awareness", text: "Do you accept feedback with an open mind?" },
  { id: "lp35", category: "awareness", text: "Are you aware of your behavioral patterns?" },
  { id: "lp36", category: "awareness", text: "Do you face uncomfortable truths for growth?" },
  { id: "lp37", category: "awareness", text: "Is your self-assessment consistent across situations?" },
  { id: "lp38", category: "awareness", text: "Do you clearly know what you want?" },
  { id: "lp39", category: "awareness", text: "Do you try to learn lessons from past experiences?" },
  { id: "lp40", category: "awareness", text: "Do you regularly check if your life direction is right?" }
];

const optionsKo = [
  { value: "5", label: "매우 그렇다" }, { value: "4", label: "그렇다" },
  { value: "3", label: "보통이다" }, { value: "2", label: "그렇지 않다" }, { value: "1", label: "전혀 그렇지 않다" }
];

const optionsEn = [
  { value: "5", label: "Strongly agree" }, { value: "4", label: "Agree" },
  { value: "3", label: "Neutral" }, { value: "2", label: "Disagree" }, { value: "1", label: "Strongly disagree" }
];

interface LifePurposeTestFormProps {
  onComplete: (results: any) => void;
  onBack: () => void;
}

export default function LifePurposeTestForm({ onComplete, onBack }: LifePurposeTestFormProps) {
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

  const analyzeResults = (finalAnswers: Record<string, string>) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const categories = ['fulfillment', 'values', 'goals', 'awareness'];
      const categoryScores: Record<string, number> = {};
      categories.forEach(cat => {
        const catQuestions = questions.filter(q => q.category === cat);
        let catTotal = 0;
        catQuestions.forEach(q => { catTotal += parseInt(finalAnswers[q.id] || '3'); });
        categoryScores[cat] = Math.round((catTotal / (catQuestions.length * 5)) * 100);
      });
      const totalScore = Math.round(Object.values(categoryScores).reduce((a, b) => a + b, 0) / categories.length);
      let purposeType = isEnglish
        ? (totalScore >= 80 ? "Clear Direction Seeker" : totalScore >= 65 ? "Growing Explorer" : totalScore >= 50 ? "Direction-Seeking Traveler" : "Meaning-Seeking Pilgrim")
        : (totalScore >= 80 ? "명확한 방향 탐색자" : totalScore >= 65 ? "성장하는 탐험가" : totalScore >= 50 ? "방향 모색 중인 여행자" : "의미를 찾는 순례자");
      let clarityLevel: string;
      if (categoryScores.values >= 75 && categoryScores.goals >= 75) clarityLevel = isEnglish ? 'Very High' : '매우 높음';
      else if (categoryScores.values >= 60 && categoryScores.goals >= 60) clarityLevel = isEnglish ? 'High' : '높음';
      else if (categoryScores.values >= 45 || categoryScores.goals >= 45) clarityLevel = isEnglish ? 'Average' : '보통';
      else clarityLevel = isEnglish ? 'Low' : '낮음';
      const recommendations: string[] = [];
      if (categoryScores.fulfillment < 60) recommendations.push(isEnglish ? "Start a gratitude journal to record small joys and thankful moments in daily life" : "일상에서 작은 기쁨과 감사의 순간을 기록하는 감사일기를 시작해보세요");
      if (categoryScores.values < 60) recommendations.push(isEnglish ? "Write down your top 5 values and prioritize them" : "나에게 가장 중요한 5가지 가치를 적어보고, 우선순위를 정해보세요");
      if (categoryScores.goals < 60) recommendations.push(isEnglish ? "Set SMART goals for what you want to achieve in 1 year" : "1년 후 이루고 싶은 목표를 SMART하게 설정해보세요");
      if (categoryScores.awareness < 60) recommendations.push(isEnglish ? "Take 5 minutes daily for quiet self-reflection" : "매일 5분간 조용히 자기 성찰의 시간을 가져보세요");
      if (recommendations.length === 0) recommendations.push(isEnglish ? "Maintain your current life direction and grow through new challenges" : "현재 삶의 방향성을 잘 유지하면서, 새로운 도전을 통해 더 성장해보세요");
      onComplete({ answers: finalAnswers, categoryScores, totalScore, purposeType, clarityLevel, recommendations });
      setIsAnalyzing(false);
    }, 2500);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const getCategoryInfo = (category: string) => {
    const infoKo: Record<string, { icon: React.ReactNode; name: string }> = {
      fulfillment: { icon: <Heart className="w-5 h-5" />, name: '실존적 충만감' },
      values: { icon: <Star className="w-5 h-5" />, name: '가치 명확성' },
      goals: { icon: <Target className="w-5 h-5" />, name: '목표 일관성' },
      awareness: { icon: <Compass className="w-5 h-5" />, name: '자기 인식' }
    };
    const infoEn: Record<string, { icon: React.ReactNode; name: string }> = {
      fulfillment: { icon: <Heart className="w-5 h-5" />, name: 'Existential Fulfillment' },
      values: { icon: <Star className="w-5 h-5" />, name: 'Value Clarity' },
      goals: { icon: <Target className="w-5 h-5" />, name: 'Goal Consistency' },
      awareness: { icon: <Compass className="w-5 h-5" />, name: 'Self-Awareness' }
    };
    const info = isEnglish ? infoEn : infoKo;
    return info[category] || { icon: <Sparkles className="w-5 h-5" />, name: category };
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 border-indigo-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Compass className="h-12 w-12 text-indigo-500 animate-spin" style={{ animationDuration: '3s' }} />
                <Sparkles className="h-6 w-6 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg text-indigo-800">{isEnglish ? 'Analyzing life meaning...' : '삶의 의미 심층 분석 중...'}</h3>
                <p className="text-indigo-600">{isEnglish ? 'Comprehensively analyzing 4 areas' : '4가지 영역을 종합적으로 분석하고 있어요'}</p>
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 pt-20">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />{isEnglish ? 'Go Back' : '돌아가기'}
              </Button>
              <span className="text-sm text-muted-foreground">{currentQuestion + 1} / {questions.length}</span>
            </div>
            <Progress value={progress} className="w-full h-2 bg-indigo-100" />
          </div>
          <Card className="border-indigo-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg"><Mountain className="w-6 h-6" /></div>
                  <div>
                    <CardTitle className="text-xl">{isEnglish ? 'Life Meaning & Purpose Test' : '삶의 의미 및 목적 탐색 검사'}</CardTitle>
                    <p className="text-white/80 text-sm flex items-center gap-2">
                      {catInfo.icon} {catInfo.name} {isEnglish ? 'area' : '영역'}
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
                    <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer border border-transparent hover:border-indigo-200">
                      <RadioGroupItem value={option.value} id={`lifepurpose-q${currentQuestion}-opt${index}`} />
                      <Label htmlFor={`lifepurpose-q${currentQuestion}-opt${index}`} className="cursor-pointer flex-1">{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="flex justify-start pt-4">
                <Button variant="outline" onClick={() => currentQuestion > 0 && setCurrentQuestion(prev => prev - 1)} disabled={currentQuestion === 0} className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />{isEnglish ? 'Previous' : '이전'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
