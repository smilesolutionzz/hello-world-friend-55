import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  FileText,
  TrendingUp,
  Users,
  Heart
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
    if (inputText.length < 10) {
      toast({
        title: "입력 부족",
        description: "최소 10자 이상 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

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
      toast({
        title: "다듬기 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
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

      // 로그인 사용자는 저장
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

  const reportItems = [
    { icon: Brain, title: "발달 종합 평가", desc: "인지, 언어, 운동, 사회성" },
    { icon: Heart, title: "심리 상태 분석", desc: "정서적 안정성 평가" },
    { icon: TrendingUp, title: "맞춤형 솔루션", desc: "AI 기반 개선 방향" },
    { icon: Users, title: "전문가 연계", desc: "필요시 상담 추천" },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI 즉시 분석</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            한 문장으로 시작하는
            <span className="block text-primary mt-2">AI 맞춤 분석</span>
          </h2>
          
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            고민을 입력하면 AI가 즉시 분석하고 맞춤 솔루션을 제안합니다
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Input Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Brain className="w-5 h-5 text-primary" />
                  고민 입력
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Login prompt for non-users */}
                {!user && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-2">
                      로그인하면 분석 결과가 자동 저장됩니다
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/auth')}
                      className="gap-2"
                    >
                      로그인하기 <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {!showResult ? (
                  <>
                    <div className="relative">
                      <Textarea
                        placeholder="지금 가장 걱정되는 한 문장을 적어주세요...&#10;&#10;예: 아이가 또래보다 말이 늦어요&#10;예: 최근 불안하고 잠을 잘 못 자요"
                        value={inputText}
                        onChange={(e) => {
                          if (e.target.value.length <= 500) {
                            setInputText(e.target.value);
                          }
                        }}
                        className="min-h-[200px] resize-none bg-background/80 border-border focus:border-primary/50 rounded-xl text-base"
                        maxLength={500}
                      />
                      
                      <div className="absolute bottom-3 right-3">
                        <VoiceInputButton
                          onTranscription={(text) => {
                            const newText = inputText + (inputText ? ' ' : '') + text;
                            if (newText.length <= 500) {
                              setInputText(newText);
                            }
                          }}
                          className="bg-background/80 backdrop-blur-sm"
                        />
                      </div>
                    </div>

                    {/* Character count and AI expand */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {inputText.length}/500 (최소 10자)
                      </span>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleExpandPrompt}
                        disabled={isExpanding || inputText.length < 10}
                        className="gap-2 text-primary hover:text-primary hover:bg-primary/10"
                      >
                        {isExpanding ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Wand2 className="w-4 h-4" />
                        )}
                        AI 다듬기
                      </Button>
                    </div>

                    {/* Analyze Button */}
                    <Button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || inputText.length < 10}
                      size="lg"
                      className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          분석 중...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          무료로 분석하기
                        </>
                      )}
                    </Button>
                    
                    <p className="text-center text-sm text-muted-foreground">
                      완전 무료 · 30초 완료
                    </p>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {inputText}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="w-full"
                    >
                      새로운 고민 입력하기
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: Result Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="w-5 h-5 text-primary" />
                  분석 결과
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!showResult ? (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center space-y-4 py-8">
                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                      <Brain className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        분석 결과가 여기 표시됩니다
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        왼쪽에 고민을 입력하고<br />
                        "무료로 분석하기" 버튼을 눌러주세요
                      </p>
                    </div>
                    
                    {/* Report Preview */}
                    <div className="w-full mt-6 pt-6 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-4">제공되는 분석 항목</p>
                      <div className="grid grid-cols-2 gap-3">
                        {reportItems.map((item, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/30"
                          >
                            <item.icon className="w-4 h-4 text-primary/70" />
                            <div className="text-left">
                              <p className="text-xs font-medium text-foreground">{item.title}</p>
                              <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Success Header */}
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-6 h-6" />
                        <span className="text-lg font-semibold">분석 완료!</span>
                      </div>
                      {analysisResult?.confidence && (
                        <p className="text-sm text-muted-foreground">
                          신뢰도 <span className="font-semibold text-primary">{analysisResult.confidence}%</span>
                        </p>
                      )}
                    </div>

                    {/* Analysis Type */}
                    {analysisResult?.type && (
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                        <p className="text-sm font-medium text-primary mb-1">분석 유형</p>
                        <p className="text-foreground">{analysisResult.type}</p>
                      </div>
                    )}

                    {/* Severity */}
                    {analysisResult?.severity && (
                      <div className="p-4 rounded-xl bg-muted/50 border border-border">
                        <p className="text-sm font-medium text-muted-foreground mb-1">심각도</p>
                        <p className="text-foreground capitalize">{analysisResult.severity}</p>
                      </div>
                    )}

                    {/* Advice */}
                    {analysisResult?.advice && (
                      <div className="p-4 rounded-xl bg-muted/50 border border-border">
                        <p className="text-sm font-medium text-muted-foreground mb-2">AI 조언</p>
                        <p className="text-foreground text-sm leading-relaxed">
                          {analysisResult.advice}
                        </p>
                      </div>
                    )}

                    {/* Recommended Tests */}
                    {analysisResult?.recommendedTests?.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-foreground">추천 검사</p>
                        <div className="grid gap-2">
                          {analysisResult.recommendedTests.map((test: any, idx: number) => (
                            <Button
                              key={idx}
                              variant="outline"
                              className="justify-start gap-2 h-auto py-3"
                              onClick={() => test.path && navigate(test.path)}
                            >
                              <Brain className="w-4 h-4 text-primary" />
                              <span>{test.name || test}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <Button
                      onClick={() => navigate('/assessment')}
                      className="w-full gap-2"
                    >
                      더 자세한 검사 받기
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ModernInstantAnalysis;
