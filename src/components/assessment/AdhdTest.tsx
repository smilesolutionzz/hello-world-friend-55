import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Zap, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/i18n';

interface AdhdTestProps {
  onComplete: (result: any) => void;
  onBack?: () => void;
}

const adhdQuestionsKo = [
  { id: 1, question: "아이가 집중력을 유지하기 어려워하나요?", options: [{ value: "1", label: "전혀 그렇지 않다" },{ value: "2", label: "거의 그렇지 않다" },{ value: "3", label: "보통이다" },{ value: "4", label: "자주 그렇다" },{ value: "5", label: "매우 자주 그렇다" }] },
  { id: 2, question: "아이가 가만히 앉아있지 못하고 계속 움직이려 하나요?", options: [{ value: "1", label: "전혀 그렇지 않다" },{ value: "2", label: "거의 그렇지 않다" },{ value: "3", label: "보통이다" },{ value: "4", label: "자주 그렇다" },{ value: "5", label: "매우 자주 그렇다" }] },
  { id: 3, question: "아이가 충동적으로 행동하거나 말하는 경우가 많나요?", options: [{ value: "1", label: "전혀 없다" },{ value: "2", label: "거의 없다" },{ value: "3", label: "가끔 있다" },{ value: "4", label: "자주 있다" },{ value: "5", label: "매우 자주 있다" }] },
  { id: 4, question: "아이가 지시사항을 끝까지 따르지 못하나요?", options: [{ value: "1", label: "항상 잘 따른다" },{ value: "2", label: "대부분 잘 따른다" },{ value: "3", label: "보통이다" },{ value: "4", label: "자주 못 따른다" },{ value: "5", label: "거의 못 따른다" }] },
  { id: 5, question: "아이가 물건을 자주 잃어버리나요?", options: [{ value: "1", label: "전혀 잃어버리지 않는다" },{ value: "2", label: "거의 잃어버리지 않는다" },{ value: "3", label: "가끔 잃어버린다" },{ value: "4", label: "자주 잃어버린다" },{ value: "5", label: "매우 자주 잃어버린다" }] },
  { id: 6, question: "아이가 다른 사람의 말을 끝까지 듣지 못하고 끼어드나요?", options: [{ value: "1", label: "전혀 그렇지 않다" },{ value: "2", label: "거의 그렇지 않다" },{ value: "3", label: "가끔 그렇다" },{ value: "4", label: "자주 그렇다" },{ value: "5", label: "매우 자주 그렇다" }] },
  { id: 7, question: "아이가 세밀한 주의가 필요한 일을 피하려 하나요?", options: [{ value: "1", label: "전혀 피하지 않는다" },{ value: "2", label: "거의 피하지 않는다" },{ value: "3", label: "가끔 피한다" },{ value: "4", label: "자주 피한다" },{ value: "5", label: "매우 자주 피한다" }] },
  { id: 8, question: "아이가 잠시도 쉬지 않고 계속 활동하려 하나요?", options: [{ value: "1", label: "전혀 그렇지 않다" },{ value: "2", label: "거의 그렇지 않다" },{ value: "3", label: "보통이다" },{ value: "4", label: "자주 그렇다" },{ value: "5", label: "매우 자주 그렇다" }] },
  { id: 9, question: "아이가 소화불량이나 식욕부진을 자주 겪나요?", options: [{ value: "1", label: "전혀 없다" },{ value: "2", label: "거의 없다" },{ value: "3", label: "가끔 있다" },{ value: "4", label: "자주 있다" },{ value: "5", label: "매우 자주 있다" }] },
  { id: 10, question: "아이가 밤에 잠들기 어려워하거나 자주 깨나요?", options: [{ value: "1", label: "전혀 그렇지 않다" },{ value: "2", label: "거의 그렇지 않다" },{ value: "3", label: "가끔 그렇다" },{ value: "4", label: "자주 그렇다" },{ value: "5", label: "매우 자주 그렇다" }] }
];

const adhdQuestionsEn = [
  { id: 1, question: "Does your child have difficulty maintaining focus?", options: [{ value: "1", label: "Not at all" },{ value: "2", label: "Rarely" },{ value: "3", label: "Sometimes" },{ value: "4", label: "Often" },{ value: "5", label: "Very often" }] },
  { id: 2, question: "Does your child have trouble sitting still and constantly want to move?", options: [{ value: "1", label: "Not at all" },{ value: "2", label: "Rarely" },{ value: "3", label: "Sometimes" },{ value: "4", label: "Often" },{ value: "5", label: "Very often" }] },
  { id: 3, question: "Does your child frequently act or speak impulsively?", options: [{ value: "1", label: "Never" },{ value: "2", label: "Rarely" },{ value: "3", label: "Sometimes" },{ value: "4", label: "Often" },{ value: "5", label: "Very often" }] },
  { id: 4, question: "Does your child have difficulty following instructions to completion?", options: [{ value: "1", label: "Always follows well" },{ value: "2", label: "Usually follows well" },{ value: "3", label: "Sometimes" },{ value: "4", label: "Often can't follow" },{ value: "5", label: "Almost never follows" }] },
  { id: 5, question: "Does your child frequently lose things?", options: [{ value: "1", label: "Never loses things" },{ value: "2", label: "Rarely" },{ value: "3", label: "Sometimes" },{ value: "4", label: "Often" },{ value: "5", label: "Very often" }] },
  { id: 6, question: "Does your child interrupt others before they finish speaking?", options: [{ value: "1", label: "Not at all" },{ value: "2", label: "Rarely" },{ value: "3", label: "Sometimes" },{ value: "4", label: "Often" },{ value: "5", label: "Very often" }] },
  { id: 7, question: "Does your child avoid tasks requiring sustained attention?", options: [{ value: "1", label: "Never avoids" },{ value: "2", label: "Rarely" },{ value: "3", label: "Sometimes" },{ value: "4", label: "Often" },{ value: "5", label: "Very often" }] },
  { id: 8, question: "Does your child seem to be constantly active without rest?", options: [{ value: "1", label: "Not at all" },{ value: "2", label: "Rarely" },{ value: "3", label: "Sometimes" },{ value: "4", label: "Often" },{ value: "5", label: "Very often" }] },
  { id: 9, question: "Does your child frequently experience indigestion or loss of appetite?", options: [{ value: "1", label: "Never" },{ value: "2", label: "Rarely" },{ value: "3", label: "Sometimes" },{ value: "4", label: "Often" },{ value: "5", label: "Very often" }] },
  { id: 10, question: "Does your child have difficulty falling asleep or wake up frequently at night?", options: [{ value: "1", label: "Not at all" },{ value: "2", label: "Rarely" },{ value: "3", label: "Sometimes" },{ value: "4", label: "Often" },{ value: "5", label: "Very often" }] }
];

