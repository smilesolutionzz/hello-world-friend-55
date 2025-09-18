import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Lightbulb, Users, Heart, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  },
  {
    id: '6',
    question: '하루 중 가장 행복한 순간은 언제인가요?',
    options: [
      '가족들과 함께 식사할 때',
      '혼자만의 조용한 시간을 가질 때',
      '운동이나 산책을 할 때',
      '새로운 것을 배우거나 경험할 때'
    ]
  },
  {
    id: '7',
    question: '요즘 젊은 사람들에게 가장 부러운 점은?',
    options: [
      '체력과 건강함',
      '새로운 기술을 쉽게 배우는 능력',
      '무한한 가능성과 꿈',
      '자유로운 사고방식'
    ]
  },
  {
    id: '8',
    question: '스트레스를 받을 때 가장 효과적인 해소 방법은?',
    options: [
      '가족이나 친구와 대화하기',
      '좋아하는 음악 듣기나 책 읽기',
      '산책이나 가벼운 운동하기',
      '취미활동에 집중하기'
    ]
  },
  {
    id: '9',
    question: '만약 젊은 시절로 돌아간다면 가장 하고 싶은 일은?',
    options: [
      '가족과 더 많은 시간 보내기',
      '건강관리를 더 철저히 하기',
      '더 많이 공부하고 배우기',
      '다양한 경험과 여행하기'
    ]
  },
  {
    id: '10',
    question: '현재 가장 관심 있는 활동이나 취미는?',
    options: [
      '요리나 원예 같은 생활 취미',
      '독서나 문화 활동',
      '운동이나 건강 관리',
      '새로운 기술이나 학습'
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
    
    try {
      // 답변 분석 - 확장된 점수 계산
      const scores = {
        family: 0,
        health: 0,
        wisdom: 0,
        experience: 0
      };

      // 각 질문별 점수 계산 로직 개선
      Object.entries(answers).forEach(([questionId, answer]) => {
        const questionIndex = parseInt(questionId) - 1;
        
        switch (questionIndex) {
          case 0: // 인생에서 가장 소중한 것
            if (answer.includes('가족')) scores.family += 3;
            if (answer.includes('건강')) scores.health += 3;
            if (answer.includes('경제적') || answer.includes('안정')) scores.wisdom += 3;
            if (answer.includes('꿈') || answer.includes('도전')) scores.experience += 3;
            break;
          case 1: // 어려운 상황 대처
            if (answer.includes('사람들과') || answer.includes('상의')) scores.family += 3;
            if (answer.includes('차분히') || answer.includes('생각')) scores.wisdom += 3;
            if (answer.includes('행동')) scores.experience += 3;
            if (answer.includes('경험')) scores.wisdom += 2;
            break;
          case 2: // 젊은 세대 걱정
            if (answer.includes('성급') || answer.includes('조급')) scores.wisdom += 3;
            if (answer.includes('인간관계') || answer.includes('가볍다')) scores.family += 3;
            if (answer.includes('건강')) scores.health += 3;
            if (answer.includes('돈') || answer.includes('성공')) scores.experience += 3;
            break;
          case 3: // 나이 들면서 깨달은 것
            if (answer.includes('시간')) scores.wisdom += 3;
            if (answer.includes('관계') || answer.includes('사람')) scores.family += 3;
            if (answer.includes('건강')) scores.health += 3;
            if (answer.includes('감사') || answer.includes('작은')) scores.experience += 3;
            break;
          case 4: // 후배에게 전하고 싶은 말
            if (answer.includes('도전') || answer.includes('실패')) scores.experience += 3;
            if (answer.includes('사람') || answer.includes('진실')) scores.family += 3;
            if (answer.includes('건강')) scores.health += 3;
            if (answer.includes('행복')) scores.wisdom += 3;
            break;
          case 5: // 가장 행복한 순간
            if (answer.includes('가족') || answer.includes('식사')) scores.family += 2;
            if (answer.includes('조용한') || answer.includes('혼자')) scores.wisdom += 2;
            if (answer.includes('운동') || answer.includes('산책')) scores.health += 2;
            if (answer.includes('새로운') || answer.includes('배우')) scores.experience += 2;
            break;
          case 6: // 젊은 사람들에게 부러운 점
            if (answer.includes('체력') || answer.includes('건강')) scores.health += 2;
            if (answer.includes('기술') || answer.includes('배우')) scores.wisdom += 2;
            if (answer.includes('가능성') || answer.includes('꿈')) scores.experience += 2;
            if (answer.includes('자유') || answer.includes('사고')) scores.experience += 1;
            break;
          case 7: // 스트레스 해소 방법
            if (answer.includes('대화') || answer.includes('친구')) scores.family += 2;
            if (answer.includes('음악') || answer.includes('책')) scores.wisdom += 2;
            if (answer.includes('산책') || answer.includes('운동')) scores.health += 2;
            if (answer.includes('취미')) scores.experience += 2;
            break;
          case 8: // 젊은 시절로 돌아간다면
            if (answer.includes('가족') || answer.includes('시간')) scores.family += 2;
            if (answer.includes('건강')) scores.health += 2;
            if (answer.includes('공부') || answer.includes('배우')) scores.wisdom += 2;
            if (answer.includes('경험') || answer.includes('여행')) scores.experience += 2;
            break;
          case 9: // 현재 관심 있는 활동
            if (answer.includes('요리') || answer.includes('원예')) scores.family += 2;
            if (answer.includes('독서') || answer.includes('문화')) scores.wisdom += 2;
            if (answer.includes('운동') || answer.includes('건강')) scores.health += 2;
            if (answer.includes('기술') || answer.includes('학습')) scores.experience += 2;
            break;
        }
      });

      console.log('Calculated scores:', scores);

      // OpenAI API로 재미있는 결과 생성
      const { data: aiResult, error } = await supabase.functions.invoke('generate-wisdom-advice', {
        body: { answers, scores }
      });

      if (error) {
        console.error('AI 생성 오류:', error);
        throw error;
      }

      console.log('AI generated result:', aiResult);

      // 기본 아이콘과 타입 결정
      const maxScore = Math.max(...Object.values(scores));
      let adviceType = 'balance';
      let icon = BookOpen;

      if (scores.family === maxScore) {
        adviceType = 'family';
        icon = Heart;
      } else if (scores.health === maxScore) {
        adviceType = 'health';
        icon = Lightbulb;
      } else if (scores.wisdom === maxScore) {
        adviceType = 'wisdom';
        icon = BookOpen;
      } else {
        adviceType = 'experience';
        icon = Users;
      }

      const result = {
        adviceType,
        icon: icon.name,
        title: aiResult.title || '지혜로운 인생의 멘토',
        description: aiResult.description || '당신은 풍부한 인생 경험을 가진 분입니다.',
        advice: aiResult.advice || '당신의 경험과 지혜를 주변과 나누어 주세요.',
        funFact: aiResult.funFact || '당신같은 분이 있어서 세상이 더 따뜻해집니다!',
        recommendation: aiResult.recommendation || '오늘 하루 여유롭게 보내보세요.',
        scores,
        answers,
        timestamp: new Date().toISOString()
      };

      setTimeout(() => {
        setLoading(false);
        onComplete(result, 'wisdom_advice');
      }, 2000);

    } catch (error) {
      console.error('결과 생성 오류:', error);
      
      // 오류 시 기본 결과 제공
      const basicScores = {
        family: Object.values(answers).filter(a => a.includes('가족')).length * 2,
        health: Object.values(answers).filter(a => a.includes('건강')).length * 2,
        wisdom: Object.values(answers).filter(a => a.includes('지혜') || a.includes('생각')).length * 2,
        experience: Object.values(answers).filter(a => a.includes('경험') || a.includes('도전')).length * 2
      };

      const result = {
        adviceType: 'wisdom',
        icon: 'BookOpen',
        title: '지혜로운 인생의 선배 🌟',
        description: '당신은 인생의 소중한 가치들을 잘 아시는 분입니다.',
        advice: '당신의 따뜻한 마음과 경험을 주변 사람들과 나누어 주세요.',
        funFact: '당신 같은 분이 있어서 세상이 더 따뜻해집니다! 😊',
        recommendation: '오늘 하루는 평소보다 조금 더 여유롭게 보내보세요.',
        scores: basicScores,
        answers,
        timestamp: new Date().toISOString()
      };

      setTimeout(() => {
        setLoading(false);
        onComplete(result, 'wisdom_advice');
      }, 2000);
    }
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