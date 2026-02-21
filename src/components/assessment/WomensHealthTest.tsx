import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Heart, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface WomensHealthTestProps {
  onComplete: (result: any) => void;
  onBack?: () => void;
}

const questionsKo = [
  { id: 1, text: "월경주기는 어떠신가요?", options: [
    { value: "regular", label: "규칙적 (25-35일)", score: { liver: 2, kidney: 2 } },
    { value: "irregular", label: "불규칙적", score: { liver: -1, kidney: -1, heart: 1 } },
    { value: "heavy", label: "과다월경", score: { liver: -2, spleen: -1 } },
    { value: "light", label: "과소월경", score: { kidney: -2, blood: -1 } }
  ]},
  { id: 2, text: "생리통의 정도는 어느 정도인가요?", options: [
    { value: "none", label: "거의 없음", score: { liver: 2, kidney: 1 } },
    { value: "mild", label: "약간 있음", score: { liver: 1 } },
    { value: "moderate", label: "중간 정도", score: { liver: -1, qi: -1 } },
    { value: "severe", label: "심함", score: { liver: -2, kidney: -1, qi: -2 } }
  ]},
  { id: 3, text: "손발이 차가운 편인가요?", options: [
    { value: "never", label: "전혀 그렇지 않다", score: { yang: 2 } },
    { value: "sometimes", label: "가끔 그렇다", score: { yang: 0 } },
    { value: "often", label: "자주 그렇다", score: { yang: -1, kidney: -1 } },
    { value: "always", label: "항상 그렇다", score: { yang: -2, kidney: -2, spleen: -1 } }
  ]},
  { id: 4, text: "피부 상태는 어떠신가요?", options: [
    { value: "good", label: "좋은 편", score: { lung: 2, blood: 1 } },
    { value: "dry", label: "건조함", score: { lung: -1, blood: -1 } },
    { value: "oily", label: "기름기 많음", score: { liver: -1, heat: 1 } },
    { value: "sensitive", label: "민감함", score: { lung: -2, liver: -1 } }
  ]},
  { id: 5, text: "체중 변화는 어떠신가요?", options: [
    { value: "stable", label: "안정적", score: { spleen: 2 } },
    { value: "gain", label: "증가 경향", score: { spleen: -1, phlegm: 1 } },
    { value: "loss", label: "감소 경향", score: { spleen: -2, qi: -1 } },
    { value: "fluctuate", label: "변동 심함", score: { liver: -1, kidney: -1 } }
  ]},
  { id: 6, text: "수면의 질은 어떠신가요?", options: [
    { value: "good", label: "깊고 충분", score: { heart: 2, kidney: 1 } },
    { value: "light", label: "얕고 자주 깸", score: { heart: -1, liver: -1 } },
    { value: "insomnia", label: "불면증", score: { heart: -2, kidney: -1, liver: -1 } },
    { value: "tired", label: "자도 피곤", score: { spleen: -2, qi: -1 } }
  ]},
  { id: 7, text: "스트레스 반응은 어떠신가요?", options: [
    { value: "resilient", label: "잘 견딤", score: { liver: 2, heart: 1 } },
    { value: "moderate", label: "보통", score: { liver: 0 } },
    { value: "sensitive", label: "민감함", score: { liver: -1, heart: -1 } },
    { value: "overwhelmed", label: "압도됨", score: { liver: -2, heart: -2, qi: -1 } }
  ]},
  { id: 8, text: "소화 상태는 어떠신가요?", options: [
    { value: "good", label: "좋음", score: { spleen: 2, stomach: 1 } },
    { value: "bloating", label: "팽만감", score: { spleen: -1, qi: -1 } },
    { value: "indigestion", label: "소화불량", score: { spleen: -2, stomach: -1 } },
    { value: "irregular", label: "불규칙", score: { liver: -1, spleen: -1 } }
  ]}
];

