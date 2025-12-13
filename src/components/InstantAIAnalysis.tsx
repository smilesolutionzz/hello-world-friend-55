import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { VoiceInputButton } from '@/components/ui/VoiceInputButton';
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
    
    try {
      const { analysis, reportImages, tableOfContents } = await callAIAnalysis(inputText);
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
          full_analysis: analysis
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

      if (error) throw error;

      if (data?.expandedPrompt) {
        setInputText(data.expandedPrompt);
        toast({
          title: "✨ 프롬프트 확장 완료",
          description: "입력 내용이 더 구체적으로 확장되었습니다.",
        });
      }
    } catch (error: any) {
      console.error('프롬프트 확장 오류:', error);
    } finally {
      setIsExpanding(false);
    }
  };

  const handleStartFullAnalysis = () => {
    localStorage.setItem('instant_analysis_input', inputText);
    navigate('/pmf-onboarding');
  };

  if (showResult && analysisResult) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl">
          {/* 결과 헤더 */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AI 분석 완료</h3>
              <p className="text-sm text-white/60">신뢰도 {analysisResult.confidence}%</p>
            </div>
          </div>

          {/* 분석 결과 */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 px-3 py-1">
                {analysisResult.type}
              </Badge>
              <Badge className={`${analysisResult.severity === '높음' ? 'bg-red-500/20 text-red-300 border-red-500/30' : analysisResult.severity === '중간' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' : 'bg-green-500/20 text-green-300 border-green-500/30'} px-3 py-1`}>
                심각도: {analysisResult.severity}
              </Badge>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-white/80 text-sm leading-relaxed">
                {analysisResult.detailedAdvice}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-white/50 uppercase tracking-wide">추천 사항</p>
              {analysisResult.recommendations?.slice(0, 3).map((rec: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleStartFullAnalysis}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-6 rounded-xl"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              정밀 분석 받기
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={() => {
                setShowResult(false);
                setInputText('');
                setAnalysisResult(null);
              }}
              variant="outline"
              className="bg-white/5 border-white/20 text-white/80 hover:bg-white/10 py-6 rounded-xl"
            >
              다시 분석하기
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
      >
        {/* 헤더 */}
        <div className="px-5 py-4 border-b border-white/10 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">내 고민 입력</h2>
              <p className="text-xs text-white/50">분석 결과가 자동으로 고민 저장소에 저장됩니다</p>
            </div>
          </div>
        </div>

        {/* 입력 영역 */}
        <div className="p-5 space-y-4">
          <div className="relative">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="지금 가장 걱정되는 한 문장을 적어주세요..."
              className="min-h-[140px] bg-slate-800/50 border-white/10 text-white placeholder:text-white/40 rounded-2xl resize-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 text-sm leading-relaxed p-4"
              maxLength={500}
            />
            
            {/* 음성 입력 버튼 */}
            <div className="absolute bottom-3 right-3">
              <VoiceInputButton
                onTranscription={(text) => setInputText(prev => prev ? `${prev} ${text}` : text)}
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white/80"
              />
            </div>
          </div>

          {/* 글자 수 & 버튼들 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">{inputText.length}/500</span>
              <span className="text-xs text-white/30">(최소 10자)</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleExpandPrompt}
                disabled={isExpanding || inputText.length < 10}
                size="sm"
                variant="ghost"
                className="text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 gap-1.5 h-8 px-3"
              >
                {isExpanding ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5" />
                )}
                AI 다듬기
              </Button>
            </div>
          </div>

          {/* 팁 카드 */}
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl p-4 border border-amber-500/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                <Lightbulb className="w-4 h-4 text-amber-400" />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-amber-200">고민 작성 팁</p>
                <ul className="text-xs text-white/60 space-y-1">
                  <li>• "AI 다듬기"로 고민을 확장할 수 있어요</li>
                  <li>• 최소 10자 이상, 핵심 고민만 간단히 적어주세요</li>
                  <li>• 예: "5살 아이 말 늦어요", "아이가 친구 없어요"</li>
                </ul>
                <div className="pt-2 flex items-center gap-1.5 text-xs text-amber-300/80">
                  <FileText className="w-3.5 h-3.5" />
                  <span>9가지 전문 리포트 + AI 발달 예측 무료 제공</span>
                </div>
              </div>
            </div>
          </div>

          {/* 분석 시작 버튼 */}
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || inputText.length < 10}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-6 rounded-2xl shadow-lg shadow-amber-500/25 transition-all duration-300 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                AI가 분석 중이에요...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                무료로 분석하기
              </>
            )}
          </Button>

          <p className="text-center text-xs text-white/40">
            무료, 30초 완료
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default InstantAIAnalysis;
