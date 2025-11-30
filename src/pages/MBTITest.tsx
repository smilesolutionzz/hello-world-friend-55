import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Sparkles, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MBTIQuestions } from "@/components/mbti/MBTIQuestions";
import { MBTIResult } from "@/components/mbti/MBTIResult";
import { calculateMBTI } from "@/components/mbti/mbtiCalculator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MBTITest = () => {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [mbtiType, setMbtiType] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");

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
    setMbtiType(type);

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
  };

  if (showResult) {
    return (
      <MBTIResult 
        mbtiType={mbtiType} 
        aiAnalysis={aiAnalysis}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 p-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로가기
          </Button>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>질문 {currentQuestion + 1} / {questions.length}</span>
              <span>{Math.round(progress)}% 완료</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 md:p-8 backdrop-blur-xl bg-card/50 border-2">
              <div className="mb-8">
                <div className="inline-block px-3 py-1 bg-primary/20 rounded-full text-sm text-primary font-medium mb-4">
                  {currentQ.category}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  {currentQ.question}
                </h2>
                {currentQ.context && (
                  <p className="text-muted-foreground">
                    {currentQ.context}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(option.score)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-4 md:p-5 rounded-xl border-2 text-left transition-all ${
                      answers[currentQuestion] === option.score
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {answers[currentQuestion] === option.score && (
                          <div className="w-3 h-3 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium mb-1">{option.text}</p>
                        {option.description && (
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex gap-3 mt-6">
                {currentQuestion > 0 && (
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    이전
                  </Button>
                )}
                {answers[currentQuestion] !== undefined && currentQuestion < questions.length - 1 && (
                  <Button
                    onClick={() => setCurrentQuestion(currentQuestion + 1)}
                    className="flex-1"
                  >
                    다음
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MBTITest;
