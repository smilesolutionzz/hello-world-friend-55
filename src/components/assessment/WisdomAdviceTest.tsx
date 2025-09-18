import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Lightbulb, Users, Heart, BookOpen } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
}

const questions: Question[] = [
  {
    id: '1',
    question: '인생에서 가장 소중하다고 생각하는 것은 무엇인가요?',
    options: [
      '가족과의 화목한 시간',
      '건강한 몸과 마음',
      '경제적 안정과 여유',
      '꿈과 목표를 향한 도전'
    ]
  },
  {
    id: '2',
    question: '어려운 상황에 처했을 때 가장 먼저 하는 일은?',
    options: [
      '주변 사람들과 상의한다',
      '혼자 차분히 생각해본다',
      '일단 행동부터 시작한다',
      '과거 경험을 떠올려본다'
    ]
  },
  {
    id: '3',
    question: '젊은 세대를 보면서 가장 걱정되는 부분은?',
    options: [
      '너무 성급하고 조급해한다',
      '인간관계가 너무 가볍다',
      '건강을 소홀히 한다',
      '돈과 성공만 추구한다'
    ]
  },
  {
    id: '4',
    question: '나이가 들면서 가장 크게 깨달은 것은?',
    options: [
      '시간의 소중함',
      '사람 관계의 중요성',
      '건강이 최고의 재산',
      '작은 것에도 감사하는 마음'
    ]
  },
  {
    id: '5',
    question: '후배나 자녀에게 가장 전해주고 싶은 말은?',
    options: [
      '실패를 두려워하지 말고 도전하라',
      '사람을 소중히 여기고 진실하게 살아라',
      '건강관리를 철저히 하라',
      '작은 행복을 놓치지 말라'
    ]
  }
];

interface WisdomAdviceTestProps {
  onComplete: (result: any, testType: string) => void;
  onBack: () => void;
}

