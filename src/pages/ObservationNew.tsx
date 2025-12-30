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
  Save
} from 'lucide-react';
import VoiceObservationRecorder from '@/components/observation/VoiceObservationRecorder';
import { motion, AnimatePresence } from 'framer-motion';

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
                onClick={() => navigate('/')}
                className="shrink-0 hover:bg-amber-100/50 text-amber-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-md">
                  <Feather className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-amber-900">새 기록</h1>
                  <p className="text-xs text-amber-600/80">오늘의 관찰</p>
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
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <VoiceObservationRecorder 
                onObservationCreated={handleVoiceObservationCreated}
              />
              
              {/* 안내 카드 */}
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
              transition={{ duration: 0.3 }}
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
                  placeholder="오늘 관찰한 아이의 행동, 감정, 특별한 순간을 자유롭게 적어주세요..."
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (e.target.value.length >= 100 && !expertAdvice && !isAnalyzing) {
                      generateExpertAdvice(e.target.value);
                    }
                  }}
                  rows={8}
                  className="resize-none bg-white/70 border-amber-200/50 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl"
                />
                <p className="text-xs text-amber-500 text-right">
                  {content.length}자 {content.length >= 100 && <span className="text-amber-600">✓ AI 분석 가능</span>}
                </p>
              </div>

              {/* AI 분석 중 */}
              <AnimatePresence>
                {isAnalyzing && (
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
                        <p className="text-sm font-medium text-amber-800">AI가 분석하고 있어요</p>
                        <p className="text-xs text-amber-600/70">잠시만 기다려주세요...</p>
                      </div>
                    </div>
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
                    className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center shrink-0 shadow-md">
                        <Lightbulb className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-emerald-800 mb-1">
                          AI 전문가 조언
                        </p>
                        <p className="text-sm text-emerald-700 leading-relaxed">
                          {expertAdvice}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 구조화된 데이터 */}
              <AnimatePresence>
                {structuredData && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-amber-200/50 space-y-4"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      <h3 className="font-semibold text-amber-900">AI 분석 결과</h3>
                    </div>

                    {structuredData.behaviors?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-amber-800 mb-2">감지된 행동</p>
                        <div className="flex flex-wrap gap-2">
                          {structuredData.behaviors.map((behavior: string, idx: number) => (
                            <Badge key={idx} className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
                              {behavior}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {structuredData.emotions?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-amber-800 mb-2">감정 상태</p>
                        <div className="flex flex-wrap gap-2">
                          {structuredData.emotions.map((emotion: string, idx: number) => (
                            <Badge key={idx} className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200">
                              {emotion}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {structuredData.recommendedTests?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-amber-800 mb-2">추천 검사</p>
                        <div className="space-y-2">
                          {structuredData.recommendedTests.map((test: string, idx: number) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              className="w-full justify-start border-amber-200 text-amber-800 hover:bg-amber-50"
                              onClick={() => navigate('/assessment')}
                            >
                              {test}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 저장 버튼 */}
              <Button
                onClick={handleSave}
                disabled={saving || !content.trim()}
                size="lg"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg rounded-xl h-14 text-base font-semibold"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    기록 저장하기
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ObservationNew;
