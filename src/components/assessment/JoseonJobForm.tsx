import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface JoseonJobFormProps {
  onComplete: (result: any) => void;
}

const JoseonJobForm: React.FC<JoseonJobFormProps> = ({ onComplete }) => {
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

  const questions = [
    {
      id: 'personality',
      question: '당신의 성격은?',
      options: [
        { value: 'scholar', label: '📚 조용하고 학문을 좋아함' },
        { value: 'leader', label: '👑 리더십이 강하고 결단력 있음' },
        { value: 'artist', label: '🎨 창의적이고 예술적 감각이 뛰어남' },
        { value: 'warrior', label: '⚔️ 용감하고 정의감이 강함' }
      ]
    },
    {
      id: 'preference',
      question: '가장 하고 싶은 일은?',
      options: [
        { value: 'study', label: '📖 책을 읽고 글을 쓰기' },
        { value: 'trade', label: '💰 장사하고 돈 벌기' },
        { value: 'help', label: '💊 사람들 치료하고 돕기' },
        { value: 'create', label: '🏺 무언가를 만들고 창조하기' }
      ]
    },
    {
      id: 'value',
      question: '가장 중요하게 생각하는 가치는?',
      options: [
        { value: 'wisdom', label: '🧠 지혜와 학문' },
        { value: 'loyalty', label: '💝 충성과 의리' },
        { value: 'freedom', label: '🕊️ 자유와 독립' },
        { value: 'family', label: '👨‍👩‍👧‍👦 가족과 화목' }
      ]
    }
  ];

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (Object.keys(answers).length !== questions.length) {
      alert('모든 질문에 답해주세요!');
      return;
    }

    // 답변 조합에 따른 직업 결정
    const jobMapping: { [key: string]: any } = {
      'scholar_study_wisdom': {
        job: '문관 (文官)',
        description: '나라의 정치와 행정을 담당하는 고위 관료',
        duties: ['국정 자문', '문서 작성', '정책 수립', '교육 담당'],
        salary: '쌀 100석/년',
        status: '정2품~정9품'
      },
      'leader_study_loyalty': {
        job: '판서 (判書)',
        description: '각 부처의 최고 책임자로 나라를 이끄는 최고위직',
        duties: ['부처 총괄', '정책 결정', '왕께 보고', '인사 관리'],
        salary: '쌀 200석/년',
        status: '정2품'
      },
      'artist_create_freedom': {
        job: '화원 (畫員)',
        description: '궁중에서 그림을 그리고 예술 활동을 하는 전문가',
        duties: ['궁중 행사 기록', '초상화 제작', '장식품 제작', '예술 교육'],
        salary: '쌀 30석/년',
        status: '정7품~정9품'
      },
      'warrior_help_loyalty': {
        job: '무관 (武官)',
        description: '나라를 지키고 백성을 보호하는 군인',
        duties: ['국방 담당', '치안 유지', '훈련 지휘', '전략 수립'],
        salary: '쌀 80석/년',
        status: '정3품~정9품'
      }
    };

    // 기본 직업들
    const defaultJobs = [
      {
        job: '의원 (醫員)',
        description: '사람들의 병을 고치고 건강을 돌보는 의사',
        duties: ['환자 진료', '약 제조', '의학 연구', '건강 상담'],
        salary: '쌀 50석/년',
        status: '정6품~정9품'
      },
      {
        job: '상인 (商人)',
        description: '물건을 사고팔며 경제 활동을 하는 장사꾼',
        duties: ['상품 거래', '시장 운영', '물류 관리', '가격 협상'],
        salary: '수익에 따라 변동',
        status: '평민'
      },
      {
        job: '수공업자 (手工業者)',
        description: '손으로 물건을 만드는 전문 기술자',
        duties: ['공예품 제작', '도구 제작', '기술 전수', '주문 제작'],
        salary: '쌀 25석/년',
        status: '평민'
      },
      {
        job: '교육관 (敎育官)',
        description: '학문을 가르치고 인재를 양성하는 선생님',
        duties: ['학생 교육', '교재 제작', '시험 관리', '인재 추천'],
        salary: '쌀 40석/년',
        status: '정7품~정9품'
      }
    ];

    const answerKey = `${answers.personality}_${answers.preference}_${answers.value}`;
    const selectedJob = jobMapping[answerKey] || defaultJobs[Math.floor(Math.random() * defaultJobs.length)];

    const result = {
      ...selectedJob,
      personality: answers.personality,
      modernAdvice: '현대에도 당신의 조선시대 직업 정신을 살려보세요!',
      compatibility: '같은 직업을 가진 사람들과 잘 맞을 것입니다.'
    };

    onComplete(result);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          👨‍💼 조선시대 내 직업은? 👩‍💼
        </CardTitle>
        <CardDescription className="text-lg">
          성격과 가치관으로 알아보는 나의 조선시대 직업!
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
            내 조선시대 직업 알아보기! 🏛️
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default JoseonJobForm;