import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  Mic, 
  FileText, 
  Sparkles,
  Brain,
  CheckCircle,
  Loader2,
  Lightbulb,
  Feather,
  List,
  Save,
  MessageCircle,
  ChevronRight,
  Send,
  FileBarChart
} from 'lucide-react';
import VoiceObservationRecorder from '@/components/observation/VoiceObservationRecorder';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface Question {
  question: string;
  category: string;
}

interface QAItem {
  question: string;
  answer: string;
}

const ObservationNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [activeMode, setActiveMode] = useState<'voice' | 'text'>('voice');
  const [structuredData, setStructuredData] = useState<any>(null);
  
  // Q&A 플로우 상태
  const [step, setStep] = useState<'input' | 'questions' | 'report'>('input');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [qaHistory, setQaHistory] = useState<QAItem[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  const [expertAdvice, setExpertAdvice] = useState('');
  const [detailedReport, setDetailedReport] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "관찰일지를 사용하려면 로그인이 필요합니다",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    setUser(user);
    setLoading(false);
  };

  const handleVoiceObservationCreated = (data: any) => {
    setTitle(data.structured?.title || '음성 관찰 기록');
    setContent(data.transcription || '');
    setStructuredData(data.structured);
    setActiveMode('text');
    
    if (data.transcription) {
      startQAFlow(data.transcription);
    }

    toast({
      title: "변환 완료",
      description: "추가 질문에 답변해주세요",
    });
  };

  const startQAFlow = async (observationContent: string) => {
    if (observationContent.length < 20) {
      toast({
        title: "내용이 너무 짧아요",
        description: "좀 더 자세히 작성해주세요 (최소 20자)",
        variant: "destructive",
      });
      return;
    }
    
    setIsGeneratingQuestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-observation-questions', {
        body: { 
          observationContent,
          previousAnswers: qaHistory
        }
      });

      if (error) throw error;
      
      if (data?.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setStep('questions');
        setCurrentQuestionIndex(0);
        setCurrentAnswer('');
      } else {
        // 질문 생성 실패 시 바로 리포트 생성
        generateDetailedReport(observationContent, []);
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "질문 생성 실패",
        description: "다시 시도해주세요",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleAnswerSubmit = () => {
    if (!currentAnswer.trim()) {
      toast({
        title: "답변을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    const newQA: QAItem = {
      question: questions[currentQuestionIndex].question,
      answer: currentAnswer.trim()
    };
    
    const updatedHistory = [...qaHistory, newQA];
    setQaHistory(updatedHistory);
    setCurrentAnswer('');

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // 모든 질문 완료 - 리포트 생성
      generateDetailedReport(content, updatedHistory);
    }
  };

  const generateDetailedReport = async (observationContent: string, qaData: QAItem[]) => {
    setStep('report');
    setIsGeneratingReport(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-expert-advice', {
        body: { 
          observationContent,
          qaHistory: qaData,
          adviceType: 'detailed'
        }
      });

      if (error) throw error;
      
      if (data?.advice) {
        setDetailedReport(data.advice);
        setExpertAdvice(data.advice);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "리포트 생성 실패",
        description: "저장은 가능합니다",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast({
        title: "내용을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const observationData: any = {
        user_id: user.id,
        title: title || '관찰 기록',
        content: content,
        observation_date: new Date().toISOString(),
        expert_advice: expertAdvice || null,
        detailed_advice: detailedReport || null,
        qa_history: qaHistory.length > 0 ? qaHistory : null,
      };

      if (structuredData) {
        observationData.behaviors = structuredData.behaviors;
        observationData.emotions = structuredData.emotions;
        observationData.concerns = structuredData.concerns;
        observationData.severity = structuredData.severity;
        observationData.ai_suggestions = structuredData.suggestedQuestions;
        observationData.recommended_tests = structuredData.recommendedTests;
      }

      const { error } = await supabase
        .from('observations')
        .insert([observationData]);

      if (error) throw error;

      toast({
        title: "저장 완료",
        description: "관찰일지가 저장되었습니다",
      });

      navigate('/observation-list');
    } catch (error) {
      console.error('Error saving observation:', error);
      toast({
        title: "저장 실패",
        description: "관찰일지 저장 중 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '상황': return '📍';
      case '행동': return '🎯';
      case '감정': return '💭';
      case '빈도': return '📊';
      case '맥락': return '🔍';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/80 via-orange-50/50 to-background flex items-center justify-center">
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto shadow-lg">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          </div>
          <p className="text-amber-700 font-medium">로딩 중...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/80 via-orange-50/50 to-background">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-gradient-to-b from-amber-50/95 to-amber-50/80 backdrop-blur-md border-b border-amber-200/50">
        <div className="container mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (step !== 'input') {
                    setStep('input');
                    setQuestions([]);
                    setQaHistory([]);
                    setCurrentQuestionIndex(0);
                  } else {
                    navigate('/');
                  }
                }}
                className="shrink-0 hover:bg-amber-100/50 text-amber-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-md">
                  <Feather className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-amber-900">
                    {step === 'input' ? '새 기록' : step === 'questions' ? '추가 질문' : '분석 리포트'}
                  </h1>
                  <p className="text-xs text-amber-600/80">
                    {step === 'input' ? '오늘의 관찰' : step === 'questions' ? `${currentQuestionIndex + 1}/${questions.length}` : 'AI 전문가 분석'}
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/observation-list')}
              className="text-amber-700 hover:bg-amber-100/50"
            >
              <List className="w-4 h-4 mr-2" />
              목록
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-6 space-y-6">
        <AnimatePresence mode="wait">
          {/* Step 1: 입력 단계 */}
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* 모드 선택 버튼 */}
              <div className="flex gap-2 p-1 bg-white/60 backdrop-blur-sm rounded-2xl border border-amber-200/50">
                <button
                  onClick={() => setActiveMode('voice')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                    activeMode === 'voice'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                      : 'text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                  음성으로 기록
                </button>
                <button
                  onClick={() => setActiveMode('text')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                    activeMode === 'text'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                      : 'text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  직접 작성
                </button>
              </div>

              <AnimatePresence mode="wait">
                {activeMode === 'voice' ? (
                  <motion.div
                    key="voice"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <VoiceObservationRecorder 
                      onObservationCreated={handleVoiceObservationCreated}
                    />
                    
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { icon: Mic, label: '30초 녹음', desc: '빠른 기록' },
                        { icon: Brain, label: 'AI 분석', desc: '자동 정리' },
                        { icon: Sparkles, label: '전문 조언', desc: '맞춤 가이드' },
                      ].map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * idx }}
                          className="text-center p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-amber-200/50"
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-3">
                            <item.icon className="w-6 h-6 text-amber-600" />
                          </div>
                          <p className="text-sm font-semibold text-amber-900">{item.label}</p>
                          <p className="text-xs text-amber-600/70">{item.desc}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="text"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    {/* 제목 입력 */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-amber-800">제목</label>
                      <Input
                        placeholder="예: 오늘 아이의 특별한 순간"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-white/70 border-amber-200/50 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl"
                      />
                    </div>

                    {/* 내용 입력 */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-amber-800">관찰 내용</label>
                      <Textarea
                        placeholder="오늘 관찰한 아이의 행동, 감정, 특별한 순간을 자유롭게 적어주세요... (최소 20자 이상 작성하면 AI가 추가 질문을 드려요)"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={8}
                        className="resize-none bg-white/70 border-amber-200/50 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl"
                      />
                      <p className="text-xs text-amber-500 text-right">
                        {content.length}자 
                        {content.length >= 20 && <span className="text-emerald-600 ml-2">✓ 분석 가능</span>}
                      </p>
                    </div>

                    {/* 플로우 안내 */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shrink-0 shadow-md">
                          <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-amber-800 mb-1">
                            AI 분석 프로세스
                          </p>
                          <div className="space-y-1">
                            <p className="text-xs text-amber-700 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-[10px] font-bold">1</span>
                              관찰 내용 작성
                            </p>
                            <p className="text-xs text-amber-700 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-[10px] font-bold">2</span>
                              AI 추가 질문 3개 답변
                            </p>
                            <p className="text-xs text-amber-700 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-[10px] font-bold">3</span>
                              상세 분석 리포트 확인
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 질문 생성 중 */}
                    <AnimatePresence>
                      {isGeneratingQuestions && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-4 rounded-2xl bg-amber-50 border border-amber-200/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                              <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-amber-800">AI가 질문을 준비하고 있어요</p>
                              <p className="text-xs text-amber-600/70">잠시만 기다려주세요...</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* 다음 단계 버튼 */}
                    <Button
                      onClick={() => startQAFlow(content)}
                      disabled={content.length < 20 || isGeneratingQuestions}
                      size="lg"
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg rounded-xl h-14 text-base font-semibold"
                    >
                      {isGeneratingQuestions ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          질문 생성 중...
                        </>
                      ) : (
                        <>
                          AI 분석 시작
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Step 2: 질문 단계 */}
          {step === 'questions' && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* 진행률 */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-amber-700 font-medium">질문 진행률</span>
                  <span className="text-amber-600">{currentQuestionIndex + 1} / {questions.length}</span>
                </div>
                <Progress 
                  value={((currentQuestionIndex + 1) / questions.length) * 100} 
                  className="h-2 bg-amber-100"
                />
              </div>

              {/* 현재 질문 */}
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-amber-200/50 shadow-lg"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-2xl shadow-md">
                    {getCategoryIcon(questions[currentQuestionIndex]?.category)}
                  </div>
                  <div className="flex-1">
                    <Badge className="mb-2 bg-amber-100 text-amber-800 border-amber-200">
                      {questions[currentQuestionIndex]?.category}
                    </Badge>
                    <p className="text-lg font-semibold text-amber-900 leading-relaxed">
                      {questions[currentQuestionIndex]?.question}
                    </p>
                  </div>
                </div>

                <Textarea
                  placeholder="답변을 입력해주세요..."
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  rows={4}
                  className="resize-none bg-amber-50/50 border-amber-200/50 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl"
                />
              </motion.div>

              {/* 이전 답변 히스토리 */}
              {qaHistory.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-amber-700">이전 답변</p>
                  {qaHistory.map((qa, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/50"
                    >
                      <p className="text-xs text-emerald-600 mb-1">Q: {qa.question}</p>
                      <p className="text-sm text-emerald-800">A: {qa.answer}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* 답변 제출 버튼 */}
              <Button
                onClick={handleAnswerSubmit}
                disabled={!currentAnswer.trim()}
                size="lg"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg rounded-xl h-14 text-base font-semibold"
              >
                {currentQuestionIndex < questions.length - 1 ? (
                  <>
                    다음 질문
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  <>
                    리포트 생성
                    <FileBarChart className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* Step 3: 리포트 단계 */}
          {step === 'report' && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {isGeneratingReport ? (
                <div className="py-12 text-center space-y-6">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center mx-auto shadow-xl"
                  >
                    <Brain className="w-10 h-10 text-white" />
                  </motion.div>
                  <div>
                    <p className="text-lg font-semibold text-amber-900 mb-2">
                      AI가 분석 리포트를 작성하고 있어요
                    </p>
                    <p className="text-sm text-amber-600">
                      관찰 내용과 답변을 종합하여 전문가 수준의 분석을 제공합니다
                    </p>
                  </div>
                  <div className="flex justify-center gap-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -10, 0] }}
                        transition={{ 
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                        className="w-3 h-3 rounded-full bg-amber-400"
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* 리포트 헤더 */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/50 shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center shadow-md">
                        <Sparkles className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-emerald-900">AI 전문가 분석 리포트</h2>
                        <p className="text-sm text-emerald-600">관찰 내용과 답변을 종합 분석했어요</p>
                      </div>
                    </div>
                    
                    {detailedReport && (
                      <div className="prose prose-sm max-w-none">
                        <p className="text-emerald-800 leading-relaxed whitespace-pre-wrap">
                          {detailedReport}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Q&A 요약 */}
                  {qaHistory.length > 0 && (
                    <div className="p-5 rounded-2xl bg-white/70 backdrop-blur-sm border border-amber-200/50">
                      <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        답변 요약
                      </h3>
                      <div className="space-y-3">
                        {qaHistory.map((qa, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                            <p className="text-xs text-amber-600 mb-1">Q: {qa.question}</p>
                            <p className="text-sm text-amber-800">A: {qa.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 저장 버튼 */}
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    size="lg"
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg rounded-xl h-14 text-base font-semibold"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        관찰일지 저장하기
                      </>
                    )}
                  </Button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ObservationNew;
