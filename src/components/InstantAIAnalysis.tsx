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
import { buildConcernYoutubeQuery } from '@/lib/concernYoutubeQuery';

const InstantAIAnalysis = () => {
  const { t } = useTranslation();
  const { isEnglish } = useLanguage();
  // sessionStorage에서 이전 결과 복원
  const savedState = (() => {
    try {
      const saved = sessionStorage.getItem('instantAI_result');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  })();

  const [inputText, setInputText] = useState(savedState?.inputText || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [showResult, setShowResult] = useState(!!savedState?.analysisResult);
  const [analysisResult, setAnalysisResult] = useState<any>(savedState?.analysisResult || null);
  const [reportImages, setReportImages] = useState<string[]>(savedState?.reportImages || []);
  const [tableOfContents, setTableOfContents] = useState<Array<{index: number, title: string}> | null>(savedState?.tableOfContents || null);
  const [youtubeVideos, setYoutubeVideos] = useState<any[]>(savedState?.youtubeVideos || []);
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
        body: { inputText: text, language: isEnglish ? 'en' : 'ko' }
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

      // YouTube 추천 영상 검색 (비동기, 결과 표시 후 로드)
      // 사용자 원문을 그대로 검색하면 "언어" → "영국영어 팟캐스트" 같이
      // 엉뚱한 학습 영상이 추천돼서, 주제 매핑 기반 큐레이션 키워드만 사용.
      const ytQuery = buildConcernYoutubeQuery(inputText, isEnglish);
      supabase.functions.invoke('youtube-search', {
        body: { query: ytQuery, language: isEnglish ? 'en' : 'ko', maxResults: 2 }
      }).then(({ data }) => {
        if (data?.videos?.length > 0) {
          setYoutubeVideos(data.videos);
        }
      }).catch(err => console.error('YouTube search error:', err));

      // sessionStorage에 결과 저장 (페이지 이동 후 복원용)
      try {
        sessionStorage.setItem('instantAI_result', JSON.stringify({
          inputText,
          analysisResult: analysis,
          reportImages: reportImages || [],
          tableOfContents,
        }));
      } catch (e) { /* storage full 무시 */ }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: saveErr } = await supabase.from('concern_storage').insert({
          user_id: user.id,
          concern_text: inputText,
          analysis_type: analysis.type || '기타',
          analysis_severity: analysis.severity || '낮음',
          analysis_advice: analysis.detailedAdvice || '',
          full_analysis: analysis,
          report_images: reportImages || []
        });
        if (saveErr) {
          console.error('[concern_storage] save failed:', saveErr);
          toast({
            title: '저장 실패',
            description: '고민 저장 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
            variant: 'destructive',
          });
        }
      } else {
        // 비로그인 → sessionStorage에 임시 보관, 로그인 후 자동 저장 가능하도록
        try {
          sessionStorage.setItem('pending_concern_to_save', JSON.stringify({
            concern_text: inputText,
            analysis_type: analysis.type || '기타',
            analysis_severity: analysis.severity || '낮음',
            analysis_advice: analysis.detailedAdvice || '',
            full_analysis: analysis,
            report_images: reportImages || [],
            created_at: new Date().toISOString(),
          }));
        } catch {}
        toast({
          title: '로그인하면 고민이 저장돼요',
          description: '회원가입 후 "고민 저장소"에서 분석 기록을 다시 볼 수 있어요.',
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
        body: { prompt: inputText, language: isEnglish ? 'en' : 'ko' }
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
          title: isEnglish ? "✨ Prompt expanded" : "✨ 프롬프트 확장 완료",
          description: isEnglish ? "Your input has been expanded with more detail." : "입력 내용이 더 구체적으로 확장되었습니다.",
        });
      } else {
        throw new Error(isEnglish ? 'Failed to expand prompt.' : '확장된 프롬프트를 받지 못했습니다.');
      }
    } catch (error: any) {
      console.error('Prompt expansion error:', error);
      toast({
        title: isEnglish ? "Expansion failed" : "확장 실패",
        description: error?.message || (isEnglish ? "AI refinement failed. Please try again." : "AI 다듬기 중 오류가 발생했습니다. 다시 시도해주세요."),
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
        youtubeVideos={youtubeVideos}
        onReset={() => {
          setShowResult(false);
          setInputText('');
          setAnalysisResult(null);
          setTableOfContents(null);
          setReportImages([]);
          setYoutubeVideos([]);
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
        className="bg-white rounded-3xl border border-slate-200 ring-1 ring-[#C8B88A]/15 shadow-sm overflow-hidden"
      >
        {/* 헤더 */}
        <div className="px-4 md:px-6 py-4 md:py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1a1a1a] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-wider text-[#8a7a4d] uppercase">
                Expert Analysis
              </p>
              <h2 className="text-[15px] md:text-base font-bold text-slate-900 truncate">
                {t.instantAI.header}
              </h2>
            </div>
          </div>
        </div>

        {/* 입력 영역 */}
        <div className="p-4 md:p-6 space-y-4">
          {/* 예시 고민 태그들 */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { text: t.instantAI.tag1, short: t.instantAI.tag1Short || '말이 늦어요' },
              { text: t.instantAI.tag2, short: t.instantAI.tag2Short || 'ADHD 의심' },
              { text: t.instantAI.tag3, short: t.instantAI.tag3Short || '학습 부진' },
              { text: t.instantAI.tag4, short: t.instantAI.tag4Short || '감정 폭발' },
              { text: t.instantAI.tag5, short: t.instantAI.tag5Short || '자폐 걱정' },
              { text: t.instantAI.tag6, short: t.instantAI.tag6Short || '육아 번아웃' },
              { text: t.instantAI.tag7, short: t.instantAI.tag7Short || '부부 갈등' },
              { text: t.instantAI.tag8, short: t.instantAI.tag8Short || '직장 스트레스' },
              { text: t.instantAI.tag9, short: t.instantAI.tag9Short || '발달 느림' },
            ].map((tag, index) => (
              <button
                key={index}
                onClick={() => setInputText(tag.text)}
                className="inline-flex items-center px-2.5 py-1 bg-slate-50 hover:bg-[#C8B88A]/10 border border-slate-200 hover:border-[#C8B88A]/50 rounded-full text-[11px] md:text-xs text-slate-600 hover:text-[#1a1a1a] transition-all"
              >
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
              className="min-h-[140px] bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-2xl resize-none focus-visible:ring-2 focus-visible:ring-[#C8B88A]/40 focus-visible:border-[#C8B88A]/60 text-sm leading-relaxed p-4 break-keep"
              maxLength={500}
            />

            {/* 음성 입력 버튼 */}
            <div className="absolute bottom-3 right-3">
              <VoiceInputButton
                onTranscription={(text) => setInputText(prev => prev ? `${prev} ${text}` : text)}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 h-8 w-8 shadow-sm"
              />
            </div>
          </div>

          {/* 글자 수 & 버튼들 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>{inputText.length}/500</span>
              <span className="text-slate-300">·</span>
              <span>{t.instantAI.minChars}</span>
            </div>

            <Button
              onClick={handleExpandPrompt}
              disabled={isExpanding || inputText.length < 10}
              size="sm"
              variant="ghost"
              className="text-xs text-[#8a7a4d] hover:text-[#1a1a1a] hover:bg-[#C8B88A]/10 gap-1.5 h-8 px-3"
            >
              {isExpanding ? (
                <>
                  <ThinkingDots className="text-[#8a7a4d]" />
                  <span className="ml-1">{t.instantAI.refining}</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  {t.instantAI.aiRefine}
                </>
              )}
            </Button>
          </div>

          {/* 팁 카드 */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white border border-[#C8B88A]/40 flex items-center justify-center shrink-0">
                <Lightbulb className="w-4 h-4 text-[#8a7a4d]" />
              </div>
              <div className="space-y-1.5 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{t.instantAI.tipTitle}</p>
                <ul className="text-xs text-slate-500 space-y-0.5 leading-relaxed">
                  <li>{t.instantAI.tip1}</li>
                  <li>{t.instantAI.tip2}</li>
                  <li>{t.instantAI.tip3}</li>
                </ul>
                <div className="pt-1.5 flex items-center gap-1.5 text-[11px] text-[#8a7a4d]">
                  <FileText className="w-3 h-3 shrink-0" />
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
              <div className="bg-white border border-slate-200 ring-1 ring-[#C8B88A]/15 rounded-2xl p-5">
                {/* 메인 Thinking 헤더 */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="w-10 h-10 rounded-2xl bg-[#1a1a1a] flex items-center justify-center"
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </motion.div>
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 rounded-2xl border-2 border-[#C8B88A]"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-slate-900">
                        {isEnglish ? 'Analyzing' : '분석 중입니다'}
                      </span>
                      <span className="text-sm font-mono text-[#8a7a4d]">
                        {remainingTime}{isEnglish ? 's' : '초'}
                      </span>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={Math.floor(analysisProgress / 25)}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xs text-slate-500"
                      >
                        {isEnglish
                          ? (analysisProgress < 25 ? 'Identifying concern type...' :
                             analysisProgress < 50 ? 'Analyzing root causes...' :
                             analysisProgress < 75 ? 'Generating solutions...' :
                             'Creating reports...')
                          : (analysisProgress < 25 ? '고민 유형 파악 중...' :
                             analysisProgress < 50 ? '심층 원인 분석 중...' :
                             analysisProgress < 75 ? '맞춤 솔루션 생성 중...' :
                             '리포트 생성 중...')}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <div className="flex gap-1 ml-auto">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-[#C8B88A]"
                        animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>

                {/* 프로그레스 바 */}
                <div className="relative w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-[#1a1a1a] rounded-full"
                    style={{ width: `${analysisProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* 분석 단계 */}
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
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold
                          ${analysisProgress >= step.threshold
                            ? 'bg-[#1a1a1a] text-white'
                            : 'bg-slate-100 text-slate-400'}`}
                        animate={analysisProgress >= step.threshold ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {analysisProgress >= step.threshold ? '✓' : i + 1}
                      </motion.div>
                      <span className={analysisProgress >= step.threshold ? 'text-[#1a1a1a] font-medium' : 'text-slate-400'}>
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
                className="w-full bg-[#1a1a1a] hover:bg-black text-white font-bold py-5 md:py-6 rounded-2xl shadow-sm transition-all disabled:opacity-40 text-sm md:text-base"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {t.instantAI.analyzeButton}
              </Button>

              <p className="text-center text-[11px] text-slate-400">
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
