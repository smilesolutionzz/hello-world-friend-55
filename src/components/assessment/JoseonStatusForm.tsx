import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface JoseonStatusFormProps {
  onComplete: (result: any) => void;
}

const JoseonStatusForm: React.FC<JoseonStatusFormProps> = ({ onComplete }) => {
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

  const questions = [
    {
      id: 'lifestyle',
      question: '평소 생활 패턴은?',
      options: [
        { value: 'luxury', label: '🏰 편안하고 여유로운 생활을 선호' },
        { value: 'balanced', label: '⚖️ 적당히 바쁘고 안정적인 생활' },
        { value: 'hardworking', label: '💪 부지런하고 열심히 일하는 편' },
        { value: 'simple', label: '🌾 소박하고 검소한 생활을 좋아함' }
      ]
    },
    {
      id: 'education',
      question: '학문에 대한 관심은?',
      options: [
        { value: 'high', label: '📚 매우 높음 - 항상 공부하고 싶음' },
        { value: 'medium', label: '✏️ 보통 - 필요한 만큼만' },
        { value: 'low', label: '🤷 낮음 - 실용적인 것만 배우고 싶음' },
        { value: 'none', label: '🚫 거의 없음 - 몸으로 하는 일이 좋음' }
      ]
    },
    {
      id: 'social',
      question: '사람들과의 관계는?',
      options: [
        { value: 'leader', label: '👑 리더십을 발휘하며 앞장서는 편' },
        { value: 'network', label: '🤝 다양한 사람들과 폭넓게 어울림' },
        { value: 'close', label: '👥 가까운 사람들과 깊은 관계' },
        { value: 'alone', label: '🏠 혼자 있는 시간을 더 좋아함' }
      ]
    },
    {
      id: 'ambition',
      question: '인생의 목표는?',
      options: [
        { value: 'power', label: '👑 권력과 명예를 얻고 싶음' },
        { value: 'knowledge', label: '🧠 지식과 학문을 쌓고 싶음' },
        { value: 'stability', label: '🏡 안정적이고 평화로운 삶' },
        { value: 'freedom', label: '🕊️ 자유롭고 제약 없는 삶' }
      ]
    }
  ];

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateStatus = () => {
    const { lifestyle, education, social, ambition } = answers;

    // 양반 조건
    if ((education === 'high' && social === 'leader') || 
        (lifestyle === 'luxury' && ambition === 'power') ||
        (education === 'high' && ambition === 'knowledge')) {
      return {
        status: '양반 (兩班)',
        level: '지배층',
        description: '조선시대 최고 신분으로 정치, 행정, 학문을 담당하는 귀족 계층',
        privileges: [
          '과거 시험 응시 가능',
          '관직 진출 가능', 
          '세금 면제',
          '형벌 감면',
          '토지 소유 가능'
        ],
        lifestyle: '한옥 저택에서 거주하며 하인들의 도움을 받아 생활',
        modernEquivalent: '고위 공무원, 대기업 임원, 교수 등',
        percentage: '전체 인구의 약 10%'
      };
    }

    // 중인 조건
    if ((education === 'medium' && social === 'network') ||
        (lifestyle === 'balanced' && ambition === 'knowledge') ||
        (education === 'high' && social === 'network')) {
      return {
        status: '중인 (中人)',
        level: '중간층',
        description: '기술직 관리나 전문직을 담당하는 중간 신분',
        privileges: [
          '전문 기술직 종사',
          '일정한 경제력 보유',
          '교육 기회 제공',
          '사회적 존경 받음'
        ],
        lifestyle: '중간 규모 집에서 비교적 안정적인 생활',
        modernEquivalent: '의사, 변호사, 엔지니어, 중간관리직',
        percentage: '전체 인구의 약 15%'
      };
    }

    // 평민(상민) 조건
    if ((lifestyle === 'hardworking' && social === 'close') ||
        (education === 'low' && ambition === 'stability') ||
        (lifestyle === 'balanced' && social === 'close')) {
      return {
        status: '평민 (平民)',
        level: '일반인',
        description: '농업, 수공업, 상업에 종사하는 자유민',
        privileges: [
          '자유로운 거주와 이동',
          '재산 소유 가능',
          '혼인의 자유',
          '직업 선택의 자유'
        ],
        lifestyle: '소박한 집에서 근면하게 생활하며 가족 중심의 삶',
        modernEquivalent: '일반 직장인, 자영업자, 농민',
        percentage: '전체 인구의 약 70%'
      };
    }

    // 기본값 (서민)
    return {
      status: '서민 (庶民)',
      level: '서민층',
      description: '주로 육체노동에 종사하는 일반 백성',
      privileges: [
        '기본적인 생존권',
        '소규모 농업 가능',
        '단순 기술 보유',
        '공동체 참여'
      ],
      lifestyle: '검소하고 소박한 생활, 공동체와 함께 살아감',
      modernEquivalent: '일반 노동자, 서비스업 종사자',
      percentage: '전체 인구의 대부분'
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (Object.keys(answers).length !== questions.length) {
      alert('모든 질문에 답해주세요!');
      return;
    }

    const statusResult = calculateStatus();
    
    const result = {
      ...statusResult,
      answers,
      modernAdvice: `현대에도 ${statusResult.status}의 정신을 이어받아 품격 있는 삶을 살아보세요!`,
      historicalContext: '조선시대는 신분제 사회였지만, 현대는 모든 사람이 평등한 사회입니다.'
    };

    onComplete(result);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          👑 조선시대 내 신분은? 👑
        </CardTitle>
        <CardDescription className="text-lg">
          생활 패턴과 가치관으로 알아보는 나의 조선시대 신분!
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {questions.map((question, index) => (
            <div key={question.id} className="space-y-4">
              <h3 className="text-lg font-semibold">
                Q{index + 1}. {question.question}
              </h3>
              <RadioGroup 
                value={answers[question.id] || ''} 
                onValueChange={(value) => handleAnswerChange(question.id, value)}
              >
                {question.options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`${question.id}_${option.value}`} />
                    <Label htmlFor={`${question.id}_${option.value}`} className="cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}

          <Button 
            type="submit" 
            className="w-full text-lg py-6"
            disabled={Object.keys(answers).length !== questions.length}
          >
            내 조선시대 신분 알아보기! 🏰
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default JoseonStatusForm;