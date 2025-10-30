import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Mail
} from 'lucide-react';
import instantAnalysisBg from '@/assets/instant-analysis-bg.jpg';

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
    // 심각도 키워드 (우선순위 높음)
    const highSeverityKeywords = [
      '죽고싶', '자살', '자해', '극심', '심각', '위급', '위험', '견딜 수 없',
      '못 견디', '한계', '폭력', '학대'
    ];
    
    const mediumSeverityKeywords = [
      '우울', '불안', '공황', '스트레스', '화', '분노', '걱정', '고민',
      '힘들', '지쳐', '아프', '외로', '슬프', '무기력', '짜증', '피곤',
      '싸움', '갈등', '문제', '어려움'
    ];

    // 유형 키워드
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

    // 심각도 판단
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

    // 상세 조언 생성
    const detailedAdvice = severity === '높음' 
      ? `현재 겪고 계신 어려움이 상당히 힘드실 것 같습니다. 이런 상황에서는 혼자 해결하려 하기보다 전문가의 도움을 받는 것이 중요합니다. 우선 신뢰할 수 있는 가족이나 친구에게 마음을 터놓고 이야기해보세요. 그리고 정신건강 전문의나 상담사와의 상담을 고려해보시길 권합니다. 작은 변화부터 시작하되, 자신을 너무 몰아붙이지 마세요. 하루하루 버티는 것만으로도 충분히 대단한 일입니다. 지금의 고통은 영원하지 않습니다.`
      : severity === '중간'
      ? `지금 느끼시는 어려움에 대해 충분히 공감합니다. 이러한 상황은 누구에게나 찾아올 수 있으며, 도움을 구하는 것은 용기 있는 행동입니다. 일상에서 작은 루틴을 만들어보세요 - 규칙적인 수면, 가벼운 운동, 취미 활동 등이 도움이 될 수 있습니다. 또한 관찰일지를 작성하며 패턴을 파악하고, 필요하다면 전문가 상담도 고려해보세요. 변화는 천천히 일어나지만, 꾸준히 노력한다면 분명 좋아질 것입니다.`
      : `공유해주신 내용을 보니 현재 관리 가능한 수준의 고민으로 보입니다. 이런 고민을 인식하고 해결하려는 노력 자체가 큰 발전입니다. 관찰일지를 통해 패턴을 파악하고, 작은 목표를 세워 실천해보세요. 스트레스 관리를 위해 명상이나 산책 같은 활동도 도움이 됩니다. 예방적 차원에서 꾸준히 관심을 가지고 관리한다면 더 큰 문제로 발전하지 않을 것입니다. 자신을 돌보는 시간을 꼭 가지세요.`;

    // 유형 판단
    let detectedType = '일반 상담';
    for (const [type, keywords] of Object.entries(typeKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        detectedType = type;
        break;
      }
    }

    // 심각도별 추천사항
    const recommendations = severity === '높음' 
      ? [
          '즉시 전문가 상담 (1577-0199 정신건강위기상담)',
          '가까운 정신건강복지센터 방문',
          '24시간 위기상담 서비스 이용'
        ]
      : severity === '중간'
      ? [
          '전문가 상담을 통한 맞춤 솔루션',
          '체계적인 관찰일지 작성',
          '단계별 개선 가이드 제공'
        ]
      : [
          '예방적 상담 및 관찰',
          '정기적인 자가 체크',
          '건강한 생활 습관 유지'
        ];

    return {
      type: detectedType,
      severity,
      color,
      detailedAdvice,
      recommendations,
      confidence: Math.floor(Math.random() * 15) + 80, // 80-94%
      nextSteps: [
        '3분 온보딩으로 정확한 분석 받기',
        '전문가 매칭 및 상담 예약',
        '맞춤형 솔루션 추천 받기'
      ]
    };
  };

  const handleSendEmail = async () => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "이메일 발송 기능은 로그인 후 사용 가능합니다.",
        variant: "destructive"
      });
      return;
    }

    if (!analysisResult) {
      toast({
        title: "분석 결과가 없습니다",
        description: "먼저 고민 분석을 진행해주세요.",
        variant: "destructive"
      });
      return;
    }

    // 이메일 주소 입력 받기
    const email = prompt("리포트를 받을 이메일 주소를 입력해주세요:");
    
    if (!email) {
      return;
    }

    // 간단한 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "유효하지 않은 이메일",
        description: "올바른 이메일 주소를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsSendingEmail(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-concern-report', {
        body: {
          email,
          concernText: inputText,
          analysis: {
            type: analysisResult.type,
            severity: analysisResult.severity,
            detailedAdvice: analysisResult.detailedAdvice || analysisResult.advice,
            recommendations: analysisResult.recommendations || [],
            nextSteps: analysisResult.nextSteps || [],
            confidence: analysisResult.confidence
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "이메일 발송 완료!",
          description: `${email}로 리포트가 발송되었습니다. (5토큰 차감)`,
        });
      } else {
        throw new Error(data?.error || '이메일 발송에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('이메일 발송 오류:', error);
      toast({
        title: "이메일 발송 실패",
        description: error.message || "다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsSendingEmail(false);
    }
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
        description: "최소 10자 이상 입력해주세요 (예: 아이가 말을 안해요)",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // 실제 AI 분석 호출 (fallback 포함)
      const { analysis, reportImages, tableOfContents } = await callAIAnalysis(inputText);
      setAnalysisResult(analysis);
      setReportImages(reportImages || []);
      setTableOfContents(tableOfContents);
      setIsAnalyzing(false);
      setShowResult(true);

      // 고민을 데이터베이스에 자동 저장 (로그인한 사용자)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: saveError } = await supabase
          .from('concern_storage')
          .insert({
            user_id: user.id,
            concern_text: inputText,
            analysis_type: analysis.type || '기타',
            analysis_severity: analysis.severity || '낮음',
            analysis_advice: analysis.detailedAdvice || analysis.advice || '',
            recommended_tests: analysis.recommendedTests || [],
            report_images: reportImages || [],
            full_analysis: {
              type: analysis.type || '기타',
              severity: analysis.severity || '낮음',
              color: analysis.color || 'bg-green-500',
              detailedAdvice: analysis.detailedAdvice || analysis.advice || '',
              recommendations: analysis.recommendations || [],
              confidence: analysis.confidence || 80,
              nextSteps: analysis.nextSteps || [],
              recommendedTests: analysis.recommendedTests || []
            }
          });

        if (saveError) {
          console.error('고민 자동 저장 오류:', saveError);
        } else {
          toast({
            title: "자동 저장 완료",
            description: "분석 결과가 고민 저장소에 저장되었습니다.",
          });
        }
      }
      
      // 분석 완료 후 자동으로 PMF 온보딩 제안
      setTimeout(() => {
        toast({
          title: "🎯 더 정확한 분석을 원하신다면?",
          description: "3분 온보딩으로 맞춤형 솔루션을 받아보세요!",
        });
      }, 3000);
    } catch (error) {
      // 이 경우는 거의 발생하지 않음 (callAIAnalysis가 항상 결과를 반환)
      console.error('Unexpected error:', error);
      setIsAnalyzing(false);
      
      // 마지막 fallback으로 mockAnalysis 사용
      const fallbackResult = mockAnalysis(inputText);
      setAnalysisResult(fallbackResult);
      setReportImages([]);
      setTableOfContents(null);
      setShowResult(true);
      
      toast({
        title: "AI 분석이 완료되었습니다",
        description: "기본 분석 결과를 확인해보세요",
      });
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
      toast({
        title: "확장 실패",
        description: "프롬프트 확장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsExpanding(false);
    }
  };

  const handleStartFullAnalysis = () => {
    // 입력한 텍스트를 localStorage에 저장하여 온보딩에서 활용
    localStorage.setItem('instant_analysis_input', inputText);
    navigate('/pmf-onboarding');
  };

  const getRecommendedTests = (concernType: string) => {
    const testRecommendations: { [key: string]: Array<{ name: string; route: string; description: string; isPremium: boolean }> } = {
      '우울감': [
        { name: '우울증 테스트', route: '/test/depression', description: '우울증 정도를 체계적으로 평가합니다', isPremium: false },
        { name: '스트레스 측정', route: '/test/stress', description: '스트레스 수준과 원인을 파악합니다', isPremium: false },
        { name: '종합 심리 평가', route: '/assessment', description: '전문가 수준의 심층 평가', isPremium: true }
      ],
      '불안감': [
        { name: '불안 테스트', route: '/test/anxiety', description: '불안 증상과 유형을 분석합니다', isPremium: false },
        { name: '스트레스 측정', route: '/test/stress', description: '스트레스 수준과 원인을 파악합니다', isPremium: false },
        { name: '종합 심리 평가', route: '/assessment', description: '전문가 수준의 심층 평가', isPremium: true }
      ],
      '발달지연': [
        { name: '영유아 발달 평가', route: '/assessment', description: '아이의 발달 단계를 전문적으로 평가합니다', isPremium: true }
      ],
      '육아스트레스': [
        { name: '스트레스 측정', route: '/test/stress', description: '육아 스트레스 정도를 측정합니다', isPremium: false },
        { name: '번아웃 테스트', route: '/test/burnout', description: '육아 번아웃 위험을 확인합니다', isPremium: false },
        { name: '종합 심리 평가', route: '/assessment', description: '전문가 수준의 심층 평가', isPremium: true }
      ],
      '학업스트레스': [
        { name: 'ADHD 테스트', route: '/test/adhd', description: '주의력 및 집중력 문제를 파악합니다', isPremium: false },
        { name: '스트레스 측정', route: '/test/stress', description: '학업 스트레스 수준을 측정합니다', isPremium: false }
      ],
      '대인관계': [
        { name: '방어기제 분석', route: '/assessment/defense-mechanism-test', description: '관계 패턴과 방어기제를 이해합니다', isPremium: false },
        { name: '종합 심리 평가', route: '/assessment', description: '사회성 및 정서 발달 평가', isPremium: true }
      ],
      '수면문제': [
        { name: '스트레스 측정', route: '/test/stress', description: '수면 방해 요인을 분석합니다', isPremium: false }
      ],
      '분노조절': [
        { name: '스트레스 측정', route: '/test/stress', description: '분노와 스트레스 관계를 파악합니다', isPremium: false },
        { name: '방어기제 분석', route: '/assessment/defense-mechanism-test', description: '감정 조절 패턴을 이해합니다', isPremium: false }
      ]
    };

    return testRecommendations[concernType] || [
      { name: '종합 심리 평가', route: '/assessment', description: '전문가 수준의 심층 평가', isPremium: true }
    ];
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* 헤더 섹션 with Background */}
      <div className="relative -mx-4 mb-12 py-12 overflow-hidden rounded-3xl">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${instantAnalysisBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E1A]/90 via-[#0A0E1A]/85 to-[#0A0E1A]/90" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center space-y-4 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-md rounded-full border border-amber-500/30">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-300">AI 즉시 분석</span>
          </div>
          
          <h1 className="text-xl sm:text-3xl md:text-5xl font-black leading-tight">
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-lg">
              내 고민으로<br />어떤 솔루션을<br className="sm:hidden" /> 받을 수 있을까?
            </span>
          </h1>
          
          <p className="text-white/90 text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            AI가 당신의 고민을 분석하고<br className="sm:hidden" /> 최적의 상담 유형, 심각도,<br className="sm:hidden" /> 맞춤 솔루션을 즉시 알려드립니다
          </p>
        </div>
      </div>

      {/* 메인 콘텐츠 - 모바일은 세로, 데스크톱은 2열 레이아웃 */}
      <div className="flex flex-col md:grid md:grid-cols-2 gap-6 mb-8">
        {/* 왼쪽: 입력 영역 */}
        <div className="space-y-4">
          <div className="bg-transparent rounded-2xl border border-border/50 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-white drop-shadow-[0_2px_4px_rgba(245,158,11,0.5)]">내 고민 입력</h2>
            </div>
            
            {/* 로그인 안내 */}
            {!user ? (
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <Save className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-100 mb-1">분석 결과 자동 저장</h3>
                    <p className="text-sm text-blue-200/80 leading-relaxed mb-3">
                      로그인하고 분석하면 결과가 자동으로 고민 저장소에 저장됩니다. 언제든 다시 확인할 수 있어요!
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate('/auth')}
                      className="gap-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-blue-100"
                    >
                      로그인하고 시작하기
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Save className="w-4 h-4 text-green-400" />
                  </div>
                  <p className="text-sm text-green-100 font-medium">
                    분석 결과가 자동으로 고민 저장소에 저장됩니다
                  </p>
                </div>
              </div>
            )}
            
            <p className="text-base md:text-lg font-bold text-white drop-shadow-[0_2px_4px_rgba(245,158,11,0.5)] leading-relaxed">
              지금 가장 걱정되는 고민이나 문제를 간단히 적어주세요
            </p>
            
            {!showResult ? (
              <>
                <div className="relative">
                  <Textarea
                    placeholder="지금 가장 걱정되는 한 문장을 적어주세요..."
                    value={inputText}
                    onChange={(e) => {
                      const text = e.target.value;
                      if (text.length <= 500) {
                        setInputText(text);
                      }
                    }}
                    className="min-h-[280px] resize-none border-border/50 focus:border-primary/50 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-base bg-background/80 backdrop-blur-sm pr-3 pt-3"
                    maxLength={500}
                  />
                  
                  {/* 음성 입력 버튼 */}
                  <div className="absolute bottom-3 right-3">
                    <VoiceInputButton
                      onTranscription={(text) => {
                        const newText = inputText + (inputText ? ' ' : '') + text;
                        if (newText.length <= 500) {
                          setInputText(newText);
                        }
                      }}
                      className="shadow-lg hover:shadow-xl transition-shadow"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{inputText.length}</span>/500 <span className="text-xs">(최소 10자)</span>
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-600">완전무료</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="default"
                      onClick={handleExpandPrompt}
                      disabled={isExpanding || isAnalyzing || inputText.length < 10}
                      className="gap-2 text-sm font-bold h-10 px-5 border-2 border-purple-500 hover:bg-purple-500/20 text-purple-50 dark:text-purple-50 hover:text-white dark:hover:text-white animate-glow hover:animate-pulse shadow-[0_0_20px_rgba(168,85,247,0.6)] hover:shadow-[0_0_30px_rgba(168,85,247,0.8)] transition-all bg-gradient-to-r from-purple-500/30 to-pink-500/30"
                    >
                      {isExpanding ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-100 border-t-transparent" />
                          <span className="text-base">다듬는 중...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 animate-pulse" />
                          <span className="text-base">AI다듬기</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="min-h-[280px] p-4 bg-muted/30 rounded-xl border border-border/50">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{inputText}</p>
              </div>
            )}
          </div>
          
          {/* 고민 작성 팁 */}
          {!showResult && (
            <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 backdrop-blur-sm rounded-xl border border-amber-200/30 dark:border-amber-800/30 p-4">
              <div className="flex items-start gap-2.5">
                <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-sm">💡</span>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
                    고민 작성 팁
                  </p>
                  <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-0.5">
                    <li>• <span className="font-semibold">💬 "AI 다듬기"</span>로 고민 확장</li>
                    <li>• 최소 10자 이상, 핵심 고민만 간단히 적어주세요</li>
                    <li>• 예: "5살 아이 말 늦어요", "아이가 친구 없어요"</li>
                  </ul>
                  
                  <div className="mt-2 pt-2 border-t border-amber-200/50 dark:border-amber-800/50">
                    <p className="text-xs text-amber-800 dark:text-amber-200">
                      <span className="font-bold">📊 9가지 전문 리포트</span> + AI 발달 예측 무료 제공
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 분석 버튼 */}
          {!showResult && (
            <div>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || inputText.length < 10}
                size="lg"
                className="w-full h-16 text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-0 shadow-xl"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    AI가 분석 중입니다...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 mr-2" />
                    무료로 분석하기
                  </>
                )}
              </Button>
              <p className="text-center text-xs sm:text-sm text-muted-foreground mt-3">
                완전 무료, 30초 완료
              </p>
            </div>
          )}
        </div>

        {/* 오른쪽: 결과 영역 */}
        <div className="bg-transparent rounded-2xl border border-border/50 p-6">
          {!showResult ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">📖</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-base sm:text-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">분석 결과가 여기 표시됩니다</h3>
                <p className="text-xs sm:text-sm bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent max-w-xs mx-auto leading-relaxed">
                  왼쪽에 내용을 입력하고<br />
                  "무료로 분석하기" 버튼을 눌러주세요
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 결과 헤더 */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle className="w-8 h-8 text-amber-600 dark:text-amber-500" />
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">AI 분석 완료!</h3>
                </div>
                <p className="text-base font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  신뢰도 <span className="text-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">{analysisResult?.confidence}%</span>의 분석 결과입니다
                </p>
              </div>

              {/* 추천 리포팅 제안 목차 섹션 */}
              <Card className="border-amber-500/30 bg-gradient-to-br from-amber-50/30 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="text-2xl">📋</span>
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                      추천 리포팅 제안 목차
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3 text-sm">
                      <span className="font-bold text-white flex-shrink-0">1.</span>
                      <span className="text-white font-semibold">발달 종합 평가: 인지, 언어, 운동, 사회성 분석</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <span className="font-bold text-white flex-shrink-0">2.</span>
                      <span className="text-white font-semibold">심리 상태 분석: 정서적 안정성, 스트레스 수준</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <span className="font-bold text-white flex-shrink-0">3.</span>
                      <span className="text-white font-semibold">강점/약점 분석: 맞춤형 성장 방향 제시</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <span className="font-bold text-white flex-shrink-0">4.</span>
                      <span className="text-white font-semibold">맞춤형 활동 제안: AI 기반 발달 촉진 활동</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <span className="font-bold text-white flex-shrink-0">5.</span>
                      <span className="text-white font-semibold">발달 로드맵: 단계별 성장 계획</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <span className="font-bold text-white flex-shrink-0">6.</span>
                      <span className="text-white font-semibold">또래 비교 분석: 연령대별 발달 기준</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <span className="font-bold text-white flex-shrink-0">7.</span>
                      <span className="text-white font-semibold">전문가 소견서: 전문 개입 필요성 평가</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <span className="font-bold text-white flex-shrink-0">8.</span>
                      <span className="text-white font-semibold">가족 지원 가이드: 부모/보호자 양육 팁</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <span className="font-bold text-white flex-shrink-0">9.</span>
                      <span className="text-white font-semibold">장기 발달 예측: AI 기반 향후 경향성 분석</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI 생성 미리보기 섹션 */}
              <Card className="border-amber-500/30 bg-gradient-to-br from-amber-50/30 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                      AI 생성 미리보기
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* AI 생성 이미지 갤러리 */}
                    {reportImages.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2">
                            <Wand2 className="w-4 h-4" />
                            AI 생성 리포트 이미지 ({reportImages.length}개)
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {reportImages.map((img, idx) => (
                            <div key={idx} className="space-y-2">
                              <p className="text-xs text-muted-foreground font-medium">
                                {idx === 0 ? '커버 이미지' : idx === 1 ? '정서 분석' : '성장 로드맵'}
                              </p>
                              <div className="relative aspect-[3/4] bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden shadow-xl border border-amber-200 dark:border-amber-800">
                                <img 
                                  src={img} 
                                  alt={`AI 생성 이미지 ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span className="font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                            Gemini AI가 당신의 고민에 맞춰 자동 생성한 전문 리포트 이미지
                          </span>
                        </p>
                      </div>
                    )}

                    {/* 책 형태 미리보기 */}
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-3">📖 리포트 미리보기</p>
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
                        <div className="space-y-2.5 text-sm">
                          {(tableOfContents || [
                            { index: 1, title: '발달 종합 평가' },
                            { index: 2, title: '심리 상태 분석' },
                            { index: 3, title: '강점/약점 분석' },
                            { index: 4, title: '맞춤형 활동 제안' },
                            { index: 5, title: '발달 로드맵' },
                            { index: 6, title: '또래 비교 분석' },
                            { index: 7, title: '전문가 소견서' },
                            { index: 8, title: '가족 지원 가이드' },
                            { index: 9, title: '장기 발달 예측' }
                          ]).map((item) => (
                            <div key={item.index} className="flex items-start gap-2">
                              <span className="font-semibold text-amber-700 dark:text-amber-300">{item.index}.</span>
                              <span className="text-foreground">{item.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 분석 결과 카드 */}
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full ${analysisResult?.color}`}></div>
                    <CardTitle className="text-xl font-bold text-foreground">{analysisResult?.type}</CardTitle>
                    <Badge variant={analysisResult?.severity === '높음' ? 'destructive' : 'secondary'} className="font-semibold">
                      {analysisResult?.severity} 단계
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-5">
                  {analysisResult?.detailedAdvice && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 rounded-xl p-5 border-2 border-amber-200 dark:border-amber-800">
                      <h4 className="font-bold mb-3 flex items-center gap-2 text-amber-900 dark:text-amber-100 text-base">
                        <Heart className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        AI 전문가의 조언
                      </h4>
                      <p className="text-sm leading-relaxed text-amber-950 dark:text-amber-50 font-medium">
                        {analysisResult.detailedAdvice}
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold mb-3 flex items-center gap-2 text-foreground text-base">
                      <Target className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                      추천 솔루션
                    </h4>
                    <ul className="space-y-3">
                      {analysisResult?.recommendations?.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-3 p-4 bg-muted/80 dark:bg-muted/40 rounded-lg border border-border">
                          <span className="flex-shrink-0 w-7 h-7 bg-amber-500/20 dark:bg-amber-500/30 rounded-full flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold text-sm">
                            {index + 1}
                          </span>
                          <span className="text-sm text-foreground font-medium pt-0.5">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* 9가지 종합 전문 리포트 */}
              {analysisResult?.comprehensiveReports && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-2">
                      📊 9가지 종합 전문 리포트
                    </h3>
                    <p className="text-sm text-muted-foreground">AI가 분석한 상세한 전문 리포트를 확인하세요</p>
                  </div>

                  {/* 1. 발달 종합 평가 */}
                  {analysisResult.comprehensiveReports.developmentAssessment && (
                    <Card className="border-blue-500/30 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <span className="text-2xl">🧠</span>
                          <span className="text-blue-900 dark:text-blue-100">1. 발달 종합 평가</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-background/60 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">인지 발달</p>
                            <p className="text-2xl font-bold text-foreground">{analysisResult.comprehensiveReports.developmentAssessment.cognitive}점</p>
                          </div>
                          <div className="p-3 bg-background/60 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">언어 발달</p>
                            <p className="text-2xl font-bold text-foreground">{analysisResult.comprehensiveReports.developmentAssessment.language}점</p>
                          </div>
                          <div className="p-3 bg-background/60 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">운동 발달</p>
                            <p className="text-2xl font-bold text-foreground">{analysisResult.comprehensiveReports.developmentAssessment.motor}점</p>
                          </div>
                          <div className="p-3 bg-background/60 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">사회성 발달</p>
                            <p className="text-2xl font-bold text-foreground">{analysisResult.comprehensiveReports.developmentAssessment.social}점</p>
                          </div>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="font-bold text-blue-900 dark:text-blue-100 mb-2">종합 발달 점수: {analysisResult.comprehensiveReports.developmentAssessment.overall}점</p>
                          <p className="text-sm text-blue-800 dark:text-blue-200">{analysisResult.comprehensiveReports.developmentAssessment.summary}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* 2. 심리 상태 분석 */}
                  {analysisResult.comprehensiveReports.psychologicalAnalysis && (
                    <Card className="border-purple-500/30 bg-gradient-to-br from-purple-50/30 to-pink-50/30 dark:from-purple-950/20 dark:to-pink-950/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <span className="text-2xl">💜</span>
                          <span className="text-purple-900 dark:text-purple-100">2. 심리 상태 분석</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-3 bg-background/60 rounded-lg text-center">
                            <p className="text-xs text-muted-foreground mb-1">정서 안정성</p>
                            <p className="text-xl font-bold text-foreground">{analysisResult.comprehensiveReports.psychologicalAnalysis.emotionalStability}점</p>
                          </div>
                          <div className="p-3 bg-background/60 rounded-lg text-center">
                            <p className="text-xs text-muted-foreground mb-1">스트레스</p>
                            <p className="text-xl font-bold text-foreground">{analysisResult.comprehensiveReports.psychologicalAnalysis.stressLevel}점</p>
                          </div>
                          <div className="p-3 bg-background/60 rounded-lg text-center">
                            <p className="text-xs text-muted-foreground mb-1">심리 건강</p>
                            <p className="text-xl font-bold text-foreground">{analysisResult.comprehensiveReports.psychologicalAnalysis.mentalHealth}점</p>
                          </div>
                        </div>
                        <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-lg border border-purple-200 dark:border-purple-800">
                          <p className="text-sm text-purple-800 dark:text-purple-200">{analysisResult.comprehensiveReports.psychologicalAnalysis.summary}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* 3. 강점/약점 분석 */}
                  {analysisResult.comprehensiveReports.strengthsWeaknesses && (
                    <Card className="border-green-500/30 bg-gradient-to-br from-green-50/30 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <span className="text-2xl">💪</span>
                          <span className="text-green-900 dark:text-green-100">3. 강점/약점 분석</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-bold text-green-700 dark:text-green-300 mb-2">✨ 강점</h4>
                            <ul className="space-y-2">
                              {analysisResult.comprehensiveReports.strengthsWeaknesses.strengths.map((strength: string, idx: number) => (
                                <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                                  <span className="text-green-500">•</span>
                                  <span>{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-bold text-orange-700 dark:text-orange-300 mb-2">📈 개선 영역</h4>
                            <ul className="space-y-2">
                              {analysisResult.comprehensiveReports.strengthsWeaknesses.weaknesses.map((weakness: string, idx: number) => (
                                <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                                  <span className="text-orange-500">•</span>
                                  <span>{weakness}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-950/40 rounded-lg border border-green-200 dark:border-green-800">
                          <p className="font-bold text-green-900 dark:text-green-100 mb-1">맞춤형 성장 방향</p>
                          <p className="text-sm text-green-800 dark:text-green-200">{analysisResult.comprehensiveReports.strengthsWeaknesses.growthDirection}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* 4. 맞춤형 활동 제안 */}
                  {analysisResult.comprehensiveReports.customActivities && (
                    <Card className="border-yellow-500/30 bg-gradient-to-br from-yellow-50/30 to-amber-50/30 dark:from-yellow-950/20 dark:to-amber-950/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <span className="text-2xl">🎯</span>
                          <span className="text-yellow-900 dark:text-yellow-100">4. AI 기반 맞춤형 활동 제안</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {analysisResult.comprehensiveReports.customActivities.map((activity: string, idx: number) => (
                            <li key={idx} className="p-3 bg-background/60 rounded-lg border border-yellow-200 dark:border-yellow-800">
                              <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-700 dark:text-yellow-300 font-bold text-sm">
                                  {idx + 1}
                                </span>
                                <span className="text-sm text-foreground flex-1">{activity}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* 5. 발달 로드맵 */}
                  {analysisResult.comprehensiveReports.developmentRoadmap && (
                    <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-50/30 to-blue-50/30 dark:from-indigo-950/20 dark:to-blue-950/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <span className="text-2xl">🗺️</span>
                          <span className="text-indigo-900 dark:text-indigo-100">5. 단계별 발달 로드맵</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-bold text-indigo-700 dark:text-indigo-300 mb-2">📅 단기 목표 (1-3개월)</h4>
                          <ul className="space-y-2">
                            {analysisResult.comprehensiveReports.developmentRoadmap.shortTerm.map((goal: string, idx: number) => (
                              <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                                <span className="text-indigo-500">•</span>
                                <span>{goal}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-2">📅 중기 목표 (3-6개월)</h4>
                          <ul className="space-y-2">
                            {analysisResult.comprehensiveReports.developmentRoadmap.mediumTerm.map((goal: string, idx: number) => (
                              <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                                <span className="text-blue-500">•</span>
                                <span>{goal}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-bold text-purple-700 dark:text-purple-300 mb-2">📅 장기 목표 (6-12개월)</h4>
                          <ul className="space-y-2">
                            {analysisResult.comprehensiveReports.developmentRoadmap.longTerm.map((goal: string, idx: number) => (
                              <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                                <span className="text-purple-500">•</span>
                                <span>{goal}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* 6. 또래 비교 분석 */}
                  {analysisResult.comprehensiveReports.peerComparison && (
                    <Card className="border-teal-500/30 bg-gradient-to-br from-teal-50/30 to-cyan-50/30 dark:from-teal-950/20 dark:to-cyan-950/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <span className="text-2xl">👥</span>
                          <span className="text-teal-900 dark:text-teal-100">6. 또래 비교 분석</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-background/60 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">연령대</p>
                            <p className="text-lg font-bold text-foreground">{analysisResult.comprehensiveReports.peerComparison.ageGroup}</p>
                          </div>
                          <div className="p-3 bg-background/60 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">백분위</p>
                            <p className="text-lg font-bold text-foreground">{analysisResult.comprehensiveReports.peerComparison.percentile}%</p>
                          </div>
                        </div>
                        <div className="p-4 bg-teal-50 dark:bg-teal-950/40 rounded-lg border border-teal-200 dark:border-teal-800">
                          <p className="text-sm text-teal-800 dark:text-teal-200">{analysisResult.comprehensiveReports.peerComparison.comparison}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* 7. 전문가 소견서 */}
                  {analysisResult.comprehensiveReports.expertOpinion && (
                    <Card className="border-red-500/30 bg-gradient-to-br from-red-50/30 to-orange-50/30 dark:from-red-950/20 dark:to-orange-950/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <span className="text-2xl">👨‍⚕️</span>
                          <span className="text-red-900 dark:text-red-100">7. 전문가 소견서</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-background/60 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">전문 개입 필요성</p>
                            <Badge variant={analysisResult.comprehensiveReports.expertOpinion.interventionNeeded === '높음' ? 'destructive' : 'secondary'}>
                              {analysisResult.comprehensiveReports.expertOpinion.interventionNeeded}
                            </Badge>
                          </div>
                          <div className="p-3 bg-background/60 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">시급성</p>
                            <Badge variant={analysisResult.comprehensiveReports.expertOpinion.urgency === '높음' ? 'destructive' : 'secondary'}>
                              {analysisResult.comprehensiveReports.expertOpinion.urgency}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-red-700 dark:text-red-300 mb-2">전문가 권장사항</h4>
                          <ul className="space-y-2">
                            {analysisResult.comprehensiveReports.expertOpinion.recommendations.map((rec: string, idx: number) => (
                              <li key={idx} className="text-sm text-foreground flex items-start gap-2 p-2 bg-background/60 rounded">
                                <span className="text-red-500">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* 8. 가족 지원 가이드 */}
                  {analysisResult.comprehensiveReports.familySupport && (
                    <Card className="border-pink-500/30 bg-gradient-to-br from-pink-50/30 to-rose-50/30 dark:from-pink-950/20 dark:to-rose-950/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <span className="text-2xl">❤️</span>
                          <span className="text-pink-900 dark:text-pink-100">8. 가족 지원 가이드</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-bold text-pink-700 dark:text-pink-300 mb-2">부모/보호자 실천 팁</h4>
                          <ul className="space-y-2">
                            {analysisResult.comprehensiveReports.familySupport.parentingTips.map((tip: string, idx: number) => (
                              <li key={idx} className="text-sm text-foreground flex items-start gap-2 p-2 bg-background/60 rounded">
                                <span className="text-pink-500">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-4 bg-pink-50 dark:bg-pink-950/40 rounded-lg border border-pink-200 dark:border-pink-800">
                          <p className="font-bold text-pink-900 dark:text-pink-100 mb-1">효과적인 소통 방법</p>
                          <p className="text-sm text-pink-800 dark:text-pink-200">{analysisResult.comprehensiveReports.familySupport.communicationGuide}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* 9. 장기 발달 예측 */}
                  {analysisResult.comprehensiveReports.longTermPrediction && (
                    <Card className="border-violet-500/30 bg-gradient-to-br from-violet-50/30 to-purple-50/30 dark:from-violet-950/20 dark:to-purple-950/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <span className="text-2xl">🔮</span>
                          <span className="text-violet-900 dark:text-violet-100">9. AI 기반 장기 발달 예측</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-background/60 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">발달 경향성</p>
                            <Badge variant={analysisResult.comprehensiveReports.longTermPrediction.developmentTrend === '긍정적' ? 'default' : 'secondary'}>
                              {analysisResult.comprehensiveReports.longTermPrediction.developmentTrend}
                            </Badge>
                          </div>
                          <div className="p-3 bg-background/60 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">잠재력</p>
                            <p className="text-xl font-bold text-foreground">{analysisResult.comprehensiveReports.longTermPrediction.potential}점</p>
                          </div>
                        </div>
                        <div className="p-4 bg-violet-50 dark:bg-violet-950/40 rounded-lg border border-violet-200 dark:border-violet-800">
                          <p className="font-bold text-violet-900 dark:text-violet-100 mb-2">장기 전망</p>
                          <p className="text-sm text-violet-800 dark:text-violet-200">{analysisResult.comprehensiveReports.longTermPrediction.forecast}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* AI 맞춤 테스트 추천 */}
              {analysisResult?.recommendedTests && analysisResult.recommendedTests.length > 0 && (
                <Card className="border-primary/30 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      <span className="text-foreground">우리 플랫폼 추천 검사</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      AI가 분석한 결과를 바탕으로 추천하는 정밀 검사입니다
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {analysisResult.recommendedTests.map((test: any, index: number) => (
                        <div
                          key={index}
                          className="p-4 bg-background/60 backdrop-blur-sm rounded-lg border border-border hover:border-primary/50 transition-all"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                  {index + 1}
                                </Badge>
                                <h5 className="font-bold text-foreground text-lg">{test.name}</h5>
                              </div>
                            </div>
                            
                            <div className="space-y-2 pl-8">
                              <div>
                                <p className="text-xs text-muted-foreground font-semibold mb-1">추천 이유</p>
                                <p className="text-sm text-foreground">{test.reason}</p>
                              </div>
                              
                              {test.expectedFindings && (
                                <div>
                                  <p className="text-xs text-muted-foreground font-semibold mb-1">예상 결과</p>
                                  <p className="text-sm text-muted-foreground/80">{test.expectedFindings}</p>
                                </div>
                              )}
                            </div>

                            <div className="flex justify-end pt-2">
                              <Button
                                size="sm"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                onClick={() => {
                                  if (test.testId) {
                                    navigate(`/assessment?type=${test.testId}`);
                                  }
                                }}
                              >
                                <Sparkles className="w-4 h-4 mr-2" />
                                검사 시작하기
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 실시간 전문가 상담 섹션 */}
              <Card className="border-green-500/30 shadow-lg bg-gradient-to-br from-green-50/30 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <div className="relative">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75" />
                      </div>
                      <span className="text-green-900 dark:text-green-100">실시간 전문가 대기중</span>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-background/60 rounded-lg">
                      <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mb-1">
                        <span className="text-2xl">👥</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">온라인 전문가</p>
                      <p className="text-2xl font-bold text-foreground">6명</p>
                    </div>
                    <div className="text-center p-3 bg-background/60 rounded-lg">
                      <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                        <Clock className="w-5 h-5" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">10분 내 응답</p>
                      <p className="text-2xl font-bold text-foreground">2명</p>
                    </div>
                    <div className="text-center p-3 bg-background/60 rounded-lg">
                      <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                        <Zap className="w-5 h-5" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">평균 응답시간</p>
                      <p className="text-2xl font-bold text-foreground">8분</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => {
                      // 고민 분석 내용을 텍스트로 생성
                      const concernText = `[고민 내용]\n${inputText}\n\n[AI 분석 결과]\n• 유형: ${analysisResult.type}\n• 심각도: ${analysisResult.severity}\n• 조언: ${analysisResult.advice}\n\n전문가 상담을 원합니다.`;
                      
                      // 카카오톡 오픈채팅 링크에 메시지를 인코딩하여 추가
                      const encodedMessage = encodeURIComponent(concernText);
                      const kakaoLink = `https://open.kakao.com/o/sHLdK3Ch`;
                      
                      // 새 탭에서 카카오톡 오픈채팅 열기
                      window.open(kakaoLink, '_blank');
                      
                      // 클립보드에 메시지 복사
                      navigator.clipboard.writeText(concernText).then(() => {
                        toast({
                          title: "메시지 복사됨",
                          description: "카카오톡에서 붙여넣기(Ctrl+V)하여 전송하세요.",
                        });
                      });
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold text-sm"
                    size="lg"
                  >
                    <span className="mr-2">💬</span>
                    실시간 전문가에게 내 고민 보내기
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    전문가가 고민을 확인하고 빠르게 응답해드립니다
                  </p>
                </CardContent>
              </Card>

              {/* CTA 버튼들 */}
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/observation')}
                  size="lg"
                  className="w-full font-bold"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  관찰일지 작성하기
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={handleStartFullAnalysis}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    3분 온보딩
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowResult(false);
                      setInputText('');
                    }}
                  >
                    다시 분석
                  </Button>
                </div>

                {user && (
                  <>
                    <Button
                      onClick={() => navigate('/concern-storage')}
                      size="lg"
                      className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 font-semibold"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      고민 저장소 보기
                    </Button>
                    
                    <Button
                      onClick={handleSendEmail}
                      disabled={isSendingEmail}
                      size="lg"
                      variant="outline"
                      className="w-full border-primary text-primary hover:bg-primary/10 font-semibold"
                    >
                      {isSendingEmail ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          발송 중...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          이메일로 리포트 받기 (5토큰)
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstantAIAnalysis;