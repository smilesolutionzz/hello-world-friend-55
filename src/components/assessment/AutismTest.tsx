import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Users, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/i18n';

interface AutismTestProps {
  onComplete: (result: any) => void;
  onBack?: () => void;
}

const autismQuestionsKo = [
  { id: 1, question: "아이가 다른 사람과 눈맞춤을 피하는 경향이 있나요?", options: [{ value: "1", label: "전혀 그렇지 않다" },{ value: "2", label: "거의 그렇지 않다" },{ value: "3", label: "보통이다" },{ value: "4", label: "자주 그렇다" },{ value: "5", label: "매우 자주 그렇다" }] },
  { id: 2, question: "아이가 자신만의 반복적인 행동이나 의식을 보이나요?", options: [{ value: "1", label: "전혀 없다" },{ value: "2", label: "거의 없다" },{ value: "3", label: "가끔 있다" },{ value: "4", label: "자주 있다" },{ value: "5", label: "매우 자주 있다" }] },
  { id: 3, question: "아이가 새로운 환경이나 변화에 적응하는 것을 어려워하나요?", options: [{ value: "1", label: "전혀 어려워하지 않는다" },{ value: "2", label: "거의 어려워하지 않는다" },{ value: "3", label: "보통 수준이다" },{ value: "4", label: "자주 어려워한다" },{ value: "5", label: "매우 어려워한다" }] },
  { id: 4, question: "아이가 또래 친구들과 어울리기를 어려워하나요?", options: [{ value: "1", label: "전혀 어려워하지 않는다" },{ value: "2", label: "거의 어려워하지 않는다" },{ value: "3", label: "보통이다" },{ value: "4", label: "자주 어려워한다" },{ value: "5", label: "매우 어려워한다" }] },
  { id: 5, question: "아이가 언어 발달이 늦거나 소통에 어려움이 있나요?", options: [{ value: "1", label: "전혀 없다" },{ value: "2", label: "거의 없다" },{ value: "3", label: "보통이다" },{ value: "4", label: "자주 있다" },{ value: "5", label: "매우 자주 있다" }] },
  { id: 6, question: "아이가 감각적 자극(소리, 촉감, 빛 등)에 과민하게 반응하나요?", options: [{ value: "1", label: "전혀 과민하지 않다" },{ value: "2", label: "거의 과민하지 않다" },{ value: "3", label: "보통이다" },{ value: "4", label: "자주 과민하다" },{ value: "5", label: "매우 과민하다" }] },
  { id: 7, question: "아이가 특정 관심사에 지나치게 몰두하는 경향이 있나요?", options: [{ value: "1", label: "전혀 없다" },{ value: "2", label: "거의 없다" },{ value: "3", label: "보통이다" },{ value: "4", label: "자주 있다" },{ value: "5", label: "매우 자주 있다" }] },
  { id: 8, question: "아이가 갑작스러운 상황 변화에 극심한 스트레스를 받나요?", options: [{ value: "1", label: "전혀 받지 않는다" },{ value: "2", label: "거의 받지 않는다" },{ value: "3", label: "보통이다" },{ value: "4", label: "자주 받는다" },{ value: "5", label: "매우 자주 받는다" }] },
  { id: 9, question: "아이가 소화불량이나 변비 등 소화기 문제를 자주 겪나요?", options: [{ value: "1", label: "전혀 없다" },{ value: "2", label: "거의 없다" },{ value: "3", label: "가끔 있다" },{ value: "4", label: "자주 있다" },{ value: "5", label: "매우 자주 있다" }] },
  { id: 10, question: "아이가 수면 패턴이 불규칙하거나 잠들기 어려워하나요?", options: [{ value: "1", label: "전혀 그렇지 않다" },{ value: "2", label: "거의 그렇지 않다" },{ value: "3", label: "보통이다" },{ value: "4", label: "자주 그렇다" },{ value: "5", label: "매우 자주 그렇다" }] }
];

const autismQuestionsEn = [
  { id: 1, question: "Does your child tend to avoid eye contact with others?", options: [{ value: "1", label: "Not at all" },{ value: "2", label: "Rarely" },{ value: "3", label: "Sometimes" },{ value: "4", label: "Often" },{ value: "5", label: "Very often" }] },
  { id: 2, question: "Does your child show repetitive behaviors or rituals?", options: [{ value: "1", label: "Never" },{ value: "2", label: "Rarely" },{ value: "3", label: "Sometimes" },{ value: "4", label: "Often" },{ value: "5", label: "Very often" }] },
  { id: 3, question: "Does your child have difficulty adapting to new environments or changes?", options: [{ value: "1", label: "Not at all" },{ value: "2", label: "Rarely" },{ value: "3", label: "Moderate" },{ value: "4", label: "Often" },{ value: "5", label: "Very much" }] },
  { id: 4, question: "Does your child have difficulty socializing with peers?", options: [{ value: "1", label: "Not at all" },{ value: "2", label: "Rarely" },{ value: "3", label: "Sometimes" },{ value: "4", label: "Often" },{ value: "5", label: "Very much" }] },
  { id: 5, question: "Does your child have delayed language development or communication difficulties?", options: [{ value: "1", label: "Not at all" },{ value: "2", label: "Rarely" },{ value: "3", label: "Sometimes" },{ value: "4", label: "Often" },{ value: "5", label: "Very often" }] },
  { id: 6, question: "Does your child react excessively to sensory stimuli (sounds, textures, lights)?", options: [{ value: "1", label: "Not at all" },{ value: "2", label: "Rarely" },{ value: "3", label: "Sometimes" },{ value: "4", label: "Often" },{ value: "5", label: "Very sensitive" }] },
  { id: 7, question: "Does your child become excessively absorbed in specific interests?", options: [{ value: "1", label: "Never" },{ value: "2", label: "Rarely" },{ value: "3", label: "Sometimes" },{ value: "4", label: "Often" },{ value: "5", label: "Very often" }] },
  { id: 8, question: "Does your child experience extreme stress from sudden changes?", options: [{ value: "1", label: "Not at all" },{ value: "2", label: "Rarely" },{ value: "3", label: "Sometimes" },{ value: "4", label: "Often" },{ value: "5", label: "Very often" }] },
  { id: 9, question: "Does your child frequently experience digestive issues like indigestion or constipation?", options: [{ value: "1", label: "Never" },{ value: "2", label: "Rarely" },{ value: "3", label: "Sometimes" },{ value: "4", label: "Often" },{ value: "5", label: "Very often" }] },
  { id: 10, question: "Does your child have irregular sleep patterns or difficulty falling asleep?", options: [{ value: "1", label: "Not at all" },{ value: "2", label: "Rarely" },{ value: "3", label: "Sometimes" },{ value: "4", label: "Often" },{ value: "5", label: "Very often" }] }
];

export const AutismTest: React.FC<AutismTestProps> = ({ onComplete, onBack }) => {
  const { isEnglish } = useLanguage();
  const autismQuestions = isEnglish ? autismQuestionsEn : autismQuestionsKo;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [autismQuestions[currentQuestion].id]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < autismQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      const totalScore = Object.values(answers).reduce((sum, score) => sum + parseInt(score), 0);
      const maxScore = autismQuestions.length * 5;
      const percentage = (totalScore / maxScore) * 100;

      let severity: string;
      let recommendations: string[];

      if (percentage >= 80) {
        severity = isEnglish ? 'High' : '높음';
        recommendations = isEnglish
          ? ['Comprehensive evaluation and treatment plan at a specialist clinic', 'Herbal medicine for emotional regulation and focus', 'Digestive function improvement and nutritional balance', 'Parent consultation and home management education']
          : ['전문 한의원에서 정밀 평가와 치료 계획 수립', '감정 조절과 집중력 향상을 위한 한약 처방', '소화기능 개선과 영양 균형 맞춤 치료', '부모 상담과 가정 내 관리법 교육'];
      } else if (percentage >= 60) {
        severity = isEnglish ? 'Moderate' : '중간';
        recommendations = isEnglish
          ? ['Regular holistic management and consultation', 'Stress relief and stabilization treatment', 'Sleep pattern improvement and digestive strengthening', 'Comprehensive approach for social skill development']
          : ['정기적인 한의학적 관리와 상담', '스트레스 완화와 안정화를 위한 한방 치료', '수면 패턴 개선과 소화기능 강화', '사회성 향상을 위한 종합적 접근'];
      } else {
        severity = isEnglish ? 'Mild' : '경미';
        recommendations = isEnglish
          ? ['Preventive holistic management', 'Immune strengthening and constitution improvement', 'Customized care for healthy growth', 'Regular monitoring and consultation']
          : ['예방적 차원의 한방 관리', '면역력 강화와 체질 개선', '건강한 성장 발달을 위한 맞춤 케어', '정기적인 모니터링과 상담'];
      }

      const analysis = isEnglish
        ? `Autism spectrum symptom score is ${totalScore}/${maxScore} (${Math.round(percentage)}%). From a holistic perspective, autism spectrum is related to nervous system imbalance, digestive function decline, and emotional regulation difficulties. Personalized treatment can promote overall development and stabilization.`
        : `자폐 스펙트럼 관련 증상 점수는 ${totalScore}/${maxScore}점(${Math.round(percentage)}%)입니다. 한의학적 관점에서 자폐 스펙트럼은 신경계의 불균형과 소화기능 저하, 감정 조절 어려움 등과 관련이 있습니다. 체질에 맞는 한방 치료를 통해 전반적인 발달과 안정화를 도모할 수 있습니다.`;

      onComplete({ type: 'autism', score: totalScore, maxScore, percentage: Math.round(percentage), severity, answers, recommendations, analysis });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(prev => prev - 1);
  };

  const progress = ((currentQuestion + 1) / autismQuestions.length) * 100;
  const currentAnswer = answers[autismQuestions[currentQuestion].id];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-blue-500 mr-3" />
              <CardTitle className="text-2xl text-blue-800">{isEnglish ? 'Autism Spectrum Assessment' : '자폐 스펙트럼 한방 체크'}</CardTitle>
            </div>
            <CardDescription className="text-lg">
              {isEnglish ? 'Analyze autism spectrum symptoms from a holistic perspective' : '아동의 자폐 스펙트럼 증상을 한의학적 관점에서 분석합니다'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{isEnglish ? 'Progress' : '진행률'}</span>
                <span>{currentQuestion + 1} / {autismQuestions.length}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">{autismQuestions[currentQuestion].question}</h3>
              <RadioGroup value={currentAnswer || ""} onValueChange={handleAnswer}>
                {autismQuestions[currentQuestion].options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`autism-${currentQuestion}-${option.value}`} />
                    <Label htmlFor={`autism-${currentQuestion}-${option.value}`} className="text-sm cursor-pointer">{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={currentQuestion === 0 ? onBack : handlePrevious} className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {currentQuestion === 0 ? (isEnglish ? 'Back' : '뒤로') : (isEnglish ? 'Previous' : '이전')}
              </Button>
              <Button onClick={handleNext} disabled={!currentAnswer} className="bg-blue-500 hover:bg-blue-600 text-white flex items-center">
                {currentQuestion === autismQuestions.length - 1 ? (isEnglish ? 'View Results' : '결과 보기') : (isEnglish ? 'Next' : '다음')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
