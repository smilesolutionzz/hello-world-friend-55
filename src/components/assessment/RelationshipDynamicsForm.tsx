import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Users, Heart, Shield, MessageCircle, Scale, HandHeart } from "lucide-react";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { useLanguage } from "@/i18n/LanguageContext";

const questionsKo = [
  { id: "rd1", category: "trust", text: "새로운 사람을 만났을 때, 마음을 여는 데 시간이 얼마나 걸리나요?" },
  { id: "rd2", category: "trust", text: "상대방의 말을 있는 그대로 받아들이는 편인가요?" },
  { id: "rd3", category: "trust", text: "약속을 어긴 사람을 다시 믿기까지 얼마나 걸리나요?" },
  { id: "rd4", category: "trust", text: "친한 사람에게도 비밀을 잘 지키는 편인가요?" },
  { id: "rd5", category: "trust", text: "다른 사람의 동기를 의심하는 편인가요?" },
  { id: "rd6", category: "boundary", text: "부탁을 거절하는 것이 어렵게 느껴지나요?" },
  { id: "rd7", category: "boundary", text: "다른 사람의 문제를 내 문제처럼 짊어지는 편인가요?" },
  { id: "rd8", category: "boundary", text: "개인 시간과 관계 시간의 균형을 잘 맞추나요?" },
  { id: "rd9", category: "boundary", text: "타인의 기분에 따라 내 기분이 쉽게 영향받나요?" },
  { id: "rd10", category: "boundary", text: "불편한 상황에서도 자기 의견을 말할 수 있나요?" },
  { id: "rd11", category: "boundary", text: "관계에서 희생이 당연하다고 느끼나요?" },
  { id: "rd12", category: "expression", text: "화가 날 때 표현 방식이 적절한 편인가요?" },
  { id: "rd13", category: "expression", text: "기쁜 감정을 솔직하게 표현하나요?" },
  { id: "rd14", category: "expression", text: "슬플 때 다른 사람에게 의지하는 편인가요?" },
  { id: "rd15", category: "expression", text: "감정을 말보다 행동으로 더 많이 표현하나요?" },
  { id: "rd16", category: "expression", text: "감정을 참다가 한꺼번에 폭발한 적이 있나요?" },
  { id: "rd17", category: "expression", text: "상대방의 감정을 읽는 데 자신 있나요?" },
  { id: "rd18", category: "conflict", text: "갈등이 생기면 먼저 대화를 시도하는 편인가요?" },
  { id: "rd19", category: "conflict", text: "싸운 후 화해하는 데 시간이 오래 걸리나요?" },
  { id: "rd20", category: "conflict", text: "갈등 상황에서 상대 입장을 이해하려 노력하나요?" },
  { id: "rd21", category: "conflict", text: "문제 해결보다 감정 해소가 더 중요하게 느껴지나요?" },
  { id: "rd22", category: "conflict", text: "갈등을 회피하는 편인가요?" },
  { id: "rd23", category: "conflict", text: "같은 문제로 반복해서 다투는 경향이 있나요?" },
  { id: "rd24", category: "support", text: "친한 사람이 힘들어할 때 어떻게 도울지 잘 아나요?" },
  { id: "rd25", category: "support", text: "조언보다 경청을 먼저 하는 편인가요?" },
  { id: "rd26", category: "support", text: "상대방의 성공을 진심으로 기뻐하나요?" },
  { id: "rd27", category: "support", text: "도움이 필요할 때 요청하는 것이 자연스러운가요?" },
  { id: "rd28", category: "support", text: "관계에서 주는 것과 받는 것의 균형이 맞나요?" },
  { id: "rd29", category: "support", text: "상대방의 약점도 있는 그대로 받아들이나요?" },
  { id: "rd30", category: "balance", text: "혼자 있는 시간을 즐길 수 있나요?" },
  { id: "rd31", category: "balance", text: "중요한 결정을 혼자 내릴 수 있나요?" },
  { id: "rd32", category: "balance", text: "연인/친구가 없으면 불안하거나 공허한가요?" },
  { id: "rd33", category: "balance", text: "자신의 취미와 목표를 유지하고 있나요?" },
  { id: "rd34", category: "balance", text: "관계 속에서도 개인 정체성이 분명한가요?" },
  { id: "rd35", category: "balance", text: "상대방에게 의존적이라는 말을 들은 적 있나요?" }
];

