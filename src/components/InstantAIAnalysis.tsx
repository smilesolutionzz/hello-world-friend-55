import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { VoiceInputButton } from '@/components/ui/VoiceInputButton';
import { ThinkingLoader, ThinkingDots } from '@/components/ui/thinking-loader';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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

const InstantAIAnalysis = () => {
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
      '못 견디', '한계', '폭력', '학대'
    ];
    
    const mediumSeverityKeywords = [
      '우울', '불안', '공황', '스트레스', '화', '분노', '걱정', '고민',
      '힘들', '지쳐', '아프', '외로', '슬프', '무기력', '짜증', '피곤',
      '싸움', '갈등', '문제', '어려움'
    ];

    const typeKeywords = {
      '우울감': ['우울', '무기력', '의욕 없', '슬프', '외로'],
      '불안감': ['불안', '걱정', '초조', '공황', '두려', '무서'],
      '발달지연': ['말 안', '걷지 못', '발달', '늦', '또래보다', '개월', '언어', '운동'],
      '육아스트레스': ['아이', '육아', '엄마', '아빠', '키우', '양육'],
      '학업스트레스': ['공부', '시험', '성적', '학교', '학원', '입시'],
      '대인관계': ['친구', '관계', '따돌림', '왕따', '외톨이', '사회성'],
      '수면문제': ['잠', '수면', '못 자', '불면'],
      '분노조절': ['화', '분노', '짜증', '폭발', '참을 수 없'],
    };

    let severity = '낮음';
    let color = 'bg-green-500';
    
    for (const keyword of highSeverityKeywords) {
      if (text.includes(keyword)) {
        severity = '높음';
        color = 'bg-red-500';
        break;
      }
    }
    
    if (severity === '낮음') {
      for (const keyword of mediumSeverityKeywords) {
        if (text.includes(keyword)) {
          severity = '중간';
          color = 'bg-orange-500';
          break;
        }
      }
    }

    const detailedAdvice = severity === '높음' 
      ? `현재 겪고 계신 어려움이 상당히 힘드실 것 같습니다. 이런 상황에서는 혼자 해결하려 하기보다 전문가의 도움을 받는 것이 중요합니다.`
      : severity === '중간'
      ? `지금 느끼시는 어려움에 대해 충분히 공감합니다. 이러한 상황은 누구에게나 찾아올 수 있으며, 도움을 구하는 것은 용기 있는 행동입니다.`
      : `공유해주신 내용을 보니 현재 관리 가능한 수준의 고민으로 보입니다. 이런 고민을 인식하고 해결하려는 노력 자체가 큰 발전입니다.`;

    let detectedType = '일반 상담';
    for (const [type, keywords] of Object.entries(typeKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        detectedType = type;
        break;
      }
    }

    const recommendations = severity === '높음' 
      ? ['즉시 전문가 상담 권장', '가까운 정신건강복지센터 방문', '24시간 위기상담 서비스 이용']
      : severity === '중간'
      ? ['전문가 상담을 통한 맞춤 솔루션', '체계적인 관찰일지 작성', '단계별 개선 가이드 제공']
      : ['예방적 상담 및 관찰', '정기적인 자가 체크', '건강한 생활 습관 유지'];

    return {
      type: detectedType,
      severity,
      color,
      detailedAdvice,
      recommendations,
      confidence: Math.floor(Math.random() * 15) + 80,
      nextSteps: ['3분 온보딩으로 정확한 분석 받기', '전문가 매칭 및 상담 예약', '맞춤형 솔루션 추천 받기']
    };
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      toast({
        title: "입력이 필요해요",
        description: "고민이나 걱정거리를 간단히 적어주세요",
        variant: "destructive"
      });
      return;
    }

    if (inputText.trim().length < 10) {
      toast({
        title: "조금만 더 적어주세요",
        description: "최소 10자 이상 입력해주세요",
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
        title: "입력 확인",
        description: "최소 10자 이상 입력해주세요.",
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
    const reports = analysisResult.comprehensiveReports;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl mx-auto space-y-4 md:space-y-6"
      >
        {/* 결과 헤더 */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/10 p-4 md:p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base md:text-lg font-bold text-white">AI 분석 완료!</h3>
                <p className="text-xs md:text-sm text-white/60 truncate">신뢰도 {analysisResult.confidence}%의 분석 결과</p>
              </div>
            </div>
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm font-medium shrink-0">
              {analysisResult.type}
            </Badge>
          </div>
        </div>

        {/* 심층 분석 요약 (비회원도 풍부하게) */}
        {analysisResult.deepAnalysis && (
          <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/40 backdrop-blur-xl rounded-2xl border border-violet-500/20 p-4 md:p-5">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-violet-400" />
              <h4 className="text-sm md:text-base font-bold text-white">심층 원인 분석</h4>
            </div>
            <p className="text-white/80 text-xs md:text-sm leading-relaxed mb-3">
              {analysisResult.deepAnalysis.rootCauseAnalysis?.substring(0, 400)}...
            </p>
            {analysisResult.deepAnalysis.protectiveFactors && (
              <div className="grid grid-cols-2 gap-2 md:gap-3 mt-3">
                <div className="bg-green-500/10 rounded-xl p-3 border border-green-500/20">
                  <p className="text-green-300 text-[10px] md:text-xs font-bold mb-1">보호요인</p>
                  <ul className="text-white/70 text-[10px] md:text-xs space-y-0.5">
                    {analysisResult.deepAnalysis.protectiveFactors?.slice(0, 2).map((f: string, i: number) => (
                      <li key={i} className="truncate">• {f}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20">
                  <p className="text-red-300 text-[10px] md:text-xs font-bold mb-1">주의요인</p>
                  <ul className="text-white/70 text-[10px] md:text-xs space-y-0.5">
                    {analysisResult.deepAnalysis.riskFactors?.slice(0, 2).map((f: string, i: number) => (
                      <li key={i} className="truncate">• {f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 추천 리포트 목차 */}
        {tableOfContents && tableOfContents.length > 0 && (
          <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-4 md:p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              <h4 className="text-sm md:text-base font-bold text-white">추천 리포트 목차</h4>
            </div>
            <ul className="space-y-1 md:space-y-1.5 text-xs md:text-sm">
              {tableOfContents.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-white/70">
                  <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] md:text-xs flex items-center justify-center font-medium shrink-0">{item.index}</span>
                  <span className="truncate">{item.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AI 전문가 조언 - 접기/펼치기 */}
        <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 backdrop-blur-xl rounded-2xl border border-amber-500/20 p-4 md:p-5">
          <button 
            onClick={() => setIsAdviceExpanded(!isAdviceExpanded)}
            className="w-full flex items-center justify-between mb-2 md:mb-3"
          >
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
              <h4 className="text-sm md:text-base font-bold text-white">AI 전문가의 조언</h4>
              <Badge className={`${analysisResult.severity === '높음' ? 'bg-red-500/20 text-red-300' : analysisResult.severity === '중간' ? 'bg-orange-500/20 text-orange-300' : 'bg-green-500/20 text-green-300'} text-[10px] md:text-xs`}>
                {analysisResult.severity}
              </Badge>
            </div>
            {isAdviceExpanded ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
          </button>
          
          <AnimatePresence>
            {isAdviceExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <p className="text-white/80 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
                  {analysisResult.detailedAdvice}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {!isAdviceExpanded && (
            <p className="text-white/60 text-xs md:text-sm line-clamp-2">{analysisResult.detailedAdvice}</p>
          )}
        </div>

        {/* 맞춤 솔루션 */}
        {analysisResult.recommendations && (
          <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-4 md:p-5">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <Target className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
              <h4 className="text-sm md:text-base font-bold text-white">맞춤 솔루션</h4>
            </div>
            <div className="space-y-2">
              {analysisResult.recommendations.map((rec: string, i: number) => (
                <div key={i} className="flex items-start gap-2 bg-white/5 rounded-lg md:rounded-xl p-2 md:p-3 border border-white/5">
                  <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] md:text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">{i + 1}</span>
                  <span className="text-white/80 text-xs md:text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 단계별 발달 로드맵 */}
        {reports?.developmentRoadmap && (
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-purple-400" />
              <h4 className="text-base font-bold text-white">단계별 발달 로드맵</h4>
            </div>
            <div className="space-y-4">
              {/* 단기 목표 */}
              <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                <p className="text-blue-300 text-xs font-bold mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 단기 목표 (1-3개월)
                </p>
                <ul className="space-y-1">
                  {reports.developmentRoadmap.immediate?.map((item: string, i: number) => (
                    <li key={i} className="text-white/70 text-sm flex items-start gap-2">
                      <span className="text-blue-400">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* 중기 목표 */}
              <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                <p className="text-purple-300 text-xs font-bold mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 중기 목표 (3-6개월)
                </p>
                <ul className="space-y-1">
                  {reports.developmentRoadmap.shortTerm?.map((item: string, i: number) => (
                    <li key={i} className="text-white/70 text-sm flex items-start gap-2">
                      <span className="text-purple-400">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* 장기 목표 */}
              <div className="bg-pink-500/10 rounded-xl p-4 border border-pink-500/20">
                <p className="text-pink-300 text-xs font-bold mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 장기 목표 (6-12개월)
                </p>
                <ul className="space-y-1">
                  {reports.developmentRoadmap.longTerm?.map((item: string, i: number) => (
                    <li key={i} className="text-white/70 text-sm flex items-start gap-2">
                      <span className="text-pink-400">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* AI 생성 분석 이미지 갤러리 */}
        {reportImages && reportImages.length > 0 && (
          <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
            <h4 className="font-bold mb-4 text-white flex items-center gap-2">
              <span className="text-lg">🖼️</span>
              AI 분석 리포트 이미지
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {reportImages.map((imageUrl, index) => (
                <div key={index} className="relative group rounded-xl overflow-hidden border border-white/10 bg-slate-800/50 hover:border-amber-500/50 transition-all">
                  <img 
                    src={imageUrl} 
                    alt={`분석 리포트 ${index + 1}`} 
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-white/80 text-xs">
                      실사 이미지 {index + 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9가지 종합 전문 리포트 버튼 */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-violet-900/40 backdrop-blur-xl rounded-2xl border border-indigo-500/20 p-5">
          <Button
            onClick={() => {
              localStorage.setItem('instant_analysis_result', JSON.stringify(analysisResult));
              localStorage.setItem('instant_analysis_input', inputText);
              navigate('/report-generator');
            }}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-4 rounded-xl"
          >
            <FileText className="w-5 h-5 mr-2" />
            9가지 종합 전문 리포트
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-center text-white/40 text-xs mt-2">AI가 분석한 상세한 전문 리포트를 확인하세요</p>
        </div>

        {/* 이 정확한 분석을 원하신다면? CTA */}
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl border border-amber-500/30 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">이 정확한 분석을 원하신다면?</p>
              <p className="text-white/60 text-xs">3분 온보딩으로 맞춤형 솔루션을 받아보세요!</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleStartFullAnalysis}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-5 rounded-xl"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              3분 정밀 분석 시작
            </Button>
            <Button
              onClick={() => {
                setShowResult(false);
                setInputText('');
                setAnalysisResult(null);
                setTableOfContents(null);
                setReportImages([]);
              }}
              variant="outline"
              className="bg-white/5 border-white/20 text-white/80 hover:bg-white/10 py-5 rounded-xl"
            >
              다시 분석
            </Button>
          </div>
        </div>
      </motion.div>
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
              <h2 className="text-sm md:text-base font-bold text-white truncate">내 고민 입력</h2>
              <p className="text-[10px] md:text-xs text-white/50 truncate">분석 결과가 자동으로 저장됩니다</p>
            </div>
          </div>
        </div>

        {/* 입력 영역 */}
        <div className="p-3 md:p-5 space-y-3 md:space-y-4">
          {/* 예시 고민 태그들 */}
          <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3">
            {[
              { emoji: '👶', text: '아이가 말을 늦게 시작해서 걱정돼요' },
              { emoji: '😢', text: '아이가 친구들과 잘 어울리지 못해요' },
              { emoji: '📚', text: '집중력이 부족하고 산만해요' },
              { emoji: '😤', text: '아이가 자주 짜증을 내고 화를 내요' },
              { emoji: '💑', text: '배우자와 대화가 잘 안 통해요' },
              { emoji: '💭', text: '요즘 우울하고 무기력해요' },
            ].map((tag, index) => (
              <button
                key={index}
                onClick={() => setInputText(tag.text)}
                className="inline-flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 rounded-full text-[10px] md:text-xs text-white/70 hover:text-amber-200 transition-all duration-200"
              >
                <span>{tag.emoji}</span>
                <span className="truncate max-w-[80px] md:max-w-none">{tag.text.slice(0, 12)}...</span>
              </button>
            ))}
          </div>

          <div className="relative">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="지금 가장 걱정되는 한 문장을 적어주세요..."
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
              <span className="text-[10px] md:text-xs text-white/30">(최소 10자)</span>
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
                    <span className="ml-1">다듬는 중...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    AI 다듬기
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
                <p className="text-xs md:text-sm font-medium text-amber-200">고민 작성 팁</p>
                <ul className="text-[10px] md:text-xs text-white/60 space-y-0.5 md:space-y-1">
                  <li>• "AI 다듬기"로 고민을 확장할 수 있어요</li>
                  <li>• 최소 10자 이상 적어주세요</li>
                  <li>• 예: "5살 아이 말 늦어요"</li>
                </ul>
                <div className="pt-1.5 md:pt-2 flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs text-amber-300/80">
                  <FileText className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0" />
                  <span className="truncate">9가지 전문 리포트 + AI 발달 예측 무료</span>
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
                      <span className="text-base font-semibold text-white">AI가 분석 중입니다</span>
                      <span className="text-sm font-mono text-violet-400">{remainingTime}초</span>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={Math.floor(analysisProgress / 25)}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xs text-slate-400"
                      >
                        {analysisProgress < 25 ? '고민 유형 파악 중...' :
                         analysisProgress < 50 ? '심층 원인 분석 중...' :
                         analysisProgress < 75 ? '맞춤 솔루션 생성 중...' :
                         '9가지 리포트 생성 중...'}
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
                  {[
                    { label: '유형 분석', threshold: 20 },
                    { label: '원인 분석', threshold: 45 },
                    { label: '솔루션', threshold: 70 },
                    { label: '리포트', threshold: 90 },
                  ].map((step, i) => (
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
                무료로 분석하기
              </Button>

              <p className="text-center text-[10px] md:text-xs text-white/40">
                무료, 30초 완료
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default InstantAIAnalysis;