export const AdhdTest: React.FC<AdhdTestProps> = ({ onComplete, onBack }) => {
  const { isEnglish } = useLanguage();
  const adhdQuestions = isEnglish ? adhdQuestionsEn : adhdQuestionsKo;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [adhdQuestions[currentQuestion].id]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < adhdQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      const totalScore = Object.values(answers).reduce((sum, score) => sum + parseInt(score), 0);
      const maxScore = adhdQuestions.length * 5;
      const percentage = (totalScore / maxScore) * 100;

      let severity: string;
      let recommendations: string[];

      if (percentage >= 80) {
        severity = isEnglish ? 'High' : '높음';
        recommendations = isEnglish
          ? ['Urgent treatment for focus and stabilization', 'Specialized herbal medicine for nervous system and concentration', 'Digestive function improvement and nutrient absorption', 'Behavioral management and learning enhancement program']
          : ['집중력과 안정화를 위한 한방 치료 시급', '신경계 안정과 정신집중을 위한 특수 한약', '소화기능 강화와 영양 흡수 개선', '행동 조절과 학습능력 향상 프로그램'];
      } else if (percentage >= 60) {
        severity = isEnglish ? 'Moderate' : '중간';
        recommendations = isEnglish
          ? ['Regular holistic management and consultation', 'Treatment for focus improvement and stabilization', 'Sleep pattern improvement and stress management', 'Family behavioral management education']
          : ['정기적인 한의학적 관리와 상담', '집중력 향상과 안정화를 위한 한방 치료', '수면 패턴 개선과 스트레스 관리', '가족과 함께하는 행동 관리법 교육'];
      } else {
        severity = isEnglish ? 'Mild' : '경미';
        recommendations = isEnglish
          ? ['Preventive holistic management and constitution strengthening', 'Brain function activation and focus improvement', 'Customized care for healthy growth and development', 'Regular monitoring and consultation']
          : ['예방적 한방 관리와 체질 강화', '뇌 기능 활성화와 집중력 향상', '건강한 성장 발달을 위한 맞춤 케어', '정기적인 모니터링과 상담'];
      }

      const analysis = isEnglish
        ? `ADHD-related symptom score is ${totalScore}/${maxScore} (${Math.round(percentage)}%). From a holistic medicine perspective, ADHD is related to kidney function decline, heart instability, and digestive system weakness. Personalized treatment can help improve focus and emotional stability.`
        : `ADHD 관련 증상 점수는 ${totalScore}/${maxScore}점(${Math.round(percentage)}%)입니다. 한의학적으로 ADHD는 신(腎)의 기능 저하와 심(心)의 불안정, 비위(脾胃) 기능 약화와 관련이 있습니다. 체질에 맞는 한방 치료를 통해 집중력 향상과 정서적 안정을 도모할 수 있습니다.`;

      onComplete({ type: 'adhd', score: totalScore, maxScore, percentage: Math.round(percentage), severity, answers, recommendations, analysis });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(prev => prev - 1);
  };

  const progress = ((currentQuestion + 1) / adhdQuestions.length) * 100;
  const currentAnswer = answers[adhdQuestions[currentQuestion].id];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-orange-500 mr-3" />
              <CardTitle className="text-2xl text-orange-800">{isEnglish ? 'ADHD Assessment' : 'ADHD 한방 체크'}</CardTitle>
            </div>
            <CardDescription className="text-lg">
              {isEnglish ? 'Analyze ADHD symptoms from a holistic perspective' : '주의력결핍 과다활동 증상을 한의학적 관점에서 분석합니다'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{isEnglish ? 'Progress' : '진행률'}</span>
                <span>{currentQuestion + 1} / {adhdQuestions.length}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">{adhdQuestions[currentQuestion].question}</h3>
              <RadioGroup value={currentAnswer || ""} onValueChange={handleAnswer}>
                {adhdQuestions[currentQuestion].options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`adhd-${currentQuestion}-${option.value}`} />
                    <Label htmlFor={`adhd-${currentQuestion}-${option.value}`} className="text-sm cursor-pointer">{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={currentQuestion === 0 ? onBack : handlePrevious} className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {currentQuestion === 0 ? (isEnglish ? 'Back' : '뒤로') : (isEnglish ? 'Previous' : '이전')}
              </Button>
              <Button onClick={handleNext} disabled={!currentAnswer} className="bg-orange-500 hover:bg-orange-600 text-white flex items-center">
                {currentQuestion === adhdQuestions.length - 1 ? (isEnglish ? 'View Results' : '결과 보기') : (isEnglish ? 'Next' : '다음')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
