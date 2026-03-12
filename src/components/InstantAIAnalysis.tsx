import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { VoiceInputButton } from '@/components/ui/VoiceInputButton';
import { ThinkingLoader, ThinkingDots } from '@/components/ui/thinking-loader';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/i18n/useTranslation';
import { useLanguage } from '@/i18n/LanguageContext';
import { 
  Sparkles, 
  ArrowRight, 
  Brain, 
  Loader2, 
  CheckCircle, 
  Target,
  Heart,
  Clock,
  Zap,
  Wand2,
  Save,
  Mail,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Lightbulb,
  Mic
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedResultView } from '@/components/instant-analysis/EnhancedResultView';

const InstantAIAnalysis = () => {
  const { t } = useTranslation();
  const { isEnglish } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [reportImages, setReportImages] = useState<string[]>([]);
  const [tableOfContents, setTableOfContents] = useState<Array<{index: number, title: string}> | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isAdviceExpanded, setIsAdviceExpanded] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(30);
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

  const callAIAnalysis = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('instant-ai-analysis', {
        body: { inputText: text }
      });

      if (error) {
        console.warn('Edge function error, using fallback:', error);
        return { analysis: mockAnalysis(text), reportImages: [], tableOfContents: null };
      }

      if (data && data.analysis) {
        return { 
          analysis: data.analysis, 
          reportImages: data.reportImages || [],
          tableOfContents: data.tableOfContents || null
        };
      } else {
        console.warn('No analysis data received, using fallback');
        return { analysis: mockAnalysis(text), reportImages: [], tableOfContents: null };
      }
    } catch (error) {
      console.warn('AI Analysis error, using fallback:', error);
      return { analysis: mockAnalysis(text), reportImages: [], tableOfContents: null };
    }
  };

  const mockAnalysis = (text: string) => {
    const highSeverityKeywords = [
      '죽고싶', '자살', '자해', '극심', '심각', '위급', '위험', '견딜 수 없',
      '못 견디', '한계', '폭력', '학대',
      'suicide', 'self-harm', 'kill myself', 'can\'t take it', 'abuse', 'violence'
    ];
    
    const mediumSeverityKeywords = [
      '우울', '불안', '공황', '스트레스', '화', '분노', '걱정', '고민',
      '힘들', '지쳐', '아프', '외로', '슬프', '무기력', '짜증', '피곤',
      '싸움', '갈등', '문제', '어려움',
      'depressed', 'anxious', 'panic', 'stress', 'angry', 'worried', 'lonely', 'tired', 'conflict'
    ];

    const typeKeywords = {
      [isEnglish ? 'Depression' : '우울감']: ['우울', '무기력', '의욕 없', '슬프', '외로', 'depressed', 'hopeless', 'sad'],
      [isEnglish ? 'Anxiety' : '불안감']: ['불안', '걱정', '초조', '공황', '두려', '무서', 'anxious', 'panic', 'fear'],
      [isEnglish ? 'Developmental Delay' : '발달지연']: ['말 안', '걷지 못', '발달', '늦', '또래보다', '개월', '언어', '운동', 'speech', 'delay', 'milestone'],
      [isEnglish ? 'Parenting Stress' : '육아스트레스']: ['아이', '육아', '엄마', '아빠', '키우', '양육', 'parenting', 'child', 'burnout'],
      [isEnglish ? 'Academic Stress' : '학업스트레스']: ['공부', '시험', '성적', '학교', '학원', '입시', 'school', 'exam', 'grades'],
      [isEnglish ? 'Relationships' : '대인관계']: ['친구', '관계', '따돌림', '왕따', '외톨이', '사회성', 'friend', 'bully', 'social'],
      [isEnglish ? 'Sleep Issues' : '수면문제']: ['잠', '수면', '못 자', '불면', 'sleep', 'insomnia'],
      [isEnglish ? 'Anger Management' : '분노조절']: ['화', '분노', '짜증', '폭발', '참을 수 없', 'anger', 'rage', 'temper'],
    };

    let severity = isEnglish ? 'Low' : '낮음';
    let color = 'bg-green-500';
    
    for (const keyword of highSeverityKeywords) {
      if (text.toLowerCase().includes(keyword)) {
        severity = isEnglish ? 'High' : '높음';
        color = 'bg-red-500';
        break;
      }
    }
    
    if (severity === (isEnglish ? 'Low' : '낮음')) {
      for (const keyword of mediumSeverityKeywords) {
        if (text.toLowerCase().includes(keyword)) {
          severity = isEnglish ? 'Medium' : '중간';
          color = 'bg-orange-500';
          break;
        }
      }
    }

    const isHigh = severity === (isEnglish ? 'High' : '높음');
    const isMedium = severity === (isEnglish ? 'Medium' : '중간');

    const detailedAdvice = isHigh
      ? (isEnglish ? 'The difficulties you are experiencing seem quite overwhelming. In situations like this, it is important to seek professional help rather than trying to resolve things alone.' : '현재 겪고 계신 어려움이 상당히 힘드실 것 같습니다. 이런 상황에서는 혼자 해결하려 하기보다 전문가의 도움을 받는 것이 중요합니다.')
      : isMedium
      ? (isEnglish ? 'I understand the difficulties you are feeling. These situations can happen to anyone, and seeking help is a courageous act.' : '지금 느끼시는 어려움에 대해 충분히 공감합니다. 이러한 상황은 누구에게나 찾아올 수 있으며, 도움을 구하는 것은 용기 있는 행동입니다.')
      : (isEnglish ? 'Based on what you have shared, your concern appears to be at a manageable level. The effort to recognize and address it is a great step forward.' : '공유해주신 내용을 보니 현재 관리 가능한 수준의 고민으로 보입니다. 이런 고민을 인식하고 해결하려는 노력 자체가 큰 발전입니다.');

    let detectedType = isEnglish ? 'General Counseling' : '일반 상담';
    for (const [type, keywords] of Object.entries(typeKeywords)) {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
        detectedType = type;
        break;
      }
    }

    const recommendations = isHigh
      ? (isEnglish ? ['Immediate professional consultation recommended', 'Visit nearest mental health center', 'Use 24/7 crisis hotline (988)'] : ['즉시 전문가 상담 권장', '가까운 정신건강복지센터 방문', '24시간 위기상담 서비스 이용'])
      : isMedium
      ? (isEnglish ? ['Personalized solutions through expert consultation', 'Keep a structured observation journal', 'Step-by-step improvement guide'] : ['전문가 상담을 통한 맞춤 솔루션', '체계적인 관찰일지 작성', '단계별 개선 가이드 제공'])
      : (isEnglish ? ['Preventive consultation and observation', 'Regular self-checks', 'Maintain healthy lifestyle habits'] : ['예방적 상담 및 관찰', '정기적인 자가 체크', '건강한 생활 습관 유지']);

    return {
      type: detectedType,
      severity,
      color,
      detailedAdvice,
      recommendations,
      confidence: Math.floor(Math.random() * 15) + 80,
      nextSteps: isEnglish
        ? ['Get precise analysis with 3-min onboarding', 'Expert matching & consultation', 'Personalized solution recommendations']
        : ['3분 온보딩으로 정확한 분석 받기', '전문가 매칭 및 상담 예약', '맞춤형 솔루션 추천 받기']
    };
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      toast({
        title: t.instantAI.toastEmptyTitle,
        description: t.instantAI.toastEmptyDesc,
        variant: "destructive"
      });
      return;
    }

    if (inputText.trim().length < 10) {
      toast({
        title: t.instantAI.toastShortTitle,
        description: t.instantAI.toastShortDesc,
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setRemainingTime(30);
    
    // 타이머 및 프로그레스 시작
    const totalTime = 30;
    const startTime = Date.now();
    
    const progressInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min((elapsed / totalTime) * 100, 95);
      const remaining = Math.max(Math.ceil(totalTime - elapsed), 0);
      
      setAnalysisProgress(progress);
      setRemainingTime(remaining);
      
      if (elapsed >= totalTime) {
        clearInterval(progressInterval);
      }
    }, 100);
    
    try {
      const { analysis, reportImages, tableOfContents } = await callAIAnalysis(inputText);
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      setRemainingTime(0);
      
      setAnalysisResult(analysis);
      setReportImages(reportImages || []);
      setTableOfContents(tableOfContents);
      setIsAnalyzing(false);
      setShowResult(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('concern_storage').insert({
          user_id: user.id,
          concern_text: inputText,
          analysis_type: analysis.type || '기타',
          analysis_severity: analysis.severity || '낮음',
          analysis_advice: analysis.detailedAdvice || '',
          full_analysis: analysis,
          report_images: reportImages || []
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setIsAnalyzing(false);
      const fallbackResult = mockAnalysis(inputText);
      setAnalysisResult(fallbackResult);
      setShowResult(true);
    }
  };

  const handleExpandPrompt = async () => {
    if (!inputText.trim() || inputText.length < 10) {
      toast({
        title: t.instantAI.toastExpandTitle,
        description: t.instantAI.toastExpandDesc,
        variant: "destructive"
      });
      return;
    }

    setIsExpanding(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('expand-prompt', {
        body: { prompt: inputText }
      });

      if (error) {
        console.error('expand-prompt error:', error);
        throw new Error(error.message || 'AI 다듬기 중 오류가 발생했습니다.');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.expandedPrompt) {
        setInputText(data.expandedPrompt);
        toast({
          title: "✨ 프롬프트 확장 완료",
          description: "입력 내용이 더 구체적으로 확장되었습니다.",
        });
      } else {
        throw new Error('확장된 프롬프트를 받지 못했습니다.');
      }
    } catch (error: any) {
      console.error('프롬프트 확장 오류:', error);
      toast({
        title: "확장 실패",
        description: error?.message || "AI 다듬기 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsExpanding(false);
    }
  };

  const handleStartFullAnalysis = () => {
    localStorage.setItem('instant_analysis_input', inputText);
    navigate('/assessment');
  };

  if (showResult && analysisResult) {
    return (
      <EnhancedResultView
        analysisResult={analysisResult}
        inputText={inputText}
        reportImages={reportImages}
        tableOfContents={tableOfContents}
        onReset={() => {
          setShowResult(false);
          setInputText('');
          setAnalysisResult(null);
          setTableOfContents(null);
          setReportImages([]);
        }}
      />
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-1">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
      >
        {/* 헤더 */}
        <div className="px-3 md:px-5 py-3 md:py-4 border-b border-white/10 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm md:text-base font-bold text-white truncate">{t.instantAI.header}</h2>
              <p className="text-[10px] md:text-xs text-white/50 truncate">{t.instantAI.headerSub}</p>
            </div>
          </div>
        </div>

        {/* 입력 영역 */}
        <div className="p-3 md:p-5 space-y-3 md:space-y-4">
          {/* 예시 고민 태그들 */}
          <div className="flex flex-wrap gap-1 md:gap-2 mb-3">
            {[
              { emoji: '👶', text: t.instantAI.tag1, short: t.instantAI.tag1Short || '말이 늦어요' },
              { emoji: '👀', text: t.instantAI.tag2, short: t.instantAI.tag2Short || 'ADHD 의심' },
              { emoji: '📚', text: t.instantAI.tag3, short: t.instantAI.tag3Short || '학습 부진' },
              { emoji: '😤', text: t.instantAI.tag4, short: t.instantAI.tag4Short || '감정 폭발' },
              { emoji: '😰', text: t.instantAI.tag5, short: t.instantAI.tag5Short || '자폐 걱정' },
              { emoji: '🔥', text: t.instantAI.tag6, short: t.instantAI.tag6Short || '육아 번아웃' },
              { emoji: '💔', text: t.instantAI.tag7, short: t.instantAI.tag7Short || '부부 갈등' },
              { emoji: '💼', text: t.instantAI.tag8, short: t.instantAI.tag8Short || '직장 스트레스' },
              { emoji: '🐢', text: t.instantAI.tag9, short: t.instantAI.tag9Short || '발달 느림' },
            ].map((tag, index) => (
              <button
                key={index}
                onClick={() => setInputText(tag.text)}
                className="inline-flex items-center gap-0.5 md:gap-1 px-1.5 md:px-3 py-0.5 md:py-1.5 bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 rounded-full text-[9px] md:text-xs text-white/70 hover:text-amber-200 transition-all duration-200"
              >
                <span className="text-[10px] md:text-sm">{tag.emoji}</span>
                <span className="md:hidden">{tag.short}</span>
                <span className="hidden md:inline">{tag.text.length > 15 ? tag.text.slice(0, 15) + '...' : tag.text}</span>
              </button>
            ))}
          </div>

          <div className="relative">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.instantAI.placeholder}
              className="min-h-[120px] md:min-h-[140px] bg-slate-800/50 border-white/10 text-white placeholder:text-white/40 rounded-xl md:rounded-2xl resize-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 text-xs md:text-sm leading-relaxed p-3 md:p-4"
              maxLength={500}
            />
            
            {/* 음성 입력 버튼 */}
            <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3">
              <VoiceInputButton
                onTranscription={(text) => setInputText(prev => prev ? `${prev} ${text}` : text)}
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white/80 h-7 w-7 md:h-8 md:w-8"
              />
            </div>
          </div>

          {/* 글자 수 & 버튼들 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 md:gap-2">
              <span className="text-[10px] md:text-xs text-white/40">{inputText.length}/500</span>
              <span className="text-[10px] md:text-xs text-white/30">{t.instantAI.minChars}</span>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
              <Button
                onClick={handleExpandPrompt}
                disabled={isExpanding || inputText.length < 10}
                size="sm"
                variant="ghost"
                className="text-[10px] md:text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 gap-1 md:gap-1.5 h-7 md:h-8 px-2 md:px-3"
              >
                {isExpanding ? (
                  <>
                    <ThinkingDots className="text-amber-400" />
                    <span className="ml-1">{t.instantAI.refining}</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    {t.instantAI.aiRefine}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* 팁 카드 */}
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl md:rounded-2xl p-3 md:p-4 border border-amber-500/20">
            <div className="flex items-start gap-2 md:gap-3">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                <Lightbulb className="w-3 h-3 md:w-4 md:h-4 text-amber-400" />
              </div>
              <div className="space-y-1 md:space-y-1.5 min-w-0">
                <p className="text-xs md:text-sm font-medium text-amber-200">{t.instantAI.tipTitle}</p>
                <ul className="text-[10px] md:text-xs text-white/60 space-y-0.5 md:space-y-1">
                  <li>{t.instantAI.tip1}</li>
                  <li>{t.instantAI.tip2}</li>
                  <li>{t.instantAI.tip3}</li>
                </ul>
                <div className="pt-1.5 md:pt-2 flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs text-amber-300/80">
                  <FileText className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0" />
                  <span className="truncate">{t.instantAI.tipFooter}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 분석 시작 버튼 또는 진행 상태 */}
          {isAnalyzing ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* GPT 스타일 Thinking UI */}
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-5 border border-white/10">
                {/* 메인 Thinking 헤더 */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </motion.div>
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 rounded-xl border-2 border-violet-400"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-white">{isEnglish ? 'AI is analyzing' : 'AI가 분석 중입니다'}</span>
                      <span className="text-sm font-mono text-violet-400">{remainingTime}{isEnglish ? 's' : '초'}</span>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={Math.floor(analysisProgress / 25)}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xs text-slate-400"
                      >
                        {isEnglish
                          ? (analysisProgress < 25 ? 'Identifying concern type...' :
                             analysisProgress < 50 ? 'Analyzing root causes...' :
                             analysisProgress < 75 ? 'Generating solutions...' :
                             'Creating 9 reports...')
                          : (analysisProgress < 25 ? '고민 유형 파악 중...' :
                             analysisProgress < 50 ? '심층 원인 분석 중...' :
                             analysisProgress < 75 ? '맞춤 솔루션 생성 중...' :
                             '9가지 리포트 생성 중...')}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  {/* Animated Dots */}
                  <div className="flex gap-1 ml-auto">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-violet-500"
                        animate={{
                          y: [0, -6, 0],
                          opacity: [0.4, 1, 0.4],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* 프로그레스 바 */}
                <div className="relative w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden mb-4">
                  <motion.div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                    style={{ width: `${analysisProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                
                {/* 분석 단계 - 가로 스텝 */}
                <div className="flex justify-between text-xs">
                  {(isEnglish ? [
                    { label: 'Type', threshold: 20 },
                    { label: 'Causes', threshold: 45 },
                    { label: 'Solutions', threshold: 70 },
                    { label: 'Reports', threshold: 90 },
                  ] : [
                    { label: '유형 분석', threshold: 20 },
                    { label: '원인 분석', threshold: 45 },
                    { label: '솔루션', threshold: 70 },
                    { label: '리포트', threshold: 90 },
                  ]).map((step, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <motion.div 
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                          ${analysisProgress >= step.threshold 
                            ? 'bg-violet-500 text-white' 
                            : 'bg-slate-700 text-slate-400'}`}
                        animate={analysisProgress >= step.threshold ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {analysisProgress >= step.threshold ? '✓' : i + 1}
                      </motion.div>
                      <span className={analysisProgress >= step.threshold ? 'text-violet-300' : 'text-slate-500'}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              <Button
                onClick={handleAnalyze}
                disabled={inputText.length < 10}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 md:py-6 rounded-xl md:rounded-2xl shadow-lg shadow-amber-500/25 transition-all duration-300 disabled:opacity-50 text-sm md:text-base"
              >
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2" />
                {t.instantAI.analyzeButton}
              </Button>

              <p className="text-center text-[10px] md:text-xs text-white/40">
                {t.instantAI.analyzeSubtext}
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default InstantAIAnalysis;
