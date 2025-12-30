import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  BookOpen,
  Send
} from 'lucide-react';
import VoiceObservationRecorder from '@/components/observation/VoiceObservationRecorder';
import { motion, AnimatePresence } from 'framer-motion';

const ObservationNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [activeMode, setActiveMode] = useState<'voice' | 'text'>('voice');
  const [structuredData, setStructuredData] = useState<any>(null);
  
  // AI 분석 상태
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expertAdvice, setExpertAdvice] = useState('');

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
    
    // 자동으로 AI 조언 생성
    if (data.transcription) {
      generateExpertAdvice(data.transcription);
    }

    toast({
      title: "변환 완료",
      description: "내용을 확인하고 저장해주세요",
    });
  };

  const generateExpertAdvice = async (observationContent: string) => {
    if (observationContent.length < 20) return;
    
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-expert-advice', {
        body: { 
          observationContent,
          adviceType: 'summary'
        }
      });

      if (error) throw error;
      if (data?.advice) {
        setExpertAdvice(data.advice);
      }
    } catch (error) {
      console.error('Error generating advice:', error);
    } finally {
      setIsAnalyzing(false);
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
      // 저장 전 상세 조언 생성
      let detailedAdvice = '';
      if (content.length > 50) {
        const adviceResponse = await supabase.functions.invoke('generate-expert-advice', {
          body: { 
            observationContent: content,
            adviceType: 'detailed'
          }
        });
        if (!adviceResponse.error && adviceResponse.data) {
          detailedAdvice = adviceResponse.data.advice;
        }
      }

      const observationData: any = {
        user_id: user.id,
        title: title || '관찰 기록',
        content: content,
        observation_date: new Date().toISOString(),
        expert_advice: expertAdvice || null,
        detailed_advice: detailedAdvice || null,
      };

      // 구조화된 데이터 추가
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 상단 네비게이션 */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-bold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  새 관찰일지
                </h1>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/observation-list')}
            >
              <FileText className="w-4 h-4 mr-2" />
              목록
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* 입력 모드 선택 */}
        <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as 'voice' | 'text')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="voice" className="gap-2">
              <Mic className="w-4 h-4" />
              음성 녹음
            </TabsTrigger>
            <TabsTrigger value="text" className="gap-2">
              <FileText className="w-4 h-4" />
              직접 작성
            </TabsTrigger>
          </TabsList>

          {/* 음성 녹음 모드 */}
          <TabsContent value="voice" className="mt-6">
            <VoiceObservationRecorder 
              onObservationCreated={handleVoiceObservationCreated}
            />
            
            {/* 음성 모드 안내 */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 grid grid-cols-3 gap-3"
            >
              <Card className="text-center p-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Mic className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">30초만</p>
                <p className="text-sm font-medium">빠른 기록</p>
              </Card>
              <Card className="text-center p-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">AI 자동</p>
                <p className="text-sm font-medium">분석</p>
              </Card>
              <Card className="text-center p-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">전문가</p>
                <p className="text-sm font-medium">조언</p>
              </Card>
            </motion.div>
          </TabsContent>

          {/* 직접 작성 모드 */}
          <TabsContent value="text" className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">제목</label>
              <Input
                placeholder="예: 오늘 아이의 행동 관찰"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">관찰 내용</label>
              <Textarea
                placeholder="관찰한 내용을 자유롭게 작성해주세요..."
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  // 내용이 충분하면 AI 분석 트리거
                  if (e.target.value.length >= 100 && !expertAdvice && !isAnalyzing) {
                    generateExpertAdvice(e.target.value);
                  }
                }}
                rows={8}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {content.length}자
              </p>
            </div>

            {/* AI 분석 중 */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      <span className="text-sm">AI가 분석 중입니다...</span>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI 조언 */}
            <AnimatePresence>
              {expertAdvice && !isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="bg-emerald-500/5 border-emerald-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <Lightbulb className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-emerald-700 mb-1">
                            AI 조언
                          </p>
                          <p className="text-sm text-emerald-600/80">
                            {expertAdvice}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 구조화된 데이터 표시 */}
            <AnimatePresence>
              {structuredData && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        AI 분석 결과
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {structuredData.behaviors?.length > 0 && (
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

                      {structuredData.emotions?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">감정 상태</p>
                          <div className="flex flex-wrap gap-2">
                            {structuredData.emotions.map((emotion: string, idx: number) => (
                              <Badge key={idx} className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                {emotion}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {structuredData.recommendedTests?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">추천 검사</p>
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
                </motion.div>
              )}
            </AnimatePresence>

            {/* 저장 버튼 */}
            <Button
              onClick={handleSave}
              disabled={saving || !content.trim()}
              className="w-full"
              size="lg"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  관찰일지 저장
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ObservationNew;
