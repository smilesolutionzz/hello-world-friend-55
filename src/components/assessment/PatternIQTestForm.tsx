import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, Brain } from "lucide-react";
import { patternIQQuestions, calculatePatternIQResult, PatternIQResult } from "@/data/patternIQTestQuestions";
import { useLanguage } from "@/i18n/LanguageContext";

interface PatternIQTestFormProps {
  onComplete: (result: PatternIQResult) => void;
  onBack: () => void;
}

const PatternIQTestForm = ({ onComplete, onBack }: PatternIQTestFormProps) => {
  const { isEnglish } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; answer: number; timeSpent: number; isCorrect: boolean }[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(patternIQQuestions[0].timeLimit);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isStarted, setIsStarted] = useState(false);

  const question = patternIQQuestions[currentQuestion];
  const progress = (currentQuestion / patternIQQuestions.length) * 100;

  useEffect(() => {
    if (!isStarted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentQuestion, isStarted]);

  const handleTimeOut = useCallback(() => {
    const newAnswer = { questionId: question.id, answer: -1, timeSpent: question.timeLimit, isCorrect: false };
    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);
    if (currentQuestion < patternIQQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setTimeLeft(patternIQQuestions[currentQuestion + 1].timeLimit);
      setQuestionStartTime(Date.now());
      setSelectedAnswer(null);
    } else {
      onComplete(calculatePatternIQResult(newAnswers));
    }
  }, [currentQuestion, question, answers, onComplete]);

  const handleConfirm = () => {
    if (selectedAnswer === null) return;
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    const newAnswer = {
      questionId: question.id,
      answer: selectedAnswer,
      timeSpent,
      isCorrect: selectedAnswer === question.correctAnswer,
    };
    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);
    if (currentQuestion < patternIQQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setTimeLeft(patternIQQuestions[currentQuestion + 1].timeLimit);
      setQuestionStartTime(Date.now());
      setSelectedAnswer(null);
    } else {
      onComplete(calculatePatternIQResult(newAnswers));
    }
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4">
        <div className="max-w-lg mx-auto pt-8">
          <Button variant="ghost" onClick={onBack} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isEnglish ? 'Go Back' : '돌아가기'}
          </Button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center">
              <Brain className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {isEnglish ? 'Pattern IQ Test' : '패턴 인지력 테스트'}
            </h1>
            <p className="text-muted-foreground mb-8">
              {isEnglish ? '12 questions across 4 cognitive domains' : '4개 인지 영역, 12개 문제로 측정합니다'}
            </p>
            <Card className="p-6 mb-6 text-left">
              <h3 className="font-semibold mb-4">📋 {isEnglish ? 'Test Guide' : '테스트 안내'}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• {isEnglish ? '12 questions, about 5-10 minutes' : '총 12문제, 약 5-10분 소요'}</li>
                <li>• {isEnglish ? 'Each question has a time limit' : '각 문제마다 제한 시간이 있습니다'}</li>
                <li>• {isEnglish ? 'Faster correct answers = higher score' : '빠르고 정확하게 풀수록 높은 점수'}</li>
                <li>• {isEnglish ? 'Correct answers shown in results' : '결과에서 정답과 해설을 확인할 수 있습니다'}</li>
              </ul>
            </Card>
            <Card className="p-6 mb-8 text-left bg-primary/5 border-primary/20">
              <h3 className="font-semibold mb-3">🧩 {isEnglish ? 'Measurement Areas' : '측정 영역'}</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /><span>{isEnglish ? 'Logical Reasoning' : '논리적 추론'}</span></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /><span>{isEnglish ? 'Pattern Recognition' : '패턴 인식'}</span></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500" /><span>{isEnglish ? 'Spatial Perception' : '공간 지각'}</span></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500" /><span>{isEnglish ? 'Processing Speed' : '처리 속도'}</span></div>
              </div>
            </Card>
            <Button size="lg" className="w-full" onClick={() => { setIsStarted(true); setQuestionStartTime(Date.now()); }}>
              {isEnglish ? 'Start Test' : '테스트 시작하기'}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  const categoryLabel: Record<string, { ko: string; en: string }> = {
    logic: { ko: '논리적 추론', en: 'Logical Reasoning' },
    pattern: { ko: '패턴 인식', en: 'Pattern Recognition' },
    spatial: { ko: '공간 지각', en: 'Spatial Perception' },
    speed: { ko: '처리 속도', en: 'Processing Speed' },
  };

  const categoryColor: Record<string, string> = {
    logic: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    pattern: 'bg-green-500/10 text-green-700 dark:text-green-300',
    spatial: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
    speed: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="max-w-lg mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full">
            <Clock className="h-4 w-4" />
            <span className={`font-mono font-bold ${timeLeft <= 10 ? 'text-destructive' : ''}`}>
              {timeLeft}s
            </span>
          </div>
          <span className="text-sm font-medium text-primary">
            {currentQuestion + 1}/{patternIQQuestions.length}
          </span>
        </div>

        <Progress value={progress} className="h-2 mb-6" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-6 mb-6">
              {/* 영역 뱃지 */}
              <div className="text-center mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${categoryColor[question.category]}`}>
                  {isEnglish ? categoryLabel[question.category].en : categoryLabel[question.category].ko}
                  {' · '}
                  {'⭐'.repeat(question.difficulty)}
                </span>
              </div>

              {/* 문제 텍스트 */}
              <div className="text-center mb-4">
                <p className="text-lg font-semibold whitespace-pre-line leading-relaxed">
                  {isEnglish ? question.promptEn : question.prompt}
                </p>
              </div>

              {/* 그리드 시각화 (있는 경우) */}
              {question.visual && (
                <div className="flex justify-center mb-4">
                  <div className="inline-grid gap-1 p-3 bg-muted/50 rounded-xl" style={{ gridTemplateColumns: `repeat(${question.visual[0].length}, 1fr)` }}>
                    {question.visual.map((row, ri) =>
                      row.map((cell, ci) => (
                        <div
                          key={`${ri}-${ci}`}
                          className={`w-14 h-14 flex items-center justify-center rounded-lg text-lg font-bold ${
                            cell === '?'
                              ? 'border-2 border-primary bg-primary/5 text-primary'
                              : cell === ''
                                ? 'bg-transparent'
                                : 'bg-card border text-foreground'
                          }`}
                        >
                          {cell}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* 선택지 */}
            <div className="mb-6">
              <p className="text-center text-sm text-muted-foreground mb-4">
                {isEnglish ? 'Select your answer:' : '답변을 선택하세요:'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {question.options.map((option, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedAnswer(idx)}
                    className={`p-4 rounded-xl border-2 transition-all text-center font-medium bg-card ${
                      selectedAnswer === idx
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <span className="text-lg">{option}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <Button size="lg" className="w-full" onClick={handleConfirm} disabled={selectedAnswer === null}>
              {currentQuestion < patternIQQuestions.length - 1
                ? isEnglish ? 'Next Question' : '다음 문제'
                : isEnglish ? 'View Results' : '결과 보기'}
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PatternIQTestForm;
