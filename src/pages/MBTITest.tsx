import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Sparkles, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MBTIQuestions } from "@/components/mbti/MBTIQuestions";
import { MBTIResult } from "@/components/mbti/MBTIResult";
import { calculateMBTI, calculateMBTIPercentages, MBTIPercentages } from "@/components/mbti/mbtiCalculator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAutoSaveTestResult } from "@/hooks/useAutoSaveTestResult";

const MBTITest = () => {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [mbtiType, setMbtiType] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [percentages, setPercentages] = useState<MBTIPercentages | null>(null);

  // 결과가 표시될 때 자동 저장
  useAutoSaveTestResult({
    testType: 'MBTI 검사',
    results: showResult ? {
      mbtiType,
      percentages,
      answers,
      totalQuestions: MBTIQuestions.length
    } : null,
    analysis: aiAnalysis || undefined
  });

  const questions = MBTIQuestions;
  const progress = (Object.keys(answers).length / questions.length) * 100;

  const handleAnswer = (score: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: score }));
    
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      // 모든 질문 완료
      analyzeResults();
    }
  };

  const analyzeResults = async () => {
    setIsAnalyzing(true);
    const type = calculateMBTI(answers);
    const pcts = calculateMBTIPercentages(answers);
    setMbtiType(type);
    setPercentages(pcts);

    try {
      // AI 분석 요청
      const { data, error } = await supabase.functions.invoke('mbti-analysis', {
        body: { 
          mbtiType: type,
          answers: answers 
        }
      });

      if (error) throw error;
      
      setAiAnalysis(data.analysis);
      setShowResult(true);
    } catch (error) {
      console.error('AI 분석 오류:', error);
      toast.error("분석 중 오류가 발생했습니다. 기본 결과를 표시합니다.");
      setShowResult(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
    setMbtiType("");
    setAiAnalysis("");
    setPercentages(null);
  };

  if (showResult && percentages) {
    return (
      <MBTIResult 
        mbtiType={mbtiType} 
        aiAnalysis={aiAnalysis}
        percentages={percentages}
        onRestart={handleRestart}
      />
    );
  }

  if (isAnalyzing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20">
        <Card className="p-8 max-w-md text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <Sparkles className="w-16 h-16 text-primary" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">AI가 분석 중...</h2>
          <p className="text-muted-foreground">
            당신의 성격을 깊이 있게 분석하고 있습니다
          </p>
        </Card>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full"
        >
          <Card className="p-8 md:p-12 text-center backdrop-blur-xl bg-card/50 border-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <Sparkles className="w-16 h-16 text-primary mx-auto" />
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              신박한 MBTI 테스트
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              AI가 분석하는 당신의 진짜 성격
            </p>

            <div className="space-y-4 mb-8 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">일상 속 진짜 당신을 발견</h3>
                  <p className="text-sm text-muted-foreground">
                    실제 상황에서의 선택을 통해 더 정확한 성격 분석
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">AI 심층 분석</h3>
                  <p className="text-sm text-muted-foreground">
                    최신 AI가 당신의 답변을 종합적으로 분석
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">공유하고 비교하기</h3>
                  <p className="text-sm text-muted-foreground">
                    친구들과 결과를 공유하고 비교해보세요
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 rounded-lg p-4 mb-8">
              <p className="text-sm">
                <strong>총 {questions.length}개 질문</strong> · 약 5분 소요
              </p>
            </div>

            <Button
              size="lg"
              onClick={() => setStarted(true)}
              className="w-full text-lg h-14 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              테스트 시작하기
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  // 새로운 모던 디자인 적용
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/assessment')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 -ml-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-600">
              질문 {currentQuestion + 1} / {questions.length}
            </span>
            <span className="text-sm font-medium text-slate-600">
              {Math.round(progress)}% 완료
            </span>
          </div>
          
          <Progress value={progress} className="h-2 bg-slate-200" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-white/50 p-6 md:p-8"
          >
            {/* Category Badge */}
            <div className="mb-4">
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-600">
                {currentQ.category}
              </span>
            </div>

            {/* Question Text */}
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed mb-2">
              {currentQ.question}
            </h2>
            {currentQ.context && (
              <p className="text-slate-500 mb-8">{currentQ.context}</p>
            )}
            {!currentQ.context && <div className="mb-8" />}

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleAnswer(option.score)}
                  className={`w-full text-left p-4 md:p-5 rounded-2xl border-2 transition-all duration-200 group ${
                    answers[currentQuestion] === option.score
                      ? "border-blue-500 bg-blue-50/80 shadow-md shadow-blue-100"
                      : "border-slate-200/80 bg-white/60 hover:border-blue-300 hover:bg-blue-50/30"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Radio indicator */}
                    <div className={`w-5 h-5 mt-0.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                      answers[currentQuestion] === option.score
                        ? "border-blue-500 bg-blue-500"
                        : "border-slate-300 group-hover:border-blue-400"
                    }`}>
                      {answers[currentQuestion] === option.score && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-white"
                        />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className={`font-medium text-base md:text-lg ${
                        answers[currentQuestion] === option.score ? "text-blue-700" : "text-slate-700"
                      }`}>
                        {option.text}
                      </div>
                      {option.description && (
                        <div className={`text-sm mt-1 ${
                          answers[currentQuestion] === option.score ? "text-blue-500" : "text-slate-400"
                        }`}>
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Auto Progress Indicator */}
            {answers[currentQuestion] !== undefined && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-center"
              >
                <div className="inline-flex items-center gap-2 text-sm text-blue-500">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span>잠시 후 다음 문항으로 이동합니다...</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="w-full py-6 rounded-2xl border-2 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            이전
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MBTITest;