const WisdomAdviceTest: React.FC<WisdomAdviceTestProps> = ({ onComplete, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    // 답변 분석
    const scores = {
      family: 0,
      health: 0,
      wisdom: 0,
      experience: 0
    };

    Object.values(answers).forEach((answer, index) => {
      switch (index) {
        case 0: // 첫 번째 질문
          if (answer === '가족과의 화목한 시간') scores.family += 2;
          if (answer === '건강한 몸과 마음') scores.health += 2;
          if (answer === '경제적 안정과 여유') scores.wisdom += 2;
          if (answer === '꿈과 목표를 향한 도전') scores.experience += 2;
          break;
        case 1: // 두 번째 질문
          if (answer === '주변 사람들과 상의한다') scores.family += 2;
          if (answer === '혼자 차분히 생각해본다') scores.wisdom += 2;
          if (answer === '일단 행동부터 시작한다') scores.experience += 2;
          if (answer === '과거 경험을 떠올려본다') scores.wisdom += 1;
          break;
        case 2: // 세 번째 질문
          if (answer === '너무 성급하고 조급해한다') scores.wisdom += 2;
          if (answer === '인간관계가 너무 가볍다') scores.family += 2;
          if (answer === '건강을 소홀히 한다') scores.health += 2;
          if (answer === '돈과 성공만 추구한다') scores.experience += 2;
          break;
        case 3: // 네 번째 질문
          if (answer === '시간의 소중함') scores.wisdom += 2;
          if (answer === '사람 관계의 중요성') scores.family += 2;
          if (answer === '건강이 최고의 재산') scores.health += 2;
          if (answer === '작은 것에도 감사하는 마음') scores.experience += 2;
          break;
        case 4: // 다섯 번째 질문
          if (answer === '실패를 두려워하지 말고 도전하라') scores.experience += 2;
          if (answer === '사람을 소중히 여기고 진실하게 살아라') scores.family += 2;
          if (answer === '건강관리를 철저히 하라') scores.health += 2;
          if (answer === '작은 행복을 놓치지 말라') scores.wisdom += 2;
          break;
      }
    });

    // 가장 높은 점수의 타입 결정
    const maxScore = Math.max(...Object.values(scores));
    let adviceType = 'balance';
    let icon = BookOpen;
    let title = '';
    let description = '';
    let advice = '';

    if (scores.family === maxScore) {
      adviceType = 'family';
      icon = Heart;
      title = '따뜻한 마음의 가족 지킴이';
      description = '당신은 가족과 인간관계를 가장 소중히 여기는 분입니다. 사람들과의 따뜻한 유대관계가 인생의 가장 큰 보물이라고 생각하시는군요.';
      advice = '가족들과 더 많은 시간을 보내시고, 주변 사람들에게 당신의 따뜻한 마음을 계속 나누어 주세요. 당신의 사랑이 많은 사람들에게 힘이 됩니다.';
    } else if (scores.health === maxScore) {
      adviceType = 'health';
      icon = Lightbulb;
      title = '건강한 삶의 지혜로운 관리자';
      description = '당신은 건강의 소중함을 누구보다 잘 아시는 분입니다. 몸과 마음의 건강이 모든 행복의 기초라는 것을 깊이 이해하고 계시네요.';
      advice = '꾸준한 운동과 건강한 식습관을 유지하시고, 주변 분들에게도 건강관리의 중요성을 알려주세요. 당신의 건강한 라이프스타일이 좋은 본보기가 됩니다.';
    } else if (scores.wisdom === maxScore) {
      adviceType = 'wisdom';
      icon = BookOpen;
      title = '깊은 통찰력의 지혜로운 현자';
      description = '당신은 인생의 깊은 지혜를 터득하신 분입니다. 시간과 경험을 통해 얻은 통찰력으로 현명한 판단을 하시는군요.';
      advice = '당신의 지혜와 경험을 젊은 세대와 나누어 주세요. 책을 읽거나 새로운 것을 배우는 것도 계속하시면서 평생학습의 모범을 보여주세요.';
    } else {
      adviceType = 'experience';
      icon = Users;
      title = '풍부한 경험의 인생 멘토';
      description = '당신은 다양한 인생 경험을 통해 성장해온 분입니다. 실패와 성공을 모두 겪으며 얻은 경험이 큰 자산이 되고 있어요.';
      advice = '당신의 경험담을 주변 사람들과 나누어 주세요. 특히 어려움을 겪는 사람들에게 용기와 희망을 주는 조언자 역할을 해주시면 좋겠어요.';
    }

    const result = {
      adviceType,
      icon: icon.name,
      title,
      description,
      advice,
      scores,
      answers,
      timestamp: new Date().toISOString()
    };

    setTimeout(() => {
      setLoading(false);
      onComplete(result, 'wisdom_advice');
    }, 2000);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentAnswer = answers[questions[currentQuestion]?.id];
  const canProceed = currentAnswer !== undefined;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-orange-800 mb-2">
              인생 지혜 분석 중...
            </h3>
            <p className="text-orange-600">
              당신만의 특별한 조언을 준비하고 있습니다
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 text-orange-700 hover:text-orange-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
          
          <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-orange-700">
                진행상황
              </span>
              <span className="text-sm text-orange-600">
                {currentQuestion + 1} / {questions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <Card className="shadow-lg border-orange-200">
          <CardHeader className="text-center bg-gradient-to-r from-orange-100 to-amber-100">
            <div className="mx-auto mb-4 p-3 bg-orange-200 rounded-full w-fit">
              <Lightbulb className="w-8 h-8 text-orange-700" />
            </div>
            <CardTitle className="text-2xl text-orange-800">
              인생 지혜 조언 테스트
            </CardTitle>
            <p className="text-orange-600 mt-2">
              당신에게 맞는 인생 조언을 찾아드립니다
            </p>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                {questions[currentQuestion].question}
              </h3>
              
              <RadioGroup
                value={currentAnswer || ''}
                onValueChange={handleAnswer}
                className="space-y-4"
              >
                {questions[currentQuestion].options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-colors">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 text-gray-700 cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestion === questions.length - 1 ? '결과 보기' : '다음 질문'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WisdomAdviceTest;