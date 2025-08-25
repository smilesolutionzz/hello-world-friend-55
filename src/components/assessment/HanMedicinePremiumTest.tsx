import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Loader2, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const sections = [
  {
    id: 'basic_info',
    title: '기본 정보',
    questions: [
      {
        id: 'age_range',
        question: '연령대를 선택해주세요',
        type: 'radio',
        options: [
          { value: '20s', label: '20대' },
          { value: '30s', label: '30대' },
          { value: '40s', label: '40대' },
          { value: '50s', label: '50대' },
          { value: '60s', label: '60대 이상' }
        ]
      },
      {
        id: 'gender',
        question: '성별을 선택해주세요',
        type: 'radio',
        options: [
          { value: 'male', label: '남성' },
          { value: 'female', label: '여성' }
        ]
      },
      {
        id: 'main_concern',
        question: '가장 관심 있는 건강 관리 분야는?',
        type: 'radio',
        options: [
          { value: 'digestion', label: '소화기 건강' },
          { value: 'circulation', label: '순환기 건강' },
          { value: 'immunity', label: '면역력 강화' },
          { value: 'stress', label: '스트레스 관리' },
          { value: 'energy', label: '기력 회복' },
          { value: 'sleep', label: '수면 질 개선' }
        ]
      }
    ]
  },
  {
    id: 'constitution',
    title: '체질 분석',
    questions: [
      {
        id: 'body_type',
        question: '체형적 특징을 모두 선택해주세요',
        type: 'checkbox',
        options: [
          { value: 'thin_upper', label: '상체가 마른 편' },
          { value: 'broad_shoulder', label: '어깨가 넓은 편' },
          { value: 'strong_lower', label: '하체가 튼튼한 편' },
          { value: 'gain_weight', label: '살이 잘 찌는 편' },
          { value: 'muscular', label: '근육질 체형' },
          { value: 'slim', label: '전체적으로 마른 체형' }
        ]
      },
      {
        id: 'face_features',
        question: '얼굴형 특징을 선택해주세요',
        type: 'radio',
        options: [
          { value: 'round', label: '둥근 얼굴형' },
          { value: 'square', label: '각진 얼굴형' },
          { value: 'oval', label: '계란형 얼굴' },
          { value: 'long', label: '긴 얼굴형' }
        ]
      },
      {
        id: 'skin_type',
        question: '피부 특성을 선택해주세요',
        type: 'checkbox',
        options: [
          { value: 'dry', label: '건조한 편' },
          { value: 'oily', label: '기름기가 많음' },
          { value: 'sensitive', label: '민감한 편' },
          { value: 'thick', label: '두꺼운 편' },
          { value: 'thin', label: '얇고 연약함' },
          { value: 'normal', label: '보통' }
        ]
      }
    ]
  },
  {
    id: 'organs',
    title: '오장육부 기능',
    questions: [
      {
        id: 'heart_symptoms',
        question: '심장(심계) 관련 증상을 모두 선택해주세요',
        type: 'checkbox',
        options: [
          { value: 'palpitation', label: '가슴 두근거림' },
          { value: 'chest_pain', label: '가슴 답답함' },
          { value: 'shortness', label: '숨이 차는 느낌' },
          { value: 'insomnia', label: '잠이 안 옴' },
          { value: 'anxiety', label: '불안감' },
          { value: 'none', label: '없음' }
        ]
      },
      {
        id: 'liver_symptoms',
        question: '간(간계) 관련 증상을 모두 선택해주세요',
        type: 'checkbox',
        options: [
          { value: 'eye_strain', label: '눈의 피로감' },
          { value: 'dry_eyes', label: '눈이 자주 마름' },
          { value: 'nail_weak', label: '손톱이 약함' },
          { value: 'muscle_cramp', label: '근육 경련' },
          { value: 'irritability', label: '짜증이 자주 남' },
          { value: 'headache', label: '편두통' },
          { value: 'none', label: '없음' }
        ]
      },
      {
        id: 'spleen_symptoms',
        question: '비장(비계) 관련 증상을 모두 선택해주세요',
        type: 'checkbox',
        options: [
          { value: 'bloating', label: '소화불량, 더부룩함' },
          { value: 'loose_stool', label: '묽은 변' },
          { value: 'fatigue', label: '식후 피로감' },
          { value: 'cold_limbs', label: '손발이 차가움' },
          { value: 'appetite_loss', label: '식욕 부진' },
          { value: 'weight_gain', label: '체중 증가' },
          { value: 'none', label: '없음' }
        ]
      },
      {
        id: 'lung_symptoms',
        question: '폐(폐계) 관련 증상을 모두 선택해주세요',
        type: 'checkbox',
        options: [
          { value: 'cough', label: '기침' },
          { value: 'phlegm', label: '가래' },
          { value: 'nasal_congestion', label: '코막힘' },
          { value: 'runny_nose', label: '콧물' },
          { value: 'snoring', label: '코골이' },
          { value: 'skin_dry', label: '피부 건조' },
          { value: 'none', label: '없음' }
        ]
      },
      {
        id: 'kidney_symptoms',
        question: '신장(신계) 관련 증상을 모두 선택해주세요',
        type: 'checkbox',
        options: [
          { value: 'back_pain', label: '허리 아픔' },
          { value: 'knee_weak', label: '무릎이 약함' },
          { value: 'frequent_urination', label: '소변이 자주 마려움' },
          { value: 'night_urination', label: '야간뇨' },
          { value: 'hair_loss', label: '탈모' },
          { value: 'cold_constitution', label: '추위를 많이 탐' },
          { value: 'none', label: '없음' }
        ]
      }
    ]
  },
  {
    id: 'lifestyle',
    title: '생활 습관',
    questions: [
      {
        id: 'diet_preference',
        question: '선호하는 음식 성질은?',
        type: 'radio',
        options: [
          { value: 'hot', label: '뜨거운 음식을 선호' },
          { value: 'warm', label: '따뜻한 음식을 선호' },
          { value: 'room_temp', label: '상온 음식을 선호' },
          { value: 'cool', label: '시원한 음식을 선호' },
          { value: 'cold', label: '차가운 음식을 선호' }
        ]
      },
      {
        id: 'exercise_habit',
        question: '평소 운동 습관은?',
        type: 'radio',
        options: [
          { value: 'none', label: '거의 하지 않음' },
          { value: 'light', label: '가벼운 운동 (주 1-2회)' },
          { value: 'moderate', label: '적당한 운동 (주 3-4회)' },
          { value: 'intense', label: '격한 운동 (주 5회 이상)' }
        ]
      },
      {
        id: 'stress_level',
        question: '평소 스트레스 수준은?',
        type: 'radio',
        options: [
          { value: 'very_high', label: '매우 높음' },
          { value: 'high', label: '높은 편' },
          { value: 'moderate', label: '보통' },
          { value: 'low', label: '낮은 편' },
          { value: 'very_low', label: '매우 낮음' }
        ]
      },
      {
        id: 'sleep_pattern',
        question: '수면 패턴은 어떤가요?',
        type: 'radio',
        options: [
          { value: 'early_bird', label: '일찍 자고 일찍 일어남' },
          { value: 'normal', label: '보통 시간에 취침' },
          { value: 'night_owl', label: '늦게 자고 늦게 일어남' },
          { value: 'irregular', label: '불규칙함' }
        ]
      }
    ]
  },
  {
    id: 'detailed',
    title: '상세 정보',
    questions: [
      {
        id: 'current_symptoms',
        question: '현재 가장 신경 쓰이는 증상이나 불편함을 자세히 설명해주세요',
        type: 'textarea',
        placeholder: '예: 최근 3개월간 소화불량이 지속되고, 스트레스를 받으면 가슴이 답답해집니다...'
      },
      {
        id: 'health_goals',
        question: '한의학적 치료를 통해 얻고 싶은 효과를 구체적으로 적어주세요',
        type: 'textarea',
        placeholder: '예: 만성피로를 해결하고 싶고, 면역력을 높여서 감기에 자주 걸리지 않았으면 합니다...'
      },
      {
        id: 'family_history',
        question: '가족력이 있다면 적어주세요 (선택사항)',
        type: 'input',
        placeholder: '예: 당뇨, 고혈압, 위장질환 등'
      }
    ]
  }
];

