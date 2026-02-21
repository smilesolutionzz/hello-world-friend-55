import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { motorDevelopmentQuestions, categoryInfo } from '@/data/motorDevelopmentQuestions';
import { useLanguage } from '@/i18n/LanguageContext';

interface MotorDevelopmentFormProps {
  onComplete: (results: any, answers: Record<string, number>) => void;
  onBack: () => void;
}

const categoryInfoEn: Record<string, { name: string; icon: string }> = {
  locomotor: { name: 'Locomotor', icon: '🏃' },
  object_control: { name: 'Object Control', icon: '⚽' },
  balance: { name: 'Balance', icon: '🤸' },
  coordination: { name: 'Coordination', icon: '🎯' },
  fine_motor: { name: 'Fine Motor', icon: '✍️' },
};

const optionLabelsEn: Record<number, { label: string; description: string }> = {
  3: { label: 'Very Proficient', description: 'Performs naturally and skillfully' },
  2: { label: 'Mostly Capable', description: 'Occasionally inconsistent but generally able' },
  1: { label: 'Needs Assistance', description: 'Requires help or struggles often' },
  0: { label: 'Cannot Do Yet', description: 'Not yet able to perform this skill' },
};

const MotorDevelopmentForm: React.FC<MotorDevelopmentFormProps> = ({ onComplete, onBack }) => {
  const [step, setStep] = useState<'intro' | 'birthdate' | 'test'>('intro');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');
  const { isEnglish } = useLanguage();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleDateChange = (type: 'year' | 'month' | 'day', value: string) => {
    let y = selectedYear, m = selectedMonth, d = selectedDay;
    if (type === 'year') { y = value; setSelectedYear(value); }
    if (type === 'month') { m = value; setSelectedMonth(value); }
    if (type === 'day') { d = value; setSelectedDay(value); }
    if (y && m && d) {
      setBirthDate(new Date(parseInt(y), parseInt(m) - 1, parseInt(d)));
    }
  };

  const ageInMonths = useMemo(() => {
    if (!birthDate) return 0;
    const now = new Date();
    return (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
  }, [birthDate]);

  const filteredQuestions = useMemo(() => {
    return motorDevelopmentQuestions.filter(q => ageInMonths >= q.ageRange.min && ageInMonths <= q.ageRange.max);
  }, [ageInMonths]);

  const currentQuestion = filteredQuestions[currentIndex];
  const progress = filteredQuestions.length > 0 ? ((currentIndex + 1) / filteredQuestions.length) * 100 : 0;

  const handleStartTest = () => {
    if (filteredQuestions.length === 0) {
      alert(isEnglish ? 'No suitable questions for this age range. This test is designed for children aged 3-12.' : '해당 연령대에 적합한 문항이 없습니다. 3세~12세 아동을 대상으로 합니다.');
      return;
    }
    setStep('test');
  };

  const handleAnswer = (value: number) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      calculateResults(newAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const calculateResults = (finalAnswers: Record<string, number>) => {
    const categoryScores: Record<string, { total: number; count: number; max: number }> = {
      locomotor: { total: 0, count: 0, max: 0 },
      object_control: { total: 0, count: 0, max: 0 },
      balance: { total: 0, count: 0, max: 0 },
      coordination: { total: 0, count: 0, max: 0 },
      fine_motor: { total: 0, count: 0, max: 0 },
    };

    filteredQuestions.forEach(q => {
      const score = finalAnswers[q.id] || 0;
      categoryScores[q.category].total += score;
      categoryScores[q.category].count += 1;
      categoryScores[q.category].max += 3;
    });

    const totalScore = Object.values(categoryScores).reduce((sum, cat) => sum + cat.total, 0);
    const maxScore = Object.values(categoryScores).reduce((sum, cat) => sum + cat.max, 0);
    const percentage = Math.round((totalScore / maxScore) * 100);

    const categoryPercentages: Record<string, number> = {};
    Object.entries(categoryScores).forEach(([key, val]) => {
      categoryPercentages[key] = val.count > 0 ? Math.round((val.total / val.max) * 100) : 0;
    });

    let developmentLevel: string;
    let developmentDescription: string;

    if (isEnglish) {
      if (percentage >= 85) {
        developmentLevel = 'Excellent';
        developmentDescription = 'Motor development is excellent for the age. Continue to develop strengths through various physical activities.';
      } else if (percentage >= 70) {
        developmentLevel = 'Good';
        developmentDescription = 'Motor development is good for the age. Encourage more activities in weaker areas.';
      } else if (percentage >= 50) {
        developmentLevel = 'Average';
        developmentDescription = 'Motor development is at an average level. Increase opportunities for various physical play experiences.';
      } else {
        developmentLevel = 'Needs Observation';
        developmentDescription = 'Careful observation of motor development is needed. Consider consulting a specialist.';
      }
    } else {
      if (percentage >= 85) {
        developmentLevel = '우수';
        developmentDescription = '연령 대비 운동발달이 매우 우수합니다. 다양한 신체활동을 통해 강점을 더욱 발전시켜 주세요.';
      } else if (percentage >= 70) {
        developmentLevel = '양호';
        developmentDescription = '연령 대비 운동발달이 양호합니다. 부족한 영역의 활동을 더 자주 경험하게 해주세요.';
      } else if (percentage >= 50) {
        developmentLevel = '보통';
        developmentDescription = '운동발달이 평균 수준입니다. 다양한 신체놀이 경험을 늘려주세요.';
      } else {
        developmentLevel = '관찰필요';
        developmentDescription = '운동발달에 대한 세심한 관찰이 필요합니다. 전문가 상담을 고려해 보세요.';
      }
    }

    const catInfoMap = isEnglish ? categoryInfoEn : categoryInfo;
    const sortedCategories = Object.entries(categoryPercentages).sort((a, b) => b[1] - a[1]);
    const strengths = sortedCategories.filter(([, val]) => val >= 70).map(([key]) => (catInfoMap[key as keyof typeof catInfoMap] as any).name);
    const weaknesses = sortedCategories.filter(([, val]) => val < 50).map(([key]) => (catInfoMap[key as keyof typeof catInfoMap] as any).name);

    onComplete({
      totalScore, maxScore, percentage, developmentLevel, developmentDescription,
      categoryScores: categoryPercentages, strengths, weaknesses, ageInMonths,
      questionCount: filteredQuestions.length,
    }, finalAnswers);
  };

  const catInfo = isEnglish ? categoryInfoEn : categoryInfo;

  if (step === 'intro') {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {isEnglish ? 'Go Back' : '돌아가기'}
        </Button>
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-0">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🤸</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {isEnglish ? 'AIH Motor Development Self-Check' : 'AIH 아동 운동발달 자가체크'}
            </h1>
            <p className="text-muted-foreground">
              {isEnglish ? 'Comprehensive motor skills assessment for children' : 'AIH Motor Development Self-Check'}
            </p>
          </div>
          <div className="space-y-4 mb-6">
            <div className="bg-white/60 dark:bg-black/20 rounded-lg p-4">
              <h3 className="font-semibold mb-2">📋 {isEnglish ? 'Test Guide' : '검사 안내'}</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {isEnglish ? 'Target Age: 3-12 years old' : '대상 연령: 만 3세 ~ 12세'}</li>
                <li>• {isEnglish ? 'Duration: About 5-10 minutes' : '소요 시간: 약 5-10분'}</li>
                <li>• {isEnglish ? 'Questions: 20-30 items depending on age' : '문항 수: 연령에 따라 20~30문항'}</li>
              </ul>
            </div>
            <div className="bg-white/60 dark:bg-black/20 rounded-lg p-4">
              <h3 className="font-semibold mb-2">🎯 {isEnglish ? 'Assessment Areas' : '평가 영역'}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(catInfo).map(([key, info]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span>{info.icon}</span>
                    <span>{info.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 text-sm">
              <p className="text-amber-800 dark:text-amber-200">
                ⚠️ {isEnglish ? 'This is a screening self-check. For accurate diagnosis, please consult a specialist.' : '본 검사는 선별 목적의 자가체크이며, 정확한 진단을 위해서는 전문가 상담이 필요합니다.'}
              </p>
            </div>
          </div>
          <Button onClick={() => setStep('birthdate')} className="w-full bg-green-600 hover:bg-green-700" size="lg">
            {isEnglish ? 'Start Assessment' : '검사 시작하기'}
          </Button>
        </Card>
      </div>
    );
  }

  if (step === 'birthdate') {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Button variant="ghost" onClick={() => setStep('intro')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {isEnglish ? 'Go Back' : '돌아가기'}
        </Button>
        <Card className="p-6">
          <h2 className="text-xl font-bold text-center mb-6">
            {isEnglish ? "Select your child's date of birth" : '아이의 생년월일을 선택해주세요'}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <Select value={selectedYear} onValueChange={(v) => handleDateChange('year', v)}>
              <SelectTrigger><SelectValue placeholder={isEnglish ? "Year" : "년도"} /></SelectTrigger>
              <SelectContent>
                {years.map(y => <SelectItem key={y} value={y.toString()}>{isEnglish ? y : `${y}년`}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedMonth} onValueChange={(v) => handleDateChange('month', v)}>
              <SelectTrigger><SelectValue placeholder={isEnglish ? "Month" : "월"} /></SelectTrigger>
              <SelectContent>
                {months.map(m => <SelectItem key={m} value={m.toString()}>{isEnglish ? m : `${m}월`}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedDay} onValueChange={(v) => handleDateChange('day', v)}>
              <SelectTrigger><SelectValue placeholder={isEnglish ? "Day" : "일"} /></SelectTrigger>
              <SelectContent>
                {days.map(d => <SelectItem key={d} value={d.toString()}>{isEnglish ? d : `${d}일`}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {birthDate && (
            <div className="mt-4 text-center">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {isEnglish
                  ? `Currently ${Math.floor(ageInMonths / 12)} yrs ${ageInMonths % 12} mo`
                  : `현재 ${Math.floor(ageInMonths / 12)}세 ${ageInMonths % 12}개월`}
              </Badge>
            </div>
          )}
          <Button onClick={handleStartTest} className="w-full mt-6 bg-green-600 hover:bg-green-700" size="lg" disabled={!birthDate}>
            {isEnglish ? 'Start Test' : '검사 시작'}
          </Button>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className="p-6 text-center">{isEnglish ? 'Loading questions...' : '질문을 불러오는 중...'}</div>;
  }

  const categoryInfoData = catInfo[currentQuestion.category as keyof typeof catInfo];

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        {isEnglish ? 'End Test' : '검사 종료'}
      </Button>
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>{isEnglish ? 'Progress' : '진행률'}</span>
          <span>{currentIndex + 1} / {filteredQuestions.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={currentQuestion.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className="text-sm">
                {categoryInfoData?.icon} {categoryInfoData?.name}
              </Badge>
            </div>
            <h2 className="text-xl font-semibold mb-2">{currentQuestion.text}</h2>
            {currentQuestion.description && (
              <p className="text-muted-foreground text-sm mb-6">{currentQuestion.description}</p>
            )}
            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = answers[currentQuestion.id] === option.value;
                const enOpt = isEnglish ? optionLabelsEn[option.value] : null;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected ? 'border-green-500 bg-green-50 dark:bg-green-950/30' : 'border-border hover:border-green-300 hover:bg-green-50/50 dark:hover:bg-green-950/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-green-500 bg-green-500' : 'border-muted-foreground'}`}>
                        {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <div className="font-medium">{enOpt ? enOpt.label : option.label}</div>
                        <div className="text-sm text-muted-foreground">{enOpt ? enOpt.description : option.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {isEnglish ? 'Previous' : '이전'}
              </Button>
              <Button variant="outline" onClick={() => { if (currentIndex < filteredQuestions.length - 1) setCurrentIndex(prev => prev + 1); }} disabled={!answers[currentQuestion.id] || currentIndex === filteredQuestions.length - 1}>
                {isEnglish ? 'Next' : '다음'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MotorDevelopmentForm;
