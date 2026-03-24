import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { MessageCircle, Users, Zap, Shield } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface CommunicationStyleFormProps {
  onComplete: (result: any) => void;
  onBack?: () => void;
}

const CommunicationStyleForm = ({ onComplete, onBack }: CommunicationStyleFormProps) => {
  const { isEnglish } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const questionsKo = [
    { id: 1, text: "의견이 다른 상황에서 나는", options: [{ value: "direct", label: "직접적으로 내 의견을 말한다", type: "assertive" }, { value: "ask", label: "먼저 상대방 의견을 자세히 듣는다", type: "passive" }, { value: "force", label: "내 의견이 맞다고 강하게 주장한다", type: "aggressive" }, { value: "hint", label: "돌려서 내 의견을 암시한다", type: "passive_aggressive" }] },
    { id: 2, text: "상대방이 나를 비판할 때 나는", options: [{ value: "listen", label: "일단 들어보고 건설적으로 대화한다", type: "assertive" }, { value: "defensive", label: "움츠러들고 방어적이 된다", type: "passive" }, { value: "counter", label: "즉시 반박하거나 맞대응한다", type: "aggressive" }, { value: "sarcastic", label: "비꼬거나 돌려서 불만을 표현한다", type: "passive_aggressive" }] },
    { id: 3, text: "팀 프로젝트에서 의견을 제시할 때 나는", options: [{ value: "clear", label: "명확하고 논리적으로 설명한다", type: "assertive" }, { value: "hesitate", label: "조심스럽게 의견을 제시한다", type: "passive" }, { value: "dominate", label: "내 방식대로 진행하려고 한다", type: "aggressive" }, { value: "complain", label: "나중에 따로 불만을 털어놓는다", type: "passive_aggressive" }] },
    { id: 4, text: "상대방이 약속을 지키지 않았을 때 나는", options: [{ value: "discuss", label: "솔직하게 실망감을 표현하고 대화한다", type: "assertive" }, { value: "ignore", label: "참고 넘어간다", type: "passive" }, { value: "angry", label: "화를 내며 따진다", type: "aggressive" }, { value: "cold", label: "차갑게 대하거나 무시한다", type: "passive_aggressive" }] },
    { id: 5, text: "회의에서 다른 의견을 들었을 때 나는", options: [{ value: "respectful", label: "존중하면서 내 의견도 말한다", type: "assertive" }, { value: "silent", label: "조용히 듣기만 한다", type: "passive" }, { value: "interrupt", label: "끼어들어 내 의견을 관철시킨다", type: "aggressive" }, { value: "later", label: "회의 후에 따로 말한다", type: "passive_aggressive" }] },
    { id: 6, text: "스트레스 상황에서 나는", options: [{ value: "express", label: "상황을 정리해서 차근차근 설명한다", type: "assertive" }, { value: "withdraw", label: "말없이 혼자 견딘다", type: "passive" }, { value: "explode", label: "감정이 폭발하듯 표현한다", type: "aggressive" }, { value: "blame", label: "다른 사람이나 상황을 탓한다", type: "passive_aggressive" }] },
    { id: 7, text: "요청을 거절해야 할 때 나는", options: [{ value: "honest", label: "정중하지만 명확하게 거절한다", type: "assertive" }, { value: "excuse", label: "핑계를 대며 애매하게 넘긴다", type: "passive" }, { value: "rude", label: "단호하게 안 된다고 말한다", type: "aggressive" }, { value: "agree_regret", label: "일단 수락하고 나중에 후회한다", type: "passive_aggressive" }] },
    { id: 8, text: "갈등 상황에서 내가 우선하는 것은", options: [{ value: "solution", label: "서로 만족할 수 있는 해결책", type: "assertive" }, { value: "peace", label: "일단 평화로운 분위기", type: "passive" }, { value: "win", label: "내가 옳다는 것을 증명하는 것", type: "aggressive" }, { value: "avoid", label: "갈등 자체를 피하는 것", type: "passive_aggressive" }] }
  ];

  const questionsEn = [
    { id: 1, text: "When opinions differ, I", options: [{ value: "direct", label: "State my opinion directly", type: "assertive" }, { value: "ask", label: "Listen to the other person first", type: "passive" }, { value: "force", label: "Strongly insist I'm right", type: "aggressive" }, { value: "hint", label: "Hint at my opinion indirectly", type: "passive_aggressive" }] },
    { id: 2, text: "When criticized, I", options: [{ value: "listen", label: "Listen and respond constructively", type: "assertive" }, { value: "defensive", label: "Shrink back and become defensive", type: "passive" }, { value: "counter", label: "Immediately counter-argue", type: "aggressive" }, { value: "sarcastic", label: "Express dissatisfaction sarcastically", type: "passive_aggressive" }] },
    { id: 3, text: "When presenting ideas in a team, I", options: [{ value: "clear", label: "Explain clearly and logically", type: "assertive" }, { value: "hesitate", label: "Carefully present my ideas", type: "passive" }, { value: "dominate", label: "Try to proceed my way", type: "aggressive" }, { value: "complain", label: "Complain separately later", type: "passive_aggressive" }] },
    { id: 4, text: "When someone breaks a promise, I", options: [{ value: "discuss", label: "Honestly express disappointment and discuss", type: "assertive" }, { value: "ignore", label: "Endure and let it go", type: "passive" }, { value: "angry", label: "Get angry and confront them", type: "aggressive" }, { value: "cold", label: "Give them the cold shoulder", type: "passive_aggressive" }] },
    { id: 5, text: "When hearing different opinions in a meeting, I", options: [{ value: "respectful", label: "Respectfully share my view too", type: "assertive" }, { value: "silent", label: "Just listen quietly", type: "passive" }, { value: "interrupt", label: "Interrupt to push my opinion", type: "aggressive" }, { value: "later", label: "Bring it up separately after", type: "passive_aggressive" }] },
    { id: 6, text: "Under stress, I", options: [{ value: "express", label: "Organize and explain step by step", type: "assertive" }, { value: "withdraw", label: "Endure silently alone", type: "passive" }, { value: "explode", label: "Express emotions explosively", type: "aggressive" }, { value: "blame", label: "Blame others or the situation", type: "passive_aggressive" }] },
    { id: 7, text: "When I need to refuse a request, I", options: [{ value: "honest", label: "Politely but clearly decline", type: "assertive" }, { value: "excuse", label: "Make excuses to avoid it", type: "passive" }, { value: "rude", label: "Firmly say no", type: "aggressive" }, { value: "agree_regret", label: "Accept then regret later", type: "passive_aggressive" }] },
    { id: 8, text: "In conflict situations, I prioritize", options: [{ value: "solution", label: "A mutually satisfying solution", type: "assertive" }, { value: "peace", label: "Keeping the peace for now", type: "passive" }, { value: "win", label: "Proving I'm right", type: "aggressive" }, { value: "avoid", label: "Avoiding the conflict itself", type: "passive_aggressive" }] }
  ];

  const questions = isEnglish ? questionsEn : questionsKo;

  const handleAnswerChange = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion]: value };
    setAnswers(newAnswers);
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1);
      else calculateResultWithAnswers(newAnswers);
    }, 300);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1);
    else calculateResultWithAnswers(answers);
  };

  const calculateResultWithAnswers = (finalAnswers: Record<number, string>) => {
    const scores = { assertive: 0, passive: 0, aggressive: 0, passive_aggressive: 0 };
    Object.values(finalAnswers).forEach((answer, index) => {
      const question = questions[index];
      const selectedOption = question.options.find(opt => opt.value === answer);
      if (selectedOption) scores[selectedOption.type as keyof typeof scores]++;
    });
    const maxScore = Math.max(...Object.values(scores));
    const resultType = Object.keys(scores).find(key => scores[key as keyof typeof scores] === maxScore) as keyof typeof scores;

    const resultsKo = {
      assertive: { title: "단정적 소통 스타일", description: "자신의 의견을 명확하게 표현하면서도 상대방을 존중하는 균형잡힌 소통 방식입니다.", characteristics: ["명확하고 직접적인 의사표현", "상대방의 의견도 존중하고 경청", "건설적인 갈등 해결 추구", "자신감 있고 정직한 소통"], advice: "현재의 건강한 소통 스타일을 유지하면서, 다른 스타일의 사람들과 소통할 때 그들의 방식을 이해하고 배려해주세요.", color: "text-green-600", icon: Shield },
      passive: { title: "수동적 소통 스타일", description: "상대방을 배려하지만 자신의 의견 표현에는 소극적인 소통 방식입니다.", characteristics: ["상대방 의견을 우선시함", "갈등을 피하려는 경향", "자신의 욕구 표현에 어려움", "조화로운 관계를 중시"], advice: "자신의 의견과 감정을 표현하는 연습을 해보세요.", color: "text-blue-600", icon: Users },
      aggressive: { title: "공격적 소통 스타일", description: "자신의 의견을 강하게 주장하지만 상대방 배려가 부족한 소통 방식입니다.", characteristics: ["직설적이고 강한 의견 표현", "자신의 의견을 관철시키려 함", "상대방 의견에 대한 배려 부족", "빠른 의사결정을 선호"], advice: "상대방의 감정과 의견을 더 배려하고, 경청하는 자세를 기르세요.", color: "text-red-600", icon: Zap },
      passive_aggressive: { title: "소극적 공격 스타일", description: "직접적인 표현을 피하면서 간접적으로 불만을 표현하는 소통 방식입니다.", characteristics: ["간접적이고 돌려서 표현", "직접적인 갈등을 회피", "불만을 나중에 표출", "비언어적 신호로 의사 표현"], advice: "솔직하고 직접적인 소통을 연습해보세요.", color: "text-orange-600", icon: MessageCircle }
    };

    const resultsEn = {
      assertive: { title: "Assertive Communication Style", description: "A balanced communication style that clearly expresses opinions while respecting others.", characteristics: ["Clear and direct expression", "Respects and listens to others", "Seeks constructive conflict resolution", "Confident and honest communication"], advice: "Maintain your healthy communication style while understanding different styles.", color: "text-green-600", icon: Shield },
      passive: { title: "Passive Communication Style", description: "Considerate of others but passive in expressing your own opinions.", characteristics: ["Prioritizes others' opinions", "Tendency to avoid conflict", "Difficulty expressing own needs", "Values harmonious relationships"], advice: "Practice expressing your own opinions and emotions.", color: "text-blue-600", icon: Users },
      aggressive: { title: "Aggressive Communication Style", description: "Strongly asserts own opinions but lacks consideration for others.", characteristics: ["Direct and strong opinion expression", "Tries to push own opinions through", "Lacks consideration for others", "Prefers quick decision-making"], advice: "Practice listening more and considering others' feelings.", color: "text-red-600", icon: Zap },
      passive_aggressive: { title: "Passive-Aggressive Communication Style", description: "Avoids direct expression and expresses dissatisfaction indirectly.", characteristics: ["Indirect expression", "Avoids direct conflict", "Expresses grievances later", "Non-verbal signal communication"], advice: "Practice honest and direct communication.", color: "text-orange-600", icon: MessageCircle }
    };

    const results = isEnglish ? resultsEn : resultsKo;
    onComplete({ type: resultType, scores, result: results[resultType], answers });
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold">{isEnglish ? 'Communication Style Assessment' : '소통 스타일 분석'}</h1>
          </div>
          <p className="text-muted-foreground mb-4">{isEnglish ? 'Discover your communication patterns and style' : '나의 의사소통 방식과 패턴을 파악해보세요'}</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{isEnglish ? 'Progress' : '진행률'}</span>
              <span>{currentQuestion + 1} / {questions.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-lg">{currentQ.text}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={answers[currentQuestion] || ""} onValueChange={handleAnswerChange} className="space-y-3">
              {currentQ.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={option.value} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
            <div className="flex justify-between pt-6">
              {currentQuestion === 0 && onBack ? (
                <Button variant="outline" onClick={onBack}>{isEnglish ? 'Quick Test' : '3분 테스트'}</Button>
              ) : (
                <Button variant="outline" onClick={() => setCurrentQuestion(currentQuestion - 1)} disabled={currentQuestion === 0}>{isEnglish ? 'Previous' : '이전'}</Button>
              )}
              <Button onClick={handleNext} disabled={!answers[currentQuestion]} className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700">
                {currentQuestion === questions.length - 1 ? (isEnglish ? 'View Results' : '결과 보기') : (isEnglish ? 'Next' : '다음')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { CommunicationStyleForm };
