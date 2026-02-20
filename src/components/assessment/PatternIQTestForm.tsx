import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, Brain } from "lucide-react";
import { patternIQQuestions, patternShapes, calculatePatternIQResult, PatternIQResult } from "@/data/patternIQTestQuestions";
import { useLanguage } from "@/i18n/LanguageContext";

interface PatternIQTestFormProps {
  onComplete: (result: PatternIQResult) => void;
  onBack: () => void;
}

// SVG 패턴 렌더러
const PatternShape = ({ shape, size = 60 }: { shape: string; size?: number }) => {
  const path = patternShapes[shape as keyof typeof patternShapes];
  
  if (!path) {
    return (
      <div 
        className="bg-muted rounded flex items-center justify-center text-muted-foreground text-2xl font-bold"
        style={{ width: size, height: size }}
      >
        ?
      </div>
    );
  }
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100"
      className="text-foreground"
    >
      <path 
        d={path} 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const PatternIQTestForm = ({ onComplete, onBack }: PatternIQTestFormProps) => {
  const { isEnglish } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; answer: number; timeSpent: number; isCorrect: boolean }[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(patternIQQuestions[0].timeLimit);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isStarted, setIsStarted] = useState(false);
  
  const question = patternIQQuestions[currentQuestion];
  const progress = ((currentQuestion) / patternIQQuestions.length) * 100;
  
  // 타이머
  useEffect(() => {
    if (!isStarted) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // 시간 초과 시 자동으로 다음 문제
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
      setCurrentQuestion(prev => prev + 1);
      setTimeLeft(patternIQQuestions[currentQuestion + 1].timeLimit);
      setQuestionStartTime(Date.now());
      setSelectedAnswer(null);
    } else {
      onComplete(calculatePatternIQResult(newAnswers));
    }
  }, [currentQuestion, question, answers, onComplete]);
  
  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };
  
  const handleConfirm = () => {
    if (selectedAnswer === null) return;
    
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    const newAnswer = { 
      questionId: question.id, 
      answer: selectedAnswer, 
      timeSpent, 
      isCorrect: selectedAnswer === question.correctAnswer 
    };
    
    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);
    
    if (currentQuestion < patternIQQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
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
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center">
              <Brain className="w-12 h-12 text-primary" />
            </div>
            
            <h1 className="text-2xl font-bold mb-2">
              {isEnglish ? 'Pattern IQ Test' : '패턴 인지력 테스트'}
            </h1>
            <p className="text-muted-foreground mb-8">
              {isEnglish ? 'Measure your cognitive ability through 12 pattern questions' : '12개의 패턴 문제를 통해 당신의 인지 능력을 측정합니다'}
            </p>
            
            <Card className="p-6 mb-6 text-left">
              <h3 className="font-semibold mb-4">📋 {isEnglish ? 'Test Guide' : '테스트 안내'}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• {isEnglish ? '12 questions, about 5-10 minutes' : '총 12문제, 약 5-10분 소요'}</li>
                <li>• {isEnglish ? 'Each question has a time limit' : '각 문제마다 제한 시간이 있습니다'}</li>
                <li>• {isEnglish ? 'Faster and more accurate = higher score' : '빠르고 정확하게 풀수록 높은 점수'}</li>
                <li>• {isEnglish ? 'Select the pattern for the (?) position' : '물음표(?) 위치에 들어갈 패턴을 선택하세요'}</li>
              </ul>
            </Card>
            
            <Card className="p-6 mb-8 text-left bg-primary/5 border-primary/20">
              <h3 className="font-semibold mb-3">🧩 {isEnglish ? 'Measurement Areas' : '측정 영역'}</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>{isEnglish ? 'Logical Reasoning' : '논리적 추론'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>{isEnglish ? 'Pattern Recognition' : '패턴 인식'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>{isEnglish ? 'Spatial Perception' : '공간 지각'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span>{isEnglish ? 'Processing Speed' : '처리 속도'}</span>
                </div>
              </div>
            </Card>
            
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => { setIsStarted(true); setQuestionStartTime(Date.now()); }}
            >
              {isEnglish ? 'Start Test' : '테스트 시작하기'}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }
  
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
        
        {/* 진행률 */}
        <Progress value={progress} className="h-2 mb-6" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* 문제 카드 */}
            <Card className="p-6 mb-6">
              <div className="text-center mb-4">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {question.type === 'grid' && (isEnglish ? 'Grid Pattern' : '그리드 패턴')}
                  {question.type === 'sequence' && (isEnglish ? 'Sequence Pattern' : '수열 패턴')}
                  {question.type === 'rotation' && (isEnglish ? 'Rotation Pattern' : '회전 패턴')}
                  {question.type === 'analogy' && (isEnglish ? 'Analogy Pattern' : '유추 패턴')}
                </span>
              </div>
              
              {/* 그리드 패턴 */}
              {question.type === 'grid' && question.grid && (
                <div className="flex justify-center mb-4">
                  <div className="grid grid-cols-3 gap-2 p-4 bg-card border rounded-xl">
                    {question.grid.map((row, rowIdx) =>
                      row.map((cell, colIdx) => (
                        <div
                          key={`${rowIdx}-${colIdx}`}
                          className={`w-16 h-16 flex items-center justify-center border rounded-lg ${
                            cell === '?' ? 'border-primary border-2 bg-primary/5' : 'bg-muted/50'
                          }`}
                        >
                          {cell === '?' ? (
                            <span className="text-2xl font-bold text-primary">?</span>
                          ) : (
                            <PatternShape shape={cell} size={50} />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              
              {/* 수열/회전/유추 패턴 */}
              {(question.type === 'sequence' || question.type === 'rotation' || question.type === 'analogy') && question.sequence && (
                <div className="flex justify-center items-center gap-2 mb-4 p-4 bg-card border rounded-xl overflow-x-auto">
                  {question.sequence.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {item === ':' ? (
                        <span className="text-2xl font-bold text-muted-foreground mx-2">::</span>
                      ) : (
                        <div className={`w-14 h-14 flex items-center justify-center border rounded-lg ${
                          item === '?' ? 'border-primary border-2 bg-primary/5' : 'bg-muted/50'
                        }`}>
                          {item === '?' ? (
                            <span className="text-xl font-bold text-primary">?</span>
                          ) : (
                            <PatternShape shape={item} size={40} />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
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
                    onClick={() => handleAnswerSelect(idx)}
                    className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center bg-card ${
                      selectedAnswer === idx
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <PatternShape shape={option} size={50} />
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* 확인 버튼 */}
            <Button
              size="lg"
              className="w-full"
              onClick={handleConfirm}
              disabled={selectedAnswer === null}
            >
              {currentQuestion < patternIQQuestions.length - 1 ? (isEnglish ? 'Next Question' : '다음 문제') : (isEnglish ? 'View Results' : '결과 보기')}
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PatternIQTestForm;
