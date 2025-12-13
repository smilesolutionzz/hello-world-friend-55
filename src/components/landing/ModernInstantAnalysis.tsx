import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { VoiceInputButton } from '@/components/ui/VoiceInputButton';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Brain, 
  Loader2, 
  CheckCircle, 
  Wand2,
  ArrowRight,
  Zap,
  Shield,
  Clock
} from 'lucide-react';

const ModernInstantAnalysis = () => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleExpandPrompt = async () => {
    if (inputText.length < 10) return;

    setIsExpanding(true);
    try {
      const { data, error } = await supabase.functions.invoke('expand-prompt', {
        body: { prompt: inputText }
      });

      if (error) throw error;
      if (data?.expandedPrompt) {
        setInputText(data.expandedPrompt);
        toast({
          title: "AI 다듬기 완료",
          description: "고민이 더 상세하게 확장되었습니다.",
        });
      }
    } catch (error) {
      console.error('Expand error:', error);
    } finally {
      setIsExpanding(false);
    }
  };

  const handleAnalyze = async () => {
    if (inputText.length < 10) {
      toast({
        title: "입력 부족",
        description: "최소 10자 이상 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-concern', {
        body: { concern: inputText }
      });

      if (error) throw error;
      
      setAnalysisResult(data);
      setShowResult(true);

      if (user) {
        await supabase.from('concern_storage').insert({
          user_id: user.id,
          concern_text: inputText,
          full_analysis: data,
          analysis_type: data?.type || 'general',
          analysis_severity: data?.severity || 'low',
          analysis_advice: data?.advice || ''
        });
      }

      toast({
        title: "분석 완료!",
        description: "AI 분석 결과가 준비되었습니다.",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "분석 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setInputText('');
    setShowResult(false);
    setAnalysisResult(null);
  };

  const features = [
    { icon: Zap, label: "즉시 분석" },
    { icon: Shield, label: "완전 무료" },
    { icon: Clock, label: "30초 완료" },
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.1),transparent_50%)]" />
      
      <div className="container relative max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-5 py-2.5 mb-6 rounded-full bg-primary/10 border border-primary/20"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">AI 즉시 분석</span>
            </motion.div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              한 문장이면 충분해요
            </h2>
            <p className="text-lg text-muted-foreground">
              지금 가장 걱정되는 것을 적어주세요
            </p>
          </div>

          {/* Main Input Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            {/* Glassmorphism Card */}
            <div className="relative p-8 md:p-10 rounded-3xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-2xl shadow-primary/5">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 rounded-3xl blur-xl opacity-50 -z-10" />
              
              {!showResult ? (
                <div className="space-y-6">
                  {/* Textarea */}
                  <div className="relative group">
                    <Textarea
                      placeholder="예: 아이가 또래보다 말이 늦어서 걱정돼요..."
                      value={inputText}
                      onChange={(e) => {
                        if (e.target.value.length <= 500) {
                          setInputText(e.target.value);
                        }
                      }}
                      className="min-h-[160px] text-lg resize-none bg-background/50 border-2 border-border/50 focus:border-primary/50 rounded-2xl p-5 pr-14 transition-all duration-300 placeholder:text-muted-foreground/50"
                      maxLength={500}
                    />
                    
                    {/* Voice Input */}
                    <div className="absolute bottom-4 right-4">
                      <VoiceInputButton
                        onTranscription={(text) => {
                          const newText = inputText + (inputText ? ' ' : '') + text;
                          if (newText.length <= 500) {
                            setInputText(newText);
                          }
                        }}
                        className="bg-muted/80 hover:bg-muted border-0"
                      />
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{inputText.length}</span>
                        <span className="text-muted-foreground/70">/500</span>
                      </span>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleExpandPrompt}
                        disabled={isExpanding || inputText.length < 10}
                        className="gap-2 text-primary hover:text-primary hover:bg-primary/10 rounded-full px-4"
                      >
                        {isExpanding ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Wand2 className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">AI 다듬기</span>
                      </Button>
                    </div>

                    {/* Feature badges */}
                    <div className="hidden sm:flex items-center gap-2">
                      {features.map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-xs text-muted-foreground">
                          <f.icon className="w-3 h-3" />
                          {f.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || inputText.length < 10}
                    size="lg"
                    className="w-full h-14 text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        AI가 분석 중입니다...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5 mr-2" />
                        무료로 분석하기
                      </>
                    )}
                  </Button>

                  {/* Login hint */}
                  {!user && (
                    <p className="text-center text-sm text-muted-foreground">
                      <button 
                        onClick={() => navigate('/auth')}
                        className="text-primary hover:underline"
                      >
                        로그인
                      </button>
                      하면 결과가 자동 저장됩니다
                    </p>
                  )}
                </div>
              ) : (
                /* Result View */
                <div className="space-y-6">
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-2">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">분석 완료!</h3>
                    {analysisResult?.confidence && (
                      <p className="text-muted-foreground">
                        신뢰도 <span className="font-semibold text-primary">{analysisResult.confidence}%</span>
                      </p>
                    )}
                  </div>

                  {/* Analysis Content */}
                  <div className="space-y-4">
                    {analysisResult?.type && (
                      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                        <p className="text-xs font-medium text-primary mb-1">분석 유형</p>
                        <p className="text-foreground font-medium">{analysisResult.type}</p>
                      </div>
                    )}

                    {analysisResult?.advice && (
                      <div className="p-4 rounded-2xl bg-muted/50 border border-border/50">
                        <p className="text-xs font-medium text-muted-foreground mb-2">AI 조언</p>
                        <p className="text-foreground text-sm leading-relaxed">{analysisResult.advice}</p>
                      </div>
                    )}

                    {analysisResult?.recommendedTests?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">추천 검사</p>
                        {analysisResult.recommendedTests.map((test: any, idx: number) => (
                          <Button
                            key={idx}
                            variant="outline"
                            className="w-full justify-between rounded-xl h-12"
                            onClick={() => test.path && navigate(test.path)}
                          >
                            <span className="flex items-center gap-2">
                              <Brain className="w-4 h-4 text-primary" />
                              {test.name || test}
                            </span>
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="flex-1 rounded-xl"
                    >
                      다시 입력하기
                    </Button>
                    <Button
                      onClick={() => navigate('/assessment')}
                      className="flex-1 rounded-xl gap-2"
                    >
                      자세한 검사
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ModernInstantAnalysis;