const questionsEn = [
  { id: "rd1", category: "trust", text: "How long does it take you to open up to new people?" },
  { id: "rd2", category: "trust", text: "Do you tend to take people's words at face value?" },
  { id: "rd3", category: "trust", text: "How long does it take to trust someone again after they break a promise?" },
  { id: "rd4", category: "trust", text: "Do you keep secrets well, even from close people?" },
  { id: "rd5", category: "trust", text: "Do you tend to doubt other people's motives?" },
  { id: "rd6", category: "boundary", text: "Do you find it difficult to say no to requests?" },
  { id: "rd7", category: "boundary", text: "Do you tend to carry other people's problems as your own?" },
  { id: "rd8", category: "boundary", text: "Do you balance personal time and relationship time well?" },
  { id: "rd9", category: "boundary", text: "Is your mood easily influenced by others' moods?" },
  { id: "rd10", category: "boundary", text: "Can you express your opinion even in uncomfortable situations?" },
  { id: "rd11", category: "boundary", text: "Do you feel sacrifice is expected in relationships?" },
  { id: "rd12", category: "expression", text: "Do you express anger in appropriate ways?" },
  { id: "rd13", category: "expression", text: "Do you openly express joy?" },
  { id: "rd14", category: "expression", text: "Do you lean on others when you're sad?" },
  { id: "rd15", category: "expression", text: "Do you express emotions more through actions than words?" },
  { id: "rd16", category: "expression", text: "Have you ever bottled up emotions and then exploded?" },
  { id: "rd17", category: "expression", text: "Are you confident in reading others' emotions?" },
  { id: "rd18", category: "conflict", text: "Do you initiate conversation first when conflict arises?" },
  { id: "rd19", category: "conflict", text: "Does it take long to reconcile after an argument?" },
  { id: "rd20", category: "conflict", text: "Do you try to understand the other person's perspective in conflict?" },
  { id: "rd21", category: "conflict", text: "Do you feel emotional release is more important than problem solving?" },
  { id: "rd22", category: "conflict", text: "Do you tend to avoid conflict?" },
  { id: "rd23", category: "conflict", text: "Do you tend to argue repeatedly about the same issues?" },
  { id: "rd24", category: "support", text: "Do you know how to help when someone close is struggling?" },
  { id: "rd25", category: "support", text: "Do you listen first rather than give advice?" },
  { id: "rd26", category: "support", text: "Are you genuinely happy about others' success?" },
  { id: "rd27", category: "support", text: "Is it natural for you to ask for help when needed?" },
  { id: "rd28", category: "support", text: "Is there balance between giving and receiving in your relationships?" },
  { id: "rd29", category: "support", text: "Do you accept others' weaknesses as they are?" },
  { id: "rd30", category: "balance", text: "Can you enjoy time alone?" },
  { id: "rd31", category: "balance", text: "Can you make important decisions on your own?" },
  { id: "rd32", category: "balance", text: "Do you feel anxious or empty without a partner/friends?" },
  { id: "rd33", category: "balance", text: "Do you maintain your own hobbies and goals?" },
  { id: "rd34", category: "balance", text: "Is your individual identity clear within relationships?" },
  { id: "rd35", category: "balance", text: "Have you been told you're too dependent on others?" }
];

const optionsKo = [{ value: "5", label: "매우 그렇다" }, { value: "4", label: "그렇다" }, { value: "3", label: "보통이다" }, { value: "2", label: "그렇지 않다" }, { value: "1", label: "전혀 그렇지 않다" }];
const optionsEn = [{ value: "5", label: "Strongly agree" }, { value: "4", label: "Agree" }, { value: "3", label: "Neutral" }, { value: "2", label: "Disagree" }, { value: "1", label: "Strongly disagree" }];

interface RelationshipDynamicsFormProps {
  onComplete: (results: any) => void;
  onBack: () => void;
}

