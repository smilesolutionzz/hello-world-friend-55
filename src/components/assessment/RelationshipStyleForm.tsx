import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Heart, Users, MessageCircle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface RelationshipStyleFormProps {
  onComplete: (result: any) => void;
  onBack?: () => void;
}

const RelationshipStyleForm = ({ onComplete, onBack }: RelationshipStyleFormProps) => {
  const { isEnglish } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const questionsKo = [
    { id: 1, text: "갈등이 생겼을 때 나는 주로", options: [
      { value: "avoid", label: "문제를 피하거나 회피한다", type: "avoidant" },
      { value: "confront", label: "즉시 문제를 해결하려고 한다", type: "secure" },
      { value: "blame", label: "상대방을 탓하거나 감정적으로 반응한다", type: "anxious" },
      { value: "withdraw", label: "혼자만의 시간을 갖고 싶어한다", type: "dismissive" }
    ]},
    { id: 2, text: "연인이나 가족과의 의사소통에서 나는", options: [
      { value: "open", label: "솔직하고 개방적으로 소통한다", type: "secure" },
      { value: "indirect", label: "돌려서 말하거나 암시한다", type: "anxious" },
      { value: "minimal", label: "필요한 말만 간단히 한다", type: "avoidant" },
      { value: "defensive", label: "방어적이 되거나 반박하게 된다", type: "dismissive" }
    ]},
    { id: 3, text: "상대방이 나를 이해하지 못할 때 나는", options: [
      { value: "explain", label: "차근차근 다시 설명해준다", type: "secure" },
      { value: "frustrated", label: "답답하고 화가 난다", type: "anxious" },
      { value: "give_up", label: "설명하는 것을 포기한다", type: "avoidant" },
      { value: "critical", label: "상대방이 이해력이 부족하다고 생각한다", type: "dismissive" }
    ]},
    { id: 4, text: "친밀한 관계에서 내가 가장 중요하게 생각하는 것은", options: [
      { value: "trust", label: "서로에 대한 신뢰와 이해", type: "secure" },
      { value: "attention", label: "충분한 관심과 애정 표현", type: "anxious" },
      { value: "independence", label: "개인적인 자유와 독립성", type: "avoidant" },
      { value: "respect", label: "서로의 경계와 존중", type: "dismissive" }
    ]},
    { id: 5, text: "관계에서 문제가 반복될 때 나는", options: [
      { value: "solution", label: "함께 해결방법을 찾으려 노력한다", type: "secure" },
      { value: "emotional", label: "감정적으로 힘들어하며 상대방을 원망한다", type: "anxious" },
      { value: "distance", label: "거리를 두고 관계를 재고한다", type: "avoidant" },
      { value: "judge", label: "상대방의 성격이나 능력을 의심한다", type: "dismissive" }
    ]},
    { id: 6, text: "사랑하는 사람에게 상처받았을 때 나는", options: [
      { value: "communicate", label: "감정을 솔직히 표현하고 대화한다", type: "secure" },
      { value: "clingy", label: "더 매달리거나 확인받으려 한다", type: "anxious" },
      { value: "shut_down", label: "마음을 닫고 혼자 시간을 보낸다", type: "avoidant" },
      { value: "retaliate", label: "비슷하게 상처를 주려고 한다", type: "dismissive" }
    ]},
    { id: 7, text: "새로운 사람과 관계를 시작할 때 나는", options: [
      { value: "gradual", label: "천천히 자연스럽게 친해진다", type: "secure" },
      { value: "intense", label: "빠르게 깊은 관계가 되고 싶어한다", type: "anxious" },
      { value: "cautious", label: "상당히 조심스럽고 신중하다", type: "avoidant" },
      { value: "selective", label: "까다로운 기준으로 사람을 선별한다", type: "dismissive" }
    ]},
    { id: 8, text: "관계에서 가장 힘든 점은", options: [
      { value: "balance", label: "서로 다른 점을 이해하고 조율하는 것", type: "secure" },
      { value: "insecurity", label: "불안하고 확신이 서지 않는 것", type: "anxious" },
      { value: "vulnerability", label: "마음을 열고 깊게 소통하는 것", type: "avoidant" },
      { value: "compromise", label: "내 방식을 바꾸거나 양보하는 것", type: "dismissive" }
    ]}
  ];

  const questionsEn = [
    { id: 1, text: "When conflict arises, I usually", options: [
      { value: "avoid", label: "Avoid or evade the problem", type: "avoidant" },
      { value: "confront", label: "Try to resolve it immediately", type: "secure" },
      { value: "blame", label: "Blame the other person or react emotionally", type: "anxious" },
      { value: "withdraw", label: "Want time alone", type: "dismissive" }
    ]},
    { id: 2, text: "In communication with a partner or family, I", options: [
      { value: "open", label: "Communicate openly and honestly", type: "secure" },
      { value: "indirect", label: "Hint or speak indirectly", type: "anxious" },
      { value: "minimal", label: "Say only what's necessary", type: "avoidant" },
      { value: "defensive", label: "Become defensive or argumentative", type: "dismissive" }
    ]},
    { id: 3, text: "When the other person doesn't understand me, I", options: [
      { value: "explain", label: "Patiently explain again", type: "secure" },
      { value: "frustrated", label: "Feel frustrated and angry", type: "anxious" },
      { value: "give_up", label: "Give up explaining", type: "avoidant" },
      { value: "critical", label: "Think they lack understanding", type: "dismissive" }
    ]},
    { id: 4, text: "In intimate relationships, what I value most is", options: [
      { value: "trust", label: "Mutual trust and understanding", type: "secure" },
      { value: "attention", label: "Sufficient attention and affection", type: "anxious" },
      { value: "independence", label: "Personal freedom and independence", type: "avoidant" },
      { value: "respect", label: "Mutual boundaries and respect", type: "dismissive" }
    ]},
    { id: 5, text: "When problems repeat in a relationship, I", options: [
      { value: "solution", label: "Try to find solutions together", type: "secure" },
      { value: "emotional", label: "Struggle emotionally and blame the other", type: "anxious" },
      { value: "distance", label: "Distance myself and reconsider", type: "avoidant" },
      { value: "judge", label: "Doubt the other's character or ability", type: "dismissive" }
    ]},
    { id: 6, text: "When hurt by someone I love, I", options: [
      { value: "communicate", label: "Express my feelings honestly and talk", type: "secure" },
      { value: "clingy", label: "Cling more or seek reassurance", type: "anxious" },
      { value: "shut_down", label: "Close off and spend time alone", type: "avoidant" },
      { value: "retaliate", label: "Try to hurt them back similarly", type: "dismissive" }
    ]},
    { id: 7, text: "When starting a relationship with someone new, I", options: [
      { value: "gradual", label: "Gradually and naturally get closer", type: "secure" },
      { value: "intense", label: "Want to quickly become close", type: "anxious" },
      { value: "cautious", label: "Am very cautious and careful", type: "avoidant" },
      { value: "selective", label: "Screen people with strict criteria", type: "dismissive" }
    ]},
    { id: 8, text: "The hardest thing about relationships is", options: [
      { value: "balance", label: "Understanding and adjusting differences", type: "secure" },
      { value: "insecurity", label: "Feeling anxious and uncertain", type: "anxious" },
      { value: "vulnerability", label: "Opening up and deeply communicating", type: "avoidant" },
      { value: "compromise", label: "Changing my ways or compromising", type: "dismissive" }
    ]}
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
    const scores = { secure: 0, anxious: 0, avoidant: 0, dismissive: 0 };
    Object.values(finalAnswers).forEach((answer, index) => {
      const question = questions[index];
      const selectedOption = question.options.find(opt => opt.value === answer);
      if (selectedOption) scores[selectedOption.type as keyof typeof scores]++;
    });
    const maxScore = Math.max(...Object.values(scores));
    const resultType = Object.keys(scores).find(key => scores[key as keyof typeof scores] === maxScore) as keyof typeof scores;

    const resultsKo = {
      secure: { title: "안정형 관계 스타일", description: "건강하고 균형잡힌 관계를 추구하며, 갈등을 건설적으로 해결합니다.", characteristics: ["솔직하고 개방적인 의사소통", "갈등을 회피하지 않고 건설적으로 해결", "상대방을 신뢰하고 존중", "적절한 독립성과 친밀감의 균형"], advice: "현재의 건강한 관계 스타일을 유지하면서, 다른 스타일의 사람들을 이해하고 도와주는 역할을 할 수 있습니다.", color: "text-green-600", icon: ShieldCheck },
      anxious: { title: "불안형 관계 스타일", description: "관계에 대한 강한 욕구와 동시에 불안감을 느끼는 스타일입니다.", characteristics: ["상대방의 관심과 사랑을 지속적으로 확인받고 싶어함", "버림받을까 봐 불안해함", "감정 표현이 강하고 직접적", "친밀감을 매우 중요하게 생각"], advice: "자신의 감정을 조절하고, 상대방에게 과도한 확신을 요구하지 않도록 노력해보세요.", color: "text-orange-600", icon: Heart },
      avoidant: { title: "회피형 관계 스타일", description: "독립성을 중시하며 깊은 친밀감에 부담을 느끼는 스타일입니다.", characteristics: ["개인적인 공간과 독립성을 중시", "감정 표현에 어려움을 느낌", "깊은 친밀감에 부담을 느낌", "갈등을 회피하려는 경향"], advice: "조금씩 감정을 표현하는 연습을 하고, 상대방의 친밀감 욕구를 이해하려 노력해보세요.", color: "text-blue-600", icon: Users },
      dismissive: { title: "무시형 관계 스타일", description: "자신의 방식을 고수하며 타인에 대한 기대가 낮은 스타일입니다.", characteristics: ["자신의 의견과 방식을 강하게 고수", "타인에 대한 기대가 낮음", "비판적이고 판단적인 경향", "변화나 양보에 저항감"], advice: "상대방의 관점을 이해하려 노력하고, 관계에서 양보와 타협의 중요성을 인식해보세요.", color: "text-purple-600", icon: MessageCircle }
    };

    const resultsEn = {
      secure: { title: "Secure Relationship Style", description: "You pursue healthy, balanced relationships and resolve conflicts constructively.", characteristics: ["Open and honest communication", "Constructive conflict resolution", "Trust and respect for others", "Balance of independence and intimacy"], advice: "Maintain your healthy relationship style while helping others with different styles.", color: "text-green-600", icon: ShieldCheck },
      anxious: { title: "Anxious Relationship Style", description: "You have a strong desire for relationships while also feeling anxious.", characteristics: ["Constantly seeking reassurance of love", "Fear of abandonment", "Strong and direct emotional expression", "Highly values intimacy"], advice: "Practice regulating your emotions and avoid demanding excessive reassurance.", color: "text-orange-600", icon: Heart },
      avoidant: { title: "Avoidant Relationship Style", description: "You value independence and feel burdened by deep intimacy.", characteristics: ["Values personal space and independence", "Difficulty expressing emotions", "Feels burdened by deep intimacy", "Tendency to avoid conflict"], advice: "Practice expressing emotions gradually and try to understand others' need for intimacy.", color: "text-blue-600", icon: Users },
      dismissive: { title: "Dismissive Relationship Style", description: "You stick to your ways and have low expectations of others.", characteristics: ["Strongly adheres to own opinions", "Low expectations of others", "Critical and judgmental tendency", "Resistance to change or compromise"], advice: "Try to understand others' perspectives and recognize the importance of compromise.", color: "text-purple-600", icon: MessageCircle }
    };

    const results = isEnglish ? resultsEn : resultsKo;
    onComplete({ type: resultType, scores, result: results[resultType], answers });
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  if (!currentQ) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-pink-500" />
            <h1 className="text-2xl font-bold">{isEnglish ? 'Relationship Style Assessment' : '관계 스타일 분석'}</h1>
          </div>
          <p className="text-muted-foreground mb-4">{isEnglish ? 'Discover your relationship patterns and communication style' : '나의 인간관계 패턴과 소통 방식을 파악해보세요'}</p>
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
              <Button onClick={handleNext} disabled={!answers[currentQuestion]} className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700">
                {currentQuestion === questions.length - 1 ? (isEnglish ? 'View Results' : '결과 보기') : (isEnglish ? 'Next' : '다음')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { RelationshipStyleForm };
