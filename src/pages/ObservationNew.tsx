import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  Plus, 
  Mic, 
  FileText, 
  Sparkles,
  TrendingUp,
  Calendar as CalendarIcon,
  Brain,
  Heart,
  AlertCircle,
  CheckCircle,
  Clock,
  Lightbulb
} from 'lucide-react';
import VoiceObservationRecorder from '@/components/observation/VoiceObservationRecorder';
import RealtimeAIFeedback from '@/components/observation/RealtimeAIFeedback';

const ObservationNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [observations, setObservations] = useState<any[]>([]);
  const [activeMode, setActiveMode] = useState<'voice' | 'text'>('voice');
  const [structuredData, setStructuredData] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [observationsForDate, setObservationsForDate] = useState<any[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [datesWithObservations, setDatesWithObservations] = useState<Set<string>>(new Set());
  
  // Q&A Flow state
  const [showQuestions, setShowQuestions] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [expertAdviceSummary, setExpertAdviceSummary] = useState('');
  const [showDetailedAdvice, setShowDetailedAdvice] = useState(false);
  const [detailedAdvice, setDetailedAdvice] = useState('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  useEffect(() => {
    checkAuth();
    loadObservations();
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

  const loadObservations = async () => {
    try {
      const { data, error } = await supabase
        .from('observations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setObservations(data || []);
      
      // Load all observation dates for calendar highlighting
      const { data: allObs } = await supabase
        .from('observations')
        .select('observation_date')
        .eq('user_id', user?.id);
      
      if (allObs) {
        const dates = new Set(
          allObs.map(obs => new Date(obs.observation_date).toDateString())
        );
        setDatesWithObservations(dates);
      }
    } catch (error) {
      console.error('Error loading observations:', error);
    }
  };

  const loadObservationsForDate = async (date: Date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('observations')
        .select('*')
        .gte('observation_date', `${dateStr}T00:00:00`)
        .lt('observation_date', `${dateStr}T23:59:59`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setObservationsForDate(data || []);
    } catch (error) {
      console.error('Error loading observations for date:', error);
      setObservationsForDate([]);
    }
  };

  const handleVoiceObservationCreated = (data: any) => {
    setTitle(data.structured.title || '');
    setContent(data.transcription || '');
    setStructuredData(data.structured);
    setActiveMode('text');

    toast({
      title: "✨ AI 분석 완료",
      description: "내용을 확인하고 수정하신 후 저장해주세요",
    });
  };

  const generateQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-observation-questions', {
        body: { 
          observationContent: content,
          previousAnswers: answers
        }
      });

      if (error) throw error;

      setQuestions(data.questions || []);
      setCurrentQuestionIndex(0);
      setShowQuestions(true);

      // Generate summary advice
      const adviceResponse = await supabase.functions.invoke('generate-expert-advice', {
        body: { 
          observationContent: content,
          answers: answers,
          adviceType: 'summary'
        }
      });

      if (!adviceResponse.error && adviceResponse.data) {
        setExpertAdviceSummary(adviceResponse.data.advice);
      }

    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "질문 생성 실패",
        description: "질문을 생성하는 중 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleAnswerSubmit = () => {
    if (!currentAnswer.trim()) {
      toast({
        title: "답변 입력",
        description: "답변을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    const newAnswers = [...answers, {
      question: questions[currentQuestionIndex].question,
      answer: currentAnswer,
      category: questions[currentQuestionIndex].category
    }];
    setAnswers(newAnswers);

    // Update content with answer
    const updatedContent = `${content}\n\nQ: ${questions[currentQuestionIndex].question}\nA: ${currentAnswer}`;
    setContent(updatedContent);
    setCurrentAnswer('');

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowQuestions(false);
      toast({
        title: "질문 완료",
        description: "모든 질문에 답변하셨습니다. 이제 일지를 확정하세요",
      });
    }
  };

  const handleSkipQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowQuestions(false);
    }
  };

  const handleFinalizeObservation = async () => {
    setSaving(true);
    setLoadingAdvice(true);

    try {
      // Generate detailed advice
      const adviceResponse = await supabase.functions.invoke('generate-expert-advice', {
        body: { 
          observationContent: content,
          answers: answers,
          adviceType: 'detailed'
        }
      });

      if (!adviceResponse.error && adviceResponse.data) {
        setDetailedAdvice(adviceResponse.data.advice);
      }

      const observationData: any = {
        user_id: user.id,
        title: title || '관찰 기록',
        content: content,
        observation_date: new Date().toISOString(),
        expert_advice: expertAdviceSummary,
        detailed_advice: adviceResponse.data?.advice
      };

      // Add structured data if available
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
        title: "✅ 저장 완료",
        description: "관찰일지가 성공적으로 저장되었습니다",
      });

      // Navigate to observation list
      setTimeout(() => {
        navigate('/observation-list');
      }, 1000);
    } catch (error) {
      console.error('Error saving observation:', error);
      toast({
        title: "저장 실패",
        description: "관찰일지 저장 중 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      setLoadingAdvice(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '오늘';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '어제';
    } else {
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  AI 스마트 관찰일지
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  음성과 AI로 더 쉽고 정확하게 기록하세요
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/observation-list')}
            >
              <FileText className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">목록 보기</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recording Mode Toggle */}
            <Card>
              <CardContent className="p-6">
                <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as 'voice' | 'text')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="voice" className="flex items-center gap-2">
                      <Mic className="w-4 h-4" />
                      음성 녹음
                    </TabsTrigger>
                    <TabsTrigger value="text" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      직접 작성
                    </TabsTrigger>
                  </TabsList>

                  {/* Voice Recording Mode */}
                  <TabsContent value="voice" className="space-y-4 mt-6">
                    <VoiceObservationRecorder 
                      onObservationCreated={handleVoiceObservationCreated}
                    />
                    
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <Card className="p-4 text-center">
                        <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">평균 30초</p>
                        <p className="font-semibold">빠른 기록</p>
                      </Card>
                      <Card className="p-4 text-center">
                        <Brain className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">AI 자동 분석</p>
                        <p className="font-semibold">즉시 인사이트</p>
                      </Card>
                      <Card className="p-4 text-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">구조화된 데이터</p>
                        <p className="font-semibold">정확한 추적</p>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Text Writing Mode */}
                  <TabsContent value="text" className="space-y-4 mt-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          제목
                        </label>
                        <Input
                          placeholder="예: 오늘 아이의 행동 관찰"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          관찰 내용
                        </label>
                        <Textarea
                          placeholder="관찰한 내용을 자유롭게 작성해주세요. AI가 실시간으로 분석하고 추가 질문을 제안합니다."
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          rows={8}
                          className="resize-none"
                        />
                      </div>

                      {/* Real-time AI Feedback */}
                      {content.trim().length > 20 && !showQuestions && (
                        <RealtimeAIFeedback 
                          observationText={content}
                          context={title}
                        />
                      )}

                      {/* Expert Advice Summary */}
                      {expertAdviceSummary && !showQuestions && (
                        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Lightbulb className="w-5 h-5 text-emerald-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-emerald-900 mb-1">
                                  전문가 한줄 조언
                                </p>
                                <p className="text-sm text-emerald-800">
                                  {expertAdviceSummary}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Q&A Flow */}
                      {showQuestions && questions.length > 0 && (
                        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between text-lg">
                              <span className="flex items-center gap-2">
                                <Brain className="w-5 h-5 text-blue-600" />
                                추가 질문 ({currentQuestionIndex + 1}/{questions.length})
                              </span>
                              <Badge variant="secondary">
                                {questions[currentQuestionIndex].category}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border border-blue-200">
                              <p className="text-sm font-medium text-blue-900">
                                {questions[currentQuestionIndex].question}
                              </p>
                            </div>

                            <Textarea
                              placeholder="답변을 입력하세요..."
                              value={currentAnswer}
                              onChange={(e) => setCurrentAnswer(e.target.value)}
                              rows={3}
                              className="resize-none"
                            />

                            <div className="flex gap-2">
                              <Button
                                onClick={handleAnswerSubmit}
                                className="flex-1"
                              >
                                답변 추가
                              </Button>
                              <Button
                                onClick={handleSkipQuestion}
                                variant="outline"
                              >
                                건너뛰기
                              </Button>
                            </div>

                            {answers.length > 0 && (
                              <div className="pt-4 border-t">
                                <p className="text-xs text-muted-foreground mb-2">
                                  답변한 질문: {answers.length}개
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {answers.map((_, idx) => (
                                    <div key={idx} className="w-2 h-2 bg-blue-500 rounded-full" />
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Structured Data Display */}
                      {structuredData && !showQuestions && (
                        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <Sparkles className="w-5 h-5 text-purple-600" />
                              AI 분석 결과
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {structuredData.behaviors && structuredData.behaviors.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">감지된 행동</p>
                                <div className="flex flex-wrap gap-2">
                                  {structuredData.behaviors.map((behavior: string, idx: number) => (
                                    <Badge key={idx} variant="secondary">
                                      {behavior}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {structuredData.emotions && structuredData.emotions.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">감정 상태</p>
                                <div className="flex flex-wrap gap-2">
                                  {structuredData.emotions.map((emotion: string, idx: number) => (
                                    <Badge key={idx} className="bg-blue-100 text-blue-700">
                                      {emotion}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {structuredData.recommendedTests && structuredData.recommendedTests.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                  <Lightbulb className="w-4 h-4" />
                                  추천 심리검사
                                </p>
                                <div className="space-y-2">
                                  {structuredData.recommendedTests.map((test: string, idx: number) => (
                                    <Button
                                      key={idx}
                                      variant="outline"
                                      size="sm"
                                      className="w-full justify-start"
                                      onClick={() => navigate('/assessment')}
                                    >
                                      {test}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        {!showQuestions && !expertAdviceSummary && content.trim().length > 50 && (
                          <Button
                            onClick={generateQuestions}
                            disabled={loadingQuestions}
                            variant="outline"
                            className="w-full"
                            size="lg"
                          >
                            {loadingQuestions ? (
                              <>
                                <Brain className="w-4 h-4 mr-2 animate-pulse" />
                                AI 질문 생성 중...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                AI 추가 질문 받기
                              </>
                            )}
                          </Button>
                        )}

                        {expertAdviceSummary && !showQuestions && (
                          <Button
                            onClick={handleFinalizeObservation}
                            disabled={saving || loadingAdvice}
                            className="w-full"
                            size="lg"
                          >
                            {saving ? (
                              <>저장 중...</>
                            ) : loadingAdvice ? (
                              <>전문가 조언 생성 중...</>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                최종 일지 확정 및 상세 조언 받기
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Calendar & Recent Observations */}
          <div className="space-y-6">
            {/* Calendar View */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  달력으로 보기
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      loadObservationsForDate(date);
                      setShowCalendar(true);
                    }
                  }}
                  className="rounded-md border"
                  modifiers={{
                    hasObservation: (date) => 
                      datesWithObservations.has(date.toDateString())
                  }}
                  modifiersStyles={{
                    hasObservation: {
                      fontWeight: 'bold',
                      textDecoration: 'underline',
                      color: 'hsl(var(--primary))'
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  밑줄 표시된 날짜는 기록이 있습니다
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  최근 관찰 기록
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {observations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">아직 관찰 기록이 없습니다</p>
                  </div>
                ) : (
                  observations.map((obs) => (
                    <Card 
                      key={obs.id} 
                      className="p-3 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setTitle(obs.title);
                        setContent(obs.content);
                        setActiveMode('text');
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {obs.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {obs.content}
                          </p>
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          {formatDate(obs.created_at)}
                        </Badge>
                      </div>
                      
                      {obs.severity && (
                        <div className="mt-2">
                          <Badge 
                            variant={
                              obs.severity === 'high' ? 'destructive' : 
                              obs.severity === 'medium' ? 'default' : 
                              'secondary'
                            }
                            className="text-xs"
                          >
                            {obs.severity === 'high' && '주의 필요'}
                            {obs.severity === 'medium' && '관찰 중'}
                            {obs.severity === 'low' && '안정'}
                          </Badge>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-gradient-to-br from-primary/10 to-purple-100">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  이번 주 통계
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">총 기록</span>
                  <span className="text-2xl font-bold text-primary">
                    {observations.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">연속 기록</span>
                  <span className="text-lg font-semibold">3일</span>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-purple-600"
                    style={{ width: '60%' }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  목표까지 40%
                </p>
              </CardContent>
            </Card>

            {/* AI Tips */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                  AI 활용 팁
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    구체적인 상황과 행동을 설명하면 더 정확한 분석을 받을 수 있습니다
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-600">2</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    음성 녹음은 30초 이상 말씀하시면 더 풍부한 분석 결과를 제공합니다
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-green-600">3</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    매일 꾸준히 기록하면 패턴 분석으로 더 나은 인사이트를 얻을 수 있습니다
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Date Observations Dialog */}
      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {selectedDate?.toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} 관찰 기록
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh] pr-4">
            {observationsForDate.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground">
                  이 날짜에 기록된 관찰일지가 없습니다
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {observationsForDate.map((obs) => (
                  <Card key={obs.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-semibold text-lg">{obs.title}</h3>
                        {obs.severity && (
                          <Badge 
                            variant={
                              obs.severity === 'high' ? 'destructive' : 
                              obs.severity === 'medium' ? 'default' : 
                              'secondary'
                            }
                          >
                            {obs.severity === 'high' && '주의 필요'}
                            {obs.severity === 'medium' && '관찰 중'}
                            {obs.severity === 'low' && '안정'}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {obs.content}
                      </p>

                      {obs.behaviors && obs.behaviors.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-1.5">감지된 행동</p>
                          <div className="flex flex-wrap gap-1.5">
                            {obs.behaviors.map((behavior: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {behavior}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {obs.emotions && obs.emotions.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-1.5">감정 상태</p>
                          <div className="flex flex-wrap gap-1.5">
                            {obs.emotions.map((emotion: string, idx: number) => (
                              <Badge key={idx} className="bg-blue-100 text-blue-700 text-xs">
                                {emotion}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {obs.recommended_tests && obs.recommended_tests.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-1.5 flex items-center gap-1">
                            <Lightbulb className="w-3 h-3" />
                            추천 심리검사
                          </p>
                          <div className="space-y-1">
                            {obs.recommended_tests.map((test: string, idx: number) => (
                              <p key={idx} className="text-xs text-muted-foreground">
                                • {test}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground pt-2 border-t">
                        {new Date(obs.created_at).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} 기록
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Detailed Expert Advice Dialog */}
      <Dialog open={showDetailedAdvice} onOpenChange={setShowDetailedAdvice}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-amber-500" />
              전문가 상세 조언
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="p-6">
                  <div className="prose prose-sm max-w-none">
                    {detailedAdvice.split('\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-3 text-sm text-gray-800 whitespace-pre-wrap">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowDetailedAdvice(false)}
                  variant="outline"
                  className="flex-1"
                >
                  닫기
                </Button>
                <Button
                  onClick={() => {
                    setShowDetailedAdvice(false);
                    setActiveMode('voice');
                  }}
                  className="flex-1"
                >
                  새 관찰일지 작성하기
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ObservationNew;