export default function RelationshipDynamicsForm({ onComplete, onBack }: RelationshipDynamicsFormProps) {
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
      const categories = ['trust', 'boundary', 'expression', 'conflict', 'support', 'balance'];
      const categoryScores: Record<string, number> = {};
      categories.forEach(cat => {
        const catQuestions = questions.filter(q => q.category === cat);
        let catTotal = 0;
        catQuestions.forEach(q => { catTotal += parseInt(finalAnswers[q.id] || '3'); });
        categoryScores[cat] = Math.round((catTotal / (catQuestions.length * 5)) * 100);
      });
      const totalScore = Math.round(Object.values(categoryScores).reduce((a, b) => a + b, 0) / categories.length);
      let relationshipType = isEnglish
        ? (totalScore >= 80 ? "Stable Balanced" : totalScore >= 65 ? "Growing Harmonious" : totalScore >= 50 ? "Exploring Developing" : "Needs Care")
        : (totalScore >= 80 ? "안정 균형형" : totalScore >= 65 ? "성장 조화형" : totalScore >= 50 ? "탐색 발전형" : "돌봄 필요형");
      const categoryNamesKo: Record<string, string> = { trust: '신뢰 형성', boundary: '경계 설정', expression: '감정 표현', conflict: '갈등 대처', support: '지지 제공', balance: '독립-의존 균형' };
      const categoryNamesEn: Record<string, string> = { trust: 'Trust Building', boundary: 'Boundary Setting', expression: 'Emotional Expression', conflict: 'Conflict Resolution', support: 'Support Giving', balance: 'Independence-Dependence Balance' };
      const categoryNames = isEnglish ? categoryNamesEn : categoryNamesKo;
      const sortedCategories = Object.entries(categoryScores).sort((a, b) => b[1] - a[1]);
      const strengths = sortedCategories.slice(0, 2).map(([cat]) => categoryNames[cat]);
      const growthAreas = sortedCategories.slice(-2).map(([cat]) => categoryNames[cat]);
      onComplete({ answers: finalAnswers, categoryScores, totalScore, relationshipType, strengths, growthAreas });
      setIsAnalyzing(false);
    }, 2000);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  if (!currentQ) return null;
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trust': return <Shield className="w-5 h-5" />;
      case 'boundary': return <Scale className="w-5 h-5" />;
      case 'expression': return <MessageCircle className="w-5 h-5" />;
      case 'conflict': return <Users className="w-5 h-5" />;
      case 'support': return <HandHeart className="w-5 h-5" />;
      default: return <Heart className="w-5 h-5" />;
    }
  };
  const getCategoryName = (category: string) => {
    const namesKo: Record<string, string> = { trust: '신뢰 형성', boundary: '경계 설정', expression: '감정 표현', conflict: '갈등 대처', support: '지지 제공', balance: '독립-의존 균형' };
    const namesEn: Record<string, string> = { trust: 'Trust Building', boundary: 'Boundary Setting', expression: 'Emotional Expression', conflict: 'Conflict Resolution', support: 'Support Giving', balance: 'Independence Balance' };
    return (isEnglish ? namesEn : namesKo)[category] || category;
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 border-pink-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative"><Users className="h-12 w-12 text-pink-500 animate-pulse" /><Heart className="h-6 w-6 text-red-500 absolute -top-1 -right-1 animate-bounce" /></div>
              <div className="text-center">
                <h3 className="font-semibold text-lg text-pink-800">{isEnglish ? 'Analyzing relationship dynamics...' : '관계 역동성 분석 중...'}</h3>
                <p className="text-pink-600">{isEnglish ? 'Deeply analyzing 6 areas' : '6가지 영역을 심층 분석하고 있어요'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <UnifiedNavigation />
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4 pt-20">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={onBack} className="flex items-center gap-2"><ArrowLeft className="w-4 h-4" />{isEnglish ? 'Go Back' : '돌아가기'}</Button>
              <span className="text-sm text-muted-foreground">{currentQuestion + 1} / {questions.length}</span>
            </div>
            <Progress value={progress} className="w-full h-2 bg-pink-100" />
          </div>
          <Card className="border-pink-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">{getCategoryIcon(currentQ.category)}</div>
                <div>
                  <CardTitle className="text-xl">{isEnglish ? 'Relationship Dynamics Analysis' : '관계 역동성 심층 분석'}</CardTitle>
                  <p className="text-white/80 text-sm">{getCategoryName(currentQ.category)} {isEnglish ? 'area' : '영역'}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="font-medium mb-4 text-lg">{currentQ.text}</h3>
                <RadioGroup value={answers[currentQ.id] || ""} onValueChange={(value) => handleAnswer(currentQ.id, value)} className="space-y-3">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-pink-50 transition-colors cursor-pointer border border-transparent hover:border-pink-200">
                      <RadioGroupItem value={option.value} id={`reldyn-q${currentQuestion}-opt${index}`} />
                      <Label htmlFor={`reldyn-q${currentQuestion}-opt${index}`} className="cursor-pointer flex-1">{option.label}</Label>
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