interface HanMedicinePremiumTestProps {
  onComplete: (result: any) => void;
}

export const HanMedicinePremiumTest: React.FC<HanMedicinePremiumTestProps> = ({ onComplete }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxChange = (questionId: string, value: string, checked: boolean) => {
    setAnswers(prev => {
      const currentValues = prev[questionId] || [];
      if (checked) {
        return { ...prev, [questionId]: [...currentValues, value] };
      } else {
        return { ...prev, [questionId]: currentValues.filter((v: string) => v !== value) };
      }
    });
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      analyzeResults();
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const isCurrentSectionComplete = () => {
    const currentQuestions = sections[currentSection].questions;
    return currentQuestions.every(question => {
      const answer = answers[question.id];
      if (question.type === 'checkbox') {
        return answer && answer.length > 0;
      }
      return answer && answer.trim() !== '';
    });
  };

  const analyzeResults = async () => {
    setIsAnalyzing(true);
    try {
      const result = {
        answers,
        testType: 'han_medicine_premium',
        completedAt: new Date().toISOString(),
        sections: sections.map(section => section.id)
      };

      onComplete(result);
    } catch (error) {
      console.error('분석 중 오류:', error);
      toast({
        title: "오류 발생",
        description: "분석 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const progress = ((currentSection + 1) / sections.length) * 100;
  const currentSectionData = sections[currentSection];

  if (isAnalyzing) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Crown className="h-12 w-12 text-amber-500 mb-4" />
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p className="text-lg font-medium">한의학 전문 분석을 진행하고 있습니다...</p>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            AI가 당신의 오장육부 상태와 체질을 종합 분석하여<br />
            맞춤형 한방 치료법과 생활요법을 제공합니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center">
          <Crown className="h-6 w-6 mr-2 text-amber-500" />
          한의학 프리미엄 종합 분석
        </CardTitle>
        <CardDescription className="text-center">
          {currentSectionData.title} - 상세한 정보로 정확한 체질 분석을 받아보세요
        </CardDescription>
        <Progress value={progress} className="mt-4" />
        <p className="text-sm text-center text-muted-foreground">
          {currentSection + 1} / {sections.length} 단계
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {currentSectionData.questions.map((question) => (
          <div key={question.id} className="space-y-3">
            <h4 className="font-medium">{question.question}</h4>
            
            {question.type === 'radio' && (
              <RadioGroup
                value={answers[question.id] || ''}
                onValueChange={(value) => handleAnswer(question.id, value)}
              >
                {question.options?.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            
            {question.type === 'checkbox' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {question.options?.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={(answers[question.id] || []).includes(option.value)}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange(question.id, option.value, checked as boolean)
                      }
                    />
                    <Label htmlFor={option.value} className="cursor-pointer text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            )}
            
            {question.type === 'textarea' && (
              <Textarea
                placeholder={question.placeholder}
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                rows={4}
              />
            )}
            
            {question.type === 'input' && (
              <Input
                placeholder={question.placeholder}
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
              />
            )}
          </div>
        ))}

        <div className="flex justify-between pt-6">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentSection === 0}
          >
            이전
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={!isCurrentSectionComplete()}
          >
            {currentSection === sections.length - 1 ? '분석 시작' : '다음'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};