const questionsEn = [
  { id: 1, text: "How is your menstrual cycle?", options: [
    { value: "regular", label: "Regular (25-35 days)", score: { liver: 2, kidney: 2 } },
    { value: "irregular", label: "Irregular", score: { liver: -1, kidney: -1, heart: 1 } },
    { value: "heavy", label: "Heavy periods", score: { liver: -2, spleen: -1 } },
    { value: "light", label: "Light periods", score: { kidney: -2, blood: -1 } }
  ]},
  { id: 2, text: "How severe is your menstrual pain?", options: [
    { value: "none", label: "Almost none", score: { liver: 2, kidney: 1 } },
    { value: "mild", label: "Mild", score: { liver: 1 } },
    { value: "moderate", label: "Moderate", score: { liver: -1, qi: -1 } },
    { value: "severe", label: "Severe", score: { liver: -2, kidney: -1, qi: -2 } }
  ]},
  { id: 3, text: "Do you tend to have cold hands and feet?", options: [
    { value: "never", label: "Not at all", score: { yang: 2 } },
    { value: "sometimes", label: "Sometimes", score: { yang: 0 } },
    { value: "often", label: "Often", score: { yang: -1, kidney: -1 } },
    { value: "always", label: "Always", score: { yang: -2, kidney: -2, spleen: -1 } }
  ]},
  { id: 4, text: "How is your skin condition?", options: [
    { value: "good", label: "Good", score: { lung: 2, blood: 1 } },
    { value: "dry", label: "Dry", score: { lung: -1, blood: -1 } },
    { value: "oily", label: "Oily", score: { liver: -1, heat: 1 } },
    { value: "sensitive", label: "Sensitive", score: { lung: -2, liver: -1 } }
  ]},
  { id: 5, text: "How are your weight changes?", options: [
    { value: "stable", label: "Stable", score: { spleen: 2 } },
    { value: "gain", label: "Tends to increase", score: { spleen: -1, phlegm: 1 } },
    { value: "loss", label: "Tends to decrease", score: { spleen: -2, qi: -1 } },
    { value: "fluctuate", label: "Fluctuates a lot", score: { liver: -1, kidney: -1 } }
  ]},
  { id: 6, text: "How is your sleep quality?", options: [
    { value: "good", label: "Deep and sufficient", score: { heart: 2, kidney: 1 } },
    { value: "light", label: "Light, wake up often", score: { heart: -1, liver: -1 } },
    { value: "insomnia", label: "Insomnia", score: { heart: -2, kidney: -1, liver: -1 } },
    { value: "tired", label: "Still tired after sleeping", score: { spleen: -2, qi: -1 } }
  ]},
  { id: 7, text: "How do you respond to stress?", options: [
    { value: "resilient", label: "Handle it well", score: { liver: 2, heart: 1 } },
    { value: "moderate", label: "Average", score: { liver: 0 } },
    { value: "sensitive", label: "Sensitive", score: { liver: -1, heart: -1 } },
    { value: "overwhelmed", label: "Overwhelmed", score: { liver: -2, heart: -2, qi: -1 } }
  ]},
  { id: 8, text: "How is your digestion?", options: [
    { value: "good", label: "Good", score: { spleen: 2, stomach: 1 } },
    { value: "bloating", label: "Bloating", score: { spleen: -1, qi: -1 } },
    { value: "indigestion", label: "Indigestion", score: { spleen: -2, stomach: -1 } },
    { value: "irregular", label: "Irregular", score: { liver: -1, spleen: -1 } }
  ]}
];

export const WomensHealthTest: React.FC<WomensHealthTestProps> = ({ onComplete, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const { isEnglish } = useLanguage();

  const questions = isEnglish ? questionsEn : questionsKo;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [questions[currentQuestion].id]: value });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResult = () => {
    const scores = {
      liver: 0, kidney: 0, heart: 0, spleen: 0, lung: 0, stomach: 0,
      qi: 0, blood: 0, yang: 0, yin: 0, heat: 0, cold: 0, phlegm: 0
    };

    questions.forEach((question) => {
      const answer = answers[question.id];
      if (answer) {
        const option = question.options.find(opt => opt.value === answer);
        if (option?.score) {
          Object.entries(option.score).forEach(([key, value]) => {
            if (key in scores) {
              scores[key as keyof typeof scores] += value;
            }
          });
        }
      }
    });

    const constitutionScore = {
      taeyang: Math.max(0, scores.liver + scores.heart),
      taeeum: Math.max(0, scores.spleen + scores.lung),
      soyang: Math.max(0, scores.kidney + scores.liver),
      soeum: Math.max(0, scores.kidney + scores.spleen)
    };

    const dominantType = Object.entries(constitutionScore).sort(([,a], [,b]) => b - a)[0][0];

    onComplete({
      type: 'women_health', constitution: dominantType, scores, constitutionScore,
      answers, rawAnswers: Object.values(answers), timestamp: new Date().toISOString()
    });
  };

  const currentQ = questions[currentQuestion];
  const hasAnswer = answers[currentQ.id];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={onBack || (() => setCurrentQuestion(Math.max(0, currentQuestion - 1)))} className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isEnglish ? 'Back' : '이전'}
            </Button>
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-pink-500" />
              <span className="font-medium text-pink-600">
                {isEnglish ? "Women's Health Constitution Analysis" : '여성 건강 체질 분석'}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">{currentQuestion + 1} / {questions.length}</div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="border-2 border-pink-200">
          <CardHeader>
            <CardTitle className="text-xl text-center">{currentQ.text}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={answers[currentQ.id] || ''} onValueChange={handleAnswer} className="space-y-4">
              {currentQ.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-pink-50 transition-colors">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0} className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {isEnglish ? 'Previous' : '이전'}
              </Button>
              <Button onClick={handleNext} disabled={!hasAnswer} className="flex items-center bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                {currentQuestion === questions.length - 1 ? (isEnglish ? 'View Results' : '결과 보기') : (isEnglish ? 'Next' : '다음')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
